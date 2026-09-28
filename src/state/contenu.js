/**
 * Le document de contenu : son chargement, son édition, son enregistrement.
 *
 * Les objets que les écrans affichent appartiennent à ce document. Les modifier
 * en place suffit donc — il n'y a aucun chemin à retenir ni à reconstruire.
 */
const FICHIER = `${import.meta.env.BASE_URL}donnees/contenu.json`
const ENREGISTREMENT = `${import.meta.env.BASE_URL}admin/enregistrer.php`
const CLE_ADMIN = 'ctrl-info:admin'

let document = null
let promesse = null
let modifications = 0
const abonnes = new Set()

/**
 * Interrupteur d'affichage, pas une sécurité : la vraie barrière est le
 * .htaccess qui ferme admin/. Un curieux peut afficher les champs éditables,
 * ses enregistrements seront refusés par Apache.
 */
export function estAdmin() {
  try {
    return window.localStorage.getItem(CLE_ADMIN) === '1'
  } catch {
    return false
  }
}

export function chargerContenu() {
  promesse ??= fetch(FICHIER)
    .then(async (reponse) => {
      if (!reponse.ok) throw new Error(`Le contenu a répondu ${reponse.status}.`)
      document = await reponse.json()
      return document
    })
    .catch((erreur) => {
      // Sans remise à zéro, « Réessayer » ne referait jamais d'appel.
      promesse = null
      throw erreur
    })
  return promesse
}

export function abonner(ecouteur) {
  abonnes.add(ecouteur)
  return () => abonnes.delete(ecouteur)
}

export function nombreDeModifications() {
  return modifications
}

export function modifier(objet, cle, valeur) {
  if (objet[cle] === valeur) return
  objet[cle] = valeur
  modifications += 1
  for (const abonne of abonnes) abonne()
}

export async function enregistrer() {
  if (document === null) throw new Error('Rien à enregistrer.')

  const reponse = await fetch(ENREGISTREMENT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(document),
  })

  if (reponse.status === 401) {
    throw new Error("Identification perdue : ouvre /admin/ puis réessaie.")
  }
  if (!reponse.ok) {
    const charge = await reponse.json().catch(() => null)
    throw new Error(charge?.erreur ?? `Le serveur a répondu ${reponse.status}.`)
  }

  modifications = 0
  for (const abonne of abonnes) abonne()
  return reponse.json()
}
