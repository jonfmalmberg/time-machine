# How the site is built

A high-level account for the owner: enough to judge whether the rough shape suits the goal, and to ask the next question. It describes what is on `dev`. It is updated in the same change as any work that alters the shape (principle 26). Where something is not yet understood or not yet decided, it says so.

Last checked against the code: 23 November 2026.

## The shape in one paragraph

The site is one web page. A build script joins the page's markup, its feature modules and all of its data into a single file of about 2.5 MB, which Cloudflare serves as a static file. Everything a visitor does (the tree, the globe, the filters, building a playlist prompt) happens in their browser from that one file. A separate database (Supabase) holds only what belongs to people: accounts, invites, saved trips, usage events and requests. The music data is not in the database; it is in the repository as files.

## The parts

| Part | Where | What it does |
| :- | :- | :- |
| Page | `src/template.html` | Markup, core styles and the core script: tree, map, tunnel, list, filters, prompt building |
| Feature modules | `src/mods/NN_name.js` and `.css` | Added on top of the page in file-name order: interface pieces, config, usage log, requests, accounts, people and admin, filters, data tab, journeys, tunnel, satellite map, menu, the iOS styling |
| Music data | `data/` | Songs, artists, genres, places and research state as records with keys, one record per line (below) |
| Build | `build.py`, `serve.py`, `tools/legacy_data.py` | Joins the above into `dist/index.html`, making the data shape the page reads from the data files; `serve.py` does it on every change and serves it locally |
| Database rules | `db/NNN_name.sql` | Numbered files run in order, once per database (dev, then prod on approval) |
| Tests | `tests/`, `db/test.sh` | Below |
| Hosting | `wrangler.jsonc` | Cloudflare serves `dist/`; `main` is the live site, every other branch gets a preview address |

## The music data

The model is [`proposals/2026-11-23-schema.md`](proposals/2026-11-23-schema.md). The files were converted from the 29 files of 23 November by `tools/migrate_2026_11_23.py`, which is kept to show how, and refuses to run again over the new files. What each old field meant is in [`research/2026-11-23-data-inventory.md`](research/2026-11-23-data-inventory.md).

The page has not changed: it still reads the old shape of the data (`nodes`, `playlists`, `era` and so on). `build.py` makes that shape from the new files through `tools/legacy_data.py`, and the built page was checked to be byte for byte the one built from the old files. That module, and `data/legacy-order.json`, go when the page reads the new shape (step 3 of the move).

Every file is a list with one record per line and named fields, except the few marked as an object or a single value. Records point at each other by key: songs `s_`, artists `a_`, releases `r_`, evidence `e_`, each followed by ten random characters that never change. Genres, countries, regions, families and traditions keep their readable ids (`swing`, `JP`, `eur`). Cities keep their old identity, country code and name, until they get keys.

| File | Records | Holds |
| :- | -: | :- |
| `songs/N.json` (32 files) | 10,700 | One recording: title, credits (artist keys with a role), first release year, year written where a playlist gave one, and its principal genre where it was chosen for exactly one genre's playlist. Split into files by the first character of the key |
| `artists/N.json` (32 files) | 6,889 | One record per credit as written today (`Wizkid, Tems` is one artist record), marked `unsplit` |
| `releases.json` | 310 | Albums named as "albums to listen to instead": title and artist |
| `evidence/N.json` (694 files) | 1,205 | Sources behind the year lists: title and address. The exact supporting text and a check result were never recorded |
| `links/g/<genre>.json` (461 files) | 7,127 | A song (or album) in a genre, with its role: `intro`, `peak`, `reference`, `near miss` (with the genre it belongs to and why) or `album` |
| `links/c/<ISO>/<decade>.json` (325 files) | 7,368 | A song in a country's decade list (scope `c:JP:1980s`) or year list (`c:JP:1985`), `home` or `foreign`, with the scene label, and either the confidence (decade lists) or the rank and source (year lists) |
| `scopes/g/<genre>.json`, `scopes/c/<ISO>/<decade>.json` | 461 + 489 | Research state: playlist status (`full`, `thin`, `none`), its note, the genre to use instead, `decade list` or `year list` with its note, and the listener tests run on it |
| `genres.json` | 593 | A genre: name, region, family, tradition, start and end year, place of origin (text, position, country), definition (window, sound, markers), four judgements (significance, ease, fame, intrigue), tree note, and for now the zoom tier and tree row |
| `parentage.json` | 1,176 | A line of the tree: parent, child, `principal` or `other` |
| `presence.json` | 5,510 | Where and when a genre was heard: region or country, `peak` with the peak years or `later` with the year it arrived, and a strength for peak countries. All marked `first estimate` |
| `traditions.json`, `families.json`, `regions.json` | 163, 20, 10 | Traditions with their family; families with their order on the tree; regions |
| `countries.json`, `cities.json` | 226, 1,619 | Countries with region, prompt language and the names the world outline uses for them; cities and areas with position, years, historical names, size, and prompt language where it differs |
| `layout.json` | object | The tree's lanes (traditions per family, in order), rows per lane, and the stored `cost` of the layout |
| `langs.json` | 42 | Prompt wording per language. Not part of the model; unchanged |
| `known.json`, `done.json`, `indoc.json`, `method.json` | 26, 3, 42, text | Unchanged: genres journeys treat as familiar, the three a new visitor starts with as listened, a dead list (roadmap 2.9), the tree's method text |
| `legacy-order.json` | object | Only for the old shape: orders the model does not decide (for example the order of genres in the old `defs.json`) and three city language entries that match no city. Dropped with `tools/legacy_data.py` |

