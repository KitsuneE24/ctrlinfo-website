import { motion, useAnimation } from 'framer-motion'
import { useEffect, useRef } from 'react'

export const POST_DURATION_MS = 15000

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
    <div className="w-full h-[3px] bg-zinc-100">
      <motion.div
        animate={controls}
        style={{
          width: '0%',
          height: '100%',
          background: 'linear-gradient(to right, #3b82f6, #f97316, #ef4444)',
        }}
      />
    </div>
  )
}
