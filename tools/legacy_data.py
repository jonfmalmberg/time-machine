"""Rebuild the page's DATA object, in the shape the page read on 23 November 2026, from the new data model.

The page (src/) still reads the old shape: keys such as `nodes`, `playlists`, `era`. This module
produces that object from the files of docs/proposals/2026-11-23-schema.md, including the order of
every key and list item, so the built page was byte-identical to the one built from the old files.
Orders the new model does not determine come from data/legacy-order.json; ids not listed there
(genres researched since) follow in their own order.

One key is new, not old: `verified`, what the evidence check found per scope, so the page can say
which lists are verified. {g: {genre: {links, checked}}, c: {ISO: {decade: {links, checked}}}}:
`links` counts song links, `checked` those with at least one evidence record whose check found its
string on its page. A country's decade sums its decade list and its year lists.

It exists only for the move. Delete it, and data/legacy-order.json, when the page reads the new shape.
"""
import glob, json, os

# Order of the keys in the page's DATA object.
KEYS = ['tests', 'verified', 'era', 'yearl', 'ysrc', 'langs', 'isoLang', 'cityLang', 'st', 'cnt', 'iso',
        'neAlias', 'cities', 'regions', 'bands', 'nodes', 'layout', 'scores',
        'playlists', 'known', 'done', 'indoc', 'edges', 'tier', 'trad', 'tradOf',
        'ends', 'defs', 'notes', 'method', 'sub', 'relcheck', 'course']
CITY_FIELDS = [('name', 'name'), ('country', 'iso2'), ('lat', 'lat'), ('lon', 'lon'), ('founded', 'founded'),
               ('ended', 'ended'), ('names', 'names'), ('size', 'size'), ('kind', 'kind'), ('radius_km', 'r'),
               ('note', 'note'), ('x', 'x')]


