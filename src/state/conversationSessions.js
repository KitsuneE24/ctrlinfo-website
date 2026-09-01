/**
 * Mémoire des conversations en cours, pour la durée de la session.
 *
 * Changer d'écran démonte le fil : l'état vit donc ici, hors de l'arbre React,
 * et les composants s'y raccrochent au montage. En mémoire seulement — un
 * rechargement repart de zéro.
 *
 * Ce que la mémoire ne garde plus, c'est *quelle* conversation était ouverte :
 * cela se lit maintenant dans l'adresse (`/conversations/:slug`), qui survit
 * au rechargement et se partage.
 */

const sessions = new Map()

// Le numéro de partie de chaque conversation, incrémenté par « Recommencer ».
let runIds = {}

export function getRunIds() {
  return runIds
}

export function saveRunIds(next) {
  runIds = next
}

export function getSession(key) {
  return sessions.get(key) ?? null
}

export function saveSession(key, state) {
  sessions.set(key, state)
}

/** Repartir de zéro : « Recommencer » crée une nouvelle partie. */
export function clearSession(key) {
  sessions.delete(key)
}
