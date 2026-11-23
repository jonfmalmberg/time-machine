# Work log

One entry per working session, newest first: what was done, what was decided and why, what was left unfinished or untested. This is the project's journal. The plan is in [`ROADMAP.md`](ROADMAP.md).

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
