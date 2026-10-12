-- SnapNutri — characters table (animal + backdrop only)
-- Paste this in the Supabase SQL editor. Safe to re-run.

create table if not exists public.characters (
  user_id uuid primary key references auth.users (id) on delete cascade,
  character_type text not null default 'pika',
  equipped_background text not null default 'blossom',
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.characters add column if not exists display_name text;

alter table public.characters drop constraint if exists characters_display_name_len;
alter table public.characters
  add constraint characters_display_name_len
  check (display_name is null or char_length(btrim(display_name)) between 1 and 20);

alter table public.characters drop column if exists equipped_hat;
alter table public.characters drop column if exists equipped_outfit;
alter table public.characters alter column character_type set default 'pika';
alter table public.characters alter column equipped_background set default 'blossom';

alter table public.characters drop constraint if exists characters_character_type_check;
alter table public.characters drop constraint if exists characters_equipped_hat_check;
alter table public.characters drop constraint if exists characters_equipped_outfit_check;
alter table public.characters drop constraint if exists characters_equipped_background_check;

update public.characters
set character_type = case character_type
  when 'sprout' then 'pika'
  when 'nibble' then 'redpanda'
  when 'spark' then 'axolotl'
  else character_type
end
where character_type in ('sprout', 'spark', 'nibble');

update public.characters
set equipped_background = case equipped_background
  when 'studio' then 'blossom'
  when 'stage' then 'meadow'
  when 'garden' then 'bluebell'
  else equipped_background
end
where equipped_background in ('studio', 'stage', 'garden');

alter table public.characters
  add constraint characters_character_type_check
  check (character_type in ('pika', 'redpanda', 'axolotl'));

alter table public.characters
  add constraint characters_equipped_background_check
  check (equipped_background in ('blossom', 'meadow', 'bluebell'));

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
