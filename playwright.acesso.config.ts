import { defineConfig, devices } from '@playwright/test'

// Config própria dos testes de acesso (SEC-03): o playwright.config.ts dos testes de
// fumaça tem testDir './tests/fumaca' e não enxerga a pasta tests/acesso.
// Carrega o .env.local (gerado por npm run env:local) para os testes de API.
try {
  process.loadEnvFile('.env.local')
} catch {
  // sem .env.local: usa as variáveis que já estiverem no ambiente
}

const CI = !!process.env.CI

export default defineConfig({
  testDir: './tests/acesso',
  fullyParallel: false,
  // Os testes gravam no mesmo banco local; em série o resultado é previsível.
  workers: 1,
  outputDir: 'test-results/acesso',
  reporter: CI
    ? [['list'], ['html', { open: 'never', outputFolder: 'playwright-report/acesso' }]]
    : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: CI ? 'npm run start' : 'npm run dev',
    url: 'http://localhost:3000/login',
    reuseExistingServer: !CI,
    timeout: 120_000,
  },
})