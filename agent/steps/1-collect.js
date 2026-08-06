/**
 * ÉTAPE 1 — Collecte des articles réels depuis les flux RSS.
 * Aucune IA ici : uniquement du réseau et du filtrage.
 *
 *   node agent/steps/1-collect.js --limit=40
 */

import { SOURCES, SCOPE_QUOTA } from '../config/sources.js'
import { fetchFeed, isUsable, dedupe } from '../lib/rss.js'
import { saveJson, shuffle, parseArgs, isMain, log } from '../lib/utils.js'

export async function collect({ limit = 40 } = {}) {
  log.step(1, 'Collecte des flux RSS')

  const batches = await Promise.all(SOURCES.map((s) => fetchFeed(s)))
  const all = dedupe(batches.flat().filter(isUsable))

  if (all.length === 0) {
    throw new Error(
      'Aucun article récupéré. Vérifie ta connexion, ou les URL dans agent/config/sources.js.'
    )
  }

  // Respect des quotas de zone : on veut un feed majoritairement calédonien.
  const selected = []
  for (const [scope, share] of Object.entries(SCOPE_QUOTA)) {
    const quota = Math.round(limit * share)
    const pool = shuffle(all.filter((i) => i.scope === scope))
    selected.push(...pool.slice(0, quota))
  }
  // Complément si une zone n'a pas assez d'articles.
  if (selected.length < limit) {
    const rest = shuffle(all.filter((i) => !selected.includes(i)))
    selected.push(...rest.slice(0, limit - selected.length))
  }

  const items = shuffle(selected).slice(0, limit).map((it, i) => ({ ...it, itemId: i + 1 }))

  const byScope = items.reduce((acc, i) => ({ ...acc, [i.scope]: (acc[i.scope] || 0) + 1 }), {})
  log.ok(`${items.length} articles retenus sur ${all.length} collectés`)
  log.info(`répartition : ${Object.entries(byScope).map(([k, v]) => `${k}=${v}`).join('  ')}`)

  await saveJson('1-items.json', items)
  log.ok('→ agent/out/1-items.json')
  return items
}

if (isMain(import.meta.url)) {
  const args = parseArgs()
  collect({ limit: Number(args.limit) || 40 }).catch((e) => {
    log.err(e.message)
    process.exit(1)
  })
}
