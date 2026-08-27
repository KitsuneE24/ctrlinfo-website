import { createContext, useContext } from 'react'

/**
 * Les jeux, partagés par toute l'application.
 *
 * Quatre endroits en ont besoin — la galerie, la barre du jeu, le menu de
 * l'en-tête, le tutoriel. Ils lisaient tous le même fichier de données ; ils
 * lisent maintenant le même contexte, et ne peuvent donc toujours pas
 * diverger.
 *
 * Le fournisseur qui remplit ce contexte est dans FournisseurJeux.jsx : les
 * crochets et le composant sont séparés pour que le rechargement à chaud de
 * Vite garde son efficacité.
 */
export const ContexteJeux = createContext({
  jeux: [],
  chargement: true,
  erreur: null,
  recharger: () => {},
})

export function useJeux() {
  return useContext(ContexteJeux)
}

/** Un jeu précis, ou `null` tant que la liste n'est pas arrivée. */
export function useJeu(id) {
  const { jeux } = useJeux()
  return jeux.find((jeu) => jeu.id === id) ?? null
}

/** Un autre jeu que celui en cours — proposé à la fin d'une partie. */
export function useAutreJeu(id) {
  const { jeux } = useJeux()
  return jeux.find((jeu) => jeu.id !== id) ?? null
}
