import { createElement, useEffect } from 'react'
import { Link } from 'react-router'
import { ChevronLeft, ChevronRight, ExternalLink, X } from 'lucide-react'
import { icone } from '../data/icones'
import { chapterPath } from '../routes'
import Filaments from './ui/Filaments'

const DUREE = '8s'

/** Story plein écran : barres, zones de tap, flèches, Échap. */
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
  const [phrase, ...suite] = story.contenu

  return (
    <div
      className="story-view"
      role="dialog"
      aria-modal="true"
      aria-label={story.titre}
      onClick={onClose}
    >
      <div className="story-view__scene">
        <Voisine story={stories[index - 1]} onOuvrir={() => onIndex(index - 1)} />
        <button
          type="button"
          aria-label="Story précédente"
          onClick={(event) => {
            event.stopPropagation()
            onIndex(index - 1)
          }}
          disabled={index === 0}
          className="story-view__fleche"
        >
          <ChevronLeft size={20} strokeWidth={2.4} />
        </button>

        <div className="story-view__frame" onClick={(event) => event.stopPropagation()}>
          <Filaments forme="swirl" tourne className="story-view__filaments" />

          <div className="story-view__bars">
            {stories.map((autre, i) => (
              <span key={autre.id} className="story-view__bar">
                <span
                  // La clé relance l'animation.
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
              {createElement(Icone, { size: 18, strokeWidth: 2 })}
            </span>
            <p className="story-view__titre">{story.titre}</p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer les stories"
              className="story-view__fermer"
            >
              <X size={22} strokeWidth={2.2} />
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
            <div className="story-view__textes">
              {phrase && <p className="story-view__phrase">{phrase}</p>}
              {suite.map((paragraphe) => (
                <p key={paragraphe} className="story-view__texte">
                  {paragraphe}
                </p>
              ))}
            </div>

            {story.lien.chapitre ? (
              <Link
                to={chapterPath(story.lien.chapitre)}
                onClick={onClose}
                className="bouton bouton--plein bouton--large story-view__lien"
              >
                {story.lien.texte}
                <ChevronRight size={17} strokeWidth={2.4} />
              </Link>
            ) : (
              <a
                href={story.lien.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bouton bouton--plein bouton--large story-view__lien"
              >
                {story.lien.texte}
                <ExternalLink size={16} strokeWidth={2.2} />
              </a>
            )}
          </div>
        </div>

        <button
          type="button"
          aria-label="Story suivante"
          onClick={(event) => {
            event.stopPropagation()
            onIndex(index + 1)
          }}
          className="story-view__fleche"
        >
          <ChevronRight size={20} strokeWidth={2.4} />
        </button>
        <Voisine story={stories[index + 1]} onOuvrir={() => onIndex(index + 1)} />
      </div>
    </div>
  )
}

/** Aperçu cliquable d'une story voisine (ordinateur). Les flèches font de même au clavier. */
function Voisine({ story, onOuvrir }) {
  if (!story) return <div aria-hidden="true" className="story-view__voisine story-view__voisine--vide" />
  return (
    <button
      type="button"
      aria-hidden="true"
      tabIndex={-1}
      onClick={(event) => {
        event.stopPropagation()
        onOuvrir()
      }}
      className="story-view__voisine"
      style={{ background: story.couleur }}
    >
      {story.titre}
    </button>
  )
}
