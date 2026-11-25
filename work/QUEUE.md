# Helper queue

Written by the lead session. A helper takes the first assignment whose state is `open`, top to bottom, one per run. Rules and the report format are in [`README.md`](README.md).

States: `open`, `handed back <date>` (helper done, waiting for the lead), `accepted <date>`, `redo: <reason>`.

---

**Order (lead, 24 Nov evening):** a run takes the first open assignment that has no claim branch. A name in the starting message has not been honoured reliably, so the order of this file is the priority: the genre test, the genre stories, then the chart-source survey come first.

## H25. Synthetic expert test for genres, pilot (roadmap 5.3b; decision D31)
- **State:** open
- **Model:** Opus for the run. The experts are sub-agents on **Opus**, never another model; record the model identifier each reports.
- **Why:** chart songs need a place in our own genre set. A source's genre label (Wikipedia's infobox) uses another set of categories and lumps things into "pop", "rock", "folk". The owner wants an expert's judgement of where a song belongs in *our* set, and the lead wants to know how good that judgement is before any of it is used.
- **Ask:** `work/2026-11-24-genretest/songs.json` holds 1,454 songs (artist, title, and a year or the country and year it charted). `genres.json` holds our 511 defined genres (id, name, place, years, tradition, the sound in a sentence, what to listen for). About two thirds of the songs are a hidden answer key: the lead knows their genre; you are not told which. **Do not look anything up in `data/`, on the web or anywhere else for this assignment, and tell the sub-agents the same: the test measures what an expert knows unaided.** Split the songs into batches of 40. Give each batch to a sub-agent with exactly this brief and the full text of `genres.json`: "You are a music historian with wide listening across the world's popular and traditional music. For each song decide which one of these genres it belongs to, by its sound as recorded, not by where the artist is from. Answer for each song: `known` (yes if you know this recording, no if you are guessing from the names), `genre` (one id from the list, or `none` if no genre here fits), `second` (another id if it sits between two, else null), `sure` (high, medium, low), and if `none`, `missing` (the genre you would want on the list, in a few words). Use no tools. Do not guess a recording you do not know: say known: no." Run the whole set **twice**, with different batch splits (shuffle with two different fixed seeds and record them), so every song has two independent answers.
- **Hand back:** `answers.run1.json` and `answers.run2.json` (`song`, `known`, `genre`, `second`, `sure`, `missing`, the batch number, the sub-agent's model), the two seeds, and in the report: how many songs each run knew, how often the two runs gave the same genre, the 30 most frequent `missing` phrases, and anything that went wrong (a sub-agent that used a tool, refused or returned malformed answers: say which batches). Do not score against the data: the lead does that.

## H26. Genre stories for the course, chapters 1 to 4 (roadmap 9.0b, decision D32)
- **State:** open
- **Model:** Opus for the run and for any sub-agents.
- **Why:** the owner wants every genre to tell its own history as a self-contained story: what led up to it, where, who formed it, and why and how. Each movement is a group of people with a story to tell. The course shows a definition per stop today and no story.
- **Ask:** for each genre in `work/2026-11-24-stories/genres.H26.json` write a story of 120 to 200 words in plain English, in four beats, in this order: **before** (what music and what circumstances it grew out of), **who and where** (the people: named musicians, communities, the neighbourhood or court or church, the years), **why and how** (what they were trying to do or were pushed by: a migration, a ban, a new instrument, a patron, a dance; and what they changed in the music), **after** (what it led to). Write about people doing things, with names, places and dates; no adjectives of praise; no sentence that could be said of any genre. Every sentence that states a fact needs a source a script can read, with the supporting string copied character for character from its raw text ("Evidence: how a researcher records a source" in `work/README.md`). Sources in order: the genre's English Wikipedia article as raw text, the article in the tradition's own language, a reference work or archive page. If a beat cannot be sourced, leave it out and say so; a shorter true story is right. Read the genre's record in `data/genres.json` and its definition first (`python3 tools/legacy_data.py` is not needed; the definition's sources are in `data/evidence/`), and do not contradict it without saying so in the report.
- **Hand back:** `stories.json` (`genre`, `story`: the text; `sentences`: each sentence with `url` and `quote`, or `opinion: true` for a linking sentence that states no fact), `sources.json` and `evidence-check.json`; only `found` sentences stay in a story. In the report: per genre, which beats are present, and every place where your sources disagree with our record.

