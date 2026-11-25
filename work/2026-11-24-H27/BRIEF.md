# Brief given to each research sub-agent (H27)

You are researching for the World Music Time Machine (repository at /home/claude/time-machine, branch already checked out). Write ONLY inside `work/2026-11-24-H27/parts/`. Do not change any other file. Do not use git. Never write an email address or a secret.

## Task
For each genre id you are given, write a story of 120 to 200 words in plain English, in four beats, in this order:
1. **before**: what music and what circumstances it grew out of;
2. **who and where**: the people (named musicians, communities, the neighbourhood or court or church) and the years;
3. **why and how**: what they were trying to do or were pushed by (a migration, a ban, a new instrument, a patron, a dance) and what they changed in the music;
4. **after**: what it led to.

Write about people doing things, with names, places and dates. No adjectives of praise. No sentence that could be said of any genre.

Read the genre's record first: `work/2026-11-24-H27/records/<id>.json` (copied from `data/genres.json`; `_tree_came_from` / `_tree_led_to` are its neighbours on the site's tree). Do not contradict the record without noting it.

## The evidence rule (owner's rule: no made-up data)
Every sentence that states a fact needs a source a script can read, with a supporting string copied **character for character** from the page's raw text.
- Use search or page-reading tools only to FIND pages, never to take quotes (they reword text).
- Fetch the page yourself in the shell and copy from that raw text. For English Wikipedia: `curl -sL -A "time-machine-research/1" "https://en.wikipedia.org/wiki/<Title>?action=raw"`. For another language Wikipedia the same with `<lang>.wikipedia.org`. Use the same address (with `?action=raw`) as the `url` you record.
- Source order: the genre's English Wikipedia article (raw), then the article in the tradition's own language (es, pt, fr, hi...), then a reference work or archive page a script can read.
- The quote should be a short run of text (one clause or sentence, ideally 6 to 30 words) that exists in the raw text exactly. It may include wiki markup like `[[...]]` exactly as it appears; prefer stretches without markup or references. Do not stitch two pieces together.
- If a beat cannot be sourced, leave it out and say so. A shorter true story is right. Do not use what you remember to fill gaps.
- A linking sentence that states no fact may be marked `opinion: true` (keep these few and short).

## Check yourself
For each genre write `work/2026-11-24-H27/parts/<id>.sources.json` as `{"<id>": [{"url": ..., "quote": ..., "artist": "", "title": "<sentence number>"}]}` and run
`python3 tools/check_evidence.py work/2026-11-24-H27/parts/<id>.sources.json --out work/2026-11-24-H27/parts/<id>.check.json`.
Fix or drop any sentence whose quote is not `found`. One fix attempt per sentence, then drop it.

## Output per genre: `work/2026-11-24-H27/parts/<id>.json`
```
{"genre": "<id>",
 "story": "<the full text, sentences joined by spaces>",
 "sentences": [{"n": 1, "beat": "before|who|why|after", "text": "...", "url": "...", "quote": "..."} or {"n": 2, "beat": "...", "text": "...", "opinion": true}],
 "beats_present": ["before", "who", "why", "after"],
 "beats_missing": {"<beat>": "why it could not be sourced"},
 "disagreements": ["each place your sources disagree with the record (began/ended years, origin place, sound, tree neighbours), with the quote and url"],
 "notes": "anything else the lead should know"}
```
When done, reply with one line per genre: id, word count, beats present, number of sentences found/total, and the model identifier you are running as.
