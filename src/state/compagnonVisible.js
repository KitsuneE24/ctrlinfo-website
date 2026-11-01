import { useSyncExternalStore } from 'react'

const CLE = 'ctrl-info:compagnon-visible'
const abonnes = new Set()

// Par défaut : affiché sur ordinateur, rangé sur téléphone.
const parDefaut = () => window.matchMedia?.('(min-width: 900px)').matches ?? true

function lire() {
  try {
    const choix = window.localStorage.getItem(CLE)
    return choix === null ? parDefaut() : choix !== 'non'
  } catch {
    return parDefaut()
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
