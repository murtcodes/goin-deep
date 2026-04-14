// Seed script: inserts 2025 pool results as historical data (season 20242025)
// Run: node scripts/seed-test-data.mjs
// Wipe: node scripts/seed-test-data.mjs --wipe

const SEASON = 20242025

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ywiatifembpcmydvjdzh.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3aWF0aWZlbWJwY215ZHZqZHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMDA0NzQsImV4cCI6MjA5MTc3NjQ3NH0.cg1s4ptTXaDPfyRbnDfB0mN51-BMnclKhZmFcjLWNlM'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Player stats from 2025 playoffs (real numbers)
const PLAYER_STATS = [
  { player_id: 8478402, player_name: 'Connor McDavid',       position: 'C', team: 'EDM', goals: 6,  assists: 20, wins: 0,  shutouts: 0, gp: 16 },
  { player_id: 8477934, player_name: 'Leon Draisaitl',        position: 'C', team: 'EDM', goals: 7,  assists: 18, wins: 0,  shutouts: 0, gp: 16 },
  { player_id: 8477492, player_name: 'Nathan MacKinnon',      position: 'C', team: 'COL', goals: 7,  assists: 4,  wins: 0,  shutouts: 0, gp: 11 },
  { player_id: 8480069, player_name: 'Cale Makar',            position: 'D', team: 'COL', goals: 1,  assists: 4,  wins: 0,  shutouts: 0, gp: 11 },
  { player_id: 8476453, player_name: 'Nikita Kucherov',       position: 'R', team: 'TBL', goals: 0,  assists: 4,  wins: 0,  shutouts: 0, gp: 6  },
  { player_id: 8478403, player_name: 'Jack Eichel',           position: 'C', team: 'VGK', goals: 1,  assists: 9,  wins: 0,  shutouts: 0, gp: 13 },
  { player_id: 8478427, player_name: 'Sebastian Aho',         position: 'C', team: 'CAR', goals: 7,  assists: 8,  wins: 0,  shutouts: 0, gp: 12 },
  { player_id: 8478483, player_name: 'Mitch Marner',          position: 'R', team: 'TOR', goals: 2,  assists: 11, wins: 0,  shutouts: 0, gp: 7  },
  { player_id: 8477939, player_name: 'William Nylander',      position: 'R', team: 'TOR', goals: 6,  assists: 9,  wins: 0,  shutouts: 0, gp: 7  },
  { player_id: 8480039, player_name: 'Martin Necas',          position: 'C', team: 'COL', goals: 1,  assists: 4,  wins: 0,  shutouts: 0, gp: 11 },
  { player_id: 8477933, player_name: 'Sam Reinhart',          position: 'C', team: 'FLA', goals: 4,  assists: 9,  wins: 0,  shutouts: 0, gp: 17 },
  { player_id: 8480803, player_name: 'Evan Bouchard',         position: 'D', team: 'EDM', goals: 6,  assists: 11, wins: 0,  shutouts: 0, gp: 16 },
  { player_id: 8475167, player_name: 'Victor Hedman',         position: 'D', team: 'TBL', goals: 0,  assists: 3,  wins: 0,  shutouts: 0, gp: 6  },
  { player_id: 8477504, player_name: 'Josh Morrissey',        position: 'D', team: 'WPG', goals: 0,  assists: 6,  wins: 0,  shutouts: 0, gp: 13 },
  { player_id: 8477447, player_name: 'Shea Theodore',         position: 'D', team: 'VGK', goals: 2,  assists: 3,  wins: 0,  shutouts: 0, gp: 13 },
  { player_id: 8474590, player_name: 'John Carlson',          position: 'D', team: 'WSH', goals: 1,  assists: 2,  wins: 0,  shutouts: 0, gp: 12 },
  { player_id: 8480762, player_name: 'Jakob Chychrun',        position: 'D', team: 'WSH', goals: 0,  assists: 3,  wins: 0,  shutouts: 0, gp: 12 },
  { player_id: 8478406, player_name: 'Mackenzie Blackwood',   position: 'G', team: 'COL', goals: 0,  assists: 0,  wins: 3,  shutouts: 1, gp: 7  },
  { player_id: 8475683, player_name: 'Sergei Bobrovsky',      position: 'G', team: 'FLA', goals: 0,  assists: 0,  wins: 12, shutouts: 3, gp: 17 },
  { player_id: 8476883, player_name: 'Andrei Vasilevskiy',    position: 'G', team: 'TBL', goals: 0,  assists: 0,  wins: 1,  shutouts: 0, gp: 6  },
  { player_id: 8478499, player_name: 'Adin Hill',             position: 'G', team: 'VGK', goals: 0,  assists: 0,  wins: 5,  shutouts: 0, gp: 11 },
  { player_id: 8476925, player_name: 'Anthony Stolarz',       position: 'G', team: 'TOR', goals: 0,  assists: 0,  wins: 4,  shutouts: 0, gp: 7  },
  { player_id: 8478476, player_name: 'Connor Hellebuyck',     position: 'G', team: 'WPG', goals: 0,  assists: 0,  wins: 6,  shutouts: 2, gp: 13 },
]

