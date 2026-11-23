# Synthetic listener tests

A synthetic listener is a model asked to be an ordinary person from a place and time and to judge, honestly, whether a playlist's seed songs are the music of their youth. It is evidence about how the app feels, not proof: no real person is involved (principles 20 to 22).

## What makes a test reproducible

A result is only worth keeping if it can be traced to exactly what produced it. Every run records four things:

| Recorded | Where | Why |
| :- | :- | :- |
| The brief, by id and version | `briefs/<id>.v<N>.md`, with its fingerprint in the run | The wording given to the listener decides the score. A brief is never edited; a change is a new version |
| The data | The git commit and a fingerprint of `data/` in the run | The same test on different data is a different test |
| The cases | `cases.json` in the run: the exact prompts judged | Generated from the built site, not typed by hand |
| The model | Named in the registry below and written into the run | Scores from different models are not comparable |

## Registry of briefs

| Brief | Version | Date | Model | What it tests | What changed from the version before |
| :- | :- | :- | :- | :- | :- |
| `place-time` | 1 | 2026-11-07 (registered 2026-11-23) | Opus (`claude-opus-5-5`) | A place-and-time playlist: would a person who was 8 to 18 there then say "this is the music of my youth" within the first few songs. Score 1 to 10 per case | First registered version. The archived brief of 7 November, unchanged except that the results file is named in the run's instructions instead of a workspace path |

The pass bar used so far: every tested year scores 8 or more. It was applied by judgement in the first three rounds and is written down here for the first time.

## How a test is run

```
python3 tests/listener/run.py prepare place-time 1 --place JP --years 2001,2004,2008
```
builds the site, generates the prompt for each year exactly as the page would, and creates `runs/<date>-place-time-v1-JP-2001-2008/` holding `cases.json`, `manifest.json` (brief fingerprint, data commit and fingerprint) and `INSTRUCTIONS.md`.

The judging itself is done by an agent on the registered model: it is given `INSTRUCTIONS.md`, reads the brief and the cases, and writes `results.json` in the run folder. The script cannot call a model itself.

```
python3 tests/listener/run.py record tests/listener/runs/<run> --model claude-opus-5-5
```
checks that every case has a score, refuses a model other than the registered one, writes the scores and the verdict into `manifest.json`, and prints the test record to add to the country-decade's scope in `data/scopes/c/` (add `--apply` to add it).

```
python3 tests/listener/run.py coverage
```
rewrites [`../../docs/COVERAGE.md`](../../docs/COVERAGE.md): for every genre and every country-decade, what research exists and which tests have run.

## What came before

`archive/` holds the briefs, inputs and results of the rounds run before this registry (7 to 16 November). Their scores are in `data/scopes/c/` without a run and are provisional until rerun here.
