# Flujoteca

Landing page de una sola página para Flujoteca, consultoría de automatización de
procesos para asesorías y gestorías del sur de Madrid. Sitio estático (Astro +
Tailwind CSS), sin backend, pensado para desplegarse en Netlify o Vercel.

## Stack

- [Astro](https://astro.build) (output estático)
- Tailwind CSS v4
- Tipografía autoalojada: Archivo, Inter e IBM Plex Mono ([Fontsource](https://fontsource.org))
- `@astrojs/sitemap`

## Estructura

```
src/
  content/site.ts       # Todos los textos del sitio (editar aquí, no en los componentes)
  layouts/Layout.astro  # <head>, meta tags, Open Graph, schema.org
  components/           # Header, Hero, ProblemStats, FlowCatalog, HowItWorks,
                         # KitDigital, ContactForm, Footer
  pages/                # index.astro, aviso-legal.astro, politica-privacidad.astro
public/
  logo.png, favicon-*.png, og-image.png
  robots.txt
```

## Desarrollo

```sh
npm install
npm run dev       # http://localhost:4321
npm run build      # genera ./dist
npm run preview
```

## Variables de entorno

Copia `.env.example` a `.env` y configura:

- `PUBLIC_CONTACT_WEBHOOK_URL` — URL del webhook (Zapier, Make, n8n, etc.) al
  que el formulario de contacto envía los datos directamente desde el
  navegador (el sitio no tiene backend propio).

En Netlify/Vercel, configura la misma variable en los ajustes de entorno del
proyecto.

## Pendiente antes de publicar

- Datos de contacto reales en `src/content/site.ts` (`site.contact`)
- Dominio real en `astro.config.mjs` (`site`) y `public/robots.txt`
- Revisión legal de `aviso-legal.astro` y `politica-privacidad.astro`
  (contienen texto de marcador `[Pendiente: ...]`)
