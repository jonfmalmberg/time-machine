# Work log

One entry per working session, newest first: what was done, what was decided and why, what was left unfinished or untested. This is the project's journal. The plan is in [`ROADMAP.md`](ROADMAP.md).

## 2026-11-23 (layout method recovered; web access; batch 2)

- Owner reminded the lead that the tree layout was computed in this workspace. Found: the optimiser scripts were still in the workspace's scratch folder, which can be cleared at any time. Saved unchanged to `tools/layout/original/` with a description of the method. They cannot run as they are (they read a file of the old artifact); rewriting them is roadmap 2.13.
- Owner switched on web access. Checked: a script in the workspace can now fetch a web page (one request to Wikipedia returned 200). The evidence-check script can be built. Whether helper runs have the same access is not yet known.
- H4 (genre batch 2) accepted as candidates: six full, two with no playable list. With H3 that is 16 of the 132 pending genres researched and waiting to enter the data.
- Helper fired for H5 (prominence).

## 2026-11-23 (data model on dev; when something is its own genre)

- Owner: confident the schema work is correct without reviewing it. `schema` squash-merged to `dev`. Not released to `main`.
- Owner's guidance on the tree, recorded as principle 27: use judgement, asking two questions. Does it feel distinct? Is the category too big or too small for the data? Too big is likely right to split if its members sound like they could be distinct; too small is likely right to merge if another genre sounds too similar to tell apart. A different language and a different place of origin, before globalisation, is probably a separate thing whatever its size. Decide on the specific evidence.
- Lead's determinations from the evidence in the first genre batch: rways (Tashelhit professional troubadours) is its own genre, separate from the communal ahwash and ahidus dances; Korean minyo (folk song) is its own genre, separate from pungmul (percussion bands) and from Japanese min'yō. Both are to be added as named genres and the `pungmul` candidates divided between the two.
- Found while preparing to add them: the tree's row layout is stored in `data/layout.json` and the method that produced it is not in the repository. A genre cannot be added to the tree until that method is rebuilt. Recorded as a gap in `ARCHITECTURE.md`.

## 2026-11-23 (third helper hand-back: first genre batch)

- H3 accepted as candidates: eight genres (Kalevala runosong, ngoma, Amazigh ahwash and ahidus, chèo, ca trù, quan họ, Bihu songs, pungmul), 98 songs, each with a size estimate, sources with quoted lines, and a list of what could not be verified. Three came out full, five thin. They are not in the site's data: they wait for the data model to reach `dev`, the evidence check and a genre acceptance test.
- The size estimates work as intended: for example ngoma is estimated at 300 to 2,000 recordings, almost all in archives, with a core of 20, so a small commercial list is honest and not a failure.
- For the owner (tree questions the lead will not decide): the Amazigh genre's natural neighbour, rways (Tashelhit troubadours), has no genre in the tree; `pungmul` was scoped to cover Korean percussion and Korean minyo because `minyo` is the Japanese genre: should Korean minyo be its own genre?
- Helper fired for batch 2.

## 2026-11-23 (second helper hand-back)

- H2 (open data sources) reviewed and accepted with its shortfalls noted; copied to `docs/research/2026-11-23-open-data-sources.md`. Findings that matter for the model: only MusicBrainz gives a recording a stable identifier, and it publishes a CC0 mapping of every recording to one canonical version; MusicBrainz genre tags sit in its non-commercial part, so they cannot be copied in; AcousticBrainz has ended and its makers call the data not useful, so it is not a source for tempo or mood.
- Seen in the helper's run: an unattended run cannot answer the fetch tool's permission requests, so some pages go unread; and the shell cannot download pages, which confirms the evidence-check script cannot run until web access for scripts is allowed.
- Helper fired again for the next open assignment (genre batch 1).
## 2026-11-23 (artist credits split)

