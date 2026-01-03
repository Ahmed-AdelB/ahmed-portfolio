# DNS Setup Guide for ahmedalderai.com

This guide outlines the DNS configuration required to deploy the portfolio to Vercel and ensure all services (Email, Site) work correctly.

## 1. Domain Registration

Ensure the domain `ahmedalderai.com` is registered and you have access to the DNS management panel (e.g., Namecheap, GoDaddy, Google Domains, or Vercel if bought there).

## 2. Vercel Configuration

The project is configured to enforce `ahmedalderai.com` as the canonical domain, redirecting `www` to the root.

### Expected Vercel Project Settings:

- **Production Domain:** `ahmedalderai.com` (Primary)
- **Redirect Domain:** `www.ahmedalderai.com` (Redirects to `ahmedalderai.com`)

## 3. DNS Records Checklist

Add the following records to your domain's DNS settings.

### A. Website (Vercel)

If you are using Vercel's nameservers, these are automatic. If using an external DNS provider:

| Type      | Name       | Value                  | TTL       | Notes                        |
| --------- | ---------- | ---------------------- | --------- | ---------------------------- |
| **A**     | `@` (Root) | `76.76.21.21`          | Auto/3600 | Points root domain to Vercel |
| **CNAME** | `www`      | `cname.vercel-dns.com` | Auto/3600 | Points sub-domain to Vercel  |

### B. Email Forwarding (Optional/Recommended)

Since you are using `contact@ahmedalderai.com` and `ahmed@ahmedalderai.com` in the codebase, you need an email service.

**Option 1: ImprovMX / ForwardEmail (Free Forwarding)**
_Forward all `@ahmedalderai.com` emails to your personal Gmail._

| Type    | Name | Value                                  | Priority |
| ------- | ---- | -------------------------------------- | -------- |
| **MX**  | `@`  | `mx1.improvmx.com`                     | 10       |
| **MX**  | `@`  | `mx2.improvmx.com`                     | 20       |
| **TXT** | `@`  | `v=spf1 include:spf.improvmx.com ~all` | -        |

**Option 2: Google Workspace / Zoho Mail (Paid/Dedicated)**
_Follow the specific instructions provided by your mail host._

## 4. Verification Steps

1.  **Wait for Propagation:** DNS changes can take up to 48 hours, but usually happen within minutes.
2.  **Verify A Record:**
    ```bash
    dig ahmedalderai.com +short
    # Expected: 76.76.21.21
    ```
3.  **Verify WWW Redirect:**
    Visit `http://www.ahmedalderai.com` in a browser. It should redirect to `https://ahmedalderai.com`.
4.  **Verify Email:**
    Send a test email to `contact@ahmedalderai.com` and confirm receipt.

## 5. Codebase References

The following files rely on this configuration. If the domain changes, update these:

- `astro.config.mjs` (`site` property)
- `vercel.json` (redirect rules)
- `src/pages/rss.xml.ts` (channel metadata)
- `src/components/features/CommandPalette.tsx` (clipboard data)
- `public/og-default.svg` (visual asset)

## 6. Post-Launch

- **Sitemap:** Automatically generated at `https://ahmedalderai.com/sitemap-index.xml` (or `/sitemap-0.xml`).
- **Robots.txt:** Ensure it points to the correct sitemap URL.
