# Helper queue

Written by the lead session. A helper takes the first assignment whose state is `open`, top to bottom, one per run. Rules and the report format are in [`README.md`](README.md).

States: `open`, `handed back <date>` (helper done, waiting for the lead), `accepted <date>`, `redo: <reason>`.

---

## H1. Inventory of the data as it is (roadmap 2.1)
- **State:** handed back 2026-11-23
- **Model:** Opus for the run; Sonnet sub-agents for counting.
- **Ask:** For every file in `data/`, establish from the file and from how `src/template.html` and `src/mods/*.js` use it: what one entry is, what each field or list position means, how many entries, and which fields are actually read by the page. Where the meaning cannot be established from the code, say so; do not guess. Then list faults: genres with no definition, playlists with fewer than four songs, the same song spelled differently in different files, songs dated outside their genre's years, countries in `era.json` or `yearl.json` with empty decades, cities without a country, entries the page never reads. Include the three Hebrew chant dots in Israel reported by the owner (find which genres they are and why three appear).
- **Hand back:** `inventory.md` (one table per file, then the fault list with counts and up to ten examples each) and `faults.json` (every fault, machine-readable: file, key, kind, detail).

## H2. Open music data sources (roadmap 2.2)
- **State:** open
- **Model:** Opus.
- **Ask:** For MusicBrainz, Wikidata, Discogs, ListenBrainz, Cover Art Archive, AcousticBrainz, and any national chart archive that publishes its data under an open licence: what it holds, how it is obtained in bulk and per item (dump, API, rate limits), the exact licence and attribution wording, and what identifier it gives a song, an artist and an album. First-party pages only; quote the sentence that states each licence and limit, with its address. The licences of MusicBrainz, Wikidata, Discogs and Cover Art Archive were already checked in `docs/research/2026-11-23-feasibility-checks.md`: do not repeat that, build on it.
- **Hand back:** `sources.md`, one section per source in the same shape, ending with a table comparing them.

## H3. Genre research, batch 1 (roadmap 3.2)
- **State:** open
- **Model:** Opus for the run and for research sub-agents (one per genre is fine).
- **Ask:** Take the first eight genres in `data/nodes.json` order that have no entry in `data/defs.json`, skipping any already covered by a `work/*/defs.add.json` on a `helper/*` branch. For each, research and write a definition and a playlist in exactly the shape of the existing entries in `data/defs.json` and `data/playlists.json` (read ten existing entries of each first). Every reference track and playlist song needs a source address showing the recording exists and belongs to the genre. A genre with fewer than four verifiable recordings gets status `thin` or `none`, honestly, with albums if those exist.
- **Hand back:** `defs.add.json` and `playlists.add.json` (only the new entries, one per line), `sources.json` (per genre, per song: address), and in the report one paragraph per genre on how confident the research is and why.

## H4. Genre research, batch 2
- **State:** open
- **Model, ask, hand back:** as H3, the next eight.
