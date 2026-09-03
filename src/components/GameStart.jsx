import { createElement } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { HelpCircle, Play, RotateCcw } from 'lucide-react'
import { PATHS } from '../routes'

/**
 * L'écran de départ d'un jeu : ce qu'on va y faire.
 *
 * Il tient en un écran, sans défilement : le bouton « Commencer » et ce qu'on
 * accepte en le pressant se lisent d'un seul regard.
 *
 * Rouvert en cours de partie (`reprise`), il ne relance rien : il rappelle, et
 * on repart où on en était.
 */
export default function GameStart({ jeu, connecte, reprise, onStart, onRules }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="game-start no-scrollbar"
    >
      <motion.div
        initial={{ y: 16 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.22 }}
        className="game-start__card"
      >
        <header className="game-start__head">
          <span className="game-start__badge" style={{ color: jeu.couleur }}>
            {createElement(jeu.Icon, { size: 24, strokeWidth: 1.9 })}
          </span>
          <p className="game-start__eyebrow">
            {reprise ? 'Les règles' : 'Avant de jouer'}
          </p>
          <h1 className="game-start__title">{jeu.titre}</h1>
        </header>

        <ul className="game-start__points">
          {jeu.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>

        {/* Côte à côte : commencer reste l'action principale, se connecter la
            porte de sortie vers le compte. */}
        <div className="game-start__actions">
          {!connecte && (
            <Link to={PATHS.profile} className="game-start__login">
              Se connecter
            </Link>
          )}
          <button type="button" onClick={onStart} className="game-start__go">
            {reprise ? (
              <RotateCcw size={16} strokeWidth={2.2} />
            ) : (
              <Play size={16} fill="currentColor" strokeWidth={0} />
            )}
            {reprise ? 'Reprendre' : 'Commencer'}
          </button>
        </div>

        <footer className="game-start__pied">
          {!connecte && (
            <p className="game-start__guest">
              Sans compte, les scores ne seront pas enregistrés.
            </p>
          )}
          {/* La seule porte vers les trois volets détaillés : sans ce lien, le
              tutoriel et ses captures deviennent inatteignables. */}
          <button type="button" onClick={onRules} className="game-start__rules">
            <HelpCircle size={14} strokeWidth={2} />
            Voir les règles en détail
          </button>
        </footer>
      </motion.div>
    </motion.div>
  )
}
