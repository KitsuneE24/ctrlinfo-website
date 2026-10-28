import { reglesDuNiveau } from '../lib/niveaux'
import { fabriquerConversations, fabriquerPublications } from '../lib/fabriquer'
import { inedites, tirer } from '../lib/tirage'
import { chargerContenu, plusAutorise } from '../state/contenu'
import { ajouterGeneres } from '../state/generes'

const depuis = (extraire) => () => chargerContenu().then(extraire)

export const getAvatars = depuis((c) => c.avatars)
export const getJeux = depuis((c) => c.jeux)
export const getStories = depuis((c) => c.stories)
export const getRemediations = depuis((c) => c.remediations)
export const getNiveaux = depuis((c) => c.niveaux)
export const getConversations = depuis((c) => c.conversations)
export const getChapitres = depuis((c) => c.chapitres)
// Crédits tirés des banques : une photo ajoutée y apparaît d'elle-même.
function creditsPhotos(c) {
  const images = [...(c.faits ?? []), ...(c.scenarios ?? [])].map((base) => base.image).filter((i) => i?.page)
  const uniques = [...new Map(images.map((i) => [i.fichier, i])).values()]
  if (uniques.length === 0) return []
  return [
    {
      id: 'credits-photos',
      titre: 'Crédits photos',
      paragraphes: [
        { texte: 'Photos de Wikimedia Commons, dans le domaine public ou sous licence libre. Celles des événements inventés sont des photos d’illustration, prises ailleurs et sans lien avec le post.' },
        { texte: uniques.map((i) => `• ${i.alt} : ${i.auteur}, ${i.licence}, ${i.page}`).join('\n') },
      ],
    },
  ]
}

export const getMentionsLegales = depuis((c) => [...(c.mentionsLegales ?? []), ...creditsPhotos(c)])

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

export const getTirageEtReste = (level, { vus } = {}) =>
  chargerContenu().then((c) => {
    const taille = reglesDuNiveau(c.niveaux, level)?.taille ?? 5
    return {
      tirage: tirer(c.posts, { level, taille, vus }),
      reste: inedites(c.posts, { level, vus }),
      taille,
      plus: plusAutorise(c, 'feed'),
    }
  })

export const fabriquerNouvellesPublications = (level, { vus } = {}) =>
  chargerContenu().then((c) => {
    if (!plusAutorise(c, 'feed')) return 0
    const posts = fabriquerPublications(c, { level, vus })
    ajouterGeneres({ posts })
    return posts.length
  })

export const fabriquerNouveauxSujets = (contact) =>
  chargerContenu().then((c) => {
    if (!plusAutorise(c, 'chat')) return []
    const conversations = fabriquerConversations(c, contact)
    ajouterGeneres({ conversations })
    return conversations
  })
