import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router'
import { ArrowRight, Lightbulb, X } from 'lucide-react'
import { getDailyTip } from '../api/contenu'
import { useRessource } from '../lib/useRessource'
import { markSeenToday, seenToday } from '../lib/premiereFois'
import { chapterPath } from '../routes'

/** La clé de mémoire : une brève par jour, pas une par visite. */
const CLE = 'astuce-du-jour'

/**
 * « Le saviez-vous ? » — la brève d'arrivée.
 *
 * Deux phrases, un lien vers le thème qui va plus loin, et c'est tout. Elle ne
 * revient pas dans la journée : quelqu'un qui navigue entre les onglets ne
 * doit pas la revoir dix fois.
 *
 * Elle ne s'affiche pas non plus tant que l'API n'a rien renvoyé — une fenêtre
 * vide vaut moins que pas de fenêtre.
 */
export default function DailyTip() {
  const { donnees } = useRessource(getDailyTip, [])
  const [ferme, setFerme] = useState(() => seenToday(CLE))

  const astuce = donnees
  const visible = Boolean(astuce) && !ferme

  function fermer() {
    markSeenToday(CLE)
    setFerme(true)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="modal"
          onClick={fermer}
          role="dialog"
          aria-modal="true"
          aria-label="Le saviez-vous ?"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 14 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="modal__card tip-card"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={fermer}
              aria-label="Fermer"
              className="tip-card__fermer"
            >
              <X size={18} strokeWidth={2.2} />
            </button>

            <span className="modal__badge">
              <Lightbulb size={26} strokeWidth={2} />
            </span>

            <h2 className="modal__title">Le saviez-vous&nbsp;?</h2>
            <p className="modal__text">{astuce.texte}</p>

            <div className="modal__actions">
              {astuce.chapitre && (
                <Link
                  to={chapterPath(astuce.chapitre.id)}
                  onClick={fermer}
                  className="button"
                >
                  {astuce.chapitre.onglet}
                  <ArrowRight size={16} strokeWidth={2.2} />
                </Link>
              )}
              <button type="button" onClick={fermer} className="button button--ghost">
                Plus tard
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
