import { BookOpen, CircleUserRound, House, Newspaper, Send } from 'lucide-react'
import { PATHS } from '../routes'

// `ordreBureau` : ordre dans la pilule de l'en-tête (sans le profil).
export const TAB_ITEMS = [
  {
    id: 'home',
    path: PATHS.home,
    Icon: House,
    label: 'Accueil',
    ordreBureau: 1,
  },
  {
    id: 'chat',
    path: PATHS.chats,
    Icon: Send,
    label: 'Messages',
    ordreBureau: 3,
  },
  {
    id: 'feed',
    path: PATHS.feed,
    Icon: Newspaper,
    label: "Fil d'actualité",
    ordreBureau: 2,
  },
  {
    id: 'resources',
    path: PATHS.resources,
    Icon: BookOpen,
    label: 'Ressources',
    ordreBureau: 4,
  },
  {
    id: 'profile',
    path: PATHS.profile,
    Icon: CircleUserRound,
    label: 'Profil',
  },
]

export const NAV_BUREAU = TAB_ITEMS.filter((item) => item.ordreBureau).sort(
  (a, b) => a.ordreBureau - b.ordreBureau
)
