# Where the data performs poorly, and what to do about it

24 Nov 2026, by the lead, at the owner's request. To be revised as data comes in. Rule: the easiest gain first; a wrong statement is never left standing. Popular lists claim nothing beyond "this was on that chart", so they may be used as they are to give the best experience; statements of fact (years, origins, genres, lecture prose) must be checked or marked.

## Counts on 24 Nov

| | |
| :- | :- |
| Countries in the data | 226 |
| With year-by-year lists | 41 (18%) |
| With decade lists only | 11 |
| With nothing | 174 |
| Songs on year lists | 21,748 |
| of which have a genre | 611 (3%) |
| Chart entries with the artist's origin recorded | 14,328 of 28,225 |
| Songs with a checked release year | 1,334 of 30,041 |

## Observations, worst first

1. **Coverage follows English Wikipedia, so it follows Europe and the Americas.** Of the 41 countries with year lists, 26 are European or English-speaking. China, India, Pakistan, Bangladesh, Ethiopia, the Philippines, Egypt, Vietnam, DR Congo, Iran, Thailand and Kenya have none. A visitor from most of the world finds a decade list or nothing. *Target:* year lists for the 30 most populous countries. *First step:* H23 surveys what a script can read per country (other-language Wikipedias, film-song lists, national archives).
2. **Chart songs have no genre (3%).** A genre filter cannot show that genre's hits, and the tree and the place lists are two separate bodies of data. *Target:* a genre on half of chart songs. *Plan:* section "Genres for chart songs" below.
3. **A number one is not a measure of size.** Most chart lists are number ones or top-ten entries in date order. A one-week number one sits beside a ten-week one, and anything that peaked at number two is absent. Year-end charts exist only for the United States and Japan in the 1980s. *Target:* weeks at number one and peak position read from the same pages (a script change, no research), then order by weeks.
4. **What a chart measured changes over time and is not recorded.** Sales, jukebox plays, airplay and streams are different publics. Streaming-era charts are dominated by a few global songs in every country. We store "weekly number ones" for all of them. *Target:* record what each chart measured per period (H23 asks for this for new sources; the pages already read need it added).
5. **"Made there" rests on one sentence of a Wikipedia article.** The artist's nationality in the first sentence, or where a group formed. Boney M. counts as German, an emigrant as whatever the article says. Only the first-named artist counts. Half of chart entries have no origin yet. *Target:* origins for the remaining batches (H18, H19); then a review of the 160 or so artists with two countries.
6. **Credits are stored as written.** "A featuring B" is one artist; 3,324 new credits are unsplit; the same song under two spellings is two songs. Counts of artists and songs are therefore too high, and an artist's songs are not all found together. *Target:* split credits with the links the helpers already read from the chart pages (H16 and H17 recorded the split per credit), then merge spelling variants by normalised title and lead artist.
7. **No release years for chart songs; the older years are often reissue years.** A chart year is an upper bound only. *Target:* H20 and H21 (Wikipedia song, discography and album articles), then the same for chart songs.
8. **The evidence check cannot see a malformed value.** It normalises punctuation, so a title with table debris passed. Three ingests were needed tonight. *Done 24 Nov:* a shape test in `tests/data.py` for song titles and artist names (unbalanced quotes, footnote and reference marks, stray spacing, a sentence where a name should be). The data passes it. *Still to do:* the same for evidence quotes and scope notes.
8a. **26 songs from genre research are credited to "Various Artists".** They are tracks or whole albums from compilations where the helper could not name the performer. They cannot be played from a search. *Target:* name the performer from the album's track list or move them to releases.
9. **Genre research is uneven by design of the source.** Genres documented in English with named recordings get full lists; oral and regional traditions get thin ones, tied to a few reissue albums (nurthi: 21 of 24 songs from one series). Significance scores, which now pick the course's stops, were set in the first week and never tested (issue 81). *Target:* roadmap 2.6, a method for significance that can be defended; until then the lecture, not the score, sets each chapter's syllabus.
10. **The lecture prose is unchecked.** Written by the lead from general knowledge and shown with that label. *Target:* H24 classes every factual sentence; wrong and too-strong sentences are corrected, the label comes off chapter by chapter.
11. **The listener test has been run on almost nothing new.** The founding test (a local feels nostalgia) has not been applied to any chart list. *Target:* the "is this what you remember?" question to real visitors (idea `local-check`), which costs less than synthetic tests and is the real thing.

## Source tables and the master table

The owner's rule: each source's table is kept as it was researched; the master table is made by combining them; where they conflict we re-research, reconcile or choose, and the choice is recorded.

- **Kept as researched:** `work/2026-11-24-wikicharts/chart.rows.json` and `chart.check.json` (every chart row and its check), the helpers' folders in `work/`, the older year lists in `data/links/c/`.
- **What the page shows today:** one list per country and year. Where an older researched list existed (2,574 chart rows, mostly the United States in the 2010s and 1940s, Japan in the 1980s and South Korea), the older list stands and the chart rows stay in the source table only. That was a choice of convenience, not of quality: the two were not compared.
- **Target:** a link records which source table it came from; a combine step builds the master list for a country-year from all its tables by a stated rule (year-end position first, then weeks at number one, then other sources), and reports conflicts. First use: compare the 2,574.

## Genres for chart songs: how they will be chosen and assigned

Changed on 24 Nov after the owner's review (decision D31). The first plan mapped Wikipedia's infobox genres to our tree. That is dropped as the method: Wikipedia's categories are not ours, they lump songs into "pop", "rock" and "folk", and they are not applied consistently.

1. **A synthetic expert places each song in our own genre set.** A model briefed as a music historian reads our genre definitions and answers, per song: does it know the recording, which one of our genres it belongs to by its sound, a second genre if it sits between two, how sure it is, and "none of these" with what is missing.
2. **Two independent runs.** A song is only a candidate when both runs agree.
3. **Measured before use.** The pilot (H25) hides 954 songs whose genre we researched among 500 chart songs. The lead scores exact genre, same tradition, and agreement between runs, split by how sure the expert said it was and by region and era, because the expert will be worse where we are thinnest.
4. **A rule for keeping an answer, set from those numbers** and recorded in D31. Answers that do not meet it stay unassigned.
5. **Stored apart and labelled** as a synthetic judgement, never as a sourced fact.
6. **"None of these" is data too:** the most frequent missing genres are candidates for the tree.
7. **Then the filter works both ways:** Popular within a genre shows that genre's chart hits (roadmap 5.3b).
