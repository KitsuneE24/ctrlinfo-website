import { Fragment } from 'react'

export default function Riche({ texte }) {
  if (typeof texte !== 'string') return null
  return texte.split(/\*\*(.+?)\*\*/g).map((morceau, i) =>
    i % 2 === 1 ? <strong key={i}>{morceau}</strong> : <Fragment key={i}>{morceau}</Fragment>
  )
}
