import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import PublicHeader from '../components/PublicHeader'
import { errorMessage, formatWinRate, usePublicHubs } from '../components/publicData'
import { leaderboardService } from '../services/publicDataService'
import type { LeaderboardEntry } from '../services/publicDataService'

export const Route = createFileRoute('/')({ component: LeaderboardPage })

function rankPlayers(players: LeaderboardEntry[]) {
  let previousMMR: number | undefined
  let rank = 0

  return players.map((player, index) => {
    if (index === 0 || player.currentMMR !== previousMMR) rank = index + 1
    previousMMR = player.currentMMR
    return { player, rank }
  })
}

function LeaderboardPage() {
  const { hubs, hubId, setHubId, loading: hubsLoading, error: hubsError } = usePublicHubs()
  const [players, setPlayers] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!hubId) return
    let active = true
    setLoading(true)
    setError('')
    leaderboardService.getLeaderboard(hubId)
      .then((result) => { if (active) setPlayers(result) })
      .catch((cause: unknown) => { if (active) setError(errorMessage(cause)) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [hubId])

  const selectedHub = hubs.find((hub) => hub.id === hubId)
  const pageError = hubsError || error
  const rankedPlayers = rankPlayers(players)

  return (
    <div className="public-app">
      <PublicHeader hubs={hubs} hubId={hubId} onHubChange={setHubId} />
      <main className="public-main">
        <section className="public-hero">
          <div className="public-eyebrow"><span /> THE RANKINGS</div>
          <h1>Earn your place.</h1>
          <p>Every game counts. See who’s rising to the top at {selectedHub?.name ?? 'your hub'}.</p>
        </section>

        <section className="public-content" aria-labelledby="leaderboard-title">
          <div className="public-section-heading">
            <div>
              <span className="public-kicker">SEASON STANDINGS</span>
              <h2 id="leaderboard-title">Leaderboard</h2>
            </div>
            <span className="public-total">{players.length} PLAYERS</span>
          </div>

          {hubsLoading || loading ? (
            <div className="public-state" role="status"><span className="public-spinner" /> Loading leaderboard…</div>
          ) : pageError ? (
            <div className="public-state public-error" role="alert">
              <strong>Couldn’t load the leaderboard</strong>
              <p>{pageError}</p>
              <button className="public-button" onClick={() => window.location.reload()}>Try again</button>
            </div>
          ) : !hubs.length ? (
            <div className="public-state"><strong>No hubs published yet</strong><p>Check back when the first hub is ready.</p></div>
          ) : !players.length ? (
            <div className="public-state"><strong>No ranked players yet</strong><p>Official match results will bring the leaderboard to life.</p></div>
          ) : (
            <div className="leaderboard-wrap">
              <table className="leaderboard-table">
                <thead>
                  <tr><th scope="col">RANK</th><th scope="col">PLAYER</th><th scope="col">MMR</th><th scope="col">W</th><th scope="col">L</th><th scope="col">WIN RATE</th></tr>
                </thead>
                <tbody>
                  {rankedPlayers.map(({ player, rank }, index) => (
                    <tr key={player.playerId} className={rank === 1 ? 'leaderboard-top' : ''}>
                      <td><span className={`leaderboard-rank ${rank <= 3 ? `rank-${rank}` : ''}`}>{String(rank).padStart(2, '0')}</span></td>
                      <td>
                        <div className="public-player">
                          <span className={`public-player-avatar avatar-${index % 5}`}>{player.displayName.slice(0, 1).toUpperCase()}</span>
                          <strong>{player.displayName}</strong>
                          {rank === 1 && <span className="leader-crown">TOP PLAYER</span>}
                        </div>
                      </td>
                      <td><strong className="public-mmr">{player.currentMMR.toLocaleString()}</strong></td>
                      <td className="record-win">{player.wins}</td>
                      <td className="record-loss">{player.losses}</td>
                      <td><span className="public-winrate">{formatWinRate(player.winRate)}</span><span className="record-total">{player.totalMatches} matches</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="leaderboard-footer">
            <span><i /> Official completed matches only</span>
            <Link to="/matches">View match history <span aria-hidden="true">→</span></Link>
          </div>
        </section>
        <footer className="public-footer">RANKUP <span>·</span> PLAY HARD. CLIMB HIGHER.</footer>
      </main>
    </div>
  )
}
