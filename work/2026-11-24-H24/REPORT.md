# H24: Source check of the course lectures (decision D29)

Date: 2026-11-24. Branch: `helper/2026-11-24-h24`. The run was configured with model `claude-opus-5-5`, as given in the session's system prompt. I cannot see which model actually served each turn. Sub-agents: none.

**Which assignment:** this run's fire named H24 ("From the lead: take assignment H24"). Step 2 of `work/README.md` allows that when the assignment is `open` and has no `helper/*` branch. Both held, so I took H24 rather than the first open assignment.

## What was asked
Check every sentence of the eleven chapter lectures in `data/course.json` that states a fact about the world. For each one, find a source a script can read, copy the supporting string from the raw text, and class the sentence: `supported`, `wrong`, `too strong`, `opinion` or `not found`. Do not rewrite the lectures.

## What is in this folder
- `claims.json`: all 124 lecture sentences, one per line. Each line has `id` (chapter.paragraph.sentence), `chapter`, `sentence`, `class`, `url`, `quote`, `note` and `also`. `also` holds further quotes that support other parts of the same sentence.
- `sources.json`: the 96 quotes (main and `also`) in the shape `tools/check_evidence.py` reads, under the key `"course"`.
- `evidence-check.json`: the check's output. All 96 are `found`.
- `scripts/`: the scripts used.
  - `sentences.py` numbers the sentences.
  - `wiki.py` fetches raw Wikipedia text and shows passages around keywords.
  - `claims.py` holds the class, source and note for every sentence.
  - `build.py` refuses any quote that is not a verbatim piece of its cached raw page, then writes `claims.json` and `sources.json`.

## How it was done
- **Splitting.** Sentences were split at full stops. The course thesis (two paragraphs before chapter 1) was not part of the ask and was not checked.
- **Sources.** Every source is an English Wikipedia article, fetched as raw text (`?action=raw`) from the shell on 2026-11-24. Quotes were copied from that text, and `build.py` checked each one as an exact substring before the evidence script ran.
- **One claim, several parts.** Where a sentence makes several claims, the main quote supports the part that decides the class, and `also` supports the rest. A sentence is `supported` only when its factual core is supported. Parts that were not checked are named in `note`.
- **`opinion` covers three things:**
  - instructions to the listener ("Listen for the bass");
  - statements about the course or the site;
  - framings and judgements ("it is not a lesser one").

  Some of these contain a checkable kernel. Where they do, the note says so.

## What was found
Counts per class (124 sentences):

| Class | Count |
| :- | -: |
| supported | 49 |
| too strong | 12 |
| wrong | 3 |
| not found | 6 |
| opinion | 54 |

By chapter (not counting `opinion`):

| Chapter | Supported | Too strong | Wrong | Not found |
| :- | -: | -: | -: | -: |
| 1 | 0 | 1 | 2 | 0 |
| 2 | 3 | 1 | 0 | 1 |
| 3 | 6 | 2 | 0 | 0 |
| 4 | 6 | 2 | 0 | 1 |
| 5 | 6 | 1 | 1 | 0 |
| 6 | 3 | 1 | 0 | 1 |
| 7 | 5 | 1 | 0 | 0 |
| 8 | 9 | 0 | 0 | 0 |
| 9 | 4 | 1 | 0 | 0 |
| 10 | 5 | 1 | 0 | 2 |
| 11 | 2 | 1 | 0 | 1 |

### Wrong (3)
- **1.2.2** "There is one line of melody and no harmony under it."
  - This is true of Gregorian chant. It is not true of gagaku, one of the three stops the sentence covers.
  - Gagaku: "(bamboo mouth organ used to provide harmony)" (the shō).
- **1.2.4** "The pace is set by breath, not by a drum."
  - Gagaku "is performed using wind, percussion, and string instruments". Its drums are the kakko, shōko and taiko.
  - For chant, free rhythm is one reading among several, according to the source.
- **5.2.1** "The first music to travel this way is Black American."
  - Enrico Caruso: "the first international recording star, Caruso made around 250 commercially released recordings between 1902 and 1920".
  - Jazz was first recorded in 1917, and blues by a Black singer in 1920.

### Too strong (12)
- **1.1.1** "Nearly all the music made before the year 1000 is gone."
  - History of music supports only that "many texts survive without their accompanying music".
- **2.3.2** "[[Georgian polyphonic singing]] shows that singing in several parts did not need notation."
  - The source supports that it is an oral heritage (UNESCO list, 2001). It does not say the polyphony arose without notation.
- **3.2.1** "In Europe the same centuries are the [[Baroque]]."
  - The Baroque runs "from about 1600 to 1750". The chapter runs to 1800.
- **3.2.2** "Opera appears in Italy around 1600, and harmony settles into the system of keys that Western music used for the next three hundred years."
  - The opera part is supported.
  - The common practice period was "the period of about 250 years" (c. 1650 to 1900), not three hundred.
