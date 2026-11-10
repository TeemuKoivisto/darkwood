/**
 * One screenshot per screen into `shots/`, named like the reference screenshots in
 * `reference/` so the two can be compared side by side. Each screen task in
 * `notes/REMAKE_PLAN.md` adds its step here.
 */
import { expect, test, type Page } from '@playwright/test'

const shot = (page: Page, name: string) =>
  page.screenshot({ path: `shots/${name}.png`, fullPage: false })

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  // A fresh character every run, whatever the browser profile has saved
  await page.evaluate(() => localStorage.clear())
  await page.goto('/')
})

test('01 main', async ({ page }) => {
  await expect(page.getByText('Darkwood')).toBeVisible()
  await shot(page, '01-main')
})
