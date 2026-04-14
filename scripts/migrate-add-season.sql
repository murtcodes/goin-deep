-- Migration: add season column to managers and player_stats
-- Run in Supabase SQL Editor

-- Add season to managers (default to current season)
alter table managers add column if not exists season integer default 20252026;

-- Add season to player_stats so we can store historical stats too
alter table player_stats add column if not exists season integer default 20252026;

-- Update player_stats primary key to include season (allows same player across seasons)
-- First drop old PK, add composite PK
alter table player_stats drop constraint player_stats_pkey;
alter table player_stats add primary key (player_id, season);

-- Re-index picks by season via manager join (no direct change needed to picks table)
create index if not exists managers_season_idx on managers(season);
create index if not exists player_stats_season_idx on player_stats(season);
