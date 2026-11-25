#!/usr/bin/env python3
"""The master-table step for chart rows: put checked chart candidates into data/ as place-and-year lists.

  python3 tools/ingest_charts.py work/2026-11-24-wikicharts            prints what it would do, writes nothing
  python3 tools/ingest_charts.py work/2026-11-24-wikicharts --write

Reads chart.rows.json (tools/chart_rows.py) and chart.check.json (tools/check_chart_rows.py) from the folder.

What goes in (decisions D7, D8, D16, D22):
- Only rows whose title and artist the check found on the live page.
- One scope per country and year, `c:<country>:<year>`, status `year list`. A country-year that already has a
  year list is left exactly as it is and counted: researched lists are not overwritten by this step.
- A link per row. Its role is `home` when the first-named artist is recorded as from that country, `foreign` when
  recorded as from elsewhere (origins: work/*/origins.json, with the helper's checked quote as evidence), and
  `charted` when no origin is recorded: heard there, counted for "Made there" only once an origin is known.
- The scope carries `basis: chart`, so the page keeps chart order for "Heard there" whatever the roles.
- Order (`rank`): a year-end chart by its position, which is also stored as `chart_pos`; a list of weekly number
  ones in the order the page gives them (the order they first led the chart), with `peak` 1 and the date; a list of
  top-ten entries in the order they entered.
- A country-year with fewer than six rows is left out: it would replace a fuller decade list with a thin one.
- No release year is written for a new song: a chart year is only an upper bound (D18).
- Songs and artists are matched against the master table by exact credit text and exact title; a match reuses the
  key, otherwise a key is minted (seeded). A credit is never split here: a new artist whose name holds a joiner is
  marked `unsplit`.
- One evidence record per page (title and address). Each link carries the string that was checked (`quote`) and
  the check's result and date.
Running it twice changes nothing.
"""
import argparse, collections, glob, hashlib, json, os, random, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'data')
sys.path.insert(0, os.path.join(ROOT, 'tools'))
from split_credits import has_joiner, B32          # noqa: E402


MIN_ROWS = 6        # the page calls a year list with fewer than six songs sparse and would show it in place of a fuller decade list


def load(p):
    with open(p, encoding='utf-8') as f:
        return json.load(f)


def as_text(recs):
    return '[\n' + ',\n'.join(json.dumps(r, ensure_ascii=False, separators=(',', ':')) for r in recs) + '\n]\n'


