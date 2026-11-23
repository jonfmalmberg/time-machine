# Inventory of `data/` as it is on `dev` (23 November 2026)

H1, roadmap 2.1. Every file in `data/`, read against how `src/template.html` and `src/mods/*.js` use it. Line numbers refer to `dev` at commit time of this branch. "Read" means some code on the page reads the value; it does not mean the value is shown to a visitor. Where the meaning of a value could not be established from the code, the table says so instead of guessing.

All 29 files are loaded by `build.py` into one `DATA` object (key = file name without `.json`) and embedded in the page. None is fetched separately.

Counts are of entries, not of lines (the files have one entry per line plus bracket lines, so `wc -l` is 2 higher).

## Genres and the tree

### `nodes.json`: list, 593 entries. One entry is one genre ("movement" in the code).

Read at `template.html:373` into `N` objects; every position is used.

| Pos | Meaning | Read | Where (examples) |
| :- | :- | :- | :- |
| 0 | Stable id (`swing`). Key used by every other genre file | yes | everywhere |
| 1 | Display name | yes | list, map tooltip, tunnel, search |
| 2 | Region id (one of the 10 in `regions.json`); colours the dot and drives region filters and the "made there" test for a region | yes | `regColor(n.reg)`, `placeMade` |
| 3 | Family id (one of the 20 in `bands.json`) | yes | filters (`n.band===G.id`), journeys |
| 4 | Start year (negative = BCE). Earliest −1500, latest 2020 | yes | tree x position, `heatAt` (0 before it), `usesB` (before 1890 uses the "before recording" prompt) |
| 5 | Place of origin, free text | yes | list, tooltips, prompt head `Name (place, window)` |
| 6, 7 | Latitude, longitude of the origin | yes | map dot, map clustering, "born here" for a city (`bornHere`, `placeMade`), prompt language via `cityLang` |
| 8 | Parent ids, first = main parent | yes | tree lines, lineage, ancestor trails on the map, family filter. 25 genres have no parent (roots) |

By region: eur 146, nam 82, afr 69, latam 68, seasia 53, easia 48, mena 43, sasia 36, carib 33, casia 15.

### `edges.json`: list, 1,176 entries. One entry is one influence line on the tree.

| Pos | Meaning | Read | Where |
| :- | :- | :- | :- |
| 0 | From genre id | yes | `template.html:444` |
| 1 | To genre id | yes | same |
| 2 | Weight: only two values occur, 1 (568) and 0.4 (608). 1 is drawn as a primary line (class `p`), anything below 1 as secondary (`s`); a weight-1 line between traditions can be drawn as a branch | yes | `template.html:445–447` |

Every endpoint exists in `nodes.json`. The relation between `edges.json` and the parents in `nodes.json` position 8 is not stated anywhere; the code uses both (parents for lineage and map trails, edges for the drawn tree lines).

### `layout.json`: object with 5 keys. Pre-computed tree layout.

| Key | Meaning | Read | Where |
| :- | :- | :- | :- |
| `row` | genre id → row number (0–24) inside its tradition's lane. 593 entries, one per genre | yes | `SY()`, `template.html:425` |
| `bandOrder` | the 20 family ids, top to bottom | yes | tree, list |
| `laneOrder` | family id → its tradition ids in lane order (163 traditions in all) | yes | tree, list |
| `R` | tradition id → number of rows its lane takes | yes | `template.html:414` |
| `cost` | a single number (1,499,774.29) | **no** | never read. What it measured cannot be established from the code |

### `trad.json`: object, 163 entries. tradition id → display name.

Read as `TRADN`: tradition labels on the tree, list headings, filters, tunnel labels. 68 tradition ids start with `n_` (for example `n_israelisong`); the code treats them like any other id. Why some ids carry the prefix cannot be established from the code. 60 traditions have a single genre; the tree and list show a tradition heading only when it has more than one.

### `tradOf.json`: object, 593 entries. genre id → tradition id.

Read as `TRAD_OF`; inverted into `TRADM` (tradition → genres). Every genre has one, every value exists in `trad.json`.

### `bands.json`: list, 20 entries. `[family id, display name]`. Both read (filters, list, menu search).

### `regions.json`: list, 10 entries. `[region id, display name]`. Both read (legend chips, filters, colours, menu search).

### `tier.json`: object, 593 entries. genre id → 1, 2 or 3.

Zoom tier on the tree: `ZL={1:1,2:1.8,3:3}` and `arrive(t)` fade a genre in as the tree zoom passes that scale (`template.html:399, 428`); the larger tier of the two ends also decides when an influence line appears. Counts: tier 1: 71, tier 2: 235, tier 3: 287. How the tiers were assigned is not recorded.

### `scores.json`: object, 593 entries. genre id → `[S, A, F, I]`, each 1 to 5.

Meanings come from the Data tab column tips (`30_data.js:90–93`) and the journey weights (`JW={S,A,F,I}`): 0 = significance, 1 = ease of listening, 2 = how widely known, 3 = intrigue. All four are read: journeys and discovery walks rank by them, `heatAt` uses S to set how slowly a genre fades after its peak, the moment's genre candidates weigh S and F, the tunnel orders and sizes by S. How the numbers were assigned is not recorded.

### `ends.json`: object, 593 entries. genre id → end year, or `null` (still alive).

185 have a year, 408 are `null`. Read as `MEND`: the end of the genre's life line on the tree, whether it is "alive" in `heatAt`, the end year of a tradition (null if any member is alive).

### `st.json`: object, 593 entries. When and where a genre was at its peak (by region).

Comment at `template.html:1110`.

| Pos | Meaning | Read | Where |
| :- | :- | :- | :- |
| 0 | Peak start year | yes | `heatAt`, `rangeHeat`, Data tab "Peak years", random trips |
| 1 | Peak end year | yes | same; tunnel depth |
| 2 | Region ids where it was known at its peak | yes | `knownIn` (region filter, "heard there") |
| 3 | Later arrivals: region id → year it arrived there (78 genres have any) | yes | `knownIn` |

### `cnt.json`: object, 593 entries. The same by country.

Comment at `template.html:1111`.

