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

  it('source chaque affirmation des Ressources et des brèves, jamais Wikipédia', () => {
    const sourcee = (s) => /^https:\/\//.test(s?.url ?? '') && !/wikipedia/i.test(s.url)
    const sansSource = []
    for (const chapitre of contenu.chapitres) {
      for (const bloc of chapitre.blocs) {
        if (bloc.genre === 'TEXTE' && !(bloc.sources?.length && bloc.sources.every(sourcee))) sansSource.push(`${chapitre.id} : texte`)
        for (const entree of bloc.entrees ?? []) {
          const ok = sourcee(entree.source) || (entree.notes ?? []).some((n) => sourcee(n.source))
          if (!ok) sansSource.push(`${chapitre.id} : ${entree.titre ?? entree.texte.slice(0, 40)}`)
        }
      }
    }
    for (const astuce of contenu.astuces) if (!sourcee(astuce.source)) sansSource.push(`brève ${astuce.id}`)
    expect(sansSource).toEqual([])
  })

  it('n’a aucun lien externe en http simple', () => {
    const http = JSON.stringify(contenu).match(/"http:\/\/[^"]+"/g) ?? []
    expect(http.filter((u) => !u.includes('creativecommons.org'))).toEqual([])
  })
})
