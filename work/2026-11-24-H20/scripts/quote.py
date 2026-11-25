#!/usr/bin/env python3
"""H20 step 2: fetch each chosen page as raw text (?action=raw, not the API) and copy the supporting
line from that raw text, character for character. Writes sources.json for tools/check_evidence.py.

  python3 quote.py <candidates.json> <sources.json> <quoted.json>
"""
import hashlib, json, os, re, sys, time, urllib.parse, urllib.request

UA = 'time-machine-research/1 (+https://github.com/jonfmalmberg/time-machine)'
CACHE = os.environ.get('H20_CACHE', '/tmp/h20cache') + '/raw'
os.makedirs(CACHE, exist_ok=True)
YEAR = re.compile(r'(?<!\d)(1[89]\d\d|20[0-2]\d)(?!\d)')

def url_of(lang, title):
    return f'https://{lang}.wikipedia.org/wiki/' + urllib.parse.quote(title.replace(' ', '_'), safe="(),'!:_-.*") + '?action=raw'

def fetch(url):
    p = os.path.join(CACHE, hashlib.sha256(url.encode()).hexdigest()[:24])
    if os.path.exists(p): return open(p, encoding='utf-8').read()
    for attempt in range(4):
        try:
            body = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=30).read().decode('utf-8')
            open(p, 'w', encoding='utf-8').write(body); time.sleep(0.6); return body
        except urllib.error.HTTPError as e:
            if e.code == 404: return None
            print('retry', url, e, file=sys.stderr); time.sleep(10 + 10 * attempt)
        except Exception as e:
            print('retry', url, e, file=sys.stderr); time.sleep(5 + 5 * attempt)
    return None

def trim(q):
    """Cut the copied line before the first reference or comment, keeping it a verbatim prefix."""
    for mark in ('<ref', '{{efn', '{{Efn', '<!--', '{{refn', '{{sfn', '<br', '<small'):
        i = q.find(mark)
        if i > 0 and YEAR.search(q[:i]): q = q[:i]
    return q.rstrip()

def main():
    cands = json.load(open(sys.argv[1]))
    today = time.strftime('%Y-%m-%d')
    claims, quoted = [], []
    for c in cands:
        if not c.get('year'): continue
        url = url_of(c['lang'], c['page'])
        raw = fetch(url)
        if raw is None:
            c['problem'] = 'raw page could not be fetched'; quoted.append(c); continue
        line = c['line']
        if line not in raw:
            c['problem'] = 'line from the look-up is not in the raw page (page changed?)'; quoted.append(c); continue
        q = trim(line)
        if c['basis'] != 'discography':      # the year is read again from the copied text itself, notes and dated maintenance tags left out
            ys = [int(y) for y in YEAR.findall(re.sub(r'\{\{\s*(?:citation needed|cn|when|efn|refn|sfn)[^{}]*\}\}', ' ', q, flags=re.I))]
            if not ys:
                c['problem'] = 'no year in the copied line'; quoted.append(c); continue
            if min(ys) != c['year']: c['year_changed_from'] = c['year']
            c['year'], c['years'] = min(ys), sorted(set(ys))
        c.update({'url': url, 'quote': q, 'read': today})
        quoted.append(c)
        claims.append({'url': url, 'quote': q, 'artist': c['artist'], 'title': c['title'], 'song': c['song'], 'year': c['year'], 'basis': c['basis']})
    json.dump({'H20': claims}, open(sys.argv[2], 'w'), ensure_ascii=False, indent=0)
    json.dump(quoted, open(sys.argv[3], 'w'), ensure_ascii=False, indent=0)
    print(len(claims), 'claims;', sum(1 for c in quoted if c.get('problem')), 'problems', file=sys.stderr)

if __name__ == '__main__':
    main()
