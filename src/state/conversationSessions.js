import {
  etatProgression,
  oublierConversation,
  sauverConversation,
} from './progression'

// Conversations en cours, indexées par slug et persistées via la progression.

let runIds = {}

export function getRunIds() {
  return runIds
}

export function saveRunIds(next) {
  runIds = next
}

export function getSession(slug) {
  return etatProgression().conversations[slug]?.encours ?? null
}

export function saveSession(slug, state) {
  sauverConversation(slug, state)
}

export function clearSession(slug) {
  oublierConversation(slug)
}
