/**
 * One screenshot per screen into `shots/`, named like the reference screenshots in
 * `reference/` so the two can be compared side by side. Each screen task in
 * `notes/REMAKE_PLAN.md` adds its step here.
 */
import { expect, test, type Page } from '@playwright/test'

async function shot(page: Page, name: string) {
  // Pictures in a just-opened dialog may still be loading
  await page.waitForFunction(() => [...document.images].every(i => i.complete))
  await page.screenshot({ path: `shots/${name}.png`, fullPage: false })
}

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

/** Every roll in the page comes from this one value from the next load on, so fights repeat. */
async function fixRandom(page: Page, value: number) {
  await page.addInitScript(value => (Math.random = () => value), value)
}

const HOLY_AVENGER = {
  name: 'Sword, +5 Holy Avenger',
  cost: 6000,
  magic_bonus: 5,
  dmg_min: 1,
  dmg_max: 8,
  speed: 1,
}
const item = (name: string, charges: number, extra: Record<string, number> = {}) => ({
  name,
  cost: 0,
  ac_bonus: 0,
  unused: 0,
  dmg_min: 0,
  dmg_max: 0,
  heal_min: 0,
  heal_max: 0,
  charges,
  attribute_raised: 0,
  ...extra,
})
const RING = item('Ring of Protection +3', 0, { ac_bonus: 3 })
const WAND = item('Wand of Lightning', 10, { dmg_min: 6, dmg_max: 36 })
const POTION = item('Potion of Healing', 1, { heal_min: 1, heal_max: 8 })

async function fightWith(page: Page, creature: string) {
  await page.getByRole('button', { name: 'Arena' }).click()
  await page.getByRole('option', { name: creature }).click()
  await page.getByRole('button', { name: 'Fight' }).click()
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

test('04 armorer', async ({ page }) => {
  await patchCharacter(page, VETERAN)
  await page.getByRole('button', { name: 'Armorer' }).click()
  await page.getByRole('option', { name: 'Full Plate +4' }).click()
  await page.getByRole('button', { name: 'Buy' }).click()
  await page.getByRole('option', { name: 'Leather', exact: true }).click()
  await shot(page, '04-armorer')
})

test('05 weapon shop', async ({ page }) => {
  await patchCharacter(page, VETERAN)
  await page.getByRole('button', { name: 'Weapon Shop' }).click()
  await page.getByRole('option', { name: 'Sword, +5 Holy Avenger' }).click()
  await page.getByRole('button', { name: 'Buy' }).click()
  const owned = page.getByRole('listbox', { name: 'Character Weapons' })
  await owned.getByRole('option', { name: 'Dagger' }).click()
  await page.getByRole('button', { name: 'Sell' }).click()
  await owned.getByRole('option').first().click()
  await page.getByRole('option', { name: 'Bardiche' }).click()
  await shot(page, '05-weapon-shop')
})

test('06 opponent', async ({ page }) => {
  await patchCharacter(page, VETERAN)
  await page.getByRole('button', { name: 'Arena' }).click()
  await shot(page, '06-opponent')
})

test('07 combat start', async ({ page }) => {
  await patchCharacter(page, { ...VETERAN, weapons: [HOLY_AVENGER] })
  await fightWith(page, 'Rat, Giant')
  await expect(page.getByRole('region', { name: 'Combat' })).toBeVisible()
  await shot(page, '07-combat-start')
})

test('08 magic items', async ({ page }) => {
  await patchCharacter(page, { ...VETERAN, weapons: [HOLY_AVENGER], magicItems: [RING, WAND] })
  await fightWith(page, 'Goblin')
  await page.getByRole('button', { name: 'Use' }).click()
  await expect(page.getByRole('dialog', { name: 'Magic Items' })).toBeVisible()
  await shot(page, '08-magic-items')
})

test('09 surrender', async ({ page }) => {
  await fixRandom(page, 0.1)
  await patchCharacter(page, {
    ...VETERAN,
    hp: 100,
    weapons: [HOLY_AVENGER],
    magicItems: [RING, POTION],
  })
  await fightWith(page, 'Goblin')
  await page.getByRole('button', { name: 'Use' }).click()
  await page.getByRole('option', { name: 'Potion of Healing' }).click()
  await page
    .getByRole('dialog', { name: 'Magic Items' })
    .getByRole('button', { name: 'Use' })
    .click()
  await page.getByRole('dialog', { name: 'Alert' }).getByRole('button', { name: 'OK' }).click()
  await page.getByRole('button', { name: 'Surrender' }).click()
  await expect(page.getByRole('dialog', { name: 'Alert' })).toContainText(
    'You pay 2 gold pieces to surrender.'
  )
  await shot(page, '09-surrender')
})

test('10 win', async ({ page }) => {
  await fixRandom(page, 0.5)
  await patchCharacter(page, { ...VETERAN, weapons: [HOLY_AVENGER] })
  await fightWith(page, 'Rat, Giant')
  await page.getByRole('button', { name: 'Fight' }).click()
  await expect(page.getByRole('dialog', { name: 'Victory' })).toBeVisible()
  await shot(page, '10-win')
})

test('12 death', async ({ page }) => {
  await fixRandom(page, 0.5)
  await patchCharacter(page, { hp: 3 })
  await fightWith(page, 'Orc')
  await page.getByRole('button', { name: 'Fight' }).click()
  await expect(page.getByRole('dialog', { name: 'Death' })).toBeVisible()
  await shot(page, '12-death')
})

test('13 game won', async ({ page }) => {
  await fixRandom(page, 0.99)
  await patchCharacter(page, { ...VETERAN, weapons: [HOLY_AVENGER] })
  await fightWith(page, 'Dragon, Red')
  // A weakened dragon, so one round finishes it
  await page.evaluate(() => {
    const save = JSON.parse(localStorage.getItem('darkwood-save')!)
    save.fights[0].creature.hp = 20
    localStorage.setItem('darkwood-save', JSON.stringify(save))
  })
  await page.reload()
  await page.getByRole('button', { name: 'Fight' }).click()
  await page.getByRole('dialog', { name: 'Victory' }).getByRole('button', { name: 'OK' }).click()
  await expect(page.getByRole('dialog', { name: 'Congratulations' })).toBeVisible()
  await shot(page, '13-game-won')
})
