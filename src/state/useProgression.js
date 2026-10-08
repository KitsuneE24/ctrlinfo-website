import { useSyncExternalStore } from 'react'
import { abonner, etatProgression } from './progression'

/**
 * La progression, branchée sur React.
 *
 * Pas de fournisseur ni de contexte, contrairement à l'identité qu'elle
 * remplace : le magasin est un singleton de module, et les composants qui
 * écrivent (le fil, une conversation, l'avatar) appellent ses fonctions
 * directement. Un contexte n'aurait rien apporté de plus qu'un étage d'arbre à
 * traverser.
 *
 * L'instantané change d'identité à chaque écriture, donc un onglet Profil
 * ouvert se remet à jour tout seul quand la partie avance dans un autre écran.
 */
export function useProgression() {
  return useSyncExternalStore(abonner, etatProgression)
}
