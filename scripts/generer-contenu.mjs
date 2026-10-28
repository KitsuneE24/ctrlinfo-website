// node scripts/generer-contenu.mjs [--config config.json] [--refaire] [--essai]
import { readFileSync, writeFileSync } from 'node:fs'
import Parser from 'rss-parser'
import { HABILLAGES } from './gabarits.mjs'
import { DISTRIBUTIONS } from './gabarits-conversations.mjs'
import { fabriquerArticle, fabriquerFaux, fabriquerVrai, prochainFaux, prochainVrai, sujetsPour } from './fabrique.mjs'

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
const reglages = config.generation ?? {}
const reglagesArticles = reglages.articles ?? {}
const contenu = lireJson(FICHIERS.contenu)
let vrais = lireJson(FICHIERS.vrais)
let faux = lireJson(FICHIERS.faux)
const banques = { faits: contenu.faits ?? [], scenarios: contenu.scenarios ?? [] }
const maintenant = new Date().toISOString()
const tour = maintenant.slice(0, 10).replaceAll('-', '')
const options = { aideUrl: reglages.aideUrl, maintenant }

if (banques.faits.length === 0) {
  console.error('contenu.json ne contient aucun fait : rien à fabriquer.')
  process.exit(1)
}

const avant = JSON.stringify([vrais, faux, contenu.conversations])
const genere = (p) => p.origine === 'fiction' || p.origine === 'article'

if (drapeau('--refaire')) {
  vrais = vrais.filter((p) => !genere(p))
  faux = faux.filter((p) => !genere(p))
  contenu.conversations = contenu.conversations.filter((c) => !genere(c))
}

const lienWeb = (url) => {
  try {
    return typeof url === 'string' && ['http:', 'https:'].includes(new URL(url).protocol) ? url : null
  } catch {
    return null
  }
}
const propre = (texte, max) =>
  String(texte ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z]+;|&#x?[0-9a-f]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
const motif = (liste) => new RegExp((liste ?? []).join('|') || '$^', 'i')
const ecarte = motif(reglagesArticles.sujetsEcartes)
const MOTS_ANGLAIS = /\b(the|and|of|to|with|without|what|could|how|why|is|are|for)\b/gi
const enFrancais = (titre) => (titre.match(MOTS_ANGLAIS) ?? []).length < 2

async function lireArticles() {
  const parser = new Parser({ timeout: 20_000 })
  const articles = []
  for (const flux of (reglagesArticles.flux ?? []).filter((f) => f.actif !== false)) {
    try {
      const reponse = await fetch(flux.url, {
        headers: { 'user-agent': 'CTRL-INFO/1.0 (jeu educatif)' },
        signal: AbortSignal.timeout(25_000),
      })
      if (!reponse.ok) throw new Error(`${reponse.status}`)
      const lu = await parser.parseString(await reponse.text())
      for (const item of lu.items ?? []) {
        const titre = propre(item.title, 300)
        const url = lienWeb(item.link)
        if (!titre || !url) continue
        articles.push({
          titre,
          url,
          publieLe: item.isoDate ?? item.pubDate ?? null,
          nom: flux.nom,
          editeur: flux.editeur,
          auteur: propre(String(item.author ?? item.creator ?? flux.editeur).split(',')[0], 80) || flux.editeur,
          licence: flux.licence,
        })
      }
      console.log(`  ${flux.nom} : ${lu.items?.length ?? 0} articles lus`)
    } catch (erreur) {
      console.log(`  ${flux.nom} : échec (${erreur.message})`)
    }
  }
  const dejaPris = new Set(vrais.map((p) => p.article?.url).filter(Boolean))
  return articles
    .filter((a) => !dejaPris.has(a.url) && !ecarte.test(a.titre) && enFrancais(a.titre))
    .sort((x, y) => new Date(y.publieLe ?? 0) - new Date(x.publieLe ?? 0))
}

const niveaux = contenu.niveaux.map((n) => n.level).filter((n) => HABILLAGES.some((h) => h.niveau === n))
const parNiveau = reglages.postsParNiveau ?? 8
const articlesParNiveau = Math.round(parNiveau * (reglagesArticles.part ?? 0))
const renouveler = reglages.renouvelerParJour ?? 2
const plusAncien = (x, y) => new Date(x.recolteLe ?? 0) - new Date(y.recolteLe ?? 0)

