import { forwardRef } from 'react'

/**
 * Bandeau de progression du fil, collé en haut pendant le défilement.
 *
 * Niveau et avancement seulement : la marque est portée par l'en-tête de
 * l'application, et le retour au joueur passe par l'explication de chaque
 * choix, pas par un compteur de points.
 *
 * La `ref` est transmise au Feed, qui mesure la hauteur du bandeau pour caler
 * le défilement de la publication suivante juste en dessous.
 */
const FeedStats = forwardRef(function FeedStats(
  { progress, currentLevel, levelDoneCount, levelTotal },
  ref
) {
  return (
    <section ref={ref} className="card feed-stats">
      <div className="feed-stats__top">
        <span className="feed-stats__level">Niveau&nbsp;{currentLevel}</span>
        <span className="feed-stats__caption">
          {levelDoneCount}/{levelTotal} publications traitées
        </span>
      </div>

      <div className="feed-stats__track">
        <div
          className="feed-stats__bar"
          style={{ width: `${Math.min(Math.max(progress, 0), 1) * 100}%` }}
        />
      </div>
    </section>
  )
})

export default FeedStats
