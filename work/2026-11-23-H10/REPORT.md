# H10: Evidence for data already on the site: pilot on two scopes

Date 2026-11-23. Branch `helper/2026-11-23-h10`. Run configured as `claude-opus-5-5` (the serving model can differ; this is the identifier the run was given). No sub-agents were started: every page was fetched and read from the shell by the run itself.

## What was asked

Measure how good the songs already on the site are, on two scopes, with quotes copied from raw page text: (1) Japan 1980–1989 year lists, `data/links/c/JP/1980.json`: for every link, find on its cited page the row naming that song for that year, and do not look for another source; (2) the genre `swing`, `data/links/g/swing.json`, roles intro, peak and reference: find one script-readable page per song showing the recording exists, who made it and when, three searches at most per song. Run `tools/check_evidence.py` and hand back its output.

## What is in this folder

- `sources.json`: 159 claims (136 Japan, 23 swing) in the shape of `work/2026-11-23-H4/sources.json`, plus `song` (song id) and, for swing, `role`.
- `evidence-check.json`: the check script's output: **159 of 159 `found`**.
- `jp-outcomes.json`: all 158 Japan links, one entry each: site rank, title, artist, year, evidence id, outcome, page rank, quote, note.
- `swing-outcomes.json`: the 23 swing links (intro, peak, reference): outcome, claims, note.
- `duplicate-songs.json`: the 12 decade-list songs that duplicate a year-list song under another id (both ids, titles, artists).
- `scripts/`: the scripts that parsed the pages and built the files (`jp.py` table parser, `match.py` title matching, `build.py` Japan claims, `swing.py` swing claims, `sent.py` sentence finder). They read pages from this run's scratch folder, so they are a record of method, not runnable as they stand.

## What was found

### Japan, 1980–1989 (158 links)

All 138 links that cite evidence point to the Japanese Wikipedia page for that year (`https://ja.wikipedia.org/wiki/<year>年の音楽`). Each page has an Oricon annual singles TOP50 table (シングル (日本) / 年間TOP50). All ten pages fetched from the shell (HTTP 200).

| Outcome | Home | Foreign | Total |
| :- | -: | -: | -: |
| Found: row in the Oricon annual singles TOP50 for that year | 120 | 7 | 127 |
| Found on the page, but not as a chart row (see below) | 0 | 6 | 6 |
| Not found as a song: only the album of the same name | 0 | 1 | 1 |
| Not found on the cited page | 0 | 4 | 4 |
| No source cited (the 20 links with scope `c:JP:1980s`) | 15 | 5 | 20 |
| **Links checked** | 135 | 23 | **158** |

- **All 120 home songs with a source are on the chart they cite.** Highest chart position used is 47位.
- The 6 found off the chart: "I'm in the Mood for Dancing" (1980) appears only as ノーランズ 「ダンシング・シスター」, 27位, its Japanese release title, and the page does not say the two are the same. "Footloose" (1984) is named only among the special prizes of the 13th FNS Kayousai. "Karma Chameleon" (1984) is named only as the UK BPI Awards best single, under its Japanese title. "Papa Don't Preach" (1986), "Bad" (1987) and "Like a Prayer" (1989) are listed only in the 洋楽シングル table, which lists foreign singles of the year with no rank and nothing about Japan.
- Album only: "Thriller" (1984): the page has 『スリラー』 at 1位 of the annual *album* chart, and no single.
- Not on the cited page: "Greatest Love of All" and "Part-Time Lover" (1986), "Danger Zone" and "I Wanna Dance with Somebody (Who Loves Me)" (1987).
- The 20 decade links (`c:JP:1980s`) have no evidence id, so there was nothing to check. Following the assignment, I did not look for sources for them.
  - **They point to separate song records.** 12 of the 15 home decade songs share a Japanese title and artist with a year-list song that was found on its chart, but under a different song id: the decade record has a macron romanisation, e.g. `s_j59e7nsvt9` "青い珊瑚礁 (Aoi Sangoshō)" against `s_xz1bv6qn0x` "青い珊瑚礁 (Aoi Sangosho)". So the same recording is stored twice.
  - The other 3 home songs (ギンギラギンにさりげなく, 君は天然色, クリスマス・イブ) and the 5 foreign ones (Billie Jean, Girls Just Want to Have Fun, Last Christmas, You Spin Me Round, Like a Virgin) are on no year list.
- **The site's `rank` is not the chart position.** It matches the page's 順位 in 62 of 127 cases. Elsewhere it is the order within the site's selection: for 1980 the site skips 長渕剛 「順子/涙のセレナーデ」 (5位), so 贈る言葉 is site rank 5 and chart 6位. Each link's page rank is in `jp-outcomes.json`.

