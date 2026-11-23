#!/usr/bin/env python3
"""The tree layout method of tools/layout/original/opt5.py, reading today's data files.

Standard-library Python only. See tools/layout/README.md for what the method does and what `check` showed.

  python3 tools/layout/optimise.py check [--json]
      Is the stored layout valid by the method's rule, and what does the method's cost function give for it?
  python3 tools/layout/optimise.py place --genre-file new.json
      Best valid rows for new genres, every existing row fixed. Prints JSON; writes nothing.
  python3 tools/layout/optimise.py place --write
      Places the genres in data/genres.json that have no `row` and writes their rows (and any grown lane size
      and the new cost) into data/genres.json and data/layout.json.
  python3 tools/layout/optimise.py optimise --iters N --seeds S [--out file.json]
      The full search of the original. Prints the best result; writes only to --out, never into data/.

`--data DIR` reads (and with --write, writes) another copy of the data folder.

The port keeps the original's names (ids, idx, lane, members, need, E, inc, xs1, ...) so the two can be read
side by side. Differences from the original are listed in the README.
"""
import argparse, json, math, os, random, re, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(ROOT, 'data')

# ---- constants, unchanged from original/opt5.py ----
X0, X1, GAP = 190, 1450, 6
ROW3, HEAD, LANEGAP, PADB = 18, 24, 6, 6           # px at full zoom (s=3); row pitch is 6 base units
ZL = {1: 1.0, 2: 1.8, 3: 3.0}; NEED = {1: 3, 2: 2, 3: 1}   # min row separation when labels of that tier show
T0, T1 = -1500, 2026


def lg(y):
    return math.log((2056 - min(T1, max(T0, y))) / 30)


L0 = lg(T0)


def sx(y):
    return X1 - (lg(y) / L0) * (X1 - X0)


