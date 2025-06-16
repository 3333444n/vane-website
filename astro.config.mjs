// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind({
      applyBaseStyles: false, // Let us control base styles
    }),
  ],
  adapter: vercel({
    imageService: true,
  }),
  experimental: {
    responsiveImages: true,
  },
  vite: {
    css: {
      devSourcemap: true,
    },
  },
  build: {
    inlineStylesheets: 'auto',
  },
  site: 'https://your-site.com', // Update this with your actual site URL
});