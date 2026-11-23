# H7: Genre research, batch 3
Date 2026-11-23, branch `helper/2026-11-23-h7`. Run configured as `claude-opus-5-5` (fallbacks `claude-opus-5[1m]`, `claude-opus-4-8[1m]`; the serving model could differ and cannot be confirmed from inside the run). Sub-agents: eight research sub-agents, one per genre, all started with model `opus`, as the assignment names (H3: Opus for the run and for research sub-agents). I (the run) wrote their brief, merged their files, checked the shape (three markers, one `yrs` pair per song, near and fold ids present in `data/genres.json`, no email addresses) and ran `tools/check_evidence.py` over the merged sources myself; I did not re-research their choices.

## What was asked
The next eight pending genres in tree order, skipping every genre already in a `work/*/defs.add.json` on `dev` or a `helper/*` branch (the sixteen of H3 and H4). `data/nodes.json` and `data/defs.json` no longer exist on `dev` (the data moved to the new model); I took the order of `data/genres.json`, which lists the same sixteen first, and treated a genre as pending when its line has no `definition`. The eight: `pashtofolksong` (Pashto folk song (charbeta, tappa)), `bhawaiyaandbhatial` (Bhawaiya and bhatiali), `hsaingwaing` (Hsaing waing), `zapinandjoget` (Zapin and joget), `maracatu` (Maracatu), `currulao` (Currulao (Pacific marimba music)), `jota` (Jota), `hardangerfiddleand` (Hardanger fiddle and bygdedans (slåtter)). For each: a size estimate first, then a definition and a playlist in the shape of the H3/H4 hand-backs (the old `defs.json`/`playlists.json` shape), every claim backed by an address, the exact string and the date read. Titles in standard spelling with diacritics, page spellings as `alias`; missing neighbours named, not stretched.

**What this batch did differently, after the evidence check of H3/H4.** The workspace shell can fetch pages (`curl` to en.wikipedia.org returns 200), so every sub-agent was told to copy quotes from the raw page text, not from the fetch tool, to prefer JSON APIs (Discogs, MusicBrainz ws/2, iTunes lookup) and liner-note PDFs over script-loaded pages, and to run `tools/check_evidence.py` on its own sources and fix every `near`/`not found` before handing back. No sub-agent worked around a refusal (no mirrors, archives or spoofed identities).

## What is in this folder
- `defs.add.json`: eight new definition entries, one per line (window, sound, three markers, fits, near).
- `playlists.add.json`: eight new playlist entries, one per line (status, intro, peak, albums, fold, note, yrs).
- `sizes.json`: genre id → low, high, core, basis, confidence.
- `sources.json`: genre id → list of claims (kind def/size/fit/near/song/album, artist, title, url, quote, read, optional note), in the shape `tools/check_evidence.py` reads.
- `unverified.json`: genre id → `alias` (title used → spelling on the page) and `unverified` (recalled or half-seen, not confirmed; fetch failures).
- `evidence-check.json`: this run's output of `tools/check_evidence.py` over `sources.json`.
- `REPORT.md`: this file.

## What was found
| Genre | Status | Songs | Albums | Fits | Near | Fold | Size (low–high, core) | Claims |
| :- | :- | -: | -: | -: | :- | :- | :- | -: |
| `pashtofolksong` | full | 22 | 7 | 4 | 3 (`pakistanipop`, `pakistanipop`, `afghanpopularsong`) | – | 3000–30000, 40 | 57 |
| `bhawaiyaandbhatial` | full | 18 | 8 | 4 | 2 (`filmi`, `hindustani`) | – | 2000–15000, 50 | 54 |
| `hsaingwaing` | full | 20 | 5 | 4 | 2 (`mahagita`, `thaiclass`) | – | 200–2000, 25 | 58 |
| `zapinandjoget` | full | 26 | 8 | 4 | 4 (`dangdut`, `dangdut`, `iramamalaysia`, `kroncong`) | – | 2000–10000, 40 | 63 |
| `maracatu` | full | 24 | 9 | 4 | 2 (`manguebeat`, `frevo`) | – | 400–2500, 40 | 55 |
| `currulao` | full | 21 | 4 | 4 | 1 (`colombiansalsa`) | – | 1000–5000, 40 | 50 |
| `jota` | full | 27 | 9 | 5 | 2 (`romantic`, `zarzuela`) | – | 3000–12000, 40 | 78 |
| `hardangerfiddleand` | full | 24 | 7 | 4 | 2 (`romantic`, `nordicjazz`) | – | 2000–10000, 40 | 54 |

**Evidence check** (run by me after merging, one retry for two MusicBrainz pages that had answered HTTP 503): 469 claims, **467 found**, 0 near, 0 not found, 2 no page. The two `no page` are one page, the UCSB Discography of American Historical Recordings entry for Halvor Bråthen's 1928 "Springar" (`hardangerfiddleand`), which refuses scripts (HTTP 403); it was read with the fetch tool and both claims carry the note "read with fetch tool, not raw". Every other quote was copied from raw page text. Against 89% confirmed among readable pages in H3/H4, this batch is at 100% of readable pages.

All eight playlists came out `full`, but the checker proves only that each quoted string is on its page: that the page names the recording, not that it is streamable or that the genre tie is sound. The genre tie is weakest where noted below (shop catalogue for bhawaiya/bhatiali, label notes for the Pashto singles). Playability on streaming services was not checked for any genre. All size estimates are low confidence: no source counts recordings for any of these traditions.

