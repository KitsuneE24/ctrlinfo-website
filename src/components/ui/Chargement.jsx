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
        {import.meta.env.DEV && erreur?.message
          ? erreur.message
          : 'Le jeu n’a pas pu se charger. Vérifiez votre connexion, puis réessayez.'}
      </p>
      {onReessayer && (
        <button type="button" onClick={onReessayer} className="bouton bouton--plein bouton--large">
          Réessayer
        </button>
      )}
    </div>
  )
}
