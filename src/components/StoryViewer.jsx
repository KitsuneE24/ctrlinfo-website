import { createElement, useEffect } from 'react'
import { Link } from 'react-router'
import { ExternalLink, X } from 'lucide-react'
import { icone } from '../data/icones'
import { chapterPath } from '../routes'

/** Combien de temps une story reste à l'écran avant de passer à la suivante. */
const DUREE = '8s'

/**
 * Une story ouverte, en plein écran.
 *
 * Les codes sont ceux d'Instagram, parce que c'est ce que le public sait déjà
 * lire : les barres de progression en haut, une par story ; le tap à droite
 * pour avancer, à gauche pour revenir ; la croix pour sortir.
 *
 * L'avancement automatique est porté par une animation CSS plutôt que par un
 * minuteur : quand le visiteur a demandé moins d'animations, elle ne tourne
 * pas, et la story attend qu'on la fasse avancer. Personne ne doit voir un
 * texte disparaître avant de l'avoir fini.
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
                className={`story-view__fill${
                  i < index ? ' story-view__fill--vue' : ''
                }${i === index ? ' story-view__fill--en-cours' : ''}`}
                // La clé remonte la barre à chaque changement de story :
                // sans elle, l'animation ne repartirait pas de zéro.
                key={`${story.id}-${i}`}
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

        {/* Les deux moitiés qui font défiler, au doigt comme à la souris. */}
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

          {/* Une story mène toujours quelque part : soit ici, soit dehors. */}
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
