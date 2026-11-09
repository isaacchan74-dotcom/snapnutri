-- SnapNutri — first-time tutorial flag
-- Paste this in the Supabase SQL editor. Safe to re-run.
-- Existing accounts default to completed so the tour does not surprise them.
-- New journals set this to false at the end of onboarding, then true after Skip/Got it.

alter table public.profiles
  add column if not exists tutorial_completed boolean not null default true;
