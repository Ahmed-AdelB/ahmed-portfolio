# Ahmed Adel - Portfolio

A professional portfolio and personal website showcasing projects, blog posts, and open-source contributions. Built with modern web standards, optimized for performance and accessibility.

## Tech Stack

- **Framework:** Astro 5.16 (Static Site Generation)
- **UI Library:** React 19 (islands architecture)
- **Styling:** Tailwind CSS 4
- **Content:** MDX (Markdown + JSX) & JSON
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Deployment:** Vercel

## Features

- **Dark/Light Theme Toggle** - User preference with persistent storage
- **Command Palette** - Quick navigation (Cmd+K / Ctrl+K)
- **RSS Feed** - Subscribe to blog updates
- **Blog** - MDX posts with automatic reading time estimates
- **Project Case Studies** - Detailed project showcases with tech stack
- **Open Source Contributions** - Gallery of significant OSS PRs and reviews
- **Contact Form** - Email integration via Formspree
- **SEO Optimized** - OG images, meta tags, and structured data
- **Sitemap & Robots.txt** - Search engine discoverability
- **Performance** - 100 Lighthouse scores, optimized images

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm

### Installation

```bash
git clone <repository-url>
cd ahmed-portfolio
npm install
```

### Development

```bash
npm run dev
```

Site runs at `http://localhost:4321`

### Build & Preview

```bash
npm run build
npm run preview
```

## Content Structure

Content is managed using [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) in `src/content/`:

### Blog Posts (`src/content/blog/`)

MDX format with frontmatter:

```yaml
title: Article Title
description: SEO summary
pubDate: 2024-01-01
tags: [tag1, tag2]
draft: false
```

### Projects (`src/content/projects/`)

MDX format showcasing work:

```yaml
title: Project Name
description: Brief overview
techStack: [Python, React]
github: https://github.com/...
demo: https://...
featured: true
```

### Contributions (`src/content/contributions/`)

JSON files documenting open source work:

```json
{
  "project": "pandas",
  "title": "PR description",
  "type": "PR",
  "pr_url": "https://github.com/...",
  "impact": "What changed",
  "date": "2024-01-01",
  "status": "Merged"
}
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run astro` | Run Astro CLI commands |
| `npm run pre-launch` | Run launch-day checks (build, links, Lighthouse, headers) |

## Deployment

Auto-deploys to Vercel on push to main branch.

**Configuration:**
- Framework: Astro
- Build: `npm run build`
- Output: `dist`
- Domain: `ahmedalderai.com`

**Environment:**
- Site URL: `https://ahmedalderai.com` (configured in `astro.config.mjs`)
- No secret env vars required for build

## Launch Day

See `LAUNCH_DAY.md` for the full checklist.
