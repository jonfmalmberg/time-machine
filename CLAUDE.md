# World Music Time Machine: working rules

Read this before changing anything. The owner is Jon (GitHub `jonfmalmberg`).

## Start here, every session
1. `docs/vision/` holds dated records of what the owner wants and why. Their text is not rewritten: a change of direction is a new dated file, and anything in a record later found wrong gets a dated correction added inline at that spot. Errors are never left standing uncorrected. Read the newest, and the two founding ones if you have not: `2026-11-23-origins.md` (where the app came from and what it is) and `2026-11-23-direction.md` (where it is going).
2. `docs/PRINCIPLES.md`: how to judge a choice when no rule covers it.
3. `docs/ARCHITECTURE.md`: how the site is built and why, written for the owner. Update it in the same change as any work that alters the data model, the database, the tests or how the parts fit.
4. `docs/ROADMAP.md`: the plan and its order. GitHub milestones and issues track the same items; keep the two in step.
5. `docs/WORKLOG.md`: add an entry at the end of every session (what was done, what was decided and why, what is untested).
The app only succeeds if it feels good to use. Rules here are a floor; the vision record is the intent.

## Run, build, test (all local, no Cloudflare build used)
- `python3 serve.py` builds, serves http://localhost:8000 and rebuilds on every change to `src/` or `data/`.
- `python3 build.py` writes `dist/index.html` (never committed).
- `python3 tests/smoke.py` and `python3 tests/account.py` need Python Playwright with Chromium.
- `python3 tests/data.py` checks the music data against the data model's rules (standard library only).
- `bash db/test.sh` checks the database access rules on a throwaway local Postgres.
- `python3 tests/evidence.py` checks the evidence-check script against pages the owner has looked at himself. It needs web access; run it after any change to `tools/check_evidence.py`.
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
- Every table: `revoke all` first, row-level security on, explicit grants for exactly what the site uses. Nothing is readable by visitors who are not signed in; the only things they can do are add rows to `anon_events` and file a request through `request_add()` or `request_many()`.
- Never commit a secret key. Only publishable keys appear in the repository.
- Stay on free plans with no payment card, so no bill is possible.

## Data and profiles
- **No made-up data.** Nothing enters `data/` as sourced unless `python3 tools/check_evidence.py` finds its recorded string on its recorded page. A claim that cannot be checked (the site refuses scripts, the page is gone) stays out, or is stored marked unverified and is never shown as sourced. A model's reading of a page is not evidence: quotes are copied from the raw page text.
- A profile holds the minimum. Saved history points at site data by stable key (country code, city key `ISO:name`, region id, genre id), never by copied name or list position.

## Look and feel
- Clean, minimal, modern native iOS feel on phone and desktop: grouped inset lists, segmented controls, sheets. Not generic or older-Android styling.
- Works at 400px wide with no sideways page scroll, in light and dark themes. Use the colour tokens in `src/mods/95_app.css`.
- One place per function: do not add a second permanent control for something that already has one.

## Code layout
- `src/template.html`: markup, core styles, core script. `src/mods/NN_name.js|css`: feature modules, joined in file-name order; each script module runs in its own function and reaches the page's top-level names directly.
- `data/`: the music data in the model described in `docs/proposals/2026-11-23-schema.md` and `docs/ARCHITECTURE.md`. Songs, artists and evidence are central files with standalone keys; `data/scopes/` holds research state and `data/links/` says which songs belong to which genre or country-year. One record per line. Only the lead's master-table step adds songs, artists or evidence.
- The page still reads the old data shape, which `tools/legacy_data.py` rebuilds from the new files at build time. `data/legacy-order.json` exists only for that.
- A synthetic-listener test that has been run is recorded in its scope file under `tests` (use `python3 tests/listener/run.py record --apply`).

## Helpers
- A daily scheduled run works as a helper: it takes one assignment from `work/QUEUE.md`, writes only inside `work/`, pushes one `helper/<date>-<id>` branch and reports on the run log issue. Rules, roles and which model does which work are in `work/README.md`.
- The session the owner talks to is the lead: it is responsible for the project, writes the queue, reviews helper branches at the start of each session, and moves accepted work into `data/`, `src/` or `docs/` on a feature branch.
- Cloudflare builds only when `src/`, `data/`, `build.py` or `wrangler.jsonc` change (build watch paths), so helper branches and documentation do not use builds.

## People
- Issues the owner raises can be worked on directly. Issues from other users need the owner's approval first.
- The owner's email address is private: it must not appear in the repository or be sent to any service.
