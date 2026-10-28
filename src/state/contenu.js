import { dateIlYa } from '../../scripts/fabrique.mjs'
import { generes } from './generes'

const DOSSIER = '/donnees/'

const lire = (nom) =>
  fetch(DOSSIER + nom).then((reponse) => {
    if (!reponse.ok) throw new Error(`Le contenu a répondu ${reponse.status}.`)
    return reponse.json()
  })

let promesse = null

// Posts inventés datés depuis le jour où l'on joue ; les vrais articles gardent leur date.
const dater = (post) =>
  post?.origine === 'fiction' && Number.isFinite(post.ilYa) ? { ...post, date: dateIlYa(post.ilYa) } : post

function chargerServeur() {
  promesse ??= Promise.all([lire('contenu.json'), lire('posts-vrais.json'), lire('posts-faux.json')])
    .then(([contenu, vrais, faux]) => ({
      ...contenu,
      remediations: Object.fromEntries(Object.entries(contenu.remediations ?? {}).map(([cle, post]) => [cle, dater(post)])),
      posts: [...vrais, ...faux].map(dater),
    }))
    .catch((erreur) => {
      promesse = null
      throw erreur
    })
  return promesse
}

export const plusAutorise = (contenu, jeu) =>
  contenu.jeux?.find((j) => j.id === jeu)?.plusQuandToutEstVu === true

export const chargerContenu = () =>
  chargerServeur().then((contenu) => {
    const locaux = generes()
    const faits = new Set((contenu.faits ?? []).map((f) => f.id))
    const estConnu = (p) => p.isFake || faits.has(p.fait)
    const posts = plusAutorise(contenu, 'feed') ? locaux.posts.filter(estConnu) : []
    const conversations = plusAutorise(contenu, 'chat') ? locaux.conversations : []
    return {
      ...contenu,
      posts: [...contenu.posts, ...posts],
      conversations: [...conversations, ...contenu.conversations],
    }
  })
