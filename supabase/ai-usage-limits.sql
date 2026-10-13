-- SnapNutri — daily AI quota per user (protects the shared OpenAI key)
-- Paste this in the Supabase SQL editor. Safe to re-run.
-- Days roll over at midnight Los Angeles time.

create table if not exists public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  kind text not null check (kind in ('snap', 'coach')),
  count integer not null default 0 check (count >= 0),
  primary key (user_id, day, kind)
);

-- No policies: users cannot read or write this table directly.
-- Only consume_ai_quota below (security definer) touches it.
alter table public.ai_usage enable row level security;

-- Daily limits live here so a caller cannot pass a bigger one.
create or replace function public.ai_daily_limit(p_kind text)
returns integer
language sql
immutable
as $$
  select case p_kind when 'snap' then 20 when 'coach' then 40 else 0 end;
$$;

-- Counts one AI call for the signed-in user. Returns false once today's limit is used up.
create or replace function public.consume_ai_quota(p_kind text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day date := (now() at time zone 'America/Los_Angeles')::date;
  v_limit integer := public.ai_daily_limit(p_kind);
  v_count integer;
begin
  if auth.uid() is null or v_limit <= 0 then
    return false;
  end if;

  insert into public.ai_usage (user_id, day, kind, count)
  values (auth.uid(), v_day, p_kind, 1)
  on conflict (user_id, day, kind)
  do update set count = public.ai_usage.count + 1
  where public.ai_usage.count < v_limit
  returning count into v_count;

  return v_count is not null;
end;
$$;

revoke all on function public.consume_ai_quota(text) from public, anon;
grant execute on function public.consume_ai_quota(text) to authenticated;
