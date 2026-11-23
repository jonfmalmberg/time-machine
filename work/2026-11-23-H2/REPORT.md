# H2: Open music data sources (roadmap 2.2)

Date: 2026-11-23. Branch: `helper/2026-11-23-h2`. Model of the run: configured as `claude-opus-5-5` (the session says the serving model can differ through fallback; this run cannot tell beyond that). Sub-agents: four `web-fetch` agents, all given model `sonnet`, used only to read pages already found by search and return their text as quotes (mechanical extraction, per the model table in `work/README.md`). Judgement between sources and the writing were done by the run itself.

## What was asked

For MusicBrainz, Wikidata, Discogs, ListenBrainz, Cover Art Archive, AcousticBrainz and any national chart archive under an open licence: what it holds, bulk and per-item access with limits, exact licence and attribution wording, and the identifiers for song, artist and album. First-party pages, quoted, building on the feasibility check rather than repeating it.

## What is in this folder

- `REPORT.md`: this report.
- `sources.md`: one section per source in the same shape, then a comparison table and the reference list.

## What was found

- **The song key.** Only MusicBrainz (and services built on it: ListenBrainz, Cover Art Archive, AcousticBrainz) gives a recording a stable identifier. Discogs has none below the release. MusicBrainz also publishes a CC0 "canonical" dump mapping every release and recording to one canonical version, twice a month.
- **MusicBrainz licence split, now precise:** the CC0 core is `mbdump` (and cdstubs); tags, user ratings, annotations, and therefore genre assignments ("done via user tags"), are in `mbdump-derived`, CC BY-NC-SA 3.0. The Cover Art Archive index dump is also non-commercial.
- **Limits:** MusicBrainz and ListenBrainz 1 request per second with an identifying User-Agent; Discogs 60 per minute authenticated, 25 without, and search needs authentication; Cover Art Archive states no rate limit; Wikidata gives no number on the page read, only "back off on 429".
- **ListenBrainz** listening data is CC0 (closes an item left open by the feasibility check). The separate MLHD+ dataset is non-commercial.
- **Wikidata** asks, without requiring, that projects "mention Wikidata as the origin of your data".
- **AcousticBrainz** is ended; its own makers judged the data "isn’t of high enough quality to be useful for much at all". Final dumps (about 630 GB) were published in 2022; licence only from a staff comment.
- **No national chart archive under an open licence was found** in a short search.

## Sources

Fourteen first-party pages, listed with addresses in `sources.md` (References). All read 2026-11-23.

## What fell short

1. **Quotes are not raw-HTML checked.** Direct download from this run was refused by the network proxy (musicbrainz.org returned 403 at the proxy), so pages were read through the fetch tool, which returns converted text. Formatting was stripped; where a link sat inside a sentence, the quote was cut at the link. Character-level differences (curly quotes, spaces) are possible. The lead's checking script should run on every quote.
2. **Pages not read** (the fetch tool's permission request was not answered in an unattended run; not retried, as the rules say): `https://musicbrainz.org/doc/About/Data_License` (to confirm the licence split in its own words), `https://musicbrainz.org/doc/MusicBrainz_Identifier` (MBID format), `https://data.discogs.com/` (dump contents and format), `https://acousticbrainz.org/download` (whether dumps are still served). `https://www.mediawiki.org/wiki/Wikidata_Query_Service/User_Manual` returned not found, so no Wikidata query timeout or rate number is given. `https://listenbrainz.org/data/` returned only a title (page is drawn by script).
3. **Not read at all:** the Discogs API Terms of Use (what "restricted data" covers), the MusicBrainz commercial-use terms for the web service, ListenBrainz pages on MBID mapping and MSIDs, Wikidata's music properties (ids for MusicBrainz and Discogs on items; marked unverified in `sources.md`).
4. **Sizes** of MusicBrainz, Wikidata music items and Discogs were not found on the pages read.
5. **National charts:** two searches only, no country-by-country check of chart bodies or statistics offices.
6. ListenBrainz's own docs contradict themselves on incremental dump frequency (twice a week vs daily); MetaBrainz says daily. Recorded, not resolved.

## Questions for the lead

1. The genre and tag assignments in MusicBrainz are non-commercial. If the project might ever earn money, should genre membership be researched by us rather than copied from MusicBrainz tags?
2. Should the national chart question be a separate assignment, country by country, starting with the countries in `yearl.json`?
3. Should a later run re-read the four pages that need permission when someone can approve the fetches, or should the owner open them?
