# Evidence check, first run: genre batches 1 and 2

Date: 23 November 2026. Run by the lead with `tools/check_evidence.py` (no model involved) over `work/2026-11-23-H3/sources.json` and `work/2026-11-23-H4/sources.json`: 526 claims, 16 genres, 218 addresses. Results per claim are in `evidence-check.json`.

## Correction, same day

The first version of this report counted 42 claims as "not found". That was wrong for 27 of them. The owner looked at five pages himself and saw a track title on a MusicBrainz page that the script had reported as absent. Cause: MusicBrainz and last.fm answer scripts with a browser-check page and a normal status, and the script read that page as the real one. Fixed: the script now recognises a bot-check page as "could not read", reads MusicBrainz through its open data interface, and asks a busy site again slowly. The owner's five observations are kept as control cases in `tests/evidence_controls.json` and the script is run against them with `python3 tests/evidence.py`. The numbers below are from the corrected script.

## Second correction, same day

The triage (H9) confirmed 10 claims by hand that the script had not found, each a fault in the script: a compressed reply read as text, a track title held only in markup, PDF columns interleaved, and passing network errors remembered as failures. Fixed, except numbers drawn as stacked fractions. Rerun over the same 526 claims: 362 found (69%), 7 near, 12 not found, 145 page not readable. The table below is the earlier run and is kept for the record.

## Result

| Outcome | Claims | Share | Meaning |
| :- | -: | -: | :- |
| Found | 331 | 63% | The quoted string is on the page |
| Near | 34 | 6% | Not as one string, but all its distinctive words are on the page close together (mostly table rows and PDF line breaks) |
| Not found | 15 | 3% | The page loaded and does not contain it |
| No page | 146 | 28% | The page could not be read by the script |

Of the 380 claims whose page could be read, 365 (96%) are confirmed and 15 (4%) are not.

## Why pages could not be read (132)

| Cause | Claims | What it means |
| :- | -: | :- |
| The site refuses scripts (HTTP 403 or a bot-check page): Smithsonian Folkways 60, last.fm 12, Cezame 8, others | about 96 | The page exists; a person or the fetch tool can read it, this script cannot. Not evidence of a wrong source |
| Address not found (HTTP 404): `download.osmand.net` 17, Proper Music 4, others | about 25 | Needs looking at. `download.osmand.net` is a map app's download server, an unlikely place for music claims |
| PDFs with no text layer, connection errors, a bad gateway | about 30 | Mixed |

## Where "not found" clusters (15)

Wikipedia 7 (quotes reworded by the page-reading tool, and at least one sentence that is on no page), All Night Flight Records 3, Folkways liner-note PDFs 2, three others. All 13 MusicBrainz claims are found once read through its data interface.

## What this run shows about the method

- The script works as designed and is cheap: 218 pages, a few minutes, nothing judged by a model.
- A quarter of claims cannot be checked by a script because sites refuse scripts. For those the options are an agent with the fetch tool, or running the script from the owner's computer.
- The helpers' quotes are not character-for-character: the fetch tool they read pages through rewrites text. "Near" and part of "not found" come from that. Exact strings need the researcher to copy from raw page text, which helpers can do now that the workspace has web access, if their runs have it too.
- 4% unconfirmed among readable pages is the first measured error ceiling for helper research, and 28% could not be checked at all. Which are truly wrong is the triage assignment (H9).
- The checker itself was wrong on its first run. A check needs its own check: control cases seen by a person.
