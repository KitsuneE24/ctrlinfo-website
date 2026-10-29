const CLE = 'ctrl-info:generes-3'
const ANCIENNES_CLES = ['ctrl-info:generes', 'ctrl-info:generes-2']
const PLAFOND_POSTS = 120
const PLAFOND_CONVERSATIONS = 120

const vide = () => ({ posts: [], conversations: [] })

// Relu comme une entrée non fiable : seules des fabrications locales bien formées passent.
const estLocal = (cle) => (entree) =>
  entree !== null &&
  typeof entree === 'object' &&
  !Array.isArray(entree) &&
  entree.origine === 'local' &&
  typeof entree[cle] === 'string' &&
  entree[cle].startsWith('local-')

const liste = (recu, cle, plafond) =>
  Array.isArray(recu) ? recu.filter(estLocal(cle)).slice(0, plafond) : []

function lire() {
  try {
    for (const ancienne of ANCIENNES_CLES) window.localStorage.removeItem(ancienne)
    const recu = JSON.parse(window.localStorage.getItem(CLE) ?? 'null')
    return {
      posts: liste(recu?.posts, 'slug', PLAFOND_POSTS),
      conversations: liste(recu?.conversations, 'id', PLAFOND_CONVERSATIONS),
    }
  } catch {
    return vide()
  }
}

let etat = lire()
let version = 0
const abonnes = new Set()

export const generes = () => etat
export const versionGeneres = () => version
export function abonnerGeneres(ecouteur) {
  abonnes.add(ecouteur)
  return () => abonnes.delete(ecouteur)
}

export function ajouterGeneres({ posts = [], conversations = [] }) {
  etat = {
    posts: [...posts, ...etat.posts].slice(0, PLAFOND_POSTS),
    conversations: [...conversations, ...etat.conversations].slice(0, PLAFOND_CONVERSATIONS),
  }
  try {
    window.localStorage.setItem(CLE, JSON.stringify(etat))
  } catch {
    // Sans stockage, elles durent le temps de l'onglet.
  }
  version += 1
  for (const abonne of abonnes) abonne()
}
