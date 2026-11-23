# H3: Genre research, batch 1
Date 2026-11-23, branch `helper/2026-11-23-h3`. Run configured as `claude-opus-5-5` (fallbacks `claude-opus-5[1m]`, `claude-opus-4-8[1m]`; the serving model could differ and cannot be confirmed from inside the run). Sub-agents: eight research sub-agents, one per genre, all started with model `opus`, as the assignment names.

## What was asked
The first eight genres in `data/nodes.json` order with no entry in `data/defs.json` (no `helper/*` branch held a `defs.add.json`; only `h1` and `h2` existed): `kalevalarunosong` (Kalevala runosong (runolaulu)), `ngoma` (Ngoma (East African drum and dance)), `amazighahwashandah` (Amazigh ahwash and ahidus), `cheo` (Chèo), `catru` (Ca trù), `quanho` (Quan họ), `bihusongs` (Bihu songs (Bihu geet)), `pungmul` (Pungmul (nongak) and Korean folk song (minyo)). For each: a size estimate first, then a definition and a playlist in the shape of `defs.json` and `playlists.json`, each song backed by a source address, the exact supporting string and the date read.

## What is in this folder
- `defs.add.json`: eight new `defs.json` entries, one per line.
- `playlists.add.json`: eight new `playlists.json` entries, one per line.
- `sizes.json`: genre id → low, high, core, basis, confidence.
- `sources.json`: genre id → list of sources (kind fit/near/song/album/size/def, artist, title, address, exact string, date read).
- `unverified.json`: genre id → things recalled or half-seen but not confirmed on a page (kept out of the entries), and fetch failures.
- `REPORT.md`: this file.

## What was found
| Genre | Status | Songs | Albums | Fits | Near | Fold | Size (low–high, core) |
| :- | :- | -: | -: | -: | -: | :- | :- |
| `kalevalarunosong` | thin | 12 | 4 | 4 | 2 | – | 150–800, 20 |
| `ngoma` | thin | 7 | 4 | 4 | 1 | – | 300–2000, 20 |
| `amazighahwashandah` | thin | 9 | 5 | 4 | 0 | – | 150–1500, 10 |
| `cheo` | thin | 11 | 1 | 4 | 1 | quanho | 300–3000, 40 |
| `catru` | full | 17 | 4 | 3 | 2 | – | 150–600, 20 |
| `quanho` | thin | 7 | 4 | 2 | 1 | – | 300–3000, 30 |
| `bihusongs` | full | 19 | 4 | 4 | 2 | – | 10000–50000, 150 |
| `pungmul` | full | 16 | 5 | 4 | 2 | – | 3000–15000, 60 |

All size estimates are low confidence: no source counts recordings for any of these traditions, so each range is a judgement from melody counts, archive holdings or release rates, stated in `sizes.json`.

### Confidence, per genre
**`kalevalarunosong`.** Low to medium. Every listed track and album was seen on a fetched page, but quotes were read through a page-summarising fetch tool, so a few strings may differ slightly in punctuation from the live page (the AllMusic recording-date line in particular was not captured verbatim). Genre fit is strongest for John Soininen's 1939 Kalevala field recording, the Korhonen/Hoffrén album and Taito Hoffrén's runolaulu track; Langeland (Norwegian Forest Finn rune songs), Hedningarna (Karelian material learned in Karelia, 'base in runosong') and the Kalaniemi/Käppi album (Kalevala poem 41, sung in Swedish) are revival or adjacent settings. Years: Runoja is 2002 per Wikipedia but reviewed as a 2003 release; Okra Playground, Kardemimmit and Tuuletar are described as using runo singing but no specific tracks were tied to it. The size estimate is a rough judgement, not a count.

**`ngoma`.** Medium for the individual tracks, low for the size estimate. Every listed track was seen on a fetched archive, label or retailer page, and the five 1950 Hugh Tracey items are described on ILAM or Smithsonian Folkways pages as drum dance music from Tanzania (one recorded in Dar es Salaam itself). The two modern tracks are tied to ngoma drums by their label's own text (Real World on muheme drums, Honest Jon's on Sengenya drums including ngoma), but those pages describe the album rather than each track, so 'Muheme' and 'Ngoma Wira' are matched by their titles. Several quotes were returned through a page-reading tool rather than seen raw, so exact punctuation may differ slightly. The release year for the Zinza track was not on the page. The c. 1000 start comes from the map, not from a source.

