import { defineConfig, devices } from '@playwright/test'

const CI = !!process.env.CI

export default defineConfig({
  testDir: './tests/fumaca',
  // Os testes gravam no mesmo banco local; em série o resultado é previsível.
  workers: 1,
  fullyParallel: false,
  forbidOnly: CI,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: CI
    ? [['list'], ['github'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'http://localhost:3000',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // Na esteira o build já foi feito no passo anterior; localmente usa o dev server.
    command: CI ? 'npm run start' : 'npm run dev',
    url: 'http://localhost:3000/login',
    reuseExistingServer: !CI,
    timeout: 120_000,
  },
})
