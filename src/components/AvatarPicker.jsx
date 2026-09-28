import { createElement } from 'react'
import { CircleUserRound } from 'lucide-react'
import { icone } from '../data/icones'
import { noterAvatar } from '../state/progression'

/**
 * La galerie d'avatars, ouverte au clic sur la photo et refermée au choix.
 *
 * La base range un nom de pictogramme et une couleur ; le dessin est du code.
 */
export default function AvatarPicker({ avatars = [], choisi, onChoisi }) {
  if (avatars.length === 0) return null

  function poser(avatar) {
    noterAvatar(choisi === avatar.id ? null : avatar.id)
    onChoisi?.()
  }

  return (
    <ul className="avatars">
      {avatars.map((avatar) => {
        const actif = choisi === avatar.id
        return (
          <li key={avatar.id}>
            <button
              type="button"
              onClick={() => poser(avatar)}
              aria-pressed={actif}
              title={avatar.nom}
              className={`avatars__choix${actif ? ' avatars__choix--actif' : ''}`}
              style={{ background: avatar.couleur }}
            >
              {createElement(icone(avatar.picto), { size: 24, strokeWidth: 1.9 })}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/** L'avatar du joueur. Le même dessin partout. */
export function AvatarJoueur({ avatar, taille = 52 }) {
  const style = { width: taille, height: taille, background: avatar?.couleur }

  return (
    <span className="avatar-joueur" style={style}>
      {avatar ? (
        createElement(icone(avatar.picto), { size: taille * 0.5, strokeWidth: 1.8 })
      ) : (
        <CircleUserRound size={taille * 0.58} strokeWidth={1.6} />
      )}
    </span>
  )
}
