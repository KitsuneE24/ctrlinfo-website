import { accessibilite, expect, test } from './outils'

const ECRANS = [
  ['/', 'CTRL INFO'],
  ['/fil', "Le fil d'actualité · CTRL INFO"],
  ['/conversations', 'Messages · CTRL INFO'],
  ['/ressources', 'Ressources · CTRL INFO'],
  ['/profil', 'Profil · CTRL INFO'],
  ['/mentions-legales', 'Mentions légales · CTRL INFO'],
]

for (const [adresse, titre] of ECRANS) {
  test(`${adresse} s’affiche, titré et accessible`, async ({ page }) => {
    await page.goto(adresse)
    await expect(page).toHaveTitle(titre)
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('h1')).toHaveCount(1)
    await accessibilite(page)
  })
}

test('une adresse inconnue ramène à l’accueil', async ({ page }) => {
  await page.goto('/nulle-part')
  await expect(page).toHaveURL('/')
})

test('un chapitre des ressources s’ouvre', async ({ page }) => {
  await page.goto('/ressources')
  await page.getByRole('link', { name: /complotiste/i }).first().click()
  await expect(page).toHaveURL(/\/ressources\/comprendre\//)
  await expect(page.locator('h1')).toContainText(/complotiste/i)
  await accessibilite(page)
})

test('les liens externes s’ouvrent dans un nouvel onglet, sans fuite', async ({ page }) => {
  for (const adresse of ['/', '/ressources', '/mentions-legales']) {
    await page.goto(adresse)
    const liens = page.locator('a[href^="http"]')
    for (const lien of await liens.all()) {
      await expect(lien).toHaveAttribute('target', '_blank')
      await expect(lien).toHaveAttribute('rel', /noopener/)
    }
  }
})
