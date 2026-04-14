// Full 2025 pool seed — all 9 teams, stats from NHL API
// Run: node scripts/seed-2025-full.mjs
import { createClient } from '@supabase/supabase-js'

const SEASON = 20242025
const s = createClient(
  'https://ywiatifembpcmydvjdzh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3aWF0aWZlbWJwY215ZHZqZHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMDA0NzQsImV4cCI6MjA5MTc3NjQ3NH0.cg1s4ptTXaDPfyRbnDfB0mN51-BMnclKhZmFcjLWNlM'
)

const MANAGERS = [
  { name: 'Mike',   team_name: "Teemu's Big Meat", picks: [
    { player_id: 8478403, player_name: 'Jack Eichel',          position_type: 'F', slot: 1 },
    { player_id: 8478427, player_name: 'Sebastian Aho',         position_type: 'F', slot: 2 },
    { player_id: 8476453, player_name: 'Nikita Kucherov',       position_type: 'F', slot: 3 },
    { player_id: 8477492, player_name: 'Nathan MacKinnon',      position_type: 'F', slot: 4 },
    { player_id: 8478483, player_name: 'Mitch Marner',          position_type: 'F', slot: 5 },
    { player_id: 8478402, player_name: 'Connor McDavid',        position_type: 'F', slot: 6 },
    { player_id: 8480069, player_name: 'Cale Makar',            position_type: 'D', slot: 1 },
    { player_id: 8475167, player_name: 'Victor Hedman',         position_type: 'D', slot: 2 },
    { player_id: 8477504, player_name: 'Josh Morrissey',        position_type: 'D', slot: 3 },
    { player_id: 8477447, player_name: 'Shea Theodore',         position_type: 'D', slot: 4 },
    { player_id: 8476883, player_name: 'Andrei Vasilevskiy',    position_type: 'G', slot: 1 },
    { player_id: 8478499, player_name: 'Adin Hill',             position_type: 'G', slot: 2 },
  ]},
  { name: 'Ben',   team_name: 'Sir Queefs', picks: [
    { player_id: 8477492, player_name: 'Nathan MacKinnon',      position_type: 'F', slot: 1 },
    { player_id: 8477934, player_name: 'Leon Draisaitl',        position_type: 'F', slot: 2 },
    { player_id: 8478402, player_name: 'Connor McDavid',        position_type: 'F', slot: 3 },
    { player_id: 8477933, player_name: 'Sam Reinhart',          position_type: 'F', slot: 4 },
    { player_id: 8477939, player_name: 'William Nylander',      position_type: 'F', slot: 5 },
    { player_id: 8480039, player_name: 'Martin Necas',          position_type: 'F', slot: 6 },
    { player_id: 8480069, player_name: 'Cale Makar',            position_type: 'D', slot: 1 },
    { player_id: 8480803, player_name: 'Evan Bouchard',         position_type: 'D', slot: 2 },
    { player_id: 8474590, player_name: 'John Carlson',          position_type: 'D', slot: 3 },
    { player_id: 8477504, player_name: 'Josh Morrissey',        position_type: 'D', slot: 4 },
    { player_id: 8475683, player_name: 'Sergei Bobrovsky',      position_type: 'G', slot: 1 },
    { player_id: 8478406, player_name: 'Mackenzie Blackwood',   position_type: 'G', slot: 2 },
  ]},
  { name: 'Longer', team_name: 'Playoff Perv', picks: [
    { player_id: 8477492, player_name: 'Nathan MacKinnon',      position_type: 'F', slot: 1 },
    { player_id: 8476453, player_name: 'Nikita Kucherov',       position_type: 'F', slot: 2 },
    { player_id: 8479318, player_name: 'Auston Matthews',       position_type: 'F', slot: 3 },
    { player_id: 8478403, player_name: 'Jack Eichel',           position_type: 'F', slot: 4 },
    { player_id: 8480039, player_name: 'Martin Necas',          position_type: 'F', slot: 5 },
    { player_id: 8478402, player_name: 'Connor McDavid',        position_type: 'F', slot: 6 },
    { player_id: 8480069, player_name: 'Cale Makar',            position_type: 'D', slot: 1 },
    { player_id: 8476853, player_name: 'Morgan Rielly',         position_type: 'D', slot: 2 },
    { player_id: 8477447, player_name: 'Shea Theodore',         position_type: 'D', slot: 3 },
    { player_id: 8479345, player_name: 'Jakob Chychrun',        position_type: 'D', slot: 4 },
    { player_id: 8478406, player_name: 'Mackenzie Blackwood',   position_type: 'G', slot: 1 },
    { player_id: 8476883, player_name: 'Andrei Vasilevskiy',    position_type: 'G', slot: 2 },
  ]},
  { name: 'KG',    team_name: 'LeBron James - Post JR injury', picks: [
    { player_id: 8478398, player_name: 'Kyle Connor',           position_type: 'F', slot: 1 },
    { player_id: 8471214, player_name: 'Alex Ovechkin',         position_type: 'F', slot: 2 },
    { player_id: 8478402, player_name: 'Connor McDavid',        position_type: 'F', slot: 3 },
    { player_id: 8479318, player_name: 'Auston Matthews',       position_type: 'F', slot: 4 },
    { player_id: 8477492, player_name: 'Nathan MacKinnon',      position_type: 'F', slot: 5 },
    { player_id: 8477933, player_name: 'Sam Reinhart',          position_type: 'F', slot: 6 },
    { player_id: 8480069, player_name: 'Cale Makar',            position_type: 'D', slot: 1 },
    { player_id: 8474590, player_name: 'John Carlson',          position_type: 'D', slot: 2 },
    { player_id: 8475167, player_name: 'Victor Hedman',         position_type: 'D', slot: 3 },
    { player_id: 8480803, player_name: 'Evan Bouchard',         position_type: 'D', slot: 4 },
    { player_id: 8476945, player_name: 'Connor Hellebuyck',     position_type: 'G', slot: 1 },
    { player_id: 8475683, player_name: 'Sergei Bobrovsky',      position_type: 'G', slot: 2 },
  ]},
  { name: 'Train', team_name: 'Trainer Readerson', picks: [
    { player_id: 8477492, player_name: 'Nathan MacKinnon',      position_type: 'F', slot: 1 },
    { player_id: 8478403, player_name: 'Jack Eichel',           position_type: 'F', slot: 2 },
    { player_id: 8478402, player_name: 'Connor McDavid',        position_type: 'F', slot: 3 },
    { player_id: 8477934, player_name: 'Leon Draisaitl',        position_type: 'F', slot: 4 },
    { player_id: 8479318, player_name: 'Auston Matthews',       position_type: 'F', slot: 5 },
    { player_id: 8477939, player_name: 'William Nylander',      position_type: 'F', slot: 6 },
    { player_id: 8480069, player_name: 'Cale Makar',            position_type: 'D', slot: 1 },
    { player_id: 8477447, player_name: 'Shea Theodore',         position_type: 'D', slot: 2 },
    { player_id: 8480803, player_name: 'Evan Bouchard',         position_type: 'D', slot: 3 },
    { player_id: 8479345, player_name: 'Jakob Chychrun',        position_type: 'D', slot: 4 },
    { player_id: 8478406, player_name: 'Mackenzie Blackwood',   position_type: 'G', slot: 1 },
    { player_id: 8476932, player_name: 'Anthony Stolarz',       position_type: 'G', slot: 2 },
  ]},
  { name: 'Mac',   team_name: 'Webbed Toe Wranglers', picks: [
    { player_id: 8477492, player_name: 'Nathan MacKinnon',      position_type: 'F', slot: 1 },
    { player_id: 8480039, player_name: 'Martin Necas',          position_type: 'F', slot: 2 },
    { player_id: 8478010, player_name: 'Brayden Point',         position_type: 'F', slot: 3 },
    { player_id: 8476453, player_name: 'Nikita Kucherov',       position_type: 'F', slot: 4 },
    { player_id: 8480018, player_name: 'Nick Suzuki',           position_type: 'F', slot: 5 },
    { player_id: 8478403, player_name: 'Jack Eichel',           position_type: 'F', slot: 6 },
    { player_id: 8480069, player_name: 'Cale Makar',            position_type: 'D', slot: 1 },
    { player_id: 8475167, player_name: 'Victor Hedman',         position_type: 'D', slot: 2 },
    { player_id: 8477447, player_name: 'Shea Theodore',         position_type: 'D', slot: 3 },
    { player_id: 8483457, player_name: 'Lane Hutson',           position_type: 'D', slot: 4 },
    { player_id: 8478406, player_name: 'Mackenzie Blackwood',   position_type: 'G', slot: 1 },
    { player_id: 8476883, player_name: 'Andrei Vasilevskiy',    position_type: 'G', slot: 2 },
  ]},
  { name: 'Hass',  team_name: 'Krieder Me a River', picks: [
    { player_id: 8477492, player_name: 'Nathan MacKinnon',      position_type: 'F', slot: 1 },
    { player_id: 8478402, player_name: 'Connor McDavid',        position_type: 'F', slot: 2 },
    { player_id: 8476453, player_name: 'Nikita Kucherov',       position_type: 'F', slot: 3 },
    { player_id: 8478403, player_name: 'Jack Eichel',           position_type: 'F', slot: 4 },
    { player_id: 8477939, player_name: 'William Nylander',      position_type: 'F', slot: 5 },
    { player_id: 8471214, player_name: 'Alex Ovechkin',         position_type: 'F', slot: 6 },
    { player_id: 8480069, player_name: 'Cale Makar',            position_type: 'D', slot: 1 },
    { player_id: 8480803, player_name: 'Evan Bouchard',         position_type: 'D', slot: 2 },
    { player_id: 8479345, player_name: 'Jakob Chychrun',        position_type: 'D', slot: 3 },
    { player_id: 8477504, player_name: 'Josh Morrissey',        position_type: 'D', slot: 4 },
    { player_id: 8476883, player_name: 'Andrei Vasilevskiy',    position_type: 'G', slot: 1 },
    { player_id: 8478406, player_name: 'Mackenzie Blackwood',   position_type: 'G', slot: 2 },
  ]},
  { name: 'Murt',  team_name: "Murt's Beauties", picks: [
    { player_id: 8477492, player_name: 'Nathan MacKinnon',      position_type: 'F', slot: 1 },
    { player_id: 8476453, player_name: 'Nikita Kucherov',       position_type: 'F', slot: 2 },
    { player_id: 8471214, player_name: 'Alex Ovechkin',         position_type: 'F', slot: 3 },
    { player_id: 8478403, player_name: 'Jack Eichel',           position_type: 'F', slot: 4 },
    { player_id: 8480039, player_name: 'Martin Necas',          position_type: 'F', slot: 5 },
    { player_id: 8478402, player_name: 'Connor McDavid',        position_type: 'F', slot: 6 },
    { player_id: 8480069, player_name: 'Cale Makar',            position_type: 'D', slot: 1 },
    { player_id: 8475167, player_name: 'Victor Hedman',         position_type: 'D', slot: 2 },
    { player_id: 8477447, player_name: 'Shea Theodore',         position_type: 'D', slot: 3 },
    { player_id: 8474590, player_name: 'John Carlson',          position_type: 'D', slot: 4 },
    { player_id: 8476883, player_name: 'Andrei Vasilevskiy',    position_type: 'G', slot: 1 },
    { player_id: 8478406, player_name: 'Mackenzie Blackwood',   position_type: 'G', slot: 2 },
  ]},
  { name: 'Lents', team_name: 'African Slave Trade Patrol', picks: [
    { player_id: 8477492, player_name: 'Nathan MacKinnon',      position_type: 'F', slot: 1 },
    { player_id: 8476453, player_name: 'Nikita Kucherov',       position_type: 'F', slot: 2 },
    { player_id: 8479314, player_name: 'Matthew Tkachuk',       position_type: 'F', slot: 3 },
    { player_id: 8478403, player_name: 'Jack Eichel',           position_type: 'F', slot: 4 },
    { player_id: 8478402, player_name: 'Connor McDavid',        position_type: 'F', slot: 5 },
    { player_id: 8480039, player_name: 'Martin Necas',          position_type: 'F', slot: 6 },
    { player_id: 8480069, player_name: 'Cale Makar',            position_type: 'D', slot: 1 },
    { player_id: 8477447, player_name: 'Shea Theodore',         position_type: 'D', slot: 2 },
    { player_id: 8475167, player_name: 'Victor Hedman',         position_type: 'D', slot: 3 },
    { player_id: 8477495, player_name: 'Seth Jones',            position_type: 'D', slot: 4 },
    { player_id: 8475683, player_name: 'Sergei Bobrovsky',      position_type: 'G', slot: 1 },
    { player_id: 8476883, player_name: 'Andrei Vasilevskiy',    position_type: 'G', slot: 2 },
  ]},
]

