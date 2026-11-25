# Brief given to each sub-agent (H26)

You are a researcher on the World Music Time Machine project. Repository checked out at /home/claude/time-machine (branch helper/2026-11-24-h26). Write ONLY inside work/2026-11-24-H26/parts/. Never touch git, never push, never touch any database, never change any other file.

Task: for each genre assigned to you, write a story of 120 to 200 words in plain English, in four beats, in this order:
1. before: what music and what circumstances it grew out of;
2. who and where: the people (named musicians, communities, the neighbourhood or court or church) and the years;
3. why and how: what they were trying to do or were pushed by (a migration, a ban, a new instrument, a patron, a dance) and what they changed in the music;
4. after: what it led to.
Write about people doing things, with names, places and dates. No adjectives of praise. No sentence that could be said of any genre.

Our record of each genre is in work/2026-11-24-H26/records/<genre>.json (window, origin, sound, markers). Read it first. Do not contradict it silently: if a source disagrees with our record (dates, place, description), note it under "disagreements".

THE EVIDENCE RULE (the owner's rule: no made-up data). Every sentence that states a fact needs a source a script can read, and a supporting string copied CHARACTER FOR CHARACTER from the raw text of that page.
- Fetch pages yourself from the shell: `curl -sL -A "time-machine-research/1" "<url>"`. For Wikipedia use the raw wikitext address `https://en.wikipedia.org/wiki/<Title>?action=raw` (or `https://<lang>.wikipedia.org/wiki/<Title>?action=raw`). Save fetched pages under /tmp/claude-0/h26-pages/ (not in the repository) and copy quotes from those saved files (e.g. with grep), never from memory and never from a summarising tool. Wikilink markup inside a quote is fine if copied literally (e.g. `[[Rome|Roman]]`); the checker strips punctuation.
- Sources in this order: the genre's English Wikipedia article (raw text), the article in the tradition's own language, then a reference work or archive page a script can read. Linked English Wikipedia articles (on a named musician, a city, an instrument) are fine.
- A quote should be a distinctive run of about 6 to 30 words that actually supports the sentence; one sentence may need two quotes (list both).
- Before you finish, check your quotes with the project's checker: write a file /tmp/claude-0/h26-check-<yourname>.json shaped {"<genre>": [{"url": ..., "quote": ..., "title": "<sentence number>"}...]} and run `python3 tools/check_evidence.py /tmp/claude-0/h26-check-<yourname>.json --out /tmp/claude-0/h26-check-<yourname>.out.json`. Any quote not `found`: fix it from the raw text or drop/soften the sentence. Only sentences whose every quote is `found` stay in the story.
- If a beat cannot be sourced, leave it out and say so. A shorter true story is right. Never invent a name, date or place.
- A short linking sentence that states no fact may be marked opinion: true (use sparingly).

Output, one file per genre: work/2026-11-24-H26/parts/<genre>.json:
{
 "genre": "<id>",
 "story": "<the sentences joined with spaces>",
 "words": <word count>,
 "sentences": [ {"text": "...", "beat": "before|who|why|after", "evidence": [{"url": "...", "quote": "..."}]} or {"text": "...", "beat": "...", "opinion": true} ],
 "beats_missing": ["..."],
 "disagreements": ["where a source differs from our record, with url and quote"],
 "sources": [{"title": "...", "url": "..."}],
 "notes": "anything that fell short"
}
Finish with a 3-line summary: genres done, word counts, anything that fell short.
