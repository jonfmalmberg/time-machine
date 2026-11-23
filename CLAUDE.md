# World Music Time Machine: working rules

Read this before changing anything. The owner is Jon (GitHub `jonfmalmberg`).

## Run, build, test (all local, no Cloudflare build used)
- `python3 serve.py` builds, serves http://localhost:8000 and rebuilds on every change to `src/` or `data/`.
- `python3 build.py` writes `dist/index.html` (never committed).
- `python3 tests/smoke.py` and `python3 tests/account.py` need Python Playwright with Chromium.
- `bash db/test.sh` checks the database access rules on a throwaway local Postgres.
- All tests must pass before anything is pushed.

## Branches and approval
- `main` is the live site. It changes only when the owner explicitly approves a release.
- `dev` holds features the owner has approved as working. It must always run.
- Each feature is built on its own branch from `dev` and squash-merged into `dev` after approval.
- Never commit unfinished or non-running work to `dev` or `main`.

## Cloudflare builds are a limited free allowance
- Every push to GitHub builds. Work and test locally; push a feature branch only when there is something for the owner to review, once per review round.
- Batch data updates (`data/`) into one push.

## Database (Supabase)
- Two projects: dev and prod. Addresses and public keys are in `src/mods/04_config.js`. The prod address uses prod; every other address, including localhost, uses dev.
- Work freely in dev. Change prod only with the owner's approval, by running the numbered files in `db/` in order.
- User data in prod is immutable without the owner's explicit approval: no change may delete, rewrite or break it.
- Every table: `revoke all` first, row-level security on, explicit grants for exactly what the site uses. Nothing is readable by visitors who are not signed in; the only things they can do are add rows to `anon_events` and file a request through `request_add()`.
- Never commit a secret key. Only publishable keys appear in the repository.
- Stay on free plans with no payment card, so no bill is possible.

## Data and profiles
- A profile holds the minimum. Saved history points at site data by stable key (country code, city key `ISO:name`, region id, genre id), never by copied name or list position.

## Look and feel
- Clean, minimal, modern native iOS feel on phone and desktop: grouped inset lists, segmented controls, sheets. Not generic or older-Android styling.
- Works at 400px wide with no sideways page scroll, in light and dark themes. Use the colour tokens in `src/mods/95_app.css`.
- One place per function: do not add a second permanent control for something that already has one.

## Code layout
- `src/template.html`: markup, core styles, core script. `src/mods/NN_name.js|css`: feature modules, joined in file-name order; each script module runs in its own function and reaches the page's top-level names directly.
- `data/*.json`: one file per key of the page's `DATA` object, one entry per line.
- `data/tests.json`: one line per synthetic-listener test that has been run (country `iso` with years `y0`–`y1`, or genre `g`). The playlist panel reads it to show a test as done; add a line whenever a test is run.

## People
- Issues the owner raises can be worked on directly. Issues from other users need the owner's approval first.
- The owner's email address is private: it must not appear in the repository or be sent to any service.
