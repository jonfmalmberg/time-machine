# H21: Release years from Wikipedia, part 2

Date: 2026-11-24. Branch: `helper/2026-11-24-h21`. Run configured with model `claude-opus-5-5`, as given in the session's system prompt; I cannot see which model actually served each turn. Sub-agents: none. All lookups were done by scripts (in `scripts/`), so no sub-agent model applies.

**Which assignment:** H20 was the first open one. I claimed it with an empty commit, but the push was refused: another run had pushed `helper/2026-11-24-h20` moments earlier. Following `work/README.md` step 2, I took the next open one, H21, and its claim push succeeded.

## What was asked
For the 1,200 songs in `work/2026-11-24-years/songs.2.json`, find the year of first release (decision D18): the song's own Wikipedia article, then the artist's discography, then the album it first appeared on. Use raw text, English first and then the artist's own language. Copy the supporting string character for character. Use at most two sources per song. Hand back `years.json`, `sources.json` and `evidence-check.json`.

## What is in this folder
- `years.json`: 493 songs `{song, year, basis, url, quote, read}`, plus `title`, `artist`, `year_on_site`, `lang`, `page`, the infobox `field` read, and `quote_track` for album-article results. Every quote was found by the check.
- `sources.json`: 511 claims under the key `"H21"`: one year claim per song, plus a second claim for each album result (the line naming the song in the album article).
- `evidence-check.json`: the check's output. All 511 were found.
- `unverified.json`: 707 songs. 704 have no source that answered, and each lists the pages tried. 3 were found by the check but set aside after I read them (below).
- `differences.md`: the 10 songs where the year found differs from `year_on_site` by more than one year.
- `summary.json`: the counts.
- `results.raw.json`: the script's record for all 1,200 songs, including the pages tried. Keep it for a redo.
- `scripts/`: `wiki.py` (fetching, cached in `.cache/h21`), `years.py` (the lookup) and `finish.py` (writes the files, including the three set-asides). The page cache is not included. Running `years.py` again rebuilds it.