**`amazighahwashandah`.** Medium for the definition and for the existence of each listed track, since every track title was read on a label booklet (Folkways), the label's own Bandcamp (Dust-to-Digital) or the CREM-CNRS archive catalogue that records the publisher, catalogue number and year of each LP. Low for completeness and for the size estimate: these are field recordings by unnamed village troupes, track titles are generic ("Ahwach", "Ahidous"), most are out of print and hard to stream, and the large local cassette and online market of named ahidus and ahwash troupes could not be verified track by track. The Folkways band 4 title is printed "Abouache" on the fetched PDF, almost certainly a scan or typo of "Ahouache"; the CREM catalogue pages for the Albatros, Vogue and Chant du Monde releases do not state the 1996 track or the 1973 tracks' performers. No source gives a start date; "1000 onward" is the map's placeholder, not a sourced date.

**`cheo`.** Medium for the definition and for the 11 listed tracks, all of which come from one authoritative release (the UNESCO Collection album D 8022, now on Smithsonian Folkways, released 1976 per its liner notes and confirmed as 'Hat Chèo' by the CREM-CNRS archive); low for breadth and for the size estimate. Track rows were read through a page-summarising fetch tool, so spacing or punctuation in the quotes may differ slightly from the page, and the titles are printed by Folkways with incomplete Vietnamese diacritics (e.g. 'Sap Qua Câu' rather than 'Sắp qua cầu'), kept as printed rather than reconstructed. No modern release by famous chèo artists (Thúy Cải, Quốc Anh, Thanh Ngoan, Minh Phương) could be confirmed on a fetched page, so the list is thin and dated, though representative of classic chèo repertoire (Quan Âm Thị Kính, Xúy Vân, Lão say, Hề mồi).

**`catru`.** Medium for the recordings: every playlist track appears in a fetched tracklist (Smithsonian Folkways album page or Discogs release data via api.discogs.com, since discogs.com pages were blocked), but Discogs and Folkways strip or garble Vietnamese diacritics, so titles here are normalised to standard Vietnamese spelling while quotes keep the page strings. Quách Thị Hồ is credited by name on the Folkways page; the Inédit tracks are credited to vocalists Nguyễn Thụy Hoà and Nguyễn Thị Hà Vy of the Thái Hà ensemble; the Nimbus tracks are credited only to the ensemble. Release years: the Quách Thị Hồ recordings were made in 1976 and issued on LP in 1978 (Odeon/EMI, per Discogs); Inédit first issued 1996 (shop page) with a 2002 reissue. The size estimate is low confidence. Wikipedia credits the profession to the Later Lê dynasty and mentions the Lý court; the c. 1100 start is a traditional attribution, not a documented recording-era fact.

**`quanho`.** Medium for the definition (UNESCO, Wikipedia and the UNESCO LP notes agree on alternating male/female village pairs, Bắc Ninh origin and the shift from unaccompanied to instrument-backed singing); low for the playlist and size. Every playlist song comes from one release: Trần Văn Khê's April 1976 Bắc Ninh recordings, issued by UNESCO/EMI-Odeon in 1977 and reissued by Smithsonian Folkways. The CREM archive record for one of those songs lists đàn nguyệt, đàn bầu, đàn tranh, flutes and fiddle, so the playlist holds the modern instrument-accompanied quan họ, not unaccompanied quan họ cổ. The source pages print the titles without most diacritics (e.g. 'Coi-Giâu', 'Goi Do'). The diacritic titles in the entries are my standard Vietnamese spellings of those page titles, and 'Coi-Giâu' is read as Cơi trầu (giầu is a northern spelling of trầu, betel). The artist label 'Bắc Ninh quan họ singers' is a group name I chose; the source pages credit the named village singers. Release years are 1977 (the EMI-Odeon LP date on CREM). Songs written: unknown (traditional).

