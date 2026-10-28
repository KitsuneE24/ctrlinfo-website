import { accessibilite, expect, test } from './outils'

test('le fil : commencer, répondre, lire la correction, continuer', async ({ page }) => {
  await page.goto('/fil')
  await page.getByRole('button', { name: /commencer|reprendre/i }).click()
  const signaler = page.getByRole('button', { name: 'Signaler' })
  await expect(signaler).toBeVisible()
  await signaler.click()
  const continuer = page.getByRole('button', { name: /continuer/i }).first()
  await expect(continuer).toBeVisible()
  await accessibilite(page)
  await continuer.click()
  await expect(page.getByRole('button', { name: 'Signaler' })).toBeVisible()
})

test('les messages : ouvrir un contact et répondre', async ({ page }) => {
  await page.goto('/conversations')
  await page.locator('main a[href^="/conversations/"]').first().click()
  await expect(page).toHaveURL(/\/conversations\/.+/)
  const demarrer = page.getByRole('button', { name: /commencer|reprendre/i })
  if (await demarrer.isVisible().catch(() => false)) await demarrer.click()
  const choix = page.locator('.composer__field--choice').first()
  await expect(choix).toBeVisible({ timeout: 15_000 })
  await choix.click()
  await expect(page.locator('.composer__field--choice').first()).toBeVisible({ timeout: 15_000 })
  await accessibilite(page)
})

test('la progression survit au rechargement', async ({ page }) => {
  await page.goto('/fil')
  await page.getByRole('button', { name: /commencer|reprendre/i }).click()
  await page.getByRole('button', { name: 'Partager' }).click()
  await page.reload()
  const etat = await page.evaluate(() => JSON.parse(localStorage.getItem('ctrl-info:progression')))
  expect(etat.fil.decisions).toBe(1)
})

test('le code de progression s’exporte puis se restaure', async ({ page }) => {
  await page.goto('/profil')
  await page.getByRole('button', { name: /pseudo, modifier/i }).click()
  await page.getByLabel('Votre pseudo').fill('Teva')
  await page.getByLabel('Votre pseudo').press('Enter')
  await expect(page.getByRole('button', { name: 'Teva, modifier' })).toBeVisible()
  await page.getByRole('button', { name: 'Exporter mon code' }).click()
  const code = await page.locator('textarea[readonly]').inputValue()
  expect(code).toMatch(/^CTRL1\./)

  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.getByLabel('Restaurer un code').fill(code)
  await page.getByRole('button', { name: 'Restaurer' }).click()
  const remplacer = page.getByRole('button', { name: 'Remplacer ma progression' })
  if (await remplacer.isVisible().catch(() => false)) await remplacer.click()
  await expect(page.getByRole('button', { name: 'Teva, modifier' })).toBeVisible()
})

test('un code abîmé est refusé avec un message clair', async ({ page }) => {
  await page.goto('/profil')
  await page.getByLabel('Restaurer un code').fill('CTRL1.z.abc.def')
  await page.getByRole('button', { name: 'Restaurer' }).click()
  await expect(page.getByText(/pas pu être relu|abîmé|incomplet/)).toBeVisible()
})