### Confidence, per genre
**`pashtofolksong`.** Medium confidence in the definition, low-to-medium in the song list. The forms (two-line tappa with a shorter first line, fast chorus-answered charbeta, rubab and mangai accompaniment) come from Wikipedia's Pashto music article. Al Jazeera's "Queen of Pashtun tappay (folk songs), Zarsanga" and Wikipedia's Zarsanga article back them up. The Express Tribune gives the 1930s disc start and the Peshawar cassette industry. Every song is a track row on a Discogs API release page, read raw, and all 57 quotes were confirmed by the checker. Discogs and MusicBrainz cover the genre poorly, so the list is narrow. 10 of the 22 songs are Zarsanga's: seven from her 1993 Long Distance album, two from Music Village's Halla-Gulla! (1995) and one from the Radio City "Folk Songs of Pakistan" CD (2006). Four are Gulnar Begum HMV singles with no year. On those singles the only evidence that the tracks are folk and not film songs is the label note "Pushto Basic"/"Pashto songs" and Discogs' folk genre tag, and no source names them as tappa. The Afghan side is field and teahouse recordings: Sakata 1966 (Lyrichord 1971), Bhattacharya 1970 (Argo 1972), Ten Hoopen (Folkways 1977) and Slobin 1968 (Traditional Crossroads 2003). For several of these the artist label is descriptive or names the recordist, not a credited singer. No titled charbeta recording was found. The only one seen is an untitled Peshawar 78, listed in unverified. So the third marker is supported by Wikipedia but by no track in the playlist. Romanised Pashto has no standard spelling, so titles are kept as printed. The 1600 start year has no source.

**`bhawaiyaandbhatial`.** Medium confidence in the definition, medium-low in the song list. The definition rests on English Wikipedia (Bhawaiya, Bhatiali) and Banglapedia (Bhawaiya, Bhatiyali, Abbasuddin Ahmed), which agree on the two strands: bhawaiya of Rangpur, Cooch Behar and Goalpara (cart drivers, buffalo herders, separation; slow drawn-out songs and skipping chatka songs; dotara) and bhatiali, the boatmen's song of the delta with long-drawn notes. Every quote was copied from raw page text or the iTunes Search API JSON, and the checker finds all 54. The weak point is how songs are tied to the genre: only three are named on an encyclopedia page ('oki gariyal bhai' and 'fande pariya baga kande re' on Banglapedia, 'Amay bhashaili re' on Wikipedia); the other fifteen are tied by the title of the album or single they appear on (banglanatak's Bhawaiya and Bhatiyali VOL 1-3, Bhawaiya Gaan 1986, Bhawaiya 1997 and 2003, Bhawaiya & Chotka Gaan, Saregama's 'Bengali Bhatiali' single), with release data from iTunes, which is a store catalogue rather than an archive. Release years are those of the digital or compilation release; most original 78 and radio dates are unknown, so the 1930s-50s golden age is represented only by Kamala Jharia (1934) and Abbasuddin Ahmed (via a 2004 compilation). The playlist leans bhawaiya 11 to bhatiali 7. Bengali romanisation has no standard, so titles are spelled as each release spells them; the lead may want Bengali script added. Mustafa Zaman Abbasi appears under two credits ("Mustafa Jaman Abbasi" on the Bengal Foundation EP) and is kept as credited.

**`hsaingwaing`.** Medium confidence for the definition and the playlist, low for the size. The definition rests on Wikipedia (first pictured in the 1600s; drum circle, gong circle, hne oboe, si and wa; the five ensemble types for theatre, puppets, nat rites, anyeint and celebrations), Garfias (UMBC), Chiarofonte's Cini listening guide and Jacques Brunet's UNESCO notes, all read raw. All 20 songs come from track lists on four issued releases, read raw from the Discogs API and the UNESCO liner PDF: the Okkalapa North orchestra of Master Sein Tin Htay (UNESCO/Auvidis, recorded 1977, issued 2001; 5 tracks), Kyaw Kyaw Naing's Shanachie album (1998; 5), the Seven Seas Tokyo session led by U Ko Oo on pat waing (1992; 6) and the hsaing waing side of Ocora's "Birmanie: Musique d'art" (1981; 4). Each release names hsaing waing in its title or credits, except the Shanachie album. That one is tied through its performer, called a hsaing waing musician and pat waing master on Wikipedia, so that tie is my identification. Kept apart from `mahagita`: the near-miss is the Inle Myint Maung harp-and-voice Folkways disc, and the Seven Seas sung tracks that may be classical songs were left out. `thaiclass` (Fong Naam piphat) is the second near-miss, because Wikipedia names the absence of a drum circle as the difference. Titles are the romanisations each release prints (French-style on Ocora), with the full page strings as aliases. No Burmese-script title was found. Dates are release years. Every piece is traditional, so no composition year is given.

