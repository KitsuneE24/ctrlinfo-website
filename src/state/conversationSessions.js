import {
  etatProgression,
  oublierConversation,
  sauverConversation,
} from './progression'

/**
 * Mémoire des conversations en cours.
 *
 * Changer d'écran démonte le fil : l'état vit donc hors de l'arbre React, et
 * les composants s'y raccrochent au montage. C'était une `Map` de module, donc
 * une mémoire qui mourait avec l'onglet ; c'est maintenant le magasin de
 * progression, donc `localStorage`. Un rechargement en pleine discussion
 * reprend au message près.
 *
 * La clé est le slug de la conversation, et non le numéro de partie : sans
 * cela, chaque « Recommencer » laisserait derrière lui une partie abandonnée
 * que plus rien ne viendrait relire. Le numéro de partie continue de vivre en
 * mémoire — il ne sert qu'à remonter le composant, et n'a aucune raison de
 * survivre au rechargement.
 *
 * Ce que la mémoire ne garde pas, c'est *quelle* conversation était ouverte :
 * cela se lit dans l'adresse (`/conversations/:slug`), qui survit au
 * rechargement et se partage.
 */

// Le numéro de partie de chaque conversation, incrémenté par « Recommencer ».
let runIds = {}

export function getRunIds() {
  return runIds
}

export function saveRunIds(next) {
  runIds = next
}

export function getSession(slug) {
  return etatProgression().conversations[slug]?.encours ?? null
}

export function saveSession(slug, state) {
  sauverConversation(slug, state)
}

/** Repartir de zéro : « Recommencer » jette la partie, pas l'acquis. */
export function clearSession(slug) {
  oublierConversation(slug)
}
