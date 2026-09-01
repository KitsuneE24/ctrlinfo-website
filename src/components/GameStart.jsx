import { createElement } from 'react'
import { motion } from 'framer-motion'
import { Clock, HelpCircle, Play } from 'lucide-react'

/**
 * L'écran de départ d'un jeu : ce qu'on va faire, en combien de temps, et la
 * règle en une phrase.
 *
 * Il s'affiche avant chaque partie. Le tutoriel complet, lui, ne s'ouvre de
 * lui-même que quand les règles n'ont pas encore été lues — il reste ici à
 * portée d'un bouton.
 */
export default function GameStart({ jeu, connecte, onStart, onRules }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="game-start"
    >
      <motion.div
        initial={{ y: 16 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.22 }}
        className="game-start__card"
      >
        <span className="game-start__badge" style={{ background: jeu.couleur }}>
          {createElement(jeu.Icon, { size: 24, strokeWidth: 1.9 })}
        </span>

        <p className="game-start__eyebrow">Avant de jouer</p>
        <h1 className="game-start__title">{jeu.titre}</h1>

        {jeu.regleCourte && <p className="game-start__rule">{jeu.regleCourte}</p>}

        {jeu.dureeMinutes && (
          <p className="game-start__duration">
            <Clock size={15} strokeWidth={2} />
            Environ {jeu.dureeMinutes} minutes
          </p>
        )}

        <ul className="game-start__points">
          {jeu.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>

        {!connecte && (
          <p className="game-start__guest">
            Tu joues en invité&nbsp;: tes scores ne seront pas enregistrés.
          </p>
        )}

        <div className="game-start__actions">
          <button type="button" onClick={onStart} className="game-start__go">
            <Play size={16} fill="currentColor" strokeWidth={0} />
            Commencer
          </button>
          <button type="button" onClick={onRules} className="game-start__rules">
            <HelpCircle size={15} strokeWidth={2} />
            Voir les règles en détail
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
