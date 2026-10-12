-- SnapNutri — meal photos
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Safe to re-run.
--
-- Dashboard setup if you prefer the UI for the bucket:
--   1. Storage → New bucket
--   2. Name: meal-photos
--   3. Public bucket: OFF (private)
--   4. File size limit: 1 MB
--   5. Allowed MIME types: image/jpeg
-- Then still run this file so the column, RLS policies, and 60-day purge exist.
--
-- Photos live at: meal-photos/{auth.uid()}/{uuid}.jpg
-- The app uploads the already-shrunk 768px JPEG, never the full-res original.
-- Nutrition rows stay forever. Only the photo file is deleted after 60 days.

alter table public.meals
  add column if not exists photo_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'meal-photos',
  'meal-photos',
  false,
  1048576,
  array['image/jpeg']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can read their own meal photos" on storage.objects;
create policy "Users can read their own meal photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'meal-photos'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "Users can upload their own meal photos" on storage.objects;
create policy "Users can upload their own meal photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'meal-photos'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "Users can update their own meal photos" on storage.objects;
create policy "Users can update their own meal photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'meal-photos'
    and split_part(name, '/', 1) = auth.uid()::text
  )
  with check (
    bucket_id = 'meal-photos'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "Users can delete their own meal photos" on storage.objects;
create policy "Users can delete their own meal photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'meal-photos'
    and split_part(name, '/', 1) = auth.uid()::text
  );

-- Cleanest purge: scheduled SQL, not on-access.
-- Deletes photo FILES older than 60 days, then clears photo_path.
-- Meal nutrition rows are never deleted here.
create or replace function public.purge_expired_meal_photos()
returns integer
language plpgsql
security definer
set search_path = public, storage
as $$
declare
  removed integer;
begin
  delete from storage.objects
  where bucket_id = 'meal-photos'
    and created_at < now() - interval '60 days';

  get diagnostics removed = row_count;

  update public.meals as meal
  set photo_path = null
  where meal.photo_path is not null
    and not exists (
      select 1
      from storage.objects as object
      where object.bucket_id = 'meal-photos'
        and object.name = meal.photo_path
    );

  return removed;
end;
$$;

revoke all on function public.purge_expired_meal_photos() from public;
grant execute on function public.purge_expired_meal_photos() to postgres;

-- Optional schedule. If this errors, enable pg_cron under Database → Extensions
-- and re-run just this block. The app also purges expired files when Journal loads.
create extension if not exists pg_cron;

do $$
begin
  perform cron.unschedule('purge-expired-meal-photos');
  perform cron.schedule(
    'purge-expired-meal-photos',
    '15 4 * * *',
    $cron$select public.purge_expired_meal_photos()$cron$
  );
exception
  when others then
    raise notice 'Enable pg_cron (Database → Extensions) to auto-delete photos after 60 days.';
end
$$;
