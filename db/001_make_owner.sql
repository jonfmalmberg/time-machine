-- 001_make_owner.sql
-- Run once per project, after 001_profiles.sql and after you have signed in
-- to the site with Google for the first time.
--
-- Step 1: run this line alone and check that the only row is you.
select id, email, created_at from auth.users order by created_at;

-- Step 2: copy your id from the result into the line below in place of
-- PASTE-YOUR-ID-HERE, then run it.
update public.profiles
   set role = 'owner', status = 'active'
 where id = 'PASTE-YOUR-ID-HERE';
