-- SnapNutri — daily AI quota per user (protects the shared OpenAI key)
-- Paste this in the Supabase SQL editor. Safe to re-run.
-- Days roll over at midnight Los Angeles time.
--
-- Limits (must match supabase/functions/analyze-meal/index.ts):
--   snap  (photo analyze): 20 requests/day, no character cap
--   coach (Ask Pika chat): 20 requests/day AND 2,000 characters of user input/day

create table if not exists public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  kind text not null check (kind in ('snap', 'coach')),
  count integer not null default 0 check (count >= 0),
  chars integer not null default 0 check (chars >= 0),
  primary key (user_id, day, kind)
);

alter table public.ai_usage add column if not exists chars integer not null default 0;
alter table public.ai_usage enable row level security;

-- No policies: users cannot read or write this table directly.

create or replace function public.ai_daily_limit(p_kind text)
returns integer
language sql
immutable
as $$
  select case p_kind when 'snap' then 20 when 'coach' then 20 else 0 end;
$$;

create or replace function public.ai_daily_char_limit(p_kind text)
returns integer
language sql
immutable
as $$
  -- 0 = no character cap (photo snaps). Coach is capped at 2,000 input characters/day.
  select case p_kind when 'coach' then 2000 else 0 end;
$$;

drop function if exists public.consume_ai_quota(text);
drop function if exists public.consume_ai_quota(text, integer);

-- Counts one AI call (and its input characters) for the signed-in user.
-- Returns false once today's request or character limit is used up — does not increment past the cap.
create or replace function public.consume_ai_quota(p_kind text, p_chars integer default 0)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day date := (now() at time zone 'America/Los_Angeles')::date;
  v_req_limit integer := public.ai_daily_limit(p_kind);
  v_char_limit integer := public.ai_daily_char_limit(p_kind);
  v_chars integer := greatest(coalesce(p_chars, 0), 0);
  v_count integer;
begin
  if auth.uid() is null or v_req_limit <= 0 then
    return false;
  end if;

  if v_char_limit > 0 and v_chars > v_char_limit then
    return false;
  end if;

  insert into public.ai_usage (user_id, day, kind, count, chars)
  values (auth.uid(), v_day, p_kind, 1, v_chars)
  on conflict (user_id, day, kind)
  do update set
    count = public.ai_usage.count + 1,
    chars = public.ai_usage.chars + v_chars
  where public.ai_usage.count < v_req_limit
    and (v_char_limit <= 0 or public.ai_usage.chars + v_chars <= v_char_limit)
  returning count into v_count;

  return v_count is not null;
end;
$$;

revoke all on function public.consume_ai_quota(text, integer) from public, anon;
grant execute on function public.consume_ai_quota(text, integer) to authenticated;
