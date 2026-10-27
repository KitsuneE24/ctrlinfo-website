/**
 * Fabriquer de nouvelles publications et conversations dans le navigateur,
 * à partir des vraies déjà récoltées (marquées `fauxPossible` par la récolte).
 * Une même vraie donne un faux par procédé et par niveau, jamais deux fois.
 */
import { CATEGORIES, HABILLAGES } from '../../scripts/gabarits.mjs'
import { DISTRIBUTIONS } from '../../scripts/gabarits-conversations.mjs'
import {
  articleDe,
  empreinte,
  fabriquerConversation,
  fabriquerFaux,
  personneDe,
} from '../../scripts/fabrique.mjs'
import { melanger, niveauDeContenu } from './tirage'

const LOT_POSTS = 8
const LOT_CONVERSATIONS = 3

const graine = () => Math.floor(Math.random() * 1000)

/** Les procédés permis pour cet article : rien n'est prêté à une personne citée. */
const permises = (article) =>
  personneDe(article) ? CATEGORIES.filter((c) => c.surUnePersonne !== false) : CATEGORIES

const options = (post) => ({ aideUrl: post.learnMoreTips })

/** Des faux neufs au niveau du joueur, et des vraies qu'il n'a pas encore vues. */
export function fabriquerPublications(posts, { level, vus = [] }) {
  const cible = niveauDeContenu(posts, level)
  if (!HABILLAGES.some((h) => h.niveau === cible)) return []

  const duNiveau = posts.filter((p) => p.isFake && p.level === cible)
  const pris = new Set(duNiveau.map((p) => `${p.article?.url}|${p.biais}`))
  const parProcede = new Map()
  for (const p of duNiveau) parProcede.set(p.biais, (parProcede.get(p.biais) ?? 0) + 1)

  const faux = []
  for (const vrai of melanger(posts.filter((p) => !p.isFake && p.fauxPossible))) {
    if (faux.length === LOT_POSTS) break
    const article = articleDe(vrai)
    const libres = permises(article).filter((c) => !pris.has(`${article.url}|${c.biais}`))
    if (libres.length === 0) continue

    // Le procédé le moins représenté à ce niveau.
    const categorie = libres.sort(
      (x, y) => (parProcede.get(x.biais) ?? 0) - (parProcede.get(y.biais) ?? 0)
    )[0]
    const slug = `local-faux-${empreinte(`${article.url}|${cible}|${categorie.biais}`)}`
    faux.push({
      ...fabriquerFaux(article, categorie, cible, graine(), options(vrai)),
      slug,
      id: slug,
      origine: 'local',
    })
    pris.add(`${article.url}|${categorie.biais}`)
    parProcede.set(categorie.biais, (parProcede.get(categorie.biais) ?? 0) + 1)
  }

  // Autant de vraies que de faux : des vraies d'autres niveaux, jamais vues.
  const dejaVus = new Set(vus)
  const presentes = new Set(posts.filter((p) => !p.isFake && p.level === cible).map((p) => p.article?.url))
  const vraies = melanger(
    posts.filter((p) => !p.isFake && p.article && !dejaVus.has(p.slug) && !presentes.has(p.article.url))
  )
    .slice(0, faux.length)
    .map((p) => {
      const slug = `local-vrai-${empreinte(p.article.url)}-${cible}`
      return { ...p, slug, id: slug, level: cible, origine: 'local' }
    })

  return [...faux, ...vraies]
}

/** Des conversations sur des articles qui n'en ont pas encore. */
export function fabriquerConversations(posts, conversations) {
  const prises = new Set(conversations.map((c) => c.article?.url))
  const matieres = melanger(
    posts.filter((p) => !p.isFake && p.fauxPossible && !prises.has(p.article?.url))
  ).slice(0, LOT_CONVERSATIONS)

  return matieres.map((vrai, i) => {
    const article = articleDe(vrai)
    const categories = permises(article)
    const categorie = categories[Math.floor(Math.random() * categories.length)]
    // Pas de niveau 5 : le compte y porte le nom du vrai média.
    const niveau = 1 + Math.floor(Math.random() * 4)
    const post = fabriquerFaux(article, categorie, niveau, graine(), options(vrai))
    const distribution = DISTRIBUTIONS[(conversations.length + i) % DISTRIBUTIONS.length]
    return {
      ...fabriquerConversation(post, article, categorie, distribution, {
        id: `local-${empreinte(article.url)}`,
      }),
      origine: 'local',
    }
  })
}
