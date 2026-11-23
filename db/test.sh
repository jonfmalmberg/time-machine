#!/usr/bin/env bash
# Checks the access rules in the db/*.sql files against a throwaway local
# Postgres. Needs the Postgres server programs (initdb, pg_ctl) and psql.
# Usage: bash db/test_001.sh        (as root it re-runs itself as "postgres")
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
if [ "$(id -u)" = 0 ]; then
  T=$(mktemp -d); cp "$HERE"/0*.sql "$0" "$T"/; chmod -R a+rX "$T"
  exec runuser -u postgres -- bash "$T/$(basename "$0")"
fi
BIN=$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | tail -1); [ -n "$BIN" ] && PATH="$BIN:$PATH"
D=$(mktemp -d); PORT=54329
initdb -D "$D/data" -A trust >/dev/null
pg_ctl -D "$D/data" -o "-p $PORT -c listen_addresses='' -k $D" -l "$D/log" -w start >/dev/null
trap 'pg_ctl -D "$D/data" -m immediate stop >/dev/null; rm -rf "$D"' EXIT
P="psql -X -q -v ON_ERROR_STOP=1 -h $D -p $PORT -d postgres"

# Stand-in for the parts of Supabase the file relies on.
$P <<'SQL'
create role anon nologin; create role authenticated nologin;
create schema auth;
create table auth.users (id uuid primary key, email text, created_at timestamptz default now());
create function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated;
grant usage on schema public to anon, authenticated;
-- Same as a project created with "automatically expose new tables" off.
alter default privileges in schema public revoke all on tables from anon, authenticated;
SQL
$P -f "$HERE/001_profiles.sql"
$P -f "$HERE/002_invites.sql"
$P -f "$HERE/003_trips_events.sql"
$P -f "$HERE/004_anon_events.sql"
$P -f "$HERE/005_requests.sql"

A=00000000-0000-0000-0000-00000000000a; B=00000000-0000-0000-0000-00000000000b
$P -c "insert into auth.users (id) values ('$A'), ('$B')"
$P -c "update public.profiles set role='owner', status='active' where id='$A'"

fail=0
# as ROLE USERID SQL  -> prints the result or the error on one line
as() { $P -At -c "set role $1" -c "select set_config('request.jwt.claim.sub','$2',false)" -c "$3" 2>&1 | tail -n +2 | tr '\n' ' ' || true; }
check() { # name expected-substring actual
  if [[ "$3" == *"$2"* ]]; then echo "ok   $1"; else echo "FAIL $1: wanted '$2', got '$3'"; fail=1; fi; }

