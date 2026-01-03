import { test, expect } from '@playwright/test';

test('navigation works', async ({ page }) => {
  await page.goto('/');

  const nav = page.getByRole('navigation', { name: /main navigation/i });
  await expect(nav).toBeVisible();

  await nav.getByRole('link', { name: 'About' }).click();
  await expect(page).toHaveURL(/\/about/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    /AI Ecosystem/i
  );

  await nav.getByRole('link', { name: 'Blog' }).click();
  await expect(page).toHaveURL(/\/blog/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    /Blog and Research Notes/i
  );
});
