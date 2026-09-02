import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ExternalLink, ScanSearch } from 'lucide-react'
import Mascotte from './Mascotte'
import PostAnnotated from './PostAnnotated'

/**
 * Le retour après chaque choix, en deux temps.
 *
 *   1. **le verdict** — le cagou, une phrase, et c'est tout. Qui ne veut pas
 *      lire enchaîne d'ici ;
 *   2. **la correction** — la publication rejouée avec ses points entourés et
 *      numérotés, ce qui était exact, ce qui ne l'était pas.
 *
 * Le second temps ne s'ouvre que si on le demande : le rapport de test
 * signalait autant « trop de texte » que « on ne comprend pas pourquoi ». Les
 * deux se règlent en séparant, pas en raccourcissant.
 *
 * Elle ne se referme pas toute seule : on avance avec « Continuer », par Échap
 * ou en cliquant à côté.
 */
export default function FeedbackModal({
  visible,
  isCorrect,
  post,
  action,
  onDismiss,
  onLearnMore,
}) {
  const [detail, setDetail] = useState(false)

  useEffect(() => {
    if (!visible) return
    const onKey = (e) => e.key === 'Escape' && onDismiss()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [visible, onDismiss])

  // Chaque publication repart de son verdict : le détail ne reste pas ouvert
  // d'une décision à l'autre.
  const [dernier, setDernier] = useState(post?.id ?? null)
  if (dernier !== (post?.id ?? null)) {
    setDernier(post?.id ?? null)
    setDetail(false)
  }

  if (!post || !action) return null

  const learnMoreUrl = isCorrect ? post.learnMoreUrl || post.sourceUrl : post.learnMoreTips
  const aQuoiMontrer = (post.indices?.length ?? 0) > 0 || post.analyseVrai || post.analyseFaux

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
            className={`modal__card${isCorrect ? '' : ' modal__card--wrong'}${
              detail ? ' modal__card--large' : ''
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <Mascotte expression={detail ? 'curieux' : isCorrect ? 'content' : 'inquiet'} />

            <h2 className="modal__title">
              {detail ? 'Ce qu’il fallait voir' : isCorrect ? 'Bon réflexe' : 'À revoir'}
            </h2>

            {!detail && (
              <p className="modal__text">{isCorrect ? post.encouragement : post.warning}</p>
            )}

            {!detail && post.biais && !post.biais.startsWith('Aucun') && (
              <p className="modal__bias">{post.biais}</p>
            )}

            {detail && (
              <div className="correction">
                <PostAnnotated post={post} />

                {/* Les deux colonnes : une fausse information s'appuie presque
                    toujours sur du vrai, et c'est ce qui la rend crédible. */}
                <div className="verdict">
                  {post.analyseVrai && (
                    <div className="verdict__pan verdict__pan--vrai">
                      <p className="verdict__label">Ce qui est exact</p>
                      <p className="verdict__texte">{post.analyseVrai}</p>
                    </div>
                  )}
                  {post.analyseFaux && (
                    <div className="verdict__pan verdict__pan--faux">
                      <p className="verdict__label">Ce qui ne l’est pas</p>
                      <p className="verdict__texte">{post.analyseFaux}</p>
                    </div>
                  )}
                </div>

                {post.explication && <p className="correction__note">{post.explication}</p>}
              </div>
            )}

            <div className="modal__actions">
              <button type="button" onClick={onDismiss} className="button">
                Continuer
                <ArrowRight size={16} strokeWidth={2.2} />
              </button>

              {!detail && aQuoiMontrer && (
                <button
                  type="button"
                  onClick={() => setDetail(true)}
                  className="button button--ghost"
                >
                  <ScanSearch size={16} strokeWidth={2} />
                  {isCorrect ? 'Voir pourquoi' : 'Voir ce qui clochait'}
                </button>
              )}

              {detail && learnMoreUrl && (
                <button
                  type="button"
                  onClick={() => onLearnMore(learnMoreUrl)}
                  className="button button--ghost"
                >
                  <ExternalLink size={15} strokeWidth={2} />
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