## H27. Genre stories for the course, chapters 5 to 8
- **State:** handed back 2026-11-24
- **Model, ask, hand back:** as H26 with `genres.H27.json`.

## H28. Genre stories for the course, chapters 9 to 11
- **State:** open
- **Model, ask, hand back:** as H26 with `genres.H28.json`.

## H23. Chart sources for the countries that have none (roadmap 2.17c)
- **State:** open
- **Model:** Opus.
- **Why:** 41 of 226 countries have year-by-year lists. Of the most populous, China, India, Pakistan, Bangladesh, Ethiopia, the Philippines, Egypt, Vietnam, DR Congo, Iran, Thailand and Kenya have none. The owner wants the easiest sources found first.
- **Ask:** A survey, not data collection. For each country in `data/countries.json` with no file under `data/scopes/c/<code>/` holding a `year list` (work out the list yourself), most populous first, as far as the run allows: find what a script could read to say what was popular there by year. Look in this order and stop at the first that works: (1) list pages on the Wikipedia of the country's own language (es: "Anexo:Sencillos número uno…", pt, ru, tr, ar, hi, id, th, vi, zh, ko and so on), fetched as rendered HTML through `https://<lang>.wikipedia.org/w/api.php?action=parse&page=<title>&prop=text&format=json`; (2) English Wikipedia pages we have not read: `work/2026-11-24-wikicharts/pages.json` lists what we have; look for year-end charts, award lists that a national public votes on, radio airplay charts, film-song lists for countries where film song is the popular music (India, Pakistan, Egypt); (3) a national chart body or archive site with tables a script can read. For each source record the page titles or address pattern, the years covered, one example row copied from the raw page, what it measures (sales, airplay, a jury: say which, because a jury's list does not count as heard there, decision D7), and whether `tools/wiki_charts.py` would read its tables as they are (try it on one page and give the output).
- **Hand back:** `sources.json` (country, source, address pattern, years, measure, example row, reads with our tool: yes, no and why) and a ranked list in the report: which countries can be filled by script now, which need a new reader, which have nothing.

## H1. Inventory of the data as it is (roadmap 2.1)
- **State:** accepted 2026-11-23. Spot-checked by the lead against the code and data; copied to `docs/research/2026-11-23-data-inventory.md`. Answers to its questions: (1) and (3) go to roadmap 2.9; (2) is its own interface issue; (4) waits for song identities (2.7).
- **Model:** Opus for the run; Sonnet sub-agents for counting.
- **Ask:** For every file in `data/`, establish from the file and from how `src/template.html` and `src/mods/*.js` use it: what one entry is, what each field or list position means, how many entries, and which fields are actually read by the page. Where the meaning cannot be established from the code, say so; do not guess. Then list faults: genres with no definition, playlists with fewer than four songs, the same song spelled differently in different files, songs dated outside their genre's years, countries in `era.json` or `yearl.json` with empty decades, cities without a country, entries the page never reads. Include the three Hebrew chant dots in Israel reported by the owner (find which genres they are and why three appear).
- **Hand back:** `inventory.md` (one table per file, then the fault list with counts and up to ten examples each) and `faults.json` (every fault, machine-readable: file, key, kind, detail).

## H2. Open music data sources (roadmap 2.2)
- **State:** accepted 2026-11-23, with its shortfalls noted: four pages unread because the fetch tool asked for a permission nobody was there to give (MusicBrainz Data_License and MusicBrainz_Identifier, data.discogs.com, acousticbrainz.org/download), no Wikidata query limits, no open national chart archive found from two searches. Copied to `docs/research/2026-11-23-open-data-sources.md`.
- **Model:** Opus.
- **Ask:** For MusicBrainz, Wikidata, Discogs, ListenBrainz, Cover Art Archive, AcousticBrainz, and any national chart archive that publishes its data under an open licence: what it holds, how it is obtained in bulk and per item (dump, API, rate limits), the exact licence and attribution wording, and what identifier it gives a song, an artist and an album. First-party pages only; quote the sentence that states each licence and limit, with its address. The licences of MusicBrainz, Wikidata, Discogs and Cover Art Archive were already checked in `docs/research/2026-11-23-feasibility-checks.md`: do not repeat that, build on it.
- **Hand back:** `sources.md`, one section per source in the same shape, ending with a table comparing them.

