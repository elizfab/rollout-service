import { defineConfig, devices } from '@playwright/test';

/**
 * Cenários E2E com Playwright, rodando contra o app com dados do mock local.
 * `npm run e2e` sobe o `ng serve` automaticamente (porta 6030).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:6030',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm start',
    url: 'http://localhost:6030',
    reuseExistingServer: !process.env['CI'],
    timeout: 180_000,
  },
});
