/**
 * La progression du joueur, dans son navigateur.
 *
 * Elle vivait en base, rattachée à un compte. Il n'y a plus de compte : ce
 * module est ce qui le remplace. Trois choses à savoir avant de s'en servir.
 *
 *   1. **L'état vit hors de React**, comme l'identité avant lui : le fil et
 *      les conversations écrivent dedans au milieu d'une partie, loin de tout
 *      rendu, et l'onglet Profil s'y abonne. C'est le même patron que
 *      `api/client.js` tenait pour la session — abonnés, instantané refait à
 *      chaque écriture — parce que `useSyncExternalStore` le demande.
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
 * Une asymétrie, voulue, entre les deux jeux : une conversation entamée reprend
 * au message près, parce que son fil se suffit à lui-même ; le fil d'actualité
 * reprend au **niveau** atteint, pas à la publication près. Retenir une file de
 * tirage voudrait dire réclamer à l'API chaque publication par son slug au
 * retour du joueur, pour lui resservir un fil qu'il a déjà à moitié vu. Le
 * niveau, les publications traitées et le score suffisent : le niveau se rejoue
 * avec un tirage neuf, forcément inédit puisque les vues en sont écartées.
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
    termine: false,
    // Les slugs des publications déjà traitées : c'est ce qui les écarte des
    // tirages suivants, rôle que le serveur tenait avec `VuePost`.
    vus: [],
    decisions: 0,
    justes: 0,
    points: 0,
    // { « Nom du biais »: { total, justes } } — de quoi dire ce qui piège.
    biais: {},
    parties: 0,
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

/**
 * Un état relu, complété de ce qui lui manque.
 *
 * Deux origines à traiter : un `localStorage` écrit par une version antérieure
 * du site, et un code collé par le joueur. Dans les deux cas on ne fait pas
 * confiance à la forme — un champ absent vaut mieux qu'un écran cassé — mais
 * on ne jette rien de ce qui est utilisable.
 */
function fusionner(recu) {
  const base = vide()
  if (!recu || typeof recu !== 'object') return base

  const fil = recu.fil && typeof recu.fil === 'object' ? recu.fil : {}
  const nombre = (valeur, defaut) => (Number.isFinite(valeur) ? valeur : defaut)

  return {
    version: VERSION,
    pseudo: typeof recu.pseudo === 'string' ? recu.pseudo.slice(0, 40) : '',
    avatar: typeof recu.avatar === 'string' ? recu.avatar : null,
    fil: {
      niveau: Math.min(Math.max(nombre(fil.niveau, 1), 1), 3),
      termine: fil.termine === true,
      vus: Array.isArray(fil.vus) ? fil.vus.filter((slug) => typeof slug === 'string') : [],
      decisions: nombre(fil.decisions, 0),
      justes: nombre(fil.justes, 0),
      points: nombre(fil.points, 0),
      biais: lireBiais(fil.biais),
      parties: nombre(fil.parties, 0),
    },
    conversations: lireConversations(recu.conversations),
  }
}

function lireBiais(recu) {
  if (!recu || typeof recu !== 'object') return {}
  const propre = {}
  for (const [nom, compte] of Object.entries(recu)) {
    if (!compte || typeof compte !== 'object') continue
    const total = Number.isFinite(compte.total) ? compte.total : 0
    const justes = Number.isFinite(compte.justes) ? compte.justes : 0
    if (total > 0) propre[nom] = { total, justes: Math.min(justes, total) }
  }
  return propre
}

function lireConversations(recu) {
  if (!recu || typeof recu !== 'object') return {}
  const propre = {}
  for (const [slug, entree] of Object.entries(recu)) {
    if (!entree || typeof entree !== 'object') continue
    propre[slug] = {
      faite: entree.faite === true,
      score: Number.isFinite(entree.score) ? entree.score : 0,
      total: Number.isFinite(entree.total) ? entree.total : 0,
      encours: entree.encours && typeof entree.encours === 'object' ? entree.encours : null,
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

/**
 * À quel niveau le fil s'ouvre.
 *
 * Le niveau atteint, sauf quand les trois ont été bouclés : on repart alors du
 * premier. L'écran de fin promet qu'on peut revenir refaire l'exercice, et
 * rouvrir éternellement le niveau 3 n'est pas refaire l'exercice. Les
 * publications déjà traitées restant écartées, ce second tour est fait de
 * contenu neuf.
 */
export function niveauDeDepart() {
  return etat.fil.termine ? 1 : etat.fil.niveau
}

// ── Le fil ───────────────────────────────────────────────────────────────────

/**
 * Une décision sur une publication.
 *
 * Les points viennent du contenu lui-même (`post.scores[action]`) : ce sont
 * ceux que le serveur comptait, à la même valeur. Une publication de
 * remédiation ne compte pas — elle s'ajoute à la file pour entraîner, pas
 * pour noter.
 */
export function noterDecision({ slug, biais, juste, points = 0 }) {
  const fil = etat.fil
  const vus = slug && !fil.vus.includes(slug) ? [...fil.vus, slug] : fil.vus

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
      points: fil.points + points,
      biais: biaisSuivant,
    },
  })
}

/** Le niveau atteint ne redescend pas : c'est un acquis, pas une position. */
export function noterNiveau(niveau) {
  if (niveau <= etat.fil.niveau) return
  appliquer({ ...etat, fil: { ...etat.fil, niveau: Math.min(niveau, 3) } })
}

/** Les trois niveaux traités. */
export function finirLeFil() {
  appliquer({
    ...etat,
    fil: { ...etat.fil, niveau: 3, termine: true, parties: etat.fil.parties + 1 },
  })
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
 * on garde la meilleure passe, comme le serveur gardait le meilleur score.
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
  appliquer({ ...etat, pseudo: pseudo.trim().slice(0, 40) })
}

// ── Export et restauration ───────────────────────────────────────────────────

/**
 * Ce que le code de progression transporte.
 *
 * Volontairement moins que ce que garde le navigateur : le fil d'une
 * conversation entamée en reste dehors. Un code sert à emporter son avancement
 * sur un autre appareil, pas à figer une discussion à moitié lue — et c'est ce
 * fil qui pèserait le plus lourd dans la chaîne.
 */
export function exportable() {
  const conversations = {}
  for (const [slug, entree] of Object.entries(etat.conversations)) {
    if (entree.faite) conversations[slug] = { faite: true, score: entree.score, total: entree.total }
  }
  return {
    version: VERSION,
    pseudo: etat.pseudo,
    avatar: etat.avatar,
    fil: etat.fil,
    conversations,
  }
}

/**
 * Remplacer la progression par celle d'un code.
 *
 * Rend `false` si ce qu'on lui donne n'est pas une progression CTRL INFO : le
 * code était lisible, mais il ne parlait pas de ce jeu. L'appelant en fait un
 * message ; ici on ne touche à rien.
 */
export function remplacer(recu) {
  if (!recu || typeof recu !== 'object' || !recu.fil || typeof recu.fil !== 'object') return false
  appliquer(fusionner(recu))
  return true
}

/** Tout effacer. L'onglet Profil demande confirmation avant d'appeler. */
export function reinitialiser() {
  appliquer(vide())
}
