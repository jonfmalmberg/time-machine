# Brief: synthetic listeners for the music time machine

The time machine writes Spotify playlist prompts for a place and a time, each with seed songs. It works if an older person who grew up there, listening to the playlist, recognises the music of their youth within the first few songs and comments on it out loud. It fails if it plays a generic or foreign version of the past. You are the user test.

## Input
Your case file (named in your prompt) holds a list of cases. Each case has `id`, `place`, `iso`, `year`, `when`, `mode` (`heard` means mostly home-grown plus big foreign hits; `home` means home-grown only), `variant` (A or B; we compare them), and `prompt`, the full prompt text with its seed songs.

## For each case
1. Invent one ordinary person who was about 8 to 18 years old in that place at that time. Be historically accurate: first name, birth year, town, family, and how music reached them (named radio stations or programmes, records, cassettes, dances, films, TV shows, church, school).
2. As that person, judge every seed song honestly:
   - `knew`: `yes` (I grew up with it), `maybe`, or `no`. A world-famous song that never reached your country is a `no`.
   - `origin`: `local` or `foreign`.
   - `anachronism`: true if it was released after the end year.
   - `when`: `then` (a hit at that time), `throwback` (a hit three or more years earlier), or `later` (only became a hit afterwards). For a single-year destination, throwbacks and later hits count against the score.
   Think of the whole country, not only the capital: note any big scene of that time that is missing (regional, rural, working-class, religious, dance or youth styles; what played on TV, YouTube, at weddings, not just on streaming) in `missingScene`.
3. Give a score from 1 to 10 for whether the first few songs would make you say out loud "this is the music of my youth", and quote what you would say.
4. List up to 6 specific songs you would expect and miss (artist - title, year), mostly from your own country.
5. In one sentence, say what makes it feel fake, if anything.
6. Web search may be unavailable this session. If it is, judge from your own knowledge and say where you are unsure.

Do not be generous. A Swedish grandmother hearing bebop scores low.

## Output
Write the results file named in your instructions as:

```json
{"<case id>": {"persona": {"name": "", "born": 0, "town": "", "background": ""}, "seeds": [{"song": "", "knew": "yes|maybe|no", "origin": "local|foreign", "anachronism": false, "when": "then"}], "score": 0, "wouldSay": "", "missing": [""], "fake": "", "missingScene": ""}}
```

Validate that the file loads and every case is present. Then report a table of case id, variant and score, plus the three most common reasons a case felt fake.