let retires = 0
function rafraichir(posts) {
  const garde = posts.filter((p) => !genere(p))
  for (const n of niveaux) {
    const duNiveau = posts.filter((p) => genere(p) && p.level === n).sort(plusAncien)
    const sortants = duNiveau.length >= parNiveau ? Math.min(renouveler, duNiveau.length) : 0
    retires += sortants
    garde.push(...duNiveau.slice(sortants))
  }
  return garde
}
vrais = rafraichir(vrais)
faux = rafraichir(faux)

const disponibles = articlesParNiveau > 0 ? await lireArticles() : []
const estArticle = (p) => p.format === 'article'

const nouveaux = []
const ajouter = (liste, post) => {
  liste.push(post)
  nouveaux.push(post)
}
for (const n of niveaux) {
  const compter = (liste, filtre = () => true) => liste.filter((p) => p.level === n && filtre(p)).length
  while (compter(vrais, estArticle) < articlesParNiveau && compter(vrais) < parNiveau && disponibles.length > 0) {
    ajouter(vrais, fabriquerArticle(disponibles.shift(), n, options))
  }
  while (compter(vrais) < parNiveau) {
    const fait = prochainVrai(vrais, n, banques.faits)
    if (!fait) break
    ajouter(vrais, fabriquerVrai(fait, n, { ...options, prefixe: `vrai-${tour}` }))
  }
  const fauxOptions = { ...options, prefixe: `faux-${tour}` }
  while (compter(faux, estArticle) < compter(vrais, estArticle) && compter(faux) < compter(vrais)) {
    const choix = prochainFaux(faux, n, banques)
    if (!choix) break
    const photo = compter(faux, estArticle) >= compter(vrais, (p) => p.origine === 'article')
    ajouter(faux, fabriquerFaux(choix.base, choix.categorie, n, { ...fauxOptions, media: true, photo }))
  }
  while (compter(faux) < compter(vrais)) {
    const choix = prochainFaux(faux, n, banques)
    if (!choix) break
    ajouter(faux, fabriquerFaux(choix.base, choix.categorie, n, { ...fauxOptions, media: false }))
  }
}

let prochainId =
  Math.max(0, ...[...vrais, ...faux, ...Object.values(contenu.remediations ?? {})].map((p) => Number(p.id) || 0)) + 1
for (const post of nouveaux) post.id ??= prochainId++

const sujetsParContact = reglages.sujetsParContact ?? 3
const manuelles = contenu.conversations.filter((c) => !genere(c))
let sujets = contenu.conversations.filter((c) => genere(c) && c.contact)
for (const distribution of DISTRIBUTIONS) {
  const duContact = sujets.filter((c) => c.contact === distribution.id).sort(plusAncien)
  if (duContact.length >= sujetsParContact) {
    sujets = sujets.filter((c) => c !== duContact[0])
    retires += 1
  }
}
const nouveauxSujets = []
for (const distribution of DISTRIBUTIONS) {
  const tous = [...sujets, ...nouveauxSujets]
  const manque = sujetsParContact - tous.filter((c) => c.contact === distribution.id).length
  if (manque > 0) {
    nouveauxSujets.push(...sujetsPour(distribution, tous, manque, banques, { ...options, prefixe: `sujet-${tour}` }))
  }
}
contenu.conversations = [...nouveauxSujets, ...sujets, ...manuelles]

console.log(`${banques.faits.length} faits, ${banques.scenarios.length} événements inventés`)
console.log(`  ${nouveaux.length} posts et ${nouveauxSujets.length} sujets fabriqués, ${retires} renouvelés`)
for (const n of niveaux) {
  const v = vrais.filter((p) => p.level === n)
  const f = faux.filter((p) => p.level === n)
  console.log(
    `  niveau ${n} : ${v.length} vrais (${v.filter(estArticle).length} articles), ${f.length} faux (${f.filter(estArticle).length} articles)`
  )
}

if (drapeau('--essai')) {
  console.log('\n--essai : rien n’a été écrit.')
  for (const post of nouveaux.slice(0, 6)) console.log(`  [${post.isFake ? 'FAUX' : 'VRAI'}] ${post.level} ${post.source} : ${post.titre}`)
  process.exit(0)
}

if (JSON.stringify([vrais, faux, contenu.conversations]) === avant) {
  console.log('\nRien n’a changé : aucun fichier réécrit.')
  process.exit(0)
}

contenu.genere = maintenant
ecrireJson(FICHIERS.vrais, vrais)
ecrireJson(FICHIERS.faux, faux)
ecrireJson(FICHIERS.contenu, contenu)
console.log('\nÉcrit : public/donnees/posts-vrais.json, posts-faux.json, contenu.json')