- Owner: a song with several credited artists must point at each artist in the master list; a version with a featured artist and one without are different songs.
- Done on `schema` by an Opus sub-agent to a written specification, reviewed by the lead: 1,041 credits contained a joiner; 338 decided as one act, 685 as several acts with roles (main, featured, with), 18 left as unsure and still marked unsplit. 731 songs and 18 releases now point at individual artists and keep the credit as listed in `credit_text`. Artists 6,889 to 6,852.
- Rule used, written into the schema: a duo or group performing under one name, and a leader with their own named band, is one artist; separately established acts credited together are several.
- The page is still byte-identical (sha256 94940c40...), re-checked by the lead.
- Limits: decisions came from the model's own knowledge, with no lookup, and each carries only a category as its basis. 30 artist pairs differ only in capitals (ROSALÍA and Rosalía) and are still separate records. The 18 unsure ones are listed in `work/2026-11-23-credits/decisions.json`.

## 2026-11-23 (data moved to the new model)

- Owner accepted the schema as the model to build and asked for work to continue without him until his review is needed.
- Branch `schema`: today's 29 data files converted into the new model by `tools/migrate_2026_11_23.py` (written by an Opus sub-agent to a written specification, reviewed by the lead). `build.py` now reads only the new files and rebuilds the shape the page reads through `tools/legacy_data.py`. The page was not changed.
- Proof: `dist/index.html` built from the old files on `dev` and from the new files on `schema` have the same sha256 (94940c40...). Checked by the lead independently of the sub-agent, by stashing the change and rebuilding.
- New test `tests/data.py` enforces the model's rules, including the owner's tree rule (one principal parent, at most two others).
- Counts: 10,700 songs, 6,889 artist credits (not yet split into individual artists), 310 releases, 1,205 evidence records, 14,495 links.
- Lead's correction to its own specification: it asked for central files split by two key characters, which made 4,330 tiny files; regrouped by one character (32 files per folder).
- Lists for decision in `work/2026-11-23-schema/`, nothing merged: 809 possible duplicate songs, 71 songs chosen for more than one genre's playlist, 165 songs whose lists disagree on the release year, 35 genres whose family differs from their tradition's family.
- Not done in this step, by design: splitting artist credits, mapping chart songs to genres, compositions, weights, evidence strings. Three cities still point at countries that have no record (Gibraltar, Tuvalu, Nauru): adding them needs names and regions the lead will not invent.

## 2026-11-23 (schema: cities over time, tree rule, a song's genres)

- Owner: cities should carry their country over time, formation and name changes, as groundwork for a later map feature, not for the music data. Added as a dated country link on the city; founding, ending and dated names already exist.
- Owner's tree rule recorded and to be enforced by the build: one principal parent and at most two others. Checked: the data already obeys it (25 roots, 111 with one parent, 306 with two, 151 with three, exactly one principal each), and the parent lists and the weighted edges are the same 1,176 lines stored twice.
- Owner's suggestion adopted for mapping a song to genres: one principal and at most two other fingerprints. Claude added: most specific genre only, none allowed, a genre's own playlist limited to songs whose principal it is, and a recorded basis for each assignment.
- Found while checking: year-list songs carry a free-text scene label (80 labels over 2,359 songs; 447 match a genre in the tree, 946 say "pop"), so chart songs are not mapped to genres today.

## 2026-11-23 (schema revised; tests and colours approved)

- Owner approved the test registry and the iOS colours: both squash-merged to `dev`. Not on `main`; he has not said to release them.
- Owner's decisions on the schema: a song is a recording; add a composition table to follow a piece through its covers, and sampling links, now, recorded when research happens to find them; keys are standalone values because artist, title and year are not unique; songs are stored centrally and a scope only defines research; uniqueness is checked when the master table is put together. The site may keep running on today's files until there is time to move.
- Owner's questions answered in the proposal: country means the artist's scene (the definition MusicBrainz also uses for its artist area), kept on the artist and dated where it changed, with birthplace beside it and recording location not tracked; three years are kept apart (release on the song, written on the composition, heard-there on the link); a remaster is the same song and keeps the original year, with its listed title as an alias; remixes, live and re-recordings are separate songs with a relation. MusicBrainz's style pages read today for both definitions.
- He asked whether artists, countries, cities, genres and the tree had a schema. They did not: the first draft said "as today". Now written out, including influence lines, presence by place, and layout and tier treated as computed.

