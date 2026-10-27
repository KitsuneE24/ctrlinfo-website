import { useState } from 'react'
import { lienWeb } from '../lib/lienWeb'

// Photo libre d'un post. Le crédit n'apparaît qu'à la correction : dans le fil, il trahirait la réponse.
export default function ImagePost({ post, className = '', avecCredit = true }) {
  const [cassee, setCassee] = useState(null)
  if (!post.image || post.image === cassee) return null
  const credit = post.credit
  const page = lienWeb(credit?.page)

  return (
    <figure className={`image-post ${className}`}>
      <img
        src={post.image}
        alt={post.imageAlt ?? ''}
        loading="lazy"
        className="image-post__photo"
        onError={() => setCassee(post.image)}
      />
      {avecCredit && credit?.auteur && (
        <figcaption className="image-post__credit">
          Photo : {credit.auteur},{' '}
          {page ? (
            <a href={page} target="_blank" rel="noopener noreferrer">
              {credit.licence}
            </a>
          ) : (
            credit.licence
          )}
        </figcaption>
      )}
    </figure>
  )
}
