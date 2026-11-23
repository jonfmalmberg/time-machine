# H1: Inventory of the data as it is (roadmap 2.1)

Date: 2026-11-23. Branch: `helper/2026-11-23-h1`. Model of the run: configured as `claude-opus-5-5` (the session says the serving model can differ and fall back; this run cannot tell beyond that). Sub-agents: none. The assignment allowed Sonnet sub-agents for counting; all counting was done by a script (`faults.py`), which is reproducible, so none was started.

## What was asked

For every file in `data/`: what one entry is, what each field or position means, how many entries, which fields the page reads, established from the files and from `src/template.html` and `src/mods/*.js`, saying so where the meaning cannot be established. Then a fault list: genres with no definition, playlists under four songs, the same song spelled differently in different files, songs dated outside their genre's years, empty decades in `era.json` and `yearl.json`, cities without a country, entries the page never reads, and the three Hebrew chant dots in Israel.

## What is in this folder

- `REPORT.md`: this report.
- `inventory.md`: one table per file (all 29), then the fault list with counts and up to ten examples of each kind, then the Israel finding and the method.
- `faults.json`: all 812 faults, one object per line: `file`, `key`, `kind`, `detail`.
- `faults.py`: the script that produced `faults.json` from `data/` (reads only; run from the repository root with an output folder as argument). Re-running it on `dev` gives an identical file.
- `israel_map_check.py`: the Playwright script that opens the built page, centres the map on Israel at several zooms, years and both projections, and prints which genre dots are drawn there.

## What was found

- **Shape.** 29 files, all embedded in the page. 593 genres; every per-genre file (`st`, `cnt`, `ends`, `scores`, `tier`, `tradOf`, `layout.row`) has exactly those 593; 461 have a definition and a playlist (the same 461). No reference anywhere points at a genre, tradition, region, family or country that does not exist.
- **Meanings established from the code** for every position and field, including those the architecture document marks as unknown: `scores` = significance, ease, how widely known, intrigue (1 to 5; from the Data tab tips and journey weights); `tier` = the tree zoom at which a genre appears; `cnt[1]` is ordered and its first three are treated as the biggest markets; `yrs` in a playlist is `[release year, year written]` per song. **Not established** (said so in the tables): what `layout.cost` measured, what the city flag `x` stands for (its effect is known: cities without it appear one zoom step earlier), why some tradition ids start with `n_`, why `done.json` holds those three genres, and how `scores` and `tier` values were assigned.
- **Never read by the page:** `indoc.json` entirely (its only reader, the old journey code, is replaced with an empty function by `40_journey.js`), the `note` of every decade in `era.json` (324) and every year in `yearl.json` (164), `cities.note` (26), `layout.cost`, three `cityLang.json` keys that match no city name (`Quebec City`, `Madras`, `Calcutta`), and `yearl.json` song position 6, which the code reads but is empty in all 2,359 songs. `tests.json` has no genre test (`g`) yet although the code looks for one.
- **Faults (812 in 20 kinds):** 132 genres without a definition; 42 playlists under four songs (40 of them status `none`; `magyarnota` and `meykhana` are `thin` with three each); 30 songs repeated inside one playlist (in `maskandi`, `kadongokamu`, `makossa` and others); 186 songs spelled differently across files (132 only in capitals) plus 23 within one file and 184 title matches with differently written artist credits (mostly "feat." credits); 116 reference or playlist songs dated before their genre's start or after its end, and 13 reference tracks outside their own definition window (overlapping; many plausibly deliberate: intros, revival recordings); 14 decade-list songs far outside their decade; no empty decade in `era.json` but 12 with under six songs (IR 1940s has two, NG 1940s one); 10 empty decades inside `yearl.json` coverage (US 1950s to 2000s, CA 1990s and 2000s, JP 1990s, SE 1970s) and 17 years the page itself would call sparse (most in MY 1960s); 3 cities whose country code is not in `iso.json` (Gibraltar `GI`, Funafuti `TV`, Yaren `NR`); 2 genres whose peak ends after the genre ends (`metal` 1991 > 1990, `gangsta` 1993 > 1992).
- **The three Hebrew chant dots:** not duplicate rows. There is one chant genre in Israel (`jewish`, Jerusalem). The map groups genres within 0.6° of each other, which joins Jerusalem with the four Tel Aviv genres (`hebrewsong`, `mizrahimusic`, `israelirock`, `israelipsytrance`); zoomed in, the group fans out side by side around the midpoint of the two cities, in one colour family. From 1960 to 1968 exactly three are drawn: `jewish`, `hebrewsong`, `mizrahimusic`. Confirmed by running the built page (details and limits in `inventory.md`).

## Sources

All findings come from the repository itself on `dev` (`data/*.json`, `src/template.html`, `src/mods/*.js`, `build.py`) and from running the built page locally in Chromium. No outside source was used, and none was needed: this assignment is about the data as it is, not about whether it is true.

## What fell short

- The Israel finding reproduces three side-by-side dots from the data and code, but not necessarily the exact view the owner saw (year, zoom, filter). If the owner saw three dots that each hover as "Jewish liturgical chant", that was not reproduced, and the case needs the owner's settings.
- The map's world outline does not load in the offline test, so the fanned positions in the test are the plain spiral, not the "keep on land" placement. The grouping, which causes the effect, does not depend on it.
- "The same song" is text matching. The same song under a translated or different title is not found, and the artist-variant list (184) is candidates, not confirmed duplicates; it may include different songs sharing a title.
- "Dated outside its genre's years" is mechanical: it does not judge whether an early intro song or a late revival recording is intended. The dated hits need a person's judgement before anything is changed.
- Line references are to `dev` as of this branch and will drift.
- How prominence is calculated (roadmap 2.1 also mentions "why one chant dominates half of the tunnel") was not in this assignment's ask and was not investigated beyond recording what `scores` and `tier` mean and where they are used.

## Questions for the lead

1. Should `status: none` mean "no songs"? Seventeen `none` playlists list one to three songs that the panel shows but no prompt uses.
2. The map grouping radius (0.6° in both directions) joins cities as far apart as Jerusalem and Tel Aviv, and, by the same rule, other nearby city pairs. Is a fix to that (for example grouping by exact place) wanted as its own issue, separate from the data work?
3. `indoc.json` and the old journey code in `template.html` that reads it are dead. Remove both, or keep `indoc.json` as a record?
4. Should spelling be normalised in the data now (132 differences are capitalisation only), or wait for the song identity work in milestone 2?
