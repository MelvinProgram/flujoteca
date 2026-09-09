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

## Formulario de contacto

El formulario envía los datos directamente desde el navegador a la API de
envíos de formularios de HubSpot (sin backend propio). La configuración
(`portalId`, `formGuid`, mapeo de campos) vive en `src/content/site.ts`
(`hubspot`) — ver `plans/02-contacto-hubspot.md` para el detalle completo
y los pasos manuales pendientes en HubSpot.

## Pendiente antes de publicar

- Revisión por un asesor legal de las cláusulas de `aviso-legal.astro`
  (condiciones de uso, propiedad intelectual) y `politica-privacidad.astro`:
  el texto ya no tiene marcadores `[Pendiente: ...]`, pero esas dos
  cláusulas concretas son redacción estándar generada por IA, no texto
  revisado por un abogado
- Completar el alta de actividad económica (autónomo o sociedad) y
  actualizar `site.nif` / `site.legalName` en `src/content/site.ts` si la
  titularidad de Flujoteca cambia de persona física a autónomo/sociedad
