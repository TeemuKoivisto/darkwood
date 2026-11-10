import { defineConfig, devices } from '@playwright/test'

/**
 * Browser tests and screenshots of the built app. `npm run e2e` runs every spec, `npm run shots`
 * only `e2e/shots.spec.ts`, which writes one PNG per screen to `shots/`.
 */
export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    ...devices['Desktop Chrome'],
    viewport: { width: 900, height: 760 },
    deviceScaleFactor: 1,
  },
  projects: [{ name: 'chromium' }],
  webServer: {
    command: 'npm run dev -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
})
