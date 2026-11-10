/** The File, Character and Shops menus. */
import { expect, test, type Page } from '@playwright/test'

const sheet = (page: Page) => page.getByRole('region', { name: 'Character' })
const item = (name: string, extra: Record<string, number>) => ({
  name,
  cost: 100,
  ac_bonus: 0,
  unused: 0,
  dmg_min: 0,
  dmg_max: 0,
  heal_min: 0,
  heal_max: 0,
  charges: 1,
  attribute_raised: 0,
  ...extra,
})

async function patch(page: Page, fields: Record<string, unknown>) {
  await page.evaluate(fields => {
    const save = JSON.parse(localStorage.getItem('darkwood-save')!)
    Object.assign(save.characters[0], fields)
    localStorage.setItem('darkwood-save', JSON.stringify(save))
  }, fields)
  await page.reload()
}

async function menu(page: Page, title: string, entry: string) {
  await page.getByRole('button', { name: title }).click()
  await page.getByRole('menu', { name: title }).getByRole('menuitem', { name: entry }).click()
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.goto('/')
})

test('New Game asks first', async ({ page }) => {
  await patch(page, { gold: 500 })
  await menu(page, 'File', 'New Game')
  const confirm = page.getByRole('dialog', { name: 'New Game' })
  await expect(confirm).toContainText(
    'Are you sure you want to abandon this character for another?'
  )
  await confirm.getByRole('button', { name: 'Cancel' }).click()
  await expect(sheet(page)).toContainText(/Gold:\s*500/)

  await menu(page, 'File', 'New Game')
  await confirm.getByRole('button', { name: 'OK' }).click()
  await expect(sheet(page)).toContainText(/Gold:\s*10/)
})

test('Save downloads the game and Open loads it back', async ({ page }) => {
  await patch(page, { gold: 321 })
  const downloading = page.waitForEvent('download')
  await menu(page, 'File', 'Save...')
  const download = await downloading
  expect(download.suggestedFilename()).toBe('Derek.darkwood.json')
  const path = await download.path()

  await menu(page, 'File', 'New Game')
  await page.getByRole('dialog', { name: 'New Game' }).getByRole('button', { name: 'OK' }).click()
  await expect(sheet(page)).toContainText(/Gold:\s*10/)

  await page.getByLabel('Open a character file').setInputFiles(path)
  await expect(sheet(page)).toContainText(/Gold:\s*321/)
})

test('Open refuses a file that is not a save', async ({ page }) => {
  await page.getByLabel('Open a character file').setInputFiles({
    name: 'junk.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"hello": 1}'),
  })
  await expect(page.getByRole('dialog', { name: 'Alert' })).toContainText(
    'This file is not a Darkwood character file.'
  )
})

test('Equipment lists weapons, armor and magic items with charges', async ({ page }) => {
  await patch(page, {
    magicItems: [item('Wand of Fire', { dmg_min: 4, dmg_max: 24, charges: 7 })],
  })
  await menu(page, 'Character', 'Equipment...')
  const dialog = page.getByRole('dialog', { name: 'Equipment' })
  await expect(dialog.getByRole('region', { name: 'Weapons' })).toContainText('✓Dagger')
  await expect(dialog.getByRole('region', { name: 'Weapons' })).toContainText('None')
  await expect(dialog.getByRole('region', { name: 'Magic Items' })).toContainText(
    /Wand of Fire\s*7/
  )
  await dialog.getByRole('button', { name: 'OK' }).click()
  await expect(dialog).toBeHidden()
})

test('Magic Items works outside combat for potions, not for wands', async ({ page }) => {
  await page.addInitScript(() => (Math.random = () => 0.5))
  await patch(page, {
    hp: 2,
    magicItems: [
      item('Potion of Healing', { heal_min: 1, heal_max: 8 }),
      item('Wand of Fire', { dmg_min: 4, dmg_max: 24, charges: 10 }),
    ],
  })
  await menu(page, 'Character', 'Magic Items...')
  const picker = page.getByRole('dialog', { name: 'Magic Items' })
  await picker.getByRole('button', { name: 'Use' }).click()
  const alert = page.getByRole('dialog', { name: 'Alert' })
  await expect(alert).toContainText('You have been healed 4 hit points.')
  await alert.getByRole('button', { name: 'OK' }).click()
  await expect(sheet(page)).toContainText(/Hit Points:\s*6\/10/)

  await menu(page, 'Character', 'Magic Items...')
  await picker.getByRole('option', { name: 'Wand of Fire' }).click()
  await picker.getByRole('button', { name: 'Use' }).click()
  await expect(alert).toContainText('This item can only be used in combat.')
})

test('the Shops menu opens the same screens as the buildings', async ({ page }) => {
  for (const [entry, region] of [
    ['Weapon Shop...', 'Weapon Shop'],
    ['Armorer...', 'Armorer'],
    ['Magic Items...', 'Magic Item Shop'],
    ['Inn...', 'Inn'],
  ]) {
    await menu(page, 'Shops', entry)
    const screen = page.getByRole('region', { name: region })
    await expect(screen).toBeVisible()
    await screen.getByRole('button', { name: /Done|Cancel/ }).click()
    await expect(screen).toBeHidden()
  }
})
