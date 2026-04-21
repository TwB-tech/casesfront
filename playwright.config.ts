import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: false, // Disable parallel in CI to avoid conflicts
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 3 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? 'github' : 'list',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: process.env.CI ? 'http://localhost:3000' : 'http://localhost:3000',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Increase timeout for CI */
    actionTimeout: process.env.CI ? 10000 : 5000,
    navigationTimeout: process.env.CI ? 30000 : 10000,
  },

  /* Configure projects for major browsers - test chromium only for speed */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Ensure headless mode for CI
        headless: true,
      },
    },
    // API tests
    {
      name: 'api',
      testMatch: '**/api-test.spec.ts',
      use: {
        baseURL: 'http://localhost:3000',
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: process.env.CI
    ? {
        command: 'npm run build && npm run preview',
        url: 'http://localhost:4173',
        reuseExistingServer: false,
        timeout: 180000, // 3 minutes
      }
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120000,
      },
});
