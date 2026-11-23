-- 002_invites.sql
-- Invites: an active member vouches for a newcomer with a one-time code.
--
-- What this file does, in order:
--   1. Creates the table public.invites. A used invite is the record that
--      one member endorsed another.
--   2. create_invite(): an active member gets a new one-time code.
--   3. redeem_invite(code): a signed-in person whose profile is pending uses
--      a code. With enough endorsements the profile becomes active at once:
--      one endorsement while there are fewer than 100 active members, two
--      from 100 on, and nobody new once 1,000 are active.
--   4. Opens exactly this much to the website: a member can list the invites
--      they created, and call the two functions. Nothing else, and nothing
--      at all for visitors who are not signed in.
--
-- Run once per project, after 001_profiles.sql. Nothing here deletes or
-- changes existing data.

-- 1. The table -------------------------------------------------------------

create table public.invites (
  -- Twelve characters, stored without dashes, e.g. 3F9A0C27B81D.
  code        text primary key check (code ~ '^[0-9A-F]{12}$'),
  created_by  uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  -- An unused code stops working after 14 days.
  expires_at  timestamptz not null default now() + interval '14 days',
  -- Empty until someone uses the code. A code works once.
  used_by     uuid references public.profiles (id) on delete cascade,
  used_at     timestamptz,
  -- The same member cannot endorse the same person twice.
  unique (created_by, used_by)
);

create index invites_used_by_idx on public.invites (used_by);

alter table public.invites enable row level security;

-- 2. A new code for an active member ---------------------------------------
-- Members may hold three unused, unexpired codes at a time; the owner has
-- no limit.

create function public.create_invite()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  me     uuid := (select auth.uid());
  mine   public.profiles;
  fresh  text;
begin
  select * into mine from public.profiles where id = me;
  if mine.id is null or mine.status <> 'active' then
    raise exception 'Only active members can invite.';
  end if;
  if mine.role <> 'owner'
     and (select count(*) from public.invites
          where created_by = me and used_by is null and expires_at > now()) >= 3 then
    raise exception 'You already have three unused invites.';
  end if;
  fresh := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
  insert into public.invites (code, created_by) values (fresh, me);
  return fresh;
end;
$$;

revoke execute on function public.create_invite() from public, anon;
grant  execute on function public.create_invite() to authenticated;

-- 3. Using a code -----------------------------------------------------------

create function public.redeem_invite(invite_code text)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  me        uuid := (select auth.uid());
  mine      public.profiles;
  clean     text := upper(regexp_replace(coalesce(invite_code, ''), '[^0-9A-Fa-f]', '', 'g'));
  inv       public.invites;
  have      int;
  need      int;
  members   int;
begin
  select * into mine from public.profiles where id = me;
  if mine.id is null then
    raise exception 'Sign in first.';
  end if;
  if mine.status <> 'pending' then
    raise exception 'This profile is not waiting for approval.';
  end if;

  -- Lock the row so two people cannot use one code at the same moment.
  select * into inv from public.invites
   where code = clean and used_by is null and expires_at > now()
   for update;
  if inv.code is null
     or inv.created_by = me
     or not exists (select 1 from public.profiles
                     where id = inv.created_by and status = 'active')
     or exists (select 1 from public.invites
                 where created_by = inv.created_by and used_by = me) then
    raise exception 'That code is not valid, has expired or has already been used.';
  end if;

  update public.invites set used_by = me, used_at = now() where code = inv.code;

  select count(*) into have    from public.invites  where used_by = me;
  select count(*) into members from public.profiles where status = 'active';
  need := case when members < 100 then 1 else 2 end;

  if have >= need then
    if members >= 1000 then
      raise exception 'The tester list is full.';
    end if;
    update public.profiles set status = 'active' where id = me;
  end if;

  return json_build_object('active', have >= need, 'have', have, 'need', need);
end;
$$;

revoke execute on function public.redeem_invite(text) from public, anon;
grant  execute on function public.redeem_invite(text) to authenticated;

-- 4. What the website may do ------------------------------------------------

revoke all on public.invites from anon, authenticated;
grant select on public.invites to authenticated;

create policy "read invites I created"
  on public.invites for select to authenticated
  using ((select auth.uid()) = created_by);
