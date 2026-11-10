/** The arena in the browser: the opponent picker and the combat screen. */
import { expect, test, type Page } from '@playwright/test'

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

async function setup(page: Page, random: number, fields: Record<string, unknown> = {}) {
  await page.addInitScript(value => (Math.random = () => value), random)
  await page.evaluate(fields => {
    const save = JSON.parse(localStorage.getItem('darkwood-save')!)
    Object.assign(save.characters[0], fields)
    localStorage.setItem('darkwood-save', JSON.stringify(save))
  }, fields)
  await page.reload()
}

async function fightWith(page: Page, creature: string) {
  await page.getByRole('button', { name: 'Arena' }).click()
  await page.getByRole('option', { name: creature }).click()
  await page.getByRole('button', { name: 'Fight' }).click()
}

const sheet = (page: Page) => page.getByRole('region', { name: 'Character' })

test('beating the Giant Rat: the round, the award, a level, back in town', async ({ page }) => {
  await setup(page, 0.6, { xp: 1950 })
  await fightWith(page, 'Rat, Giant')
  await page.getByRole('button', { name: 'Fight' }).click()

  await expect(page.getByRole('log', { name: 'Messages' })).toHaveText(
    /You strike first\s*You hit 1 time for 3 points.\s*The creature missed/
  )
  const win = page.getByRole('dialog', { name: 'Victory' })
  await expect(win).toContainText('You have been awarded 10 gold pieces and 75 experience points.')
  await win.getByRole('button', { name: 'OK' }).click()

  const level = page.getByRole('dialog', { name: 'Level Advancement' })
  await expect(level).toContainText(
    'You advance to level 2. Your character has gained 7 hit points.'
  )
  await level.getByRole('button', { name: 'OK' }).click()

  await expect(page.getByRole('region', { name: 'Combat' })).toBeHidden()
  await expect(sheet(page)).toContainText(/Level:\s*2/)
  await expect(sheet(page)).toContainText(/Hit Points:\s*17\/17/)
  await expect(sheet(page)).toContainText(/Gold:\s*20/)
})

test('too poor to surrender: the alert and the fight goes on', async ({ page }) => {
  await setup(page, 0.5)
  await fightWith(page, 'Dragon, Red')
  await page.getByRole('button', { name: 'Surrender' }).click()
  const alert = page.getByRole('dialog', { name: 'Alert' })
  await expect(alert).toContainText(
    'You do not have enough gold to pay for the surrender penalty. The fight continues.'
  )
  await alert.getByRole('button', { name: 'OK' }).click()
  await expect(page.getByRole('button', { name: 'Fight' })).toBeEnabled()
  await expect(page.getByRole('log', { name: 'Messages' })).toContainText(
    'You attempted to surrender.'
  )
})

test('surrendering pays and leaves', async ({ page }) => {
  await setup(page, 0.5)
  await fightWith(page, 'Kobold')
  await page.getByRole('button', { name: 'Surrender' }).click()
  await page.getByRole('dialog', { name: 'Alert' }).getByRole('button', { name: 'OK' }).click()
  await expect(page.getByRole('region', { name: 'Combat' })).toBeHidden()
  await expect(sheet(page)).toContainText(/Gold:\s*8/)
})

test('death starts a new character', async ({ page }) => {
  await setup(page, 0.5, { hp: 3, gold: 99 })
  await fightWith(page, 'Orc')
  await page.getByRole('button', { name: 'Fight' }).click()
  const death = page.getByRole('dialog', { name: 'Death' })
  await expect(death).toContainText('You character has been killed fighting in the arena.')
  await death.getByRole('button', { name: 'OK' }).click()

  await expect(page.getByRole('region', { name: 'Combat' })).toBeHidden()
  await expect(sheet(page)).toContainText(/Hit Points:\s*10\/10/)
  await expect(sheet(page)).toContainText(/Gold:\s*10/)
})

test('using a potion in combat', async ({ page }) => {
  await setup(page, 0.5, {
    hp: 2,
    magicItems: [
      {
        name: 'Potion of Healing',
        cost: 75,
        ac_bonus: 0,
        unused: 0,
        dmg_min: 0,
        dmg_max: 0,
        heal_min: 1,
        heal_max: 8,
        charges: 1,
        attribute_raised: 0,
      },
    ],
  })
  await fightWith(page, 'Rat, Giant')
  await page.getByRole('button', { name: 'Use' }).click()
  const picker = page.getByRole('dialog', { name: 'Magic Items' })
  await picker.getByRole('button', { name: 'Use' }).click()
  await expect(page.getByRole('dialog', { name: 'Alert' })).toContainText(
    'You have been healed 4 hit points.'
  )
  await page.getByRole('dialog', { name: 'Alert' }).getByRole('button', { name: 'OK' }).click()
  await expect(page.getByRole('log', { name: 'Messages' })).toContainText('You use an item')
  await expect(page.getByRole('region', { name: 'Player' })).toContainText('6')
})
