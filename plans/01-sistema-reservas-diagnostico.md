# Plan: Sistema de reservas para sesiones de diagnóstico

**Objetivo:** sustituir el formulario de contacto genérico (que solo envía un
webhook) por un sistema de reservas real, donde el visitante elige una franja
horaria concreta para la sesión de diagnóstico gratuita de 30 minutos.

**Decisión de arquitectura (ya tomada con el usuario):** integrar el widget
embebido de **Cal.com** (modo *inline*), en lugar de construir un backend de
reservas propio. El sitio sigue siendo 100% estático (Astro, sin backend,
desplegable en Netlify/Vercel) — Cal.com gestiona franjas horarias,
solapamientos, confirmaciones por email y sincronización de calendario del
lado de su propia plataforma. Ninguna clave de API es necesaria: el embed
usa únicamente un slug público (`usuario/tipo-de-evento`), seguro de dejar
en el código cliente.

**Diseño de producto (decisión tomada en este plan, revisable):** el widget
de reservas pasa a ser la acción principal de la sección final (donde hoy
vive `ContactForm`). El formulario de contacto actual se reduce a un bloque
secundario y compacto ("¿Prefieres escribirnos primero?") para quien no
quiere reservar directamente. Todos los CTA del sitio ("Solicita tu
diagnóstico gratuito") siguen apuntando al mismo ancla (`#contacto`), sin
romper enlaces existentes.

---

## Fase 0 — Documentación consultada (ya completada)

Investigación realizada contra el código fuente oficial de Cal.com
(`EmbedTabs.tsx`, `EmbedCodes.tsx`, `buildCssVarsPerTheme.ts`,
`types/index.d.ts` en github.com/calcom/cal.com) y su documentación de ayuda
(cal.com/help/embedding/*). Resumen de APIs permitidas — **no usar nada
fuera de esta lista sin volver a verificar contra el código fuente**:

- Script de carga: snippet vanilla-JS fijo (ver Fase 2, se copia literal,
  no se reescribe).
- `Cal("init", { origin: "https://cal.com" })` — una vez, antes de cualquier
  otra llamada.
- `Cal("inline", { elementOrSelector, calLink, config })` — modo elegido
  para este proyecto (embed dentro de la página, no popup ni botón
  flotante).
- `Cal("ui", { theme, cssVarsPerTheme, hideEventTypeDetails, layout })`
  — `theme`: `"auto" | "light" | "dark"`. `cssVarsPerTheme`:
  `{ light: {"cal-brand": "#hex"}, dark: {"cal-brand": "#hex"} }`.
  `layout`: `"month_view" | "week_view" | "column_view"`.
- `calLink` con formato `usuario/slug-evento` (público, no es secreto).

**Anti-patrones a evitar (confirmados por la investigación):**
- ❌ No usar `@calcom/embed-react` — es para React, este proyecto es Astro.
- ❌ No inventar claves de configuración (p. ej. no existe `borderRadius`
  documentado — solo `cal-brand` está confirmado como variable de color).
- ❌ No añadir ninguna API key de Cal.com al código — no hace falta para el
  embed público.
- ❌ No asumir integración oficial con Astro — **no existe documentación
  oficial ni de comunidad de Cal.com específica para Astro** (gap
  confirmado). Las fases 5 y 6 tratan la integración como "buenas prácticas
  generales de Astro para scripts de terceros", no como algo validado por
  Cal.com.

**Snippet completo verificado, listo para copiar** (ver Fase 2 para dónde
va exactamente):

```html
<div id="my-cal-inline" style="width:100%;height:100%;overflow:scroll"></div>

<script is:inline define:vars={{ CAL_LINK }}>
  (function (C, A, L) {
    let p = function (a, ar) { a.q.push(ar); };
    let d = C.document;
    C.Cal = C.Cal || function () {
      let cal = C.Cal;
      let ar = arguments;
      if (!cal.loaded) {
        cal.ns = {};
        cal.q = cal.q || [];
        d.head.appendChild(d.createElement("script")).src = A;
        cal.loaded = true;
      }
      if (ar[0] === L) {
        const api = function () { p(api, arguments); };
        const namespace = ar[1];
        api.q = api.q || [];
        if (typeof namespace === "string") {
          cal.ns[namespace] = cal.ns[namespace] || api;
          p(cal.ns[namespace], ar);
          p(cal, ["initNamespace", namespace]);
        } else p(cal, ar);
        return;
      }
      p(cal, ar);
    };
  })(window, "https://app.cal.com/embed/embed.js", "init");

  Cal("init", { origin: "https://cal.com" });

  Cal("inline", {
    elementOrSelector: "#my-cal-inline",
    calLink: CAL_LINK,
    config: { layout: "month_view" },
  });

  Cal("ui", {
    theme: "auto",
    cssVarsPerTheme: {
      light: { "cal-brand": "#0a5aa0" },
      dark: { "cal-brand": "#0a5aa0" },
    },
    hideEventTypeDetails: false,
    layout: "month_view",
  });
</script>
```

(Colores ya adaptados al token `senal` `#0a5aa0` de la identidad de marca
del proyecto — ver `src/styles/global.css`.)

---

## Fase 1 — Cuenta de Cal.com y tipo de evento (tarea manual del usuario)

**Esta fase la debe hacer la persona usuaria, no el agente** — crear una
cuenta en un servicio de terceros no es algo que un agente deba hacer en tu
nombre.

Checklist:

- [ ] Crear cuenta gratuita en cal.com (usuario/contraseña o SSO).
- [ ] Crear un tipo de evento "Diagnóstico gratuito" de 30 minutos.
- [ ] Configurar disponibilidad horaria (zona horaria Europe/Madrid).
- [ ] En "Booking questions" del tipo de evento, añadir los campos que hoy
      recoge el formulario y que Cal.com no pide por defecto: teléfono y
      empresa (nombre y email ya los pide Cal.com de serie).
- [ ] Copiar el slug resultante, formato `usuario/diagnostico-gratuito`.
- [ ] (Opcional) En Settings → Customization, configurar el color de marca
      de la cuenta a `#0a5aa0` para que la página de reserva standalone
      (fuera del embed) también coincida.

**Bloqueante:** las fases de código pueden escribirse con un slug de
marcador (`TODO-flujoteca/diagnostico-gratuito`), pero no se podrá probar
el flujo real de reserva hasta que este slug exista.

---

## Fase 2 — Configuración de contenido

**Qué implementar:** añadir el slug y textos del bloque de reserva a
`src/content/site.ts`, siguiendo el mismo patrón que el resto del archivo
(marcadores `// TODO:` para datos pendientes, igual que `site.contact`).

Añadir un nuevo export:

```ts
export const booking = {
  calLink: "TODO-flujoteca/diagnostico-gratuito", // TODO: sustituir por el slug real (ver plans/01-sistema-reservas-diagnostico.md, Fase 1)
  kicker: "RESERVA TU SESIÓN",
  title: "Elige el horario que mejor te venga",
  subtitle:
    "30 minutos, en el horario que prefieras. Recibirás la confirmación por email al instante.",
} as const;
```

**Verificación:** `npm run build` no debe fallar tras añadir este export
(no se usa todavía en ningún componente en esta fase).

---

## Fase 3 — Componente `BookingWidget.astro`

**Qué implementar:** copiar el snippet de la Fase 0 tal cual, dentro de un
nuevo componente `src/components/BookingWidget.astro`, envuelto con el
mismo lenguaje visual que el resto del sitio (kicker mono en mayúsculas,
título en Zilla Slab, tarjeta con `border border-borde bg-blanco`, igual
que `ContactForm`).

Puntos a seguir del snippet de la Fase 0, sin modificar la lógica interna:
- El bloque `<script>` debe llevar `is:inline` (evita que Astro procese/
  transforme el snippet — precaución general de Astro para scripts de
  terceros que dependen de `arguments`, no un requisito documentado por
  Cal.com, pero sí buena práctica).
- Usar `define:vars={{ CAL_LINK }}` para pasar `booking.calLink` desde el
  frontmatter del componente al script (esto es Astro estándar, no
  específico de Cal.com).
- Altura del contenedor: el `<div id="my-cal-inline">` necesita una altura
  explícita razonable (p. ej. `min-h-[600px]`) porque el snippet oficial
  solo trae `overflow:scroll`, no una altura fija — sin esto el iframe
  puede colapsar a 0px en algunos navegadores. Verificar visualmente en la
  Fase 8.

**Guardas anti-patrón:**
- No añadir ninguna clave de configuración a `Cal("ui", {...})` que no esté
  en la lista de Fase 0.
- No usar el modo `floatingButton` ni `data-cal-link` (popup/click) — este
  proyecto usa `inline` según la decisión de producto de este plan.

**Verificación:** el componente compila (`npm run build`); en dev, con un
slug de Cal.com real de prueba (o el de marcador, que mostrará un error de
Cal.com dentro del iframe pero no debe romper la página), la sección debe
ocupar el espacio reservado sin overflow horizontal.

---

## Fase 4 — Reducir `ContactForm` a bloque secundario

**Qué implementar:** mantener `ContactForm.astro` pero:
- Quitar el título grande "Solicita tu diagnóstico gratuito" (ese mensaje
  ahora lo lleva `BookingWidget`).
- Retitular como algo como "¿Prefieres escribirnos primero?" con un
  subtítulo breve.
- Mantener los campos y el envío al webhook tal cual están (no se toca la
  lógica de `fetch` ni las variables de entorno — sigue funcionando igual
  para quien no quiere reservar directamente).
- Reducir el ancho/prominencia visual respecto a `BookingWidget` (que pasa
  a ser el elemento principal de la sección).

Actualizar `src/content/site.ts` → `contactForm.title`/`subtitle` acorde a
este nuevo rol secundario.

**Verificación:** el formulario sigue enviando correctamente al webhook
(mismo comportamiento ya verificado en la implementación original, no debe
haber regresión — no re-probar la lógica de fetch, solo confirmar que el
formulario sigue siendo alcanzable y usable).

---

## Fase 5 — Ensamblar la sección `#contacto`

**Qué implementar:** en `src/pages/index.astro`, dentro de la sección con
`id="contacto"`, colocar `<BookingWidget />` como elemento principal
(arriba, más ancho) y `<ContactForm />` reducido debajo o al lado (decidir
en base a cómo se vea en la Fase 8 — probar primero apilado verticalmente,
es la opción más simple y robusta en móvil).

**No cambiar** el `id="contacto"` — todos los CTA existentes (`Header`,
`Hero`, `KitDigital`) ya apuntan a `#contacto` vía `nav.cta.href` /
`hero.cta.href` / `kitDigital.cta.href` en `site.ts`; mantener ese ancla
evita tener que tocar esos tres componentes.

**Verificación:** `npm run build`; clic en cualquier CTA del sitio
("Diagnóstico gratuito" en el header, hero, Kit Digital) debe desplazar a
la nueva sección con el widget de reserva visible.

---

## Fase 6 — Integración específica de Astro (buenas prácticas, no oficiales de Cal.com)

Esta fase existe porque la Fase 0 confirmó que **no hay documentación
oficial de Cal.com para Astro** — lo siguiente es buena práctica general,
no algo validado por Cal.com:

- Confirmar que el proyecto no usa Astro View Transitions
  (`<ClientRouter />` en `Layout.astro`) — **confirmado que no lo usa
  actualmente**. Si en el futuro se añaden, el script del embed necesitará
  re-ejecutarse en el evento `astro:page-load`; no implementar esto ahora,
  solo dejar la nota.
- Revisar `src/styles/global.css` por si algún selector global choca con
  el embed (problema real documentado en un issue de GitHub de Cal.com,
  no específico de Astro): ningún selector `cal-embed` ni `color-scheme`
  está definido en este proyecto actualmente — confirmar que sigue así
  tras la Fase 3.
- CSP: el proyecto no define actualmente cabeceras CSP (ni en
  `astro.config.mjs` ni en configuración de despliegue) — no hace falta
  cambiar nada ahora. Si en el futuro se añade CSP, permitir
  `script-src https://app.cal.com` y `frame-src https://cal.com`.

---

## Fase 7 — Accesibilidad y responsive

- El contenedor del iframe debe tener `width:100%` y una altura mínima
  fija (ver Fase 3) para que no colapse en móvil.
- El interior del iframe de Cal.com gestiona su propia accesibilidad
  (navegación por teclado, roles ARIA) — fuera del control de este
  proyecto; solo verificar que el `<div>` contenedor no tiene
  `overflow:hidden` que corte el foco del iframe al navegar con teclado.
- Movimiento reducido: las animaciones internas del calendario de Cal.com
  no son configurables desde el embed — anotar como limitación de
  contenido de terceros, no bloqueante.
- Verificar contraste del texto circundante (kicker, título, subtítulo del
  nuevo bloque) reutilizando las combinaciones de color ya validadas AA en
  el resto del sitio (`tinta`/`tinta-suave` sobre `hueso`) — no se
  introducen colores nuevos, así que no hace falta recalcular ratios.

---

## Fase final — Verificación

- [ ] `npm run build` sin errores.
- [ ] `grep -r "calLink" src/` — confirmar que el slug de Cal.com solo
      vive en `src/content/site.ts` (no hardcodeado en el componente).
- [ ] Con un slug de Cal.com real configurado (Fase 1 completada), probar
      manualmente: el calendario carga, se puede seleccionar un horario, y
      el flujo de confirmación de Cal.com se completa.
- [ ] Confirmar que los tres CTA del sitio (header, hero, Kit Digital)
      siguen desplazando correctamente a `#contacto`.
- [ ] Confirmar que el formulario de contacto reducido sigue enviando al
      webhook sin errores de consola.
- [ ] `git diff` final: revisar que no se ha añadido ninguna clave de API
      ni secreto de Cal.com al código.
