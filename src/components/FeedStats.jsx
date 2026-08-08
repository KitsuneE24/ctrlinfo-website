import { forwardRef } from 'react'
import Countdown from './Countdown'

/**
 * Bandeau de progression du fil, collé en haut pendant le défilement : niveau,
 * avancement et décompte. Le décompte est ici parce que le bandeau, lui, ne
 * défile pas.
 *
 * `timerKey` remonte le décompte à chaque publication. Le bandeau, lui, n'est
 * jamais remonté : il porte la `ref` que le Feed mesure.
 */
const FeedStats = forwardRef(function FeedStats(
  {
    progress,
    currentLevel,
    levelDoneCount,
    levelTotal,
    timerKey,
    timerActive,
    onTimerComplete,
  },
  ref
) {
  return (
    <section ref={ref} className="card feed-stats">
      <div className="feed-stats__top">
        <span className="feed-stats__level">Niveau&nbsp;{currentLevel}</span>
        <span className="feed-stats__caption">
          {levelDoneCount}/{levelTotal} publications traitées
        </span>
        <Countdown
          key={timerKey}
          active={timerActive}
          onComplete={onTimerComplete}
        />
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
