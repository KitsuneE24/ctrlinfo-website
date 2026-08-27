import { BookOpen, House, Gamepad2, Lightbulb } from 'lucide-react'

/**
 * Les deux navigations de l'application, décrites ici et nulle part ailleurs.
 *
 * - `NAV_ITEMS` — la barre du haut, sur ordinateur. L'onglet « Jeux » y déplie
 *   en plus la liste des jeux (voir TopNav).
 * - `TAB_ITEMS` — la barre du bas, sur téléphone. Quatre entrées : les jeux se
 *   choisissent dans la galerie, pas dans la barre.
 *
 * Les sources ne sont que dans la barre du bas ; sur ordinateur, c'est le
 * bouton flottant qui les ouvre.
 *
 * Chaque entrée porte sa couleur, pour l'état actif seulement (jetons.css).
 */
const ACCUEIL = {
  id: 'home',
  jeu: null,
  Icon: House,
  label: 'Accueil',
  couleur: 'var(--nav-home)',
}

const COMPRENDRE = {
  id: 'learn',
  jeu: null,
  Icon: Lightbulb,
  label: 'Comprendre',
  couleur: 'var(--nav-learn)',
}

const TOUS_LES_JEUX = {
  id: 'game',
  jeu: null,
  Icon: Gamepad2,
  label: 'Tous les jeux',
  couleur: 'var(--nav-game)',
}

const SOURCES = {
  id: 'sources',
  jeu: null,
  Icon: BookOpen,
  label: 'Sources',
  couleur: 'var(--nav-sources)',
}

export const NAV_ITEMS = [ACCUEIL, COMPRENDRE, { ...TOUS_LES_JEUX, label: 'Jeux' }]

export const TAB_ITEMS = [ACCUEIL, COMPRENDRE, TOUS_LES_JEUX, SOURCES]