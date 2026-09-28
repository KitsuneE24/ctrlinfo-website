import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ExternalLink, ScanSearch } from 'lucide-react'
import CadreCagou from './CadreCagou'
import Mascotte from './Mascotte'
import PostAnnotated, { ListeIndices } from './PostAnnotated'

function Actions({ detail, isCorrect, aQuoiMontrer, learnMoreUrl, onDismiss, onDetail, onLearnMore }) {
  return (
    <div className="modal__actions">
      <button type="button" onClick={onDismiss} className="button">
        Continuer
        <ArrowRight size={16} strokeWidth={2.2} />
      </button>

      {!detail && aQuoiMontrer && (
        <button type="button" onClick={onDetail} className="button button--ghost">
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
  )
}

/**
 * Le retour après chaque choix, en deux temps : le verdict, puis la correction
 * si on la demande. Elle ne se referme pas toute seule.
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

  // Chaque publication repart de son verdict.
  const [dernier, setDernier] = useState(post?.id ?? null)
  if (dernier !== (post?.id ?? null)) {
    setDernier(post?.id ?? null)
    setDetail(false)
  }

  if (!post || !action) return null

  const learnMoreUrl = isCorrect ? post.learnMoreUrl || post.sourceUrl : post.learnMoreTips
  const aQuoiMontrer = (post.indices?.length ?? 0) > 0 || post.analyseVrai || post.analyseFaux

  const actions = (
    <Actions
      detail={detail}
      isCorrect={isCorrect}
      aQuoiMontrer={aQuoiMontrer}
      learnMoreUrl={learnMoreUrl}
      onDismiss={onDismiss}
      onDetail={() => setDetail(true)}
      onLearnMore={onLearnMore}
    />
  )

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
            className={
              detail
                ? `modal__card modal__card--large${isCorrect ? '' : ' modal__card--wrong'}`
                : 'modal__cadre'
            }
            onClick={(e) => e.stopPropagation()}
          >
            {detail ? (
              <>
                <Mascotte expression="curieux" />
                <h2 className="modal__title">Ce qu’il fallait voir</h2>

                <div className="correction">
                  <PostAnnotated post={post} liste={false} />

                  <div className="correction__lecture">
                    <ListeIndices post={post} />

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

                    {post.explication && (
                      <p className="correction__note">{post.explication}</p>
                    )}
                  </div>
                </div>

                {actions}
              </>
            ) : (
              <CadreCagou>
                <h2 className="modal__title">
                  {isCorrect ? 'Bon réflexe' : 'À revoir'}
                </h2>
                <p className="modal__text">
                  {isCorrect ? post.encouragement : post.warning}
                </p>
                {post.biais && !post.biais.startsWith('Aucun') && (
                  <p className="modal__bias">{post.biais}</p>
                )}
                {actions}
              </CadreCagou>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
