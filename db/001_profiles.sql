-- 001_profiles.sql
-- Accounts: one small profile row per signed-in person.
--
-- What this file does, in order:
--   1. Creates the table public.profiles.
--   2. Adds a helper that answers "is the caller the owner?".
--   3. Creates a profile row automatically when someone signs in for the
--      first time, and refuses new sign-ups once 1,000 profiles exist.
--   4. Opens exactly this much to the website:
--        - a signed-in person can read their own row and set their own handle;
--        - the owner can read every row and set anyone's role and status.
--      Visitors who are not signed in can reach nothing.
--
-- Run once per project: dev while the feature is built, prod when the
-- release is approved. Nothing here deletes or changes existing data.

-- 1. The table -------------------------------------------------------------

create table public.profiles (
  -- Same id as the sign-in record. Deleting the sign-in deletes the profile.
  id      uuid primary key references auth.users (id) on delete cascade,
  -- Public name chosen by the person. Empty until they pick one.
  handle  text check (handle ~ '^[A-Za-z0-9_]{3,24}$'),
  role    text not null default 'beta'
          check (role in ('beta', 'principal', 'owner')),
  -- 'pending' = asked for a profile, not yet let in.
  status  text not null default 'pending'
          check (status in ('pending', 'active', 'suspended')),
  joined  timestamptz not null default now()
);

-- Handles are unique regardless of capitals ("Jon" and "jon" are the same).
create unique index profiles_handle_key on public.profiles (lower(handle));

-- Row-level security on: no row is visible or changeable without a policy.
alter table public.profiles enable row level security;

-- 2. "Is the caller the owner?" --------------------------------------------
-- Runs with the table owner's rights so that it can look at the caller's own
-- row without tripping over the row rules it is used in.

create function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'owner' and status = 'active'
  );
$$;

revoke execute on function public.is_owner() from public, anon;
grant  execute on function public.is_owner() to authenticated;

-- 3. A profile for every new sign-in, up to the cap -------------------------

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.profiles) >= 1000 then
    raise exception 'Sign-ups are closed: the user cap has been reached.';
  end if;
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

-- Only the trigger may run it; nobody can call it through the website.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. What the website may do ------------------------------------------------

-- Start from nothing: remove every privilege Supabase gives new tables by
-- default, then add back only what the site uses. Signed-in people only;
-- nothing is granted to anon (not signed in).
revoke all on public.profiles from anon, authenticated;
grant select          on public.profiles to authenticated;
grant update (handle) on public.profiles to authenticated;

create policy "read own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "owner reads all profiles"
  on public.profiles for select to authenticated
  using (public.is_owner());

create policy "set own handle"
  on public.profiles for update to authenticated
  using      ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Role and status can only be changed through this function, and only by
-- the owner. The grant above lets people change the handle column and
-- nothing else.
create function public.admin_set_profile(target uuid, new_role text, new_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_owner() then
    raise exception 'Owner only.';
  end if;
  update public.profiles
     set role = new_role, status = new_status
   where id = target;
end;
$$;

revoke execute on function public.admin_set_profile(uuid, text, text) from public, anon;
grant  execute on function public.admin_set_profile(uuid, text, text) to authenticated;