Where the site differs from the page (home songs; title and artist forms compared after removing the site's romanised part in brackets):

| Scope | Site rank | Page rank | Site title | Page title | Site artist | Page artist |
| :- | -: | -: | :- | :- | :- | :- |
| c:JP:1980 | 2 | 2 | 異邦人 | 異邦人 -シルクロードのテーマ- | 久保田早紀 | same |
| c:JP:1980 | 9 | 10 | 哀愁でいと | 哀愁でいと (NEW YORK CITY NIGHTS) | 田原俊彦 | same |
| c:JP:1980 | 10 | 12 | 昴 | 昴 -すばる- | 谷村新司 | same |
| c:JP:1983 | 4 | 4 | 探偵物語 | 探偵物語/すこしだけやさしく (double A-side) | 薬師丸ひろ子 | same |
| c:JP:1983 | 7 | 7 | SWEET MEMORIES | ガラスの林檎/SWEET MEMORIES (double A-side) | 松田聖子 | same |
| c:JP:1984 | 7 | 11 | 星空のディスタンス | same | THE ALFEE | ALFEE |
| c:JP:1984 | 8 | 12 | 雨音はショパンの調べ | same | 小林麻美 | 小林麻美 with C-POINT |
| c:JP:1987 | 10 | 20 | MARIONETTE -マリオネット- | MARIONETTE | BOØWY | same |
| c:JP:1989 | 1 | 1 | Diamonds <ダイアモンド> | Diamonds | プリンセス プリンセス | same |
| c:JP:1989 | 7 | 7 | 淋しい熱帯魚 | 淋しい熱帯魚 〜Heart On Wave〜 | Wink | same |

Foreign chart rows give the title and artist in katakana (e.g. リマール for Limahl, ローズマリー・バトラー for Rosemary Butler). One spelling differs: the site's "The NeverEnding Story" is 「THE NEVER ENDING STORY」 on the page. 1983 氷雨: the chart also lists 日野美歌 「氷雨」 at 15位, a different recording of the same song. The site's song is the 佳山明生 recording at 5位.

**Years.** The pages give only the chart year. Its counting period runs from early December of the previous year to late November, as stated on the page. No page gives a release year, so no release year can be checked against them. For 39 of the 120 home links the site's `released` year is not the chart year, almost always the year before (e.g. 異邦人, released 1979 on the site, 2位 in 1980). That is consistent with the chart period and long-running hits. It is not a contradiction, and it is not confirmed either.

### Swing (23 links: 4 intro, 15 peak, 4 reference)

| Outcome | Count |
| :- | -: |
| Source found, check `found` | 22 |
| No readable source within three searches | 1 ("Let's Dance", Benny Goodman, 1935) |

Sources are the English Wikipedia articles for the songs, fetched raw. "For Dancers Only" comes from a library catalogue record (Fitt Jazz Collection, MacEwan University), because the Wikipedia page of that name is a 1983 Junior Mance album. The four reference links are the same recordings as peak links (Sing, Sing, Sing; One O'Clock Jump; In the Mood; Take the 'A' Train), with the same sources.

Every recording year on the site agrees with its source. Differences:
- "Sugar Foot Stomp": the page spells it "Sugarfoot Stomp" and says it is the Henderson orchestra's 1925 recording of "Dippermouth Blues". The page also mentions a 1931 remake, so the site's 1925 date picks the first one.
- "Sing, Sing, Sing" and "It Don't Mean a Thing": the site uses short titles. The full titles are "Sing, Sing, Sing (With a Swing)" and "It Don't Mean a Thing (If It Ain't Got That Swing)".
- "Tuxedo Junction": the page calls the Glenn Miller version the No. 1 hit (1940). The site's credit, Erskine Hawkins 1939, is the version the page says introduced the song.
- "Let's Dance": the Wikipedia article says the theme took its name from the 1934–1935 radio programme and gives no recording date. MusicBrainz lists only reissues, the earliest released in 1958. The 1935 date on the site is unconfirmed.

## Sources

- Japanese Wikipedia, 1980年の音楽 to 1989年の音楽: `https://ja.wikipedia.org/wiki/1980年の音楽` … `https://ja.wikipedia.org/wiki/1989年の音楽` (all ten read 2026-11-23)
- Wikipedia: Dippermouth Blues: https://en.wikipedia.org/wiki/Dippermouth_Blues
- Wikipedia: Moten Swing: https://en.wikipedia.org/wiki/Moten_Swing
- Wikipedia: It Don't Mean a Thing (If It Ain't Got That Swing): https://en.wikipedia.org/wiki/It_Don%27t_Mean_a_Thing_(If_It_Ain%27t_Got_That_Swing)
- Wikipedia: King Porter Stomp: https://en.wikipedia.org/wiki/King_Porter_Stomp
- Wikipedia: Sing, Sing, Sing (With a Swing): https://en.wikipedia.org/wiki/Sing,_Sing,_Sing_(With_a_Swing)
- Wikipedia: One O'Clock Jump: https://en.wikipedia.org/wiki/One_O%27Clock_Jump
- Fitt Jazz Collection, For dancers only (1936-1937), MCA 1307: https://fittcollection.macewan.ca/node/46554
- Wikipedia: Song of India (song): https://en.wikipedia.org/wiki/Song_of_India_(song)
- Wikipedia: Begin the Beguine: https://en.wikipedia.org/wiki/Begin_the_Beguine
- Wikipedia: A-Tisket, A-Tasket: https://en.wikipedia.org/wiki/A-Tisket,_A-Tasket
- Wikipedia: Jumpin' at the Woodside: https://en.wikipedia.org/wiki/Jumpin%27_at_the_Woodside
- Wikipedia: Moonlight Serenade: https://en.wikipedia.org/wiki/Moonlight_Serenade
- Wikipedia: In the Mood: https://en.wikipedia.org/wiki/In_the_Mood
- Wikipedia: Body and Soul (1930 song): https://en.wikipedia.org/wiki/Body_and_Soul_(1930_song)
- Wikipedia: Tuxedo Junction: https://en.wikipedia.org/wiki/Tuxedo_Junction
- Wikipedia: Boogie Woogie Bugle Boy: https://en.wikipedia.org/wiki/Boogie_Woogie_Bugle_Boy
- Wikipedia: Take the "A" Train: https://en.wikipedia.org/wiki/Take_the_%22A%22_Train
- Wikipedia: Chattanooga Choo Choo: https://en.wikipedia.org/wiki/Chattanooga_Choo_Choo
- Consulted, nothing usable: Wikipedia: Let's Dance (Benny Goodman song), https://en.wikipedia.org/wiki/Let%27s_Dance_(Benny_Goodman_song); Wikipedia: Benny Goodman; Wikipedia: Jimmie Lunceford; MusicBrainz recording search (`ws/2/recording`, query "Let's Dance" by Benny Goodman).

## What fell short

- **"Let's Dance" (swing, intro):** no script-readable source for a 1935 Goodman recording within three searches. It is the only swing link without a claim.
- **The UCSB Discography of American Historical Recordings** (adp.library.ucsb.edu), the natural source for 78 rpm session dates, answered the shell with a CloudFront "Request blocked" (403). It was not used, and I did not try to get around the block.
- **The Wikipedia search API** returned 429 (too many requests) on the first call. Web search was used to find pages instead.
- **Quote trimming forced by the check script, not by the pages.** Three quotes are shorter than the sentence they come from:
  - "King Porter Stomp": an apostrophe straight after a link ("Henderson's") is split by the script.
  - "Begin the Beguine": the sentence has a citation mark inside it.
  - 1989 "Like a Prayer": a citation mark sits between the two titles in the cell.
- **The 20 decade links** were not researched (no source cited; the assignment says not to look for another).
- **Chart rows prove a song charted in Japan in that year.** They do not prove the release year the site stores.

## Questions for the lead

1. The 洋楽シングル tables (foreign singles of the year, unranked, nothing about Japan): do they count as evidence that a foreign song belongs on a Japan year list? Three links rest on them. So does "Footloose" (named only in a Japanese TV award), and so does "Karma Chameleon" (named only in a UK award).
2. Should "I'm in the Mood for Dancing" (1980) be stored under its Japanese release title 「ダンシング・シスター」 as an alias? The chart names it that way, and a second source would be needed to tie the two titles.
3. "Thriller" (1984, no release year on the site) is on the 1984 page only as an album. Should the link be to the album, or be dropped?
4. The site's `rank` is the order within the selection and matches the Oricon position in only 62 of 127 cases. Should the data keep the page's position (e.g. `chart_pos`) alongside it, or replace it?
5. The 12 decade-list songs that duplicate year-list songs under other ids: should they be merged at the master-table step? The pairs are in `duplicate-songs.json`.
6. Ten home songs carry shortened or altered titles and two carry altered artist credits (table above). Which form is canonical: the page's full title, with the short form as an alias?
