-- 007_admin_usage_ideas.sql
-- Two things for the owner's admin page.
--
--   1. admin_usage(days): one summary of what was used on the site over the
--      last N days (1 to 90), for signed-in people and for visitors who are
--      not signed in, side by side. It reads the two usage logs (events,
--      anon_events) and the travel log (trips). It returns counts only, plus
--      for signed-in people their handle and how much they used the site.
--      Owner only. The inner function admin_usage_raw does the counting and
--      cannot be called through the website at all.
--   2. The table public.ideas: the owner's list of features that could be
--      built, in the order he gives them. Owner only: nobody else can read
--      or change a row.
--
-- Nothing here deletes or changes existing data. Run once per project, after
-- 006_open_signups.sql.

-- 1. Usage summary ---------------------------------------------------------

create function public.admin_usage_raw(days int)
returns json
language sql
stable
security definer
set search_path = ''
as $$
with w as (select greatest(1, least(coalesce(days, 14), 90)) as d),
u as (
  select 'member'::text as who, e.user_id, e.at, e.session, e.action, e.ref
    from public.events e, w where e.at > now() - make_interval(days => w.d)
  union all
  select 'anon', null, a.at, a.session, a.action, a.ref
    from public.anon_events a, w where a.at > now() - make_interval(days => w.d)
),
-- one row per visit (the random id a page load gives itself)
s as (
  select who, session, min(at) as t0, max(at) as t1, count(*) as n,
         bool_or(action in ('filter', 'welcome', 'random'))                              as chose,
         bool_or(action in ('paneltab', 'listen', 'platform', 'play', 'copy', 'open_link')) as panel,
         bool_or(action = 'play')                                                        as played,
         bool_or(action in ('copy', 'listen', 'open_link'))                              as took,
         bool_or(action = 'share')                                                       as shared
    from u where session is not null group by who, session
),
f as (select * from u where action = 'filter')
select json_build_object(
  'days', (select d from w),
  'by_day', (select coalesce(json_agg(x order by x.d), '[]'::json) from (
      select (t0 at time zone 'UTC')::date as d,
             count(*) filter (where who = 'anon') as anon,
             count(*) filter (where who = 'member') as member
        from s group by 1) x),
  'funnel', (select coalesce(json_agg(x), '[]'::json) from (
      select who, count(*) as visits,
             count(*) filter (where n > 1)  as stayed,
             count(*) filter (where chose)  as chose,
             count(*) filter (where panel)  as panel,
             count(*) filter (where played) as played,
             count(*) filter (where took)   as took,
             count(*) filter (where shared) as shared,
             round(percentile_cont(0.5) within group (order by extract(epoch from t1 - t0))) as median_seconds
        from s group by who) x),
  'actions', (select coalesce(json_agg(x order by x.n desc), '[]'::json) from (
      select action, count(*) as n, count(*) filter (where who = 'member') as member
        from u group by action) x),
  'views', (select coalesce(json_agg(x order by x.n desc), '[]'::json) from (
      select ref->>'v' as k, count(distinct session) as n,
             count(distinct session) filter (where who = 'member') as member
        from u where action = 'view' and ref->>'v' is not null group by 1) x),
  'places', (select coalesce(json_agg(x order by x.n desc), '[]'::json) from (
      select ref->>'pl' as k, count(distinct session) as n,
             count(distinct session) filter (where who = 'member') as member
        from f where ref->>'pl' is not null group by 1 order by 2 desc limit 15) x),
  'genres', (select coalesce(json_agg(x order by x.n desc), '[]'::json) from (
      select ref->>'g' as k, count(distinct session) as n,
             count(distinct session) filter (where who = 'member') as member
        from f where ref->>'g' is not null group by 1 order by 2 desc limit 15) x),
  'decades', (select coalesce(json_agg(x order by x.k), '[]'::json) from (
      select (floor((ref->>'y0')::numeric / 10) * 10)::int as k, count(distinct session) as n,
             count(distinct session) filter (where who = 'member') as member
        from f where ref->>'y0' ~ '^-?[0-9]{1,5}$' and ref->>'y1' ~ '^-?[0-9]{1,5}$'
                 and (ref->>'y1')::int - (ref->>'y0')::int <= 30 and (ref->>'y0')::int >= 1900
       group by 1) x),
  'services', (select coalesce(json_agg(x order by x.n desc), '[]'::json) from (
      select ref->>'on' as k, count(*) as n, count(*) filter (where who = 'member') as member
        from u where action in ('play', 'listen') and ref->>'on' is not null group by 1) x),
  'members', (select coalesce(json_agg(x order by x.last desc), '[]'::json) from (
      select p.id, p.handle, count(distinct e.session) as visits, count(*) as events, max(e.at) as last,
             (select count(*) from public.trips t where t.user_id = p.id) as trips,
             (select count(*) from public.trips t where t.user_id = p.id and (t.rating is not null or t.status <> 'copied')) as reviewed
        from u e join public.profiles p on p.id = e.user_id
       where e.who = 'member' group by p.id, p.handle order by max(e.at) desc limit 50) x),
  'trips', (select json_build_object(
      'total', count(*), 'rated', count(*) filter (where rating is not null),
      'reviewed', count(*) filter (where rating is not null or status <> 'copied'),
      'mean_rating', round(avg(rating)::numeric, 1),
      'by_status', (select coalesce(json_object_agg(status, c), '{}'::json) from (select status, count(*) c from public.trips group by status) z))
      from public.trips)
);
$$;

revoke execute on function public.admin_usage_raw(int) from public, anon, authenticated;

create function public.admin_usage(days int default 14)
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
  return public.admin_usage_raw(days);
end;
$$;

revoke execute on function public.admin_usage(int) from public, anon;
grant  execute on function public.admin_usage(int) to authenticated;

-- 2. Ideas -----------------------------------------------------------------

create table public.ideas (
  id          bigint generated always as identity primary key,
  -- Short fixed name, so the same idea is never added twice by a script.
  slug        text unique check (slug ~ '^[a-z0-9-]{2,60}$'),
  title       text not null check (length(title) between 1 and 120),
  body        text check (length(body) <= 800),
  -- What part of the site it belongs to (free text, shown as a tag).
  area        text check (length(area) <= 24),
  -- Rough cost: S, M or L.
  size        text check (size in ('S', 'M', 'L')),
  -- Who wrote it: 'lead' (Claude) or 'owner'.
  by          text not null default 'owner' check (by in ('lead', 'owner')),
  status      text not null default 'idea'
              check (status in ('idea', 'next', 'building', 'done', 'dropped')),
  -- The owner's order: lower is higher on the list.
  pos         double precision not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.ideas enable row level security;
revoke all on public.ideas from public, anon, authenticated;
grant select, insert, update, delete on public.ideas to authenticated;

create policy "owner reads ideas"   on public.ideas for select to authenticated using ((select public.is_owner()));
create policy "owner adds ideas"    on public.ideas for insert to authenticated with check ((select public.is_owner()));
create policy "owner changes ideas" on public.ideas for update to authenticated using ((select public.is_owner())) with check ((select public.is_owner()));
create policy "owner removes ideas" on public.ideas for delete to authenticated using ((select public.is_owner()));
