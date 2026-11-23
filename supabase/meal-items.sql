-- SnapNutri — per-ingredient grams for each meal.
-- Paste this in the Supabase SQL editor after meals.sql. Safe to re-run.
-- The column is nullable, so older app builds keep working.
-- Until this is run, meals still save — just without ingredient grams,
-- and the app cannot remember the portions a user corrected.

-- One object per food on the plate:
--   { "name": "Rice", "grams": 150, "ai_grams": 300,
--     "calories": 195, "protein": 4.1, "carbs": 42.3, "fat": 0.4, "vegetable_servings": 0 }
-- grams is what the user confirmed; ai_grams is what the AI first estimated.
alter table public.meals add column if not exists items jsonb;
alter table public.meals drop constraint if exists meals_items_is_array;
alter table public.meals
  add constraint meals_items_is_array
  check (items is null or jsonb_typeof(items) = 'array');
