// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
// import tailwindcss from '@tailwindcss/vite';
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";

// https://astro.build/config
const isLighthouse = process.env.LIGHTHOUSE === "true";

export default defineConfig({
  site: "https://ahmedalderai.com",
  output: "static",
  // Disable adapter for Lighthouse runs to allow `astro preview`.
  ...(isLighthouse ? {} : { adapter: vercel() }),
  integrations: [react(), mdx(), sitemap()],

  // vite: {
  //   plugins: [tailwindcss()]
  // }
});
