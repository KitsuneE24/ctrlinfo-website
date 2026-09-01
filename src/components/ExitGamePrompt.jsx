import { motion } from 'framer-motion'
import { TriangleAlert } from 'lucide-react'

/**
 * L'alerte de sortie de partie.
 *
 * Elle ne dit pas la même chose selon l'identité, parce que ce n'est pas la
 * même perte : sans compte, tout ce qui vient d'être joué disparaît ; avec un
 * compte, les décisions déjà prises restent comptées et seule la partie est
 * abandonnée.
 */
export default function ExitGamePrompt({ connecte, onConfirm, onCancel }) {
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
          {connecte
            ? 'La partie sera marquée comme abandonnée. Ce que tu as déjà répondu reste compté dans ton profil.'
            : "Tu joues en invité : ta progression n'est pas enregistrée, et cette partie recommencera à zéro."}
        </p>

        <div className="gate__actions">
          <button type="button" onClick={onCancel} className="gate__primary">
            Continuer à jouer
          </button>
          <button type="button" onClick={onConfirm} className="gate__secondary">
            Quitter quand même
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
