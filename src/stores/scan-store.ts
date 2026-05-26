import { del, get, set as setIndexedDbValue } from 'idb-keyval'
import { create } from 'zustand'
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from 'zustand/middleware'

import type { ScanResult } from '@/api/types'
import { scanStateStorageKey } from '@/helpers/persisted-scan-state'

const indexedDbStorage: StateStorage = {
  getItem: async (name) => (await get<string>(name)) ?? null,
  setItem: async (name, value) => {
    await setIndexedDbValue(name, value)
  },
  removeItem: async (name) => {
    await del(name)
  },
}

type ScanStore = {
  jobId?: string
  repositoryRef: string
  repositoryUrl: string
  scanResult?: ScanResult
  acceptJob: (jobId: string) => void
  setRepositoryRef: (repositoryRef: string) => void
  setRepositoryUrl: (repositoryUrl: string) => void
  setScanResult: (scanResult: ScanResult) => void
  clearScan: () => void
}

export const useScanStore = create<ScanStore>()(
  persist(
    (set) => ({
      jobId: undefined,
      repositoryRef: 'main',
      repositoryUrl: '',
      scanResult: undefined,
      acceptJob: (jobId) => set({ jobId, scanResult: undefined }),
      setRepositoryRef: (repositoryRef) => set({ repositoryRef }),
      setRepositoryUrl: (repositoryUrl) => set({ repositoryUrl }),
      setScanResult: (scanResult) => set({ scanResult }),
      clearScan: () => set({ jobId: undefined, scanResult: undefined }),
    }),
    {
      name: scanStateStorageKey,
      storage: createJSONStorage(() => indexedDbStorage),
      partialize: ({ jobId, repositoryRef, repositoryUrl, scanResult }) => ({
        jobId,
        repositoryRef,
        repositoryUrl,
        scanResult,
      }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.error('Could not restore persisted scan state', error)
        }
      },
    },
  ),
)
