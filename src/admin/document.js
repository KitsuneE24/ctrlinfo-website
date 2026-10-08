/**
 * Le document de contenu, côté administration : le charger, le modifier, le
 * réenregistrer.
 *
 * Les chemins sont relatifs à la page : le dossier de l'administration peut
 * être renommé au déploiement sans que rien ici ne change.
 */
const CONTENU = '../donnees/contenu.json'
const ENREGISTREMENT = './enregistrer.php'

let document = null
let modifications = 0
const abonnes = new Set()

const prevenir = () => {
  for (const abonne of abonnes) abonne()
}

export function abonner(ecouteur) {
  abonnes.add(ecouteur)
  return () => abonnes.delete(ecouteur)
}

export const nombreDeModifications = () => modifications
export const contenu = () => document

export async function charger() {
  const reponse = await fetch(`${CONTENU}?t=${Date.now()}`)
  if (!reponse.ok) throw new Error(`Le contenu a répondu ${reponse.status}.`)
  document = await reponse.json()
  modifications = 0
  prevenir()
  return document
}

/** Les objets affichés appartiennent au document : les modifier suffit. */
export function modifier(objet, cle, valeur) {
  if (objet[cle] === valeur) return
  objet[cle] = valeur
  modifications += 1
  prevenir()
}

export function ajouter(tableau, valeur) {
  tableau.push(valeur)
  modifications += 1
  prevenir()
}

export function retirer(tableau, index) {
  tableau.splice(index, 1)
  modifications += 1
  prevenir()
}

export function deplacer(tableau, index, pas) {
  const cible = index + pas
  if (cible < 0 || cible >= tableau.length) return
  ;[tableau[index], tableau[cible]] = [tableau[cible], tableau[index]]
  modifications += 1
  prevenir()
}

export async function enregistrer() {
  if (document === null) throw new Error('Rien à enregistrer.')

  const reponse = await fetch(ENREGISTREMENT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(document),
  })

  if (reponse.status === 401) {
    throw new Error('Identification perdue : recharge la page.')
  }
  if (!reponse.ok) {
    const charge = await reponse.json().catch(() => null)
    throw new Error(charge?.erreur ?? `Le serveur a répondu ${reponse.status}.`)
  }

  modifications = 0
  prevenir()
  return reponse.json()
}
