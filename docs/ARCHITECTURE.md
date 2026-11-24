# How the site is built

A high-level account for the owner: enough to judge whether the rough shape suits the goal, and to ask the next question. It describes what is on `dev`. It is updated in the same change as any work that alters the shape (principle 26). Where something is not yet understood or not yet decided, it says so.

Last checked against the code: 23 November 2026.

## The shape in one paragraph

The site is one web page. A build script joins the page's markup, its feature modules and all of its data into a single file of about 2.5 MB, which Cloudflare serves as a static file. Everything a visitor does (the tree, the globe, the filters, building a playlist prompt) happens in their browser from that one file. A separate database (Supabase) holds only what belongs to people: accounts, invites, saved trips, usage events and requests. The music data is not in the database; it is in the repository as files.

## The parts

| Part | Where | What it does |
| :- | :- | :- |
| Page | `src/template.html` | Markup, core styles and the core script: tree, map, tunnel, list, filters, prompt building |
| Feature modules | `src/mods/NN_name.js` and `.css` | Added on top of the page in file-name order: interface pieces, config, usage log, requests, accounts, people and admin, filters, data tab, journeys, links, tunnel, satellite map, menu, the iOS styling |
| Music data | `data/` | Songs, artists, genres, places and research state as records with keys, one record per line (below) |
| Build | `build.py`, `serve.py`, `tools/legacy_data.py` | Joins the above into `dist/index.html`, making the data shape the page reads from the data files; `serve.py` does it on every change and serves it locally |
| Database rules | `db/NNN_name.sql` | Numbered files run in order, once per database (dev, then prod on approval) |
| Tests | `tests/`, `db/test.sh` | Below |
| Hosting | `wrangler.jsonc` | Cloudflare serves `dist/`; `main` is the live site, every other branch gets a preview address |

## The music data

The model is [`proposals/2026-11-23-schema.md`](proposals/2026-11-23-schema.md). The files were converted from the 29 files of 23 November by `tools/migrate_2026_11_23.py`, which is kept to show how, and refuses to run again over the new files. What each old field meant is in [`research/2026-11-23-data-inventory.md`](research/2026-11-23-data-inventory.md).

The page has not changed: it still reads the old shape of the data (`nodes`, `playlists`, `era` and so on). `build.py` makes that shape from the new files through `tools/legacy_data.py`, and the built page was checked to be byte for byte the one built from the old files. One key has been added since: `verified`, per scope the number of song links and how many of them the evidence check found (below). That module, and `data/legacy-order.json`, go when the page reads the new shape (step 3 of the move).

Every file is a list with one record per line and named fields, except the few marked as an object or a single value. Records point at each other by key: songs `s_`, artists `a_`, releases `r_`, evidence `e_`, each followed by ten random characters that never change. Genres, countries, regions, families and traditions keep their readable ids (`swing`, `JP`, `eur`). Cities keep their old identity, country code and name, until they get keys.

