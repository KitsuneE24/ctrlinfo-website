/**
 * ÉTAPE 2 — Génération des VRAIS posts (IA).
 *
 * Le modèle reformule l'article en légende de post + rédige la pédagogie.
 * Il ne décide PAS de l'action attendue ni du score : c'est l'étape 3.
 *
 *   node agent/steps/2-real.js
 */

import { getSource, TIPS_URLS } from '../config/sources.js'
import { REAL_POST_SCHEMA } from '../lib/schema.js'
import { generateJson, checkServer, getModelName } from '../lib/lmstudio.js'
import { relativeDate } from '../lib/rss.js'
import { loadJson, saveJson, parseArgs, pick, isMain, log } from '../lib/utils.js'
import { REAL_SYSTEM, buildRealPrompt, findHallucinatedNumbers } from '../prompts/real.js'

/**
 * Repli sans IA : sert à valider toute la chaîne (collecte → tri → build)
 * avant même d'avoir lancé LM Studio. Les textes sont bruts, non pédagogiques.
 */
function draftWithoutAI(item) {
  const t = `${item.title} ${item.description}`.toLowerCase()
  const kind =
    /vigilance|alerte|canicule|s[ée]isme|cyclone|inondation|coupure|[ée]pid[ée]mie|rappel produit|s[ée]curit[ée] civile/.test(t) ? 'service'
    : /enqu[êe]te|proc[èe]s|selon nos informations|provisoire|en cours|n[ée]gociation|suspect/.test(t) ? 'encours'
    : /vote|adopt|accord|[ée]tude|chercheur|budget|milliard|million|d[ée]cision|conseil municipal/.test(t) ? 'factuel'
    : 'neutre'
  return {
    kind,
    texte: item.description.slice(0, 380),
    explication: `[Brouillon sans IA] Information publiée par ${item.sourceName}, média professionnel. Relance la génération avec LM Studio pour obtenir une explication pédagogique.`,
    consequences: {
      share: 'Tu as relayé cette information auprès de ton entourage. [Brouillon sans IA]',
      ignore: "Tu n'as pas relayé cette information. [Brouillon sans IA]",
      report: 'Tu as signalé un média professionnel, ce qui est une erreur. [Brouillon sans IA]',
    },
    encouragement: 'Bon réflexe ! [Brouillon sans IA]',
    warning: 'Ce choix n’était pas le meilleur ici. [Brouillon sans IA]',
  }
}

export async function generateReal({ items = null, dryRun = false } = {}) {
  log.step(2, dryRun ? 'Rédaction des vrais posts (mode --dry-run, sans IA)' : 'Rédaction des vrais posts (LM Studio)')

  items ||= await loadJson('1-items.json')
  if (!items?.length) throw new Error('Aucun article. Lance d’abord : npm run agent:collect')

  if (!dryRun) {
    const chk = await checkServer()
    if (!chk.ok) throw new Error(chk.error)
    log.ok(`modèle : ${chk.model}`)
  } else {
    log.warn('aucun appel au modèle — textes de remplissage, à ne pas publier')
  }

  const out = []
  for (const [i, item] of items.entries()) {
    const label = `[${i + 1}/${items.length}] ${item.title.slice(0, 58)}…`
    try {
      const gen = dryRun
        ? draftWithoutAI(item)
        : await generateJson({
            system: REAL_SYSTEM,
            user: buildRealPrompt(item),
            schema: REAL_POST_SCHEMA,
            schemaName: 'vrai_post',
            temperature: 0.6,
          })

      // Contrôle d'ancrage : des chiffres absents de l'article = hallucination.
      const invented = dryRun ? [] : findHallucinatedNumbers(gen.texte, item)
      if (invented.length) {
        log.warn(`${label} — rejeté : chiffres inventés (${invented.slice(0, 3).join(', ')})`)
        continue
      }

      const src = getSource(item.sourceId)
      out.push({
        // Données factuelles : issues du flux, jamais du modèle.
        _item: item,
        source: src.name,
        sourceColor: src.color,
        domain: src.domain,
        date: relativeDate(item.pubDate),
        titre: item.title,
        image: item.image || `https://picsum.photos/seed/nc${item.itemId}/600/340`,
        sourceUrl: item.link,
        learnMoreUrl: item.link,
        learnMoreTips: pick(TIPS_URLS),
        isFake: false,
        trust: src.trust,
        // Données rédigées par le modèle.
        kind: gen.kind,
        texte: gen.texte,
        explication: gen.explication,
        consequences: gen.consequences,
        encouragement: gen.encouragement,
        warning: gen.warning,
      })
      log.ok(`${label} → ${gen.kind}`)
    } catch (e) {
      log.err(`${label} — ${e.message}`)
    }
  }

  if (!out.length) throw new Error('Aucun vrai post généré. Vérifie le modèle chargé dans LM Studio.')

  const dist = out.reduce((a, p) => ({ ...a, [p.kind]: (a[p.kind] || 0) + 1 }), {})
  log.ok(`${out.length}/${items.length} vrais posts rédigés — ${Object.entries(dist).map(([k, v]) => `${k}:${v}`).join('  ')}`)

  await saveJson('2-real.json', out)
  log.ok('→ agent/out/2-real.json')
  return out
}

if (isMain(import.meta.url)) {
  const args = parseArgs()
  generateReal({ dryRun: Boolean(args['dry-run']) }).catch((e) => { log.err(e.message); process.exit(1) })
}
