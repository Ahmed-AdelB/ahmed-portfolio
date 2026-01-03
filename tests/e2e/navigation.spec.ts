import { test, expect } from '@playwright/test';

test('navigation works', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Find navigation - may be desktop or mobile depending on viewport
  const desktopNav = page.locator('nav[aria-label="Main navigation"]');
  const mobileNav = page.locator('nav[aria-label="Mobile navigation"]');

  // Check if either nav is visible (depends on viewport)
  const isDesktopVisible = await desktopNav.isVisible().catch(() => false);

  if (isDesktopVisible) {
    await desktopNav.getByRole('link', { name: 'About' }).click();
  } else {
    // Open mobile menu first
    await page.getByRole('button', { name: /menu/i }).click();
    await mobileNav.getByRole('link', { name: 'About' }).click();
  }

  await expect(page).toHaveURL(/\/about/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    /AI Ecosystem/i
  );
});
