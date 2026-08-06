/**
 * Contrat de données entre l'IA et l'application.
 *
 * Un LLM local se trompe : champ manquant, action inventée, texte vide.
 * Rien ne part vers src/data/ sans passer par validatePost().
 */

import { ACTIONS, BIAS_NAMES, FAKE_GUARDRAILS } from '../config/taxonomy.js'

/** Champs consommés par PostCard.jsx / Feed.jsx / NotificationBanner.jsx */
export const REQUIRED_FIELDS = [
  'id', 'source', 'sourceColor', 'date', 'titre', 'texte', 'image',
  'isFake', 'correctAction', 'level', 'biais', 'explication',
  'consequences', 'scores', 'sourceUrl', 'learnMoreUrl', 'learnMoreTips',
  'encouragement', 'warning', 'domain', 'reactionCount', 'commentCount',
]

/**
 * Schéma JSON demandé au modèle pour un VRAI post.
 * Le modèle ne produit QUE de la rédaction — jamais l'action ni le score,
 * qui sont décidés par des règles déterministes (config/taxonomy.js).
 */
export const REAL_POST_SCHEMA = {
  type: 'object',
  properties: {
    texte: { type: 'string' },
    kind: { type: 'string', enum: ['service', 'factuel', 'neutre', 'encours'] },
    explication: { type: 'string' },
    consequences: {
      type: 'object',
      properties: {
        share: { type: 'string' },
        ignore: { type: 'string' },
        report: { type: 'string' },
      },
      required: ['share', 'ignore', 'report'],
    },
    encouragement: { type: 'string' },
    warning: { type: 'string' },
  },
  required: ['texte', 'kind', 'explication', 'consequences', 'encouragement', 'warning'],
}

/** Schéma JSON demandé au modèle pour un FAUX post. */
export const FAKE_POST_SCHEMA = {
  type: 'object',
  properties: {
    source: { type: 'string' },
    domain: { type: 'string' },
    date: { type: 'string' },
    titre: { type: 'string' },
    texte: { type: 'string' },
    explication: { type: 'string' },
    consequences: {
      type: 'object',
      properties: {
        share: { type: 'string' },
        ignore: { type: 'string' },
        report: { type: 'string' },
      },
      required: ['share', 'ignore', 'report'],
    },
    encouragement: { type: 'string' },
    warning: { type: 'string' },
  },
  required: [
    'source', 'domain', 'date', 'titre', 'texte',
    'explication', 'consequences', 'encouragement', 'warning',
  ],
}

/**
 * Valide un post complet, prêt à être écrit dans src/data/.
 * @returns {string[]} liste des erreurs (vide = valide)
 */
export function validatePost(post) {
  const errs = []
  const need = (c, m) => { if (!c) errs.push(m) }

  for (const f of REQUIRED_FIELDS) {
    if (post[f] === undefined || post[f] === null) errs.push(`champ manquant : ${f}`)
  }
  if (errs.length) return errs

  need(typeof post.texte === 'string' && post.texte.length >= 40,
    'texte trop court (< 40 caractères)')
  need(typeof post.titre === 'string' && post.titre.length >= 15,
    'titre trop court (< 15 caractères)')
  need(ACTIONS.includes(post.correctAction),
    `correctAction invalide : ${post.correctAction}`)
  need(typeof post.isFake === 'boolean', 'isFake doit être un booléen')
  need([1, 2, 3].includes(post.level), `level invalide : ${post.level}`)

  for (const a of ACTIONS) {
    need(typeof post.consequences?.[a] === 'string' && post.consequences[a].length > 20,
      `consequences.${a} manquante ou trop courte`)
    need(typeof post.scores?.[a] === 'number', `scores.${a} doit être un nombre`)
  }

  need(post.scores?.[post.correctAction] === Math.max(...ACTIONS.map((a) => post.scores?.[a] ?? -999)),
    'la bonne action doit être celle qui rapporte le plus de points')

  if (post.isFake) {
    need(BIAS_NAMES.includes(post.biais), `biais inconnu : ${post.biais}`)
    if (!FAKE_GUARDRAILS.allowRealOutletImpersonation) {
      const sig = `${post.source} ${post.domain}`.toLowerCase()
      const hit = FAKE_GUARDRAILS.bannedOutletNames.find((n) => sig.includes(n))
      need(!hit, `un faux post ne peut pas usurper un vrai média : « ${hit} »`)
    }
  } else {
    need(String(post.biais).toLowerCase().startsWith('aucun'),
      'un vrai post ne doit pas porter de biais')
  }

  for (const u of [post.sourceUrl, post.learnMoreUrl, post.learnMoreTips]) {
    need(typeof u === 'string' && u.startsWith('http'), `URL invalide : ${u}`)
  }

  return errs
}

/** Sépare un lot en { ok, rejected } avec le motif du rejet. */
export function partitionValid(posts) {
  const ok = []
  const rejected = []
  for (const p of posts) {
    const errs = validatePost(p)
    if (errs.length) rejected.push({ post: p, errs })
    else ok.push(p)
  }
  return { ok, rejected }
}
