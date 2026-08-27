/**
 * La progression du joueur : ses parties, ce qu'il répond, où il en est.
 *
 * Deux points à connaître avant de s'en servir :
 *
 *   1. **Le serveur corrige.** On lui envoie le geste, il renvoie le verdict.
 *      Les écrans affichent leur propre feedback tout de suite — le contenu
 *      porte déjà l'explication — mais c'est la réponse du serveur qui fait
 *      foi et qui est enregistrée.
 *   2. **Rien ne doit casser le jeu.** Un enregistrement qui échoue (API
 *      coupée en pleine partie) ne doit pas bloquer la manche en cours : les
 *      appels d'enregistrement sont donc volontairement « au mieux ».
 */
import { api } from './client'

/** Démarre une partie et rend son identifiant. */
export const demarrerSession = ({ jeu, level, conversationSlug }) =>
  api('/sessions', {
    method: 'POST',
    body: {
      jeu,
      ...(level ? { level } : {}),
      ...(conversationSlug ? { conversationSlug } : {}),
    },
  })

/** La partie qu'on peut reprendre, s'il y en a une. */
export const sessionEnCours = (jeu) =>
  api(`/sessions/en-cours${jeu ? `?jeu=${jeu}` : ''}`)

export const sauvegarder = (sessionId, { etape, score, etat }) =>
  api(`/sessions/${sessionId}`, {
    method: 'PATCH',
    body: {
      ...(etape !== undefined ? { etape } : {}),
      ...(score !== undefined ? { score } : {}),
      ...(etat !== undefined ? { etat } : {}),
    },
  })

export const terminerSession = (sessionId) =>
  api(`/sessions/${sessionId}/terminer`, { method: 'POST' })

export const enregistrerDecision = (sessionId, { postId, action, tempsMs }) =>
  api(`/sessions/${sessionId}/tentatives/post`, {
    method: 'POST',
    body: { postId, action, ...(tempsMs ? { tempsMs } : {}) },
  })

export const enregistrerManche = (sessionId, { mancheSlug, choisis }) =>
  api(`/sessions/${sessionId}/tentatives/manche`, {
    method: 'POST',
    body: { mancheSlug, choisis },
  })

export const enregistrerChoix = (sessionId, choixId) =>
  api(`/sessions/${sessionId}/choix`, { method: 'POST', body: { choixId } })

export const avancerParcours = (slug, etape) =>
  api(`/parcours/${encodeURIComponent(slug)}/avancer`, {
    method: 'POST',
    body: etape === undefined ? {} : { etape },
  })

export const getTableauDeBord = () => api('/moi/tableau-de-bord')

/**
 * Un enregistrement qui n'a pas le droit d'interrompre la partie.
 *
 * On perd la trace de ce coup-là, pas la manche en cours : c'est le bon
 * compromis pour un jeu où le contenu compte plus que le score.
 */
export async function auMieux(promesse) {
  try {
    return await promesse
  } catch (erreur) {
    if (import.meta.env.DEV) console.warn('Enregistrement ignoré :', erreur.message)
    return null
  }
}
