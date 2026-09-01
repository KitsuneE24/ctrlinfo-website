import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { ArrowRight, UserRound } from 'lucide-react'
import { PATHS } from '../routes'

/**
 * La question posée une fois, à l'entrée d'un onglet de jeu : avec un compte
 * ou sans ?
 *
 * Elle ne bloque personne — « continuer en invité » est là, au même niveau que
 * le reste. Ce qu'elle évite, c'est de jouer une partie entière avant de
 * découvrir qu'elle n'a rien enregistré.
 */
export default function IdentityGate({ onGuest }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="identity-gate-title"
      className="gate"
    >
      <motion.div
        initial={{ y: 18, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 18, scale: 0.98 }}
        transition={{ duration: 0.22 }}
        className="gate__card"
      >
        <span className="gate__icon">
          <UserRound size={24} strokeWidth={1.9} />
        </span>

        <p className="gate__eyebrow">Avant de jouer</p>
        <h2 id="identity-gate-title" className="gate__title">
          Tu veux garder tes scores&nbsp;?
        </h2>
        <p className="gate__text">
          Avec un compte, tes parties, tes progrès et ce qui te piège le plus
          sont enregistrés. Sans compte, tu joues à tout, mais rien n'est gardé.
        </p>

        <div className="gate__actions">
          <Link to={PATHS.profile} className="gate__primary">
            Me connecter ou créer un compte
            <ArrowRight size={16} strokeWidth={2.2} />
          </Link>
          <button type="button" onClick={onGuest} className="gate__secondary">
            Continuer en invité
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
