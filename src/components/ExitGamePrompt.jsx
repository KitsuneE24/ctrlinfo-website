import { motion } from 'framer-motion'
import { TriangleAlert } from 'lucide-react'

/**
 * L'alerte de sortie de partie.
 *
 * Elle disait deux choses selon l'identité, la version sans compte annonçant
 * une perte sèche. Il n'y a plus qu'un message, et il n'annonce plus de perte :
 * chaque décision est déjà retenue par le navigateur au moment où elle est
 * prise. Ce qui se perd en sortant, c'est la manche en cours — pas ce qu'on
 * vient d'y apprendre.
 *
 * Aucun lien vers le code d'export ici, bien que ce soit le bon moment pour y
 * penser : une alerte pose une question fermée, et un troisième chemin
 * transformerait le choix en menu. Le rappel est à la fin de la partie, où il
 * ne coupe rien.
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
      </motion.div>
    </motion.div>
  )
}
