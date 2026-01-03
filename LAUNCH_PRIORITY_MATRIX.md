# LAUNCH PRIORITY MATRIX & IMPLEMENTATION SCHEDULE

**Project:** Ahmed AI Portfolio
**Date:** January 3, 2026
**Author:** Ahmed Adel Bakr Alderai

---

## 1. Launch Priority Matrix

| ID | Category | Priority | Task | Status | Notes |
|----|----------|----------|------|--------|-------|
| **S-01** | **Security** | **P0** | **Implement Rate Limiting** | *Pending* | Use Upstash Redis + Astro Middleware (per strategy). |
| **S-02** | **Security** | **P0** | **Prompt Injection Mitigation** | *Pending* | Input validation, Regex guardrails, System prompt hardening. |
| **S-03** | **Security** | **P0** | **Environment Config** | *Pending* | Secure `UPSTASH_*` keys and review `env.d.ts`. |
| **T-01** | **Testing** | **P1** | **Unit Testing Security Utils** | *Pending* | Vitest tests for guardrails and input validators. |
| **T-02** | **Testing** | **P1** | **E2E Smoke Suite** | *Pending* | Run full Playwright suite on production build. |
| **I-01** | **i18n** | **P1** | **RTL Layout Verification** | *Pending* | Manual check of Arabic pages (Nav, Footer, Forms). |
| **I-02** | **i18n** | **P1** | **Content Consistency** | *Pending* | Verify Arabic translation of new security warnings (if any). |
| **O-01** | **SEO** | **P2** | **Schema.org Fixes** | *Pending* | Fix inconsistent LinkedIn URLs and "Hypothetical" data. |
| **O-02** | **SEO** | **P2** | **Meta Tag Audit** | *Pending* | Verify `og:image` and `twitter:card` across all pages. |
| **D-01** | **Docs** | **P2** | **Update CONTRIBUTING.md** | *Ready* | Ensure it aligns with new security protocols (if needed). |
| **D-02** | **Docs** | **P2** | **Final README Update** | *Pending* | Update "Features" list with Security features. |

---

## 2. Day-by-Day Implementation Schedule

### **Day 1: Security Hardening (P0)**
**Goal:** Secure the public-facing API endpoints before traffic scales.

*   **Morning: Rate Limiting**
    *   [ ] Install `@upstash/ratelimit` & `@upstash/redis`.
    *   [ ] Create `src/lib/ratelimit.ts` utility.
    *   [ ] Implement `src/middleware.ts` to enforce limits on `/api/chat` and `/api/newsletter`.
*   **Afternoon: Prompt Injection Defense**
    *   [ ] Refactor `src/pages/api/chat.ts` to include `validateInput()` (Length, Type).
    *   [ ] Implement Regex Guardrails function (block "ignore instructions", "DAN", etc.).
    *   [ ] Harden `SYSTEM_PROMPT` in `src/lib/chatContext.ts` (XML tagging, refusal instructions).
*   **Evening: Security Verification**
    *   [ ] Manual "Red Teaming": Attempt to bypass guardrails locally.
    *   [ ] Verify Rate Limits: Curl loop to trigger 429 responses.

### **Day 2: Testing & Internationalization (P1)**
**Goal:** Ensure stability and inclusivity.

*   **Morning: Unit Testing**
    *   [ ] Write Vitest tests for `src/lib/ratelimit.ts` (mocking Redis).
    *   [ ] Write Vitest tests for `checkGuardrails()` regex logic.
*   **Afternoon: i18n & Layout**
    *   [ ] **RTL Audit:** Check Mobile Menu, Command Palette, and Chat UI in Arabic mode.
    *   [ ] **Fix Content:** Resolve the "LinkedIn URL" and "Domain" inconsistencies flagged in `PROOFREADING_REPORT.md`.
    *   [ ] **Image Placeholders:** Replace or verify accessible fallbacks for placeholders.
*   **Evening: Full Suite Run**
    *   [ ] Run `npm run test:e2e` (Playwright).
    *   [ ] Run `npm run check:links` (Link Checker).

### **Day 3: Polish, SEO & Documentation (P2)**
**Goal:** Finalize metadata and documentation for launch.

*   **Morning: SEO & Schema**
    *   [ ] Update `src/components/seo/Schema.astro`:
        *   Fix hardcoded LinkedIn URL.
        *   Ensure `Person` schema matches `resume.ts`.
    *   [ ] Audit `robots.txt` and `sitemap.xml`.
*   **Afternoon: Documentation**
    *   [ ] Update `README.md` with "Security" section.
    *   [ ] Verify `CONTRIBUTING.md` links and commands.
    *   [ ] Final proofread of `src/content/blog/portfolio-launch.mdx`.
*   **Evening: Pre-Launch Final Check**
    *   [ ] Production Build: `npm run build`.
    *   [ ] Local Preview: `npm run preview`.
    *   [ ] Performance Audit: Run Lighthouse on the local build.

---

### **3. Immediate Next Actions (for User)**

1.  **Approve this schedule.**
2.  **Provide Upstash Credentials** (URL & Token) for `.env`.
3.  **Authorize Start of Day 1 Tasks** (Security Implementation).

---

**Signed:**
Ahmed Adel Bakr Alderai
