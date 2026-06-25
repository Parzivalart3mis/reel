import { test, expect } from '@playwright/test';
import { setupClerkTestingToken } from '@clerk/testing/playwright';

/**
 * Flow 3 — Rate a film four stars (which moves it to Watched) and see the
 * dashboard watched count and average rating reflect it.
 * Assumes a clean test user so the average is exactly 4.0.
 */
test('rate a film and update the dashboard', async ({ page }) => {
  await setupClerkTestingToken({ page });
  await page.goto('/');

  // Add a film manually.
  await page.getByRole('button', { name: 'Add a title' }).first().click();
  const dialog = page.getByRole('dialog');
  await dialog.getByPlaceholder('Title name').fill('E2E Rated Film');
  await dialog.getByRole('button', { name: 'Add title' }).click();

  // Open it and rate four stars via the keyboard-operable widget.
  await page.getByRole('link', { name: /E2E Rated Film/ }).click();
  const slider = page.getByRole('slider', { name: 'Rating' });
  await slider.focus();
  for (let i = 0; i < 4; i++) await slider.press('ArrowRight');
  await expect(slider).toHaveAttribute('aria-valuenow', '4');

  // Rating implies Watched.
  await expect(page.getByText('Watched', { exact: true }).first()).toBeVisible();

  // Dashboard reflects the rating.
  await page.goto('/dashboard');
  await expect(
    page.getByRole('heading', { name: 'Dashboard' }),
  ).toBeVisible();
  await expect(page.getByText('Average rating')).toBeVisible();
  await expect(page.getByText('4.0').first()).toBeVisible();
});
