# 90-Day Roadmap: Ahmed AI Portfolio

**Date:** January 4, 2026
**Version:** 1.0.0
**Status:** Pre-Launch

This roadmap outlines the strategic direction for the Ahmed AI Portfolio, moving from immediate launch blockers to long-term growth and feature expansion.

---

## Phase 1: Immediate Launch (Days 1-7)

**Goal:** A secure, stable, and verified public release.

### Day 1: Configuration & Security Activation (Critical)

- [ ] **Config:** Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to production environment.
- [ ] **Config:** Add `ANTHROPIC_API_KEY` to production.
- [ ] **Verify:** Run manual "Red Team" tests against the Chatbot to verify `src/pages/api/chat.ts` guardrails.
- [ ] **Verify:** Test Rate Limiting by triggering 429 errors (curl loop).

### Day 2: Quality Assurance & Testing

- [ ] **Tests:** Write unit tests for `src/lib/ratelimit.ts` and `src/lib/validators.ts`.
- [ ] **Tests:** Expand E2E suite to cover error boundaries and rate limit UI feedback.
- [ ] **i18n:** Manual verification of RTL layout (Mobile Menu, Command Palette) in Arabic.
- [ ] **SEO:** Fix `Schema.astro` URLs (LinkedIn/Twitter) to match Footer.

### Day 3: Final Polish & Deploy

- [ ] **Docs:** Update `README.md` with a "Security Features" section.
- [ ] **Content:** Final proofread of "Portfolio Launch" blog post.
- [ ] **Deploy:** Trigger production build on Vercel.
- [ ] **Audit:** Run final Lighthouse Performance & Accessibility check on prod URL.

---

## Phase 2: Post-Launch Stabilization (Weeks 2-4)

**Goal:** Monitor performance, fix user-reported issues, and establish content routine.

### Week 2: Monitoring & Quick Fixes

- **Analytics:** Verify Umami data flow (Pages, Events, Custom Events for Terminal commands).
- **Logs:** Monitor Vercel logs for unhandled exceptions or 500 errors in `api/chat`.
- **Feedback:** Watch for "Contact Me" submissions and address any immediate bugs.

### Week 3: Content & SEO Calibration

- **Blog:** Publish first technical deep-dive: "How I Built a Secure AI Chatbot with Astro & Redis".
- **SEO:** Check Google Search Console for indexing status and potential crawl errors.
- **Social:** Share portfolio on LinkedIn/Twitter (using `docs/launch/` templates).

### Week 4: Performance Tuning

- **Images:** Audit image optimization (AVIF/WebP) and LCP scores.
- **Bundle:** Analyze production bundle size; lazy load heavier components (e.g., `SecurityPlayground` if not already).
- **Caching:** Tune Vercel Edge Caching headers for static assets.

---

## Phase 3: Feature Expansion (Month 2)

**Goal:** Deepen engagement and showcase technical expertise.

### Weeks 5-6: Newsletter Integration

- **Backend:** Implement real `POST /api/newsletter` logic (currently likely a placeholder).
- **Integration:** Connect to a provider (ConvertKit/Substack API) or simple database collection.
- **UI:** Add a "Past Issues" archive page.

### Weeks 7-8: Interactive Features

- **Terminal:** Add new "secret" commands (e.g., `hack`, `coffee`, `sudo`).
- **Playground:** Add 2 new Prompt Injection levels to `SecurityPlayground`.
- **Blog:** Add "Copy Code" button statistics (track which snippets are most popular).

---

## Phase 4: Growth & Scaling (Month 3)

**Goal:** Build community authority and advanced technical demonstrations.

### Weeks 9-10: Advanced Security Showcase

- **Feature:** "Live Threat Map" (visualizing blocked prompt injection attempts - anonymized).
- **Feature:** WebAuthn / Passkey demo login (showcasing passwordless auth knowledge).

### Weeks 11-12: Community & Open Source

- **Project:** Open source the "Portfolio Kit" (stripping personal data) as a template for other security researchers.
- **Content:** Write a series on "DevSecOps for Frontend Engineers".
- **Review:** Quarterly Audit (Performance, Security, Content Strategy).

---

## Success Metrics

| Metric                   | Target (Day 90)         |
| :----------------------- | :---------------------- |
| **Monthly Visitors**     | 1,000+                  |
| **Chatbot Interactions** | 500+                    |
| **Newsletter Subs**      | 50+                     |
| **Lighthouse Score**     | 95+ (All Categories)    |
| **GitHub Stars**         | 50+ (on Portfolio Repo) |

---

## Immediate Next Actions (Today)

1. **Credentials:** Obtain and set Upstash Redis credentials in `.env`.
2. **Verification:** Confirm `checkRateLimit` actually blocks requests when config is present.
3. **Refactor:** Although implemented, `SecurityPlayground.tsx` is large (1024 lines). Schedule refactoring for Week 2 if not critical for launch.
