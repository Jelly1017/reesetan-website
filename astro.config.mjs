// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: 'server', // SSR — needed for /admin and form submissions
  adapter: vercel(),
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }), // We use our own globals.css
  ],
  site: 'https://reesetan.com',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
    routing: { prefixDefaultLocale: false, redirectToDefaultLocale: false },
  },
  vite: {
    ssr: {
      noExternal: ['lucide-react'],
    },
  },
});
