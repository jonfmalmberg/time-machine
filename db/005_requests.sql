-- 005_requests.sql
-- Requests from people using the site: "test this playlist with a synthetic
-- listener" and "research this place and decade".
--
-- The site cannot run a synthetic listener or research on the spot. A request
-- is logged here, the person is told it was received, and the owner sees the
-- list on the Admin page. The same request made again adds to its count
-- instead of making a new row, so the count shows demand.
--
-- What this file does, in order:
--   1. public.requests: one row per distinct request.
--   2. request_add(): the only way to add or repeat a request. Anyone may
--      call it, signed in or not. It refuses floods (more than 60 distinct
--      requests a minute in total) and stops at 5,000 open requests.
--   3. Only the owner can read the list, mark a request done or declined,
--      and add a note.
--   4. admin_stats() also reports the number of open requests.
--
-- Run once per project, after 004_anon_events.sql.

-- 1. The table -------------------------------------------------------------

create table public.requests (
  id        bigint generated always as identity primary key,
  kind      text not null check (kind in ('listener', 'research')),
  -- What is being asked for, as a stable key: place, years, and for a
  -- listener test the playlist settings. Same key = same request.
  key       text not null check (length(key) between 1 and 200),
  -- Details the owner needs to act on it (place key, years, the prompt text).
  ref       jsonb check (ref is null or pg_column_size(ref) <= 12000),
  -- How many times it has been asked for.
  n         int not null default 1,
  status    text not null default 'open'
            check (status in ('open', 'done', 'declined')),
  first_at  timestamptz not null default now(),
  last_at   timestamptz not null default now(),
  -- The first person to ask, if they were signed in.
  user_id   uuid references public.profiles (id) on delete set null,
  note      text check (length(note) <= 500),
  unique (kind, key)
);

create index requests_status_idx on public.requests (status, last_at desc);

alter table public.requests enable row level security;

-- 2. Adding or repeating a request ------------------------------------------

create function public.request_add(req_kind text, req_key text, req_ref jsonb)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  result text;
begin
  if not exists (select 1 from public.requests where kind = req_kind and key = req_key) then
    if (select count(*) from public.requests
         where first_at > now() - interval '1 minute') >= 60 then
      raise exception 'Too many requests right now. Try again in a minute.';
    end if;
    if (select count(*) from public.requests where status = 'open') >= 5000 then
      raise exception 'The request list is full for now.';
    end if;
  end if;

  insert into public.requests (kind, key, ref, user_id)
  values (req_kind, req_key, req_ref, (select auth.uid()))
  on conflict (kind, key) do update
     set n = least(public.requests.n + 1, 1000000),
         last_at = now()
  returning status into result;

  return result;
end;
$$;

revoke execute on function public.request_add(text, text, jsonb) from public;
grant  execute on function public.request_add(text, text, jsonb) to anon, authenticated;

-- 3. What the website may do ------------------------------------------------

revoke all on public.requests from anon, authenticated;
grant select                on public.requests to authenticated;
grant update (status, note) on public.requests to authenticated;

create policy "owner reads requests"
  on public.requests for select to authenticated
  using (public.is_owner());

create policy "owner settles requests"
  on public.requests for update to authenticated
  using      (public.is_owner())
  with check (public.is_owner());

-- 4. Totals for the owner's dashboard, now with open requests ----------------

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
    'anon_from', (select min(at) from public.anon_events),
    'requests',  (select count(*) from public.requests where status = 'open')
  );
end;
$$;
