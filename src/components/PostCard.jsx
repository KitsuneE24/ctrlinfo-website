import { useState } from 'react'
import { Heart, Send, Flag } from 'lucide-react'
import { texteSur } from '../lib/contraste'

function ActionIcon({ label, onClick, disabled, active, modifier, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={`post__action${active ? ` ${modifier} post__action--pop` : ''}`}
    >
      {children}
    </button>
  )
}

export default function PostCard({
  post,
  isActive,
  onAction,
  disabled,
  selectedAction = null,
}) {
  const initial = post.source[0]?.toUpperCase() || '?'
  const liked = selectedAction === 'share'
  const reported = selectedAction === 'report'
  // Image retirée par le média : on la masque.
  const [imageCassee, setImageCassee] = useState(null)
  const image = post.image !== imageCassee ? post.image : null

  return (
    <article className={`post${isActive ? '' : ' post--past'}`}>
      <header className="post__header">
        <span className="post__avatar-anneau">
          <span className="post__avatar" style={{ backgroundColor: post.sourceColor, color: texteSur(post.sourceColor) }}>
            {initial}
          </span>
        </span>
        <div className="post__identity">
          <p className="post__account">{post.source}</p>
          <p className="post__domain">{post.domain || 'compte non identifié'}</p>
        </div>
        {post.sponsorise && <span className="post__sponso">Sponsorisé</span>}
      </header>

      {/* Zone qui défile ; la barre d'actions y reste collée en bas. */}
      <div className="post__defile">
        {/* Le texte avant l'image : on lit l'affirmation d'abord. */}
        <div className="post__lead">
          <p className="post__caption">
            <span className="post__caption-account">{post.source}</span>{' '}
            <span className="post__claim">{post.titre}</span> {post.texte}
          </p>
        </div>

        {image && (
          <img src={image} alt="" className="post__media" onError={() => setImageCassee(image)} />
        )}

        {/* ♡ ✈ à gauche, ⚑ à droite. */}
        {isActive && (
          <div className="post__actions">
            <ActionIcon
              label="J'aime"
              onClick={() => onAction('share')}
              disabled={disabled}
              active={liked}
              modifier="post__action--liked"
            >
              <Heart size={26} strokeWidth={1.8} fill={liked ? 'currentColor' : 'none'} />
            </ActionIcon>
            <ActionIcon
              label="Partager"
              onClick={() => onAction('share')}
              disabled={disabled}
              active={liked}
              modifier="post__action--liked"
            >
              <Send size={25} strokeWidth={1.8} />
            </ActionIcon>
            <span className="post__action--last">
              <ActionIcon
                label="Signaler"
                onClick={() => onAction('report')}
                disabled={disabled}
                active={reported}
                modifier="post__action--reported"
              >
                <Flag size={25} strokeWidth={1.8} fill={reported ? 'currentColor' : 'none'} />
              </ActionIcon>
            </span>
          </div>
        )}

        <div className="post__body">
          <p className="post__likes">
            {(post.reactionCount ?? 1222).toLocaleString('fr-FR')} J'aime
          </p>

          {post.commentaires?.length > 0 && (
            <ul className="post__thread">
              {post.commentaires.map((commentaire, i) => (
                <li key={i} className="reaction">
                  <span className="reaction__auteur" style={{ '--auteur': commentaire.couleur }}>
                    {commentaire.auteur}
                  </span>{' '}
                  <span className="reaction__texte">{commentaire.texte}</span>
                </li>
              ))}
            </ul>
          )}

          <p className="post__comments">
            {(post.commentCount ?? 638).toLocaleString('fr-FR')} commentaires
          </p>
          <p className="post__date">{post.date}</p>
        </div>
      </div>
    </article>
  )
}
