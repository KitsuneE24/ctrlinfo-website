import { useEffect, useRef, useState } from 'react'
import { auMieux, demarrerSession } from '../api/progression'
import { clearCurrentSession, setCurrentSession } from '../state/currentSession'

/**
 * Ouvre une partie côté serveur et rend son identifiant.
 *
 * C'est ce qui remplace les scores oubliés au rechargement : chaque partie
 * existe en base, et tout ce que le joueur y répond s'y rattache.
 *
 * Le point délicat est le double montage de React en développement : l'effet
 * part, il est nettoyé, il repart. Deux pièges s'y cachent, et le second est
 * moins connu que le premier :
 *
 *   1. sans garde, on ouvrirait **deux** parties pour une seule ;
 *   2. avec un garde qui coupe court au second passage, la seule promesse
 *      encore en vol appartient au passage déjà nettoyé — son résultat serait
 *      jeté, et `sessionId` resterait nul pour toujours.
 *
 * D'où la promesse gardée dans une référence : elle n'est lancée qu'une fois,
 * mais chaque passage s'y rebranche. La demande passe par `auMieux` : si l'API
 * refuse, `sessionId` reste nul et le jeu se joue sans être enregistré.
 */
export function useSessionJeu({ jeu, level, conversationSlug, actif = true }) {
  const [sessionId, setSessionId] = useState(null)
  const demande = useRef(null)

  useEffect(() => {
    if (!actif) return

    demande.current ??= auMieux(demarrerSession({ jeu, level, conversationSlug }))

    let annule = false
    demande.current.then((session) => {
      if (!annule && session) {
        setSessionId(session.id)
        setCurrentSession(session.id)
      }
    })

    return () => {
      annule = true
      demande.current?.then((session) => session && clearCurrentSession(session.id))
    }
  }, [jeu, level, conversationSlug, actif])

  return sessionId
}