**`bihusongs`.** Medium for the songs, low for the size. Fifteen of the nineteen playlist tracks come from Saregama's own Assamese catalogue page, the label's list for its Carvaan Mini player. It names each track's album and singers, and most of those albums are titled 'Bihu Songs', 'Bihu Geet' or 'Bihu Geet Sankalan'. Two tracks are Smithsonian Folkways field recordings labelled as Bihu music. The two Zubeen Garg songs rest only on a Sentinel Assam editorial that names them as his Bihu songs; no page confirmed which release they are on. No page gave a release year for any track; the only dated items are Zubeen Garg's albums. Every quote came through a fetch tool that summarises pages: the Saregama row text was returned line by line, and the line breaks in the quotes stand in for the page's separate lines. The size estimate rests on a single 2007 count of about 100 cassettes a year.

**`pungmul`.** Medium for the definition, low for the size. Scope: the app's existing `minyo` id is Japanese min'yō (nodes.json names it "Japanese min'yō and shamisen", anchored in Japan), so this id covers both Korean village percussion (pungmul/nongak, including the staged samul nori that grew from it in 1978, since samul nori has no id of its own) and Korean folk song (Korean minyo: Arirang variants, Gyeonggi, Namdo and Seodo songs). Pansori and court music stay in their own ids. Every playlist track was read on a fetched label, archive or retailer page, but the list leans on one Ocora album (7 of 16 songs from Lee Chun-hee), several titles are generic ('Nong-Ahk', 'Namdo Min Yo'), romanisations vary wildly between releases, and streaming availability was not checked. Release years: Ocora album dated 2014 from the Songlines review issue date; the Chung Woong ensemble year 2013 is for the EUCD2465 reissue (an earlier EUCD 1561 issue is cited by Grinnell but not dated); Song So-hee's 'Odolttogi' (2017) is a modern arrangement by a Gyeonggi minyo singer, and the fetched page does not itself call the song a folk song. Exact quotes were taken from the fetch tool's verbatim extracts, not from raw HTML.

## Sources
One line per distinct address; the full list with the exact strings is in `sources.json`.

### `kalevalarunosong`
- None: Runic song (Wikipedia). <https://en.wikipedia.org/wiki/Runic_song>
- None: Runosong (Finnish Wiki-Inventory for Living Heritage). <https://wiki.aineetonkulttuuriperinto.fi/wiki/Runosong>
- None: Rune singing, the musical vernacular (FMQ). <https://fmq.fi/articles/rune-singing-the-musical-vernacular>
- None: Suomen kansan vanhat runot (Wikipedia). <https://en.wikipedia.org/wiki/Suomen_kansan_vanhat_runot>
- John Soininen: Vaka vanha Vainamoinen. <https://wiki.riteme.site/wiki/File:Vaka_vanha_Vainamoinen.ogg>
- Ilona Korhonen & Taito Hoffrén: Minä, Paraske. Sinä, Arhippa.. <https://www.fmq.fi/articles/the-gift-of-runo-singing>
- Sinikka Langeland: Runoja. <https://worldmusiccentral.org/cd-review-sinikka-langeland/>
- Sinikka Langeland: Ukko / Tirun Lirun / Pakeneva / Vinterrune. <https://grappa.no/en/?p=35494>
- Hedningarna: Karelia Visa. <https://rambles.net/hedningarna.html>
- Teppana Jänis & Arja Kastinen feat. Taito Hoffrén: Runolaulu – Voi minä poloine poiga. <https://deathisnottheend.kudosrecords.co.uk/release/death087/teppana-janis>
- Maria Kalaniemi & Pekko Käppi: Sångarstenen. <https://www.galileomusic.de/promo/docs/AKEROCD29.pdf>
- Maria Kalaniemi & Pekko Käppi: Tåreportens pärla (runo metre). <https://www.fmq.fi/articles/bending-old-traditions-into-new-paths>
- Various Artists: The Kalevala Heritage: Archive Recordings of Ancient Finnish Songs. <https://www.allmusic.com/album/the-kalevala-heritage-archive-recordings-of-ancient-finnish-songs-mw0000637560>
- Tellu Turkka: Suden Aika. <https://folkworld.eu/62/e/kalevala.html>
- Ove Berg & Sinikka Langeland: Tirun Lirun – Skogsfinske Runesanger. <https://en.wikipedia.org/wiki/Sinikka_Langeland>
- Pekko Käppi & K:H:H:L: Piika Kaarin. <https://fmq.fi/articles/spells-blood-and-bliss>
- Pekko Käppi: (modern runo singer label). <https://fmq.fi/articles/beautiful-archaic-boogie>
- Värttinä: Otavaiset. <https://www.womex.com/virtual/westpark_music/vaerttinae/viena>

