import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { fetchAllPlayersStats } from '@/lib/nhl'

export async function POST(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key') || req.headers.get('x-admin-key')
  if (key !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: config } = await supabase.from('pool_config').select('season').eq('id', 1).single()
  const season = config?.season || 20252026

  // Get all unique player IDs from current season picks only
  const { data: managers } = await supabase.from('managers').select('id').eq('season', season)
  const managerIds = (managers || []).map(m => m.id)

  if (managerIds.length === 0) return NextResponse.json({ updated: 0 })

  const { data: picks } = await supabase
    .from('picks')
    .select('player_id, player_name, position_type')
    .in('manager_id', managerIds)

  if (!picks || picks.length === 0) return NextResponse.json({ updated: 0 })

  const playerMap = new Map<number, { name: string; posType: string }>()
  for (const p of picks) {
    if (!playerMap.has(p.player_id)) {
      playerMap.set(p.player_id, { name: p.player_name, posType: p.position_type })
    }
  }

  const playerIds = [...playerMap.keys()]
  console.log(`Syncing ${playerIds.length} players for season ${season}...`)
  const statsMap = await fetchAllPlayersStats(playerIds, season)

  const upsertData = []
  for (const [playerId, stats] of statsMap.entries()) {
    upsertData.push({
      player_id: playerId,
      season,
      player_name: stats.playerName || playerMap.get(playerId)?.name || '',
      position: stats.position,
      team: stats.team,
      goals: stats.goals,
      assists: stats.assists,
      wins: stats.wins,
      shutouts: stats.shutouts,
      gp: stats.gp,
      last_updated: new Date().toISOString(),
    })
  }

  if (upsertData.length > 0) {
    const { error } = await supabase
      .from('player_stats')
      .upsert(upsertData, { onConflict: 'player_id,season' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const missing = playerIds.filter((id) => !statsMap.has(id))
  if (missing.length > 0) {
    const zeroData = missing.map((id) => ({
      player_id: id,
      season,
      player_name: playerMap.get(id)?.name || '',
      position: playerMap.get(id)?.posType === 'G' ? 'G' : 'F',
      team: '',
      goals: 0, assists: 0, wins: 0, shutouts: 0, gp: 0,
      last_updated: new Date().toISOString(),
    }))
    await supabase.from('player_stats').upsert(zeroData, { onConflict: 'player_id,season' })
  }

  return NextResponse.json({ updated: upsertData.length, zeroed: missing.length })
}
