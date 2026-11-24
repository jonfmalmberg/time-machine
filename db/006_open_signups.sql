-- 006_open_signups.sql
-- New accounts are let in straight away (owner's decision, 23 Nov 2026).
--
-- Before: a new sign-in got a 'pending' profile and waited for the owner or an
-- invite code. Signing in only gives a person their own travel log, so there
-- is nothing to gate yet. Approval is kept for what is not built: filing
-- issues and voting. That gate will be its own flag when those exist; the
-- 'beta' role and the invite functions stay as they are.
--
-- What this does:
--   1. A new profile starts 'active' instead of 'pending'.
--   2. Profiles already waiting are let in. No row is deleted; no other
--      column changes. 'suspended' profiles stay suspended.
-- The cap of 1,000 profiles (001) still applies.
--
-- Run once per project, after 005_requests.sql.

alter table public.profiles alter column status set default 'active';

update public.profiles set status = 'active' where status = 'pending';
