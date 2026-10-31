import { useEffect, useState } from 'react'
import {
  ArrowRight,
  ChevronLeft,
  CircleCheck,
  ExternalLink,
  ScanSearch,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react'
import CadreCagou from './CadreCagou'
import PostAnnotated, { ListeIndices } from './PostAnnotated'
import { lienWeb } from '../lib/lienWeb'

const jour = (iso) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

// Exigée par la licence de l'article repris.
function Licence({ post }) {
  const url = lienWeb(post.licence?.url)
  if (!url) return null
  return (
    <p className="indices__licence">
      Titre de l’article de {post.article?.auteur}, {post.article?.editeur}, repris tel quel
      {post.recolteLe ? ` le ${jour(post.recolteLe)}` : ''} sous licence{' '}
      <a href={url} target="_blank" rel="noopener noreferrer">
        {post.licence.nom}
      </a>
      .
    </p>
  )
}

const majuscule = (texte) => texte.charAt(0).toUpperCase() + texte.slice(1)
const domaine = (url) => new URL(url).hostname.replace(/^www\./, '')

// Lien vers l'info dont parle le post ; null si l'événement est inventé.
function lienDe(post) {
  if (post.lienInfo && lienWeb(post.lienInfo.url)) return post.lienInfo
  if (post.isFake) return null
  const url = lienWeb(post.sourceUrl) ?? lienWeb(post.learnMoreUrl)
  return url ? { titre: 'La source de cette info', nom: domaine(url), url } : null
}

function LienInfo({ post, compact = false }) {
  const lien = lienDe(post)

  if (compact) {
    return (
      <p className="lien-info lien-info--compact">
        {(!lien || lien.invente) && 'Événement inventé : aucun article n’en parle. '}
        {lien && (
          <>
            {lien.titre}&nbsp;:{' '}
            <a href={lien.url} target="_blank" rel="noopener noreferrer" className="lien-info__lien">
              {majuscule(lien.nom).split(' ').slice(0, -1).join(' ')}{' '}
              <span className="lien-info__fin">
                {majuscule(lien.nom).split(' ').at(-1)}
                <ExternalLink size={13} strokeWidth={2} aria-hidden="true" />
              </span>
              <span className="pour-lecteur"> (nouvel onglet)</span>
            </a>
          </>
        )}
      </p>
    )
  }

  return (
    <section className="lien-info">
      {(!lien || lien.invente) && (
        <>
          <p className="lien-info__titre">D’où vient l’info&nbsp;?</p>
          <p className="lien-info__texte">Événement inventé pour l’exercice&nbsp;: aucun article n’en parle.</p>
        </>
      )}
      {lien && (
        <>
          <p className="lien-info__titre">{lien.titre}</p>
          <a href={lien.url} target="_blank" rel="noopener noreferrer" className="lien-info__lien">
            {majuscule(lien.nom)} ({domaine(lien.url)})
            <ExternalLink size={15} strokeWidth={2} aria-hidden="true" />
            <span className="pour-lecteur"> (nouvel onglet)</span>
          </a>
        </>
      )}
    </section>
  )
}

function Tampon({ biais }) {
  if (!biais || biais.startsWith('Aucun')) return null
  return <span className="tampon">{biais}</span>
}

function Consequence({ post, action }) {
  const texte = post.consequences?.[action]
  if (!texte) return null
  const alerte = post.isFake && action !== 'report'
  const Icone = alerte ? TriangleAlert : post.isFake ? ShieldCheck : CircleCheck
  return (
    <p className={`verdict-cagou__consequence verdict-cagou__consequence--${alerte ? 'alerte' : 'calme'}`}>
      <Icone size={18} strokeWidth={2.2} aria-hidden="true" />
      {texte}
    </p>
  )
}

function Verdict({ post, action, isCorrect, aQuoiMontrer, onDismiss, onDetail }) {
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
          <span
            aria-hidden="true"
            data-texte={isCorrect ? 'Bon réflexe' : 'Mauvais réflexe'}
            className={
              isCorrect
                ? 'verdict-cagou__resultat verdict-cagou__resultat--juste'
                : 'verdict-cagou__resultat verdict-cagou__resultat--faux'
            }
          />
          {biais && <p className="verdict-cagou__procede">{biais}</p>}
          <h2 id="verdict-titre" className="modal__title">
            {isCorrect ? 'Bien vu.' : 'À revoir.'}
          </h2>
          <p className="modal__text">{isCorrect ? post.encouragement : post.warning}</p>
          <Consequence post={post} action={action} />
          <LienInfo post={post} compact />

          <div className="verdict-cagou__actions">
            {voirIndices ? (
              <>
                <button type="button" onClick={onDetail} className="bouton bouton--encre bouton--large">
                  <ScanSearch size={16} strokeWidth={2.2} />
                  Voir les indices
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

function Indices({ post, onRetour, onDismiss }) {
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

          <LienInfo post={post} />
          <Licence post={post} />
        </div>
      </div>

      <footer className="indices__pied">
        <button type="button" onClick={onDismiss} className="bouton bouton--plein indices__continuer">
          Continuer
          <ArrowRight size={18} strokeWidth={2.4} />
        </button>
      </footer>
    </div>
  )
}

export default function FeedbackModal({
  visible,
  isCorrect,
  post,
  action,
  onDismiss,
}) {
  const [detail, setDetail] = useState(false)

  useEffect(() => {
    if (!visible) return
    const onKey = (e) => e.key === 'Escape' && onDismiss()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [visible, onDismiss])

  const [dernier, setDernier] = useState(post?.id ?? null)
  if (dernier !== (post?.id ?? null)) {
    setDernier(post?.id ?? null)
    setDetail(false)
  }

  if (!post || !action) return null

  const aQuoiMontrer = (post.indices?.length ?? 0) > 0 || post.analyseVrai || post.analyseFaux

  if (!visible) return null

  return detail ? (
    <Indices
      post={post}
      onRetour={() => setDetail(false)}
      onDismiss={onDismiss}
    />
  ) : (
    <Verdict
      post={post}
      action={action}
      isCorrect={isCorrect}
      aQuoiMontrer={aQuoiMontrer}
      onDismiss={onDismiss}
      onDetail={() => setDetail(true)}
    />
  )
}
