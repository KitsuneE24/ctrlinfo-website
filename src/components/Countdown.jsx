import { useEffect, useRef, useState } from 'react'
import { Timer } from 'lucide-react'

// Le dernier tiers passe au rouge, quelle que soit la durée du niveau.
const PART_ALERTE = 1 / 3

/**
 * Chrono d'une publication, en chiffres.
 *
 * Sa durée vient du niveau (`GET /posts/niveaux`) : elle n'est plus écrite
 * ici. Au premier niveau il n'y en a pas du tout — c'est le Feed qui décide de
 * ne pas afficher le décompte.
 *
 * La fin est une date et non un compte de tours : un onglet mis en veille ne
 * décale pas le décompte.
 */
export default function Countdown({ active, secondes: duree, onComplete }) {
  const totalMs = duree * 1000
  const [restant, setRestant] = useState(totalMs)
  // Ce qu'il reste, hors rendu : permet de reprendre là où l'on s'était
  // arrêté sans relancer l'intervalle à chaque dixième de seconde.
  const restantRef = useRef(totalMs)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (!active) return undefined

    const fin = Date.now() + restantRef.current
    const id = setInterval(() => {
      const reste = Math.max(0, fin - Date.now())
      restantRef.current = reste
      setRestant(reste)
      if (reste === 0) {
        clearInterval(id)
        onCompleteRef.current()
      }
    }, 100)

    return () => clearInterval(id)
  }, [active])

  const secondes = Math.ceil(restant / 1000)
  const urgent = restant <= totalMs * PART_ALERTE

  return (
    <span
      role="timer"
      aria-label={`${secondes} secondes pour décider`}
      className={`countdown${urgent ? ' countdown--urgent' : ''}`}
    >
      <Timer size={14} strokeWidth={2.2} />
      <span className="countdown__value">{secondes}</span>
      <span className="countdown__unit">s</span>
    </span>
  )
}
