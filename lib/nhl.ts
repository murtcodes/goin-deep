// NHL API utilities
const NHL_API = 'https://api-web.nhle.com/v1'
const NHL_SEARCH = 'https://search.d3.nhle.com/api/v1/search'

const PLAYOFF_TEAMS = new Set([
  'CAR', 'PIT', 'PHI', 'BUF', 'MTL', 'TBL', 'BOS', 'OTT', // East
  'COL', 'DAL', 'MIN', 'EDM', 'VGK', 'ANA', 'UTA', 'LAK', // West
])

export type NHLPlayerSuggestion = {
  id: number
  name: string
  team: string
  position: string
}

export type NHLPlayoffStats = {
  playerId: number
  playerName: string
  position: string
  team: string
  goals: number
  assists: number
  wins: number
  shutouts: number
  gp: number
}

export async function searchPlayers(query: string): Promise<NHLPlayerSuggestion[]> {
  if (query.length < 2) return []
  try {
    const res = await fetch(
      `${NHL_SEARCH}/player?culture=en-us&limit=50&q=${encodeURIComponent(query)}&active=true`,
      { cache: 'no-store' }
    )
    const data = await res.json()
    return (data || [])
      .filter((p: { lastTeamAbbrev: string }) => PLAYOFF_TEAMS.has(p.lastTeamAbbrev))
      .slice(0, 15)
      .map((p: {
        playerId: string | number
        name: string
        lastTeamAbbrev: string
        positionCode: string
      }) => ({
        id: parseInt(String(p.playerId)),
        name: p.name,
        team: p.lastTeamAbbrev || '',
        position: p.positionCode || '',
      }))
  } catch {
    return []
  }
}

export async function fetchPlayerPlayoffStats(
  playerId: number,
  season: number = 20252026
): Promise<NHLPlayoffStats | null> {
  try {
    const res = await fetch(
      `${NHL_API}/player/${playerId}/game-log/${season}/3`,
      { cache: 'no-store' }
    )
    if (!res.ok) return null
    const data = await res.json()

    const games = data.gameLog || []
    if (games.length === 0) return null

    // Get player info from landing page
    const infoRes = await fetch(`${NHL_API}/player/${playerId}/landing`, {
      cache: 'no-store',
    })
    const info = await infoRes.json()
    const posCode = info.position || ''
    const isGoalie = posCode === 'G'

    const stats: NHLPlayoffStats = {
      playerId,
      playerName: `${info.firstName?.default || ''} ${info.lastName?.default || ''}`.trim(),
      position: posCode,
      team: info.currentTeamAbbrev || '',
      goals: 0,
      assists: 0,
      wins: 0,
      shutouts: 0,
      gp: games.length,
    }

    for (const game of games) {
      if (isGoalie) {
        stats.wins += game.decision === 'W' ? 1 : 0
        stats.shutouts += game.shotsAgainst > 0 && game.goalsAgainst === 0 ? 1 : 0
      } else {
        stats.goals += game.goals || 0
        stats.assists += game.assists || 0
      }
    }

    return stats
  } catch {
    return null
  }
}

export async function fetchAllPlayersStats(
  playerIds: number[],
  season: number = 20252026
): Promise<Map<number, NHLPlayoffStats>> {
  const results = new Map<number, NHLPlayoffStats>()
  const unique = [...new Set(playerIds)]

  await Promise.all(
    unique.map(async (id) => {
      const stats = await fetchPlayerPlayoffStats(id, season)
      if (stats) results.set(id, stats)
    })
  )
  return results
}