async function fetchPlayoffStats(playerId) {
  try {
    const [logRes, infoRes] = await Promise.all([
      fetch(`https://api-web.nhle.com/v1/player/${playerId}/game-log/${SEASON}/3`),
      fetch(`https://api-web.nhle.com/v1/player/${playerId}/landing`),
    ])
    if (!logRes.ok) return null
    const [log, info] = await Promise.all([logRes.json(), infoRes.json()])
    const games = log.gameLog || []
    const isGoalie = (info.position || '') === 'G'
    const stats = { goals: 0, assists: 0, wins: 0, shutouts: 0, gp: games.length }
    for (const g of games) {
      if (isGoalie) {
        if (g.decision === 'W') stats.wins++
        if (g.goalsAgainst === 0 && (g.shotsAgainst || 0) > 0) stats.shutouts++
      } else {
        stats.goals += g.goals || 0
        stats.assists += g.assists || 0
      }
    }
    return {
      player_id: playerId,
      season: SEASON,
      player_name: `${info.firstName?.default || ''} ${info.lastName?.default || ''}`.trim(),
      position: info.position || '',
      team: info.currentTeamAbbrev || '',
      ...stats,
      last_updated: new Date().toISOString(),
    }
  } catch { return null }
}

// Step 1: wipe existing season 20242025 data
console.log('Wiping old 2025 data...')
const names = MANAGERS.map(m => m.name)
await s.from('managers').delete().in('name', names).eq('season', SEASON)