### `ngoma`
- None: Ngoma music (Wikipedia). <https://en.wikipedia.org/wiki/Ngoma_music>
- Mashaka Kawambwa and Kitamba Kilaka with Zaramo men: Mshatulo kwenda ovyo. <https://ilamcommons.ru.ac.za/vital/access/manager/Repository/vital:42578>
- Mashaka Kawambwa and Kitamba Kilaka with Zaramo men: Mshatulo kwenda ovyo. <https://folkways.si.edu/pipe-dances-with-viyanzi-flute-and-dance-songs-of-the-zaramo-people-from-dar-es-salaam-tanzania/world/music/album/smithsonian>
- Mashaka Kawambwa and Kitamba Kilaka with Zaramo men: Mitambu yalagala kumchuzi Part II. <https://ilamcommons.ru.ac.za/vital/access/manager/Repository/vital:42577>
- Nhonyi Maluwatu with Gogo women: Two Ngoma drum rhythms. <https://digitalarchives.ru.ac.za/s/ilam/item/62741>
- Nhonyi Maluwatu with Gogo women: Two Ngoma drum rhythms. <https://vital.seals.ac.za/vital/access/manager/Repository/vital:42447>
- Five Haya men: Enkoito drum rhythms. <https://ilamcommons.ru.ac.za/vital/access/manager/Repository/vital:15150>
- Bangilana Nduhila with Zinza men and women: Ngoma yalilamuno yayenda Maraya Pemba. <https://folkways.si.edu/wedding-entertainment-and-dance-songs-from-the-zinza-people-of-biharamulo-district-tanzania/world/music/album/smithsonian>
- Mukunguni: Ngoma Wira. <https://www.rushhour.nl/record/cd/new-recordings-coast-province-kenya>
- Mukunguni: New Recordings From Coast Province, Kenya. <https://forcedexposure.com/Catalog/HJR.068LP.html>
- The Zawose Queens: Muheme. <https://realworldrecords.com/releases/maisha/>
- Hugh Tracey: Tanzania Instruments: Tanganyika 1950. <https://www.forcedexposure.com/CATALOG/SWP.022CD.html>
- The Bagamoyo Players: Tanzania. <https://www.acoustic-music.de/1116/en>
- Various Artists: Music from Tanzania and Zanzibar 1. <https://musikverket.se/capricerecords/artikel/music-from-tanzania-and-zanzibar-1/?lang=en>
- Salum Abdallah and Cuban Marimba Band: Ngoma Iko Huku. <https://www.anost.net/release/133A/salum-abdallah-and-cuban-marimba-band/ngoma-tanzania>
- Salum Abdallah and Cuban Marimba Band: Ngoma Tanzania (album). <https://cafeoto.co.uk/shop/salum-abdallah-and-cuban-marimba-band-ngoma-tanzan>
- None: SAMAP: Gogo people listing (ILAM items tagged drum / ngoma dance). <https://samap.ukzn.ac.za/audio-people/gogo>
- None: SAMAP: Sukuma language listing, page 7 of 12+. <https://samap.ukzn.ac.za/audio-language/sukuma?page=7>

