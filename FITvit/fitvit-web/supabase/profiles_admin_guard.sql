-- Use this with an existing public.profiles table
-- 0) Ensure id/email behavior supports app writes
alter table public.profiles
  alter column id set default gen_random_uuid();

create unique index if not exists idx_profiles_email_unique
  on public.profiles (lower(email));

-- 1) Default every new profile to admin = 'no'
alter table public.profiles
  alter column admin set default 'no';

-- 2) Backfill null/blank admin values to 'no'
update public.profiles
set admin = 'no'
where admin is null or btrim(admin) = '';

-- 3) Optional data quality check to only allow yes/no
alter table public.profiles
  drop constraint if exists profiles_admin_yes_no_check;

alter table public.profiles
  add constraint profiles_admin_yes_no_check
  check (lower(admin) in ('yes', 'no'));

-- 4) Make one existing user admin (replace email)
update public.profiles
set admin = 'yes'
where lower(email) = lower('admin@fitvit.edu');

-- 5) Dev policy: allow frontend anon reads/writes.
-- Tighten this before production.
alter table public.profiles enable row level security;

drop policy if exists "allow all anon profiles" on public.profiles;
create policy "allow all anon profiles"
  on public.profiles
  for all
  to anon
  using (true)
  with check (true);
 