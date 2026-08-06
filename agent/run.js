/**
 * Orchestrateur de l'agent.
 *
 *   npm run agent            → phase 1 : uniquement des vrais posts
 *   npm run agent:phase2     → phase 2 : vrais posts mêlés à de faux posts
 *
 * Options :
 *   --phase=1|2     phase de génération (défaut : 1)
 *   --limit=40      nombre d'articles RSS à collecter
 *   --fake=9        nombre de faux posts à fabriquer (phase 2)
 *   --skip-collect  réutilise agent/out/1-items.json (évite de resolliciter les flux)
 *   --dry-run       teste toute la chaîne SANS appeler LM Studio (textes bruts)
 */

import { collect } from './steps/1-collect.js'
import { generateReal } from './steps/2-real.js'
import { generateFake } from './steps/3-fake.js'
import { triage } from './steps/4-triage.js'
import { build } from './steps/5-build.js'
import { checkServer } from './lib/lmstudio.js'
import { loadJson, parseArgs, log } from './lib/utils.js'

async function main() {
  const args = parseArgs()
  const phase = Number(args.phase) || 1
  const limit = Number(args.limit) || 40
  const fakeCount = Number(args.fake) || 9
  const dryRun = Boolean(args['dry-run'])
  const t0 = Date.now()

  console.log(`\n\x1b[1m╭─────────────────────────────────────────────╮`)
  console.log(`│  Agent Alerte-NC — génération de posts       │`)
  console.log(`│  Phase ${phase} : ${phase === 1 ? 'vrais posts uniquement          ' : 'vrais posts + faux posts        '}    │`)
  console.log(`╰─────────────────────────────────────────────╯\x1b[0m`)

  // On vérifie LM Studio AVANT de solliciter les flux RSS : inutile de
  // charger le réseau si le modèle n'est pas joignable.
  if (dryRun) {
    log.warn('mode --dry-run : aucun appel au modèle, contenus de remplissage')
  } else {
    const chk = await checkServer()
    if (!chk.ok) { log.err(chk.error); process.exit(1) }
    log.ok(`LM Studio prêt — modèle « ${chk.model} »`)
  }

  const items = args['skip-collect']
    ? (await loadJson('1-items.json')) ?? (await collect({ limit }))
    : await collect({ limit })

  const real = await generateReal({ items, dryRun })

  let fake = []
  if (phase === 2 && !dryRun) {
    const usedItemIds = real.map((p) => p._item.itemId)
    fake = await generateFake({ count: fakeCount, items, usedItemIds })
  }

  const deck = await triage({ real, fake, phase })
  await build({ deck, phase })

  const mins = ((Date.now() - t0) / 60000).toFixed(1)
  console.log(`\n\x1b[1m\x1b[32m✓ Terminé en ${mins} min\x1b[0m — lance \x1b[1mnpm run dev\x1b[0m pour jouer.\n`)
}

main().catch((e) => {
  log.err(e.message)
  process.exit(1)
})
