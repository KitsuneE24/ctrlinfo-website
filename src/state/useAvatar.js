import { getAvatars } from '../api/contenu'
import { useRessource } from '../lib/useRessource'
import { useProgression } from './useProgression'

export function useAvatar() {
  const { avatar: choisi } = useProgression()
  const { donnees } = useRessource(getAvatars, [])
  const avatars = donnees ?? []
  return avatars.find((entree) => entree.id === choisi) ?? avatars[0] ?? null
}
