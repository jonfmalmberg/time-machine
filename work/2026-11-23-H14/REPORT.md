# H14: Records for two new genres: rways and Korean minyo
Date 2026-11-23, branch `helper/2026-11-23-h14`, run configured with model `claude-opus-5-5` (the serving model may differ; this is the identifier the run was given). No sub-agents were used.

H13 was the first open assignment, but a branch `helper/2026-11-23-h13` already exists, so this run skipped it and took H14.

## What was asked
Propose complete genre records, in the shape of `data/genres.json` and the schema proposal, for **rways** (separate from `amazighahwashandah`) and **Korean minyo** (separate from `pungmul` and from Japanese `minyo`). That means parentage, a first estimate of where and when each peaked, evidence that passes `tools/check_evidence.py` for every fact, and a list of the `pungmul` songs in `work/2026-11-23-H3/` that are Korean minyo and not percussion.

## What is in this folder
- `genres.add.json`: two genre records, `rways` and `koreanminyo`, each with an `evidence` map from field to claim (`scope:n` in `sources.json`).
- `parentage.add.json`: two lines, `amazighahwashandah → rways` (principal) and `koreanminyo → pansori` (other).
- `presence.add.json`: nine presence records (origin, peak, later), all with `basis: first estimate` and evidence pointers.
- `pungmul-move.json`: which `pungmul` songs, albums, fits and near misses belong in `koreanminyo`, with the evidence for each. It also lists what stays in `pungmul`.
- `sources.json`: 68 claims (32 rways, 25 Korean minyo, 11 for the move list). Each claim has an address, the exact string from the raw page, the date read and the field it supports.
- `evidence-check.json`: the script's output: 65 found, 1 not found, 2 no page. The three are explained below and in `unverified.json`.
- `unverified.json`: the claims that did not pass, and what was not checked at all.

## What was found

### Rways (`rways`)
- **Identity.** Professional, historically itinerant Tashelhit poet-singers of the Sous. A *rays* (plural *rrways*) leads a troupe. The ribab (one-string fiddle) and lotar (lute) play over the naqus (a metal bell struck with a rod) and bendir. The leader sings his poetry line by line and the chorus repeats it. The scale is pentatonic, often in a five-beat (5/8) cycle. A performance has a set order, from the instrumental *astara* to the *tabbayt*, which speeds up and stops dead.
- **Distinct from ahwash.** Ali Faiq: "It's not like ahwach, where everybody participates in collective songs". Schuyler (1979) titled his article "Rwais and Ahwash: Opposing tendencies". The link between the two is the five-beat cycle, which Le Matin (2005) says is also the basis of ahwash dance songs. That link is the only evidence for making `amazighahwashandah` the principal parent, so this parent is a judgement, not a sourced descent.
- **Began c. 1750.** This rests on a hedged statement ("began, I believe, in the 18th and 19th centuries", Ali Faiq to Afropop) and on Sidi Hammou, "most probably flourished in the second half of the 18th century", whom a 1970s band cited as a Rrways-tradition poet. It is low confidence. `attested` is not set, because 1750 is an estimate, not a first record.
- **Origin.** Tiznit (29.717, -9.717), one of the "two schools" Ali Faiq names; the other is Marrakech. Lhaj Belaid, the first famous recorded rays, was born near Ouijjane in the same area.
- **Peak, first estimate 1930–1990 in Morocco.** Recording started in the 1920s (Pathé about 1927, Gramophone 1929). The first star generation came in the 1920s and 1930s. Albensir's work of the 1970s and 1980s was political. Arsmouk's popularity grew from the 1990s, and a prize-winning anthology appeared in 2021, so the genre is alive (`ended: null`). No source states a peak, so the window is my judgement from these dated points.
- **Later, France from about 1930.** Belaid's Paris recordings and his song about the trip to Paris (1933), plus a general statement that some rways emigrated. The sources do not agree on when and for whom Belaid recorded: Baidaphone 1929 (Aubry), Pathé-Marconi in Paris 1937 (Wikipedia), Baidaphon's Paris outfit 1938 (Excavated Shellac).
- **Family and tradition.** The record uses tradition `maghreb`, the only Moroccan one, and family `africa`, as `amazighahwashandah` does. `maghreb` belongs to family `maqam`, so this repeats an existing mismatch (35 genres already have one). The pentatonic, non-maqam scale (Le Matin) is the reason for `africa`.
- **No children proposed.** Modern Amazigh bands (Ousmane, Izenzaren, Amarg Fusion) drew on rrways poems and melodies, but the tree has no id for modern Amazigh music, so no line is proposed.

