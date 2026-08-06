/**
 * ÉTAPE 5 — Écriture du deck dans l'application.
 *
 * Génère src/data/posts.generated.js.
 * Le fichier posts.js écrit à la main n'est JAMAIS modifié : il reste le
 * filet de sécurité si une génération tourne mal.
 *
 *   node agent/steps/5-build.js
 */

import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { PROJECT_DIR, loadJson, parseArgs, isMain, log } from '../lib/utils.js'
import { validatePost } from '../lib/schema.js'

const TARGET = resolve(PROJECT_DIR, 'src/data/posts.generated.js')

export async function build({ deck = null, phase = 1 } = {}) {
  log.step(5, 'Écriture dans src/data/')

  deck ||= await loadJson('4-deck.json')
  if (!deck?.length) throw new Error('Aucun deck. Lance d’abord : npm run agent:triage')

  // Dernier rempart avant l'application.
  const bad = deck.filter((p) => validatePost(p).length)
  if (bad.length) throw new Error(`${bad.length} post(s) invalide(s) — le build est annulé`)

  const stats = {
    total: deck.length,
    vrais: deck.filter((p) => !p.isFake).length,
    faux: deck.filter((p) => p.isFake).length,
  }

  const file = `/**
 * ⚠ FICHIER GÉNÉRÉ AUTOMATIQUEMENT — NE PAS MODIFIER À LA MAIN.
 *
 * Produit par l'agent : npm run agent${phase === 2 ? ':phase2' : ''}
 * Généré le  : ${new Date().toISOString()}
 * Phase      : ${phase} — ${phase === 1 ? 'vrais posts uniquement' : 'vrais + faux posts'}
 * Contenu    : ${stats.total} posts (${stats.vrais} vrais, ${stats.faux} faux)
 *
 * Les vrais posts proviennent de flux RSS de médias professionnels
 * (voir agent/config/sources.js). Les faux posts sont des exercices
 * pédagogiques fabriqués à partir de sujets réels — ils ne décrivent
 * aucun fait réel et n'engagent aucune personne réelle.
 */

const generatedPosts = ${JSON.stringify(deck, null, 2)}

export const meta = ${JSON.stringify({ phase, generatedAt: new Date().toISOString(), ...stats }, null, 2)}

export default generatedPosts
`

  await writeFile(TARGET, file, 'utf8')
  log.ok(`${stats.total} posts écrits (${stats.vrais} vrais, ${stats.faux} faux)`)
  log.ok('→ src/data/posts.generated.js')
  log.info('Lance `npm run dev` pour voir le résultat dans le jeu.')
  return TARGET
}

if (isMain(import.meta.url)) {
  const args = parseArgs()
  build({ phase: Number(args.phase) || 1 }).catch((e) => { log.err(e.message); process.exit(1) })
}
