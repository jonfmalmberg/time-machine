# Archive of synthetic-listener tests run before the test registry existed

Saved on 23 November 2026 from Claude's working files so they are not lost. Nothing here is run by the site or by the build.

| Path | What it is |
| :- | :- |
| `listener_brief_2026-11-07.md` | The brief given to synthetic listeners judging a place-and-time playlist (blind comparison of two variants). |
| `journey_brief_2026-11-16.md` | The brief given to synthetic listeners judging journeys. |
| `year_research_brief.md`, `decade_research_brief.md` | The briefs given to research agents building year lists and decade lists. |
| `cases/` | The inputs of each test round: the prompts that were judged. |
| `results/` | What the listeners returned, per round. |

The live site also carried its own shorter listener prompt, in `src/template.html` (`listenerPrompt`).

**How to treat these.** The scores recorded in the project's slice results came from these briefs, but the runs were not tied to a version of the data or of the brief, and the briefs were edited between rounds without keeping each state. Treat the old scores as provisional. Under the test registry (roadmap item 0.2) these briefs become version 1, and tests are rerun and recorded from there.

Some briefs mention file paths from Claude's workspace; they are left as they were.
