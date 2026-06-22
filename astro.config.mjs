// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Update `site` to your production domain before deploying — it powers
// canonical URLs, sitemap.xml, RSS, and Open Graph tags.
export default defineConfig({
  site: 'https://vidya.example.com',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  build: {
    inlineStylesheets: 'auto',
  },
  image: {
    // Allow remote source images (e.g. from a future headless CMS / Unsplash).
    remotePatterns: [{ protocol: 'https' }],
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});
