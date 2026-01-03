# Performance Audit Report

**Date:** January 3, 2026
**Project:** ahmed-portfolio
**Auditor:** Ahmed Adel Bakr Alderai

---

## Executive Summary

This document provides a comprehensive performance audit of the ahmed-portfolio website built with Astro. The audit analyzes bundle sizes, font loading, Core Web Vitals considerations, and provides actionable recommendations for optimization.

### Overall Assessment: **Good with Opportunities for Improvement**

| Category | Status | Notes |
|----------|--------|-------|
| Bundle Size | Needs Attention | ~400KB total JS |
| Font Loading | Good | Self-hosted, but many weights |
| Image Optimization | Excellent | Minimal images, optimized formats |
| CSS | Good | Tailwind purging active |
| SEO | Excellent | Complete meta tags, schema markup |
| Accessibility | Excellent | Skip links, ARIA, focus management |

---

## 1. JavaScript Bundle Analysis

### Bundle Size Summary

| File | Size (Uncompressed) | Size (Gzip) | Component |
|------|---------------------|-------------|-----------|
| `client.*.js` | 182.74 KB | 57.61 KB | React + React-DOM |
| `proxy.*.js` | 112.23 KB | 36.97 KB | Framer Motion |
| `CommandPalette.*.js` | 58.55 KB | 19.25 KB | cmdk library |
| `SecurityPlayground.*.js` | 25.65 KB | 7.02 KB | Security demo |
| `ClientRouter.*.js` | 15.33 KB | 5.27 KB | View Transitions |
| `AIChatbot.*.js` | 12.20 KB | 4.72 KB | AI Chat interface |
| Other components | ~50 KB | ~15 KB | Various |
| **Total JavaScript** | **~456 KB** | **~146 KB** | - |

### Key Findings

1. **React Bundle (182.74 KB)**: The main React runtime is substantial but expected for an interactive site.

2. **Framer Motion (112.23 KB)**: Animation library adds significant weight. Consider:
   - Using CSS animations for simple transitions
   - Lazy loading animation-heavy components
   - Using lighter alternatives like `@motionone/dom` (~2.5KB)

3. **Command Palette (58.55 KB)**: The cmdk library is loaded on every page but only used when triggered.

### Recommendations

| Priority | Recommendation | Impact |
|----------|----------------|--------|
| High | Change `client:load` to `client:idle` for non-critical components | -50-100KB initial load |
| High | Lazy load CommandPalette on demand | -58KB initial load |
| Medium | Consider replacing Framer Motion with CSS animations | -112KB total |
| Medium | Code-split large page components | Better caching |
| Low | Enable Astro's experimental optimizations | ~10% improvement |

---

## 2. CSS Analysis

### Current State

| File | Size | Notes |
|------|------|-------|
| `about.*.css` | 65 KB | Main stylesheet (Tailwind output) |

### Observations

- **Tailwind CSS v4**: Using latest version with automatic purging
- **Print styles**: Comprehensive print media queries included
- **Dark mode**: Proper dark mode styling via class strategy
- **Terminal mode**: Special styling for terminal mode

### CSS Performance Features

- [x] Critical CSS inlined (Astro default)
- [x] Unused CSS purged (Tailwind)
- [x] No external CSS requests
- [x] CSS-in-JS avoided for performance

---

## 3. Font Loading Strategy

### Current Fonts

| Font | Weights | Files | Total Size |
|------|---------|-------|------------|
| Space Grotesk | 300, 400, 500, 600, 700 | 10 files | ~160 KB |
| JetBrains Mono | 400, 500, 600 | 6 files | ~100 KB |
| **Total** | **8 weights** | **16 files** | **~260 KB** |

### Font Loading Features

- [x] Self-hosted fonts (no external requests)
- [x] WOFF2 format (best compression)
- [x] Fallback fonts configured
- [ ] Font subsetting not applied
- [ ] font-display not explicitly set (uses default)

### Recommendations

| Priority | Recommendation | Savings |
|----------|----------------|---------|
| High | Reduce to 3-4 weights (400, 500, 700) | ~100 KB |
| Medium | Add `font-display: swap` for faster LCP | Improved LCP |
| Low | Subset fonts for Latin only | ~30 KB |

---

## 4. Image Optimization

### Current State: **Excellent**

| Type | Count | Format | Status |
|------|-------|--------|--------|
| Favicons | 4 | PNG, SVG | Optimized |
| OG Image | 1 | SVG | Optimal |
| Logos directory | Empty | - | N/A |
| Blog placeholders | 1 | SVG | Optimal |

### Observations

- Minimal image usage (text-focused design)
- SVG used for graphics (scalable, small)
- PNG only for favicons (necessary)
- No large hero images to optimize

---

## 5. Core Web Vitals Analysis

### Estimated Scores (based on static analysis)

| Metric | Estimated | Target | Status |
|--------|-----------|--------|--------|
| LCP (Largest Contentful Paint) | ~2.0s | < 2.5s | Good |
| FID (First Input Delay) | ~50ms | < 100ms | Good |
| CLS (Cumulative Layout Shift) | ~0.05 | < 0.1 | Good |
| FCP (First Contentful Paint) | ~1.5s | < 1.8s | Good |
| TTFB (Time to First Byte) | ~100ms | < 200ms | Excellent |