| Pos | Meaning | Read | Where |
| :- | :- | :- | :- |
| 0 | Origin country (ISO 3166 two-letter code). Never empty | yes | "made there" for a country, local boost in the moment's genre picks, prompt language (`isoLang`), Data tab "Country", journeys |
| 1 | Countries where it was big at its peak, **in order**: the code weights the first three as its biggest markets (strength .85), the next five .7, the rest .55 (`template.html:1267–1268`) | yes | `placeKnown`, `strength1` |
| 2 | Later arrivals: country → year (94 genres have any) | yes | `placeKnown` |

### `defs.json`: object, 461 entries. genre id → definition. The 132 genres without one show as "pending".

| Field | Meaning | Read | Where |
| :- | :- | :- | :- |
| `window` | Active years as text, `1979–1985`, `1998 onward`, `c. 500 BCE onward`, sometimes with a remark (`1986–1997 (revivals since)`) | yes | list, playlist panel, prompt head (`windowIn` translates "onward") |
| `sound` | One-sentence description of the sound | yes | list; prompt when there is no local language and no tracks |
| `markers` | What to listen for: 3 lines (one genre has 4) | yes | list |
| `fits` | Reference tracks `[artist, title, year]`, 1,329 in all; 10 have `null` year | yes | list, prompt when the playlist has under four songs, the moment's seed songs (`datedTracks`), list search |
| `near` | Near-misses `[artist, title, year, genre id it belongs to, reason]`, 481 in all | yes | list ("Close, but belongs elsewhere") |

### `playlists.json`: object, 461 entries (exactly the genres in `defs.json`). genre id → playlist.

| Field | Meaning | Read | Where |
| :- | :- | :- | :- |
| `status` | `full` 290, `thin` 131, `none` 40 | yes | labels "Full playlist" / "Thin: few recordings" / "No playlist: listen to albums"; `none` turns off the prompt |
| `intro` | Opening songs `[artist, title]`, 1,146 in all | yes | prompt (if intro+peak ≥ 4), panel lists, seed songs, Data tab songs index, menu search |
| `peak` | Main songs `[artist, title]`, 3,859 in all | yes | same |
| `albums` | `[artist, album]`, 312 in all | yes | panel "Albums to listen to instead" |
| `fold` | genre id whose playlist to use instead, or `null` (32 set) | yes | panel link |
| `note` | Text shown after the status, 338 non-empty | yes | panel |
| `yrs` | One `[release year, year written]` per song in `intro` then `peak` order; either may be `null`. Present on 422 of 461 (missing on 39, all with status `none`) | yes | `datedTracks`: picks songs that existed by the chosen year; Data tab year and "written" note |

### `known.json`: list, 26 genre ids. Read as `KNOWN`: the journey's "familiar ones last" option (`40_journey.js:259`) pushes these later. Also used by the old journey code, which is inert (below).

### `done.json`: list, 3 genre ids (`swing`, `soul`, `citypop`). Read as the starting "listened" set (`DONE`) for a visitor with no saved state: it feeds `heardSet()` (random trips to unheard music) and is copied into a guest's journey state (`40_journey.js:33`). Why these three cannot be established from the code.

### `indoc.json`: list, 42 genre ids. Read only by `renderJourney()` in `template.html` (an "In doc" tag: "A longer hand-picked list for this one is in the Genre playlists doc"). `40_journey.js:397` replaces `renderJourney` with an empty function, so **the page never shows it**.

### `notes.json`: object, 23 entries. genre id → one-sentence note. Read only as the tree dot's hover title (`template.html:440`).

### `method.json`: a single string (1,355 characters) explaining the drawing method. Read once into the `#method` element (`template.html:383`).

## Places

### `iso.json`: object, 226 entries. ISO two-letter code → `[country name, region id]`. Both read (names everywhere, region membership for filters, journeys, research).

### `neAlias.json`: object, 112 entries. Country name as written in the world outline data → ISO code. Read by `isoOf` (`template.html:788`) to match map shapes to countries. Every value exists in `iso.json`.

### `cities.json`: list, 1,619 entries. One entry is one city or area. Saved trips point at a city by `ISO:name` (`10_people.js:17`).

