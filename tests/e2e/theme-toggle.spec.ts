import { test, expect } from '@playwright/test';

test('dark mode toggle works', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
  });

  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');

  const toggle = page.getByRole('button', { name: /current theme/i });
  await expect(toggle).toBeVisible();

  await toggle.click();
  await page.getByRole('option', { name: /dark/i }).click();

  await expect(page.locator('html')).toHaveClass(/dark/);

  const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
  expect(storedTheme).toBe('dark');
});
