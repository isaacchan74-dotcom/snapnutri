-- SnapNutri — character / pet table
-- Paste this in the Supabase SQL editor (Dashboard → SQL Editor → New query).

create table if not exists public.characters (
  user_id uuid primary key references auth.users (id) on delete cascade,
  character_type text not null check (character_type in ('sprout', 'spark', 'nibble')),
  equipped_hat text not null default 'none'
    check (equipped_hat in ('none', 'beanie', 'crown', 'visor')),
  equipped_outfit text not null default 'none'
    check (equipped_outfit in ('none', 'hoodie', 'cape', 'jersey')),
  equipped_background text not null default 'studio'
    check (equipped_background in ('studio', 'stage', 'garden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.characters enable row level security;

drop policy if exists "Users can read their own character" on public.characters;
create policy "Users can read their own character"
  on public.characters for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own character" on public.characters;
create policy "Users can create their own character"
  on public.characters for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own character" on public.characters;
create policy "Users can update their own character"
  on public.characters for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own character" on public.characters;
create policy "Users can delete their own character"
  on public.characters for delete
  using (auth.uid() = user_id);
