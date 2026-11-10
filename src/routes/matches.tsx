import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import PublicHeader from '../components/PublicHeader'
import { errorMessage, formatDate, usePublicHubs } from '../components/publicData'
import {
  leaderboardService,
  matchService,
  type LeaderboardEntry,
  type Match,
} from '../services/publicDataService'

export const Route = createFileRoute('/matches')({ component: MatchesPage })

function MatchesPage() {
  const { hubs, hubId, setHubId, loading: hubsLoading, error: hubsError } = usePublicHubs()
  const [matches, setMatches] = useState<Match[]>([])
  const [roster, setRoster] = useState<LeaderboardEntry[]>([])
  const [playerId, setPlayerId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!hubId) {
      setMatches([])
      return
    }
    let active = true
    setLoading(true)
    setError('')
    Promise.all([
      matchService.getMatches({ hubId, playerId: playerId || undefined }),
      leaderboardService.getLeaderboard(hubId),
    ])
      .then(([result, players]) => {
        if (!active) return
        setMatches(result)
        setRoster(players)
      })
      .catch((cause: unknown) => { if (active) setError(errorMessage(cause)) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [hubId, playerId])

  const pageError = hubsError || error

  return (
    <div className="public-app">
      <PublicHeader hubs={hubs} hubId={hubId} onHubChange={(value) => {
        setHubId(value)
        setPlayerId('')
      }} />
      <main className="public-main">
        <section className="public-hero matches-hero">
          <div className="public-eyebrow"><span /> OFFICIAL RESULTS</div>
          <h1>Every point matters.</h1>
          <p>Relive the matchups, results, and rating swings from the court.</p>
        </section>
        <section className="public-content">
          <div className="public-section-heading matches-heading">
            <div><span className="public-kicker">THE RECORD</span><h2>Match history</h2></div>
            <label className="public-filter">
              <span>PLAYER</span>
              <select aria-label="Filter by player" value={playerId} onChange={(event) => setPlayerId(event.target.value)}>
                <option value="">All players</option>
                {roster.map((player) => <option value={player.playerId} key={player.playerId}>{player.displayName}</option>)}
              </select>
            </label>
          </div>
          {hubsLoading || loading ? (
            <div className="public-state" role="status"><span className="public-spinner" /> Loading matches…</div>
          ) : pageError ? (
            <div className="public-state public-error" role="alert">
              <strong>Couldn’t load match history</strong><p>{pageError}</p>
              <button className="public-button" onClick={() => window.location.reload()}>Try again</button>
            </div>
          ) : !hubs.length ? (
            <div className="public-state"><strong>No hubs published yet</strong><p>Check back when the first hub is ready.</p></div>
          ) : !matches.length ? (
            <div className="public-state"><strong>No official matches found</strong><p>Try another player or check back after the next match.</p></div>
          ) : (
            <div className="match-list">
              {matches.map((match) => {
                const teamOne = match.members.filter((member) => member.teamNumber === 1)
                const teamTwo = match.members.filter((member) => member.teamNumber === 2)
                return (
                  <Link
                    className="public-match-card"
                    to="/matches/$matchId"
                    params={{ matchId: match.id }}
                    key={match.id}
                  >
                    <div className="match-card-meta">
                      <span className="match-date-label">{formatDate(match.playedAt)}</span>
                      <span className="official-badge"><i /> OFFICIAL</span>
                    </div>
                    <div className="match-card-content">
                      <div className={`match-team ${match.winningTeamNumber === 1 ? 'match-team-winner' : ''}`}>
                        <div className="match-team-names">{teamOne.map((member) => <span key={member.id}>{member.displayName}</span>)}</div>
                        <span className={`match-score ${match.winningTeamNumber === 1 ? 'score-winner' : ''}`}>{match.team1Score}</span>
                      </div>
                      <div className="match-versus">VS</div>
                      <div className={`match-team match-team-right ${match.winningTeamNumber === 2 ? 'match-team-winner' : ''}`}>
                        <span className={`match-score ${match.winningTeamNumber === 2 ? 'score-winner' : ''}`}>{match.team2Score}</span>
                        <div className="match-team-names">{teamTwo.map((member) => <span key={member.id}>{member.displayName}</span>)}</div>
                      </div>
                    </div>
                    <div className="match-card-footer">
                      <span>TEAM {match.winningTeamNumber} VICTORY</span>
                      <span className="match-details-link">Match details <b aria-hidden="true">↗</b></span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
          <footer className="public-footer">RANKUP <span>·</span> PLAY HARD. CLIMB HIGHER.</footer>
        </section>
      </main>
    </div>
  )
}