## 2026-11-23 (schema proposal)

- Roadmap 2.3 written as a proposal: `docs/proposals/2026-11-23-schema.md`. Four decisions in it are the owner's: a song is a recording; keys derived from artist, title and year and then frozen; one file per scope with songs joined at build; three weight parts stored.
- Queue: H6 added (population by country and decade, figures only, for the weight table).

## 2026-11-23 (evidence check redesigned by the owner)

- Owner's design replaces the sampled audit by a second agent: the researcher records the exact string and where it was found; a script checks every data point once, when collected, by fetching the page and matching the string; only failures go to an agent, which finds out why and reports the source as erroneous. The string is kept because sites die.
- Blocker recorded: scripts in the workspace cannot fetch web pages on this account today. The owner would have to allow it.

## 2026-11-23 (research tiers accepted as the initial method)

- Owner accepted the method as a starting point, weights to be adjusted after a few runs. Two changes at his direction: tier numbers are rough intent and every scope sets its own targets from an estimate of how many songs exist for it, the estimate being part of the research; and the evidence audit's purpose was unclear, so it is now stated, the researcher records the supporting line from each source, small scopes are checked in full and large ones by sample with a full check on failure. The "10%, pass at 90%" figure was arbitrary and is withdrawn.
- Helper rules and the genre batch assignments updated to ask for a size estimate and a quoted line per song.

## 2026-11-23 (research tiers proposal)

- Owner: the colour palette is better. More seed songs are needed; data and tests should come in tiers (about 25 songs for a good genre list, 50 for a deep one, by duration; years from 6 up to 50 to 100 for big markets); research breadth first with weights by importance to the listener; songs ranked and weighted, not all equal; a synthetic test that measures each research scope directly, like a factory acceptance test, with cross-scope tests after.
- Written as a proposal, not built: `docs/proposals/2026-11-23-research-tiers.md`, roadmap 2.12. Four decisions in it are the owner's: tier sizes, the weight blend, the breadth-against-depth table, pass thresholds.

## 2026-11-23 (iOS colours)

- Owner asked for the region and tradition colours on the tree, map and tunnel to come from an iOS palette. Built on branch `ios-colours`: the ten region colours replaced with Apple's system colours, light and dark, values read from the Human Interface Guidelines Color page today (updated June 2025; they differ from the older, commonly quoted ones). Only the ten tokens in `src/template.html` changed. Europe indigo, North America blue, Caribbean purple, Latin America green, Africa brown, Middle East and North Africa cyan, South Asia orange, Central Asia yellow, East Asia red, Southeast Asia and Oceania mint. Pink and teal left out: too close to red and to cyan.
- Judged by screenshot on phone light and desktop dark, tree and tunnel. The map was not looked at.
- Waiting for review: branches `test-registry` (roadmap 0.2 to 0.4; its own work log entry and roadmap item 7.8 are on that branch) and `ios-colours`.

## 2026-11-23 (first helper hand-back)

- Owner set Cloudflare build watch paths for both sites. Weekly research task deleted at his instruction; the daily helper queue replaces it.
- Daily helper: "Time Machine daily helper", every day at 22:41 Vancouver, on Opus. Rules, roles and the model table are in `work/README.md`; assignments in `work/QUEUE.md`; reports on issue 74.
- Helper verification: the run reported `claude-opus-5-5` for itself, and `claude-sonnet-5-5` and `claude-opus-5-5` for sub-agents started with those models. A manual firing with an extra message does both the normal assignment and the extra request: it took H1 as well.
- H1 (data inventory) reviewed and accepted: five of its claims spot-checked against code and data, all held. Copied to `docs/research/2026-11-23-data-inventory.md`; `ARCHITECTURE.md` updated with the field meanings it established. Its work folder and the queue update were committed to `dev` directly: they change nothing the site reads.
- Lead's answers to the helper's questions: `none` playlists that still list songs and the dead `indoc.json` go to 2.9; the map's grouping radius is its own interface issue (76); spelling waits for song identities (2.7).
- Queue: H5 added (how prominence is computed and the tunnel dominance case).
## 2026-11-23 (helpers, test registry)

