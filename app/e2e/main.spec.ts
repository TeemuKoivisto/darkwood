/** The main screen: the fresh character, the five buildings and the menu bar. */
import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.goto('/')
})

test('shows the starting character and the town', async ({ page }) => {
  const sheet = page.getByRole('region', { name: 'Character' })
  await expect(sheet).toContainText('Derek')
  await expect(sheet).toContainText(/Hit Points:\s*10\/10/)
  await expect(sheet).toContainText(/AC:\s*9/)
  await expect(sheet).toContainText(/Gold:\s*10/)
  for (const name of ['Magic Item Shop', 'Inn', 'Armorer', 'Weapon Shop', 'Arena']) {
    await expect(page.getByRole('button', { name, exact: true })).toBeVisible()
  }
})

test('the Shops menu lists the four shops', async ({ page }) => {
  await page.getByRole('button', { name: 'Shops' }).click()
  const menu = page.getByRole('menu', { name: 'Shops' })
  await expect(menu.getByRole('menuitem')).toHaveText([
    'Weapon Shop...',
    'Armorer...',
    'Magic Items...',
    'Inn...',
  ])
  await page.getByRole('heading', { name: 'City of Darkwood' }).click()
  await expect(menu).toBeHidden()
})

test('the game is saved and comes back after a reload', async ({ page }) => {
  await page.evaluate(() => {
    const save = JSON.parse(localStorage.getItem('darkwood-save')!)
    save.characters[0].gold = 77
    localStorage.setItem('darkwood-save', JSON.stringify(save))
  })
  await page.reload()
  await expect(page.getByRole('region', { name: 'Character' })).toContainText(/Gold:\s*77/)
})

test('the sound switch is remembered', async ({ page }) => {
  const toggle = page.getByRole('button', { name: /Sound/ })
  await expect(toggle).toHaveText('Sound On')
  await toggle.click()
  await expect(toggle).toHaveText('Sound Off')
  await page.reload()
  await expect(page.getByRole('button', { name: /Sound/ })).toHaveText('Sound Off')
})