// 2025 pool rosters (from spreadsheet data)
const MANAGERS = [
  {
    name: 'Ben', team_name: "Sir Queefs",
    picks: [
      { player_id: 8477492, player_name: 'Nathan MacKinnon',    position_type: 'F', slot: 1 },
      { player_id: 8477934, player_name: 'Leon Draisaitl',      position_type: 'F', slot: 2 },
      { player_id: 8478402, player_name: 'Connor McDavid',      position_type: 'F', slot: 3 },
      { player_id: 8477933, player_name: 'Sam Reinhart',        position_type: 'F', slot: 4 },
      { player_id: 8477939, player_name: 'William Nylander',    position_type: 'F', slot: 5 },
      { player_id: 8480039, player_name: 'Martin Necas',        position_type: 'F', slot: 6 },
      { player_id: 8480069, player_name: 'Cale Makar',          position_type: 'D', slot: 1 },
      { player_id: 8480803, player_name: 'Evan Bouchard',       position_type: 'D', slot: 2 },
      { player_id: 8474590, player_name: 'John Carlson',        position_type: 'D', slot: 3 },
      { player_id: 8477504, player_name: 'Josh Morrissey',      position_type: 'D', slot: 4 },
      { player_id: 8475683, player_name: 'Sergei Bobrovsky',    position_type: 'G', slot: 1 },
      { player_id: 8478406, player_name: 'Mackenzie Blackwood', position_type: 'G', slot: 2 },
    ]
  },
  {
    name: 'KG', team_name: "LeBron James - Post JR injury",
    picks: [
      { player_id: 8478402, player_name: 'Connor McDavid',      position_type: 'F', slot: 1 },
      { player_id: 8477492, player_name: 'Nathan MacKinnon',    position_type: 'F', slot: 2 },
      { player_id: 8477933, player_name: 'Sam Reinhart',        position_type: 'F', slot: 3 },
      { player_id: 8477939, player_name: 'William Nylander',    position_type: 'F', slot: 4 },
      { player_id: 8478403, player_name: 'Jack Eichel',         position_type: 'F', slot: 5 },
      { player_id: 8480039, player_name: 'Martin Necas',        position_type: 'F', slot: 6 },
      { player_id: 8480069, player_name: 'Cale Makar',          position_type: 'D', slot: 1 },
      { player_id: 8480803, player_name: 'Evan Bouchard',       position_type: 'D', slot: 2 },
      { player_id: 8474590, player_name: 'John Carlson',        position_type: 'D', slot: 3 },
      { player_id: 8475167, player_name: 'Victor Hedman',       position_type: 'D', slot: 4 },
      { player_id: 8475683, player_name: 'Sergei Bobrovsky',    position_type: 'G', slot: 1 },
      { player_id: 8476925, player_name: 'Anthony Stolarz',     position_type: 'G', slot: 2 },
    ]
  },
  {
    name: 'Train', team_name: "Trainer Readerson",
    picks: [
      { player_id: 8477492, player_name: 'Nathan MacKinnon',    position_type: 'F', slot: 1 },
      { player_id: 8478403, player_name: 'Jack Eichel',         position_type: 'F', slot: 2 },
      { player_id: 8478402, player_name: 'Connor McDavid',      position_type: 'F', slot: 3 },
      { player_id: 8477934, player_name: 'Leon Draisaitl',      position_type: 'F', slot: 4 },
      { player_id: 8477939, player_name: 'William Nylander',    position_type: 'F', slot: 5 },
      { player_id: 8478483, player_name: 'Mitch Marner',        position_type: 'F', slot: 6 },
      { player_id: 8480069, player_name: 'Cale Makar',          position_type: 'D', slot: 1 },
      { player_id: 8477447, player_name: 'Shea Theodore',       position_type: 'D', slot: 2 },
      { player_id: 8480803, player_name: 'Evan Bouchard',       position_type: 'D', slot: 3 },
      { player_id: 8480762, player_name: 'Jakob Chychrun',      position_type: 'D', slot: 4 },
      { player_id: 8478406, player_name: 'Mackenzie Blackwood', position_type: 'G', slot: 1 },
      { player_id: 8476925, player_name: 'Anthony Stolarz',     position_type: 'G', slot: 2 },
    ]
  },
  {
    name: 'Hass', team_name: "Krieder me a river",
    picks: [
      { player_id: 8477492, player_name: 'Nathan MacKinnon',    position_type: 'F', slot: 1 },
      { player_id: 8478402, player_name: 'Connor McDavid',      position_type: 'F', slot: 2 },
      { player_id: 8476453, player_name: 'Nikita Kucherov',     position_type: 'F', slot: 3 },
      { player_id: 8478403, player_name: 'Jack Eichel',         position_type: 'F', slot: 4 },
      { player_id: 8477939, player_name: 'William Nylander',    position_type: 'F', slot: 5 },
      { player_id: 8478483, player_name: 'Mitch Marner',        position_type: 'F', slot: 6 },
      { player_id: 8480069, player_name: 'Cale Makar',          position_type: 'D', slot: 1 },
      { player_id: 8480803, player_name: 'Evan Bouchard',       position_type: 'D', slot: 2 },
      { player_id: 8477447, player_name: 'Jakob Chychrun',      position_type: 'D', slot: 3 },
      { player_id: 8477504, player_name: 'Josh Morrissey',      position_type: 'D', slot: 4 },
      { player_id: 8476883, player_name: 'Andrei Vasilevskiy',  position_type: 'G', slot: 1 },
      { player_id: 8478406, player_name: 'Mackenzie Blackwood', position_type: 'G', slot: 2 },
    ]
  },
  {
    name: 'Mike', team_name: "Teemu's Big Meat",
    picks: [
      { player_id: 8478403, player_name: 'Jack Eichel',         position_type: 'F', slot: 1 },
      { player_id: 8478427, player_name: 'Sebastian Aho',       position_type: 'F', slot: 2 },
      { player_id: 8476453, player_name: 'Nikita Kucherov',     position_type: 'F', slot: 3 },
      { player_id: 8477492, player_name: 'Nathan MacKinnon',    position_type: 'F', slot: 4 },
      { player_id: 8478483, player_name: 'Mitch Marner',        position_type: 'F', slot: 5 },
      { player_id: 8478402, player_name: 'Connor McDavid',      position_type: 'F', slot: 6 },
      { player_id: 8480069, player_name: 'Cale Makar',          position_type: 'D', slot: 1 },
      { player_id: 8475167, player_name: 'Victor Hedman',       position_type: 'D', slot: 2 },
      { player_id: 8477504, player_name: 'Josh Morrissey',      position_type: 'D', slot: 3 },
      { player_id: 8477447, player_name: 'Shea Theodore',       position_type: 'D', slot: 4 },
      { player_id: 8476883, player_name: 'Andrei Vasilevskiy',  position_type: 'G', slot: 1 },
      { player_id: 8478499, player_name: 'Adin Hill',           position_type: 'G', slot: 2 },
    ]
  },
]

