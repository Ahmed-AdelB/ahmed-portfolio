import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4321";
const isCI = !!process.env.CI;

// CI: Run only essential browsers for speed (chromium + 1 mobile)
// Local: Run full cross-browser testing
const ciProjects = [
  {
    name: "chromium",
    use: { ...devices["Desktop Chrome"] },
  },
  {
    name: "Mobile Chrome",
    use: { ...devices["Pixel 5"] },
  },
];

const fullProjects = [
  // Desktop browsers - Cross-browser testing (Issue #177)
  {
    name: "chromium",
    use: { ...devices["Desktop Chrome"] },
  },
  {
    name: "firefox",
    use: { ...devices["Desktop Firefox"] },
  },
  {
    name: "webkit",
    use: { ...devices["Desktop Safari"] },
  },
  {
    name: "edge",
    use: { ...devices["Desktop Edge"], channel: "msedge" },
  },
  // Mobile browsers
  {
    name: "Mobile Chrome",
    use: { ...devices["Pixel 5"] },
  },
  {
    name: "Mobile Safari",
    use: { ...devices["iPhone 12"] },
  },
  // Additional mobile devices for comprehensive testing (Issue #178)
  {
    name: "iPhone 14 Pro",
    use: { ...devices["iPhone 14 Pro"] },
  },
  {
    name: "iPhone SE",
    use: { ...devices["iPhone SE"] },
  },
  {
    name: "Pixel 7",
    use: { ...devices["Pixel 7"] },
  },
  {
    name: "iPad Pro 11",
    use: { ...devices["iPad Pro 11"] },
  },
];

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: isCI ? 1 : 0, // Reduce retries in CI for speed
  reporter: isCI ? "github" : "list",
  timeout: isCI ? 30000 : 60000, // Shorter timeout in CI
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: isCI ? "off" : "retain-on-failure", // No video in CI for speed
  },
  // Use minimal browsers in CI, full suite locally
  projects: isCI ? ciProjects : fullProjects,
  webServer: {
    command: "npm run dev -- --host",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
