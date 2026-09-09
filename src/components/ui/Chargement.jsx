import { AlertTriangle, Loader2 } from 'lucide-react'

/**
 * Les deux écrans qu'on ne pouvait pas avoir avant : « ça charge » et « l'API
 * ne répond pas ».
 *
 * Le contenu venant maintenant du serveur, il n'y a plus de repli local : si
 * l'API est éteinte, mieux vaut le dire franchement, avec la commande pour la
 * relancer, que d'afficher une page vide.
 */
export function Chargement({ quoi = 'le contenu' }) {
  return (
    <div className="etat-api" role="status" aria-live="polite">
      <Loader2 size={22} strokeWidth={2} className="etat-api__spinner" />
      <p className="etat-api__texte">Chargement de {quoi}…</p>
    </div>
  )
}

export function ErreurChargement({ erreur, onReessayer }) {
  const injoignable = erreur?.statut === undefined

  return (
    <div className="etat-api etat-api--erreur" role="alert">
      <AlertTriangle size={22} strokeWidth={2} />
      <p className="etat-api__titre">
        {injoignable ? "L'API ne répond pas" : 'Contenu indisponible'}
      </p>
      <p className="etat-api__texte">
        {injoignable
          ? "Le jeu lit son contenu dans ctrlinfo-app. Vérifie que l'API tourne : « docker compose up -d db » puis « npm run start:dev »."
          : erreur.message}
      </p>
      {onReessayer && (
        <button type="button" onClick={onReessayer} className="button">
          Réessayer
        </button>
      )}
    </div>
  )
}
