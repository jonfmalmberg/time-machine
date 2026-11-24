#!/usr/bin/env python3
"""The master-table step: put a helper's genre hand-back into data/ in the new model.

  python3 tools/ingest.py work/<folder>            prints what it would do, writes nothing
  python3 tools/ingest.py work/<folder> --write    writes it
  python3 tools/ingest.py work/<folder> --write --replace
                                                   also rewrites genres that already have a definition,
                                                   a scope or links (otherwise they are refused)

Reads from the folder: defs.add.json and playlists.add.json (the old shape helpers hand back),
sizes.json, sources.json (each claim: artist, title, url, quote, read) and the evidence check of those
claims (evidence-check.lead.json if present, else evidence-check.json). Nothing is fetched again.

What is ingested (the owner's rule: nothing enters the data as sourced unless the check script found
its string on its page):
- A song, album or near miss is verified when at least one claim of its genre names it (the claim's
  artist and title, trimmed and case-folded, equal the entry's) and that claim's check result is
  `found`. Everything else is left out and listed.
- A definition goes in when at least one of its `def` claims is `found`; only found claims are kept
  as its evidence.
- Songs, artists and releases are matched against the master table by exact credit text and exact
  title; a match reuses the key, otherwise a key is minted (seeded, never colliding). A credit is
  never split here: a new artist whose name holds a joiner is marked `unsplit`.
- One evidence record per distinct (address, string), with the date of the check.
- Playlist status: the hand-back's, except that a `full` list left with fewer than FULL_MIN playlist
  songs (intro and peak) becomes `thin`, and one left with none becomes `none`. FULL_MIN is the
  convention of the data: every `full` list on file has 12 or more playlist songs, and the research
  card says "Full: 12 or more songs".

Running it twice changes nothing: the second run finds every record it would make already there.
"""
import argparse, datetime, glob, hashlib, json, os, random, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'data')
sys.path.insert(0, os.path.join(ROOT, 'tools'))
from split_credits import has_joiner, B32          # noqa: E402  the same joiner rule and key alphabet

FULL_MIN = 12
BASIS = 'chosen for the genre'


def load(p):
    with open(p, encoding='utf-8') as f:
        return json.load(f)


def line(r):
    return json.dumps(r, ensure_ascii=False, separators=(',', ':'))


def as_text(recs):
    return '[\n' + ',\n'.join(line(r) for r in recs) + '\n]\n'


def records(folder):
    out = []
    for p in sorted(glob.glob(os.path.join(D, folder, '*.json'))):
        out += load(p)
    return out


def fold(s):
    return (s or '').strip().casefold()


