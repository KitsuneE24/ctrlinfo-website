import { useEffect } from 'react'
import { motion, useDragControls } from 'framer-motion'
import { brand } from '../styles/colors'

export default function Modal({ title, onClose, children }) {
  const dragControls = useDragControls()

  // Close on Escape
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        zIndex: 100,
      }}
    >
      <motion.div
        onClick={e => e.stopPropagation()}
        drag
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        dragElastic={0}
        initial={{ scale: 0.85, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 24 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        style={{
          width: '100%',
          maxWidth: 520,
          maxHeight: '88vh',
          background: brand.cream,
          color: '#1a1430',
          borderRadius: 18,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
        }}
      >
        {/* Header (drag handle) */}
        <div
          onPointerDown={e => dragControls.start(e)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            background: 'rgba(24,0,173,0.06)',
            cursor: 'grab',
            touchAction: 'none',
            userSelect: 'none',
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20 }}>{title}</h2>
          <button
            onClick={onClose}
            onPointerDown={e => e.stopPropagation()}
            aria-label="Fermer"
            style={{
              border: 'none',
              background: 'transparent',
              color: '#1a1430',
              fontSize: 22,
              cursor: 'pointer',
              lineHeight: 1,
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div
          className="no-scrollbar"
          style={{
            padding: 20,
            overflowY: 'auto',
            fontFamily: 'system-ui, sans-serif',
            fontWeight: 400,
            fontSize: 15,
            lineHeight: 1.6,
          }}
        >
          {children}
        </div>
      </motion.div>
    </motion.div>
  )
}
