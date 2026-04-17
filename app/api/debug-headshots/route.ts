import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const managerId = req.nextUrl.searchParams.get('manager')
  if (!managerId) return NextResponse.json({ error: 'manager param required' })

  const { data: picks } = await supabase
    .from('picks')
    .select('player_id, player_name, team, position_type')
    .eq('manager_id', managerId)

  const results = await Promise.all((picks || []).map(async (p) => {
    let team = p.team
    if (!team) {
      try {
        const res = await fetch(`https://api-web.nhle.com/v1/player/${p.player_id}/landing`)
        const data = await res.json()
        team = data.currentTeamAbbrev || ''
      } catch { team = 'ERROR' }
    }
    const url = `https://assets.nhle.com/mugs/nhl/20252026/${team}/${p.player_id}.png`
    let status = 0
    try {
      const r = await fetch(url, { redirect: 'manual' })
      status = r.status
    } catch { status = -1 }
    return { name: p.player_name, pos: p.position_type, storedTeam: p.team, resolvedTeam: team, headshotStatus: status, url }
  }))

  return NextResponse.json(results)
}
