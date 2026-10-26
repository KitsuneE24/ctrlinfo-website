/**
 * Récolte les flux RSS et fabrique des publications et des conversations.
 *
 *   node scripts/recolter-flux.mjs [--config config.json] [--max 24] [--refaire] [--essai]
 *
 * Écrit public/donnees/posts-vrais.json, posts-faux.json, et les conversations
 * de contenu.json. Un article déjà exploité (reconnu à son URL) ne resert pas.
 * --refaire retire d'abord tout ce que les flux ont produit.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import Parser from 'rss-parser'
import {
  COMMENTATEURS,
  CONSEQUENCES_FAUX,
  CONSEQUENCES_VRAI,
  CATEGORIES,
  HABILLAGES,
  SCORES_FAUX,
  SCORES_VRAI,
  VRAI,
} from './gabarits.mjs'
import { DISTRIBUTIONS, etapes, outro } from './gabarits-conversations.mjs'

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

const parser = new Parser({
  timeout: 20_000,
  customFields: { item: ['media:content', 'media:thumbnail', 'summary', 'source'] },
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

const domaineDe = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

/** Un agrégateur (Google Actualités) : la vraie rédaction est dans `source`. */
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
        // Un résumé qui répète le titre n'apporte rien.
        resume: resume.startsWith(r.titre.slice(0, 40)) ? '' : resume.slice(0, 600),
        url: item.link ?? null,
        image: imageDe(item),
        publieLe: item.isoDate ?? item.pubDate ?? null,
        flux,
      }
    })
    .filter((article) => article.titre && article.url)
}

// ── Fabrication ──────────────────────────────────────────────────────────────

/** Une date absolue : la publication reste des semaines, « il y a 2 h » vieillit. */
const dateLisible = (iso) =>
  (iso ? new Date(iso) : new Date()).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    // Heure de Nouméa, même quand le script tourne ailleurs (GitHub Actions).
    timeZone: 'Pacific/Noumea',
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

/** Le début du résumé, coupé à une phrase ou un mot, terminé par un point. */
function extrait(resume, max = 220) {
  if (!resume || resume.length < 40) return ''
  let court = resume
  if (court.length > max) {
    const coupe = court.slice(0, max)
    const phrase = Math.max(coupe.lastIndexOf('. '), coupe.lastIndexOf('! '), coupe.lastIndexOf('? '))
    court = phrase > 80 ? coupe.slice(0, phrase + 1) : `${coupe.slice(0, coupe.lastIndexOf(' '))}…`
  }
  return /[.!?…»]$/.test(court) ? court : `${court}.`
}

const proprement = (texte) => texte.replace(/\s+/g, ' ').trim()

/** Le contexte que les gabarits utilisent. */
function contexte(article) {
  const base = (article.domaineReel ?? 'info').split('.').find((p) => p.length > 2) ?? 'info'
  return {
    titre: article.titre,
    extrait: extrait(article.resume),
    editeur: article.editeur,
    nom: article.nom,
    date: dateLisible(article.publieLe),
    domaineReel: article.domaineReel ?? article.nom,
    domaineFaux: `${base}-actu.info`,
    // franceinfo.fr → franceinfo-fr.com
    domaineCopie: `${(article.domaineReel ?? base).replace(/\.([a-z]+)$/, '-$1')}.com`,
  }
}

const indice = (nature, cible, picto, libelle, explication) => ({
  nature,
  cible,
  picto,
  libelle,
  explication,
})

function commentaires(lignes, graine) {
  return lignes.map(([posture, texte], k) => {
    const liste = COMMENTATEURS[posture]
    const [auteur, couleur] = liste[(graine + k * 3) % liste.length]
    return { auteur, couleur, texte, posture }
  })
}

const avecOrdre = (indices) => indices.map((indice, ordre) => ({ ordre, ...indice }))

const commun = (article, a) => ({
  date: a.date,
  image: article.image,
  sponsorise: false,
  learnMoreTips: reglages.aideUrl ?? 'https://www.clemi.fr/',
  reactionCount: Math.floor(Math.random() * 40_000) + 200,
  commentCount: Math.floor(Math.random() * 2_000) + 10,
  origine: 'RSS',
  recolteLe: AUJOURDHUI,
  article: {
    titre: article.titre,
    url: article.url,
    publieLe: article.publieLe,
    nom: article.nom,
    editeur: article.editeur,
  },
})

