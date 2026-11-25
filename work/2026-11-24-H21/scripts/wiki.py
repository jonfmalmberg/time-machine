"""Shared fetching for H21: Wikipedia API lookups (to find pages) and raw article text (the evidence).
Every page is cached under .cache/h21 so a rerun does not ask Wikipedia again."""
import hashlib, json, os, re, time, urllib.parse, requests

UA = 'time-machine-research/1 (+https://github.com/jonfmalmberg/time-machine)'
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '.cache', 'h21')
os.makedirs(ROOT, exist_ok=True)
S = requests.Session(); S.headers['User-Agent'] = UA
_last = {}

def _get(url, params=None):
    key = url + '?' + json.dumps(params, sort_keys=True) if params else url
    p = os.path.join(ROOT, hashlib.sha256(key.encode()).hexdigest()[:24])
    if os.path.exists(p):
        return json.load(open(p, encoding='utf-8'))
    host = urllib.parse.urlsplit(url).netloc
    w = 0.35 - (time.time() - _last.get(host, 0))
    if w > 0: time.sleep(w)
    out = None
    for attempt in range(4):
        try:
            r = S.get(url, params=params, timeout=30)
            _last[host] = time.time()
            if r.status_code in (429, 503): time.sleep(5 + 5 * attempt); continue
            out = {'status': r.status_code, 'text': r.text if r.status_code == 200 else ''}
            break
        except requests.RequestException as e:
            out = {'status': 0, 'text': '', 'error': str(e)[:200]}; time.sleep(3)
    if out and out['status'] in (200, 404):
        json.dump(out, open(p, 'w', encoding='utf-8'))
    return out or {'status': 0, 'text': ''}

def api(lang, **params):
    params.update(format='json', formatversion=2)
    r = _get('https://%s.wikipedia.org/w/api.php' % lang, params)
    try: return json.loads(r['text'])
    except Exception: return {}

REDIR = re.compile(r'^\s*#[^\s\[]+\s*:?\s*\[\[\s*([^\]|#]+)')
def resolve(lang, titles):
    """{asked title: final title or None}, following one redirect.
    24 Nov: the API answered 429 (too many requests) to this address for every query, so existence is read from the
    raw-text address itself: 404 means no page, '#REDIRECT [[X]]' means a redirect."""
    out = {}
    for t in dict.fromkeys(t for t in titles if t and '|' not in t and len(t) < 250):
        f = None
        r = _get(raw_url(lang, t))
        if r.get('status') == 200 and r.get('text'):
            m = REDIR.match(r['text'])
            if m:
                tgt = m.group(1).strip()
                r2 = _get(raw_url(lang, tgt))
                if r2.get('status') == 200 and r2.get('text') and not REDIR.match(r2['text']): f = tgt
            else:
                f = t
        out[t] = f
    return out

SEARCH = False   # 24 Nov: Wikipedia's search and prefix search answered 429 (too many requests) from this address; titles only
def search(lang, text, n=5):
    if not SEARCH: return []
    q = api(lang, action='query', list='search', srsearch=text, srlimit=n, srnamespace=0)
    return [h['title'] for h in q.get('query', {}).get('search', [])]

def raw_url(lang, title):
    return 'https://%s.wikipedia.org/wiki/%s?action=raw' % (lang, urllib.parse.quote(title.replace(' ', '_'), safe="()_,'!:*-.;@$"))

def raw(lang, title):
    r = _get(raw_url(lang, title))
    return r.get('text', '') if r.get('status') == 200 else ''
