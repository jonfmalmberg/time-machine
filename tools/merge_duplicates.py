#!/usr/bin/env python3
"""Merge duplicate song records (DECISIONS.md D14).

Two song records are the same song when they have the same title (ignoring case, punctuation and a
"feat. ..." note in the title), the same main artists and the same release year, and their featured
artists do not contradict each other (equal, or one record names none). Different featured line-ups
are different recordings and stay apart. The record kept is the one with the fuller credit, then the
one with more links; every link of the others is pointed at it, and link rows that become identical
are dropped.

  python3 tools/merge_duplicates.py            report only
  python3 tools/merge_duplicates.py --write    change data/
`find_groups` is also used by tests/data.py, which fails when a duplicate exists.
"""
import collections, glob, json, os, re, sys, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'data')


def read(path):
    out = []
    for line in open(path, encoding='utf-8'):
        t = line.strip().rstrip(',')
        if t.startswith('{'):
            out.append(json.loads(t))
    return out


def write(path, rows):
    with open(path, 'w', encoding='utf-8') as f:
        f.write('[\n' + ',\n'.join(json.dumps(r, ensure_ascii=False, separators=(',', ':')) for r in rows) + '\n]\n')


def title_key(t):
    t = unicodedata.normalize('NFKC', t).casefold()
    t = re.sub(r'[\(\[]\s*(feat|ft|featuring|with)\b[^\)\]]*[\)\]]', '', t)
    t = re.sub(r'\s+(feat\.?|ft\.?|featuring)\s+.*$', '', t)
    return re.sub(r'[^\w]+', '', t, flags=re.UNICODE)


def roles(song):
    main = frozenset(c['artist'] for c in song.get('credits', []) if c.get('role', 'main') == 'main')
    other = frozenset(c['artist'] for c in song.get('credits', []) if c.get('role', 'main') != 'main')
    return main, other


def find_groups(songs):
    """songs: list of song records. Returns lists of ids that are one song, each with 2 or more ids."""
    buckets = collections.defaultdict(list)
    for s in songs:
        main, _ = roles(s)
        k = title_key(s.get('title', ''))
        if not k or not main:
            continue
        buckets[(k, main, (s.get('released') or {}).get('year'))].append(s)
    groups = []
    for same in buckets.values():
        if len(same) < 2:
            continue
        # within a bucket, records whose featured artists agree (or one has none) belong together
        feats = collections.defaultdict(list)
        for s in same:
            feats[roles(s)[1]].append(s)
        named = [f for f in feats if f]
        if len(named) <= 1:
            groups.append([s['id'] for s in same])
        else:
            for f in named:
                if len(feats[f]) > 1:
                    groups.append([s['id'] for s in feats[f]])
    return groups


def main():
    do = '--write' in sys.argv
    song_files = sorted(glob.glob(os.path.join(DATA, 'songs', '*.json')))
    link_files = sorted(glob.glob(os.path.join(DATA, 'links', '**', '*.json'), recursive=True))
    songs = {p: read(p) for p in song_files}
    by_id = {s['id']: s for rows in songs.values() for s in rows}
    links = {p: read(p) for p in link_files}
    n_links = collections.Counter(l['song'] for rows in links.values() for l in rows if l.get('song'))
    groups = find_groups(list(by_id.values()))
    to = {}
    for g in groups:
        keep = max(g, key=lambda i: (len(by_id[i].get('credits', [])), n_links[i], bool(by_id[i].get('genre')), i))
        k = by_id[keep]
        for i in g:
            if i == keep:
                continue
            to[i] = keep
            for field, value in by_id[i].items():        # keep what only the dropped record knew
                if field not in k and field not in ('id', 'credits', 'credit_text', 'title'):
                    k[field] = value
    print('duplicate groups:', len(groups), ' records to remove:', len(to), ' of', len(by_id))
    dropped_links = 0
    for p, rows in links.items():
        seen, out, changed = set(), [], False
        for l in rows:
            if l.get('song') in to:
                l['song'] = to[l['song']]; changed = True
            sig = json.dumps(l, sort_keys=True, ensure_ascii=False)
            if sig in seen:
                dropped_links += 1; changed = True
                continue
            seen.add(sig); out.append(l)
        if changed and do:
            write(p, out)
    print('identical link rows dropped:', dropped_links)
    if do:
        for p, rows in songs.items():
            kept = [s for s in rows if s['id'] not in to]
            if len(kept) != len(rows):
                write(p, kept)
        print('written')
    else:
        for g in groups[:8]:
            print('  ', ' | '.join(by_id[i]['title'] + ' [' + (by_id[i].get('credit_text') or '') + '] ' + str((by_id[i].get('released') or {}).get('year')) for i in g))


if __name__ == '__main__':
    main()
