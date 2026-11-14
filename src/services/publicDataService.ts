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
const PUBLIC_DATA_ERROR = 'Public data unavailable to load.'

function validatePublicDataset(data: unknown): PublicDataset {
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
    throw new Error(PUBLIC_DATA_ERROR)
  }

  return data as PublicDataset
}

async function getPublicDataset(): Promise<PublicDataset> {
  const dataUrl = import.meta.env.DEV ? '/test-data/public.json' : PUBLIC_DATA_URL
  try {
    const response = await fetch(dataUrl, { cache: 'no-store' })
    if (!response.ok) {
      throw new Error(`Public data request failed with status ${response.status}.`)
    }

    const data: unknown = await response.json()
    return validatePublicDataset(data)
  } catch (cause) {
    console.error('Failed to load public data.', cause)
    throw new Error(PUBLIC_DATA_ERROR)
  }
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
