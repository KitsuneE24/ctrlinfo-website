/**
 * ÉTAPE 4 — Tri selon les actions possibles, et équilibrage du deck.
 *
 * PRINCIPE : l'IA rédige, les RÈGLES décident.
 * L'action attendue (partager / ignorer / signaler) et le barème ne sont
 * jamais laissés au modèle : ils se déduisent du type d'information et de
 * la fiabilité déclarée de la source. C'est ce qui garantit qu'un joueur
 * ne sera jamais sanctionné à cause d'une hésitation du LLM.
 *
 *   node agent/steps/4-triage.js
 */

import { REAL_POST_KINDS, FAKE_SCORES, ACTIONS } from '../config/taxonomy.js'
import { partitionValid } from '../lib/schema.js'
import { loadJson, saveJson, shuffle, engagement, parseArgs, isMain, log } from '../lib/utils.js'

/** Nombre de posts par niveau dans le jeu final. */
export const POSTS_PER_LEVEL = 5

/**
 * Difficulté d'un VRAI post : à quel point l'arbitrage
 * « faut-il relayer ? » est évident.
 */
function realLevel(post) {
  // Une alerte de service d'une source institutionnelle : évident, on partage.
  if (post.kind === 'service') return 1
  // Un fait vérifié : évident si la source est officielle, sinon un cran au-dessus.
  if (post.kind === 'factuel') return post.trust === 'institutionnel' ? 1 : 2
  // Vrai mais sans enjeu : il faut résister au réflexe de partage.
  if (post.kind === 'neutre') return 2
  // Vrai mais non stabilisé : le cas le plus subtil du jeu.
  return 3
}

/** Applique les règles de tri à un vrai post. */
export function triageReal(post) {
  const rule = REAL_POST_KINDS[post.kind] ?? REAL_POST_KINDS.neutre
  const level = realLevel(post)
  return {
    ...post,
    level,
    correctAction: rule.correctAction,
    scores: rule.scores,
    biais: rule.biais,
    ...engagement(false, level),
  }
}

/** Applique les règles de tri à un faux post. */
export function triageFake(post) {
  const level = post._biasLevel
  return {
    ...post,
    level,
    scores: FAKE_SCORES[post.correctAction] ?? FAKE_SCORES.report,
    ...engagement(true, level),
  }
}

/** Nettoie les champs internes et attribue les identifiants finaux. */
function finalize(posts) {
  return posts.map((p, i) => {
    const { _item, _biasLevel, kind, trust, ...clean } = p
    return { id: i + 1, ...clean }
  })
}

/**
 * Compose le deck final : POSTS_PER_LEVEL posts par niveau,
 * avec un mélange d'actions attendues à chaque niveau.
 */
export function buildDeck(realPosts, fakePosts = []) {
  const all = [...realPosts.map(triageReal), ...fakePosts.map(triageFake)]
  const pools = { 1: [], 2: [], 3: [] }
  for (const p of shuffle(all)) pools[p.level].push(p)

  // L'actualité réelle est très majoritairement « neutre » (niveau 2). Sans
  // rééquilibrage, les niveaux 1 et 3 se retrouvent vides. On y transfère donc
  // le surplus du niveau 2 : ces posts restent pédagogiquement valables, seule
  // leur place dans la progression change.
  for (const target of [1, 3]) {
    while (pools[target].length < POSTS_PER_LEVEL && pools[2].length > POSTS_PER_LEVEL) {
      // On déplace en priorité les faux posts vers le haut et les vrais vers le
      // bas, pour garder la progression cohérente : niveau 1 = signaux visibles.
      const idx = target === 1
        ? pools[2].findIndex((p) => p.isFake)
        : pools[2].findIndex((p) => !p.isFake)
      const moved = pools[2].splice(idx === -1 ? pools[2].length - 1 : idx, 1)[0]
      pools[target].push({ ...moved, level: target })
    }
  }

  const deck = []
  const report = []

  for (const level of [1, 2, 3]) {
    const pool = pools[level]

    // On garantit la présence d'au moins une action de chaque type disponible,
    // pour qu'un niveau ne se réduise jamais à « tout signaler ».
    const chosen = []
    for (const action of ACTIONS) {
      const c = pool.find((p) => p.correctAction === action && !chosen.includes(p))
      if (c) chosen.push(c)
    }
    for (const p of pool) {
      if (chosen.length >= POSTS_PER_LEVEL) break
      if (!chosen.includes(p)) chosen.push(p)
    }

    if (chosen.length < POSTS_PER_LEVEL) {
      log.warn(`niveau ${level} : ${chosen.length}/${POSTS_PER_LEVEL} posts seulement — augmente --limit`)
    }

    // Un faux post ne doit pas être systématiquement en tête de niveau.
    deck.push(...shuffle(chosen))
    report.push({
      level,
      total: chosen.length,
      faux: chosen.filter((p) => p.isFake).length,
      actions: ACTIONS.reduce((a, act) => ({ ...a, [act]: chosen.filter((p) => p.correctAction === act).length }), {}),
    })
  }

  return { deck: finalize(deck), report }
}

export async function triage({ real = null, fake = null, phase = 1 } = {}) {
  log.step(4, 'Tri selon les actions possibles')

  real ||= await loadJson('2-real.json')
  if (!real?.length) throw new Error('Aucun vrai post. Lance d’abord : npm run agent:real')
  if (phase === 2) fake ||= (await loadJson('3-fake.json')) ?? []
  else fake = []

  const { deck, report } = buildDeck(real, fake)
  const { ok, rejected } = partitionValid(deck)

  for (const r of rejected) {
    log.warn(`post « ${String(r.post.titre).slice(0, 42)}… » écarté : ${r.errs.join(' ; ')}`)
  }

  for (const r of report) {
    const a = Object.entries(r.actions).map(([k, v]) => `${k}:${v}`).join('  ')
    log.info(`niveau ${r.level} → ${r.total} posts (${r.faux} faux)   ${a}`)
  }
  log.ok(`${ok.length} posts valides${rejected.length ? `, ${rejected.length} écartés` : ''}`)

  await saveJson('4-deck.json', ok)
  log.ok('→ agent/out/4-deck.json')
  return ok
}

if (isMain(import.meta.url)) {
  const args = parseArgs()
  triage({ phase: Number(args.phase) || 1 }).catch((e) => { log.err(e.message); process.exit(1) })
}
