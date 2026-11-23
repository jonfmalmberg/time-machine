#!/usr/bin/env python3
"""One-time converter (23 November 2026): today's 29 data/*.json files -> the data model of
docs/proposals/2026-11-23-schema.md (steps 1 and 2 of "Moving to it without breaking the site").

    python3 tools/migrate_2026_11_23.py [source folder] [output folder]

Both default to data/. It reads every old file first, then writes the new ones. It refuses to
run if the new files already exist in the output folder. Keys are made with a seeded random
generator, so running it again on the same old files gives the same keys.

Decisions taken here (see the report in work/2026-11-23-schema/):
- Two entries are the same song only if artist and title are equal character for character.
  Near matches are written to work/2026-11-23-schema/match-candidates.json, not merged.
- One artist record per distinct credit string, marked "unsplit": true.
- A link keeps `released` / `written` only where its listed year differs from the song's.
"""
import collections, json, os, random, sys, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORK = os.path.join(ROOT, 'work', '2026-11-23-schema')
SEED = 20261123
ALPHABET = '0123456789abcdefghjkmnpqrstvwxyz'   # Crockford base 32, lower case
OLD = ['tests', 'era', 'yearl', 'ysrc', 'langs', 'isoLang', 'cityLang', 'st', 'cnt', 'iso',
       'neAlias', 'cities', 'regions', 'bands', 'nodes', 'layout', 'scores',
       'playlists', 'known', 'done', 'indoc', 'edges', 'tier', 'trad', 'tradOf',
       'ends', 'defs', 'notes', 'method']
NEW_MARKERS = ['songs', 'artists', 'evidence', 'links', 'scopes', 'genres.json', 'parentage.json',
               'presence.json', 'traditions.json', 'families.json', 'countries.json',
               'releases.json', 'legacy-order.json']


def dumps(v):
    return json.dumps(v, ensure_ascii=False, separators=(',', ':'))


def write_records(path, records):
    """Top-level array, one compact record per line."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write('[\n' + ',\n'.join(dumps(r) for r in records) + ('\n' if records else '') + ']\n')


def write_object(path, obj):
    """Top-level object, one key per line."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write('{\n' + ',\n'.join(dumps(k) + ':' + dumps(v) for k, v in obj.items()) + '\n}\n')


def norm(s):
    """Lower case, accents stripped, punctuation dropped, spaces collapsed."""
    s = unicodedata.normalize('NFKD', s.lower())
    s = ''.join(c for c in s if not unicodedata.combining(c))
    s = ''.join(c if (c.isalnum() or c.isspace()) else ' ' for c in s)
    return ' '.join(s.split())


