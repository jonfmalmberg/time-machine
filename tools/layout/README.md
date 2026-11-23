# Tree layout

Each genre's row on the family tree is stored in `data/layout.json`. It was computed once, before the project moved to this repository, by the scripts in `original/`. They were recovered from the workspace on 23 November 2026 and are kept here unchanged so the method is not lost.

**What the method does** (from `original/opt5.py`): one fixed layout for every zoom level. Genres sit in lanes, one lane per tradition, lanes grouped by family. Rows inside each lane are chosen so that, at the zoom where a genre's label appears, it never collides with another visible label. Among layouts that satisfy that, it searches (random restarts and local moves) for the one with the smallest total weighted length of the tree's lines at full zoom. The `cost` in `data/layout.json` is that final total.

**State:** not runnable as they stand. They read data from a file of the old artifact (`data_ext.py`) that no longer exists, and write `layout5.json`. Roadmap 2.13 is to rewrite the method to read `data/genres.json`, `data/parentage.json` and `data/traditions.json`, run it as a tool, and check that on today's data it reproduces a layout at least as good as the stored one. Only then can a genre be added to the tree.

| File | What it is |
| :- | :- |
| `original/opt5.py` | The optimiser that produced the stored layout |
| `original/opt4.py` | The version before it |
| `original/tree5.js` | The drawing code of that time, for reference on how rows become positions |