- **4.1.4** "By the end of the century the trade in New York has a name, [[Tin Pan Alley]], and a method: write to a formula, sell by the thousand."
  - Grove dates the name's "first use from 1903", just after the century ends.
- **4.3.2** "[[Spirituals and work songs]] are the root of most of what America later exports."
  - The source supports them as roots of the blues and of gospel, nothing wider.
- **5.3.1** "The pattern repeats wherever there is a port, a recording studio and a radio station: [[Cuban son]] in Havana, [[Samba]] in Rio de Janeiro, [[Mariachi and ranchera]] in Mexico, [[Chanson]] in Paris."
  - Son in Havana and samba in Rio are supported.
  - Chanson as a modern popular style "emerged in the 1950s and 1960s".
  - Mariachi grew in the countryside of western Mexico, not through a port.
- **6.3.2** "Its dance music reaches New York and Mexico City and comes back larger as [[Mambo and cha-cha-chá]]."
  - The mambo craze in Mexico and the US is supported.
  - Cha-cha-chá was created in Cuba "in the early 1950s". That is after this chapter, and it did not come back from abroad.
- **7.2.4** "Cuban son was built on African rhythm, and [[Congolese rumba and soukous]] takes it home and makes it new."
  - Son "blends elements of Spanish and African origin".
- **9.1.1** "Around 1980 the drum machine, the synthesizer and then the sampler become cheap enough to own."
  - The 808 (1980) cost US$1,195 new. It became affordable "on the used market" over the 1980s.
- **10.2.1** "Production concentrates in a few hands, as in [[Teen pop (Max Martin era)]], while distribution scatters."
  - The source supports one producer with many hits (31 US number ones), not a general concentration.
- **11.2.3** "Korean pop fills stadiums on every continent."
  - BTS sold out Wembley and the Rose Bowl: Europe and North America only.

### Not found (6)
- 2.1.2: polyphony planned on the page. Note that polyphony is older than the staff: the first rules are in Musica enchiriadis, c. 895.
- 4.1.1: industrial cities building a music business.
- 6.1.1: networks putting one song before a nation in a week.
- 10.1.3: listening grew while sales fell.
- 10.1.4: the same.
- 11.1.1: nearly all recorded music one search away.

## Sources
All are English Wikipedia articles, raw text (`https://en.wikipedia.org/wiki/<Title>?action=raw`), read 2026-11-24. Each sentence's address is in `claims.json`. The articles are:

808s & Heartbreak, Afrobeat, Afrobeats, Alam Ara, Album era, Amapiano, Atlantic slave trade, Baroque music, Bolero, Bossa nova, BTS, Call and response (music), Cha-cha-chá (music), Chanson, Chicago blues, Common practice period, Compact disc, Congolese rumba, Crazy Blues, Crooner, Cumbia, Dancehall, Despacito, Disco, Dub music, Electric guitar, Enrico Caruso, Flamenco, Funk, Gagaku, Ghazal, Gnawa, Gregorian chant, Guido of Arezzo, Heavy metal music, Hindi film music, Hindustani classical music, History of music, House music, Indian classical music, J-pop, Jungle music, K-pop, Koto (instrument), Louis Armstrong, Mambo (music), Maracatu, Mariachi, Max Martin, MTV, Multitrack recording, Music industry, Music of Georgia (country), Musical nationalism, Napster, Opera, Phonograph, Phonograph record, Reggaeton, Remix, Rock and roll, Roland TR-808, Salsa music, Samba, Sheet music, Single (music), Ska, Son cubano, Soul music, Spirituals, Swing music, Tango, Teatro San Cassiano, Techno, Tin Pan Alley, Transistor radio.

## What fell short
- **Wikipedia only.** Every source is a Wikipedia article. For a course, a reviewer may want a second, non-encyclopaedic source for the three `wrong` and twelve `too strong` sentences before the text changes. That was not part of this run.
- **Partly supported sentences.** Several `supported` sentences have parts that were not checked, for example "write to a formula" (4.1.4), collectors writing down songs (4.2.2) and "the producer becomes an author" (8.1.2). Each one is named in that sentence's `note`.
- **Judgement in the classing.** The line between `opinion` and a checkable claim is my judgement. Notes show where an `opinion` sentence contains a checkable kernel (2.1.3, 2.3.3).
- **Split sentences.** Sentences were split at full stops, so "Listen for what these have in common." counts as its own `opinion` line.

## Questions for the lead
1. **Gagaku in chapter 1.** Two of chapter 1's three "in common" sentences fail for gagaku (harmony from the shō, and drums). Is the fix to the sentences, or to which stops the chapter names?
2. **Correct a lecture or the stop list?** Several `too strong` sentences come from a chapter's period not matching a stop (Baroque to 1750, cha-cha-chá in the 1950s, chanson from the 1950s). Should the lecture be corrected, or the stop list per chapter?
