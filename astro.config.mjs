// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://flujoteca.es',

  vite: {
    plugins: [tailwindcss()]
  },

  // Borrador sin revisión jurídica: no se indexa ni entra en el sitemap
  // La demo interactiva (/demo/) es noindex mientras sea una demo comercial
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/condiciones-contratacion") && !page.includes("/demo/"),
    }),
  ]
});