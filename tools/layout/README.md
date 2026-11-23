# Tree layout

Each genre's row on the family tree is stored: `row` on each genre in `data/genres.json`, and the lane order and lane sizes (`lanes`, `R`) with the layout's `cost` in `data/layout.json`. It was computed once, before the project moved to this repository, by the scripts in `original/`. They were recovered from the workspace on 23 November 2026 and are kept here unchanged so the method is not lost. They cannot run: they read a data file of the old artifact (`data_ext.py`) that no longer exists.

`optimise.py` is a port of `original/opt5.py` that reads today's files. It keeps the original's constants, rule, cost function and search line for line; only the reading of the data is new.

**What the method does** (from `original/opt5.py`): one fixed layout for every zoom level. Genres sit in lanes, one lane per tradition, lanes grouped by family. Rows inside each lane are chosen so that, at the zoom where a genre's label appears, it never collides with another visible label: two genres in one lane whose label spans (start year to end year, or the label's width if longer, plus a 6 px gap) overlap at a zoom where both show must be at least 3 rows apart at zoom 1, 2 at zoom 2, 1 at zoom 3. Among layouts that satisfy that, it searches (random restarts and simulated annealing over row moves, row swaps, family order and lane order) for the one with the smallest total weighted length of the tree's lines at full zoom. A principal parent line weighs 1, another parent 0.4, times 2 when both ends are tier 1 and 1.4 when both are tier 2 or better.

## How to use

| Command | What it does |
| :- | :- |
| `python3 tools/layout/optimise.py check` | Says whether the stored layout obeys the rule, and its cost by the method, beside the stored `cost`. Exits 1 if invalid. `--json` for machine output |
| `python3 tools/layout/optimise.py place --genre-file new.json` | Best valid rows for new genres with every existing row fixed. Prints JSON: the rows, any lane that had to grow (`[old, new]` size), and the cost before and after. Writes nothing |
| `python3 tools/layout/optimise.py place --write` | Places the genres in `data/genres.json` that have no `row` (add the genre and its parentage lines first) and writes their rows, any grown lane size, and the new cost into `data/` |
| `python3 tools/layout/optimise.py optimise --iters N --seeds S [--out f.json]` | The original's full search. Prints each seed's cost and the best band order; with `--out` writes the result (shape of the original's `layout5.json`) to a file outside `data/`. Never writes into `data/` |
| `python3 tests/layout.py` | Runs `check` and a `place` of two made-up genres; fails on an invalid layout, a cost outside tolerance, or a moved row |

`--data DIR` before the command points at another copy of the data folder.

A genre file is a JSON list of `{"id", "name", "tradition", "family", "began", "ended", "tier", "parents": [{"id", "kind": "principal" | "other"}]}`, with an optional `definition` (its `window` is read for the end year, as the original did). The tradition must be an existing lane: a new tradition (a new lane) is not supported yet.

**How `place` chooses.** New genres are taken in the original's start order (tier, then start year). Each gets the valid row in its lane with the lowest total cost; then each is reconsidered in turn until none moves (this matters only when new genres are linked to each other or share a lane). A lane grows only if no row in it is valid, and then by as few rows as give a valid one. Rows are chosen on the lanes as drawn (the stored sizes `R`, the page's geometry), not on the taller lanes the search ran with (see below); both costs are reported.

## What `check` showed (23 November 2026, 593 genres)

```
593 genres in 163 lanes, 1176 tree lines, 1804 label pairs that need separation
valid by the rule:  yes
computed cost:      1503304.7906047849  (lanes at the sizes the search used: greedy start + 3)
stored cost:        1499774.2902569845
difference:         +3530.5003478003  (+0.2354%)
cost as drawn:      1278968.9168385325  (lanes at the stored sizes R; for information)
```

**Valid.** No pair of labels in the stored layout breaks the rule, and no lane holds a row beyond its stored size.