def _load(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def _records(pattern):
    out = []
    for p in sorted(glob.glob(pattern)):
        out += _load(p)
    return out


def _ordered(listed, present):
    """Ids in the stored legacy order, then any others in their own order."""
    s = set(present)
    head = [i for i in listed if i in s]
    seen = set(head)
    return head + [i for i in present if i not in seen]


def legacy_data(data_dir):
    D = data_dir
    lo = _load(os.path.join(D, 'legacy-order.json'))
    songs = {r['id']: r for r in _records(os.path.join(D, 'songs', '*.json'))}
    artists = {r['id']: r for r in _records(os.path.join(D, 'artists', '*.json'))}
    releases = {r['id']: r for r in _load(os.path.join(D, 'releases.json'))}
    evidence = {r['id']: r for r in _records(os.path.join(D, 'evidence', '*.json'))}
    genres = _load(os.path.join(D, 'genres.json'))
    gid = [g['id'] for g in genres]
    G = {g['id']: g for g in genres}

    def credit(rec):
        if 'credit_text' in rec:            # several credited artists: the credit as it was listed
            return rec['credit_text']
        cs = rec['credits']
        if len(cs) != 1:
            raise ValueError('legacy shape needs one credit string: ' + rec['id'])
        a = cs[0]['artist'] if isinstance(cs[0], dict) else cs[0]
        return artists[a]['name']

    def year(link, field='released'):
        s = songs[link['song']]
        if field in link:
            return link[field]
        if field == 'released':
            return s['released']['year'] if 'released' in s else None
        return s.get(field)

    def pair(link):
        s = songs[link['song']]
        return credit(s), s['title']

    # ---- research scopes and links ----
    gscope = {}
    for p in sorted(glob.glob(os.path.join(D, 'scopes', 'g', '*.json'))):
        for r in _load(p):
            gscope[r['id'][2:]] = r
    glinks = {}
    for p in sorted(glob.glob(os.path.join(D, 'links', 'g', '*.json'))):
        glinks[os.path.basename(p)[:-5]] = _load(p)
    cscope, clinks = {}, {}     # iso -> {scope id: record}; iso -> [links]
    for p in sorted(glob.glob(os.path.join(D, 'scopes', 'c', '*', '*.json'))):
        for r in _load(p):
            cscope.setdefault(r['id'].split(':')[1], {})[r['id']] = r
    for p in sorted(glob.glob(os.path.join(D, 'links', 'c', '*', '*.json'))):
        for l in _load(p):
            clinks.setdefault(l['scope'], []).append(l)

    # tests: stored on their scope; legacy order from legacy-order.json, new ones after by date
    tests_by_id = {}
    for r in list(gscope.values()) + [r for scs in cscope.values() for r in scs.values()]:
        sid = r['id']
        for t in r.get('tests', []):
            head = {'g': sid[2:]} if sid.startswith('g:') else {'iso': sid.split(':')[1]}
            tests_by_id[t['id']] = (t['date'], dict(head, **{k: v for k, v in t.items() if k != 'id'}))
    natural = sorted(tests_by_id, key=lambda i: (tests_by_id[i][0], i))
    tests = [tests_by_id[i][1] for i in _ordered(lo['tests'], natural)]

    era = {}
    for iso in _ordered(lo['era'], sorted(cscope)):
        decs = sorted(k for k, r in cscope[iso].items() if r.get('status') == 'decade list')
        if not decs:
            continue
        era[iso] = {}
        for sid in decs:
            dec = sid.split(':')[2][:-1]
            era[iso][dec] = {'note': cscope[iso][sid].get('note', ''), 'songs': [
                list(pair(l)) + [year(l), l['role'], l['scene'], l['confidence']] for l in clinks.get(sid, [])]}

    yearl, ysrc, src_index = {}, [], {}
    for iso in sorted(cscope):
        ys = sorted(k for k, r in cscope[iso].items() if r.get('status') == 'year list')
        if not ys:
            continue
        yearl[iso] = {}
        for sid in ys:
            rows = []
            for l in clinks.get(sid, []):
                e = l['evidence'][0]
                if e not in src_index:
                    src_index[e] = len(ysrc)
                    ysrc.append([evidence[e]['title'], evidence[e]['url']])
                rows.append(list(pair(l)) + [year(l), l['role'], l['rank'], src_index[e], l.get('source_address', ''), l['scene'], l.get('chart_pos')] + ([l['chart']] if 'quote' in l and l.get('chart') else []))   # a charted row also says which kind of chart
            # Order of a year list (DECISIONS.md D8, rule version 1). Only where the list has chart positions:
            # charted songs in chart order, then the songs with no chart position in the order they were stored.
            # The number shown as the list order follows the result. Lists with no chart positions are untouched.
            if any(r[8] is not None for r in rows):
                rows = sorted((r for r in rows if r[8] is not None), key=lambda r: r[8]) + [r for r in rows if r[8] is None]
                for n, r in enumerate(rows, 1):
                    r[4] = n
            yearl[iso][sid.split(':')[2]] = dict({'songs': rows, 'note': cscope[iso][sid].get('note', '')}, **({'basis': 'chart'} if cscope[iso][sid].get('basis') == 'chart' else {}), **({'order': cscope[iso][sid]['order']} if cscope[iso][sid].get('order') else {}))
    for e in sorted(evidence):
        # The old source list also held sources no year list pointed at. Evidence that came in through the
        # master-table step (it carries `check`) belongs to genre links and definitions, not to this list.
        if e not in src_index and 'check' not in evidence[e]:
            src_index[e] = len(ysrc)
            ysrc.append([evidence[e]['title'], evidence[e]['url']])

    # ---- verification: per scope, how many song links have evidence the check script found ----
    def tally(links):
        L = [l for l in links if 'song' in l]
        ok = sum(1 for l in L if any((evidence.get(e, {}).get('check') or {}).get('result') == 'found'
                                     for e in l.get('evidence', [])))
        return {'links': len(L), 'checked': ok}
    verified = {'g': {g: tally(glinks.get(g, [])) for g in _ordered(lo['playlists'], [g for g in gid if g in gscope])},
                'c': {}}
    for iso_ in sorted(cscope):        # by country and decade, as ERA and YEARL are read: '1980' holds 1980s and 1980..1989
        by_dec = {}
        for sid in cscope[iso_]:
            y = sid.split(':')[2]
            dec = y[:-1] if y.endswith('s') else str(int(y) // 10 * 10)
            t = tally(clinks.get(sid, []))
            v = by_dec.setdefault(dec, {'links': 0, 'checked': 0})
            v['links'] += t['links']; v['checked'] += t['checked']
        verified['c'][iso_] = {d: by_dec[d] for d in sorted(by_dec)}

    # ---- places ----
    countries = _load(os.path.join(D, 'countries.json'))
    cities = _load(os.path.join(D, 'cities.json'))
    iso = {c['id']: [c['name'], c['region']] for c in countries}
    lang_of = {c['id']: c['langs'][0] for c in countries if c.get('langs')}
    isoLang = {i: lang_of[i] for i in _ordered(lo['isoLang'], [c['id'] for c in countries if c['id'] in lang_of])}
    alias = {n: c['id'] for c in countries for n in c.get('map_names', [])}
    neAlias = {n: alias[n] for n in _ordered(lo['neAlias'], list(alias))}
    city_lang = dict(lo.get('cityLang_unmatched', {}))
    city_lang.update({c['name']: c['lang'] for c in cities if 'lang' in c})
    cityLang = {n: city_lang[n] for n in _ordered(lo['cityLang'], list(city_lang))}
    city_list = [{old: c[new] for new, old in CITY_FIELDS if new in c} for c in cities]

    regions = [[r['id'], r['name']] for r in _load(os.path.join(D, 'regions.json'))]
    families = _load(os.path.join(D, 'families.json'))
    bands = [[f['id'], f['name']] for f in families]
    traditions = _load(os.path.join(D, 'traditions.json'))

    # ---- genres and the tree ----
    parentage = _load(os.path.join(D, 'parentage.json'))
    parents = {g: [] for g in gid}
    for e in parentage:
        if e['kind'] == 'principal':
            parents[e['to']].insert(0, e['from'])
        else:
            parents[e['to']].append(e['from'])
    nodes = [[g['id'], g['name'], g['region'], g['family'], g['began'], g['origin']['text'], g['origin']['lat'],
              g['origin']['lon'], parents[g['id']]] for g in genres]
    edges = [[e['from'], e['to'], 1 if e['kind'] == 'principal' else 0.4] for e in parentage]
    lay = _load(os.path.join(D, 'layout.json'))
    layout = {'cost': lay['cost'], 'row': {g: G[g]['row'] for g in _ordered(lo['row'], gid)},
              'bandOrder': [f['id'] for f in sorted(families, key=lambda f: f['order'])],
              'laneOrder': lay['lanes'], 'R': lay['R']}
    J = ('significance', 'ease', 'fame', 'intrigue')
    scores = {g: [G[g]['judgements'][k] for k in J] for g in _ordered(lo['scores'], gid)}
    tradOf = {g: G[g]['tradition'] for g in _ordered(lo['tradOf'], gid)}
    tname = {t['id']: t['name'] for t in traditions}
    trad_order = []
    for t in list(tradOf.values()) + [t['id'] for t in traditions]:
        if t not in trad_order:
            trad_order.append(t)
    trad = {t: tname[t] for t in trad_order}

    presence = _load(os.path.join(D, 'presence.json'))
    region_ids = {r[0] for r in regions}
    st = {g: [None, None, [], {}] for g in gid}
    cnt = {g: [G[g]['origin']['country'], [], {}] for g in gid}
    for p in presence:
        g, place = p['genre'], p['place']
        if p['kind'] == 'peak':
            if st[g][0] is None:
                st[g][0], st[g][1] = p['from'], p['to']
            (st[g][2] if place in region_ids else cnt[g][1]).append(place)
        elif p['kind'] == 'later':
            (st[g][3] if place in region_ids else cnt[g][2])[place] = p['from']

    defs, playlists = {}, {}
    for g in _ordered(lo['defs'], [g for g in gid if 'definition' in G[g]]):
        d, L = G[g]['definition'], glinks.get(g, [])
        defs[g] = {'window': d['window'], 'sound': d['sound'], 'markers': d['markers'],
                   'fits': [list(pair(l)) + [year(l)] for l in L if l['role'] == 'reference'],
                   'near': [list(pair(l)) + [year(l), l['belongs_to'], l['reason']] for l in L if l['role'] == 'near miss']}
    for g in _ordered(lo['playlists'], [g for g in gid if g in gscope and 'status' in gscope[g]]):
        sc, L = gscope[g], glinks.get(g, [])
        songs_in = [l for l in L if l['role'] in ('intro', 'peak')]
        p = {'status': sc['status'],
             'intro': [list(pair(l)) for l in L if l['role'] == 'intro'],
             'peak': [list(pair(l)) for l in L if l['role'] == 'peak'],
             'albums': [[credit(releases[l['release']]), releases[l['release']]['title']] for l in L if l['role'] == 'album'],
             'fold': sc.get('fold'), 'note': sc.get('note', '')}
        if sc.get('years_listed', True):
            p['yrs'] = [[year(l), year(l, 'written')] for l in sorted(songs_in, key=lambda l: l['role'] != 'intro')]
        playlists[g] = p

    def plain(name):
        return _load(os.path.join(D, name + '.json'))

    data = {
        'tests': tests, 'verified': verified, 'era': era, 'yearl': yearl, 'ysrc': ysrc, 'langs': plain('langs'), 'isoLang': isoLang,
        'cityLang': cityLang, 'st': st, 'cnt': cnt, 'iso': iso, 'neAlias': neAlias, 'cities': city_list,
        'regions': regions, 'bands': bands, 'nodes': nodes, 'layout': layout, 'scores': scores,
        'playlists': playlists, 'known': plain('known'), 'done': plain('done'), 'indoc': plain('indoc'),
        'edges': edges, 'tier': {g: G[g]['tier'] for g in gid}, 'trad': trad, 'tradOf': tradOf,
        'ends': {g: G[g]['ended'] for g in gid},
        'defs': defs, 'notes': {g: G[g]['note'] for g in _ordered(lo['notes'], [g for g in gid if 'note' in G[g]])},
        'method': plain('method'),
        # release years checked against MusicBrainz (tools/check_musicbrainz.py): "artist\x01title" -> [state, their year]
        'relcheck': {credit(r) + '\x01' + r['title']: [r['released']['check']['state'], r['released']['check']['year']]
                     for r in songs.values() if (r.get('released') or {}).get('check')},
        # named sub-genres folded into a genre (DECISIONS.md D10): shown on its card and found by search
        'sub': {g: G[g]['subgenres'] for g in gid if G[g].get('subgenres')},
        # the course's lectures (data/course.json): written prose, marked with whether it has been checked (DECISIONS.md D29)
        'course': _load(os.path.join(data_dir, 'course.json')) if os.path.exists(os.path.join(data_dir, 'course.json')) else None,
    }
    return {k: data[k] for k in KEYS}
