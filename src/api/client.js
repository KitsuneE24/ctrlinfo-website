/**
 * Le lien avec l'API.
 *
 * Tout le contenu du jeu vient désormais de ctrlinfo-app : il n'y a plus une
 * seule publication écrite dans ce dépôt. Ce module concentre les trois choses
 * qui en découlent — l'adresse de l'API, l'identité du joueur, et ce qu'on
 * fait quand ça ne répond pas.
 *
 * L'identité : personne n'a besoin de créer un compte pour jouer. Au premier
 * appel, le front demande une session invitée et la range dans `localStorage`.
 * Cette session est un vrai compte côté base — la progression est enregistrée,
 * et « créer un compte » plus tard ne fait que lui ajouter une adresse et un
 * mot de passe, sans rien perdre.
 */

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
const CLE = 'ctrl-info:session'

/** Une erreur d'API, avec le statut : les écrans en ont besoin pour choisir. */
export class ErreurApi extends Error {
  constructor(message, statut) {
    super(message)
    this.name = 'ErreurApi'
    this.statut = statut
  }
}

function lireSession() {
  try {
    const brut = window.localStorage.getItem(CLE)
    return brut ? JSON.parse(brut) : null
  } catch {
    // Navigation privée ou stockage bloqué : on jouera sans mémoire longue.
    return null
  }
}

function ecrireSession(session) {
  memoire = session
  try {
    if (session) window.localStorage.setItem(CLE, JSON.stringify(session))
    else window.localStorage.removeItem(CLE)
  } catch {
    // Sans stockage, la session vit le temps de l'onglet. Le jeu reste jouable.
  }
}

let memoire = lireSession()
// La demande d'identité en cours. Sans ce garde-fou, cinq écrans qui montent
// en même temps créeraient cinq invités.
let identiteEnCours = null

async function envoyer(chemin, { method = 'GET', body, jeton, signal } = {}) {
  const reponse = await fetch(BASE + chemin, {
    method,
    signal,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(jeton ? { authorization: `Bearer ${jeton}` } : {}),
    },
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

/** Crée une session invitée. */
async function ouvrirInvite() {
  const identite = await envoyer('/auth/invite', { method: 'POST', body: {} })
  ecrireSession(identite)
  return identite
}

/** Échange le jeton de rafraîchissement ; retombe sur un invité si besoin. */
async function rafraichir() {
  if (!memoire?.refreshToken) return ouvrirInvite()
  try {
    const identite = await envoyer('/auth/rafraichir', {
      method: 'POST',
      body: { refreshToken: memoire.refreshToken },
    })
    ecrireSession(identite)
    return identite
  } catch {
    // Jeton révoqué ou expiré : on repart sur une session neuve plutôt que de
    // laisser le joueur devant un écran mort.
    return ouvrirInvite()
  }
}

/** L'identité courante, en en créant une au besoin. */
export function identite() {
  if (memoire?.accessToken) return Promise.resolve(memoire)
  if (!identiteEnCours) {
    identiteEnCours = ouvrirInvite().finally(() => {
      identiteEnCours = null
    })
  }
  return identiteEnCours
}

export function sessionCourante() {
  return memoire
}

/**
 * Un appel à l'API.
 *
 * `authentifie: false` sert aux routes de contenu : elles répondent sans
 * jeton. On en joint quand même un si on en a — c'est ce qui permet au tirage
 * de publications d'éviter celles que ce joueur a déjà vues.
 */
export async function api(chemin, { authentifie = true, ...options } = {}) {
  let session = memoire
  if (authentifie && !session?.accessToken) session = await identite()

  try {
    return await envoyer(chemin, { ...options, jeton: session?.accessToken })
  } catch (erreur) {
    if (erreur.statut !== 401) throw erreur
    // Jeton d'accès périmé : on le renouvelle et on rejoue une fois.
    const renouvelee = await rafraichir()
    return envoyer(chemin, { ...options, jeton: renouvelee.accessToken })
  }
}

// ── Comptes ──────────────────────────────────────────────────────────────────

export async function inscription({ email, motDePasse, pseudo }) {
  const identiteCreee = await envoyer('/auth/inscription', {
    method: 'POST',
    body: { email, motDePasse, pseudo },
  })
  ecrireSession(identiteCreee)
  return identiteCreee
}

export async function connexion({ email, motDePasse }) {
  const identiteCreee = await envoyer('/auth/connexion', {
    method: 'POST',
    body: { email, motDePasse },
  })
  ecrireSession(identiteCreee)
  return identiteCreee
}

/** Garder la progression d'une session invitée en lui donnant un compte. */
export async function convertir({ email, motDePasse, pseudo }) {
  const identiteCreee = await api('/auth/convertir', {
    method: 'POST',
    body: { email, motDePasse, ...(pseudo ? { pseudo } : {}) },
  })
  ecrireSession(identiteCreee)
  return identiteCreee
}

export async function deconnexion() {
  const jeton = memoire?.refreshToken
  ecrireSession(null)
  if (jeton) {
    try {
      await envoyer('/auth/deconnexion', { method: 'POST', body: { refreshToken: jeton } })
    } catch {
      // Le jeton finira par expirer de lui-même.
    }
  }
}
