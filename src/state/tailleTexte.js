import { useSyncExternalStore } from 'react'

const CLE = 'ctrl-info:taille-texte'
export const ECHELLE_MIN = 0.9
export const ECHELLE_MAX = 1.5
export const ECHELLE_PAS = 0.1
const abonnes = new Set()

function borner(valeur) {
  const arrondi = Math.round(valeur * 10) / 10
  return Math.min(ECHELLE_MAX, Math.max(ECHELLE_MIN, arrondi))
}

function lire() {
  try {
    const choix = window.localStorage.getItem(CLE)
    const valeur = Number.parseFloat(choix)
    return Number.isFinite(valeur) ? borner(valeur) : 1
  } catch {
    return 1
  }
}

export function appliquerTailleTexte(echelle = lire()) {
  const racine = document.documentElement
  if (echelle === 1) racine.style.removeProperty('--echelle-texte')
  else racine.style.setProperty('--echelle-texte', String(echelle))
}

export function noterTailleTexte(valeur) {
  const echelle = borner(valeur)
  try {
    window.localStorage.setItem(CLE, String(echelle))
  } catch {
    // Stockage indisponible : le réglage vaut pour cette visite.
  }
  appliquerTailleTexte(echelle)
  abonnes.forEach((rappel) => rappel())
}

function abonner(rappel) {
  abonnes.add(rappel)
  return () => abonnes.delete(rappel)
}

export function useTailleTexte() {
  return useSyncExternalStore(abonner, lire, () => 1)
}