## H3. Genre research, batch 1 (roadmap 3.2)
- **State:** accepted 2026-11-23 as candidates. They enter the master table after the data model is on `dev`, and count as researched only once the evidence check and the genre acceptance test have run. Lead\'s answers: (4) titles in standard spelling with diacritics, the page spelling kept as an alias; (1) near-misses stay and are checked at the master-table step; (2) and (3) are questions about the tree and go to the owner.
- **Model:** Opus for the run and for research sub-agents (one per genre is fine).
- **Ask:** Take the first eight genres in `data/nodes.json` order that have no entry in `data/defs.json`, skipping any already covered by a `work/*/defs.add.json` on a `helper/*` branch. For each, research and write a definition and a playlist in exactly the shape of the existing entries in `data/defs.json` and `data/playlists.json` (read ten existing entries of each first). Every reference track and playlist song needs a source address showing the recording exists and belongs to the genre. A genre with fewer than four verifiable recordings gets status `thin` or `none`, honestly, with albums if those exist.
- **Size first:** for each genre, before collecting, answer "about how many recordings exist that fit this genre?" as a range, with the basis (discographies, archive catalogues, label lists) and how many of those a person inside the scene would call essential. Put it in `sizes.json` (genre id: low, high, core, basis, confidence).
- **Hand back:** `defs.add.json` and `playlists.add.json` (only the new entries, one per line), `sizes.json`, `sources.json` (per genre, per song: address, the exact string from the page copied character for character, date read), and in the report one paragraph per genre on how confident the research is and why.

