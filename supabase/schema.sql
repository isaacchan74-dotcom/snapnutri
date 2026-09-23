-- SnapNutri — user profile schema
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  gender text check (gender in ('male', 'female')),
  age integer check (age between 13 and 100),
  -- Height in centimetres, weight in kilograms. The app converts for display.
  height numeric(5, 1) check (height between 120 and 230),
  weight numeric(5, 1) check (weight between 30 and 250),
  activity_level text check (
    activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')
  ),
  goal text check (goal in ('lose', 'maintain', 'gain')),
  daily_calorie_target integer,
  daily_protein_target integer,
  daily_carb_target integer,
  daily_fat_target integer,
  created_at timestamptz not null default now()
);

-- Row level security: a user can only ever touch their own row.
alter table public.profiles enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can delete their own profile" on public.profiles;
create policy "Users can delete their own profile"
  on public.profiles for delete
  using (auth.uid() = id);

-- Seed an empty profile row the moment someone signs up, so onboarding
-- always has a row to fill in.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Meals (manual logging). Safe to re-run.
create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  food_name text not null,
  calories integer not null check (calories >= 0),
  protein numeric(6, 1) not null check (protein >= 0),
  carbs numeric(6, 1) not null check (carbs >= 0),
  fat numeric(6, 1) not null check (fat >= 0),
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists meals_user_logged_at_idx
  on public.meals (user_id, logged_at desc);

alter table public.meals enable row level security;

drop policy if exists "Users can read their own meals" on public.meals;
create policy "Users can read their own meals"
  on public.meals for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own meals" on public.meals;
create policy "Users can create their own meals"
  on public.meals for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own meals" on public.meals;
create policy "Users can update their own meals"
  on public.meals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own meals" on public.meals;
create policy "Users can delete their own meals"
  on public.meals for delete
  using (auth.uid() = user_id);
