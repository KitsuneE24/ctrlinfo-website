import { useSyncExternalStore } from 'react'
import { getConversations } from '../api/contenu'
import { useRessource } from '../lib/useRessource'
import { abonnerGeneres, versionGeneres } from './generes'
import { useProgression } from './useProgression'

export const contactDe = (conversation) => conversation.contact ?? conversation.id

export function parContact(conversations) {
  const contacts = new Map()
  for (const conversation of conversations) {
    const cle = contactDe(conversation)
    if (!contacts.has(cle)) contacts.set(cle, [])
    contacts.get(cle).push(conversation)
  }
  return [...contacts.values()]
}

// Le sujet affiché pour un contact : le premier pas encore fait.
export const sujetCourant = (sujets, avancement) =>
  sujets.find((c) => avancement[c.id]?.faite !== true) ?? sujets[sujets.length - 1]

// Non lu tant qu'aucune conversation du contact n'a été ouverte.
export const estNonLu = (sujets, avancement) => sujets.every((c) => !avancement[c.id])

export function useContactsNonLus() {
  const version = useSyncExternalStore(abonnerGeneres, versionGeneres)
  const { donnees } = useRessource(getConversations, [version])
  const { conversations: avancement } = useProgression()
  return parContact(donnees ?? []).filter((sujets) => estNonLu(sujets, avancement)).length
}
