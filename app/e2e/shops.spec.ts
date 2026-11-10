/** The shops and the inn in the browser: buying updates the lists, refusals show the alert. */
import { expect, test, type Page } from '@playwright/test'

async function setGold(page: Page, gold: number) {
  await page.evaluate(gold => {
    const save = JSON.parse(localStorage.getItem('darkwood-save')!)
    save.characters[0].gold = gold
    localStorage.setItem('darkwood-save', JSON.stringify(save))
  }, gold)
  await page.reload()
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.goto('/')
})

test('magic shop: a refusal shows the alert, a purchase moves the item over', async ({ page }) => {
  await page.getByRole('button', { name: 'Magic Item Shop' }).click()
  await page.getByRole('button', { name: 'Buy' }).click()
  const alert = page.getByRole('dialog', { name: 'Alert' })
  await expect(alert).toContainText('You do not have enough gold')
  await alert.getByRole('button', { name: 'OK' }).click()
  await expect(alert).toBeHidden()

  await page.getByRole('button', { name: 'Done' }).click()
  await setGold(page, 100)
  await page.getByRole('button', { name: 'Magic Item Shop' }).click()
  const shop = page.getByRole('region', { name: 'Magic Item Shop' })
  await page.getByRole('button', { name: 'Buy' }).click()
  await expect(page.getByRole('listbox', { name: 'Character Items' })).toHaveText(
    'Potion of Healing'
  )
  await expect(shop.getByText('Gold:')).toContainText('25')

  await page.getByRole('button', { name: 'Sell' }).click()
  await expect(page.getByRole('listbox', { name: 'Character Items' })).toHaveText('')
  await expect(shop.getByText('Gold:')).toContainText('62')
})

test('inn: heals for gold and refuses at full hit points', async ({ page }) => {
  await page.evaluate(() => {
    const save = JSON.parse(localStorage.getItem('darkwood-save')!)
    save.characters[0].hp = 6
    localStorage.setItem('darkwood-save', JSON.stringify(save))
  })
  await page.reload()
  const sheet = page.getByRole('region', { name: 'Character' })

  await page.getByRole('button', { name: 'Inn', exact: true }).click()
  await page.getByRole('button', { name: 'Stay 1 Night' }).click()
  await expect(sheet).toContainText(/Hit Points:\s*7\/10/)
  await page.getByRole('button', { name: 'Stay Until Healed' }).click()
  await expect(sheet).toContainText(/Hit Points:\s*10\/10/)
  await expect(sheet).toContainText(/Gold:\s*6/)

  await page.getByRole('button', { name: 'Stay 1 Night' }).click()
  await expect(page.getByRole('dialog', { name: 'Alert' })).toContainText(
    'You character is already up to full hit points.'
  )
  await page.getByRole('button', { name: 'OK' }).click()
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.getByRole('region', { name: 'Inn' })).toBeHidden()
})
