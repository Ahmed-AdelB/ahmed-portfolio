# Launch Day Checklist

Use this checklist on launch day to confirm the site is production-ready.

## 1) Pre-launch checks (local)

```bash
npm install
npm run pre-launch
```

The script performs:
- Build verification
- Link checking
- Lighthouse audit (report saved to `./lighthouse-report.html`)
- Security headers check

## 2) Pre-launch checks (production URL)

Run the same script against the live domain:

```bash
SITE_URL=https://ahmedalderai.com npm run pre-launch
```

Optional strict mode (fail on warnings):

```bash
STRICT=1 SITE_URL=https://ahmedalderai.com npm run pre-launch
```

## 3) Deployment

- Confirm the latest content is merged to `main`.
- Verify CI checks are green.
- Trigger the production deploy (Vercel auto-deploy on push).

## 4) Post-deploy validation

- Open the homepage and key pages (projects, blog, contact) in a private window.
- Check analytics and contact form submissions.
- Confirm `robots.txt` and `sitemap.xml` are accessible.
- Re-run Lighthouse on the production URL if needed.

## 5) Rollback plan

- If a critical issue appears, roll back to the previous Vercel deployment.
- Fix the issue on a branch, then redeploy.
