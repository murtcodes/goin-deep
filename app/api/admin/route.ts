import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

// Service-role client — only used server-side for auth.admin calls
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function checkAuth(req: NextRequest): boolean {
  const key = req.nextUrl.searchParams.get('key') || req.headers.get('x-admin-key')
  return key === process.env.ADMIN_SECRET_KEY
}

// GET: fetch pool state
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: config } = await supabase.from('pool_config').select('*').eq('id', 1).single()
  const { data: managers } = await supabase
    .from('managers')
    .select('id, name, team_name, created_at, user_id, season')
    .order('created_at')
  const { data: picks } = await supabase.from('picks').select('*')

  return NextResponse.json({ config, managers, picks })
}

// POST: admin actions
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

  if (body.action === 'set_deadline') {
    // body.deadline: ISO string, or null to clear
    const deadline = body.deadline ?? null
    const { error } = await supabase
      .from('pool_config')
      .update({ draft_deadline: deadline })
      .eq('id', 1)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ draft_deadline: deadline })
  }

  if (body.action === 'delete_manager' && body.managerId) {
    const { error } = await supabase.from('managers').delete().eq('id', body.managerId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // Link a historical manager row to a user account by email
  // body: { action: 'link_user', managerId: string, email: string }
  if (body.action === 'link_user' && body.managerId && body.email) {
    // Look up the user by email in auth.users via admin API (requires service role)
    const adminClient = getAdminClient()
    const { data: users, error: listErr } = await adminClient.auth.admin.listUsers()
    if (listErr) return NextResponse.json({ error: listErr.message }, { status: 500 })

    const matched = users.users.find(
      (u) => u.email?.toLowerCase() === body.email.toLowerCase()
    )
    if (!matched) {
      return NextResponse.json({ error: `No user found with email: ${body.email}` }, { status: 404 })
    }

    const { error: updateErr } = await supabase
      .from('managers')
      .update({ user_id: matched.id })
      .eq('id', body.managerId)

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })
    return NextResponse.json({ success: true, userId: matched.id })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
