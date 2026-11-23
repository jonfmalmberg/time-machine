# Work log

One entry per working session, newest first: what was done, what was decided and why, what was left unfinished or untested. This is the project's journal. The plan is in [`ROADMAP.md`](ROADMAP.md).

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
