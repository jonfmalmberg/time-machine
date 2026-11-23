-- 004_anon_events.sql
-- A bounded log of what visitors who are not signed in do in the app.
--
-- What this file does, in order:
--   1. public.anon_events: one row per action (a view opened, a place and
--      year chosen, a prompt copied). No account, no address, no device id:
--      only a random id for the visit, the action, and what it pointed at.
--   2. Limits that keep it from growing without end or being flooded:
--        - it holds the newest 250,000 rows; older rows are removed as new
--          ones arrive;
--        - at most 600 rows a minute are accepted in total.
--   3. Visitors can add rows and nothing else. Only the owner can read them.
--   4. admin_stats() also reports how full the log is.
--
-- This is the one table that visitors who are not signed in can write to.
-- Run once per project, after 003_trips_events.sql.

-- 1. The table -------------------------------------------------------------

create table public.anon_events (
  id       bigint generated always as identity primary key,
  at       timestamptz not null default now(),
  session  text check (length(session) <= 24),
  action   text not null check (length(action) <= 24),
  ref      jsonb check (ref is null or pg_column_size(ref) <= 600)
);

create index anon_events_at_idx on public.anon_events (at);

alter table public.anon_events enable row level security;

-- 2. Limits ------------------------------------------------------------------

create function public.anon_events_cap()
returns bigint
language sql
immutable
set search_path = ''
as $$ select 250000::bigint $$;

revoke execute on function public.anon_events_cap() from public, anon, authenticated;

-- Runs once after each insert, whatever the number of rows in it.
create function public.anon_events_limits()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  newest bigint;
begin
  if (select count(*) from public.anon_events
       where at > now() - interval '1 minute') > 600 then
    -- Refuses this insert; nothing already stored is touched.
    raise exception 'Too many events right now.';
  end if;
  select max(id) into newest from fresh;
  -- Row ids only ever go up, so "everything more than 250,000 behind the
  -- newest" is exactly the oldest overflow.
  delete from public.anon_events where id <= newest - public.anon_events_cap();
  return null;
end;
$$;

revoke execute on function public.anon_events_limits() from public, anon, authenticated;

create trigger anon_events_limits
  after insert on public.anon_events
  referencing new table as fresh
  for each statement execute function public.anon_events_limits();

-- 3. What the website may do ------------------------------------------------

revoke all on public.anon_events from anon, authenticated;
-- Only these three columns can be set; the time is filled in by the database.
grant insert (session, action, ref) on public.anon_events to anon, authenticated;
grant select on public.anon_events to authenticated;

create policy "anyone adds anonymous events"
  on public.anon_events for insert to anon, authenticated
  with check (true);

create policy "owner reads anonymous events"
  on public.anon_events for select to authenticated
  using (public.is_owner());

-- 4. Totals for the owner's dashboard, now with the anonymous log ------------

create or replace function public.admin_stats()
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
    'invites',   (select count(*) from public.invites where used_by is null and expires_at > now()),
    'anon',      (select count(*) from public.anon_events),
    'anon_cap',  public.anon_events_cap(),
    'anon7',     (select count(*) from public.anon_events where at > now() - interval '7 days'),
    'anon_from', (select min(at) from public.anon_events)
  );
end;
$$;
