export interface Hub {
  id: string
  name: string
  location: string
  isActive: boolean
  createdAt: string
}

export interface MatchMember {
  id: string
  playerId: string
  displayName: string
  teamNumber: 1 | 2
  mmrBefore: number
  mmrChange: number
  mmrAfter: number
}

export interface Match {
  id: string
  hubId: string
  playedAt: string
  team1Score: number
  team2Score: number
  winningTeamNumber: 1 | 2
  status: 'Completed'
  isOfficial: true
  youtubeVideoId: string | null
  createdAt: string
  updatedAt: string
  members: MatchMember[]
}

export interface Player {
  id: string
  hubId: string
  displayName: string
  avatarUrl: string | null
  currentMMR: number
  wins: number
  losses: number
  totalMatches: number
  winRate: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface LeaderboardEntry {
  playerId: string
  hubId: string
  displayName: string
  currentMMR: number
  wins: number
  losses: number
  totalMatches: number
  winRate: number
}

export interface MatchFilters {
  hubId?: string
  playerId?: string
}

export interface HubService {
  getHubs(): Promise<Hub[]>
}

export interface LeaderboardService {
  getLeaderboard(hubId: string): Promise<LeaderboardEntry[]>
}

export interface MatchService {
  getMatches(filters?: MatchFilters): Promise<Match[]>
  getMatchById(matchId: string): Promise<Match | null>
}

interface PublicDataset {
  hubs: Hub[]
  players: Player[]
  matches: Match[]
}

const PUBLIC_DATA_URL = 'https://data.timothy-apolinario.com/public.json'

async function getPublicDataset(): Promise<PublicDataset> {
  let response: Response
  try {
    response = await fetch(PUBLIC_DATA_URL, { cache: 'no-store' })
  } catch (cause) {
    const detail = cause instanceof Error ? ` ${cause.message}` : ''
    throw new Error(
      `Could not fetch public data from ${PUBLIC_DATA_URL}.${detail} Check that the host allows requests from this site with CORS.`,
    )
  }

  if (!response.ok) {
    throw new Error(
      `Failed to load public data (${response.status} ${response.statusText}).`,
    )
  }

  const data: unknown = await response.json()
  if (
    typeof data !== 'object' ||
    data === null ||
    !('hubs' in data) ||
    !Array.isArray(data.hubs) ||
    !('players' in data) ||
    !Array.isArray(data.players) ||
    !('matches' in data) ||
    !Array.isArray(data.matches)
  ) {
    throw new Error(`Public data from ${PUBLIC_DATA_URL} has an invalid format.`)
  }

  return data as PublicDataset
}

export const hubService: HubService = {
  async getHubs() {
    const dataset = await getPublicDataset()
    return dataset.hubs.filter((hub) => hub.isActive)
  },
}

export const leaderboardService: LeaderboardService = {
  async getLeaderboard(hubId) {
    const dataset = await getPublicDataset()
    return dataset.players
      .filter((player) => player.hubId === hubId && player.isActive)
      .sort(
        (left, right) =>
          right.currentMMR - left.currentMMR ||
          right.wins - left.wins ||
          left.displayName.localeCompare(right.displayName) ||
          left.id.localeCompare(right.id),
      )
      .map(({ id, ...player }) => ({ ...player, playerId: id }))
  },
}

export const matchService: MatchService = {
  async getMatches(filters = {}) {
    const dataset = await getPublicDataset()
    return dataset.matches
      .filter(
        (match) =>
          match.isOfficial &&
          match.status === 'Completed' &&
          (!filters.hubId || match.hubId === filters.hubId) &&
          (!filters.playerId ||
            match.members.some((member) => member.playerId === filters.playerId)),
      )
      .sort(
        (left, right) =>
          right.playedAt.localeCompare(left.playedAt) ||
          right.id.localeCompare(left.id),
      )
  },
  async getMatchById(matchId) {
    const dataset = await getPublicDataset()
    return (
      dataset.matches.find(
        (match) =>
          match.id === matchId &&
          match.isOfficial &&
          match.status === 'Completed',
      ) ?? null
    )
  },
}
