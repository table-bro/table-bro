import {defineConfig, devices} from '@playwright/test';

// The stand of the e2e tests, as in `npm run stand`: port 4210 or the one from PORT, so that each working tree runs its own
const port = Number(process.env.PORT || 4210);
const url = `http://localhost:${port}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: url,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  // All the tests in Chromium; the smoke tests also in Firefox and WebKit
  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome'], channel: 'chromium'}
    },
    {
      name: 'firefox',
      use: devices['Desktop Firefox'],
      grep: /@smoke/
    },
    {
      name: 'webkit',
      use: devices['Desktop Safari'],
      grep: /@smoke/
    }
  ],
  webServer: {
    command: `npm run stand -- --port ${port}`,
    url,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
