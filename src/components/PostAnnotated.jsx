import { createElement, useState } from 'react'
import { icone } from '../data/icones'
import { texteSur } from '../lib/contraste'

/**
 * La publication rejouée, annotée : chaque indice numéroté est repris sur le
 * post, dans l'image et dans la liste. Sans zone, l'indice surligne sa `cible`.
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

/**
 * La classe de surlignage d'une partie de texte.
 *
 * Elle prend la nature du premier indice qui la vise : sur une publication
 * vraie, le surlignage était rouge alors que la pastille était verte.
 */
function surlignage(indices, cible) {
  if (!ZONES_TEXTE.includes(cible)) return ''
  const vise = indices.find((indice) => indice.cible === cible)
  return vise ? ` annot--vise annot--${vise.nature.toLowerCase()}` : ''
}

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

/** Les indices numérotés, séparables du post : sur ordinateur ils vont à côté. */
export function ListeIndices({ post }) {
  const indices = post.indices ?? []
  if (indices.length === 0) return null

  return (
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
  )
}

export default function PostAnnotated({ post, liste = true }) {
  const indices = post.indices ?? []
  const surligne = (cible) => surlignage(indices, cible)
  // Image retirée par le média : on la masque.
  const [imageCassee, setImageCassee] = useState(null)
  const image = post.image !== imageCassee ? post.image : null

  return (
    <article className="annot">
      <header className="annot__head">
        <span className="annot__avatar" style={{ backgroundColor: post.sourceColor, color: texteSur(post.sourceColor) }}>
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

      {image && (
        <div className="annot__media">
          <img src={image} alt="" className="annot__image" onError={() => setImageCassee(image)} />
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

      {liste && <ListeIndices post={post} />}
    </article>
  )
}
