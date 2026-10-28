import { describe, expect, it } from 'vitest'
import { decoderCode, encoderCode, ErreurCode } from '../../src/lib/codeProgression'

const etat = {
  version: 1,
  pseudo: 'Teva 🌺',
  avatar: 'avatar-1',
  fil: { niveau: 3, decisions: 12, justes: 9, points: 640, biais: { 'Faux expert': { total: 2, justes: 1 } } },
  conversations: { 'sujet-a': { faite: true, score: 3, total: 3 } },
}

const raison = async (code) => {
  try {
    await decoderCode(code)
    return null
  } catch (erreur) {
    expect(erreur).toBeInstanceOf(ErreurCode)
    return erreur.raison
  }
}

describe('code de progression', () => {
  it('relit exactement ce qui a été exporté', async () => {
    const code = await encoderCode(etat)
    expect(code).toMatch(/^CTRL1\.[zp]\.[\w-]+\.[0-9a-z]+$/)
    expect(await decoderCode(code)).toEqual(etat)
  })

  it('tolère les espaces et retours à la ligne du copier-coller', async () => {
    const code = await encoderCode(etat)
    const coupe = `  ${code.slice(0, 20)}\n${code.slice(20)}  `
    expect(await decoderCode(coupe)).toEqual(etat)
  })

  it('refuse un code vide, incomplet, étranger ou trop long', async () => {
    expect(await raison('')).toBe('vide')
    expect(await raison('CTRL1.z.abc')).toBe('forme')
    expect(await raison('AUTRE1.z.abc.def')).toBe('marque')
    expect(await raison('CTRL9.z.abc.def')).toBe('version')
    expect(await raison('x'.repeat(10_001))).toBe('forme')
  })

  it('repère un code abîmé', async () => {
    const [marque, forme, charge, somme] = (await encoderCode(etat)).split('.')
    const altere = [marque, forme, charge, somme === 'a' ? 'b' : 'a'].join('.')
    expect(await raison(altere)).toBe('abime')
    expect(await raison([marque, forme, '!!!', somme].join('.'))).toBe('illisible')
  })
})
