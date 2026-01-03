# Contributing Guidelines

Thanks for your interest in contributing to this project! This document outlines the standards and workflow to keep the codebase healthy and contributions smooth.

---

## 1) Code of Conduct

We are committed to fostering a welcoming and respectful community. By participating, you agree to:

- Be respectful and considerate in all interactions.
- Use inclusive language and be mindful of differing perspectives.
- Give and accept constructive feedback gracefully.
- Avoid harassment, discrimination, or personal attacks.

If you experience or witness unacceptable behavior, please report it by opening a confidential issue or contacting the maintainer directly.

---

## 2) How to Submit Issues

Please submit issues for bugs, feature requests, or documentation improvements.

**Before opening an issue:**

- Search existing issues to avoid duplicates.
- Verify the issue on the latest `main` branch.
- Provide a clear, descriptive title.

**Include the following details when possible:**

- Steps to reproduce
- Expected vs. actual behavior
- Environment details (OS, browser, Node version)
- Relevant logs, screenshots, or stack traces

---

## 3) Pull Request Process

1. **Fork and clone** the repository.
2. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feat/short-description
   ```
3. **Make your changes** with clear, focused commits.
4. **Run checks** (lint/build/tests if available).
5. **Open a PR** with a detailed description of changes and rationale.
6. **Respond to reviews** and update your PR as needed.

**PR requirements:**

- One focused change per PR.
- No unrelated formatting or refactors unless necessary.
- Keep PRs reasonably small and easy to review.

---

## 4) Code Style Guidelines (Prettier, ESLint)

This project uses **Prettier** for formatting and **ESLint** for linting.

- Run formatting before committing:
  ```bash
  npm run format
  ```
- Run lint checks:
  ```bash
  npm run lint
  ```

**General style expectations:**

- Use TypeScript and explicit types for props, state, and function returns.
- Avoid `any`; use `unknown` with type guards if needed.
- Prefer async/await over callbacks.
- Keep components functional and accessible.

---

## 5) Commit Message Conventions

Use clear, consistent commit messages to improve changelog quality and review clarity. Recommended format:

```
<type>(scope): short summary
```

**Examples:**

- `feat(ui): add hero section animation`
- `fix(api): handle empty response errors`
- `docs(readme): update setup instructions`

**Common types:**

- `feat` — new feature
- `fix` — bug fix
- `docs` — documentation changes
- `refactor` — code changes that don’t add features or fix bugs
- `test` — test additions or changes
- `chore` — tooling or maintenance

---

## 6) Development Setup

### Prerequisites

- Node.js (latest LTS recommended)
- npm (or compatible package manager)

### Install

```bash
npm install
```

### Run the project

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Lint & format

```bash
npm run lint
npm run format
```

---

Thanks again for contributing!

Signed,
Ahmed Adel Bakr Alderai
