import { createContext, useContext } from 'react'

export const ContexteJeux = createContext({
  jeux: [],
  chargement: true,
  erreur: null,
  recharger: () => {},
})

export function useJeux() {
  return useContext(ContexteJeux)
}

export function useJeu(id) {
  const { jeux } = useJeux()
  return jeux.find((jeu) => jeu.id === id) ?? null
}

export function useAutreJeu(id) {
  const { jeux } = useJeux()
  return jeux.find((jeu) => jeu.id !== id) ?? null
}
