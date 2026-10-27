/**
 * La progression du joueur, dans son navigateur.
 *
 * Il n'y a pas de compte : tout reste sur l'appareil. Trois choses à savoir
 * avant de s'en servir.
 *
 *   1. **L'état vit hors de React** : le fil et les conversations écrivent
 *      dedans au milieu d'une partie, loin de tout rendu, et l'onglet Profil
 *      s'y abonne (`useSyncExternalStore`).
 *   2. **Chaque écriture va dans `localStorage`.** Pas de minuterie, pas de
 *      regroupement : une décision prise est une décision gardée, même si
 *      l'onglet se ferme à la seconde suivante.
 *   3. **Le stockage peut manquer** — navigation privée, cookies bloqués. On
 *      garde alors tout en mémoire : la partie en cours se joue normalement et
 *      c'est au rechargement seulement que le joueur perd son avancement. Le
 *      code d'export reste exportable dans ce cas : c'est même sa raison
 *      d'être.
 *
 * Ce que le module ne fait pas : décider quoi montrer. Il compte, il retient.
 * Les chiffres de l'onglet Profil se déduisent de ce qu'il y a ici.
 *
 * Une conversation reprend au message près ; le fil d'actualité, sans fin,
 * reprend au niveau atteint avec un tirage neuf.
 */
const CLE = 'ctrl-info:progression'

/**
 * La version de la *forme* de l'état — celle que porte le code d'export.
 * À incrémenter le jour où un champ change de sens, pour qu'un ancien code
 * soit reconnu comme tel au lieu d'être mal relu.
 */
export const VERSION = 1

const vide = () => ({
  version: VERSION,
  pseudo: '',
  avatar: null,
  fil: {
    niveau: 1,
    // Les slugs des publications déjà traitées, écartées des tirages suivants.
    vus: [],
    decisions: 0,
    justes: 0,
    points: 0,
    // { « Nom du biais »: { total, justes } } — de quoi dire ce qui piège.
    biais: {},
  },
  // { slug: { faite, score, total, encours } }
  conversations: {},
})

// ── Le stockage ──────────────────────────────────────────────────────────────

function lire() {
  try {
    const brut = window.localStorage.getItem(CLE)
    return brut ? fusionner(JSON.parse(brut)) : vide()
  } catch {
    return vide()
  }
}

function ecrire(etat) {
  try {
    window.localStorage.setItem(CLE, JSON.stringify(etat))
  } catch {
    // Sans stockage, la progression vit le temps de l'onglet. Le site reste
    // jouable, et c'est le code d'export qui devient la seule mémoire.
  }
}

// Valide un état relu (ancien stockage ou code collé).
function fusionner(recu, { depuisCode = false } = {}) {
  const base = vide()
  if (!recu || typeof recu !== 'object') return base

  const fil = recu.fil && typeof recu.fil === 'object' ? recu.fil : {}
  const decisions = entier(fil.decisions, 0, PLAFOND, 0)

  return {
    version: VERSION,
    pseudo: typeof recu.pseudo === 'string' ? nettoyerPseudo(recu.pseudo) : '',
    avatar: typeof recu.avatar === 'string' && IDENTIFIANT.test(recu.avatar) ? recu.avatar : null,
    fil: {
      niveau: entier(fil.niveau, 1, 999, 1),
      vus:
        !depuisCode && Array.isArray(fil.vus)
          ? fil.vus.filter((slug) => typeof slug === 'string' && slug.length <= 100).slice(-5000)
          : [],
      decisions,
      justes: Math.min(entier(fil.justes, 0, PLAFOND, 0), decisions),
      points: entier(fil.points, -PLAFOND, PLAFOND, 0),
      biais: lireBiais(fil.biais),
    },
    conversations: lireConversations(recu.conversations, depuisCode),
  }
}

