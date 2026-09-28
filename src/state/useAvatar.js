import { getAvatars } from '../api/contenu'
import { useRessource } from '../lib/useRessource'
import { useProgression } from './useProgression'

/** L'avatar du joueur, ou le premier de la galerie tant qu'il n'a rien choisi. */
export function useAvatar() {
  const { avatar: choisi } = useProgression()
  const { donnees } = useRessource(getAvatars, [])
  const avatars = donnees ?? []
  return avatars.find((entree) => entree.id === choisi) ?? avatars[0] ?? null
}
