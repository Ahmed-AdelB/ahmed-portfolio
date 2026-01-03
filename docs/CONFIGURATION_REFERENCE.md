# Configuration Reference

This document serves as a comprehensive reference for all configurations used in the Ahmed Adel Portfolio project. It covers environment variables, build settings, deployment configurations, and testing setups.

## Environment Variables

The project uses the following environment variables. Create a `.env` file in the root directory based on `.env.example`.

| Variable | Description | Required? | Default |
|----------|-------------|-----------|---------|
| `ANTHROPIC_API_KEY` | API key for Anthropic (Claude), used for the AI Chat feature. | **Yes** (for Chat) | - |
| `BUTTONDOWN_API_KEY` | API key for Buttondown, used for Newsletter subscriptions. | **Yes** (for Newsletter) | - |
| `UMAMI_WEBSITE_ID` | Tracking ID for Umami Analytics. | No | - |
| `PLAYWRIGHT_BASE_URL` | Base URL for running E2E tests. | No | `http://127.0.0.1:4321` |
| `CI` | Indicates a Continuous Integration environment. | No | - |

> **Note:** `import.meta.env.SITE` is automatically populated by Astro based on the `site` config in `astro.config.mjs` or the `--site` flag. `VERCEL_GIT_COMMIT_SHA` is automatically provided by Vercel.

## Build Settings

- **Framework:** Astro (Static Site Generation)
- **Node.js Version:** 18.x or higher
- **Build Command:** `npm run build`
- **Output Directory:** `dist/`

### Key Scripts (`package.json`)

- `npm run dev`: Starts the development server (default port: 4321).
- `npm run build`: Builds the project for production.
- `npm run preview`: Previews the built project locally.
- `npm run check:links`: Runs a script to check for broken links.
- `npm run pre-launch`: Runs a suite of pre-launch checks (types, lint, build, link check).
- `npm test`: Runs unit tests using Vitest.
- `npm run test:e2e`: Runs E2E tests using Playwright.

## Deployment Configuration

The project is configured for deployment on **Vercel** via `vercel.json`.

- **Framework Preset:** Astro
- **Security Headers:**
  - `X-Frame-Options`: DENY
  - `X-Content-Type-Options`: nosniff
  - `Content-Security-Policy`: configured to allow self, specific external sources (Calendly, Formspree), and unsafe-inline styles/scripts (typical for some integrations).
  - `Permissions-Policy`: restrictive (camera, microphone, geolocation disabled).
- **Redirects:** Redirects `www` to non-www.

## Testing Configuration

### Unit Testing (`vitest.config.ts`)
- **Framework:** Vitest
- **Environment:** happy-dom
- **Setup:** `src/test/setup.ts`
- **Excludes:** E2E tests directory

### E2E Testing (`playwright.config.ts`)
- **Framework:** Playwright
- **Projects:**
  - Desktop: Chromium, Firefox, WebKit, Edge
  - Mobile: Chrome (Pixel 5), Safari (iPhone 12), iPhone 14 Pro, iPhone SE, Pixel 7, iPad Pro 11
- **CI Behavior:**
  - Retries: 2 (CI) vs 0 (local)
  - Reporter: GitHub (CI) vs List (local)
  - WebServer: Automatically starts `npm run dev` if not running.

## Integrations & Services

- **Analytics:** Umami (via `UMAMI_WEBSITE_ID`)
- **Newsletter:** Buttondown (via `BUTTONDOWN_API_KEY`)
- **Chat:** Anthropic Claude API (via `ANTHROPIC_API_KEY`)
- **Forms:** Formspree (allowed in CSP)
- **Scheduling:** Calendly (allowed in CSP)

---
*Documented by Ahmed Adel Bakr Alderai*
