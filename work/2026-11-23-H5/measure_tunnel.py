#!/usr/bin/env python3
"""H5: measure how much of the time tunnel each genre and tradition takes, year by year.

Run from the repository root after `python3 build.py`:
    python3 work/2026-11-23-H5/measure_tunnel.py
Needs Python Playwright with Chromium. Reads dist/index.html only; writes
work/2026-11-23-H5/tunnel_shares.json and a few screenshots next to this script.

Method (all inside the built page, using the page's own globals and functions):
 1. For each sampled moment, set the year with the page's setYear(), recompute with stCompute(),
    reset the tunnel's speed to 0 (no streaks), and redraw with the page's own tunnelDraw(0).
    Labels: during one redraw the context's fillText is wrapped to record every name actually
    drawn (text, font size, weight, alpha, box). A label's "ink" is width x font size x alpha;
    its distance is from the screen centre (the vanishing point, where the year is written) to
    the nearest point of its box, in units of R0 (half the shorter side of the view).
 2. "Light" (analytic): for every element the tunnel draws for a genre, alpha x drawn area,
    copied term by term from src/mods/50_tunnel.js lines 113-155 (stars: coloured glow, core disc,
    white glow; galaxies: coloured halo and white core glow). Glow sprites are weighted by the
    measured mean alpha of the page's own glow() sprite. Streaks (only while moving), birth
    shells (only in the first moments of a genre), dust lanes, dust motes and labels are left out.
 3. "Pixels" (check): the canvas is read back; total light = sum over pixels of
    (luminance - background luminance). The leading tradition's members are then removed from
    STV, the frame is redrawn, and the drop in total light is its pixel share.
 4. The "rim" share is the same analytic light counted only over stars at the front of the
    tunnel (depth z <= 1.12, the depth band the galaxy code itself treats as "nearest members").
Two time modes: the page's default stay ("all of history up to the year", STFROM=T0) and a
single year (stay 0). Two viewports: desktop 1280x800 and phone 400x800.
"""
import json, os, sys
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = os.path.join(HERE, '..', '..', 'dist', 'index.html')

JS_SETUP = r"""
() => {
  // mean alpha of the page's own glow sprite (64x64), used to weight glow draws by their real light
  const c = glow('#ffffff'), d = c.getContext('2d').getImageData(0,0,c.width,c.height).data;
  let s = 0; for (let i = 3; i < d.length; i += 4) s += d[i]; window.__GLOWK = s / (255 * c.width * c.height);
  return {glowk: window.__GLOWK, stfrom: STFROM, stspan: STSPAN, sty: STY};
}
"""

