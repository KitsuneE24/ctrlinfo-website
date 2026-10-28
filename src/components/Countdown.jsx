import { useEffect, useRef, useState } from 'react'

const PART_ALERTE = 1 / 3
const RAYON = 19
const TOUR = 2 * Math.PI * RAYON

export default function Countdown({ active, secondes: duree, onComplete }) {
  const totalMs = duree * 1000
  const [restant, setRestant] = useState(totalMs)
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
  const part = totalMs > 0 ? restant / totalMs : 0

  return (
    <span
      role="timer"
      aria-label={`${secondes} secondes pour décider`}
      className={`countdown${urgent ? ' countdown--urgent' : ''}`}
    >
      <svg viewBox="0 0 44 44" aria-hidden="true" className="countdown__anneau">
        <circle cx="22" cy="22" r={RAYON} className="countdown__piste" />
        <circle
          cx="22"
          cy="22"
          r={RAYON}
          className="countdown__reste"
          strokeDasharray={TOUR}
          strokeDashoffset={TOUR * (1 - part)}
          transform="rotate(-90 22 22)"
        />
      </svg>
      <span className="countdown__chiffre">
        <span className="countdown__value">{secondes}</span>
        <span className="countdown__unit">secondes</span>
      </span>
    </span>
  )
}
