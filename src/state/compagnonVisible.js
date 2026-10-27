import { useSyncExternalStore } from 'react'

const CLE = 'ctrl-info:compagnon-visible'
const abonnes = new Set()

function lire() {
  try {
    return window.localStorage.getItem(CLE) !== 'non'
  } catch {
    return true
  }
}

export function noterCompagnonVisible(visible) {
  try {
    window.localStorage.setItem(CLE, visible ? 'oui' : 'non')
  } catch {
    // Stockage indisponible.
  }
  abonnes.forEach((rappel) => rappel())
}

function abonner(rappel) {
  abonnes.add(rappel)
  return () => abonnes.delete(rappel)
}

export function useCompagnonVisible() {
  return useSyncExternalStore(abonner, lire, () => true)
}