const PLAFOND = 1_000_000_000
const IDENTIFIANT = /^[a-z0-9-]{1,80}$/
const CLES_INTERDITES = new Set(['__proto__', 'constructor', 'prototype'])
// Caractères de contrôle et invisibles, sauf la jonction des emojis.
const INVISIBLES = /(?!\u200d)[\p{Cc}\p{Cf}]/gu

function entier(valeur, min, max, defaut) {
  return Number.isFinite(valeur) ? Math.min(Math.max(Math.trunc(valeur), min), max) : defaut
}

function nettoyerPseudo(pseudo) {
  return pseudo.replace(INVISIBLES, '').trim().slice(0, 40)
}

function lireBiais(recu) {
  if (!recu || typeof recu !== 'object') return {}
  const propre = {}
  for (const [nom, compte] of Object.entries(recu).slice(0, 100)) {
    if (nom.length > 80 || CLES_INTERDITES.has(nom) || !compte || typeof compte !== 'object') continue
    const total = entier(compte.total, 0, PLAFOND, 0)
    if (total > 0) propre[nom] = { total, justes: Math.min(entier(compte.justes, 0, PLAFOND, 0), total) }
  }
  return propre
}

function lireConversations(recu, depuisCode) {
  if (!recu || typeof recu !== 'object') return {}
  const propre = {}
  for (const [slug, entree] of Object.entries(recu).slice(0, 1000)) {
    if (!IDENTIFIANT.test(slug) || CLES_INTERDITES.has(slug) || !entree || typeof entree !== 'object') continue
    const total = entier(entree.total, 0, 1000, 0)
    const encours = !depuisCode && entree.encours && typeof entree.encours === 'object' ? entree.encours : null
    propre[slug] = {
      faite: entree.faite === true,
      score: Math.min(entier(entree.score, 0, 1000, 0), total),
      total,
      encours,
    }
  }
  return propre
}

// ── L'état, et ceux qui l'écoutent ───────────────────────────────────────────

let etat = lire()

const abonnes = new Set()

/**
 * L'état courant. L'objet change d'identité à chaque écriture : React peut
 * donc s'y abonner sans compteur de version à faire tourner.
 */
export function etatProgression() {
  return etat
}

export function abonner(ecouteur) {
  abonnes.add(ecouteur)
  return () => abonnes.delete(ecouteur)
}

function appliquer(suivant) {
  etat = suivant
  ecrire(etat)
  for (const abonne of abonnes) abonne()
}

/** Les publications déjà traitées. Lu au moment du tirage, hors rendu. */
export function dejaVus() {
  return etat.fil.vus
}

/** Le fil s'ouvre au niveau atteint. */
export function niveauDeDepart() {
  return etat.fil.niveau
}

// ── Le fil ───────────────────────────────────────────────────────────────────

/**
 * Une décision sur une publication.
 *
 * Les points viennent du contenu lui-même (`post.scores[action]`). Une publication de
 * remédiation ne compte pas — elle s'ajoute à la file pour entraîner, pas
 * pour noter.
 */
export function noterDecision({ slug, biais, juste, points = 0 }) {
  const fil = etat.fil
  // La dernière vue passe en fin de liste : les plus anciennes reviennent d'abord.
  const vus = slug ? [...fil.vus.filter((vu) => vu !== slug), slug] : fil.vus

  const compte = fil.biais[biais] ?? { total: 0, justes: 0 }
  const biaisSuivant = biais
    ? { ...fil.biais, [biais]: { total: compte.total + 1, justes: compte.justes + (juste ? 1 : 0) } }
    : fil.biais

  appliquer({
    ...etat,
    fil: {
      ...fil,
      vus,
      decisions: fil.decisions + 1,
      justes: fil.justes + (juste ? 1 : 0),
      points: fil.points + Math.min(Math.max(Number(points) || 0, -POINTS_MAX), POINTS_MAX),
      biais: biaisSuivant,
    },
  })
}

/** Le niveau atteint ne redescend pas : c'est un acquis, pas une position. */
export function noterNiveau(niveau) {
  if (niveau <= etat.fil.niveau) return
  appliquer({ ...etat, fil: { ...etat.fil, niveau } })
}

