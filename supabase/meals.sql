-- SnapNutri — meals table
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).

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
