import { Link } from 'react-router'
import { Save } from 'lucide-react'
import { PATHS } from '../routes'

/**
 * Le rappel du code de progression : la phrase, et le bouton pour y aller.
 *
 * Trois moments le montrent — avant de jouer, en quittant une partie, à la fin
 * d'une partie. Une seule formulation, à corriger en un seul endroit.
 */
export default function RappelDeCode({ className = '' }) {
  return (
    <div className={`rappel-code ${className}`.trim()}>
      <p className="rappel-code__texte">
        Ta progression est gardée dans ce navigateur. Exporte ton code pour la
        retrouver sur un autre appareil.
      </p>
      <Link to={PATHS.profile} className="rappel-code__bouton">
        <Save size={15} strokeWidth={2.2} />
        Exporter mon code
      </Link>
    </div>
  )
}
