/**
 * Les adresses du site, décrites ici et nulle part ailleurs.
 *
 * Jusqu'ici la navigation était un état React : un seul nom d'onglet, gardé en
 * mémoire. Rien n'était partageable, un rechargement ramenait à l'accueil, et
 * le bouton « précédent » du navigateur quittait le site. Chaque écran a
 * maintenant son adresse.
 *
 * Les chemins restent en français : ce n'est pas du code, c'est ce que le
 * visiteur lit dans sa barre d'adresse.
 */

export const PATHS = {
  home: '/',
  feed: '/fil',
  chats: '/conversations',
  resources: '/ressources',
  verify: '/ressources/verifier',
  profile: '/profil',
}

export const chatPath = (slug) => `${PATHS.chats}/${encodeURIComponent(slug)}`

export const chapterPath = (slug) =>
  `${PATHS.resources}/comprendre/${encodeURIComponent(slug)}`

/**
 * Le chemin d'un jeu depuis son identifiant en base (`feed`, `chat`).
 *
 * L'API décrit les jeux, le front décide où ils vivent : c'est la seule
 * traduction entre les deux, et elle tient en deux lignes.
 */
export const GAME_PATHS = {
  feed: PATHS.feed,
  chat: PATHS.chats,
}

/**
 * Le titre de l'onglet du navigateur, du chemin le plus précis au plus large.
 * L'ordre compte : `/ressources/verifier` doit être trouvé avant `/ressources`.
 */
const TITLES = [
  [PATHS.verify, 'Où vérifier une information'],
  [`${PATHS.resources}/comprendre`, 'Comprendre'],
  [PATHS.resources, 'Ressources'],
  [PATHS.chats, 'Les conversations'],
  [PATHS.feed, "Le fil d'actualité"],
  [PATHS.profile, 'Ton profil'],
]

/** Ce qui s'affiche dans l'onglet du navigateur pour un chemin donné. */
export function pageTitle(path) {
  const found = TITLES.find(([prefix]) => path.startsWith(prefix))
  return found ? `${found[1]} — CTRL INFO` : 'CTRL INFO'
}
