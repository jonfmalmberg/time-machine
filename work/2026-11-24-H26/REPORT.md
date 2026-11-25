# H26: Genre stories for the course, chapters 1 to 4
2026-11-24, branch `helper/2026-11-24-h26`. Run configured as `claude-opus-5-5` (Opus 5.5). Five research sub-agents, all started with model `opus`; each reported itself as `claude-opus-5-5`.

Note: this run first chose H25 (first open), but its claim push was refused because another run had already claimed `helper/2026-11-24-h25`, so it took the next open assignment, H26, as `work/README.md` says.

## What was asked
A story of 120 to 200 words for each of the 19 genres in `work/2026-11-24-stories/genres.H26.json`, in four beats (before; who and where; why and how; after), every factual sentence backed by a string copied from the raw text of a page a script can read. Only `found` sentences stay.

## What is in this folder
- `stories.json`: the 19 stories in queue order: `genre`, `story`, `words`, `sentences` (each with `text`, `beat`, and `evidence`: a list of `url` + `quote`), `beats_missing`, `disagreements` (with url and quote), `notes`.
- `sources.json`: every quote in the checker's input shape (`{genre: [{url, quote, title: "<genre>.<sentence>.<quote>", claim}]}`), 361 quotes.
- `evidence-check.json`: output of `tools/check_evidence.py` over `sources.json`, run by this helper after merging: **361 of 361 found**.
- `source-list.json`: the pages each researcher read, per genre (title, address).
- `parts/<genre>.json`: each sub-agent's file as handed back (same content as `stories.json`, plus their source lists).
- `records/<genre>.json`: copies of our `data/genres.json` records, given to the sub-agents to read first. Not new data.
- `BRIEF.md`: the exact brief given to each sub-agent.

## What was found
All 19 stories written; all four beats present in every one; no sentence is marked opinion; no sentence was dropped at the final check.

| Genre | Words | Sentences | Thin beats / gaps |
| :- | -: | -: | :- |
| gregorian | 196 | 8 | "who" names popes, Pepin, Charlemagne, Chrodegang; no singer at Metz is named on the page |
| tilawa | 197 | 8 | "before" tells the revelation, not what music it grew from (nothing sourced) |
| gagaku | 199 | 8 | — |
| hindustani | 198 | 8 | Khusrau credited only with ragas; the source doubts he created khyal |
| carnatic | 197 | 8 | — |
| georgianpolyphonic | 148 | 8 | "who" names no person before Rustavi (1968) |
| wadrum | 190 | 8 | follows the Yoruba thread only; "before" rests on the talking drum's origin |
| maracatu | 184 | 8 | — |
| gnawa | 177 | 8 | — |
| baroque | 200 | 8 | — |
| ghazal | 198 | 8 | music begins with Begum Akhtar; nothing says how it was sung in 18th-century Lucknow |
| japart | 196 | 7 | shamisen Edo stage music left out (no checkable names or dates) |
| flamenco | 199 | 8 | — |
| tinpan | 200 | 9 | nothing on song form (no source for the AABA marker) |
| romantic | 198 | 9 | — |
| spirituals | 200 | 9 | nothing on work songs (no names, places or dates in the source) |
| tango | 199 | 8 | bandoneón not mentioned (no sourced account of its arrival) |
| cumbia | 200 | 9 | — |
| bolero | 194 | 9 | — |

