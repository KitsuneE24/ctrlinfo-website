/** Les adresses du site. Les chemins restent en français : ils sont lus. */

export const PATHS = {
  home: '/',
  feed: '/fil',
  chats: '/conversations',
  resources: '/ressources',
  profile: '/profil',
  legal: '/mentions-legales',
}

export const chatPath = (slug) => `${PATHS.chats}/${encodeURIComponent(slug)}`

export const chapterPath = (slug) =>
  `${PATHS.resources}/comprendre/${encodeURIComponent(slug)}`

/** Identifiant de jeu du contenu (`feed`, `chat`) vers son écran. */
export const GAME_PATHS = {
  feed: PATHS.feed,
  chat: PATHS.chats,
}

// Du chemin le plus précis au plus large : l'ordre décide du titre trouvé.
const TITLES = [
  [`${PATHS.resources}/comprendre`, 'Ressources'],
  [PATHS.resources, 'Ressources'],
  [PATHS.chats, 'Messages'],
  [PATHS.feed, "Le fil d'actualité"],
  [PATHS.profile, 'Profil'],
  [PATHS.legal, 'Mentions légales'],
]

export function pageTitle(path) {
  const found = TITLES.find(([prefix]) => path.startsWith(prefix))
  return found ? `${found[1]} — CTRL INFO` : 'CTRL INFO'
}
