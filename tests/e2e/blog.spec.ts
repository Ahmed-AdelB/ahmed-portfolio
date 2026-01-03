import { test, expect } from "@playwright/test";

test("blog posts render", async ({ page }) => {
  await page.goto("/blog");

  const posts = page.locator("[data-post]");
  await expect(posts).not.toHaveCount(0);

  const firstPost = posts.first();
  await expect(firstPost).toBeVisible();
  await expect(firstPost.locator("h2 a")).toBeVisible();
});
