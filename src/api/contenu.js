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
// Les crédits photos sont tirés des banques : une photo ajoutée y apparaît d'elle-même.
function creditsPhotos(c) {
  const vues = new Set()
  const lignes = []
  for (const base of [...(c.faits ?? []), ...(c.scenarios ?? [])]) {
    const image = base.image
    if (!image?.page || vues.has(image.fichier)) continue
    vues.add(image.fichier)
    lignes.push(`• ${image.alt} : ${image.auteur}, ${image.licence}, ${image.page}`)
  }
  if (lignes.length === 0) return []
  return [
    {
      id: 'credits-photos',
      titre: 'Crédits photos',
      paragraphes: [
        { texte: 'Les photos des posts viennent de Wikimedia Commons, dans le domaine public ou sous licence libre (CC0, CC BY, CC BY-SA). Elles illustrent des posts fabriqués pour l’exercice : celles des événements inventés ont été prises ailleurs.' },
        { texte: lignes.join('\n') },
      ],
    },
  ]
}

export const getMentionsLegales = depuis((c) => [...(c.mentionsLegales ?? []), ...creditsPhotos(c)])

// Index tiré du quantième.
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

export const getPlusDeConversations = depuis((c) => plusAutorise(c, 'chat'))

export const fabriquerNouvellesConversations = () =>
  chargerContenu().then((c) => {
    if (!plusAutorise(c, 'chat')) return 0
    const conversations = fabriquerConversations(c.posts, c.conversations)
    ajouterGeneres({ conversations })
    return conversations.length
  })
