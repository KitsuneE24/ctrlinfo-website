import { createElement } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { ArrowRight, Clock, HelpCircle, Play, RotateCcw } from 'lucide-react'
import { PATHS } from '../routes'

/**
 * L'écran de départ d'un jeu : ce qu'on va faire, en combien de temps, et la
 * règle en une phrase.
 *
 * Il s'affiche avant chaque partie. Le tutoriel complet, lui, ne s'ouvre de
 * lui-même que quand les règles n'ont pas encore été lues — il reste ici à
 * portée d'un bouton.
 *
 * C'est aussi le seul endroit qui rappelle qu'on joue sans compte. Rien ne
 * barre l'entrée d'un jeu : le rappel revient à chaque départ, avec de quoi y
 * remédier, plutôt qu'une fenêtre posée une seule fois.
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

        <p className="game-start__eyebrow">
          {reprise ? 'Les règles' : 'Avant de jouer'}
        </p>
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
          <div className="game-start__guest">
            <p className="game-start__guest-text">
              Tu joues sans compte&nbsp;: <b>tes scores ne seront pas
              enregistrés</b>, et tu ne retrouveras rien à ta prochaine visite.
            </p>
            <Link to={PATHS.profile} className="game-start__guest-link">
              Me connecter pour les garder
              <ArrowRight size={14} strokeWidth={2.2} />
            </Link>
          </div>
        )}

        <div className="game-start__actions">
          <button type="button" onClick={onStart} className="game-start__go">
            {reprise ? (
              <RotateCcw size={16} strokeWidth={2.2} />
            ) : (
              <Play size={16} fill="currentColor" strokeWidth={0} />
            )}
            {reprise ? 'Reprendre' : 'Commencer'}
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
