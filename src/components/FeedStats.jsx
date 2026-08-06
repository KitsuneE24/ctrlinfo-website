import Wordmark from './ui/Wordmark'

/**
 * Bandeau de progression du fil.
 *
 * Il remplace l'ancienne barre supérieure : niveau et avancement, posés dans
 * le flux comme une première carte. Ni points ni abonnés — le retour au joueur
 * passe par l'explication de chaque choix, pas par un compteur.
 */
export default function FeedStats({
  progress,
  currentLevel,
  levelDoneCount,
  levelTotal,
}) {
  return (
    <section className="card feed-stats">
      <div className="feed-stats__top">
        <Wordmark size={17} />
        <span className="feed-stats__level">Niveau&nbsp;{currentLevel}</span>
      </div>

      <div className="feed-stats__track">
        <div
          className="feed-stats__bar"
          style={{ width: `${Math.min(Math.max(progress, 0), 1) * 100}%` }}
        />
      </div>

      <p className="feed-stats__caption">
        {levelDoneCount}/{levelTotal} publications traitées à ce niveau
      </p>
    </section>
  )
}