## How it was done
- **Languages:** English, then up to two Wikipedia languages taken from the countries the song is listed under in `data/links/c/` and from its genre's origin country in `data/genres.json` (`langs` in `data/countries.json`).
- **Song article:** the script tried these titles: "T (Artist song)", "T (song)", "T (single)" and "T" in English, and "T (Artist)", "T (chanson / canción / Lied / lagu …)" and "T" in other languages. The page's title, minus any bracket, must equal the song title. The script then needs an infobox that has an artist field matching our credit. Within that infobox it reads the first release-date field (`released`, `sorti`, `lançado`, `Veröffentlichung`, `publicación` and so on). Generic `date` or `published` fields come last. If the field holds more than one year, the earliest is used. The quote is the `key = value` text, cut just after the year.
- **Discography:** "Artist discography" (and the local equivalents, e.g. "Discografia de …", "Anexo:Discografía de …", "… diskografisi"), else the artist's own article. A table row counts only if the song title is the row's first cell and is not in italics, since italics mark an album. The row also needs a year cell, either in the row or carried down by `rowspan`. If several rows match, the earliest year is taken. The quote runs from the year cell to the title cell, so with `rowspan` it can include other rows.
- **Album article:** used only when a song title redirects to an album or EP article whose text names the song. An album with the same title as the song is not used, because it can be a later compilation named after the song (Idir's "A Vava Inouva" led to a 1991 album).
- **"Two sources at most":** I read this as at most two sources recorded per song. A song gets one year source, and an album result also gets the line naming the song. More pages than that were sometimes opened to find the article, and each one is listed in `results.raw.json`.
- Every quote was first checked against the page with `tools/check_evidence.py`'s own normalising. Then the check script was run on `sources.json`.

## What was found
- **How far:** all 1,200 songs, down to the last one (`Mandela`, Abdullah Ibrahim).
- **Found:** 493 (41%). By basis: song article 421, discography 57, album article 15.
- **Article language:** English 424, Spanish 14, Indonesian 13, Portuguese 8, French 5, German 5, Polish 4, Finnish 4, Turkish 4, Vietnamese 3, Italian 3, Norwegian 2, Danish 2, Russian 1, Japanese 1.
- **Agreement with the site:** 470 within one year of `year_on_site`, and 13 where the site has no year. 10 differ by more than one year (`differences.md`):

| Song | Artist | Site | Found | Note |
| :- | :- | -: | -: | :- |
| Watermelon Man | Herbie Hancock | 1973 | 1962 | the 1962 original. The site's year is the 1973 Head Hunters re-recording, so which recording our song is needs deciding |
| Boplicity | Miles Davis | 1949 | 1957 | infobox "released = February 1957", the *Birth of the Cool* LP |
| Dmuchawce, latawce, wiatr | Urszula | 1988 | 1983 | Polish article |
| Douce France | Charles Trenet | 1947 | 1943 | French article |
| Sen Trope | Azis | 2014 | 2011 | |
| Águas de Março | Elis Regina / Tom Jobim | 1974 | 1972 | Portuguese article on the song. It may be giving the first release of the song, not the Elis & Tom recording |
| Cosmo | Soprano | 2016 | 2014 | |
| Senden Daha Güzel | Duman | 2005 | 2009 | Turkish infobox "Yayımlanma = 2009-03-18". Possibly a later single release from an earlier album |
| Serana | For Revenge | 2025 | 2020 | discography row |
| A Vava Inouva | Idir | 1976 | 2016 | discography row "2016". Probably a later release, not the first |

**Set aside after reading** (found by the check, now in `unverified.json`): Maria Tănase "Ciuleandra" (the row is a 2001 compilation album), Katchafire "Collie Herb Man" (the row is the 2025 "Revival 2.0" re-recording), Gerard Cox "'t Is weer voorbij die mooie zomer" (the row links to the 1988 album).

## Sources
- English Wikipedia, raw article text (`https://en.wikipedia.org/wiki/<Title>?action=raw`), read 2026-11-24: 424 songs.
- Wikipedia in 14 other languages, raw text the same way, read 2026-11-24: 69 songs.
- Each song's address is in `years.json` and `sources.json`.

## What fell short
- **707 of 1,200 have no year.** The list is ordered most-used first, and its second half is mostly non-English songs with one list each. 557 of the 704 not found have a second language, and the article is often there under a spelling the title guesses do not reach (romanised Chinese, Russian or Arabic titles, for example "Ye Lai Xiang", "Tretye sentyabrya", "Bint El Sultan").
- **No Wikipedia search.** Wikipedia's API answered 429 (too many requests) to this address for search, prefix search and, later, ordinary title queries. Pages were found by guessing exact titles and reading redirects from the raw-text address. A redo with search working would find more, mainly in other languages.
- **No title variants or transliterations, and no artist article in other scripts.** The artist match compares Latin text, so a Japanese, Korean, Chinese or Arabic infobox naming the artist in its own script does not match.
- **Album results rest on the album's release.** If the song came out as a single before the album, the year is late. Yuve Yuve Yu is 2019 from the album, against 2018 on the site, and Jiwa Yang Bersedih is 2024 against 2023.
- **Two years come from a `published` field** (Over the Rainbow, Jingle Jangle Jingle). For old standards that field can mean the sheet music, not the recording. Both agree with the site here.
- **Discography quotes with `rowspan` are long.** They include the other rows the year covers, so a reader can see the year applies. The rowspan arithmetic is the script's.
- **I read every discography and album result (72), the 10 differences and a random 25 of the song-article results by eye.** The rest is pattern-based.

## Questions for the lead
1. Watermelon Man and Águas de Março: when the song article's infobox gives the first release of the composition and our song record is a later recording by the same artist, should the year be the composition's first release (D18 as written) or the recording's?
2. Should a song's year ever come from a release later than the album it first appeared on (Senden Daha Güzel, A Vava Inouva)? With raw text alone the script cannot tell a first release from a re-release when the page gives only one year.
