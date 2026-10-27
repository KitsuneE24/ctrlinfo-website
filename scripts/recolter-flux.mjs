// node scripts/recolter-flux.mjs [--config config.json] [--max 24] [--refaire] [--essai]
import { readFileSync, writeFileSync } from 'node:fs'
import Parser from 'rss-parser'
import { CATEGORIES, HABILLAGES } from './gabarits.mjs'
import { DISTRIBUTIONS } from './gabarits-conversations.mjs'
import {
  HORS_DE_CAUSE,
  extrait,
  fabriquerConversation,
  fabriquerFaux,
  fabriquerVrai,
  personneDe,
} from './fabrique.mjs'

const argument = (nom, defaut) => {
  const i = process.argv.indexOf(nom)
  return i > -1 ? process.argv[i + 1] : defaut
}
const drapeau = (nom) => process.argv.includes(nom)

const DONNEES = new URL('../public/donnees/', import.meta.url)
const FICHIERS = {
  contenu: new URL('contenu.json', DONNEES),
  vrais: new URL('posts-vrais.json', DONNEES),
  faux: new URL('posts-faux.json', DONNEES),
}

const lireJson = (url) => JSON.parse(readFileSync(url, 'utf8'))
const ecrireJson = (url, valeur) => writeFileSync(url, JSON.stringify(valeur, null, 2) + '\n', 'utf8')

const config = lireJson(new URL(`../${argument('--config', 'config.json')}`, import.meta.url))
const contenu = lireJson(FICHIERS.contenu)
let vrais = lireJson(FICHIERS.vrais)
let faux = lireJson(FICHIERS.faux)
const reglages = config.recolte ?? {}
const AUJOURDHUI = new Date().toISOString()
const options = { aideUrl: reglages.aideUrl, maintenant: AUJOURDHUI }

const parser = new Parser({
  timeout: 20_000,
  customFields: { item: ['media:content', 'media:thumbnail', 'summary', 'source'] },
})

// Seuls les liens http(s) passent.
const lienWeb = (url) => {
  try {
    return typeof url === 'string' && ['http:', 'https:'].includes(new URL(url).protocol) ? url : null
  } catch {
    return null
  }
}

const imageDe = (item) => {
  const candidats = [
    item.enclosure?.type?.startsWith('image') ? item.enclosure.url : undefined,
    item['media:content']?.$?.url,
    item['media:thumbnail']?.$?.url,
  ]
  return candidats.map(lienWeb).find(Boolean) ?? null
}