// ── Les conversations ────────────────────────────────────────────────────────

function poserConversation(slug, modification) {
  const avant = etat.conversations[slug] ?? { faite: false, score: 0, total: 0, encours: null }
  appliquer({
    ...etat,
    conversations: { ...etat.conversations, [slug]: { ...avant, ...modification } },
  })
}

/** Le fil d'une conversation en cours, message par message. */
export function sauverConversation(slug, encours) {
  poserConversation(slug, { encours })
}

/**
 * Une conversation menée à son terme.
 *
 * Le `faite` ne se retire jamais : recommencer une conversation déjà réussie
 * ne l'enlève pas de ce qui a été vu. Seul le score se met à jour, au mieux —
 * on garde la meilleure passe.
 */
export function finirConversation(slug, { score, total }) {
  const avant = etat.conversations[slug]
  poserConversation(slug, {
    faite: true,
    score: Math.max(score, avant?.score ?? 0),
    total,
    encours: null,
  })
}

/** « Recommencer » : la partie en cours est jetée, l'acquis reste. */
export function oublierConversation(slug) {
  if (!etat.conversations[slug]?.encours) return
  poserConversation(slug, { encours: null })
}

// ── Le profil ────────────────────────────────────────────────────────────────

export function noterAvatar(avatarId) {
  appliquer({ ...etat, avatar: avatarId ?? null })
}

export function noterPseudo(pseudo) {
  appliquer({ ...etat, pseudo: nettoyerPseudo(pseudo) })
}

// Sans les publications vues, pour garder un code court.
export function exportable(conversationsEnLigne = []) {
  const enLigne = new Set(conversationsEnLigne)
  const conversations = {}
  for (const [slug, entree] of Object.entries(etat.conversations)) {
    if (entree.faite && enLigne.has(slug)) {
      conversations[slug] = { faite: true, score: entree.score, total: entree.total }
    }
  }
  const fil = { ...etat.fil }
  delete fil.vus
  return { version: VERSION, pseudo: etat.pseudo, avatar: etat.avatar, fil, conversations }
}

export const POINTS_MAX = 100

export function incoherence(recu) {
  const fil = recu?.fil
  if (!fil || typeof fil !== 'object') return null
  const n = (valeur) => (Number.isFinite(valeur) ? valeur : 0)
  const decisions = n(fil.decisions)
  const justes = n(fil.justes)

  if (justes > decisions) return 'il compte plus de bonnes réponses que de décisions'
  // Un niveau ne se passe qu'en finissant un lot, donc avec au moins une décision.
  if (n(fil.niveau) - 1 > decisions) return 'son niveau est trop élevé pour le nombre de décisions'
  if (Math.abs(n(fil.points)) > decisions * POINTS_MAX) {
    return 'il compte plus de points que ses décisions ne peuvent en rapporter'
  }

  const comptes = Object.values(fil.biais && typeof fil.biais === 'object' ? fil.biais : {}).filter(
    (compte) => compte && typeof compte === 'object'
  )
  const totalBiais = comptes.reduce((somme, compte) => somme + n(compte.total), 0)
  const justesBiais = comptes.reduce((somme, compte) => somme + n(compte.justes), 0)
  if (comptes.some((compte) => n(compte.justes) > n(compte.total)) || totalBiais > decisions || justesBiais > justes) {
    return 'ses biais ne correspondent pas à ses décisions'
  }
  return null
}

export function remplacer(recu) {
  if (!recu || typeof recu !== 'object' || !recu.fil || typeof recu.fil !== 'object') return false
  if (incoherence(recu)) return false
  const suivant = fusionner(recu, { depuisCode: true })
  appliquer({ ...suivant, fil: { ...suivant.fil, vus: etat.fil.vus } })
  return true
}

/** Tout effacer. L'onglet Profil demande confirmation avant d'appeler. */
export function reinitialiser() {
  appliquer(vide())
}
