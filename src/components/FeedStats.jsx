import Countdown from './Countdown'

/**
 * Bandeau de progression du fil, collé en haut pendant le défilement : niveau,
 * avancement et décompte. Le décompte est ici parce que le bandeau, lui, ne
 * défile pas.
 *
 * `timerKey` remonte le décompte à chaque publication ; le bandeau, lui,
 * n'est jamais remonté.
 *
 * `timerSecondes` peut être nul : au premier niveau il n'y a pas de chrono, et
 * son emplacement disparaît plutôt que d'afficher un tiret.
 */
export default function FeedStats({
  progress,
  currentLevel,
  levelDoneCount,
  levelTotal,
  timerKey,
  timerActive,
  timerSecondes,
  onTimerComplete,
}) {
  return (
    <section className="card feed-stats">
      <div className="feed-stats__top">
        <span className="feed-stats__level">Niveau&nbsp;{currentLevel}</span>
        <span className="feed-stats__caption">
          {levelDoneCount}/{levelTotal} publications traitées
        </span>
        {timerSecondes ? (
          <Countdown
            key={timerKey}
            active={timerActive}
            secondes={timerSecondes}
            onComplete={onTimerComplete}
          />
        ) : null}
      </div>

      <div className="feed-stats__track">
        <div
          className="feed-stats__bar"
          style={{ width: `${Math.min(Math.max(progress, 0), 1) * 100}%` }}
        />
      </div>
    </section>
  )
}
