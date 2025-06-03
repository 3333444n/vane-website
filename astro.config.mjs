// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind({
      applyBaseStyles: false, // Let us control base styles
    })
  ],
  vite: {
    css: {
      devSourcemap: true,
    },
  },
  build: {
    inlineStylesheets: 'auto',
  },
  output: 'static',
  site: 'https://your-site.com', // Update this with your actual site URL
});