/** Le document de contenu, chargé une fois pour toute la vie de l'onglet. */
const FICHIER = `${import.meta.env.BASE_URL}donnees/contenu.json`

let promesse = null

export function chargerContenu() {
  promesse ??= fetch(FICHIER)
    .then(async (reponse) => {
      if (!reponse.ok) throw new Error(`Le contenu a répondu ${reponse.status}.`)
      return reponse.json()
    })
    .catch((erreur) => {
      // Sans remise à zéro, « Réessayer » ne referait jamais d'appel.
      promesse = null
      throw erreur
    })
  return promesse
}
