import { accessibilite, expect, test } from './outils'

// Le bouton est entièrement visible, au-dessus de la barre du bas.
async function boutonVisible(page, bouton) {
  await expect(bouton).toBeInViewport({ ratio: 1 })
  const barre = page.locator('.tab-bar')
  if (!(await barre.isVisible())) return
  const [b, t] = [await bouton.boundingBox(), await barre.boundingBox()]
  expect(b.y + b.height).toBeLessThanOrEqual(t.y)
}

test('les règles tiennent dans un petit écran, bouton visible', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 560 })
  await page.goto('/fil')
  await boutonVisible(page, page.getByRole('button', { name: /commencer|reprendre/i }))
  await accessibilite(page)
})

test('le bouton des règles se voit et rouvre les règles', async ({ page }) => {
  await page.goto('/fil')
  await page.getByRole('button', { name: /commencer|reprendre/i }).click()
  await page.getByRole('button', { name: 'Règles du jeu' }).click()
  await boutonVisible(page, page.getByRole('button', { name: 'Reprendre' }))
})

test('la correction détaillée est accessible et donne un lien', async ({ page }) => {
  await page.goto('/fil')
  await page.getByRole('button', { name: /commencer|reprendre/i }).click()
  await page.getByRole('button', { name: 'Partager' }).click()
  await page.getByRole('button', { name: /indices|clochait|fiable/i }).click()
  await expect(page.locator('.indices .lien-info__lien')).toBeVisible()
  await accessibilite(page)
})

test('dans les Messages, chaque réponse dit si le piège s’arrête', async ({ page }) => {
  await page.goto('/conversations')
  await page.locator('main a[href^="/conversations/"]').first().click()
  const demarrer = page.getByRole('button', { name: /commencer|reprendre/i })
  if (await demarrer.isVisible().catch(() => false)) await demarrer.click()
  await page.locator('.composer__field--choice').first().click({ timeout: 15_000 })
  await expect(page.locator('.note__issue').first()).toBeVisible({ timeout: 15_000 })
  await accessibilite(page)
})

for (const dossier of ['reflexe', 'manipulation', 'outils']) {
  test(`le dossier ${dossier} est sourcé et accessible`, async ({ page }) => {
    await page.goto(`/ressources/comprendre/${dossier}`)
    await expect(page.locator('h1')).toBeVisible()
    expect(await page.locator('.source-lien a, .source-partie a').count()).toBeGreaterThan(0)
    await accessibilite(page)
  })
}

test('le texte s’agrandit avec le curseur du profil', async ({ page }) => {
  await page.goto('/profil')
  const curseur = page.getByRole('slider', { name: 'Taille du texte' })
  await curseur.fill('1.5')
  const echelle = () =>
    page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--echelle-texte').trim())
  await expect.poll(echelle).toBe('1.5')
  await page.goto('/')
  await expect.poll(echelle).toBe('1.5')
  await accessibilite(page)
  await page.goto('/fil')
  await page.setViewportSize({ width: 375, height: 667 })
  await boutonVisible(page, page.getByRole('button', { name: /commencer|reprendre/i }))
  const deborde = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  )
  expect(deborde).toBe(false)
})
