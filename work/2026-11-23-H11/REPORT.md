# H11: Batches 1 and 2 again, under the evidence rule

Date 2026-11-23. Branch `helper/2026-11-23-h11`. The run was configured with model `claude-opus-5-5`, with fallbacks `claude-opus-5[1m]` and `claude-opus-4-8[1m]`. The model that actually served the run may differ, and I cannot confirm it from inside the run. Sub-agents: four research sub-agents (A to D), all started with model `opus`, as the assignment says.

## What was asked

For the 16 genres in `work/2026-11-23-H3/` and `work/2026-11-23-H4/`:

- Keep every claim the check finds.
- For each claim that H9 did not class as confirmed, either find a page a script can read and copy the exact string from its raw text, or move the song to unverified.
- Rebuild `defs.add.json`, `playlists.add.json`, `sizes.json` and `sources.json` for all 16 genres, so that every song in them has at least one claim with the result `found`.
- Run the check.

The lead's answers to H9 were applied as follows:

- The dead `download.osmand.net` mirror was re-pointed to the Commons page.
- The 2 claims on the Smithsonian liner-note PDFs (`folkways-media.si.edu`) that only came back "near" were still re-quoted.
- Claims on Smithsonian Folkways and Folklife web pages were left unverified. I did not hunt for replacements for them.

## What is in this folder

- `sources.json`: all 576 claims for the 16 genres, in the batches' shape.
  - It holds the 526 original claims in their original order, then the claims H11 added.
  - Every claim has `from`, which gives its origin (`H3:<genre>:<n>`). Claims new in H11 have no `from`.
  - Every claim H11 changed or added has an `h11` field saying what was done and why.
  - Where a quote was replaced, the old one is kept in `quote_before`.
- `evidence-check.json`: the output of `tools/check_evidence.py` over `sources.json`. It found 447 claims, 3 near, 4 not found and 122 with no readable page.
- `defs.add.json`, `playlists.add.json`: the 16 entries rebuilt.
  - They keep only songs, albums, fits and near-misses with at least one `found` claim that names them (matched by title and by artist).
  - `yrs` is cut to match.
  - Where no playable song is left, status goes to `none`. Where fewer than four are left, `full` goes to `thin`.
- `sizes.json`: unchanged from the batches. Its estimates are judgements, not claims. The size claims that are not found are listed in `unverified.json`.
- `unverified.json`: per genre:
  - the batches' `alias` and `unverified` lists, carried over;
  - `dropped_by_h11`, each entry removed and why;
  - `claims_not_found`, every claim in `sources.json` whose result is not `found`, with the script's reason.
- `REPORT.md`: this file.

## What was found

**Evidence check over the rebuilt `sources.json`:**

- Found: 447 of 576 claims (78%), up from 366 of 526 (70%) when the same script ran over the old files today.
- Not found: 4. They are:
  - the Bihu "14th-century Chutia King" sentence (wrong source);
  - 3 dead All Night Flight Records rows. Their Yusuf Omar songs are supported by other claims.
- No page: 122. Almost all are Smithsonian Folkways/Folklife, plus the old ILAM, last.fm, Cezame and similar claims, which are now superseded by new claims.

**What changed in `sources.json`:**

