import { Play, RotateCcw } from 'lucide-react'
import Filaments from './ui/Filaments'
import Kiwi from './ui/Kiwi'
import Demonstration from './Demonstration'

// `reprise` : rouvert en cours de partie, ne relance rien.
export default function GameStart({ jeu, reprise, onStart }) {
  return (
    <div
      className="voile game-start anim-apparait"
    >
      <span aria-hidden="true" className="voile__fantome" />
      <Filaments forme="swirl" tourne />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="regles-titre"
        className="fenetre game-start__fenetre anim-surgit"
      >
        <Kiwi className="game-start__kiwi" />

        <p className="etiquette">{reprise ? 'Rappel des règles' : 'Avant de jouer'}</p>
        <h1 id="regles-titre" className="fenetre__titre game-start__titre">
          {jeu.titre}
        </h1>

        <div className="game-start__corps">
          {jeu.demonstration ? (
            <Demonstration jeu={jeu} />
          ) : (
            <ol className="game-start__points">
              {jeu.points.map((point, i) => (
                <li key={point}>
                  <span className="game-start__numero">{i + 1}</span>
                  <span>{point}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <button type="button" onClick={onStart} className="bouton bouton--plein bouton--large">
          {reprise ? (
            <RotateCcw size={17} strokeWidth={2.2} />
          ) : (
            <Play size={16} fill="currentColor" strokeWidth={0} />
          )}
          {reprise ? 'Reprendre' : 'Commencer'}
        </button>
      </div>
    </div>
  )
}
