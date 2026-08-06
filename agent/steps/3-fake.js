/**
 * ÉTAPE 3 — Génération des FAUX posts (IA). PHASE 2 UNIQUEMENT.
 *
 * Chaque faux post est la déformation d'un article RÉEL selon un biais imposé.
 * Les articles utilisés ici sont retirés du lot des vrais posts, pour qu'un
 * même sujet n'apparaisse pas deux fois dans le feed.
 *
 *   node agent/steps/3-fake.js --count=9
 */

import { BIASES, biasesForLevel } from '../config/taxonomy.js'
import { TIPS_URLS } from '../config/sources.js'
import { FAKE_POST_SCHEMA } from '../lib/schema.js'
import { generateJson, checkServer } from '../lib/lmstudio.js'
import { loadJson, saveJson, shuffle, parseArgs, pick, isMain, log } from '../lib/utils.js'
import { FAKE_SYSTEM, buildFakePrompt, checkFakeSafety } from '../prompts/fake.js'

/** Palette pour les médias inventés — teintes « alarmistes » assumées. */
const FAKE_COLORS = ['#dc2626', '#b91c1c', '#ef4444', '#f97316', '#7c3aed', '#9333ea', '#f59e0b']

/**
 * Répartit les biais à produire : autant par niveau, pour que chaque niveau
 * du jeu ait sa dose de faux posts.
 */
function planBiases(count) {
  const perLevel = Math.ceil(count / 3)
  const plan = []
  for (const level of [1, 2, 3]) {
    const pool = shuffle(biasesForLevel(level))
    for (let i = 0; i < perLevel; i++) plan.push(pool[i % pool.length])
  }
  return shuffle(plan).slice(0, count)
}

export async function generateFake({ count = 9, items = null, usedItemIds = [] } = {}) {
  log.step(3, 'Fabrication des faux posts pédagogiques (LM Studio)')

  items ||= await loadJson('1-items.json')
  if (!items?.length) throw new Error('Aucun article. Lance d’abord : npm run agent:collect')

  const chk = await checkServer()
  if (!chk.ok) throw new Error(chk.error)

  // On privilégie les sujets calédoniens : un faux ancré localement est
  // beaucoup plus convaincant pour le joueur.
  const pool = shuffle(items.filter((i) => !usedItemIds.includes(i.itemId)))
    .sort((a, b) => (a.scope === 'nc' ? -1 : 0) - (b.scope === 'nc' ? -1 : 0))

  const plan = planBiases(count)
  const out = []
  let cursor = 0

  for (const [i, biasName] of plan.entries()) {
    const item = pool[cursor++ % pool.length]
    const bias = BIASES[biasName]
    const label = `[${i + 1}/${plan.length}] ${biasName} (N${bias.level})`

    try {
      const gen = await generateJson({
        system: FAKE_SYSTEM,
        user: buildFakePrompt(item, biasName),
        schema: FAKE_POST_SCHEMA,
        schemaName: 'faux_post',
        temperature: 0.9, // plus de créativité : un faux trop tiède n'apprend rien
      })

      const problems = checkFakeSafety(gen, item)
      if (problems.length) {
        log.warn(`${label} — rejeté : ${problems.join(' ; ')}`)
        continue
      }

      out.push({
        _item: item,
        _biasLevel: bias.level,
        source: gen.source,
        sourceColor: pick(FAKE_COLORS),
        domain: gen.domain.toLowerCase(),
        date: gen.date,
        titre: gen.titre,
        texte: gen.texte,
        image: `https://picsum.photos/seed/fake${item.itemId}${i}/600/340`,
        isFake: true,
        biais: biasName,
        correctAction: bias.correctAction,
        explication: gen.explication,
        consequences: gen.consequences,
        encouragement: gen.encouragement,
        warning: gen.warning,
        // On renvoie vers l'article authentique : le joueur peut comparer.
        sourceUrl: item.link,
        learnMoreUrl: item.link,
        learnMoreTips: pick(TIPS_URLS),
      })
      log.ok(`${label} — « ${gen.titre.slice(0, 52)}… » / ${gen.source}`)
    } catch (e) {
      log.err(`${label} — ${e.message}`)
    }
  }

  if (!out.length) throw new Error('Aucun faux post généré.')
  log.ok(`${out.length}/${plan.length} faux posts fabriqués`)

  await saveJson('3-fake.json', out)
  log.ok('→ agent/out/3-fake.json')
  return out
}

if (isMain(import.meta.url)) {
  const args = parseArgs()
  generateFake({ count: Number(args.count) || 9 }).catch((e) => { log.err(e.message); process.exit(1) })
}
