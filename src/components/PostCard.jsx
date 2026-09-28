import { motion } from 'framer-motion'
import { Heart, Send, Flag } from 'lucide-react'
import ChampEditable from './ChampEditable'

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
          <ChampEditable balise="p" className="post__account" sur={post} cle="source" />
          <ChampEditable
            balise="p"
            className="post__domain"
            sur={post}
            cle="domain"
            repli="compte non identifié"
          />
        </div>
        {/* La mention légale d'une publicité. Instagram l'affiche, en petit et
            en gris : c'est justement pour ça qu'il faut apprendre à la voir. */}
        {post.sponsorise && <span className="post__sponso">Sponsorisé</span>}
      </header>

      {/* Le texte avant l'image, à l'inverse d'un fil ordinaire : on lit ce qui
          est affirmé avant de voir l'illustration. */}
      <div className="post__lead">
        <p className="post__caption">
          <span className="post__caption-account">{post.source}</span>{' '}
          <ChampEditable className="post__claim" sur={post} cle="titre" />{' '}
          <ChampEditable sur={post} cle="texte" />
        </p>
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

        {/* Les réactions ne sont pas du décor : c'est la pression sociale qui
            fait circuler une information. Il y a toujours quelqu'un qui y
            croit, quelqu'un qui doute, et quelqu'un qui va vérifier. */}
        {post.commentaires?.length > 0 && (
          <ul className="post__thread">
            {post.commentaires.map((commentaire, i) => (
              <li key={i} className="reaction">
                <span className="reaction__auteur" style={{ color: commentaire.couleur }}>
                  {commentaire.auteur}
                </span>{' '}
                <span className="reaction__texte">{commentaire.texte}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Compteur seul : rien n'est cliquable ici. */}
        <p className="post__comments">
          {(post.commentCount ?? 638).toLocaleString('fr-FR')} commentaires
        </p>
        <p className="post__date">{post.date}</p>
      </div>
    </article>
  )
}
