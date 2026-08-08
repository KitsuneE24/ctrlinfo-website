import { useEffect, useRef, useState } from 'react'
import { Timer } from 'lucide-react'

// 30 s : de quoi lire la publication en entier, repérer les signaux et
// décider. En dessous, le chrono pousse à répondre au réflexe — exactement le
// comportement que le jeu cherche à désapprendre.
export const POST_DURATION_MS = 30000

// Les dix dernières secondes passent au rouge. Le chiffre seul ne se remarque
// pas : c'est la couleur qui fait relever les yeux.
const ALERTE_MS = 10000

/**
 * Chrono d'une publication, en chiffres.
 *
 * Une barre qui se remplit se lit du coin de l'œil et ne dit pas combien de
 * temps il reste ; un décompte, si. Il est posé dans l'en-tête de la
 * publication, à côté du compte : on tombe donc dessus en même temps que sur le
 * profil, avant même d'avoir lu le texte.
 *
 * La fin est une date, pas un compte de tours : un onglet mis en veille ou un
 * rendu qui traîne ne décale pas le décompte.
 */
export default function Countdown({ active, onComplete }) {
  const [restant, setRestant] = useState(POST_DURATION_MS)
  // Ce qu'il reste, hors rendu : c'est ce qui permet de reprendre là où l'on
  // s'était arrêté sans relancer l'intervalle à chaque dixième de seconde.
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
