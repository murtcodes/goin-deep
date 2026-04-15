import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email) {
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
    .ilike('email', email.trim().toLowerCase())
    .eq('season', config.season)
    .single()

  return NextResponse.json({ manager: manager ?? null })
}