- Daily helper set up: "Time Machine daily helper", every day at 22:41 Vancouver, on Opus. It takes one assignment from `work/QUEUE.md`, writes only in `work/`, pushes one `helper/<date>-<id>` branch and comments on issue 74. Rules and the model table are in `work/README.md`. First queue: data inventory (2.1), open data sources (2.2), two genre batches of eight.
- Checked first-party (Cloudflare Workers Builds documentation): builds can be limited by path but not by branch name. "If any matching path is found, a build is triggered. Otherwise the build is skipped." A push of 20 or more commits builds regardless. The owner has to set the include paths in the dashboard; until then every push builds.
- Model control confirmed: a scheduled task's model can be set (the helper was created on Fable by default and changed to `claude-opus-5-5`); a sub-agent started with model "opus" reported itself as `claude-opus-5-5`.
- Tried to pause the weekly research task, since the daily queue now covers its work and it writes into `data/` (which builds). The action was refused by the permission system. It is still enabled.
- Roadmap 0.2 to 0.4 built on branch `test-registry`: brief `place-time` version 1 registered with its model; `tests/listener/run.py` prepares a run from the built site, records results, and writes `docs/COVERAGE.md`.
- First run under the registry: Japan 1991, 1995, 1998 on Opus scored 9, 6, 6: below the bar. The 1990s have a decade list only, and the listener's complaint is exactly that: songs from neighbouring years, the year's own scene missing. This is the registry doing its job, not a new fault.
- Owner, 23 Nov: the region and tradition colours on the tree, map and tunnel should come from an iOS palette. Added as roadmap 7.8, to be proposed in the style guide.
- Not verified at the time of writing: the helper's own verification run had not yet posted to issue 74.

## 2026-11-23 (release 2)

- Jon approved `requests` for `dev` and for the live site. `db/005_requests.sql` run in prod (checked as the visitor role: can call `request_add` and `request_many`, cannot read or insert, cannot call the shared step; the check was rolled back, the table is empty). Squash-merged to `dev`, then `main`.
- GitHub tracker created from the roadmap: 12 milestones, 72 issues.
- Jon's instruction on scheduled work: daily scheduled runs are helpers without responsibility for the project. The session with the most context sets their work and reviews what they hand back, as Jon does with that session. Models must be chosen deliberately and each run must report the model it ran on.
- Not confirmed from a real browser: a request made on the live site.

## 2026-11-23 (roadmap accepted, requests rounds 2 and 3)

- Jon reviewed the planning documents and accepted them as ready to work from. His addition: build so that design decisions can be presented to him from a high level (data model, test suite, listener tests, architecture). Recorded as principle 26; first version of [`ARCHITECTURE.md`](ARCHITECTURE.md) written; roadmap item 0.11.
- Jon asked Claude to work proactively each day, stopping only where going on without approval would be counterproductive. Claude cannot see the usage allowance, so "about 80% a day" cannot be measured from inside a session.
- Branch `requests`, round 2 (Jon: genre and place-and-time playlists behaved differently; pending genres had no buttons): one playlist panel for both; the list has one Playlist button per genre; two rows everywhere, Research and Synthetic listener test, showing done, requested or a button; owner-only rerun; `data/tests.json` records the 17 country-decades tested so far.
- Round 3 (Jon: "United Kingdom, all of history" offered research for the 2020s only): research is requested in the pieces it is done in, one country decade by decade from the 1940s. A wide filter lists its decades and one button asks for the unresearched ones, the ask counting as one request shared equally (`request_many`, column `w`). Narrowing to a decade already asked for shows it as requested. Listener tests log the full filter as it is. `db/005_requests.sql` was revised in place because it has not been run in prod; dev was brought in line by a migration.
- Decided without asking, for Jon to overrule: with no country selected, or only years before 1940, the Research row explains what research covers and has no button, because there is no country-decade to attach the request to. A rerun is offered to the owner for a single decade or genre only, not for a multi-decade selection.
- Confirmed in the dev database: two real requests made from a browser on the preview site are in the table, so the round trip works outside the test stand-in.
- Not tested: `request_many` from a real browser (checked in the dev database by SQL as the visitor role, and in the local database tests).

