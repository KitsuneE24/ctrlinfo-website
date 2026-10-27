/**
 * Fabriquer de nouveaux posts et sujets dans le navigateur, depuis les banques de contenu.json.
 * Autant de vrais que de faux par lot ; les sujets de discussion arrivent par 10, contact par contact.
 */
import { HABILLAGES } from '../../scripts/gabarits.mjs'
import { DISTRIBUTIONS } from '../../scripts/gabarits-conversations.mjs'
import { fabriquerFaux, fabriquerVrai, prochainFaux, prochainVrai, sujetsPour } from '../../scripts/fabrique.mjs'
import { niveauDeContenu } from './tirage'

const LOT_POSTS = 8
const LOT_CONVERSATIONS = 10

const estArticle = (p) => p.format === 'article'
const banquesDe = (contenu) => ({ faits: contenu.faits ?? [], scenarios: contenu.scenarios ?? [] })
const aide = (posts) => posts.find((p) => p.learnMoreTips)?.learnMoreTips
// Un préfixe propre à chaque lot : un même fait peut revenir, avec un autre auteur.
const lot = () => `local-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

/** Des posts neufs au niveau du joueur : autant de vrais que de faux. */
export function fabriquerPublications(contenu, { level, vus = [] }) {
  const posts = contenu.posts
  const cible = niveauDeContenu(posts, level)
  if (!HABILLAGES.some((h) => h.niveau === cible)) return []

  const banques = banquesDe(contenu)
  const dejaVus = new Set(vus)
  const prefixe = lot()
  const options = { aideUrl: aide(posts) }

  // Les faits que le joueur n'a pas encore vus passent d'abord.
  const vusFaits = posts.filter((p) => !p.isFake && dejaVus.has(p.slug)).map((p) => ({ ...p, level: cible }))
  const vrais = []
  for (let i = 0; i < LOT_POSTS; i++) {
    // Tout est vu : les faits reviennent, sans doublon dans le lot.
    const fait = prochainVrai([...vusFaits, ...vrais], cible, banques.faits) ?? prochainVrai(vrais, cible, banques.faits)
    if (!fait) break
    vrais.push({ ...fabriquerVrai(fait, cible, { ...options, prefixe: `${prefixe}-vrai` }), origine: 'local' })
  }

  const pris = posts.filter((p) => p.isFake && p.scenario && dejaVus.has(p.slug)).map((p) => ({ ...p, level: cible }))
  const faux = []
  while (faux.length < vrais.length) {
    const choix = prochainFaux([...pris, ...faux], cible, banques)
    if (!choix) break
    // Autant de faux articles que de vrais articles.
    const media = faux.filter(estArticle).length < vrais.filter(estArticle).length
    faux.push({ ...fabriquerFaux(choix.base, choix.categorie, cible, { ...options, prefixe: `${prefixe}-faux`, media }), origine: 'local' })
  }

  const avecId = (p) => ({ ...p, id: p.slug })
  return [...faux, ...vrais.slice(0, faux.length)].map(avecId)
}

/** Un lot de nouveaux sujets pour un contact de la messagerie. */
export function fabriquerConversations(contenu, contact) {
  const distribution = DISTRIBUTIONS.find((d) => d.id === contact)
  if (!distribution) return []
  return sujetsPour(distribution, contenu.conversations, LOT_CONVERSATIONS, banquesDe(contenu), {
    prefixe: lot(),
  }).map((c) => ({ ...c, origine: 'local' }))
}
