import { useEffect, useState } from 'react'
import { hydrateSelectedHubStore, useSelectedHubStore } from '../stores/selectedHubStore'
import { hubService } from '../services/publicDataService'
import type { Hub } from '../services/publicDataService'

let cachedHubs: Hub[] | undefined
let hubsRequest: Promise<Hub[]> | undefined

function loadPublicHubs() {
  if (cachedHubs !== undefined) return Promise.resolve(cachedHubs)
  if (!hubsRequest) {
    hubsRequest = hydrateSelectedHubStore()
      .then(() => hubService.getHubs())
      .then((result) => {
        cachedHubs = result
        return result
      })
      .finally(() => { hubsRequest = undefined })
  }
  return hubsRequest
}

export function usePublicHubs() {
  const [hubs, setHubs] = useState<Hub[]>(() => cachedHubs ?? [])
  const hubId = useSelectedHubStore((state) => state.hubId)
  const setHubId = useSelectedHubStore((state) => state.setHubId)
  const [loading, setLoading] = useState(() => cachedHubs === undefined)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const result = await loadPublicHubs()
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

    void load()
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