### LCP Analysis

**Primary LCP Element**: Hero section heading

**Factors affecting LCP:**
1. Font loading (Space Grotesk must load first)
2. CSS blocking render
3. JavaScript execution

**Optimizations in place:**
- [x] FOUC prevention script (inline)
- [x] Critical CSS inlined
- [x] Self-hosted fonts
- [ ] Font preloading could be added

### FID/INP Analysis

**Interactive elements:**
- Theme toggle (React)
- Mobile navigation (React)
- Command palette (React)
- AI Chatbot (React)

**Current loading strategy:**
- All components use `client:load` (blocks interactivity)

**Recommendation:** Use `client:idle` or `client:visible` for:
- CommandPalette
- AIChatbot
- TerminalMode
- SecurityPlayground

### CLS Analysis

**Layout stability factors:**
1. Fixed header (correctly positioned)
2. Fonts (may cause shift on load)
3. Dynamic content (properly reserved)

**Current protections:**
- [x] Header spacer (h-16)
- [x] Font fallbacks configured
- [x] Fixed-height containers

---

## 6. Network Analysis

### Request Waterfall (estimated)

```
[0ms]   HTML document
[50ms]  CSS bundle
[100ms] Font files (parallel)
[150ms] JavaScript bundles (parallel)
[300ms] React hydration begins
[500ms] All components interactive
```

### Third-Party Resources

| Resource | Purpose | Impact |
|----------|---------|--------|
| Umami Analytics | Analytics (optional) | Deferred, minimal |
| Anthropic API | AI Chat | On-demand only |
| Calendly | Scheduling | Iframe, lazy |

---

## 7. Recommendations Summary

### High Priority (Immediate Impact)

1. **Lazy Load Non-Critical Components**
   ```astro
   <!-- Before -->
   <CommandPalette client:load />
   <AIChatbot client:load />

   <!-- After -->
   <CommandPalette client:idle />
   <AIChatbot client:visible />
   ```

2. **Reduce Font Weights**
   - Remove 300 and 600 weights if not essential
   - Keep 400, 500, 700 for most uses

3. **Add Font Preloading**
   ```html
   <link rel="preload" href="/fonts/space-grotesk-400.woff2" as="font" type="font/woff2" crossorigin>
   ```

### Medium Priority (Good to Have)

4. **Replace Framer Motion for Simple Animations**
   - Use CSS transitions for fade/slide effects
   - Keep Framer Motion only for complex animations

5. **Implement Dynamic Imports**
   ```typescript
   // Only load when needed
   const CommandPalette = await import('./CommandPalette');
   ```

6. **Enable Astro Image Optimization**
   - Configure @astrojs/image if adding more images
   - Use WebP/AVIF formats

### Low Priority (Future Optimization)

7. **Service Worker for Caching**
   - Cache static assets
   - Offline support

8. **Edge Caching Headers**
   - Configure Vercel Edge caching
   - Long cache times for static assets

---

## 8. Quick Wins Implemented

### Changes Made During Audit

1. **None during this audit** - This is a documentation-only audit to avoid breaking changes.

### Recommended First Actions

1. Change `client:load` to `client:idle` for:
   - CommandPalette
   - AIChatbot
   - TerminalMode

2. Add font-display: swap to prevent invisible text

3. Preload primary font weight

---

## 9. Monitoring Recommendations

### Tools for Ongoing Monitoring

| Tool | Purpose | Frequency |
|------|---------|-----------|
| PageSpeed Insights | Core Web Vitals | Monthly |
| WebPageTest | Detailed waterfall | Before releases |
| Lighthouse CI | Regression testing | Per PR |
| Vercel Analytics | Real User Metrics | Continuous |

### Performance Budget

| Metric | Budget | Current |
|--------|--------|---------|
| Total JS | < 300 KB | ~456 KB |
| Total CSS | < 100 KB | ~65 KB |
| LCP | < 2.5s | ~2.0s |
| TTI | < 3.8s | ~3.5s |

---

## 10. Conclusion

The ahmed-portfolio site is well-architected with many performance best practices already in place:

**Strengths:**
- Self-hosted fonts (no external font requests)
- Minimal image usage with optimized formats
- FOUC prevention
- Passive event listeners
- View Transitions API for smooth navigation
- Comprehensive print styles

**Areas for Improvement:**
- JavaScript bundle size (~456 KB total)
- Client hydration strategy (all components load immediately)
- Font weight reduction opportunity

**Estimated Improvement Potential:**
- Implementing all high-priority recommendations: **20-30% faster LCP**
- Full optimization: **40-50% reduction in initial JavaScript**

---

## Appendix: Build Output Reference

```
dist/_astro/client.*.js         182.74 KB (gzip: 57.61 KB)
dist/_astro/proxy.*.js          112.23 KB (gzip: 36.97 KB)
dist/_astro/CommandPalette.*.js  58.55 KB (gzip: 19.25 KB)
dist/_astro/about.*.css          65.00 KB (gzip: ~10 KB)
Total build size: 2.9 MB
```

---

*Report generated as part of GitHub Issue #179*
