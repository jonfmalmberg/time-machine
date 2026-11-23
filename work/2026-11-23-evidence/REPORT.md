# Evidence check, first run: genre batches 1 and 2

Date: 23 November 2026. Run by the lead with `tools/check_evidence.py` (no model involved) over `work/2026-11-23-H3/sources.json` and `work/2026-11-23-H4/sources.json`: 526 claims, 16 genres, 218 addresses. Results per claim are in `evidence-check.json`.

## Result

| Outcome | Claims | Share | Meaning |
| :- | -: | -: | :- |
| Found | 317 | 60% | The quoted string is on the page |
| Near | 35 | 7% | Not as one string, but all its distinctive words are on the page close together (mostly table rows and PDF line breaks) |
| Not found | 42 | 8% | The page loaded and does not contain it |
| No page | 132 | 25% | The page could not be read by the script |

Of the 394 claims whose page could be read, 352 (89%) are confirmed and 42 (11%) are not.

## Why pages could not be read (132)

| Cause | Claims | What it means |
| :- | -: | :- |
| The site refuses scripts (HTTP 403): Smithsonian Folkways 60, Cezame 8, others | about 75 | The page exists; a person or the fetch tool can read it, this script cannot. Not evidence of a wrong source |
| Address not found (HTTP 404): `download.osmand.net` 17, Proper Music 4, others | about 25 | Needs looking at. `download.osmand.net` is a map app's download server, an unlikely place for music claims |
| PDFs with no text layer, connection errors, a bad gateway | about 30 | Mixed |

## Where "not found" clusters (42)

| Site | Claims | Likely cause, to be confirmed by an agent |
| :- | -: | :- |
| MusicBrainz | 13 | Page content differs from what the researcher's fetch tool reported |
| last.fm | 12 | Track lists loaded by script, not in the page text |
| Wikipedia | 7 | Quotes reworded by the fetch tool: the words are on the page but not together |
| Others | 10 | |

By genre the unconfirmed share is uneven: Iraqi maqam has 17 not found and garba 11; ngoma, chèo, pungmul and kobzar dumy rest mostly on pages the script could not read.

## What this run shows about the method

- The script works as designed and is cheap: 218 pages, a few minutes, nothing judged by a model.
- A quarter of claims cannot be checked by a script because sites refuse scripts. For those the options are an agent with the fetch tool, or running the script from the owner's computer.
- The helpers' quotes are not character-for-character: the fetch tool they read pages through rewrites text. "Near" and part of "not found" come from that. Exact strings need the researcher to copy from raw page text, which helpers can do now that the workspace has web access, if their runs have it too.
- 11% unconfirmed among readable pages is the first measured error ceiling for helper research. How many of those are truly wrong is the triage assignment (H9).
