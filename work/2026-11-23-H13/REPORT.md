# H13: Genre research, batch 6
Date 2026-11-23, branch `helper/2026-11-23-h13`. Run configured as `claude-opus-5-5` (fallbacks `claude-opus-5[1m]`, `claude-opus-4-8[1m]`; the serving model could differ and cannot be confirmed from inside the run). Sub-agents: eight research sub-agents, one per genre, all started with model `opus`, as the assignment names (as H12, which is as H7 and H3: Opus for the run and for research sub-agents). I (the run) wrote their brief (`brief.md`, H12's brief with the paths changed and two lines added), merged their files, checked the shape (three or more markers, one `yrs` pair per song, every near id present in `data/genres.json`, every playlist song backed by a `found` claim of kind `song`, no email addresses) and ran `tools/check_evidence.py` over the merged `sources.json` myself. I did not re-research their choices.

## What was asked
The next eight pending genres after H12: file order of `data/genres.json`, a genre being pending when its line has no `definition` and it is in no `work/*/defs.add.json` on `dev` or on a `helper/*` branch (the 40 of H3, H4, H7, H8 and H12 were skipped; H12's eight are on `helper/2026-11-23-h12`, not yet on `dev`). The eight: `gambangkromong` (Gambang kromong), `shokaandgunka` (Shōka and gunka), `nurthi` (Nurthi), `funana` (Funaná), `porro` (Porro), `changga` (Changga), `sudanesehaqiba` (Sudanese haqiba), `twoubadou` (Twoubadou). For each: a size estimate first, then a definition and a playlist in the shape of the H8 hand-back, following the evidence section of `work/README.md`; only songs whose claim the check script finds go into the add files.

## What is in this folder
- `defs.add.json`: eight new definition entries, one per line (window, sound, markers, fits, near).
- `playlists.add.json`: eight new playlist entries, one per line (status, intro, peak, albums, fold, note, yrs).
- `sizes.json`: genre id → low, high, core, basis, confidence.
- `sources.json`: genre id → list of claims (kind def/size/fit/near/song/album, artist, title, url, quote, read, optional note), in the shape `tools/check_evidence.py` reads.
- `unverified.json`: genre id → `alias` (title used → spelling on the page) and `unverified` (recalled or half-seen, not confirmed; fetch failures).
- `evidence-check.json`: this run's output of `tools/check_evidence.py` over the merged `sources.json`.
- `notes/<genre id>.md`: each sub-agent's full notes: (a) confidence, (b) every source address, (c) neighbours with no id, (d) what fell short.
- `brief.md`: the brief every sub-agent was given.
- `REPORT.md`: this file.

## What was found
| Genre | Status | Songs | Albums | Fits | Near | Size (low–high, core) | Claims | Null years |
| :- | :- | -: | -: | -: | :- | :- | -: | -: |
| `gambangkromong` | full | 29 | 10 | 4 | `gamelan` (2), `kroncong` | 600–3000, 30 | 70 | 9 |
| `shokaandgunka` | full | 26 | 7 | 4 | `kayokyoku`, `brass` | 3000–15000, 50 | 111 | 15 |
| `nurthi` | full | 24 | 16 | 4 | `sinhalafilmsong` (2) | 300–1500, 30 | 84 | 1 |
| `funana` | full | 24 | 10 | 4 | `morna`, `coladeira` | 4000–20000, 50 | 80 | 6 |
| `porro` | full | 26 | 7 | 4 | `cumbia`, `champeta` | 2000–10000, 50 | 62 | 13 |
| `changga` | **thin** | 13 | 6 | 4 | `trot`, `tongguitarandnorae` | 150–800, 15 | 64 | 0 |
| `sudanesehaqiba` | full | 22 | 7 | 5 | `sudanesepopularson` (2) | 600–4000, 30 | 85 | 20 |
| `twoubadou` | full | 25 | 12 | 5 | `son`, `kompa` | 800–4000, 35 | 70 | 9 |

**Evidence check** (run by me on the merged file): 626 claims, **626 found**, 0 near, 0 not found, 0 no page. Every playlist song has at least one `found` claim of kind `song` (directly or through its `alias`). Quotes come from raw page text: Wikipedia in English, Spanish, Portuguese, French, Indonesian, Japanese, Korean, Sinhala and Arabic; the Encyclopedia of Korean Culture; the iTunes lookup JSON; the MusicBrainz web service JSON; the BnF catalogue; Ostinato Records' Bandcamp page; Sri Lankan newspaper essays (Sunday Times, Daily FT) and thuppahis.com.

The checker proves only that each string is on its page. It does not prove the tie to the genre is sound or that the recording is streamable. Playability was not checked. All size estimates are low confidence: no source counts recordings for any of these genres.

### Confidence, per genre
**`gambangkromong`.** Fairly sure of the definition and songs, unsure of years and size. Definition from English and Indonesian Wikipedia (the English article rests on the Jakarta Encyclopedia alone). 24 of 29 songs are tied by an album, EP or orchestra name containing "gambang kromong" (the Folkways *Music of Indonesia, Vol. 3*, *100% Gambang Kromong*, DPM-MTR cassettes, Tukang Tabuh EPs); Pang Tjin Nio (Masnah), Benyamin S. and two orchestra leaders are tied by a page. Ida Royani only through her duet group and album title. Nothing is dated before 1990 although the genre peaked around 1937; Benyamin and Ida Royani tracks are from 2002–04 compilations with null years.

**`shokaandgunka`.** Medium-to-good confidence in definition and songs, low in size. All recordings from iTunes Japan; every song tied by its own Japanese Wikipedia page calling it 唱歌, 文部省唱歌 or 軍歌, except ふじの山 and 朧月夜 (named on the 文部省唱歌 page), 暁に祈る (lead says 戦時歌謡) and 愛国行進曲 (a patriotic anthem; also on a Columbia album titled 軍歌・愛国歌・戦時歌謡). The 小学唱歌集 page supports both parentage lines and the tree's 1881. Only six Columbia 78s of 1937–43 are period recordings; Meiji and Taishō songs are post-war choir or studio re-recordings. Some Japanese Wikipedia quotes contain a space where a link splits the sentence; each such claim says so in its note, and the checker found them all.

**`nurthi`.** Fairly sure of the definition, much less of the playlist's breadth. Definition from English and Sinhala Wikipedia and three newspaper essays drawing on Sarachchandra (Parsi-theatre origin, North Indian melodies, C. Don Bastian then John de Silva, decline with cinema). **21 of 24 songs come from one source**, the Tower Hall Theatre Foundation's 16-volume *Tower Hall Nurthi Gee* (℗ 2023), tied by album title only, with no singers or recording years; their year is the 2023 release. The other three are later renditions (Rukmani Devi's and Amaradeva's "Danno Budunge"; Wasantha Sandanayaka's "Lona Muni Rajage", title-only). No original-era recording.

**`funana`.** Medium-to-good confidence in definition and songs, low in size. Definition from English and Portuguese Wikipedia and Ostinato's Bandcamp text. Eight songs are in Portuguese Wikipedia's "Exemplos de funanás"; two by a performer page (Bulimundo, Codé di Dona); 14 by album or track title only (Bitori's *Legend of Funaná*, the *Pour Me a Grog* tracks, Dino d'Santiago's 2018 pop "Nôs Funaná"). Nothing recorded before 1978; Bulimundo's *Batuco* (1981) could not be read (MusicBrainz busy three times).

**`porro`.** Fairly sure of the definition and songs, unsure of years and size. Definition from Spanish and English Wikipedia. Most songs are tied by a title naming the genre (*Historia musical del porro pelayero*, *Porrovia… Los 40 Porros del Siglo*, tracks labelled "(Porro)"); Pedro Laza, Lucho Bermúdez, Pacho Galán, Edmundo Arias, La Sonora Cordobesa and the Banda 19 de Marzo de Laguneta by a page. Lucho Bermúdez's own Carmen de Bolívar, Salsipuedes and San Fernando are out (no page labels the recordings porro). The years used are iTunes track dates (1956–74) that look original; they were not checked as separate claims.

**`changga`.** Status `thin`. Fairly sure of the definition, much less of the playlist. Definition from the Encyclopedia of Korean Culture and Korean and English Wikipedia. All 13 tracks are later recordings (1977–2019), mostly trot-era singers on nostalgia anthologies and a 1988 independence-song album; no 1920s 78 was found on a readable page. Ties are by song, not singer; 소년행진가 by title only. Three songs (학도가, 희망가, 사의 찬미) make up 11 of 13 tracks; 사의 찬미 sits on the boundary with early popular song and trot. Four artists keep iTunes romanised names.

**`sudanesehaqiba`.** Medium confidence in definition and songs, low in years and size. Definition from English and Arabic Wikipedia. Karouma's 1920s Odéon 78 "مسوا نوركم" is confirmed in the BnF catalogue. About half the songs are tied only by an album title naming حقيبة الفن or الحقيبة; Karouma, Sarour, Badi Mohamed al-Tayeb and Mubarak Hassan Barakat by a performer page. 20 of 22 years are null: almost everything is a Nile Melodies Archive reissue with only a 2024 digital date. Both near-misses are by Ibrahim al-Kashif because madeeh, the natural neighbour, has no id.

**`twoubadou`.** Fairly sure of the definition and core performers, less of years and size. Definition from English Wikipedia (Twoubadou, Music of Haiti) and French Wikipedia. Every song rests on iTunes alone (MusicBrainz busy). Trio Select, Coupé Cloué, Ti Paris, Mizik Mizik and Haitiando are tied by a page; the Haiti Twoubadou hits by Wikipedia naming those songs; Lole-Lolay, Gifrants, New York Twoubadou and the other Haiti Twoubadou tracks by title only. Nothing earlier than 1971; no Kandjo recording found. "Map di" (Ensemble Sélect) is at the kompa edge.

## Sources
The full list of addresses is in section (b) of each `notes/<genre id>.md`; exact strings are in `sources.json`; each claim's result is in `evidence-check.json`. Main sources per genre:
- `gambangkromong`: <https://en.wikipedia.org/wiki/Gambang_kromong>, Indonesian Wikipedia (Gambang kromong, Masnah, Benyamin Sueb), iTunes lookup, MusicBrainz.
- `shokaandgunka`: <https://en.wikipedia.org/wiki/Gunka>, Japanese Wikipedia (軍歌, 唱歌 (教科), 小学唱歌集, 文部省唱歌 and song pages), iTunes Japan lookup.
- `nurthi`: English Wikipedia (Music of Sri Lanka, Theatre of Sri Lanka, John de Silva), Sinhala Wikipedia, Sunday Times (2016), Daily FT (2016, 2020), thuppahis.com, iTunes Sri Lanka lookup.
- `funana`: <https://en.wikipedia.org/wiki/Funan%C3%A1>, Portuguese Wikipedia Funaná, Ostinato Records Bandcamp (*Pour Me a Grog*), iTunes Portugal lookup, MusicBrainz.
- `porro`: Spanish Wikipedia Porro (música) and performer pages, <https://en.wikipedia.org/wiki/Porro>, iTunes lookup.
- `changga`: Encyclopedia of Korean Culture (창가, 신식 창가, 유행 창가, 계몽가요, 학도가, 독립군가), Korean Wikipedia (창가, 한국의 가곡), English Wikipedia (K-pop, Trot, Yun Sim-deok), iTunes US lookup.
- `sudanesehaqiba`: English Wikipedia (Music of Sudan, Khalil Farah, Abdel Karim Karouma, Ibrahim al Kashif), Arabic Wikipedia, BnF catalogue, iTunes lookup.
- `twoubadou`: <https://en.wikipedia.org/wiki/Twoubadou>, Music of Haiti, French Wikipedia (Trio Select, Coupé Cloué, Ti Paris), iTunes lookup.

## What fell short
- **Genre ties by title.** Gambang kromong (24 of 29), funaná (14 of 24), nurthi (21 of 24, one series), porro (most), haqiba (about half) and twoubadou (four performers) rest largely on an album, group or track title naming the genre. No liner notes were read; Smithsonian Folkways refuses scripts.
- **No period recordings.** Nothing before 1990 for gambang kromong; before 1937 for shōka and gunka; from the 1880s–1920s stage for nurthi; before 1978 for funaná; before 1977 for changga; before 1971 for twoubadou. Haqiba has one 1920s 78 (Karouma).
- **Years.** 73 of 189 songs have a null release year (haqiba 20, shōka/gunka 15, porro 13, gambang kromong 9, twoubadou 9, funaná 6, nurthi 1). Many non-null years are reissue, compilation or digital-release years (all 21 Tower Hall nurthi tracks are 2023). Details in each `notes/<id>.md`.
- **Missing canon.** Bulimundo's *Batuco* tracks (funaná); Lucho Bermúdez's own porros and Pachito E'ché, Se va el caimán; Kandjo and Toto Nécessité (twoubadou); 蛍の光, 春が来た, 紅葉 (shōka; Wikipedia search API rate-limited); Pang Tjin Nio's 1980s cassettes; Al-Amin Burhan and Khalil Farah's own recordings (haqiba); the first changga recordings (Yun Sim-deok 1926, Chae Gyu-yeop).
- **Unreachable or busy.** MusicBrainz answered "busy" for most researchers (eight at once; not retried in a loop); Wikipedia's API rate-limited several; Gallica (Cloudflare) and a Sunday Observer page refused scripts; the iTunes Korea storefront returned nothing (US storefront used); El Universal's list of the 100 best porros was not read.
- **Start dates.** Nurthi: one source gives 1879 (Bastian's *Rolina*), the tree has 1886. Twoubadou: pages say only "early 20th century" for the tree's 1920. Changga: the Encyclopedia gives both 1876 and 1896.
- **Playability.** Not checked for any genre.

## Questions for the lead
1. **Nurthi rests on one series.** 21 of 24 songs are the Tower Hall *Nurthi Gee* volumes with no singers or dates. Is `full` acceptable when one rights-holder's reissue is nearly the whole list, or should it be `thin` until other recordings are found?
2. **Changga is `thin`** and is mostly modern re-recordings of three songs. The lead may prefer status `none` with albums until period 78s are found (the Korean Sound Archive was named as a possible source, not tried).
3. **Shōka and gunka edges.** 暁に祈る and 愛国行進曲 are kept with soft gunka ties (see `unverified.json` and notes). The sentimental wartime songs went to the `kayokyoku` near-miss. The lead may want to check the line at the master-table step.
4. **Gambang kromong near entries** use `gamelan` twice and `kroncong` once, matching the parentage lines; tanjidor, its closest neighbour, has no id.
5. **Twoubadou near-miss under `son`.** Wikipedia names Cuban guajira / música campesina as the source; it has no id, and `son` was used because the parentage file already makes it the parent. If the lead thinks that stretches `son`, drop the entry.
6. These neighbours have no id. They were named and not stretched (details in each `notes/<id>.md`, section (c)):
   - Gambang kromong: tanjidor, lenong and cokek (theatre and dance it accompanies).
   - Shōka and gunka: dōyō (童謡), wartime popular song (戦時歌謡), dormitory songs (寮歌), Self-Defense Force unit songs.
   - Nurthi: nadagam, kolam and sokari, Parsi theatre music, Sinhala Buddhist devotional song (bodu gee), Minerva-troupe stage comedy.
   - Funaná: batuku, tabanka, finaçon (the sung-verse genre), funaná-kizomba hybrids.
   - Porro: Colombian band fandango, orchestral gaita, mapalé, merecumbé, puya.
   - Changga: Korean art song (가곡), children's song (동요), independence-army songs, manyo (만요).
   - Haqiba: Sudanese madeeh, tum tum, aghani al-banat.
   - Twoubadou: Cuban guajira / música campesina, Haitian mini-jazz, tumba francesa.
