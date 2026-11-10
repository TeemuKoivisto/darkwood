/** The arena in the browser: the opponent picker and the combat screen. */
import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.goto('/')
})

test('the opponent picker lists all 20 creatures with their numbers', async ({ page }) => {
  await page.getByRole('button', { name: 'Arena' }).click()
  await expect(
    page.getByRole('listbox', { name: 'Possible Opponents' }).getByRole('option')
  ).toHaveCount(20)

  await page.getByRole('option', { name: 'Dragon, Red' }).click()
  const stats = page
    .getByRole('region', { name: 'Please Select an Opponent' })
    .getByRole('definition')
  await expect(stats).toHaveText(['150', '-5', '3', '3-18', '12000', '5000', '500', '+2'])

  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.getByRole('region', { name: 'Please Select an Opponent' })).toBeHidden()
})