def load(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def dumps(v):
    return json.dumps(v, ensure_ascii=False, separators=(',', ':'))


def write_records(path, records):
    """Top-level array, one compact record per line (the format of data/)."""
    with open(path, 'w', encoding='utf-8') as f:
        f.write('[\n' + ',\n'.join(dumps(r) for r in records) + ('\n' if records else '') + ']\n')


def endyr(g):
    """End year used for a label's extent; the original's endyr().

    The original took the end from the definition window when the genre had one ('onward' means still alive,
    '–1650' gives 1650, anything else falls back to the stored end) and from end_of() otherwise. Today `ended`
    is that stored end; for all 461 genres with a definition it equals the window's reading (checked 23 Nov).
    """
    e = g.get('ended')
    if 'definition' in g:
        w = g['definition']['window']
        if 'onward' in w:
            e = None
        else:
            m = re.search(r'–(\d{4})', w)
            e = int(m.group(1)) if m else g.get('ended')
    return 2026 if e is None else max(e, g['began'])


class Model:
    """Everything the original computed at load time, from today's records."""

    def __init__(self, genres, parentage, traditions, families):
        self.by = by = {g['id']: g for g in genres}
        self.B = B = [f['id'] for f in families]                  # band list in file order, as BANDS was
        self.nb = len(B)
        tfam = {t['id']: t['family'] for t in traditions}
        self.ids = ids = sorted(by, key=lambda k: by[k]['began'])  # stable: file order breaks ties, as N did
        self.idx = idx = {k: i for i, k in enumerate(ids)}
        self.n = n = len(ids)
        self.trads = trads = sorted({by[k]['tradition'] for k in ids})
        self.ti = ti = {t: j for j, t in enumerate(trads)}
        self.nt = nt = len(trads)
        self.lane = lane = [ti[by[k]['tradition']] for k in ids]
        self.tband = [B.index(tfam[t]) for t in trads]
        self.tier = tier = [by[k]['tier'] for k in ids]
        par = {k: [] for k in ids}                                  # principal first, others in file order
        for e in parentage:
            if e['kind'] == 'principal':
                par[e['to']].insert(0, e['from'])
            else:
                par[e['to']].append(e['from'])
        self.par = par
        self.xs1 = xs1 = [sx(by[k]['began']) for k in ids]
        self.xe1 = xe1 = [sx(endyr(by[k])) for k in ids]
        self.lw = lw = [len(by[k]['name']) * 6.3 + 18 for k in ids]

        def interval(i, z):
            return xs1[i] * z, max(xe1[i] * z, xs1[i] * z + lw[i]) + GAP

        self.members = members = [[i for i in range(n) if lane[i] == t] for t in range(nt)]
        self.need = need = {}
        for t in range(nt):
            ms = members[t]
            for a in range(len(ms)):
                for b_ in range(a + 1, len(ms)):
                    i, j = ms[a], ms[b_]; req = 0
                    for L in (1, 2, 3):
                        if tier[i] <= L and tier[j] <= L:
                            p, q = interval(i, ZL[L]), interval(j, ZL[L])
                            if not (q[0] >= p[1] or p[0] >= q[1]): req = max(req, NEED[L])
                    if req: need.setdefault(i, {})[j] = req; need.setdefault(j, {})[i] = req
        self.E = E = []
        for k in ids:
            for pi, p in enumerate(par[k]):
                w = 1.0 if pi == 0 else 0.4
                tp, tk = by[p]['tier'], by[k]['tier']
                w *= 2.0 if (tp == 1 and tk == 1) else (1.4 if max(tp, tk) <= 2 else 1.0)
                E.append((idx[p], idx[k], w))
        self.inc = inc = [[] for _ in range(n)]
        for a, b_, w in E: inc[a].append((b_, w)); inc[b_].append((a, w))
        self.x3 = [v * 3 for v in xs1]

    # ---- the rule ----
    def ok(self, i, r, row):
        for j, req in self.need.get(i, {}).items():
            if row[j] is not None and abs(row[j] - r) < req: return False
        return True

    def violations(self, row):
        out = []
        for i, d in self.need.items():
            for j, req in d.items():
                if i < j and abs(row[i] - row[j]) < req:
                    out.append((self.ids[i], self.ids[j], req, abs(row[i] - row[j])))
        return out

    def greedy(self):
        """The original's starting rows, and the lane sizes (max row + 3) its search ran with."""
        row = [None] * self.n; R = [0] * self.nt
        for t in range(self.nt):
            for i in sorted(self.members[t], key=lambda i: (self.tier[i], self.xs1[i])):
                r = 0
                while not self.ok(i, r, row): r += 1
                row[i] = r
            R[t] = max(row[i] for i in self.members[t]) + 3
        return row, R

    # ---- the cost ----
    def offsets(self, R, border, lorder):
        off = [0] * self.nt; y = 0
        for b in border:
            if not lorder.get(b): continue
            y += HEAD
            for t in lorder[b]: off[t] = y; y += R[t] * ROW3 + LANEGAP
            y += PADB
        return off

    def cost(self, row, R, border, lorder):
        off = self.offsets(R, border, lorder); x3 = self.x3; lane = self.lane
        return sum(w * math.hypot(x3[a] - x3[c], (off[lane[a]] + row[a] * ROW3) - (off[lane[c]] + row[c] * ROW3))
                   for a, c, w in self.E)

    # ---- the stored layout in the model's terms ----
    def stored(self, layout, families):
        row = [self.by[k].get('row') for k in self.ids]
        R = [layout['R'].get(t, 0) for t in self.trads]
        border = [self.B.index(f['id']) for f in sorted(families, key=lambda f: f['order'])]
        lorder = {b: [] for b in range(self.nb)}
        for fam, ts in layout['lanes'].items():
            lorder[self.B.index(fam)] = [self.ti[t] for t in ts if t in self.ti]
        return row, R, border, lorder

    # ---- the search, unchanged from original run() ----
    def run(self, seed, iters):
        n, nt, nb = self.n, self.nt, self.nb
        members, lane, inc, E, x3, ok = self.members, self.lane, self.inc, self.E, self.x3, self.ok
        rnd = random.Random(seed)
        row, R = self.greedy()
        border = list(range(nb)); rnd.shuffle(border)
        lorder = {b: [t for t in range(nt) if self.tband[t] == b] for b in range(nb)}
        for b in lorder: rnd.shuffle(lorder[b])
        offsets = lambda: self.offsets(R, border, lorder)
        off = offsets()
        Y = lambda i: off[lane[i]] + row[i] * ROW3
        el = lambda i, j, yi, yj, w: w * math.hypot(x3[i] - x3[j], yi - yj)
        total = lambda: sum(el(a, c, Y(a), Y(c), w) for a, c, w in E)
        cost = total(); best = (cost, row[:], border[:], {b: v[:] for b, v in lorder.items()})
        Ts, Te = 1200.0, 0.5
        multi = [b for b in range(nb) if len(lorder[b]) > 1]
        for it in range(iters):
            T = Ts * (Te / Ts) ** (it / iters); u = rnd.random()
            if u < 0.06:
                if u < 0.02:
                    prev = border[:]; a, c = rnd.sample(range(nb), 2); border[a], border[c] = border[c], border[a]; lo = None
                else:
                    prev = None; b = rnd.choice(multi); lo = lorder[b]; a, c = rnd.sample(range(len(lo)), 2); lo[a], lo[c] = lo[c], lo[a]
                off = offsets(); nc = total(); dc = nc - cost
                if dc <= 0 or rnd.random() < math.exp(-dc / T): cost = nc
                else:
                    if prev is not None: border[:] = prev
                    else: lo[a], lo[c] = lo[c], lo[a]
                    off = offsets()
            elif u < 0.75:
                i = rnd.randrange(n); t = lane[i]; r0 = row[i]
                if inc[i] and rnd.random() < 0.7:
                    k, _ = rnd.choice(inc[i]); tr = round((Y(k) - off[t]) / ROW3) + rnd.randint(-2, 2)
                else: tr = rnd.randrange(R[t])
                if tr < 0 or tr >= R[t] or tr == r0: continue
                row[i] = None
                if not ok(i, tr, row): row[i] = r0; continue
                row[i] = r0; y0 = Y(i); y1 = off[t] + tr * ROW3
                dc = sum(el(i, k, y1, Y(k), w) - el(i, k, y0, Y(k), w) for k, w in inc[i])
                if dc <= 0 or rnd.random() < math.exp(-dc / T): row[i] = tr; cost += dc
            else:
                t = rnd.randrange(nt); ms = members[t]
                if len(ms) < 2: continue
                i, j = rnd.sample(ms, 2); ri, rj = row[i], row[j]
                if ri == rj: continue
                row[i] = None; row[j] = None
                if not (ok(i, rj, row) and ok(j, ri, row)): row[i], row[j] = ri, rj; continue
                row[i], row[j] = ri, rj
                before = sum(el(i, k, Y(i), Y(k), w) for k, w in inc[i]) + sum(el(j, k, Y(j), Y(k), w) for k, w in inc[j] if k != i)
                row[i], row[j] = rj, ri
                after = sum(el(i, k, Y(i), Y(k), w) for k, w in inc[i]) + sum(el(j, k, Y(j), Y(k), w) for k, w in inc[j] if k != i)
                dc = after - before
                if dc <= 0 or rnd.random() < math.exp(-dc / T): cost += dc
                else: row[i], row[j] = ri, rj
            if cost < best[0] - 1e-6: best = (cost, row[:], border[:], {b: v[:] for b, v in lorder.items()})
        c, row, border, lorder = best
        Rs = R[:]                                    # lane sizes the cost c was measured with
        for t in range(nt):  # drop empty rows only where no separation rule needs them: shift lane down to start at 0
            m = min(row[i] for i in members[t])
            for i in members[t]: row[i] -= m
            R[t] = max(row[i] for i in members[t]) + 1
        return dict(cost=c, row=row, R=R, Rsearch=Rs, border=border, lorder=lorder)


def read_data(D):
    return (load(os.path.join(D, 'genres.json')), load(os.path.join(D, 'parentage.json')),
            load(os.path.join(D, 'traditions.json')), load(os.path.join(D, 'families.json')),
            load(os.path.join(D, 'layout.json')))


# ---------------------------------------------------------------- check
def check(D):
    genres, parentage, traditions, families, layout = read_data(D)
    missing = [g['id'] for g in genres if 'row' not in g]
    if missing:
        sys.exit('genres without a row (run place first): ' + ', '.join(missing))
    M = Model(genres, parentage, traditions, families)
    row, R, border, lorder = M.stored(layout, families)
    viol = M.violations(row)
    _, Rsearch = M.greedy()
    c = M.cost(row, Rsearch, border, lorder)
    c_drawn = M.cost(row, R, border, lorder)
    bad_R = [M.trads[t] for t in range(M.nt) if R[t] < max(row[i] for i in M.members[t]) + 1]
    return dict(genres=M.n, traditions=M.nt, lines=len(M.E),
                pairs=sum(len(d) for d in M.need.values()) // 2,
                valid=not viol and not bad_R, violations=viol, lanes_too_small=bad_R,
                cost=c, stored_cost=layout['cost'], difference=c - layout['cost'],
                relative=(c - layout['cost']) / layout['cost'], cost_drawn=c_drawn)


def print_check(r):
    print('%d genres in %d lanes, %d tree lines, %d label pairs that need separation'
          % (r['genres'], r['traditions'], r['lines'], r['pairs']))
    print('valid by the rule:  %s' % ('yes' if r['valid'] else 'NO'))
    for a, b, req, got in r['violations']:
        print('  %s and %s need %d rows apart, are %d' % (a, b, req, got))
    for t in r['lanes_too_small']:
        print('  lane %s: R smaller than its highest row + 1' % t)
    print('computed cost:      %.10f  (lanes at the sizes the search used: greedy start + 3)' % r['cost'])
    print('stored cost:        %.10f' % r['stored_cost'])
    print('difference:         %+.10f  (%+.4f%%)' % (r['difference'], 100 * r['relative']))
    print('cost as drawn:      %.10f  (lanes at the stored sizes R; for information)' % r['cost_drawn'])


# ---------------------------------------------------------------- place
def place(D, new_genres=None, new_parentage=None, write=False):
    genres, parentage, traditions, families, layout = read_data(D)
    if new_genres is not None:
        have = {g['id'] for g in genres}
        clash = [g['id'] for g in new_genres if g['id'] in have]
        if clash:
            sys.exit('already in data: ' + ', '.join(clash))
        genres = genres + new_genres
        parentage = parentage + new_parentage
    tids = {t['id'] for t in traditions}
    gids = {g['id'] for g in genres}
    todo = [g['id'] for g in genres if 'row' not in g]
    for k in todo:
        g = next(x for x in genres if x['id'] == k)
        if g['tradition'] not in tids or g['tradition'] not in layout['R']:
            sys.exit('%s: tradition %s is not an existing lane (a new lane is not supported)' % (k, g['tradition']))
        for f in ('name', 'began', 'tier'):
            if f not in g: sys.exit('%s: missing %s' % (k, f))
        ps = [e for e in parentage if e['to'] == k]
        if [e['kind'] for e in ps].count('principal') != 1 and ps:
            sys.exit('%s: needs exactly one principal parent' % k)
        if sum(e['kind'] == 'other' for e in ps) > 2:
            sys.exit('%s: at most two other parents' % k)
        miss = [e['from'] for e in ps if e['from'] not in gids]
        if miss: sys.exit('%s: unknown parent %s' % (k, ', '.join(miss)))
    if not todo:
        return dict(rows={}, lanes_grown={}, note='nothing to place')

    M = Model(genres, parentage, traditions, families)
    row, R, border, lorder = M.stored(layout, families)
    fixed_row = row[:]
    new = sorted((M.idx[k] for k in todo), key=lambda i: (M.tier[i], M.xs1[i]))   # the original's start order
    R0 = R[:]
    # cost before: existing genres only, as stored
    old = Model([g for g in genres if g['id'] not in set(todo)],
                [e for e in parentage if e['to'] not in set(todo) and e['from'] not in set(todo)], traditions, families)
    orow, oR, ob, ol = old.stored(layout, families)
    before_drawn = old.cost(orow, oR, ob, ol)
    before_method = old.cost(orow, old.greedy()[1], ob, ol)

    def cost_now():   # only lines whose both ends have a row
        off = M.offsets(R, border, lorder); s = 0.0
        for a, c, w in M.E:
            if row[a] is None or row[c] is None: continue
            s += w * math.hypot(M.x3[a] - M.x3[c], (off[M.lane[a]] + row[a] * ROW3) - (off[M.lane[c]] + row[c] * ROW3))
        return s

    def best_row(i):
        t = M.lane[i]; keep = row[i]; row[i] = None
        cands = [r for r in range(R[t]) if M.ok(i, r, row)]
        grow = None
        if not cands:                    # no valid row in the lane: grow it by as little as possible
            r = R[t]
            while not M.ok(i, r, row): r += 1
            cands = [r]; grow = r + 1
        Rt = R[t]; best = None
        for r in cands:
            row[i] = r
            if grow: R[t] = grow
            c = cost_now()
            R[t] = Rt
            if best is None or c < best[0] - 1e-9: best = (c, r)
        row[i] = keep
        return best[1], grow

    for i in new:                        # first pass in start order, then improve each in turn until stable
        r, grow = best_row(i); row[i] = r
        if grow: R[M.lane[i]] = grow
    for _ in range(20):
        changed = False
        for i in new:
            r0 = row[i]
            r, grow = best_row(i)
            if r != r0:
                row[i] = r; changed = True
                if grow: R[M.lane[i]] = grow
        if not changed: break
    for t in range(M.nt):                # a lane grown earlier may no longer need the extra rows
        if R[t] > R0[t]:
            R[t] = max(R0[t], max(row[i] for i in M.members[t]) + 1)

    viol = M.violations(row)
    assert all(row[i] == fixed_row[i] for i in range(M.n) if M.ids[i] not in set(todo)), 'an existing row moved'
    if viol:
        raise SystemExit('internal error: placement invalid: %r' % viol)
    after_drawn = M.cost(row, R, border, lorder)
    after_method = M.cost(row, M.greedy()[1], border, lorder)
    out = dict(rows={M.ids[i]: row[i] for i in new},
               lanes_grown={M.trads[t]: [R0[t], R[t]] for t in range(M.nt) if R[t] != R0[t]},
               valid=not viol,
               cost=dict(method_before=before_method, method_after=after_method,
                         drawn_before=before_drawn, drawn_after=after_drawn))
    if write:
        if new_genres is not None:
            sys.exit('--write places genres already in data/genres.json; it does not take --genre-file')
        for g in genres:
            if g['id'] in out['rows']: g['row'] = out['rows'][g['id']]
        write_records(os.path.join(D, 'genres.json'), genres)
        for t, (_, r) in out['lanes_grown'].items(): layout['R'][t] = r
        layout['cost'] = after_method
        with open(os.path.join(D, 'layout.json'), 'w', encoding='utf-8') as f:
            f.write('{\n' + ',\n'.join(dumps(k) + ':' + dumps(v) for k, v in layout.items()) + '\n}\n')
        out['written'] = True
    return out


def read_genre_file(path):
    """A list of genres: id, name, tradition, family, began, ended, tier, parents [{id, kind}] with one principal."""
    recs = load(path)
    genres, lines = [], []
    for r in recs:
        g = {k: r[k] for k in ('id', 'name', 'tradition', 'family', 'began', 'ended', 'tier') if k in r}
        if 'definition' in r: g['definition'] = r['definition']
        genres.append(g)
        for p in r.get('parents', []):
            lines.append({'from': p['id'], 'to': r['id'], 'kind': p['kind']})
    return genres, lines


# ---------------------------------------------------------------- optimise
def optimise(D, iters, seeds, out=None):
    genres, parentage, traditions, families, layout = read_data(D)
    M = Model(genres, parentage, traditions, families)
    res = []
    for s in range(seeds):
        t0 = time.time()
        r = M.run(s, iters)
        viol = M.violations(r['row'])
        if viol:
            raise SystemExit('internal error: seed %d produced an invalid layout: %r' % (s, viol[:5]))
        print('seed', s, 'cost %.0f' % r['cost'], 'rows', sum(r['R']), '%.1fs' % (time.time() - t0)); sys.stdout.flush()
        res.append(r)
    res.sort(key=lambda r: r['cost'])
    b = res[0]
    result = dict(cost=b['cost'], row={M.ids[i]: b['row'][i] for i in range(M.n)},
                  bandOrder=[M.B[x] for x in b['border']],
                  laneOrder={M.B[x]: [M.trads[t] for t in b['lorder'][x]] for x in b['border'] if b['lorder'][x]},
                  R={M.trads[t]: b['R'][t] for t in range(M.nt)})
    print('order', result['bandOrder'])
    print('best cost %.4f (stored layout: %.4f)' % (b['cost'], layout['cost']))
    if out:
        if os.path.realpath(out).startswith(os.path.realpath(DATA) + os.sep):
            sys.exit('--out must not be inside data/')
        with open(out, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False)
        print('written', out)
    return result


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--data', default=DATA, help='data folder (default: the repository data/)')
    sub = ap.add_subparsers(dest='cmd', required=True)
    c = sub.add_parser('check'); c.add_argument('--json', action='store_true')
    p = sub.add_parser('place'); p.add_argument('--genre-file'); p.add_argument('--write', action='store_true')
    o = sub.add_parser('optimise'); o.add_argument('--iters', type=int, required=True)
    o.add_argument('--seeds', type=int, default=1); o.add_argument('--out')
    a = ap.parse_args(argv)
    if a.cmd == 'check':
        r = check(a.data)
        if a.json: print(json.dumps(r))
        else: print_check(r)
        return 0 if r['valid'] else 1
    if a.cmd == 'place':
        if a.genre_file:
            if a.write: sys.exit('--write places genres already in data/genres.json; it does not take --genre-file')
            g, l = read_genre_file(a.genre_file)
            r = place(a.data, g, l)
        else:
            r = place(a.data, write=a.write)
        print(json.dumps(r, indent=1, ensure_ascii=False))
        return 0
    if a.cmd == 'optimise':
        optimise(a.data, a.iters, a.seeds, a.out)
        return 0


if __name__ == '__main__':
    sys.exit(main())
