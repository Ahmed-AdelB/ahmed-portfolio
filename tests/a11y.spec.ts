import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

interface PageCase {
  name: string;
  path: string;
}

const pages: PageCase[] = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Projects", path: "/projects" },
  { name: "Blog", path: "/blog" },
  { name: "Contact", path: "/contact" },
  { name: "Resume", path: "/resume" },
  { name: "Contributions", path: "/contributions" },
  { name: "Playground", path: "/playground" },
  { name: "Security Playground", path: "/security-playground" },
];

test.describe("WCAG 2.1 AA", () => {
  for (const pageInfo of pages) {
    test(`should have no accessibility violations on ${pageInfo.name}`, async ({ page }) => {
      await page.goto(pageInfo.path, { waitUntil: "networkidle" });

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      expect(results.violations).toEqual([]);
    });
  }
});
