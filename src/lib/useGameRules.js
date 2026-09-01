import { useCallback, useEffect, useState } from 'react'
import { auMieux, getReglesVues, marquerReglesVues } from '../api/progression'
import { useCompte } from '../state/compte'

/**
 * Faut-il ouvrir les règles d'un jeu de lui-même ?
 *
 * Sans compte, oui à chaque partie : rien n'est retenu, et c'est justement ce
 * qu'on annonce au joueur. Avec un compte, seulement la première fois — le
 * serveur s'en souvient (`/moi/regles`), donc d'un appareil à l'autre aussi.
 *
 * `pret` dit si la réponse est arrivée. Le seuil d'un jeu l'attend plutôt que
 * de trancher sans savoir : un tutoriel qui s'ouvre après coup, par-dessus une
 * partie déjà commencée, serait pire que tardif.
 */
export function useGameRules(gameId) {
  const { connecte } = useCompte()
  const [vues, setVues] = useState(null)
  const [dernierEtat, setDernierEtat] = useState(connecte)

  // Ajusté pendant le rendu : changer d'identité remet la mémoire à zéro.
  if (dernierEtat !== connecte) {
    setDernierEtat(connecte)
    setVues(null)
  }

  useEffect(() => {
    if (!connecte) return

    let annule = false
    auMieux(getReglesVues()).then((reponse) => {
      if (!annule) setVues(new Set(reponse?.vues ?? []))
    })
    return () => {
      annule = true
    }
  }, [connecte])

  const pret = !connecte || vues !== null
  const aAfficher = connecte ? pret && !vues.has(gameId) : true

  const marquerLues = useCallback(() => {
    if (!connecte || !gameId || vues?.has(gameId)) return
    setVues((actuelles) => new Set(actuelles ?? []).add(gameId))
    auMieux(marquerReglesVues(gameId))
  }, [connecte, gameId, vues])

  return { aAfficher: Boolean(gameId) && aAfficher, pret, marquerLues }
}
