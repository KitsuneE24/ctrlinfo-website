import { createElement, useState } from 'react'
import { getStories } from '../api/contenu'
import { icone } from '../data/icones'
import { useRessource } from '../lib/useRessource'
import { dejaVu, marquerVu } from '../lib/premiereFois'
import StoryViewer from './StoryViewer'

/**
 * La rangée de stories, en haut de l'accueil.
 *
 * Elle remplace le bouton flottant « Sources ». Le contenu est le même — les
 * sites où vérifier, les thèmes à lire — mais il est là où l'on regarde en
 * arrivant, au lieu d'attendre derrière un bouton que personne n'ouvrait.
 *
 * Si l'API ne répond pas, la rangée disparaît sans bruit : c'est un raccourci,
 * pas le contenu de la page. Rien ne devient inaccessible pour autant —
 * l'onglet Ressources porte les mêmes liens.
 */
export default function StoryBar() {
  const { donnees } = useRessource(getStories, [])
  const stories = donnees ?? []

  // Ouverte ou non, et sur laquelle. `null` = la rangée seule.
  const [ouverte, setOuverte] = useState(null)
  // Les pastilles déjà ouvertes perdent leur anneau coloré, comme ailleurs.
  const [vues, setVues] = useState({})

  if (stories.length === 0) return null

  function ouvrir(index) {
    setOuverte(index)
    voir(index)
  }

  function voir(index) {
    const story = stories[index]
    if (!story) return
    marquerVu(`story:${story.id}`)
    setVues((prev) => ({ ...prev, [story.id]: true }))
  }

  /** Sortir par la fin ferme la vue : on ne boucle pas indéfiniment. */
  function aller(index) {
    if (index < 0) return
    if (index >= stories.length) {
      setOuverte(null)
      return
    }
    setOuverte(index)
    voir(index)
  }

  return (
    <>
      <div className="stories no-scrollbar">
        {stories.map((story, index) => {
          const vue = vues[story.id] || dejaVu(`story:${story.id}`)
          return (
            <button
              key={story.id}
              type="button"
              onClick={() => ouvrir(index)}
              className={`stories__item${vue ? ' stories__item--vue' : ''}`}
            >
              <span className="stories__ring">
                <span className="stories__disc" style={{ background: story.couleur }}>
                  {createElement(icone(story.icone), { size: 24, strokeWidth: 1.9 })}
                </span>
              </span>
              <span className="stories__label">{story.titre}</span>
            </button>
          )
        })}
      </div>

      {ouverte !== null && (
        <StoryViewer
          stories={stories}
          index={ouverte}
          onIndex={aller}
          onClose={() => setOuverte(null)}
        />
      )}
    </>
  )
}
