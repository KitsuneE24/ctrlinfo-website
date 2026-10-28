import { etatProgression, sauverConversation } from './progression'

export function getSession(slug) {
  return etatProgression().conversations[slug]?.encours ?? null
}

export function saveSession(slug, state) {
  sauverConversation(slug, state)
}
