# H5: How prominence is decided, and why one genre can dominate the tunnel

Date: 2026-11-23. Branch: `helper/2026-11-23-h5`, from `dev` at `04deb98`. Model of the run: `claude-opus-5-5` (as configured for this session; the model serving a turn can differ, and the run cannot see that). Sub-agents: none.

## What was asked

Write out every place where a genre's size, brightness, order or chance of being picked is computed (`src/template.html`, `50_tunnel.js`, `55_tunnelgest.js`, `60_satellite.js`, `40_journey.js`): the formula, the data fields that feed it, what each term does. Reproduce the owner's observation that one chant fills about half of the tunnel, by running the built page with Playwright, find where one genre or tradition takes more than a third of the tunnel, and explain why from the formula. Describe, do not propose. List the unstated judgements.

## What is in this folder

- `prominence.md`: the formulas, one section each with file and line (heat, tunnel, tree, map, moment panel, random trips, journeys), the measured dominance cases, the explanation, and 18 unstated judgements.
- `measure_tunnel.py`: the measuring script. Run from the repository root after `python3 build.py`; takes about 40 seconds.
- `tunnel_shares.json`: its output: 201 moments × 2 time modes × 2 viewports, with light shares by genre and tradition, front shares, the names drawn, and the pixel check (desktop).
- `tunnel_900.png`, `tunnel_1300.png`, `tunnel_1700.png`: the tunnel on desktop at those years, default time mode.

## What was found

- The genre is Qur'anic recitation (`tilawa`). It does not dominate by drawn light (at most 0.14 of it). It dominates by its **name**: the largest name drawn in 121 of 201 moments (desktop), and over the centre of the view, through the year number, at every moment from 1053 to 2026 (about three quarters of the time slider). Phone and single-year mode give the same picture.
- Why: its peak window in the data runs from 700 to 2026, and the tunnel's depth follows the end of the peak, so it sits at the front at full size and full heat for every year after its birth; its significance S = 5 gives it the highest name priority at the front, so its name is always placed first; the MENA region is anchored nearest the centre of the sky map and the star sits just left of its galaxy centre, so its 51-character bold name runs leftward across the vanishing point.
- By drawn light, a single tradition takes more than a third of the tunnel only in the near-empty early sky: Aboriginal song (1416–1334 BCE), Mesopotamian hymns (1254 BCE), Chinese classical (490 BCE and 98 BCE to 514 CE), with 2 to 11 genres alive. None after 586 CE.
- Galaxy size depends only on how many genres a tradition has in the data (radius ∝ count^0.45); significance, heat and listeners do not enter it.
- In the default time mode ("all of history up to the year") every genre whose peak has begun has heat 1; only depth separates them.

## Sources

No outside sources. Everything is read from the repository at `04deb98` (`src/template.html`, `src/mods/40_journey.js`, `50_tunnel.js`, `55_tunnelgest.js`, `60_satellite.js`, `tools/legacy_data.py`, `data/genres.json`, `data/presence.json`) and measured from `dist/index.html` built by `python3 build.py`. The owner's observation is quoted from `docs/vision/2026-11-23-direction.md` line 58.

## What fell short

- The owner's own screen was not seen. That the "Arabic devotional chant" is `tilawa` is inferred from the measurement: it is the only chant that behaves as described. If the owner meant drawn light rather than the name, the measurement does not reproduce it.
- The light measure leaves out dust motes, dust lanes, birth shells and streaks (streaks are drawn only while moving; the measure is taken at rest). It treats all glows as additive.
- The pixel check agrees with the light measure within 0.03 only where the sky is nearly empty. Where glows overlap, the page's additive blending saturates and the check reads lower (for Chinese classical, 0.20 against 0.34). It confirms the early cases qualitatively, not exactly.
- "Rim" was read as the front of the tunnel (stars at depth ≤ 1.12, the band the galaxy code itself calls a galaxy's nearest members). The angle of the circle a tradition covers was not measured.
- Only the "Everywhere" view was measured, with no place, branch or "made" filter, nothing selected, and no magnification. A place filter adds ancestors and changes which genres are on.
- Only two viewports (1280 × 800 and 400 × 800). The name's crossing of the centre depends on the screen's shape (the horizontal stretch `EX`); other shapes were not tried.
- 201 moments evenly spaced on the log time scale: on the early part of the slider one step spans about 80 years, so short cases there may have been missed.

## Questions for the lead

1. Is the observation the owner made about the name (as measured here) or about the light? If the light, which screen and which year, so it can be measured on that shape.
2. The comment on `pickPlace` says "squared" while the exponent is 0.9 (`prominence.md`, section 6). Which one is intended is a question for the owner, not for a helper.
3. The peak windows that run to the present (700–2026 for tilawa, 1000–2026 for Amazigh ahwash) are marked "first estimate" in `presence.json`. Whether a peak can last that long is a data-model question for the lead.
