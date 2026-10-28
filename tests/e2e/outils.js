import AxeBuilder from '@axe-core/playwright'
import { expect, test as base } from '@playwright/test'

// Chaque test échoue sur une erreur de console (CSP comprise) ou une page qui plante.
export const test = base.extend({
  page: async ({ page }, fournir) => {
    const erreurs = []
    page.on('console', (message) => {
      if (message.type() === 'error') erreurs.push(message.text())
    })
    page.on('pageerror', (erreur) => erreurs.push(erreur.message))
    await fournir(page)
    expect(erreurs, 'erreurs dans la console').toEqual([])
  },
})

export { expect }

// Règles WCAG 2.2 A et AA, base automatisable du RGAA.
export async function accessibilite(page) {
  // Un fondu en cours fausserait la mesure des contrastes.
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => {}))
    )
  )
  const resultat = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()
  const lisible = resultat.violations.map((v) => `${v.id} (${v.impact}) : ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)
  expect(lisible).toEqual([])
}
