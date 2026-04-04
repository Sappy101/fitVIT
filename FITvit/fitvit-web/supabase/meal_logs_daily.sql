-- FITvit daily meal logs (ratings + preferences)
-- Run this in Supabase SQL editor.

create extension if not exists pgcrypto;
create extension if not exists pg_cron with schema extensions;

create table if not exists public.meal_ratings_daily (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  log_date date not null,
  diet_type text not null,
  slot text not null check (slot in ('breakfast', 'lunch', 'dinner', 'snacks')),
  item_name text not null,
  servings int not null default 0 check (servings >= 0),
  rating int check (rating between 1 and 5 or rating is null),
  calories int,
  protein_g int,
  carbs_g int,
  fat_g int,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (auth_user_id, log_date, diet_type, slot, item_name)
);

create table if not exists public.meal_preferences_daily (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  log_date date not null,
  diet_type text not null,
  slot text not null check (slot in ('breakfast', 'lunch', 'dinner', 'snacks')),
  item_name text not null,
  preference_value smallint not null default 0 check (preference_value in (-1, 0, 1)),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (auth_user_id, log_date, diet_type, slot, item_name)
);

alter table public.meal_ratings_daily enable row level security;
alter table public.meal_preferences_daily enable row level security;

drop policy if exists "meal_ratings_select_own" on public.meal_ratings_daily;
drop policy if exists "meal_ratings_select_admin_all" on public.meal_ratings_daily;
drop policy if exists "meal_ratings_insert_own" on public.meal_ratings_daily;
drop policy if exists "meal_ratings_update_own" on public.meal_ratings_daily;
drop policy if exists "meal_ratings_delete_own" on public.meal_ratings_daily;

create policy "meal_ratings_select_own"
  on public.meal_ratings_daily
  for select
  to authenticated
  using (auth_user_id = auth.uid());

create policy "meal_ratings_select_admin_all"
  on public.meal_ratings_daily
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.auth_user_id = auth.uid()
        and lower(coalesce(p.admin, 'no')) = 'yes'
    )
  );

create policy "meal_ratings_insert_own"
  on public.meal_ratings_daily
  for insert
  to authenticated
  with check (auth_user_id = auth.uid());

create policy "meal_ratings_update_own"
  on public.meal_ratings_daily
  for update
  to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

create policy "meal_ratings_delete_own"
  on public.meal_ratings_daily
  for delete
  to authenticated
  using (auth_user_id = auth.uid());

drop policy if exists "meal_preferences_select_own" on public.meal_preferences_daily;
drop policy if exists "meal_preferences_select_admin_all" on public.meal_preferences_daily;
drop policy if exists "meal_preferences_insert_own" on public.meal_preferences_daily;
drop policy if exists "meal_preferences_update_own" on public.meal_preferences_daily;
drop policy if exists "meal_preferences_delete_own" on public.meal_preferences_daily;

create policy "meal_preferences_select_own"
  on public.meal_preferences_daily
  for select
  to authenticated
  using (auth_user_id = auth.uid());

create policy "meal_preferences_select_admin_all"
  on public.meal_preferences_daily
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.auth_user_id = auth.uid()
        and lower(coalesce(p.admin, 'no')) = 'yes'
    )
  );

create policy "meal_preferences_insert_own"
  on public.meal_preferences_daily
  for insert
  to authenticated
  with check (auth_user_id = auth.uid());

create policy "meal_preferences_update_own"
  on public.meal_preferences_daily
  for update
  to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

create policy "meal_preferences_delete_own"
  on public.meal_preferences_daily
  for delete
  to authenticated
  using (auth_user_id = auth.uid());

create index if not exists idx_meal_ratings_daily_user_date
  on public.meal_ratings_daily(auth_user_id, log_date);

create index if not exists idx_meal_preferences_daily_user_date
  on public.meal_preferences_daily(auth_user_id, log_date);

create or replace function public.fitvit_cleanup_daily_logs()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Keep only current day data (IST-based day boundary).
  delete from public.meal_ratings_daily
  where log_date < (now() at time zone 'Asia/Kolkata')::date;

  delete from public.meal_preferences_daily
  where log_date < (now() at time zone 'Asia/Kolkata')::date;
end;
$$;

-- 23:59 Asia/Kolkata == 18:29 UTC
-- Recreate schedule safely if it already exists.
do $$
declare
  existing_job_id bigint;
begin
  begin
    select jobid
      into existing_job_id
      from cron.job
      where jobname = 'fitvit-daily-log-cleanup'
      limit 1;

    if existing_job_id is not null then
      perform cron.unschedule(existing_job_id);
    end if;
  exception
    when undefined_table then
      null;
  end;

  perform cron.schedule(
    'fitvit-daily-log-cleanup',
    '29 18 * * *',
    $cmd$select public.fitvit_cleanup_daily_logs();$cmd$
  );
end;
$$;