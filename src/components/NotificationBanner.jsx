import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'

// Must match the Navbar's rendered height
const NAVBAR_HEIGHT = 80

const AUTO_DISMISS_MS = 5000

export default function NotificationBanner({
  visible,
  isCorrect,
  post,
  action,
  onDismiss,
  onLearnMore,
}) {
  const dismissRef = useRef(onDismiss)
  dismissRef.current = onDismiss

  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => dismissRef.current(), AUTO_DISMISS_MS)
    return () => clearTimeout(t)
  }, [visible])

  if (!post || !action) return null

  const scoreDelta = post.scores[action]
  const learnMoreUrl = isCorrect
    ? post.learnMoreUrl || post.sourceUrl
    : post.learnMoreTips

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="notification-banner"
          initial={{ y: -120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -120, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          style={{ top: NAVBAR_HEIGHT }}
          className="fixed left-0 right-0 z-50 px-4"
        >
          <div
            className={`max-w-sm mx-auto rounded-2xl shadow-xl overflow-hidden border-2 ${
              isCorrect
                ? 'bg-green-50 border-green-400'
                : 'bg-orange-50 border-orange-400'
            }`}
          >
            <div className="p-4 flex flex-col gap-2.5">
              {/* Header row: icon + message + score */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <span className="text-xl shrink-0 mt-0.5">
                    {isCorrect ? '✅' : '⚠️'}
                  </span>
                  <p
                    className={`text-sm font-bold leading-snug ${
                      isCorrect ? 'text-green-800' : 'text-orange-800'
                    }`}
                  >
                    {isCorrect ? post.encouragement : post.warning}
                  </p>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                    scoreDelta >= 0
                      ? 'bg-green-200 text-green-800'
                      : 'bg-red-200 text-red-800'
                  }`}
                >
                  {scoreDelta >= 0 ? '+' : ''}
                  {scoreDelta} pts
                </span>
              </div>

              {/* Bias badge (incorrect only) */}
              {!isCorrect && post.biais && !post.biais.startsWith('Aucun') && (
                <span className="self-start text-[11px] font-semibold px-2.5 py-1 rounded-full bg-orange-200 text-orange-900">
                  {post.biais}
                </span>
              )}

              {/* Explanation */}
              <p className="text-xs text-zinc-600 leading-relaxed">
                {isCorrect ? post.consequences[action] : post.explication}
              </p>

              {/* Learn more */}
              {learnMoreUrl && (
                <button
                  onClick={() => onLearnMore(learnMoreUrl)}
                  className={`self-start text-xs font-semibold underline underline-offset-2 active:opacity-60 transition-opacity ${
                    isCorrect ? 'text-green-700' : 'text-orange-700'
                  }`}
                >
                  En savoir plus →
                </button>
              )}
            </div>

            {/* Auto-dismiss progress bar */}
            <div className="w-full h-0.5 bg-zinc-200">
              <motion.div
                key={visible ? 'running' : 'idle'}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: AUTO_DISMISS_MS / 1000, ease: 'linear' }}
                className={isCorrect ? 'bg-green-400 h-full' : 'bg-orange-400 h-full'}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
