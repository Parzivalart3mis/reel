import { defineConfig, devices } from '@playwright/test';

/**
 * E2E runs against a deployed preview URL (Vercel) in CI, or a local server.
 * Set PLAYWRIGHT_BASE_URL to point at the target.
 *
 * Auth: the `setup` project signs in with Clerk (via @clerk/testing) using a
 * password-enabled test user and saves the session to playwright/.auth/user.json.
 * Provide E2E_CLERK_USER_USERNAME / E2E_CLERK_USER_PASSWORD plus the Clerk keys.
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const storageState = 'playwright/.auth/user.json';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  ...(process.env.CI ? { workers: 1 } : {}),
  reporter: (process.env.CI ? 'github' : 'html') as 'github' | 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'setup', testMatch: /global\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'], storageState },
      dependencies: ['setup'],
    },
  ],
  ...(process.env.PLAYWRIGHT_BASE_URL
    ? {}
    : {
        webServer: {
          command: 'pnpm build && pnpm start',
          url: 'http://localhost:3000',
          reuseExistingServer: !process.env.CI,
          timeout: 180_000,
        },
      }),
});
