/**
 * Le contenu du jeu, lu dans donnees/contenu.json (chargé une fois, state/contenu.js).
 */
import { reglesDuNiveau } from '../lib/niveaux'
import { tirer } from '../lib/tirage'
import { chargerContenu } from '../state/contenu'

const depuis = (extraire) => () => chargerContenu().then(extraire)

export const getAvatars = depuis((c) => c.avatars)
export const getJeux = depuis((c) => c.jeux)
export const getStories = depuis((c) => c.stories)
export const getRemediations = depuis((c) => c.remediations)
export const getNiveaux = depuis((c) => c.niveaux)
export const getConversations = depuis((c) => c.conversations)
export const getChapitres = depuis((c) => c.chapitres)
export const getMentionsLegales = depuis((c) => c.mentionsLegales ?? [])

/** La brève du jour : l'index vient du quantième, pas du hasard. */
export const getDailyTip = depuis((c) => {
  if (c.astuces.length === 0) return null
  const jours = Math.floor(Date.now() / 86_400_000)
  return c.astuces[jours % c.astuces.length]
})

const un = (liste, id) => {
  const trouve = liste.find((entree) => entree.id === id)
  if (!trouve) throw new Error(`« ${id} » est introuvable.`)
  return trouve
}

export const getConversation = (slug) =>
  chargerContenu().then((c) => un(c.conversations, slug))

export const getChapitre = (slug) => chargerContenu().then((c) => un(c.chapitres, slug))

/** Une manche tirée au sort (voir lib/tirage.js). */
export const getTirage = (level, { taille, vus } = {}) =>
  chargerContenu().then((c) =>
    tirer(c.posts, {
      level,
      taille: taille ?? reglesDuNiveau(c.niveaux, level)?.taille ?? 5,
      vus,
    })
  )
