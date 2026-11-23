#!/usr/bin/env python3
"""H1 fault scan over data/*.json. Run from the repository root:
   python3 faults.py <out_dir>
Writes <out_dir>/faults.json and prints a summary (counts and examples) as JSON on stdout."""
import json, glob, os, re, sys, unicodedata, collections as C

OUT = sys.argv[1]
D = {os.path.basename(f)[:-5]: json.load(open(f, encoding='utf-8')) for f in glob.glob('data/*.json')}
NODES = {n[0]: n for n in D['nodes']}
F = []  # faults


def add(file, key, kind, detail):
    F.append({'file': file, 'key': key, 'kind': kind, 'detail': detail})


# ---------- genres with no definition ----------
for n in D['nodes']:
    if n[0] not in D['defs']:
        add('nodes.json', n[0], 'genre_no_definition', f'{n[1]} ({n[4]}, {n[5]}) has no entry in defs.json')

# ---------- definition / playlist sets ----------
for k in D['defs']:
    if k not in D['playlists']:
        add('defs.json', k, 'definition_without_playlist', 'definition exists but playlists.json has no entry')
for k in D['playlists']:
    if k not in D['defs']:
        add('playlists.json', k, 'playlist_without_definition', 'playlist exists but defs.json has no entry')

# ---------- playlists with fewer than four songs ----------
for k, p in D['playlists'].items():
    n = len(p['intro']) + len(p['peak'])
    if n < 4:
        add('playlists.json', k, 'playlist_under_four_songs',
            f"status {p['status']}: {n} songs (intro {len(p['intro'])}, peak {len(p['peak'])}), {len(p['albums'])} albums"
            + (f", fold -> {p['fold']}" if p['fold'] else ''))
    # same song twice in one playlist
    seen = C.Counter((a.lower(), t.lower()) for a, t in p['intro'] + p['peak'])
    for (a, t), c in seen.items():
        if c > 1:
            add('playlists.json', k, 'playlist_song_repeated', f'{a} - {t} appears {c} times')
    if p['status'] == 'none' and n:
        add('playlists.json', k, 'status_none_with_songs', f'status none but {n} songs listed')
    if p['status'] == 'full' and n < 8:
        add('playlists.json', k, 'status_full_but_short', f'status full with only {n} songs')


# ---------- the same song spelled differently ----------
def norm(s):
    s = unicodedata.normalize('NFKD', str(s)).encode('ascii', 'ignore').decode().lower()
    s = s.replace('&', ' and ')
    s = re.sub(r'\(.*?\)|\[.*?\]', ' ', s)
    s = re.sub(r'\b(the|a|an)\b', ' ', s)
    return re.sub(r'[^a-z0-9]', '', s)


def lat(s):  # key of the original string when the name is not in Latin script
    return norm(s) or re.sub(r'\s+', '', str(s).lower())


occ = []  # (file, key, artist, title, year)
for g, d in D['defs'].items():
    for a, t, y in d['fits']:
        occ.append(('defs.json', f'{g}.fits', a, t, y))
    for a, t, y, *_ in d['near']:
        occ.append(('defs.json', f'{g}.near', a, t, y))
for g, p in D['playlists'].items():
    yrs = p.get('yrs') or []
    for i, (a, t) in enumerate(p['intro'] + p['peak']):
        occ.append(('playlists.json', g, a, t, (yrs[i][0] if i < len(yrs) else None)))
for iso, c in D['era'].items():
    for dec, b in c.items():
        for s in b['songs']:
            occ.append(('era.json', f'{iso}.{dec}', s[0], s[1], s[2]))
for iso, c in D['yearl'].items():
    for y, b in c.items():
        for s in b['songs']:
            occ.append(('yearl.json', f'{iso}.{y}', s[0], s[1], s[2]))

by = C.defaultdict(list)
for o in occ:
    by[(lat(o[2]), lat(o[3]))].append(o)
for (na, nt), os_ in by.items():
    raws = {(o[2], o[3]) for o in os_}
    files = {o[0] for o in os_}
    if len(raws) > 1:
        forms = sorted(raws)
        where = sorted({f'{o[0]}:{o[1]}' for o in os_})
        kind = 'song_spelling_variant_across_files' if len(files) > 1 else 'song_spelling_variant_within_file'
        add(','.join(sorted(files)), f'{na}|{nt}', kind,
            'forms: ' + ' / '.join(f'{a} - {t}' for a, t in forms) + ' ; at ' + ', '.join(where[:8]) + (' …' if len(where) > 8 else ''))

