import { Image as ImageIcon, Play } from 'lucide-react'
import games from '../data/games'
import Page from './ui/Page'

/**
 * Galerie des jeux, en entrée de l'onglet « Jeux ».
 *
 * Au repos, on ne voit que les visuels — une galerie, pas une liste de fiches.
 * Le texte (accroche, description, ce qu'on y apprend) se lève par-dessus
 * l'image au survol.
 *
 * Là où le survol n'existe pas — écrans tactiles —, le texte est visible en
 * permanence : la règle de révélation est enfermée dans un `@media (hover:
 * hover)` côté CSS, on ne peut donc pas se retrouver avec un contenu
 * inatteignable au doigt.
 *
 * La tuile entière est le bouton : cliquer n'importe où lance le jeu.
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

      {/* Bandeau toujours lisible : le titre nomme la tuile même sans survol. */}
      <div className="tile__caption">
        <h2 className="tile__title">{jeu.titre}</h2>
      </div>

      {/* Voile de survol : tout ce qu'on ne montre pas au repos. */}
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
  return (
    <Page title="Jeux" subtitle="Trois jeux pour reconnaître la désinformation">
      <div className="gallery">
        {games.map((jeu) => (
          <GameTile key={jeu.id} jeu={jeu} onPlay={onPlay} />
        ))}
      </div>
    </Page>
  )
}
