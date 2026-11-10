import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import PublicHeader from '../components/PublicHeader'
import {
  errorMessage,
  formatDate,
  usePublicHubs,
  youtubeWatchUrl,
} from '../components/publicData'
import { matchService, type Match } from '../services/publicDataService'

export const Route = createFileRoute('/matches_/$matchId')({
  component: MatchDetailsPage,
})

function MatchDetailsPage() {
  const { matchId } = Route.useParams()
  const { hubs, hubId, setHubId, loading: hubsLoading } = usePublicHubs()
  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    matchService.getMatchById(matchId)
      .then((result) => { if (active) setMatch(result) })
      .catch((cause: unknown) => { if (active) setError(errorMessage(cause)) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [matchId])

  const hub = hubs.find((item) => item.id === match?.hubId)
  const teamOne = match?.members.filter((member) => member.teamNumber === 1) ?? []
  const teamTwo = match?.members.filter((member) => member.teamNumber === 2) ?? []

  return (
    <div className="public-app">
      <PublicHeader hubs={hubs} hubId={hubId} onHubChange={setHubId} />
      <main className="public-main match-detail-main">
        <Link to="/matches" className="back-to-matches">← <span>All matches</span></Link>
        {hubsLoading || loading ? (
          <div className="public-state" role="status"><span className="public-spinner" /> Loading match…</div>
        ) : error ? (
          <div className="public-state public-error" role="alert"><strong>Couldn’t load this match</strong><p>{error}</p></div>
        ) : !match ? (
          <div className="public-state"><strong>Match not found</strong><p>This match may no longer be publicly available.</p></div>
        ) : (
          <>
            <section className="detail-intro">
              <div className="public-eyebrow"><span /> OFFICIAL MATCH</div>
              <h1>Match report</h1>
              <p>{hub?.name ?? 'RankUp'} <span>·</span> {formatDate(match.playedAt)}</p>
            </section>
            <section className="match-scoreboard" aria-label="Match score">
              {[1, 2].map((teamNumber) => {
                const team = teamNumber === 1 ? teamOne : teamTwo
                const score = teamNumber === 1 ? match.team1Score : match.team2Score
                const winner = match.winningTeamNumber === teamNumber
                return (
                  <article className={`scoreboard-team ${winner ? 'scoreboard-winner' : ''}`} key={teamNumber}>
                    <span className="public-kicker">TEAM 0{teamNumber}{winner ? ' · WINNER' : ''}</span>
                    <strong className="scoreboard-score">{score}</strong>
                    <div className="scoreboard-members">
                      {team.map((member) => <span key={member.id}>{member.displayName}</span>)}
                    </div>
                  </article>
                )
              })}
            </section>
            <section className="public-content rating-content">
              <div className="public-section-heading">
                <div><span className="public-kicker">PLAYER PERFORMANCE</span><h2>Rating changes</h2></div>
                <span className="official-badge"><i /> COMPLETED</span>
              </div>
              <div className="rating-list">
                {match.members.map((member) => (
                  <div className="rating-row" key={member.id}>
                    <div className="rating-player">
                      <span className={`public-player-avatar avatar-${member.teamNumber}`}>{member.displayName.slice(0, 1).toUpperCase()}</span>
                      <div><strong>{member.displayName}</strong><small>Team {member.teamNumber} · {member.mmrBefore.toLocaleString()} MMR</small></div>
                    </div>
                    <span className={`rating-change ${member.mmrChange > 0 ? 'rating-positive' : 'rating-negative'}`}>
                      {member.mmrChange > 0 ? '+' : ''}{member.mmrChange.toLocaleString()}
                    </span>
                    <span className="rating-after">{member.mmrAfter.toLocaleString()} <small>MMR</small></span>
                  </div>
                ))}
              </div>
              {match.youtubeVideoId && (
                <a className="watch-match-button" href={youtubeWatchUrl(match.youtubeVideoId)} target="_blank" rel="noreferrer">
                  <span aria-hidden="true">▶</span> Watch match on YouTube <span aria-hidden="true">↗</span>
                </a>
              )}
            </section>
            <footer className="public-footer">RANKUP <span>·</span> PLAY HARD. CLIMB HIGHER.</footer>
          </>
        )}
      </main>
    </div>
  )
}
