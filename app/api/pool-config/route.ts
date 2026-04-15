import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('pool_config')
    .select('draft_open, season, draft_deadline')
    .eq('id', 1)
    .single()

  if (error || !data) {
    return NextResponse.json({ draft_open: false, season: null, draft_deadline: null }, { status: 200 })
  }

  // Also enforce deadline server-side
  let draft_open = data.draft_open
  if (data.draft_deadline && new Date(data.draft_deadline) < new Date()) {
    draft_open = false
  }

  return NextResponse.json({ draft_open, season: data.season, draft_deadline: data.draft_deadline ?? null })
}
