import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

/**
 * Vrai si le module est lancé directement (et non importé).
 * pathToFileURL est indispensable sous Windows : `C:\x.js` devient
 * `file:///c:/x.js`, qu'une simple concaténation ne reproduit pas.
 */
export const isMain = (importMetaUrl) =>
  importMetaUrl === pathToFileURL(process.argv[1]).href

export const AGENT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const PROJECT_DIR = resolve(AGENT_DIR, '..')
export const OUT_DIR = resolve(AGENT_DIR, 'out')

export async function saveJson(name, data) {
  await mkdir(OUT_DIR, { recursive: true })
  const path = resolve(OUT_DIR, name)
  await writeFile(path, JSON.stringify(data, null, 2), 'utf8')
  return path
}

export async function loadJson(name) {
  try {
    return JSON.parse(await readFile(resolve(OUT_DIR, name), 'utf8'))
  } catch {
    return null
  }
}

/** Mélange déterministe si une graine est fournie (utile pour rejouer un run). */
export function shuffle(arr, seed = null) {
  const a = [...arr]
  let rand = Math.random
  if (seed !== null) {
    let s = seed >>> 0
    rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
  }
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

/** Chiffres d'engagement crédibles : un faux post « marche » mieux qu'un vrai. */
export function engagement(isFake, level) {
  const base = isFake ? 12000 + level * 6000 : 2500 + level * 1200
  const reactionCount = Math.round(base * (0.6 + Math.random() * 1.4))
  return {
    reactionCount,
    commentCount: Math.round(reactionCount * (0.03 + Math.random() * 0.06)),
  }
}

export function parseArgs(argv = process.argv.slice(2)) {
  const args = {}
  for (const a of argv) {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/)
    if (m) args[m[1]] = m[2] === undefined ? true : m[2]
  }
  return args
}

export const log = {
  step: (n, t) => console.log(`\n\x1b[1m\x1b[36m▶ Étape ${n} — ${t}\x1b[0m`),
  ok: (m) => console.log(`  \x1b[32m✓\x1b[0m ${m}`),
  warn: (m) => console.log(`  \x1b[33m!\x1b[0m ${m}`),
  err: (m) => console.log(`  \x1b[31m✗\x1b[0m ${m}`),
  info: (m) => console.log(`  ${m}`),
}
