import { useCallback, useEffect, useState } from 'react'

// `charger` doit être stable (fonction de module ou useCallback).
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
