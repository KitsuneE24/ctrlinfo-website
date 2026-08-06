/**
 * Mémoire des conversations en cours, pour la durée de la session.
 *
 * Changer d'onglet démonte l'écran des conversations : sans ce module, on
 * repartirait du premier message à chaque retour. L'état vit donc ici, en
 * dehors de l'arbre React, et les composants s'y raccrochent au montage.
 *
 * C'est volontairement en mémoire seulement : un rechargement de page repart
 * de zéro, ce qui est le comportement demandé.
 */

const sessions = new Map()

// Quelle conversation était ouverte, et le numéro de partie de chacune.
// Le compteur est par conversation : recommencer l'une ne doit pas remettre
// l'autre à zéro.
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
