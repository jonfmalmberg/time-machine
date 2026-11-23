#!/usr/bin/env python3
"""Split artist records that hold several credited acts ("A feat. B", "A, B") into one record per act.

The move to the new model (tools/migrate_2026_11_23.py) made one artist record per credit string as
written, each marked `unsplit`. This tool settles them in two steps, with a decision in between:

  python3 tools/split_credits.py propose
      Lists every artist record whose name contains a joiner (` & `, ` and `, feat., ` with `, `,`, `/`,
      ...) to work/2026-11-23-credits/proposals.json, each with a mechanical guess at the parts.

  python3 tools/split_credits.py apply
      Reads work/2026-11-23-credits/decisions.json, one entry per credit string:
        {"name": ..., "decision": "one" | "several" | "unsure", "parts": [{"name", "role"}], "basis": ...}
      For `several`, each part reuses the artist record whose name is exactly equal, or gets a new one;
      every song and release that pointed at the combined record now credits the parts in order with
      their roles and keeps the combined string as `credit_text`; the combined record is removed once
      nothing points at it. Non-joiner records and `one` decisions lose `unsplit`; `unsure` keeps it.
      Re-running it changes nothing.
"""
import glob, json, os, random, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'data')
W = os.path.join(ROOT, 'work', '2026-11-23-credits')
B32 = '0123456789abcdefghjkmnpqrstvwxyz'       # Crockford base 32, lower case
ROLES = ('main', 'featured', 'with')
SEED = 20261123

FEAT = re.compile(r'\s*(?:\(|\[)?\s*\b(?:feat\.?|ft\.|featuring)\s+', re.I)
# Joiners between acts. Order matters only for the mechanical guess.
JOINERS = [
    (re.compile(r' & '), 'main'), (re.compile(r' and ', re.I), 'main'), (re.compile(r' with ', re.I), 'with'),
    (re.compile(r' x ', re.I), 'main'), (re.compile(r' vs\.? ', re.I), 'main'), (re.compile(r' y '), 'main'),
    (re.compile(r' e '), 'main'), (re.compile(r' et '), 'main'), (re.compile(r' und '), 'main'),
    (re.compile(r'\s*,\s*'), 'main'), (re.compile(r'\s*/\s*'), 'main'), (re.compile(r'\s*;\s*'), 'main'),
    (re.compile(r'\s*・\s*'), 'main'), (re.compile(r'\s*、\s*'), 'main'), (re.compile(r'\s*＆\s*'), 'main'),
]
NONLATIN_AMP = re.compile(r'[^\x00-ɏ\s]&[^\x00-ɏ\s]')


def has_joiner(name):
    return bool(FEAT.search(name) or NONLATIN_AMP.search(name) or any(rx.search(name) for rx, _ in JOINERS))


def guess(name):
    """A mechanical guess at the parts: split off feat., then split the rest at every joiner."""
    m = FEAT.search(name)
    head, feat = name, ''
    if m:
        head, feat = name[:m.start()], name[m.end():].strip()
        if m.group(0).strip()[:1] in '([' and feat[-1:] in ')]':
            feat = feat[:-1].strip()        # "(feat. B)": drop only the bracket that feat. opened
    band = r'(?!(?:his|her|their|su|sus|seu|seus)\b)'      # "X and His Orchestra" is one name
    split_rx = re.compile('|'.join([r' & ' + band, r' and ' + band, r' x ', r' vs\.? ', r' y ' + band,
                                    r' e ' + band, r' et ', r' und ', r'\s*,\s*', r'\s*/\s*', r'\s*;\s*',
                                    r'\s*[・、＆]\s*', r'(?<=[^\x00-ɏ\s])&(?=[^\x00-ɏ\s])']), re.I)
    parts = []
    for i, chunk in enumerate(re.split(r' with ' + band, head, flags=re.I)):
        for p in split_rx.split(chunk):
            if p.strip():
                parts.append({'name': p.strip(), 'role': 'main' if i == 0 else 'with'})
    for p in split_rx.split(feat):
        if p.strip():
            parts.append({'name': p.strip(), 'role': 'featured'})
    return parts


def load(p):
    with open(p, encoding='utf-8') as f:
        return json.load(f)


def records(folder):
    out = []
    for p in sorted(glob.glob(os.path.join(D, folder, '*.json'))):
        out += load(p)
    return out


def line(r):
    return json.dumps(r, ensure_ascii=False, separators=(',', ':'))


def write_list(path, recs):
    with open(path, 'w', encoding='utf-8') as f:
        f.write('[\n' + ',\n'.join(line(r) for r in recs) + '\n]\n')


