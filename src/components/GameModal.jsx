import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import Game from './Game'

const PHONE_W = 430
const PHONE_H = 760

export default function GameModal({ onClose }) {
  // Close on Escape (clicking outside is intentionally disabled for the game).
  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      {/* Close button — clicking outside the phone does NOT close the game. */}
      <button
        onClick={onClose}
        aria-label="Fermer"
        title="Fermer"
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(255,255,255,0.15)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 110,
        }}
      >
        <X size={22} />
      </button>

      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 24 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        style={{
          // Phone shell: matches the phone aspect ratio and never exceeds the
          // viewport, so the whole post is visible.
          position: 'relative',
          width: `min(${PHONE_W}px, calc(95vh * ${PHONE_W} / ${PHONE_H}))`,
          height: `min(${PHONE_H}px, 95vh)`,
          background: '#1a1a1a',
          border: '7px solid #1a1a1a',
          borderRadius: 44,
          boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
        }}
      >
        {/* Notch */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 110,
            height: 9,
            background: '#1a1a1a',
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            zIndex: 10,
          }}
        />
        {/* Screen */}
        <div style={{ width: '100%', height: '100%', borderRadius: 30, overflow: 'hidden' }}>
          <Game />
        </div>
      </motion.div>
    </motion.div>
  )
}
