#!/usr/bin/env python3
"""Read chart tables from Wikipedia list pages (year-end charts, number-one lists) into plain rows.

  python3 tools/wiki_charts.py "Billboard Year-End Hot 100 singles of 1985" [more titles...] [--out file.json]
  python3 tools/wiki_charts.py --family "Billboard Year-End Hot 100 singles of " --out file.json

For each page: every table that has a title column and an artist column becomes rows
{page, url, year, pos, title, artist, date}. `pos` is the chart position where the table has one (year-end
charts) and null for number-one lists, which carry a date instead. Nothing is guessed: a row whose title or
artist cell is empty after carrying down merged cells is dropped and counted. Pages are cached in
.cache/wiki/. This only collects candidates; it writes nothing into data/.
"""
import argparse, html, json, os, re, sys, time, urllib.parse, urllib.request
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, '.cache', 'wiki')
UA = {'User-Agent': 'WorldMusicTimeMachine/0.1 (https://github.com/jonfmalmberg/time-machine)'}
API = 'https://en.wikipedia.org/w/api.php?'


def api(**q):
    q['format'] = 'json'
    for attempt in range(6):
        try:
            with urllib.request.urlopen(urllib.request.Request(API + urllib.parse.urlencode(q), headers=UA), timeout=40) as r:
                return json.load(r)
        except Exception as e:                              # noqa: BLE001
            if attempt == 5 or getattr(e, 'code', 429) not in (429, 503):
                raise
            time.sleep(8 * (attempt + 1))


def page_html(title):
    p = os.path.join(CACHE, re.sub(r'[^\w.-]+', '_', title) + '.html')
    if os.path.exists(p):
        return open(p, encoding='utf-8').read()
    d = api(action='parse', page=title, prop='text', redirects='1', formatversion='2')
    t = d.get('parse', {}).get('text', '')
    os.makedirs(CACHE, exist_ok=True)
    open(p, 'w', encoding='utf-8').write(t)
    time.sleep(1.2)
    return t


def family(prefix):
    out, cont = [], {}
    while True:
        d = api(action='query', list='allpages', apprefix=prefix, aplimit='500', apfilterredir='nonredirects', **cont)
        out += [p['title'] for p in d['query']['allpages']]
        if 'continue' not in d:
            return out
        cont = d['continue']


