-- Migration: add auth, draft_deadline, user linking
-- Run in Supabase SQL Editor

-- 1. Add draft_deadline to pool_config
alter table pool_config add column if not exists draft_deadline timestamptz;

-- 2. Add user_id to managers (nullable — existing rows won't have it)
alter table managers add column if not exists user_id uuid references auth.users(id) on delete set null;

-- 3. Unique constraint: one team per user per season
create unique index if not exists managers_user_season_unique
  on managers(user_id, season)
  where user_id is not null;

-- 4. RLS policy (safe re-run — IF NOT EXISTS not supported for policies)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'managers'
    and policyname = 'Auth users can insert own manager'
  ) then
    execute 'create policy "Auth users can insert own manager"
      on managers for insert
      with check (auth.uid() = user_id OR user_id is null)';
  end if;
end $$;

-- 5. Index for user_id lookups
create index if not exists managers_user_id_idx on managers(user_id);
