import { test, expect } from '@playwright/test';
import { setupClerkTestingToken } from '@clerk/testing/playwright';

/**
 * Flow 1 — Add a film by searching the database, picking a result, watching the
 * poster and details auto-fill, saving, and seeing it in the grid.
 * Requires TMDB to be configured on the target deployment.
 */
test('add a film via the film database', async ({ page }) => {
  await setupClerkTestingToken({ page });
  await page.goto('/');

  await page.getByRole('button', { name: 'Add a title' }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  await dialog.getByPlaceholder('Search films & series…').fill('Dune');

  // Pick the first search result.
  const firstResult = dialog.locator('ul li button').first();
  await firstResult.click();

  // The name field auto-fills from the picked result.
  await expect(dialog.getByPlaceholder('Title name')).not.toHaveValue('');

  await dialog.getByRole('button', { name: 'Add title' }).click();

  // The new title appears in the poster grid.
  await expect(page.getByRole('link', { name: /Dune/i })).toBeVisible();
});
