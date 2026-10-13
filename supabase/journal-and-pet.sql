-- SnapNutri — journal details + Pika progress (prototype v1 UI)
-- Paste this in the Supabase SQL editor after schema.sql and meals.sql. Safe to re-run.
-- Every new column is nullable or defaulted, so older app builds keep working.

-- What to call the user on Home, plus Profile preferences.
alter table public.profiles add column if not exists display_name text;
alter table public.profiles drop constraint if exists profiles_display_name_len;
alter table public.profiles
  add constraint profiles_display_name_len
  check (display_name is null or char_length(btrim(display_name)) between 1 and 30);
alter table public.profiles add column if not exists night_mode boolean not null default false;
alter table public.profiles
  add column if not exists reminders jsonb not null default '{"meal": true, "night": true, "pika": false}'::jsonb;

-- Meal details from the Review screen.
alter table public.meals add column if not exists meal_type text;
alter table public.meals drop constraint if exists meals_meal_type_check;
alter table public.meals
  add constraint meals_meal_type_check
  check (meal_type is null or meal_type in ('Breakfast', 'Lunch', 'Dinner', 'Snack', 'Coffee', 'Drinks'));
alter table public.meals add column if not exists foods jsonb not null default '[]'::jsonb;
alter table public.meals add column if not exists portion numeric(3, 2) not null default 1
  check (portion > 0 and portion <= 1);
alter table public.meals add column if not exists shared_with text not null default 'Just me';
alter table public.meals add column if not exists vegetable_servings numeric(3, 1) not null default 0
  check (vegetable_servings >= 0);
-- false = saved as a draft that still needs the user's review.
alter table public.meals add column if not exists reviewed boolean not null default true;

-- Pika's scores. One row per user.
create table if not exists public.pet_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  happiness integer not null default 60 check (happiness between 0 and 100),
  health integer not null default 60 check (health between 0 and 100),
  xp integer not null default 0 check (xp >= 0),
  points integer not null default 0 check (points >= 0),
  accessory text,
  -- Local days (YYYY-MM-DD) that already paid out the balanced-day bonus.
  bonus_days jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.pet_progress enable row level security;

drop policy if exists "Users can read their own pet" on public.pet_progress;
create policy "Users can read their own pet"
  on public.pet_progress for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own pet" on public.pet_progress;
create policy "Users can create their own pet"
  on public.pet_progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own pet" on public.pet_progress;
create policy "Users can update their own pet"
  on public.pet_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own pet" on public.pet_progress;
create policy "Users can delete their own pet"
  on public.pet_progress for delete
  using (auth.uid() = user_id);
