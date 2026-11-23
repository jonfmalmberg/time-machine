# How prominence is decided, and why one genre dominates the tunnel

H5, roadmap 2.1 and 2.6. Read from `dev` at commit `04deb98`. Line numbers are of the files on that commit. Formulas are copied from the code; where a term's purpose is stated in a code comment, the comment is quoted, otherwise the description is what the arithmetic does. This report describes the present formulas and proposes nothing.

## The data fields

The page still reads the old data shape; `tools/legacy_data.py` makes it from the new files. The fields that feed prominence, and where they now come from:

| Page name | Old key | Made from (`tools/legacy_data.py`) | Meaning |
| :- | :- | :- | :- |
| `SC[id]` = `[S,A,F,I]` | `scores` | `genres.json` → `judgements.significance, ease, fame, intrigue` (line 164–165) | 1 to 5 each. How they were assigned is not recorded (H1). |
| `TIER[id]` | `tier` | `genres.json` → `tier` (line 213) | 1, 2 or 3: tree zoom level |
| `STD[id]` = `[peakStart, peakEnd, [regions], {region: year}]` | `st` | `presence.json`, kind `peak` and `later`, place a region id (lines 177–188) | peak window and where it was known |
| `CNT[id]` = `[origin, [countries at peak], {country: year}]` | `cnt` | `genres.json` origin country; `presence.json`, place a country (same lines) | the list's **order** is used as rank (below) |
| `MEND[id]` | `ends` | `genres.json` → `ended` | `null` = still alive |
| `byId[id].year` | `nodes[4]` | `genres.json` → `began` | birth year |
| `TRADM[t]` | `tradOf` inverted | `genres.json` → `tradition` | members of a tradition; their **count** sizes the tunnel galaxy |
| heat `h` | computed | `heatAt` / `rangeHeat` below | 0 to 1, "how alive now" |

## 1. Heat: how alive a genre is at a moment (`src/template.html`)

### 1.1 `heatAt(id, y)`, lines 1135–1140

```
// 0 before it exists; rising to its peak; 1 at its peak; then fading, slower for more significant movements
if(y<n.year) return 0; if(y<a) return .45+.55*(y-n.year)/Math.max(1,a-n.year); if(y<=b) return 1;
const e=MEND[id], alive=e==null||y<=e;
return Math.max(alive?.55:.06,Math.exp(-(y-b)/(8+6*SC[id][0])));
```

`a`, `b` = peak start and end (`STD`). Terms:
- before birth: 0.
- birth to peak start: from 0.45 rising linearly to 1. A genre is born at 0.45, not 0.
- peak start to peak end: 1.
- after the peak: `exp(-(y-b)/(8+6S))`. The decay time is 14 years for S=1 and 38 years for S=5, so significance (S) makes a genre fade more slowly.
- floor: 0.55 while the genre has not ended (`ended` is null or later than y), 0.06 once it has. A living genre never falls below 0.55.

### 1.2 `rangeHeat(id, y0, y1)`, line 1159

`if(y0<=b&&y1>=a) return 1; return y1<a?heatAt(id,y1):heatAt(id,y0);`. Over a window, a genre gets 1 if its peak touches the window at all.

### 1.3 `stCompute()`, lines 1142–1151: which genres are on, and their `h`

- Single year (`stSingle()`, line 1244: no "from" year and a stay of 0): `h = heatAt(id, y)`.
- Otherwise `h = rangeHeat(id, r0, r1)`. **The default state is not single.** At load `STFROM = T0 = -1500` (line 1115) with stay `until`, so the window is "1500 BCE up to the year" and every genre whose peak has begun gets `h = 1`, however long ago the peak ended.
- A genre is on if it was born by the year, is in the chosen branch of the family tree, and is known in (or made in) the chosen place.
- With a place, branch or "made" filter, its ancestors are added as `anc` with `h = min(.3, heatAt(p, y))` (line 1150).

### 1.4 Colour, opacity, growth (lines 1162–1166)

- `stColor`: region colour mixed toward the muted colour by `(1-h)*.85`; ancestors by .8.
- `stOp`: `.18 + .82*h`; ancestors .3. Used by the tree and the map.
- `growth(id) = clamp01((stU - U(year)) / 0.007)`: a new genre fades in over 0.007 of the log time scale (`U`, line 1118).

## 2. The tunnel (`src/mods/50_tunnel.js`)

The tunnel's `tunnelDraw` in `src/template.html` (lines 1373–1464) is replaced by this module when it loads and is not used, except `TRAD01` (line 1365), which only sets the phase of a star's twinkle.