// Step 2: collect all unique player IDs
const allIds = [...new Set(MANAGERS.flatMap(m => m.picks.map(p => p.player_id)))]
console.log(`Fetching NHL playoff stats for ${allIds.length} unique players...`)

const statsMap = new Map()
await Promise.all(allIds.map(async id => {
  const st = await fetchPlayoffStats(id)
  if (st) { statsMap.set(id, st); process.stdout.write('.') }
  else process.stdout.write('x')
}))
console.log(`\nGot stats for ${statsMap.size}/${allIds.length} players`)

// Step 3: upsert player stats
const { error: statsErr } = await s.from('player_stats')
  .upsert([...statsMap.values()], { onConflict: 'player_id,season' })
if (statsErr) { console.error('Stats upsert error:', statsErr.message); process.exit(1) }
console.log('✓ Player stats saved')

// Step 4: insert managers + picks
for (const m of MANAGERS) {
  const { data: mgr, error: mErr } = await s.from('managers')
    .insert({ name: m.name, team_name: m.team_name, season: SEASON })
    .select().single()
  if (mErr) { console.error(`manager error (${m.name}):`, mErr.message); continue }

  const { error: pErr } = await s.from('picks')
    .insert(m.picks.map(p => ({ ...p, manager_id: mgr.id })))
  if (pErr) { console.error(`picks error (${m.name}):`, pErr.message); continue }
  console.log(`✓ ${m.name} — "${m.team_name}"`)
}

console.log('\nDone! Check https://goin-deep.vercel.app/history')