| Field | Present | Meaning | Read | Where |
| :- | :- | :- | :- | :- |
| `name` | all | Name (a bracketed suffix is stripped for display) | yes | everywhere; key `ISO:name` |
| `iso2` | all | Country code | yes | everywhere |
| `lat`, `lon` | all | Position | yes | map, "made there", "born here" |
| `founded` | all | Year it appears on the map; −9999 for 197 entries that are always there | yes | `cityAlive`, `cityFade`, tooltip |
| `ended` | all (`null` for 1,542) | Year it disappears; 77 have one | yes | same |
| `names` | 204 | `[[from year, name], …]` historical names | yes | `cityName`, place search, Data tab |
| `size` | all | 1 (924), 2 (630), 3 (65): the zoom at which the square and the label appear | yes | `template.html:918` |
| `kind` | 1,391 | `city` (1,195) or `area` (196). An area is drawn only when it is the chosen place. Missing on 228, which the code treats as a city | yes | map, filters |
| `r` | 196 | Radius in km of an area, for "made there" | yes | `placeMade` |
| `x` | 1,391 (always 1) | Entries **without** `x` appear one zoom step earlier (`c.size<cityMin-(c.x?0:1)`). What `x` stands for cannot be established from the code; the 228 entries without it are the same 228 without `kind` | yes | `template.html:918` |
| `note` | 26 | Editorial note (for example on Kosovo's code) | **no** | never read |

### `isoLang.json`: object, 139 entries. country → prompt language code. Read by `langOfPlace`, `langOfMovement`. Every value has an entry in `langs.json`.

### `cityLang.json`: object, 14 entries. city name → language code where it differs from the country. Read the same way, matched on the city's current `name`. Three keys (`Quebec City`, `Madras`, `Calcutta`) match no `name` in `cities.json` and are never used (faults below).

### `langs.json`: object, 42 languages. language code → prompt wording.

| Field | Meaning | Read |
| :- | :- | :- |
| `name` | Language name for the switch | yes |
| `genreA` / `genreB` | Genre prompt, recorded era / before recording | yes |
| `momentRec`, `momentOld`, `momentHeard`, `momentHome` | Place-and-time prompts: recorded era, before recording, "heard there", "made there" | yes (`template.html:1321`) |
| `labels` | `intro`, `peak`, `recordings`, `tracks`, `pieces` | yes |
| `dates` | `bce`, `decade`, `onward` patterns | yes |

All 42 have all nine fields.

## Songs for a place and time

### `era.json`: object, 36 countries × 9 decades (1940–2020) = 324 decade lists, 5,009 songs.

One entry: country → decade (`"1940"`) → `{note, songs}`.

| Part | Meaning | Read | Where |
| :- | :- | :- | :- |
| `note` | Remark on the decade's research (324, all non-empty) | **no** | never read |
| song pos 0, 1 | Artist, title | yes | seed songs, Data tab, menu search |
| song pos 2 | Release year | yes | `eraSeeds` keeps songs released by the end of the stay and not long before it |
| song pos 3 | `home` (3,593) or `foreign` (1,416) | yes | "heard there" / "made there" |
| song pos 4 | A tag: pop 1,835, dance 948, ballad 757, rock 534, radio 390, film 275, folk 155, other 70, kids 29, religious 16. The Data tab shows it as "scene"; it mixes styles with channels (radio, film) | yes, Data tab only | `30_data.js:30` |
| song pos 5 | Confidence `h` 3,238, `m` 1,766, `l` 5 | yes | `eraSeeds` puts `h` first among equals; Data tab "confidence" |

All songs have six positions. The code also accepts five (no tag), which no longer occur. No source is recorded per song or per decade.

### `yearl.json`: object, 11 countries, 164 year lists, 2,359 songs.

One entry: country → year (`"1970"`) → `{note, songs}`. Coverage: BR 1970s; CA 1970s, 1980s, 2010s; CL 2020–26; ID 2016–25; JP 1980s, 2000s; KR 2000s; MY 1960s; NG 1970s; SE 1950s, 1960s, 1980s; TR 2020–26; US 1940s, 2010s.

| Part | Meaning | Read | Where |
| :- | :- | :- | :- |
| `note` | Remark on the year's list (164, all non-empty) | **no** | never read |
| `status` | Not present in the file. The code reads it on lists that come from the old in-page database (`unreviewed`, `verified`) | (n/a) | `10_people.js:221`, `30_data.js:19` |
| song pos 0, 1 | Artist, title | yes | seed songs, Data tab |
| pos 2 | Release year | yes | only songs released by the end of the stay |
| pos 3 | `home` (1,716) or `foreign` (643) | yes | mixing; "sparse" = under 6 home songs in the year (`researchState`) |
| pos 4 | Rank in the year's list, 1 upward, never repeated within a list | yes | best-ranked first |
| pos 5 | Index into `ysrc.json` (all 2,359 are numbers). The code also accepts a source name here | yes | Data tab source and link |
| pos 6 | Source address when pos 5 is a name | read, but `""` in every song | `30_data.js:25` |
| pos 7 | Scene (`pop` 946, `rock` 193, `schlager` 105, `idol` 90, `country` 76, `franco` 68, …) | yes | alternation of scenes in the seed list; `franco` leads in Quebec cities (`SCENE_PREF`) |

### `ysrc.json`: list, 1,205 entries. `[source title, address]`. Every entry is referenced by at least one song in `yearl.json`. Most common hosts: en.wikipedia.org 463, ja.wikipedia.org 295, worldradiohistory.com 144 (two host spellings), nostalgilistan.se 40.

### `tests.json`: list, 17 entries. One synthetic-listener test run.

| Field | Meaning | Read |
| :- | :- | :- |
| `iso`, `y0`, `y1` | Country and year range tested | yes, to find the test for the current place and time (`07_requests.js:60`) |
| `g` | Genre tested. **No entry has it yet**; the code looks for it (`07_requests.js:69`) | (none present) |
| `date`, `scores`, `result` (`pass` 14, `below` 3), `note` | Shown as "Run …: scored …" | yes (`07_requests.js:37`) |

## Faults

812 faults of 20 kinds are in `faults.json` (one object per line: `file`, `key`, `kind`, `detail`). `faults.py` in this folder regenerates it from `data/` (run from the repository root: `python3 work/2026-11-23-H1/faults.py work/2026-11-23-H1`). Up to ten examples of each kind follow; the file has all of them.

| Kind | Count |
| :- | -: |
| Genres with no definition (`genre_no_definition`) | 132 |
| Playlists with fewer than four songs (`playlist_under_four_songs`) | 42 |
| Status `none` but songs listed (`status_none_with_songs`) | 17 |
| The same song twice in one playlist (`playlist_song_repeated`) | 30 |
| Status `full` with under eight songs (`status_full_but_short`) | 0 |
| The same song spelled differently in different files (`song_spelling_variant_across_files`) | 186 |
| The same song spelled differently within one file (`song_spelling_variant_within_file`) | 23 |
| The same title credited to differently written artists (`song_artist_name_variant`) | 184 |
| Reference track dated before its genre starts (`fit_before_genre_start`) | 7 |
| Reference track dated after its genre ends (`fit_after_genre_end`) | 10 |
| Reference track outside the definition's own window (`fit_outside_window`) | 13 |
| Playlist song dated before its genre starts (`playlist_song_before_genre_start`) | 45 |
| Playlist song dated after its genre ends (`playlist_song_after_genre_end`) | 54 |
| Decade-list song dated outside its decade (`era_song_outside_decade`) | 14 |
| Year-list song released after its year (`year_song_released_after_year`) | 0 |
| Countries in `era.json` with empty decades (`era_empty_decade`) | 0 |
| Thin decades in `era.json` (`era_thin_decade`) | 12 |
| Countries in `yearl.json` with empty decades (`yearl_empty_decade`) | 10 |
| Partly covered decades in `yearl.json` (`yearl_partial_decade`) | 2 |
| Sparse years in `yearl.json` (`yearl_sparse_year`) | 17 |
| Cities without a country (`city_country_missing`) | 3 |
| Contradictory values (`bad_value`) | 2 |
| References to ids that do not exist (`bad_reference`) | 0 |
| Genres missing from a per-genre file (`missing_entry`) | 0 |
| Entries and fields the page never reads (`never_read`) | 9 |

### Genres with no definition: 132

A genre in `nodes.json` with no entry in `defs.json` (and so none in `playlists.json`). The page shows it as "pending". By region: eur 28, seasia 22, afr 20, latam 16, easia 14, mena 12, sasia 12, carib 5, nam 2, casia 1. 43 start before 1900. 131 of the 132 are tier 3 (appear only when zoomed in).

- `nodes.json` `kalevalarunosong`: Kalevala runosong (runolaulu) (500, Joensuu) has no entry in defs.json
- `nodes.json` `ngoma`: Ngoma (East African drum and dance) (1000, Dar es Salaam) has no entry in defs.json
- `nodes.json` `amazighahwashandah`: Amazigh ahwash and ahidus (1000, Ouarzazate) has no entry in defs.json
- `nodes.json` `cheo`: Chèo (1000, Hoa Lư (Ninh Bình)) has no entry in defs.json
- `nodes.json` `catru`: Ca trù (1100, Hanoi) has no entry in defs.json
- `nodes.json` `quanho`: Quan họ (1200, Bắc Ninh) has no entry in defs.json
- `nodes.json` `bihusongs`: Bihu songs (Bihu geet) (1300, Guwahati) has no entry in defs.json
- `nodes.json` `pungmul`: Pungmul (nongak) and Korean folk song (minyo) (1400, Jeonju) has no entry in defs.json
- `nodes.json` `huaer`: Hua'er (1400, Linxia) has no entry in defs.json
- `nodes.json` `kulintang`: Kulintang (1400, Cotabato City) has no entry in defs.json

### Playlists with fewer than four songs: 42

Intro plus peak under four. The genre prompt then falls back to the reference tracks in `defs.json` (`promptFor`, `template.html:675`). 40 of the 42 have status `none` (albums instead); the two with status `thin` (`magyarnota`, `meykhana`) are the ones a visitor gets a prompt for without a playlist behind it.

- `playlists.json` `centralafr`: status none: 1 songs (intro 1, peak 0), 3 albums, fold -> rumbacongo
- `playlists.json` `mbira`: status none: 1 songs (intro 1, peak 0), 2 albums, fold -> chimurenga
- `playlists.json` `marabi`: status none: 2 songs (intro 2, peak 0), 2 albums, fold -> mbaqanga
- `playlists.json` `benga`: status none: 0 songs (intro 0, peak 0), 3 albums, fold -> rumbacongo
- `playlists.json` `bomba`: status none: 2 songs (intro 2, peak 0), 1 albums, fold -> plena
- `playlists.json` `habanera`: status none: 2 songs (intro 2, peak 0), 2 albums, fold -> mambo
- `playlists.json` `lundu`: status none: 1 songs (intro 1, peak 0), 1 albums, fold -> samba
- `playlists.json` `agreek`: status none: 0 songs (intro 0, peak 0), 2 albums, fold -> gregorian
- `playlists.json` `jewish`: status none: 1 songs (intro 0, peak 1), 2 albums, fold -> gregorian
- `playlists.json` `byzantine`: status none: 0 songs (intro 0, peak 0), 1 albums, fold -> gregorian

### Status `none` but songs listed: 17

Not necessarily a fault: the panel still lists these songs, but no prompt is offered. Listed so the lead can decide whether `none` should mean "no songs".

- `playlists.json` `centralafr`: status none but 1 songs listed
- `playlists.json` `mbira`: status none but 1 songs listed
- `playlists.json` `marabi`: status none but 2 songs listed
- `playlists.json` `bomba`: status none but 2 songs listed
- `playlists.json` `habanera`: status none but 2 songs listed
- `playlists.json` `lundu`: status none but 1 songs listed
- `playlists.json` `jewish`: status none but 1 songs listed
- `playlists.json` `yayue`: status none but 1 songs listed
- `playlists.json` `guqin`: status none but 3 songs listed
- `playlists.json` `kcourt`: status none but 2 songs listed

### The same song twice in one playlist: 30

Same artist and title (ignoring case) twice in intro + peak of one genre. The prompt would name it twice.

- `playlists.json` `maskandi`: busi mhlongo - yapheli'mali yami appears 2 times
- `playlists.json` `maskandi`: shwi nomtekhala - ngafa appears 2 times
- `playlists.json` `maskandi`: inkabi zezwe - umbayimbayi appears 2 times
- `playlists.json` `kadongokamu`: paulo kafeero - walumbe zaaya appears 2 times
- `playlists.json` `kadongokamu`: bernard kabanda - olugendo appears 2 times
- `playlists.json` `kadongokamu`: herman basudde - bus dunia appears 2 times
- `playlists.json` `makossa`: manu dibango - soul makossa appears 2 times
- `playlists.json` `makossa`: sam fan thomas - african typic collection appears 2 times
- `playlists.json` `makossa`: golden sounds - zangalewa appears 2 times
- `playlists.json` `fuji`: adewale ayuba - bubble appears 2 times

### Status `full` with under eight songs: 0

### The same song spelled differently in different files: 186

Artist and title are equal once case, accents, punctuation, spaces, a leading "the/a/an", "&"/"and" and anything in brackets are ignored, but the stored text differs, and the forms occur in more than one file. Of the 186, 132 differ only in capitalisation; 26 have a bracketed part in one form only (a remix or featuring credit, or a romanised name); the rest differ by accents, punctuation, "The", or spacing in a transliteration. The page's own `sameTitle()` would treat most of these as one song when it de-duplicates seed lists; the Data tab and any future song table would not.

- `defs.json,playlists.json` `liljonandeastsideboyz|getlow`: forms: Lil Jon & The East Side Boyz - Get Low / Lil Jon & the East Side Boyz - Get Low ; at defs.json:southern.near, playlists.json:southern
- `defs.json,era.json,playlists.json` `nelly|hotinherre`: forms: Nelly - Hot In Herre / Nelly - Hot in Herre ; at defs.json:poprap.fits, era.json:US.2000, playlists.json:poprap
- `defs.json,era.json,playlists.json` `50cent|indaclub`: forms: 50 Cent - In Da Club / 50 Cent - In da Club ; at defs.json:poprap.fits, era.json:NG.2000, era.json:US.2000, playlists.json:poprap
- `defs.json,playlists.json` `kidcudi|daynnite`: forms: Kid Cudi - Day 'n' Nite / Kid Cudi - Day 'n' Nite (Crookers Remix) / Kid Cudi (Crookers remix) - Day 'n' Nite ; at defs.json:bloghouse.fits, defs.json:melodic.fits, playlists.json:bloghouse, playlists.json:melodic
- `defs.json,era.json,playlists.json,yearl.json` `samsmith|staywithme`: forms: Sam Smith - Stay With Me / Sam Smith - Stay with Me ; at defs.json:soulpop.fits, era.json:GB.2010, playlists.json:soulpop, yearl.json:US.2014
- `defs.json,playlists.json,yearl.json` `kesha|tiktok`: forms: Kesha - TiK ToK / Kesha - Tik Tok ; at defs.json:electropop.fits, playlists.json:electropop, yearl.json:CA.2010, yearl.json:US.2010
- `defs.json,playlists.json` `rhythimisrhythim|stringsoflife`: forms: Rhythim Is Rhythim - Strings of Life / Rhythim Is Rhythim (Derrick May) - Strings of Life ; at defs.json:house.near, defs.json:techno.fits, playlists.json:house, playlists.json:techno
- `defs.json,era.json,playlists.json` `irakere|bacalaoconpan`: forms: Irakere - Bacalao con Pan / Irakere - Bacalao con pan ; at defs.json:songo.fits, era.json:CU.1970, playlists.json:songo
- `defs.json,playlists.json` `mariacallas|habanera`: forms: Maria Callas - Habanera / Maria Callas - Habanera (Carmen) ; at defs.json:zarzuela.near, playlists.json:opera
- `defs.json,playlists.json` `amaliarodrigues|estranhaformadevida`: forms: Amália Rodrigues - Estranha Forma de Vida / Amália Rodrigues - Estranha forma de vida ; at defs.json:fado.fits, defs.json:morna.near, playlists.json:fado

### The same song spelled differently within one file: 23

As above, but all forms are in one file (mostly the same song across countries in `era.json`).

- `playlists.json` `triomatamoros|sondelaloma`: forms: Trio Matamoros - Son de la Loma / Trío Matamoros - Son de la Loma ; at playlists.json:mambo, playlists.json:son
- `playlists.json` `laroux|inforkill`: forms: La Roux - In for the Kill / La Roux - In for the Kill (Skream's Let's Get Ravey Remix) ; at playlists.json:dubstep, playlists.json:electropop
- `era.json` `lasketchup|asereje`: forms: Las Ketchup - Aserejé / Las Ketchup - Aserejé (The Ketchup Song) ; at era.json:DE.2000, era.json:DK.2000, era.json:ES.2000, era.json:FI.2000, era.json:FR.2000, era.json:GR.2000, era.json:IT.2000, era.json:PT.2000 …
- `era.json` `shakira|hipsdontlie`: forms: Shakira - Hips Don't Lie / Shakira - Hips Don't Lie (feat. Wyclef Jean) ; at era.json:CL.2000, era.json:DE.2000, era.json:DK.2000, era.json:EG.2000, era.json:ES.2000, era.json:FR.2000, era.json:GR.2000, era.json:IE.2000 …
- `era.json` `losdelrio|macarena`: forms: Los Del Rio - Macarena / Los Del Rio - Macarena (Bayside Boys Remix) / Los del Río - Macarena / Los del Río - Macarena (Bayside Boys Remix) ; at era.json:BR.1990, era.json:DE.1990, era.json:ES.1990, era.json:FR.1990, era.json:GR.1990, era.json:IT.1990, era.json:MX.1990, era.json:PT.1990 …
- `era.json` `shakira|latortura`: forms: Shakira - La Tortura / Shakira - La tortura ; at era.json:AR.2000, era.json:ES.2000, era.json:MX.2000
- `era.json` `luisfonsi|despacito`: forms: Luis Fonsi - Despacito / Luis Fonsi - Despacito (feat. Daddy Yankee) ; at era.json:AR.2010, era.json:BR.2010, era.json:CL.2010, era.json:CU.2010, era.json:EG.2010, era.json:FR.2010, era.json:GB.2010, era.json:GR.2010 …
- `era.json` `jbalvin|migente`: forms: J Balvin - Mi Gente / J Balvin - Mi gente ; at era.json:CL.2010, era.json:MX.2010
- `era.json` `celinedion|myheartwillgoon`: forms: Celine Dion - My Heart Will Go On / Céline Dion - My Heart Will Go On ; at era.json:BR.1990, era.json:CA.1990, era.json:CN.1990, era.json:DE.1990, era.json:EG.1990, era.json:GB.1990, era.json:ID.1990, era.json:IR.1990 …
- `era.json` `gotye|somebodythatiusedtoknow`: forms: Gotye - Somebody That I Used To Know / Gotye - Somebody That I Used to Know ; at era.json:GB.2010, era.json:NL.2010, era.json:PL.2010, era.json:US.2010

### The same title credited to differently written artists: 184

Same normalised title; one normalised artist name contains the other (for example "Usher" and "Usher feat. Lil Jon & Ludacris", "Sousa" and "Sousa's Band"). Most are featured-artist credits written in one place and not another. A few may be different songs that share a title and an artist name fragment; these are candidates for a person to check, not confirmed duplicates.

- `defs.json,era.json,playlists.json` `drdre~drdrefeatsnoopdoggydogg|nuthinbutgthang`: "Nuthin' but a 'G' Thang" credited to "Dr. Dre" (era.json:US.1990) and to "Dr. Dre feat. Snoop Doggy Dogg" (defs.json:boombap.near, defs.json:gfunk.fits, playlists.json:gfunk)
- `era.json` `2pac~2pacdrdre|californialove`: "California Love" credited to "2Pac" (era.json:US.1990) and to "2Pac, Dr. Dre" (era.json:NG.1990)
- `defs.json,era.json,playlists.json` `2pac~2pacfeatdrdre|californialove`: "California Love" credited to "2Pac" (era.json:US.1990) and to "2Pac feat. Dr. Dre" (defs.json:gfunk.fits, playlists.json:gfunk)
- `defs.json,playlists.json` `liljonandeastsideboyz~liljonandeastsideboyzfeatyingyangtwins|getlow`: "Get Low" credited to "Lil Jon & The East Side Boyz" (defs.json:southern.near, playlists.json:southern) and to "Lil Jon & the East Side Boyz feat. Ying Yang Twins" (defs.json:crunk.fits, playlists.json:crunk)
- `defs.json,era.json,playlists.json` `usher~usherfeatliljonandludacris|yeah`: "Yeah!" credited to "Usher" (era.json:JM.2000, era.json:NG.2000, era.json:US.2000) and to "Usher feat. Lil Jon & Ludacris" (defs.json:crunk.fits, playlists.json:crunk)
- `defs.json,playlists.json` `youngjeezy~youngjeezyfeatakon|soulsurvivor`: "Soul Survivor" credited to "Young Jeezy" (playlists.json:moderntrap) and to "Young Jeezy feat. Akon" (defs.json:trap.fits, playlists.json:trap)
- `defs.json,playlists.json,yearl.json` `migos~migosfeatliluzivert|badandboujee`: "Bad and Boujee" credited to "Migos" (playlists.json:moderntrap) and to "Migos feat. Lil Uzi Vert" (defs.json:moderntrap.fits, yearl.json:US.2017)
- `defs.json,playlists.json` `chiefkeef~chiefkeeffeatlilreese|idontlike`: "I Don't Like" credited to "Chief Keef" (defs.json:drill.fits) and to "Chief Keef feat. Lil Reese" (playlists.json:drill)
- `defs.json,era.json,playlists.json` `beyonce~beyoncefeatjayz|crazyinlove`: "Crazy in Love" credited to "Beyoncé" (era.json:CA.2000, era.json:GB.2000, era.json:JM.2000) and to "Beyoncé feat. Jay-Z" (defs.json:y2krnb.fits, playlists.json:y2krnb)
- `defs.json,era.json,playlists.json` `davidguetta~davidguettafeatsia|titanium`: "Titanium" credited to "David Guetta" (era.json:FR.2010) and to "David Guetta feat. Sia" (defs.json:edm.near, defs.json:edmpop.fits, defs.json:electropop.near)

### Reference track dated before its genre starts: 7

`defs.json` fits whose year is earlier than the genre's start year in `nodes.json` position 4. Only genres starting in 1890 or later are checked (before that, a year is a modern recording of old repertoire).

- `defs.json` `emorap`: Lil Peep - Star Shopping (2015) is earlier than the genre start 2016 in nodes.json
- `defs.json` `lofihiphop`: Nujabes feat. Shing02 - Luv(sic) (2001) is earlier than the genre start 2013 in nodes.json
- `defs.json` `lofihiphop`: Nujabes - Feather (2005) is earlier than the genre start 2013 in nodes.json
- `defs.json` `lofihiphop`: J Dilla - Don't Cry (2006) is earlier than the genre start 2013 in nodes.json
- `defs.json` `shibuyakei`: Flipper's Guitar - Groove Tube (1991) is earlier than the genre start 1993 in nodes.json
- `defs.json` `postpunk`: Gang of Four - Damaged Goods (1978) is earlier than the genre start 1979 in nodes.json
- `defs.json` `chutney`: Sundar Popo - Nana & Nani (1969) is earlier than the genre start 1970 in nodes.json

### Reference track dated after its genre ends: 10

Year later than `ends.json`. Several are modern recordings of old repertoire (Joshua Rifkin's ragtime, 1970) and may be intended.

- `defs.json` `mexbolero`: Luis Miguel - No sé tú (1991) is later than the genre end 1970 in ends.json
- `defs.json` `impression`: Walter Gieseking - Debussy: Préludes, Book I (1953) is later than the genre end 1925 in ends.json
- `defs.json` `rabindra`: Debabrata Biswas - Je Raate Mor Duarguli (1960) is later than the genre end 1941 in ends.json
- `defs.json` `rabindra`: Kishore Kumar - Ami Chini Go Chini Tomare (1964) is later than the genre end 1941 in ends.json
- `defs.json` `rabindra`: Suchitra Mitra - Bengali Songs of Rabindranath (1979) is later than the genre end 1941 in ends.json
- `defs.json` `ragtime`: Joshua Rifkin - Maple Leaf Rag (1970) is later than the genre end 1918 in ends.json
- `defs.json` `ragtime`: Marvin Hamlisch - The Entertainer (1973) is later than the genre end 1918 in ends.json
- `defs.json` `son`: Buena Vista Social Club - Chan Chan (1997) is later than the genre end 1960 in ends.json
- `defs.json` `palmwine`: S. E. Rogie - Kpindigbee (Morning, Noon, and Night) (1994) is later than the genre end 1960 in ends.json
- `defs.json` `palmwine`: S. E. Rogie - Dieman Noba Smoke Tafee (Dead Men Don't Smoke Marijuana) (1994) is later than the genre end 1960 in ends.json

### Reference track outside the definition's own window: 13

Year more than two years outside the `window` text of the same definition. Overlaps the two kinds above.

- `defs.json` `lofihiphop`: Nujabes feat. Shing02 - Luv(sic) (2001) is outside the definition window "2013 onward"
- `defs.json` `lofihiphop`: Nujabes - Feather (2005) is outside the definition window "2013 onward"
- `defs.json` `lofihiphop`: J Dilla - Don't Cry (2006) is outside the definition window "2013 onward"
- `defs.json` `mexbolero`: Luis Miguel - No sé tú (1991) is outside the definition window "1928–1970"
- `defs.json` `impression`: Walter Gieseking - Debussy: Préludes, Book I (1953) is outside the definition window "1890–1925"
- `defs.json` `rabindra`: Debabrata Biswas - Je Raate Mor Duarguli (1960) is outside the definition window "1890–1941"
- `defs.json` `rabindra`: Kishore Kumar - Ami Chini Go Chini Tomare (1964) is outside the definition window "1890–1941"
- `defs.json` `rabindra`: Suchitra Mitra - Bengali Songs of Rabindranath (1979) is outside the definition window "1890–1941"
- `defs.json` `ragtime`: Joshua Rifkin - Maple Leaf Rag (1970) is outside the definition window "1895–1918"
- `defs.json` `ragtime`: Marvin Hamlisch - The Entertainer (1973) is outside the definition window "1895–1918"

### Playlist song dated before its genre starts: 45

Release year from `yrs` more than one year earlier than the genre start. Many are intro songs (the prompt asks for "a few early tracks"), so some are intended; listed so a person can judge.

- `playlists.json` `swing`: Fletcher Henderson - Sugar Foot Stomp (1925) is earlier than the genre start 1930
- `playlists.json` `citypop`: Happy End - Kaze wo Atsumete (1971) is earlier than the genre start 1975
- `playlists.json` `mambo`: Trio Matamoros - Son de la Loma (1928) is earlier than the genre start 1938
- `playlists.json` `mambo`: Don Azpiazu - El Manisero (The Peanut Vendor) (1930) is earlier than the genre start 1938
- `playlists.json` `gospel`: Blind Willie Johnson - Dark Was the Night, Cold Was the Ground (1928) is earlier than the genre start 1930
- `playlists.json` `gospel`: Arizona Dranes - He Is My Story (1926) is earlier than the genre start 1930
- `playlists.json` `rocknroll`: Jackie Brenston - Rocket 88 (1951) is earlier than the genre start 1954
- `playlists.json` `exotica`: Les Baxter - Quiet Village (1951) is earlier than the genre start 1957
- `playlists.json` `exotica`: Yma Sumac - Taita Inty (1950) is earlier than the genre start 1957
- `playlists.json` `britbeat`: The Shadows - Apache (1960) is earlier than the genre start 1962

### Playlist song dated after its genre ends: 54

Release year more than one year later than `ends.json`. The prompt asks to "bring me home" at the end, so some late songs may be intended.

- `playlists.json` `ragtime`: Jelly Roll Morton - King Porter Stomp (1923) is later than the genre end 1918
- `playlists.json` `blues`: Howlin' Wolf - Smokestack Lightnin' (1956) is later than the genre end 1950
- `playlists.json` `blues`: B.B. King - The Thrill Is Gone (1969) is later than the genre end 1950
- `playlists.json` `mambo`: Tito Puente - Oye Como Va (1962) is later than the genre end 1960
- `playlists.json` `gospel`: Aretha Franklin - Amazing Grace (1972) is later than the genre end 1970
- `playlists.json` `gospel`: Andrae Crouch - Soon and Very Soon (1976) is later than the genre end 1970
- `playlists.json` `funk`: Cameo - Word Up! (1986) is later than the genre end 1980
- `playlists.json` `prog`: Rush - Tom Sawyer (1981) is later than the genre end 1978
- `playlists.json` `metal`: Megadeth - Symphony of Destruction (1992) is later than the genre end 1990
- `playlists.json` `metal`: Pantera - Walk (1992) is later than the genre end 1990

### Decade-list song dated outside its decade: 14

A song in `era.json` released more than five years before its decade or after it. `eraSeeds` drops songs released long before the stay, so most of these are never offered.

- `era.json` `SE.1940`: Evert Taube - Calle Schewens vals dated 1931, filed under the 1940s
- `era.json` `GB.2020`: Kate Bush - Running Up That Hill (A Deal with God) dated 1985, filed under the 2020s
- `era.json` `IR.1940`: قمرالملوک وزیری (Qamar-ol-Molouk Vaziri) - مرغ سحر (Morgh-e Sahar) dated 1927, filed under the 1940s
- `era.json` `IE.1940`: John McCormack - I Hear You Calling Me dated 1927, filed under the 1940s
- `era.json` `PL.1940`: Hanka Ordonówna - Miłość ci wszystko wybaczy dated 1933, filed under the 1940s
- `era.json` `RU.1940`: Леонид Утёсов - Сердце (Serdtse) dated 1934, filed under the 1940s
- `era.json` `TR.1940`: Seyyan Hanım - Mazi dated 1932, filed under the 1940s
- `era.json` `ID.1950`: Gesang - Bengawan Solo dated 1940, filed under the 1950s
- `era.json` `PH.1940`: Ruben Tagalog - Bayan Ko dated 1928, filed under the 1940s
- `era.json` `CA.1940`: La Bolduc - Ça va venir découragez-vous pas dated 1930, filed under the 1940s

### Year-list song released after its year: 0

### Countries in `era.json` with empty decades: 0

None: all 36 countries have all nine decades from 1940 to 2020, and every decade list has at least one song. The thin ones follow.

### Thin decades in `era.json`: 12

Decade lists with under six songs.

- `era.json` `IR.1940`: 2 songs (2 home-grown)
- `era.json` `IR.1950`: 5 songs (4 home-grown)
- `era.json` `PL.1940`: 4 songs (3 home-grown)
- `era.json` `TR.1940`: 4 songs (4 home-grown)
- `era.json` `VN.1950`: 5 songs (3 home-grown)
- `era.json` `DK.1940`: 5 songs (2 home-grown)
- `era.json` `CL.1940`: 3 songs (1 home-grown)
- `era.json` `CU.2020`: 3 songs (1 home-grown)
- `era.json` `JM.1940`: 4 songs (0 home-grown)
- `era.json` `NG.1940`: 1 songs (1 home-grown)

### Countries in `yearl.json` with empty decades: 10

A decade with no year lists that lies between a country's first and last year list. Where there is none, the page falls back to the decade list.

- `yearl.json` `CA.1990`: no year lists for the 1990s, though CA has year lists from 1970 to 2019
- `yearl.json` `CA.2000`: no year lists for the 2000s, though CA has year lists from 1970 to 2019
- `yearl.json` `JP.1990`: no year lists for the 1990s, though JP has year lists from 1980 to 2009
- `yearl.json` `SE.1970`: no year lists for the 1970s, though SE has year lists from 1950 to 1989
- `yearl.json` `US.1950`: no year lists for the 1950s, though US has year lists from 1940 to 2019
- `yearl.json` `US.1960`: no year lists for the 1960s, though US has year lists from 1940 to 2019
- `yearl.json` `US.1970`: no year lists for the 1970s, though US has year lists from 1940 to 2019
- `yearl.json` `US.1980`: no year lists for the 1980s, though US has year lists from 1940 to 2019
- `yearl.json` `US.1990`: no year lists for the 1990s, though US has year lists from 1940 to 2019
- `yearl.json` `US.2000`: no year lists for the 2000s, though US has year lists from 1940 to 2019

### Partly covered decades in `yearl.json`: 2

- `yearl.json` `ID.2010`: 4 of the years have lists; missing 2010, 2011, 2012, 2013, 2014, 2015
- `yearl.json` `ID.2020`: 6 of the years have lists; missing 2026

### Sparse years in `yearl.json`: 17

Years the page itself labels "thinly sourced": under six home-grown songs (`researchState`, `template.html:1610`).

- `yearl.json` `MY.1960`: 1 home-grown songs (the page calls a year sparse under 6); 1 songs in all
- `yearl.json` `MY.1961`: 0 home-grown songs (the page calls a year sparse under 6); 2 songs in all
- `yearl.json` `MY.1962`: 2 home-grown songs (the page calls a year sparse under 6); 3 songs in all
- `yearl.json` `MY.1963`: 3 home-grown songs (the page calls a year sparse under 6); 4 songs in all
- `yearl.json` `MY.1965`: 5 home-grown songs (the page calls a year sparse under 6); 8 songs in all
- `yearl.json` `MY.1968`: 4 home-grown songs (the page calls a year sparse under 6); 10 songs in all
- `yearl.json` `MY.1969`: 3 home-grown songs (the page calls a year sparse under 6); 7 songs in all
- `yearl.json` `NG.1970`: 4 home-grown songs (the page calls a year sparse under 6); 6 songs in all
- `yearl.json` `NG.1971`: 4 home-grown songs (the page calls a year sparse under 6); 4 songs in all
- `yearl.json` `NG.1975`: 4 home-grown songs (the page calls a year sparse under 6); 5 songs in all

### Cities without a country: 3

`iso2` is not a key of `iso.json`. The city is drawn, but `isoName` shows the bare code and it belongs to no region, so region filters and the Data tab's country counts miss it.

- `cities.json` `GI:Gibraltar`: iso2 GI is not in iso.json, so the page shows the bare code and the city is in no region
- `cities.json` `TV:Funafuti`: iso2 TV is not in iso.json, so the page shows the bare code and the city is in no region
- `cities.json` `NR:Yaren`: iso2 NR is not in iso.json, so the page shows the bare code and the city is in no region

### Contradictory values: 2

- `st.json` `metal`: peak end 1991 after the genre end 1990
- `st.json` `gangsta`: peak end 1993 after the genre end 1992

### References to ids that do not exist: 0

None found: every genre id, tradition id, region, family and country code referred to in any file exists.

### Genres missing from a per-genre file: 0

None found: `st`, `cnt`, `ends`, `scores`, `tier`, `tradOf` and `layout.row` each have exactly the 593 genres.

### Entries and fields the page never reads: 9

- `cityLang.json` `Quebec City`: no city has this name, so the entry is never used
- `cityLang.json` `Madras`: no city has this name, so the entry is never used
- `cityLang.json` `Calcutta`: no city has this name, so the entry is never used
- `era.json` `<every country>.<every decade>.note`: the decade note is never read by the page (324 notes)
- `yearl.json` `<every country>.<every year>.note`: the year note is never read by the page (164 notes)
- `yearl.json` `<every song>[6]`: position 6 (source address when position 5 is a name) is read, but is an empty string in all 2,359 songs; every song uses the numeric ysrc index in position 5
- `cities.json` `<city>.note`: the note field (26 cities) is never read
- `layout.json` `cost`: never read by the page
- `indoc.json` `<all 42 entries>`: read only by renderJourney() in src/template.html, which src/mods/40_journey.js replaces with an empty function, so the "In doc" tag is never shown


## The three "Hebrew chant" dots in Israel

**Finding: not duplicate rows. A drawing effect of how the map groups and fans out genres that are near each other.**

What the data holds. There is exactly one chant genre in or near Israel: `jewish`, "Jewish liturgical chant", start −500, place Jerusalem (31.78, 35.23), status `none` playlist. No two genres in `nodes.json` share a name, and no id repeats. The other genres within reach are all in Tel Aviv:

| Id | Name | Start | Place (lat, lon) |
| :- | :- | :- | :- |
| `jewish` | Jewish liturgical chant | −500 | Jerusalem (31.78, 35.23) |
| `hebrewsong` | Hebrew folk song (Shirei Eretz Yisrael) and army troupe song | 1920 | Tel Aviv (32.08, 34.78) |
| `mizrahimusic` | Mizrahi music (muzika mizrahit) | 1960 | Tel Aviv (32.07, 34.77) |
| `israelirock` | Israeli rock | 1969 | Tel Aviv (32.07, 34.77) |
| `israelipsytrance` | Israeli psytrance | 1993 | Tel Aviv (32.08, 34.78) |

What the code does. `CLUSTERS` (`template.html:858`) puts every genre within 0.6° of latitude and of longitude of a group's first member into that group. Jerusalem and Tel Aviv are 0.30° and 0.45° apart, so all five share one group, centred on their average position (about 32.0, 34.87, between the two cities). Zoomed out the group is one ring with a number. Zoomed in, `updatePositions` (`template.html:865`) fans the members out in a spiral 11 pixels apart around that average point, ordered by start year. The fanned dots are therefore side by side and no longer at their own cities: the Jerusalem chant dot is drawn next to the Tel Aviv dots, west of Jerusalem. All five are region `mena`, so they share a base colour and look alike. How many appear depends on the year: before 1960 two (`jewish`, `hebrewsong`), **1960 to 1968 three** (`jewish`, `hebrewsong`, `mizrahimusic`), 1969 to 1992 four, from 1993 five.

How this was checked. The built page (`python3 build.py`) was opened in Chromium with Playwright, the map tab opened, the view centred on Israel at five zoom levels in both projections and four years, and the map's own hit list (`MAPHITS`) read back. At 1965, zoomed in (60 and 150 pixels per degree, flat and globe), it held exactly three genre dots in Israel: `jewish`, `hebrewsong`, `mizrahimusic`, a few pixels apart. Zoomed out (4 to 20 pixels per degree) the same three were one cluster ring. The world outline does not load in that offline test, so the fan positions there are the plain spiral rather than the "stay on land" variant; the grouping, and so the side-by-side effect, does not depend on it.

What could not be established: which year and zoom the owner was looking at, and whether the three dots were read as "Hebrew chant" because of the hover name of one of them or because all three look alike. The report does not guess which. If the owner saw three dots that each said "Jewish liturgical chant" on hover, that is not what this test found, and the case would need to be reproduced with the owner's settings.

## How the faults were found

`faults.py` (in this folder) reads `data/*.json` only; it does not run the page. The meanings of fields come from reading `src/template.html` and `src/mods/*.js` on `dev`. The Israel finding comes from running the built page as described above. The checks behind each kind are stated with that kind. Two limits:

- "The same song" is decided by text normalisation, not by any song identity (the data has none). It finds spelling variants that normalise to the same text; it cannot find the same song under a translated or wholly different title, and the artist-variant list can contain different songs that share a title.
- "Dated outside its genre's years" uses the start year in `nodes.json`, the end year in `ends.json`, and the `window` text of the definition. Release years of reference tracks in genres older than 1890 are modern recordings and are not checked. Many hits are deliberate (intro songs, revival recordings); they are listed for a person to judge, not as errors.
