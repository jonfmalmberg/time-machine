#!/usr/bin/env bash
# Checks the access rules in 001_profiles.sql against a throwaway local
# Postgres. Needs the Postgres server programs (initdb, pg_ctl) and psql.
# Usage: bash db/test_001.sh        (as root it re-runs itself as "postgres")
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
if [ "$(id -u)" = 0 ]; then
  T=$(mktemp -d); cp "$HERE"/001_profiles.sql "$0" "$T"/; chmod -R a+rX "$T"
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
$P -c "insert into auth.users (id) select gen_random_uuid() from generate_series(1,998)"
check "sign-ups refused at the cap"             "user cap" "$($P -c "insert into auth.users (id) values (gen_random_uuid())" 2>&1 | tr '\n' ' ')"
check "cap holds at 1000 profiles"              "1000" "$($P -At -c "select count(*) from public.profiles")"
exit $fail
