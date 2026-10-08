/**
 * Le contenu du jeu, lu dans donnees/contenu.json.
 *
 * Il venait de l'API ; c'est un fichier servi à côté du site, chargé une fois
 * (state/contenu.js). Les formes n'ont pas changé : les écrans lisent le même
 * vocabulaire (`date`, `scores`, `steps.choices`, `apercu`…).
 */
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

/** Une manche : le tirage que le serveur composait (voir lib/tirage.js). */
export const getTirage = (level, { taille, themes, vus } = {}) =>
  chargerContenu().then((c) =>
    tirer(c.posts, {
      level,
      taille: taille ?? c.niveaux.find((n) => n.level === level)?.taille ?? 5,
      themes,
      vus,
    })
  )
