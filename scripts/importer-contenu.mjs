/**
 * Rapatrie le contenu de l'API dans public/donnees/contenu.json.
 *
 *   node scripts/importer-contenu.mjs --api https://…/api
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'

const VERSION = 1

const argument = (nom) => {
  const i = process.argv.indexOf(nom)
  return i > -1 ? process.argv[i + 1] : undefined
}

const API = (argument('--api') ?? process.env.VITE_API_URL ?? '').replace(/\/$/, '')
if (!API) {
  console.error("Il faut l'adresse de l'API : --api https://…/api")
  process.exit(1)
}

const SORTIE = new URL('../public/donnees/', import.meta.url)
const SEED = new URL('../../ctrlinfo-app/prisma/seed.ts', import.meta.url)

async function lire(chemin) {
  const reponse = await fetch(API + chemin, { signal: AbortSignal.timeout(90_000) })
  if (!reponse.ok) throw new Error(`${chemin} a répondu ${reponse.status}`)
  return reponse.json()
}

/** Le détail de chaque entrée, complété des champs que la liste seule porte. */
async function details(liste, chemin) {
  const complets = []
  for (const entree of liste) {
    const detail = await lire(`${chemin}/${encodeURIComponent(entree.id)}`)
    complets.push({ ...entree, ...detail })
  }
  return complets
}

/** `versPost` n'expose pas `level` : on le déduit de l'appel qui l'a rendu. */
async function postsParNiveau(niveaux) {
  const tout = []
  for (const { level } of niveaux) {
    const posts = await lire(`/posts?level=${level}`)
    tout.push(...posts.map((post) => ({ ...post, level })))
  }
  return tout
}

/** Les astuces vivent dans seed.ts, sans route. Littéral JS, donc pas JSON. */
async function astucesDuSeed(chapitres) {
  const source = readFileSync(SEED, 'utf8')
  const ouverture = source.indexOf('[', source.indexOf('const ASTUCES = ['))
  if (ouverture === -1) throw new Error('ASTUCES introuvable dans prisma/seed.ts')

  let profondeur = 0
  let fin = -1
  for (let i = ouverture; i < source.length; i += 1) {
    if (source[i] === '[') profondeur += 1
    else if (source[i] === ']' && --profondeur === 0) {
      fin = i + 1
      break
    }
  }
  if (fin === -1) throw new Error('ASTUCES : crochet de fermeture introuvable')

  const litteral = source.slice(ouverture, fin)
  const { default: brutes } = await import(
    `data:text/javascript,export default ${encodeURIComponent(litteral)}`
  )

  const parSlug = new Map(chapitres.map((c) => [c.id, c]))
  return brutes.map((astuce, ordre) => {
    const chapitre = parSlug.get(astuce.chapitre)
    if (!chapitre) throw new Error(`astuce « ${astuce.slug} » : chapitre inconnu`)
    return {
      id: astuce.slug,
      texte: astuce.texte,
      ordre,
      chapitre: { id: chapitre.id, titre: chapitre.titre, onglet: chapitre.onglet },
    }
  })
}

console.log(`Source : ${API}`)
console.log('(un hébergeur endormi peut mettre une minute à répondre)')

const niveaux = await lire('/posts/niveaux')

const [jeux, remediations, listeConversations, listeChapitres, ressources, categoriesRessources, stories, avatars] =
  await Promise.all([
    lire('/jeux'),
    lire('/posts/remediations'),
    lire('/conversations'),
    lire('/chapitres'),
    lire('/ressources'),
    lire('/ressources/categories'),
    lire('/stories'),
    lire('/avatars'),
  ])

const posts = await postsParNiveau(niveaux)
const conversations = await details(listeConversations, '/conversations')
const chapitres = await details(listeChapitres, '/chapitres')
const astuces = await astucesDuSeed(chapitres)

const contenu = {
  version: VERSION,
  genere: new Date().toISOString(),
  jeux,
  niveaux,
  posts,
  remediations,
  conversations,
  chapitres,
  ressources,
  categoriesRessources,
  stories,
  avatars,
  astuces,
}

const vides = Object.entries(contenu).filter(([, v]) => Array.isArray(v) && v.length === 0)
if (vides.length > 0) {
  console.error(`Refus d'écrire : ${vides.map(([k]) => k).join(', ')} est vide.`)
  process.exit(1)
}

for (const niveau of niveaux) {
  const disponibles = posts.filter((p) => p.level === niveau.level).length
  if (disponibles < niveau.taille) {
    console.log(`  attention — niveau ${niveau.level} : ${disponibles} publications pour ${niveau.taille}`)
  }
}

mkdirSync(SORTIE, { recursive: true })
writeFileSync(
  new URL('contenu.json', SORTIE),
  JSON.stringify(contenu, null, 2) + '\n',
  'utf8'
)

for (const [cle, valeur] of Object.entries(contenu)) {
  if (Array.isArray(valeur)) console.log(`  ${cle.padEnd(22)} ${valeur.length}`)
  else if (valeur && typeof valeur === 'object') console.log(`  ${cle.padEnd(22)} ${Object.keys(valeur).length}`)
}
console.log(`\nÉcrit : public/donnees/contenu.json — ${(JSON.stringify(contenu).length / 1024).toFixed(1)} Ko`)