### Korean minyo (`koreanminyo`)
- **Identity.** Korean folk song: strophic, usually with a refrain, on cycling rhythmic patterns (jangdan: gutgeori, jajin-taryeong, semachi) and loosely defined modes. There are two layers: local work and village songs (*tosok minyo*), and the popular repertoire refined by professional singers (*tongsok minyo*). Regional styles differ sharply: bright Gyeonggi songs, "rich and dramatic" Namdo songs, and free-rhythm north-western (Seodo) songs. Recordings accompany it with zithers, flute, fiddle, oboe and drum.
- **Distinct from pungmul.** Pungmul is outdoor percussion and dance; minyo is a vocal repertoire. **Distinct from Japanese `minyo`:** different language and place, and old enough to count under principle 27.
- **Began 1756, `attested: true`.** Arirang's first written mention is in a 1756 manuscript (Keith Howard, via Wikipedia). The song itself is older: locals trace it to Goryeo.
- **Origin.** The text is "Korea", with the three regional styles named. The coordinates are Seoul (37.56, 126.99), because Gyeonggi minyo centres there. This is a choice: the genre has no single point of origin. Jeongseon, where Arirang is believed to have begun, is the alternative.
- **Peak, first estimate 1910–1945 in KR and KP.** This was the gramophone and radio era. The 1926 film *Arirang* made the standard version popular. Wang Su-bok, a Pyongyang-trained singer of folk styles, was the most popular singer in Korea in 1935. Sinminyo records spread from the early 1930s. The window is a judgement. Living heritage status (Gyeonggi minyo 1975; Arirang on UNESCO lists in 2012 for KR and 2014 for KP) shows the genre is alive (`ended: null`), not that it peaked then.
- **Later, Japan from the 1910s.** More than 50 Japanese versions of Arirang were released between 1931 and 1943.
- **Parentage.** No source names an ancestor, so the record is proposed as a **root**, which `attested` allows ("older than records"). One outgoing line is proposed, to `pansori` as an "other" parent: "Some Namdo folk songs are used in pansori".
- **The existing `pungmul` record.** Its name, "Pungmul (nongak) and Korean folk song (minyo)", and its definition marker "Solo voice ... as in Arirang" would need changing once minyo has its own id. That is for the lead; this run did not edit `data/`.

### Pungmul songs that are Korean minyo (`pungmul-move.json`)
To move: intro *Arirang*, *Ah-Rirang*, *Nodeul Gangbyeon*, *Torachi*, *Taepyeongga* and *Odolttogi*; peak *Namdo Min Yo*, *Gin Arirang*, *Changbu Taryeong*, *Gu Arirang* and *Noraetgarak*; the albums *Arirang and Minyo Singing*, *The 'Deep Song' of Korea* and *Arirang. Korean Kyonggi Minyo*; both minyo fits; and the SsingSsing 청춘가 near miss, which should point at `koreanminyo`.

To stay in `pungmul`: the five drumming tracks and two mixed albums.

That leaves `pungmul` with five tracks after the move: thin. Two flags:
- *Nodeul Gangbyeon* is a composed 1930s sinminyo (lyrics by Sin Bul-chul, music by Mun Ho-wol), not an anonymous folk song. The Gyeonggi minyo list still includes it.
- *Taepyeongga* and *Gu Arirang* rest only on the album title; no page names either song a minyo.

