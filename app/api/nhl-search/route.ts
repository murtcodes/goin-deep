import { NextRequest, NextResponse } from 'next/server'
import { searchPlayers } from '@/lib/nhl'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || ''
  if (q.length < 2) return NextResponse.json([])
  const results = await searchPlayers(q)
  return NextResponse.json(results)
}
