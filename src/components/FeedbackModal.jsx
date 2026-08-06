import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CircleCheck, TriangleAlert } from 'lucide-react'

/**
 * Retour après chaque choix, en fenêtre centrée plutôt qu'en bannière.
 *
 * Elle ne se referme pas toute seule : c'est le seul endroit où le joueur
 * apprend pourquoi son choix était bon ou non, et le faire disparaître au
 * bout de quelques secondes revenait à perdre l'explication. On avance avec
 * « Continuer », par la touche Échap ou en cliquant à côté.
 */
export default function FeedbackModal({
  visible,
  isCorrect,
  post,
  action,
  onDismiss,
  onLearnMore,
}) {
  useEffect(() => {
    if (!visible) return
    const onKey = (e) => e.key === 'Escape' && onDismiss()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [visible, onDismiss])

  if (!post || !action) return null

  const learnMoreUrl = isCorrect
    ? post.learnMoreUrl || post.sourceUrl
    : post.learnMoreTips

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="feedback-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="modal"
          onClick={onDismiss}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className={`modal__card${isCorrect ? '' : ' modal__card--wrong'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="modal__badge">
              {isCorrect
                ? <CircleCheck size={30} strokeWidth={2} />
                : <TriangleAlert size={30} strokeWidth={2} />}
            </span>

            <h2 className="modal__title">
              {isCorrect ? 'Bon réflexe' : 'À revoir'}
            </h2>

            <p className="modal__text">
              {isCorrect ? post.encouragement : post.warning}
            </p>

            {!isCorrect && post.biais && !post.biais.startsWith('Aucun') && (
              <p className="modal__bias">{post.biais}</p>
            )}

            <div className="modal__actions">
              <button type="button" onClick={onDismiss} className="button">
                Continuer
              </button>
              {learnMoreUrl && (
                <button
                  type="button"
                  onClick={() => onLearnMore(learnMoreUrl)}
                  className="button button--ghost"
                >
                  En savoir plus
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
