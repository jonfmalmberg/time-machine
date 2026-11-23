# Helper queue

Written by the lead session. A helper takes the first assignment whose state is `open`, top to bottom, one per run. Rules and the report format are in [`README.md`](README.md).

States: `open`, `handed back <date>` (helper done, waiting for the lead), `accepted <date>`, `redo: <reason>`.

---

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
- **State:** open
- **Model, ask, hand back:** as H12, the next eight.

## H14. Records for two new genres: rways and Korean minyo
- **State:** open
- **Model:** Opus.
- **Ask:** The lead has decided (principle 27) that two genres belong on the tree: **rways** (Tashelhit professional singer-poets of the Sous, Morocco), separate from `amazighahwashandah`; and **Korean minyo** (Korean folk song), separate from `pungmul` and from the Japanese `minyo`. For each, propose a complete genre record in the shape of `data/genres.json` (read ten existing records and `docs/proposals/2026-11-23-schema.md`, "Genres and the tree"): id, name, region, family, tradition (an existing one, or say why none fits), began, ended, origin (text, latitude, longitude, country), definition (window, sound, three or more markers), one principal parent and at most two others from existing genre ids, and a first estimate of where and when it peaked. Every fact needs a source recorded as `work/README.md` requires (raw page text, exact string) and must pass `python3 tools/check_evidence.py`. Say which songs in `work/2026-11-23-H3/` listed under `pungmul` are Korean minyo and not percussion music. Do not edit `data/`.
- **Hand back:** `genres.add.json`, `parentage.add.json`, `presence.add.json`, `sources.json`, `evidence-check.json`, and the list of `pungmul` songs to move.
