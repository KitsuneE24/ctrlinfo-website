import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { HABILLAGES } from '../../scripts/gabarits.mjs'
import { DISTRIBUTIONS } from '../../scripts/gabarits-conversations.mjs'
import { basesDe, dateIlYa, fabriquerFaux, fabriquerVrai, permisPour, PROCEDES, prochainFaux, sujetsPour } from '../../scripts/fabrique.mjs'

const contenu = JSON.parse(readFileSync(new URL('../../public/donnees/contenu.json', import.meta.url), 'utf8'))
const banques = { faits: contenu.faits, scenarios: contenu.scenarios }
const maintenant = '2026-10-28T19:00:00.000Z'
const NIVEAUX = HABILLAGES.map((h) => h.niveau)

// Tous les textes d'un post ou d'une conversation, à plat.
const textes = (objet) => JSON.stringify(objet).match(/"(?:[^"\\]|\\.)*"/g).map((t) => JSON.parse(t))

function defautsDeRedaction(objet) {
  const defauts = []
  for (const t of textes(objet)) {
    if (/\b(undefined|null|NaN)\b|\[object/.test(t)) defauts.push(`valeur vide : ${t}`)
    if (t.includes('—')) defauts.push(`tiret cadratin : ${t}`)
    if (/Source\s*:/.test(t)) defauts.push(`« Source : » : ${t}`)
    if (/«[^»]*«/.test(t)) defauts.push(`guillemets imbriqués : ${t}`)
    if (/\s[,.]|\s{2}|\.\./.test(t.replace(/\.\.\.|…/g, ''))) defauts.push(`ponctuation : ${t}`)
    if (/_974\b/.test(t)) defauts.push(`pseudo réunionnais : ${t}`)
  }
  return defauts
}

describe('posts vrais', () => {
  it.each(contenu.faits.map((f) => [f.id, f]))('%s : bien formé à chaque niveau', (_, fait) => {
    for (const niveau of NIVEAUX) {
      const post = fabriquerVrai(fait, niveau, { maintenant })
      expect(post).toMatchObject({ isFake: false, level: niveau })
      expect(post.sourceUrl).toMatch(/^https:\/\//)
      expect(post.indices.length).toBeGreaterThan(0)
      expect(defautsDeRedaction(post)).toEqual([])
    }
  })
})

describe('posts faux', () => {
  const bases = basesDe(banques)

  it('chaque procédé s’applique à au moins une base', () => {
    for (const categorie of PROCEDES) expect(bases.some((b) => NIVEAUX.some((n) => permisPour(categorie, n, b))), categorie.biais).toBe(true)
  })

  it('chaque niveau compte au moins deux arnaques', () => {
    for (const niveau of NIVEAUX) {
      const pris = []
      for (let i = 0; i < 8; i++) {
        const choix = prochainFaux(pris, niveau, banques)
        pris.push(fabriquerFaux(choix.base, choix.categorie, niveau, { maintenant }))
      }
      expect(pris.filter((p) => p.scenario.startsWith('arnaque-')).length).toBeGreaterThanOrEqual(2)
    }
  })

  it('chaque niveau trouve de quoi fabriquer', () => {
    for (const niveau of NIVEAUX) expect(prochainFaux([], niveau, banques)).not.toBeNull()
  })

  it('aucun procédé n’est plaqué sur un fait qui ne s’y prête pas', () => {
    for (const niveau of NIVEAUX) {
      const pris = []
      for (let i = 0; i < 60; i++) {
        const choix = prochainFaux(pris, niveau, banques)
        if (!choix) break
        if (choix.base.fait) expect(choix.categorie.surFait ?? choix.categorie.biais === 'Fait déformé').toBeTruthy()
        pris.push(fabriquerFaux(choix.base, choix.categorie, niveau, { maintenant }))
      }
    }
  }, 30_000)

  it('chaque procédé, sur chaque base et chaque niveau, donne un texte propre', () => {
    const defauts = []
    for (const niveau of NIVEAUX) {
      for (const categorie of PROCEDES) {
        for (const base of bases) {
          if (!permisPour(categorie, niveau, base)) continue
          for (const media of [false, true]) {
            const post = fabriquerFaux(base, categorie, niveau, { maintenant, media })
            expect(post).toMatchObject({ isFake: true, level: niveau, biais: categorie.biais })
            expect(post.indices).toHaveLength(3)
            defauts.push(...defautsDeRedaction(post).map((d) => `${categorie.biais}, niveau ${niveau} : ${d}`))
          }
        }
      }
    }
    expect([...new Set(defauts)].slice(0, 10)).toEqual([])
  }, 30_000)
})

describe('conversations', () => {
  it.each(DISTRIBUTIONS.map((d) => [d.id, d]))('%s : chaque sujet a un bon choix par étape', (_, distribution) => {
    const sujets = sujetsPour(distribution, [], 6, banques, { maintenant })
    expect(sujets.length).toBeGreaterThan(0)
    for (const sujet of sujets) {
      for (const etape of sujet.steps) expect(etape.choices.some((c) => c.correct)).toBe(true)
      expect(defautsDeRedaction(sujet)).toEqual([])
    }
  })
})

describe('dates', () => {
  const ancienne = PROCEDES.find((c) => c.ancienne)

  it('date un post selon son âge, au jour où l’on joue', () => {
    const post = fabriquerVrai(banques.faits[0], 1, { maintenant })
    expect(post.ilYa).toBeGreaterThanOrEqual(0)
    expect(post.ilYa).toBeLessThan(72)
    expect(dateIlYa(0, '2027-03-15T00:00:00.000Z')).toMatch(/15 mars 2027/)
  })

  it('garde deux ans d’écart à une information recyclée', () => {
    const base = basesDe(banques).find((b) => permisPour(b, ancienne, 1))
    const post = fabriquerFaux(base, ancienne, 1, { maintenant })
    expect(dateIlYa(post.ilYa, maintenant)).toMatch(/2024/)
  })
})
