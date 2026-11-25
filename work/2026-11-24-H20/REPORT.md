# H20: Release years from Wikipedia, part 1

Date: 2026-11-24. Branch: `helper/2026-11-24-h20`. Run configured with model `claude-opus-5-5`, as given in the session's system prompt; I cannot see which model actually served each turn. Sub-agents: none. All look-ups were done by the scripts in `scripts/`, so no sub-agent model applies.

## What was asked
For the 1,200 songs in `work/2026-11-24-years/songs.1.json`, find the year of first release in the order of decision D18: the song's own Wikipedia article (infobox `released`), the artist's discography article or section, the album article. Raw text (`?action=raw`), English first, then the artist's own language. Copy the supporting string character for character, two sources at most per song, no MusicBrainz, nothing from memory. Hand back `years.json`, `sources.json`, `evidence-check.json`; only `found` in `years.json`.

## What is in this folder
- `years.json`: 656 records `{song, year, basis, url, quote, read}`, all with the check result `found`. Optional fields: `years_in_quote` (16 records whose quoted line names more than one year; `year` is the earliest), `note` (24 records, see "Look at these first").
- `unverified.json`: 544 records: 539 with no source found, 4 whose quote the check did not find, 1 whose source contradicts itself.
- `sources.json`: 661 claims under the key `"H20"`, in the shape `tools/check_evidence.py` reads.
- `evidence-check.json`: the check's output: 657 found, 2 near, 2 not found.
- `candidates.json`: every song with what the look-up found (page, line, languages tried). `quoted.json`: the same after the raw-text step. Kept so the lead can trace any record.
- `scripts/`: `find.py` (finds pages), `quote.py` (fetches the raw text and copies the line), `assemble.py` (splits by check result). Page caches are not included; running the three again rebuilds them.

## How it was done
1. **Finding pages** (`find.py`): the Wikipedia API was used only to find pages, in batches of 50 titles with redirects followed. Titles tried: `<title> (<artist> song)`, `<title> (<first artist> song)`, `<title> (song)`, `<title>`, with the bracketed tail of a title removed as a second variant and two capitalisations. A page is accepted only if a song or album infobox on it names the song's artist (any of the artists in a joint credit) in its `artist` field and has a year in its `released` field. If the page is an album article (usually a song title that redirects to its album), the song must be in its track listing or be the title track.
2. **Discography:** for songs with no accepted article, `<artist> discography` and `<artist> singles discography` in English. The table row naming the song in quotes is found, and the year cell that covers it (rowspans followed). The quote is the raw text from the year cell to the title, at most 1,500 characters.
3. **Own language:** for songs still without a year, steps 1's look-up on the Wikipedia of each language of the countries whose lists hold the song (`data/links/c/`) or whose genre originates there (`data/links/g/` and `data/genres.json` origin). Field names and title suffixes for es, pt, fr, it, de, nl, sv, no, da, fi, tr, ru, pl and ja were added (for example `publicación`, `lançado`, `sorti`, `Veröffentlichung`, `yayın_tarihi`, `(canción de X)`, `(Lied)`).
4. **Quoting** (`quote.py`): each chosen page was fetched as `https://<lang>.wikipedia.org/wiki/<Title>?action=raw` and the infobox line was copied from that raw text. It is cut before the first `<ref`, `{{efn`, `<!--`, `<br` or `<small` when the part before already holds a year, so it stays a verbatim prefix. The year is then read again from the copied text alone (the earliest year in it). This moved one record: "Coffee Houser Sei Addata" from 1982 (a year that was only in a footnote) to 1983.
5. **Check:** `tools/check_evidence.py` on `sources.json`.

"Two sources at most": no song needed more than two pages read as evidence. The pages fetched only to find a candidate (API look-ups) are not counted as sources.

## What was found
- **How far:** all 1,200 songs were tried, down to the last one ("Poème électronique", Edgard Varèse).
- **Found:** 656 years. Per basis: song article 588, album article 45, discography 23. Per language: English 615, Spanish 11, Portuguese 7, Turkish 6, Indonesian 5, Dutch 3, German 3, French 3, Vietnamese 1, Polish 1, Japanese 1.
- **Against the site:** of the 599 found songs that have a year on the site, 549 have the same year, 40 differ by one year, 10 by more. 57 songs that have no year on the site now have one.
- **Not found:** 539 songs. 113 of them could only be tried in English (no other language could be assigned to them), the rest in English and one or more other languages.

Songs where the year found differs from `year_on_site` by more than one year:

