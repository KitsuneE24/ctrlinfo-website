import { useEffect, useState } from 'react'
import { ArrowRight, ChevronLeft, ExternalLink, ScanSearch } from 'lucide-react'
import CadreCagou from './CadreCagou'
import PostAnnotated, { ListeIndices } from './PostAnnotated'

/** Biais en tampon (magenta), sauf « Aucun… ». */
function Tampon({ biais }) {
  if (!biais || biais.startsWith('Aucun')) return null
  return <span className="tampon">{biais}</span>
}

/** Premier temps : le verdict, sur le panneau du cagou, au-dessus du post. */
function Verdict({ post, isCorrect, aQuoiMontrer, onDismiss, onDetail }) {
  const voirIndices = aQuoiMontrer && !isCorrect
  const biais = post.biais && !post.biais.startsWith('Aucun') ? post.biais : null

  return (
    <div
      className="verdict-cagou anim-apparait"
      onClick={onDismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="verdict-titre"
        className="verdict-cagou__cadre anim-surgit"
        onClick={(event) => event.stopPropagation()}
      >
        <CadreCagou>
          {/* Résultat en filigrane (vert juste, rouge faux) ; le titre le dit déjà. */}
          <span
            aria-hidden="true"
            data-texte={isCorrect ? 'Bon réflexe' : 'Mauvais réflexe'}
            className={
              isCorrect
                ? 'verdict-cagou__resultat verdict-cagou__resultat--juste'
                : 'verdict-cagou__resultat verdict-cagou__resultat--faux'
            }
          />
          {/* Procédé utilisé : magenta. */}
          {biais && <p className="verdict-cagou__procede">{biais}</p>}
          <h2 id="verdict-titre" className="modal__title">
            {isCorrect ? 'Bien vu.' : 'À revoir.'}
          </h2>
          <p className="modal__text">{isCorrect ? post.encouragement : post.warning}</p>

          <div className="verdict-cagou__actions">
            {voirIndices ? (
              <>
                <button type="button" onClick={onDetail} className="bouton bouton--encre bouton--large">
                  <ScanSearch size={16} strokeWidth={2.2} />
                  Voir ce qui clochait
                </button>
                <button type="button" onClick={onDismiss} className="bouton bouton--large">
                  Continuer
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={onDismiss} className="bouton bouton--encre bouton--large">
                  Continuer
                  <ArrowRight size={16} strokeWidth={2.4} />
                </button>
                {aQuoiMontrer && (
                  <button type="button" onClick={onDetail} className="bouton bouton--large">
                    Indices
                  </button>
                )}
              </>
            )}
          </div>
        </CadreCagou>
      </div>
    </div>
  )
}

/** Second temps : « Ce qu'il fallait voir ». */
function Indices({ post, learnMoreUrl, onRetour, onDismiss, onLearnMore }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="indices-titre"
      className="indices anim-monte"
    >
      <span aria-hidden="true" className="indices__halo" />

      <header className="indices__tete">
        <button
          type="button"
          onClick={onRetour}
          aria-label="Retour au verdict"
          className="bouton-rond indices__retour"
        >
          <ChevronLeft size={20} strokeWidth={2.2} />
          <span className="indices__retour-texte">Retour</span>
        </button>
        <Tampon biais={post.biais} />
      </header>

      <div className="indices__corps">
        <div className="papier indices__piece">
          <span className="papier__ruban" />
          <PostAnnotated post={post} liste={false} />
        </div>

        {/* Ordinateur : colonne de droite, qui défile seule si besoin. */}
        <div className="indices__explications">
          <section className="indices__intro">
            <h2 id="indices-titre" className="indices__titre">
              Ce qu'il fallait <em>voir.</em>
            </h2>
            {post.explication && <p className="indices__chapo">{post.explication}</p>}
          </section>

          <ListeIndices post={post} />

          {(post.analyseVrai || post.analyseFaux) && (
            <section className="indices__bilan">
              {post.analyseVrai && (
                <div className="indices__ligne">
                  <p className="indices__marque indices__marque--vrai">Vrai</p>
                  <p className="indices__ligne-texte">{post.analyseVrai}</p>
                </div>
              )}
              {post.analyseFaux && (
                <div className="indices__ligne">
                  <p className="indices__marque indices__marque--faux">Faux</p>
                  <p className="indices__ligne-texte">{post.analyseFaux}</p>
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      <footer className="indices__pied">
        {learnMoreUrl && (
          <button
            type="button"
            onClick={() => onLearnMore(learnMoreUrl)}
            aria-label="En savoir plus"
            className="bouton indices__plus"
          >
            <ExternalLink size={18} strokeWidth={2} />
            <span className="indices__plus-texte">En savoir plus</span>
          </button>
        )}
        <button type="button" onClick={onDismiss} className="bouton bouton--plein indices__continuer">
          Continuer
          <ArrowRight size={18} strokeWidth={2.4} />
        </button>
      </footer>
    </div>
  )
}

/** Retour après chaque choix : verdict, puis indices si demandés. */
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

  if (!visible) return null

  return detail ? (
    <Indices
      post={post}
      learnMoreUrl={learnMoreUrl}
      onRetour={() => setDetail(false)}
      onDismiss={onDismiss}
      onLearnMore={onLearnMore}
    />
  ) : (
    <Verdict
      post={post}
      isCorrect={isCorrect}
      aQuoiMontrer={aQuoiMontrer}
      onDismiss={onDismiss}
      onDetail={() => setDetail(true)}
    />
  )
}
