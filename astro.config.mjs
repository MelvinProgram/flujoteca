// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // TODO: sustituir por el dominio real antes de desplegar (necesario para el sitemap y las etiquetas Open Graph)
  site: 'https://www.flujoteca.es',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [sitemap()]
});