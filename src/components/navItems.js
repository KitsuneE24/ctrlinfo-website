import { BookOpen, House, Gamepad2 } from 'lucide-react'

/**
 * Les deux navigations de l'application, décrites ici et nulle part ailleurs.
 * Elles portent les trois mêmes destinations — l'accueil, les jeux, les
 * sources — et ne diffèrent que par leur place :
 *
 * - `NAV_ITEMS` — la barre horizontale du haut, sur ordinateur. La souris sait
 *   survoler : l'onglet « Jeux » déplie en plus la liste des jeux, pour en
 *   lancer un sans passer par la galerie.
 * - `TAB_ITEMS` — la barre du bas, sur téléphone. Trois entrées, pas une de
 *   plus : les jeux se choisissent dans la galerie, pas dans la barre. Une
 *   rangée d'icônes qui grandit à chaque jeu ajouté finirait illisible.
 *
 * Les sources n'apparaissent que dans la barre du bas : sur ordinateur, c'est
 * le bouton flottant en bas à droite qui les ouvre.
 *
 * Chaque entrée porte sa couleur, qui ne sert qu'à l'état actif — au repos,
 * toutes les icônes restent grises. Les valeurs sont dans index.css
 * (`--nav-*`).
 */
const ACCUEIL = {
  id: 'home',
  jeu: null,
  Icon: House,
  label: 'Accueil',
  couleur: 'var(--nav-home)',
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

export const NAV_ITEMS = [ACCUEIL, { ...TOUS_LES_JEUX, label: 'Jeux' }]

export const TAB_ITEMS = [ACCUEIL, TOUS_LES_JEUX, SOURCES]