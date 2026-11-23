# World Music Time Machine

Pick a place and a year and hear what people there were listening to. The site explores world music history as a family tree, a map and a timeline, and writes playlist prompts for a place and time or for a genre.

## Layout

| Path | What it is |
| :- | :- |
| `src/template.html` | The page: markup, core styles and core script. |
| `src/mods/NN_name.js`, `.css` | Feature modules, added to the page in file-name order. |
| `data/*.json` | The music data, one file per key of the page's `DATA` object. One entry per line so changes show up clearly in a diff. |
| `build.py` | Joins the three into `dist/index.html`. Standard-library Python only. |
| `db/*.sql` | Database changes for Supabase, in order. See `db/README.md`. |
| `tests/smoke.py` | Loads the built page at phone and desktop size, opens every tab, fails on any script error. |
| `tests/account.py` | Checks the account block with a stand-in for the sign-in library. |

`dist/` is build output and is never committed.

## Build and test

```
python3 build.py
python3 tests/smoke.py    # needs Python Playwright with Chromium
python3 tests/account.py
bash db/test.sh           # needs a local Postgres server
```

Open `dist/index.html` in a browser, or serve the `dist` folder from any static host.

## Branches

- `main` is production. It changes only when the owner approves a release from `dev`.
- `dev` holds finished, approved features and must always run.
- Each feature is built on its own branch and squash-merged into `dev` once the owner approves it. Unfinished work stays on its feature branch.

Pull requests are welcome; open them against `dev`.

## Loads from other sites

Google Fonts, jsDelivr (world map outlines, satellite image fallback), MusicBrainz and the Cover Art Archive (cover thumbnails, looked up in the visitor's browser and not stored here). Links open YouTube, Google, Wikipedia and TuneMyMusic in a new tab.

## Licence

MIT. See `LICENSE`.