## Sources
- Berber music (Wikipedia). <https://en.wikipedia.org/wiki/Berber_music>
- Amazigh Troubadours of Morocco (Sud-Est Maroc). <https://sudestmaroc.com/en/amazigh-troubadours-morocco-ribab/>
- Rais Mohamed Ben Biak (Excavated Shellac). <https://excavatedshellac.com/2010/09/20/rais-mohamed-ben-biak-caid-mokhtar/>
- Rythmes et modes de la chanson amazighe des Rways (Le Matin, 2005). <https://lematin.ma/journal/2005/Rythmes-et-modes-de-la-chanson-amazighe-des-Rways--Un-patrimoine-musical-menace-de-disparition/52627.html>
- Lhaj Belaid (Wikipedia). <https://en.wikipedia.org/wiki/Lhaj_Belaid>
- Gilles Aubry, Sawt Bodies Species, chapter 1 (Norient, PDF). <https://norient.com/sites/norient.com/files/2023-04/Chapter%201%20%E2%80%93%20Gilles%20Aubry%20%E2%80%93%20Sawt%20Bodies%20Species_colonial-ethical-noise.pdf>
- Ali Faiq interview (Afropop Worldwide). <https://afropop.org/articles/ali-faiq-ccedit>
- Hemmou Talb (Wikipedia). <https://en.wikipedia.org/wiki/Hemmou_Talb>
- Ben Jones, Recording Lightning (Tamazgha Studies Journal). <https://tamazghastudiesjournal.org/articles-spring2024-issue-01-article03>
- Tiznit (Wikipedia). <https://en.wikipedia.org/wiki/Tiznit>
- Chleuhs (Wikipedia, French). <https://fr.wikipedia.org/wiki/Chleuhs>
- Rwāys and Tirruyssā (Jadaliyya). <https://www.jadaliyya.com/Details/43446>
- Hassan Arsmouk (Wikipedia). <https://en.wikipedia.org/wiki/Hassan_Arsmouk>
- Rouaiss: Ancient Folk Heritage (MWN Lifestyle). <https://mwnlifestyle.com/2024/05/05/rouaiss-ancient-folk-heritage-rooted-in-souss-culture/>
- Brahim El Mazned (Wikipedia). <https://en.wikipedia.org/wiki/Brahim_El_Mazned>
- Korean folk music (Wikipedia). <https://en.wikipedia.org/wiki/Korean_folk_music>
- 남도민요 / 한국 민요 (Wikipedia, Korean). <https://ko.wikipedia.org/wiki/남도민요>
- 경기민요 (Wikipedia, Korean). <https://ko.wikipedia.org/wiki/경기민요>
- 신민요 (Wikipedia, Korean). <https://ko.wikipedia.org/wiki/신민요>
- 노들강변 (Wikipedia, Korean). <https://ko.wikipedia.org/wiki/노들강변>
- Arirang, Republic of Korea (UNESCO). <https://ich.unesco.org/en/RL/arirang-lyrical-folk-song-in-the-republic-of-korea-00445>
- Arirang, DPRK (UNESCO). <https://ich.unesco.org/en/RL/arirang-folk-song-in-the-democratic-people-s-republic-of-korea-00914>
- Arirang (Wikipedia). <https://en.wikipedia.org/wiki/Arirang>
- Wang Su-bok (Wikipedia). <https://en.wikipedia.org/wiki/Wang_Su-bok>
- Song So-hee (Wikipedia). <https://en.wikipedia.org/wiki/Song_So-hee>
- Seoul (Wikipedia). <https://en.wikipedia.org/wiki/Seoul>
- The 'Deep Song' of Korea (Buda Musique). <https://budamusique.com/en/catalogue/view/969/the-deep-song-of-korea?of=368>
- Corée : Chant Arirang et Minyo (MusicBrainz). <https://musicbrainz.org/release/f4f431dd-5adf-47bf-a34d-891a92757b58>
- Corée: percussions et chants de Hahoe et Kyongju (Frémeaux). <https://www.fremeaux.com/en/1665-coree-percussions-et-chants-de-hahoe-et-kyongju-3561302536828-fa5368.html>
- Arirang. Korean Kyonggi Minyo (CREM-CNRS). <https://archives.crem-cnrs.fr/archives/collections/CNRSMH_E_1989_013_005/>
- SsingSsing (Wikipedia). <https://en.wikipedia.org/wiki/SsingSsing>
- Korea: Vocal and Instrumental Music (Smithsonian Folkways; refuses scripts). <https://folkways.si.edu/korea-vocal-and-instrumental-music/world/album/smithsonian>

## What fell short
- **Peak windows.** Both are judgements drawn from dated recordings and singers. No source states when either genre peaked.
- **Rways start date.** It rests on one hedged interview remark and an indirect link to Sidi Hammou. Schuyler (1979) and Aubry's sources on early history were not read in full.
- **Korean text and the check script.** On Korean Wikipedia, a link followed by a particle (`<a>신민요</a>다`) splits the word, and `check_evidence.py` then reports "not found" for text that is on the page. One claim fails for this reason (`pungmul-move:3`, the sinminyo note on 노들강변). One quote from the 경기민요 page was replaced for the same reason. The script could join a link's text to the next character when no space separates them. That change is for the lead; this run did not edit `tools/`.
- **Folkways.** The two Kim Ok-sim tracks still rest on a page that refuses scripts (403), as H9 found. Their move is also supported by the Gyeonggi list and by the "Doraji Taryeong is a minyo" line.
- **Judgements, tier and row.** Neither record has `judgements`, `tier` or `row`. The ask did not list them; the schema says tier and row are computed, and the judgements need someone to own them.
- **Cezame page.** The page H3 used for the Lee Chun-hee album now returns 403. The MusicBrainz release was used instead.
- **Songs.** None was researched for either new genre beyond the move list; the ask did not include a playlist.

## Questions for the lead
1. Should `amazighahwashandah` be the principal parent of `rways`, given that the sources set the two against each other? Or should `rways` be a root? No source states descent.
2. Should `koreanminyo` be a root (as proposed), or have a principal parent? `kcourt` is the principal of `pungmul`, but nothing read here supports court music as an ancestor of folk song.
3. Origin point for Korean minyo: Seoul (Gyeonggi) or Jeongseon (Arirang)?
4. Is *Nodeul Gangbyeon*, a composed 1930s sinminyo, Korean minyo for the playlist, or a near miss? Sinminyo has no id.
5. After the move, `pungmul` keeps five tracks, and its name and third marker still describe minyo. Should it be renamed "Pungmul (nongak)" with its definition rewritten?
6. Should `check_evidence.py` join link text to a following particle for Korean (and Japanese) pages?
