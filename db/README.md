# Database

Each numbered `.sql` file is one change to the Supabase database, kept here so the database can always be rebuilt from the repository and every change can be reviewed.

| File | What it does | Dev | Prod |
| :- | :- | :- | :- |
| `001_profiles.sql` | Profiles table, sign-up trigger with the 1,000 cap, access rules, owner-only role changes | 22 Nov 2026 | 22 Nov 2026 |
| `002_invites.sql` | One-time invite codes that expire after 14 days; a used code is an endorsement; activation at 1 endorsement (2 from 100 members), closed at 1,000 | 22 Nov 2026 | 22 Nov 2026 |
| `003_trips_events.sql` | Travel history and usage events for active testers, per-person limits, totals for the owner | 22 Nov 2026 | 22 Nov 2026 |
| `004_anon_events.sql` | Bounded log of what visitors who are not signed in do: newest 250,000 rows kept, 600 a minute accepted, owner-only reading | 22 Nov 2026 | 22 Nov 2026 |
| `001_make_owner.sql` | Makes the first signed-in person the owner | 22 Nov 2026 | 22 Nov 2026 |

## How changes are applied
- **Dev** is the working database. Changes are tried there freely while a feature is built.
- **Prod** is changed only when the owner approves a release, by running the same files that were proven in dev.
- **User data in prod is treated as immutable.** No change may delete, rewrite or break existing user rows without the owner's explicit approval. Changes to prod add tables, columns and rules; anything that would drop or alter stored data is written as a separate file and flagged for approval.
- A file is never edited after it has run in prod; a later change is a new numbered file.

## Rules every file follows
- Visitors who are not signed in can read nothing. The only thing they can do is add rows to `anon_events`, which is bounded in size and rate.
- Every table has row-level security on and an explicit `grant` for exactly the columns and actions the site uses.
- No keys or email addresses are written in these files.

`test.sh` runs the numbered files against a throwaway local Postgres with a stand-in for Supabase's sign-in tables and checks the access rules.
