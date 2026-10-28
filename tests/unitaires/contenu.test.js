import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const lire = (nom) => JSON.parse(readFileSync(new URL(`../../public/donnees/${nom}`, import.meta.url), 'utf8'))
const contenu = lire('contenu.json')
const posts = [...lire('posts-vrais.json'), ...lire('posts-faux.json')]

describe('contenu publié', () => {
  it('passe npm run verifier', () => {
    expect(() => execFileSync(process.execPath, ['scripts/verifier-donnees.mjs'], { stdio: 'pipe' })).not.toThrow()
  })

  it('chaque procédé d’un faux a son post d’entraînement', () => {
    const manquants = new Set(posts.filter((p) => p.isFake).map((p) => p.biais).filter((b) => !contenu.remediations[b]))
    expect([...manquants]).toEqual([])
  })

  it('vouvoie le joueur dans les explications', () => {
    const tutoie = /(?<![\p{L}-])(tu|ton|ta|tes|toi|prends|vérifie|demande-toi)(?![\p{L}-])/iu
    const fautifs = Object.values(contenu.remediations)
      .flatMap((r) => [r.explication, r.encouragement, r.warning, r.analyseFaux, r.analyseVrai])
      .filter((t) => typeof t === 'string' && tutoie.test(t))
    expect(fautifs).toEqual([])
  })

  it('n’a aucun lien externe en http simple', () => {
    const http = JSON.stringify(contenu).match(/"http:\/\/[^"]+"/g) ?? []
    expect(http.filter((u) => !u.includes('creativecommons.org'))).toEqual([])
  })
})
