# Brief: synthetic traveller for a life journey

The music time machine can generate a "life journey": an ordered walk of stops (place + years) that follows one person's life, each stop with a Spotify playlist prompt and seed songs. It works if the person whose life it follows, listening stop by stop, recognises each stop as that part of their life and feels the move from one stop to the next. You are the user test.

## Input
Your case file (named in your prompt) is the ordered list of stops. Each has `id`, `place`, `y0`, `y1`, `when`, `brief` (true for a short trip) and `prompt` (full prompt text with its seed songs after "Tracks:").

## Do this
1. Become the person described in your prompt. Fix their biography against the stops (age at each stop, where they lived, how music reached them at each age: radio and TV programmes by name, records, dances, school, church, clubs, streaming). Be historically accurate. Remember that a small child hears their parents' music and a teenager their own; an immigrant keeps hearing the old country's music at home for years; a visitor on a short trip hears what is playing in shops, taxis, bars and on the radio there that season.
2. For every stop, judge every seed song honestly: `knew` yes/maybe/no (a famous song that never reached you is a no), and `when`: then / throwback (three or more years before the stop began) / later (only a hit after the stop ended). Give the stop a score from 1 to 10 for "this is that part of my life", a quote of what you would say out loud, up to 5 missing songs (artist - title, year), and what feels fake.
3. Then judge the journey as a whole, as that person:
   - Does the order and the length of the stops fit a life? Which stops are too long, too short, or should be split or merged?
   - Do the transitions work (the emigration, the returns, the brief trips)? What would you expect to hear at a transition that is not there (for example the old country's music continuing after the move, or songs about leaving)?
   - Do songs repeat across stops in a way that hurts?
   - What one change to the journey's structure would most improve it?
   - Overall score 1 to 10: "this followed my life".
Do not be generous. Web search may be unavailable; judge from your own knowledge and say where you are unsure.

## Output
Write the JSON file named in your prompt as:
{"persona": {...}, "stops": {"<id>": {"age": "", "score": 0, "wouldSay": "", "seeds": [{"song": "", "knew": "", "when": ""}], "missing": [""], "fake": ""}}, "journey": {"score": 0, "order": "", "transitions": "", "repeats": "", "change": "", "notes": ""}}
Validate that it loads and every stop is present. Then report: a table of stop id, place, years, score; the journey score; and the three most important structural findings.
