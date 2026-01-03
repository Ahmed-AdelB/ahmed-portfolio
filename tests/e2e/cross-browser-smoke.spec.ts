import { test, expect } from "@playwright/test";

test.describe("Cross-browser smoke", () => {
  test("homepage renders core sections", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Ahmed Adel/i);
    await expect(
      page.getByRole("heading", { name: "Featured Projects" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /View all projects/i }),
    ).toBeVisible();
  });
});
