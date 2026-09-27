/**
 * Le lien avec l'API.
 *
 * Tout le contenu du jeu vient de ctrlinfo-app : il n'y a plus une seule
 * publication écrite dans ce dépôt. Ce module concentre les deux choses qui en
 * découlent — l'adresse de l'API, et ce qu'on fait quand elle ne répond pas.
 *
 * Il portait une troisième chose, la plus grosse : l'identité du joueur, ses
 * jetons, leur renouvellement, le mode invité. Plus rien de tout cela. Il n'y a
 * ni compte ni e-mail, donc aucun en-tête d'autorisation à joindre : toutes les
 * routes appelées ici sont publiques, et la progression du joueur vit dans son
 * navigateur (`state/progression.js`).
 *
 * Ce qui a disparu côté serveur n'a pas disparu du serveur : les routes de
 * comptes et de progression existent toujours dans ctrlinfo-app. Elles ne sont
 * simplement plus appelées.
 */

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

/** Une erreur d'API, avec le statut : les écrans en ont besoin pour choisir. */
export class ErreurApi extends Error {
  constructor(message, statut) {
    super(message)
    this.name = 'ErreurApi'
    this.statut = statut
  }
}

/** Un appel à l'API. */
export async function api(chemin, { method = 'GET', body, signal } = {}) {
  const reponse = await fetch(BASE + chemin, {
    method,
    signal,
    headers: body ? { 'content-type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })

  const texte = await reponse.text()
  let charge
  try {
    // Une réponse vide (204) est légitime ; du texte non-JSON aussi, quand
    // c'est un proxy qui répond à la place de l'API.
    charge = texte ? JSON.parse(texte) : null
  } catch {
    charge = texte
  }

  if (!reponse.ok) {
    const message =
      (charge && (Array.isArray(charge.message) ? charge.message[0] : charge.message)) ||
      `L'API a répondu ${reponse.status}`
    throw new ErreurApi(message, reponse.status)
  }

  return charge
}
