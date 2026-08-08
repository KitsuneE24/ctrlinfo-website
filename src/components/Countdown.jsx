import { useEffect, useRef, useState } from 'react'
import { Timer } from 'lucide-react'

// 30 s pour lire la publication, repérer les signaux et décider.
const POST_DURATION_MS = 30000

// Les dix dernières secondes passent au rouge.
const ALERTE_MS = 10000

/**
 * Chrono d'une publication, en chiffres.
 *
 * La fin est une date et non un compte de tours : un onglet mis en veille ne
 * décale pas le décompte.
 */
export default function Countdown({ active, onComplete }) {
  const [restant, setRestant] = useState(POST_DURATION_MS)
  // Ce qu'il reste, hors rendu : permet de reprendre là où l'on s'était
  // arrêté sans relancer l'intervalle à chaque dixième de seconde.
  const restantRef = useRef(POST_DURATION_MS)
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
  const urgent = restant <= ALERTE_MS

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