### 2.1 Galaxy size: number of members, nothing else (lines 15–22)

```
sum += m>1 ? Math.pow(m,.9) : .42;                 // over all traditions
k0 = Math.sqrt(.47*(R_OUT²-R_IN²)/sum);
r = m>1 ? k0*Math.pow(m,.45) : k0*.65;
```

`m` = how many genres the data puts in the tradition. A galaxy's radius depends only on `m`. Neither significance, heat nor time enters. Largest: Hip hop (34 genres), Rock abroad (29), Western art music (13), Arabic maqam music (12).

### 2.2 Galaxy position (lines 7–8, 19–40)

Each region has a hand-set anchor on the unit disc (`ANCH`, line 7; `mena: [.4, -.1]` is the closest to the centre, 0.41 from it; the other nine are 0.60 to 0.82 away). A galaxy starts at its region's anchor offset by the median longitude and latitude of its members, then 420 rounds of collision and drift settle it (lines 33–39). The result is fixed for all time. When drawn, centres are stretched by `EX = min(1.75, max(1, (W/H)*.93))` horizontally and `EY` vertically (line 84), so on a wide screen everything moves away from the centre sideways, up to 1.75 times.

### 2.3 Order inside a galaxy (line 44)

`ids.sort((a,b)=>(SC[b][0]-SC[a][0])||(byId[a].year-byId[b].year)||...)`. The most significant member (S) takes the core (`[0,0]`); for spirals the next one to three take the inner ring; the rest go out along the arms in order of birth year (line 57).

### 2.4 Depth: by peak end, not by heat (lines 114–115)

```
const b=STD[id][1]; const z=zOf(STYf<=b?cu:U(b)); if(z>ZMAX) return;
zOf = u => 1 + Math.max(0, cu-u)*15;   fadeZ = z => Math.max(0, 1-(z-1)/6.5);   // line 92, ZMAX=7.5
```

A genre whose peak has not ended (`year <= peakEnd`) sits at the front, `z = 1`, at full size. After its peak ends, it recedes toward the centre by the log-time distance since the peak end, and disappears at `z > 7.5`. **A genre whose peak window runs to 2026 never recedes: from birth it is at the front, at the same place and size, for every year.**

### 2.5 A star's light (lines 115–116, 144–151)

```
a  = fadeZ(z) * growth(id)
op = a * (anc ? .3 : .25 + .75*h)
h' = anc ? .25 : h
rr = max(1.1, (1.3 + 4.6*h') * SK / sqrt(z))        // SK = clamp(R0/400, .62, 1): smaller on small screens
glow sprite: alpha op*(.3+.65*dens), size 7.2*rr     // dens = min(1, sqrt(55/number of stars)), line 119
core disc:   alpha op*.9, radius .8*rr
white glow:  alpha op*(.45+.5*h'), size 1.8*rr
twinkle: x(1 + .1*sin(...)) when h' > .6
```

Brightness and size come from `h` and depth only. S, F, tier and listeners do not enter a star's size. `dens` dims every star equally when the sky is crowded; it does not change one genre's share against another.

### 2.6 A galaxy's light (lines 121–138)

```
zmin = depth of its nearest member; members within zmin*1.12 count as "near" (nn of them)
inten = min(1, (sum of near members' op) / nn * 1.4)
full  = G.r * R0 / zmin;   rr = full * max(.38, min(1, ext+.15))   // ext = outermost near member's place in the galaxy
halo:  alpha (.2+.34*inten)*gd, size 3.8*rr, squashed by G.q     // gd = .5+.5*dens
core:  alpha (.06+.14*inten)*gd, size .84*rr
lanes and dust: alpha scaled by inten and frac = nn/G.m
drawn only for galaxies with more than one member (G.m>1) and full >= 3 px
```

The halo's size is the galaxy radius (member count) times how far out its present members reach; its brightness is the mean `op` of those members.

### 2.7 Which names are drawn (lines 158–174) — the decisive part for the observed case

```
pri = (selected ? 20 : 0) + (anc ? 0 : h*3) + SC[id][0]*.5 - z*.4          // line 116
items sorted by pri, highest first; each name is placed unless:
  op < .18 (op = a*(anc ? .45 : .35+.65*h)), or
  its box overlaps a name already placed, or
  its galaxy already has cap names (cap = 12 magnified, 1 on screens under 700 px, else 3 if the galaxy has 14+ members, else 2), or
  LABMAX names are already placed (W*H/17000, 46 magnified)
font size fs = clamp(15/z^.55, 9.5, 15) * (.87 if W<700); weight 600 if h >= .99 and not an ancestor, else 400
side: the outer side of the star within its own galaxy, s.side = sign(ox) if |ox| > .08*G.r (line 68);
      a lone star: right if x >= centre - 8% of W; flipped if the name would leave the screen
```

