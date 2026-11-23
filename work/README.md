# Helper work

Scheduled helper runs put everything they produce here, and nowhere else. Nothing in this folder is part of the site: the build does not read it, and Cloudflare is set not to build when only this folder changes.

## Who does what

- **The owner** (Jon) sets the vision and approves what reaches `dev` and `main`.
- **The lead session** is the Claude conversation that holds the project's context. It is responsible for the project: it writes the assignments in [`QUEUE.md`](QUEUE.md), reviews what helpers hand back, and moves accepted work into `data/`, `src/` or `docs/` on a feature branch for the owner's review.
- **A helper** is a scheduled run that starts with no memory. It is a coworker without responsibility for the project. It takes one assignment, does it, and hands back something to review. It decides nothing about the project.

## What a helper run does

1. Reads `CLAUDE.md`, this file and `QUEUE.md` on `dev`.
2. Takes the first assignment whose state is `open`. If there is none, it posts "queue empty" to the run log and stops.
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
