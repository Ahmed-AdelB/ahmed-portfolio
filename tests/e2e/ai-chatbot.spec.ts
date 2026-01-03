import { test, expect } from "@playwright/test";

test.describe("AI Chatbot", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto("/");
  });

  test("opens and closes the chat widget", async ({ page }) => {
    const toggleBtn = page.getByLabel("Open chat");
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();

    await expect(page.getByText("Ahmed AI")).toBeVisible();
    await expect(page.getByPlaceholder("Type a message...")).toBeVisible();

    const closeBtn = page.getByLabel("Close chat");
    await closeBtn.click();
    await expect(page.getByText("Ahmed AI")).not.toBeVisible();
  });

  test("sends a message and receives a response", async ({ page }) => {
    // Mock the API response
    await page.route("/api/chat", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ response: "I am a mock response" }),
      });
    });

    await page.getByLabel("Open chat").click();
    
    const input = page.getByPlaceholder("Type a message...");
    await input.fill("Hello AI");
    await page.getByLabel("Send message").click();

    // Check for user message
    await expect(page.getByText("Hello AI")).toBeVisible();
    
    // Check for loading state (might be too fast to catch deterministically, but good to know)
    // await expect(page.locator(".animate-bounce")).toBeVisible();

    // Check for bot response
    await expect(page.getByText("I am a mock response")).toBeVisible();
  });

  test("persists chat history", async ({ page }) => {
    await page.route("/api/chat", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ response: "Persisted response" }),
      });
    });

    await page.getByLabel("Open chat").click();
    await page.getByPlaceholder("Type a message...").fill("Test persistence");
    await page.getByLabel("Send message").click();
    await expect(page.getByText("Persisted response")).toBeVisible();

    // Reload page
    await page.reload();
    await page.getByLabel("Open chat").click();

    // History should be there
    await expect(page.getByText("Test persistence")).toBeVisible();
    await expect(page.getByText("Persisted response")).toBeVisible();
  });

  test("handles api errors gracefully", async ({ page }) => {
    await page.route("/api/chat", async (route) => {
      await route.abort(); // Network error
    });

    await page.getByLabel("Open chat").click();
    await page.getByPlaceholder("Type a message...").fill("Error test");
    await page.getByLabel("Send message").click();

    await expect(page.getByText("Sorry, I encountered an error")).toBeVisible();
  });
});
