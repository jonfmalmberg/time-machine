# Roadmap

The plan from where the project stands to the product described in [`vision/2026-11-23-direction.md`](vision/2026-11-23-direction.md). The intent the app grew from is in [`vision/2026-11-23-origins.md`](vision/2026-11-23-origins.md). It changes as we learn; every change of order or scope gets a line in [`WORKLOG.md`](WORKLOG.md) saying why. Judgement calls follow [`PRINCIPLES.md`](PRINCIPLES.md).

**Status of this file:** drafted 23 November 2026, waiting for the owner's review. Order and scope below are Claude's proposal from the conversation, not yet agreed.

## How to read it

- A **milestone** is a goal with a "done when". On GitHub it is a milestone with a progress bar.
- An **item** is a piece of work Claude can finish in one run. On GitHub it is an issue. Items marked **(owner)** need Jon.
- Item states: `todo`, `doing`, `review` (waiting for Jon, with a link to where to look), `done`, `flagged` (fell short, marked for a later retry).
- Items that start with **Report** or **Proposal** produce something for Jon to read and decide on before anything is built.

## Where things stand

Release 1 is live: the explorer (tree, globe, tunnel, list, journeys, data), accounts with invites, travel history, a usage log for testers and for anonymous visitors, and an owner's Admin page. Song data covers a small part of the world properly; many genres have a name only. Album art is switched off.

## Order

Milestone 0 comes first because everything else depends on being able to see and review work. After it there are two tracks that can alternate, so that waiting for a review on one never stops the other.

| | Data track | Product track |
| :- | :- | :- |
| First | **0. Working system** (both tracks) | |
| Then | 2. Data design | 1. First visit and shuffle |
| | 3. Genre research | 5. One experience |
| | 4. Places and periods | 7. iOS redesign pass |
| | 11. Song database | 6. Playlist services |
| | | 8. Feedback loop |
| | | 9. Journeys |
| | | 10. Preferences and freshness |
| Later | Album art, visual polish of tree, globe and tunnel | |

---

## 0. Working system

**Goal:** Jon can open one place and see the whole scope, what is done, and what is waiting for him. Claude works from written plans and leaves a trail.
**Why:** "There's nothing I can point to and say keep working on this." Tests so far have no record of which prompt produced which result.

- 0.1 Create the GitHub milestones, issues and labels from this file (`review`, `approved`, `flagged`, `bug`, `data`, `ui`, `research`). After Jon approves this roadmap.
- 0.2 Test registry: every synthetic-listener prompt stored as a numbered version that is never overwritten, each with a line saying what assumption changed.
- 0.3 Test runner: one command takes a data set and a test version, runs it, and records the result with the exact prompt version and data version.
- 0.4 Coverage table, generated automatically: for every genre and every country-decade, which tests have run, on which versions, with what result, and what is still owed.
- 0.5 Report: what survives of past listener prompts and results. Past scores are treated as provisional until rerun under the registry.
- 0.6 Proposal: the style guide. Type, colour, buttons, lists, toggles, sheets, icons in the iOS manner, studied against Shirabe Jisho, with one reference page showing every piece. Jon approves it once; all later screens are built from it.
- 0.7 Decide what to do with the weekly research task. It still writes to the old artifact's database, not to this repository.
- 0.8 **(owner)** Housekeeping: delete the `accounts`, `seed` and `add-readme` branches and close pull request 1; set Cloudflare build watch paths to exclude `db/*`, `tests/*`, `docs/*`, `*.md`; add `http://localhost:8000/**` to the dev sign-in redirect list.

**Done when:** the tracker is live, Jon has approved the style guide, and a listener test can be rerun from its recorded version.

## 1. First visit and shuffle

**Goal:** a newcomer understands the app and reaches music in about ten seconds; Random usually lands on something worth hearing.
**Why:** friends already have the link and there is no walkthrough. Random sends people "into the desert of sound" too often and takes three or four rounds of taps.
**Measure:** shuffles before a person settles. Target: first try most of the time, within two usually, almost never more than five.

- 1.1 Record the measure: log each Random pick and whether the person stays with it (copies, opens, or lingers) or shuffles again.
- 1.2 One-tap reshuffle: the Random control stays available after a pick.
- 1.3 Familiarity test, version 1: a blind synthetic test of how familiar each genre feels to a general listener. Run it under the registry; store the score per genre.
- 1.4 Weighted Random: mostly familiar-but-new, sometimes strange, with the weights in one adjustable place.
- 1.5 Proposal: the first screen for a new visitor (place, year, listen) and a short guided start. Design for review before building.
- 1.6 Make choosing a from-to range of years easy to find. It exists but is buried.
- 1.7 Report: what the first weeks of the usage log show about Random and first visits, and what to change.

