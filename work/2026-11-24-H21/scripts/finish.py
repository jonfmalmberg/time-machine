"""H21: from results.raw.json write sources.json; after the evidence check, write years.json and unverified.json and print counts.
  python3 finish.py sources        -> ../sources.json
  python3 ../../../tools/check_evidence.py ../sources.json --out ../evidence-check.json
  python3 finish.py final          -> ../years.json, ../unverified.json, ../summary.json
"""
import json, os, sys, collections
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
TODAY = '2026-11-24'
res = json.load(open(os.path.join(D, 'results.raw.json'), encoding='utf-8'))

# set aside after reading every discography and album result by eye: the quote is found, but the row is not the song's first release
EXCLUDE = {
    's_w53j12pv90': 'the row is a 2001 compilation album named Ciuleandra in a table of albums (Year, Title, Label), not the song',
    's_1srxh5yd8h': 'the row is "Collie Herb Man" (Revival 2.0), a 2025 re-recording, not the first release',
    's_2rrj4b315z': "the row links to 't Is weer voorbij die mooie zomer (album), a 1988 album, not the song",
}

def claims(r):
    out = [dict(url=r['url'], quote=r['quote'], artist=r['artist'], title=r['title'], song=r['song'], kind='year')]
    if r.get('quote2'): out.append(dict(url=r['url'], quote=r['quote2'], artist=r['artist'], title=r['title'], song=r['song'], kind='track on album'))
    return out

if sys.argv[1] == 'sources':
    src = [c for r in res if 'year' in r for c in claims(r)]
    with open(os.path.join(D, 'sources.json'), 'w', encoding='utf-8') as f:
        f.write('{"H21": [\n' + ',\n'.join(json.dumps(c, ensure_ascii=False) for c in src) + '\n]}\n')
    print(len(src), 'claims')
else:
    ev = json.load(open(os.path.join(D, 'evidence-check.json'), encoding='utf-8'))
    src = json.load(open(os.path.join(D, 'sources.json'), encoding='utf-8'))['H21']
    result = collections.defaultdict(list)
    for e in ev: result[src[e['n']]['song']].append(e)
    years, unver = [], []
    for r in res:
        if 'year' not in r:
            unver.append(dict(song=r['song'], title=r['title'], artist=r['artist'], year_on_site=r['year_on_site'], result='not found',
                              reason='no song article, discography row or album article answered', pages_tried=r['tried']))
            continue
        es = result[r['song']]
        if r['song'] in EXCLUDE:
            unver.append(dict(song=r['song'], title=r['title'], artist=r['artist'], year_on_site=r['year_on_site'], year=r['year'], basis=r['basis'],
                              url=r['url'], quote=r['quote'], result='set aside on reading', reason=EXCLUDE[r['song']]))
            continue
        if es and all(e['result'] == 'found' for e in es):
            y = dict(song=r['song'], year=r['year'], basis=r['basis'], url=r['url'], quote=r['quote'], read=TODAY,
                     title=r['title'], artist=r['artist'], year_on_site=r['year_on_site'], lang=r['lang'], page=r['page'])
            if r.get('field'): y['field'] = r['field']
            if r.get('quote2'): y['quote_track'] = r['quote2']
            years.append(y)
        else:
            unver.append(dict(song=r['song'], title=r['title'], artist=r['artist'], year_on_site=r['year_on_site'], year=r['year'], basis=r['basis'],
                              url=r['url'], quote=r['quote'], result=', '.join(e['result'] for e in es) or 'not checked',
                              reason='; '.join(e.get('why', '') for e in es if e.get('why')) or 'the evidence check did not find the quote'))
    w = lambda name, rows: open(os.path.join(D, name), 'w', encoding='utf-8').write('[\n' + ',\n'.join(json.dumps(x, ensure_ascii=False) for x in rows) + '\n]\n')
    w('years.json', years); w('unverified.json', unver)
    diff = [y for y in years if y['year_on_site'] and abs(y['year'] - y['year_on_site']) > 1]
    nosite = [y for y in years if not y['year_on_site']]
    summ = dict(songs=len(res), found=len(years), unverified=len(unver),
                basis=collections.Counter(y['basis'] for y in years), lang=collections.Counter(y['lang'] for y in years),
                field=collections.Counter(y.get('field') for y in years),
                differs_by_more_than_one=len(diff), no_year_on_site=len(nosite),
                checker=collections.Counter(e['result'] for e in ev))
    json.dump(summ, open(os.path.join(D, 'summary.json'), 'w'), indent=1, ensure_ascii=False)
    print(json.dumps(summ, ensure_ascii=False, indent=1))
    with open(os.path.join(D, 'differences.md'), 'w', encoding='utf-8') as f:
        f.write('# Songs whose year found differs from the year on the site by more than one year\n\n')
        f.write('| Song | Artist | On the site | Found | Basis | Page |\n| :- | :- | -: | -: | :- | :- |\n')
        for y in sorted(diff, key=lambda y: y['year'] - y['year_on_site']):
            f.write('| %s | %s | %s | %s | %s | %s:%s |\n' % (y['title'].replace('|', '/'), y['artist'].replace('|', '/'), y['year_on_site'], y['year'], y['basis'], y['lang'], y['page']))
    print(len(diff), 'differ')
