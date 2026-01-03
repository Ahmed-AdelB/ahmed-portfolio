import { test, expect } from "@playwright/test";

test.describe("Mobile Device Tests", () => {
  test.describe("Responsive Navigation", () => {
    test("hamburger menu opens and closes", async ({ page, isMobile }) => {
      test.skip(!isMobile, "This test only runs on mobile devices");

      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Find the hamburger menu button
      const menuButton = page.getByRole("button", { name: /menu/i });
      await expect(menuButton).toBeVisible();

      // Click to open menu
      await menuButton.click();

      // Mobile navigation should be visible
      const mobileNav = page.locator('nav[aria-label="Mobile navigation"]');
      await expect(mobileNav).toBeVisible();

      // Navigation links should be visible
      await expect(mobileNav.getByRole("link", { name: "Home" })).toBeVisible();
      await expect(
        mobileNav.getByRole("link", { name: "About" }),
      ).toBeVisible();

      // Close the menu
      const closeButton = page.getByRole("button", { name: /close/i });
      if (await closeButton.isVisible()) {
        await closeButton.click();
      } else {
        await menuButton.click();
      }
    });

    test("mobile navigation links work correctly", async ({
      page,
      isMobile,
    }) => {
      test.skip(!isMobile, "This test only runs on mobile devices");

      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Open mobile menu
      const menuButton = page.getByRole("button", { name: /menu/i });
      await menuButton.click();

      // Click on About link
      const mobileNav = page.locator('nav[aria-label="Mobile navigation"]');
      await mobileNav.getByRole("link", { name: "About" }).click();

      await expect(page).toHaveURL(/\/about/);
    });
  });

  test.describe("Touch Interactions", () => {
    test("buttons respond to tap", async ({ page, isMobile }) => {
      test.skip(!isMobile, "This test only runs on mobile devices");

      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Find a tappable element
      const ctaButton = page.getByRole("link", { name: /view contributions/i });
      if (await ctaButton.isVisible()) {
        // Use tap instead of click for mobile touch simulation
        await ctaButton.tap();
        await page.waitForLoadState("networkidle");
      }
    });

    test("theme toggle works with touch", async ({ page, isMobile }) => {
      test.skip(!isMobile, "This test only runs on mobile devices");

      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Find theme toggle button
      const themeToggle = page.getByRole("button", { name: /toggle theme/i });
      if (await themeToggle.isVisible()) {
        const htmlElement = page.locator("html");
        const initialTheme = await htmlElement.getAttribute("class");

        // Tap the theme toggle
        await themeToggle.tap();
        await page.waitForTimeout(500);

        const newTheme = await htmlElement.getAttribute("class");
        expect(newTheme).not.toBe(initialTheme);
      }
    });

    test("scroll works on touch devices", async ({ page, isMobile }) => {
      test.skip(!isMobile, "This test only runs on mobile devices");

      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Get initial scroll position
      const initialScrollY = await page.evaluate(() => window.scrollY);

      // Simulate scroll by touch
      await page.evaluate(() => {
        window.scrollTo({ top: 500, behavior: "smooth" });
      });
      await page.waitForTimeout(500);

      // Verify scroll occurred
      const newScrollY = await page.evaluate(() => window.scrollY);
      expect(newScrollY).toBeGreaterThan(initialScrollY);
    });
  });

  test.describe("Viewport Adaptations", () => {
    test("hero section adapts to viewport", async ({ page, isMobile }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const hero = page.locator("#hero");
      await expect(hero).toBeVisible();

      // Verify the hero fits within the viewport
      const heroBox = await hero.boundingBox();
      const viewportSize = page.viewportSize();

      if (heroBox && viewportSize) {
        expect(heroBox.width).toBeLessThanOrEqual(viewportSize.width);
      }
    });

    test("content does not overflow horizontally", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Check for horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return (
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth
        );
      });

      expect(hasHorizontalScroll).toBe(false);
    });

    test("text is readable without zooming", async ({ page, isMobile }) => {
      test.skip(!isMobile, "This test only runs on mobile devices");

      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Check that main text elements have adequate font size (at least 14px)
      const bodyFontSize = await page.evaluate(() => {
        const body = document.querySelector("body");
        if (body) {
          return parseFloat(window.getComputedStyle(body).fontSize);
        }
        return 0;
      });

      expect(bodyFontSize).toBeGreaterThanOrEqual(14);
    });

    test("touch targets are adequately sized", async ({ page, isMobile }) => {
      test.skip(!isMobile, "This test only runs on mobile devices");

      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Check button sizes (minimum 44x44px recommended for touch)
      const buttons = page.locator('button, a[role="button"]');
      const buttonCount = await buttons.count();

      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const box = await button.boundingBox();
          if (box) {
            // Touch targets should be at least 44x44px (WCAG guidelines)
            expect(box.width).toBeGreaterThanOrEqual(44);
            expect(box.height).toBeGreaterThanOrEqual(44);
          }
        }
      }
    });

    test("images scale appropriately", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const images = page.locator("img");
      const viewportSize = page.viewportSize();

      if (viewportSize) {
        const imageCount = await images.count();
        for (let i = 0; i < Math.min(imageCount, 5); i++) {
          const image = images.nth(i);
          if (await image.isVisible()) {
            const box = await image.boundingBox();
            if (box) {
              // Images should not exceed viewport width
              expect(box.width).toBeLessThanOrEqual(viewportSize.width);
            }
          }
        }
      }
    });
  });

  test.describe("Tablet-specific Tests", () => {
    test("layout adapts for tablet viewport", async ({ page, browserName }) => {
      // This test runs on all devices but focuses on tablet-size viewports
      const viewportSize = page.viewportSize();
      const isTablet =
        viewportSize && viewportSize.width >= 768 && viewportSize.width < 1024;

      if (!isTablet) {
        test.skip();
        return;
      }

      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Tablet should show either full navigation or hamburger depending on design
      const desktopNav = page.locator('nav[aria-label="Main navigation"]');
      const mobileNav = page.locator('nav[aria-label="Mobile navigation"]');
      const menuButton = page.getByRole("button", { name: /menu/i });

      // At least one navigation option should be available
      const hasNavigation =
        (await desktopNav.isVisible()) || (await menuButton.isVisible());

      expect(hasNavigation).toBe(true);
    });
  });
});