function fabriquerVrai(article, level, graine) {
  const a = contexte(article)
  const texte =
    a.extrait ||
    `${article.titre} — article publié par ${a.editeur}, signé et daté, consultable en entier sur le site de la rédaction.`

  return {
    ...commun(article, a),
    slug: `rss-vrai-${empreinte(article.url)}`,
    source: a.nom,
    sourceColor: '#1800ad',
    domain: a.domaineReel,
    titre: article.titre,
    texte,
    isFake: false,
    level,
    correctAction: 'share',
    biais: 'Aucun (information vérifiée)',
    explication: VRAI.explication(a),
    analyseVrai: VRAI.analyseVrai(a),
    indices: avecOrdre(VRAI.indices(a)),
    commentaires: commentaires(VRAI.commentaires[graine % VRAI.commentaires.length](a), graine),
    encouragement: 'Bon réflexe : une source identifiable, datée et consultable se partage.',
    warning: "Attention — cette information était vérifiable : rédaction connue, date, lien vers l'original.",
    consequences: CONSEQUENCES_VRAI,
    scores: SCORES_VRAI,
    sourceUrl: article.url,
    learnMoreUrl: article.url,
  }
}

const valeur = (v, a) => (typeof v === 'function' ? v(a) : v)

/** Un faux : une catégorie (ce qui est ajouté) habillée au niveau voulu. */
function fabriquerFaux(article, categorie, niveau, graine) {
  const a = contexte(article)
  const habillage = HABILLAGES.find((h) => h.niveau === niveau)
  const [nom, couleur, domaine] = habillage.comptes[graine % habillage.comptes.length]
  const compte = { nom: valeur(nom, a), couleur, domaine: valeur(domaine, a) }
  const titre = categorie.titres[niveau - 1](a.titre)
  const subtil = niveau >= 4

  return {
    ...commun(article, a),
    slug: `rss-faux-${empreinte(article.url)}`,
    source: compte.nom,
    sourceColor: compte.couleur,
    domain: compte.domaine,
    titre: (habillage.titre?.(titre) ?? titre).slice(0, 300),
    texte: proprement(`${a.extrait} ${categorie.phrases[niveau - 1]}`),
    isFake: true,
    level: niveau,
    correctAction: 'report',
    biais: categorie.biais,
    explication:
      `Fabriquée pour l'exercice à partir d'un article de ${a.editeur} : le fait est réel, l'ajout non. ` +
      `${categorie.explication} ${habillage.explication}`,
    analyseVrai: `Le fait de départ est réel : ${a.editeur} l'a publié le ${a.date}.`,
    analyseFaux: categorie.analyseFaux,
    indices: avecOrdre([
      categorie.indice,
      habillage.indice(a, compte),
      subtil
        ? indice('FIABLE', 'TITRE', 'Newspaper', 'Le reste est exact',
          `Le fait vient bien de ${a.editeur} (${a.date}). C’est ce qui rend la publication crédible.`)
        : indice('VERIFICATION', 'DATE', 'Search', 'L’article d’origine',
          `Le fait vient de ${a.nom}, publié le ${a.date}. Compare : c’est là qu’on voit ce qui a été ajouté.`),
    ]),
    commentaires: commentaires(
      [
        ['CROIT', categorie.croit],
        ['DOUTE', categorie.doute],
        ['VERIFIE', categorie.verifie[subtil ? 1 : 0](a)],
      ],
      graine
    ),
    encouragement: `Bien vu : tu as reconnu le procédé « ${categorie.biais.toLowerCase()} ».`,
    warning: `Le procédé employé ici s'appelle « ${categorie.biais.toLowerCase()} ». Il fonctionne d'autant mieux qu'on est pressé.`,
    consequences: CONSEQUENCES_FAUX,
    scores: SCORES_FAUX,
    sourceUrl: null,
    learnMoreUrl: article.url,
  }
}

function fabriquerConversation(post, article, gabarit, distribution) {
  const a = contexte(article)
  const { lanceur, soutien, groupe } = distribution
  const id = `rss-${empreinte(article.url)}`
  const message = ([auteur, texte]) => ({ texte, auteur })

  const steps = etapes({ post, a, gabarit, lanceur, soutien }).map((etape, ordre) => {
    // La bonne réponse ne tombe pas toujours au même rang.
    const decalage = (empreinte(article.url).charCodeAt(0) + ordre) % etape.choix.length
    const choix = [...etape.choix.slice(decalage), ...etape.choix.slice(0, decalage)]
    return {
      ordre,
      auteur: lanceur,
      messages: etape.messages.filter(Boolean).map(message),
      choices: choix.map((c, i) => ({ id: `${id}-${ordre}-${i}`, ...c })),
    }
  })

  return {
    id,
    name: groupe ? distribution.nom : lanceur.nom,
    preview: `Regarde ce que ${post.source} vient de publier`,
    color: lanceur.couleur,
    groupe,
    ...(groupe ? { contexte: distribution.nom } : {}),
    etapes: steps.length,
    participants: groupe ? [lanceur, soutien] : [lanceur],
    intro: [],
    steps,
    outro: outro(a),
    origine: 'RSS',
    recolteLe: AUJOURDHUI,
    article: { titre: article.titre, url: article.url, publieLe: article.publieLe, nom: article.nom },
  }
}

