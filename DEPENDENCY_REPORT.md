# Dependency Health Report

**Date:** January 3, 2026
**Author:** Ahmed Adel Bakr Alderai

## 1. Executive Summary

The project dependencies are generally healthy, but there are critical actions required regarding unused packages that are introducing security vulnerabilities. Removing unused dependencies will resolve the highest severity issues immediately.

## 2. Security Vulnerabilities (npm audit)

**Status:** ⚠️ Requires Attention

- **High Severity:** `path-to-regexp` (ReDoS).
  - _Source:_ `@astrojs/vercel` dependency.
  - _Impact:_ Denial of service via malicious regex inputs.
  - _Fix:_ **Remove `@astrojs/vercel`**. Analysis confirms this project uses `output: "static"` in `astro.config.mjs` and does not import this adapter.
- **Moderate Severity:** `esbuild`.
  - _Source:_ `vite` (transitive via `vitest`).
  - _Impact:_ Development server request hijacking.
  - _Fix:_ Update `vitest` to `^4.0.0` (Major version update).

## 3. Unused Dependencies

**Status:** ⚠️ Cleanup Needed

The following packages are installed but not used in the codebase:

- **`@astrojs/vercel`**: Confirmed unused. Removing this fixes the High severity vulnerability.
- **`@tailwindcss/vite`**: Commented out in `astro.config.mjs`. No `vite.config.ts` exists. Safe to remove.

## 4. Outdated Packages

**Status:** ℹ️ Updates Available

- **`vitest`**: `2.1.9` -> `4.0.16` (Major update required for security fix).
- **`@vitejs/plugin-react`**: `4.7.0` -> `5.1.2`.
- **`jsdom`**: `25.0.1` -> `27.4.0`.

## 5. License Compliance

**Status:** ❌ Missing Information

- **Issue:** The `package.json` file is missing a `license` field.
- **Action:** Add `"license": "MIT"` (or your preferred license) to `package.json`.

## 6. Bundle Size & Performance

**Status:** ✅ Good

- **Fonts:** Self-hosted via `@fontsource` (`jetbrains-mono`, `space-grotesk`, `ibm-plex-sans-arabic`). This is excellent for privacy and performance (no external Google Fonts requests).
- **UI Libraries:** `framer-motion` is the heaviest dependency but necessary for the requested animations. `lucide-react` is tree-shakeable and efficient.

## 7. Recommended Actions Plan

1.  **Remove Unused & Vulnerable Packages:**
    ```bash
    npm uninstall @astrojs/vercel @tailwindcss/vite
    ```
2.  **Add License:** Update `package.json` with a license field.
3.  **Update Test Utils:**
    ```bash
    npm install -D vitest@latest jsdom@latest
    ```
4.  **Verify:** Run tests (`npm test`) to ensure the `vitest` major update didn't break configurations.
