import { Link } from '@tanstack/react-router'
import type { Hub } from '../services/publicDataService'

export default function PublicHeader({
  hubs,
  hubId,
  onHubChange,
}: {
  hubs: Hub[]
  hubId: string
  onHubChange: (hubId: string) => void
}) {
  return (
    <header className="public-header">
      <div className="public-header-inner">
        <Link to="/" className="public-brand" aria-label="RankUp leaderboard">
          <span className="public-brand-mark">R</span>
          <span>rank<span>up</span><small>COMPETITIVE RANKINGS</small></span>
        </Link>
        <nav className="public-nav" aria-label="Main navigation">
          <Link to="/" activeProps={{ className: 'public-nav-link active' }} className="public-nav-link">
            Leaderboard
          </Link>
          <Link to="/matches" activeProps={{ className: 'public-nav-link active' }} className="public-nav-link">
            Matches
          </Link>
        </nav>
        <label className="public-hub-picker">
          <span>HUB</span>
          <select
            aria-label="Select hub"
            value={hubId}
            onChange={(event) => onHubChange(event.target.value)}
            disabled={!hubs.length}
          >
            {hubs.length ? hubs.map((hub) => (
              <option key={hub.id} value={hub.id}>{hub.name}</option>
            )) : <option value="">No hubs available</option>}
          </select>
          <span className="public-select-chevron" aria-hidden="true">⌄</span>
        </label>
      </div>
    </header>
  )
}
