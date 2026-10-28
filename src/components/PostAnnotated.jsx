import { createElement } from 'react'
import { icone } from '../data/icones'
import { texteSur } from '../lib/contraste'
import ImagePost from './ImagePost'

const ZONES_TEXTE = ['SOURCE', 'TITRE', 'TEXTE', 'DATE', 'ENGAGEMENT', 'IMAGE']

const tonDe = (post) => (post.isFake ? 'faux' : 'vrai')

function Puce({ numero, ton }) {
  return <span className={`annot__puce annot__puce--${ton}`}>{numero}</span>
}

const numerosPour = (indices, cible) =>
  indices
    .map((indice, i) => (indice.cible === cible ? i + 1 : null))
    .filter((numero) => numero !== null)

function surlignage(indices, cible, ton) {
  if (!ZONES_TEXTE.includes(cible)) return ''
  return indices.some((indice) => indice.cible === cible) ? ` annot--vise annot--${ton}` : ''
}

function Marques({ indices, cible, ton }) {
  const numeros = numerosPour(indices, cible)
  if (numeros.length === 0) return null

  return (
    <span className="annot__marques">
      {numeros.map((numero) => (
        <Puce key={numero} numero={numero} ton={ton} />
      ))}
    </span>
  )
}

export function ListeIndices({ post }) {
  const indices = post.indices ?? []
  if (indices.length === 0) return null

  return (
    <ol className={`annot__liste annot__liste--${tonDe(post)}`}>
      {indices.map((indice, i) => (
        <li key={i} className="indice">
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
  const ton = tonDe(post)
  const surligne = (cible) => surlignage(indices, cible, ton)

  return (
    <article className="annot">
      <header className="annot__head">
        <span className="annot__avatar" style={{ backgroundColor: post.sourceColor, color: texteSur(post.sourceColor) }}>
          {post.source[0]?.toUpperCase() || '?'}
        </span>
        <div className="annot__identite">
          <p className={`annot__compte${surligne('SOURCE')}`}>
            {post.source}
            <Marques indices={indices} ton={ton} cible="SOURCE" />
          </p>
          <p className={`annot__domaine${surligne('DATE')}`}>
            {post.domain || 'post sponsorisé'} · {post.date}
            <Marques indices={indices} ton={ton} cible="DATE" />
          </p>
        </div>
      </header>

      <p className={`annot__titre${surligne('TITRE')}`}>
        {post.titre}
        <Marques indices={indices} ton={ton} cible="TITRE" />
      </p>

      <p className={`annot__texte${surligne('TEXTE')}`}>
        {post.texte}
        <Marques indices={indices} ton={ton} cible="TEXTE" />
      </p>

      {post.image && (
        <div className={`annot__photo${surligne('IMAGE')}`}>
          <ImagePost post={post} className="annot__image" />
          <Marques indices={indices} ton={ton} cible="IMAGE" />
        </div>
      )}

      {liste && <ListeIndices post={post} />}
    </article>
  )
}
