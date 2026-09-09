import { createElement } from 'react'
import { CircleUserRound } from 'lucide-react'
import { getAvatars } from '../api/contenu'
import { auMieux, choisirAvatar } from '../api/progression'
import { icone } from '../data/icones'
import { useRessource } from '../lib/useRessource'

/**
 * La galerie d'avatars.
 *
 * Comme partout, la base range un **nom** de pictogramme et une couleur : le
 * dessin est du code. Le choix part au serveur, mais l'écran ne l'attend pas —
 * se tromper de vignette ne doit pas coûter un aller-retour.
 */
export default function AvatarPicker({ choisi, onChoisi }) {
  const { donnees } = useRessource(getAvatars, [])

  const avatars = donnees ?? []
  if (avatars.length === 0) return null

  // Entièrement piloté par le parent : c'est lui qui connaît l'avatar du
  // serveur, et un état local doublerait cette vérité le temps du chargement.
  function poser(avatar) {
    const garde = choisi === avatar.id ? null : avatar
    // L'objet entier remonte : l'en-tête a besoin du picto et de la couleur,
    // pas seulement de l'identifiant.
    onChoisi?.(garde)
    auMieux(choisirAvatar(garde?.id ?? null))
  }

  return (
    <section className="card">
      <div className="card__body">
        <h2 className="card__title">Ton avatar</h2>
        <p className="card__text">
          Il apparaît sur ton profil. Sans lui, c'est l'initiale de ton pseudo.
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

/** L'avatar d'un joueur, ou son initiale. Le même dessin partout. */
export function AvatarJoueur({ avatar, pseudo, taille = 52 }) {
  const style = { width: taille, height: taille, background: avatar?.couleur }

  return (
    <span className="avatar-joueur" style={style}>
      {avatar ? (
        createElement(icone(avatar.picto), { size: taille * 0.5, strokeWidth: 1.8 })
      ) : pseudo ? (
        <span style={{ fontSize: taille * 0.38 }}>{pseudo[0]?.toUpperCase()}</span>
      ) : (
        <CircleUserRound size={taille * 0.58} strokeWidth={1.6} />
      )}
    </span>
  )
}
