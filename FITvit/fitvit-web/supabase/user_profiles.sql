create table if not exists public.user_profiles (
  uid text primary key,
  name text,
  email text not null,
  age integer,
  weight numeric,
  height numeric,
  preferred_mess text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_profiles_email on public.user_profiles (email);

alter table public.user_profiles enable row level security;

-- Dev-friendly policy for quick integration. Tighten this before production.
drop policy if exists "allow all anon user_profiles" on public.user_profiles;
create policy "allow all anon user_profiles"
  on public.user_profiles
  for all
  to anon
  using (true)
  with check (true);
