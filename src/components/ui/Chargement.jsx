import { AlertTriangle, Loader2 } from 'lucide-react'

/** « Ça charge » et « le contenu n'a pas pu être lu ». */
export function Chargement({ quoi = 'le contenu' }) {
  return (
    <div className="etat-api" role="status" aria-live="polite">
      <Loader2 size={22} strokeWidth={2} className="etat-api__spinner" />
      <p className="etat-api__texte">Chargement de {quoi}…</p>
    </div>
  )
}

export function ErreurChargement({ erreur, onReessayer }) {
  return (
    <div className="etat-api etat-api--erreur" role="alert">
      <AlertTriangle size={22} strokeWidth={2} />
      <p className="etat-api__titre">Contenu indisponible</p>
      <p className="etat-api__texte">
        {erreur?.message ?? 'Le fichier donnees/contenu.json n’a pas pu être lu.'}
      </p>
      {onReessayer && (
        <button type="button" onClick={onReessayer} className="button">
          Réessayer
        </button>
      )}
    </div>
  )
}
