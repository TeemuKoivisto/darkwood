/**
 * One run through the whole game in the browser: buy a weapon, beat the Giant Rat, heal at the
 * inn, surrender once, die once. Every roll is `window.rolls`, changed between the phases.
 */
import { expect, test, type Page } from '@playwright/test'

const sheet = (page: Page) => page.getByRole('region', { name: 'Character' })
const ok = (page: Page, dialog: string) =>
  page.getByRole('dialog', { name: dialog }).getByRole('button', { name: 'OK' }).click()

async function enterArena(page: Page, creature: string) {
  await page.getByRole('button', { name: 'Arena' }).click()
  await page.getByRole('option', { name: creature }).click()
  await page.getByRole('button', { name: 'Fight' }).click()
}

test('a whole game', async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { rolls: number }
    w.rolls = 0.6
    Math.random = () => w.rolls
  })
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()

  // Buy a Warhammer and take it up
  await page.getByRole('button', { name: 'Weapon Shop' }).click()
  await page.getByRole('option', { name: 'Warhammer', exact: true }).click()
  await page.getByRole('button', { name: 'Buy' }).click()
  const owned = page.getByRole('listbox', { name: 'Character Weapons' })
  await owned.getByRole('option', { name: 'Warhammer' }).click()
  await expect(owned.getByRole('option')).toHaveText(['Dagger', '✓Warhammer'])
  await page.getByRole('button', { name: 'Done' }).click()
  await expect(sheet(page)).toContainText(/Gold:\s*8/)

  // The Giant Rat bites first, then the Warhammer kills it
  await enterArena(page, 'Rat, Giant')
  await page.getByRole('button', { name: 'Fight' }).click()
  await expect(page.getByRole('log', { name: 'Messages' })).toHaveText(
    /The creature strikes first\s*You hit 1 time for 4 points.\s*The creature hit 1 time for 2 points./
  )
  await expect(page.getByRole('dialog', { name: 'Victory' })).toContainText(
    'You have defeated your opponent.'
  )
  await ok(page, 'Victory')
  await expect(sheet(page)).toContainText(/XP:\s*75/)
  await expect(sheet(page)).toContainText(/Hit Points:\s*8\/10/)
  await expect(sheet(page)).toContainText(/Gold:\s*18/)

  // Two nights at the inn
  await page.getByRole('button', { name: 'Inn', exact: true }).click()
  await page.getByRole('button', { name: 'Stay Until Healed' }).click()
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(sheet(page)).toContainText(/Hit Points:\s*10\/10/)
  await expect(sheet(page)).toContainText(/Gold:\s*16/)

  // Give up against a Kobold
  await enterArena(page, 'Kobold')
  await page.getByRole('button', { name: 'Surrender' }).click()
  await expect(page.getByRole('dialog', { name: 'Alert' })).toContainText(
    'You pay 2 gold pieces to surrender.'
  )
  await ok(page, 'Alert')
  await expect(sheet(page)).toContainText(/Gold:\s*14/)

  // A Hill Giant is too much: one blow, the reaper, and a new Derek
  await enterArena(page, 'Giant, Hill')
  await page.getByRole('button', { name: 'Fight' }).click()
  await expect(page.getByRole('dialog', { name: 'Death' })).toContainText(
    'You character has been killed fighting in the arena. Better luck next time.'
  )
  await ok(page, 'Death')
  await expect(sheet(page)).toContainText(/XP:\s*0/)
  await expect(sheet(page)).toContainText(/Gold:\s*10/)
  await expect(sheet(page)).toContainText(/Hit Points:\s*10\/10/)

  // And the new character is what comes back after a reload
  await page.reload()
  await expect(sheet(page)).toContainText(/XP:\s*0/)
})
