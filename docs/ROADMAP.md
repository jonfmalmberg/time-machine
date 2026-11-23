# Roadmap

The plan from where the project stands to the product described in [`vision/2026-11-23-direction.md`](vision/2026-11-23-direction.md). The intent the app grew from is in [`vision/2026-11-23-origins.md`](vision/2026-11-23-origins.md). It changes as we learn; every change of order or scope gets a line in [`WORKLOG.md`](WORKLOG.md) saying why. Judgement calls follow [`PRINCIPLES.md`](PRINCIPLES.md).

**Status of this file:** reviewed and accepted by the owner on 23 November 2026 as ready to work from, with one emphasis added: every design must be presentable to him from a high level (principle 26, [`ARCHITECTURE.md`](ARCHITECTURE.md)). Individual items marked Proposal or Report still come to him before anything is built from them.

## How to read it

- A **milestone** is a goal with a "done when". On GitHub it is a milestone with a progress bar.
- An **item** is a piece of work Claude can finish in one run. On GitHub it is an issue. Items marked **(owner)** need Jon.
- Item states: `todo`, `doing`, `review` (waiting for Jon, with a link to where to look), `done`, `flagged` (fell short, marked for a later retry).
- Items that start with **Report** or **Proposal** produce something for Jon to read and decide on before anything is built.

## Where things stand

Release 1 is live: the explorer (tree, globe, tunnel, list, journeys, data), accounts with invites, travel history, a usage log for testers and for anonymous visitors, and an owner's Admin page. Song data covers a small part of the world properly; many genres have a name only. Album art is switched off.

Two facts found on 23 November shape everything below. Spotify's Prompted Playlist, which the app's main action depends on, is only available to Premium subscribers in seven countries, and Spotify does not let a small public app connect to it. So for most people the app's own song lists are the only playlist it can offer, and they have to be good in their own right.

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
- 0.2 `done 23 Nov` Test registry: `tests/listener/README.md` lists each brief by id and version with its model and what changed; briefs are files that are never edited. Brief `place-time` version 1 registered.
- 0.3 `done 23 Nov` Test runner: `tests/listener/run.py prepare` generates the exact prompts from the built site and records the brief and data fingerprints; an agent on the registered model judges; `record` checks and stores the scores. The judging step cannot be a plain command because the script cannot call a model.
- 0.4 `done 23 Nov` Coverage table: `tests/listener/run.py coverage` writes [`COVERAGE.md`](COVERAGE.md) for every genre and every country-decade that has data.
- 0.5 `done 23 Nov` What survives of past listener prompts and results: all of it. Briefs, inputs and results are saved in `tests/listener/archive/`. Past scores are treated as provisional until rerun under the registry.
- 0.6 Proposal: the style guide. Type, colour, buttons, lists, toggles, sheets, icons in the iOS manner, studied against Shirabe Jisho, with one reference page showing every piece. Jon approves it once; all later screens are built from it.
- 0.7 `done 23 Nov` The weekly research task now works in this repository: each Sunday it completes a small batch of pending genres on a branch named `research/<date>`, pushes it once, and leaves it for review. It no longer touches the old artifact.
- 0.9 Bring in what the weekly task saved to the old artifact's database before it was moved (at least the run of 22 November).
- 0.10 `done 23 Nov` Requests: one playlist panel for genres and for place and time, each with a Research row and a Synthetic listener test row (done, requested, or a button). Research is asked for by country and decade, a wide time filter sharing one request between its decades; listener tests log the filters as they are; the owner can ask for a rerun and sees the list on the Admin page. Released to the live site after three review rounds.
- 0.11 `done 23 Nov` [`ARCHITECTURE.md`](ARCHITECTURE.md): how the site is built, the data model as it is, what is in the database, what each test proves and does not, and the main decisions with their reasons. Kept current with every change of shape.
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

