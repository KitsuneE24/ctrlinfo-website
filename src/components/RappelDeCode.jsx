import { Link } from 'react-router'
import { Save } from 'lucide-react'
import { PATHS } from '../routes'

/**
 * Le rappel du code de progression.
 *
 * Il remplace les « Sans compte, les scores ne seront pas enregistrés » qui
 * traînaient dans l'écran de départ et l'alerte de sortie. Le message a changé
 * de nature : il n'y a plus rien à créer pour que la progression compte, elle
 * compte déjà. Ce qu'il reste à dire, c'est qu'elle vit dans *ce* navigateur, et
 * qu'un code permet de l'emporter.
 *
 * Trois moments le montrent — avant de jouer, en quittant une partie, à la fin
 * d'une partie —, d'où ce composant : une seule formulation, à corriger en un
 * seul endroit. Un message d'alerte qui varie d'un écran à l'autre se lit comme
 * deux règles différentes.
 */
export default function RappelDeCode({ className = '' }) {
  return (
    <p className={`rappel-code ${className}`.trim()}>
      <Save size={14} strokeWidth={2.2} />
      <span>
        Ta progression est gardée dans ce navigateur.{' '}
        <Link to={PATHS.profile} className="rappel-code__lien">
          Exporte ton code
        </Link>{' '}
        pour la retrouver sur un autre appareil.
      </span>
    </p>
  )
}