| Change | Claims |
| :- | -: |
| Re-pointed from the dead `download.osmand.net` mirror to the Commons original `Commons:Filaret_Kolessa_phonograph_cylinder_collection` (lead's answer 1). All found. | 17 |
| Re-pointed from the dead `wiki.riteme.site` mirror to the Commons file page `File:Vaka_vanha_Vainamoinen.ogg`. This uses the same reasoning as the osmand answer, applied by me: please confirm. Both found. | 2 |
| Quote replaced by the exact text H9 copied from the raw page (the 6 `reworded` claims). The Duma line was also trimmed to start after the audio-link label, and it no longer carries "sixteenth century". | 6 |
| Quote copied again from the raw page where the old one came back near or not found: Ahidus, the Ca trù counts ×2, the Tarantella "6/8" sentence cut before the stacked fraction, the kulintang "1 961", Tỳ bà hành on api.discogs.com. | 6 |
| Titles of the two CREM "Ahwach" claims set to the playlist titles, so they match their songs. The page labels are kept in `h11`. | 2 |
| New claims from the sub-agents and from me, all `found`. | 50 |

### Per genre

"Songs" counts the playable list (intro and peak). The other columns show before → after.

| Genre | Songs before | Songs kept | Albums | Fits | Near | New found claims | Songs dropped and why |
| :- | -: | -: | :- | :- | :- | -: | :- |
| kalevalarunosong | 12 | 12 | 4→4 | 4→4 | 2→2 | 2 | none. Soininen is kept via the Commons file page. The Kalevala Heritage album is kept via MusicBrainz (Ondine ODE 849-2). |
| ngoma | 7 | 6 | 4→4 | 4→4 | 1→1 | 13 | 1: "Ngoma yalilamuno yayenda Maraya Pemba" (Folkways only). Three ILAM songs were re-sourced to Rhodes University's readable ILAM archive at digitalarchives.ru.ac.za. |
| amazighahwashandah | 9 | 9 | 5→5 | 4→4 | 0→0 | 0 | none. The two "Ahwach" tracks had been missed only because their claim titles were spelled differently. |
| cheo | 11 | **0** | 1→1 | 4→1 | 1→0 | 0 | all 11: every song rests only on the Folkways album page. Status is now `none`. |
| catru | 17 | 14 | 4→3 | 3→2 | 2→1 | 0 | 3, all Quách Thị Hồ: Bắc phản, Mưỡu / Hát nói, Tỳ bà hành (Folkways only). The album "Viet-Nam: Ca Tru & Quan Ho" was dropped for the same reason. |
| quanho | 7 | 1 | 4→4 | 2→2 | 1→0 | 0 | 6, all on the Folkways album "Viet-Nam: Ca Tru & Quan Ho". |
| bihusongs | 19 | 17 | 4→4 | 4→3 | 2→2 | 0 | 2 Folkways "Bihu" album tracks. |
| pungmul | 16 | 13 | 5→5 | 4→2 | 2→2 | 8 | 3: Kim Ok-sim "Ah-Rirang" and "Torachi", Korean Women's Music Association "Nong-Ahk" (Folkways only). The six Lee Chun-hee tracks and Samul-Nori "Youngnam Nong-ak" were re-sourced on MusicBrainz. |
| huaer | 5 | 5 | 1→1 | 4→4 | 1→1 | 0 | none |
| kulintang | 19 | 17 | 6→6 | 4→4 | 1→1 | 0 | 2: "Binalig a Kulndet" and "Duyog and Sinulog a Kamamatuan". Their only source is the Smithsonian Folklife magazine (folklife.si.edu), which I treated like Folkways. |
| malhun | 0 | 0 | 1→1 | 0→0 | 0→0 | 0 | none to drop (status was already `none`) |
| garbaanddandiyaraa | 14 | 13 | 6→5 | 4→3 | 2→2 | 11 | 1: Maniraj Barot "Sanedo Sanedo Laal Sanedo". The only readable page found (iTunes) has a differently titled track, "Lal Lal Sanedo", so I did not count it. The album "Garba Raas Ni Ramzat" (Purushottam Upadhyay) was also dropped: no readable page names him. Seven last.fm songs were re-sourced to iTunes lookup pages. |
| mahagita | 20 | 20 | 4→4 | 4→4 | 1→1 | 3 | none |
| kobzardumy | 18 | 17 | 4→2 | 4→3 | 1→1 | 4 | 1: F. Jarko "Duma about Marussia of Bohuslav" (Folkways only). The albums "Songs of Truth" and "Ukraine: Traditional Music" were dropped (Folkways only). The ten cylinder recordings are back through Commons. The Kytasty tracks were re-sourced on MusicBrainz. |
| tarantella | 15 | 13 | 11→9 | 4→4 | 1→1 | 6 | 2 Folkways "Festa Italiana" tracks, plus the albums "Festa Italiana" and "Italian Folk Music, Vol. 5" (Folkways only). Tammurriata di Scafati and Sangue Vivo were re-sourced on MusicBrainz and it.wikipedia. |
| iraqimaqam | 18 | 18 | 6→6 | 4→4 | 2→2 | 3 | none |
| **Total** | **207** | **175** | | | | **50** | 32 dropped: 31 Smithsonian-only, 1 title mismatch |

Every one of the 175 songs and every album, fit and near-miss left in the add files has at least one claim that the script finds and that names it, by title and by artist. Two exceptions to "by artist":
- Claims whose artist is blank or "Various".
- Album-level claims such as the iTunes album pages, where the page names the album artist.

### Where the new source disagrees with our entry (not changed: for the lead)

- **ngoma, "Enkoito drum rhythms" (Five Haya men):** the ILAM archive page is "Enkoito drum rhythms I" (TR146, Bukoba, 1952). A separate "Enkoito drum rhythms II" exists (item 58456, a 78 dated 1950). Which recording we mean is not settled.
- **ngoma, "Ngoma Iko Huku" (near):** MusicBrainz credits "Salim Abdullah" and "Cuban Marimba", where ours is "Salum Abdallah and Cuban Marimba Band".
- **ngoma, Mukunguni:** the catalogue number is HJRCD68 on MusicBrainz, ours is HJR 068. The page proves the album exists, not its fit to ngoma.
- **ngoma, the ILAM pages:** they do not use the word "ngoma". They tie the recordings to drum dances by their descriptions.
- **garba, "Vhalam Ni Vaat Kai":** iTunes credits "Atul Purohit, Himali Vora & Kairavi Buch" on ફાગણ આયો (2022).
- **garba, "He Maro Saybo" and "Sharad Poonam Ni Raatdi":** iTunes has these on "Maa Ni Chundadi (Gujarati Garba Songs)", dated 1994.
- **pungmul, Samul-Nori "Drums and Voices of Korea" (1984):** MusicBrainz shows the label as Oasis Record Co., not Nonesuch Explorer.
- **pungmul, the Lee Chun-hee album:** MusicBrainz gives only the French title, "Corée : Chant Arirang et Minyo" (Ocora C 560258, 2014).
- **mahagita, "Mahagita By Burmese Harp, Vol. 3":** iTunes credits "Inle Myint Maung & Yi Yi Thant".
- **kobzardumy, "Captive's Lament":** the MusicBrainz "Songs of Truth" by Julian Kytasty (2014-10-14, Canada) shows "[no label]", not Smithsonian Folkways. The track is "Невільницький плач (дума)". It is probably the same album, but this is not certain.
- **tarantella, Bum! (Tammurriata di Scafati):** MusicBrainz gives 2014 and the label Finisterre, where ours says Felmay. It spells the track "Tammurriata d'O Pepe".
- **tarantella, Cortot:** the MusicBrainz recording "Tarantelle in A-flat major, Op. 43" gives no recording date. It appears on 2005 and 2012 compilations.
- **iraqimaqam, "Maqams in Divine Enchantment":** MusicBrainz gives 2006 and the label Papyros, where ours says Felmay.
- **iraqimaqam, Munir Bashir:** MusicBrainz titles the album "L'art du 'ûd" (Ocora 2001; there is also a 1998 issue).
- **iraqimaqam, "Congrès de musique arabe du Caire 1932":** MusicBrainz shows the BnF 18-disc box (2015). The Iraqi tracks are credited to "Ensemble de Muhammad Al-Qubbbânjî" (three b's on the page).

## Sources

The claims H11 added use these sources; every address is in `sources.json`.

- **MusicBrainz releases** (read through its data interface, as the check does):
  - The Kalevala Heritage 54a29bc9-c3b2-435c-9e8b-fc6b07a647f5
  - New Recordings From Coast Province, Kenya be2bf161-2c58-4205-afc8-1c2bf8078e29
  - Ngoma Iko Huku b82a2dce-5700-4c33-8b1b-3f2551b50e4f
  - Corée : Chant Arirang et Minyo f4f431dd-5adf-47bf-a34d-891a92757b58
  - Drums and Voices of Korea ab953991-1dd3-48ea-9d85-fc4d7af97cdf
  - Songs of Truth f60d5075-5ad8-44ff-97e6-5028f9f385be
  - Black Sea Winds f9370fc4-2c62-4772-97a7-66c57897997c
  - Bum! 565d58d2-cdda-4811-868c-2b11ae0362d2
  - Sangue vivo a92b917b-f1ef-4f95-adae-d6c378ba4d62
  - Maqams in Divine Enchantment 93058e1a-a4ee-4366-8973-5c5948412875
  - L'art du 'ûd 6b36edbe-85ca-441e-91f5-df7022f4a365
  - Congrès de musique arabe du Caire 25d66aec-1463-4a0b-a331-d3bbe587e71c
- **MusicBrainz recording:** Cortot, Tarantelle op. 43, f6d9415e-4745-4ea2-b00f-f2e3185b27b0
- **Rhodes University ILAM digital archive:** https://digitalarchives.ru.ac.za/s/ilam/item/72805, /72803, /72393
- **Caprice Records (old site):** https://old.capricemusic.se/capricerecords/artikel/music-from-tanzania-and-zanzibar-1/?lang=en
- **CiNii Books, Tanzania instruments, Tanganyika, 1950:** https://ci.nii.ac.jp/ncid/BB0687462X
- **iTunes lookup:** ids 1633790487, 1481554765, 1817600976, 1480259196 (garba) and 803572572 (mahagita)
- **Smithsonian Folkways liner notes, UNESCO collection:** https://folkways-media.si.edu/docs/folkways/artwork/UNES08281.pdf
- **Wikipedia (it), Officina Zoè:** https://it.wikipedia.org/wiki/Officina_Zo%C3%A8
- **Wikimedia Commons:**
  - Commons:Filaret Kolessa phonograph cylinder collection: https://commons.wikimedia.org/wiki/Commons:Filaret_Kolessa_phonograph_cylinder_collection
  - File:Vaka vanha Vainamoinen.ogg: https://commons.wikimedia.org/wiki/File:Vaka_vanha_Vainamoinen.ogg
- **Re-read raw to fix quotes:**
  - https://en.wikipedia.org/wiki/Ahidous
  - https://en.wikipedia.org/wiki/Ca_tru
  - https://en.wikipedia.org/wiki/Tarantella
  - https://en.wikipedia.org/wiki/Duma_(epic)
  - https://api.discogs.com/releases/1976637

All were read on 2026-11-23.

## What fell short

- **32 entries were dropped, 31 of them only because their sole source is a Smithsonian page** (folkways.si.edu, and in 2 cases folklife.si.edu, which I treated the same way). Chèo loses its whole playlist and quan họ keeps 1 song of 7. If the owner's check from his own computer finds them, they can come back from the batches' files as they were.
- **Definition and size claims were not re-sourced.** The ask was about songs. 22 definition or size claims are still not found (listed in `unverified.json`, `claims_not_found`).
  - Three definition windows rest on unconfirmed claims:
    - **bihusongs "1300 onward":** rests on the Bihu dance sentence about 14th-century inscriptions, which today's Wikipedia does not have (H9: wrong source).
    - **kobzardumy "16th century onward":** no page found says sixteenth century.
    - **cheo "1000 onward":** rests on the Folkways album page.
  - I did not edit any definition text.
- **sizes.json is unchanged**, and a few of its size claims are unchecked (ngoma 2, huaer 2, garba 1, tarantella 1, iraqimaqam 1, amazigh 1).
- **How songs are matched to claims is my own rule.** A claim supports an entry when the normalised titles are equal or one begins with or contains the other, and their artist names share a word (ignoring words such as "and", "with", "men", "orchestra"), or the claim has no artist. It is stricter than H9's rule: requiring the artist removed a false match where Quách Thị Hồ songs were being supported by another singer's claims. It can still miss or over-match on short generic titles.
- **One claim is in `sources.json` but deliberately not counted:** catru Tỳ bà hành on api.discogs.com 1976637, marked `weak`. The release names no performer per track.
- **The checker was slow** because it retries unreachable hosts (pointculture.be, samap.ukzn, vital.seals, ilamcommons, adpprod1.library.ucsb.edu). Each full run took about 25 minutes. Its result is deterministic over the cache, so the numbers above are from the final run over this folder's `sources.json`.

## Questions for the lead

1. I applied the osmand answer to the other dead mirror too: `wiki.riteme.site`, re-pointed to Commons `File:Vaka_vanha_Vainamoinen.ogg`, where both strings are found. Is that acceptable?
2. The readable Discogs API release 1976637 (Odeon/EMI 3C 064-18310, the 1976 Hanoi recordings, the same UNESCO set as the Folkways "Ca Tru & Quan Ho" album) lists the track titles:
   - A1–A3: Bắc phản, Mưỡu/Hát nói, Tỳ bà hành;
   - B1–B5: Gọi đò, Cơi trầu, Đường bạn Kim Loan, Sở cầu như ý, Đêm qua nhớ bạn.

   It names no performers. Would that count as evidence for the dropped catru and quan họ songs? I did not use it, because the lead said not to hunt for replacements for Folkways claims, and because it does not name the singers.
3. Is "Lal Lal Sanedo" by Maniraj Barot & Rasik Barot (iTunes 1048105206, 2015) the song we list as "Sanedo Sanedo Laal Sanedo"? I left it out.
4. Should the bihusongs, kobzardumy and cheo windows change now that their supporting claims are gone? That is a definition decision, so I left it to you.
