# Decisions

The lead's standing choices: what was decided, why, and what is not known. One entry per choice, newest first. An entry is changed by adding a dated line to it, not by rewriting it. Day-to-day events go in `WORKLOG.md`; this file is for choices that later work depends on, so that any of them can be defended from its original reasoning.

## 2026-11-23

### D12. Link previews use one small Worker
- **Choice:** `src/worker/index.js` runs for the page address only and writes the shared view ("Canada · 1980–2020 · Country") into the title and preview tags. The page itself sets the same words as the tab title and in the share sheet, from the same function (`src/worker/title.js`).
- **Why:** chat apps build a preview without running the page's script, so the page cannot do this itself. On a phone the address is rarely shown in full; the title has to say what is offered.
- **Cost and risk:** free plan, 100,000 Worker requests a day, one per page visit; no card, so no bill. Past the limit the page answers "too many requests" until midnight UTC. Static files stay free and unlimited.
- **Not known:** how each chat app caches previews. The Worker was not run locally (no Cloudflare runtime in the workspace); it is checked on the preview address after a push.

### D11. Genre suggestions from helpers are decided by the lead
- **Choice:** every genre a helper names that the tree lacks gets a verdict from the lead: add, fold into an existing genre as a sub-genre, not now, or not real. The list is `docs/research/2026-11-24-genre-suggestions.md`.
- **Why (owner):** handing the evaluation back is deferring responsibility. The lead must know what it is organising.
- **Not known:** the verdicts rest on the lead's general knowledge, not on sources. Anything added still needs sourced records.

### D10. Sub-genres
- **Choice:** closely related styles that share a place and an era and that few people would seek out alone are one genre with named sub-genres. The sub-genres are listed on the genre's card and found by search, but research, coverage and the listener test treat the genre as one, with one combined playlist. Applies across the site.
- **Why (owner):** splitting them clutters the app and makes the tests impossible to pass.
- **Test for splitting instead** (principle 27): different language and place before globalisation, or a large following of its own.
- **State:** not built. Needs a `subgenres` field on the genre record, search over it, and the card.

### D9. The tree is decided by feel, by the lead
- **Choice (owner):** there is no right or wrong in the tree, only what feels right. The lead decides parentage and grouping with common sense and records it here; sources inform, they do not decide.
- **Applied:**
  - `rways`: a root. No source says it descends from ahwash, and the sources set the two against each other.
  - `koreanminyo`: a root, with a line to `pansori` (other). `pungmul` is renamed "Pungmul (nongak)" and its folk songs move to `koreanminyo`. Composed 1930s new folk songs (sinminyo) are a sub-genre of it.
  - `jiangnansizhu`: a root; the lines from `kunqu` and `guqin` are removed (nothing read supports them). `jiangnansizhu` → `guoyue` becomes guoyue's principal parent (the modern Chinese orchestra grew out of the sizhu ensemble in the 1920s); `guqin` → `guoyue` becomes "other".
  - Tradition "North Indian and Punjabi folk": lavani (Marathi, Maharashtra), garba (Gujarati) and Bihu (Assamese) stay separate genres. Each has its own language, region and a large living following (garba at Navratri alone is a mass event). The fault is the tradition's name, which is wrong for three of its members: renamed "Indian regional folk and Punjabi music".
- **State:** decided, not yet in `data/`. They go in together in the next data change, with the layout placed by `tools/layout/optimise.py`.

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
