import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { CheckCircle, AlertTriangle, X } from 'lucide-react'

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

  const touchStartY = useRef(null)

  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => dismissRef.current(), AUTO_DISMISS_MS)
    return () => clearTimeout(t)
  }, [visible])

  function handleTouchStart(e) {
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e) {
    if (touchStartY.current === null) return
    const deltaY = touchStartY.current - e.changedTouches[0].clientY
    touchStartY.current = null
    if (deltaY > 50) onDismiss()
  }

  if (!post || !action) return null

  const scoreDelta = post.scores[action]
  const followersDelta = scoreDelta * 2
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
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ top: NAVBAR_HEIGHT }}
          className="absolute left-0 right-0 z-50"
          onClick={onDismiss}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={`relative bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-lg overflow-hidden ${
              isCorrect ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-orange-500'
            }`}
          >
            {/* Close button */}
            <button
              onClick={(e) => { e.stopPropagation(); onDismiss() }}
              className="absolute top-2 right-2 text-gray-300 hover:text-gray-500 transition z-10"
            >
              <X size={14} />
            </button>

            <div className="p-3 flex items-start gap-2.5">
              <div className="shrink-0 w-9 h-9 flex items-center justify-center">
                {isCorrect
                  ? <CheckCircle size={26} className="text-green-500" strokeWidth={2} />
                  : <AlertTriangle size={26} className="text-orange-500" strokeWidth={2} />
                }
              </div>

              <div className="flex-1 min-w-0 pr-5">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-gray-900">Alert NC</span>
                  <span className="text-[10px] text-gray-400">il y a 1s</span>
                </div>

                <p className="text-xs text-gray-700 leading-snug line-clamp-2">
                  {isCorrect ? post.encouragement : post.warning}
                  {isCorrect && (
                    <span className="font-bold text-green-600">
                      {' '}+{followersDelta} abonnés
                    </span>
                  )}
                </p>

                {!isCorrect && post.biais && !post.biais.startsWith('Aucun') && (
                  <span className="inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 bg-orange-100 text-orange-800">
                    {post.biais}
                  </span>
                )}

                {learnMoreUrl && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onLearnMore(learnMoreUrl) }}
                    className="block mt-1 text-xs text-blue-500 font-medium"
                  >
                    En savoir plus →
                  </button>
                )}
              </div>

              <img
                src={post.image}
                alt=""
                className="shrink-0 w-12 h-12 object-cover"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
