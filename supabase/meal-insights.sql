-- SnapNutri — one-shot AI meal insights
-- Run once in the Supabase SQL editor (Dashboard → SQL Editor → New query). Safe to re-run.
-- Also run supabase/goals-and-descriptions.sql if you have not already (it enables the newer goals).

-- The insight reads the meal description, so make sure that column exists too.
alter table public.meals
  add column if not exists description text;

-- { "summary": text, "suggestions": [text], "generated_at": timestamptz }
alter table public.meals
  add column if not exists ai_insight jsonb;

-- Once a meal has an insight it is permanent: updates cannot clear or replace it.
-- This keeps the AI to at most one call per logged meal.
create or replace function public.keep_meal_ai_insight()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.ai_insight is not null then
    new.ai_insight := old.ai_insight;
  end if;
  return new;
end;
$$;

drop trigger if exists meals_keep_ai_insight on public.meals;
create trigger meals_keep_ai_insight
  before update on public.meals
  for each row execute function public.keep_meal_ai_insight();
