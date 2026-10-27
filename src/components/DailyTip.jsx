import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, X } from 'lucide-react'
import { getDailyTip } from '../api/contenu'
import { useRessource } from '../lib/useRessource'
import { markSeenToday, seenToday } from '../lib/premiereFois'
import { chapterPath } from '../routes'
import CadreCagou from './CadreCagou'

const CLE = 'astuce-du-jour'

export default function DailyTip() {
  const { donnees } = useRessource(getDailyTip, [])
  const [ferme, setFerme] = useState(() => seenToday(CLE))

  const astuce = donnees
  const visible = Boolean(astuce) && !ferme

  function fermer() {
    markSeenToday(CLE)
    setFerme(true)
  }

  if (!visible) return null

  return (
    <div
      className="modal anim-apparait"
      onClick={fermer}
      role="dialog"
      aria-modal="true"
      aria-label="Le saviez-vous ?"
    >
      <div
        className="modal__cadre anim-surgit"
        onClick={(event) => event.stopPropagation()}
      >
        <CadreCagou>
          <button
            type="button"
            onClick={fermer}
            aria-label="Fermer"
            className="tip-card__fermer"
          >
            <X size={16} strokeWidth={2.2} />
          </button>

          <h2 className="modal__title">Le saviez-vous&nbsp;?</h2>
          <p className="modal__text">{astuce.texte}</p>

          <div className="modal__actions">
            {astuce.chapitre && (
              <Link
                to={chapterPath(astuce.chapitre.id)}
                onClick={fermer}
                className="bouton bouton--encre bouton--large"
              >
                {astuce.chapitre.onglet}
                <ArrowRight size={16} strokeWidth={2.2} />
              </Link>
            )}
            <button type="button" onClick={fermer} className="bouton bouton--large">
              Plus tard
            </button>
          </div>
        </CadreCagou>
      </div>
    </div>
  )
}