### Where sources disagree with our record (details with url and quote in `stories.json`)
- **gregorian** (800–1200): Roman–Gallican blend about 750, main growth 9th–10th centuries, spread over other chant into the 12th–13th.
- **tilawa**: no conflict with 610 or Mecca.
- **gagaku** (Nara, 700): English Wikipedia says it "was developed as court music of the Kyoto Imperial Palace" and took near-current form in the Heian period; 701 bureau and 752 Tōdai-ji performance still support the start.
- **hindustani** (1250): divergence "around the 12th century", though the 13th-century Sangita Ratnakara is often taken to date it. Softer start, not a contradiction.
- **carnatic** (1500, Thanjavur): 16th-century flowering placed in Vijayanagara; Thanjavur's role is 18th–19th century. Song languages include Kannada and Malayalam beyond our marker.
- **georgianpolyphonic** (1000, Tbilisi): source says it predates Christianity (early 4th century) and is a village tradition in 16 regional styles.
- **wadrum** (1000): batá "about 500 years old"; drum signalling dated from the 18th century.
- **maracatu**: no conflict. English and Portuguese articles differ on when maracatu rural began.
- **gnawa** (Essaouira, 1600): source puts its birth in Morocco generally, "16th and 17th centuries"; Essaouira is tied to the festival (1998) and maalems such as Mahmoud Guinia.
- **baroque** (Venice, 1600): sources start in Florence (Camerata; Peri and Rinuccini's Dafne, 1598, or c.1597 in the Peri article); Venice comes in with Monteverdi from 1613 and San Cassiano in 1637.
- **ghazal** (sung, 1750, Lucknow): 18th-century Lucknow and Delhi were about the poetry; sung style "gained widespread popularity in the 20th century". Articles differ on the golden age and on Mir's birth year (1723 or 1725).
- **japart** (Kyoto and Edo, 1600): nothing read names Edo as an origin; the koto–shamisen–shakuhachi trio formed only after 1868, when the shakuhachi replaced the kokyū.
- **flamenco** (Seville, 1780): English Wikipedia says lower Andalusia, Jerez as first written trace; Spanish Wikipedia has a Seville singers' café by 1842. The English History section is tagged "Disputed section" (Aug 2021) and the founding claims rest on it.
- **tinpan** (1890–1955): article says about 1885; end given as either the 1930s or the 1950s.
- **romantic** (Vienna and Leipzig, 1820–1910): German article names Berlin, Dresden and Leipzig; Hoffmann's founding review is 1810; nothing found for 1910. Also: the record's `family` is `chant`, which looks wrong for this genre (checked: the record does say `chant`). Not changed.
- **spirituals** (1800): article says the tradition "began in the early 1700s"; the record's name includes work songs, which the source barely covers.
- **tango** (Buenos Aires, 1890): Alcorta and Sinforoso playing "from the early 1870s"; first newspaper mention 1866; origin given as Argentina and Uruguay (Buenos Aires and Montevideo).
- **cumbia** (1850): written accounts of gaitas and cumbiambas in 1821 (Arjona) and 1825–26 (Santa Marta).
- **bolero** (1885): "Tristezas" dated 1883; the same article's footnote gives Díaz Ayala's c.1885, matching the record.

## Sources
Mainly raw English Wikipedia wikitext (`https://en.wikipedia.org/wiki/<Title>?action=raw`) for each genre and linked articles on musicians, cities and instruments; Japanese Wikipedia 雅楽 for gagaku; Spanish Wikipedia Flamenco; German Wikipedia Musik der Romantik; Portuguese Wikipedia for maracatu. Full list per genre in `source-list.json`; every address used as evidence is in `sources.json`.

## What fell short
- Own-language articles were read only for gagaku (ja), flamenco (es), romantic (de) and maracatu (pt). Not read: Arabic and French for gnawa and tilawa, Italian for baroque, Japanese for japart, Georgian for georgianpolyphonic, Hindi/Tamil/Urdu for the Indian genres. es.wikipedia "Cumbia" is a disambiguation page and "Bolero cubano" redirects to "Bolero", so those used English only.
- **gagaku:** the names Buttetsu, Minamoto no Hiromasa, Fujiwara no Moronaga and Baekje, and "Taihō Code", are the sub-agent's romanised readings of kanji on the Japanese page (仏哲, 源博雅, 藤原師長, 百済, 大宝律令); the quotes are the kanji. A reader of Japanese should confirm the readings.
- **tilawa:** no English article for the genre itself ("Quran recitation" redirects to Qira'at); six related articles used. The loud-voice and 630 Kaaba details rest only on the Bilal ibn Rabah article, which carries "original research" and "essay" tags.
- **flamenco:** founding claims rest on a section tagged as disputed. **tango:** Golden Age dates carry a "citation needed" tag on the page.
- **wadrum:** Olatunji, in the "after" beat, was Ogu (Egun), not Yoruba; the story does not call him Yoruba, but the Yoruba-thread story ends with him.
- **georgianpolyphonic** is the shortest story (148 words); no medieval singer or composer could be sourced from English pages.
- **spirituals:** Harry Burleigh's songbook left undated (the article's 1929 was not confirmed by a second source).
- Our record's markers left unsourced in the stories: AABA form (tinpan), harmonium, tabla and sarangi (ghazal), bandoneón (tango).
- The lead has not checked that each quote supports its sentence; the script checks only that the quote is on the page. I read the tilawa and gagaku stories against their quotes and found them supported; the other 17 were not read sentence by sentence by this run.

## Questions for the lead
1. Many records' start dates or origins sit later or narrower than the sources (gnawa, baroque, ghazal, japart, flamenco, tinpan, romantic, spirituals, tango, cumbia, bolero, gagaku, carnatic). Change the records, or keep them as a "when it took its recognised form" window?
2. `romantic` has `family: chant`. Intended?
3. `japart` groups koto, shamisen and shakuhachi from 1600, but the trio formed after 1868. Keep the grouping?
4. Stories that rest on pages tagged disputed or original research (flamenco, tilawa): acceptable as sourced, or need a second source?
