import { createElement } from 'react'
import { CircleUserRound } from 'lucide-react'
import { icone } from '../data/icones'
import { noterAvatar } from '../state/progression'

function Dessin({ avatar, taille }) {
  if (avatar?.image) {
    return (
      <span
        className="avatar-joueur__image"
        style={{ backgroundImage: `url(/${avatar.image})` }}
      />
    )
  }
  if (avatar?.picto) {
    return createElement(icone(avatar.picto), { size: taille * 0.5, strokeWidth: 1.8 })
  }
  return <CircleUserRound size={taille * 0.58} strokeWidth={1.6} />
}

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
              aria-label={avatar.nom}
              title={avatar.nom}
              className={`avatars__choix${actif ? ' avatars__choix--actif' : ''}${
                avatar.image ? ' avatars__choix--dessin' : ''
              }`}
              style={
                avatar.image
                  ? { borderColor: avatar.couleur }
                  : { background: avatar.couleur }
              }
            >
              <Dessin avatar={avatar} taille={52} />
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export function AvatarJoueur({ avatar, taille = 52 }) {
  return (
    <span
      className={`avatar-joueur${avatar?.image ? ' avatar-joueur--dessin' : ''}`}
      style={{
        width: taille,
        height: taille,
        ...(avatar?.image
          ? { borderColor: avatar.couleur }
          : { background: avatar?.couleur }),
      }}
    >
      <Dessin avatar={avatar} taille={taille} />
    </span>
  )
}
