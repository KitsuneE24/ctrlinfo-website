import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { Save, TriangleAlert } from 'lucide-react'
import { PATHS } from '../routes'

/**
 * L'alerte de sortie de partie.
 *
 * Elle disait deux choses selon l'identité, la version sans compte annonçant
 * une perte sèche. Il n'y a plus qu'un message, et il n'annonce plus de perte :
 * chaque décision est déjà retenue par le navigateur au moment où elle est
 * prise. Ce qui se perd en sortant, c'est la manche en cours — pas ce qu'on
 * vient d'y apprendre.
 *
 * Le code d'export est proposé en aparté, sous un filet : c'est le moment où
 * l'on y pense, mais la question posée doit rester binaire.
 */
export default function ExitGamePrompt({ onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-prompt-title"
      className="gate"
    >
      <motion.div
        initial={{ y: 14, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 14, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="gate__card"
      >
        <span className="gate__icon gate__icon--alert">
          <TriangleAlert size={23} strokeWidth={2} />
        </span>

        <h2 id="exit-prompt-title" className="gate__title">
          Quitter la partie&nbsp;?
        </h2>
        <p className="gate__text">
          Ce que tu as déjà répondu est gardé : les publications traitées et le
          niveau atteint restent acquis. Seule cette manche recommencera.
        </p>

        <div className="gate__actions">
          <button type="button" onClick={onCancel} className="gate__primary">
            Continuer à jouer
          </button>
          <button type="button" onClick={onConfirm} className="gate__secondary">
            Quitter quand même
          </button>
        </div>

        {/* Sous un filet, et à l'écart des deux réponses : la question posée
            reste binaire. */}
        <div className="gate__aparte">
          <p className="gate__aparte-texte">Tu changes d'appareil&nbsp;?</p>
          {/* Pas de `onConfirm` : changer d'adresse referme l'alerte tout seul
              (AppShell remet son état à zéro), et deux navigations
              concurrentes se disputeraient la destination. */}
          <Link to={PATHS.profile} className="gate__aparte-lien">
            <Save size={14} strokeWidth={2.2} />
            Exporter mon code
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}