**`zapinandjoget`.** Medium confidence in the songs, high in the quote strings, low in the size. Every song, album, fit and near-miss was read from raw JSON (Discogs API, and MusicBrainz for two Sudirman and Sanisah Huri tracks), and every definition line from raw Wikipedia, the EOL review of Folkways vol. 11 and the Folkways liner-note supplement PDF; all quotes were copied from the raw text and the checker found all 63. What ties a track to the genre is mostly the label itself: Malaysian dance-music LPs mark each track "(Zapin)", "(Joget)" or "(Jaget)" (Fadzil Ahmad's Kumpulan Asli Kuala Lumpur 1978, Orkes Kamariah Nor 1974, Kumpulan Ahmad Yusoh 1983), the Folkways album files its first four tracks under "Zapin", and the pop-era songs carry "Joget" or "Zapin" in the title, which is how the Malay industry names a song's rhythm. Two judgement calls: the Folkways "Ronggeng" tracks from Medan and Bengkalis are counted as joget (the supplement treats "RONGGENG / JOGET" as one subject and Discogs credits one group as "Jogèt Musicians"), and Sri Mersing/Serampang Laut by the mak yong troupe were left out. The playlist mixes field recordings from Riau and Sumatra, Malaysian dance orchestras and a few pop-era singers (P. Ramlee, Sanisah Huri, Sudirman, Siti Nurhaliza); Siti Nurhaliza's 1997–2000 tracks sit on the border with irama Malaysia, so only three were used. Playability on streaming services was not checked: many of these are Malaysian LPs and 78s (Hassan Lahzah 1931). The map start of 1600 is not supported by any source read: English Wikipedia puts zapin's arrival around the 14th century and joget in the colonial era. The window gives both.

**`maracatu`.** Medium confidence in the songs, medium in the definition, low in the size. Every track and album was read from a raw JSON page (Discogs API release/master records, MusicBrainz web service) and each is tied to maracatu by its album or group name or by a page (English Wikipedia names Estrela Brilhante, Leão Coroado and Porto Rico as well-known nações; WOMEX calls Siba a master of "ciranda and maracatu"). The definition rests on English and Portuguese Wikipedia (instruments, call-and-response form, baque virado vs baque solto, first written record 1711, which fits the tree's start 1700). The playlist leans on the urban baque virado nations' own self-released CDs (Estrela Brilhante 2002, Leão Coroado 2004, Porto Rico 2004) and on Nação Pernambuco, a stage group that Wikipedia says is "not a traditional maracatu" but carried the genre abroad in the 1990s. Rural maracatu (baque solto) has four tracks: two groups from the Maracatu Atômico compilation (recorded June 2000), Mestre Salustiano and Siba; it is under-represented against the dozens of rural groups. Claudionor Germano's two composed carnival maracatus (maracatu-canção, 2000) stand for the songwriter tradition; nothing older than 1993 was verified, so radio-era recordings (Capiba, Nelson Ferreira) are only listed as unverified. Titles keep Discogs' title case; only "Calunga de Cera" drops the page's "- Baque-Virado" suffix (alias recorded). Release years are missing for three compilations/albums (Maracatu Atômico, Inventário Sonoro, Baque Forte), so five songs have null years. Size is a judgement from group counts, not from any catalogue count.

**`currulao`.** Medium-to-good confidence in the definition and the core of the playlist, low in the size. The definition rests on the Smithsonian Folkways liner notes to Grupo Naidy's *¡Arriba Suena Marimba!* (SFW 40514, by Michael Birenbaum Quintero; read raw as a PDF), which describe the chonta marimba, the two bombos, the cununos, the guasá and the cantadoras, and say currulao is strictly the marimba gathering at which several genres (bambuco viejo, pango, patacoré, juga, bunde) are played; Spanish Wikipedia ("Currulao", also called bambuco antiguo, Colombia's Pacific and Esmeraldas) and English Wikipedia's Music of Colombia agree. Eleven of the 21 songs come from that one Folkways album. Its track notes tie each track to a genre, and several are jugas or bundes rather than a currulao proper. They are kept because the tree's name is "Pacific marimba music". The unaccompanied canto de boga "Oí, ve" is left out. Canalón de Timbiquí (*De mar y río*, 2019, Latin Grammy-nominated folk album; four tracks from the MusicBrainz track list) and Grupo Bahía (*Pura chonta recargado*, 2008; two tracks) are more produced but are still marimba-based. Papá Roncón gives four tracks for the Ecuadorian side. His album has no year on any page read. Most of the size is guesswork: no catalogue counts these recordings, and the scene is festival-driven (Petronio Álvarez, Cali, since 1996) with many self-released albums. The one near-miss is Grupo Niche's "Cali pachanguero" (colombiansalsa). The more natural neighbours have no id: chirimía chocoana (northern Pacific brass band), the Pacific marimba fusion of Herencia de Timbiquí and ChocQuibTown, and Esmeraldas bomba/arrullo traditions. Andean bambuco has an id, but no page read gave a dated bambuco recording, so it is not used as a near.

**`jota`.** Confidence medium-high for the definition and the playlist, low for the size. Scope: the jota as sung and danced across Spain, led by the Aragonese jota of Zaragoza and Teruel (cantadores with rondalla of bandurrias, lutes, guitars and castanets), then the regional jotas of Castile (Agapito Marazuela, Candeal, Hadit, La Musgaña, Eliseo Parra, Los Hermanos Cubero), Valencia (Al Tall), Mallorca (Maria del Mar Bonet), Galicia (pandereteiras on *La Tradición Musical en España*), the Basque Country (Lomax 1952) and the 1970s Aragonese revival (La Bullonera, Chicotén, Hato de Foces), ending with Carmen París's jota fusion. The definition rests on English and Spanish Wikipedia and the Lomax *Aragón and València* liner notes (ternary time, major mode, tonic and dominant seventh, rondalla, ornamented sung quatrain, name first found in the 18th century). Every song was read from raw page text: six Lomax 1952 tracks from the Association for Cultural Equity liner-notes PDF (title row and performer row each), four 78s from UCLA's Strachwitz Frontera Collection (each streamable there), two from Spanish Wikipedia (José Oto's *La fiera*, the Pastor de Andorra's *La palomica*), and fifteen from MusicBrainz release JSON. Weakest items: *La palomica* (Wikipedia says he created it, no recording page), *La fiera* (only Wikipedia's link to an mp3), and the Sección Femenina track, which is Franco-era staged folklore but is jota. Many release years are unknown (Lomax CD and Westminster LP, the 78s) and left null. Near-misses: Glinka's *Jota aragonesa* (Mackerras/LSO) → `romantic`; Chapí's *La bruja* jota sung by José Carreras → `zarzuela`.

**`hardangerfiddleand`.** Medium-to-high confidence in the songs and the definition, low in the size. Every track and album title was copied from MusicBrainz JSON track lists (raw, character for character) for solo Hardanger fiddle albums by recognised tradition bearers: Knut Buen (As Quick as Fire, 1996), Hauk Buen (Feledåm 2000, Meisterspel 2010), Torleiv and Hallvard T. Bjørgum (Dolkaren, 1988, Setesdal), Benedicte Maurseth and Knut Hamre (Rosa i botnen, 2006, Hardanger) and Annbjørg Lien (Felefeber, 1994, the most arranged of these; only its traditional tunes were used). The definition rests on raw English Wikipedia (Hardanger fiddle, Bygdedans) and Norwegian Wikipedia (Hardingfele), all found by the checker. Telemark and Setesdal dominate the playlist; Voss (Osa), Valdres and Hallingdal are thin because no readable track list was found for their leading players. The one historic recording (Halvor Bråthen, Springar, 1928) rests on the UCSB Discography of American Historical Recordings, which refuses scripts, so it was read with the fetch tool. The size is a reasoned guess from the repertoire count (over 1000 registered slåttar) and typical album sizes, not a catalogue count. Some MusicBrainz titles lack Norwegian letters (Rosa i botnen: "Lydarslatt etter Ola Hastabo"); standard spellings are used with the page spelling as alias. English glosses in parentheses on As Quick as Fire were dropped from titles.

## Sources
One line per distinct address; the full list with exact strings is in `sources.json`, and each claim's check result in `evidence-check.json`.

### `pashtofolksong`
- Tappa. <https://en.wikipedia.org/wiki/Pashto_music>
- Recorded from the 1930s. <https://tribune.com.pk/story/1161717/entertainment>
- Zarsanga: Queen of Pashtun tappay. <https://www.aljazeera.com/news/2021/1/21/folk-music-more-to-pashtuns-beyond-extremism>
- Zarsanga: Zarsanga. <https://en.wikipedia.org/wiki/Zarsanga>
- Pashto folk music instruments. <https://reidht.substack.com/p/every-genre-project-october-4-pashto>
- Zarsanga: Gula Sta De Kilie. <https://api.discogs.com/releases/14517698>
- Mashooq Sultan and Hidayat Ullah: Mate Pe Saro, Satargo. <https://api.discogs.com/releases/12132864>
- Zarsanga: Missreeza. <https://api.discogs.com/releases/10201330>
- Gulnar Begum: Jar Jar Lalia. <https://api.discogs.com/releases/16317306>
- Gulnar Begum: Sire Satarge Khumare. <https://api.discogs.com/releases/16002009>
- Sultan Muhammed Chane and Shah Wali: Traditional Pashtoun Song. <https://api.discogs.com/releases/7471404>
- Telah Mohammed: Pashtu Pashtuna (Jalalabad Style). <https://api.discogs.com/releases/10316028>
- Alladad and Painda Gul: Pashtu Landay. <https://api.discogs.com/releases/5263945>
- Mark Slobin (recordist): Landai Songs With Ghichak. <https://api.discogs.com/releases/6156158>
- Muhammad Naim Mazari and Malang Nejrabi: Pashto Love Song. <https://api.discogs.com/releases/3322491>
- Mahwash: Pashtu - Come To Me In The Morning (Kabuli Style). <https://en.wikipedia.org/wiki/Mahwash>
- Zarsanga: پشتو گیت Vol. 2 - مروت کی خانه بدوش. <https://api.discogs.com/releases/11524991>

### `bhawaiyaandbhatial`
- Bhawaiya. <https://en.wikipedia.org/wiki/Bhawaiya>
- Bhawaiya. <https://en.banglapedia.org/index.php/Bhawaiya>
- Bhatiali. <https://en.wikipedia.org/wiki/Bhatiali>
- Bhatiyali. <https://en.banglapedia.org/index.php/Bhatiyali>
- Abbasuddin Ahmed. <https://en.banglapedia.org/index.php/Ahmed,_Abbasuddin>
- Bhatiyali. <https://www.thetravellingarchive.org/?p=128>
- Abdul Alim. <https://en.banglapedia.org/index.php/Alim,_Abdul>
- Various Artists: Bhawaiya VOL 1. <https://itunes.apple.com/lookup?id=1593188851&entity=song&limit=60&country=US>
- Rathindranath Roy: . <https://en.wikipedia.org/wiki/Rathindranath_Roy>
- Abbasuddin Ahmed: . <https://en.wikipedia.org/wiki/Abbasuddin_Ahmed>
- Abbasuddin Ahmed: Amay Bhasaili Re. <https://itunes.apple.com/lookup?id=1398196100&entity=song&limit=60&country=US>
- Rathindranath Roy: O Ki Gariyal Bhai. <https://itunes.apple.com/lookup?id=1407818852&entity=song&limit=60&country=US>
- Saurav Moni: Mayur Ponkhi Nouka Amar. <https://itunes.apple.com/lookup?id=1593246972&entity=song&limit=60&country=US>
- Ferdausi Rahman: Kato Ronger Piriti. <https://itunes.apple.com/lookup?id=1617881812&entity=song&limit=60&country=US>
- Mustafa Zaman Abbasi: Nimer Dotora Tui More. <https://itunes.apple.com/lookup?id=1774936554&entity=song&limit=60&country=US>
- Kamala Jharia: O Bidesi Bandhu. <https://itunes.apple.com/lookup?id=1439882864&entity=song&limit=60&country=US>
- Dulal De: Oki Garial Bhai. <https://itunes.apple.com/lookup?id=1680690118&entity=song&limit=60&country=US>
- Lalit Ch. Roy: Ki Sundar Dakhina Bao. <https://itunes.apple.com/lookup?id=1676537043&entity=song&limit=60&country=US>
- Sharifa Rani: Bapu Chengrare. <https://itunes.apple.com/lookup?id=1449200143&entity=song&limit=60&country=US>
- Arati Roy: Mosh Choraite Jaiben Moishal Re. <https://itunes.apple.com/lookup?id=1593189330&entity=song&limit=60&country=US>
- Saurav Moni: O Nodir Kul Nai Kinar Naire. <https://itunes.apple.com/lookup?id=1593248345&entity=song&limit=60&country=US>
- Mukesh: O Jaanewale Ho Sake. <https://en.wikipedia.org/wiki/Bandini_(film)>
- Ustad Amjad Ali Khan: Raag Khamaj (Pahadi Dhun) & Folk Music of Bengal & Assam: Bhatiali & Bihu. <https://itunes.apple.com/lookup?id=1296349692&entity=song&limit=60&country=US>

### `hsaingwaing`
- Hsaing waing (Wikipedia). <https://en.wikipedia.org/wiki/Hsaing_waing>
- The Hsaing Ensemble (Garfias, UMBC). <https://www2.umbc.edu/eol/garfias/hsaing.html>
- Music for Spirit Possession Cults in Burma (Chiarofonte, Fondazione Giorgio Cini). <https://www.cini.it/wp-content/uploads/2026/01/1_Chiarofonte-Birmania_ENG05.pdf>
- Myanmar: Music by the Hsaing Waing Orchestra (UNESCO liner notes). <https://folkways-media.si.edu/docs/folkways/artwork/UNES08281.pdf>
- Discogs database search: hsaing waing. <https://api.discogs.com/database/search?q=hsaing%20waing&per_page=50>
- Sein Chit Ti: New Arrangements for Hsaing Ensemble (ibiblio). <https://www.ibiblio.org/csloane/seinchiti.htm>
- Hsaing Waing Orchestra: Myanmar: Music by the Hsaing Waing Orchestra / The Burmese Harp. <https://api.discogs.com/releases/14623186>
- Kyaw Kyaw Naing: Pat Waing: The Magic Drum Circle of Burma. <https://api.discogs.com/releases/10736426>
- Kyaw Kyaw Naing: Pat Waing: The Magic Drum Circle of Burma. <https://en.wikipedia.org/wiki/Kyaw_Kyaw_Naing>
- Hsaing Waing Ensemble: Hsaing Waing Of Myanmar. <https://api.discogs.com/releases/9029113>
- Hsaing Waing Ensemble: Music Of Burma / Saung And Hsaing Waing. <https://api.discogs.com/releases/20883244>
- Hsaing Waing Orchestra: Birmanie: Musique d'art. <https://api.discogs.com/releases/3438326>
- Inle Myint Maung & Yi Yi Thant: In Praise Of The Burmese Harp. <https://api.discogs.com/releases/5941595>
- Fong Naam: Chatri Overture. <https://api.discogs.com/releases/6344004>

### `zapinandjoget`
- Zapin. <https://en.wikipedia.org/wiki/Zapin>
- Joget. <https://en.wikipedia.org/wiki/Joget>
- Zapin. <https://www2.umbc.edu/eol/7/brinner/vol11.html>
- Ronggeng / joget. <https://folkways-media.si.edu/docs/folkways/artwork/SFW40427.pdf>
- Recorded from 1931. <https://api.discogs.com/releases/20057026>
- Discogs search: zapin. <https://api.discogs.com/database/search?q=zapin&per_page=100>
- Discogs search: joget. <https://api.discogs.com/database/search?q=joget&per_page=100>
- Various (EMI): Joget Pilihan. <https://api.discogs.com/releases/31382267>
- Kumpulan Asli Kuala Lumpur, conducted by Fadzil Ahmad: Kamarulzaman. <https://api.discogs.com/releases/29070568>
- Orkès Gambus Al-Hidayah with Fahmi Alwialhadi: Cari Hiburan. <https://api.discogs.com/releases/2245725>
- Various (Philip Yampolsky, recordist): Melayu Music of Sumatra and the Riau Islands (album). <https://archives.crem-cnrs.fr/archives/collections/CNRSMH_E_2000_019_008>
- Soneta Group (Rhoma Irama and Elvy Sukaesih): Joget. <https://api.discogs.com/releases/21210397>
- Iyeth Bustami: Zapin-dut: Laksmana Raja di Laut. <https://api.discogs.com/releases/22590446>
- Siti Nurhaliza: Keroncong Si Endang Endong. <https://api.discogs.com/releases/6355782>
- Siti Nurhaliza and Noraniza Idris: Hati Kama. <https://api.discogs.com/releases/7465501>
- Siti Nurhaliza and Noraniza Idris: Hati Kama. <https://en.wikipedia.org/wiki/Noraniza_Idris>
- Siti Nurhaliza: Joget Pahang. <https://api.discogs.com/releases/6355762>
- Orkes Kamariah Nor: Gambus Palembang. <https://api.discogs.com/releases/8327641>
- Kumpulan Ahmad Yusoh & Rakan-rakan: Gambus Budi. <https://api.discogs.com/releases/21649657>
- Hamzah Dolmat Folk Quartet: Zapin Kenangan. <https://api.discogs.com/releases/24160805>
- Julai Tan and His Combo: Joget Hitam Manis. <https://api.discogs.com/releases/18559450>
- P. Ramlee: Joget Malaysia. <https://api.discogs.com/releases/11075225>
- Sudirman: Joget Kenangan Manis. <https://musicbrainz.org/ws/2/release/ee775b86-f7e8-4685-be76-648a13ec6acd?inc=recordings+artist-credits&fmt=json>
- Sanisah Huri: Joget Malam Berinai. <https://musicbrainz.org/ws/2/release/ad68f074-2040-4e6e-9219-52b813f02fe4?inc=recordings+artist-credits&fmt=json>
- Sri Melor: Muzik Tarian Malaysia Vol. 1: Cultural Dance Music of Malaysia. <https://api.discogs.com/releases/30755958>
- Siti Nurhaliza, Noraniza Idris and others: Joget Lambak. <https://api.discogs.com/releases/26161985>
- Siti Nurhaliza, Noraniza Idris and Natasha: Pilihan Terbaik Rentak Zapin. <https://api.discogs.com/releases/25003927>

### `maracatu`
- Maracatu. <https://en.wikipedia.org/wiki/Maracatu>
- Maracatu. <https://pt.wikipedia.org/wiki/Maracatu>
- Inventário Sonoro Dos Maracatus Nação De Pernambuco. <https://api.discogs.com/releases/22438147>
- Maracatu Nação Estrela Brilhante: Maracatu Nação Estrela Brilhante Do Recife (album). <https://api.discogs.com/releases/21826408>
- Maracatu Leão Coroado: 140 Anos (album). <https://api.discogs.com/releases/12222034>
- Nação do Maracatu Porto Rico: No Baque Das Ondas (album). <https://api.discogs.com/releases/7549407>
- Siba: Fuloresta Do Samba (album). <https://api.discogs.com/masters/1242832>
- Siba: Fuloresta Do Samba (album). <https://www.womex.com/virtual/astronave_1/siba_e_a_fuloresta>
- Chico Science & Nação Zumbi: Maracatu De Tiro Certeiro. <https://api.discogs.com/releases/2501047>
- Spok Frevo Orquestra: Passo De Anjo. <https://api.discogs.com/releases/3349383>
- Spok Frevo Orquestra: Passo De Anjo. <https://en.wikipedia.org/wiki/Frevo>
- Maracatu Piaba De Ouro: Balancinho De Salú. <https://api.discogs.com/releases/22064461>
- Maracatu Nação Encanto Da Alegria: Sustenta O Baque, Não Deixa Arriar. <https://api.discogs.com/releases/32691147>
- Maracatu Nação Pernambuco: Maracatu Misterioso. <https://api.discogs.com/releases/14448957>
- Maracatu Nação Pernambuco: Calunga de Cera. <https://api.discogs.com/releases/5724030>
- Mestre Salustiano: Maracatu. <https://musicbrainz.org/ws/2/release/a8c6da1b-c1f5-4f23-99b3-26f91b74d357?inc=recordings+artist-credits&fmt=json>
- Claudionor Germano: Verde mar de navegar. <https://musicbrainz.org/ws/2/release/31827c32-ac51-45b1-a765-b49603221b20?inc=recordings+artist-credits&fmt=json>

### `currulao`
- Currulao. <https://es.wikipedia.org/wiki/Currulao>
- Currulao. <https://folkways-media.si.edu/docs/folkways/artwork/SFW40514.pdf>
- Currulao. <https://en.wikipedia.org/wiki/Music_of_Colombia>
- Petronio Álvarez festival. <https://es.wikipedia.org/wiki/Festival_de_M%C3%BAsica_del_Pac%C3%ADfico_Petronio_%C3%81lvarez>
- Herencia de Timbiquí. <https://es.wikipedia.org/wiki/Herencia_de_Timbiqu%C3%AD>
- Canalón de Timbiquí: . <https://en.wikipedia.org/wiki/Canal%C3%B3n_de_Timbiqu%C3%AD>
- Canalón de Timbiquí: De mar y río (album). <https://www.larepublica.co/ocio/de-mar-y-rio-se-convierte-en-el-primer-album-de-folclor-del-pacifico-nominado-a-los-grammy-latino-2912407>
- Papá Roncón: Marimba Magia (album). <https://folkcloud.com/song/132/papá-roncón/agua-larga>
- Grupo Niche: Cali pachanguero. <https://en.wikipedia.org/wiki/Grupo_Niche>
- Canalón de Timbiquí: Tío Guachupesito. <https://musicbrainz.org/ws/2/release/91082cb3-dd3b-4b38-90c6-77eab7b48140?inc=recordings&fmt=json>
- Papá Roncón: Oyeya. <https://www.folkcloud.com/song/197/pap%C3%A1-ronc%C3%B3n/oyeya>
- Papá Roncón: Caderona. <https://musicbrainz.org/ws/2/release/1dbc9c89-bfec-4f6d-ac25-5c294f8a5e7b?inc=recordings&fmt=json>
- Grupo Bahía: Bambuco viejo. <https://musicbrainz.org/ws/2/release/d056337e-e9b7-4f5f-a13a-d3deaaef26e9?inc=recordings&fmt=json>
- Papá Roncón: . <https://en.wikipedia.org/wiki/Guillermo_Ayov%C3%AD_Erazo>
- Grupo Naidy: ¡Arriba suena marimba! Currulao Marimba Music from Colombia. <https://musicbrainz.org/ws/2/release/3b48ad1f-21d3-43f6-8a9d-36f1bc06d8f0?inc=recordings&fmt=json>

### `jota`
- Jota (music) (Wikipedia). <https://en.wikipedia.org/wiki/Jota_(music)>
- Jota aragonesa (Wikipedia, es). <https://es.wikipedia.org/wiki/Jota_aragonesa>
- Aragón and València (Lomax liner notes). <https://www.culturalequity.org/sites/default/files/2018-07/Aragon%26ValenciaLinerNotes.pdf>
- Jota (baile) (Wikipedia, es). <https://es.wikipedia.org/wiki/Jota_(baile)>
- José Oto: José Oto (Wikipedia, es). <https://es.wikipedia.org/wiki/José_Oto>
- Strachwitz Frontera Collection: songs, genre Jota. <https://frontera.library.ucla.edu/songs?field_recording_genre=Jota>
- Jesús Gracia: Jesús Gracia (Wikipedia, es). <https://es.wikipedia.org/wiki/Jesús_Gracia>
- MusicBrainz recording search "jota". <https://musicbrainz.org/ws/2/recording/?query=recording:jota&fmt=json&limit=100>
- José Iranzo Bielsa (Pastor de Andorra): Al regreso del campo. <https://es.wikipedia.org/wiki/Pastor_de_Andorra>
- Pilar Gascón y Justo Royo: Cadenita y segadores. <https://frontera.library.ucla.edu/recordings/cadenita-y-segadores>
- Pilar Gascón: Delante de una mujer. <https://frontera.library.ucla.edu/recordings/delante-de-una-mujer>
- Miguel Asso: Jotas para bailar. <https://frontera.library.ucla.edu/recordings/jotas-para-bailar-3>
- Jacinta Bartolomé: Jotas para bailar. <https://frontera.library.ucla.edu/recordings/jotas-para-bailar-4>
- La Bullonera: Jota carcelera. <https://musicbrainz.org/ws/2/release/c8bf9a77-7576-4470-b7cf-f57c32cc6c88?inc=recordings+artist-credits&fmt=json>
- Maria del Mar Bonet: Jota marinera. <https://musicbrainz.org/ws/2/release/3c9a5085-9e65-4e6e-9903-5625f4d6f85d?inc=recordings+artist-credits&fmt=json>
- Agapito Marazuela: Jota antigua segoviana. <https://musicbrainz.org/ws/2/release/8a75cb7f-c74c-4b9f-8817-bbd947d7304e?inc=recordings+artist-credits&fmt=json>
- Al Tall: Jota de ronda. <https://musicbrainz.org/ws/2/release/672b1730-1d65-4109-8330-c67a1dc075cb?inc=recordings+artist-credits&fmt=json>
- Candeal: Jota de ronda. <https://musicbrainz.org/ws/2/release/a11d1103-3106-4f48-947f-8a7e6061d10e?inc=recordings+artist-credits&fmt=json>
- Chicoten: Jota del chicotén. <https://musicbrainz.org/ws/2/release/2003f026-4808-4fdd-a14b-c54a4d0ef29d?inc=recordings+artist-credits&fmt=json>
- Grupos de Coros y Danzas de la Sección Femenina: Jota del Carrascal. <https://musicbrainz.org/ws/2/release/8e2fdd8d-c3cf-4d0a-adf2-a22d6bfa6823?inc=recordings+artist-credits&fmt=json>
- Hadit: Jota de Lastras. <https://musicbrainz.org/ws/2/release/8116f0a7-ffdb-49b8-a524-bce199863528?inc=recordings+artist-credits&fmt=json>
- La Musgaña: Jota alistana. <https://musicbrainz.org/ws/2/release/767882d3-8573-3f04-af2a-3f4a0defe8a0?inc=recordings+artist-credits&fmt=json>
- Emérita Vázquez y Orestina Justo: Jota. <https://musicbrainz.org/ws/2/release/c65c5dfb-a8c1-48b6-a018-1b205c185820?inc=recordings+artist-credits&fmt=json>
- Hato de Foces: Jota de Banastón. <https://musicbrainz.org/ws/2/release/f4c334f7-7b69-4a20-927d-060d8cd9140b?inc=recordings+artist-credits&fmt=json>
- Carmen París: Jotera lo serás tú. <https://musicbrainz.org/ws/2/release/b363f13d-69d6-4a01-b672-ba121c0b9f18?inc=recordings+artist-credits&fmt=json>
- Los Hermanos Cubero: Jota del Guijar. <https://musicbrainz.org/ws/2/release/272d6aa5-4954-4b2d-b96b-e5aaf6881d71?inc=recordings+artist-credits&fmt=json>
- Eliseo Parra: Jota nevada. <https://musicbrainz.org/ws/2/release/321dd279-e9e0-4719-ab56-f59b26ffd0d6?inc=recordings+artist-credits&fmt=json>
- Arantza Goikoetxea and Andoni Goikoetxea: Jota. <https://musicbrainz.org/ws/2/release/61447172-dfad-4743-a448-0b97bcc58baa?inc=recordings+artist-credits&fmt=json>
- La Bullonera: Jota carcelera. <https://es.wikipedia.org/wiki/La_Bullonera>
- London Symphony Orchestra, Charles Mackerras: Jota aragonesa (Glinka). <https://musicbrainz.org/ws/2/release/625e0952-e88f-4cc5-9173-cea655fc0309?inc=recordings+artist-credits&fmt=json>
- José Carreras: La bruja: Jota (Chapí). <https://musicbrainz.org/ws/2/release/82f24daa-7a12-4f71-a6b2-78771b7d3bff?inc=recordings+artist-credits&fmt=json>

### `hardangerfiddleand`
- Hardanger fiddle. <https://en.wikipedia.org/wiki/Hardanger_fiddle>
- Bygdedans. <https://en.wikipedia.org/wiki/Bygdedans>
- Hardingfele. <https://no.wikipedia.org/wiki/Hardingfele>
- Halvor Bråthen: Springar. <https://adp.library.ucsb.edu/index.php/matrix/refer/2000441939>
- Knut Hamre discography. <https://no.wikipedia.org/wiki/Knut_Hamre>
- Knut Buen: As Quick as Fire (album). <https://musicbrainz.org/ws/2/release/23255391-7b71-43f5-9364-00df96334b0d?inc=recordings+artist-credits+labels&fmt=json>
- Hauk Buen: Feledåm (album). <https://musicbrainz.org/ws/2/release/b64af927-f2fa-4547-882c-6ab0e11280a7?inc=recordings+artist-credits+labels&fmt=json>
- Benedicte Maurseth, Knut Hamre: Rosa i botnen (album). <https://musicbrainz.org/ws/2/release/47096407-9ee9-43b2-9cfe-3bb09580dc14?inc=recordings+artist-credits&fmt=json>
- Torleiv H. Bjørgum & Hallvard T. Bjørgum: Dolkaren (album). <https://musicbrainz.org/ws/2/release/f75e0337-8a3d-4bbd-8f54-f217bb7e5970?inc=recordings+artist-credits+labels&fmt=json>
- Einar Steen-Nøkleberg: Slåtter, Op. 72. <https://musicbrainz.org/ws/2/release/8eff7940-fda7-49e7-95f4-a3370bafdbaa?inc=recordings+artist-credits+labels&fmt=json>
- Nils Økland: Mønster. <https://musicbrainz.org/ws/2/release/fa789d82-f1ed-44aa-a93e-4ca41c04122b?inc=recordings+artist-credits&fmt=json>
- Nils Økland: Monograph. <https://www.ecmrecords.com/catalogue/143038760/monograph-nils-okland>
- Annbjørg Lien: Myllargutens bruremarsj. <https://musicbrainz.org/ws/2/release/3cf33d2b-feba-484f-b7a4-220ab11ef007?inc=recordings+artist-credits+labels&fmt=json>
- Hauk Buen: Kvamshallingen. <https://musicbrainz.org/ws/2/release/9e3cbad1-e1e3-4904-a2dc-f68c24ae4ea2?inc=recordings+artist-credits+labels&fmt=json>
- Benedicte Maurseth: Torghallingen. <https://musicbrainz.org/ws/2/release/9d110d31-e44d-4721-aba5-a6d07d8a7ba6?inc=recordings+artist-credits&fmt=json>
- Vidar Underseth, Tore Bolstad, Kristin Gulbrandsen and others: Norvège: Chant et Hardingfele. <https://musicbrainz.org/ws/2/release/246be83f-d800-4891-be18-28c5a5141bf6?inc=recordings+artist-credits+labels&fmt=json>

## What fell short
- `pashtofolksong`: 10 of 22 songs are Zarsanga's; four Gulnar Begum HMV singles are undated and tied to folk only by a label note and Discogs' folk tag; several Afghan field tracks are credited to the recordist or a description, not a singer; no titled charbeta recording found (one untitled Peshawar 78 in `unverified`); no source for the 1600 start. Refused the shell: folkways.si.edu, dawn.com (403), theguardian.com (challenge page). No ids for Pashto ghazal, Pashto film song, Pashto pop, attan; `ghazal` (Urdu) not stretched.
- `bhawaiyaandbhatial`: Only 3 of 18 songs are named as the genre on an encyclopedia page; the other 15 are tied by the title of the album or single (iTunes lookup API, a store catalogue). Years are mostly digital or compilation release years; the 1930s–50s are represented only by Kamala Jharia (1934) and Abbasuddin Ahmed (2004 compilation). The iTunes search counts behind the size basis are in the sub-agent's notes, not in `sources.json` (search results change): 36 albums/singles for "bhawaiya", 24 for "bhatiali", from itunes.apple.com/search on 2026-11-23. Fetch failures: Travelling Archive ?p=110 (connection reset), calcuttarecords.com, search.alexanderstreet.com, folkways.si.edu (403), Sahapedia (404). No ids for Goalpariya lokageet, murshidi/bichchhedi, jari/sari, palligiti.
- `hsaingwaing`: No Burmese-script titles found; titles are each release's romanisation (French-style on Ocora) or English translation (UNESCO disc). The Shanachie album (Kyaw Kyaw Naing) is tied to the genre only through its performer. Sublime Frequencies nat pwe compilation, VDE-Gallo theatre album and Folkways 1950s survey tracks left out (no page names the ensemble or lists tracks). Refused the shell: folkways.si.edu, asiasociety.org, britannica.com, allaboutjazz.com, libcat.library.tamu.edu (403). No ids for nat pwe or anyeint as forms.
- `zapinandjoget`: Genre tie is mostly the label's own "(Zapin)"/"(Joget)" marking or the title. Sumatran ronggeng counted as joget (a judgement); Siti Nurhaliza's tracks border on `iramamalaysia`. Several are old LPs and a 1931 78, so not all may be playable. No source supports the 1600 start (Wikipedia: zapin c. 14th century, joget colonial era). No ids for inang/asli, ghazal Melayu, dondang sayang, mak yong music, Hadhrami gambus.
- `maracatu`: Five songs have no release year (Maracatu Atômico, Inventário Sonoro, Baque Forte). Nothing older than 1993 verified: Capiba, Nelson Ferreira, "Maracatu Atômico" (Jorge Mautner/Gilberto Gil), Naná Vasconcelos only in `unverified`. Rural baque solto has four tracks only. allmusic.com refused the shell (403). No ids for maracatu cearense, caboclinho, cavalo-marinho.
- `currulao`: Eleven of 21 songs from one Folkways album; Papá Roncón's album has no year on any page; Grupo Naidy album year 2005 (liner) vs 2006 (MusicBrainz). Some tracks are jugas and bundes played with marimba, counted here. Unreadable: folkways.si.edu album page (403, liner PDF used instead), ich.unesco.org (bot check), mustrad.org.uk (proxy 502). No ids for chirimía chocoana, Pacific marimba fusion, Esmeraldas marimba; no dated recording found to use `bambuco` as a near.
- `jota`: "La palomica" and "La fiera" rest only on Spanish Wikipedia; no catalogue found for José Oto's 78s or Jesús Gracia's 1973 album; many years null (Lomax releases, Frontera 78s). One fit uses a recording year (1952) rather than a release year. adp.library.ucsb.edu refused the shell (403), not used. No id for Philippine jota/rondalla; Venezuelan jota not tied to `joropo` by any page.
- `hardangerfiddleand`: Voss, Valdres and Hallingdal have no tracks (no readable track list for their leading players); Telemark and Setesdal dominate. The one historic recording rests on a page read with the fetch tool (DAHR, 403 to scripts). Some MusicBrainz titles lack Norwegian letters; standard spellings used, page spellings as aliases. No ids for Swedish polska/nyckelharpa, Norwegian flat-fiddle traditions, gammaldans.
- All: streaming availability not checked; sizes are judgements, not counts. The sub-agents' raw page copies and helper scripts stayed in the session scratchpad and are not handed back. Two sub-agents (`jota`, `hardangerfiddleand`) and I deleted failed (HTTP 503) entries from the ignored `.cache/evidence/` folder so the checker could retry once; nothing tracked by git outside this folder changed except the H7 line in `QUEUE.md`.

## Questions for the lead
Order: what the sub-agents asked, grouped. None is decided here.

1. Tree order and shape: `data/nodes.json`/`data/defs.json` are gone from `dev`; I used `data/genres.json` order and the H3/H4 entry shape. Is that the shape you still want for batch 4 (H8), or should helpers write the new model's `definition` field and scope files?
2. Start years without a source: `pashtofolksong` 1600 (none found), `zapinandjoget` 1600 (Wikipedia: zapin c. 14th century), `hardangerfiddleand` 1700 (oldest surviving fiddle dated 1651). `maracatu` 1700 fits the first written record of 1711; `bhawaiyaandbhatial` 1600 fits Wikipedia's 16th-century origin for bhawaiya.
3. Origin point for `hardangerfiddleand`: Bergen, while the sources place the heartland in Hardanger, Voss, Telemark and Setesdal.
4. Split or keep: `bhawaiyaandbhatial` (sources treat two regional forms); `zapinandjoget` with Sumatran ronggeng inside it; `currulao` with jugas, bundes and Esmeraldas marimba inside it.
5. Missing ids (not stretched): Pashto ghazal, Pashto film song/pop, attan; Goalpariya lokageet; nat pwe, anyeint; inang/asli, ghazal Melayu, dondang sayang, mak yong, Hadhrami gambus; maracatu cearense, caboclinho, cavalo-marinho; chirimía chocoana, Pacific marimba fusion; Philippine jota/rondalla; Swedish polska/nyckelharpa, Norwegian flat-fiddle, gammaldans.
6. Evidence standard: is a store catalogue (iTunes lookup) acceptable as the genre tie when the album title names the form (`bhawaiyaandbhatial`)? Are label notes plus a Discogs genre tag enough for the Gulnar Begum singles (`pashtofolksong`)?
7. Borderline entries: Kabul teahouse tracks here or under `afghanpopularsong`; Siti Nurhaliza/Noraniza Idris here or under `iramamalaysia`; Nação Pernambuco (a stage group) in the maracatu playlist or as near; Annbjørg Lien's arranged *Felefeber* as the genre or a revival neighbour.
8. Titles and credits: English-only titles on the UNESCO hsaing waing disc; Ocora's French-style romanisation; "Siba" vs "Siba e a Fuloresta"; Bengali and Pashto romanisations kept as each release prints them (add native script?).
9. Years: release vs recording year for Lomax 1952 jota tracks; Grupo Naidy 2005 vs 2006.