check "sign-in creates a pending beta profile" "beta|pending" "$($P -At -c "select role||'|'||status from public.profiles where id='$B'")"
check "not signed in: cannot read profiles"     "permission denied" "$(as anon '' 'select count(*) from public.profiles')"
check "not signed in: cannot call is_owner"     "permission denied" "$(as anon '' 'select public.is_owner()')"
check "member sees only own row"                "1"  "$(as authenticated $B 'select count(*) from public.profiles')"
check "owner sees every row"                    "2"  "$(as authenticated $A 'select count(*) from public.profiles')"
check "member sets own handle"                  "1" "$(as authenticated $B "with u as (update public.profiles set handle='bee_1' where id='$B' returning 1) select count(*) from u")"
check "member cannot set another's handle"      "0" "$(as authenticated $B "with u as (update public.profiles set handle='hacked' where id='$A' returning 1) select count(*) from u")"
check "member cannot change own role"           "permission denied" "$(as authenticated $B "update public.profiles set role='owner' where id='$B'")"
check "member cannot change own status"         "permission denied" "$(as authenticated $B "update public.profiles set status='active' where id='$B'")"
check "member cannot insert a profile"          "permission denied" "$(as authenticated $B "insert into public.profiles (id) values ('$B')")"
check "member cannot delete a profile"          "permission denied" "$(as authenticated $B "delete from public.profiles")"
check "member cannot use the owner function"    "Owner only" "$(as authenticated $B "select public.admin_set_profile('$B','owner','active')")"
check "member cannot run the sign-up function"  "permission denied" "$(as authenticated $B "select public.handle_new_user()")"
check "bad handle refused"                      "violates check" "$(as authenticated $B "update public.profiles set handle='no spaces!' where id='$B'")"
$P -c "update public.profiles set handle='Jon' where id='$A'"
check "handle taken, ignoring capitals"         "duplicate key" "$(as authenticated $B "update public.profiles set handle='jon' where id='$B'")"
as authenticated $A "select public.admin_set_profile('$B','beta','active')" >/dev/null
check "owner activates a member"                "beta|active" "$($P -At -c "select role||'|'||status from public.profiles where id='$B'")"
# --- 002_invites.sql ---  A = owner (active), B = active member, C and N = pending
C=00000000-0000-0000-0000-00000000000c; N=00000000-0000-0000-0000-00000000000d
$P -c "insert into auth.users (id) values ('$C'), ('$N')"
check "not signed in: cannot read invites"      "permission denied" "$(as anon '' 'select count(*) from public.invites')"
check "not signed in: cannot create an invite"  "permission denied" "$(as anon '' 'select public.create_invite()')"
check "pending member cannot create an invite"  "Only active" "$(as authenticated $C 'select public.create_invite()')"
CODE=$(as authenticated $B 'select public.create_invite()' | tr -d ' ')
check "active member gets a 12-character code"  "12" "${#CODE}"
check "member cannot insert an invite directly" "permission denied" "$(as authenticated $B "insert into public.invites (code, created_by) values ('AAAAAAAAAAAA', '$B')")"
check "member cannot edit an invite directly"   "permission denied" "$(as authenticated $C "update public.invites set used_by='$C'")"
check "creator sees own invite"                 "1" "$(as authenticated $B 'select count(*) from public.invites')"
check "others do not see it"                    "0" "$(as authenticated $C 'select count(*) from public.invites')"
check "wrong code refused"                      "not valid" "$(as authenticated $C "select public.redeem_invite('000000000000')")"
check "creator cannot use own code"             "not waiting" "$(as authenticated $B "select public.redeem_invite('$CODE')")"
check "code works, with dashes and lower case"  '"active" : true' "$(as authenticated $C "select public.redeem_invite('$(echo ${CODE:0:4}-${CODE:4:4}-${CODE:8:4} | tr A-F a-f)')")"
check "newcomer is now active"                  "active" "$($P -At -c "select status from public.profiles where id='$C'")"
check "code cannot be used twice"               "not valid" "$(as authenticated $N "select public.redeem_invite('$CODE')")"
as authenticated $B 'select public.create_invite()' >/dev/null; as authenticated $B 'select public.create_invite()' >/dev/null; as authenticated $B 'select public.create_invite()' >/dev/null
check "member limited to three unused invites"  "three unused" "$(as authenticated $B 'select public.create_invite()')"
check "owner has no limit"                      "4" "$(for i in 1 2 3 4; do as authenticated $A 'select public.create_invite()' >/dev/null; done; $P -At -c "select count(*) from public.invites where created_by='$A'")"
$P -c "update public.profiles set status='suspended' where id='$B'"
BAD=$($P -At -c "select code from public.invites where created_by='$B' and used_by is null limit 1")
check "code from a suspended member refused"    "not valid" "$(as authenticated $N "select public.redeem_invite('$BAD')")"
$P -c "update public.profiles set status='active' where id='$B'"
# From 100 active members on, two endorsements are needed.
$P -c "insert into auth.users (id) select gen_random_uuid() from generate_series(1,100)" -c "update public.profiles set status='active' where id not in ('$N')"
check "at 100+ members one code is not enough"  '"active" : false' "$(as authenticated $N "select public.redeem_invite('$BAD')")"
check "still pending after one endorsement"     "pending" "$($P -At -c "select status from public.profiles where id='$N'")"
SAME=$($P -At -c "select code from public.invites where created_by='$B' and used_by is null limit 1")
check "second code from the same member refused" "not valid" "$(as authenticated $N "select public.redeem_invite('$SAME')")"
OWN=$($P -At -c "select code from public.invites where created_by='$A' and used_by is null limit 1")
check "second endorsement activates"            '"active" : true' "$(as authenticated $N "select public.redeem_invite('$OWN')")"
$P -c "delete from auth.users where id not in ('$A','$B')"
# --- expiry and owner self-guard ---
check "owner cannot change own role"            "your own" "$(as authenticated $A "select public.admin_set_profile('$A','beta','active')")"
$P -c "insert into auth.users (id) values ('$C')"
OLD=$(as authenticated $A 'select public.create_invite()' | tr -d ' ')
$P -c "update public.invites set expires_at = now() - interval '1 minute' where code='$OLD'"
check "expired code refused"                    "expired" "$(as authenticated $C "select public.redeem_invite('$OLD')")"

