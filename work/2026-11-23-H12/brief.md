# Brief for one H12 research sub-agent (one genre each)

You research ONE genre for the World Music Time Machine (repository at /home/claude/time-machine, branch `helper/2026-11-23-h12`). Today is 2026-11-23. You are a researcher: you hand back candidate files, you change nothing else.

## Read first (all on disk)
- `work/README.md`, especially "Evidence: how a researcher records a source". This is the rule you work under.
- The model hand-back: `work/2026-11-23-H8/` — `defs.add.json`, `playlists.add.json`, `sizes.json`, `sources.json`, `unverified.json`, `notes/maloya.md` and `REPORT.md`. Copy their shapes exactly (one genre's entry each).
- Your genre's record in `data/genres.json` (given in your task) and its lines in `data/parentage.json`. The list of valid genre ids is the `id` of every line in `data/genres.json`.

## What to produce
Write ONLY inside `work/2026-11-23-H12/parts/<genre id>/`:
1. `size.json`: `{"<id>": {"low", "high", "core", "basis", "confidence"}}`. Do this FIRST, before collecting: about how many recordings exist that fit this genre (a range), the basis (discographies, archive catalogues, label lists), and how many an insider would call essential (`core`). A judgement, not a count; say so.
2. `def.json`: one entry `{"<id>": {"window", "sound", "markers" (3 or more), "fits", "near"}}`, the shape of H8's `defs.add.json`. `fits` = [artist, title, year] reference recordings; `near` = [artist, title, year, genre id it belongs to, why not this genre]. The near genre id must exist in `data/genres.json`. If the natural neighbour has no id, name it in your notes and do NOT stretch another id.
3. `playlist.json`: one entry in the shape of H8's `playlists.add.json`: `status` (`full` for 20–25+ songs, `thin` under ~15, `none` if under four verifiable recordings), `intro` (about 4), `peak`, `albums`, `fold` (null), `note`, `yrs` (one [release year or null, year written or null] pair per song, intro songs first then peak, same order).
4. `sources.json`: `{"<id>": [claims...]}`, each claim `{kind: def|size|fit|near|song|album, artist, title, url, quote, read: "2026-11-23", note?}`, shape of H8's `sources.json`.
5. `unverified.json`: `{"<id>": {"alias": {used title → page spelling}, "unverified": [strings]}}`.
6. `evidence-check.json`: the output of `python3 tools/check_evidence.py work/2026-11-23-H12/parts/<id>/sources.json --out work/2026-11-23-H12/parts/<id>/evidence-check.json`.
7. `notes.md`: sections `## (a) Confidence` (one paragraph: how sure and why, the weak ties), `## (b) Sources` (title and address of every page used), `## (c) Neighbours with no id in the tree`, `## (d) What fell short`.

## Evidence rules (the owner's rule: no made-up data)
- Use web search and any page-reading tool only to FIND pages. Never take a quote from them: they reword.
- For every claim, fetch the page yourself in the shell (`curl -sL -A "time-machine-research/1" <address>`; `pdftotext` for PDFs) and copy the supporting string from the raw text character for character. Keep quotes short and distinctive (a sentence, a track row).
- Good machine-readable sources: Wikipedia in any language; the MusicBrainz web service (`https://musicbrainz.org/ws/2/release/<mbid>?inc=recordings+artist-credits+labels&fmt=json`, search `https://musicbrainz.org/ws/2/release/?query=...&fmt=json`); record the claim with the plain `https://musicbrainz.org/release/<mbid>` address (the checker reads the JSON behind it). The iTunes lookup/search API (`https://itunes.apple.com/lookup?id=...&entity=song`, `https://itunes.apple.com/search?term=...&country=XX&entity=album`). Library catalogue records. Liner-note PDFs with a text layer.
- **MusicBrainz is shared by eight researchers running at once.** At most one MusicBrainz request every 3 seconds from you; on 503 wait 15 seconds, try at most 3 times, then use another source or note it. Never retry in a loop. Do not try to get around any site's bot check.
- Before you finish, run the checker. Only songs with at least one claim of kind `song` whose result is `found` may go into `playlist.json`; only `found` fits and nears into `def.json`. Everything else moves to `unverified.json` with its result. A shorter true list is the right outcome. Rerun the checker after any change so `evidence-check.json` matches your final `sources.json`.
- Titles in the standard spelling of their language with diacritics (original script where the language uses one, as H8 did for Arabic and Marathi); where the page spells it differently, record that in `alias`.
- Never invent a song, artist, year or source. A null year is fine. Never write anyone's email address.
- Each song needs to be shown to exist and to belong to the genre (a page calling the performer a player of this genre, or the album/track title naming the genre, or liner notes). Say in notes which ties are by title only.

## Finish
Your final message: the genre id, status, song count, album count, the checker's totals (found / near / not found / no page), and the three biggest weaknesses, in under 150 words.
