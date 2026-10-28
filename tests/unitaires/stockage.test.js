import { beforeEach, describe, expect, it, vi } from 'vitest'

// localStorage simulé : chaque test repart d'un navigateur neuf.
function navigateur(donnees = {}) {
  const memoire = new Map(Object.entries(donnees))
  globalThis.window = {
    localStorage: {
      getItem: (cle) => (memoire.has(cle) ? memoire.get(cle) : null),
      setItem: (cle, valeur) => memoire.set(cle, String(valeur)),
      removeItem: (cle) => memoire.delete(cle),
    },
  }
  return memoire
}

beforeEach(() => {
  vi.resetModules()
  delete globalThis.window
})

describe('progression', () => {
  it('démarre vide sans stockage, sans planter', async () => {
    const { etatProgression } = await import('../../src/state/progression')
    expect(etatProgression().fil.niveau).toBe(1)
  })

  it('nettoie un état local trafiqué', async () => {
    navigateur({
      'ctrl-info:progression': JSON.stringify({
        pseudo: 'A‮B'.padEnd(80, 'x'),
        avatar: '../../etc',
        fil: { niveau: 1e9, decisions: 5, justes: 99, points: 'beaucoup', vus: [1, 'ok'], biais: { __proto__: { total: 1 } } },
      }),
    })
    const { etatProgression } = await import('../../src/state/progression')
    const etat = etatProgression()
    expect(etat.pseudo.length).toBeLessThanOrEqual(40)
    expect(etat.pseudo).not.toContain('‮')
    expect(etat.avatar).toBeNull()
    expect(etat.fil.niveau).toBe(999)
    expect(etat.fil.justes).toBe(5)
    expect(etat.fil.points).toBe(0)
    expect(etat.fil.vus).toEqual(['ok'])
  })

  it('enregistre une décision et la retrouve au rechargement', async () => {
    const memoire = navigateur()
    const { noterDecision } = await import('../../src/state/progression')
    noterDecision({ slug: 'post-1', biais: 'Faux expert', juste: true, points: 500 })
    vi.resetModules()
    navigateur(Object.fromEntries(memoire))
    const { etatProgression } = await import('../../src/state/progression')
    const fil = etatProgression().fil
    expect(fil).toMatchObject({ decisions: 1, justes: 1, points: 100, vus: ['post-1'] })
    expect(fil.biais['Faux expert']).toEqual({ total: 1, justes: 1 })
  })

  it('refuse un code incohérent et garde les posts déjà vus', async () => {
    navigateur()
    const { exportable, noterDecision, remplacer, etatProgression } = await import('../../src/state/progression')
    noterDecision({ slug: 'deja-vu', biais: 'x', juste: false })
    expect(remplacer({ fil: { decisions: 1, justes: 2 } })).toBe(false)
    expect(remplacer({ fil: { niveau: 50, decisions: 3 } })).toBe(false)
    expect(remplacer({ pseudo: 'Kenji', fil: { niveau: 2, decisions: 4, justes: 3, points: 200 } })).toBe(true)
    expect(etatProgression().pseudo).toBe('Kenji')
    expect(etatProgression().fil.vus).toEqual(['deja-vu'])
    expect(exportable().fil.vus).toBeUndefined()
  })
})

describe('contenu fabriqué dans le navigateur', () => {
  it('ne relit que des fabrications locales bien formées', async () => {
    navigateur({
      'ctrl-info:generes-3': JSON.stringify({
        posts: [{ origine: 'local', slug: 'local-abc' }, { origine: 'fiction', slug: 'local-x' }, { origine: 'local', slug: 'autre' }, null],
        conversations: 'pas une liste',
      }),
    })
    const { generes } = await import('../../src/state/generes')
    expect(generes().posts.map((p) => p.slug)).toEqual(['local-abc'])
    expect(generes().conversations).toEqual([])
  })
})