const wipe = process.argv.includes('--wipe')

async function main() {
  if (wipe) {
    console.log(`Wiping season ${SEASON} test data...`)
    const names = MANAGERS.map(m => m.name)
    const { error } = await supabase.from('managers').delete().in('name', names).eq('season', SEASON)
    if (error) console.error('Wipe error:', error.message)
    else console.log('Done. Test managers and picks removed.')
    return
  }

  console.log(`Seeding player stats for season ${SEASON}...`)
  const { error: statsErr } = await supabase
    .from('player_stats')
    .upsert(PLAYER_STATS.map(s => ({ ...s, season: SEASON, last_updated: new Date().toISOString() })), { onConflict: 'player_id,season' })
  if (statsErr) { console.error('Stats error:', statsErr.message); return }
  console.log(`  ✓ ${PLAYER_STATS.length} players upserted`)

  console.log('Seeding managers and picks...')
  for (const m of MANAGERS) {
    // Check if already exists this season
    const { data: existing } = await supabase.from('managers').select('id').ilike('name', m.name).eq('season', SEASON).single()
    if (existing) {
      console.log(`  skipping ${m.name} (already exists)`)
      continue
    }

    const { data: manager, error: mErr } = await supabase
      .from('managers')
      .insert({ name: m.name, team_name: m.team_name, season: SEASON })
      .select().single()
    if (mErr) { console.error(`  manager error (${m.name}):`, mErr.message); continue }

    const picks = m.picks.map(p => ({ ...p, manager_id: manager.id }))
    const { error: pErr } = await supabase.from('picks').insert(picks)
    if (pErr) { console.error(`  picks error (${m.name}):`, pErr.message); continue }

    console.log(`  ✓ ${m.name} — "${m.team_name}"`)
  }

  console.log('\nDone! Check https://goin-deep.vercel.app')
}

main()
