import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, teamName, email, forwards, defensemen, goalies, captainPlayerId } = body

  if (!name?.trim() || !teamName?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'Name, team name, and email are required' }, { status: 400 })
  }
  if (forwards?.length !== 6 || defensemen?.length !== 4 || goalies?.length !== 2) {
    return NextResponse.json({ error: 'Must pick 6 forwards, 4 defensemen, 2 goalies' }, { status: 400 })
  }
  if (!captainPlayerId) {
    return NextResponse.json({ error: 'You must choose a captain' }, { status: 400 })
  }

  const { data: config } = await supabase
    .from('pool_config')
    .select('draft_open, season, draft_deadline')
    .eq('id', 1)
    .single()

  if (!config?.draft_open) {
    return NextResponse.json({ error: 'Draft is closed. Picks are locked!' }, { status: 403 })
  }

  if (config.draft_deadline && new Date(config.draft_deadline) < new Date()) {
    return NextResponse.json({ error: 'Draft deadline has passed. Picks are locked!' }, { status: 403 })
  }

  const season = config.season
  const normalizedEmail = email.trim().toLowerCase()

  // One team per email per season
  const { data: existingByEmail } = await supabase
    .from('managers')
    .select('id')
    .ilike('email', normalizedEmail)
    .eq('season', season)
    .single()

  if (existingByEmail) {
    return NextResponse.json({ error: 'You already submitted a team this season. Contact Curtis to make changes.' }, { status: 409 })
  }

  const { data: manager, error: managerErr } = await supabase
    .from('managers')
    .insert({
      name: name.trim(),
      team_name: teamName.trim(),
      email: normalizedEmail,
      season,
      captain_player_id: captainPlayerId,
    })
    .select()
    .single()

  if (managerErr || !manager) {
    return NextResponse.json({ error: 'Failed to save. Try again.' }, { status: 500 })
  }

  const allPicks = [
    ...forwards.map((p: { id: number; name: string }, i: number) => ({
      manager_id: manager.id, player_id: p.id, player_name: p.name, position_type: 'F', slot: i + 1,
    })),
    ...defensemen.map((p: { id: number; name: string }, i: number) => ({
      manager_id: manager.id, player_id: p.id, player_name: p.name, position_type: 'D', slot: i + 1,
    })),
    ...goalies.map((p: { id: number; name: string }, i: number) => ({
      manager_id: manager.id, player_id: p.id, player_name: p.name, position_type: 'G', slot: i + 1,
    })),
  ]

  const { error: picksErr } = await supabase.from('picks').insert(allPicks)
  if (picksErr) {
    await supabase.from('managers').delete().eq('id', manager.id)
    return NextResponse.json({ error: 'Failed to save picks. Try again.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, managerId: manager.id })
}
