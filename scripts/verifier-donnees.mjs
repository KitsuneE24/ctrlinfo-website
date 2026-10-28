// node scripts/verifier-donnees.mjs : sort en erreur au moindre problème.
import { existsSync, readFileSync } from 'node:fs'

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

// Mêmes clés que public/admin/enregistrer.php.
const REQUISES = ['version', 'jeux', 'niveaux', 'remediations', 'conversations', 'chapitres', 'stories', 'avatars', 'astuces']
const ACTIONS = ['share', 'ignore', 'report']
const texte = (v) => typeof v === 'string' && v.trim() !== ''
const PUBLIC = new URL('../public', import.meta.url).href

function verifierImage(ici, fichier = '', alt, credit) {
  if (!fichier.startsWith('/') || !existsSync(new URL(PUBLIC + fichier))) signaler(`${ici} : image introuvable (${fichier})`)
  if (!texte(alt)) signaler(`${ici} : image sans texte alternatif`)
  if (!texte(credit?.auteur) || !texte(credit?.licence) || !texte(credit?.page)) {
    signaler(`${ici} : image sans crédit complet (auteur, licence, page)`)
  }
}

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

  const idsFaits = new Set()
  for (const [i, fait] of (contenu.faits ?? []).entries()) {
    const ici = `fait ${i + 1} (${fait.id ?? '?'})`
    if (!texte(fait.id) || idsFaits.has(fait.id)) signaler(`${ici} : id absent ou en double`)
    idsFaits.add(fait.id)
    if (!texte(fait.vrai) || !texte(fait.faux)) signaler(`${ici} : il faut une version vraie et une version fausse`)
    if (fait.vrai === fait.faux) signaler(`${ici} : la version fausse est identique à la vraie`)
    if (!texte(fait.source?.nom) || !texte(fait.source?.url)) signaler(`${ici} : source sans nom ou sans adresse`)
    if (fait.image) verifierImage(ici, fait.image.fichier, fait.image.alt, fait.image)
  }
  if (idsFaits.size === 0) signaler('contenu.json : aucun fait, le générateur ne peut rien fabriquer')
  const idsScenarios = new Set()
  for (const [i, s] of (contenu.scenarios ?? []).entries()) {
    const ici = `événement inventé ${i + 1} (${s.id ?? '?'})`
    if (!texte(s.id) || idsScenarios.has(s.id) || idsFaits.has(s.id)) signaler(`${ici} : id absent ou en double`)
    idsScenarios.add(s.id)
    if (!texte(s.titre)) signaler(`${ici} : pas de titre`)
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
    if (post.image && !post.image.startsWith('/images/')) signaler(`${ici} : image hors de /images/ (${post.image.slice(0, 60)})`)
    else if (post.image) verifierImage(ici, post.image, post.imageAlt, post.credit)
  }
}
verifierPosts(vrais, 'posts-vrais.json', false)
verifierPosts(faux, 'posts-faux.json', true)

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
