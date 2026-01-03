# Launch Analytics Setup

This document outlines the analytics strategy and setup for the launch of the Ahmed Adel Bakr Alderai portfolio. We will use a combination of Vercel Analytics for performance/privacy-friendly metrics and Google Analytics 4 (GA4) for deeper user behavior analysis, alongside specific tracking for our launch campaigns.

## 1. Vercel Analytics

Vercel Analytics provides real-time traffic insights and Web Vitals monitoring with zero configuration.

### Setup Instructions
1.  **Enable in Vercel Dashboard:**
    *   Go to the project settings in the Vercel dashboard.
    *   Navigate to the "Analytics" tab.
    *   Click "Enable".
2.  **Install Dependency:**
    *   Ensure the `@vercel/analytics` package is installed:
        ```bash
        npm install @vercel/analytics
        ```
3.  **Integrate in Code (Astro):**
    *   Add the analytics component to the main layout file (e.g., `src/layouts/Layout.astro`):
        ```astro
        ---
        import { Analytics } from '@vercel/analytics/react';
        ---
        <!-- ... existing head ... -->
        <body>
          <slot />
          <Analytics client:load />
        </body>
        ```

## 2. Google Analytics 4 (GA4)

GA4 will be used for detailed user journey tracking and conversion measurement.

### Setup Instructions
1.  **Create Property:**
    *   Create a new property in Google Analytics.
    *   Set up a Data Stream for "Web".
    *   Copy the Measurement ID (`G-XXXXXXXXXX`).
2.  **Environment Variable:**
    *   Add the ID to `.env`:
        ```
        PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
        ```
3.  **Integration (Astro):**
    *   Add the GA script to the `<head>` in `src/layouts/Layout.astro` using the `partytown` integration or a standard script tag if performance impact is acceptable.
        ```html
        <!-- Google tag (gtag.js) -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-XXXXXXXXXX');
        </script>
        ```

## 3. Social Media Tracking

We will track the performance of social media posts on LinkedIn, Twitter, Reddit, and Hacker News.

### Key Metrics to Track
*   **Impressions/Views:** Reach of the post.
*   **Engagements:** Likes, comments, reposts.
*   **Click-Through Rate (CTR):** Percentage of viewers who clicked the link.
*   **Referral Traffic:** Visitors coming from specific platforms (tracked via GA4).

## 4. UTM Parameters Strategy

To accurately track the source of traffic during the launch, all shared links must use UTM parameters.

### URL Builder Template
`https://ahmed-adel-portfolio.vercel.app/?utm_source={source}&utm_medium={medium}&utm_campaign=launch_v1&utm_content={content}`

### Defined Parameters

| Platform | Source (`utm_source`) | Medium (`utm_medium`) | Campaign (`utm_campaign`) | Content (`utm_content`) |
| :--- | :--- | :--- | :--- | :--- |
| **LinkedIn** | `linkedin` | `social` | `launch_v1` | `announcement_post` |
| **Twitter** | `twitter` | `social` | `launch_v1` | `thread_opener` |
| **Reddit** | `reddit` | `social` | `launch_v1` | `r_python_post` |
| **Hacker News** | `hackernews` | `social` | `launch_v1` | `show_hn` |
| **Email** | `newsletter` | `email` | `launch_v1` | `launch_announcement` |
| **Direct** | (none) | (none) | (none) | (none) |

---

**Signed:**
Ahmed Adel Bakr Alderai
