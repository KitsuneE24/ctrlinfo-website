/**
 * Mémoire des conversations en cours, pour la durée de la session.
 *
 * Changer d'onglet démonte l'écran : l'état vit donc ici, hors de l'arbre
 * React, et les composants s'y raccrochent au montage. En mémoire seulement —
 * un rechargement repart de zéro.
 */

const sessions = new Map()

// Quelle conversation était ouverte, et le numéro de partie de chacune. Le
// compteur est par conversation.
let ui = { openId: null, runIds: {} }

export function getInboxState() {
  return ui
}

export function saveInboxState(next) {
  ui = next
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