# One moment: returns analytic shares by genre and tradition, front ("rim") shares, and pixel totals.
JS_MOMENT = r"""
([u, mode, pixelCheck]) => {
  if (mode === 'single') setStay(0); else setStay('until');
  setYearU(u); stCompute(); TUNV = 0; TUNU = stU;
  const cv = document.getElementById('tunnel'), W = cv.clientWidth, H = cv.clientHeight;
  const R0 = Math.min(W,H)*.5, K = 15, ZMAX = 7.5, cu = stU, GK = window.__GLOWK;
  const SK = Math.max(.62, Math.min(1, R0/400));
  const zOf = x => 1 + Math.max(0, cu - x)*K, fadeZ = z => Math.max(0, 1 - (z-1)/(ZMAX-1));
  // --- copied from 50_tunnel.js 113-117: the items ---
  const items = [], gal = {};
  if (STV) STV.forEach((v,id) => { const b = STD[id][1]; const z = zOf(STYf <= b ? cu : U(b)); if (z > ZMAX) return;
    const s = TUNSTAR[id]; if (!s) return; const G = s.g, g = growth(id), a = fadeZ(z)*g;
    const it = {id, v, z, a, g, s, op: a*(v.anc ? .3 : .25 + .75*v.h)};
    items.push(it); if (G.m > 1) (gal[G.t] = gal[G.t] || []).push(it); });
  const dens = Math.min(1, Math.sqrt(55/Math.max(1, items.length)));
  const byG = {}, byT = {}, frontG = {}, frontT = {}; let tot = 0, ftot = 0;
  const add = (id, t, w, front) => { byG[id] = (byG[id]||0) + w; byT[t] = (byT[t]||0) + w; tot += w;
    if (front) { frontG[id] = (frontG[id]||0) + w; frontT[t] = (frontT[t]||0) + w; ftot += w; } };
  // --- stars, 50_tunnel.js 144-151 (twinkle taken as 1) ---
  items.forEach(it => { const v = it.v, h = v.anc ? .25 : v.h, op = Math.min(1, it.op), rr = Math.max(1.1, (1.3 + 4.6*h)*SK/Math.sqrt(it.z));
    const w = op*(.3 + .65*dens)*GK*Math.pow(7.2*rr, 2)            // coloured glow sprite
            + op*.9*Math.PI*Math.pow(.8*rr, 2)                       // core disc
            + op*(.45 + .5*h)*GK*Math.pow(1.8*rr, 2);                // white glow
    add(it.id, TRAD_OF[it.id], w, it.z <= 1.12); });
  // --- galaxies, 50_tunnel.js 121-129: halo + white core glow, credited to the members at its drawn depth ---
  const galInfo = {};
  for (const t in gal) { const ms = gal[t], G = TUNGAL[t];
    let zmin = 1e9; ms.forEach(m => { if (m.z < zmin) zmin = m.z; }); let hh = 0, ext = 0, nn = 0, near = [];
    ms.forEach(m => { if (m.z > zmin*1.12) return; nn++; hh += m.op; near.push(m); if (m.s.lr > ext) ext = m.s.lr; });
    const sc = 1/zmin, full = G.r*R0*sc, inten = Math.min(1, hh/nn*1.4), rr = full*Math.max(.38, Math.min(1, ext + .15));
    if (full < 3) continue; const gd = .5 + .5*dens;
    const w = (.2 + .34*inten)*gd*GK*Math.pow(3.8*rr, 2)*G.q + (.06 + .14*inten)*gd*GK*Math.pow(.84*rr, 2)*G.q;
    galInfo[t] = {members: G.m, near: nn, zmin: +zmin.toFixed(3), halo_px: +(rr*1.9).toFixed(1), inten: +inten.toFixed(3)};
    near.forEach(m => add(m.id, t, w/nn, zmin <= 1.12)); }
  const top = (o, T) => Object.entries(o).sort((a,b) => b[1]-a[1]).slice(0, 5).map(([k,w]) => [k, +(w/(T||1)).toFixed(4)]);
  const res = {u: +u.toFixed(4), year: Math.round(STYf), n: items.length, nfront: items.filter(i => i.z <= 1.12).length,
    genres: top(byG, tot), trads: top(byT, tot), front_genres: top(frontG, ftot), front_trads: top(frontT, ftot)};
  const lead = res.trads.length ? res.trads[0][0] : null; if (lead && galInfo[lead]) res.lead_galaxy = galInfo[lead];
  if (lead) { const ms = TRADM[lead].filter(id => STV.has(id)).map(id => { const it = items.find(i => i.id === id);
      return it ? {id, h: +it.v.h.toFixed(3), z: +it.z.toFixed(3)} : {id, h: +STV.get(id).h.toFixed(3), z: null}; }); res.lead_members = ms; }
  // --- labels: every fillText of one redraw, recorded as drawn (text, font size and weight, alpha, box) ---
  { const ctx = cv.getContext('2d'), rec = [], ft = ctx.fillText; const cx = W/2, cy = H/2;
    ctx.fillText = function(t, x, y){ const m = /(\d+(?:\.\d+)?)px/.exec(this.font), fs = m ? +m[1] : 0, w = this.measureText(t).width;
      const x0 = this.textAlign === 'center' ? x - w/2 : x, y0 = y - fs*.75; rec.push({t: String(t), fs, bold: /^(600|700|bold)/.test(this.font), a: this.globalAlpha, x0, x1: x0 + w, y0, y1: y0 + fs});
      return ft.apply(this, arguments); };
    TUNV = 0; TUNU = stU; try { tunnelDraw(0); } finally { delete ctx.fillText; }
    const byName = {}; N.forEach(n => byName[n.name] = n.id); const tByName = {}; for (const t in TRADN) tByName[String(TRADN[t]).toUpperCase()] = t;
    const labs = []; let ink = 0;
    rec.forEach(r => { const id = byName[r.t], tr = tByName[r.t]; if (!id && !tr) return;     // year, place name and tick labels are not genres
      const dx = Math.max(r.x0 - cx, 0, cx - r.x1), dy = Math.max(r.y0 - cy, 0, cy - r.y1), dist = Math.hypot(dx, dy)/R0;
      const k = (r.x1 - r.x0)*r.fs*r.a; ink += k;
      labs.push({id: id || null, trad: id ? TRAD_OF[id] : tr, kind: id ? 'genre' : 'tradition', fs: +r.fs.toFixed(1), bold: r.bold, a: +r.a.toFixed(2), w: Math.round(r.x1 - r.x0), dist: +dist.toFixed(3), ink: k}); });
    labs.sort((p, q) => q.ink - p.ink); labs.forEach(l => { l.ink = +(l.ink/(ink||1)).toFixed(4); });
    res.labels = {n: labs.length, top: labs.slice(0, 4), central: labs.filter(l => l.dist < .25).map(l => ({id: l.id, trad: l.trad, kind: l.kind, dist: l.dist, ink: l.ink, w: l.w, bold: l.bold}))};
  }
  if (pixelCheck && lead) {
    const lum = () => { tunnelDraw(0); const ctx = cv.getContext('2d'), im = ctx.getImageData(0, 0, cv.width, cv.height).data;
      let s = 0; for (let i = 0; i < im.length; i += 4) s += .2126*im[i] + .7152*im[i+1] + .0722*im[i+2]; return s; };
    TUNV = 0; TUNU = stU; const all = lum(); const saved = new Map(STV);
    TRADM[lead].forEach(id => STV.delete(id)); TUNV = 0; TUNU = stU; const without = lum();
    STV = saved; TUNV = 0; TUNU = stU;
    // background light: an empty sky at the same moment
    const keep = STV; STV = new Map(); const bg = lum(); STV = keep; TUNV = 0; tunnelDraw(0);
    res.pixel = {lead, share: +((all - without)/Math.max(1, all - bg)).toFixed(4)};
  }
  return res;
}
"""


