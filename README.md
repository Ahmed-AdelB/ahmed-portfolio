# Ahmed Adel - Personal Portfolio

A professional portfolio and personal website for Ahmed Adel, an AI Security Researcher and Python Open Source Contributor. This site showcases projects, blog posts, and open-source contributions.

Built with performance, accessibility, and modern web standards in mind.

## 🚀 Tech Stack

- **Framework:** [Astro 5.x](https://astro.build/) (Static Site Generation)
- **UI Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS 4.x](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Content:** MDX (Markdown + JSX) & JSON Content Collections
- **Deployment:** Vercel

## 🛠️ Getting Started

### Prerequisites

- Node.js (v20 or higher recommended)
- npm or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ahmed-portfolio.git
   cd ahmed-portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The site will be available at `http://localhost:4321`.

## 📂 Content Structure

This project uses [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) to manage content. All content is located in `src/content/`.

### 1. Blog Posts (`src/content/blog/`)
- **Type:** `content` (Markdown/MDX)
- **Schema:**
  ```typescript
  {
    title: string;          // Title of the post
    description: string;    // Short summary for SEO and previews
    pubDate: Date;          // Publication date
    updatedDate?: Date;     // Optional update date
    heroImage?: string;     // Optional cover image path (in public/)
    tags: string[];         // Array of tags
    draft: boolean;         // If true, will be hidden in production
  }
  ```

### 2. Projects (`src/content/projects/`)
- **Type:** `content` (Markdown/MDX)
- **Schema:**
  ```typescript
  {
    title: string;          // Project name
    description: string;    // Short description
    techStack: string[];    // Array of technologies used (e.g., ["Python", "React"])
    github?: string;        // URL to GitHub repo
    demo?: string;          // URL to live demo
    featured: boolean;      // If true, highlighted on the home page
    pubDate?: Date;         // Date for sorting
    heroImage?: string;     // Project screenshot or banner
  }
  ```

### 3. Contributions (`src/content/contributions/`)
- **Type:** `data` (JSON)
- **File Format:** `.json` files representing individual contributions.
- **Schema:**
  ```typescript
  {
    project: string;        // Name of the OSS project (e.g., "pandas")
    title: string;          // Title of the PR or Issue
    type: "PR" | "Issue" | "Review" | "Other";
    pr_url: string;         // URL to the contribution
    impact: string;         // Description of the impact/change
    date: Date;             // Date of contribution
    status: "Merged" | "Open" | "Closed" | "Draft";
    additions?: number;     // Lines added
    deletions?: number;     // Lines deleted
  }
  ```

## 📜 Scripts & Workflow

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the local development server. |
| `npm run build` | Builds the site for production into the `./dist` folder. |
| `npm run preview` | Previews the production build locally. |
| `npm run astro` | Runs Astro CLI commands (e.g., `astro doctor`). |

## 🌍 Environment Variables

Currently, no secret environment variables are required for the build process. 
The site URL is configured in `astro.config.mjs`:
- `site`: `https://ahmedadel.dev`

## 📦 Deployment

The project is configured for deployment on **Vercel**.

1. **Build Settings:**
   - Framework Preset: `Astro`
   - Build Command: `npm run build`
   - Output Directory: `dist`

2. **Configuration:**
   The `vercel.json` file handles specific Vercel configurations if needed.