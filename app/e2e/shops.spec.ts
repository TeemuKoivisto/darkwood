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