### `amazighahwashandah`
- : Ahwash (Wikipedia). <https://en.wikipedia.org/wiki/Ahwash>
- : Ahidus (Wikipedia). <https://en.wikipedia.org/wiki/Ahidous>
- Alan Lomax (rec.): Aguelmouss I 9/67. <https://archive.culturalequity.org/field-work/morocco-1967/aguelmouss-i-967>
- Various: Ahouache from Tata. <https://folkways-media.si.edu/docs/folkways/artwork/FW04339.pdf>
- Maallem Ahmed and ensemble: Aouache Men's Chorus (Tafraout). <https://dusttodigital.bandcamp.com/album/music-of-morocco-recorded-by-paul-bowles-1959>
- Various: Ahidous. <https://archives.crem-cnrs.fr/archives/collections/CNRSMH_E_2011_002_011/>
- Bernard Lortat-Jacob (rec.): Berbères du Maroc "Ahwach". <https://archives.crem-cnrs.fr/archives/collections/CNRSMH_E_1979_021_001/dc/>
- Various: Ahwach (A1). <https://archives.crem-cnrs.fr/archives/collections/CNRSMH_E_1971_003_004/>
- Various: Grande danse ahidus. <https://archives.crem-cnrs.fr/archives/items/CNRSMH_E_1996_013_001_003_001/>
- Bernard Lortat-Jacob (rec.): Berbères du Maroc "Ahwach" (Le Chant du Monde LDX 74705). <https://tradandfolk.blogspot.com/2023/04/berberes-du-maroc.html?m=1>
- Various: Les voix du monde (release details for Grande danse ahidus). <https://archives.crem-cnrs.fr/archives/collections/CNRSMH_E_1996_013_001/>
- : CREM-CNRS ahidus search results. <https://archives.crem-cnrs.fr/archives/items/CNRSMH_I_1970_044_022_08>
- : M&A review of Anthologie de la Musique Marocaine. <https://www2.umbc.edu/MA/index/number8/ciucci/ciucciweb.htm>

### `cheo`
- None: Chèo (Wikipedia). <https://en.wikipedia.org/wiki/Chèo>
- Various Artists: Viet Nam: Hát Chèo: Traditional Folk Theatre. <https://folkways.si.edu/viet-nam-hat-cheo-traditional-folk-theatre/world/music/album/smithsonian>
- None: Cần có quy chế khuyến khích sưu tầm những vở chèo cổ (Tuổi Trẻ). <https://tuoitre.vn/can-co-quy-che-khuyen-khich-suu-tam-nhung-vo-cheo-co-62703.htm>
- None: Gìn giữ và trao truyền làn điệu chèo (Báo Pháp luật). <https://baophapluat.vn/gin-giu-va-trao-truyen-lan-dieu-cheo-post508438.html>
- Various Artists: Viet Nam: Hát Chèo: Traditional Folk Theatre. <https://folkways-media.si.edu/docs/folkways/artwork/UNES08022.pdf>
- Various Artists: Viet Nam: Hát Chèo: Traditional Folk Theatre. <https://archives.crem-cnrs.fr/archives/items/CNRSMH_E_1996_013_001_002_003/>
- Quach Thi Hô: Ty bà hành. <https://folkways.si.edu/viet-nam-ca-tru-quan-ho-traditional-music/world/music/album/smithsonian>

### `catru`
- Quách Thị Hồ: Bắc phản. <https://folkways.si.edu/viet-nam-ca-tru-quan-ho-traditional-music/world/music/album/smithsonian>
- Hanoi Ca Trù Thái Hà Ensemble: Gửi thư. <https://api.discogs.com/releases/9131069>
- Nguyễn Thụy Hoà: Hát nói. <https://api.discogs.com/releases/1570398>
- Quách Thị Hồ: Tỳ bà hành. <https://api.discogs.com/releases/1976637>
- Mỹ Linh: Trên đỉnh Phù Vân. <https://en.wikipedia.org/wiki/Ca_tru>
- Ca Trù Thái Hà Ensemble: Nord Việt Nam: Le Ca Trù. <https://boutiqueenligne.maisondesculturesdumonde.org/en/cdsvinyls/318-le-ca-tru.html>
- Hanoi Ca Trù Thái Hà Ensemble: Ca Trù: The Music of North Vietnam. <https://www.gold.ac.uk/music/catru/>
- Various: Viet-Nam: La Voix des Maisons de Chant – Ca Tru. <https://api.discogs.com/releases/12972571>
- None: Praise drum. <https://folkways.si.edu/news-and-press/unesco-collection-week-43-ca-tru-and-quan-ho-traditions-of-vietnam>

