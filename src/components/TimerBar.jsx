import { motion, useAnimation } from 'framer-motion'
import { useEffect, useRef } from 'react'

// 30 s : de quoi lire la publication en entier, repérer les signaux et
// décider. En dessous, le chrono pousse à répondre au réflexe — exactement le
// comportement que le jeu cherche à désapprendre.
export const POST_DURATION_MS = 30000

export default function TimerBar({ active, onComplete }) {
  const controls = useAnimation()
  const cancelledRef = useRef(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  // Start animation on mount (key prop on parent handles reset by remounting)
  useEffect(() => {
    cancelledRef.current = false
    controls.set({ width: '0%' })
    controls
      .start({
        width: '100%',
        transition: { duration: POST_DURATION_MS / 1000, ease: 'linear' },
      })
      .then(() => {
        if (!cancelledRef.current) onCompleteRef.current()
      })
    return () => {
      cancelledRef.current = true
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Pause when active becomes false
  useEffect(() => {
    if (!active) {
      cancelledRef.current = true
      controls.stop()
    }
  }, [active, controls])

  return (
    <div className="timer">
      <motion.div className="timer__bar" animate={controls} style={{ width: '0%' }} />
    </div>
  )
}
