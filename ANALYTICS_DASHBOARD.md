# Analytics Dashboard (Umami)

## Purpose
This site uses Umami for privacy-friendly analytics. Tracking is configured in `src/layouts/BaseLayout.astro` and enabled when `UMAMI_WEBSITE_ID` is set.

## Setup
1. Copy `.env.example` to `.env`.
2. Set `UMAMI_WEBSITE_ID` to the website UUID from your Umami dashboard.
3. Restart the dev server or rebuild the site.

## Where Tracking Is Added
`src/layouts/BaseLayout.astro` injects the Umami script into the document head when `UMAMI_WEBSITE_ID` is present.

## Privacy Settings
The tracker is configured to:
- Respect Do Not Track
- Exclude URL search parameters
- Exclude URL hash fragments

If you need additional controls (e.g., domain allowlist or a custom host), update the script attributes in `src/layouts/BaseLayout.astro` to match your Umami setup.

## Verification
- Visit the site in a browser and confirm the tracker script loads.
- Open the Umami dashboard and verify that page views appear.

## Troubleshooting
- If no data appears, confirm `UMAMI_WEBSITE_ID` is correct and the script URL matches your Umami host.
- For local testing, ensure your Umami instance allows your local domain (if you use domain restrictions).
