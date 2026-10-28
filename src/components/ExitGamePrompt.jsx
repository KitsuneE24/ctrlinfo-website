import { Link } from 'react-router'
import { Download } from 'lucide-react'
import { PATHS } from '../routes'

export default function ExitGamePrompt({ onConfirm, onCancel }) {
  return (
    <div className="voile gate anim-apparait">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-prompt-title"
        className="fenetre gate__fenetre anim-surgit"
      >
        <h2 id="exit-prompt-title" className="fenetre__titre">
          Déjà fini&nbsp;?
        </h2>
        <p className="fenetre__texte">
          Vos réponses et votre niveau sont gardés. Seule cette manche
          recommencera.
        </p>

        <div className="fenetre__actions">
          <button type="button" onClick={onCancel} className="bouton bouton--plein">
            Continuer à jouer
          </button>
          <button type="button" onClick={onConfirm} className="bouton">
            Quitter quand même
          </button>
        </div>

        <div className="gate__aparte">
          <p className="gate__aparte-texte">Tu changes d'appareil&nbsp;?</p>
          <Link to={PATHS.profile} className="bouton bouton--petit gate__aparte-bouton">
            <Download size={15} strokeWidth={2.2} />
            Exporter mon code
          </Link>
        </div>
      </div>
    </div>
  )
}