def run(pw, name, viewport, modes, steps, pixel):
    browser = pw.chromium.launch()
    page = browser.new_page(viewport=viewport)
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.route('**/*', lambda r: r.continue_() if r.request.url.startswith('file:') else r.abort())
    page.goto('file://' + os.path.abspath(PAGE), wait_until='domcontentloaded')
    page.wait_for_timeout(800)
    page.click('#tab-tunnel'); page.wait_for_timeout(400)
    setup = page.evaluate(JS_SETUP)
    out = {'viewport': viewport, 'setup': setup, 'modes': {}}
    for mode in modes:
        rows = []
        for k in range(steps + 1):
            rows.append(page.evaluate(JS_MOMENT, [k/steps, mode, pixel]))
        out['modes'][mode] = rows
    shots = {}
    if name == 'desktop':
        for y in (900, 1300, 1700):
            page.evaluate("y=>{ setStay('until'); setYear(y); stCompute(); TUNV=0; TUNU=stU; tunnelDraw(0); }", y)
            page.wait_for_timeout(50)
            page.evaluate("()=>{ TUNV=0; TUNU=stU; tunnelDraw(0); }")
            p = os.path.join(HERE, 'tunnel_%d.png' % y)
            page.locator('#tunnel').screenshot(path=p)
            shots[y] = os.path.basename(p)
    out['screenshots'] = shots
    out['page_errors'] = errors
    browser.close()
    return out


if __name__ == '__main__':
    steps = int(sys.argv[1]) if len(sys.argv) > 1 else 200
    with sync_playwright() as pw:
        res = {'desktop': run(pw, 'desktop', {'width': 1280, 'height': 800}, ['until', 'single'], steps, True),
               'phone': run(pw, 'phone', {'width': 400, 'height': 800}, ['until', 'single'], steps, False)}
    with open(os.path.join(HERE, 'tunnel_shares.json'), 'w') as f:
        json.dump(res, f, ensure_ascii=False, separators=(',', ':'))
    print('ok', {k: v['page_errors'] for k, v in res.items()})
