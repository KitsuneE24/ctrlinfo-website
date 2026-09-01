import { createElement, useEffect } from 'react'
import { Link } from 'react-router'
import { ExternalLink, X } from 'lucide-react'
import { icone } from '../data/icones'
import { chapterPath } from '../routes'

const DUREE = '8s'

/**
 * Une story en plein écran : barres de progression, tap à droite ou à gauche,
 * flèches, Échap.
 *
 * L'avancement passe par une animation CSS et non un minuteur — sans
 * animation, la story attend qu'on la fasse avancer.
 */
export default function StoryViewer({ stories, index, onIndex, onClose }) {
  const story = stories[index]

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') onIndex(index + 1)
      if (event.key === 'ArrowLeft') onIndex(index - 1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [index, onIndex, onClose])

  if (!story) return null

  const Icone = icone(story.icone)

  return (
    <div className="story-view" role="dialog" aria-modal="true" aria-label={story.titre}>
      <div className="story-view__frame">
        <div className="story-view__bars">
          {stories.map((autre, i) => (
            <span key={autre.id} className="story-view__bar">
              <span
                // La clé remonte la barre : sans elle l'animation ne repart pas.
                key={`${story.id}-${i}`}
                className={`story-view__fill${
                  i < index ? ' story-view__fill--vue' : ''
                }${i === index ? ' story-view__fill--en-cours' : ''}`}
                style={i === index ? { animationDuration: DUREE } : undefined}
                onAnimationEnd={i === index ? () => onIndex(index + 1) : undefined}
              />
            </span>
          ))}
        </div>

        <header className="story-view__head">
          <span className="story-view__badge" style={{ background: story.couleur }}>
            {createElement(Icone, { size: 17, strokeWidth: 2 })}
          </span>
          <p className="story-view__titre">{story.titre}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer les stories"
            className="story-view__fermer"
          >
            <X size={20} strokeWidth={2.2} />
          </button>
        </header>

        <button
          type="button"
          aria-label="Story précédente"
          onClick={() => onIndex(index - 1)}
          className="story-view__zone story-view__zone--precedent"
        />
        <button
          type="button"
          aria-label="Story suivante"
          onClick={() => onIndex(index + 1)}
          className="story-view__zone story-view__zone--suivant"
        />

        <div className="story-view__corps">
          {story.contenu.map((paragraphe) => (
            <p key={paragraphe} className="story-view__texte">
              {paragraphe}
            </p>
          ))}

          {story.lien.chapitre ? (
            <Link
              to={chapterPath(story.lien.chapitre)}
              onClick={onClose}
              className="story-view__lien"
            >
              {story.lien.texte}
            </Link>
          ) : (
            <a
              href={story.lien.url}
              target="_blank"
              rel="noopener noreferrer"
              className="story-view__lien"
            >
              {story.lien.texte}
              <ExternalLink size={15} strokeWidth={2.2} />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
