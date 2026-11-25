# H28: Genre stories for the course, chapters 9 to 11
2026-11-24, branch `helper/2026-11-24-h28`. Run configured as `claude-opus-5-5`; I cannot see which model actually served each turn. Four research sub-agents, all started with model `opus`; each reported itself as `claude-opus-5-5`.

**Which assignment:** the run was started with a note asking for H25. `helper/2026-11-24-h25` already existed, holding a claim and a hand-back from another run, so I did not take H25 (`work/README.md` step 2). H26 and H27 also had branches. H28 was the first open assignment without one; I claimed it with an empty commit before starting.

## What was asked
For each of the 16 genres in `work/2026-11-24-stories/genres.H28.json`, write a story of 120 to 200 words in four beats: before; who and where; why and how; after. Every factual sentence must be backed by a string copied from the raw text of a page a script can read. Only `found` sentences stay.

## What is in this folder
- `stories.json`: the 16 stories in queue order. Fields: `genre`, `story`, `words`, `sentences` (each with `text`, `beat`, and `evidence`, a list of `url` + `quote`), `beats_missing`, `disagreements`, `notes`.
- `sources.json`: every quote in the checker's input shape (`{genre: [{url, quote, title: "<genre>.<sentence>.<quote>", claim}]}`), 326 quotes.
- `evidence-check.json`: the output of `tools/check_evidence.py` over `sources.json`, which I ran after merging: **326 of 326 found**.
- `source-list.json`: the pages each researcher listed, per genre.
- `parts/<genre>.json`: each sub-agent's file as handed back. `stories.json` is built from these unchanged.
- `records/<genre>.json`: copies of our `data/genres.json` records, given to the sub-agents to read first. Not new data.
- `BRIEF.md`: the exact brief given to each sub-agent. It is H26's brief with one paragraph added on home-language articles.

## What was found
All 16 stories are written. Every story has all four beats, no sentence is marked opinion, and every evidence address is a raw-wikitext address (`?action=raw`).

| Genre | Words | Sentences | Thin places |
| :- | -: | -: | :- |
| house | 180 | 9 | Name origin: one of three competing accounts, marked "By one account" |
| techno | 195 | 9 | — |
| dancehall | 171 | 10 | The article's unsourced naming section is left out |
| jungle | 193 | 9 | Name origin: one of three accounts, marked "One account says" |
| jpop | 196 | 9 | Markers (English hooks, key changes, anime tie-ins) not sourced |
| kpop | 199 | 9 | Markers (mid-song genre switches) not sourced; Seoul not named |
| teenpop | 190 | 9 | Story follows Cheiron Studios; "pre-chorus lift" not sourced |
| reggaeton | 196 | 9 | Tempo 90–100 BPM not sourced |
| afrobeats | 199 | 10 | — |
| frenchhouse | 199 | 10 | Garnier and Rug at La Locomotive cut for length |
| y2krnb | 199 | 9 | No genre article; "after" has nothing on where the style ended around 2006 |
| melodic | 199 | 9 | "Melodic rap" redirects to Pop rap; built from the 808s & Heartbreak and So Far Gone articles |
| amapiano | 197 | 10 | "Why": no source says what producers aimed at; the story gives what changed |
| latintrap | 198 | 9 | The "why" sentence is the article's own uncited statement |
| moderntrap | 198 | 10 | The "Migos flow" triplet marker is not sourced; Lex Luger's Virginia origin left out |
| edmpop | 198 | 9 | No genre article; supersaw and big-room-kick markers not sourced |

