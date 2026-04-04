-- FITvit Supabase repair script for meals_vault reads
-- Purpose:
-- 1) Diagnose why frontend falls back from Supabase
-- 2) Keep RLS enabled while allowing menu reads
-- 3) Refresh PostgREST schema/config after changes
--
-- Run this whole file in Supabase SQL Editor.

begin;

-- Ensure API roles can access public schema/table.
grant usage on schema public to anon, authenticated;
grant select on table public.meals_vault to anon, authenticated;

-- Keep RLS ON and create explicit read policy for app roles.
alter table public.meals_vault enable row level security;

drop policy if exists meals_vault_select_public on public.meals_vault;
create policy meals_vault_select_public
on public.meals_vault
for select
to anon, authenticated
using (true);

commit;

-- Refresh PostgREST cache after policy/schema updates.
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- -----------------------------
-- Verification queries
-- -----------------------------

-- Confirm table exists where expected.
select table_schema, table_name
from information_schema.tables
where table_schema = 'public'
  and table_name = 'meals_vault';

-- Confirm app-required columns exist.
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'meals_vault'
order by ordinal_position;

-- Confirm policy present and roles bound.
select schemaname, tablename, policyname, roles, cmd, qual
from pg_policies
where schemaname = 'public'
  and tablename = 'meals_vault';

-- Confirm table grants for API roles.
select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'meals_vault'
  and grantee in ('anon', 'authenticated')
order by grantee, privilege_type;

-- Confirm data is visible.
select count(*) as meals_vault_row_count
from public.meals_vault;

select day, diet_type, meal, name
from public.meals_vault
order by day, diet_type, meal, name
limit 25;
