-- 003_trips_events.sql
-- Travel history and usage events for active testers.
--
-- What this file does, in order:
--   1. is_active(): "is the caller an active member?".
--   2. public.trips: one row per playlist prompt a tester copied, with what
--      they later said about it. Places and genres are stored as keys that
--      point into the site's data (country code, city key, genre id), never
--      as copies of names, so data changes do not break saved history.
--   3. public.events: a small log of what testers do in the app (which view,
--      what was copied). Testers can add rows; only the owner can read them.
--   4. admin_stats(): totals for the owner's dashboard.
--   5. Limits that protect the free plan: 5,000 trips per person and 2,000
--      events per person per day.
--
-- Run once per project, after 002_invites.sql. Nothing here deletes or
-- changes existing data.

-- 1. "Is the caller an active member?" --------------------------------------

create function public.is_active()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and status = 'active'
  );
$$;

revoke execute on function public.is_active() from public, anon;
grant  execute on function public.is_active() to authenticated;

-- 2. Trips -------------------------------------------------------------------

create table public.trips (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid()
              references public.profiles (id) on delete cascade,
  kind        text not null check (kind in ('trip', 'genre')),
  -- Identifies "the same destination" so a repeat copy is one trip.
  key         text not null check (length(key) <= 200),
  -- Pointer to the place: {"k":"cty","iso":"JP"}, {"k":"city","c":"JP:Tokyo","iso":"JP"},
  -- {"k":"reg","reg":"easia"} or {"k":"multi","items":[...]}.
  place       jsonb check (place is null or pg_column_size(place) <= 2000),
  iso         text check (length(iso) <= 3),
  reg         text check (length(reg) <= 20),
  year        int  check (year between -10000 and 3000),
  span        int  check (span between 0 and 20000),
  from_year   int  check (from_year between -10000 and 3000),
  mode        text check (length(mode) <= 10),
  -- Genre id for kind = 'genre'.
  gid         text check (length(gid) <= 60),
  -- Only used when no pointer can be formed.
  label       text check (length(label) <= 80),
  status      text not null default 'copied'
              check (status in ('copied', 'listened', 'loved', 'left', 'never')),
  react       text check (length(react) <= 12),
  rating      smallint check (rating between 1 and 10),
  note        text check (length(note) <= 300),
  n           int not null default 1 check (n between 1 and 100000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index trips_user_idx on public.trips (user_id, created_at desc);

alter table public.trips enable row level security;

create function public.trips_cap()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.trips where user_id = new.user_id) >= 5000 then
    raise exception 'Trip limit reached for this profile.';
  end if;
  return new;
end;
$$;

revoke execute on function public.trips_cap() from public, anon, authenticated;

create trigger trips_cap before insert on public.trips
  for each row execute function public.trips_cap();

revoke all on public.trips from anon, authenticated;
grant select, insert, update, delete on public.trips to authenticated;

create policy "read own trips, owner reads all"
  on public.trips for select to authenticated
  using ((select auth.uid()) = user_id or public.is_owner());

create policy "active members add own trips"
  on public.trips for insert to authenticated
  with check ((select auth.uid()) = user_id and public.is_active());

create policy "active members change own trips"
  on public.trips for update to authenticated
  using      ((select auth.uid()) = user_id and public.is_active())
  with check ((select auth.uid()) = user_id and public.is_active());

create policy "remove own trips"
  on public.trips for delete to authenticated
  using ((select auth.uid()) = user_id);

-- 3. Events ------------------------------------------------------------------

create table public.events (
  id       bigint generated always as identity primary key,
  user_id  uuid not null default auth.uid()
           references public.profiles (id) on delete cascade,
  at       timestamptz not null default now(),
  -- Random id for one visit, to group events; not tied to the device.
  session  text check (length(session) <= 24),
  action   text not null check (length(action) <= 24),
  ref      jsonb check (ref is null or pg_column_size(ref) <= 1000)
);

create index events_user_idx on public.events (user_id, at desc);

alter table public.events enable row level security;

create function public.events_cap()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.events
       where user_id = new.user_id and at > now() - interval '1 day') >= 2000 then
    raise exception 'Daily event limit reached for this profile.';
  end if;
  return new;
end;
$$;

revoke execute on function public.events_cap() from public, anon, authenticated;

create trigger events_cap before insert on public.events
  for each row execute function public.events_cap();

revoke all on public.events from anon, authenticated;
-- Testers may set only these three columns; who and when are filled in by
-- the database and cannot be forged.
grant insert (session, action, ref) on public.events to authenticated;
grant select on public.events to authenticated;

create policy "active members add own events"
  on public.events for insert to authenticated
  with check ((select auth.uid()) = user_id and public.is_active());

create policy "owner reads events"
  on public.events for select to authenticated
  using (public.is_owner());

-- 4. Totals for the owner's dashboard ----------------------------------------

create function public.admin_stats()
returns json
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_owner() then
    raise exception 'Owner only.';
  end if;
  return json_build_object(
    'active',    (select count(*) from public.profiles where status = 'active'),
    'pending',   (select count(*) from public.profiles where status = 'pending'),
    'suspended', (select count(*) from public.profiles where status = 'suspended'),
    'trips',     (select count(*) from public.trips),
    'rated',     (select count(*) from public.trips where rating is not null),
    'events7',   (select count(*) from public.events where at > now() - interval '7 days'),
    'invites',   (select count(*) from public.invites where used_by is null and expires_at > now())
  );
end;
$$;

revoke execute on function public.admin_stats() from public, anon;
grant  execute on function public.admin_stats() to authenticated;
