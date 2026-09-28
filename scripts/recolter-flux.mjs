/**
 * Récolte les flux RSS et ajoute des publications à donnees/contenu.json.
 *
 *   node scripts/recolter-flux.mjs [--config config.json] [--essai]
 *
 * Additif : les publications déjà là sont gardées. Un article déjà exploité ne
 * l'est jamais deux fois — il est reconnu à son URL, retenue dans la
 * publication qu'il a produite.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import Parser from 'rss-parser'
import {
  CONSEQUENCES_FAUX,
  CONSEQUENCES_VRAI,
  GABARITS,
  SCORES_FAUX,
  SCORES_VRAI,
} from './gabarits.mjs'

const argument = (nom, defaut) => {
  const i = process.argv.indexOf(nom)
  return i > -1 ? process.argv[i + 1] : defaut
}
const drapeau = (nom) => process.argv.includes(nom)

const CONFIG = new URL(`../${argument('--config', 'config.json')}`, import.meta.url)
const CONTENU = new URL('../public/donnees/contenu.json', import.meta.url)

const config = JSON.parse(readFileSync(CONFIG, 'utf8'))
const contenu = JSON.parse(readFileSync(CONTENU, 'utf8'))
const reglages = config.recolte ?? {}

const parser = new Parser({
  timeout: 20_000,
  customFields: { item: ['media:content', 'media:thumbnail', 'summary'] },
})

// ── Lecture des flux ─────────────────────────────────────────────────────────

const imageDe = (item) => {
  const candidats = [
    item.enclosure?.type?.startsWith('image') ? item.enclosure.url : undefined,
    item['media:content']?.$?.url,
    item['media:thumbnail']?.$?.url,
  ]
  return candidats.find((url) => typeof url === 'string' && url.startsWith('http')) ?? null
}

const sansBalises = (texte) =>
  (texte ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

async function recolter(flux) {
  const reponse = await fetch(flux.url, {
    headers: { 'user-agent': 'CTRL INFO (récolte éditoriale)' },
    signal: AbortSignal.timeout(25_000),
  })
  if (!reponse.ok) throw new Error(`${reponse.status}`)

  const analyse = await parser.parseString(await reponse.text())
  return (analyse.items ?? [])
    .slice(0, reglages.maxArticlesParFlux ?? 20)
    .map((item) => ({
      titre: sansBalises(item.title).slice(0, 300),
      resume: sansBalises(item.contentSnippet ?? item.summary ?? item.content).slice(0, 600),
      url: item.link ?? null,
      image: imageDe(item),
      publieLe: item.isoDate ?? item.pubDate ?? null,
      flux,
    }))
    .filter((article) => article.titre && article.url)
}

// ── Fabrication ──────────────────────────────────────────────────────────────

const domaineDe = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

/** Une date absolue : la publication reste des semaines, « il y a 2 h » vieillit. */
const dateLisible = (iso) =>
  (iso ? new Date(iso) : new Date()).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })

/** Un identifiant stable tiré de l'URL : deux récoltes donnent le même slug. */
function empreinte(texte) {
  let e = 0x811c9dc5
  for (const octet of new TextEncoder().encode(texte)) {
    e ^= octet
    e = Math.imul(e, 0x01000193) >>> 0
  }
  return (e >>> 0).toString(36)
}

const commun = (article) => ({
  domain: domaineDe(article.url),
  date: dateLisible(article.publieLe),
  image: article.image,
  sponsorise: false,
  indices: [],
  commentaires: [],
  learnMoreTips: reglages.aideUrl ?? 'https://www.clemi.fr/',
  reactionCount: Math.floor(Math.random() * 40_000) + 200,
  commentCount: Math.floor(Math.random() * 2_000) + 10,
  origine: 'RSS',
  article: { titre: article.titre, url: article.url, publieLe: article.publieLe },
})

function fabriquerVrai(article) {
  const texte =
    article.resume && article.resume.length >= 40
      ? article.resume
      : `${article.titre} — article publié par ${article.flux.editeur}, signé et daté, ` +
        `consultable en entier sur le site de la rédaction.`

  return {
    ...commun(article),
    slug: `rss-vrai-${empreinte(article.url)}`,
    source: article.flux.nom,
    sourceColor: '#1800ad',
    titre: article.titre,
    texte,
    isFake: false,
    level: article.flux.levelDefaut,
    correctAction: 'share',
    biais: 'Aucun (information vérifiée)',
    explication:
      `Cette publication reprend telle quelle une information de ${article.flux.editeur} : ` +
      `rédaction identifiable, date, lien vers l'article complet. Rien n'y a été ajouté. ` +
      `Une information de cette nature se partage sans risque — c'est même ce qui devrait circuler.`,
    encouragement: 'Bon réflexe : une source identifiable, datée et consultable se partage.',
    warning:
      "Attention — cette information était vérifiable : rédaction connue, date, lien vers l'original.",
    consequences: CONSEQUENCES_VRAI,
    scores: SCORES_VRAI,
    sourceUrl: article.url,
    learnMoreUrl: article.url,
  }
}

