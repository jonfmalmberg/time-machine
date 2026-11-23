# H9: Evidence triage: why 161 claims from batches 1 and 2 are unconfirmed

Date: 2026-11-23. Branch: `helper/2026-11-23-h9`. Run configured with model `claude-opus-5-5` (fallbacks `claude-opus-5[1m]`, `claude-opus-4-8[1m]`; the serving model may differ and cannot be confirmed from inside the run). Sub-agents: five `web-fetch` agents on Sonnet, to read the pages my shell could not; all five were blocked (see "What fell short") and contributed nothing to the result.

## What was asked

Classify each of the 161 claims in `work/2026-11-23-evidence/evidence-check.json` with result `not found` (15) or `no page` (146) as confirmed, reworded, page unreadable by script only, source gone, wrong source or cannot tell. Start with the 17 claims on `download.osmand.net`. Classify only: no repairs, no replacement sources. Test whether the shell can fetch a page directly.

## What is in this folder

- `triage.json`: one line per claim (161): file, scope, n, address, artist, title, kind, the recorded quote, the script's earlier result, `class`, `exact` (text copied from the raw page, for confirmed and reworded), and a one-line `reason`.
- `REPORT.md`: this file.

## Can the shell fetch a page directly?

Yes. `curl -sS -m 15 -o /dev/null -w "%{http_code}" https://en.wikipedia.org/wiki/Music` returned `200`. Every page in this run was fetched raw with `curl -sL -A "time-machine-research/1"` (with `--compressed` where needed), and every `exact` string in `triage.json` was checked by a script to be present in that raw text (tags removed) before it was written. So helpers with this setup can copy exact page text. The same sites still refuse it, though: the shell gets the same bot checks as the evidence script (see "cannot tell").

## What was found

| Class | Claims | Meaning here |
| :- | -: | :- |
| confirmed | 10 | The page says it; the script missed it for a reason given in the line |
| reworded | 6 | The page supports the claim but not in the quoted words; the page's own text is in `exact` |
| page unreadable by script only | 0 | None: wherever the script was refused, my shell was refused too, and the page-reading tool was blocked |
| source gone | 30 | The address returns 404 today |
| wrong source | 1 | The page loads and does not support the claim |
| cannot tell | 114 | Neither the shell nor the page-reading tool could read the page |

