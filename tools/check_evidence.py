#!/usr/bin/env python3
"""Evidence check: does the page at the recorded address contain the recorded string?

Every data point is checked once, by this script, with no model involved (research tiers proposal, section 4).
Only the failures go to an agent, which works out why.

  python3 tools/check_evidence.py work/2026-11-23-H3/sources.json [more.json ...] --out work/<folder>/evidence-check.json

Input: {scope: [{url, quote, artist, title, ...}, ...]} as the helpers hand back.
Each claim gets one result:
  found        the quoted string is on the page (after normalising case, accents, spacing and punctuation)
  near         the string is not there, but its distinctive words are all on the page close together
  not found    the page loaded and neither is true                      -> for an agent
  no page      the page could not be fetched (status or error recorded) -> for an agent
  no quote     the claim has no quoted string to check                  -> back to the researcher
A page is fetched once and kept in a local cache folder, so a rerun does not ask the site again.
"""
import argparse, hashlib, html, json, os, re, subprocess, sys, time, unicodedata, urllib.request, urllib.parse

UA = 'time-machine-evidence-check/1 (+https://github.com/jonfmalmberg/time-machine)'
CACHE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.cache', 'evidence')
last = {}

MB = re.compile(r'^https?://(?:www\.)?musicbrainz\.org/(release|recording|artist|release-group|work)/([0-9a-f-]{36})')
INC = {'release': 'recordings+artist-credits+labels', 'recording': 'artist-credits+releases', 'artist': 'aliases', 'release-group': 'artist-credits+releases', 'work': 'aliases'}
def readable(url):
    """MusicBrainz pages put a browser check in front of scripts; its data interface is open and holds the same facts."""
    m = MB.match(url)
    return 'https://musicbrainz.org/ws/2/%s/%s?inc=%s&fmt=json' % (m.group(1), m.group(2), INC[m.group(1)]) if m else url

BOT = re.compile(r'verifying your browser|security verification|client challenge|verifies you are not a bot|your request is being verified|just a moment|checking your browser|enable javascript and cookies', re.I)

def fetch(url):
    url = readable(url)
    os.makedirs(CACHE, exist_ok=True)
    p = os.path.join(CACHE, hashlib.sha256(url.encode()).hexdigest()[:24])
    if os.path.exists(p + '.json'):
        m = json.load(open(p + '.json'))
        return m, (open(p + '.body', encoding='utf-8').read() if os.path.exists(p + '.body') else '')
    host = urllib.parse.urlsplit(url).netloc
    wait = 1.2 - (time.time() - last.get(host, 0))      # at most one request a second to any one site
    if wait > 0: time.sleep(wait)
    for attempt in range(4):                              # a busy site (429, 503) is asked again, slowly
        m, body = {'url': url, 'at': time.strftime('%Y-%m-%d')}, ''
        try:
            req = urllib.request.Request(urllib.parse.quote(url, safe=":/?#[]@!$&'()*+,;=%~"), headers={'User-Agent': UA, 'Accept-Language': 'en,*;q=0.5'})
            with urllib.request.urlopen(req, timeout=25) as r:
                raw = r.read(40_000_000); m['status'] = r.status; m['type'] = r.headers.get('Content-Type', '')
                cs = r.headers.get_content_charset() or 'utf-8'
                if 'pdf' in m['type'] or raw[:5] == b'%PDF-':      # liner notes and catalogues are often PDFs
                    try:
                        body = subprocess.run(['pdftotext', '-layout', '-', '-'], input=raw, capture_output=True, timeout=60).stdout.decode('utf-8', 'replace')
                        if not body.strip(): m['error'] = 'pdf with no text layer'
                    except Exception as e: m['error'] = 'pdf could not be read: ' + type(e).__name__
                else: body = raw.decode(cs, 'replace')
        except urllib.error.HTTPError as e: m['status'] = e.code; m['error'] = 'HTTP %d' % e.code
        except Exception as e: m['error'] = type(e).__name__ + ': ' + str(e)[:120]
        if m.get('status') not in (429, 503): break
        time.sleep(4 + 4 * attempt)
    last[host] = time.time()
    json.dump(m, open(p + '.json', 'w')); open(p + '.body', 'w', encoding='utf-8').write(body)
    return m, body

def strings(o):
    if isinstance(o, dict): return ' '.join(strings(v) for v in o.values())
    if isinstance(o, list): return ' '.join(strings(v) for v in o)
    return str(o) if isinstance(o, (str, int)) else ''

def text_of(page):
    if page[:1] in '{[':
        try: return strings(json.loads(page))
        except ValueError: pass
    page = re.sub(r'(?is)<(script|style|noscript)\b.*?</\1>', ' ', page)
    page = re.sub(r'(?s)<[^>]+>', ' ', page)
    return html.unescape(page)

def norm(s):
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c)).casefold()
    s = re.sub(r"[‘’“”'\"`´]", '', s)
    return re.sub(r'[^\w]+', ' ', s, flags=re.UNICODE).strip()

def check(claim):
    q = (claim.get('quote') or '').strip()
    if not q: return {'result': 'no quote'}
    m, body = fetch(claim['url'])
    if not body: return {'result': 'no page', 'why': m.get('error') or 'empty page', 'status': m.get('status')}
    raw = text_of(body)
    if len(raw) < 3000 and BOT.search(raw): return {'result': 'no page', 'why': 'the site answered with a bot check, not the page', 'status': m.get('status')}
    t = norm(raw); nq = norm(q)
    if nq and nq in t: return {'result': 'found'}
    # the quote may run across table cells or be lightly trimmed: are its distinctive words all there, close together?
    words = [w for w in nq.split() if len(w) > 3 or w.isdigit()]
    if len(words) >= 3:
        pos = [t.find(w) for w in words]
        if all(p >= 0 for p in pos):
            first = t.find(words[0]); span = len(nq) * 3 + 200; best = None
            while first >= 0:
                win = t[first:first + span]
                if all(w in win for w in words): best = first; break
                first = t.find(words[0], first + 1)
            if best is not None: return {'result': 'near', 'why': 'all %d distinctive words within %d characters' % (len(words), span)}
        missing = [w for w, p in zip(words, pos) if p < 0]
        return {'result': 'not found', 'why': ('words not on the page: ' + ', '.join(missing[:8])) if missing else 'words are on the page but not together'}
    return {'result': 'not found', 'why': 'short quote, not on the page'}

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('files', nargs='+'); ap.add_argument('--out', required=True); a = ap.parse_args()
    out, tally = [], {}
    for f in a.files:
        data = json.load(open(f, encoding='utf-8'))
        for scope, claims in data.items():
            for i, c in enumerate(claims):
                r = check(c); tally[r['result']] = tally.get(r['result'], 0) + 1
                out.append(dict(file=f, scope=scope, n=i, url=c.get('url'), artist=c.get('artist'), title=c.get('title'), kind=c.get('kind'), quote=c.get('quote'), **r))
    with open(a.out, 'w', encoding='utf-8') as fh:
        fh.write('[\n' + ',\n'.join(json.dumps(r, ensure_ascii=False) for r in out) + '\n]\n')
    total = len(out); print('claims', total)
    for k in ('found', 'near', 'not found', 'no page', 'no quote'):
        if k in tally: print('  %-10s %4d  %4.1f%%' % (k, tally[k], 100 * tally[k] / total))

if __name__ == '__main__':
    main()
