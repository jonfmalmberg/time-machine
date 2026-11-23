# Brief: year-by-year hit lists for one country and decade

We run a "music time machine": pick a country and a single year, get a playlist prompt seeded with the songs that were actually big there that year. A local who lived there then must recognise the first few songs as that year. Decade-level lists failed this test (a 2020 list full of 2012–2018 evergreens). You build the year-level list for one country and one decade.

## Task
For each of the 10 years in your decade, list the songs that were genuinely the biggest in that country in that year:
- up to 12 home-grown songs (artists from that country, including local-language covers of foreign songs);
- up to 6 foreign songs that were among that year's biggest there (on its own charts/radio, not merely famous elsewhere).

## Evidence
Every song needs a source that ties it to that country and that year: national year-end charts, lists of number-one singles, best-selling singles of the year, national radio chart archives, music-award song of the year, national film/TV hit lists. Wikipedia chart pages (in English or the local language) are good; fetch them with WebFetch. Use at most 30 WebSearch calls; prefer WebFetch on pages you already know or find.
- Do not pad from memory. Fewer is better than wrong. If a year has thin evidence, give what is sourced and say so in that year's `note`.
- A song released late one year that peaked the next goes in the peak year.
- Charts miss scenes: also cover what ordinary people heard outside the official chart (dance-band, regional, working-class, religious, film songs, children's/TV songs) where a source names it as a hit of that year. Tag each home song's scene in `kind`.
- No album or compilation titles; songs only.
- Artist and title as a streaming service lists them: original script, with a romanization in parentheses for non-Latin scripts, e.g. "松田聖子 (Seiko Matsuda)", "赤いスイートピー (Akai Sweet Pea)".

## Output
Write the file named in your prompt as:
{"<ISO2>": {"<year>": {"note": "", "songs": [[artist, title, release_year, "home"|"foreign", rank, "source name", "source url", kind]]}}}
- `rank`: 1 = strongest evidence that year, one sequence across home and foreign.
- `release_year`: integer, or null if not confirmed.
- `kind`: a short scene tag you choose consistently for this country (e.g. pop, schlager, dansband, rock, visa; kayokyoku, idol, enka, new music; juju, highlife, afrobeat, fuji; mpb, samba, sertanejo, jovem guarda, disco), or "foreign" scenes just "pop".

Validate with Python: the file loads, all 10 years present, each row has 8 fields, origins valid. Report per-year counts (home/foreign), the scenes covered, the years with thin evidence, and any song you could not confirm.
