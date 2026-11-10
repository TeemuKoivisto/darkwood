/** The app loads without console errors. */
import { expect, test } from '@playwright/test'

test('loads cleanly', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', e => errors.push(e.message))
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  await page.goto('/')

  await expect(page).toHaveTitle('Darkwood')
  await expect(page.locator('#app')).not.toBeEmpty()
  expect(errors).toEqual([])
})
