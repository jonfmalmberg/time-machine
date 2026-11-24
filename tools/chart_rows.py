#!/usr/bin/env python3
"""Turn the Wikipedia chart reader's rows into chart candidates per country and year, and list their artists.

  python3 tools/chart_rows.py work/2026-11-24-wikicharts/rows.partial.json --out work/2026-11-24-wikicharts

Writes chart.rows.json: one record per (country, year, artist, title) with the chart's kind
('year-end' has a position; 'number one' has the date it first led; 'top ten' is a song that entered the weekly top ten), the page and its address.
Writes artists.<batch>.json: the distinct artist credits of each batch of countries, most rows first,
for the helpers who look up where each artist is from. Nothing is guessed: a page whose country cannot
be read from its title, or whose chart measures a subset of the public (R&B, country: decision D7), is
left out and counted.
"""
import argparse, collections, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NAMES = {c['name'].casefold(): c['id'] for c in json.load(open(os.path.join(ROOT, 'data', 'countries.json'), encoding='utf-8'))}
NAMES.update({'flanders': 'BE', 'wallonia': 'BE', 'czech republic': 'CZ', 'u.s.': 'US', 'uk': 'GB', 'south korea': 'KR', 'russia': 'RU', 'turkey': 'TR'})
NOT_ARTISTS = {'no release', 'various artists', 'various', 'compilation', 'varios', 'varios artistas', 'multi-interprètes', 'artistes variés', 'n/a', 'tba', '—', '-', 'none', 'unknown'}
SUBSET = re.compile(r'R&B|country|rock|dance|Latin|adult|rap|hip|Christian|club|alternative|digital|airplay|streaming', re.I)
BATCH = {'A': ['IE', 'FR', 'DE', 'IT', 'ES', 'GB'], 'B': ['CH', 'AT', 'DK', 'SE', 'NO', 'FI', 'BE', 'NL', 'PT', 'PL', 'HU', 'CZ', 'SK', 'HR', 'RO', 'SI', 'MT', 'RU', 'TR', 'GR'],
         'C': ['CA', 'MX', 'AR', 'BR', 'CL', 'CO', 'PE', 'VE', 'PA', 'AU', 'NZ', 'SG', 'MY', 'ID', 'ZA', 'NG', 'JP', 'KR', 'PH', 'IN'], 'D': ['US']}


def place(page):
    m = re.search(r'\(([^)]+)\)\s*$', page)
    if m: return NAMES.get(m.group(1).strip().casefold())
    m = re.search(r' in (?:the )?([A-Z][\w .]+?)(?: \(|$)', page)
    if m and m.group(1).strip().casefold() in NAMES: return NAMES[m.group(1).strip().casefold()]
    if re.match(r'Billboard|List of (Billboard|Hot 100)', page): return 'US'
    if 'Oricon' in page: return 'JP'
    if re.match(r'List of UK ', page): return 'GB'
    return None


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('rows'); ap.add_argument('--out', required=True); a = ap.parse_args()
    R = json.load(open(a.rows, encoding='utf-8'))
    out, seen, skip = [], {}, collections.Counter()
    for r in R:
        # footnote marks the pages hang on a title or an artist ("Title" ♦, Artist ‡) are not part of the name
        for f in ('title', 'artist'):
            v = re.sub(r'\s*[♦‡†§¶◁▷⁂*^]+\s*$', '', r[f]).strip()
            v = re.sub(r'["“”]\s*$', '', v).strip() if v.count('"') + v.count('“') + v.count('”') == 1 else v
            if v != r[f]: skip['(cleaned a footnote mark, kept)'] += 1; r[f] = v
        if not r['title'] or not r['artist']: skip['empty after cleaning'] += 1; continue
        # a row that is a remark, not a song ("No charts exist for 34 weeks due to a strike.", "Various Artists", "No release")
        af, tf = r['artist'].casefold().strip(), r['title'].casefold().strip()
        if af in NOT_ARTISTS or tf in NOT_ARTISTS or (af.endswith('.') and len(af.split()) >= 4) or re.match(r'no (chart|release|single)', tf) or re.match(r'no (chart|release|single)', af):
            skip['a remark or placeholder, not a song'] += 1; continue
        # The reader takes a title cell as one title. Three cases where it is not, read from the stray quote marks:
        t = r['title'].replace('“', '"').replace('”', '"')
        if re.search(r'"\s*(?:\([^)]*\)|\*)?\s*,\s*"', t):                          # a list of several titles: the page's by-artist summary table
            skip['several titles in one cell (a by-artist table)'] += 1; continue
        parts = [x for x in re.split(r'"\s*(?:/\s*)+"', t)] if '"' in t else [t]      # "A" / "B": a double A-side is two songs
        clean = []
        for x in parts:
            m = re.search(r'""|"\s*\(', x)                 # Title" (kana; reading) "Translation: the title ends at that quote
            if m: x = x[:m.start()]
            if x.count('"') % 2: x = x[:x.index('"')]         # Title" (#2), Title" (lit. ...): what follows the closing quote is a note
            x = x.strip().rstrip('(/ ').strip()
            if x: clean.append(x)
        if not clean: skip['empty after cleaning'] += 1; continue
        if len(clean) > 1 or clean[0] != r['title']: skip['(title cleaned or double A-side split, kept)'] += 1
        cc = place(r['page'])
        if not cc: skip['no country: ' + re.sub(r'\d{4}', 'YYYY', r['page'])] += 1; continue
        if SUBSET.search(re.sub(r'\([^)]*\)', '', r['page'])): skip['subset chart: ' + re.sub(r'\d{4}', 'YYYY', r['page'])] += 1; continue
        if not r['year']: skip['no year'] += 1; continue
        year = r['year']
        if re.search(r'\d{4}s', r['page']):                 # a page for a whole decade: the row's own date must name the year
            m = re.search(r'(19|20)\d\d', r.get('date') or '')
            if not m: skip['decade page, year not in the row: ' + re.sub(r'\d{4}', 'YYYY', r['page'])] += 1; continue
            year = int(m.group(0))
        kind = 'year-end' if r['pos'] else 'top ten' if re.search(r'top[- ]ten', r['page'], re.I) else 'number one'
        for ti in clean:
            k = (cc, year, r['artist'].casefold(), ti.casefold())
            if k in seen:                                   # the same song led twice in a year: keep the first row
                continue
            seen[k] = 1
            out.append({'cc': cc, 'year': year, 'kind': kind, 'pos': r['pos'], 'date': r['date'], 'title': ti, 'artist': r['artist'], 'page': r['page'], 'url': r['url']})
    json.dump(out, open(os.path.join(a.out, 'chart.rows.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    per = collections.Counter(x['cc'] for x in out)
    print('rows in', len(R), 'candidates', len(out), 'countries', len(per)); print(' ', dict(per.most_common()))
    for k, n in skip.most_common(12): print('  left out', n, k)
    inb = {c: b for b, cs in BATCH.items() for c in cs}
    art = collections.defaultdict(collections.Counter)
    for x in out: art[inb.get(x['cc'], 'B')][x['artist']] += 1
    for b, c in sorted(art.items()):
        json.dump([{'artist': n, 'rows': k} for n, k in c.most_common()], open(os.path.join(a.out, 'artists.%s.json' % b), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
        print('  batch', b, 'distinct artists', len(c))


if __name__ == '__main__':
    main()