Names are placed in priority order and a placed name blocks any later one it overlaps. At the front (`z = 1`) and at peak (`h = 1`), priority is `3 + S/2 - 0.4`, so S alone orders the front: an S=5 genre is placed before every S≤4 genre and can never be crowded out by one. The name's length is the genre's display name.

### 2.8 Tradition names (lines 141, 176–179)

A galaxy with three or more near members gets a candidate label; candidates are sorted by `inten * nn` and the first 16 (8 on screens up to 700 px) are drawn where they do not overlap.

### 2.9 `src/mods/55_tunnelgest.js`

No prominence formula. Magnifying (double-tap, `TZ.k = 2.6`) only changes the caps and limits in 2.7 (`ZK > 1`) and keeps names at their normal size on screen (lines 9–12 of the file).

## 3. The tree (`src/template.html`)

- Tier zoom (line 399, 428): `ZL = {1:1, 2:1.8, 3:3}`; `arrive(t) = clamp01((s/ZL[t] - .5)/.3)`. A tier-2 genre appears as the zoom passes about 0.9–1.4, tier 3 at about 1.5–2.4. Tier decides what is visible when zoomed out.
- Life-line width (lines 495–498): `k = clamp01(ln(s/.3)/ln(10))`; widths `{1: 4.5-1.5k, 2: 1.1+1.9k, 3: .5+2.5k}`. Tier 1 is up to nine times thicker than tier 3 when fully zoomed out; all three become 3 when zoomed in. Opacity `(.25+.35*(tier1 ? 1 : arrive)) * stOp * growth`.
- Dots (lines 499–503): opacity `arrive(tier) * stOp(h) * growth`; colour `stColor(h)`.
- Influence lines (line 447, 512): appear by the larger tier of the two ends.
- World line of a selected genre (lines 1174–1179): ancestors by first parent; descendants by repeatedly taking the child with the highest `S + F` (ties by year).

## 4. The map (`src/template.html`)

- Dot radius (line 936): `2.5 + 4.5*h` (+3 if selected); opacity `stOp(h)`.
- A cluster of genres at one place (line 942): a ring split into arcs proportional to each genre's `h`.
- Popup list (line 981): sorted by `h`, then birth year.

## 5. The moment panel: which genres are picked for a place and time (`stCands`, lines 1258–1275)

```
h(id)        = max(heatAt(id,y0), heatAt(id,STY), heatAt(id,y1))          only h >= .5 kept
local1       = region chosen: 3 if born in it;  else 3 if origin country = the place, +2 if born within ~0.012 rad (~76 km) of the chosen city
strength1    = region: 1 if born in it, else .7;  country/city: 1 origin, .85 if among the first 3 of CNT[id][1], .7 positions 4–8, .55 later, .45 if not listed, .6 if no country data
nLoc         = number of local genres with heat >= .5
weight       = h*(2 + S + .8*F)*strength + local*(nLoc<=4 ? 1 : .25 + .75*F/5)
```

The first 18 by weight are shown as chips (line 1342). The comment states the intent: "home sounds get a boost scaled by how widely known they are (F), so a big country's niche scenes don't drown its mainstream". The **order of countries in `CNT[id][1]`** is read as a ranking of markets.

## 6. Random trips (`src/template.html`)

- `teleportPick` (lines 1482–1494): 88% of the time picks among genres whose peak ends 1900 or later, otherwise among peaks before 1900; the genre is drawn with weight `S + F`; the year uniformly inside its peak.
- `pickPlace` (lines 1470–1479): a country drawn with weight `count^0.9`, where count = genres known there at heat ≥ .5 in that year (0 if fewer than 5 on a "rich" jump). The comment says "squared, so lively places win most of the time", but the exponent is 0.9, which slightly flattens rather than squares. Countries with more genres in the data are picked more often.

## 7. Journeys (`src/mods/40_journey.js`)

