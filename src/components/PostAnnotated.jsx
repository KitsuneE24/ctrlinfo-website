import { createElement } from 'react'
import { icone } from '../data/icones'

/**
 * La publication rejouée, annotée.
 *
 * Chaque indice porte un numéro ; ce numéro se retrouve à trois endroits — sur
 * la publication, sur le cadre tracé dans l'image, et dans la liste
 * d'explications juste en dessous. C'est ce qui permet de dire « regarde ici »
 * sans une phrase de plus.
 *
 * Les indices sans zone désignent une partie du texte (`cible`) : celle-ci se
 * surligne au lieu de s'entourer. Une publication sans indice — celles que la
 * chaîne RSS fabrique aujourd'hui — s'affiche telle quelle, sans annotation.
 */
const ZONES_TEXTE = ['SOURCE', 'TITRE', 'TEXTE', 'DATE', 'ENGAGEMENT']

function Puce({ numero, nature }) {
  return <span className={`annot__puce annot__puce--${nature.toLowerCase()}`}>{numero}</span>
}

/** Les numéros des indices qui visent cette partie de la publication. */
const numerosPour = (indices, cible) =>
  indices
    .map((indice, i) => (indice.cible === cible ? i + 1 : null))
    .filter((numero) => numero !== null)

function Marques({ indices, cible }) {
  const numeros = numerosPour(indices, cible)
  if (numeros.length === 0) return null

  return (
    <span className="annot__marques">
      {numeros.map((numero) => (
        <Puce
          key={numero}
          numero={numero}
          nature={indices[numero - 1].nature}
        />
      ))}
    </span>
  )
}

export default function PostAnnotated({ post }) {
  const indices = post.indices ?? []
  const surligne = (cible) =>
    ZONES_TEXTE.includes(cible) && numerosPour(indices, cible).length > 0
      ? ' annot--vise'
      : ''

  return (
    <article className="annot">
      <header className="annot__head">
        <span className="annot__avatar" style={{ backgroundColor: post.sourceColor }}>
          {post.source[0]?.toUpperCase() || '?'}
        </span>
        <div className="annot__identite">
          <p className={`annot__compte${surligne('SOURCE')}`}>
            {post.source}
            <Marques indices={indices} cible="SOURCE" />
          </p>
          <p className={`annot__domaine${surligne('DATE')}`}>
            {post.domain || 'publication sponsorisée'} · {post.date}
            <Marques indices={indices} cible="DATE" />
          </p>
        </div>
      </header>

      <p className={`annot__titre${surligne('TITRE')}`}>
        {post.titre}
        <Marques indices={indices} cible="TITRE" />
      </p>

      <p className={`annot__texte${surligne('TEXTE')}`}>
        {post.texte}
        <Marques indices={indices} cible="TEXTE" />
      </p>

      {post.image && (
        <div className="annot__media">
          <img src={post.image} alt="" className="annot__image" />
          {indices.map((indice, i) =>
            indice.zone ? (
              <span
                key={i}
                className={`annot__cadre annot__cadre--${indice.nature.toLowerCase()}`}
                style={{
                  left: `${indice.zone.x}%`,
                  top: `${indice.zone.y}%`,
                  width: `${indice.zone.l}%`,
                  height: `${indice.zone.h}%`,
                }}
              >
                <Puce numero={i + 1} nature={indice.nature} />
              </span>
            ) : null
          )}
        </div>
      )}

      {indices.length > 0 && (
        <ol className="annot__liste">
          {indices.map((indice, i) => (
            <li key={i} className={`indice indice--${indice.nature.toLowerCase()}`}>
              <span className="indice__picto">
                {createElement(icone(indice.picto), { size: 17, strokeWidth: 2 })}
              </span>
              <div className="indice__corps">
                <p className="indice__libelle">
                  <span className="indice__numero">{i + 1}</span>
                  {indice.libelle}
                </p>
                <p className="indice__texte">{indice.explication}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </article>
  )
}