| File | Records | Holds |
| :- | -: | :- |
| `songs/N.json` (32 files) | 10,915 | One recording: title, credits (artist keys in credit order, each with a role: `main`, `featured` or `with`), and, where several artists are credited, `credit_text`: the credit as it was listed (`Wizkid, Tems`), which is what the page shows. Also first release year, year written where a playlist gave one, and its principal genre where it was chosen for exactly one genre's playlist. Split into files by the first character of the key |
| `artists/N.json` (32 files) | 6,966 | One record per act. Credits naming several acts were split by `tools/split_credits.py` from decisions in `work/2026-11-23-credits/`: a duo or group performing under one name, and a leader with their own named band, is one artist; separately established acts credited together are several. 18 records the split could not decide keep the whole credit and the mark `unsplit`, and so do the 37 joined credits that came in with genre batch 3 (H7), which `tools/ingest.py` does not split |
| `releases.json` | 367 | Albums named as "albums to listen to instead": title, artist keys, and `credit_text` where several are credited |
| `evidence/N.json` (32 files) | 1,597 | A source. 1,205 are the sources behind the year lists, with title and address only: their exact supporting text and a check result were never recorded. 392 came in through `tools/ingest.py` with the exact string (`text`), the date read, and `check` (result `found` and the date of the check) |
| `links/g/<genre>.json` (469 files) | 7,413 | A song (or album) in a genre, with its role: `intro`, `peak`, `reference`, `near miss` (with the genre it belongs to and why) or `album`. Links that came in through `tools/ingest.py` carry their evidence keys and the pass that added them |
| `links/c/<ISO>/<decade>.json` (325 files) | 7,368 | A song in a country's decade list (scope `c:JP:1980s`) or year list (`c:JP:1985`), `home` or `foreign`, with the scene label, and either the confidence (decade lists) or the rank and source (year lists) |
| `scopes/g/<genre>.json`, `scopes/c/<ISO>/<decade>.json` | 469 + 489 | Research state: playlist status (`full`, `thin`, `none`), its note, the genre to use instead, `decade list` or `year list` with its note, and the listener tests run on it. Scopes researched since the move also hold the size estimate (`size`: low, high, core, basis, confidence) and the research passes (`passes`: number, date, who, links added) |
| `genres.json` | 593 | A genre: name, region, family, tradition, start and end year, place of origin (text, position, country), definition (window, sound, markers, and for definitions that came in through `tools/ingest.py` the keys of the evidence behind it), four judgements (significance, ease, fame, intrigue), tree note, and for now the zoom tier and tree row |
| `parentage.json` | 1,176 | A line of the tree: parent, child, `principal` or `other` |
| `presence.json` | 5,510 | Where and when a genre was heard: region or country, `peak` with the peak years or `later` with the year it arrived, and a strength for peak countries. All marked `first estimate` |
| `traditions.json`, `families.json`, `regions.json` | 163, 20, 10 | Traditions with their family; families with their order on the tree; regions |
| `countries.json`, `cities.json` | 226, 1,619 | Countries with region, prompt language and the names the world outline uses for them; cities and areas with position, years, historical names, size, and prompt language where it differs |
| `layout.json` | object | The tree's lanes (traditions per family, in order), rows per lane, and the stored `cost` of the layout |
| `langs.json` | 42 | Prompt wording per language. Not part of the model; unchanged |
| `known.json`, `done.json`, `indoc.json`, `method.json` | 26, 3, 42, text | Unchanged: genres journeys treat as familiar, the three a new visitor starts with as listened, a dead list (roadmap 2.9), the tree's method text |
| `legacy-order.json` | object | Only for the old shape: orders the model does not decide (for example the order of genres in the old `defs.json`) and three city language entries that match no city. Dropped with `tools/legacy_data.py` |

`tests/data.py` checks the rules: the tree's one principal parent and at most two others, every key well formed and unique, every link, credit, evidence and id pointing at something that exists, a credit's role being `main`, `featured` or `with`, a song or release with several credited artists having `credit_text`, no artist record that nothing is credited to, a song's genre backed by its genre's playlist, every evidence key on a definition existing, every checked evidence record having its text and address, and every scope with research passes having a size estimate.

Lists the conversion made for a decision, without merging or changing anything, are in `work/2026-11-23-schema/`: 809 near matches between songs, 71 songs chosen for more than one genre's playlist (left without a genre), 165 songs listed with different release years (left without one on the song; each list keeps its own), and 35 genres whose family differs from their tradition's family.

**Known weaknesses**, after this step:

- Fixed: a song is a record with a key, and a genre playlist, a decade list and a year list point at the same record when the text is identical. Entries are named fields, not positions. The tree's lines are stored once and the parent rule is checked. Presence has an explicit strength instead of a meaningful order.
- Fixed: a song credited to several acts points at each act's own record, with a role (731 songs and 18 releases; 648 artist records added, 685 combined ones removed).
- Not fixed: 18 credits are still one unsplit record each (listed in `work/2026-11-23-credits/decisions.json` as `unsure`: field recordings, compilations, acts not known, and names that would have to be split in both their original script and the romanised form). Artists are matched by exact name only, so spelling and case variants of one act are still separate records (`ROSALÍA` and `Rosalía`, `KAROL G` and `Karol G`, about 30 pairs). The split decisions were made from general knowledge, without sources, and are the owner's to review. Near matches between songs are listed, not merged, so the same recording spelled two ways is still two songs. No weights or tiers exist yet; passes and size estimates only for the genres researched since. Release years that disagree between lists are not settled. Evidence for the year lists has no supporting text and was never checked; only the eight genres of batch 3 have checked evidence. Year written sits on the song, because compositions do not exist yet. Three cities (Gibraltar, Funafuti, Yaren) point at countries that are not in `countries.json`; `tests/data.py` reports them as known faults.
- The page still reads the old shape, through `tools/legacy_data.py`, and all of it still ships to every visitor in one file (roadmap 2.10).

