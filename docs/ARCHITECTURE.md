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
| Music data | `data/*.json` | One file per data set, one entry per line (below) |
| Build | `build.py`, `serve.py` | Joins the above into `dist/index.html`; `serve.py` does it on every change and serves it locally |
| Database rules | `db/NNN_name.sql` | Numbered files run in order, once per database (dev, then prod on approval) |
| Tests | `tests/`, `db/test.sh` | Below |
| Hosting | `wrangler.jsonc` | Cloudflare serves `dist/`; `main` is the live site, every other branch gets a preview address |

## The music data as it is today

Everything hangs off **genres** (the code calls them movements). There are 593, each with a stable id such as `swing`.

| File | Entries | Holds |
| :- | :- | :- |
| `nodes.json` | 593 | A genre: id, name, region, family, start year, place of origin with coordinates, parent genres |
| `edges.json` | 1,176 | Influence links between genres |
| `defs.json` | 461 | A genre's definition: active years, the sound, what to listen for, reference tracks, near-misses. The 132 genres without an entry are "pending" |
| `playlists.json` | 461 | A genre's playlist: status (full, thin, none), intro songs, peak songs, albums |
| `st.json`, `cnt.json`, `ends.json` | 593 each | When and where a genre was at its peak: years, regions, countries, later arrivals elsewhere, end year |
| `scores.json`, `tier.json` | 593 each | Prominence numbers used for sizing and ranking. Their exact meaning is not written down anywhere yet (roadmap 2.1 and 2.6) |
| `trad.json`, `tradOf.json`, `bands.json`, `regions.json` | 163, 593, 20, 10 | Grouping: traditions, which tradition a genre belongs to, the 20 families, the 10 regions |
| `layout.json` | | Pre-computed positions for the tree |
| `era.json` | 36 countries | Per country and decade: a list of songs people there heard |
| `yearl.json` | 11 countries | Per country and year: the year's hits, each marked home-grown or foreign, with its scene |
| `ysrc.json` | 1,205 | The sources behind the year lists (title and address) |
| `iso.json`, `cities.json`, `neAlias.json` | 226, 1,619, 112 | Countries, cities and areas (with founding dates and historical names), country-name aliases for the map |
| `langs.json`, `isoLang.json`, `cityLang.json` | 42, 139, 14 | Prompt wording in 42 languages and which language goes with which place |
| `tests.json` | 17 | Synthetic listener tests that have been run: country and year range (or genre), date, scores, result. The playlist panel reads it to show a test as done |
| `known.json`, `done.json`, `indoc.json`, `notes.json`, `method.json` | small | Flags and notes carried over from the artifact. Not yet reviewed; some may be dead (roadmap 2.1) |

**Known weaknesses of this model**, which milestone 2 exists to fix:

- A song is not a thing with an identity. It is a pair of texts (artist, title) repeated wherever it appears, so the same song in a genre playlist, a decade list and a year list is three unrelated entries. Artists and albums have no records at all.
- Most entries are positional lists (`["agreek", "Ancient Greek music", "eur", ...]`), readable only with the code beside them.
- Where a fact came from is recorded for year lists only.
- All of it ships to every visitor in one file. That cannot grow tenfold (roadmap 2.10).

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
| `tests/smoke.py` | The built page opens on a phone and a desktop size with no script errors, every tab opens, no sideways scroll | That anything on the tabs is correct |
| `tests/account.py` | Sign-in, pending and active states, invites, saving trips, usage events, the admin page, the playlist panel for genres and for place and time, requests and reruns: each as a scripted visit | It runs against a stand-in for the database, so it does not prove the real database answers the same way |
| `db/test.sh` | The access rules: who can read and write what, the caps and flood guards, on a throwaway local database with the real SQL files | That the hosted database has had the same files run |
| Synthetic listener tests (`tests/listener/`) | Whether a playlist's seed songs feel right to a simulated local of that place and time, scored 1 to 10. Each run records the brief version, the data commit, the exact prompts judged and the model, so it can be repeated. [`COVERAGE.md`](COVERAGE.md) is generated from the data and the runs: what is researched, what is tested, what is owed | Nothing about a real person. The judging step is an agent on a named model, not a script. The 17 results from before the registry are provisional |

Not tested at all today: the correctness of the music data itself (beyond the listener rounds), the map and tunnel drawing, journeys, and the real sign-in round trip with Google.

## How a request works

The playlist panel is one sheet with two modes, a genre or a place and time. Both show two rows.

- **Research** speaks in the pieces research is actually done in. For a genre that is the genre. For a place and time it is one country, decade by decade from the 1940s. A wide time filter lists its decades as researched, requested or not yet, and one button asks for the rest as a single request shared between them.
- **Synthetic listener test** is about exactly what is on screen: the filters and the prompt are logged as they are, to be judged later.
- "Done" comes from the data on the page (research) and from `data/tests.json` (listener tests). "Requested" is remembered in the visitor's browser only, because visitors cannot read the request list.
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
