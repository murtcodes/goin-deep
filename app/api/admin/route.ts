import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function checkAuth(req: NextRequest): boolean {
  const key = req.nextUrl.searchParams.get('key') || req.headers.get('x-admin-key')
  return key === process.env.ADMIN_SECRET_KEY
}

// GET: fetch pool state
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: config } = await supabase.from('pool_config').select('*').eq('id', 1).single()
  const { data: managers } = await supabase.from('managers').select('id, name, team_name, created_at').order('created_at')
  const { data: picks } = await supabase.from('picks').select('*')

  return NextResponse.json({ config, managers, picks })
}

// POST: toggle draft open/closed, or delete a manager
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  if (body.action === 'toggle_draft') {
    const { data: config } = await supabase.from('pool_config').select('draft_open').eq('id', 1).single()
    const { error } = await supabase
      .from('pool_config')
      .update({ draft_open: !config?.draft_open })
      .eq('id', 1)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ draft_open: !config?.draft_open })
  }

  if (body.action === 'delete_manager' && body.managerId) {
    const { error } = await supabase.from('managers').delete().eq('id', body.managerId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
