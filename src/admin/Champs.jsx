import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { ajouter, deplacer, modifier, retirer } from './document'

const LONGS = new Set([
  'texte',
  'explication',
  'resume',
  'chapo',
  'analyseVrai',
  'analyseFaux',
  'encouragement',
  'warning',
  'sousTitre',
  'preview',
  'reply',
])

const FIGES = new Set(['id', 'slug', 'origine', 'article', 'version', 'genere'])

const etiquette = (cle) =>
  cle.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())

function ChampTexte({ sur, cle }) {
  const valeur = sur[cle] ?? ''
  const long = LONGS.has(cle) || valeur.length > 90

  return (
    <label className="ch">
      <span className="ch__nom">{etiquette(cle)}</span>
      {long ? (
        <textarea
          defaultValue={valeur}
          rows={Math.min(8, Math.ceil(valeur.length / 70) + 1)}
          onBlur={(e) => modifier(sur, cle, e.target.value)}
          className="ch__saisie"
        />
      ) : (
        <input
          type="text"
          defaultValue={valeur}
          onBlur={(e) => modifier(sur, cle, e.target.value)}
          className="ch__saisie"
        />
      )}
    </label>
  )
}

function ChampNombre({ sur, cle }) {
  return (
    <label className="ch ch--court">
      <span className="ch__nom">{etiquette(cle)}</span>
      <input
        type="number"
        defaultValue={sur[cle] ?? 0}
        onBlur={(e) => modifier(sur, cle, Number(e.target.value))}
        className="ch__saisie"
      />
    </label>
  )
}

function ChampBooleen({ sur, cle }) {
  return (
    <label className="ch ch--case">
      <input
        type="checkbox"
        defaultChecked={sur[cle] === true}
        onChange={(e) => modifier(sur, cle, e.target.checked)}
      />
      <span className="ch__nom">{etiquette(cle)}</span>
    </label>
  )
}

function ChampListe({ sur, cle, profondeur }) {
  const liste = sur[cle]
  const modele = () => {
    const premier = liste[0]
    if (premier === undefined) return ''
    if (typeof premier !== 'object' || premier === null) return ''
    return Object.fromEntries(
      Object.entries(premier).map(([k, v]) => [k, Array.isArray(v) ? [] : typeof v === 'number' ? 0 : typeof v === 'boolean' ? false : ''])
    )
  }

  return (
    <div className="liste">
      <div className="liste__tete">
        <span className="ch__nom">
          {etiquette(cle)} <span className="liste__compte">{liste.length}</span>
        </span>
        <button type="button" onClick={() => ajouter(liste, modele())} className="bouton bouton--mince">
          <Plus size={14} strokeWidth={2.4} />
          Ajouter
        </button>
      </div>

      {liste.map((entree, i) => (
        <div key={i} className="liste__entree">
          <div className="liste__outils">
            <span className="liste__rang">{i + 1}</span>
            <button type="button" onClick={() => deplacer(liste, i, -1)} aria-label="Monter">
              <ChevronUp size={15} strokeWidth={2.2} />
            </button>
            <button type="button" onClick={() => deplacer(liste, i, 1)} aria-label="Descendre">
              <ChevronDown size={15} strokeWidth={2.2} />
            </button>
            <button
              type="button"
              onClick={() => window.confirm(`Retirer l’élément n° ${i + 1} ?`) && retirer(liste, i)}
              aria-label="Retirer"
            >
              <Trash2 size={14} strokeWidth={2.2} />
            </button>
          </div>

          {typeof entree === 'object' && entree !== null ? (
            <Formulaire objet={entree} profondeur={profondeur + 1} />
          ) : (
            <input
              type="text"
              defaultValue={String(entree)}
              onBlur={(e) => modifier(liste, i, e.target.value)}
              className="ch__saisie"
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default function Formulaire({ objet, profondeur = 0 }) {
  return (
    <div className={`form form--${Math.min(profondeur, 2)}`}>
      {Object.entries(objet).map(([cle, valeur]) => {
        if (FIGES.has(cle)) return null
        if (Array.isArray(valeur)) {
          return <ChampListe key={cle} sur={objet} cle={cle} profondeur={profondeur} />
        }
        if (valeur !== null && typeof valeur === 'object') {
          return (
            <fieldset key={cle} className="bloc">
              <legend className="bloc__nom">{etiquette(cle)}</legend>
              <Formulaire objet={valeur} profondeur={profondeur + 1} />
            </fieldset>
          )
        }
        if (typeof valeur === 'boolean') return <ChampBooleen key={cle} sur={objet} cle={cle} />
        if (typeof valeur === 'number') return <ChampNombre key={cle} sur={objet} cle={cle} />
        return <ChampTexte key={cle} sur={objet} cle={cle} />
      })}
    </div>
  )
}
