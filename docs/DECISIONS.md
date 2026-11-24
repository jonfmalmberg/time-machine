# Decisions

The lead's standing choices: what was decided, why, and what is not known. One entry per choice, newest first. An entry is changed by adding a dated line to it, not by rewriting it. Day-to-day events go in `WORKLOG.md`; this file is for choices that later work depends on, so that any of them can be defended from its original reasoning.

## 2026-11-23

### D20. Accounts open; filter capsule; controls in one corner; the tour holds play (owner, 23 Nov, 23:16 and 23:38)
- **New accounts are let in at once** (`db/006_open_signups.sql`). Owner: signing in gives a person their travel log, which needs no approval. Approval is for filing issues and voting (roadmap 8.5), which are not built; that gate will be its own flag when they are. The invite functions and the admin "Let in" action remain but no longer have a use for new people. Not known: whether open sign-in draws abuse; the 1,000 cap is the only limit.
- **A named filter shows as a capsule (a small pill) at top centre** of every content view except its home view. A genre filter's home view is the list, where the genre's entry is marked instead. Reason (owner): the filter tracks across views, so the reminder should too, at the minimum size that reads. With no filter the capsule shows the selected genre (lead's choice, question open).
- **Content controls sit bottom right** in tree and map. Reason: the owner asked for one corner; top centre is taken by the capsule and the bottom right is nearest the thumb. The imagery credit moved above the map controls. Question open.
- **The tour steps by Next/Done**, so every hint, including the account hint, is reached with or without signing in. **A play tap during the tour is held**: the button pulses and a line says what it would open, then the tour moves on. Reason (owner): leaving the page breaks the tour, but the button must not seem dead.
- Known flaws, accepted by the owner for this round: the capsule covers part of the tree's year axis; the held-play line covers the first song for a few seconds.

### D19. First impression, one sheet, and the list (owner's review, late 23 Nov)
- **Landing page.** A visitor who is not signed in first sees a full-screen page: a turning Earth, the one-line purpose, a coloured "Sign in with Google" and a plain "Explore without an account". Why (owner): the first impression should be attractive, and a little friction at the door encourages signing in without annoying. Signed-in people never see it; a visitor who chose to go on without an account is not shown it again on that device; a shared link opens straight on its view. Caution: new accounts are still let in by hand, so the page says so.
- **Guided start.** "Explore without an account", or signing in, leads to one question ("Where do you want to go?") with three one-tap answers, then four hints in turn: play a song, where the whole playlist is (the Listen tab is marked), where to go next, and where the travel log is (the account button is ringed). The suggested places are the countries with the fullest year lists today, not ones chosen by a listener test; the owner accepts this until the data is better.
- **One bottom sheet at a time on a phone.** The filter chips and the playlist button behave like tabs of one sheet: a filter replaces the playlist and the playlist button brings it back. Why (owner): a phone has no room to watch a playlist update behind a filter sheet, so two sheets are only clutter.
- **Sheet height.** No sheet comes closer to the filter row than half that row's height. The playlist sheet keeps one height on all its tabs (they are navigation and must not move), is sized by dragging and stays where it is left, closes when left very low and snaps to the limit when left near it.
- **Essential or Popular.** With one genre as the genre filter, the playlist holds either the genre's own hand-picked songs or what was most heard in the chosen place and time. Chosen in the genre filter. While Essential is shown the place and time chips are greyed, because that list does not use them. Known gaps: Popular is not yet narrowed to the genre (chart songs carry no genre: roadmap 5.3b); Essential ignores the years (5.3c).
- **A random genre** opens its playlist sheet over the view the person is in. A genre's sheet can sit over the tree, map, tunnel or list.
- **The list** has no floating "selected" bar. An entry has "Filter to this genre", which sets the genre filter, so the tree, map and tunnel show the same choice. Why (owner): the filters are the one way the views stay in step.
- **Not decided:** other ways to encourage signing in (ideas given to the owner, none built); whether the "selected" bar should also go from the tree, map and tunnel.

### D18. Release years: Wikipedia first, MusicBrainz as confirmation only
- **Choice:** the order of sources for a song's release year is: the song's own Wikipedia article; the artist's discography table; the album article (stored as "from the album"); the chart year as an upper bound; MusicBrainz only to confirm.
- **Why:** the owner's point that MusicBrainz often holds reissues was borne out. In a pilot it confirmed 37 of 40 Canadian songs of the 2010s but only 28 of 40 Japanese songs of the 1980s; for the rest it had only 1990s CD reissues. A later MusicBrainz year therefore says nothing against an earlier one, and only an earlier official release is treated as a flag.
- **Done:** one two-hour MusicBrainz pass over the first 1,821 of 6,022 place-list songs (alphabetical by country, so not a fair sample): 1,302 years confirmed within one year, 32 flagged as possibly late, 459 no usable match, 28 with no year of ours. The confirmations and flags are stored on the songs and shown in the Data tab. Owner agreed (23 Nov) that further two-hour runs are better spent elsewhere, so the pass is not continued.
- **Not built:** every Wikipedia step. Coverage of each is not known.

### D17. The playlist panel
Worked out with the owner by screenshots on 23 Nov. The reasons matter more than the layout:
- **The interface follows the vision** (principle 28). The panel shows what the app is for: the songs the site holds, then ways to listen on any service. "Ready-made playlist" is the first option under every service, marked "In development", because it is where the app is going. The playlist prompt is one option, not the frame.
- **Sections are tabs:** Songs, Listen, Sounds (a place and time only), Research. One section at a time, so the panel stays short.
- **A song row:** tapping the row stays in the app and unfolds the song's details (today: look-up links). The play arrow is the one control that leaves the app, and opens the song on the service chosen with "Play on". Reason (owner): play is an outside link, so it should not be the row's default.
- **Services** are named with a colour dot, not logos: the lead may not draw trademarks; the companies' official files could replace the dots under their own rules.
- **What belongs to the filters stays in the filters:** how long you stay, and heard there or made there, are chosen in the filter bar, which is always visible. The panel states them (the year range in the title, heard or made as the subtitle) and has no controls for them, and no "edit filters" button.
- **Display options** (which script song names are shown in) apply to the whole panel and sit behind the "…" button as a pop-out. The prompt keeps its own two options, language and name script, because what is pasted into a service is a separate matter from what is read on screen.
- **Removed:** "Copy link" (Share in the top bar does it), "Get this playlist" (it only switched tabs), "Play the first song" (each song has its own play control).
- **Known gaps:** the play arrow opens the service's search for the song, not the song, until per-service track ids are collected; whether the search links open the installed apps on a phone is not tested; a filter of several places with no list of its own falls back to "the sounds alive here" and can give an odd list (four mixed places gave 16 heavy metal songs); a title longer than two lines is cut; a genre's note is cut at two lines with no way to read the rest in the panel.

### D16. Charts come first from Wikipedia's list pages, read by script
- **Why (owner):** chart positions for one country and decade is weak; collect from the easiest, most available sources first.
- **Found:** English Wikipedia has about 1,170 chart list pages in uniform families that a script can read as tables:
  - Year-end charts with positions: Billboard Year-End Hot 100, United States, 1946 to 2025 (89 pages).
  - Weekly number ones by year: Germany 1956 on, Italy 1960 on, Spain 1961 on, Ireland 1962 on, France 1955 on, Canada 1957 to 2007, United States 1940 on, Japan (Oricon) 1967 on, Mexico 1961 on, Austria, Denmark, Finland, Australia, New Zealand, Argentina, Portugal, Poland, Switzerland and about 25 more countries with shorter runs.
  - United Kingdom top-ten singles by year, 1952 to 2026 (75 pages).
- **Choice:** `tools/wiki_charts.py` reads these pages into rows (page, year, position or date, title, artist). A number one on a national chart counts as heard there (D7). The rows are candidates in `work/2026-11-24-wikicharts/`; they enter `data/` through an ingest step for place-and-time lists, with the page as evidence and the chart position stored (D8).
- **What the site holds today, for comparison:** 2,359 chart-list songs, of which the United States is covered only for the 2010s and 1940s.
- **Not known:** how many rows the reader gets wrong on pages with unusual tables (to be measured by the row count per page and a sample). A number-one list says a song was the top seller for a week, not how it ranked over the year. Wikipedia's own accuracy is taken as given; the release year still needs the MusicBrainz check.
- **Discographies:** MusicBrainz stays the source for release years (D13). Wikipedia song articles carry a "Released" date for well-known songs and are the fallback where MusicBrainz has only reissues; not built.

### D15. Usage is logged for every visitor
- **Choice (owner):** the anonymous usage log no longer skips browsers that send "do not track" or Global Privacy Control.
- **Why:** the log holds what was used in the site (views opened, places and years chosen, prompts copied, screen size, language, the site the visitor came from) and a random number for the visit. No name, address, account or device identifier, nothing stored on the device, nothing sold or passed on. The signals exist to stop tracking of people; this does not track a person.
- **What changed with it:** the About text no longer promises "not at all if your browser asks not to be tracked"; it now says what is recorded.
- **Not known / caution:** the lead is not a lawyer. "Do not track" has no legal force. Global Privacy Control is a legal opt-out of the sale or sharing of personal information in some US states; this log is neither, as far as the lead can tell. If the site ever adds anything that identifies a person or a device, this choice must be looked at again.

### D14. What a duplicate is, and what the Data tab shows
- **Found (owner's screenshot, Justin Bieber):** two different things look like duplicates. (1) The Data tab lists one row per appearance of a song in a list, and calls the rows "songs": "Sorry" is one song record that appears in six lists. (2) Real duplicates: "Baby" exists twice, once credited "feat. Ludacris". By exact title and main artists there are 242 surplus song records in 225 groups, out of 10,915.
- **Choice:** the Data tab shows each song once, with its appearances under it. Song records with the same title, the same main artists and the same release year are merged by a script, keeping the fuller credit and all links; `tests/data.py` then forbids them. A version with a different main or featured line-up that is a different recording stays separate (owner's rule: with and without Rihanna are two songs); "feat." written on one copy and missing on the other, same year, is the same recording.
- **Not known:** how many of the 809 looser match candidates (`work/2026-11-23-schema/`) are real duplicates.
- **State:** not built.
- **2026-11-23, later:** built on branch `review`: `tools/merge_duplicates.py` removed 182 duplicate records (10,915 to 10,733 songs), `tests/data.py` forbids new ones, and the Data tab shows each song once with its other lists folded under it.

### D13. Validation is per field, by importance
- **Choice:** each field has an importance and its own check; year, country, artist country, the genre tie and duplicates are high. Plan: `docs/proposals/2026-11-24-validation.md`. "Sources checked" today covers only that the song's name is on the cited page (D6).
- **Why (owner):** song exists is a low bar; a wrong year or country breaks the filters.
- **State:** proposal. Roadmap 2.16.

### D12. Link previews use one small Worker
- **Choice:** `src/worker/index.js` runs for the page address only and writes the shared view ("Canada · 1980–2020 · Country") into the title and preview tags. The page itself sets the same words as the tab title and in the share sheet, from the same function (`src/worker/title.js`).
- **Why:** chat apps build a preview without running the page's script, so the page cannot do this itself. On a phone the address is rarely shown in full; the title has to say what is offered.
- **Cost and risk:** free plan, 100,000 Worker requests a day, one per page visit; no card, so no bill. Past the limit the page answers "too many requests" until midnight UTC. Static files stay free and unlimited.
- **Not known:** how each chat app caches previews. The Worker was not run locally (no Cloudflare runtime in the workspace); it is checked on the preview address after a push.
- **2026-11-23, later (owner's test on iPhone):** iMessage shows the preview at once; Facebook shows text first and the preview after sending; pasting into Signal gave the title with no link. Cause as far as the lead can tell: the share sheet was given both a text and an address, and iOS "Copy" then copies only the text. The share now passes the address without a text. Not confirmed on a phone.

### D11. Genre suggestions from helpers are decided by the lead
- **Choice:** every genre a helper names that the tree lacks gets a verdict from the lead: add, fold into an existing genre as a sub-genre, not now, or not real. The list is `docs/research/2026-11-24-genre-suggestions.md`.
- **Why (owner):** handing the evaluation back is deferring responsibility. The lead must know what it is organising.
- **Not known:** the verdicts rest on the lead's general knowledge, not on sources. Anything added still needs sourced records.

### D10. Sub-genres
- **Choice:** closely related styles that share a place and an era and that few people would seek out alone are one genre with named sub-genres. The sub-genres are listed on the genre's card and found by search, but research, coverage and the listener test treat the genre as one, with one combined playlist. Applies across the site.
- **Why (owner):** splitting them clutters the app and makes the tests impossible to pass.
- **Test for splitting instead** (principle 27): different language and place before globalisation, or a large following of its own.
- **State:** not built. Needs a `subgenres` field on the genre record, search over it, and the card.
- **2026-11-23, later:** built on branch `review`: field `subgenres` on a genre record, shown on the genre's entry in the list as "Includes", found by the search. 18 genres seeded from the verdict list. Not done: research and listener tests treating sub-genres as coverage targets.

### D9. The tree is decided by feel, by the lead
- **Choice (owner):** there is no right or wrong in the tree, only what feels right. The lead decides parentage and grouping with common sense and records it here; sources inform, they do not decide.
- **Applied:**
  - `rways`: a root. No source says it descends from ahwash, and the sources set the two against each other.
  - `koreanminyo`: a root, with a line to `pansori` (other). `pungmul` is renamed "Pungmul (nongak)" and its folk songs move to `koreanminyo`. Composed 1930s new folk songs (sinminyo) are a sub-genre of it.
  - `jiangnansizhu`: a root; the lines from `kunqu` and `guqin` are removed (nothing read supports them). `jiangnansizhu` → `guoyue` becomes guoyue's principal parent (the modern Chinese orchestra grew out of the sizhu ensemble in the 1920s); `guqin` → `guoyue` becomes "other".
  - Tradition "North Indian and Punjabi folk": lavani (Marathi, Maharashtra), garba (Gujarati) and Bihu (Assamese) stay separate genres. Each has its own language, region and a large living following (garba at Navratri alone is a mass event). The fault is the tradition's name, which is wrong for three of its members: renamed "Indian regional folk and Punjabi music".
- **State:** decided, not yet in `data/`. They go in together in the next data change, with the layout placed by `tools/layout/optimise.py`.
- **2026-11-23, later:** applied to `data/` on branch `review`. `rways` and `koreanminyo` added from the helper's records (H14) without their evidence keys, so their facts count as unchecked; sources are in `work/2026-11-23-H14/`. The rways start date is marked an estimate. Both placed on the tree by the layout method.

### D8. Order of songs in a place-and-time list
- **Choice:** where a chart exists, each song's chart position is stored on its link (`chart_pos`, with the chart's name) and is the first factor in the order. Any departure from chart order is made by a stated rule in the code, never by hand. Rule, version 1: charted songs in chart order; then songs with no chart position, by evidence weight; a foreign song with no local chart position never sits above a charted one.
- **Why (owner):** the chart should be a factor; the assumption behind the order must be explicit and tested against user feedback.
- **What is known about the present order:** for Japan in the 1980s the order is the Oricon year-end order of a chosen subset, with a few foreign songs placed in between. It matches the chart position in 62 of 127 cases because skipped songs shift every later rank. The list was made in the artifact, before this repository. **Why those songs were chosen and others skipped was never written down and is not known.**
- **State:** not built. Version 1 is an assumption to be tested with the listener test and real feedback.

### D7. What counts as "heard there"
- **Choice:** a song counts as heard in a country when the source measures or reflects the general public there: a national sales or airplay chart, or an open, widely recognised award with no built-in slant. A list made by or for a subset of the population (one community's favourites, one critic's picks, a genre award) does not count. An award given in another country does not count.
- **Applied to Japan 1980s:** songs resting only on an unranked "foreign singles of the year" table, a TV special prize or a UK award are not evidence of being heard in Japan; they stay, marked unverified, until a chart row is found.

### D6. What "verified" means, and what it does not
- **Verified means one thing:** a script fetched the recorded page and found the recorded words on it. For a song, the words are its artist and title on a page that the researcher tied to the genre or the place and year (a chart row, a track list, an article naming it).
- **It therefore shows:** the song exists under that name, and the page mentions it.
- **It does not show:** that the year is the first release (many are reissue years), that the song is typical of the genre (many ties are an album title naming the genre), that it was popular, or that it can be played on a streaming service.
- **So:** "verified" is shown to the user as "source checked", per fact, not as a mark of quality. Whether a list is any good is the listener test's job, not this one's.
- **Old data** (everything from before 23 Nov) is unverified until checked and is marked so in the app.
- **Unverifiable sources** (a site that refuses scripts, such as Smithsonian Folkways; a dead page): the fact stays, marked unverified. The owner is not asked to check pages by hand.
- **Start dates and peaks with no source** are stored and shown as estimates.

### D5. How researched songs reach the site ("ingest")
- **Choice:** `tools/ingest.py` copies a helper's researched genre from `work/` into `data/`: the definition, and each song that has at least one source-checked claim matching its artist and title, with that evidence attached. Songs without one are left out. Under 12 songs the genre is marked thin.
- **What the user sees:** the genre gets a definition and a playlist; a status on the playlist says Verified, Partly verified or Unverified (D6).
- **Not done by ingest:** de-duplicating against songs already in the data beyond exact artist and title, checking years, ranking. Those are later steps and known gaps.

### D4. Verification effort
- **Choice:** the lead does not rerun a helper's full check as routine. A rerun is for a sample, or when something looks wrong. More genre research is on hold until the researched genres are on the site and a listener test says how good they are.
- **Why (owner):** every full rerun on 23 Nov agreed with the helper; the day went to an obscure corner while the app has larger gaps.

### D3. One demo per review round
- **Choice:** everything waiting for the owner goes on one branch, `review`, pushed once. **Why:** six feature branches cost six Cloudflare builds for one review.

### D2. Tree layout
- **Choice:** the stored layout (`data/layout.json`) is the artifact's; `tools/layout/optimise.py` reproduces its cost within 0.24% and places new genres without moving old ones.
- **Not known:** the cause of the 0.24% difference; the original optimiser's exact settings were recovered from saved files, not from a written record.

### D1. No made-up data
- **Choice (owner):** nothing is shown as sourced unless the script found its words on its page. Quotes come from raw page text, never from a model's reading. See `CLAUDE.md`.
