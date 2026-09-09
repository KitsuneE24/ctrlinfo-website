/**
 * Export ponctuel du contenu écrit à la main dans src/data/ vers du JSON de
 * seed pour la base de ctrlinfo-app. Ne sert qu'une fois, à la migration :
 * après ça, la base est la source unique du contenu.
 *
 *   node scripts/export-contenu.mjs
 *
 * **Ce script ne tourne plus.** Les fichiers qu'il lit ont été supprimés une
 * fois la migration faite, et l'un des jeux qu'il exporte — « Repère les
 * indices », d'où `detect.json` — n'existe plus du tout. Il est gardé comme
 * trace de la migration, pas comme outil.
 */
import { writeFileSync } from 'node:fs'
import { registerHooks } from 'node:module'

// Vite résout « ../css/colors » sans extension, pas Node : on rattrape.
registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context)
    } catch (erreur) {
      if (!specifier.startsWith('.')) throw erreur
      return nextResolve(specifier + '.js', context)
    }
  },
})

const OUT = new URL('../../ctrlinfo-app/prisma/data/', import.meta.url)
const ecrire = (nom, valeur) => {
  writeFileSync(new URL(nom, OUT), JSON.stringify(valeur, null, 2) + '\n', 'utf8')
  const n = Array.isArray(valeur) ? valeur.length : Object.keys(valeur).length
  console.log(`${nom} — ${n} entrées`)
}

/** Les icônes sont du code, pas du contenu : on n'exporte que leur nom. */
const nomIcone = (I) => I?.displayName ?? I?.render?.name ?? null

const posts = await import('../src/data/posts.js')
const detect = await import('../src/data/detect.js')
const conversations = await import('../src/data/conversations.js')
const games = await import('../src/data/games.js')
const resources = await import('../src/data/resources.js')

ecrire('posts.json', posts.default)
ecrire('posts-remediation.json', posts.remediationPosts)
ecrire('detect.json', detect.default)
ecrire('conversations.json', conversations.default)
ecrire('resources.json', {
  categories: resources.CATEGORIES,
  resources: resources.default,
})
ecrire(
  'games.json',
  games.default.map((g) => ({
    id: g.id,
    couleur: g.couleur,
    icone: nomIcone(g.Icon),
    titre: g.titre,
    court: g.court,
    accroche: g.accroche,
    capture: g.capture,
    description: g.description,
    points: g.points,
    tuto: g.tuto.map((v) => ({ icone: nomIcone(v.Icon), titre: v.titre, texte: v.texte })),
  })),
)
