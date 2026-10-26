import { useMemo } from 'react'
import { getJeux } from '../api/contenu'
import { icone } from '../data/icones'
import { useRessource } from '../lib/useRessource'
import { ContexteJeux } from './jeux'

/**
 * Charge les jeux une seule fois, pour toute l'application.
 *
 * C'est ici que le nom d'icône du contenu (« Newspaper ») devient un composant React.
 */
export default function FournisseurJeux({ children }) {
  const { donnees, chargement, erreur, recharger } = useRessource(getJeux, [])

  const valeur = useMemo(() => {
    const jeux = (donnees ?? []).map((jeu) => ({
      ...jeu,
      Icon: icone(jeu.icone),
    }))
    return { jeux, chargement, erreur, recharger }
  }, [donnees, chargement, erreur, recharger])

  return <ContexteJeux.Provider value={valeur}>{children}</ContexteJeux.Provider>
}