class Tables(HTMLParser):
    """Every <table class="wikitable"> as a grid of cell texts, with rowspan and colspan filled in."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.tables, self.t, self.row, self.cell, self.depth, self.skip = [], None, None, None, 0, 0

    def handle_starttag(self, tag, a):
        a = dict(a)
        if tag == 'table':
            self.depth += 1
            if self.depth == 1 and 'wikitable' in (a.get('class') or ''):
                self.t = {'rows': [], 'span': {}}
        elif self.t is None or self.depth != 1:
            return
        elif tag == 'tr':
            self.row = []
        elif tag in ('td', 'th') and self.row is not None:
            self.cell = {'text': '', 'rs': int(re.sub(r'\D', '', a.get('rowspan') or '1') or 1), 'cs': int(re.sub(r'\D', '', a.get('colspan') or '1') or 1), 'th': tag == 'th'}
        elif tag in ('sup', 'style', 'script') and self.cell is not None:
            self.skip += 1
        elif tag == 'br' and self.cell is not None:
            self.cell['text'] += ' / '

    def handle_endtag(self, tag):
        if tag == 'table':
            if self.depth == 1 and self.t is not None:
                self.tables.append(self.t['rows']); self.t = None
            self.depth -= 1
        elif self.t is None or self.depth != 1:
            return
        elif tag in ('sup', 'style', 'script') and self.skip:
            self.skip -= 1
        elif tag in ('td', 'th') and self.cell is not None and self.row is not None:
            self.row.append(self.cell); self.cell = None
        elif tag == 'tr' and self.row is not None:
            span, out, cells, col = self.t['span'], [], list(self.row), 0
            while cells or col in span:
                if col in span:
                    txt, left = span[col]
                    out.append(txt)
                    if left <= 1: del span[col]
                    else: span[col] = (txt, left - 1)
                    col += 1; continue
                c = cells.pop(0); txt = re.sub(r'\s+', ' ', c['text']).strip()
                for k in range(c['cs']):
                    out.append(txt)
                    if c['rs'] > 1: span[col] = (txt, c['rs'] - 1)
                    col += 1
            self.t['rows'].append((out, all(c['th'] for c in self.row) if self.row else False))
            self.row = None

    def handle_data(self, d):
        if self.cell is not None and not self.skip:
            self.cell['text'] += d


COL = {'pos': r'^(no\.?|№|#|rank|position|pos\.?|place)$', 'title': r'^(title|song|single|song title|track)s?$',
       'artist': r'^(artist|artists|artist\(s\)|performer|performers|act|performer\(s\)|singer)$',
       'date': r'^(date|issue date|week|week ending|reached number one|chart date|week of)$'}


def rows_of(title):
    t = Tables(); t.feed(page_html(title))
    ym = re.search(r'(1[89]\d\d|20\d\d)', title)
    year, out, dropped = (int(ym.group(1)) if ym else None), [], 0
    url = 'https://en.wikipedia.org/wiki/' + urllib.parse.quote(title.replace(' ', '_'))
    for grid in t.tables:
        head = next((r for r, th in grid if th), None)
        if not head:
            continue
        idx = {}
        for i, h in enumerate(head):
            hk = re.sub(r'\[.*?\]', '', h).strip().casefold()
            for k, pat in COL.items():
                if k not in idx and re.match(pat, hk):
                    idx[k] = i
        if 'title' not in idx or 'artist' not in idx:
            continue
        last = None
        for r, th in grid:
            if th or len(r) <= max(idx.values()):
                continue
            ti = re.sub(r'\[.*?\]', '', r[idx['title']]).strip().strip('"“”').strip()
            ar = re.sub(r'\[.*?\]', '', r[idx['artist']]).strip()
            if not ti or not ar:
                dropped += 1; continue
            pos = None
            if 'pos' in idx:
                m = re.match(r'^\d{1,3}$', r[idx['pos']].strip())
                pos = int(m.group(0)) if m else None
            row = {'page': title, 'url': url, 'year': year, 'pos': pos, 'title': ti, 'artist': ar, 'date': r[idx['date']] if 'date' in idx else None}
            if last and (last['title'], last['artist']) == (ti, ar) and pos is None:
                continue                                    # a number one that stayed: one row per song
            out.append(row); last = row
    return out, dropped


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('titles', nargs='*'); ap.add_argument('--family'); ap.add_argument('--out')
    ap.add_argument('--list', help='a JSON file: {family prefix: [page titles]}; reads every page in it')
    ap.add_argument('--cached-only', action='store_true', help='read only pages already in .cache/wiki (no requests)')
    a = ap.parse_args()
    titles = list(a.titles) + (family(a.family) if a.family else [])
    if a.list:
        titles += [t for v in json.load(open(a.list, encoding='utf-8')).values() for t in v]
    titles = list(dict.fromkeys(titles))
    if a.cached_only:
        titles = [t for t in titles if os.path.exists(os.path.join(CACHE, re.sub(r'[^\w.-]+', '_', t) + '.html'))]
    allrows, empty, dropped = [], [], 0
    for t in titles:
        try:
            r, d = rows_of(t)
        except Exception as e:                              # noqa: BLE001
            r, d = [], 0; print('failed', t, repr(e)[:120])
        dropped += d
        if not r: empty.append(t)
        allrows += r
    print('pages', len(titles), 'rows', len(allrows), 'dropped rows', dropped, 'pages with no table read', len(empty))
    if empty: print('  none read:', empty[:12])
    if a.out:
        json.dump(allrows, open(a.out, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    else:
        for x in allrows[:6]: print(x)


if __name__ == '__main__':
    main()
