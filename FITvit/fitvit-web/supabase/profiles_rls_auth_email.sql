-- RLS policies for FITvit profile model (auth_user_id linked to auth.users.id)
-- This is more reliable than email-claim matching and works cleanly with Supabase Auth sessions.

alter table public.profiles enable row level security;

alter table public.profiles
  add column if not exists auth_user_id uuid;

-- Backfill auth_user_id by email for existing users.
update public.profiles p
set auth_user_id = u.id
from auth.users u
where p.auth_user_id is null
  and lower(p.email) = lower(u.email);

-- Cleanup old broad/dev policies
-- (These may or may not exist in your project; IF EXISTS keeps this safe.)
drop policy if exists "allow all anon profiles" on public.profiles;
drop policy if exists "profiles_dev_allow_all_anon" on public.profiles;
drop policy if exists "profiles_dev_allow_all_auth" on public.profiles;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_select_own_email" on public.profiles;
drop policy if exists "profiles_insert_own_email" on public.profiles;
drop policy if exists "profiles_update_own_email" on public.profiles;

-- Read only own row by authenticated auth uid
create policy "profiles_select_own_uid"
  on public.profiles
  for select
  to authenticated
  using (auth_user_id = auth.uid());

-- Insert only own row; prevent self-escalation to admin='yes'
create policy "profiles_insert_own_uid"
  on public.profiles
  for insert
  to authenticated
  with check (
    auth_user_id = auth.uid()
    and coalesce(lower(admin), 'no') = 'no'
  );

-- Update only own row
create policy "profiles_update_own_uid"
  on public.profiles
  for update
  to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- Optional: harden email uniqueness for stable upserts
create unique index if not exists idx_profiles_email_lower_unique
  on public.profiles (lower(email));

create unique index if not exists idx_profiles_auth_user_id_unique
  on public.profiles (auth_user_id)
  where auth_user_id is not null;
