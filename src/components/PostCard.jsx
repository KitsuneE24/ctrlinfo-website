import { motion } from 'framer-motion'
import { Heart, Send, Flag, Link2 } from 'lucide-react'

function ActionIcon({ label, onClick, disabled, active, modifier, children }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      aria-pressed={active}
      whileTap={{ scale: 0.8 }}
      animate={active ? { scale: [1, 1.28, 1] } : { scale: 1 }}
      transition={{ duration: 0.28 }}
      className={`post__action${active ? ` ${modifier}` : ''}`}
    >
      {children}
    </motion.button>
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

  return (
    <article className={`post${isActive ? '' : ' post--past'}`}>
      {/* Qui parle. Le décompte, lui, est dans le bandeau (FeedStats). */}
      <header className="post__header">
        <span className="post__avatar" style={{ backgroundColor: post.sourceColor }}>
          {initial}
        </span>
        <div className="post__identity">
          <p className="post__account">{post.source}</p>
          <p className="post__domain">{post.domain || 'publication sponsorisée'}</p>
        </div>
      </header>

      {/* Le texte avant l'image, à l'inverse d'un fil ordinaire : on lit ce qui
          est affirmé avant de voir l'illustration. */}
      <div className="post__lead">
        <p className="post__caption">
          <span className="post__caption-account">{post.source}</span> {post.texte}
        </p>

        {/* Aperçu de l'article partagé */}
        <div className="post__link">
          <Link2 size={14} className="post__link-icon" />
          <div className="post__link-text">
            <p className="post__link-domain">{post.domain || post.source}</p>
            <p className="post__link-title">{post.titre}</p>
          </div>
        </div>
      </div>

      <img src={post.image} alt="" className="post__media" />

      {/* À gauche les gestes d'adhésion, à droite le signalement. */}
      {isActive && (
        <div className="post__actions">
          <ActionIcon
            label="J'aime"
            onClick={() => onAction('share')}
            disabled={disabled}
            active={liked}
            modifier="post__action--liked"
          >
            <Heart size={25} strokeWidth={1.9} fill={liked ? 'currentColor' : 'none'} />
          </ActionIcon>
          <ActionIcon
            label="Partager"
            onClick={() => onAction('share')}
            disabled={disabled}
            active={liked}
            modifier="post__action--liked"
          >
            <Send size={23} strokeWidth={1.9} />
          </ActionIcon>
          <span className="post__action--last">
            <ActionIcon
              label="Signaler"
              onClick={() => onAction('report')}
              disabled={disabled}
              active={reported}
              modifier="post__action--reported"
            >
              <Flag size={23} strokeWidth={1.9} fill={reported ? 'currentColor' : 'none'} />
            </ActionIcon>
          </span>
        </div>
      )}

      <div className="post__body">
        <p className="post__likes">
          {(post.reactionCount ?? 1222).toLocaleString('fr-FR')} J'aime
        </p>

        {/* Compteur seul : rien n'est cliquable ici. */}
        <p className="post__comments">
          {(post.commentCount ?? 638).toLocaleString('fr-FR')} commentaires
        </p>
        <p className="post__date">{post.date}</p>
      </div>
    </article>
  )
}
