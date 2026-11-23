import math, random, sys, json
exec(open('data_ext.py').read())
X0, X1, ROWH, HEAD, PADB, GAP = 190, 1450, 18, 24, 6, 6
ZL = {1: 1.0, 2: 1.8, 3: 3.0}
T0, T1 = -1500, 2026
lg = lambda y: math.log((2056 - min(T1, max(T0, y))) / 30); L0 = lg(T0)
sx = lambda y: X1 - (lg(y) / L0) * (X1 - X0)
by = {n[0]: n for n in N}
B = [b for b, _ in BANDS]; nb = len(B)

def vis_edges(level):
    vis = {k for k in by if TIER[k] <= level}
    E = {}
    def up(child, node, principal, depth):
        for k, p in enumerate(by[node][8]):
            pr = principal and k == 0
            if p in vis:
                w = 1.0 if pr else 0.4
                E[(p, child)] = max(E.get((p, child), 0), w)
            elif depth < 6:
                up(child, p, pr, depth + 1)
    for v in vis: up(v, v, True, 0)
    return vis, E

LANEGAP = 6
def run(level, seed, iters, fixed=None):
    rnd = random.Random(seed)
    z = ZL[level]
    vis, Ed = vis_edges(level)
    ids = sorted(vis, key=lambda k: by[k][4]); idx = {k: i for i, k in enumerate(ids)}; n = len(ids)
    trads = sorted({TRAD_OF[k] for k in ids}); ti = {t: j for j, t in enumerate(trads)}; nt = len(trads)
    lane = [ti[TRAD_OF[k]] for k in ids]
    tband = [B.index(by[TRAD[t][1][0]][3]) for t in trads]
    xs = [sx(by[k][4]) * z for k in ids]
    xe = [max(sx(end_of(k) if end_of(k) is not None else 2026) * z, xs[i] + len(by[k][1]) * 6.3 + 18) for i, k in enumerate(ids)]
    x = xs
    E = [(idx[a], idx[b], wt) for (a, b), wt in Ed.items()]
    inc = [[] for _ in range(n)]
    for a, b_, wt in E: inc[a].append((b_, wt)); inc[b_].append((a, wt))
    ov = lambda i, j: not (xs[j] >= xe[i] + GAP or xs[i] >= xe[j] + GAP)
    members = [[i for i in range(n) if lane[i] == t] for t in range(nt)]
    def minrows(ms):
        ends = []
        for i in sorted(ms, key=lambda i: xs[i]):
            r = next((k for k, e in enumerate(ends) if e + GAP <= xs[i]), None)
            if r is None: ends.append(0); r = len(ends) - 1
            ends[r] = xe[i]
        return len(ends)
    R = [minrows(m) + 1 for m in members]
    row = [0] * n; occ = [[[] for _ in range(R[t])] for t in range(nt)]
    for t in range(nt):
        for i in sorted(members[t], key=lambda i: xs[i]):
            opts = [r for r in range(R[t]) if all(not ov(i, j) for j in occ[t][r])]
            r = rnd.choice(opts); occ[t][r].append(i); row[i] = r
    if fixed:
        border = [B.index(b) for b in fixed['bandOrder']]
        lorder = {B.index(b): [ti[t] for t in ts if t in ti] for b, ts in fixed['laneOrder'].items()}
    else:
        border = list(range(nb)); rnd.shuffle(border)
        lorder = {b: [t for t in range(nt) if tband[t] == b] for b in range(nb)}
        for b in lorder: rnd.shuffle(lorder[b])
    for b in range(nb): lorder.setdefault(b, [])
    def offsets():
        off = [0] * nt; y = 0
        for b in border:
            if not lorder[b]: continue
            y += HEAD
            for t in lorder[b]: off[t] = y; y += R[t] * ROWH + LANEGAP
            y += PADB
        return off
    off = offsets()
    Y = lambda i: off[lane[i]] + row[i] * ROWH
    el = lambda i, j, yi, yj, wt: wt * math.hypot(x[i] - x[j], yi - yj)
    total = lambda: sum(el(a, c, Y(a), Y(c), wt) for a, c, wt in E)
    cost = total(); best = (cost, row[:], border[:], {b: v[:] for b, v in lorder.items()})
    Ts, Te = 400.0 * z, 0.5
    multi = [b for b in range(nb) if len(lorder[b]) > 1]
    for it in range(iters):
        T = Ts * (Te / Ts) ** (it / iters); u = rnd.random()
        if u < 0.06 and not fixed:
            if u < 0.02:
                a, c = rnd.sample(range(nb), 2); border[a], border[c] = border[c], border[a]; undo = lambda: border.__setitem__(slice(None), border_prev)
                border_prev = border[:]; border_prev[a], border_prev[c] = border_prev[c], border_prev[a]
            else:
                if not multi: continue
                b = rnd.choice(multi); lo = lorder[b]; a, c = rnd.sample(range(len(lo)), 2); lo[a], lo[c] = lo[c], lo[a]
                border_prev = None
            off = offsets(); nc = total(); dc = nc - cost
            if dc <= 0 or rnd.random() < math.exp(-dc / T): cost = nc
            else:
                if border_prev is not None: border[:] = border_prev
                else: lo[a], lo[c] = lo[c], lo[a]
                off = offsets()
        elif u < 0.7:
            i = rnd.randrange(n); t = lane[i]; r0 = row[i]
            if inc[i] and rnd.random() < 0.7:
                k, _ = rnd.choice(inc[i]); tr = round((Y(k) - off[t]) / ROWH) + rnd.randint(-2, 2)
            else: tr = rnd.randrange(R[t])
            if tr < 0 or tr >= R[t] or tr == r0: continue
            if any(ov(i, j) for j in occ[t][tr]): continue
            y0 = Y(i); y1 = off[t] + tr * ROWH
            dc = sum(el(i, k, y1, Y(k), wt) - el(i, k, y0, Y(k), wt) for k, wt in inc[i])
            if dc <= 0 or rnd.random() < math.exp(-dc / T):
                occ[t][r0].remove(i); occ[t][tr].append(i); row[i] = tr; cost += dc
        else:
            t = rnd.randrange(nt); ms = members[t]
            if len(ms) < 2: continue
            i, j = rnd.sample(ms, 2); ri, rj = row[i], row[j]
            if ri == rj: continue
            if any(ov(i, k) for k in occ[t][rj] if k != j) or any(ov(j, k) for k in occ[t][ri] if k != i): continue
            before = sum(el(i, k, Y(i), Y(k), wt) for k, wt in inc[i]) + sum(el(j, k, Y(j), Y(k), wt) for k, wt in inc[j] if k != i)
            row[i], row[j] = rj, ri
            after = sum(el(i, k, Y(i), Y(k), wt) for k, wt in inc[i]) + sum(el(j, k, Y(j), Y(k), wt) for k, wt in inc[j] if k != i)
            dc = after - before
            if dc <= 0 or rnd.random() < math.exp(-dc / T):
                occ[t][ri].remove(i); occ[t][rj].remove(j); occ[t][rj].append(i); occ[t][ri].append(j); cost += dc
            else: row[i], row[j] = ri, rj
        if cost < best[0] - 1e-6: best = (cost, row[:], border[:], {b: v[:] for b, v in lorder.items()})
    c, row, border, lorder = best
    for t in range(nt):
        used = sorted({row[i] for i in members[t]}); m = {r: k for k, r in enumerate(used)}
        for i in members[t]: row[i] = m[row[i]]
        R[t] = len(used)
    off = offsets(); c = total()
    return dict(cost=c, row={ids[i]: row[i] for i in range(n)}, bandOrder=[B[b] for b in border],
                laneOrder={B[b]: [trads[t] for t in lorder[b]] for b in border if lorder[b]}, R={trads[t]: R[t] for t in range(nt)},
                edges=[[a, b_, wt] for (a, b_), wt in Ed.items()])

if __name__ == '__main__':
    level = int(sys.argv[1]); iters = int(sys.argv[2]); seeds = int(sys.argv[3])
    fixed = json.load(open('lv3.json')) if level < 3 else None
    res = []
    for s in range(seeds):
        r = run(level, s, iters, fixed); print('level', level, 'seed', s, 'cost %.0f' % r['cost']); sys.stdout.flush(); res.append(r)
    res.sort(key=lambda r: r['cost'])
    json.dump(res[0], open('lv%d.json' % level, 'w'))
    print('order', res[0]['bandOrder'])
