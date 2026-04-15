import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) {
    return NextResponse.json({ manager: null })
  }

  const { data: config } = await supabase
    .from('pool_config')
    .select('season')
    .eq('id', 1)
    .single()

  if (!config) {
    return NextResponse.json({ manager: null })
  }

  const { data: manager } = await supabase
    .from('managers')
    .select('id, name, team_name, season')
    .eq('user_id', userId)
    .eq('season', config.season)
    .single()

  return NextResponse.json({ manager: manager ?? null })
}