const sansBalises = (texte) =>
  (texte ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const domaineDe = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

function redaction(item, flux) {
  const titre = sansBalises(item.title)
  if (!flux.agregateur) {
    const nom = flux.nom.split(' — ')[0]
    return { titre, nom, editeur: flux.editeur, domaineReel: domaineDe(item.link) }
  }
  const source = item.source
  const nom = sansBalises(typeof source === 'string' ? source : source?._) || flux.nom
  const suffixe = ` - ${nom}`
  return {
    titre: titre.endsWith(suffixe) ? titre.slice(0, -suffixe.length) : titre,
    nom,
    editeur: nom,
    domaineReel: domaineDe(source?.$?.url) ?? domaineDe(item.link),
  }
}

async function recolter(flux) {
  const reponse = await fetch(flux.url, {
    headers: { 'user-agent': 'CTRL INFO (récolte éditoriale)' },
    signal: AbortSignal.timeout(25_000),
  })
  if (!reponse.ok) throw new Error(`${reponse.status}`)

  const analyse = await parser.parseString(await reponse.text())
  return (analyse.items ?? [])
    .slice(0, reglages.maxArticlesParFlux ?? 20)
    .map((item) => {
      const r = redaction(item, flux)
      const resume = sansBalises(item.contentSnippet ?? item.summary ?? item.content)
      return {
        ...r,
        titre: r.titre.slice(0, 300),
        resume: resume.startsWith(r.titre.slice(0, 40)) ? '' : resume.slice(0, 600),
        url: lienWeb(item.link),
        image: imageDe(item),
        publieLe: item.isoDate ?? item.pubDate ?? null,
        flux,
      }
    })
    .filter((article) => article.titre && article.url)
}

const avant = JSON.stringify([vrais, faux, contenu.conversations])

if (drapeau('--refaire')) {
  vrais = vrais.filter((post) => post.origine !== 'RSS')
  faux = faux.filter((post) => post.origine !== 'RSS')
  contenu.conversations = contenu.conversations.filter((c) => c.origine !== 'RSS')
}

const flux = (config.flux ?? []).filter((f) => f.actif !== false)
if (flux.length === 0) {
  console.error('Aucun flux actif dans la configuration.')
  process.exit(1)
}

console.log(`${flux.length} flux à récolter`)

const articles = []
for (const f of flux) {
  try {
    const lus = await recolter(f)
    articles.push(...lus)
    console.log(`  ${f.nom.padEnd(38)} ${lus.length} articles`)
  } catch (erreur) {
    console.log(`  ${f.nom.padEnd(38)} échec — ${erreur.message}`)
  }
}

const motif = (liste) => new RegExp((liste ?? []).join('|') || '$^', 'i')
const sensible = motif(reglages.sujetsSensibles)
const sansFaux = motif(reglages.sujetsSansFaux)

function fauxConforme(post) {
  if (post.origine !== 'RSS') return true
  const titre = post.article?.titre ?? ''
  if (sensible.test(titre) || sansFaux.test(titre)) return false
  if (!personneDe({ titre, resume: '' })) return true
  const categorie = CATEGORIES.find((c) => c.biais === post.biais)
  return categorie?.surUnePersonne !== false && (post.analyseFaux ?? '').includes(HORS_DE_CAUSE)
}
const nonConformes = new Set(faux.filter((post) => !fauxConforme(post)).map((post) => post.article?.url))
faux = faux.filter((post) => !nonConformes.has(post.article?.url))
contenu.conversations = contenu.conversations.filter(
  (c) => c.origine !== 'RSS' || !nonConformes.has(c.article?.url)
)

const dejaVus = new Set(
  [...vrais, ...faux, ...contenu.conversations].map((entree) => entree.article?.url).filter(Boolean)
)

const frais = [...new Map(articles.map((article) => [article.url, article])).values()]
  .filter((article) => !dejaVus.has(article.url))
  .filter((article) => !sensible.test(`${article.titre} ${article.resume}`))
  .sort((a, b) => new Date(b.publieLe ?? 0) - new Date(a.publieLe ?? 0))
  .slice(0, Number(argument('--max', reglages.maxPublications ?? 24)))

if (frais.length === 0) console.log('\nAucun article neuf : tous ceux lus ont déjà servi.')

const niveaux = contenu.niveaux
  .map((n) => n.level)
  .filter((n) => HABILLAGES.some((h) => h.niveau === n))
const compter = (posts, cle) =>
  posts.reduce((compte, post) => compte.set(cle(post), (compte.get(cle(post)) ?? 0) + 1), new Map())
const vraisParNiveau = compter(vrais, (p) => p.level)
const fauxParNiveau = compter(faux, (p) => p.level)
const fauxParCase = compter(faux, (p) => `${p.level}|${p.biais}`)
const poids = (n) => reglages.poidsNiveaux?.[n] ?? 1
const moinsRempli = (candidats, compte, departage = () => 0, poidsDe = () => 1) =>
  [...candidats].sort(
    (x, y) =>
      (compte.get(x) ?? 0) / poidsDe(x) - (compte.get(y) ?? 0) / poidsDe(y) || departage(x) - departage(y)
  )[0]

const nouveauxVrais = []
const nouveauxFaux = []
const fabriques = []

frais.forEach((article, graine) => {
  const eligible =
    article.flux.fiable &&
    article.flux.categorie !== 'Vérification' &&
    !sansFaux.test(`${article.titre} ${article.resume}`) &&
    extrait(article.resume) !== ''
  const enFaux = eligible && faux.length + nouveauxFaux.length <= vrais.length + nouveauxVrais.length

  if (enFaux) {
    const niveau = moinsRempli(niveaux, fauxParNiveau, undefined, poids)
    const permises = personneDe(article)
      ? CATEGORIES.filter((c) => c.surUnePersonne !== false)
      : CATEGORIES
    const categorie = moinsRempli(
      permises,
      new Map(permises.map((c) => [c, fauxParCase.get(`${niveau}|${c.biais}`) ?? 0]))
    )
    const post = fabriquerFaux(article, categorie, niveau, graine, options)
    fauxParNiveau.set(niveau, (fauxParNiveau.get(niveau) ?? 0) + 1)
    fauxParCase.set(`${niveau}|${categorie.biais}`, (fauxParCase.get(`${niveau}|${categorie.biais}`) ?? 0) + 1)
    nouveauxFaux.push(post)
    fabriques.push({ post, article, gabarit: categorie })
  } else {
    const niveau = moinsRempli(
      niveaux,
      vraisParNiveau,
      (n) => Math.abs(n - (article.flux.levelDefaut ?? 1)),
      poids
    )
    vraisParNiveau.set(niveau, (vraisParNiveau.get(niveau) ?? 0) + 1)
    nouveauxVrais.push(fabriquerVrai(article, niveau, graine, options))
  }
})

let prochainId =
  Math.max(
    0,
    ...[...vrais, ...faux, ...Object.values(contenu.remediations ?? {})].map((p) => Number(p.id) || 0)
  ) + 1
for (const post of [...nouveauxVrais, ...nouveauxFaux]) post.id = prochainId++

const joursDeVie = reglages.joursAvantPeremption ?? 0
const ageEnJours = (entree) =>
  (Date.now() - new Date(entree.recolteLe ?? entree.article?.publieLe ?? AUJOURDHUI)) / 86_400_000
const perimee = (entree) => joursDeVie > 0 && ageEnJours(entree) > joursDeVie
let retirees = 0

const plafond = reglages.plafondParFichier ?? 100
const minimum = reglages.minimumParNiveau ?? 10
function plafonner(existants, nouveaux) {
  const manuelles = existants.filter((post) => post.origine !== 'RSS')
  const parNiveau = new Map()
  const desFlux = [...nouveaux, ...existants.filter((post) => post.origine === 'RSS')].filter((post) => {
    const compte = parNiveau.get(post.level) ?? 0
    if (perimee(post) && compte >= minimum) {
      retirees += 1
      return false
    }
    parNiveau.set(post.level, compte + 1)
    return true
  })
  return [...manuelles, ...desFlux.slice(0, plafond)]
}
vrais = plafonner(vrais, nouveauxVrais)
faux = plafonner(faux, nouveauxFaux)

const sourcesSansFaux = new Set(
  (config.flux ?? [])
    .filter((f) => !f.fiable || f.categorie === 'Vérification')
    .map((f) => f.nom.split(' — ')[0])
)
vrais = vrais.map((post) => {
  const texte = `${post.article?.titre ?? ''} ${post.texte ?? ''}`
  // Une case décochée dans /admin le reste.
  const fauxPossible =
    post.fauxPossible !== false &&
    post.origine === 'RSS' &&
    !sourcesSansFaux.has(post.article?.nom) &&
    !sensible.test(texte) &&
    !sansFaux.test(texte) &&
    extrait(post.texte) !== ''
  return { ...post, fauxPossible }
})

const generees = contenu.conversations.filter((c) => c.origine === 'RSS' && !perimee(c))
retirees += contenu.conversations.filter((c) => c.origine === 'RSS').length - generees.length
const manuelles = contenu.conversations.filter((c) => c.origine !== 'RSS')
const nouvellesConversations = fabriques
  .filter(({ post }) => post.level < 5)
  .slice(0, reglages.maxConversations ?? 3)
  .map(({ post, article, gabarit }, i) =>
    fabriquerConversation(post, article, gabarit, DISTRIBUTIONS[(generees.length + i) % DISTRIBUTIONS.length], options)
  )
contenu.conversations = [
  ...[...nouvellesConversations, ...generees].slice(0, reglages.plafondConversations ?? 8),
  ...manuelles,
]
console.log('')
console.log(`  ${nouveauxVrais.length} vraies, ${nouveauxFaux.length} fausses, ${nouvellesConversations.length} conversations`)
console.log(`  ${retirees} entrées périmées retirées, ${nonConformes.size} faux retirés (règles de prudence)`)
console.log(`  total : ${vrais.length} vraies, ${faux.length} fausses, ${contenu.conversations.length} conversations`)
for (const n of niveaux) {
  const v = vrais.filter((p) => p.level === n).length
  const f = faux.filter((p) => p.level === n).length
  console.log(`  niveau ${n} : ${v} vraies, ${f} fausses`)
}

if (drapeau('--essai')) {
  console.log('\n--essai : rien n’a été écrit.')
  for (const post of [...nouveauxVrais.slice(0, 2), ...nouveauxFaux.slice(0, 3)]) {
    console.log(`\n  [${post.isFake ? 'FAUX' : 'VRAI'}] niveau ${post.level} — ${post.source}`)
    console.log(`  ${post.titre}`)
  }
  process.exit(0)
}

if (JSON.stringify([vrais, faux, contenu.conversations]) === avant) {
  console.log('\nRien n’a changé : aucun fichier réécrit.')
  process.exit(0)
}

contenu.genere = AUJOURDHUI
ecrireJson(FICHIERS.vrais, vrais)
ecrireJson(FICHIERS.faux, faux)
ecrireJson(FICHIERS.contenu, contenu)
console.log('\nÉcrit : public/donnees/posts-vrais.json, posts-faux.json, contenu.json')