**Done when:** the measure is being recorded and meets its target for Jon's own use, and a first-time visitor's path is approved and live.

## 2. Data design

**Goal:** an agreed design for what we collect and why, and the current data moved into it, so research can scale without rework.
**Why:** "We can't just have one big flat list of songs." A second research round has to continue the first.

- 2.1 Report: inventory of the data as it is. What exists, in what shape, how much, and known faults, including the three Hebrew chant dots in Israel (duplicate rows or a drawing fault) and how prominence is calculated today (why one chant dominates half of the tunnel).
- 2.2 Report: open music data sources, each with its licence checked against the first-party text: what it offers, how it is obtained, what attribution it needs, what we may store. Candidates: MusicBrainz, Wikidata, Discogs, ListenBrainz, Wikipedia.
- 2.3 Proposal: the schema. Songs, artists, albums, genres, places, the links between them, where each fact came from, and research status flags. Every property with its reason.
- 2.4 Proposal: regions. Which ones, how fine-grained, and how a place with no music data looks and behaves on the globe and in lists.
- 2.5 Proposal: feel. A first vocabulary of moods, whether tempo or key are worth storing, how tags are assigned and how they are checked.
- 2.6 Proposal: weights. The current prominence formula written out, and a stated, adjustable replacement that separates audience size, historical influence and taste.
- 2.7 Move the existing data into the approved schema with stable keys. The site must build and behave as before.
- 2.8 Completeness reviewer, version 1: a synthetic test that asks whether a period's data feels complete (are the artists a listener of that time would expect present, and filed correctly). First fixture: the artists Jon named.
- 2.9 Fix the data faults found in 2.1.

**Done when:** the schema, regions and weights are approved, the data has moved, and both kinds of test run from the registry.

## 3. Genre research

**Goal:** every genre has a definition, characteristic songs and passing tests.
**Why:** Jon's first research priority. 132 genres currently have a name and nothing else.

- 3.1 Plan: the 132 genres split into batches of one run each, ordered by how likely people are to look for them.
- 3.2 Onward: one item per batch. Each batch is researched into the schema, run through the listener and completeness tests, and either passes or is flagged with what fell short.

**Done when:** the coverage table shows every genre passed or flagged.

## 4. Places and periods

**Goal:** year-by-year lists for the places and periods people will ask for.
**Why:** second research priority. Today a small number of country-decades are properly covered.

- 4.1 Plan: the list of country-decades to research, in priority order, with an estimate per batch.
- 4.2 Onward: one item per batch, tested and passed or flagged as in milestone 3.
- Research already flagged (Nigeria 1970s, Malaysia 1960s, Quebec in French for the 1970s, Sweden before 1950) stays flagged. It is not retried before milestone 11.

**Done when:** the planned list is passed or flagged in the coverage table.

## 5. One experience

**Goal:** places, times and genres work as one thing, and any of them can be shared as a link.
**Why:** "We're treating teleportation to a time and place and genres as if they are inherently different things."

- 5.1 Shareable links: an address that opens the app at a given place, time, genre or combination.
- 5.2 Report: for genres with enough data, compare the characteristic "golden era" list with what the filters produce. Recommend whether a genre is simply a named filter, or whether "characteristic songs" should be a switch on the shared filter.
- 5.3 Build whichever 5.2 concludes, after review.
- 5.4 Proposal, then build: selecting a country, a city or a genre on the map without the current overlap.
- 5.5 List view arrives at the genre's heading, with the main actions at the top and the prompt text lower down.
- 5.6 Search answers "is this artist or song here, and where": results for songs and artists that lead to the place, time and genre they sit in.

**Done when:** a link to "Tokyo, 1985" or to a genre opens ready to play, and a genre and its equivalent filter no longer feel like separate features.

## 6. Playlist services

**Goal:** getting the playlist takes fewer steps, without losing what Spotify's AI adds, and we can compare its playlists with ours.
**Why:** copy-and-paste is friction most people will not push through; but Spotify's result is currently the better one, and we cannot judge that without seeing both sides.

- 6.1 Report: what Spotify, Apple Music and YouTube allow, from their own developer documentation. In particular whether Spotify's AI playlist can be reached from outside, and what reading a user's playlist requires.
- 6.2 Build the easy wins the report finds (links, hand-offs).
- 6.3 Bring a playlist back: a person pastes the link of the playlist Spotify made, and its song list is stored with the trip.
- 6.4 Proposal: the comparison. How playlists from our data and from Spotify are judged against each other by synthetic listeners, by Jon, and by testers' behaviour.
- 6.5 Report: the first comparison, with a recommendation. We generate playlists ourselves only if ours are at least as good.

