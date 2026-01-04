import { test, expect } from "@playwright/test";

test.describe("Terminal CTF Challenges", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Enable Terminal Mode via Command Palette
    await page.keyboard.press("Control+k");
    const dialog = page.locator("[cmdk-dialog]");
    await expect(dialog).toBeVisible();
    const input = dialog.locator("[cmdk-input]");
    await input.fill("Toggle Terminal Mode");
    const terminalOption = dialog.locator("[cmdk-item]", {
      hasText: /terminal mode/i,
    });
    await terminalOption.click();
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
