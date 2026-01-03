import { test, expect } from '@playwright/test';

test('terminal mode commands work', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
  });

  await page.goto('/resume');
  await page.waitForLoadState('networkidle');

  // Wait for client-side hydration
  await page.waitForTimeout(500);

  // Open command palette with keyboard shortcut
  await page.keyboard.press('Control+k');

  // Wait for dialog to appear
  const dialog = page.locator('[cmdk-dialog]');
  await expect(dialog).toBeVisible({ timeout: 5000 });

  // Find and use the command input
  const input = dialog.locator('[cmdk-input]');
  await input.fill('Toggle Terminal Mode');

  // Click the terminal mode option
  const terminalOption = dialog.locator('[cmdk-item]', { hasText: /terminal mode/i });
  await terminalOption.click();

  // Verify terminal mode is activated
  await expect(page.locator('html')).toHaveAttribute('data-terminal', 'true');
});
