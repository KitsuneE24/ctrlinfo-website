/** Le contenu du jeu, chargé une fois pour toute la vie de l'onglet. */
const DOSSIER = '/donnees/'

const lire = (nom) =>
  fetch(DOSSIER + nom).then((reponse) => {
    if (!reponse.ok) throw new Error(`Le contenu a répondu ${reponse.status}.`)
    return reponse.json()
  })

let promesse = null

export function chargerContenu() {
  promesse ??= Promise.all([lire('contenu.json'), lire('posts-vrais.json'), lire('posts-faux.json')])
    .then(([contenu, vrais, faux]) => ({ ...contenu, posts: [...vrais, ...faux] }))
    .catch((erreur) => {
      // Sans remise à zéro, « Réessayer » ne referait jamais d'appel.
      promesse = null
      throw erreur
    })
  return promesse
}
