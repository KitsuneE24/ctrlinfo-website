import { Image as ImageIcon, Play } from 'lucide-react'
import { useJeux } from '../state/jeux'
import Page from './ui/Page'
import { Chargement, ErreurChargement } from './ui/Chargement'

/**
 * Galerie des jeux, en entrée de l'onglet « Jeux ». La tuile entière est le
 * bouton.
 *
 * Au repos on ne voit que les visuels ; le texte se lève au survol. Sans
 * survol, il reste visible en permanence — la règle est enfermée dans un
 * `@media (hover: hover)` côté CSS.
 */
function GameTile({ jeu, onPlay }) {
  return (
    <button
      type="button"
      onClick={() => onPlay(jeu.id)}
      aria-label={`Jouer à « ${jeu.titre} »`}
      className="tile"
    >
      <div className="tile__visual">
        {jeu.capture ? (
          <img src={jeu.capture} alt="" className="tile__shot" />
        ) : (
          <div className="tile__shot tile__shot--empty">
            <ImageIcon size={22} strokeWidth={1.6} />
            <span>Capture du jeu</span>
          </div>
        )}
      </div>

      {/* Le titre, lisible même sans survol. */}
      <div className="tile__caption">
        <h2 className="tile__title">{jeu.titre}</h2>
      </div>

      {/* Voile de survol. */}
      <div className="tile__reveal">
        <h3 className="tile__reveal-title">{jeu.titre}</h3>
        <p className="tile__tagline">{jeu.accroche}</p>
        <p className="tile__text">{jeu.description}</p>

        <ul className="tile__points">
          {jeu.points.map((point) => (
            <li key={point} className="tile__point">
              {point}
            </li>
          ))}
        </ul>

        <span className="tile__cta">
          <Play size={14} fill="currentColor" strokeWidth={0} />
          Jouer
        </span>
      </div>
    </button>
  )
}

export default function GameHub({ onPlay }) {
  const { jeux, chargement, erreur, recharger } = useJeux()

  return (
    <Page title="Jeux" subtitle="Trois jeux pour reconnaître la désinformation">
      {erreur ? (
        <ErreurChargement erreur={erreur} onReessayer={recharger} />
      ) : chargement ? (
        <Chargement quoi="les jeux" />
      ) : (
        <div className="gallery">
          {jeux.map((jeu) => (
            <GameTile key={jeu.id} jeu={jeu} onPlay={onPlay} />
          ))}
        </div>
      )}
    </Page>
  )
}
