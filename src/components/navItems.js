import { CircleUserRound, Compass, House, Search, Send } from 'lucide-react'
import { PATHS } from '../routes'

/**
 * La navigation de l'application, décrite ici et nulle part ailleurs.
 *
 * Une seule barre, en bas, à toutes les tailles d'écran : ce que faisait le
 * téléphone est devenu la règle, y compris sur ordinateur. Il n'y a donc plus
 * de barre horizontale dans l'en-tête, ni de menu déroulant de jeux.
 *
 * Les icônes reprennent le vocabulaire d'Instagram, que le public visé lit sans
 * y penser : la maison, la boussole, l'avion en papier, la loupe, l'avatar. Le
 * site imite un réseau social — sa navigation aussi.
 *
 * Chaque entrée porte son chemin et sa couleur, cette dernière pour l'état
 * actif seulement (jetons.css).
 */
export const TAB_ITEMS = [
  {
    id: 'home',
    path: PATHS.home,
    Icon: House,
    label: 'Accueil',
    color: 'var(--nav-home)',
    // Remplie à l'état actif, comme la maison d'Instagram.
    filled: true,
  },
  {
    id: 'feed',
    path: PATHS.feed,
    Icon: Compass,
    label: "Fil d'actualité",
    color: 'var(--nav-feed)',
  },
  {
    id: 'chat',
    path: PATHS.chats,
    Icon: Send,
    label: 'Conversations',
    color: 'var(--nav-chat)',
  },
  {
    // « Comprendre » et l'annuaire des sources étaient deux rubriques de
    // lecture, à deux endroits, sous deux noms proches. Elles n'en font plus
    // qu'une : « Ressources », avec ses deux sous-onglets.
    id: 'resources',
    path: PATHS.resources,
    Icon: Search,
    label: 'Ressources',
    color: 'var(--nav-learn)',
  },
  {
    id: 'profile',
    path: PATHS.profile,
    Icon: CircleUserRound,
    label: 'Profil',
    color: 'var(--nav-profil)',
  },
]
