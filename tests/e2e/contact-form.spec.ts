import { test, expect } from '@playwright/test';

test('contact form validation blocks empty submits', async ({ page }) => {
  await page.goto('/contact');

  await page.getByRole('button', { name: /send message/i }).click();

  await expect(page.locator('#name')).toBeFocused();
  await expect(page.locator('#contact-form :invalid')).toHaveCount(4);

  await page.fill('#name', 'Test User');
  await page.fill('#email', 'not-an-email');
  await page.selectOption('#subject', 'general');
  await page.fill('#message', 'Hello there');

  await page.getByRole('button', { name: /send message/i }).click();

  await expect(page.locator('#email:invalid')).toBeVisible();
  await expect(page.locator('#contact-form :invalid')).toHaveCount(1);
});