**Done when:** the hand-off is as short as the services permit and the first comparison has been run.

## 7. iOS redesign pass

**Goal:** every screen follows the approved style guide.
**Why:** Jon has had to say "it doesn't feel iOS" about several screens. Depends on 0.6.

- 7.1 List view: full-screen detail card on tap, back returns to the same position, the duplicate text filter removed.
- 7.2 Data tab: filters that match the three main filter buttons and fit a phone.
- 7.3 Account: travel log and trip sheet.
- 7.4 Admin.
- 7.5 Journey screens (look only; behaviour is milestone 9).
- 7.6 The playlist panel no longer covers the tab bar on phones.

**Done when:** Jon has reviewed each screen on his phone against the style guide.

## 8. Feedback loop

**Goal:** the app learns from what people do, and from what they choose to tell us, with almost no effort on their part.
**Why:** testers are unpaid and will not write reviews; when they do speak it must be easy to act on.

- 8.1 Report: which behaviours the usage log already captures and which are missing (what is looked at against what is taken, prompt language, feature use). Add the missing events.
- 8.2 One-tap report on a song or on the current filter, from a short list of claims: missing song, wrong family tree, wrong origin, genre not present here and then.
- 8.3 Human scores and synthetic scores stored separately for the same things.
- 8.4 A listener's control for the blend, from "memorable" to "archival and new".
- 8.5 Tester issues: submit and vote; principal testers can file to a priority list; nothing is workable until Jon approves it.
- 8.6 Admin view of reports and issues with their states.
- 8.7 Report, repeating: what the data says and what Claude proposes to change.

**Done when:** a tester's report reaches Jon in a form he can approve or decline in one step, and the first findings report has led to a change.

## 9. Journeys

**Goal:** journeys people can set up without irritation and that deliver what they promise.
**Why:** entry is the first barrier; the course is a list, not a course; discovery has not earned its place.

- 9.1 Entry rebuilt on the app's own controls: the globe or place picker for where, the time slider for when. No typed place names, no arithmetic.
- 9.2 Life journey: a choice between most historically accurate and most nostalgic, each checked with synthetic listeners.
- 9.3 Traveller: say what your travelling looks like (regions, emphasis) before the route is made.
- 9.4 Music history course: a narrative that ties the stops together, entries that open the genre's card, and selectable perspectives (for example a Western and a Chinese course).
- 9.5 Discovery: replace the fixed walk with sliders over reviewed scores giving a ranked list, or remove it. Decided after 2.5 and 2.6.

**Done when:** Jon can enter his own Japan and Canada life in under a minute and each journey type has passed its listener test.

## 10. Preferences and freshness

**Goal:** what a person rates and reacts to changes what they are offered, and repeat requests stay fresh.
**Why:** the reactions exist but nobody can say what they are for; a favourite genre goes stale without new songs.

- 10.1 Proposal: the preference model. What a rating, a reaction, or a liking for a genre or a mood changes about later recommendations, and by how much.
- 10.2 Trip review: a slider for the rating; reactions reduced to those the model uses, each with a visible purpose.
- 10.3 Each trip records the songs it offered.
- 10.4 "A new one": a playlist for the same request with none of the songs already offered to that person.

**Done when:** the model is approved and visible in the interface, and a repeated request returns different songs.

## 11. Song database

**Goal:** broad coverage of songs and artists, moving toward a database of all music.
**Why:** completeness is what makes the app feel true to someone's own era, and what keeps it fresh. Third research priority. Depends on 2.2 and 2.3.

- 11.1 Coverage check against Jon's liked songs on Spotify: how many are in the data, and where the missing ones could come from.
- 11.2 Bring in data from the sources approved in 2.2, in batches, each tested for completeness.
- 11.3 Retry the research flagged in milestones 3 and 4 with the wider data.

**Done when:** the coverage check passes a threshold agreed with Jon.

## Later, and what gates it

- **Album art.** Only if the licence permits keeping our own copies. Images stay out of the code repository. Size is estimated for the finished database. Songs share their album's cover. Storage must not be able to produce a bill. Needs albums in the schema (2.3).
- **Tree, globe and tunnel polish.** Good enough for now. Done later as sit-down sessions where Jon tries things and says what works.
- **Visitor analytics.** Cloudflare Web Analytics is a toggle on Jon's side.

## Outside the app: the owner's way of working

Not part of the product and not on either track. Recorded so it is not lost.

- **Local development with Claude Code or a similar tool on Jon's laptop**, loading the in-progress version locally and using Cloudflare builds only before a release. `serve.py` and `CLAUDE.md` are a first step. Jon will raise this as its own conversation; nothing further is planned until then.