**How a genre gets a place on the tree.** Each genre's row on the tree is stored in `data/genres.json`, with the lane order, lane sizes and cost in `data/layout.json`. The method that computed them (`tools/layout/original/opt5.py`, recovered from the workspace; it read a data file of the old artifact and cannot run) is ported in `tools/layout/optimise.py`, which reads today's files. `check` finds the stored layout valid by the method's rule (no two labels collide at the zoom where they show) and its cost within 0.24% of the stored cost; the remaining difference comes from inputs the original read that are lost, and is explained in [`../tools/layout/README.md`](../tools/layout/README.md). `place` gives new genres the best valid rows with every existing row fixed, growing a lane only when nothing fits; with `--write` it fills in genres added to `data/genres.json` without a row. `optimise` is the original's full search; on today's data a 2-million-step run has not yet matched the stored layout, which stays in use. A new tradition (a new lane) is not supported yet. The layout is still stored, not computed by the build (roadmap 2.13).

## How researched work enters the data

1. **A helper hands back candidates.** A helper run writes only in `work/<date>-<id>/`: definitions and playlists in the old shape (`defs.add.json`, `playlists.add.json`), a size estimate per genre (`sizes.json`), and every claim behind them with its address, the exact string copied from the raw page and the date read (`sources.json`). It makes no keys.
2. **The check script decides what is verified.** `tools/check_evidence.py` fetches each address once and looks for the string, with no model involved. The lead runs it (`evidence-check.lead.json`). A song, album or near miss is verified when a claim naming it (same artist and title, ignoring case and outer spaces) was `found`; a definition when at least one of its claims was.
3. **`tools/ingest.py` writes it.** `python3 tools/ingest.py work/<folder>` prints what it would do; `--write` does it. It leaves out everything not verified and lists it with the reason, matches songs, artists and releases against the master table by exact credit and title (reusing the key or minting one), never splits a credit, makes one evidence record per address and string, and writes the genre's links, its scope (status, note, size, pass) and its definition with its evidence keys. A `full` list left with fewer than 12 playlist songs becomes `thin`. A second run changes nothing; a genre that already has a definition, scope or links is refused unless `--replace` is given. It does not settle near matches (the same recording spelled two ways) or spelling differences between a hand-back and its claims: those are left out and listed for the lead.
4. **The page shows Verified.** The build counts, per genre and per country decade, the song links and how many have evidence the check found (`DATA.verified`). The Research row and card say **Verified** when all are, **Partly verified** with "N of M songs checked against their source" when some are, and **Unverified** when none are, which is every list collected before claims were checked one by one.

The first batch through it was genre batch 3 (H7, eight genres): 229 of 233 song entries and all 57 albums went in, 215 new songs, one reused, 114 new artists, 57 releases and 392 evidence records.

