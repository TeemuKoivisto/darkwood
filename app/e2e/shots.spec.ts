/**
 * One screenshot per screen into `shots/`, named like the reference screenshots in
 * `reference/` so the two can be compared side by side. Each screen task in
 * `notes/REMAKE_PLAN.md` adds its step here.
 */
import { expect, test, type Page } from '@playwright/test'

const shot = (page: Page, name: string) =>
  page.screenshot({ path: `shots/${name}.png`, fullPage: false })

/** The late-game character of the reference screenshots, written into the autosave. */
const VETERAN = {
  level: 14,
  xp: 1548525,
  hp: 118,
  hpMax: 118,
  strength: 18,
  strengthPct: 10,
  wisdom: 17,
  dexterity: 18,
  constitution: 18,
  charisma: 17,
  thac0: 7,
  attacksPerRound: 2,
  gold: 24554,
}

async function patchCharacter(page: Page, fields: Record<string, unknown>) {
  await page.evaluate(fields => {
    const save = JSON.parse(localStorage.getItem('darkwood-save')!)
    save.characters = save.characters.map((c: { id: string }) =>
      c.id === save.characterId ? { ...c, ...fields } : c
    )
    localStorage.setItem('darkwood-save', JSON.stringify(save))
  }, fields)
  await page.reload()
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  // A fresh character every run, whatever the browser profile has saved
  await page.evaluate(() => localStorage.clear())
  await page.goto('/')
})

test('01 main', async ({ page }) => {
  await patchCharacter(page, VETERAN)
  await expect(page.getByText('City of Darkwood')).toBeVisible()
  await page.getByRole('button', { name: 'Armorer' }).hover()
  await shot(page, '01-main')
})

test('02 magic shop', async ({ page }) => {
  await patchCharacter(page, VETERAN)
  await page.getByRole('button', { name: 'Magic Item Shop' }).click()
  const shop = page.getByRole('listbox', { name: 'Items Available' })
  await shop.getByRole('option', { name: 'Ring of Protection +3' }).click()
  await page.getByRole('button', { name: 'Buy' }).click()
  await shop.getByRole('option', { name: 'Wand of Lightning' }).click()
  await page.getByRole('button', { name: 'Buy' }).click()
  await shop.getByRole('option', { name: 'Potion of Healing' }).click()
  await page.getByRole('listbox', { name: 'Character Items' }).getByRole('option').first().click()
  await shot(page, '02-magic-shop')
})

test('03 inn', async ({ page }) => {
  await patchCharacter(page, VETERAN)
  await page.getByRole('button', { name: 'Inn', exact: true }).click()
  await shot(page, '03-inn')
})