# same title (normalized), artist names that differ but one contains the other or they share a word: possible same song
byt = C.defaultdict(list)
for o in occ:
    byt[lat(o[3])].append(o)
for nt, os_ in byt.items():
    if len(nt) < 4:
        continue
    arts = {}
    for o in os_:
        arts.setdefault(lat(o[2]), set()).add((o[0], o[1], o[2]))
    keys = sorted(arts)
    for i in range(len(keys)):
        for j in range(i + 1, len(keys)):
            a, b = keys[i], keys[j]
            if not a or not b:
                continue
            if (a in b or b in a) and min(len(a), len(b)) >= 4:
                fa = {x[0] for x in arts[a]}; fb = {x[0] for x in arts[b]}
                ra = sorted({x[2] for x in arts[a]})[0]; rb = sorted({x[2] for x in arts[b]})[0]
                title = os_[0][3]
                add(','.join(sorted(fa | fb)), f'{a}~{b}|{nt}', 'song_artist_name_variant',
                    f'"{title}" credited to "{ra}" ({", ".join(sorted({x[0]+":"+x[1] for x in arts[a]})[:3])}) and to "{rb}" ({", ".join(sorted({x[0]+":"+x[1] for x in arts[b]})[:3])})')


# ---------- songs dated outside their genre's years ----------
ENDS = D['ends']


def parse_window(w):
    m = re.match(r'^\s*(?:c\.\s*)?(-?\d{1,4})(?:\s*(BCE))?\s*[–-]\s*(?:c\.\s*)?(-?\d{1,4})(?:\s*(BCE))?', w)
    if m:
        a, b = int(m.group(1)), int(m.group(3))
        if m.group(2): a = -a
        if m.group(4): b = -b
        return a, b
    m = re.match(r'^\s*(?:c\.\s*)?(\d{3,4})\s+onward', w)
    if m:
        return int(m.group(1)), 2026
    return None


unparsed = []
for g, d in D['defs'].items():
    n = NODES.get(g)
    if not n:
        continue
    start, end = n[4], ENDS.get(g)
    win = parse_window(d['window'])
    if not win:
        unparsed.append((g, d['window']))
    for a, t, y in d['fits']:
        if not isinstance(y, int):
            continue
        if n[4] >= 1890 and y < start:
            add('defs.json', g, 'fit_before_genre_start', f'{a} - {t} ({y}) is earlier than the genre start {start} in nodes.json')
        if end is not None and y > end and n[4] >= 1890:
            add('defs.json', g, 'fit_after_genre_end', f'{a} - {t} ({y}) is later than the genre end {end} in ends.json')
        if win and n[4] >= 1890 and not (win[0] - 2 <= y <= win[1] + 2):
            add('defs.json', g, 'fit_outside_window', f'{a} - {t} ({y}) is outside the definition window "{d["window"]}"')
for g, p in D['playlists'].items():
    n = NODES.get(g)
    if not n or n[4] < 1890:
        continue
    start, end = n[4], ENDS.get(g)
    yrs = p.get('yrs') or []
    for i, (a, t) in enumerate(p['intro'] + p['peak']):
        if i >= len(yrs) or yrs[i][0] is None:
            continue
        y = yrs[i][0]
        if y < start - 1:   # one year of slack
            add('playlists.json', g, 'playlist_song_before_genre_start', f'{a} - {t} ({y}) is earlier than the genre start {start}')
        if end is not None and y > end + 1:
            add('playlists.json', g, 'playlist_song_after_genre_end', f'{a} - {t} ({y}) is later than the genre end {end}')
# era and year lists: a song dated outside the decade or year it is filed under
for iso, c in D['era'].items():
    for dec, b in c.items():
        d0 = int(dec)
        for s in b['songs']:
            if not (d0 - 5 <= s[2] <= d0 + 9):
                add('era.json', f'{iso}.{dec}', 'era_song_outside_decade', f'{s[0]} - {s[1]} dated {s[2]}, filed under the {dec}s')
