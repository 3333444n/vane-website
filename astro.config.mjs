// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';
import imagemin from 'vite-plugin-imagemin';

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
    plugins: [
      imagemin({
        mozjpeg: {
          quality: 75,
        },
        pngquant: {
          quality: [0.65, 0.8],
        },
      }),
    ],
    css: {
      devSourcemap: true,
    },
  },
  build: {
    inlineStylesheets: 'auto',
  },
  site: 'https://your-site.com', // Update this with your actual site URL
});