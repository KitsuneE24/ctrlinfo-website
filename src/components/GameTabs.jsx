import { HelpCircle } from 'lucide-react'
import games from '../data/games'

/**
 * Barre du jeu en cours, posée entre l'en-tête du site et le jeu lui-même.
 * Elle porte deux choses, et elles n'apparaissent pas aux mêmes largeurs :
 *
 * - les onglets, pour passer d'un jeu à l'autre — à partir de 768px seulement.
 *   Sur téléphone, les jeux se choisissent dans la galerie, et le nom du jeu en
 *   cours prend leur place ;
 * - le bouton « Règles du jeu », dès qu'une partie est ouverte. Il est ici et
 *   pas dans l'en-tête du site : à côté du nom du jeu, on comprend que ce sont
 *   ses règles à lui, pas celles d'Alert NC. Et il est hors de l'aire de jeu,
 *   donc il ne recouvre jamais une publication, une réponse ou un indice.
 *
 * Sur téléphone, la barre disparaît entièrement dans la galerie : sans jeu en
 * cours, elle n'aurait rien à dire.
 */
const TOUS = 'tous'

export default function GameTabs({ jeu, onSelect, onRevoirRegles }) {
  const valeur = jeu ?? TOUS
  const entrees = [{ id: TOUS, titre: 'Tous les jeux' }, ...games]
  const enCours = games.find(({ id }) => id === jeu)

  function choisir(id) {
    onSelect(id === TOUS ? null : id)
  }

  return (
    <div className={`game-tabs${enCours ? ' game-tabs--partie' : ''}`}>
      <div className="game-tabs__row" role="tablist" aria-label="Choisir un jeu">
        {entrees.map(({ id, titre }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={valeur === id}
            onClick={() => choisir(id)}
            className={`game-tabs__tab${valeur === id ? ' game-tabs__tab--active' : ''}`}
          >
            {titre}
          </button>
        ))}
      </div>

      {/* Le nom du jeu remplace les onglets sur téléphone : le bouton d'à côté
          a besoin de dire de quel jeu il donne les règles. */}
      {enCours && <p className="game-tabs__current">{enCours.titre}</p>}

      {enCours && (
        <button
          type="button"
          onClick={onRevoirRegles}
          title={`Revoir les règles de « ${enCours.titre} »`}
          className="rules-button"
        >
          <HelpCircle size={17} strokeWidth={2} />
          <span className="rules-button__label">Règles du jeu</span>
        </button>
      )}
    </div>
  )
}
