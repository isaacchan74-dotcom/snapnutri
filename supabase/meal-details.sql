-- SnapNutri — details the user adds before the AI analyses a meal.
-- Paste this in the Supabase SQL editor after meals.sql. Safe to re-run.
-- Every column is nullable, so older app builds keep working.
-- Until this is run, meals still save — just without place, notes and barcode.

-- Where the meal was eaten, as the user confirmed it (e.g. "Chipotle", "At Home").
alter table public.meals add column if not exists place_name text;
alter table public.meals drop constraint if exists meals_place_name_len;
alter table public.meals
  add constraint meals_place_name_len
  check (place_name is null or char_length(place_name) <= 120);

-- What the user told the AI about ingredients and preparation.
alter table public.meals add column if not exists notes text;
alter table public.meals drop constraint if exists meals_notes_len;
alter table public.meals
  add constraint meals_notes_len
  check (notes is null or char_length(notes) <= 1000);

-- Barcode of a scanned packaged product.
alter table public.meals add column if not exists barcode text;
alter table public.meals drop constraint if exists meals_barcode_format;
alter table public.meals
  add constraint meals_barcode_format
  check (barcode is null or barcode ~ '^[0-9]{8,14}$');
