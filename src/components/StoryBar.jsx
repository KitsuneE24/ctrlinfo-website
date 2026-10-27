import { createElement, useState } from 'react'
import { getStories } from '../api/contenu'
import { icone } from '../data/icones'
import { useRessource } from '../lib/useRessource'
import { dejaVu, marquerVu } from '../lib/premiereFois'
import StoryViewer from './StoryViewer'

export default function StoryBar() {
  const { donnees } = useRessource(getStories, [])
  const stories = donnees ?? []

  const [ouverte, setOuverte] = useState(null)
  const [vues, setVues] = useState({})

  if (stories.length === 0) return null

  function voir(index) {
    const story = stories[index]
    if (!story) return
    marquerVu(`story:${story.id}`)
    setVues((prev) => ({ ...prev, [story.id]: true }))
  }

  function ouvrir(index) {
    setOuverte(index)
    voir(index)
  }

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
