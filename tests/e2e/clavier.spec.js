import { expect, test } from './outils'

test('le lien d’évitement mène au contenu', async ({ page }) => {
  await page.goto('/ressources')
  await page.keyboard.press('Tab')
  const lien = page.getByRole('link', { name: 'Aller au contenu' })
  await expect(lien).toBeFocused()
  await expect(lien).toBeInViewport()
  await page.keyboard.press('Enter')
  await expect(page.locator('main')).toBeFocused()
})

test('le fil se joue entièrement au clavier', async ({ page }) => {
  await page.goto('/fil')
  await page.getByRole('button', { name: /commencer|reprendre/i }).focus()
  await page.keyboard.press('Enter')
  const signaler = page.getByRole('button', { name: 'Signaler' })
  await expect(signaler).toBeVisible()
  await signaler.focus()
  await page.keyboard.press('Enter')
  const continuer = page.getByRole('button', { name: /continuer/i }).first()
  await expect(continuer).toBeVisible()
  await continuer.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'Signaler' })).toBeVisible()
})

test.describe('animations réduites', () => {
  test.use({ reducedMotion: 'reduce' })

  test('le cagou reste en place', async ({ page }) => {
    await page.goto('/')
    const cagou = page.locator('.compagnon').first()
    if ((await cagou.count()) === 0) test.skip()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    const avant = await cagou.boundingBox()
    await page.waitForTimeout(4000)
    expect(await cagou.boundingBox()).toEqual(avant)
  })
})
