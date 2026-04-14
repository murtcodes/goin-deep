-- Goin' Deep NHL Playoff Pool 2026
-- Run this in your Supabase SQL editor

-- Pool config (single row)
create table if not exists pool_config (
  id integer primary key default 1,
  draft_open boolean default true,
  season integer default 20252026,
  constraint pool_config_single_row check (id = 1)
);

insert into pool_config (id, draft_open, season) values (1, true, 20252026)
on conflict (id) do nothing;

-- Pool managers
create table if not exists managers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  team_name text not null,
  created_at timestamptz default now()
);

-- Player picks per manager
create table if not exists picks (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid references managers(id) on delete cascade,
  player_id integer not null,
  player_name text not null,
  position_type text not null check (position_type in ('F', 'D', 'G')),
  slot integer not null,
  created_at timestamptz default now()
);

create index if not exists picks_manager_id_idx on picks(manager_id);
create index if not exists picks_player_id_idx on picks(player_id);

-- Cached playoff stats (updated by sync)
create table if not exists player_stats (
  player_id integer primary key,
  player_name text not null,
  position text,
  team text,
  goals integer default 0,
  assists integer default 0,
  wins integer default 0,
  shutouts integer default 0,
  gp integer default 0,
  last_updated timestamptz default now()
);

-- Enable RLS (Row Level Security) - allow public reads, restrict writes
alter table pool_config enable row level security;
alter table managers enable row level security;
alter table picks enable row level security;
alter table player_stats enable row level security;

-- Public read access
create policy "Public read pool_config" on pool_config for select using (true);
create policy "Public read managers" on managers for select using (true);
create policy "Public read picks" on picks for select using (true);
create policy "Public read player_stats" on player_stats for select using (true);

-- Allow inserts from anon (draft submissions)
create policy "Allow insert managers" on managers for insert with check (true);
create policy "Allow insert picks" on picks for insert with check (true);

-- Allow upsert on player_stats (sync job)
create policy "Allow upsert player_stats" on player_stats for all using (true) with check (true);

-- Allow update on pool_config (admin)
create policy "Allow update pool_config" on pool_config for update using (true) with check (true);