Chart rows take a second road (decision D22): `tools/wiki_charts.py` reads Wikipedia's chart list pages into rows; `tools/chart_rows.py` turns them into candidates per country and year; `tools/check_chart_rows.py` checks each row's title and artist against the live page; `tools/ingest_charts.py` writes the found rows as year lists with the link role `charted` (heard there; the artist's country not recorded). A charted link also carries `quote` and `check` (what was checked, and when), and `chart_pos` for a year-end chart or `peak` and `led_from` for a number one.

## What is in the database

Only things that belong to people. Every table starts with all access removed; row-level security is on; each permission the site uses is granted by name. A visitor who is not signed in can read nothing.

| Table | Holds | Who can do what |
| :- | :- | :- |
| `profiles` | Handle, role (beta, principal, owner), status (active from sign-in since file 006; pending is no longer given; suspended) | A person reads and names their own; the owner manages all. Capped at 1,000 |
| `invites` | Codes that expire after 14 days | Active members create up to 3; anyone signed in can redeem |
| `trips` | A saved playlist request: place, years, genre (all as stable keys), status, rating, note | Active members, their own rows only |
| `events` | Usage events from testers | Insert only; the owner reads |
| `anon_events` | Usage events from visitors without an account; keeps the newest 250,000 | Insert only, rate-limited; the owner reads |
| `requests` | Requests for a listener test or for research. One row per distinct thing asked for, with a count of asks and a weight (an ask spread over several decades gives each an equal share of one request) | Anyone can add through two functions (`request_add`, `request_many`); the owner reads and settles |
| `ideas` | The owner's list of features that could be built, in his order | Owner only |

Two databases: dev (used by every address except the live one) and prod. Prod is changed only by running the numbered files, with the owner's approval.

`admin_usage(days)` gives the owner one summary of both usage logs and the travel log (file 007). New accounts are active from sign-in (file 006).

## How it is tested

| Test | What it proves | What it does not |
| :- | :- | :- |
| `tests/data.py` | The data obeys the model's rules: tree parents, keys, every reference resolves, song genres backed by playlists, checked evidence complete | That the facts are true |
| `tests/layout.py` | The stored tree layout obeys the label rule, its cost by the ported method is within 0.25% of the stored cost, and two made-up genres can be placed validly without moving any existing row | That the layout is the best one, or that the port matches the original exactly (it does not reproduce the last 0.24%) |
| `tests/smoke.py` | The built page opens on a phone and a desktop size with no script errors, every tab opens, no sideways scroll | That anything on the tabs is correct |
| `tests/account.py` | Sign-in, pending and active states, invites, saving trips, usage events, the admin page, the playlist panel for genres and for place and time, requests and reruns: each as a scripted visit | It runs against a stand-in for the database, so it does not prove the real database answers the same way |
| `tests/links.py` | Opening an address puts the app in the state it carries (view, place, time, genre, open playlist); the address follows changes without filling the back button; round trips for several states; unreadable values are ignored; Copy link copies an address that reproduces the state; no sideways scroll at 400 px | Behaviour on the hosted address and in real messaging apps (it runs from a `file:` address) |
| `db/test.sh` | The access rules: who can read and write what, the caps and flood guards, on a throwaway local database with the real SQL files | That the hosted database has had the same files run |
| Evidence check (`tools/check_evidence.py`) | That the page at a recorded address contains the recorded string, for every claim, with no model involved | It cannot read sites that refuse scripts (about a quarter of sources in the first run); those and every failure go to an agent. It says a source contains a string, not that the source is right |
| Synthetic listener tests (`tests/listener/`) | Whether a playlist's seed songs feel right to a simulated local of that place and time, scored 1 to 10. Each run records the brief version, the data commit, the exact prompts judged and the model, so it can be repeated. [`COVERAGE.md`](COVERAGE.md) is generated from the data and the runs: what is researched, what is tested, what is owed | Nothing about a real person. The judging step is an agent on a named model, not a script. The 17 results from before the registry are provisional |

Not tested at all today: the correctness of the music data itself (beyond its structure and the listener rounds), the map and tunnel drawing, journeys, and the real sign-in round trip with Google.

## How a request works

The playlist panel is one sheet with two modes, a genre or a place and time. Both show two rows.

- **Research** speaks in the pieces research is actually done in. For a genre that is the genre. For a place and time it is one country, decade by decade from the 1940s. A wide time filter lists its decades as researched, requested or not yet, and one button asks for the rest as a single request shared between them.
- **Synthetic listener test** is about exactly what is on screen: the filters and the prompt are logged as they are, to be judged later.
- "Done" comes from the data on the page (research) and from the tests recorded on each scope in `data/scopes/` (listener tests). "Requested" is remembered in the visitor's browser only, because visitors cannot read the request list.
- Only the owner is offered a rerun of finished work.

## The first visit

A visitor who is not signed in sees a landing page (`src/mods/89_landing.js`): sign in, or explore without an account. Either way leads to the guided start (`src/mods/90_welcome.js`): one question, then three hints in the playlist sheet. Both are skipped for a shared link, and by the automated tests. Reasons: `DECISIONS.md` D19.

## The playlist panel

One panel serves a place and time and a genre. Its title gives the place and the span of years (or the genre's name), with "heard there" or "made there" as a subtitle; both are set in the filter bar, not in the panel. Under the title are four tabs:
- **Songs:** the songs the site holds, five at first. A row unfolds the song's details; its play arrow opens the song on the service chosen with "Play on".
- **Listen:** a row of services, and for each a short list of what it offers: a ready-made playlist (in development), the playlist prompt for Spotify with its own language and name-script options, an exact playlist through TuneMyMusic, a search, or the plain song list.
- **Sounds** (a place and time only): the genres alive there then.
- **Research:** how the list was made and checked, and the requests.
On a phone only one bottom sheet shows at a time: a filter sheet takes the playlist sheet's place and the playlist button brings it back. The playlist sheet keeps one height across its tabs and is sized by dragging. Every way of listening is an outside link: the site plays nothing itself. The reasons for this layout are in `DECISIONS.md` D17.

## Sub-genres and duplicates

A genre record may carry `subgenres`: names of closely related styles folded into it (`DECISIONS.md` D10). They appear on the genre's entry as "Includes" and are found by search; they have no records, playlists or tests of their own.

A song is stored once. `tools/merge_duplicates.py` merges records with the same title, main artists and release year (D14), and `tests/data.py` fails if such a pair exists. The Data tab lists each song once; a song that sits in several lists shows "In N lists" and unfolds them.

## The course, trip feedback and the admin page

The Journey tab opens on the course (`src/mods/40_journey.js`, section 0): chapters are computed in the page from the genre records, nothing is stored. Trip feedback (`src/mods/10_people.js`): `engage()` logs a trip when a playlist is used; `fbPaint()` draws the feedback row under the panel's tabs. The admin page's four parts, the usage summary and the ideas list are in the same module. Reasons: decisions D23 to D25.

## Links

The view is also put into words, such as "Canada · 1980–2020 · Country", by one function (`src/worker/title.js`). The page uses it for the tab title and the share sheet. A small Worker (`src/worker/index.js`, the only code that runs on Cloudflare) uses it to write the same words into the title and preview tags of the page it serves, because chat apps build a link preview without running the page. The Worker runs for the page address only; everything else is served as plain files. The preview image and the site icon are in `src/static/`. Reasons and limits: `DECISIONS.md` D12.

A Share button in the top bar (on every view) sends the address of what is on screen: on a phone it opens the system share sheet, elsewhere it copies the link and says so. "Copy link" in the playlist panel does the same for a playlist.

The address carries what the person is looking at, so it can be sent to someone else (roadmap 5.1). Everything in it is a stable key, never a name or a list position, and anything left at its default is left out, so the plain address stays plain. As the person changes a filter, the view or the playlist, the address is rewritten in place (no new back-button step), at most twice a second. "Copy link" in the playlist panel copies it. Opening an address applies each value it can read and ignores each it cannot, so a link from an older version still opens the app. The code is `src/mods/45_links.js`.

| Parameter | Meaning | Example |
| :- | :- | :- |
| `v` | The view (left out for the tree) | `v=map` |
| `p` | The place: a continent, country or city, or several joined by `+` after `multi:` | `p=cty:JP`, `p=city:JP:Tokyo`, `p=multi:cty:JP+reg:eur` |
| `y` | The year (left out for 2026); negative for BCE | `y=1985`, `y=-500` |
| `s` | The stay: years either side (`0` is just that year), `until` (everything up to the year, the default, left out), or `from:` a start year | `s=0`, `s=5`, `s=from:1960` |
| `g` | The genre filter: a family, tradition or movement, or several after `multi:` | `g=band:chant`, `g=mov:swing`, `g=multi:trad:hymnody+mov:swing` |
| `tm` | Time counts what was born then, not what was alive then | `tm=made` |
| `pm` | Place counts what was made here, not what was heard here | `pm=made` |
| `m` | The place-and-time playlist uses only music made there. Applied for that visit only: it does not change the visitor's own saved choice | `m=home` |
| `pl` | An open playlist: `1` for the place-and-time panel, a genre id for that genre's playlist (which opens in the list) | `pl=1`, `pl=swing` |
| `sel` | The selected genre (left out when `pl` already names it) | `sel=citypop` |

The sign-in return and invite links use the address too (`code`, `error`, `error_description`, `invite`). The links module never writes or removes those. The account module clears the whole query when it reads them, before the links module runs, so a link state arriving together with one of them is lost; the app itself never makes such a combination (sign-in returns to the plain address, and invite links carry only the invite). The usage log records `share` when a link is copied and `open_link` when the app opens from an address with state, with the keys only.

## Decisions and why

| Decision | Why | What it costs |
| :- | :- | :- |
| One static page, no server of our own | Free to host at any traffic, nothing to keep running, works offline once loaded | All data ships to everyone; no server-side search |
| Music data as files in the repository | Every change is reviewable and reversible in git; research runs arrive as branches | Not queryable; size is limited by the page |
| People's data in a hosted database with rules in SQL | Free tier, sign-in included, and the rules can be tested | A second system to keep in step; free-tier limits (500 MB) |
| Google sign-in only | The database's own email sending cannot serve the public | People without a Google account cannot join |
| Saved history points at data by stable key | Renaming or reordering data never breaks someone's history | Keys can never be reused or changed |
| Requests are logged, not run on the spot | The hosted site has no way to run a listener or research; a logged request can be batched | The person waits and does not yet see the result (roadmap 8.1b) |