| Artist | Title | Site | Found | Basis |
| :- | :- | :- | :- | :- |
| Panjabi MC | Mundian To Bach Ke | 1998 | 2002 | song article |
| Shania Twain | Man! I Feel Like a Woman! | 1997 | 1999 | song article |
| Los Ángeles Azules / Natalia Lafourcade | Nunca es suficiente | 2018 | 2015 | song article |
| Magic System | 1er Gaou | 1999 | 2002 | song article |
| Sơn Tùng M-TP | Em Của Ngày Hôm Qua | 2013 | 2018 | song article (vi) |
| Yonca Evcimik | Abone | 1993 | 1991 | album article (tr) |
| Vital Signs | Dil Dil Pakistan | 1987 | 1985 | song article |
| J. Cole | Love Yourz | 2014 | 2016 | song article |
| Uffie | Pop the Glock | 2006 | 2009 | song article |
| Ghulam Ali | Chupke Chupke Raat Din | 1982 | 1976 | song article |

## Look at these first
- **An infobox's `released` is often the single's date, not the first release.** In at least five of the ten rows above the later year is the single, issued after the song first came out on an album: Mundian To Bach Ke (album 1998), Man! I Feel Like a Woman! (album 1997), 1er Gaou, Love Yourz, Pop the Glock. The same is likely among the 40 one-year differences. The method follows D18 as written; whether "first release" should look for an album appearance before the single is a question for the lead (below).
- **Album articles do not show the album was the first appearance.** 13 of the 45 album-article records are a song that redirects to an album with another name. Two are probably later than the song: "Wolf Totem" → *The Gereg* 2019 (site 2018), "Number One" (Diamond Platnumz) → *A Boy from Tandale* 2018.
- **`note` on 24 records:** 19 reached an article titled differently from the song (for example "Ue o Muite Arukō" → "Sukiyaki (song)", "Million alykh roz" → "Dāvāja Māriņa", "Yellow Bird" → "Choucoune (song)", "Another Brick in the Wall, Pt. 2" → "Another Brick in the Wall"); 5 have a bracketed version in our title that the article does not name, so the year may be the original's: "Prayer in C (Robin Schulz remix)" 2014, "Macarena (Bayside Boys Remix)" 1995, "Right Here (Human Nature Remix)" 1992, and two that are harmless: "Earth Angel (Will You Be Mine)" 1954 (the same song under its short title) and a Japanese title with its romanisation in brackets.
- **Crazy (Patsy Cline)** is in `unverified.json` though the check found its quote: the English article's infobox for her recording says released 16 October 1954 and recorded 1961. The source contradicts itself; the song came out in 1961.
- **Discography quotes** run from the year cell to the title and can include other rows of the table (for example Ceca's "Beograd", fifth single under a 1995 rowspan). The year is the cell that covers the row; I read about 25 of them by eye and found one wrong before fixing the reader (a 2017 reissue row of "Yume no Naka e"; the 1973 row is now used).

## Sources
- English Wikipedia, raw article text, read 2026-11-24: 615 records.
- Spanish, Portuguese, Turkish, Indonesian, Dutch, German, French, Vietnamese, Polish and Japanese Wikipedia, raw article text, read 2026-11-24: 41 records.
- Each record's exact address is in `years.json` (`url`).

## What fell short
- **539 songs have no year.** Most are songs without an article in any language tried, or with an article whose infobox does not name the artist we credit (a composition article, or a cover) or whose `released` is empty. They are in `unverified.json` with the languages tried.
- **Wikipedia's search was not used.** The plan was a search step for songs whose article has an unexpected title. Wikipedia's API answered "429 Too Many Requests" to search after about 60 queries, twice, with a pause between. I stopped asking. Exact-title look-ups were finished before the limit was hit. A search pass from another address, slowly, would probably add a good number of songs, especially non-English ones.
- **The discography step was English only**, and only for articles named `<artist> discography`; discography sections inside the artist's own article were not read. The album step was reached only through redirects and album infoboxes, not by reading which album a song is on.
- **Four quotes are copied correctly but not found by the check**, because markup sits inside the copied span and the checker does not treat it as a space: My Boy Lollipop 1964 (a reference between the month and the year), Kurenai 1989 (`<br/>`), Sungba 2022 (a comment and `{{small|…}}`), Rock Island Line 1955 (`{{Efn|…}}`). They are in `unverified.json`.
- **Reading by eye:** 35 random records, every record differing from the site by more than a year, every album record and every discography record. The rest is pattern-based.

## Questions for the lead
1. Should "first release" mean the first appearance on any record? If so, a song article's `released` should be checked against the album in its `album` field, and the album's date used when earlier. This would change at least five records here.
2. For a song that redirects to an album with another name (13 records), is the album's date acceptable as "from the album" without showing it was the song's first appearance?
3. Are the 5 records with a bracketed version (remixes) to be dated by the original or left undated?
