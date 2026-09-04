import { createElement } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { Play, RotateCcw } from 'lucide-react'
import { PATHS } from '../routes'

/**
 * L'écran de départ d'un jeu : ce qu'on va y faire, et rien d'autre.
 *
 * C'est le **seul** endroit où les règles sont dites. Il y avait avant un
 * tutoriel en trois volets qui répétait ces mêmes points : lues deux fois,
 * elles n'étaient lues nulle part.
 *
 * Rouvert en cours de partie (`reprise`), il ne relance rien : il rappelle, et
 * on repart où on en était.
 */
export default function GameStart({ jeu, connecte, reprise, onStart }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="game-start no-scrollbar"
    >
      <motion.div
        initial={{ y: 12 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.22 }}
        className="game-start__card"
      >
        <header className="game-start__head">
          <span className="game-start__badge" style={{ background: jeu.couleur }}>
            {createElement(jeu.Icon, { size: 22, strokeWidth: 1.9 })}
          </span>
          <h1 className="game-start__title">{jeu.titre}</h1>
          <p className="game-start__eyebrow">
            {reprise ? 'Rappel des règles' : 'Avant de jouer'}
          </p>
        </header>

        <ul className="game-start__points">
          {jeu.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>

        <div className="game-start__actions">
          <button type="button" onClick={onStart} className="game-start__go">
            {reprise ? (
              <RotateCcw size={16} strokeWidth={2.2} />
            ) : (
              <Play size={15} fill="currentColor" strokeWidth={0} />
            )}
            {reprise ? 'Reprendre' : 'Commencer'}
          </button>

          {!connecte && (
            <p className="game-start__guest">
              Sans compte, les scores ne seront pas enregistrés.{' '}
              <Link to={PATHS.profile} className="game-start__login">
                Se connecter
              </Link>
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