function fabriquerFaux(article, graine) {
  const gabarit = GABARITS[graine % GABARITS.length]
  // Le procédé impose son plancher, le flux peut le relever.
  const level = Math.min(3, Math.max(article.flux.levelDefaut, gabarit.niveau))

  return {
    ...commun(article),
    slug: `rss-faux-${empreinte(article.url)}`,
    source: gabarit.compte,
    sourceColor: gabarit.couleur,
    domain: gabarit.domaine,
    titre: gabarit.titre(article.titre).slice(0, 300),
    texte: gabarit.texte({
      titre: article.titre,
      resume: article.resume,
      editeur: article.flux.editeur,
    }),
    isFake: true,
    level,
    correctAction: 'report',
    biais: gabarit.biais,
    explication: gabarit.explication,
    encouragement: `Bien vu : tu as reconnu le procédé « ${gabarit.biais.toLowerCase()} ».`,
    warning: `Le procédé employé ici s'appelle « ${gabarit.biais.toLowerCase()} ». Il fonctionne d'autant mieux qu'on est pressé.`,
    consequences: CONSEQUENCES_FAUX,
    scores: SCORES_FAUX,
    sourceUrl: null,
    learnMoreUrl: article.url,
  }
}

// ── Déroulé ──────────────────────────────────────────────────────────────────

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

// Ce qui a déjà servi, reconnu à l'URL de l'article d'origine.
const dejaVus = new Set(
  contenu.posts.map((post) => post.article?.url).filter(Boolean)
)

const frais = articles
  .filter((article) => !dejaVus.has(article.url))
  .sort((a, b) => new Date(b.publieLe ?? 0) - new Date(a.publieLe ?? 0))
  .slice(0, reglages.maxPublications ?? 12)

if (frais.length === 0) {
  console.log('\nRien de neuf : tous les articles lus ont déjà servi.')
  process.exit(0)
}

// Un article donne une publication, jamais deux. L'alternance garantit du vrai
// dans le lot ; un flux de vérification ne sert jamais de matière à un faux.
const nouvelles = frais.map((article, index) => {
  const enFaux =
    index % 2 === 1 && article.flux.fiable && article.flux.categorie !== 'Vérification'
  return enFaux ? fabriquerFaux(article, index) : fabriquerVrai(article)
})

const idDepart = Math.max(0, ...contenu.posts.map((post) => Number(post.id) || 0)) + 1
nouvelles.forEach((post, i) => {
  post.id = idDepart + i
})

// Le contenu issu des flux s'accumulerait sans fin : au-delà du plafond, les
// plus anciennes publications fabriquées sortent. Celles écrites à la main
// restent, quoi qu'il arrive.
const plafond = reglages.plafondActives ?? 90
const manuelles = contenu.posts.filter((post) => post.origine !== 'RSS')
const desFlux = [...nouvelles, ...contenu.posts.filter((post) => post.origine === 'RSS')]
const retirees = Math.max(0, desFlux.length - plafond)

contenu.posts = [...manuelles, ...desFlux.slice(0, plafond)]
contenu.genere = new Date().toISOString()

const vraies = nouvelles.filter((post) => !post.isFake).length

console.log('')
console.log(`  ${nouvelles.length} publications fabriquées — ${vraies} vraies, ${nouvelles.length - vraies} fausses`)
if (retirees > 0) console.log(`  ${retirees} anciennes publications de flux retirées (plafond ${plafond})`)
console.log(`  total : ${contenu.posts.length} publications, dont ${manuelles.length} écrites à la main`)

if (drapeau('--essai')) {
  console.log('\n--essai : rien n’a été écrit.')
  for (const post of nouvelles.slice(0, 3)) {
    console.log(`\n  [${post.isFake ? 'FAUX' : 'VRAI'}] niveau ${post.level} — ${post.source}`)
    console.log(`  ${post.titre}`)
  }
  process.exit(0)
}

writeFileSync(CONTENU, JSON.stringify(contenu, null, 2) + '\n', 'utf8')
console.log('\nÉcrit : public/donnees/contenu.json')