// ── Déroulé ──────────────────────────────────────────────────────────────────

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

const dejaVus = new Set(
  [...vrais, ...faux, ...contenu.conversations].map((entree) => entree.article?.url).filter(Boolean)
)

const motif = (liste) => new RegExp((liste ?? []).join('|') || '$^', 'i')
// Les sujets graves sont écartés : ni vrai, ni faux.
const sensible = motif(reglages.sujetsSensibles)
// Les sujets délicats donnent une vraie, jamais un faux.
const sansFaux = motif(reglages.sujetsSansFaux)

const frais = [...new Map(articles.map((article) => [article.url, article])).values()]
  .filter((article) => !dejaVus.has(article.url))
  .filter((article) => !sensible.test(`${article.titre} ${article.resume}`))
  .sort((a, b) => new Date(b.publieLe ?? 0) - new Date(a.publieLe ?? 0))
  .slice(0, Number(argument('--max', reglages.maxPublications ?? 24)))

if (frais.length === 0) console.log('\nAucun article neuf : tous ceux lus ont déjà servi.')

// Les niveaux, puis les catégories dans chaque niveau, se remplissent à tour de rôle.
const niveaux = contenu.niveaux
  .map((n) => n.level)
  .filter((n) => HABILLAGES.some((h) => h.niveau === n))
const compter = (posts, cle) =>
  posts.reduce((compte, post) => compte.set(cle(post), (compte.get(cle(post)) ?? 0) + 1), new Map())
const vraisParNiveau = compter(vrais, (p) => p.level)
const fauxParNiveau = compter(faux, (p) => p.level)
const fauxParCase = compter(faux, (p) => `${p.level}|${p.biais}`)
// Un poids de 3 = trois fois plus de publications que les autres niveaux.
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
  // Un flux de vérification ne sert jamais de matière à un faux.
  const eligible =
    article.flux.fiable &&
    article.flux.categorie !== 'Vérification' &&
    !sansFaux.test(`${article.titre} ${article.resume}`) &&
    extrait(article.resume) !== ''
  const enFaux = eligible && faux.length + nouveauxFaux.length <= vrais.length + nouveauxVrais.length

  if (enFaux) {
    const niveau = moinsRempli(niveaux, fauxParNiveau, undefined, poids)
    const categorie = moinsRempli(
      CATEGORIES,
      new Map(CATEGORIES.map((c) => [c, fauxParCase.get(`${niveau}|${c.biais}`) ?? 0]))
    )
    const post = fabriquerFaux(article, categorie, niveau, graine)
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
    nouveauxVrais.push(fabriquerVrai(article, niveau, graine))
  }
})

// Des identifiants uniques entre les deux fichiers et les remédiations.
let prochainId =
  Math.max(
    0,
    ...[...vrais, ...faux, ...Object.values(contenu.remediations ?? {})].map((p) => Number(p.id) || 0)
  ) + 1
for (const post of [...nouveauxVrais, ...nouveauxFaux]) post.id = prochainId++

// Une entrée des flux périmée sort, sauf s'il en manque pour remplir un niveau.
const joursDeVie = reglages.joursAvantPeremption ?? 0
const ageEnJours = (entree) =>
  (Date.now() - new Date(entree.recolteLe ?? entree.article?.publieLe ?? AUJOURDHUI)) / 86_400_000
const perimee = (entree) => joursDeVie > 0 && ageEnJours(entree) > joursDeVie
let retirees = 0

// Au-delà du plafond, les plus anciennes publications des flux sortent.
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

// Les conversations : une par publication fausse, dans la limite du lot.
const generees = contenu.conversations.filter((c) => c.origine === 'RSS' && !perimee(c))
retirees += contenu.conversations.filter((c) => c.origine === 'RSS').length - generees.length
const manuelles = contenu.conversations.filter((c) => c.origine !== 'RSS')
const nouvellesConversations = fabriques
  // Au niveau 5 le compte porte le nom du vrai média : la conversation n'aurait pas de sens.
  .filter(({ post }) => post.level < 5)
  .slice(0, reglages.maxConversations ?? 3)
  .map(({ post, article, gabarit }, i) =>
    fabriquerConversation(post, article, gabarit, DISTRIBUTIONS[(generees.length + i) % DISTRIBUTIONS.length])
  )
contenu.conversations = [
  ...[...nouvellesConversations, ...generees].slice(0, reglages.plafondConversations ?? 8),
  ...manuelles,
]
console.log('')
console.log(`  ${nouveauxVrais.length} vraies, ${nouveauxFaux.length} fausses, ${nouvellesConversations.length} conversations`)
console.log(`  ${retirees} entrées périmées retirées`)
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
