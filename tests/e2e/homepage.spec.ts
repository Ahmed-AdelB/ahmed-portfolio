import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Ahmed Adel/i);
  await expect(page.locator('#hero')).toBeVisible();
  await expect(page.locator('#hero h1')).toContainText('Ahmed');
  await expect(
    page.getByRole('link', { name: /view contributions/i })
  ).toBeVisible();
});
