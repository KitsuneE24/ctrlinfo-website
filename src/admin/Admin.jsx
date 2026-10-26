import { useEffect, useState, useSyncExternalStore } from 'react'
import { Check, Save, TriangleAlert } from 'lucide-react'
import Formulaire from './Champs'
import {
  abonner,
  charger,
  contenu,
  enregistrer,
  nombreDeModifications,
} from './document'

/** Les collections éditables, et de quoi nommer une entrée dans la liste. */
const COLLECTIONS = [
  { cle: 'postsVrais', nom: 'Publications vraies', titre: (e) => e.titre },
  { cle: 'postsFaux', nom: 'Publications fausses', titre: (e) => e.titre },
  { cle: 'conversations', nom: 'Conversations', titre: (e) => e.name ?? e.id },
  { cle: 'chapitres', nom: 'Chapitres', titre: (e) => e.titre },
  { cle: 'stories', nom: 'Stories', titre: (e) => e.titre ?? e.id },
  { cle: 'astuces', nom: 'Astuces', titre: (e) => e.texte },
  { cle: 'ressources', nom: 'Ressources', titre: (e) => e.nom ?? e.titre ?? e.id },
  { cle: 'avatars', nom: 'Avatars', titre: (e) => e.nom },
  { cle: 'jeux', nom: 'Jeux', titre: (e) => e.titre },
  { cle: 'niveaux', nom: 'Niveaux', titre: (e) => e.titre },
  { cle: 'mentionsLegales', nom: 'Mentions légales', titre: (e) => e.titre },
]

function Barre() {
  const modifications = useSyncExternalStore(abonner, nombreDeModifications)
  const [etat, setEtat] = useState('repos')
  const [erreur, setErreur] = useState(null)

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

  // Quitter avec des modifications non enregistrées demande confirmation.
  useEffect(() => {
    if (modifications === 0) return undefined
    const avant = (e) => e.preventDefault()
    window.addEventListener('beforeunload', avant)
    return () => window.removeEventListener('beforeunload', avant)
  }, [modifications])

  return (
    <div className="barre">
      <span className="barre__titre">CTRL INFO — administration</span>

      {erreur ? (
        <span className="barre__erreur">
          <TriangleAlert size={15} strokeWidth={2.2} />
          {erreur}
        </span>
      ) : (
        <span className="barre__compte">
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
        className="bouton"
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

export default function Admin() {
  const [pret, setPret] = useState(false)
  const [erreur, setErreur] = useState(null)
  const [collection, setCollection] = useState(COLLECTIONS[0].cle)
  const [index, setIndex] = useState(0)
  const [filtre, setFiltre] = useState('')

  useEffect(() => {
    charger()
      .then(() => setPret(true))
      .catch((echec) => setErreur(echec.message))
  }, [])

  if (erreur) return <p className="vide">{erreur}</p>
  if (!pret) return <p className="vide">Chargement du contenu…</p>

  const doc = contenu()
  const reglage = COLLECTIONS.find((c) => c.cle === collection)
  const entrees = Array.isArray(doc[collection]) ? doc[collection] : []

  const cherche = filtre.trim().toLowerCase()
  const visibles = entrees
    .map((entree, i) => ({ entree, i }))
    .filter(
      ({ entree }) =>
        cherche === '' || (reglage.titre(entree) ?? '').toLowerCase().includes(cherche)
    )

  const choisie = entrees[index]

  return (
    <>
      <Barre />

      <div className="atelier">
        <nav className="onglets">
          {COLLECTIONS.map((c) => {
            const nombre = Array.isArray(doc[c.cle]) ? doc[c.cle].length : 0
            return (
              <button
                key={c.cle}
                type="button"
                onClick={() => {
                  setCollection(c.cle)
                  setIndex(0)
                  setFiltre('')
                }}
                className={`onglet${c.cle === collection ? ' onglet--actif' : ''}`}
              >
                {c.nom}
                <span className="onglet__compte">{nombre}</span>
              </button>
            )
          })}
        </nav>

        <aside className="liste-entrees">
          <input
            type="search"
            value={filtre}
            onChange={(e) => setFiltre(e.target.value)}
            placeholder="Filtrer…"
            className="ch__saisie"
          />
          <ul>
            {visibles.map(({ entree, i }) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`entree${i === index ? ' entree--active' : ''}`}
                >
                  {reglage.titre(entree) || `(sans titre — ${i + 1})`}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="editeur">
          {choisie ? (
            <Formulaire key={`${collection}-${index}`} objet={choisie} />
          ) : (
            <p className="vide">Rien à éditer dans cette collection.</p>
          )}
        </main>
      </div>
    </>
  )
}