### `quanho`
- None: Quan Họ Bắc Ninh folk songs (UNESCO ICH). <https://ich.unesco.org/en/RL/quan-ho-bac-ninh-folk-songs-00183>
- None: Quan họ (Wikipedia). <https://en.wikipedia.org/wiki/Quan_ho>
- None: UNES08035 liner notes. <https://folkways-media.si.edu/docs/folkways/artwork/UNES08035.pdf>
- None: Hơn 200 làn điệu dân ca quan họ Bắc Ninh (Nhân Dân). <https://nhandan.vn/ocop/hon-200-lan-dieu-dan-ca-quan-ho-bac-ninh-post533359.html>
- Bắc Ninh quan họ singers: Người ơi người ở đừng về. <https://archives.crem-cnrs.fr/archives/items/14783>
- Bắc Ninh quan họ singers: Viet Nam: Ca Tru and Quan Ho (album). <https://archives.crem-cnrs.fr/archives/collections/CNRSMH_E_1979_025_004/>
- Quach Thi Hô: Tỳ bà hành. <https://folkways.si.edu/viet-nam-ca-tru-quan-ho-traditional-music/world/music/album/smithsonian>
- Various: Quan Ho Bac Ninh. <https://farsidemusic.com/acatalog/Quan-Ho-Bac-Ninh-FSD2892.html>
- Bac Ninh: Vietnam (Chant Quan Ho). <https://music.apple.com/us/album/vietnam-chant-quan-ho/1070181180>
- Thúy Hoàn: Se chỉ luồn kim. <https://daidoanket.vn/thuy-hoan-ra-mat-album-quan-ho-10169713.html>

### `bihusongs`
- None: Bihu dance (Wikipedia). <https://en.wikipedia.org/wiki/Bihu_dance>
- None: Bihu: The Festival of Assam (Sahapedia). <https://www.sahapedia.org/bihu-the-festival-of-assam>
- None: Bihu: Music and Melody (India Today NE). <https://www.indiatodayne.in/opinion/story/bihu-music-and-melody-1374749-2026-04-13>
- None: This Bihu, VCDs in vogue in Asom (Oneindia, 2007). <https://www.oneindia.com/2007/04/14/this-bihu-vcds-in-vogue-in-asom-1176548667.html>
- Khagen Mahanta: Dhansiri Parehoi. <https://saregama.com/carvaanmini/assamese/songlist>
- Zubeen Garg: Janmoni (album). <https://eastmojo.com/premium/2026/04/11/why-a-bihu-without-zubeen-garg-still-feels-surreal/>
- Various artists: Toka Bihu- dehi oi lihiri kohua bon. <https://folkways.si.edu/bihu/india-world/music/album/smithsonian>
- Zubeen Garg: Janmoni Tumar Babe. <https://www.sentinelassam.com/more-news/editorial/zubeen-bihu-rongali-without-zg>