- 2.1 `review` Report: inventory of the data as it is: [`research/2026-11-23-data-inventory.md`](research/2026-11-23-data-inventory.md). Every file, what each field means and whether the page reads it, and 812 faults in 20 kinds. The three Hebrew chant dots in Israel are one chant genre grouped on the map with four Tel Aviv genres and fanned out, not duplicate data. Still open from this item: how prominence is calculated and why one chant dominates half of the tunnel (helper assignment H5).
- 2.2 `review` Report: open music data sources: [`research/2026-11-23-open-data-sources.md`](research/2026-11-23-open-data-sources.md). MusicBrainz, Wikidata, Discogs, ListenBrainz, Cover Art Archive, AcousticBrainz: what each holds, how it is obtained, licence wording, identifiers, limits. Main findings: only MusicBrainz gives a recording a stable identifier; its genre tags are in the non-commercial part; AcousticBrainz has ended; no open national chart archive was found. Four pages were not read (listed in the report).
- 2.3 `done 23 Nov, on dev` The schema: [`proposals/2026-11-23-schema.md`](proposals/2026-11-23-schema.md), accepted by the owner and built. Songs, artists, releases and evidence have standalone keys in central files; scopes hold research state; links say which songs belong to which genre or country-year; credits point at individual artists.
- 2.7 `done 23 Nov, on dev` The existing data moved into the schema; the built page is byte-identical before and after. Left for later steps: possible duplicate songs (809 listed), chart songs mapped to genres, compositions, weights, evidence strings.
- 2.13 Rebuild the tree layout method inside the build, so a genre can be added. Then add rways and Korean minyo as named genres (lead's determinations under principle 27).
- 2.14 Tiers in the data: each scope stores its size estimate (how many songs exist that fit, with its basis and confidence), its own target per tier, the tier reached and the tier accepted by test, as the research tiers proposal describes. The scope files have the place for it; nothing fills it yet. The size estimates from the genre batches are the first input.
- 2.4 Proposal: regions. Which ones, how fine-grained, and how a place with no music data looks and behaves on the globe and in lists.
- 2.5 Proposal: feel. A first vocabulary of moods, whether tempo or key are worth storing, how tags are assigned and how they are checked. Spotify's tempo, key and mood measures are closed to new apps, so the source has to be something else.
- 2.6 Proposal: weights. The current prominence formula written out, and a stated, adjustable replacement that separates audience size, historical influence and taste. Groundwork done 23 Nov: every formula that sets a genre's size, brightness, order or chance of being picked is written out with file and line, with 18 unstated judgements listed, in [`research/2026-11-23-prominence.md`](research/2026-11-23-prominence.md). **The owner's test for it (23 Nov):** the present result is wrong. Qur'anic recitation leads the tunnel through the modern era although it is not that large a part of day-to-day listening now. What is prominent at a moment must match how much of ordinary listening it was at that moment, not how significant it is in history or how long it has existed. A new formula is checked against that case first.
- 2.8 Completeness reviewer, version 1: a synthetic test that asks whether a period's data feels complete (are the artists a listener of that time would expect present, and filed correctly). First fixture: the artists Jon named.
- 2.9 Fix the data faults found in 2.1.
- 2.10 Proposal: how the data is stored and delivered as it grows. Today everything sits inside one page of about 2.5 MB, which cannot grow tenfold. The free database is for user data (500 MB), not for a catalogue. Likely answer: data split into files that the page loads when needed, served by Cloudflare (free, up to 20,000 files of 25 MiB). To be decided before large-scale collection.
- 2.11 Proposal: what "a database of all music" means in practice: our own records for what we have researched, plus MusicBrainz identifiers that point at everything else, not a copy of the world's catalogue. Each song and album carries its MusicBrainz identifier where one exists, which also unlocks album art (see milestone 7).
- 2.12 `review` Proposal: research in tiers, with weights and acceptance tests: [`proposals/2026-11-23-research-tiers.md`](proposals/2026-11-23-research-tiers.md). Depth tiers for genres (to 25 and 50 songs) and for country-years (6, 20, 50, 100), a weighted breadth-first order, weights on songs, and an acceptance test for each scope and pass. Shapes 2.3, 2.6, 2.8 and milestones 3 and 4.

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

**Goal:** getting the playlist takes as few steps as the services permit; people who cannot use Spotify's feature still get music; and we can compare Spotify's playlists with ours.
**Why:** copy-and-paste is friction most people will not push through, and Spotify's result is currently the better one. But the check on 23 November found that Spotify does not let a small public app connect (five named users, owner needs Premium, no access to Prompted Playlist), and that Prompted Playlist is for Premium subscribers in seven countries, in English, and is personalised to each listener's history.

- 6.1 `done 23 Nov` Report on what Spotify allows: [`research/2026-11-23-feasibility-checks.md`](research/2026-11-23-feasibility-checks.md). Apple Music and YouTube still to check.
- 6.2 Shorten the hand-off: one tap copies the prompt and opens Spotify. Check whether any link opens Prompted Playlist with the text already in place.
- 6.3 Proposal, then build: the path for people who cannot use Prompted Playlist (not Premium, another country, another language). Our own song list as something they can play: links per song, and what Apple Music and YouTube allow.
- 6.4 Bring a playlist back: a pasted song list for anyone; for up to five named testers, reading their own Spotify playlist directly. The list is stored with the trip.
- 6.5 Proposal: the comparison. How playlists from our data and from Spotify are judged against each other by synthetic listeners, by Jon, and by testers' behaviour, allowing for the fact that Spotify's playlist is shaped by the listener's own history.
- 6.6 Report: the first comparison, with a recommendation on when our own list should be the default.

**Done when:** the hand-off is as short as the services permit, someone without Prompted Playlist can still listen, and the first comparison has been run.

## 7. iOS redesign pass

**Goal:** every screen follows the approved style guide.
**Why:** Jon has had to say "it doesn't feel iOS" about several screens. Depends on 0.6.

- 7.1 List view: full-screen detail card on tap, back returns to the same position, the duplicate text filter removed.
- 7.2 Data tab: filters that match the three main filter buttons and fit a phone.
- 7.3 Account: travel log and trip sheet.
- 7.4 Admin.
- 7.5 Journey screens (look only; behaviour is milestone 9).
- 7.6 The playlist panel no longer covers the tab bar on phones.
- 7.7 Album art back on, without lookups: where a song or its album has a MusicBrainz identifier (2.11), the browser loads the cover straight from the Cover Art Archive. No images are stored by us, because the archive gives no licence for copies.
- 7.8 `done 23 Nov, on dev` Region colours on the tree, the map and the tunnel now come from Apple's system colours, light and dark (Human Interface Guidelines, Color, Specifications, values as updated June 2025). Europe indigo, North America blue, Caribbean purple, Latin America green, Africa brown, Middle East and North Africa cyan, South Asia orange, Central Asia yellow, East Asia red, Southeast Asia and Oceania mint. Not yet on the live site.
- 7.9 `provisional, on dev` Status flags and explanation cards in the playlist panel: one coloured word per row, and a card saying what was tested, the standard, the result against it, and how it was run. Still to do before it is final: show the tier a scope has reached and that scope's own standard (needs 2.14), and a card for each new kind of test (recall, evidence, genre listener) as they are registered.

**Done when:** Jon has reviewed each screen on his phone against the style guide.

## 8. Feedback loop

**Goal:** the app learns from what people do, and from what they choose to tell us, with almost no effort on their part.
**Why:** testers are unpaid and will not write reviews; when they do speak it must be easy to act on.

- 8.1 Report: which behaviours the usage log already captures and which are missing (what is looked at against what is taken, prompt language, feature use). Add the missing events.
- 8.1b Listener-test requests (0.10) are run in batches under the test registry, and the result is shown to the person who asked, where today they are only told it was received.
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

- **Tree, globe and tunnel polish.** Good enough for now. Done later as sit-down sessions where Jon tries things and says what works.
- **Visitor analytics.** Cloudflare Web Analytics is a toggle on Jon's side.

## Outside the app: the owner's way of working

Not part of the product and not on either track. Recorded so it is not lost.

- **Local development with Claude Code or a similar tool on Jon's laptop**, loading the in-progress version locally and using Cloudflare builds only before a release. `serve.py` and `CLAUDE.md` are a first step. Jon will raise this as its own conversation; nothing further is planned until then.
