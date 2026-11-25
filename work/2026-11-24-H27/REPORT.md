# H27: Genre stories for the course, chapters 5 to 8
Date 2026-11-24. Branch `helper/2026-11-24-h27`. Run configured with model `claude-opus-5-5`. Sub-agents: five, each started with the Agent tool's model `opus`; each reported its identifier as `claude-opus-5-5`.

Note: this run first chose H25, then H26; both already had claim branches pushed by other runs, so it took H27.

## What was asked
For the 20 genres in `work/2026-11-24-stories/genres.H27.json` (chapters 5 to 8), a 120 to 200 word story in four beats (before; who and where; why and how; after), every factual sentence backed by a string copied character for character from a page's raw text, and only `found` sentences kept.

## What is in this folder
- `stories.json`: one record per genre: `genre`, `story`, `sentences` (each with `n`, `beat`, `text`, `url`, `quote`), `beats_present`, `beats_missing`, `disagreements`, `notes`.
- `sources.json`: every quote in the shape `tools/check_evidence.py` reads, keyed by genre, `title` = sentence number.
- `evidence-check.json`: the check script's output over all 248 quotes.
- `BRIEF.md`: the brief each sub-agent was given.
- `records/<id>.json`: each genre's record copied from `data/genres.json`, plus its tree neighbours from `data/parentage.json` (input to the sub-agents).
- `parts/`: each sub-agent's per-genre files (story, sources, check), kept for the lead's review.

## What was found
All 20 stories have all four beats, 172 to 197 words, 11 to 14 sentences each, no `opinion` sentences. The lead-run check over the merged `sources.json`: 248 of 248 `found`. The sub-agents' first checks had four `near` results (a reference tag inside the quoted clause in blues/jazz/son/samba); each was shortened or replaced once and then found.

| genre | words | sentences |
| :- | -: | -: |
| blues | 177 | 13 |
| jazz | 180 | 14 |
| son | 176 | 14 |
| samba | 186 | 13 |
| mariachi | 190 | 12 |
| swing | 195 | 13 |
| filmi | 175 | 13 |
| mambo | 185 | 13 |
| gospel | 189 | 11 |
| rocknroll | 195 | 11 |
| rumbacongo | 180 | 11 |
| ska | 192 | 12 |
| soul | 193 | 14 |
| bossa | 197 | 12 |
| funk | 189 | 12 |
| disco | 197 | 12 |
| reggae | 182 | 12 |
| afrobeat | 172 | 13 |
| salsa | 177 | 12 |
| metal | 181 | 11 |

