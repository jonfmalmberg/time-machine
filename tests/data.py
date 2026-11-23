#!/usr/bin/env python3
"""Check the music data against the rules of the data model (docs/proposals/2026-11-23-schema.md).

Standard-library Python only. Run: python3 tests/data.py
Prints every breach and exits non-zero if there is any.
"""
import glob, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'data')
KEY = re.compile(r'^([sare])_[0-9a-hjkmnp-tv-z]{10}$')     # prefix + 10 Crockford base-32 characters
GENRE_ROLES = {'intro', 'peak', 'reference', 'near miss', 'album'}
PLACE_ROLES = {'home', 'foreign'}
# Faults already listed in docs/research/2026-11-23-data-inventory.md ("Cities without a country").
# Reported, not failed, until the owner decides; any other breach of the same rule fails.
KNOWN = {('city country', 'GI:Gibraltar'), ('city country', 'TV:Funafuti'), ('city country', 'NR:Yaren')}

breaches, known = [], []


def bad(rule, where, msg):
    (known if (rule, where) in KNOWN else breaches).append('%s: %s: %s' % (rule, where, msg))


def load(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def rel(p):
    return os.path.relpath(p, D)


def keyed(folder, prefix):
    """Records of a split folder; checks key format, file placement and duplicates."""
    out = {}
    for p in sorted(glob.glob(os.path.join(D, folder, '*.json'))):
        for r in load(p):
            k = r.get('id', '')
            m = KEY.match(k)
            if not m or m.group(1) != prefix:
                bad('key format', rel(p), '%r is not %s_ followed by 10 base-32 characters' % (k, prefix))
            elif os.path.basename(p) != k[2:3] + '.json':
                bad('key placement', rel(p), '%s belongs in %s/%s.json' % (k, folder, k[2:3]))
            if k in out:
                bad('duplicate key', rel(p), k)
            out[k] = r
    return out


songs = keyed('songs', 's')
artists = keyed('artists', 'a')
evidence = keyed('evidence', 'e')
releases = {}
for r in load(os.path.join(D, 'releases.json')):
    k = r.get('id', '')
    m = KEY.match(k)
    if not m or m.group(1) != 'r':
        bad('key format', 'releases.json', '%r is not r_ followed by 10 base-32 characters' % k)
    if k in releases:
        bad('duplicate key', 'releases.json', k)
    releases[k] = r
every = list(songs) + list(artists) + list(evidence) + list(releases)
if len(every) != len(set(every)):
    bad('duplicate key', 'data', 'the same key is used by records of two kinds')


def ids(name):
    out = {}
    for r in load(os.path.join(D, name)):
        if r['id'] in out:
            bad('duplicate id', name, r['id'])
        out[r['id']] = r
    return out


regions = ids('regions.json')
families = ids('families.json')
traditions = ids('traditions.json')
countries = ids('countries.json')
genres = ids('genres.json')

# ---- references between places, genres, traditions, families ----
for t in traditions.values():
    if t.get('family') not in families:
        bad('reference', 'traditions.json ' + t['id'], 'family %r does not exist' % t.get('family'))
for c in countries.values():
    if c.get('region') not in regions:
        bad('reference', 'countries.json ' + c['id'], 'region %r does not exist' % c.get('region'))
for c in load(os.path.join(D, 'cities.json')):
    if c.get('country') not in countries:
        bad('city country', '%s:%s' % (c.get('country'), c.get('name')), 'country %r does not exist' % c.get('country'))
for g in genres.values():
    w = 'genres.json ' + g['id']
    if g.get('tradition') not in traditions:
        bad('reference', w, 'tradition %r does not exist' % g.get('tradition'))
    if g.get('family') not in families:
        bad('reference', w, 'family %r does not exist' % g.get('family'))
    if g.get('region') not in regions:
        bad('reference', w, 'region %r does not exist' % g.get('region'))
    if (g.get('origin') or {}).get('country') not in countries:
        bad('reference', w, 'origin country %r does not exist' % (g.get('origin') or {}).get('country'))
    for k in ('significance', 'ease', 'fame', 'intrigue'):
        v = (g.get('judgements') or {}).get(k)
        if v is not None and not (isinstance(v, int) and 1 <= v <= 5):
            bad('judgement', w, '%s is %r, not 1 to 5' % (k, v))

# ---- the tree: one principal parent, at most two others, or a root with none ----
principal, other, seen = {}, {}, set()
for e in load(os.path.join(D, 'parentage.json')):
    w = 'parentage.json %s -> %s' % (e.get('from'), e.get('to'))
    if e.get('from') not in genres:
        bad('tree', w, 'parent %r does not exist' % e.get('from'))
    if e.get('to') not in genres:
        bad('tree', w, 'child %r does not exist' % e.get('to'))
    if (e.get('from'), e.get('to')) in seen:
        bad('tree', w, 'line stored twice')
    seen.add((e.get('from'), e.get('to')))
    if e.get('from') == e.get('to'):
        bad('tree', w, 'a genre cannot be its own parent')
    if e.get('kind') == 'principal':
        principal.setdefault(e.get('to'), []).append(e.get('from'))
    elif e.get('kind') == 'other':
        other.setdefault(e.get('to'), []).append(e.get('from'))
    else:
        bad('tree', w, 'kind %r is not principal or other' % e.get('kind'))
for g in genres:
    p, o = principal.get(g, []), other.get(g, [])
    if len(p) > 1:
        bad('tree', 'genre ' + g, 'has %d principal parents' % len(p))
    if not p and o:
        bad('tree', 'genre ' + g, 'has other parents but no principal parent')
    if len(o) > 2:
        bad('tree', 'genre ' + g, 'has %d other parents (at most two)' % len(o))

# ---- presence ----
for p in load(os.path.join(D, 'presence.json')):
    w = 'presence.json %s %s' % (p.get('genre'), p.get('place'))
    if p.get('genre') not in genres:
        bad('reference', w, 'genre does not exist')
    if p.get('place') not in countries and p.get('place') not in regions:
        bad('reference', w, 'place is neither a country nor a region')
    if p.get('kind') not in ('origin', 'peak', 'later'):
        bad('presence', w, 'kind %r' % p.get('kind'))

# ---- songs and releases: credits ----
CREDIT_ROLES = {'main', 'featured', 'with'}
# Artist records that no song or release pointed at before credits were split (23 November 2026): none.
KNOWN_ORPHANS = set()
pointed = set()
for k, r in list(songs.items()) + list(releases.items()):
    cs = r.get('credits', [])
    if not cs:
        bad('credits', k, 'no credited artist')
    for c in cs:
        a = c.get('artist') if isinstance(c, dict) else c
        pointed.add(a)
        if a not in artists:
            bad('reference', k, 'artist %r in credits does not exist' % a)
        if isinstance(c, dict) and c.get('role') not in CREDIT_ROLES:
            bad('credit role', k, 'role %r is not main, featured or with' % c.get('role'))
    if len(cs) > 1 and not r.get('credit_text'):
        bad('credits', k, 'several credited artists but no credit_text')
for a in artists:
    if a not in pointed and a not in KNOWN_ORPHANS:
        bad('orphan artist', a, '%r is credited on no song or release' % artists[a].get('name'))
for k, r in list(songs.items()) + list(releases.items()):
    if 'genre' in r and r['genre'] not in genres:
        bad('reference', k, 'genre %r does not exist' % r['genre'])
    for g in r.get('also', []):
        if g not in genres:
            bad('reference', k, 'genre %r in also does not exist' % g)
    if len(r.get('also', [])) > 2:
        bad('song genres', k, 'more than two genres in also')
    if 'genre' in r and r.get('genre_basis') not in ('chosen for the genre', 'sourced', 'judged'):
        bad('song genres', k, 'genre_basis %r' % r.get('genre_basis'))

# ---- scopes ----
G_SCOPE = re.compile(r'^g:(.+)$')
C_SCOPE = re.compile(r'^c:([A-Z]{2}):(\d{3}0s|\d{4})$')


def scope_ok(sid, where):
    m = G_SCOPE.match(sid or '')
    if m:
        if m.group(1) not in genres:
            bad('scope id', where, '%r names no genre' % sid)
        return 'g'
    m = C_SCOPE.match(sid or '')
    if m:
        if m.group(1) not in countries:
            bad('scope id', where, '%r names no country' % sid)
        return 'c'
    bad('scope id', where, '%r is not g:<genre> or c:<ISO>:<year> or c:<ISO>:<decade>s' % sid)


def decade_of(sid):
    y = sid.split(':')[2]
    return y[:-1] if y.endswith('s') else str(int(y) // 10 * 10)


scope_ids = set()
for p in sorted(glob.glob(os.path.join(D, 'scopes', 'g', '*.json')) + glob.glob(os.path.join(D, 'scopes', 'c', '*', '*.json'))):
    for r in load(p):
        sid, w = r.get('id'), rel(p)
        kind = scope_ok(sid, w)
        if sid in scope_ids:
            bad('duplicate id', w, sid)
        scope_ids.add(sid)
        if kind == 'g' and os.path.basename(p) != sid[2:] + '.json':
            bad('scope placement', w, '%s belongs in scopes/g/%s.json' % (sid, sid[2:]))
        if kind == 'c' and rel(p) != os.path.join('scopes', 'c', sid.split(':')[1], decade_of(sid) + '.json'):
            bad('scope placement', w, '%s is in the wrong file' % sid)
        if r.get('fold') is not None and r['fold'] not in genres:
            bad('reference', w, 'fold %r does not exist' % r['fold'])
        if r.get('passes') and not r.get('size'):
            bad('scope size', w, '%s records research passes but no size estimate' % sid)

# ---- links ----
chosen = {}         # song -> genres where it is intro, peak or reference
for p in sorted(glob.glob(os.path.join(D, 'links', 'g', '*.json')) + glob.glob(os.path.join(D, 'links', 'c', '*', '*.json'))):
    w = rel(p)
    for l in load(p):
        sid = l.get('scope')
        kind = scope_ok(sid, w)
        if kind == 'g' and os.path.basename(p) != sid[2:] + '.json':
            bad('link placement', w, 'link to %s belongs in links/g/%s.json' % (sid, sid[2:]))
        if kind == 'c' and w != os.path.join('links', 'c', sid.split(':')[1], decade_of(sid) + '.json'):
            bad('link placement', w, 'link to %s is in the wrong file' % sid)
        role = l.get('role')
        if role == 'album':
            if l.get('release') not in releases:
                bad('reference', w, 'release %r does not exist' % l.get('release'))
        elif l.get('song') not in songs:
            bad('reference', w, 'song %r does not exist' % l.get('song'))
        if kind == 'g' and role not in GENRE_ROLES or kind == 'c' and role not in PLACE_ROLES:
            bad('link role', w, 'role %r is not allowed for %s' % (role, sid))
        if role == 'near miss' and l.get('belongs_to') not in genres:
            bad('reference', w, 'near miss belongs to %r, which does not exist' % l.get('belongs_to'))
        for e in l.get('evidence', []):
            if e not in evidence:
                bad('reference', w, 'evidence %r does not exist' % e)
        if kind == 'g' and role in ('intro', 'peak', 'reference'):
            chosen.setdefault(l.get('song'), set()).add(sid[2:])

# ---- evidence: every id named exists; a checked record says what was checked where ----
for g in genres.values():
    for e in (g.get('definition') or {}).get('evidence', []):
        if e not in evidence:
            bad('reference', 'genres.json ' + g['id'], 'definition evidence %r does not exist' % e)
for k, r in evidence.items():
    if 'check' in r and not (r.get('text') and r.get('url')):
        bad('evidence', k, 'has a check but no text or no url')

# ---- a song's principal genre is backed by its genre's playlist ----
for k, s in songs.items():
    if 'genre' in s and s.get('genre_basis') == 'chosen for the genre' and s['genre'] not in chosen.get(k, set()):
        bad('song genres', k, 'genre %r is set, but the song has no intro, peak or reference link to g:%s' % (s['genre'], s['genre']))

# ---- the page's data can still be made ----
try:
    sys.path.insert(0, os.path.join(ROOT, 'tools'))
    from legacy_data import legacy_data
    legacy_data(D)
except Exception as e:                 # noqa: BLE001 - any failure here is a breach
    breaches.append('legacy shape: tools/legacy_data.py failed: %r' % e)

for m in known:
    print('known fault (inventory):', m)
for m in breaches:
    print('BREACH', m)
print('%d songs, %d artists, %d releases, %d evidence, %d genres, %d scopes: %s' % (
    len(songs), len(artists), len(releases), len(evidence), len(genres), len(scope_ids),
    'ok' if not breaches else '%d breaches' % len(breaches)))
sys.exit(1 if breaches else 0)
