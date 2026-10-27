/**
 * Vérifie les fichiers de public/donnees/ avant publication.
 *
 *   node scripts/verifier-donnees.mjs
 *
 * Sort en erreur au moindre problème : la récolte automatique n'envoie alors rien.
 */
import { readFileSync } from 'node:fs'

const DONNEES = new URL('../public/donnees/', import.meta.url)
const problemes = []
const signaler = (texte) => problemes.push(texte)

function lire(nom) {
  try {
    return JSON.parse(readFileSync(new URL(nom, DONNEES), 'utf8'))
  } catch (erreur) {
    signaler(`${nom} : illisible (${erreur.message})`)
    return null
  }
}

const contenu = lire('contenu.json')
const vrais = lire('posts-vrais.json')
const faux = lire('posts-faux.json')

// Mêmes clés obligatoires que public/admin/enregistrer.php.
const REQUISES = ['version', 'jeux', 'niveaux', 'remediations', 'conversations', 'chapitres', 'stories', 'avatars', 'astuces']
const ACTIONS = ['share', 'ignore', 'report']
const texte = (v) => typeof v === 'string' && v.trim() !== ''

if (contenu) {
  for (const cle of REQUISES) {
    if (!(cle in contenu)) signaler(`contenu.json : clé manquante « ${cle} »`)
    else if (Array.isArray(contenu[cle]) && contenu[cle].length === 0) signaler(`contenu.json : « ${cle} » est vide`)
  }

  const ids = new Set()
  for (const [i, conv] of (contenu.conversations ?? []).entries()) {
    const nom = `conversation ${i + 1} (${conv.id ?? '?'})`
    if (!texte(conv.id)) signaler(`${nom} : pas d'id`)
    else if (ids.has(conv.id)) signaler(`${nom} : id en double`)
    ids.add(conv.id)
    if (!Array.isArray(conv.steps) || conv.steps.length === 0) {
      signaler(`${nom} : aucune étape`)
      continue
    }
    for (const [j, etape] of conv.steps.entries()) {
      const choix = etape.choices ?? []
      if (choix.length === 0) signaler(`${nom}, étape ${j + 1} : aucun choix`)
      else if (!choix.some((c) => c.correct)) signaler(`${nom}, étape ${j + 1} : aucun bon choix`)
    }
  }
}

const slugs = new Set()
function verifierPosts(posts, nom, isFake) {
  if (!Array.isArray(posts) || posts.length === 0) {
    signaler(`${nom} : la liste est vide`)
    return
  }
  for (const [i, post] of posts.entries()) {
    const ici = `${nom}, publication ${i + 1} (${post.slug ?? '?'})`
    if (!texte(post.slug)) signaler(`${ici} : pas de slug`)
    else if (slugs.has(post.slug)) signaler(`${ici} : slug en double`)
    slugs.add(post.slug)
    if (post.isFake !== isFake) signaler(`${ici} : isFake doit valoir ${isFake}`)
    if (!texte(post.titre)) signaler(`${ici} : pas de titre`)
    if (!texte(post.source)) signaler(`${ici} : pas de source`)
    if (!Number.isInteger(post.level)) signaler(`${ici} : niveau absent`)
    if (!ACTIONS.includes(post.correctAction)) signaler(`${ici} : correctAction inconnue`)
    if (typeof post.scores?.[post.correctAction] !== 'number') signaler(`${ici} : pas de score pour la bonne action`)
    if (Object.values(post.scores ?? {}).some((score) => typeof score !== 'number' || Math.abs(score) > 100)) {
      signaler(`${ici} : score hors de -100 à 100`)
    }
    if (post.image && !/^https?:\/\//.test(post.image) && !post.image.startsWith('/')) signaler(`${ici} : adresse d'image invalide`)
  }
}
verifierPosts(vrais, 'posts-vrais.json', false)
verifierPosts(faux, 'posts-faux.json', true)

// Chaque niveau doit pouvoir servir un lot complet, avec du vrai et du faux.
if (contenu && Array.isArray(vrais) && Array.isArray(faux)) {
  for (const niveau of contenu.niveaux ?? []) {
    const v = vrais.filter((p) => p.level === niveau.level).length
    const f = faux.filter((p) => p.level === niveau.level).length
    if (v === 0 || f === 0) signaler(`niveau ${niveau.level} : ${v} vraies, ${f} fausses (il faut les deux)`)
    else if (v + f < (niveau.taille ?? 5)) signaler(`niveau ${niveau.level} : ${v + f} publications pour un lot de ${niveau.taille}`)
  }
}

const SCHEMA = /^\s*([a-z][a-z0-9+.-]*):/i
const SCHEMAS_PERMIS = ['http', 'https', 'mailto']
const CLES_ADRESSE = /^(url|href|image|couverture|sourceUrl|learnMoreUrl|learnMoreTips)$/
const adresseRefusee = (v) => {
  const schema = SCHEMA.exec(v)?.[1].toLowerCase()
  return schema !== undefined && !SCHEMAS_PERMIS.includes(schema)
}
function verifierAdresses(valeur, ou) {
  if (Array.isArray(valeur)) valeur.forEach((v, i) => verifierAdresses(v, `${ou}[${i}]`))
  else if (valeur && typeof valeur === 'object') {
    for (const [cle, v] of Object.entries(valeur)) {
      if (CLES_ADRESSE.test(cle) && typeof v === 'string' && adresseRefusee(v)) {
        signaler(`${ou}.${cle} : adresse refusée « ${v.slice(0, 60)} »`)
      }
      verifierAdresses(v, `${ou}.${cle}`)
    }
  }
}
verifierAdresses(contenu, 'contenu.json')
verifierAdresses(vrais, 'posts-vrais.json')
verifierAdresses(faux, 'posts-faux.json')

if (problemes.length > 0) {
  console.error(`${problemes.length} problème(s) dans public/donnees/ :`)
  for (const p of problemes) console.error(`  - ${p}`)
  process.exit(1)
}
console.log(`Contenu valide : ${vrais.length} vraies, ${faux.length} fausses, ${contenu.conversations.length} conversations.`)
