import { test, expect } from '@playwright/test';

test('dark mode toggle works', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
  });

  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Wait for client-side hydration
  await page.waitForTimeout(500);

  // Find toggle button by aria-label pattern
  const toggle = page.locator('button[aria-label*="theme"]').first();
  await expect(toggle).toBeVisible();

  await toggle.click();

  // Click on dark theme option in the listbox
  const darkOption = page.locator('[role="listbox"] [role="option"]', { hasText: /dark/i });
  await darkOption.click();

  await expect(page.locator('html')).toHaveClass(/dark/);

  const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
  expect(storedTheme).toBe('dark');
});
