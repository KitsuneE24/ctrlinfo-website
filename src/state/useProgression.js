import { useSyncExternalStore } from 'react'
import { abonner, etatProgression } from './progression'

export function useProgression() {
  return useSyncExternalStore(abonner, etatProgression)
}