def check_date(path):
    """The day the check was run: the commit date of the check file, else the file's own date."""
    try:
        out = subprocess.run(['git', 'log', '-1', '--format=%cs', '--', path], cwd=ROOT,
                             capture_output=True, text=True, timeout=20).stdout.strip()
        if out:
            return out
    except Exception:
        pass
    return datetime.date.fromtimestamp(os.path.getmtime(path)).isoformat()


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('folder')
    ap.add_argument('--write', action='store_true')
    ap.add_argument('--replace', action='store_true')
    a = ap.parse_args()
    W = os.path.abspath(a.folder)
    name = os.path.basename(W.rstrip('/'))
    defs = load(os.path.join(W, 'defs.add.json'))
    pls = load(os.path.join(W, 'playlists.add.json'))
    sizes = load(os.path.join(W, 'sizes.json'))
    sources = load(os.path.join(W, 'sources.json'))
    chk_path = next((p for p in (os.path.join(W, 'evidence-check.lead.json'), os.path.join(W, 'evidence-check.json'))
                     if os.path.exists(p)), None)
    if not chk_path:
        sys.exit('no evidence check in %s' % W)
    checks = load(chk_path)
    cdate = check_date(chk_path)
    pass_date = name[:10]
    by = 'helper/' + name.lower()
    result = {}
    for c in checks:
        lst = sources.get(c['scope'], [])
        claim = lst[c['n']] if c['n'] < len(lst) else None
        if claim is None or claim.get('url') != c.get('url') or (claim.get('quote') or '') != (c.get('quote') or ''):
            sys.exit('the evidence check does not match sources.json at %s #%d' % (c['scope'], c['n']))
        result[(c['scope'], c['n'])] = c

    # ---- the master table as it stands ----
    genres = load(os.path.join(D, 'genres.json'))
    G = {g['id']: g for g in genres}
    songs = records('songs')
    artists = records('artists')
    evidence = records('evidence')
    releases = load(os.path.join(D, 'releases.json'))
    all_keys = {r['id'] for r in songs + artists + evidence + releases}
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

    song_by_pair, rel_by_pair = {}, {}
    for r in sorted(songs, key=lambda r: r['id']):
        song_by_pair.setdefault((credit_of(r), r['title']), r['id'])
    for r in sorted(releases, key=lambda r: r['id']):
        rel_by_pair.setdefault((credit_of(r), r['title']), r['id'])
    ev_by_pair = {}
    for r in sorted(evidence, key=lambda r: r['id']):
        if 'text' in r:
            ev_by_pair.setdefault((r['url'], r['text']), r['id'])
    song_rec = {r['id']: r for r in songs}

    seed = int(hashlib.sha256(name.encode()).hexdigest()[:12], 16)
    rng = random.Random(seed)

    def mint(prefix):
        while True:
            k = prefix + ''.join(rng.choice(B32) for _ in range(10))
            if k not in all_keys:
                all_keys.add(k)
                return k

    # ---- 1. decide, per genre, what is verified ----
    plan = {}
    problems = []
    for g in defs:
        if g not in G:
            problems.append('%s: not a genre in data/genres.json' % g)
            continue
        if g not in pls or g not in sizes or g not in sources:
            problems.append('%s: missing from playlists.add.json, sizes.json or sources.json' % g)
            continue
        d, p, claims = defs[g], pls[g], sources[g]
        named = {}
        for i, c in enumerate(claims):
            named.setdefault((fold(c.get('artist')), fold(c.get('title'))), []).append(i)
        songs_here = p['intro'] + p['peak']
        yrs = p.get('yrs')
        items = []          # (role, artist, title, year, written, extra)
        for j, (ar, t) in enumerate(songs_here):
            role = 'intro' if j < len(p['intro']) else 'peak'
            yy = yrs[j] if yrs and j < len(yrs) and yrs[j] else None     # a list of years may have gaps: a gap is 'not given'
            items.append((role, ar, t, yy[0] if yy else Ellipsis, yy[1] if yy else Ellipsis, None))
        for ar, t, y in d['fits']:
            items.append(('reference', ar, t, y, Ellipsis, None))
        for ar, t, y, b, why in d['near']:
            items.append(('near miss', ar, t, y, Ellipsis, (b, why)))
        for ar, t in p['albums']:
            items.append(('album', ar, t, Ellipsis, Ellipsis, None))
        kept, left = [], []
        for it in items:
            role, ar, t = it[:3]
            idx = named.get((fold(ar), fold(t)), [])
            found = [i for i in idx if result.get((g, i), {}).get('result') == 'found']
            if not idx:
                left.append((it, 'no claim in sources.json names it'))
            elif not found:
                left.append((it, 'its claims were not found on their pages (%s)' % '; '.join(
                    '%s: %s' % (result.get((g, i), {}).get('result', 'not checked'), result.get((g, i), {}).get('why', ''))
                    for i in idx)))
            elif role == 'near miss' and it[5][0] not in G:
                left.append((it, 'near miss belongs to %r, which is not a genre' % it[5][0]))
            else:
                kept.append((it, found))
        dclaims = [i for i, c in enumerate(claims) if c.get('kind') == 'def']
        dfound = [i for i in dclaims if result.get((g, i), {}).get('result') == 'found']
        plan[g] = dict(kept=kept, left=left, dclaims=dclaims, dfound=dfound, items=items)
    if problems:
        sys.exit('\n'.join(problems))

    # ---- 2. songs, artists, releases: reuse or mint (in a fixed order, so keys are reproducible) ----
    new_artists, new_songs, new_releases = [], [], []
    reused_songs, reused_releases = set(), set()

    def artist_id(credit):
        if credit not in artist_by_name:
            rec = {'id': mint('a_'), 'name': credit}
            if has_joiner(credit):
                rec['unsplit'] = True
            new_artists.append(rec)
            artist_by_name[credit] = rec['id']
            aname[rec['id']] = credit
        return artist_by_name[credit]

    def settle(vals):
        got = {v for v in vals if v is not None and v is not Ellipsis}
        return got.pop() if len(got) == 1 else None

    mentions = {}           # (artist, title) -> {'years': [], 'written': [], 'chosen': set()}
    for g in plan:
        for (role, ar, t, y, w, extra), _ in plan[g]['kept']:
            if role == 'album':
                continue
            m = mentions.setdefault((ar, t), {'years': [], 'written': [], 'chosen': set()})
            m['years'].append(y)
            m['written'].append(w)
            if role in ('intro', 'peak', 'reference'):
                m['chosen'].add(g)
    song_year, song_written = {}, {}
    for g in plan:
        for (role, ar, t, y, w, extra), _ in plan[g]['kept']:
            if role == 'album':
                if (ar, t) not in rel_by_pair:
                    rec = {'id': mint('r_'), 'title': t, 'credits': [artist_id(ar)]}
                    new_releases.append(rec)
                    rel_by_pair[(ar, t)] = rec['id']
                elif rel_by_pair[(ar, t)] not in {r['id'] for r in new_releases}:
                    reused_releases.add(rel_by_pair[(ar, t)])
                continue
            if (ar, t) in song_by_pair:
                sid = song_by_pair[(ar, t)]
                if sid not in {r['id'] for r in new_songs}:
                    reused_songs.add(sid)
                continue
            m = mentions[(ar, t)]
            rec = {'id': mint('s_'), 'title': t, 'credits': [{'artist': artist_id(ar), 'role': 'main'}]}
            yr, wr = settle(m['years']), settle(m['written'])
            if yr is not None:
                rec['released'] = {'year': yr}
            if wr is not None:
                rec['written'] = wr
            if len(m['chosen']) == 1:
                rec['genre'] = next(iter(m['chosen']))
                rec['genre_basis'] = BASIS
            new_songs.append(rec)
            song_by_pair[(ar, t)] = rec['id']
            song_rec[rec['id']] = rec

    # ---- 3. evidence: one record per distinct (address, string) ----
    new_evidence = []
    ev_title = {}
    for g in plan:
        for i, c in enumerate(sources[g]):
            if c.get('kind') in ('def', 'size') and c.get('title'):
                ev_title.setdefault((c['url'], c['quote']), c['title'])

    def evidence_id(g, i):
        c = sources[g][i]
        k = (c['url'], c['quote'])
        if k not in ev_by_pair:
            rec = {'id': mint('e_'), 'url': c['url']}
            if k in ev_title:
                rec['title'] = ev_title[k]
            rec.update({'text': c['quote'], 'read': c.get('read'), 'check': {'result': 'found', 'date': cdate}})
            new_evidence.append(rec)
            ev_by_pair[k] = rec['id']
        else:
            e = next((r for r in new_evidence if r['id'] == ev_by_pair[k]), None)
            if e is not None and c.get('read') and (not e.get('read') or c['read'] < e['read']):
                e['read'] = c['read']
        return ev_by_pair[k]

    # ---- 4. links, scopes, definitions ----
    out_links, out_scopes, out_defs = {}, {}, {}
    for g in plan:
        P, sc = plan[g], 'g:' + g
        L = []
        for want in ('intro', 'peak', 'reference', 'near miss', 'album'):
            for (role, ar, t, y, w, extra), found in P['kept']:
                if role != want:
                    continue
                ev = []
                for i in found:
                    e = evidence_id(g, i)
                    if e not in ev:
                        ev.append(e)
                if role == 'album':
                    L.append({'release': rel_by_pair[(ar, t)], 'scope': sc, 'role': 'album', 'evidence': ev, 'pass': 1})
                    continue
                sid = song_by_pair[(ar, t)]
                s = song_rec[sid]
                rec = {'song': sid, 'scope': sc, 'role': role}
                if y is not Ellipsis and y != (s.get('released') or {}).get('year'):
                    rec['released'] = y
                if w is not Ellipsis and w != s.get('written'):
                    rec['written'] = w
                if role == 'near miss':
                    rec['belongs_to'], rec['reason'] = extra
                rec['evidence'] = ev
                rec['pass'] = 1
                L.append(rec)
        out_links[g] = L
        n_pl = sum(1 for l in L if l['role'] in ('intro', 'peak'))
        status = pls[g]['status']
        if n_pl == 0:
            status = 'none'
        elif status == 'full' and n_pl < FULL_MIN:
            status = 'thin'
        srec = {'id': sc, 'status': status}
        if pls[g].get('note'):
            srec['note'] = pls[g]['note']
        if pls[g].get('fold') is not None:
            srec['fold'] = pls[g]['fold']
        if 'yrs' not in pls[g]:
            srec['years_listed'] = False
        sz = sizes[g]
        srec['size'] = {k: sz[k] for k in ('low', 'high', 'core', 'basis', 'confidence') if k in sz}
        srec['passes'] = [{'n': 1, 'date': pass_date, 'by': by, 'added': len(L)}]
        out_scopes[g] = srec
        if P['dfound']:
            d = defs[g]
            dev = []
            for i in P['dfound']:
                e = evidence_id(g, i)
                if e not in dev:
                    dev.append(e)
            out_defs[g] = {'window': d['window'], 'sound': d['sound'], 'markers': d['markers'], 'evidence': dev}

    # ---- 5. compare with what is there: unchanged, new, or refused ----
    status_of = {}
    for g in plan:
        lp = os.path.join(D, 'links', 'g', g + '.json')
        sp = os.path.join(D, 'scopes', 'g', g + '.json')
        have = ('definition' in G[g], os.path.exists(lp), os.path.exists(sp))
        same = (G[g].get('definition') == out_defs.get(g) and os.path.exists(lp) and load(lp) == out_links[g]
                and os.path.exists(sp) and load(sp) == [out_scopes[g]])
        status_of[g] = 'unchanged' if same else ('replace' if any(have) else 'new')
    refused = [g for g in plan if status_of[g] == 'replace' and not a.replace]

    # ---- report ----
    def label(it):
        role, ar, t, y = it[:4]
        return '%-9s %s - %s%s' % (role, ar, t, '' if y in (None, Ellipsis) else ' (%s)' % y)
    print('Hand-back %s; evidence check %s (dated %s)' % (os.path.relpath(W, ROOT), os.path.basename(chk_path), cdate))
    for g in plan:
        P = plan[g]
        n_items = sum(1 for it in P['items'] if it[0] != 'album')
        n_kept = sum(1 for (it, _) in P['kept'] if it[0] != 'album')
        alb = sum(1 for it in P['items'] if it[0] == 'album')
        alb_kept = sum(1 for (it, _) in P['kept'] if it[0] == 'album')
        n_pl = sum(1 for l in out_links[g] if l['role'] in ('intro', 'peak'))
        print('\n%s [%s]: song entries handed back %d, ingested %d; albums %d, ingested %d; playlist songs %d; status %s -> %s; '
              'definition %s (%d of %d claims found)' % (
                  g, status_of[g], n_items, n_kept, alb, alb_kept, n_pl, pls[g]['status'], out_scopes[g]['status'],
                  'in' if g in out_defs else 'LEFT OUT', len(P['dfound']), len(P['dclaims'])))
        for it, why in P['left']:
            print('  left out: %s: %s' % (label(it), why))
    nonfound = [(g, i) for g in plan for i in range(len(sources[g])) if result.get((g, i), {}).get('result') != 'found']
    print('\nclaims not found: %d of %d' % (len(nonfound), sum(len(sources[g]) for g in plan)))
    gen_new = [s for s in new_songs if 'genre' not in s]
    print('new songs %d (%d without a genre: near misses or chosen for several genres), reused songs %d, new artists %d '
          '(%d unsplit), new releases %d, reused releases %d, new evidence %d' % (
              len(new_songs), len(gen_new), len(reused_songs), len(new_artists), sum(1 for r in new_artists if r.get('unsplit')),
              len(new_releases), len(reused_releases), len(new_evidence)))
    for sid in sorted(reused_songs):
        s = song_rec[sid]
        if s.get('genre') and s['genre'] not in {g for g in plan if any(l['song'] == sid and l['role'] in ('intro', 'peak', 'reference') for l in out_links[g] if 'song' in l)}:
            print('  reused song %s %r has principal genre %r, kept' % (sid, s['title'], s['genre']))
    if refused:
        print('\nREFUSED (already has a definition, scope or links; use --replace): ' + ', '.join(refused))
        sys.exit(2)
    todo = [g for g in plan if status_of[g] != 'unchanged']
    if not todo and not (new_songs or new_artists or new_releases or new_evidence):
        print('\nNothing to do: everything is already in the data.')
        return
    if not a.write:
        print('\nDry run: nothing written. Add --write to write.')
        return

    # ---- 6. write ----
    # A genre rewritten with --replace: songs that were chosen for it and are no longer linked lose that genre.
    replaced_links = set()
    for g in todo:
        lp = os.path.join(D, 'links', 'g', g + '.json')
        if os.path.exists(lp):
            replaced_links |= {l['song'] for l in load(lp) if 'song' in l and l['role'] in ('intro', 'peak', 'reference')}
    still = {(l['song'], g) for g in todo for l in out_links[g] if 'song' in l and l['role'] in ('intro', 'peak', 'reference')}
    all_songs = songs + new_songs
    for s in all_songs:
        if s['id'] in replaced_links and s.get('genre') in todo and (s['id'], s['genre']) not in still and s.get('genre_basis') == BASIS:
            s.pop('genre'); s.pop('genre_basis')

    def write_split(folder, recs):
        by_c = {}
        for r in recs:
            by_c.setdefault(r['id'][2:3], []).append(r)
        for c, rs in by_c.items():
            p = os.path.join(D, folder, c + '.json')
            txt = as_text(sorted(rs, key=lambda r: r['id']))
            if not os.path.exists(p) or open(p, encoding='utf-8').read() != txt:
                with open(p, 'w', encoding='utf-8') as f:
                    f.write(txt)

    write_split('songs', all_songs)
    write_split('artists', artists + new_artists)
    write_split('evidence', evidence + new_evidence)
    with open(os.path.join(D, 'releases.json'), 'w', encoding='utf-8') as f:
        f.write(as_text(sorted(releases + new_releases, key=lambda r: r['id'])))
    for g in todo:
        with open(os.path.join(D, 'links', 'g', g + '.json'), 'w', encoding='utf-8') as f:
            f.write(as_text(out_links[g]))
        with open(os.path.join(D, 'scopes', 'g', g + '.json'), 'w', encoding='utf-8') as f:
            f.write(as_text([out_scopes[g]]))
    for i, rec in enumerate(genres):
        g = rec['id']
        if g not in todo:
            continue
        out = {}
        for k, v in rec.items():
            if k == 'definition':
                continue
            out[k] = v
            if k == 'origin' and g in out_defs:
                out['definition'] = out_defs[g]
        genres[i] = out
    with open(os.path.join(D, 'genres.json'), 'w', encoding='utf-8') as f:
        f.write(as_text(genres))
    print('\nWritten: %s' % ', '.join(todo))


if __name__ == '__main__':
    main()
