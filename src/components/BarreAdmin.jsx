import { useState, useSyncExternalStore } from 'react'
import { Check, Save, TriangleAlert } from 'lucide-react'
import { abonner, enregistrer, estAdmin, nombreDeModifications } from '../state/contenu'

/** La barre d'administration : ce qui attend d'être enregistré, et le bouton. */
export default function BarreAdmin() {
  const modifications = useSyncExternalStore(abonner, nombreDeModifications)
  const [etat, setEtat] = useState('repos')
  const [erreur, setErreur] = useState(null)

  if (!estAdmin()) return null

  async function envoyer() {
    setEtat('envoi')
    setErreur(null)
    try {
      await enregistrer()
      setEtat('fait')
    } catch (echec) {
      setErreur(echec.message)
      setEtat('repos')
    }
  }

  return (
    <div className="barre-admin" role="status">
      <span className="barre-admin__etiquette">Édition</span>

      {erreur ? (
        <span className="barre-admin__erreur">
          <TriangleAlert size={14} strokeWidth={2.2} />
          {erreur}
        </span>
      ) : (
        <span className="barre-admin__compte">
          {modifications === 0
            ? etat === 'fait'
              ? 'Enregistré'
              : 'Aucune modification'
            : `${modifications} modification${modifications > 1 ? 's' : ''}`}
        </span>
      )}

      <button
        type="button"
        onClick={envoyer}
        disabled={modifications === 0 || etat === 'envoi'}
        className="barre-admin__bouton"
      >
        {etat === 'fait' && modifications === 0 ? (
          <Check size={15} strokeWidth={2.4} />
        ) : (
          <Save size={15} strokeWidth={2.2} />
        )}
        {etat === 'envoi' ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </div>
  )
}
