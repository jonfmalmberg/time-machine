# H4: Genre research, batch 2
Date 2026-11-23, branch `helper/2026-11-23-h4`. Run configured as `claude-opus-5-5` (fallbacks `claude-opus-5[1m]`, `claude-opus-4-8[1m]`; the serving model could differ and cannot be confirmed from inside the run). Sub-agents: eight research sub-agents, one per genre, all started with model `opus`, as the assignment names. I (the run) merged their files, checked the shape (one `yrs` pair per song, three markers, near-miss ids present in `nodes.json`, no email addresses) and wrote this report; I did not re-fetch their sources.

## What was asked
The next eight genres in `data/nodes.json` order with no entry in `data/defs.json`, skipping the eight in `work/2026-11-23-H3/` (no other `helper/*` branch held a `defs.add.json`): `huaer` (Hua'er), `kulintang` (Kulintang), `malhun` (Malhun), `garbaanddandiyaraa` (Garba and dandiya raas), `mahagita` (Mahagita (Burmese classical song)), `kobzardumy` (Kobzar dumy (Ukrainian epic song)), `tarantella` (Tarantella), `iraqimaqam` (Iraqi maqam). For each: a size estimate first, then a definition and a playlist in the shape of `defs.json` and `playlists.json`, each song backed by a source address, the exact supporting string and the date read. Titles in standard spelling with diacritics, page spellings as `alias`; neighbours with no id named, not stretched.

## What is in this folder
- `defs.add.json`: eight new `defs.json` entries, one per line.
- `playlists.add.json`: eight new `playlists.json` entries, one per line.
- `sizes.json`: genre id → low, high, core, basis, confidence.
- `sources.json`: genre id → list of sources (kind def/size/fit/near/song/album, artist, title, address, exact string, date read, optional note).
- `unverified.json`: genre id → `alias` (title used in the entries → spelling on the source page) and `unverified` (things recalled or half-seen but not confirmed, and fetch failures).
- `REPORT.md`: this file.

## What was found
| Genre | Status | Songs | Albums | Fits | Near | Fold | Size (low–high, core) |
| :- | :- | -: | -: | -: | -: | :- | :- |
| `huaer` | none | 5 | 1 | 4 | 1 | – | 200–2000, 15 |
| `kulintang` | full | 19 | 6 | 4 | 1 | – | 300–1500, 15 |
| `malhun` | none | 0 | 1 | 0 | 0 | – | 300–3000, 40 |
| `garbaanddandiyaraa` | full | 14 | 6 | 4 | 2 | – | 3000–20000, 40 |
| `mahagita` | full | 20 | 4 | 4 | 1 | – | 300–3000, 40 |
| `kobzardumy` | full | 18 | 4 | 4 | 1 | – | 150–600, 20 |
| `tarantella` | full | 15 | 11 | 4 | 1 | – | 1000–5000, 30 |
| `iraqimaqam` | full | 18 | 6 | 4 | 2 | – | 800–4000, 50 |

All size estimates are low confidence: no source counts recordings for any of these traditions, so each range is a judgement stated with its basis in `sizes.json`.

### Confidence, per genre

**`huaer`.** Confidence is low to medium. The definition is well supported (UNESCO, ihchina, QQ Music wiki on Ming origin and Linxia, Smithsonian Folklife, Wikipedia Music of Qinghai), but recordings are hard to verify: hua'er lives at festivals and on regional discs that Discogs and Western catalogues barely list. The one solid release is Naxos World's Folk Music of China Vol. 1 (2019), which a review ties to hua'er and whose performers include national inheritor Ma Jinshan; its three 'ling' tracks are tied to hua'er only by inference from UNESCO's note that tunes are named after peoples. Su Ping's 大眼睛 (1984) and Gong Linna's 上去高山望平川 (2008) are trained-voice stage versions with weak genre ties (a video title, a consumer ranking site). So the status is 'none' with the album as the way in, and no fold, since no id covers northwest Chinese folk song: northwestwind is 1980s rock-pop that drew on it, longsong is Mongolian, and there is no Shaanbei xintianyou or general Han Chinese folk-song id. The near-miss uses guoyue for a 1979 instrumental arrangement of 花儿与少年; if the lead thinks that stretches guoyue, drop it. Every quote passed through the WebFetch summariser (raw fetch of Wikipedia was refused by the proxy), so quotes must be rechecked against the pages.

**`kulintang`.** Medium confidence in the songs, low in exact quote strings. Every track and album was seen on a fetched page (Discogs API, Smithsonian Folkways liner PDFs, CREM-CNRS, the Concertzender playlist, UP ethnomusicology shop), and each is tied to kulintang by its album or by the page; but direct downloads were blocked by the proxy, so all strings came through a summarising fetch tool and must be re-checked. The playlist leans heavily on Danongan Kalanduyan's Palabuniyan ensemble (Folkways 2021) and the World Kulintang Institute (1994), both Maguindanao diaspora groups in the US, because those are the only releases with clear, stable track titles; three Maranao tracks come from the Lyrichord Lanao LPs with no named performers, and the artist label for them is descriptive, not a credit. Tausug/Sulu, Sama-Bajau and Borneo/Sulawesi kulintangan are in scope per the brief but no tracks were verified for them, so the playlist is Maguindanao/Maranao only. Pieces are modes and dances, so titles repeat (Binalig, Duyog, Sinulog). Neighbours with no id: diaspora kulintang fusion (Kulintang Arts, Pantayo, disc 2 of Kulintang Kultura), other Lumad/T'boli gong music of Mindanao, and Sabah kulintangan; gamelan is the only near-miss used. 'Inandang Sarunai' is a 1964 field recording dated by its 2015 reissue.

**`malhun`.** Confidence in the definition is medium (Wikipedia English and French, and the UNESCO 2023 inscription agree on dialectal Arabic sung poetry, the harba refrain and the lute/violin/rebab/drum ensemble), but the recording side is a failure: within the 40-call budget no page tied a named, existing recording to malhun, so fits, near and the playlist are empty and the status is 'none'. The only album listed is a 2012 Rough Guide compilation that its Wikipedia page says features malhun, without saying which track, so it is weak. The genre's recordings mostly sit on Moroccan cassettes, radio archives and streaming uploads that are poorly catalogued in English or French; a second pass should try Arabic-script searches (الملحون), Discogs via api.discogs.com, and Moroccan streaming or label pages for Toulali, Bensouda, Guennoun and Lamdaghri. Origin dates conflict: English Wikipedia gives the 15th century in Tafilalt, French Wikipedia says the poetry reached the imperial cities in the 13th century. Neighbours all have ids (andalusi, morchaabi, algchaabi); no fold is set, since andalusi itself has no playlist and folding to morchaabi is a lead decision. All quotes came through a fetch tool that extracts text with a model and caps quotes at 125 characters, so each must be machine-checked.

**`garbaanddandiyaraa`.** Confidence is medium on scope and low-to-medium on the song list. Scope: traditional Gujarati garba, garbi and dandiya raas songs sung for Navratri, including the commercial Gujarati non-stop garba albums and Falguni Pathak's Gujarati garba songs (Indhana Winva, Vasaladi, Odhni Odhu), because they are the same songs re-recorded for the same dance. Two neighbours are kept out: Bollywood film garbas (Nagada Sang Dhol, Ram-Leela 2013) go to filmi, and Falguni Pathak's Hindi pop singles (Yaad Piya Ki Aane Lagi, 1998) go to indianpop, which covers non-film Hindi pop 1981-2005. There is no id for Gujarati folk, devotional bhajan or Gujarati film song, so those were not stretched to another id. Fourteen songs are tied to garba by a cited page, but the evidence is mostly listicles (hindutone, Pinkvilla, LatestLY) and last.fm/MusicBrainz track rows, not label or archive catalogues. Release years are missing for most single tracks. Wikipedia could only be read through a summarising tool, so quotes still need checking by script. Many famous versions (Hemant Chauhan, Praful Dave, Kirtidan Gadhvi) could not be tied to a specific release and are in unverified. Titles are romanised Gujarati as spelled on the source pages and have not been normalised; no standard romanisation exists, and the lead may want Gujarati script added.

**`mahagita`.** Medium-low confidence. The genre itself is well defined by Wikipedia, Garfias (UMBC) and the UNESCO notes, but recorded, nameable songs are concentrated on one performer: 18 of the 20 songs are the harpist Inle Myint Maung (17 with the singer Yi Yi Thant), from the Smithsonian Folkways album (9 tracks, credited by English titles; Burmese titles only confirmed for tracks 5 and 8), two FolkCloud kyo tracks tagged mahagita, and eight thachingan files hosted on ibiblio whose release is only inferred; the other is Tin Tin Mya's 'Pan Myaing Le' (named a Mahagita classic on Wikipedia, no year). Status is 'full' by count, but the playlist is narrow in voice and some ibiblio tracks may duplicate Folkways ones under other titles. Scope: the vocal court repertoire (with harp or chamber accompaniment); hsaing waing orchestra music is kept under `hsaingwaing` and used for the near-miss. Burmese romanisation has no single standard, so titles are kept as each page spells them. The piano (sandaya) and pattala strands of mahagita have no id and no verified tracks; the Thai influence (`thaiclass`) has no cited near-miss here. Song dates are release years; composition dates are unknown for every song. All quotes came through WebFetch's processed rendering (short extracts), so the exact-string check may need relaxing. Wikipedia, Discogs and MusicBrainz could not be read raw.

**`kobzardumy`.** Medium confidence for the recordings, low for the size estimate. Twelve of the eighteen songs are the 1908–1910 phonograph cylinders of real kobzari and lirnyky (Kolessa, Slastion, Kvitka with Lesia Ukrainka), read from a mirror of the Wikimedia Commons collection page because Commons itself would not load; they are archive files of poor sound quality, not commercial releases, and the quotes are table rows read through a summarising fetch tool with cell breaks turned into spaces. The six modern tracks come from Smithsonian Folkways/UNESCO, a Ukrainian shop page and a Belgian library catalogue; the Kushpet and UNESCO tracks say 'Duma' in the title, while the three Kytasty tracks are tied to dumy at album level (review, catalogue) and matched by subject, which is my identification. Titles are printed as the sources print them: the archive ones in the Latin-letter Ukrainian transliteration Commons uses (close to the 2010 national standard, with the soft sign dropped), the modern ones in the English the labels use; I did not reconstruct Cyrillic titles I had not seen. The brief's Veresai recordings and a 'Kharkiv 1908' expedition were not confirmed (see unverified). The natural neighbours, non-duma kobzar repertoire (psalms, satirical songs such as 'Khoma and Yarema') and Ukrainian village folk song, have no id in the tree; the only near-miss used is a Russian bylina under russfolk, and neither balkanfolk nor byzantine got a sourced near-miss. Named revival kobzari (Kompanichenko, Fedynsky, Drach) have no confirmed track list, which is the main gap.

**`tarantella`.** Confidence medium for the definition and the playlist, low for the size. Scope: southern Italian folk dance music of the tarantella family as played and recorded from village tradition and its revival: Salento pizzica, Campanian tammurriata, Calabrian tarantella, the Montemaranese tarantella of Avellino and Gargano tarantellas, plus Italian-American dance-orchestra tarantellas. Concert tarantellas by Chopin, Liszt and Rossini are outside scope; Chopin's Op. 43 is used as the near-miss because a fitting id exists (`romantic`). Neighbours: `napoletana` (Canzone napoletana) exists but is composed sentimental song, not this dance music, so no track was stretched to it; there is NO id for the Italian folk revival (NCCP, Canzoniere Grecanico Salentino, Officina Zoè, Taranta Power), and `folkrev` is the North American singer-songwriter revival, so these revival bands are kept inside `tarantella`, which is where their pizziche and tammurriate belong. All 15 songs come from track lists on label, archive or retailer pages (Smithsonian Folkways, Apple Classical, Ponderosa, WOMEX, debaser.it, Proper Music), each tied to the genre by its title or by the page text; however every quote was read through WebFetch's summariser (raw fetches were blocked by the proxy), so the exact strings need the checking script. Shortfalls: several release years unknown (yrs null), no first-hand page tied tracks by Uccio Aloisi, Alla Bua or the Notte della Taranta to the genre, the 1600 start is not backed by a fetched page, and one album title (Folkways FE 4265) was taken from its page address.

**`iraqimaqam`.** Medium confidence in the songs, low in the size estimate. Definition rests on Wikipedia and the UNESCO listing (santur, jawzah/joza, dumbak, daff; qāri' and tshalghi; inscribed 2008), and every playlist track was seen on a label, archive, retailer, MusicBrainz or Folkways page that ties it to Iraqi maqam; most quotes came through a page-summarising fetch tool or the MusicBrainz/Discogs JSON, so punctuation may differ slightly. Four Husayn al-A‘dhami items rest on a fan archive blog, the weakest source here. Transliterations vary wildly between releases (Makam/Maḳām/Maqâm), so I normalised the Yusuf Omar titles to Maqām with macrons and kept the page spellings in alias; the Hamid Al-Saadi, Farida and A‘dhami titles keep the page spelling except straight apostrophes for curly ones and plain hyphens. Release years are release dates; most Yusuf Omar recordings predate their 1995 issue. Scope: Baghdad maqam with chalghi, plus one Basrah-style Mukhalif from Folkways to show the regional variant. Nazem al-Ghazali's Fog El Nakhal is a near-miss pointing at iraqipastasong, which exists as its own id (the pesteh); Munir Bashir's oud taqsim points at arabclass. Modern maqam-jazz crossover (Amir ElSaffar) has no fitting id and was not stretched to one. Fell short: no Muhammad al-Qubanchi track with an Arabic title, no Salima Murad or Nazem al-Ghazali maqam recording, and the 1600 start date has no source.

## Sources
One line per distinct address; the full list with the exact strings is in `sources.json`.

### `huaer`
- None: Hua'er (UNESCO Representative List). <https://ich.unesco.org/en/RL/hua-er-00211>
- None: 花儿 (QQ Music wiki). <https://wiki.y.qq.com/i/c8s4d363deapfpf2m4pg>
- None: Hua'er: The blossoming folk songs of northwest China (Shanghai Daily). <https://archive.shine.cn/feature/Huaer-The-blossoming-folk-songs-of-northwest-China/shdaily.shtml>
- None: Music of Qinghai (Wikipedia). <https://en.wikipedia.org/wiki/Music_of_Qinghai>
- None: Hua'er folksong (Smithsonian Folklife Festival 2014). <https://festival.si.edu/2014/china/huaer-folksong/smithsonian>
- None: 花儿 (ihchina.cn, national ICH project page). <https://www.ihchina.cn/art/detail/id/9918.html>
- None: 花儿 (ihchina.cn). <https://www.ihchina.cn/huaer.html>
- None: When melody blooms (China Daily, 2013). <https://europe.chinadaily.com.cn/life/2013-02/01/content_16193206.htm>
- Various Artists: Folk Music of China, Vol. 1: Folk Songs of Qinghai and Gansu. <https://www.europadisc.co.uk/classical/143476/Folk_Music_of_China_Vol.1:_Folk_Songs_of_Qinghai_and_Gansu.htm>
- Various Artists: Folk Music of China, Vol. 1: Folk Songs of Qinghai and Gansu. <https://songlines.co.uk/review/folk-music-of-china-vol-1-folk-songs-of-qinghai-and-gansu>
- Various Artists: Folk Music of China, Vol. 1: Folk Songs of Qinghai and Gansu. <https://gapplegatemusicreview.blogspot.com/2019/12/folk-music-of-china-vol-1-folk-songs-of.html>
- 苏平: 大眼睛. <https://api.discogs.com/releases/14657700>
- 龚琳娜: 上去高山望平川. <https://api.discogs.com/releases/9561325>
- None: 上去高山望平川. <https://www.maigoo.com/top/421661.html>
- 中央乐团小乐队, 孙丰: 花儿与少年. <https://api.discogs.com/releases/19112131>

### `kulintang`
- None: Kulintang. <https://en.wikipedia.org/wiki/Kulintang>
- None: Kulintang. <https://folkways-media.si.edu/docs/folkways/artwork/SFW40593.pdf>
- None: Kulintang. <https://folklife.si.edu/magazine/kulintang-kultura-filipino-musical-musings-american-meanings>
- None: Kulintang. <https://folkways-media.si.edu/docs/folkways/artwork/FW04536.pdf>
- None: Kulintang. <https://shorefire.com/releases/entry/kulintang-kultura-danongan-kalanduyan-and-gong-music-of-the-philippine-diasporato-be-released-10-1-on-folkways>
- None: Recorded from the 1950s. <https://api.discogs.com/releases/7666728>
- Danongan Kalanduyan and the Palabuniyan Kulintang Ensemble: Binalig I. <https://api.discogs.com/releases/20905432>
- World Kulintang Institute: Tagonggo. <https://api.discogs.com/releases/9070051>
- Steven W. Otto and Usopay H. Cadar (recordists): Muranao Kakolintang: Philippine Gong Music From Lanao, vol. 2 (album). <https://archives.crem-cnrs.fr/archives/collections/CNRSMH_E_1983_011_004/>
- Pura Paku Alaman Palace Orchestra: Ketawang: Puspawarna. <https://en.wikipedia.org/wiki/Contents_of_the_Voyager_Golden_Record>
- Danongan Kalanduyan and the Palabuniyan Kulintang Ensemble: Kapamalong-malong Dance Music II. <https://www.songlines.co.uk/review/kulintang-kultura-danongan-kalanduyan-and-gong-music-of-the-philippine-diaspora>
- Maranao kolintang players (Lanao): Kasinolog. <https://www.concertzender.nl/?p=764444>
- Amal Lumuntod: Kulintang Solo. <https://api.discogs.com/releases/10907119>
- Samaon Sulayman, Amal Lumuntod and others: Kulintang and Kudyapiq: Gong Ensemble and Two-string Lute among the Magindanaon in Mindanao, Philippines. <https://upethno.upd.edu.ph/shop/kulintang-and-kudyapiq-gong-ensemble-and-two-string-lute-among-the-magindanaon-in-mindanao-philippines>
- Various: Ang Mga Kulintang Sa Mindanao At Sulu. <https://api.discogs.com/releases/14410646>
- None: Discogs search 'kulintang'. <https://api.discogs.com/database/search?q=kulintang&type=release>

### `malhun`
- None: Malhun (Wikipedia). <https://en.wikipedia.org/wiki/Malhun>
- None: Malhun, a popular poetic and musical art (UNESCO ICH). <https://ich.unesco.org/en/RL/malhun-a-popular-poetic-and-musical-art-01592?RL=01592>
- None: Music of Morocco (Wikipedia). <https://en.wikipedia.org/wiki/Moroccan_music>
- None: Melhoun (Wikipédia, French). <https://fr.wikipedia.org/wiki/Melhoun>
- None: M&A CD Reviews: Anthologie de la Musique Marocaine (UMBC). <https://www2.umbc.edu/MA/index/number8/ciucci/ciucciweb.htm>
- Houcine Toulali: Houcine Toulali (Wikipedia). <https://en.wikipedia.org/wiki/Houcine_Toulali>
- Various Artists: The Rough Guide to the Music of Morocco. <https://en.wikipedia.org/wiki/The_Rough_Guide_to_the_Music_of_Morocco_(2012_album)>

### `garbaanddandiyaraa`
- None: Garba of Gujarat (UNESCO). <https://ich.unesco.org/en/RL/garba-of-gujarat-01962?RL=01962>
- None: Garba (dance) (Wikipedia). <https://en.wikipedia.org/wiki/Garba_(dance)>
- None: Dandiya Raas (Wikipedia). <https://en.wikipedia.org/wiki/Dandiya_Raas>
- None: Vadodara as garba hub (Business Today). <https://www.businesstoday.in/india/story/navratri-2026-free-entry-at-united-way-garba-atul-purohit-to-perform-as-vadodara-eyes-guinness-world-record-559908-2026-10-07>
- None: Atul Purohit (Sulekha). <https://events.sulekha.com/buzz/blog/atul-purohit-the-legendary-voice-of-traditional-garba>
- None: Ramzat series (hindutone). <https://hindutone.com/festivals/navratri/top-gujarati-garba-songs-2026-traditional-trending-playlist/>
- Aishwarya Majmudar & Jigardan Gadhavi: Rangtaali 2 - Non Stop Garba. <https://www.last.fm/music/Aishwarya+Majmudar+&+Jigardan+Gadhavi/Rangtaali+2+-+Non+Stop+Garba>
- Atul Purohit: Tara Vina Shyam. <https://last.fm/music/Atul+Purohit/+tracks>
- Bhoomi Trivedi: Maa Taro Garbo. <https://mb.videolan.org/recording/b7f35915-d734-4357-b711-b78fee2fb226>
- Falguni Pathak: Indhana Winva. <https://www.pinkvilla.com/cinema/navratri-2025-songs-playlist-7-best-falguni-pathak-garba-tracks-1397115>
- Falguni Pathak: Vasaladi. <https://en.wikipedia.org/wiki/Falguni_Pathak>
- Maniraj Barot: Sanedo Sanedo Laal Sanedo. <https://www.latestly.com/lifestyle/festivals-events/navaratri-songs-in-gujarati-traditional-dandiya-numbers-for-garba-enthusiasts-to-celebrate-navratri-2018-watch-videos-422768.html>
- Purushottam Upadhyay: Garba Raas Ni Ramzat. <https://www.ebay.com/itm/146569191503>
- Various Artists: Raas Garba Gujarati. <https://uk.rarevinyl.com/products/various-bollywood-raas-garba-gujarati-indian-vinyl-lp-album-record-eclp8412-858945>
- Asha Bhosle: Asha Bhosle Garba Collection. <https://www.jiosaavn.com/album/asha-bhosle-garba-collection/hqTnnebHst0_>
- Shreya Ghoshal: Nagada Sang Dhol. <https://en.wikipedia.org/wiki/Goliyon_Ki_Raasleela_Ram-Leela>

### `mahagita`
- None: Mahagita (Wikipedia). <https://en.wikipedia.org/wiki/Mahagita>
- None: The Maha Gita (Garfias, UMBC). <https://www2.umbc.edu/eol/garfias/mahagita.html>
- None: Myanmar: Music by the Hsaing Waing Orchestra / The Burmese Harp (UNESCO liner notes). <https://folkways-media.si.edu/docs/folkways/artwork/UNES08281.pdf>
- Inle Myint Maung & Yi Yi Thant: Mahagitá: Harp and Vocal Music of Burma. <https://propermusic.com/products/inlemyintmaungandyiyithant-mahagitharpandvocalmusicofburma>
- Inle Myint Maung & Yi Yi Thant: Mahagitá: Harp and Vocal Music of Burma. <https://lib.ecu.edu/catalog-preview/catalog/5295235>
- Inle Myint Maung & Yi Yi Thant: Mahagitá: Harp and Vocal Music of Burma. <https://folkways.si.edu/inle-myint-maung-and-yi-yi-thant/mahagita-harp-and-vocal-music-of-burma/world/album/smithsonian>
- Inle Myint Maung & Yi Yi Thant: A huntsman enchanted. <https://folkways.si.edu/mahagita-harp-vocal-burma/world/music/article/smithsonian>
- Inle Myint Maung & Yi Yi Thant: A huntsman enchanted. <https://www.nts.live/artists/77030-inle-myint-maung>
- Inle Myint Maung: Minn Lann Sut Kar (Kyo). <https://folkcloud.com/song/973/inle-myint-maung/minn-lann-sut-kar-kyo>
- Inle Myint Maung: Phone Daw Yaung Phyar (Kyo). <https://folkcloud.com/folk-music-by-country/myanmar>
- Inle Myint Maung: Mahagita By Burmese Harp, Vol. 3. <https://www.last.fm/music/Inle+Myint+Maung/Mahagita+By+Burmese+Harp,+Vol.+3>
- None: Burmese Classical Songs (ibiblio). <https://www.ibiblio.org/csloane/Thachinkan.htm>
- Tin Tin Mya: Pan Myaing Le. <https://en.wikipedia.org/wiki/Tin_Tin_Mya>
- Various Artists: Music of Burma: The Muriel Williamson Collection, Volume 12. <https://www.niu.edu/burma/collections/music.shtml>
- Hsaing waing orchestra of Master Sein Tin Htay: The seven dances. <https://folkways.si.edu/news-and-press/unesco-collection-week-58-lyric-epic-and-everyday-life-in-myanmar-and-ethiopia>

### `kobzardumy`
- None: Duma (epic) (Wikipedia). <https://en.wikipedia.org/wiki/Duma_(epic)>
- None: Duma (Encyclopedia of Ukraine). <https://www.encyclopediaofukraine.com/pages%5CD%5CU%5CDuma.htm>
- None: Preservation of kobzar music (Wikipedia). <https://en.wikipedia.org/wiki/Preservation_of_kobzar_music>
- None: Filaret Kolessa phonograph cylinder collection (Commons mirror). <https://download.osmand.net/wiki/Filaret_Kolessa_phonograph_cylinder_collection>
- None: Kobzar (Wikipedia). <https://en.wikipedia.org/wiki/Kobzar>
- F. Jarko: Duma about Marussia of Bohuslav. <https://folkways.si.edu/ukraine-traditional-music/world/music/album/smithsonian>
- Volodymyr Kushpet: Duma about Khvedir bezrodnyi. <https://umka.com/eng/catalogue/bandura-kobza-etc/volodymyr-kushpet-the-performance-tradition-of-ukrainian-folk-musicians-of-18th-the-beginning-of.html>
- Julian Kytasty: Captive’s Lament. <https://folkways.si.edu/julian-kytasty/songs-of-truth>
- Julian Kytasty: Captive’s Lament. <https://worldmusiccentral.org/?p=109751>
- Julian Kytasty: The widow and her three sons. <https://www.pointculture.be/album/MU9615>
- Ivan Ivanovich Chuprov: Dobrynya Nikitich and Alyosha Popovich. <https://www.trad-culture.ru/en/article/new-source-study-ust-tsilma-bylinas-russian-heroic-epics-1975-recording-ivan-ivanovich>

### `tarantella`
- None: Tarantella (Wikipedia). <https://en.wikipedia.org/wiki/Tarantella>
- None: Pizzica (Wikipedia). <https://en.wikipedia.org/wiki/Pizzica>
- Canzoniere Grecanico Salentino: Canzoniere Grecanico Salentino (Wikipedia). <https://en.wikipedia.org/wiki/Canzoniere_Grecanico_Salentino>
- None: Tammurriata di Scafati: Bum! (Proper Music). <https://propermusic.com/collections/felmay/products/tammurriatadiscafati-bum>
- None: Calabria Bella, Dove T'hai Lasciate? (Folkways FES 34042 notes). <https://folkways-media.si.edu/docs/folkways/artwork/FW34042.pdf>
- None: Folk Music from Italy (Smithsonian Folkways). <https://folkways.si.edu/folk-music-from-italy/world/album/smithsonian>
- None: Calabria (Cultural Equity, Lomax/Carpitella 1954). <https://www.culturalequity.org/album/calabria>
- L'Arpeggiata, Christina Pluhar, Lucilla Galeazzi, Marco Beasley: La Tarantella: Antidotum Tarantulae (album). <https://classical.music.apple.com/ca/album/1572067397>
- Canzoniere Grecanico Salentino: Pizzica De Sira. <https://ponderosa.it/en/?p=1385>
- Canzoniere Grecanico Salentino: Pizzica indiavolata (album). <https://www.womex.com/virtual/canzoniere_grecanico/canzoniere_grecanico/pizzica_indiavolata>
- Officina Zoè: Pizzicarella. <https://en.debaser.it/officina-zoe/terra/review>
- Officina Zoè: Sangue Vivo. <https://sonicbids.com/band/officinazoe>
- Nuova Compagnia di Canto Popolare: Tarantella ca nun va 'bbona (album). <https://en.debaser.it/nuova-compagnia-di-canto-popolare/tarantella-ca-nun-va-bbona/review>
- Eugenio Bennato: Taranta power. <https://en.wikipedia.org/wiki/Eugenio_Bennato>
- Field recording, Capri (Alan Lomax): Tarantella from Capri: Amore ca ce Struje. <https://folkways.si.edu/italian-folk-music-vol5-naples-and-campania/world/album/smithsonian>
- Field recording, Capri (Alan Lomax): Tarantella from Capri: Amore ca ce Struje. <https://folkways-media.si.edu/docs/folkways/artwork/FW04265.pdf>
- Salvatore Ida and his Orchestra: A Mala Mugghieri (The Bad Wife) - Tarantella Calabrese. <https://folkways.si.edu/festa-italiana-songs-and-dances/world/music/album/smithsonian>
- Alfred Cortot: Tarantelle, Op. 43 (Chopin). <https://adpprod1.library.ucsb.edu/index.php/matrix/refer/700007647>

### `iraqimaqam`
- None: Iraqi maqam (Wikipedia). <https://en.wikipedia.org/wiki/Iraqi_maqam>
- None: Iraqi Maqam (UNESCO). <https://ich.unesco.org/en/RL/iraqi-maqam-00076>
- None: Maqam Al-Iraq (Rough Trade). <https://shop.roughtrade.com/products/maqam-al-iraq>
- None: Muhammad al-Qubanchi (Wikipedia). <https://en.wikipedia.org/wiki/Muhammad_al-Qubanchi>
- Muhammad al-Qubanchi: Microtones: The Piano and Muhammad Al-Qubanshi (Qatar Digital Library). <https://www.qdl.qa/en/microtones-piano-and-muhammad-al-qubanshi-–-first-congress-arabic-music-and-early-recordings-iraq>
- Yusuf Omar: Iraq: Makamat (album). <https://archives.crem-cnrs.fr/archives/collections/CNRSMH_E_1975_007_003>
- Yusuf Omar: Iraq: Makamat. <https://allnightflightrecords.com/products/ensemble-al-tchalghi-al-baghdadi-yusuf-%e1%bd%80mar-iraq-makamat>
- Yusuf Omar: Iraq: Makamat (recording year). <https://www.allmusic.com/album/irak-les-maqams-de-bagdad-iraq-the-maquams-of-baghdad-mw0000957078>
- Hamid Al-Saadi: Maqam Al-Iraq (album). <https://www.popmatters.com/hamid-al-saadi-maqam-al-iraq>
- Farida & The Iraqi Maqam Ensemble: Classical Music of Iraq (album). <https://en.wikipedia.org/wiki/Farida_Mohammad_Ali>
- Farida & The Iraqi Maqam Ensemble: Classical Music of Iraq. <https://propermusic.com/products/faridatheiraqimaqamensemble-classicalmusicofiraq>
- Husayn al-A‘dhami: Maqam Urfa and Dishdasha Subgh il Nil. <https://iraqimaqam.blogspot.com/2009/03/maqam-urfa-and-peste-dishdasha-subgh-al.html>
- Yusuf Omar: Iraqi Maqâm, Baghdad Tradition: A Tribute to Yusuf Omar. <https://musicbrainz.org/release/fb4f96a9-0418-49fa-8ba9-ec782e028b02>
- Hussein Al A'dhami: Maqams in Divine Enchantment. <https://felmay.it/catalogue/item.php?id=8328>
- Muhammad al-Qubbânjî and Azzûrî al-Awwâd: Congrès de musique arabe du Caire (The Cairo congress of arab music) - 1932. <https://archive.org/details/13.PsaumeDeLaTristesse>
- Nazem al-Ghazali: Fog El Nakhal. <https://jewish-music.huji.ac.il/en/content/fog-al-nakhal-multicultural-and-transnational-journeys-iraqi-folksong>
- Nazem al-Ghazali: Fog El Nakhal. <https://en.wikipedia.org/wiki/Nazem_al-Ghazali>
- Munir Bashir: Irak: L'Art Du 'Ûd = The Art Of The 'Ûd. <https://www.discogs.com/Munir-Bashir-Irak-LArt-Du-Ûd-The-Art-Of-The-Ûd/release/9032500>
- Hamid Al-Saadi: Maqam Al Sa'idi Hijaz / Habibi Rah wa Ma Janeh. <https://musicbrainz.org/release/bb471909-8357-4b37-a2b4-3beab5a1fd77>
- Farida: Maqam Saba. <https://musicbrainz.org/release/d21c7bc1-37e8-4a0f-8b6e-433fa74c6623>
- Muhammad H. Jrifani with the Mullah Adnan Ensemble: Mukhalif. <https://folkways-media.si.edu/docs/folkways/artwork/UNES08044.pdf>
- Muhammad H. Jrifani with the Mullah Adnan Ensemble: Mukhalif. <https://folkways.si.edu/news-and-press/unesco-collection-week-59-iraq-and-egypt-sounding-out-two-cultural-hubs>

## What fell short
- **Exact strings not seen raw.** In every genre the session proxy refused raw downloads of Wikipedia, Discogs and other pages, so every quote was read through a fetch tool that summarises or extracts text. The strings are what that tool returned and must be checked by the evidence script before acceptance; some may differ in punctuation, spacing or length (one tool capped quotes at 125 characters).
- **`malhun`: no recordings.** No page tied a named recording to malhun within the budget. `fits`, `near`, `intro`, `peak` are empty, status `none`, one weak album (Rough Guide to the Music of Morocco, which track is malhun not stated). Redo with Arabic-script searches (الملحون) and Discogs/label pages for Toulali, Bensouda, Guennoun, Lamdaghri. Note `defs` entries elsewhere always have fits; an empty `fits` list may need a check in the page code before merging.
- **`huaer`: weak ties.** Five songs, but status `none` because the three Naxos "ling" tracks are tied to hua'er only by inference, Su Ping's by a video title and Gong Linna's by a ranking site. The near-miss (1979 instrumental 花儿与少年 under `guoyue`) may be a stretch.
- **Narrow playlists.** `mahagita`: 18 of 20 songs are Inle Myint Maung; Folkways tracks are under English titles (Burmese names confirmed for 2 of 9); the ibiblio thachingan release is inferred from file names. `kulintang`: Maguindanao and Maranao only, mostly two US ensembles; no Tausug, Sama-Bajau, Borneo or Sulawesi tracks. `kobzardumy`: 12 of 18 are 1908–1910 cylinders read from a Commons mirror; no Veresai recording, no source for a "Kharkiv 1908" expedition, no track lists for revival kobzari.
- **Weak sources.** `garbaanddandiyaraa` songs rest mostly on listicles and last.fm/MusicBrainz rows; `iraqimaqam` has four Husayn al-A‘dhami tracks on a fan blog; `tarantella` takes one album title (Folkways FE 4265) from the page address.
- **Spelling not standard everywhere.** `mahagita` (English titles; Burmese romanisation as each page has it), `kobzardumy` (Latin transliteration as Commons gives it, no Cyrillic seen) and `garbaanddandiyaraa` (romanised Gujarati as on the pages, no Gujarati script) do not meet "standard spelling of the language"; sub-agents did not reconstruct titles they had not seen.
- **Years.** Many `yrs` are null (garba, tarantella six, mahagita); several are reissue years, not recording years. Start dates of `tarantella` (1600) and `iraqimaqam` (1600) have no source; `huaer` window says Ming (c. 1368) against the map's 1400.
- **Neighbours with no id** (not stretched): northwest Chinese / Han folk song in general (huaer); diaspora kulintang fusion, other Mindanao gong music, Sabah kulintangan (kulintang); Gujarati folk, bhajan and Gujarati film song (garba); Burmese piano (sandaya) and pattala strands (mahagita); non-duma kobzar songs and Ukrainian village folk song (kobzardumy); the Italian folk revival (NCCP, Canzoniere Grecanico Salentino, Officina Zoè), kept inside `tarantella` (tarantella); maqam-jazz crossover (iraqimaqam).

## Questions for the lead
1. `malhun` has an empty `fits` list. Should a genre with no verifiable recording keep a definition with empty `fits`, or wait until a redo finds some?
2. `huaer` has five songs but status `none` because their genre ties are weak. Keep it as `none`, or call it `thin`?
3. Where only transliterated or translated titles were seen (`mahagita`, `kobzardumy`, `garbaanddandiyaraa`), may the lead or a later run add native-script titles, with the seen spelling kept as `alias`?
4. Several neighbours have no id: Han Chinese folk song, Italian folk revival, Gujarati folk and devotional song, Ukrainian village folk song. These are questions about the tree, so they go to the owner.
5. `tarantella` holds the Italian revival bands (Canzoniere Grecanico Salentino and others) because they have no id of their own. Is that acceptable?