- Music history (lines 174–186): rank by S, then F, then I, then year. Pass 1 takes `n` (default 40) with quotas: `floor(n/20)` per region first, then n/5 before 1500, n/10 for 1500–1800, n/5 for 1800–1945; caps: 30% of n per country, n/7 per family, two per tradition, 40% after 1945.
- World traveller (lines 204–208): `score = S + .3*A + .15*F - (.6 if no definition) + nudge`. At most one or two stops per country and per tradition per visit.
- Discovery walk (lines 250–264): `base = (wS*S + wA*A + wF*F + wI*I)/(sum of weights)`, default weights 7, 5, 3, 5 (line 22), user-adjustable; +1.3 if in the phase of the cycle home/abroad/back in time (`phaseOf`: before 1920 is "past", `nam` and `eur` are "home", the rest "abroad"); −0.55 per same family in the last six, +0.4 if none; −0.45 per same region, +0.3 if none; −1.6 if in `known.json` and "known last" is on; −2.2 for hard listening (A ≤ 3) when an ear-fatigue load passes 3.1; −0.5 if its main parent is still waiting and about as strong.
- Taste nudge (line 111): `clamp(.15*family count + .08*region count, ±.6)` from the visitor's history.
- `journeyOrder` in `src/template.html` (lines 721–741) is the same walk with the old global weights; it is only called by `renderJourney`, which `40_journey.js` replaces with an empty function, so it no longer runs.

## 8. `src/mods/60_satellite.js`

No prominence formula. It only restyles the map's colours and draws the Earth image under it.

---

## 9. The tunnel dominance case, measured

### What was measured

`measure_tunnel.py` (in this folder) opens the built page in Chromium, switches to the tunnel and steps through 201 moments evenly spaced on the tunnel's own log time scale (`u` = 0 to 1, 1500 BCE to 2026), in two time modes (the default "all of history up to the year", and a single year) and two viewports (1280 × 800 and 400 × 800). At each moment it uses the page's own `setYearU`, `stCompute` and `tunnelDraw`, with the speed set to 0 so no streaks are drawn. Three measures:

1. **Light share**: alpha × drawn area of every star and galaxy element, term by term from section 2.5 and 2.6, summed by genre and by tradition. Dust motes, lanes, labels and birth shells are left out.
2. **Pixel check**: the canvas read back; the leading tradition is removed and the frame redrawn; the drop in total light over the light of the full frame.
3. **Names**: every name actually drawn, recorded during the draw: size, weight, opacity, box. A name's ink = width × font size × opacity. Its distance is from the screen centre (the vanishing point, where the year and "Everywhere" are written) to the nearest point of the name's box, in units of R0 (half the shorter side).

"Rim" in the assignment is read as the tunnel's front (the stars at `z ≤ 1.12`). The front shares are in `tunnel_shares.json` (`front_trads`) and give the same dominance cases as the totals below.

### Light: no tradition takes more than a third after 586 CE

Moments where one tradition has more than a third of the light (desktop, default mode; the other three runs differ by one or two samples):

| Years | Tradition (leading genre) | Highest share | Pixel check | Genres on screen |
| :- | :- | :- | :- | :- |
| 1416 – 1334 BCE | Aboriginal Australian song | 0.75 | 0.77, 0.50 | 2–3 |
| 1254 BCE | Mesopotamian hymns | 0.36 | 0.38 | 3 |
| 490 BCE | Chinese classical (yayue) | 0.35 | 0.25 | 8 |
| 98 BCE – 514 CE | Chinese classical (guqin) | 0.37 | 0.20 to 0.04 | 8–11 |

These are the few-genre years at the start of the tunnel: with two to eleven genres alive, any one takes a large share. The pixel check agrees within 0.03 where the sky is nearly empty and gives lower shares after that (the "lighter" blending saturates where glows overlap, so removing one galaxy takes away less light than was drawn). After 586 CE no tradition passes a third by either measure. Qur'anic recitation never has more than 0.14 of the light in any run.

### Names: Qur'anic recitation is the largest name, at the centre, for most of the tunnel

The genre is `tilawa`, "Qur'anic recitation (tilawa) and the call to prayer" (tradition "Islamic recitation and devotional song", region MENA). The vision record speaks of "an Arabic devotional chant"; this is the only chant that matches what was measured, but the owner's own screen was not seen, so the identification is an inference from the measurement.

| Measure (desktop, default mode) | Result |
| :- | :- |
| Its name is the largest drawn name (ink) | 121 of 201 moments: 1247–1529, 1651, 1670–1950, 1964, 1970–2026 (on the time slider: 0.31–0.40, 0.46–0.74, 0.78–1.00) |
| Its name box lies within 0.25 R0 of the centre | 153 of 201 moments: 655–782 and every moment from 1053 to 2026 (slider 0.27 to 1.00, about three quarters of its length) |
| Distance of its name from the centre | 0.009 R0: the box passes over the vanishing point and the year |
| Name: width, size, weight, opacity | 341–348 px, 15 px, bold, 1.0, the same at every moment |
| Other runs | single year: 111 and 153; phone, default: 128 and 153; phone, single year: 129 and 153 |

