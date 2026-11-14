import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SelectedHubState {
  hubId: string
  setHubId: (hubId: string) => void
}

export const useSelectedHubStore = create<SelectedHubState>()(
  persist(
    (set) => ({
      hubId: '',
      setHubId: (hubId) => set({ hubId }),
    }),
    {
      name: 'selected-queue-hub',
      skipHydration: true,
    },
  ),
)

let hydration: Promise<void> | undefined

export function hydrateSelectedHubStore() {
  hydration ??= Promise.resolve(useSelectedHubStore.persist.rehydrate())
  return hydration
}