## H4. Genre research, batch 2
- **State:** accepted 2026-11-23 as candidates: six full (kulintang, garba and dandiya raas, mahagita, kobzar dumy, tarantella, Iraqi maqam), two with no playable list (hua\'er, malhun).
- **Model, ask, hand back:** as H3, the next eight (skip the eight in `work/2026-11-23-H3/`). Titles in the standard spelling of the language with diacritics; where the source page spells it differently, give that as `alias`. Where the natural neighbour of a genre has no id in the tree, say so in the report and do not stretch another id to cover it.

## H5. How prominence is decided, and why one genre can dominate the tunnel (roadmap 2.1, 2.6)
- **State:** accepted 2026-11-23. Copied to `docs/research/2026-11-23-prominence.md`.
- **Model:** Opus.
- **Ask:** Write out, from `src/template.html` and `src/mods/50_tunnel.js`, `55_tunnelgest.js`, `60_satellite.js` and `40_journey.js`, every place where a genre's size, brightness, order or chance of being picked is computed: the formula as the code has it, which data fields feed it (`scores`, `tier`, `st`, `cnt`, heat), and what each term does. Then reproduce the owner's observation that one chant tradition fills about half of the tunnel at some year: find the year ranges where one genre or tradition takes more than a third of the tunnel's rim, by running the built page with Playwright, and explain from the formula why. Do not propose a new formula; describe the present one exactly and list its unstated judgements.
- **Hand back:** `prominence.md` (one section per formula with file and line, a table of the dominance cases found with year, genre, share), and the script that measured it.

## H6. People: population by country and decade (research tiers, the "people" part of the weight)
- **State:** accepted 2026-11-23. 1945 is empty for every country (the UN series starts in 1950) and Antarctica and the French Southern Territories have no figures.
- **Model:** Opus for the run; Sonnet sub-agents for extracting rows.
- **Ask:** For every country code in `data/iso.json`, the population at the middle of each decade from the 1940s to the 2020s (1945, 1955, ... 2025), from the United Nations World Population Prospects (first-party pages or its published data files; pre-1950 values from the source UN itself cites, or left empty and listed). Record for each figure the address, the exact string or row it came from, and the date read. Do not estimate missing values. Do not compute any weight or ranking: only the figures.
- **Hand back:** `population.json` (country code, decade, population, evidence), and in the report which countries and decades are missing and why.

## H7. Genre research, batch 3
- **State:** accepted 2026-11-23 as candidates. Evidence check rerun by the lead with the corrected script: see `work/2026-11-23-H7/evidence-check.lead.json`.
- **Model, ask, hand back:** as H3 with the additions in H4, the next eight pending genres (skip every genre already in a `work/*/defs.add.json` on `dev` or on a `helper/*` branch).

## H9. Evidence triage: why 161 claims from batches 1 and 2 are unconfirmed
- **State:** accepted 2026-11-23. Lead\'s answers: (1) re-point the 17 claims to the Commons address in H11; the string is the evidence and it is found there. (2) Done: the script now handles compressed replies, text in meta, title and alt attributes, both PDF readings, and asks again after a passing network fault. Stacked fractions are not handled. (3) The owner decides whether to run the check for Smithsonian Folkways from his own computer; until then H11 leaves those claims unverified and does not hunt for replacements for them.
- **Model:** Opus for the run; Sonnet sub-agents may fetch pages.
- **Ask:** `work/2026-11-23-evidence/evidence-check.json` holds the script's result for 526 claims; read `work/2026-11-23-evidence/REPORT.md` first. For every claim with result `not found` (15) and `no page` (146), work out which of these it is and record it: `confirmed` (the page does say it: give the exact text as it appears), `reworded` (the page supports the claim but the quote was not exact: give the exact text), `page unreadable by script only` (you could read it and it supports the claim: give the exact text), `source gone` (the address is dead for you too), `wrong source` (the page exists and does not support the claim), `cannot tell`. Start with the 17 claims on `download.osmand.net` and say what that source actually is. Do not repair the data and do not look for replacement sources: classify only. Also test and report whether your shell can fetch a web page directly (`curl -sS -m 15 -o /dev/null -w "%{http_code}" https://en.wikipedia.org/wiki/Music`), since that decides whether helpers can copy exact page text.
- **Hand back:** `triage.json` (file, scope, n, the class, exact text where found, a one-line reason), and in the report the counts per class, per genre, and the songs that now have no supporting source at all.

## H10. Evidence for data already on the site: pilot on two scopes (roadmap 2.15)
- **State:** accepted 2026-11-23. Lead reran the check: 159 of 159 found, agreeing with the helper. Its questions on what counts as evidence for a foreign song and on rank against chart position are for the owner.
- **Model:** Opus for the run; Sonnet sub-agents may extract rows from pages already fetched.
- **Ask:** The songs on the site were collected before sources were checked. Measure how good they are on two scopes, following "Evidence: how a researcher records a source" in `work/README.md` exactly (raw page text from the shell, never the page-reading tool for quotes).
  1. **Japan, 1980 to 1989, year lists.** `data/links/c/JP/1980.json` holds the links (scopes `c:JP:1980` to `c:JP:1989`); songs are in `data/songs/`, artists in `data/artists/`, and each link's source is an evidence id in `data/evidence/` (title and address only). For every link: fetch the source page raw, find the row or line that names this song for this year, and record the exact string. If the page does not name it, say so; do not look for another source.
  2. **The genre `swing`.** `data/links/g/swing.json`, roles intro, peak and reference. These have no source at all. For each song find one page a script can read that shows the recording exists, who made it and when, and record the exact string. Limit: three searches per song.
  Run `python3 tools/check_evidence.py` on your `sources.json` (same shape as `work/2026-11-23-H4/sources.json`) and hand back its output.
- **Hand back:** `sources.json`, `evidence-check.json`, and in the report, per scope: links checked, found, not found on the cited page, no readable source, and every song whose artist, title or year on the site differs from what the source says (give both).

## H8. Genre research, batch 4
- **State:** accepted 2026-11-23 as candidates. Lead reran the check: 594 of 594 found, agreeing with the helper.
- **Model, ask, hand back:** as H7, the next eight, following the evidence section of `work/README.md`: only songs whose claim the check script finds go into the add files.

## H11. Batches 1 and 2 again, under the evidence rule
- **State:** accepted 2026-11-23 as candidates. Lead reran the check: 444 found against the helper\'s 447; the three that differ are two sites the lead\'s run could not reach at that moment (a name lookup failure and a bot check), not a disagreement about content. Re-pointing `wiki.riteme.site` to Commons is accepted, as for osmand.
- **Model:** Opus for the run and for research sub-agents.
- **Ask:** After H9. For the 16 genres in `work/2026-11-23-H3/` and `work/2026-11-23-H4/`: keep every claim the check found; for each claim that H9's `triage.json` did not class as confirmed, find a page a script can read and record the exact string from its raw text, or move the song to unverified. Rebuild `defs.add.json`, `playlists.add.json`, `sizes.json`, `sources.json` for all 16 so that every song in them has at least one claim with the result `found`, and run the check.
- **Hand back:** the rebuilt files, `evidence-check.json`, and per genre: songs before, songs kept, songs dropped and why.

## H12. Genre research, batch 5
- **State:** accepted 2026-11-23 as candidates. Lead reran the check: 649 of 649 found, agreeing with the helper.
- **Model, ask, hand back:** as H7, the next eight pending genres, following the evidence section of `work/README.md`: only songs whose claim the check script finds go into the add files.

## H13. Genre research, batch 6
- **State:** accepted 2026-11-23 as candidates. Lead reran the check: 626 of 626 found, agreeing with the helper. Nurthi is to be treated as thin at ingest (one reissue series is 21 of its 24 songs); changga stays thin.
- **Model, ask, hand back:** as H12, the next eight.

## H14. Records for two new genres: rways and Korean minyo
- **State:** accepted 2026-11-23 as proposals. Lead rerun: 66 of 68 found, 2 no page (Folkways refuses scripts). The helper's one "not found" was a checker fault (a linked Korean word followed by its particle), fixed in `tools/check_evidence.py`. Not added to `data/`: parentage waits for the owner.
- **Model:** Opus.
- **Ask:** The lead has decided (principle 27) that two genres belong on the tree: **rways** (Tashelhit professional singer-poets of the Sous, Morocco), separate from `amazighahwashandah`; and **Korean minyo** (Korean folk song), separate from `pungmul` and from the Japanese `minyo`. For each, propose a complete genre record in the shape of `data/genres.json` (read ten existing records and `docs/proposals/2026-11-23-schema.md`, "Genres and the tree"): id, name, region, family, tradition (an existing one, or say why none fits), began, ended, origin (text, latitude, longitude, country), definition (window, sound, three or more markers), one principal parent and at most two others from existing genre ids, and a first estimate of where and when it peaked. Every fact needs a source recorded as `work/README.md` requires (raw page text, exact string) and must pass `python3 tools/check_evidence.py`. Say which songs in `work/2026-11-23-H3/` listed under `pungmul` are Korean minyo and not percussion music. Do not edit `data/`.
- **Hand back:** `genres.add.json`, `parentage.add.json`, `presence.add.json`, `sources.json`, `evidence-check.json`, and the list of `pungmul` songs to move.

## H16. Where chart artists are from: batch A (Ireland, France, Germany, Italy, Spain, United Kingdom) (roadmap 2.17, decisions D7, D16, D22)
- **State:** accepted 2026-11-24 and applied at chart ingest (decision D28). The lead read the report and spot-checked the result in the page; the evidence check was not rerun by the lead.
- **Model:** Opus for the run; Sonnet sub-agents may look up artists in parallel, each given a slice of the list and the evidence rule in full.
- **Why:** the lead is putting national chart songs into place-and-year lists. A chart row shows a song was heard in a country. It does not show where the artist is from, which the "Made there" filter needs. Until an origin is recorded the song is shown as heard there only.
- **Ask:** `work/2026-11-24-wikicharts/artists.A.json` lists artist credits exactly as the chart pages give them, most chart rows first. Work down the list as far as the run allows. For each credit: split it into the artists it names (a "featuring", "and", "&", "with", "feat." or "/" credit names several; a band name containing "&" is one artist: decide from the artist's own article, never from the punctuation). For each artist find the country they are from: for a person, where they were born or, if the article's first sentence calls them by a nationality, that nationality; for a group, where it was formed. Source order: the artist's English Wikipedia article fetched as raw text (`https://en.wikipedia.org/wiki/<Title>?action=raw`), then the article in the artist's own language the same way. Copy the supporting string character for character from the raw text (the first-sentence phrase, or the infobox `origin` or `birth_place` line). One fetch attempt per source per artist; an artist with no article is listed as not found, not guessed. Do not use what you remember.
- **Hand back:** `origins.json`: one record per artist `{credit, artist, kind: person|group, country: <two-letter code from data/countries.json>, url, quote, read}` (a person with two nationalities in the first sentence: `country` is a list); `sources.json` in the shape `tools/check_evidence.py` reads (`{"A": [{url, quote, artist, title: ""}]}`) and its `evidence-check.json`; only `found` records in `origins.json`, the rest in `unverified.json` with the reason. In the report: how far down the list you got (the last credit done), counts found, not found and ambiguous, and every credit whose split you were unsure of.

## H17. Where chart artists are from: batch B (rest of Europe)
- **State:** accepted 2026-11-24 and applied with `tools/apply_origins.py` (decision D28). The lead read the report; the evidence check was not rerun by the lead.
- **Model, ask, hand back:** as H16 with `artists.B.json` and the key `"B"`.

## H18. Where chart artists are from: batch C (Americas outside the United States, Oceania, Asia, Africa)
- **State:** accepted 2026-11-24 and applied with `tools/apply_origins.py`.
- **Model, ask, hand back:** as H16 with `artists.C.json` and the key `"C"`. Many of these artists have their fullest article in Spanish or Portuguese: use it when the English one is missing or silent on origin.

## H19. Where chart artists are from: batch D (United States year-end charts)
- **State:** accepted 2026-11-24 and applied with `tools/apply_origins.py`.
- **Model, ask, hand back:** as H16 with `artists.D.json` and the key `"D"`.

## H20. Release years from Wikipedia, part 1 (roadmap 2.16, decision D18)
- **State:** open
- **Model:** Opus for the run; Sonnet sub-agents may look up songs in parallel, each given a slice and the evidence rule in full.
- **Why:** a wrong year puts a song in the wrong decade. Only 1,334 of 10,733 songs have a checked year.
- **Ask:** `work/2026-11-24-years/songs.1.json` lists 1,200 songs with no checked year, most-used first (`year_on_site` is what the site shows; it is often a reissue year). For each, find the year of first release in this order and stop at the first that answers (decision D18): the song's own Wikipedia article (infobox `released`), the artist's discography article or section (the row for the single), the article of the album it first appeared on. Fetch as raw text (`?action=raw`), English first, then the artist's own language. Copy the supporting string character for character. Two sources at most per song; a song with no source is listed as not found. Do not use MusicBrainz and do not use what you remember.
- **Hand back:** `years.json`: `{song, year, basis: song article|discography|album article, url, quote, read}`; `sources.json` and `evidence-check.json` as in `work/README.md`; only `found` in `years.json`. In the report: how far you got, counts per basis, and every song where the year found differs from `year_on_site` by more than one year (both years).

## H21. Release years from Wikipedia, part 2
- **State:** open
- **Model, ask, hand back:** as H20 with `songs.2.json`.

## H22. Records for six new genres (research note `docs/research/2026-11-24-genre-suggestions.md`, numbers 1 to 6)
- **State:** open
- **Model:** Opus.
- **Ask:** As H14 (read its folder `work/2026-11-23-H14/` for the shape and its report for the standard), for: copla / canción española; dōyō; música guajira / punto cubano; nanguan / nanyin; modern Amazigh band music; batuku (with finaçon and tabanka as sub-genres). For each propose the genre record, its parent on the tree with the reason, where and when it was present, a definition with evidence, and a first playlist with evidence.
- **Hand back:** as H14.

## H24. Source check of the course lectures (decision D29)
- **State:** accepted 2026-11-24: 3 wrong and 12 too-strong sentences corrected, 6 unsourced ones softened in `data/course.json`.
- **Model:** Opus for the run and for any sub-agents.
- **Why:** the lead wrote eleven chapter lectures for the course from general knowledge (`data/course.json`). They are shown marked as not yet checked. Wrong statements must not stand.
- **Ask:** For every sentence in every lecture that states a fact about the world (a date, a place, a cause, who did what, what came from what): find a source a script can read and copy the supporting string from its raw text, following "Evidence: how a researcher records a source" in `work/README.md`. Class each sentence: `supported` (give url and quote), `wrong` (give what the source says instead, with url and quote), `too strong` (the source supports a weaker claim: give the wording it supports), `opinion` (a framing or judgement, not checkable), `not found`. Do not rewrite the lectures.
- **Hand back:** `claims.json` (chapter, sentence, class, url, quote, note), `sources.json` and `evidence-check.json` as usual, and in the report the counts per class and every `wrong` and `too strong` sentence in full.

## H15. Genre research, batch 7
- **State:** on hold 2026-11-23 (lead): 56 researched genres wait for ingest; no more genre batches until that is reviewed.
- **Model, ask, hand back:** as H12, the next eight pending genres (skip every genre already in a `work/*/defs.add.json`). In the report, count for each genre how many songs are tied to it only by a track or album title, and try one further source (liner notes, a label page, a national library or archive catalogue) for each such song before accepting it.
