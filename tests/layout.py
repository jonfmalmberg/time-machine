#!/usr/bin/env python3
"""Check the tree layout method (tools/layout/optimise.py) against the stored layout.

Standard-library Python only. Run: python3 tests/layout.py
1. `check`: the stored layout must be valid by the method's rule, and the method's cost for it must be within
   TOLERANCE of the `cost` stored in data/layout.json (why 0.25%: tools/layout/README.md, "What check showed").
2. `place` on two made-up genres (ids starting with test_): the result must be valid and no existing row may move.
Writes nothing into data/; the test fails if any file there changes while it runs.
"""
import glob, hashlib, json, os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'layout'))
import optimise as O  # noqa: E402

TOLERANCE = 0.0025      # relative; the residual found on 23 Nov 2026 is 0.2354%

TEST_GENRES = [
    # A folk genre inside an existing lane: expected to fit without growing it.
    {'id': 'test_folkvariant', 'name': 'Test folk variant', 'tradition': 'japantrad', 'family': 'eastasia',
     'began': 1650, 'ended': None, 'tier': 3,
     'parents': [{'id': 'minyo', 'kind': 'principal'}, {'id': 'gagaku', 'kind': 'other'}]},
    # A tier-1 genre with a long name in the fullest lane, with the other test genre as a parent.
    {'id': 'test_rockvariant', 'name': 'Test rock variant with a long name', 'tradition': 'globalrock',
     'family': 'rock', 'began': 1968, 'ended': None, 'tier': 1,
     'parents': [{'id': 'yugoslavrock', 'kind': 'principal'}, {'id': 'test_folkvariant', 'kind': 'other'}]},
]

fails = []


def fail(msg):
    fails.append(msg); print('FAIL', msg)


def snapshot():
    h = {}
    for p in sorted(glob.glob(os.path.join(O.DATA, '**', '*'), recursive=True)):
        if os.path.isfile(p):
            with open(p, 'rb') as f:
                h[p] = hashlib.sha256(f.read()).hexdigest()
    return h


before = snapshot()

# 1. check, through the command line as a user would run it
out = subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'layout', 'optimise.py'), 'check', '--json'],
                     capture_output=True, text=True)
if out.returncode not in (0, 1):
    fail('check did not run: ' + out.stderr.strip())
    r = None
else:
    r = json.loads(out.stdout)
if r:
    print('check: valid=%s computed %.4f stored %.4f difference %+.4f (%+.4f%%)'
          % (r['valid'], r['cost'], r['stored_cost'], r['difference'], 100 * r['relative']))
    if not r['valid']:
        fail('stored layout breaks the rule: %r %r' % (r['violations'][:10], r['lanes_too_small']))
    if abs(r['relative']) > TOLERANCE:
        fail('cost differs from the stored cost by %.4f%%, more than %.2f%%' % (100 * r['relative'], 100 * TOLERANCE))

# 2. place two made-up genres
genres, lines = [], []
for t in TEST_GENRES:
    genres.append({k: t[k] for k in ('id', 'name', 'tradition', 'family', 'began', 'ended', 'tier')})
    lines += [{'from': p['id'], 'to': t['id'], 'kind': p['kind']} for p in t['parents']]
p = O.place(O.DATA, genres, lines)
print('place:', json.dumps(p))
if set(p.get('rows', {})) != {g['id'] for g in genres}:
    fail('place did not return a row for each test genre')
if not p.get('valid'):
    fail('placement is not valid')
# re-check independently: a model with the test genres and the returned rows
data = O.read_data(O.DATA)
stored_rows = {g['id']: g['row'] for g in data[0]}
allg = [dict(g) for g in data[0]] + [dict(g, row=p['rows'][g['id']]) for g in genres]
M = O.Model(allg, data[1] + lines, data[2], data[3])
row = [M.by[k]['row'] for k in M.ids]
v = M.violations(row)
if v:
    fail('independent check finds label collisions: %r' % v)
R = dict(data[4]['R']); R.update({t: n for t, (_, n) in p['lanes_grown'].items()})
for t in range(M.nt):
    if max(row[i] for i in M.members[t]) + 1 > R[M.trads[t]]:
        fail('lane %s holds a row beyond its size' % M.trads[t])
moved = [k for k, r0 in stored_rows.items() if M.by[k]['row'] != r0]
if moved:
    fail('existing rows changed: %r' % moved)
for t, (a, b) in p['lanes_grown'].items():
    if b < a:
        fail('lane %s shrank' % t)

if snapshot() != before:
    fail('a file under data/ changed while the test ran')

print('%d failure(s)' % len(fails) if fails else 'layout: all checks passed')
sys.exit(1 if fails else 0)