**The 17 `download.osmand.net` claims (kobzar dumy).** `download.osmand.net` is the download and documentation server of OsmAnd, an offline map app. Its `/wiki/` path served copies of Wikimedia pages; this address now gives OsmAnd's own "Page Not Found". The researcher's title for it was already "(Commons mirror)". The original is the Wikimedia Commons project page "Commons:Filaret Kolessa phonograph cylinder collection" (https://commons.wikimedia.org/wiki/Commons:Filaret_Kolessa_phonograph_cylinder_collection). All 17 quoted strings are on that Commons page today, read raw by the shell. They are classed `source gone` because the recorded address is dead. Changing the address to the Commons page would be a repair, and I did not make it. It is a question for the lead.

**Why the script missed the 10 confirmed claims.** These are script faults, not research faults. Each could be fixed in `tools/check_evidence.py`, which I did not touch:
- 4 were transient: a name lookup failure (farsidemusic), a connection reset (trad-culture.ru), and a bot check or HTTP 500 on the day that has since cleared (ponderosa.it ×2, which now also redirects; budamusique).
- 1 is a compressed reply. nhandan.vn sends a gzip body even when it is not asked for one, and the script decoded the compressed bytes as text.
- 1 is in markup only. The Kudos Records track title is in `meta itemprop="name"` and `audio title` attributes, and the script removes tags before searching.
- 1 is markup splitting a number. On Wikipedia's Tarantella page, 6/8 is drawn as stacked spans, so the text reads "68" or "6 8" and the script's quote "68" does not match.
- 2 are PDF layout problems. `pdftotext -layout` interleaves the columns of the kulintang liner notes. The FW04536 scan reads the year as "1 961".

**The 6 reworded claims.** Ca trù/Mỹ Linh (the tool inserted "year"), the Mahagita catalogue number ("Cat No:"), Nazem al-Ghazali, and three Duma (epic) lines. One of the Duma lines needs the lead's attention: the quote says the duma "originated in Ukraine during the Cossack Era **in the sixteenth century**", and the page has no sixteenth century. That part of the claim is unsupported, and the definition should not carry it from this source.

**Wrong source (1).** Bihu dance (Wikipedia). The quote "Bihu is mentioned in the inscriptions of the 14th-century Chutia King Lakshminaryan as well." does not appear: today's article mentions no inscriptions, Lakshminarayan or 14th century. It may have been in an earlier revision; I did not check page history.

**Source gone (30).** osmand 17 (above), propermusic.com Tammurriata di Scafati product page 4, allnightflightrecords.com Yusuf Omar product page 3, wiki.riteme.site (an unofficial Wikimedia mirror) 2, musikverket.se/capricemusic.se 1, anost.net 1, europe.chinadaily.com.cn 1, felmay.it 1.

**Cannot tell (114).** Smithsonian Folkways and Folklife (folkways.si.edu, folklife.si.edu: 60), last.fm (12), cezamemusic (8), allmusic, discogs, ebay, worldmusiccentral, grinnell omeka, forcedexposure, sonicbids, qdl.qa and culturalequity all answered the shell with HTTP 403 and a bot check ("Just a moment...", "Client Challenge"). I did not try to get around the bot checks. The ilamcommons/vital.seals (Rhodes University ILAM), samap.ukzn, pointculture.be and adpprod1.library.ucsb.edu pages failed before any answer (connection reset, or proxy "CONNECT tunnel failed, response 502"), twice each. wiki.y.qq.com and latestly.com returned 502, lib.ecu.edu and maisondesculturesdumonde 503, and archive.shine.cn redirected to a login server and reset. These are not evidence that the sources are wrong. They are unchecked.

### Per genre

| Genre | Batch | Claims | Triaged | confirmed | reworded | source gone | wrong source | cannot tell | Songs listed | Songs with no support |
| :- | :- | -: | -: | -: | -: | -: | -: | -: | -: | -: |
| kalevalarunosong | H3 | 28 | 5 | 1 | 0 | 2 | 0 | 2 | 12 | 3 |
| ngoma | H3 | 19 | 12 | 0 | 0 | 2 | 0 | 10 | 7 | 4 |
| amazighahwashandah | H3 | 26 | 2 | 0 | 0 | 0 | 0 | 2 | 9 | 2 |
| cheo | H3 | 24 | 17 | 0 | 0 | 0 | 0 | 17 | 11 | 11 |
| catru | H3 | 33 | 9 | 0 | 1 | 0 | 0 | 8 | 17 | 0 |
| quanho | H3 | 20 | 10 | 2 | 0 | 0 | 0 | 8 | 7 | 6 |
| bihusongs | H3 | 36 | 4 | 0 | 0 | 0 | 1 | 3 | 19 | 2 |
| pungmul | H3 | 34 | 15 | 1 | 0 | 0 | 0 | 14 | 16 | 10 |
| huaer | H4 | 27 | 6 | 0 | 0 | 1 | 0 | 5 | 5 | 0 |
| kulintang | H4 | 42 | 6 | 2 | 0 | 0 | 0 | 4 | 19 | 2 |
| malhun | H4 | 11 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| garbaanddandiyaraa | H4 | 45 | 14 | 0 | 0 | 0 | 0 | 14 | 14 | 8 |
| mahagita | H4 | 49 | 7 | 0 | 1 | 0 | 0 | 6 | 20 | 0 |
| kobzardumy | H4 | 39 | 30 | 1 | 3 | 17 | 0 | 9 | 18 | 14 |
| tarantella | H4 | 42 | 15 | 3 | 0 | 4 | 0 | 8 | 15 | 4 |
| iraqimaqam | H4 | 51 | 9 | 0 | 1 | 4 | 0 | 4 | 18 | 0 |


malhun has no playlist songs (status none in batch 2), so nothing of it was triaged.

### Songs that now have no supporting source at all

66 of the 207 songs in the 16 playlists (intro and peak) have no claim with result `found` or `near` and none classed `confirmed` or `reworded`. A song matches a claim when the claim's kind is song, fit, near or album and its title equals or begins with the song's title (normalised). Four songs show "no claim names this song": no claim had a matching title, which may be a matching miss rather than a missing source. "cannot tell" means unchecked, not wrong.

| Genre | Role | Artist | Title | Its claims |
| :- | :- | :- | :- | :- |
| kalevalarunosong | intro | John Soininen | Vaka vanha Vainamoinen | source gone |
| kalevalarunosong | peak | Sinikka Langeland | Pakeneva | no claim names this song |
| kalevalarunosong | peak | Sinikka Langeland | Vinterrune | no claim names this song |
| ngoma | peak | Mashaka Kawambwa and Kitamba Kilaka with Zaramo men | Mshatulo kwenda ovyo | cannot tell |
| ngoma | peak | Mashaka Kawambwa and Kitamba Kilaka with Zaramo men | Mitambu yalagala kumchuzi Part II | cannot tell |
| ngoma | peak | Five Haya men | Enkoito drum rhythms | cannot tell |
| ngoma | peak | Bangilana Nduhila with Zinza men and women | Ngoma yalilamuno yayenda Maraya Pemba | cannot tell |
| amazighahwashandah | peak | Various | Ahwach (Musique Berbère du Haut-Atlas, A1) | no claim names this song |
| amazighahwashandah | peak | Various | "Ahwach" (Musique Berbère du Haut-Atlas, B4) | no claim names this song |
| cheo | intro | Bac Nam Ngu | Sap Qua Câu | cannot tell |
| cheo | intro | Manh Tuân | Lâo Say | cannot tell |
| cheo | intro | Bac Nam Ngu | Hê Môi | cannot tell |
| cheo | intro | Bac Phâm | Sa Lêch Bang | cannot tell |
| cheo | intro | Bac Phâm | Sap Cô Phong | cannot tell |
| cheo | peak | Hông Vân & Thanh Hoài | Thi Nhip; Vo Nuoc | cannot tell |
| cheo | peak | Bui Trong Dan | Noi Su Ghe Râu; Noi Ke | cannot tell |
| cheo | peak | Bac Minh Ly | Duong Truong Tai Luong | cannot tell |
| cheo | peak | Bac Phâm | Hat Van Câm | cannot tell |
| cheo | peak | Bac Nam Ngu, Bac Phâm | Bai Phû Thuy | cannot tell |
| cheo | peak | Bac Minh Ly | Ke Hanh / Hat Ru Ke | cannot tell |
| quanho | intro | Bắc Ninh quan họ singers | Cơi trầu | cannot tell |
| quanho | intro | Bắc Ninh quan họ singers | Gọi đò | cannot tell |
| quanho | peak | Bắc Ninh quan họ singers | Đường bạn Kim Loan | cannot tell |
| quanho | peak | Bắc Ninh quan họ singers | Sở cầu như ý | cannot tell |
| quanho | peak | Bắc Ninh quan họ singers | Đêm qua nhớ bạn | cannot tell |
| quanho | peak | Bắc Ninh quan họ singers | Kẻ Bắc người Nam | cannot tell |
| bihusongs | intro | Bihu dancers in Majuli | Sirip sirip kori nasa hera nasoni (Jeng Bihu dance music) | cannot tell |
| bihusongs | intro | Various artists | Toka Bihu- dehi oi lihiri kohua bon | cannot tell |
| pungmul | intro | Kim Ok-sim | Ah-Rirang | cannot tell |
| pungmul | intro | Lee Chun-hee | Nodeul Gangbyeon | cannot tell |
| pungmul | intro | Kim Ok-sim | Torachi | cannot tell |
| pungmul | intro | Lee Chun-hee | Taepyeongga | cannot tell |
| pungmul | peak | Samul-Nori | Youngnam Nong-ak | cannot tell |
| pungmul | peak | Korean Women's Music Association | Nong-Ahk | cannot tell |
| pungmul | peak | Lee Chun-hee | Gin Arirang | cannot tell |
| pungmul | peak | Lee Chun-hee | Changbu Taryeong | cannot tell |
| pungmul | peak | Lee Chun-hee | Gu Arirang | cannot tell |
| pungmul | peak | Lee Chun-hee | Noraetgarak | cannot tell |
| kulintang | peak | Danongan Kalanduyan, Bernard Ellorin and Eric Abutin | Binalig a Kulndet | cannot tell |
| kulintang | peak | Kim Kalanduyan | Duyog and Sinulog a Kamamatuan | cannot tell |
| garbaanddandiyaraa | peak | Atul Purohit | Vhalam Ni Vaat Kai | cannot tell |
| garbaanddandiyaraa | peak | Atul Purohit | He Maro Saybo | cannot tell |
| garbaanddandiyaraa | peak | Atul Purohit | Sharad Poonam Ni Raatdi | cannot tell |
| garbaanddandiyaraa | peak | Atul Purohit | Gori Radha Tane Jaata Joi Mor Bani Thangaat Kare (Live) | cannot tell |
| garbaanddandiyaraa | peak | Maniraj Barot | Sanedo Sanedo Laal Sanedo | cannot tell |
| garbaanddandiyaraa | peak | Aishwarya Majmudar | Van Ma Chandaliyo Ugyo Re | cannot tell |
| garbaanddandiyaraa | peak | Aishwarya Majmudar | Saybo Re Govaliyo | cannot tell |
| garbaanddandiyaraa | peak | Jigardan Gadhavi | Hal Kana Mane Dwarika Dekhad | cannot tell |
| kobzardumy | intro | Julian Kytasty | Captive’s Lament | cannot tell |
| kobzardumy | intro | F. Jarko | Duma about Marussia of Bohuslav | cannot tell |
| kobzardumy | intro | Julian Kytasty | The widow and her three sons | cannot tell |
| kobzardumy | peak | Julian Kytasty | The brother and sister | cannot tell |
| kobzardumy | peak | Mykhailo Kravchenko | Duma Pro samarskykh brativ | source gone |
| kobzardumy | peak | Mykhailo Kravchenko | Duma Pro pikhotyntsia | source gone |
| kobzardumy | peak | Mykhailo Kravchenko | Duma Plach Nevolnykiv | source gone |
| kobzardumy | peak | Opanas Slastion | Duma Plach Nevolnykiv | source gone |
| kobzardumy | peak | Hnat Honcharenko | Duma Pro Oleksiya Popovycha | source gone |
| kobzardumy | peak | Hnat Honcharenko | Duma Pro sestru i brata | source gone |
| kobzardumy | peak | Stepan Pasiuha | Duma Pro Marusiu Bohuslavku | source gone |
| kobzardumy | peak | Ivan Kucherenko | Duma Pro smert kozaka-bandurysta | source gone |
| kobzardumy | peak | Mykola Dubyna | Duma Pro pikhotyntsia | source gone |
| kobzardumy | peak | Platon Kravchenko | Duma Pro pikhotyntsia | source gone |
| tarantella | peak | Tammurriata di Scafati | Tammuriata D'O Pepe | source gone |
| tarantella | peak | Tammurriata di Scafati | Tarantella D'a Fatica | source gone |
| tarantella | peak | Salvatore Ida and his Orchestra | A Mala Mugghieri (The Bad Wife) - Tarantella Calabrese | cannot tell |
| tarantella | peak | Aiello and his Orchestra | Cu Abballa Abballa (Tarantella Commandata) | cannot tell |


## Sources

Every address is in `triage.json` (the 161 claims' own addresses). One extra page was read to say what the osmand source is: Wikimedia Commons, "Commons:Filaret Kolessa phonograph cylinder collection", https://commons.wikimedia.org/wiki/Commons:Filaret_Kolessa_phonograph_cylinder_collection, read 2026-11-23.

## What fell short

- **114 claims (71%) remain `cannot tell`.** The plan was for Sonnet `web-fetch` sub-agents to read the pages the shell is refused. All five agents (48 addresses) got `PROVENANCE_REQUIRED: The permission request for this URL was not answered in time` on every fetch, because the page-reading tool asks for a permission and nobody is present in a scheduled run. This is the same block H2 reported. I did not retry. So no claim could be classed "page unreadable by script only". Redoing these needs either a run where someone can approve the fetch tool's permission, or the check script run from the owner's computer (where Folkways etc. may answer a browser).
- Each failing address was tried twice from the shell (the evidence-check run and this one), plus a third try for the connection-failure group. Some may answer on another day; budamusique did.
- Even if the fetch tool had worked, its text is known to be reworded (README), so it could only have supported a class, not supplied `exact` text.
- The Bihu `wrong source` was judged against today's revision only.
- Song-to-claim matching for the songs table is by title and is approximate.

## Questions for the lead

1. The 17 kobzar-dumy claims are on the Commons original of the dead osmand mirror. Should H11 re-point them to the Commons address, which would count as found, or treat them as new evidence?
2. The script faults above (gzip, attributes, stacked fractions, `-layout` PDFs, transient retries) explain all 10 confirmed. Should they become a script fix before H11 reruns the check?
3. For the 60 Folkways claims, would you rather run the check from your own computer than have helpers look for replacement sources in H11?
