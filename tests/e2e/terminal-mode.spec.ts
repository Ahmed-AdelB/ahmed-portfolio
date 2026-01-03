import { test, expect } from '@playwright/test';

test('terminal mode commands work', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
  });

  await page.goto('/resume');

  const searchTrigger = page.getByRole('button', { name: /open search dialog/i });
  await searchTrigger.click();

  const dialog = page.getByRole('dialog', { name: /command palette/i });
  await expect(dialog).toBeVisible();

  const input = page.getByRole('textbox', { name: /search commands/i });
  await input.fill('Toggle Terminal Mode');
  await page.getByRole('option', { name: /toggle terminal mode/i }).click();

  await expect(dialog).toBeHidden();
  await expect(page.locator('html')).toHaveAttribute('data-terminal', 'true');

  await searchTrigger.click();
  await expect(dialog).toBeVisible();

  const terminalInput = page.getByRole('textbox', { name: /search commands/i });
  const output = page.getByText('Output').locator('..');

  await terminalInput.fill('help');
  await terminalInput.press('Enter');
  await expect(output.locator('pre')).toContainText('Available commands:');
  await expect(output.locator('pre')).toContainText('whoami - display current user');

  await terminalInput.fill('ls');
  await terminalInput.press('Enter');
  await expect(output.locator('pre')).toContainText('home');

  await terminalInput.fill('cat about.txt');
  await terminalInput.press('Enter');
  await expect(output.locator('pre')).toContainText(
    'Incident Response and Threat Intelligence leader.'
  );

  await terminalInput.fill('whoami');
  await terminalInput.press('Enter');
  await expect(output.locator('pre')).toContainText('ahmedadel');
});
