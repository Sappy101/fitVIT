-- Add per-user weekly target columns to profiles
-- Run in Supabase SQL editor

alter table public.profiles
  add column if not exists required_kcal int,
  add column if not exists required_protein int,
  add column if not exists required_fats int;

alter table public.profiles
  drop constraint if exists profiles_required_kcal_nonnegative,
  drop constraint if exists profiles_required_protein_nonnegative,
  drop constraint if exists profiles_required_fats_nonnegative;

alter table public.profiles
  add constraint profiles_required_kcal_nonnegative check (required_kcal is null or required_kcal >= 0),
  add constraint profiles_required_protein_nonnegative check (required_protein is null or required_protein >= 0),
  add constraint profiles_required_fats_nonnegative check (required_fats is null or required_fats >= 0);