import { useCallback, useEffect, useState } from 'react'

/**
 * Charger le contenu, avec ses trois états.
 *
 * Le contenu ne vient pas du bundle : entre l'affichage de l'écran et
 * l'arrivée des données, il y a un instant où il n'y a rien, et parfois une
 * erreur. Ce hook rend ces deux moments explicites au lieu de les laisser
 * chaque écran réinventer.
 *
 *   const { donnees, chargement, erreur, recharger } = useRessource(getManches, [])
 *
 * `charger` doit être stable — une fonction de module, ou mémoïsée par
 * `useCallback` : c'est elle qui déclenche le rechargement quand elle change.
 *
 * Le retour à l'état « chargement » se fait **pendant le rendu**, pas dans
 * l'effet. C'est le motif recommandé pour un état dérivé d'une entrée qui
 * change : le rendu suivant montre le chargement tout de suite, sans passer
 * par une bascule supplémentaire.
 */
export function useRessource(charger, dependances = []) {
  const [etat, setEtat] = useState({ donnees: null, chargement: true, erreur: null })
  const [compteur, setCompteur] = useState(0)

  const signature = [charger, compteur, ...dependances]
  const [precedente, setPrecedente] = useState(signature)

  if (!memeSignature(precedente, signature)) {
    setPrecedente(signature)
    if (!etat.chargement) setEtat({ donnees: null, chargement: true, erreur: null })
  }

  useEffect(() => {
    let annule = false

    charger()
      .then((donnees) => {
        if (!annule) setEtat({ donnees, chargement: false, erreur: null })
      })
      .catch((erreur) => {
        if (!annule) setEtat({ donnees: null, chargement: false, erreur })
      })

    return () => {
      // L'écran a changé avant la réponse : on laisse tomber celle-ci plutôt
      // que d'écrire dans un composant qui ne s'y intéresse plus.
      annule = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charger, compteur, ...dependances])

  const recharger = useCallback(() => setCompteur((n) => n + 1), [])

  return { ...etat, recharger }
}

function memeSignature(a, b) {
  return a.length === b.length && a.every((valeur, i) => Object.is(valeur, b[i]))
}
