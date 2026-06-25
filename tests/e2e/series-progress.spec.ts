import { test, expect } from '@playwright/test';
import { setupClerkTestingToken } from '@clerk/testing/playwright';

/**
 * Flow 2 — Set a series to Watching at S2E5, then bump to S2E6 and see the
 * episode update (with its flip animation).
 */
test('track a series and bump the episode', async ({ page }) => {
  await setupClerkTestingToken({ page });
  await page.goto('/');

  await page.getByRole('button', { name: 'Add a title' }).first().click();
  const dialog = page.getByRole('dialog');
  await dialog.getByPlaceholder('Title name').fill('E2E Severance');

  // Type -> Series (first combobox).
  await dialog.getByRole('combobox').first().click();
  await page.getByRole('option', { name: 'Series' }).click();

  // Status -> Watching (second combobox).
  await dialog.getByRole('combobox').nth(1).click();
  await page.getByRole('option', { name: 'Watching' }).click();

  // Season 2, Episode 5 (both inputs use the "1" placeholder).
  await dialog.getByPlaceholder('1').nth(0).fill('2');
  await dialog.getByPlaceholder('1').nth(1).fill('5');

  await dialog.getByRole('button', { name: 'Add title' }).click();

  // Open the title and confirm S2E5, then bump the episode.
  await page.getByRole('link', { name: /E2E Severance/ }).click();
  await expect(
    page.locator('[aria-label="Season 2, episode 5"]'),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Next episode' }).click();

  await expect(
    page.locator('[aria-label="Season 2, episode 6"]'),
  ).toBeVisible();
});
