#!/usr/bin/env python3
"""Give chart links that have no recorded origin their role, from the helpers' artist-origin hand-backs.

  python3 tools/apply_origins.py            prints what it would do, writes nothing
  python3 tools/apply_origins.py --write

Reads every work/*/origins.json. For each chart link (one with `quote`) whose role is `charted`: the song's credit
text is looked up; if the first-named artist has a checked origin, the role becomes `home` (that country is among the
artist's) or `foreign`, and the link gets `origin` {artist, country, evidence}. The rule is decision D28, the same one
tools/ingest_charts.py applies at ingest. Links that already have a role are not touched. Running it twice changes nothing.
"""
import argparse, collections, glob, hashlib, json, os, random, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'data')
sys.path.insert(0, os.path.join(ROOT, 'tools'))
from split_credits import B32          # noqa: E402
from ingest_charts import load, as_text, records   # noqa: E402


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--write', action='store_true'); a = ap.parse_args()
    lead = {}
    for p in sorted(glob.glob(os.path.join(ROOT, 'work', '*', 'origins.json'))):
        for o in load(p):
            c = o['credit']
            if c not in lead and c.casefold().startswith(o['artist'].casefold()):
                lead[c] = o
    songs, artists, evidence = records('songs'), records('artists'), records('evidence')
    aname = {r['id']: r['name'] for r in artists}
    credit = {}
    for s in songs:
        cs = s['credits']
        credit[s['id']] = s.get('credit_text') or (aname.get(cs[0]['artist'] if isinstance(cs[0], dict) else cs[0]) if len(cs) == 1 else None)
    all_keys = {r['id'] for r in songs + artists + evidence + load(os.path.join(D, 'releases.json'))}
    ev_by_text = {}
    for r in sorted(evidence, key=lambda r: r['id']):
        if 'text' in r: ev_by_text.setdefault((r['url'], r['text']), r['id'])
    rng = random.Random(int(hashlib.sha256(b'origins').hexdigest()[:12], 16) + len(evidence))

    def mint():
        while True:
            k = 'e_' + ''.join(rng.choice(B32) for _ in range(10))
            if k not in all_keys:
                all_keys.add(k); return k

    new_ev, tally, changed = [], collections.Counter(), []
    for p in sorted(glob.glob(os.path.join(D, 'links', 'c', '*', '*.json'))):
        L, dirty = load(p), False
        for l in L:
            if l.get('role') != 'charted' or 'quote' not in l: continue
            o = lead.get(credit.get(l['song']))
            if not o: tally['still no origin'] += 1; continue
            cs = o['country'] if isinstance(o['country'], list) else [o['country']]
            k = (o['url'], o['quote'])
            if k not in ev_by_text:
                e = {'id': mint(), 'url': o['url'], 'text': o['quote'], 'read': o['read'], 'check': {'result': 'found', 'date': o['read']}}
                new_ev.append(e); ev_by_text[k] = e['id']
            cc = l['scope'].split(':')[1]
            l['role'] = 'home' if cc in cs else 'foreign'
            l['origin'] = {'artist': o['artist'], 'country': cs, 'evidence': ev_by_text[k]}
            tally[l['role']] += 1; dirty = True
        if dirty: changed.append((p, L))
    print(dict(tally), 'new evidence', len(new_ev), 'files', len(changed))
    if not a.write:
        print('Dry run: nothing written. Add --write to write.'); return
    for p, L in changed:
        open(p, 'w', encoding='utf-8').write(as_text(L))
    if new_ev:
        by_c = {}
        for r in evidence + new_ev: by_c.setdefault(r['id'][2:3], []).append(r)
        for c, rs in by_c.items():
            open(os.path.join(D, 'evidence', c + '.json'), 'w', encoding='utf-8').write(as_text(sorted(rs, key=lambda r: r['id'])))
    print('Written.')


if __name__ == '__main__':
    main()
