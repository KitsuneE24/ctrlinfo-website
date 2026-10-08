import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { Save } from 'lucide-react'
import { PATHS } from '../routes'
import CadreCagou from './CadreCagou'

/** L'alerte de sortie de partie. */
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
        className="gate__cadre"
      >
        <CadreCagou>
          <h2 id="exit-prompt-title" className="gate__title">
            Quitter la partie&nbsp;?
          </h2>
          <p className="gate__text">
            Ce que tu as déjà répondu est gardé : les publications traitées et
            le niveau atteint restent acquis. Seule cette manche recommencera.
          </p>

          <div className="gate__actions">
            <button type="button" onClick={onCancel} className="gate__primary">
              Continuer à jouer
            </button>
            <button type="button" onClick={onConfirm} className="gate__secondary">
              Quitter quand même
            </button>
          </div>

          {/* Pas de `onConfirm` : changer d'adresse referme l'alerte tout seul. */}
          <div className="gate__aparte">
            <p className="gate__aparte-texte">Tu changes d'appareil&nbsp;?</p>
            <Link to={PATHS.profile} className="gate__aparte-bouton">
              <Save size={14} strokeWidth={2.2} />
              Exporter mon code
            </Link>
          </div>
        </CadreCagou>
      </motion.div>
    </motion.div>
  )
}
