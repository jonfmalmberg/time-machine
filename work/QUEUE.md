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
- **State:** open
- **Model:** Opus for the run and for research sub-agents (one per genre is fine).
- **Ask:** Take the first eight genres in `data/nodes.json` order that have no entry in `data/defs.json`, skipping any already covered by a `work/*/defs.add.json` on a `helper/*` branch. For each, research and write a definition and a playlist in exactly the shape of the existing entries in `data/defs.json` and `data/playlists.json` (read ten existing entries of each first). Every reference track and playlist song needs a source address showing the recording exists and belongs to the genre. A genre with fewer than four verifiable recordings gets status `thin` or `none`, honestly, with albums if those exist.
- **Size first:** for each genre, before collecting, answer "about how many recordings exist that fit this genre?" as a range, with the basis (discographies, archive catalogues, label lists) and how many of those a person inside the scene would call essential. Put it in `sizes.json` (genre id: low, high, core, basis, confidence).
- **Hand back:** `defs.add.json` and `playlists.add.json` (only the new entries, one per line), `sizes.json`, `sources.json` (per genre, per song: address, the exact string from the page copied character for character, date read), and in the report one paragraph per genre on how confident the research is and why.

## H4. Genre research, batch 2
- **State:** open
- **Model, ask, hand back:** as H3, the next eight.

## H5. How prominence is decided, and why one genre can dominate the tunnel (roadmap 2.1, 2.6)
- **State:** open
- **Model:** Opus.
- **Ask:** Write out, from `src/template.html` and `src/mods/50_tunnel.js`, `55_tunnelgest.js`, `60_satellite.js` and `40_journey.js`, every place where a genre's size, brightness, order or chance of being picked is computed: the formula as the code has it, which data fields feed it (`scores`, `tier`, `st`, `cnt`, heat), and what each term does. Then reproduce the owner's observation that one chant tradition fills about half of the tunnel at some year: find the year ranges where one genre or tradition takes more than a third of the tunnel's rim, by running the built page with Playwright, and explain from the formula why. Do not propose a new formula; describe the present one exactly and list its unstated judgements.
- **Hand back:** `prominence.md` (one section per formula with file and line, a table of the dominance cases found with year, genre, share), and the script that measured it.

## H6. People: population by country and decade (research tiers, the "people" part of the weight)
- **State:** open
- **Model:** Opus for the run; Sonnet sub-agents for extracting rows.
- **Ask:** For every country code in `data/iso.json`, the population at the middle of each decade from the 1940s to the 2020s (1945, 1955, ... 2025), from the United Nations World Population Prospects (first-party pages or its published data files; pre-1950 values from the source UN itself cites, or left empty and listed). Record for each figure the address, the exact string or row it came from, and the date read. Do not estimate missing values. Do not compute any weight or ranking: only the figures.
- **Hand back:** `population.json` (country code, decade, population, evidence), and in the report which countries and decades are missing and why.