### Where sources disagree with our record (details, with url and quote, in `stories.json`)
- **house** (1984, 120–125 BPM): the source gives 115–130 BPM. It traces the style to Knuckles at the Warehouse from 1977; 1984 is the first record. The source gives no 1990 end. Inside the source, the Warehouse closing is dated both 1982 and 1983.
- **techno** (Detroit, 1985): "first half of the 1980s"; Atkins used the word in 1981. The infobox also names Frankfurt.
- **dancehall** (1980): "late 1970s". Early dancehall used 1960s–70s reggae rhythms; the digital turn is 1985 (Sleng Teng), so "digital-era riddims" fits from 1985. The sources disagree on how many recordings used Sleng Teng (200 or 500); the story gives no number.
- **jungle** (London, 1992, 160–175 BPM): the origin is given as the United Kingdom. The article treats drum and bass as a mid-1990s successor, not part of jungle. Early tracks ran at about 130 BPM in 1990–91; drum and bass at 160–180.
- **jpop** (1990): Japanese Wikipedia says the word was proposed at J-WAVE at the end of 1988 and became a general genre name around 1993. An English infobox footnote credits Tetsuya Komuro instead.
- **kpop**: no disagreement with the 1992 start.
- **teenpop** (1997–2003): Cheiron ran 1992–2000 and its teen-pop work began with the Backstreet Boys in 1996; the Teen pop article starts the wave with "Wannabe" in 1996.
- **reggaeton** (San Juan, 1995): both Wikipedias say it came from Panama in the late 1980s and took shape in Puerto Rico in the early 1990s. They differ on when Daddy Yankee first said the word on Playero 34 (1994 in English, 1992 in Spanish).
- **afrobeats** (Lagos, 2008): Nigeria, Ghana and the UK, in the 2000s and 2010s; made in Lagos, Accra and London. Our record's log drums are not in the article (they belong to amapiano); it describes a clave rhythm instead.
- **frenchhouse** (1996–2002): early to mid 1990s (French Wikipedia: 1990), with a revival in the mid-2000s. Sidechain pumping and vocoder are in neither article. The English and French articles differ on the month of the first French Touch party in 1987.
- **y2krnb** (Virginia Beach, 1998): Timbaland's key productions are from 1996–97. He was born in Norfolk, Missy Elliott in Portsmouth, Rodney Jerkins is from New Jersey, and their Swing Mob work was in New York.
- **melodic** (Los Angeles and Toronto, 2008–2014): *808s & Heartbreak* was recorded in Burbank and Honolulu. The sources call the line emo rap and carry it into the late 2010s.
- **amapiano** (Pretoria, 2012): "Mid 2010s (disputed in Gauteng)"; the Pretoria origin "remains uncertain"; no page gives 2012. The 110 BPM marker is not stated anywhere.
- **latintrap** (2015): it "gained popularity after 2007", with roots in the 2000s–2010s; 2015 is when it took off. The Argentine scene plays it faster than our 70–80 BPM.
- **moderntrap** (2010): trap dates to 1990s Atlanta and its modern sound to 1999; 2010 fits Lex Luger and *Flockaveli*. This is a difference of scope.
- **edmpop** (Paris and Stockholm, 2011–2015): Guetta's crossover hits began in 2009 and the US market declined from 2016; the sources tell it as a US market story.

## Sources
Raw English Wikipedia wikitext for each genre and for linked articles on artists, labels, albums and clubs. Home-language articles read: Japanese J-POP, Korean K-pop, Spanish Reguetón and Trap latino, French French touch (musique), isiZulu and Afrikaans Amapiano. Every address used as evidence is in `sources.json`; the full list per genre is in `source-list.json`.

## What fell short
- Several markers in our records could not be sourced and are not in the stories (listed in the table and in `notes`).
- **y2krnb, melodic and edmpop** have no Wikipedia article of their own; their stories are assembled from artist and parent-genre articles. Whether these three genre names describe what the sources describe is for the lead.
- **jpop:** "Hideo Saitō" is the sub-agent's romanisation of 斎藤日出夫; the page gives only the kanji. A reader of Japanese should confirm it.
- **amapiano:** the Red Bull history page refused the script (HTTP 403) and was not used.
- I read three stories in full against their quotes (house, amapiano, y2krnb) and the disagreement and notes fields of all sixteen. The rest rests on the sub-agents and the checker.

## Questions for the lead
1. Many of the 16 windows start later than the sources put them (techno, dancehall, jpop, teenpop, reggaeton, afrobeats, frenchhouse, y2krnb, latintrap). Should the records be re-dated, or do they mean peak rather than birth?
2. jungle: should drum and bass stay inside jungle, as our record has it, or be its own genre, as the source has it?
3. afrobeats: should "log drums" come out of its sound line?
