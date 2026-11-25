#!/usr/bin/env python3
"""H20 step 3: split quoted candidates by the evidence check's result into years.json and unverified.json,
and print the counts for the report.

  python3 assemble.py <quoted.json> <evidence-check.json> <folder> <candidates.json>
"""
import collections, json, re, sys

quoted = json.load(open(sys.argv[1]))
chk = json.load(open(sys.argv[2]))
out = sys.argv[3]
q = {c['song']: c for c in quoted}
quoted = [q.get(c['song'], c) for c in json.load(open(sys.argv[4]))]
items = chk['H20'] if isinstance(chk, dict) and 'H20' in chk else chk
if isinstance(items, dict): items = [x for v in items.values() for x in v]
res = {}
for c in items:
    res[(c.get('url'), c.get('quote'))] = c.get('result') or c.get('check', {}).get('result')

years, unver = [], []
for c in quoted:
    if not c.get('year'):
        unver.append({'song': c['song'], 'title': c['title'], 'artist': c['artist'], 'year_on_site': c['year_on_site'],
                      'result': 'not found', 'reason': 'no song article, discography row or album article found (languages tried: %s)' % ', '.join(c.get('langs_tried', []))})
        continue
    r = res.get((c.get('url'), c.get('quote')), 'not checked')
    if c.get('problem') or r != 'found' or c.get('contradiction'):
        unver.append({'song': c['song'], 'title': c['title'], 'artist': c['artist'], 'year_on_site': c['year_on_site'],
                      'year_read': c['year'], 'basis': c['basis'], 'url': c.get('url'), 'quote': c.get('quote'),
                      'result': r, 'reason': c.get('problem') or c.get('contradiction') or 'evidence check: ' + r})
        continue
    y = {'song': c['song'], 'year': c['year'], 'basis': c['basis'], 'url': c['url'], 'quote': c['quote'], 'read': c['read']}
    if len(c.get('years', [])) > 1: y['years_in_quote'] = c['years']
    base = lambda t: re.sub(r'[^\w]+', ' ', re.sub(r'\s*\([^)]*\)\s*$', '', t).lower()).strip()
    if c['basis'] == 'song article' and base(c['page']) != base(c['title']):
        y['note'] = 'the article is titled "%s", reached from "%s"' % (c['page'], c['asked'])
    m = re.search(r'\s*[\(\[]([^\)\]]*)[\)\]]\s*$', c['title'])
    if c['basis'] != 'discography' and m and m.group(1).lower() not in c['page'].lower():
        y['note'] = (y.get('note', '') + '; ' if 'note' in y else '') + 'the bracketed part of the title "(%s)" is not in the article title: the year may be of the original, not this version' % m.group(1)
    years.append(y)

with open(out + '/years.json', 'w') as f:
    f.write('[\n' + ',\n'.join(json.dumps(y, ensure_ascii=False) for y in years) + '\n]\n')
with open(out + '/unverified.json', 'w') as f:
    f.write('[\n' + ',\n'.join(json.dumps(y, ensure_ascii=False) for y in unver) + '\n]\n')

print('years', len(years), 'unverified', len(unver))
print('basis', collections.Counter(y['basis'] for y in years))
lang = collections.Counter(y['url'].split('//')[1].split('.')[0] for y in years)
print('lang', lang)
print('unverified reasons', collections.Counter(u['reason'].split(' (')[0] for u in unver))
print('checks', collections.Counter(res.values()))
