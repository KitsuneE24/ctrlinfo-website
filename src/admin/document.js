// Chemins relatifs : le dossier d'administration peut être renommé.
const DONNEES = '../donnees/'
const ENREGISTREMENT = './enregistrer.php'

const FICHIERS = ['contenu', 'posts-vrais', 'posts-faux']

const lire = async (nom) => {
  const reponse = await fetch(`${DONNEES}${nom}.json?t=${Date.now()}`)
  if (!reponse.ok) throw new Error(`${nom}.json a répondu ${reponse.status}.`)
  return reponse.json()
}

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
  const [contenu, postsVrais, postsFaux] = await Promise.all(FICHIERS.map(lire))
  document = { ...contenu, postsVrais, postsFaux }
  modifications = 0
  prevenir()
  return document
}

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

function parFichier() {
  const { postsVrais, postsFaux, ...contenu } = document
  return { contenu, 'posts-vrais': postsVrais, 'posts-faux': postsFaux }
}

async function envoyer(fichier, valeur) {
  const reponse = await fetch(`${ENREGISTREMENT}?fichier=${fichier}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(valeur),
  })

  if (reponse.status === 401) {
    throw new Error('Identification perdue : recharge la page.')
  }
  if (!reponse.ok) {
    const charge = await reponse.json().catch(() => null)
    throw new Error(`${fichier} : ${charge?.erreur ?? `le serveur a répondu ${reponse.status}.`}`)
  }
}

export async function enregistrer() {
  if (document === null) throw new Error('Rien à enregistrer.')
  for (const [fichier, valeur] of Object.entries(parFichier())) await envoyer(fichier, valeur)
  modifications = 0
  prevenir()
}