### `pungmul`
- None: Nongak (Wikipedia). <https://en.wikipedia.org/wiki/Nongak>
- None: Nongak and Samullori Ensembles from Korea (Grinnell College). <https://omeka-s.grinnell.edu/s/MusicalInstruments/page/korea>
- None: Samul nori (Wikipedia). <https://en.wikipedia.org/wiki/Samul_nori>
- None: Song So-hee (Wikipedia), definition of minyo. <https://en.wikipedia.org/wiki/Song_So-hee>
- None: Folk songs captured for history's sake (Korea JoongAng Daily). <https://www.koreajoongangdaily.com/lifestyle/folk-songs-captured-for-historys-sake/11229073>
- Samul-Nori: Youngnam Nong-ak. <https://omeka-s.grinnell.edu/s/MusicalInstruments/item/2940>
- Korean Women's Music Association: Nong-Ahk. <https://folkways.si.edu/korea-vocal-and-instrumental-music/world/album/smithsonian>
- Lee Chun-hee: Arirang and Minyo Singing (album). <https://songlines.co.uk/review/arirang-and-minyo-singing>
- Lee Chun-hee: Arirang and Minyo Singing. <https://en.cezamemusic.com/korea-arirang-and-minyo-singing-album-1306.html>
- Samul Nori: Yeongnam Farm Music. <https://organicmusic.jp/en/products/samul-nori-korean-traditional-folk-music-series-no-1>
- Chung Woong Korean Traditional Music Ensemble: Nong-ak (P'ungmullori). <https://eclassical.textalk.se/shop/17115/art5/4810805-b9e15b-5019396246522.pdf>
- Chung Woong Korean Traditional Music Ensemble: Traditional Music from Korea (release year). <https://eclassical.com/labels/arc/traditional-music-from-korea.html>
- Shilla traditional arts group: Namdo Min Yo. <https://www.fremeaux.com/en/1665-coree-percussions-et-chants-de-hahoe-et-kyongju-3561302536828-fa5368.html>
- SsingSsing: 청춘가. <https://en.wikipedia.org/wiki/SsingSsing>
- Samul-Nori: Drums and Voices of Korea. <https://mion.music/en/records/artists/samulnori/albums/samulnori-drums-and-voices-of-korea>
- Various Artists: The 'Deep Song' of Korea. <https://budamusique.com/en/catalogue/view/969/the-deep-song-of-korea?of=368>
- Kang Chaeong Ja & Park Jong Sul: Arirang. Korean Kyonggi Minyo. <https://archives.crem-cnrs.fr/archives/collections/CNRSMH_E_1989_013_005/>

## What fell short
- **Exact strings are not guaranteed character for character.** Every sub-agent read pages through a fetch tool that returns a processed version of the page, not raw HTML. Most quotes are what that tool returned; spacing, punctuation, diacritics and line breaks may differ from the live page. The checking script should be run before anything is merged. The Bihu Saregama quotes join separate lines from the page with `\n`.
- **One placeholder source was removed:** a `kalevalarunosong` size source from AllMusic whose quote was not captured verbatim. That entry's size basis still has one other source.
- **Vietnamese titles were normalised.** For `catru` and `quanho` the entries use standard Vietnamese spelling while the quotes keep the pages' stripped or garbled spelling (for example "Coi-Giâu" read as "Cơi trầu"). For `cheo` the titles are kept as Folkways prints them, with incomplete diacritics. The three are therefore inconsistent with each other; the lead should pick one rule.
- **Single-release playlists.** `cheo` (11 songs) and `quanho` (7) each come entirely from one UNESCO/Folkways album; `pungmul` takes 7 of 16 from one Ocora album. `catru` repeats pieces ("Tỳ bà hành" three times, "Ba mươi sáu giọng" twice, as different performances).
- **Weak links.** `bihusongs`: the two Zubeen Garg songs rest only on a newspaper editorial naming them, with no release found; no track has a release year (all `yrs` null). `ngoma`: "Muheme" and "Ngoma Wira" are tied to ngoma by album text, not track text. `amazighahwashandah`: Folkways band 4 is printed "Abouache" on the PDF and entered as "Ahouache"; most tracks are credited to "Various" with generic titles. `quanho`: the artist name "Bắc Ninh quan họ singers" is a label the sub-agent chose. `kalevalarunosong`: several playlist tracks are revival or neighbouring settings (Langeland, Hedningarna, Kalaniemi/Käppi in Swedish).
- **Start dates.** No page supports the map's start years for `ngoma` (1000) or `amazighahwashandah` (1000); `catru` 1100 is a traditional attribution; the windows say "onward" from the map's year.
- **Streaming availability was not checked** for any song.
- **Fetch failures:** MusicBrainz (bot check / JavaScript) for every genre, discogs.com web pages (the API was used for `catru`), AllMusic and last.fm pages, loc.gov item pages, a UNT catalogue record, some ILAM item pages, a Mahabahu article and two The Wire articles. Details per genre are in `unverified.json`.

## Questions for the lead
1. `kalevalarunosong` near-misses are filed under `folkrev`; the sub-agent was unsure that id covers Finnish folk rock. Is there a better id, or should they be dropped?
2. `amazighahwashandah` has no near-miss: the obvious neighbour, rways (Tashelhit professional troubadours), has no genre id. Should one exist?
3. `pungmul` was scoped to cover both Korean percussion (including samul nori) and Korean minyo, since `minyo` is Japanese min'yō. Is that the intended scope, or should Korean minyo be its own id?
4. Which rule for Vietnamese titles: page spelling or standard spelling?