def write_split(folder, recs):
    by = {}
    for r in recs:
        by.setdefault(r['id'][2:3], []).append(r)
    for p in glob.glob(os.path.join(D, folder, '*.json')):
        if os.path.basename(p)[:-5] not in by:
            os.remove(p)
    for c, rs in by.items():
        write_list(os.path.join(D, folder, c + '.json'), sorted(rs, key=lambda r: r['id']))


def propose():
    artists = records('artists')
    out = [{'id': a['id'], 'name': a['name'], 'guess': guess(a['name'])}
           for a in sorted(artists, key=lambda a: a['name']) if has_joiner(a['name'])]
    os.makedirs(W, exist_ok=True)
    write_list(os.path.join(W, 'proposals.json'), out)
    print('%d of %d artist records contain a joiner -> %s' % (len(out), len(artists), os.path.relpath(os.path.join(W, 'proposals.json'), ROOT)))


def apply():
    decisions = {d['name']: d for d in load(os.path.join(W, 'decisions.json'))}
    for d in decisions.values():
        if d['decision'] not in ('one', 'several', 'unsure'):
            sys.exit('bad decision for %r: %r' % (d['name'], d['decision']))
        if d['decision'] == 'several':
            if len(d.get('parts', [])) < 2 or any(p['role'] not in ROLES or not p['name'].strip() for p in d['parts']):
                sys.exit('bad parts for %r' % d['name'])
    for d in decisions.values():
        for p in d.get('parts', []) if d['decision'] == 'several' else []:
            if p['name'] in decisions and decisions[p['name']]['decision'] != 'one':
                sys.exit('part %r of %r is itself decided %r' % (p['name'], d['name'], decisions[p['name']]['decision']))
    artists = records('artists')
    songs = records('songs')
    releases = load(os.path.join(D, 'releases.json'))
    rel_path = os.path.join(D, 'releases.json')
    all_keys = {r['id'] for r in artists + songs + releases} | {r['id'] for r in records('evidence')}
    by_name = {}
    for a in artists:
        by_name.setdefault(a['name'], a)
    rng = random.Random(SEED)

    def new_key():
        while True:
            k = 'a_' + ''.join(rng.choice(B32) for _ in range(10))
            if k not in all_keys:
                all_keys.add(k)
                return k

    # 1. the parts of every `several` decision, in a fixed order so keys are reproducible
    split = {}                  # combined artist id -> [(part id, role)]
    created = 0
    for a in sorted(artists, key=lambda a: a['id']):
        d = decisions.get(a['name'])
        if not d or d['decision'] != 'several' or not has_joiner(a['name']):
            continue
        parts = []
        for p in d['parts']:
            if p['name'] not in by_name:
                rec = {'id': new_key(), 'name': p['name']}
                artists.append(rec)
                by_name[p['name']] = rec
                created += 1
            parts.append((by_name[p['name']]['id'], p['role']))
        split[a['id']] = parts

    # 2. songs and releases
    names = {a['id']: a['name'] for a in artists}
    changed_songs = changed_releases = 0
    def recredit(rec, credits, text):
        """The same record with new credits and credit_text placed right after them."""
        out = {}
        for k, v in rec.items():
            if k == 'credits':
                out['credits'], out['credit_text'] = credits, text
            elif k != 'credit_text':
                out[k] = v
        return out

    for i, s in enumerate(songs):
        cs = s['credits']
        if len(cs) == 1 and cs[0]['artist'] in split:
            songs[i] = recredit(s, [{'artist': k, 'role': r} for k, r in split[cs[0]['artist']]], names[cs[0]['artist']])
            changed_songs += 1
    for i, r in enumerate(releases):
        cs = r['credits']
        if len(cs) == 1 and cs[0] in split:
            releases[i] = recredit(r, [k for k, _ in split[cs[0]]], names[cs[0]])
            changed_releases += 1

    # 3. drop combined records nothing points at; settle the flags
    used = {c['artist'] for s in songs for c in s['credits']} | {k for r in releases for k in r['credits']}
    removed = [k for k in split if k not in used]
    artists = [a for a in artists if a['id'] not in set(removed)]
    # A part named by a `several` decision is one act by that decision ("Mufasa & Hypeman").
    part_names = {p['name'] for d in decisions.values() if d['decision'] == 'several' for p in d['parts']}
    for a in artists:
        d = decisions.get(a['name'])
        settled = (not has_joiner(a['name']) or a['name'] in part_names
                   or (d is not None and d['decision'] == 'one'))
        if settled and a['id'] not in split:
            a.pop('unsplit', None)
        else:
            a['unsplit'] = True

    write_split('artists', artists)
    write_split('songs', songs)
    write_list(rel_path, releases)
    print('parts created %d, combined records removed %d, songs changed %d, releases changed %d, artists now %d'
          % (created, len(removed), changed_songs, changed_releases, len(artists)))


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else ''
    {'propose': propose, 'apply': apply}.get(cmd, lambda: sys.exit(__doc__))()