## 2026-11-23 (checks, requests, weekly task)

- Jon asked for the unverified statements that could change the roadmap to be checked. Done from first-party sources: [`research/2026-11-23-feasibility-checks.md`](research/2026-11-23-feasibility-checks.md). Findings that matter: Spotify is closed to a small public app; Prompted Playlist is Premium-only in seven countries and personalised; open data (MusicBrainz core, Wikidata, Discogs) is CC0; cover images have no licence for copying; the free database cannot hold a catalogue.
- Roadmap revised: milestone 6 reshaped, items 2.10 and 2.11 added, album art moved to 7.7 as "store the identifier, load the image". Order unchanged.
- Rule changed at Jon's instruction: errors in a record are not left standing. Records are still not rewritten, but a dated correction is added inline where something proved wrong. Six corrections added to the direction record.
- Past listener briefs, inputs and results found in Claude's working files and saved to `tests/listener/archive/`.
- Weekly research task moved from the old artifact to this repository (genres first, one `research/<date>` branch a week, one push, no merge). It runs without asking for approval.
- Built on branch `requests`: visitors can request a listener test or research and are told it was received; Admin lists the requests. Table and function are in the dev database only (`db/005_requests.sql`). 90 database checks and the browser scenarios pass. Not released; prod untouched.
- Not done: the old task's run of 22 November wrote to the artifact's database; bringing that in is item 0.9.

## 2026-11-23 (planning)

- Jon and Claude talked through the direction of the project by voice. Recorded in [`vision/2026-11-23-direction.md`](vision/2026-11-23-direction.md).
- Wrote the design principles, the roadmap and this log from that conversation. No change to the site or to either database.
- At Jon's request, added a second record, [`vision/2026-11-23-origins.md`](vision/2026-11-23-origins.md): the original intent from July to November 2026 and Claude's understanding of what the app is. Built from saved notes and a partial re-reading of the first conversation, not a full one. Three principles added from it (local first, out and back, genres are alive and continuous).
- Noted as outside the app: Jon's goal of developing locally on his laptop with Claude Code. To be discussed separately.
- Corrected `db/README.md`: files 001 to 004 were run in prod on 22 November.
- Checked: Claude's GitHub connection has permission to create issues and milestones. The time filter does offer a from-to range ("From a year of my choosing"), so the finding is that it is hard to find, not missing.
- Waiting on Jon: review of the roadmap. Milestones and issues are created on GitHub once he approves it.

## 2026-11-22 (release 1)

- Imported version 22 of the artifact into the repository as source, data and a build script; output identical to the published version.
- Site set up on Cloudflare (a Worker serving static files) with `main` as the live site and a preview address per branch. Two Supabase projects, dev and prod.
- Built and released accounts: Google sign-in, profiles, invite codes and links with expiry, travel history for active testers, usage events, an anonymous usage log with a size limit and export, an owner's Admin page, one Account page in place of the Me tab.
- Fixes: tree no longer scrolls far past the present; map opens as a globe; journey type buttons visible again.
- Album art switched off site-wide: lookups were about one a second.
- Decisions: Jon instructs and Claude works freely in dev; prod changes only on approval; user data is not altered without approval; build locally and push once per review round.
- Mistakes worth remembering: six pushes in one evening for small steps; one push went out with a failing test because the test output was misread.
- Not confirmed from a real browser at the end of the session: the Admin totals on the live site. Saving a trip on the live site was confirmed by Jon the next day.