## Where the sources disagree with our record
As recorded by the sub-agents (quotes and addresses in each genre's `disagreements` in `stories.json`). Not acted on.

### blues
- began: record says 1900; source puts the origins earlier: "But the origins of the blues were some decades earlier, probably around 1890." (https://en.wikipedia.org/wiki/Blues?action=raw). The record's 1900 fits the first written reports and is arguably the start of the documented music, but the lead may want to note it.
- _tree_came_from griot (other): the source is split. Against: "the blues form itself bears no resemblance to the melodic styles of the West African [[griot]]s"; for a narrower link: "The [[Griot]] tradition of the Sahel also may have influenced [[talking blues]]" (https://en.wikipedia.org/wiki/Blues?action=raw).

### jazz
- began: record says 1915; source says "Jazz originated in the late-19th to early-20th century." and "Cornetist Buddy Bolden played in New Orleans from 1895 to 1906." (https://en.wikipedia.org/wiki/Jazz?action=raw). First recordings were early 1917. The record's 1915 is a window choice, not a date the source gives.

### son
- origin: record says Oriente; source gives Oriente as the majority view but adds "it has become increasingly clear for musicologists that different versions of the son, i.e. styles that fall within the so-called '''son complex''', appeared throughout the rural parts of the island by the end of the 1890s", and an alternative hypothesis (Peter Manuel) that much of son's structure came from Havana's contradanza (https://en.wikipedia.org/wiki/Son_cubano?action=raw).
- ended: record says 1960; the source says "By the late 1930s, the heyday of \"Classic son\" had largely ended." The only 1960 in the article is Trío Matamoros' retirement (https://en.wikipedia.org/wiki/Son_cubano?action=raw).
- began: record says 1900; source puts the precursors in "the mid-to-late 19th century" and the genre's expansion in Havana "in the 1910s".

### samba
- began: record says 1917; source agrees that "Pelo Telefone" (released 19 January 1917) is usually taken as the start, but notes earlier records labelled samba: "Its primacy as \"the first samba in history\" has, however, been questioned by some scholars" (https://en.wikipedia.org/wiki/Samba?action=raw), citing 1913 and 1914 recordings.
- _tree_came_from: the source fits both neighbours (lundu named among rural roots; the opening section says the guitar and cavaquinho accompaniment is one "whose inspiration is [[choro]]"), but it names maxixe as the main model for the first recorded sambas: "structural similarities to the [[Lundu (dance)|lundu]] and, mainly, to the [[Maxixe (dance)|maxixe]]" (https://en.wikipedia.org/wiki/Samba?action=raw). Maxixe is not a tree neighbour; the lead may want to check.

### mariachi
- Began: the record says 1900; the article puts the genre's separation from son jalisciense in the 19th century ("The distinction of mariachi from the older son jalisciense occurred slowly sometime during the 19th&nbsp;century.", https://en.wikipedia.org/wiki/Mariachi?action=raw) and the infobox gives "18th century, [[Cocula, Jalisco]]". The first recordings (1908-1909) and the 1905 Mexico City visit fit a 1900s start for the recorded/urban form.
- Tree: the record's only parent is iberianpop. The article names son jalisciense as the parent ("Modern mariachi music developed from this ''son'' style", https://en.wikipedia.org/wiki/Mariachi?action=raw) and Spanish instruments and ensembles as the earlier root; it says nothing of a popular-song parent.
- Sound: the record's marker 'two trumpets' matches ("two trumpets and at least one guitar", https://en.wikipedia.org/wiki/Mariachi?action=raw); the record's 'powerful solo singer' differs from the article's "There is generally no lead singer as in other kinds of groups, with all players singing choruses and taking turns singing the lead." (https://en.wikipedia.org/wiki/Mariachi?action=raw)

### swing
- Began: the record says 1930; the article dates the swing era from Goodman's 1935 Palomar engagement ("which launched the \"[[swing era]]\" that lasted until 1946", https://en.wikipedia.org/wiki/Swing_music?action=raw) and its roots to the 1920s. 1930 matches the article's 'Early swing' section ("As the 1920s turned to the 1930s"). Ended 1946 matches.
- Origin: the record says Harlem and Kansas City; the article supports New York (Roseland, Savoy, Cotton Club) and Kansas City, plus Chicago (Earl Hines at the Grand Terrace from 1928) and the southwest territory bands. Harlem itself is not named in the raw text I read.
- Tree: the article also names gypsy swing (Django Reinhardt), western swing and jump blues as offshoots ("Belgian guitarist [[Django Reinhardt]] helped develop the [[gypsy swing]] subgenere", https://en.wikipedia.org/wiki/Swing_music?action=raw); these agree with the record's gypsyjazz and rnb neighbours. No disagreement found.

### filmi
- Tree: the record's principal parent is hindustani. The English article names theatre sources (Ramleela, nautanki, tamasha, Parsi theatre) and "derive their inspiration from both classical and modern sources" (https://en.wikipedia.org/wiki/Hindi_film_music?action=raw), but does not name Hindustani classical music specifically; Parsi theatre is not on the tree as a parent.
- Origin: the record says Mumbai. Alam Ara was shot in Bombay (quote in sentence 4), but playback singing came from New Theatres, a Calcutta studio, in Dhoop Chhaon (1935) (Raichand Boral article). The Calcutta location of New Theatres is not stated in the quotes used, so the story does not say it.

### mambo
- Tree: the record's parents are son, swing and habanera. The article's infobox gives "{{hlist|[[Danzón]]|[[swing music|swing]]|[[son cubano]]}}" (https://en.wikipedia.org/wiki/Mambo_(music)?action=raw): danzón is the direct parent and is not on the tree; habanera is not mentioned.
- Ended: the record says 1960; the article says mambo "continued to enjoy some degree of popularity into the 1960s" and the Palladium closed in 1966 (https://en.wikipedia.org/wiki/Mambo_(music)?action=raw); cha-cha-chá dates from the early 1950s ("Early 1950s, [[Cuba]]", https://en.wikipedia.org/wiki/Cha-cha-chá_(music)?action=raw).
- Origin: Havana matches the infobox ("Late 1930s, [[Havana]]", https://en.wikipedia.org/wiki/Mambo_(music)?action=raw), but the big-band brass mambo of the record's sound was made in Mexico City from 1949 by Pérez Prado (sentence 5), not in Havana.

### gospel
- Record began 1930 / origin Chicago agrees with the genre article: 'It has been said that 1930 was the year traditional black gospel music began, as the National Baptist Convention first publicly endorsed the music at its 1930 meeting.' (https://en.wikipedia.org/wiki/Gospel_music?action=raw). The same article traces gospel much earlier: 'Gospel music can be traced to the early 17th century.' and dates the term to 1874 (Philip Bliss); the record's 1930 start therefore describes Black gospel only.
- Record ended 1970: no source gives an end. The Dorsey article speaks of 'Encountering a "golden age" between 1940 and 1960' (https://en.wikipedia.org/wiki/Thomas_A._Dorsey?action=raw); the genre article's next section says 'Urban contemporary gospel emerged in the late 1960s and early 70s' (Gospel_music), which fits a 1970 end but does not state one.

### rocknroll
- Record began 1954: the genre article says it 'evolved in the [[United States]] during the late 1940s and early 1950s' and 'the genre did not acquire its name until 1954' (https://en.wikipedia.org/wiki/Rock_and_roll?action=raw). 1954 is the year of the name and of the Haley and Presley recordings, not of the sound's first appearance.
- Record origin Memphis: the article names no single birthplace. Memphis is supported only as the site of Presley's July 1954 Sun Studio session; the name was popularised in Cleveland ('In 1951, [[Cleveland]], Ohio, disc jockey [[Alan Freed]] began playing this music style'), and the article names St. Louis, Memphis, New York, Detroit, Chicago, Cleveland and Buffalo among the cities of the migration that underlies it.
- Record ended 1960 agrees with: 'the death of [[Eddie Cochran]] in a car crash (April 1960) gave a sense that the initial phase of rock and roll had come to an end' (Rock_and_roll).
- Tree came_from lists rnb and country only; the article also names gospel: 'with stylistic influences from [[gospel music|gospel]], [[jazz]], [[boogie-woogie]]' (Rock_and_roll). Worth a look given the gospel->rnb edge already exists.

### rumbacongo
- Record began 1950: the article places the formation earlier: 'In August 1941, [[Paul Kamba]] formed the Victoria Brazza ensemble in Poto-Poto', Ngoma's studio from 1948 ('Shortly after Ngoma's inauguration in 1948'), and 'During the mid-1940s and 1950s, the influence of [[Son cubano|Cuban son]] bands transformed ''maringa'' into "Congolese rumba,"' (https://en.wikipedia.org/wiki/Congolese_rumba?action=raw). A start in the 1940s would fit the source better.
- Record origin Kinshasa: the article names both cities: 'particularly in the cities of [[Kinshasa]] and [[Brazzaville]]' (Congolese_rumba); Kamba's 1941 band was in Poto-Poto, Brazzaville.
- Record name joins rumba and soukous; the article treats soukous as a later derivative: 'The 1960s and 1970s saw the emergence of [[soukous]], an urban dance music style derived from Congolese rumba' (Congolese_rumba).

### ska
- Record began 1959 agrees with the first 45 rpm issues 'sometime in the second half of 1959' (https://en.wikipedia.org/wiki/Ska?action=raw); the article's own lead is inconsistent, saying both 'originated in [[Jamaica]] in the late 1950s' and 'It was developed in Jamaica in the 1960s'.
- Record ended 1966 agrees with 'In 1965 and 1966, when American soul music became slower and smoother, ska changed its sound accordingly and evolved into [[rocksteady]].' (Ska).
- Origin of the beat is disputed in the source: Prince Buster's flip is given as 'One theory about the origin of ska'; the story says 'One account credits'.

### soul
- Began: record says 1959; Soul_music says it 'originated ... in the late 1950s and early 1960s', and Guralnick (quoted there) dates the movement to 1961: "Soul started, in a sense, with the 1961 success of Solomon Burke's \"Just Out of Reach\"." (https://en.wikipedia.org/wiki/Soul_music?action=raw). 1959 matches Tamla's founding, not a stated start of soul.
- Origin: record says Detroit and Memphis; Soul_music says it 'originated in [[African-American culture|African-American]] [[African-American neighborhood|communities]] throughout the United States' (https://en.wikipedia.org/wiki/Soul_music?action=raw) and names Atlantic (New York) and Ray Charles, Sam Cooke as forefathers. Detroit and Memphis fit the record's 'Soul and Motown' scope but are not the only origin the source gives.
- Ended: record says 1975; no source found that names an end year. Soul_music describes soul 'informing most subsequent forms of R&B from the 1970s-onward' (https://en.wikipedia.org/wiki/Soul_music?action=raw).

### bossa
- Sound/came_from: record lists modjazz as a parent and the sound as 'jazz chords'; Bossa_nova says 'A common misconception is that these complex chords and harmonies were derived from [[jazz]], but samba guitar players have been using similar [[arrangement]] structures since the early 1920s', while also saying 'bossa nova was influenced by jazz' (https://en.wikipedia.org/wiki/Bossa_nova?action=raw). Not a contradiction of the 'other' jazz link, but the record's wording 'jazz chords' is the view the article calls a misconception.
- Began: record says 1958; Bossa_nova says 'developed in the late 1950s and early 1960s' and calls the 1959 LP Chega de Saudade 'the landmark of the birth of bossa nova'. The Cardoso album (Canção do Amor Demais) is not dated in the article, so 1958 is not confirmed by this source.
- Ended: record says 1970; no source found for an end year. The article traces bossa nova abroad into the 1960s-70s and later revivals.
- Led_to: record has shibuyakei as a successor; the article supports a Japanese bossa nova boom from 1967 but does not name Shibuya-kei.

### funk
- Origin: record says Augusta and Cincinnati; the Funk article names neither. It places the roots in New Orleans R&B ('Longhair's rhythmic approach became a basic template of funk') and says funk 'originated in [[African-American]] communities in the mid-1960s' (https://en.wikipedia.org/wiki/Funk?action=raw). Augusta/Cincinnati is not contradicted, but it is unsourced here.
- Began: record says 1965; the article dates Brown's shift from his 1964 single 'Out of Sight' and his 1965 hits. Consistent within a year.
- Ended: record says 1980; the article says 'The 1970s were the era of highest mainstream visibility for funk music' and that by 'the latter half of the 1980s, pure funk had lost its commercial impact' (https://en.wikipedia.org/wiki/Funk?action=raw). The source suggests a later fade than 1980.

### disco
- Began: record says 1974; Disco says it 'emerged in the late 1960s from the United States' urban [[nightclub|nightlife]] scene' (https://en.wikipedia.org/wiki/Disco?action=raw), and History of disco dates the Loft's first party to 1970. 1974 is roughly when the sources' list of early disco hits and the first disco radio show (WPIX-FM, 1974) fall, so it is defensible as a start of the recorded genre but earlier than the sources' start.
- Origin: record says New York; Disco names 'New York City (especially [[Brooklyn]]), [[Philadelphia]], and [[Baltimore]]' and History of disco's infobox says 'Philadelphia and New York City'. The story includes Philadelphia (Gamble and Huff).
- Ended: record says 1981; Disco says it declined after 12 July 1979 and 'continued to sharply decline in popularity in the U.S. during the early 1980s'. Consistent.

### reggae
- Record began 1968 agrees with the sources (first reggae records 1968). Record ended 1985 is not addressed by either source; neither gives an end date. (https://en.wikipedia.org/wiki/Reggae?action=raw)
- Dub is credited to 1968 experiments but became a named subgenre only by 1973: 'By 1973, through the efforts of several independent and competitive innovators, engineers, and producers, instrumental reggae "versions"' (https://en.wikipedia.org/wiki/Dub_music?action=raw); the record's single 1968 start covers both.
- The Dub_music article says the first-year date is disputed: 'Another source puts 1967 and not 1968 as the initial year of the practice of putting instrumental versions' (https://en.wikipedia.org/wiki/Dub_music?action=raw).

### afrobeat
- Record began 1970; the article dates it earlier: 'Afrobeat evolved in [[Nigeria]] in the late 1960s by [[Fela Kuti]]' and infobox 'cultural_origins  = 1960s'. 1970 matches the Africa '70 / Afrika Shrine residency start. (https://en.wikipedia.org/wiki/Afrobeat?action=raw)
- Record origin Lagos: the article does not say the Afrika Shrine was in Lagos, only that Kuti returned to Lagos earlier; the story says 'his own club' without a city. (https://en.wikipedia.org/wiki/Afrobeat?action=raw)
- Record came_from lists highlife, funk, modjazz; the article also names fuji, jùjú and Yoruba music as sources ('Afrobeat was influenced by a combination of different genres, such as [[highlife]], [[Fuji music|fuji]], and [[Jùjú music|jùjú]]'). (https://en.wikipedia.org/wiki/Afrobeat?action=raw)

### salsa
- Record origin New York (Spanish Harlem): the article never mentions Spanish Harlem; it names the Palladium and later the Cheetah in Manhattan ('By the early 1970s, the music's center moved to Manhattan and the [[Cheetah (nightclub)|Cheetah]]'). (https://en.wikipedia.org/wiki/Salsa_music?action=raw)
- Record began 1965; the article puts the first self-identified salsa band in Cuba in 1955: 'The first self-identified salsa band is Cheo Marquetti y su Conjunto - Los Salseros which was formed in 1955 in Cuba.' and says the term was first used commercially in New York in the 1970s. (https://en.wikipedia.org/wiki/Salsa_music?action=raw)
- Fania's founding is dated 'During the late 1960s' but the same article says 'Fania's first record album was "Cañonazo", recorded and released in 1964.' The article contradicts itself; the story uses neither 1964 nor a founding year. (https://en.wikipedia.org/wiki/Salsa_music?action=raw)
- Record came_from mambo (principal) and son (other): the article treats son montuno as the primary basis ('Most songs considered as salsa are primarily based on [[son montuno]] and [[son cubano]]'), so son may deserve 'principal'. (https://en.wikipedia.org/wiki/Salsa_music?action=raw)

### metal
- Record origin Birmingham, UK: the article says critics disagree on the first band: 'Most credit the British bands [[Led Zeppelin]] and [[Black Sabbath]], with American commentators tending to favour Led Zeppelin'. (https://en.wikipedia.org/wiki/Heavy_metal_music?action=raw)
- Record began 1970; the article says 'In 1968, the sound that would become known as heavy metal began to coalesce.' and names Blue Cheer's January 1968 'Summertime Blues' as considered by many the first true heavy metal recording. 1970 matches the first Black Sabbath album. (https://en.wikipedia.org/wiki/Heavy_metal_music?action=raw)
- Record ended 1990 is not supported or contradicted; the article continues the genre's history through the 2020s. (https://en.wikipedia.org/wiki/Heavy_metal_music?action=raw)

## Sources
All English Wikipedia, fetched as raw text (`?action=raw`) on 2026-11-24:

- https://en.wikipedia.org/wiki/Blues?action=raw (blues)
- https://en.wikipedia.org/wiki/Jazz?action=raw (jazz)
- https://en.wikipedia.org/wiki/Son_cubano?action=raw (son)
- https://en.wikipedia.org/wiki/Samba?action=raw (samba)
- https://en.wikipedia.org/wiki/Mariachi?action=raw (mariachi)
- https://en.wikipedia.org/wiki/Swing_music?action=raw (swing)
- https://en.wikipedia.org/wiki/Hindi_film_music?action=raw (filmi)
- https://en.wikipedia.org/wiki/Alam_Ara?action=raw (filmi)
- https://en.wikipedia.org/wiki/Playback_singer?action=raw (filmi)
- https://en.wikipedia.org/wiki/Raichand_Boral?action=raw (filmi)
- https://en.wikipedia.org/wiki/Lata_Mangeshkar?action=raw (filmi)
- https://en.wikipedia.org/wiki/Mambo_(music)?action=raw (mambo)
- https://en.wikipedia.org/wiki/Cha-cha-chá_(music)?action=raw (mambo)
- https://en.wikipedia.org/wiki/Thomas_A._Dorsey?action=raw (gospel)
- https://en.wikipedia.org/wiki/Gospel_music?action=raw (gospel)
- https://en.wikipedia.org/wiki/Rock_and_roll?action=raw (rocknroll)
- https://en.wikipedia.org/wiki/Congolese_rumba?action=raw (rumbacongo)
- https://en.wikipedia.org/wiki/Ska?action=raw (ska)
- https://en.wikipedia.org/wiki/Soul_music?action=raw (soul)
- https://en.wikipedia.org/wiki/Motown?action=raw (soul)
- https://en.wikipedia.org/wiki/Bossa_nova?action=raw (bossa)
- https://en.wikipedia.org/wiki/Música_popular_brasileira?action=raw (bossa)
- https://en.wikipedia.org/wiki/Funk?action=raw (funk)
- https://en.wikipedia.org/wiki/Disco?action=raw (disco)
- https://en.wikipedia.org/wiki/History_of_disco?action=raw (disco)
- https://en.wikipedia.org/wiki/Reggae?action=raw (reggae)
- https://en.wikipedia.org/wiki/Dub_music?action=raw (reggae)
- https://en.wikipedia.org/wiki/Afrobeat?action=raw (afrobeat)
- https://en.wikipedia.org/wiki/Salsa_music?action=raw (salsa)
- https://en.wikipedia.org/wiki/Heavy_metal_music?action=raw (metal)

## What fell short
- Every source is English Wikipedia. No story uses an article in the tradition's own language or a reference work, so the stories carry Wikipedia's framing (see the disagreements above). The brief allowed this order; a second source would let the lead see where Wikipedia stands alone.
- In some sentences a name or place comes from the text next to the quote rather than from inside it, so the quote alone does not prove it: filmi (Wazir Muhammad Khan), mambo (Pérez Prado; the Palladium, New York), mariachi (Mariachi Vargas de Tecalitlán), swing ("southwest"), samba (Tia Ciata: the quote says "its members"), reggae sentence 5 ("As record shops spread"). The check script cannot see this; the lead should read these sentences against the page or have the quotes lengthened.
- Mariachi and ranchera: the story has nothing on ranchera.
- Son: the clave sentence (about 1910) sits after the 1917 and 1920 sentences because the beats must be in order.
- Son lost the names of its early rural styles (changüí, nengón) and jazz lost Armstrong's Chicago success when their quotes were shortened to pass the check.
- Gospel: ten of eleven sentences come from the Thomas A. Dorsey article, because the Gospel music article is mostly about Southern and white hymnody; the story is close to a Dorsey biography.
- Disco: the History_of_disco article carries a June 2026 "AI-generated" tag on its lead; no quotes were taken from that lead, only from the body.
- Tree neighbours not sourced in the "after" beat: reggae → hip hop, jungle, trip hop (the only sentence naming them is tagged original research on Wikipedia); afrobeat → nigerianreggae; metal → glam metal and regional scenes; bossa → Shibuya-kei.
- Two sub-agents ran one read-only `git status`, against the brief's "do not use git"; nothing changed. Two sub-agents shared a scratch folder outside the repository and one overwrote the other's working file; the affected agent rebuilt its files, and the merged check above confirms all final quotes.

## Questions for the lead
1. Should stories draw on a second source per genre (own-language Wikipedia or a reference work) before use, given that all 20 rest on English Wikipedia alone?
2. Where the record's start or end year disagrees with the sources (blues, jazz, son, mariachi, soul, disco, rumbacongo, afrobeat, salsa, mambo, rock and roll), should the record change or should the story say the sources differ?
3. Suggested tree changes from the sources (maxixe for samba, son jalisciense for mariachi, danzón for mambo, son montuno as a principal parent of salsa, gospel for rock and roll, theatre traditions for filmi; bossa's jazz-chord wording and its modjazz parent are disputed by its article): for the lead's review, not proposed as changes.
