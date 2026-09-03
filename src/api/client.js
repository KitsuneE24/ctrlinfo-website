/**
 * Le lien avec l'API.
 *
 * Tout le contenu du jeu vient de ctrlinfo-app : il n'y a plus une seule
 * publication écrite dans ce dépôt. Ce module concentre les trois choses qui en
 * découlent — l'adresse de l'API, l'identité du joueur, et ce qu'on fait quand
 * ça ne répond pas.
 *
 * **L'identité.** Il n'y a que deux états, et c'est tout le sujet de l'onglet
 * Profil :
 *
 *   - *connecté* — un compte, un jeton, et la progression enregistrée ;
 *   - *invité* — aucun jeton, aucun compte en base. Tout se joue normalement,
 *     mais rien n'est gardé : les routes de progression ne sont même pas
 *     appelées. C'est la contrepartie annoncée du mode invité.
 *
 * Le contenu, lui, se lit dans les deux cas : les routes de contenu répondent
 * sans jeton.
 */

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
const CLE = 'ctrl-info:session'
const CLE_INVITE = 'ctrl-info:invite'

/** Une erreur d'API, avec le statut : les écrans en ont besoin pour choisir. */
export class ErreurApi extends Error {
  constructor(message, statut) {
    super(message)
    this.name = 'ErreurApi'
    this.statut = statut
  }
}

function lire(cle) {
  try {
    const brut = window.localStorage.getItem(cle)
    return brut ? JSON.parse(brut) : null
  } catch {
    // Navigation privée ou stockage bloqué : la session vit le temps de
    // l'onglet, le site reste utilisable.
    return null
  }
}

function ecrire(cle, valeur) {
  try {
    if (valeur === null) window.localStorage.removeItem(cle)
    else window.localStorage.setItem(cle, JSON.stringify(valeur))
  } catch {
    // Sans stockage, on garde tout en mémoire. Rien de plus à faire.
  }
}

let memoire = lire(CLE)
let modeInvite = lire(CLE_INVITE) === true

// Les écrans qui affichent l'identité (l'onglet Profil, l'en-tête) se
// rebranchent ici : une connexion faite dans un coin se voit partout.
const abonnes = new Set()

/**
 * La photographie de l'identité, refaite à chaque changement.
 *
 * L'objet change d'identité en même temps que son contenu : React peut donc
 * s'y abonner directement, sans compteur de version à faire tourner.
 */
let instantane = calculer()

function calculer() {
  return {
    utilisateur: memoire?.utilisateur ?? null,
    connecte: Boolean(memoire?.accessToken),
    invite: modeInvite && !memoire?.accessToken,
  }
}

function prevenir() {
  instantane = calculer()
  for (const abonne of abonnes) abonne()
}

function ecrireSession(session) {
  memoire = session
  ecrire(CLE, session)
  // Se connecter, c'est sortir du mode invité.
  if (session) definirModeInvite(false)
  else prevenir()
}

function definirModeInvite(valeur) {
  modeInvite = valeur
  ecrire(CLE_INVITE, valeur ? true : null)
  prevenir()
}

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

/** Échange le jeton de rafraîchissement. Sans lui, on redevient invité. */
async function rafraichir() {
  if (!memoire?.refreshToken) throw new ErreurApi('Connexion requise.', 401)
  try {
    const identite = await envoyer('/auth/rafraichir', {
      method: 'POST',
      body: { refreshToken: memoire.refreshToken },
    })
    ecrireSession(identite)
    return identite
  } catch (erreur) {
    // Jeton révoqué ou expiré : la session est morte, on repasse en invité
    // plutôt que de laisser le joueur devant un écran bloqué.
    ecrireSession(null)
    throw erreur
  }
}

// ── État de session, pour les écrans ─────────────────────────────────────────

export function sessionCourante() {
  return memoire
}

/** L'identité courante — `{ utilisateur, connecte, invite }`, jamais nulle. */
export function etatCompte() {
  return instantane
}

export function estConnecte() {
  return instantane.connecte
}

/** Le joueur a explicitement choisi de jouer sans compte. */
export function continuerEnInvite() {
  definirModeInvite(true)
}

/** S'abonner aux changements d'identité. Rend la fonction de désabonnement. */
export function abonner(ecouteur) {
  abonnes.add(ecouteur)
  return () => abonnes.delete(ecouteur)
}

// ── Appels ───────────────────────────────────────────────────────────────────

/**
 * Un appel à l'API.
 *
 * `authentifie: false` sert aux routes de contenu : elles répondent sans
 * jeton. On en joint quand même un si on en a — c'est ce qui permet au tirage
 * de publications d'éviter celles que ce joueur a déjà vues.
 *
 * Sur une route authentifiée sans session, on échoue tout de suite : en mode
 * invité, il n'y a rien à enregistrer et rien à demander au serveur.
 */
export async function api(chemin, { authentifie = true, ...options } = {}) {
  if (authentifie && !estConnecte()) {
    throw new ErreurApi('Connexion requise.', 401)
  }

  try {
    return await envoyer(chemin, { ...options, jeton: memoire?.accessToken })
  } catch (erreur) {
    if (erreur.statut !== 401 || !memoire?.refreshToken) throw erreur
    // Jeton d'accès périmé : on le renouvelle et on rejoue une fois.
    const renouvelee = await rafraichir()
    return envoyer(chemin, { ...options, jeton: renouvelee.accessToken })
  }
}

// ── Comptes ──────────────────────────────────────────────────────────────────

export async function inscription({ email, motDePasse, pseudo }) {
  const identite = await envoyer('/auth/inscription', {
    method: 'POST',
    body: { email, motDePasse, pseudo },
  })
  ecrireSession(identite)
  return identite
}

export async function connexion({ email, motDePasse }) {
  const identite = await envoyer('/auth/connexion', {
    method: 'POST',
    body: { email, motDePasse },
  })
  ecrireSession(identite)
  return identite
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
