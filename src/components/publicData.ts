import { useEffect, useState } from 'react'
import { hydrateSelectedHubStore, useSelectedHubStore } from '../stores/selectedHubStore'
import { hubService } from '../services/publicDataService'
import type { Hub } from '../services/publicDataService'

export function usePublicHubs() {
  const [hubs, setHubs] = useState<Hub[]>([])
  const hubId = useSelectedHubStore((state) => state.hubId)
  const setHubId = useSelectedHubStore((state) => state.setHubId)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function loadHubs() {
      try {
        await hydrateSelectedHubStore()
        const result = await hubService.getHubs()
        if (!active) return
        setHubs(result)
        const selectedHubId = useSelectedHubStore.getState().hubId
        setHubId(result.some((hub) => hub.id === selectedHubId) ? selectedHubId : result[0]?.id ?? '')
      } catch (cause: unknown) {
        if (active) setError(errorMessage(cause))
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadHubs()
    return () => { active = false }
  }, [setHubId])

  return { hubs, hubId, setHubId, loading, error }
}

export function errorMessage(cause: unknown) {
  return cause instanceof Error ? cause.message : 'Something went wrong while loading RankUp data.'
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function formatWinRate(value: number) {
  return `${Math.round(value * 100)}%`
}

export function youtubeWatchUrl(videoId: string) {
  return /^https?:\/\//i.test(videoId)
    ? videoId
    : `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`
}