def records(folder):
    return [r for p in sorted(glob.glob(os.path.join(D, folder, '*.json'))) for r in load(p)]


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('folder'); ap.add_argument('--write', action='store_true'); a = ap.parse_args()
    W = os.path.abspath(a.folder)
    rows = load(os.path.join(W, 'chart.rows.json'))
    chk = load(os.path.join(W, 'chart.check.json'))
    cdate = chk['date']
    res = {(c['cc'], c['year'], c['artist'], c['title']): c['result'] for c in chk['rows']}
    countries = {c['id'] for c in load(os.path.join(D, 'countries.json'))}

    songs, artists, evidence = records('songs'), records('artists'), records('evidence')
    all_keys = {r['id'] for r in songs + artists + evidence + load(os.path.join(D, 'releases.json'))}
    aname = {r['id']: r['name'] for r in artists}
    artist_by_name = {}
    for r in sorted(artists, key=lambda r: r['id']):
        artist_by_name.setdefault(r['name'], r['id'])

    def credit_of(rec):
        if rec.get('credit_text'):
            return rec['credit_text']
        cs = rec['credits']
        if len(cs) != 1:
            return None
        return aname.get(cs[0]['artist'] if isinstance(cs[0], dict) else cs[0])

    song_by_pair = {}
    for r in sorted(songs, key=lambda r: r['id']):
        song_by_pair.setdefault((credit_of(r), r['title']), r['id'])
    ev_by_url = {}
    for r in sorted(evidence, key=lambda r: r['id']):
        if 'text' not in r and r.get('title'):
            ev_by_url.setdefault(r['url'], r['id'])

    # Where artists are from, as the helpers handed it back (assignments H16 to H19): credit -> the lead artist's record.
    # Only the first-named artist decides (decision D28), and only when that record's artist opens the credit.
    lead = {}
    for p in sorted(glob.glob(os.path.join(ROOT, 'work', '*', 'origins.json'))):
        for o in load(p):
            c = o['credit']
            if c in lead or not c.casefold().startswith(o['artist'].casefold()):
                continue
            lead[c] = o
    ev_by_text = {}
    for r in sorted(evidence, key=lambda r: r['id']):
        if 'text' in r:
            ev_by_text.setdefault((r['url'], r['text']), r['id'])

    rng = random.Random(int(hashlib.sha256(b'charts-2026-11-24').hexdigest()[:12], 16))

    def mint(prefix):
        while True:
            k = prefix + ''.join(rng.choice(B32) for _ in range(10))
            if k not in all_keys:
                all_keys.add(k); return k

    # scopes already on file
    have = {}
    for p in glob.glob(os.path.join(D, 'scopes', 'c', '*', '*.json')):
        for r in load(p):
            have[r['id']] = r.get('status')

    by_scope, left = collections.OrderedDict(), collections.Counter()
    for r in rows:
        if r['cc'] not in countries: left['country not in data/countries.json'] += 1; continue
        if re.search(r'"\s*/|/\s*"|" feat', r['title']): left['title still carries a note the cleaning could not remove'] += 1; continue
        if res.get((r['cc'], r['year'], r['artist'], r['title'])) != 'found': left['not found by the check'] += 1; continue
        sid = 'c:%s:%d' % (r['cc'], r['year'])
        if have.get(sid): left['country-year already has a list'] += 1; continue
        by_scope.setdefault(sid, []).append(r)

    for sid in [k for k, v in by_scope.items() if len(v) < MIN_ROWS]:      # too few rows to stand as a year's list
        left['country-year with fewer than %d rows' % MIN_ROWS] += len(by_scope.pop(sid))
    new_songs, new_artists, new_ev, links, scopes = [], [], [], collections.defaultdict(list), collections.defaultdict(list)
    reused = 0
    roles = collections.Counter()
    for sid, rs in by_scope.items():
        cc, year = sid.split(':')[1], int(sid.split(':')[2])
        kinds = {r['kind'] for r in rs}
        if 'year-end' in kinds:                             # a year-end chart outranks a list of number ones for the same year
            rs = sorted((r for r in rs if r['kind'] == 'year-end'), key=lambda r: r['pos'])
        elif len(kinds) > 1:                                # top-ten entries and number ones for one year: the wider list stands
            rs = [r for r in rs if r['kind'] == 'top ten']
            kinds = {'top ten'}
        by_weeks = 'year-end' not in kinds and all('weeks' in r for r in rs)
        if by_weeks:                                        # weeks at number one are known for the whole year: the longest reign first
            rs = sorted(rs, key=lambda r: -r['weeks'])     # (a stable sort: equal reigns stay in date order)
        dec = str(year // 10 * 10)
        for n, r in enumerate(rs, 1):
            key = (r['artist'], r['title'])
            if key in song_by_pair:
                s = song_by_pair[key]; reused += 1
            else:
                if r['artist'] not in artist_by_name:
                    ar = {'id': mint('a_'), 'name': r['artist']}
                    if has_joiner(r['artist']): ar['unsplit'] = True
                    new_artists.append(ar); artist_by_name[r['artist']] = ar['id']; aname[ar['id']] = r['artist']
                s = mint('s_'); new_songs.append({'id': s, 'title': r['title'], 'credits': [{'artist': artist_by_name[r['artist']], 'role': 'main'}]})
                song_by_pair[key] = s
            if r['url'] not in ev_by_url:
                e = {'id': mint('e_'), 'title': 'Wikipedia: ' + r['page'], 'url': r['url'], 'read': cdate}
                new_ev.append(e); ev_by_url[r['url']] = e['id']
            role, origin = 'charted', None
            o = lead.get(r['artist'])
            if o:
                cs = o['country'] if isinstance(o['country'], list) else [o['country']]
                k = (o['url'], o['quote'])
                if k not in ev_by_text:
                    e = {'id': mint('e_'), 'url': o['url'], 'text': o['quote'], 'read': o['read'], 'check': {'result': 'found', 'date': o['read']}}
                    new_ev.append(e); ev_by_text[k] = e['id']
                role = 'home' if cc in cs else 'foreign'
                origin = {'artist': o['artist'], 'country': cs, 'evidence': ev_by_text[k]}
            l = {'song': s, 'scope': sid, 'role': role, 'rank': n, 'evidence': [ev_by_url[r['url']]], 'scene': '',
                 'quote': r['title'], 'check': {'result': 'found', 'date': cdate}}
            if r['kind'] == 'year-end': l['chart_pos'] = r['pos']; l['chart'] = 'year-end chart'
            elif r['kind'] == 'top ten':
                l['chart'] = 'weekly top ten'
                if r.get('date'): l['entered'] = r['date'][:40]
            else:
                l['peak'] = 1; l['chart'] = 'weekly number ones'
                if 'weeks' in r: l['weeks'] = r['weeks']
                if r.get('date'): l['led_from'] = r['date'][:40]
            if origin: l['origin'] = origin
            roles[role] += 1
            links[(cc, dec)].append(l)
        note = ('Year-end chart positions' if 'year-end' in kinds else 'Songs that entered the weekly top ten, in the order they entered' if 'top ten' in kinds else 'Weekly number ones in the order they first led the chart') + \
               ', read from Wikipedia\'s list page and checked against it.'
        if by_weeks: note = note.replace('Weekly number ones in the order they first led the chart', 'Weekly number ones, longest at number one first (weeks worked out from the dates on the page)')
        scopes[(cc, dec)].append(dict({'id': sid, 'status': 'year list', 'basis': 'chart', 'note': note}, **({'order': 'weeks'} if by_weeks else {})))

    nl = sum(len(v) for v in links.values())
    print('country-years', len(by_scope), 'links', nl, 'new songs', len(new_songs), 'reused songs', reused, 'new artists', len(new_artists),
          '(%d unsplit)' % sum(1 for x in new_artists if x.get('unsplit')), 'new evidence', len(new_ev))
    print('  roles:', dict(roles))
    for k, n in left.most_common(): print('  left out', n, k)
    per = collections.Counter(s.split(':')[1] for s in by_scope)
    print('  years per country:', dict(sorted(per.items())), flush=True)
    if not a.write:
        print('\nDry run: nothing written. Add --write to write.'); return

    def write_split(folder, recs):
        by_c = {}
        for r in recs: by_c.setdefault(r['id'][2:3], []).append(r)
        for c, rs in by_c.items():
            open(os.path.join(D, folder, c + '.json'), 'w', encoding='utf-8').write(as_text(sorted(rs, key=lambda r: r['id'])))
    if new_songs: write_split('songs', songs + new_songs)
    if new_artists: write_split('artists', artists + new_artists)
    if new_ev: write_split('evidence', evidence + new_ev)
    for folder, table in (('links', links), ('scopes', scopes)):
        for (cc, dec), recs in table.items():
            p = os.path.join(D, folder, 'c', cc, dec + '.json'); os.makedirs(os.path.dirname(p), exist_ok=True)
            old = load(p) if os.path.exists(p) else []
            open(p, 'w', encoding='utf-8').write(as_text(old + recs))
    print('\nWritten.')


if __name__ == '__main__':
    main()
