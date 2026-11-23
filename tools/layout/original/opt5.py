# One fixed layout for every zoom level. Rows inside each tradition lane are chosen so that, at the zoom where a
# movement's label appears, it never collides with another visible label. Cost = weighted edge length at full zoom.
import math, random, sys, json, os
exec(open('data_ext.py').read())
if os.path.exists('defs_merged.json'):
    DEF.update(json.load(open('defs_merged.json')))
X0, X1, GAP = 190, 1450, 6
ROW3, HEAD, LANEGAP, PADB = 18, 24, 6, 6         # px at full zoom (s=3); row pitch is 6 base units
ZL = {1: 1.0, 2: 1.8, 3: 3.0}; NEED = {1: 3, 2: 2, 3: 1}   # min row separation when labels of that tier show
T0, T1 = -1500, 2026
lg = lambda y: math.log((2056 - min(T1, max(T0, y))) / 30); L0 = lg(T0)
sx = lambda y: X1 - (lg(y) / L0) * (X1 - X0)
by = {n[0]: n for n in N}
B = [b for b, _ in BANDS]; nb = len(B)
ids = sorted(by, key=lambda k: by[k][4]); idx = {k: i for i, k in enumerate(ids)}; n = len(ids)
trads = sorted({TRAD_OF[k] for k in ids}); ti = {t: j for j, t in enumerate(trads)}; nt = len(trads)
lane = [ti[TRAD_OF[k]] for k in ids]
tband = [B.index(by[TRAD[t][1][0]][3]) for t in trads]
tier = [TIER[k] for k in ids]
def endyr(k):
    e = end_of(k) if k not in DEF else None
    if k in DEF:
        import re
        w = DEF[k]['window']
        if 'onward' in w: e = None
        else:
            m = re.search(r'–(\d{4})', w); e = int(m.group(1)) if m else END.get(k)
    return 2026 if e is None else max(e, by[k][4])
xs1 = [sx(by[k][4]) for k in ids]; xe1 = [sx(endyr(k)) for k in ids]; lw = [len(by[k][1]) * 6.3 + 18 for k in ids]
def interval(i, z): return xs1[i] * z, max(xe1[i] * z, xs1[i] * z + lw[i]) + GAP
# required row separation for each conflicting pair in the same lane
need = {}
members = [[i for i in range(n) if lane[i] == t] for t in range(nt)]
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
E = []
for k in ids:
    for pi, p in enumerate(by[k][8]):
        w = 1.0 if pi == 0 else 0.4
        w *= 2.0 if (TIER[p] == 1 and TIER[k] == 1) else (1.4 if max(TIER[p], TIER[k]) <= 2 else 1.0)
        E.append((idx[p], idx[k], w))
inc = [[] for _ in range(n)]
for a, b_, w in E: inc[a].append((b_, w)); inc[b_].append((a, w))
x3 = [v * 3 for v in xs1]

def ok(i, r, row):
    for j, req in need.get(i, {}).items():
        if row[j] is not None and abs(row[j] - r) < req: return False
    return True

def run(seed, iters):
    rnd = random.Random(seed)
    row = [None] * n; R = [0] * nt
    for t in range(nt):
        for i in sorted(members[t], key=lambda i: (tier[i], xs1[i])):
            r = 0
            while not ok(i, r, row): r += 1
            row[i] = r
        R[t] = max(row[i] for i in members[t]) + 3
    border = list(range(nb)); rnd.shuffle(border)
    lorder = {b: [t for t in range(nt) if tband[t] == b] for b in range(nb)}
    for b in lorder: rnd.shuffle(lorder[b])
    def offsets():
        off = [0] * nt; y = 0
        for b in border:
            if not lorder[b]: continue
            y += HEAD
            for t in lorder[b]: off[t] = y; y += R[t] * ROW3 + LANEGAP
            y += PADB
        return off
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
    for t in range(nt):  # drop empty rows only where no separation rule needs them: shift lane down to start at 0
        m = min(row[i] for i in members[t])
        for i in members[t]: row[i] -= m
        R[t] = max(row[i] for i in members[t]) + 1
    return dict(cost=c, row={ids[i]: row[i] for i in range(n)}, bandOrder=[B[b] for b in border],
                laneOrder={B[b]: [trads[t] for t in lorder[b]] for b in border if lorder[b]}, R={trads[t]: R[t] for t in range(nt)})

if __name__ == '__main__':
    iters = int(sys.argv[1]); seeds = int(sys.argv[2])
    res = []
    for s in range(seeds):
        r = run(s, iters); print('seed', s, 'cost %.0f' % r['cost'], 'rows', sum(r['R'].values())); sys.stdout.flush(); res.append(r)
    res.sort(key=lambda r: r['cost'])
    json.dump(res[0], open('layout5.json', 'w'))
    print('order', res[0]['bandOrder'])
