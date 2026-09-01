# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Flujoteca — a single-page marketing site (in Spanish) for a process-automation
consultancy targeting asesorías/gestorías (Spanish accounting/admin firms) in
southern Madrid. Static Astro site, no backend, deployed to Netlify or Vercel.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

Other commands: `npm run build` (outputs to `./dist`), `npm run preview`. There
is no test suite or linter configured in this repo.

## Architecture

- **All site copy lives in `src/content/site.ts`**, not in components. Every
  section exports a typed `as const` object (`hero`, `problem`, `flows`,
  `howItWorks`, `kitDigital`, `contactForm`, `footer`, ...) that the matching
  component in `src/components/` imports and renders. To change any visible
  text, edit this file rather than the `.astro` components. Fields marked
  `// TODO:` are placeholders (contact info, real domain) still needed before
  launch.
- **`src/layouts/Layout.astro`** owns `<head>` — meta tags, canonical URL,
  Open Graph/Twitter cards, and a JSON-LD `LocalBusiness` schema.org block
  built from `site.contact`. `src/pages/index.astro` composes the page by
  stacking components (`Header`, `Hero`, `ProblemStats`, `FlowCatalog`,
  `HowItWorks`, `KitDigital`, `ContactForm`, `Footer`) inside `Layout`.
- **No backend.** `ContactForm.astro` posts form data directly from the
  browser to HubSpot's public Forms Submission API
  (`api.hsforms.com/submissions/v3/integration/submit/{portalId}/{formGuid}`).
  Config (`portalId`, `formGuid`, `gdprConsentEnabled`, `fieldMap`) lives in
  `src/content/site.ts` (`hubspot` export) — not `.env`, since these values
  aren't secrets and don't vary per environment. See
  `plans/02-contacto-hubspot.md` for the full design and the manual HubSpot
  setup steps still pending.
- **Design tokens** are defined once in `src/styles/global.css` under
  `@theme` (Tailwind v4 CSS-based config): brand colors (`tinta`, `senal`,
  `urgencia`, `hueso`, `confirma`, plus neutrals) and font families (Zilla
  Slab for display, Public Sans for body, IBM Plex Mono for labels/mono
  accents). Components reference these via Tailwind utility classes (e.g.
  `text-tinta`, `bg-hueso`, `font-display`) — don't hardcode hex colors or
  font-family strings in components. Fonts are self-hosted via Fontsource
  (no external font requests). Custom reusable utilities (e.g.
  `container-page`, `registro-stamp`) are also declared here via `@utility`.
- `astro.config.mjs` sets `site:` (the canonical domain, currently a
  placeholder) and registers `@astrojs/sitemap`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
