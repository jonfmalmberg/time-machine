# Brief for one H22 research sub-agent (one genre each)

You research ONE new genre for the World Music Time Machine (repository at /home/claude/time-machine, branch `helper/2026-11-25-h22`). Today is 2026-11-25; use `"read": "2026-11-25"` on every claim. You are a researcher: you hand back candidate files, you change nothing else. The genre does not exist in the tree yet: you propose its record.

## Read first (all on disk)
- `work/README.md`, especially "Evidence: how a researcher records a source". This is the rule you work under.
- The model hand-back for a NEW genre record: `work/2026-11-23-H14/` (`REPORT.md`, `genres.add.json`, `parentage.add.json`, `presence.add.json`, `sources.json`, `unverified.json`). Copy those shapes.
- The model hand-back for definitions and playlists: `work/2026-11-23-H13/brief.md`, and in `work/2026-11-23-H13/` the files `defs.add.json`, `playlists.add.json`, `sizes.json`, `sources.json`. Copy those shapes (one genre's entry each).
- `docs/research/2026-11-24-genre-suggestions.md` (why this genre was chosen; it is the lead's unsourced judgement).
- `data/genres.json` (valid ids, regions, families, traditions: `data/regions.json`, `data/families.json`, `data/traditions.json`), `data/parentage.json`, and `data/presence.json` (shape of presence lines). Read the records of the neighbours named in your task.

## What to produce
Write ONLY inside `work/2026-11-25-H22/parts/<genre id>/`:
1. `genre.json`: one record in the shape of a line of H14's `genres.add.json`: `id`, `name`, `aliases`, `region`, `family`, `tradition` (existing ids only; if none fits, use the nearest and say so in notes), `began`, `attested` (only if `began` is a first record, not an estimate), `ended`, `origin` {text, lat, lon, country}, `definition` {window, sound, markers (3 or more)}, `evidence` {field: ["<id>:<n>", ...]} pointing at claims in your sources.json by index.
2. `parentage.json`: list of lines {from, to, kind: principal|other, evidence, note}. `from` is the parent, `to` the child; existing ids or your own id. Give the reason; if no source states descent, say "Judgement" in the note. Also any sub-genre relations you were asked about.
3. `presence.json`: lines {genre, place (ISO country code or region id), kind: origin|peak|later, from, to?, strength? (0.85 for country peaks as H14), basis: "first estimate", evidence}.
4. `size.json`, `def.json` (fits and near), `playlist.json` exactly as the H13 brief describes (status full/thin/none, intro, peak, albums, fold null, note, yrs).
5. `sources.json`: `{"<id>": [claims...]}`, each claim `{kind: def|size|fit|near|song|album, field?, artist, title, url, quote, read, note?}`. Number claims by their index in this list (`<id>:0` is the first).
6. `unverified.json` and `evidence-check.json` (output of `python3 tools/check_evidence.py work/2026-11-25-H22/parts/<id>/sources.json --out work/2026-11-25-H22/parts/<id>/evidence-check.json`).
7. `notes.md`: `## (a) Confidence`, `## (b) Sources` (title and address), `## (c) Disagreements with our records` (anything in data/ your sources contradict), `## (d) Neighbours with no id`, `## (e) What fell short`, `## (f) Questions for the lead`.

## Evidence rules (the owner's rule: no made-up data)
- Use web search and any page-reading tool only to FIND pages. Never take a quote from them: they reword.
- For every claim, fetch the page yourself in the shell (`curl -sL -A "time-machine-research/1" <address>`; `pdftotext` for PDFs; Wikipedia raw HTML via `https://<lang>.wikipedia.org/w/api.php?action=parse&page=<title>&prop=text&format=json` is fine to search, but record the plain article address `https://<lang>.wikipedia.org/wiki/<title>`) and copy the supporting string from the raw text character for character. Keep quotes short and distinctive (a sentence fragment, a track row). Avoid quotes that span a link followed directly by a particle or punctuation in CJK text (the checker may split them).
- Good machine-readable sources: Wikipedia in any language; MusicBrainz web service (`https://musicbrainz.org/ws/2/release/<mbid>?inc=recordings+artist-credits+labels&fmt=json`; search `https://musicbrainz.org/ws/2/release/?query=...&fmt=json`); record the claim with the plain `https://musicbrainz.org/release/<mbid>` address. iTunes lookup/search API (`https://itunes.apple.com/lookup?id=...&entity=song&country=XX`). Library or archive catalogue records. Liner-note PDFs.
- **MusicBrainz is shared by six researchers at once.** At most one MusicBrainz request every 3 seconds from you; on 503 wait 15 seconds, at most 3 tries, then use another source. Never retry in a loop. Do not get around any site's bot check (Smithsonian Folkways refuses scripts: don't use it as evidence).
- Run the checker before finishing. Only `found` claims support anything: only songs with at least one `found` claim of kind `song` go into `playlist.json`; only `found` fits and nears into `def.json`; only `found` claims in `genre.json`/`parentage.json`/`presence.json` evidence lists. Everything else moves to `unverified.json` with its result. Rerun the checker after any change. A shorter true list is the right outcome.
- Titles in the standard spelling of their language with diacritics (original script where the language uses one: Japanese and Chinese titles in their script, with romanisation in alias). Where the page spells it differently, record that in `alias`.
- Never invent a song, artist, year or source. A null year is fine. Never write anyone's email address.
- Each song must be shown to exist and to belong to the genre (a page calling the performer a player of this genre, an album/track title naming the genre, or liner notes). Say in notes which ties are by title only.
- Peaks: no source usually states a peak; give a window as a judgement from dated facts and say so.

## Budget
Aim for a playlist of about 20–25 songs if the sources allow; stop at about 60 claims. Do not loop on failing sites.

## Finish
Your final message, under 200 words: genre id, proposed parent(s), status, song count, album count, the checker's totals (found / not found / no page), disagreements with our records, and the three biggest weaknesses.

## Also
- No git command that changes state (no commit, checkout, stash, push). Other researchers share the working tree.
- Never touch either database or any connector other than the web. Scratch files only in your own `parts/<genre id>/tmp/`, deleted before you finish.