The screenshots `tunnel_900.png`, `tunnel_1300.png` and `tunnel_1700.png` (desktop, default mode) show it: from 1300 on, "Qur'anic recitation (tilawa) and the call to prayer" runs in bold across the middle of the view, through the year number, while everything else moves.

### Why, from the formulas

1. **It never leaves the front.** Its peak window in the data is 700 to 2026 (`presence.json`, kind `peak`, basis "first estimate", in MENA, South Asia, Southeast Asia and Africa). Depth is set by the peak end (2.4): with the peak running to the present, `z = 1` at every year from its birth in 610. Every other old genre recedes once its peak ends; this one stays the same size, at the same place, for 1,416 years.
2. **It is always at full heat.** Within its peak, `h = 1` in either time mode (1.1, 1.2), so its name has opacity 1, the largest font (15 px) and bold weight (2.7).
3. **It is always placed first.** Its significance is S = 5 (`genres.json` judgements 5, 2, 4, 4). At the front and at peak, name priority is `3 + S/2 − 0.4 = 5.1`, the highest any unselected genre can have (2.7). Names are placed in priority order and a placed name blocks later ones, so it is never pushed out by another name.
4. **Its place on the sky map puts its name over the centre.** The MENA anchor is the closest to the centre (`[.4, −.1]`, 2.2). Its galaxy settled at `(0.56, −0.04)`, almost on the horizontal centre line. Within its two-member galaxy the star sits just left of the galaxy centre (`ox = −0.0098`, beyond the 0.08 × r threshold), so its name is drawn on the left, the side facing the centre (2.7). On the 1254 × 688 canvas measured, the star is about 323 px right of the centre and the name is 348 px long, so it reaches across the vanishing point.
5. **Its name is long.** At 51 characters it is the 10th longest of the 593 genre names, so at the same size and opacity it covers more area than most.

None of these alone makes it dominate. Together they make one fixed, bold, 348-pixel name sit over the centre of the view from 1053 to the present while the rest of the sky moves. By drawn light it is an ordinary star: its size is the same as any other genre at its peak at the front.

## 10. Unstated judgements in the present formulas

Each is a choice the code makes without saying so.

1. A peak window that runs to the present means "at its peak for the whole window" (2.4, 1.1). The data says Qur'anic recitation has been at its peak for 1,326 years and Amazigh ahwash for 1,026; the tunnel then keeps them at the front, at full size, throughout.
2. In the default time mode every genre whose peak has ever begun has `h = 1` (1.3). Brightness then says nothing about the year; only depth separates genres.
3. Depth follows the end of the peak, not heat (2.4). A genre past its peak but still alive (heat ≥ 0.55) recedes as if it were fading out.
4. A galaxy's size is the number of genres the data splits a tradition into, to the power 0.45 (2.1). How finely a tradition is subdivided, not how much it is listened to, decides its size: hip hop with 34 genres is the largest galaxy.
5. Which names appear is decided by S, a 1-to-5 judgement whose origin is not recorded (2.7). Among genres at their peak at the front, S alone orders them.
6. A name's length counts as prominence. Long display names take more screen.
7. The sky-map anchors are hand-set (2.2). MENA is placed near the centre; with the horizontal stretch on wide screens, names of genres there can cross the vanishing point.
8. The side a name goes on follows the sign of a tiny offset inside a galaxy (2.7). A shift of 0.01 of the disc decides whether a name runs outward or across the centre.
9. Names per galaxy are capped (2, or 3 for galaxies of 14+, 1 on phones): a tradition split into several galaxies can show more names than one held in one galaxy.
10. A newborn genre starts at heat 0.45, not 0 (1.1).
11. Significance slows fading: decay time `8 + 6S` years (1.1). S = 5 genres stay warm almost three times as long as S = 1.
12. A living genre never drops below heat 0.55; an ended one keeps 0.06 (1.1).
13. In the moment panel, a genre's weight is `h(2 + S + .8F)` times how strongly the place took to it, plus a home bonus (5). The order of countries in a genre's peak list is read as their rank: first three 0.85, next five 0.7, the rest 0.55.
14. Random trips weight genres by `S + F` and countries by the number of genres the data has for them (6). More data for a country means more visits.
15. Tree tiers decide what is seen when zoomed out and how thick a line is (3); how tiers were assigned is not recorded.
16. Journeys use fixed weights (S 7, ease 5, fame 3, intrigue 5) and a home/abroad split where "home" is North America and Europe (7).
17. The most significant member of a tradition takes its galaxy's core (2.3).
18. The comment on `pickPlace` says "squared" but the exponent is 0.9 (6). The code and its comment disagree.
