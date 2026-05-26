import { get } from 'idb-keyval'

export const scanStateStorageKey = 'provenant-scan-state'

export async function getPersistedScanStateSize() {
  const value = await get<string>(scanStateStorageKey)
  return new Blob([value ?? '']).size
}