# --- 003_trips_events.sql ---  A = owner, B = active member, C = pending
TRIP="insert into public.trips (kind, key, place, iso, year, span, mode) values ('trip','cty:JP|1985|5||heard','{\"k\":\"cty\",\"iso\":\"JP\"}','JP',1985,5,'heard')"
check "not signed in: cannot read trips"        "permission denied" "$(as anon '' 'select count(*) from public.trips')"
check "not signed in: cannot add events"        "permission denied" "$(as anon '' "insert into public.events (action) values ('view')")"
check "pending member cannot add a trip"        "row-level security" "$(as authenticated $C "$TRIP")"
check "active member adds a trip"               "1" "$(as authenticated $B "with i as ($TRIP returning 1) select count(*) from i")"
check "trip is stamped with the caller's id"    "$B" "$($P -At -c "select user_id from public.trips")"
check "member cannot add a trip for another"    "row-level security" "$(as authenticated $B "insert into public.trips (user_id, kind, key) values ('$A','genre','x')")"
check "member rates own trip"                   "1" "$(as authenticated $B "with u as (update public.trips set rating=9, status='loved' returning 1) select count(*) from u")"
check "rating outside 1-10 refused"             "violates check" "$(as authenticated $B "update public.trips set rating=11")"
check "pending member sees no trips"            "0" "$(as authenticated $C 'select count(*) from public.trips')"
check "owner sees every trip"                   "1" "$(as authenticated $A 'select count(*) from public.trips')"
check "owner cannot edit another's trip"        "0" "$(as authenticated $A "with u as (update public.trips set note='x' returning 1) select count(*) from u")"
check "member adds an event"                    "INSERT" "$($P -c "set role authenticated" -c "select set_config('request.jwt.claim.sub','$B',false)" -c "insert into public.events (session, action, ref) values ('s1','view','{\"v\":\"map\"}')" -a -e 2>&1 | grep -c . | sed 's/.*/INSERT/')"
check "event is stamped with the caller's id"   "$B" "$($P -At -c "select user_id from public.events limit 1")"
check "member cannot forge who an event is from" "permission denied" "$(as authenticated $B "insert into public.events (user_id, action) values ('$A','view')")"
check "member cannot read events"               "0" "$(as authenticated $B 'select count(*) from public.events')"
check "owner reads events"                      "1" "$(as authenticated $A 'select count(*) from public.events')"
check "member cannot see the owner's totals"    "Owner only" "$(as authenticated $B 'select public.admin_stats()')"
check "owner sees totals"                       '"trips" : 1' "$(as authenticated $A 'select public.admin_stats()')"
$P -c "insert into public.trips (user_id, kind, key) select '$B','genre','g'||g from generate_series(1,4999) g"
check "trip limit per person"                   "Trip limit" "$(as authenticated $B "$TRIP")"
check "member removes own trips"                "5000" "$(as authenticated $B "with d as (delete from public.trips returning 1) select count(*) from d")"
$P -c "delete from auth.users where id not in ('$A','$B')"
# --- 004_anon_events.sql ---
EV="insert into public.anon_events (session, action, ref) values ('s1','view','{\"v\":\"map\"}'), ('s1','copy',null)"
check "visitor adds anonymous events"           "2" "$(as anon '' "$EV" >/dev/null; $P -At -c 'select count(*) from public.anon_events')"
check "visitor cannot read them"                "permission denied" "$(as anon '' 'select count(*) from public.anon_events')"
check "visitor cannot set the time"             "permission denied" "$(as anon '' "insert into public.anon_events (at, action) values ('2000-01-01','view')")"
check "visitor cannot delete them"              "permission denied" "$(as anon '' 'delete from public.anon_events')"
check "visitor cannot change them"              "permission denied" "$(as anon '' "update public.anon_events set action='x'")"
check "oversized event refused"                 "violates check" "$(as anon '' "insert into public.anon_events (action, ref) values ('view', jsonb_build_object('x', repeat(md5(random()::text), 60)))")"
check "member cannot read them"                 "0" "$(as authenticated $B 'select count(*) from public.anon_events')"
check "owner reads them"                        "2" "$(as authenticated $A 'select count(*) from public.anon_events')"
check "owner totals include the anonymous log"  '"anon_cap" : 250000' "$(as authenticated $A 'select public.admin_stats()')"
check "flood refused"                           "Too many" "$(as anon '' "insert into public.anon_events (action) select 'view' from generate_series(1,700)")"
check "flood left the log untouched"            "2" "$($P -At -c 'select count(*) from public.anon_events')"
# Fill past the cap with old rows (written directly, so the per-minute limit does not apply), then add one.
$P -c "alter table public.anon_events disable trigger anon_events_limits" -c "insert into public.anon_events (at, action) select now() - interval '1 day', 'old' from generate_series(1,250010)" -c "alter table public.anon_events enable trigger anon_events_limits"
as anon '' "insert into public.anon_events (action) values ('newest')" >/dev/null
check "log holds at most 250,000 rows"          "250000" "$($P -At -c 'select count(*) from public.anon_events')"
check "the newest row was kept"                 "1" "$($P -At -c "select count(*) from public.anon_events where action='newest'")"
check "the oldest rows were the ones removed"   "0" "$($P -At -c "select count(*) from public.anon_events where action in ('view','copy')")"
# --- 005_requests.sql ---
RQ="select public.request_add('research','JP_1960_new','{\"iso\":\"JP\",\"decade\":1960}'::jsonb)"
check "visitor makes a request"                 "open" "$(as anon '' "$RQ")"
check "the same request again adds to its count" "2" "$(as anon '' "$RQ" >/dev/null; $P -At -c "select n from public.requests where key='JP_1960_new'")"
check "still one row for it"                    "1" "$($P -At -c 'select count(*) from public.requests')"
check "signed-in request records who asked"     "$B" "$(as authenticated $B "select public.request_add('listener','cty:BR|1975','{}'::jsonb)" >/dev/null; $P -At -c "select user_id from public.requests where kind='listener'")"
check "unknown kind refused"                    "violates check" "$(as anon '' "select public.request_add('other','x','{}'::jsonb)")"
check "visitor cannot read requests"            "permission denied" "$(as anon '' 'select count(*) from public.requests')"
check "visitor cannot insert directly"          "permission denied" "$(as anon '' "insert into public.requests (kind,key) values ('research','y')")"
check "member cannot read requests"             "0" "$(as authenticated $B 'select count(*) from public.requests')"
check "member cannot settle a request"          "0" "$(as authenticated $B "with u as (update public.requests set status='done' returning 1) select count(*) from u")"
check "owner reads requests"                    "2" "$(as authenticated $A 'select count(*) from public.requests')"
check "owner marks one done"                    "1" "$(as authenticated $A "with u as (update public.requests set status='done', note='ran' where key='JP_1960_new' returning 1) select count(*) from u")"
check "owner cannot rewrite what was asked"     "permission denied" "$(as authenticated $A "update public.requests set key='z'")"
check "a done request stays done when repeated" "done" "$(as anon '' "$RQ")"
check "owner totals count open requests"        '"requests" : 1' "$(as authenticated $A 'select public.admin_stats()')"
check "request flood refused"                   "Too many requests" "$(as anon '' "select public.request_add('research','f'||g,'{}'::jsonb) from generate_series(1,250) g")"
check "flood left the list untouched"           "2" "$($P -At -c 'select count(*) from public.requests')"
RM="select public.request_many('research','[{\"key\":\"GB_1960\",\"ref\":{}},{\"key\":\"GB_1970\",\"ref\":{}},{\"key\":\"GB_1980\",\"ref\":{}},{\"key\":\"GB_1990\",\"ref\":{}}]'::jsonb)"
check "one ask for four decades makes four rows" "4" "$(as anon '' "$RM" >/dev/null; $P -At -c "select count(*) from public.requests where key like 'GB_%'")"
check "each gets a quarter of a request"       "0.25" "$($P -At -c "select w from public.requests where key='GB_1970'")"
check "a single ask on top adds a whole one"   "1.25|2" "$(as anon '' "select public.request_many('research','[{\"key\":\"GB_1970\",\"ref\":{}}]'::jsonb)" >/dev/null; $P -At -c "select w, n from public.requests where key='GB_1970'")"
check "request_many reports each status"       '"GB_1960": "open"' "$(as anon '' "$RM")"
check "more than 40 items refused"             "1 to 40" "$(as anon '' "select public.request_many('research',(select jsonb_agg(jsonb_build_object('key','k'||g)) from generate_series(1,41) g))")"
check "the shared step cannot be called"       "permission denied" "$(as anon '' "select public.request_put('research','zz','{}'::jsonb,50)")"
$P -c "insert into auth.users (id) select gen_random_uuid() from generate_series(1,998)"
check "sign-ups refused at the cap"             "user cap" "$($P -c "insert into auth.users (id) values (gen_random_uuid())" 2>&1 | tr '\n' ' ')"
check "cap holds at 1000 profiles"              "1000" "$($P -At -c "select count(*) from public.profiles")"
exit $fail
