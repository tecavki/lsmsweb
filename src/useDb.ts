import { useSyncExternalStore } from 'react'
import { store } from './store'
import type { VeriTabani } from './types'

export function useDb(): VeriTabani {
  return useSyncExternalStore(
    (cb) => store.abone(cb),
    () => store.tum(),
  )
}
