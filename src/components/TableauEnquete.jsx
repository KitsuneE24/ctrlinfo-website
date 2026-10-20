import Filaments from './ui/Filaments'
import { useFilRouge } from '../lib/useFilRouge'

/**
 * Tableau d'enquête de l'accueil. Le fil rouge est mesuré à chaque
 * redimensionnement, de punaise à punaise.
 * Ordinateur : chaque pièce vers `vers`. Téléphone : pièces reliées dans l'ordre de lecture.
 * Enfants : fonction recevant `epingler`.
 * Chaque pièce : `ref={epingler(id, { vers, pointille })}`.
 */

/** Le tracé mesuré par `useFilRouge`. */
export function FilsRouges({ fils }) {
  return (
    <svg
      aria-hidden="true"
      className="tableau__fils"
      width={fils.largeur}
      height={fils.hauteur}
      viewBox={`0 0 ${fils.largeur || 1} ${fils.hauteur || 1}`}
    >
      {fils.traces.map(({ id, d, pointille }) => (
        <path key={id} d={d} strokeDasharray={pointille ? '6 6' : undefined} />
      ))}
    </svg>
  )
}

/** Le liège, le fil et les pièces. */
export default function TableauEnquete({ children }) {
  const { tableau, epingler, fils } = useFilRouge()

  return (
    <div ref={tableau} className="tableau">
      <Filaments forme="swirl" tourne className="tableau__filaments" />
      <FilsRouges fils={fils} />
      {children(epingler)}
    </div>
  )
}