def main():
    src = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(ROOT, 'data')
    out = os.path.abspath(sys.argv[2]) if len(sys.argv) > 2 else os.path.join(ROOT, 'data')
    there = [m for m in NEW_MARKERS if os.path.exists(os.path.join(out, m))]
    if there:
        sys.exit('Refusing to run: the new files already exist in %s (%s).' % (out, ', '.join(there)))
    old = {}
    for k in OLD:
        with open(os.path.join(src, k + '.json'), encoding='utf-8') as f:
            old[k] = json.load(f)
    O = old
    rng = random.Random(SEED)
    used = set()

    def mint(prefix):
        while True:
            k = prefix + ''.join(rng.choice(ALPHABET) for _ in range(10))
            if k not in used:
                used.add(k)
                return k

    # ---- artists, songs, releases, evidence: minted in a fixed traversal order ----
    artists = {}            # credit string -> id
    songs = {}              # (artist, title) -> id
    releases = {}           # (artist, title) -> id
    years = collections.defaultdict(list)     # song id -> listed release years (with where)
    written = collections.defaultdict(list)

    def artist(name):
        if name not in artists:
            artists[name] = mint('a_')
        return artists[name]

    def song(a, t):
        artist(a)
        if (a, t) not in songs:
            songs[(a, t)] = mint('s_')
        return songs[(a, t)]

    def release(a, t):
        artist(a)
        if (a, t) not in releases:
            releases[(a, t)] = mint('r_')
        return releases[(a, t)]

    evidence = [mint('e_') for _ in O['ysrc']]          # same order as ysrc.json

    pl, defs = O['playlists'], O['defs']
    assert set(pl) == set(defs), 'playlists and defs cover different genres'
    # Pass 1: mint keys and collect years.
    for g, p in pl.items():
        assert list(p)[:6] == ['status', 'intro', 'peak', 'albums', 'fold', 'note'] and set(p) <= {'status', 'intro', 'peak', 'albums', 'fold', 'note', 'yrs'}, g
        songs_here = p['intro'] + p['peak']
        if 'yrs' in p:
            assert len(p['yrs']) == len(songs_here), g
        for i, (a, t) in enumerate(songs_here):
            s = song(a, t)
            if 'yrs' in p:
                years[s].append((p['yrs'][i][0], 'playlists.json:' + g))
                written[s].append((p['yrs'][i][1], 'playlists.json:' + g))
        for a, t in p['albums']:
            release(a, t)
    for g, d in defs.items():
        assert list(d) == ['window', 'sound', 'markers', 'fits', 'near'], g
        for a, t, y in d['fits']:
            years[song(a, t)].append((y, 'defs.json:%s.fits' % g))
        for a, t, y, b, r in d['near']:
            years[song(a, t)].append((y, 'defs.json:%s.near' % g))
    for c, decs in O['era'].items():
        for dec, v in decs.items():
            assert list(v) == ['note', 'songs'], (c, dec)
            for row in v['songs']:
                assert len(row) == 6 and row[3] in ('home', 'foreign'), (c, dec, row)
                years[song(row[0], row[1])].append((row[2], 'era.json:%s.%s' % (c, dec)))
    assert list(O['yearl']) == sorted(O['yearl']), 'yearl countries are not in sorted order'
    for c, ys in O['yearl'].items():
        assert list(ys) == sorted(ys), c
        for y, v in ys.items():
            assert list(v) == ['songs', 'note'], (c, y)
            for i, row in enumerate(v['songs']):
                assert len(row) == 8 and row[3] in ('home', 'foreign') and isinstance(row[5], int), (c, y, row)
                assert row[4] == i + 1, ('rank is not the list position', c, y, row)
                years[song(row[0], row[1])].append((row[2], 'yearl.json:%s.%s' % (c, y)))

    def settle(vals):
        got = {v for v, _ in vals if v is not None}
        return got.pop() if len(got) == 1 else None

    song_year = {s: settle(v) for s, v in years.items()}
    song_written = {s: settle(v) for s, v in written.items()}
    year_conflicts = [dict(song=s, years=sorted({v for v, _ in vals if v is not None}), where=sorted({w for v, w in vals if v is not None}))
                      for s, vals in years.items() if len({v for v, _ in vals if v is not None}) > 1]

    def years_on_link(s, rec, rel, wr=Ellipsis):
        if rel != song_year.get(s):
            rec['released'] = rel
        if wr is not Ellipsis and wr != song_written.get(s):
            rec['written'] = wr
        return rec

    # ---- links and scopes ----
    glinks = {}             # genre -> list of link records
    gscopes = {}
    principal = collections.defaultdict(set)
    for g in list(pl) + [g for g in defs if g not in pl]:
        p, d = pl[g], defs[g]
        sc = 'g:' + g
        L = []
        for role in ('intro', 'peak'):
            for i, (a, t) in enumerate(p[role]):
                s = songs[(a, t)]
                rec = dict(song=s, scope=sc, role=role)
                if 'yrs' in p:
                    j = i if role == 'intro' else len(p['intro']) + i
                    years_on_link(s, rec, p['yrs'][j][0], p['yrs'][j][1])
                L.append(rec)
                principal[s].add(g)
        for a, t, y in d['fits']:
            s = songs[(a, t)]
            L.append(years_on_link(s, dict(song=s, scope=sc, role='reference'), y))
            principal[s].add(g)
        for a, t, y, b, r in d['near']:
            s = songs[(a, t)]
            rec = years_on_link(s, dict(song=s, scope=sc, role='near miss'), y)
            rec['belongs_to'] = b
            rec['reason'] = r
            L.append(rec)
        for a, t in p['albums']:
            L.append(dict(release=releases[(a, t)], scope=sc, role='album'))
        glinks[g] = L
        rec = dict(id=sc, status=p['status'])
        if p['note']:
            rec['note'] = p['note']
        if p['fold'] is not None:
            rec['fold'] = p['fold']
        if 'yrs' not in p:
            rec['years_listed'] = False
        gscopes[g] = rec

    clinks = collections.defaultdict(list)      # (iso, decade) -> links
    cscopes = collections.defaultdict(dict)     # (iso, decade) -> {scope id: record}
    for c, decs in O['era'].items():
        for dec, v in decs.items():
            sc = 'c:%s:%ss' % (c, dec)
            cscopes[(c, dec)][sc] = dict(id=sc, status='decade list', note=v['note'])
            for a, t, y, role, tag, conf in v['songs']:
                s = songs[(a, t)]
                rec = years_on_link(s, dict(song=s, scope=sc, role=role), y)
                rec['scene'] = tag
                rec['confidence'] = conf
                clinks[(c, dec)].append(rec)
    for c, ys in O['yearl'].items():
        for y, v in ys.items():
            dec = str(int(y) // 10 * 10)
            sc = 'c:%s:%s' % (c, y)
            cscopes[(c, dec)][sc] = dict(id=sc, status='year list', note=v['note'])
            for a, t, yr, role, rank, src_i, addr, scene in v['songs']:
                s = songs[(a, t)]
                rec = years_on_link(s, dict(song=s, scope=sc, role=role), yr)
                rec['rank'] = rank
                rec['evidence'] = [evidence[src_i]]
                if addr != '':
                    rec['source_address'] = addr
                rec['scene'] = scene
                clinks[(c, dec)].append(rec)
    test_ids = []
    for t in O['tests']:
        assert 'iso' in t and 'g' not in t, t
        tid = t.get('run') or '%s-%d-%d-%s' % (t['iso'], t['y0'], t['y1'], t['date'])
        assert tid not in test_ids, tid
        test_ids.append(tid)
        rec = dict(id=tid, **{k: v for k, v in t.items() if k != 'iso'})
        dec = str(t['y0'] // 10 * 10)
        sc = 'c:%s:%ss' % (t['iso'], dec)
        scs = cscopes[(t['iso'], dec)]
        if sc not in scs:
            scs[sc] = dict(id=sc)
        scs[sc].setdefault('tests', []).append(rec)

    # ---- song records, principal genre ----
    names = {v: k for k, v in artists.items()}
    song_recs = []
    conflicts = []
    for (a, t), s in songs.items():
        rec = dict(id=s, title=t, credits=[dict(artist=artists[a], role='main')])
        if song_year.get(s) is not None:
            rec['released'] = dict(year=song_year[s])
        if song_written.get(s) is not None:
            rec['written'] = song_written[s]
        gs = principal.get(s, set())
        if len(gs) == 1:
            rec['genre'] = next(iter(gs))
            rec['genre_basis'] = 'chosen for the genre'
        elif len(gs) > 1:
            conflicts.append(dict(song=s, artist=a, title=t, genres=[g for g in pl if g in gs]))
        song_recs.append(rec)

    # ---- near-match candidates (never merged) ----
    by_full = collections.defaultdict(list)
    by_title = collections.defaultdict(list)
    for (a, t), s in songs.items():
        by_full[(norm(a), norm(t))].append((s, a, t))
        by_title[norm(t)].append((s, a, t))
    cands = []
    for k, grp in by_full.items():
        for i in range(len(grp)):
            for j in range(i + 1, len(grp)):
                cands.append(dict(a=grp[i][0], b=grp[j][0], why='same artist and title after normalising case, accents, punctuation and spaces',
                                  a_text='%s - %s' % grp[i][1:], b_text='%s - %s' % grp[j][1:]))
    for k, grp in by_title.items():
        if not k:
            continue
        for i in range(len(grp)):
            for j in range(i + 1, len(grp)):
                na, nb = norm(grp[i][1]), norm(grp[j][1])
                if na == nb:
                    continue
                contained = na and nb and (na in nb or nb in na)
                cands.append(dict(a=grp[i][0], b=grp[j][0],
                                  why='same title after normalising; ' + ('one artist credit contains the other' if contained else 'different artist credit'),
                                  a_text='%s - %s' % grp[i][1:], b_text='%s - %s' % grp[j][1:]))

    # ---- genres, tree, presence ----
    nodes = O['nodes']
    ids = [n[0] for n in nodes]
    fam_of_trad = {t: f for f, ts in O['layout']['laneOrder'].items() for t in ts}
    genres = []
    family_mismatch = []
    for n in nodes:
        g = n[0]
        rec = dict(id=g, name=n[1], region=n[2], family=n[3], tradition=O['tradOf'][g], began=n[4], ended=O['ends'][g],
                   origin=dict(text=n[5], lat=n[6], lon=n[7], country=O['cnt'][g][0]))
        if g in defs:
            d = defs[g]
            rec['definition'] = dict(window=d['window'], sound=d['sound'], markers=d['markers'])
        S, A, F, I = O['scores'][g]
        rec['judgements'] = dict(significance=S, ease=A, fame=F, intrigue=I)
        if g in O['notes']:
            rec['note'] = O['notes'][g]
        rec['tier'] = O['tier'][g]
        rec['row'] = O['layout']['row'][g]
        genres.append(rec)
        if fam_of_trad[rec['tradition']] != n[3]:
            family_mismatch.append(dict(genre=g, family=n[3], tradition=rec['tradition'], tradition_family=fam_of_trad[rec['tradition']]))
    parentage = []
    for e in O['edges']:
        assert e[2] in (1, 0.4), e
        parentage.append({'from': e[0], 'to': e[1], 'kind': 'principal' if e[2] == 1 else 'other'})
    presence = []
    for g in ids:
        p0, p1, regs, rlater = O['st'][g]
        orig, cpeak, clater = O['cnt'][g]
        for r in regs:
            presence.append({'genre': g, 'place': r, 'kind': 'peak', 'from': p0, 'to': p1, 'basis': 'first estimate'})
        for r, y in rlater.items():
            presence.append({'genre': g, 'place': r, 'kind': 'later', 'from': y, 'basis': 'first estimate'})
        for i, c in enumerate(cpeak):
            presence.append({'genre': g, 'place': c, 'kind': 'peak', 'from': p0, 'to': p1, 'strength': .85 if i < 3 else (.7 if i < 8 else .55), 'basis': 'first estimate'})
        for c, y in clater.items():
            presence.append({'genre': g, 'place': c, 'kind': 'later', 'from': y, 'basis': 'first estimate'})

    traditions = [dict(id=t, name=nm, family=fam_of_trad[t]) for t, nm in O['trad'].items()]
    band_order = O['layout']['bandOrder']
    families = [dict(id=f, name=nm, order=band_order.index(f)) for f, nm in O['bands']]
    regions = [dict(id=r, name=nm) for r, nm in O['regions']]
    map_names = collections.defaultdict(list)
    for nm, c in O['neAlias'].items():
        map_names[c].append(nm)
    countries = []
    for c, (nm, reg) in O['iso'].items():
        rec = dict(id=c, name=nm, region=reg)
        if c in O['isoLang']:
            rec['langs'] = [O['isoLang'][c]]
        if map_names[c]:
            rec['map_names'] = map_names[c]
        countries.append(rec)
    city_names = collections.Counter(c['name'] for c in O['cities'])
    cities = []
    for c in O['cities']:
        rec = {}
        for k, v in c.items():
            rec[{'iso2': 'country', 'r': 'radius_km'}.get(k, k)] = v
        if c['name'] in O['cityLang']:
            assert city_names[c['name']] == 1, c['name']
            rec['lang'] = O['cityLang'][c['name']]
        cities.append(rec)
    city_lang_unmatched = {k: v for k, v in O['cityLang'].items() if k not in city_names}

    layout = {'cost': O['layout']['cost'], 'lanes': O['layout']['laneOrder'], 'R': O['layout']['R']}

    legacy_order = {
        'about': 'Exists only so build.py (through tools/legacy_data.py) reproduces the page data of 23 November 2026 '
                 'byte for byte. It holds orders and values the new model does not determine. Drop it when the page '
                 'reads the new shape. Ids missing here are placed after the listed ones in the new files\' own order.',
        'defs': list(defs),
        'playlists': list(pl),
        'scores': list(O['scores']),
        'tradOf': list(O['tradOf']),
        'row': list(O['layout']['row']),
        'notes': list(O['notes']),
        'era': list(O['era']),
        'isoLang': list(O['isoLang']),
        'neAlias': list(O['neAlias']),
        'cityLang': list(O['cityLang']),
        'cityLang_unmatched': city_lang_unmatched,
        'tests': test_ids,
    }

    # ---- write ----
    def split(recs, folder):
        groups = collections.defaultdict(list)
        for r in recs:
            groups[r['id'][2:3]].append(r)
        for k, rs in groups.items():
            write_records(os.path.join(out, folder, k + '.json'), sorted(rs, key=lambda r: r['id']))

    split(song_recs, 'songs')
    split([dict(id=i, name=n, unsplit=True) for n, i in artists.items()], 'artists')
    split([dict(id=evidence[i], title=t, url=u) for i, (t, u) in enumerate(O['ysrc'])], 'evidence')
    write_records(os.path.join(out, 'releases.json'),
                  sorted([dict(id=r, title=t, credits=[artists[a]]) for (a, t), r in releases.items()], key=lambda r: r['id']))
    for g, L in glinks.items():
        write_records(os.path.join(out, 'links', 'g', g + '.json'), L)
        write_records(os.path.join(out, 'scopes', 'g', g + '.json'), [gscopes[g]])
    for (c, dec), L in clinks.items():
        write_records(os.path.join(out, 'links', 'c', c, dec + '.json'), L)
    for (c, dec), scs in cscopes.items():
        dec_id = 'c:%s:%ss' % (c, dec)
        order = ([scs[dec_id]] if dec_id in scs else []) + sorted([v for k, v in scs.items() if k != dec_id], key=lambda r: r['id'])
        write_records(os.path.join(out, 'scopes', 'c', c, dec + '.json'), order)
    write_records(os.path.join(out, 'genres.json'), genres)
    write_records(os.path.join(out, 'parentage.json'), parentage)
    write_records(os.path.join(out, 'presence.json'), presence)
    write_records(os.path.join(out, 'traditions.json'), traditions)
    write_records(os.path.join(out, 'families.json'), families)
    write_records(os.path.join(out, 'regions.json'), regions)
    write_records(os.path.join(out, 'countries.json'), countries)
    write_records(os.path.join(out, 'cities.json'), cities)
    write_object(os.path.join(out, 'layout.json'), layout)
    write_object(os.path.join(out, 'legacy-order.json'), legacy_order)
    for k in ('langs', 'known', 'done', 'indoc', 'method'):
        if os.path.abspath(src) != os.path.abspath(out):
            with open(os.path.join(src, k + '.json'), 'rb') as f, open(os.path.join(out, k + '.json'), 'wb') as g:
                g.write(f.read())

    os.makedirs(WORK, exist_ok=True)
    write_records(os.path.join(WORK, 'match-candidates.json'), cands)
    write_records(os.path.join(WORK, 'genre-conflicts.json'), conflicts)
    write_records(os.path.join(WORK, 'release-year-conflicts.json'), year_conflicts)
    write_records(os.path.join(WORK, 'family-mismatches.json'), family_mismatch)
    roles = collections.Counter(l['role'] for L in list(glinks.values()) + list(clinks.values()) for l in L)
    print('songs', len(songs), 'artists', len(artists), 'releases', len(releases), 'evidence', len(evidence))
    print('links by role', dict(roles))
    print('match candidates', len(cands), dict(collections.Counter(c['why'] for c in cands)))
    print('genre conflicts', len(conflicts), 'release-year conflicts', len(year_conflicts), 'family mismatches', len(family_mismatch))
    print('songs with genre', sum(1 for r in song_recs if 'genre' in r))


if __name__ == '__main__':
    main()
