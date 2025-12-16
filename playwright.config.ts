import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  retries: process.env.CI ? 2 : 0,
  fullyParallel: true,

  use: {
    baseURL: 'http://localhost:3001',
    headless: true,          // запусти headed через: npm run test:e2e -- --headed
    actionTimeout: 0,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],

  projects: [
    {
      name: 'Chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Автоподъём backend и ожидание health
  webServer: {
    command: "npm run dev:server",
    url: "http://localhost:5001/health",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
