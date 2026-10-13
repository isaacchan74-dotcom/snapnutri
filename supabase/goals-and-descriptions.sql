-- SnapNutri — more specific goals + meal descriptions
-- Run once in the Supabase SQL editor (Dashboard → SQL Editor → New query). Safe to re-run.

-- 1) Allow the new goals on profiles.goal.
--    The original inline check is replaced by one that lists all six goals.
do $$
declare
  existing record;
begin
  for existing in
    select conname
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%goal%'
  loop
    execute format('alter table public.profiles drop constraint %I', existing.conname);
  end loop;
end
$$;

alter table public.profiles
  add constraint profiles_goal_check
  check (goal is null or goal in ('lose', 'maintain', 'gain', 'recomp', 'athletic', 'health'));

-- 2) Optional free-text description on each meal (AI fills it in after a photo snap).
alter table public.meals
  add column if not exists description text;

alter table public.meals
  drop constraint if exists meals_description_length;

alter table public.meals
  add constraint meals_description_length
  check (description is null or char_length(description) <= 280);
