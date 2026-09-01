/**
 * Les préférences d'affichage, gardées dans `localStorage` et posées sur
 * `<html>` en attribut : le CSS les lit, aucun composant n'a à les porter.
 */
const CLE = 'ctrl-info:preferences'

const DEFAUTS = { tabLabels: 'auto' }

function lire() {
  try {
    return { ...DEFAUTS, ...JSON.parse(window.localStorage.getItem(CLE) ?? '{}') }
  } catch {
    return { ...DEFAUTS }
  }
}

let preferences = lire()
const abonnes = new Set()

function appliquer() {
  document.documentElement.dataset.tabLabels = preferences.tabLabels
}

export function getPreferences() {
  return preferences
}

export function setPreference(cle, valeur) {
  preferences = { ...preferences, [cle]: valeur }
  try {
    window.localStorage.setItem(CLE, JSON.stringify(preferences))
  } catch {
    // Sans stockage, le réglage vaut pour la session.
  }
  appliquer()
  for (const abonne of abonnes) abonne()
}

export function subscribePreferences(abonne) {
  abonnes.add(abonne)
  return () => abonnes.delete(abonne)
}

appliquer()
