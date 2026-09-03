import { createElement } from 'react'
import { Flame, Trophy } from 'lucide-react'
import { icone } from '../data/icones'

/**
 * Ce qui donne envie de revenir : le meilleur score, la série de jours, les
 * couronnes.
 *
 * Les couronnes non décrochées sont montrées, pas cachées : une récompense
 * qu'on ne voit pas ne fait revenir personne. Chacune porte son avancement,
 * pour qu'on sache ce qu'il reste à faire plutôt que de le deviner.
 */
export default function Records({ records }) {
  if (!records) return null

  const { meilleurScore, serie, badges } = records
  const obtenues = badges.filter((badge) => badge.obtenu)

  return (
    <>
      <section className="records">
        <div className="record">
          <span className={`record__icone${serie.aJourAujourdhui ? ' record__icone--vif' : ''}`}>
            <Flame
              size={22}
              strokeWidth={2}
              fill={serie.aJourAujourdhui ? 'currentColor' : 'none'}
            />
          </span>
          <p className="record__valeur">{serie.jours}</p>
          <p className="record__libelle">
            {serie.jours > 1 ? 'jours de suite' : 'jour de suite'}
          </p>
          {/* Dire que la journée n'est pas encore faite vaut mieux que de
              laisser découvrir une série tombée le lendemain. */}
          {!serie.aJourAujourdhui && serie.jours > 0 && (
            <p className="record__note">Joue aujourd'hui pour la garder</p>
          )}
        </div>

        <div className="record">
          <span className="record__icone">
            <Trophy size={22} strokeWidth={2} />
          </span>
          <p className="record__valeur">{meilleurScore}</p>
          <p className="record__libelle">meilleur score</p>
        </div>
      </section>

      <section className="card">
        <div className="card__body">
          <h2 className="card__title">
            Tes couronnes <span className="card__compte">{obtenues.length}/{badges.length}</span>
          </h2>

          <ul className="couronnes">
            {badges.map((badge) => (
              <li
                key={badge.id}
                className={`couronne${badge.obtenu ? ' couronne--obtenue' : ''}`}
              >
                <span
                  className="couronne__picto"
                  style={badge.obtenu ? { background: badge.couleur } : undefined}
                >
                  {createElement(icone(badge.picto), { size: 18, strokeWidth: 2 })}
                </span>
                <div className="couronne__corps">
                  <p className="couronne__nom">{badge.nom}</p>
                  <p className="couronne__texte">{badge.description}</p>
                  {!badge.obtenu && (
                    <p className="couronne__avancement">
                      {badge.avancement} sur {badge.seuil}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