**Which lane sizes the cost uses.** The original measured cost while every lane had the size of its greedy start plus 3 rows, and only after the search shrank each lane to its highest used row + 1 (the stored `R`). The stored cost was never recomputed after that shrink. So `check` computes the greedy start on today's data and measures with those sizes; measured on the stored (drawn) sizes the same rows cost 1,278,969, 14.7% less, which is the cost of what the page shows. Consistent with this reading: in no lane is the stored size larger than the recomputed search size.

**The remaining 0.2354% is not reproduced, and its cause could not be identified.** What was established:

- The rows are the same: `data/layout.json` from the 22 November import (the published version 22 page) has the same 593 rows, the same cost and the same family and lane order as today.
- End years: the original read the end from the definition window (`onward` = still alive, `–1650` = 1650, else the stored end) and from `end_of()` (in the lost file) otherwise. Today's `ended` equals the window reading for all 461 genres with a definition. Treating the 132 genres without a definition as still alive changes nothing.
- The 132 pending genres were in the original run: dropping them and their lines moves the cost by −281,376, far off.
- It is not rounding. The cost function has no randomness; the search keeps its running cost by adding up changes, and floating-point error on sums of this size is around a millionth per million steps (an estimate, not measured), nowhere near 3,530.
- Not recoverable from what is left: (1) the exact inputs the original read: name lengths, start and end years, tiers and parent lists at the time of the run, any of which could have been edited since; and (2) the shift the original made before storing: each lane's rows were moved down so the lowest is 0, after the cost was taken. 113 of 163 lanes had room for such a shift, and the stored rows cannot say whether it happened.
- Trying changes to one or two lane sizes finds combinations that land within 0.01 of the stored cost, but among over 200,000 combinations such near matches are expected by chance, and the closest single change (a lane at 2 rows) is impossible under the original, whose search sizes are never below 3. None was adopted. No constant was changed.

**Tolerance in `tests/layout.py`: 0.25% of the stored cost.** It is the residual above (0.2354%) rounded up, so the stored layout passes and a real break of the port fails: measuring on the drawn lane sizes (−14.7%), a row pitch off by one pixel (−4.0%), a lane gap off by one pixel (−0.69%) or a wrong separation rule (+21%, and invalid) all exceed it. It does not catch every small slip: a family heading or bottom padding off by one pixel moves the cost by 0.09%, the label gap by 0.26%. Those constants are copied unchanged from `original/opt5.py` and can be compared by eye. After `place --write` the stored cost is this tool's own number, so from then on the difference should be about 0.

## The full search on today's data

`optimise` runs at about 25 microseconds a step on today's 593 genres (one seed: 20,000 steps 0.4 s, 200,000 steps 5.3 s, 2,000,000 steps 50 s). With 2,000,000 steps and one seed (seed 0) it reached 1,536,476, 2.2% worse than the stored layout measured the same way (1,503,305). How many steps and seeds the original used is not recorded. Every result is checked against the rule before it is printed, and a seed that ever produced an invalid layout would stop the run.

## Differences from the original

- Reads `data/genres.json`, `data/parentage.json`, `data/traditions.json`, `data/families.json`, `data/layout.json` instead of `data_ext.py` and `defs_merged.json`. Parents are principal first, then the others in file order, as `nodes` had them. A lane's family is the tradition's `family` (the original took the family of the tradition's first genre; the two agree for all 163 today). The family list order is `families.json`'s file order, as `BANDS` was.
- Stored layout: the family order is taken from each family's `order` field (as `tools/legacy_data.py` does) and lane orders from `lanes`.
- `run()` is unchanged; it also returns the lane sizes the search used. `optimise` checks every result against the rule and writes only to `--out`, not `layout5.json`.
- `check` and `place` are new.

| File | What it is |
| :- | :- |
| `optimise.py` | The port: `check`, `place`, `optimise` |
| `original/opt5.py` | The optimiser that produced the stored layout |
| `original/opt4.py` | The version before it |
| `original/tree5.js` | The drawing code of that time, for reference on how rows become positions |
