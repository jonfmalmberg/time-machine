# Brief: what people in one country actually heard, decade by decade

We are building a music time machine. Someone picks a country and a year, and we write a Spotify prompt with seed songs. The test is simple. An older person who grew up in that country and time listens, and within the first few songs they should say "oh, this is what we listened to back then". Our current seeds come from genre lists, so Sweden in the 1950s gets famous American bebop, and a Swedish grandmother hears a generic jazz playlist. Your job is to give us the real thing.

## Task
For each country in your todo file (ISO2 codes, one per line), and for each decade from the 1940s to the 2020s (1940s, 1950s, … 2010s, and 2020s meaning 2020–2026), list the songs ordinary people in that country actually heard and loved in that decade.

For each country and decade:
- **About 11 home-grown songs** (`origin: "home"`). These are recorded by artists from that country, usually in the local language, and include local covers of foreign songs. Pick:
  - the biggest local hits of the decade;
  - evergreens that every local of that generation knows by heart;
  - film songs, dance-hall and party favourites, the songs on the radio and in cafés;
  - a spread across the decade's years and its main local styles (for 1960s Sweden: schlager, visa, dansband, pop).
- **About 5 foreign songs** that were genuinely big in that country at the time (`origin: "foreign"`): top hits on its charts or radio, not merely famous somewhere else. They should feel right to a local: in Sweden in 1959, Elvis and Paul Anka, not Charlie Parker.
- **Fewer is better than wrong.** If a decade really had little recorded local music (wartime, a ban, very early years), give what is real and say so in `note`.

## Fields per song
`[artist, title, year, origin, kind, conf]`
- **year**: the original release year of that recording. It must fall within the decade, or before it if the song was an evergreen still heard then (at most 2 such songs per decade).
- **origin**: `"home"` or `"foreign"`.
- **kind**: one of `radio`, `dance`, `film`, `folk`, `rock`, `pop`, `ballad`, `kids`, `religious`, `other`.
- **conf**: `"h"` (you know it), `"m"` (fairly sure), `"l"` (unsure). Don't include `l` songs unless the decade would otherwise be empty.
- Use artist and title as Spotify most likely lists them: original script for Japanese, Korean, Chinese, Russian, Greek, Persian and Arabic, with a romanization in parentheses where natural, e.g. `"Кино", "Группа крови (Gruppa krovi)"`.

## Rules
- These must be real recordings. Check doubtful titles or years with web search; national all-time hit lists, decade lists and chart archives on Wikipedia are good sources. You may use up to 40 searches in total.
- Do not invent. Accuracy matters more than count.

## Output
Write `/tmp/claude-0/-home-claude/2b1b499d-9665-57df-ae26-758738e40040/scratchpad/v4/era/out_N.json` as:

```json
{"SE": {"1950": {"note": "", "songs": [["Snoddas", "Flottarkärlek", 1952, "home", "radio", "h"]]}}}
```

The decade keys are `"1940"` through `"2020"`.

Validate with Python:
- the file loads;
- every country and every decade is present;
- years are in range (up to 2 earlier evergreens allowed);
- origin values are valid;
- report the home/foreign counts per decade.

Then report the decades that are thin, and anything you are unsure of.
