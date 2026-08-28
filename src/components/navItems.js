import { CircleUserRound, Compass, House, Search, Send } from 'lucide-react'

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
 * Chaque entrée porte sa couleur, pour l'état actif seulement (jetons.css).
 */
export const TAB_ITEMS = [
  {
    id: 'home',
    Icon: House,
    label: 'Accueil',
    couleur: 'var(--nav-home)',
    // Remplie à l'état actif, comme la maison d'Instagram.
    pleine: true,
  },
  {
    id: 'feed',
    Icon: Compass,
    label: "Fil d'actualité",
    couleur: 'var(--nav-feed)',
  },
  {
    id: 'chat',
    Icon: Send,
    label: 'Conversations',
    couleur: 'var(--nav-chat)',
  },
  {
    id: 'learn',
    Icon: Search,
    label: 'Comprendre',
    couleur: 'var(--nav-learn)',
  },
  {
    id: 'profil',
    Icon: CircleUserRound,
    label: 'Profil',
    couleur: 'var(--nav-profil)',
  },
]
