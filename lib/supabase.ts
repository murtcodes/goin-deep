import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || url === 'your_supabase_url_here') {
    throw new Error('Supabase environment variables not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  }
  _client = createClient(url, key)
  return _client
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getClient()[prop as keyof SupabaseClient]
  },
})

export type Manager = {
  id: string
  name: string
  team_name: string
  created_at: string
  user_id?: string | null
  season?: number
  captain_player_id?: number | null
}


export type Pick = {
  id: string
  manager_id: string
  player_id: number
  player_name: string
  position_type: 'F' | 'D' | 'G'
  slot: number
}

export type PlayerStats = {
  player_id: number
  player_name: string
  position: string
  team: string
  goals: number
  assists: number
  wins: number
  shutouts: number
  gp: number
  last_updated: string
}

export type PoolConfig = {
  id: number
  draft_open: boolean
  season: number
  draft_deadline?: string | null
}

// Scoring: G=2, A=1, GoalieW=2, GoalieSO=5
export function calcPoints(stats: PlayerStats, positionType: 'F' | 'D' | 'G'): number {
  if (positionType === 'G') {
    return (stats.wins * 2) + (stats.shutouts * 5)
  }
  return (stats.goals * 2) + (stats.assists * 1)
}
