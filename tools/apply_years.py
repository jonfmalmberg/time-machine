#!/usr/bin/env python3
"""Write release years that the helpers found on Wikipedia into the songs (decision D18).

  python3 tools/apply_years.py            prints what it would do, writes nothing
  python3 tools/apply_years.py --write

Reads every work/*/years.json: {song, year, basis, url, quote, read}, each already found by the evidence check.
For a song still in the data: `released.year` becomes the year found; the year it replaces, if different, is kept as
`released.was`; `released.check` records {by: 'wikipedia', state: 'checked', year, basis, evidence}. The quote goes in as
an evidence record. A song that already has a Wikipedia check is left alone. Running it twice changes nothing.
"""
import argparse, collections, glob, hashlib, json, os, random, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'data')
sys.path.insert(0, os.path.join(ROOT, 'tools'))
from split_credits import B32                       # noqa: E402
from ingest_charts import load, as_text, records    # noqa: E402


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--write', action='store_true'); a = ap.parse_args()
    songs, evidence = records('songs'), records('evidence')
    S = {s['id']: s for s in songs}
    keys = {r['id'] for r in songs + evidence + records('artists') + load(os.path.join(D, 'releases.json'))}
    ev = {(r['url'], r['text']): r['id'] for r in evidence if 'text' in r}
    rng = random.Random(int(hashlib.sha256(b'years').hexdigest()[:12], 16) + len(evidence))

    def mint():
        while True:
            k = 'e_' + ''.join(rng.choice(B32) for _ in range(10))
            if k not in keys:
                keys.add(k); return k

    t, new_ev = collections.Counter(), []
    for p in sorted(glob.glob(os.path.join(ROOT, 'work', '*', 'years.json'))):
        for y in load(p):
            s = S.get(y['song'])
            if not s: t['song no longer in the data (merged)'] += 1; continue
            rel = s.get('released') or {}
            if (rel.get('check') or {}).get('by') == 'wikipedia': t['already checked'] += 1; continue
            k = (y['url'], y['quote'])
            if k not in ev:
                e = {'id': mint(), 'url': y['url'], 'text': y['quote'], 'read': y['read'], 'check': {'result': 'found', 'date': y['read']}}
                new_ev.append(e); ev[k] = e['id']
            old = rel.get('year')
            new = {'year': y['year'], 'check': {'by': 'wikipedia', 'state': 'checked', 'year': y['year'], 'basis': y['basis'], 'evidence': ev[k]}}
            if old is not None and old != y['year']: new['was'] = old
            s['released'] = new
            t['same year confirmed' if old == y['year'] else 'year added' if old is None else 'year changed by one' if abs(old - y['year']) == 1 else 'year changed by more'] += 1
    print(dict(t), 'new evidence', len(new_ev))
    if not a.write:
        print('Dry run: nothing written. Add --write to write.'); return
    for folder, recs in (('songs', songs), ('evidence', evidence + new_ev)):
        by = {}
        for r in recs: by.setdefault(r['id'][2:3], []).append(r)
        for c, rs in by.items():
            open(os.path.join(D, folder, c + '.json'), 'w', encoding='utf-8').write(as_text(sorted(rs, key=lambda r: r['id'])))
    print('Written.')


if __name__ == '__main__':
    main()