for iso, c in D['yearl'].items():
    for y, b in c.items():
        for s in b['songs']:
            if s[2] > int(y):
                add('yearl.json', f'{iso}.{y}', 'year_song_released_after_year', f'{s[0]} - {s[1]} dated {s[2]}, filed under {y}')

# ---------- empty or thin decades ----------
for iso, c in D['era'].items():
    for dec in [str(x) for x in range(1940, 2030, 10)]:
        if dec not in c or not c[dec]['songs']:
            add('era.json', f'{iso}.{dec}', 'era_empty_decade', 'no songs')
        elif len(c[dec]['songs']) < 6:
            add('era.json', f'{iso}.{dec}', 'era_thin_decade', f"{len(c[dec]['songs'])} songs ({sum(1 for s in c[dec]['songs'] if s[3]=='home')} home-grown)")
for iso, c in D['yearl'].items():
    ys = sorted(int(y) for y in c)
    decs = C.Counter(y // 10 * 10 for y in ys)
    for d in range(ys[0] // 10 * 10, ys[-1] // 10 * 10 + 1, 10):
        if d not in decs:
            add('yearl.json', f'{iso}.{d}', 'yearl_empty_decade', f'no year lists for the {d}s, though {iso} has year lists from {ys[0]} to {ys[-1]}')
        elif decs[d] < min(10, 2027 - d):
            missing = [y for y in range(d, min(d + 10, 2027)) if y not in ys]
            add('yearl.json', f'{iso}.{d}', 'yearl_partial_decade', f'{decs[d]} of the years have lists; missing ' + ', '.join(map(str, missing)))
    for y in ys:
        home = sum(1 for s in c[str(y)]['songs'] if s[3] == 'home')
        if home < 6:
            add('yearl.json', f'{iso}.{y}', 'yearl_sparse_year', f"{home} home-grown songs (the page calls a year sparse under 6); {len(c[str(y)]['songs'])} songs in all")

# ---------- cities without a country ----------
for i, c in enumerate(D['cities']):
    if c.get('iso2') not in D['iso']:
        add('cities.json', f"{c['iso2']}:{c['name']}", 'city_country_missing',
            f"iso2 {c['iso2']} is not in iso.json, so the page shows the bare code and the city is in no region")

# ---------- references that point nowhere ----------
ISO = D['iso']; REG = {r[0] for r in D['regions']}; BANDS = {b[0] for b in D['bands']}; TRAD = D['trad']
for n in D['nodes']:
    if n[2] not in REG: add('nodes.json', n[0], 'bad_reference', f'region {n[2]} not in regions.json')
    if n[3] not in BANDS: add('nodes.json', n[0], 'bad_reference', f'family {n[3]} not in bands.json')
    for p in n[8]:
        if p not in NODES: add('nodes.json', n[0], 'bad_reference', f'parent {p} not in nodes.json')
for a, b, w in D['edges']:
    for x in (a, b):
        if x not in NODES: add('edges.json', f'{a}>{b}', 'bad_reference', f'{x} not in nodes.json')
for name in ['defs', 'playlists', 'st', 'cnt', 'ends', 'scores', 'tier', 'tradOf', 'notes']:
    for k in D[name]:
        if k not in NODES: add(name + '.json', k, 'bad_reference', 'key not in nodes.json')
    if name in ('st', 'cnt', 'ends', 'scores', 'tier', 'tradOf'):
        for k in NODES:
            if k not in D[name]: add(name + '.json', k, 'missing_entry', 'genre in nodes.json has no entry here')
for name in ['known', 'done', 'indoc']:
    for k in D[name]:
        if k not in NODES: add(name + '.json', k, 'bad_reference', 'id not in nodes.json')
for k in D['layout']['row']:
    if k not in NODES: add('layout.json', 'row.' + k, 'bad_reference', 'id not in nodes.json')
for k in NODES:
    if k not in D['layout']['row']: add('layout.json', 'row.' + k, 'missing_entry', 'genre has no tree row')
lane_trads = [t for b in D['layout']['laneOrder'].values() for t in b]
for t in lane_trads:
    if t not in TRAD: add('layout.json', 'laneOrder.' + t, 'bad_reference', 'tradition not in trad.json')
    if t not in D['layout']['R']: add('layout.json', 'R.' + t, 'missing_entry', 'lane has no row count')
members = C.Counter(D['tradOf'].values())
for t in TRAD:
    if t not in members: add('trad.json', t, 'never_read', 'tradition has no member genre in tradOf.json, so the page never shows it')
    if t not in lane_trads: add('trad.json', t, 'missing_entry', 'tradition is in no lane of layout.json, so its genres are not drawn on the tree')
for g, t in D['tradOf'].items():
    if t not in TRAD: add('tradOf.json', g, 'bad_reference', f'tradition {t} not in trad.json')
for g, d in D['defs'].items():
    for x in d['near']:
        if x[3] not in NODES: add('defs.json', g, 'bad_reference', f'near-miss {x[0]} - {x[1]} points to {x[3]}, not in nodes.json')
for g, p in D['playlists'].items():
    if p['fold'] and p['fold'] not in NODES: add('playlists.json', g, 'bad_reference', f"fold {p['fold']} not in nodes.json")
for g, c in D['cnt'].items():
    for x in [c[0]] + c[1] + list(c[2]):
        if x and x not in ISO: add('cnt.json', g, 'bad_reference', f'country {x} not in iso.json')
for g, s in D['st'].items():
    for r in s[2] + list(s[3]):
        if r not in REG: add('st.json', g, 'bad_reference', f'region {r} not in regions.json')
    if s[0] > s[1]: add('st.json', g, 'bad_value', f'peak start {s[0]} after peak end {s[1]}')
    n = NODES.get(g)
    if n and s[0] < n[4]: add('st.json', g, 'bad_value', f'peak start {s[0]} before the genre start {n[4]}')
    e = ENDS.get(g)
    if e is not None and s[1] > e: add('st.json', g, 'bad_value', f'peak end {s[1]} after the genre end {e}')
for name in ['cityLang']:
    names = {c['name'] for c in D['cities']}
    for k in D[name]:
        if k not in names: add('cityLang.json', k, 'never_read', 'no city has this name, so the entry is never used')
for k in D['isoLang']:
    if k not in ISO: add('isoLang.json', k, 'bad_reference', 'not in iso.json')
for k in D['era']:
    if k not in ISO: add('era.json', k, 'bad_reference', 'country not in iso.json')
for k in D['yearl']:
    if k not in ISO: add('yearl.json', k, 'bad_reference', 'country not in iso.json')
for t in D['tests']:
    if 'iso' in t and t['iso'] not in ISO: add('tests.json', t['iso'], 'bad_reference', 'country not in iso.json')
    if 'g' in t and t['g'] not in NODES: add('tests.json', t['g'], 'bad_reference', 'genre not in nodes.json')

# ---------- entries and fields the page never reads ----------
NEVER = [
    ('era.json', '<every country>.<every decade>.note', 'the decade note is never read by the page (324 notes)'),
    ('yearl.json', '<every country>.<every year>.note', 'the year note is never read by the page (164 notes)'),
    ('yearl.json', '<every song>[6]', 'position 6 (source address when position 5 is a name) is read, but is an empty string in all 2,359 songs; every song uses the numeric ysrc index in position 5'),
    ('cities.json', '<city>.note', 'the note field (26 cities) is never read'),
    ('layout.json', 'cost', 'never read by the page'),
    ('indoc.json', '<all 42 entries>', 'read only by renderJourney() in src/template.html, which src/mods/40_journey.js replaces with an empty function, so the "In doc" tag is never shown'),
]
for f, k, d in NEVER:
    add(f, k, 'never_read', d)
# a genre's tree tooltip note is read only for genres drawn on the tree; all notes keys are genres (checked above)

json.dump(F, open(os.path.join(OUT, 'faults.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
# also one fault per line
with open(os.path.join(OUT, 'faults.json'), 'w', encoding='utf-8') as f:
    f.write('[\n' + ',\n'.join(json.dumps(x, ensure_ascii=False) for x in F) + '\n]\n')
summ = C.Counter(x['kind'] for x in F)
ex = {k: [x for x in F if x['kind'] == k][:10] for k in summ}
print(json.dumps({'counts': summ, 'examples': ex, 'unparsed_windows': unparsed}, ensure_ascii=False, indent=1))
