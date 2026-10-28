import { describe, expect, it } from 'vitest'
import { lienWeb } from '../../src/lib/lienWeb'
import { dureePour, reglesDuNiveau } from '../../src/lib/niveaux'
import { correspond } from '../../src/lib/search'
import { inedites, niveauDeContenu, tirer } from '../../src/lib/tirage'

const post = (slug, level, isFake, extra = {}) => ({ slug, level, isFake, biais: isFake ? `b-${slug}` : 'Aucun', ...extra })

describe('liens externes', () => {
  it('ne garde que http et https', () => {
    expect(lienWeb('https://isee.nc/')).toBe('https://isee.nc/')
    expect(lienWeb('http://exemple.nc')).toBe('http://exemple.nc')
    expect(lienWeb('javascript:alert(1)')).toBeNull()
    expect(lienWeb('data:text/html,x')).toBeNull()
    expect(lienWeb('pas une adresse')).toBeNull()
    expect(lienWeb(null)).toBeNull()
  })
})

describe('niveaux et chrono', () => {
  const niveaux = [
    { level: 1, dureeSecondes: null },
    { level: 2, dureeSecondes: 60 },
    { level: 5, dureeSecondes: 25, dureeMinimumSecondes: 15, accelerationSecondes: 2 },
  ]

  it('pas de chrono au niveau 1', () => {
    expect(dureePour({ titre: 'a', texte: 'b' }, null)).toBeNull()
  })

  it('laisse toujours le temps de lire', () => {
    const long = { titre: 'titre', texte: 'mot '.repeat(300) }
    expect(dureePour(long, 25)).toBeGreaterThan(100)
    expect(dureePour({ titre: 'court', texte: 'court' }, 25)).toBe(25)
  })

  it('accélère au-delà du dernier niveau sans passer sous le minimum', () => {
    expect(reglesDuNiveau(niveaux, 2).dureeSecondes).toBe(60)
    expect(reglesDuNiveau(niveaux, 6).dureeSecondes).toBe(23)
    expect(reglesDuNiveau(niveaux, 50).dureeSecondes).toBe(15)
    expect(reglesDuNiveau(niveaux, 6).titre).toBe('Niveau 6')
    expect(reglesDuNiveau([], 1)).toBeNull()
  })
})

describe('tirage des posts', () => {
  const posts = [
    ...Array.from({ length: 6 }, (_, i) => post(`v${i}`, 1, false)),
    ...Array.from({ length: 6 }, (_, i) => post(`f${i}`, 1, true)),
    post('v-n2', 2, false),
  ]

  it('tire un lot de la bonne taille, sans doublon, avec vrais et faux', () => {
    for (let essai = 0; essai < 50; essai++) {
      const lot = tirer(posts, { level: 1, taille: 5 })
      expect(lot).toHaveLength(5)
      expect(new Set(lot.map((p) => p.slug)).size).toBe(5)
      expect(lot.some((p) => p.isFake)).toBe(true)
      expect(lot.some((p) => !p.isFake)).toBe(true)
      expect(lot.every((p) => p.level === 1)).toBe(true)
    }
  })

  it('passe les posts déjà vus en dernier', () => {
    const vus = ['v0', 'v1', 'v2', 'v3', 'f0', 'f1', 'f2', 'f3']
    const lot = tirer(posts, { level: 1, taille: 4, vus })
    expect(lot.map((p) => p.slug).sort()).toEqual(['f4', 'f5', 'v4', 'v5'])
    expect(inedites(posts, { level: 1, vus })).toBe(4)
  })

  it('reste au dernier niveau de contenu disponible', () => {
    expect(niveauDeContenu(posts, 9)).toBe(2)
  })

  it('met au plus la moitié d’articles dans un lot', () => {
    const articles = Array.from({ length: 8 }, (_, i) => post(`a${i}`, 1, i % 2 === 0, { format: 'article' }))
    const lot = tirer([...articles, ...posts.filter((p) => p.level === 1)], { level: 1, taille: 6 })
    expect(lot.filter((p) => p.format === 'article').length).toBeLessThanOrEqual(3)
  })
})

describe('recherche des ressources', () => {
  it('ignore accents, casse et petites fautes', () => {
    expect(correspond('complot', 'Reconnaître un discours complotiste')).toBe(true)
    expect(correspond('reconnaitre', 'Reconnaître')).toBe(true)
    expect(correspond('complto', 'complotiste')).toBe(true)
    expect(correspond('cyclone', 'La bulle qui vous suit')).toBe(false)
    expect(correspond('', 'tout')).toBe(true)
  })
})
