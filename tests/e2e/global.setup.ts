import { test as setup, expect } from '@playwright/test';
import { clerk, clerkSetup } from '@clerk/testing/playwright';
import { mkdir } from 'node:fs/promises';

const authFile = 'playwright/.auth/user.json';

/**
 * Signs in once with Clerk and persists the authenticated session so the flow
 * specs start logged in. Requires the Clerk env keys plus a password-enabled
 * test user (E2E_CLERK_USER_USERNAME / E2E_CLERK_USER_PASSWORD).
 */
setup('authenticate', async ({ page }) => {
  await clerkSetup();
  await mkdir('playwright/.auth', { recursive: true });

  await page.goto('/sign-in');
  await clerk.signIn({
    page,
    signInParams: {
      strategy: 'password',
      identifier: process.env.E2E_CLERK_USER_USERNAME!,
      password: process.env.E2E_CLERK_USER_PASSWORD!,
    },
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Library' })).toBeVisible();

  await page.context().storageState({ path: authFile });
});
