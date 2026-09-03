import { createContext, useContext } from 'react'

/**
 * L'identité du joueur, partagée par toute l'application.
 *
 * Trois états possibles, et c'est tout le vocabulaire de l'onglet Profil :
 *
 *   - `connecte`  — un compte, une progression enregistrée ;
 *   - `invite`    — le joueur a choisi de jouer sans compte. Rien n'est gardé ;
 *   - ni l'un ni l'autre — il n'a pas encore choisi, l'onglet Profil lui pose
 *     la question.
 *
 * Le fournisseur qui remplit ce contexte est dans FournisseurCompte.jsx : les
 * crochets et le composant sont séparés pour que le rechargement à chaud de
 * Vite garde son efficacité.
 */
export const ContexteCompte = createContext({
  utilisateur: null,
  connecte: false,
  invite: false,
  connexion: async () => {},
  inscription: async () => {},
  deconnexion: async () => {},
  continuerEnInvite: () => {},
})

export function useCompte() {
  return useContext(ContexteCompte)
}
