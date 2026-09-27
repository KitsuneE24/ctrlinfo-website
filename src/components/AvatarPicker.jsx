import { createElement } from 'react'
import { CircleUserRound } from 'lucide-react'
import { icone } from '../data/icones'
import { noterAvatar } from '../state/progression'

/**
 * La galerie d'avatars.
 *
 * Comme partout, la base range un **nom** de pictogramme et une couleur : le
 * dessin est du code. Le choix, lui, ne part plus nulle part : il est retenu
 * par le navigateur, avec le reste de la progression, et voyage donc dans le
 * code d'export.
 */
export default function AvatarPicker({ avatars = [], choisi }) {
  if (avatars.length === 0) return null

  // La galerie vient de l'écran, qui la charge déjà pour dessiner l'avatar en
  // tête : deux appels pour la même liste n'auraient rien apporté. Le choix ne
  // remonte pas non plus — il va dans le magasin, que l'écran relit.
  function poser(avatar) {
    noterAvatar(choisi === avatar.id ? null : avatar.id)
  }

  return (
    <section className="card">
      <div className="card__body">
        <h2 className="card__title">Ton avatar</h2>
        <p className="card__text">
          Il apparaît en tête de cet écran, et suit ton code de progression.
        </p>

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
      </div>
    </section>
  )
}

/**
 * L'avatar du joueur. Le même dessin partout.
 *
 * Plus d'initiale en repli : il n'y a plus de pseudo à réduire à sa première
 * lettre. Sans avatar choisi, c'est une silhouette.
 */
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
