import { Play } from 'lucide-react'
import GameRules from './GameRules'
import Page from './ui/Page'

/**
 * Page de lancement de l'onglet Jouer : les consignes, puis le bouton qui
 * ouvre le fil. Elle reprend la mise en page du fil (colonne centrée, cartes)
 * pour que le passage de l'une à l'autre soit continu.
 */
export default function GameStart({ onStart }) {
  return (
    <Page feed>
      <section className="hero">
        <h1 className="hero__title">Alert&nbsp;NC</h1>
        <p className="hero__tagline">
          Sauras-tu repérer le vrai du faux dans ton fil d'actualité&nbsp;?
        </p>
      </section>

      <section className="card">
        <div className="card__body">
          <h2 className="card__title">Avant de commencer</h2>
          <p className="card__text">
            Trois niveaux de difficulté t'attendent&nbsp;: des faux grossiers,
            puis des sites qui imitent de vrais médias, et enfin de vraies
            informations sorties de leur contexte.
          </p>

          <GameRules />

          <div className="game-start__action">
            <button type="button" onClick={onStart} className="button">
              <Play size={15} fill="currentColor" strokeWidth={0} />
              Jouer
            </button>
          </div>
        </div>
      </section>
    </Page>
  )
}