`tests/data.py` checks the rules: the tree's one principal parent and at most two others, every key well formed and unique, every link, credit, evidence and id pointing at something that exists, and a song's genre backed by its genre's playlist.

Lists the conversion made for a decision, without merging or changing anything, are in `work/2026-11-23-schema/`: 809 near matches between songs, 71 songs chosen for more than one genre's playlist (left without a genre), 165 songs listed with different release years (left without one on the song; each list keeps its own), and 35 genres whose family differs from their tradition's family.

**Known weaknesses**, after this step:

- Fixed: a song is a record with a key, and a genre playlist, a decade list and a year list point at the same record when the text is identical. Entries are named fields, not positions. The tree's lines are stored once and the parent rule is checked. Presence has an explicit strength instead of a meaningful order.
- Not fixed: artists are not split (`A & B`, `A feat. B` are one record each), and near matches are listed, not merged, so the same recording spelled two ways is still two songs. No weights, passes or tiers exist yet. Release years that disagree between lists are not settled. Evidence exists for year lists only, with no supporting text. Year written sits on the song, because compositions do not exist yet. Three cities (Gibraltar, Funafuti, Yaren) point at countries that are not in `countries.json`; `tests/data.py` reports them as known faults.
- The page still reads the old shape, through `tools/legacy_data.py`, and all of it still ships to every visitor in one file (roadmap 2.10).

## What is in the database

Only things that belong to people. Every table starts with all access removed; row-level security is on; each permission the site uses is granted by name. A visitor who is not signed in can read nothing.

| Table | Holds | Who can do what |
| :- | :- | :- |
| `profiles` | Handle, role (beta, principal, owner), status (pending, active, suspended) | A person reads and names their own; the owner manages all. Capped at 1,000 |
| `invites` | Codes that expire after 14 days | Active members create up to 3; anyone signed in can redeem |
| `trips` | A saved playlist request: place, years, genre (all as stable keys), status, rating, note | Active members, their own rows only |
| `events` | Usage events from testers | Insert only; the owner reads |
| `anon_events` | Usage events from visitors without an account; keeps the newest 250,000 | Insert only, rate-limited; the owner reads |
| `requests` | Requests for a listener test or for research. One row per distinct thing asked for, with a count of asks and a weight (an ask spread over several decades gives each an equal share of one request) | Anyone can add through two functions (`request_add`, `request_many`); the owner reads and settles |

Two databases: dev (used by every address except the live one) and prod. Prod is changed only by running the numbered files, with the owner's approval.

## How it is tested

| Test | What it proves | What it does not |
| :- | :- | :- |
| `tests/data.py` | The data obeys the model's rules: tree parents, keys, every reference resolves, song genres backed by playlists | That the facts are true |
| `tests/smoke.py` | The built page opens on a phone and a desktop size with no script errors, every tab opens, no sideways scroll | That anything on the tabs is correct |
| `tests/account.py` | Sign-in, pending and active states, invites, saving trips, usage events, the admin page, the playlist panel for genres and for place and time, requests and reruns: each as a scripted visit | It runs against a stand-in for the database, so it does not prove the real database answers the same way |
| `db/test.sh` | The access rules: who can read and write what, the caps and flood guards, on a throwaway local database with the real SQL files | That the hosted database has had the same files run |
| Synthetic listener tests (`tests/listener/`) | Whether a playlist's seed songs feel right to a simulated local of that place and time, scored 1 to 10. Each run records the brief version, the data commit, the exact prompts judged and the model, so it can be repeated. [`COVERAGE.md`](COVERAGE.md) is generated from the data and the runs: what is researched, what is tested, what is owed | Nothing about a real person. The judging step is an agent on a named model, not a script. The 17 results from before the registry are provisional |

Not tested at all today: the correctness of the music data itself (beyond its structure and the listener rounds), the map and tunnel drawing, journeys, and the real sign-in round trip with Google.

## How a request works

The playlist panel is one sheet with two modes, a genre or a place and time. Both show two rows.

- **Research** speaks in the pieces research is actually done in. For a genre that is the genre. For a place and time it is one country, decade by decade from the 1940s. A wide time filter lists its decades as researched, requested or not yet, and one button asks for the rest as a single request shared between them.
- **Synthetic listener test** is about exactly what is on screen: the filters and the prompt are logged as they are, to be judged later.
- "Done" comes from the data on the page (research) and from the tests recorded on each scope in `data/scopes/` (listener tests). "Requested" is remembered in the visitor's browser only, because visitors cannot read the request list.
- Only the owner is offered a rerun of finished work.

## Decisions and why

| Decision | Why | What it costs |
| :- | :- | :- |
| One static page, no server of our own | Free to host at any traffic, nothing to keep running, works offline once loaded | All data ships to everyone; no server-side search |
| Music data as files in the repository | Every change is reviewable and reversible in git; research runs arrive as branches | Not queryable; size is limited by the page |
| People's data in a hosted database with rules in SQL | Free tier, sign-in included, and the rules can be tested | A second system to keep in step; free-tier limits (500 MB) |
| Google sign-in only | The database's own email sending cannot serve the public | People without a Google account cannot join |
| Saved history points at data by stable key | Renaming or reordering data never breaks someone's history | Keys can never be reused or changed |
| Requests are logged, not run on the spot | The hosted site has no way to run a listener or research; a logged request can be batched | The person waits and does not yet see the result (roadmap 8.1b) |
