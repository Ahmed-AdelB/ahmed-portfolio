import { test, expect } from "@playwright/test";

test.describe("Newsletter Subscription", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Scroll to footer where newsletter usually resides
    await page.locator("footer").scrollIntoViewIfNeeded();
  });

  test("validates required email", async ({ page }) => {
    // Attempt to submit empty
    // Note: The browser might show native validation bubbles if 'required' attribute is present.
    // The component has `required` attribute. Playwright can check validity.
    
    const emailInput = page.locator('input[type="email"]');
    const submitBtn = page.getByRole("button", { name: "Subscribe" });

    // Focus and blur to trigger touched validation if implemented, or just click submit
    await emailInput.focus();
    await emailInput.blur();
    
    // If the component uses JS validation on blur:
    // await expect(page.getByText("Email is required")).toBeVisible(); 
    // Based on code: `handleEmailBlur` sets error if empty.

    await expect(page.locator("text=Email is required")).toBeVisible();
  });

  test("validates invalid email format", async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill("not-an-email");
    await emailInput.blur();

    await expect(page.locator("text=Please enter a valid email address")).toBeVisible();
  });

  test("successfully subscribes with valid email", async ({ page }) => {
    await page.route("/api/newsletter", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, message: "Welcome aboard!" }),
      });
    });

    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill("test@example.com");
    await page.getByRole("button", { name: "Subscribe" }).click();

    await expect(page.getByText("Welcome aboard!")).toBeVisible();
    await expect(emailInput).toBeEmpty(); // Should clear input
  });

  test("handles server errors", async ({ page }) => {
    await page.route("/api/newsletter", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Server error" }),
      });
    });

    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill("test@example.com");
    await page.getByRole("button", { name: "Subscribe" }).click();

    await expect(page.getByText("Server error")).toBeVisible();
  });
});
