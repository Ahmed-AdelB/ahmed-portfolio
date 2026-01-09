import { test, expect } from "@playwright/test";

test.describe("Terminal CTF Challenges", () => {
  // Emulate reduced motion to disable typing animation for faster/reliable tests
  test.use({ colorScheme: "dark" });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Enable Terminal Mode via Toggle Button
    // Wait for the button to be available (lazy loaded)
    const toggleBtn = page.locator(".terminal-toggle");
    await toggleBtn.waitFor({ state: "attached", timeout: 15000 });
    // Ensure it's visible (might be covered or animating)
    await toggleBtn.waitFor({ state: "visible", timeout: 5000 });

    await toggleBtn.click();

    await expect(page.locator("html")).toHaveAttribute("data-terminal", "true");
  });

  test("Flag 2: sudo su reveals flag", async ({ page }) => {
    const terminalInput = page.getByLabel("Terminal command input");
    await expect(terminalInput).toBeVisible();

    await terminalInput.fill("sudo su");
    await terminalInput.press("Enter");

    const terminalOutput = page.locator(".terminal-output");
    await expect(terminalOutput).toContainText("FLAG{terminal_hacker_elite}");
    await expect(terminalOutput).toContainText("Access granted");
  });

  test("Flag 2: cat /etc/shadow reveals flag", async ({ page }) => {
    const terminalInput = page.getByLabel("Terminal command input");
    await expect(terminalInput).toBeVisible();

    await terminalInput.fill("cat /etc/shadow");
    await terminalInput.press("Enter");

    const terminalOutput = page.locator(".terminal-output");
    await expect(terminalOutput).toContainText("FLAG{terminal_hacker_elite}");
  });
});
