# Journeys and the music course: algorithms

24 Nov 2026. Written by the lead at the owner's request ("proposal for yourself: algorithms for journey and an initial proper version of a music course"). The course in section 1 is built (version 1, on `dev`). Sections 2 to 5 are proposals: nothing in them is built or agreed.

## What a journey is for

A journey is an ordered set of stops with a reason for the order. The site already answers "what was heard there, then". A journey answers "where should I go next, and why". The four existing kinds (a life, music history, world traveller, discovery walk) produce long flat lists whose only action is copying a prompt. That matches what the site could do in its first week, not what it is for (positioning record, principle 28).

Every algorithm below is stated as: what goes in, how stops are chosen, how they are ordered, what is shown, what is not known, how to tell if it works.

## 1. The course (built, version 1)

**In:** the genres on the tree; for each, its start year, region, tradition, significance score (`scores`, first value), sourced definition (`sound`, `markers`, reference tracks) and playlist state.

**Chosen:** eleven chapters, one per era (before 1000; 1000 to 1600; 1600 to 1800; 1800 to 1900; then finer: 1900 to 1930, 1930 to 1950, 1950 to 1965, 1965 to 1980, 1980 to 1995, 1995 to 2010, 2010 on). A genre belongs to the era it began in. Within a chapter, genres that have a definition and a playable list are ranked by significance; the first six are taken subject to two caps: at most two per region, at most one per tradition. 65 stops in all today.

**Ordered:** by start year inside the chapter.

**Shown per stop:** the definition's one-sentence sound, up to four things to listen for, where it sits on the tree (what it follows, what it leads to, as links), three reference tracks with play arrows, and a button that opens the genre's playlist sheet in place. A stop is ticked when its playlist is opened or by hand; progress is kept with the other journey ticks.

**Why this shape:** a course needs a finish line and small steps. Six stops is one sitting. Caps stop the modern chapters becoming United States pop history and the old ones becoming church music, the same reason the existing history journey spreads its essentials.

**What it deliberately does not do:** tell a story in prose. Chapter titles are dates and nothing more, because any sentence about why music changed is a claim, and the rule is no claims without a source. Everything on a stop card comes from that genre's sourced record.

**Not known:** whether the significance scores are right (they were set in the first week and never tested; issue 81 shows one failure); whether six is the right number; whether eras are the right chapters, as against threads (the story of the drum kit, of the microphone, of the African diaspora).

**Version 2, in order:**
1. A sourced paragraph per chapter: what changed in the world of music in this era (recording, radio, migration), each sentence with a source. This is helper research followed by the lead's edit.
2. Thread chapters alongside era chapters, built by walking the tree: start from a root, follow the most significant child at each step.
3. A check at the end of a chapter: three song titles, which stop is each from. Uses the reference tracks; needs no new data.
4. A second course level: the next six per era.

**Test:** the usage log records chapter opens, ticks and playlist opens (`course`). Working means a visitor who opens chapter 1 opens at least one playlist, and some reach chapter 2.

## 2. A life (proposal)

**In:** birth year, the places lived with years, and optionally the same for parents.

**Chosen:** for each leg, the place's chart songs for the years the person was 10 to 25, plus a lighter sample of ages 4 to 9 and 26 to 40. The weighting towards the teens and early twenties follows the "reminiscence bump" in memory research: people recall most from that age range. **This is an assumption taken from general knowledge, not checked against a source; it should be before it is relied on.** For the childhood years, add what the parents' generation was playing (their ages 15 to 25 in their place), because the home is where a child hears music.

**Ordered:** by the person's age. One stop per two or three years in the bump, per five years outside it.

**Shown:** "You were 14. This was on the radio in São Paulo." with the list; one question per stop: do you remember this? (yes / some / no). That answer is the founding test, collected from a real person, and is worth more than any synthetic listener.

**Needs:** year-by-year chart lists for the country (section 6); without them the stop says so and offers the decade list.

## 3. World traveller (proposal)

**In:** the regions wanted, the person's travel log.

**Chosen and ordered:** a route, not a ranking. Start at home (the person's most-visited region, or their browser's country). At each step go to the nearest region not yet visited, where "near" is musical: regions joined by the most parent-to-child links on the tree come first. In each region visit the three most significant living traditions and one place-and-decade with a chart list. Come home every fourth stop if "come home in between" is on.

**Why:** the present version orders regions by a fixed list. Distance on the tree gives each step a reason that can be shown: "from Cuba to Congo: Congolese rumba grew from Cuban son."

## 4. Discovery (proposal)

**In:** the four sliders (significance, ease, fame, intrigue), the travel log's marks.

**Chosen:** the existing greedy order, with two changes. (a) The nudge from taste becomes real: each mark (loved, good, not for me, and the score) updates a weight per region and per family, and those weights move the next pick. With the feedback row now in the playlist panel there will be marks to learn from. (b) One pick in five ignores taste entirely, so the walk cannot close in on what the person already likes.

**Shown:** the reason for each pick in a line ("because you loved Bossa nova"; "something you have not been near").

**Not known:** how many marks are needed before the nudge is better than none. Start it only after five.

## 5. What all journeys should share (proposal)

- A stop opens its playlist in place and is ticked by that, as the course does now. Copying a prompt is one of the options inside Listen, not the row's action.
- One line of why this stop comes next.
- A finish: a count, an end, and a card to share.
- Journeys feed the travel log, and the log feeds journeys.

## 6. What the data must provide

| Need | State |
| :- | :- |
| Year-by-year "heard there" lists for many countries | In progress: chart rows for 44 countries read from Wikipedia; ingest under way |
| Where each chart artist is from (for "made there") | Helper assignments H16 to H19 |
| Correct release years | Helper assignments H20, H21 |
| Song ids on the page, for per-song marks | Not started (roadmap 10.3) |
| Tested significance scores | Not started (roadmap 2.6) |
| Sourced chapter paragraphs | Not started; to be queued after the owner has seen version 1 |
