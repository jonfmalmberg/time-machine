# Helper work

Scheduled helper runs put everything they produce here, and nowhere else. Nothing in this folder is part of the site: the build does not read it, and Cloudflare is set not to build when only this folder changes.

## Who does what

- **The owner** (Jon) sets the vision and approves what reaches `dev` and `main`.
- **The lead session** is the Claude conversation that holds the project's context. It is responsible for the project: it writes the assignments in [`QUEUE.md`](QUEUE.md), reviews what helpers hand back, and moves accepted work into `data/`, `src/` or `docs/` on a feature branch for the owner's review.
- **A helper** is a scheduled run that starts with no memory. It is a coworker without responsibility for the project. It takes one assignment, does it, and hands back something to review. It decides nothing about the project.

## What a helper run does

1. Reads `CLAUDE.md`, this file and `QUEUE.md` on `dev`.
2. Takes the first assignment whose state is `open`, unless the message that started the run names one ("take assignment H19"): then it takes that one, provided its state is `open` and no `helper/*` branch for it exists yet; if it is not open or already has a branch, it falls back to the first open one and says so in its report. If there is none, it posts "queue empty" to the run log and stops.
   **Claim it before working (added 24 Nov after three runs did the same assignment):** as soon as the assignment is chosen, create its branch `helper/<date>-<id>` from `dev` with one empty commit (`git commit --allow-empty -m "Claim <id>"`) and push it. If the push is refused because the branch already exists, another run has it: choose the next open assignment and claim that. Only then start the work. The hand-back is a second push to the same branch.
3. Works on a branch named `helper/<date>-<assignment id>`, made from `dev`.
4. Writes only inside `work/<date>-<assignment id>/`. Always a `REPORT.md` there (format below).
5. Sets the assignment's state in `QUEUE.md` to `handed back <date>`. This is the only line it changes outside its own folder.
6. Commits once and pushes the branch once. No merge, no pull request.
7. Posts a short comment on the run log issue: the assignment, the branch, the model it ran on, the models of any sub-agents, what is in the folder, what fell short.

## What a helper never does

- Change anything in `src/`, `data/`, `db/`, `docs/`, `tests/`, `build.py`, `wrangler.jsonc` or `CLAUDE.md`. Proposed data goes in its own folder as files the lead can merge.
- Touch either database, `dev`, `main`, or another branch.
- Push more than once, or push more than a few commits (a push of 20 or more commits makes Cloudflare build regardless of the folder).
- Retry failed research in a loop. It flags what fell short, precisely, and stops.
- Invent. Every song, date and claim carries the address of the source it was read from the exact string on that page that supports it (the chart row or the sentence, copied character for character, never paraphrased), and the date it was read. The string is checked against the page later by a script, and it is the evidence that remains if the site disappears. Something recalled but not found in a source is listed separately as unverified.
- Put a person's email address or any secret key anywhere.

## Evidence: how a researcher records a source

The owner's rule: no made-up data in the database. A first check of two genre batches found that the page-reading tool returns reworded text even when asked for a quote character for character (the page says "In 1997, for the first time"; the tool returned "In 1997 year, for the first time"), and that at least one quoted sentence was on no page at all. So:

1. Use search and the page-reading tool only to **find** pages. Never take a quote from them.
2. For every claim, fetch the page yourself from the shell (`curl -sL -A "time-machine-research/1" <address>`; `pdftotext` for PDFs) and copy the supporting string from that raw text, character for character.
3. Before handing back, run `python3 tools/check_evidence.py <your sources.json> --out <your folder>/evidence-check.json` and include the output file.
4. Only claims with the result `found` go into your `defs.add.json` and `playlists.add.json`. Everything else goes into `unverified.json` with the script's result and reason. A shorter true list is the right outcome.
5. If a site refuses scripts (Smithsonian Folkways does), look for the same fact on a page a script can read: the album's liner-note PDF, a library or archive catalogue record, the MusicBrainz API (`https://musicbrainz.org/ws/2/...?fmt=json`, one request a second). Do not try to get around a site's bot check.

## Models

Usage is limited, so the model is chosen per kind of work and recorded every time.

| Work | Model |
| :- | :- |
| The helper run itself: research, reading sources, writing the report | Opus |
| Sub-agents for mechanical work: extracting rows from a page already found, reformatting, counting | Sonnet |
| Sub-agents for research that needs judgement between sources | Opus |
| Synthetic listener tests | The model named in the test's registry entry, never another |
| Schema, architecture, resolving disagreements, review before merge | The lead session (Fable). A helper does not do these; it hands the question back |

Each assignment in the queue names its model. `REPORT.md` states the model identifier the run was configured with and the model given to each sub-agent.

## REPORT.md

```
# <assignment id>: <title>
Date, branch, model of the run, models of sub-agents.
## What was asked
## What is in this folder        (each file, one line)
## What was found                (the result, short)
## Sources                       (title and address for each)
## What fell short               (precisely, so it can be redone)
## Questions for the lead
```
