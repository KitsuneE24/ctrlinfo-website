import { generes } from './generes'

const DOSSIER = '/donnees/'

const lire = (nom) =>
  fetch(DOSSIER + nom).then((reponse) => {
    if (!reponse.ok) throw new Error(`Le contenu a répondu ${reponse.status}.`)
    return reponse.json()
  })

let promesse = null

function chargerServeur() {
  promesse ??= Promise.all([lire('contenu.json'), lire('posts-vrais.json'), lire('posts-faux.json')])
    .then(([contenu, vrais, faux]) => ({ ...contenu, posts: [...vrais, ...faux] }))
    .catch((erreur) => {
      promesse = null
      throw erreur
    })
  return promesse
}

// Interrupteur /admin : Jeux → « Plus Quand Tout Est Vu ».
export const plusAutorise = (contenu, jeu) =>
  contenu.jeux?.find((j) => j.id === jeu)?.plusQuandToutEstVu === true

// Ce que le joueur a fabriqué, tant que /admin l'autorise encore.
export const chargerContenu = () =>
  chargerServeur().then((contenu) => {
    const locaux = generes()
    // Un vrai fabriqué n'est gardé que si son fait existe encore dans contenu.json.
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
