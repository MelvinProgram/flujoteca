# Plan: Conectar el formulario de contacto con HubSpot

**Objetivo:** sustituir el envío genérico a webhook (`PUBLIC_CONTACT_WEBHOOK_URL`,
nunca configurado en producción) por un envío directo a la API pública de
envíos de formularios de HubSpot, manteniendo el formulario HTML actual
(`ContactForm.astro`) tal cual está diseñado — mismos campos, mismo estilo,
mismo comportamiento de error/éxito en español —, cambiando únicamente el
destino y la forma del payload.

**Decisión de arquitectura (ya tomada con el usuario):** el sitio sigue sin
backend. El POST se hace directamente desde el navegador contra el endpoint
público y no autenticado de HubSpot
(`api.hsforms.com/submissions/v3/integration/submit/{portalId}/{formGuid}`).
No hace falta ninguna clave de API ni token: `portalId` y `formGuid` no son
secretos — mismo modelo de confianza que el slug público de Cal.com en
`plans/01-sistema-reservas-diagnostico.md`. No se usa el SDK
`hbspt.forms.create()` de HubSpot (formulario embebido con su propio
estilo, cargando un script externo) — seguimos con el formulario HTML
propio del sitio, solo cambia a dónde y cómo se envían los datos.

**Fuera de alcance:** Google Sheets, el widget de reservas de Cal.com
(`plans/01-...md`, funcionalidad independiente, no implementada todavía) y
la sección "Pendiente antes de publicar" del `README.md`.

---

## Fase 0 — Documentación consultada (ya completada)

API confirmada: **HubSpot Forms Submission API v3**.

- Endpoint: `POST https://api.hsforms.com/submissions/v3/integration/submit/{portalId}/{formGuid}`,
  `Content-Type: application/json`. Público, sin autenticación — no
  requiere API key ni Private App Token.
- Cuerpo: `{ fields: [{ name, value }, ...], context: { pageUri, pageName, hutk? }, legalConsentOptions?: {...} }`.
- `legalConsentOptions.consent` (consentimiento explícito):
  `{ consentToProcess: boolean, text: string }`.
- Las propiedades de contacto por defecto de HubSpot son `firstname` /
  `lastname` (no existe una propiedad "nombre completo" por defecto).

**Anti-patrones y puntos a verificar:**
- ❌ No usar `hbspt.forms.create()` / el script embebido `js.hsforms.net`.
- ❌ No añadir ningún Private App Token ni API key al código — el endpoint
  de envíos v3 no lo necesita. No usar la API de CRM autenticada
  (`api.hubapi.com/crm/v3/objects/contacts`) — esa sí requiere un token
  secreto y no debe vivir en código cliente de un sitio sin backend.
- ⚠️ **Incertidumbre real, no resoluble sin el formulario creado:** si el
  formulario de HubSpot tiene activado el consentimiento GDPR, la API
  **exige** `legalConsentOptions`; si no lo tiene activado, enviarlo puede
  devolver un 400. Se resuelve en la Fase 1 y se aplica en la Fase 3 como
  flag condicional, no como suposición.
- ⚠️ **Los nombres internos de los campos no son adivinables de
  antemano.** `email`, `phone`, `company`, `firstname`, `lastname` suelen
  coincidir con las propiedades por defecto de HubSpot, pero no hay
  garantía; `message` no es una propiedad por defecto en absoluto — hace
  falta crear una propiedad personalizada y anotar el nombre interno que
  HubSpot le asigna.
- ⚠️ **`hutk` (cookie `hubspotutk`) casi seguro estará vacío en este
  sitio**, porque el script de tracking de HubSpot (`js.hs-scripts.com`)
  no está instalado (fuera de alcance de este plan). Leer la cookie de
  forma defensiva y omitir `hutk` si no existe.

**Decisión de diseño resuelta (nombre → firstname/lastname):** el
formulario mantiene un único campo `name` (no se toca el HTML de
`ContactForm.astro`). El script de envío separa ese valor por el primer
espacio en `firstname`/`lastname`. Se descarta pedir una propiedad
personalizada "Nombre completo" en HubSpot porque evita un paso manual
extra y usa las propiedades estándar de HubSpot. Contrapartida aceptada:
nombres de una sola palabra dejan `lastname` vacío — por eso la Fase 1
indica no marcar "Apellidos" como obligatorio.

---

## Fase 1 — Crear el formulario en HubSpot (tarea manual del usuario)

**Esta fase la debe hacer la persona usuaria, no el agente** — ya tiene
cuenta/portal de HubSpot, pero el formulario específico para este sitio
todavía no existe, y crearlo implica decisiones de nomenclatura dentro de
la UI de HubSpot que no se pueden adivinar desde fuera.

Checklist:

- [ ] Crear un formulario nuevo de tipo **"Insertado" / "Regular"** (no
      "Pop-up", no "En un correo electrónico"). No hace falta insertarlo
      visualmente en ninguna página — solo se usa como destino de envíos
      vía API, el formulario visible del sitio sigue siendo el HTML propio
      de `ContactForm.astro`.
- [ ] Añadir estos campos (reutilizando propiedades de contacto por
      defecto de HubSpot donde exista):
  - **Nombre de pila** (`firstname`) — obligatorio.
  - **Apellidos** (`lastname`) — **no** obligatorio (ver justificación en
        Fase 0).
  - **Email** (`email`) — obligatorio.
  - **Teléfono** (`phone`) — opcional.
  - **Nombre de la empresa** (`company`) — opcional.
  - **Mensaje** — crear una propiedad de contacto **personalizada**, tipo
        "Área de texto multilínea", añadirla al formulario. Anotar el
        **nombre interno** exacto (al pasar el cursor sobre el campo en el
        editor del formulario, o en Configuración → Propiedades →
        columna "Nombre interno").
- [ ] En "Consentimiento y privacidad" (GDPR / Data privacy consent) del
      editor: decidir/anotar si se activa. Si se activa, elegir
      "Consentimiento explícito" (checkbox) con un texto legal equivalente
      al que ya usa el sitio (`contactForm.consent.text` +
      `consent.linkLabel` en `src/content/site.ts`). Esta casilla de
      HubSpot no se renderiza en el sitio — solo determina si la API
      exige `legalConsentOptions`.
- [ ] Publicar el formulario (estado activo, no borrador).
- [ ] Anotar el **Portal ID** (Hub ID): visible en la URL de HubSpot tras
      iniciar sesión, o en Configuración → Cuenta y facturación →
      Información de la cuenta.
- [ ] Anotar el **GUID del formulario**: en "Compartir"/"Insertar" del
      editor aparece el fragmento de embed con el `formId` (UUID).
- [x] Rellenar esta tabla con los nombres internos reales:

  | Campo del sitio (HTML) | Propiedad de HubSpot | Nombre interno confirmado |
  |---|---|---|
  | `name` (completo, sin dividir — el formulario no tiene "Last name") | First name | `firstname` |
  | `email` | Email | `email` |
  | `phone` | Phone number | `phone` |
  | `company` | Company name | `company` |
  | `message` | (propiedad personalizada) | `message` |

- [x] Confirmado: **consentimiento GDPR explícito NO activado** para este
      formulario → `gdprConsentEnabled: false` en `site.ts`.

Datos reales ya cargados en `src/content/site.ts` (`hubspot`):
`portalId: "147950631"`, `formGuid: "0d38920b-4077-4e74-8d99-6021133e92c7"`,
`hublet: "eu1"` (cuenta alojada en la UE — endpoint `api-eu1.hsforms.com`,
no el genérico `api.hsforms.com`).

**Pendiente de confirmar por el usuario:** que el formulario esté
**publicado** en HubSpot — el enlace de "Compartir" usado para obtener
estos datos incluía `_hsIsPreview=true&_hsAllowUnpublished=true`, que es
normal en ese enlace de preview del editor, pero conviene verificar en
HubSpot que el formulario quedó en estado publicado/activo antes de la
prueba real de la Fase final (si no, la API puede rechazar los envíos).

---

## Fase 2 — Configuración de contenido y retirada del webhook genérico

`src/content/site.ts` ya tiene el export `hubspot` con `portalId`,
`formGuid`, `gdprConsentEnabled` y `fieldMap`, todos marcados `// TODO:`
— rellenar con los datos anotados en la Fase 1.

`PUBLIC_CONTACT_WEBHOOK_URL` retirada de `.env.example`, `README.md` y
`CLAUDE.md` (eliminada, no dejada como fallback: una vez cableado HubSpot
no queda ningún camino de código que la use).

- [ ] Si la variable está configurada en Netlify (Site settings →
      Environment variables), es tarea manual del usuario borrarla ahí
      también — el agente no tiene acceso a esa configuración.

**Verificación:** `npm run build` no debe fallar tras añadir el export
`hubspot`.

---

## Fase 3 — Script de `ContactForm.astro`

El bloque `<script>` de `src/components/ContactForm.astro` construye el
payload de HubSpot a partir del mismo `FormData` que ya se recogía para el
webhook genérico: separa `name` en `firstname`/`lastname`, arma `fields`
según `hubspot.fieldMap` omitiendo los campos opcionales vacíos, lee
`hubspotutk` de forma defensiva, incluye `legalConsentOptions` solo si
`hubspot.gdprConsentEnabled` es `true`, y hace `POST` a
`https://api.hsforms.com/submissions/v3/integration/submit/{portalId}/{formGuid}`.
Los textos de UI (`submitLabel`, `submittingLabel`, `successMessage`,
`errorMessage`) se leen de `contactForm` en `site.ts` en vez de un objeto
`LABELS` duplicado.

**Guardas anti-patrón:** no cargar ningún script externo de HubSpot; no
añadir ningún token/API key al fetch; no enviar `legalConsentOptions` de
forma incondicional.

**Verificación:** `npm run build` sin errores de TypeScript.

---

## Fase final — Verificación

- [ ] `npm run build` sin errores.
- [ ] `grep -r "PUBLIC_CONTACT_WEBHOOK_URL" .` (excluyendo `node_modules`,
      `dist`) — sin resultados.
- [ ] `grep -r "hbspt.forms.create\|js.hsforms.net" src/` — sin
      resultados.
- [ ] Con `hubspot.portalId`/`formGuid`/`fieldMap` reales (Fase 1
      completada), probar manualmente en el navegador:
  - Enviar el formulario con todos los campos rellenos → comprobar en
    HubSpot (Contacts) que aparece el contacto nuevo con `firstname`,
    `lastname`, `email`, `phone`, `company` y el mensaje en la propiedad
    personalizada, todos con los valores correctos.
  - Enviar el formulario con un nombre de una sola palabra → confirmar que
    no falla (`lastname` vacío es el comportamiento esperado).
  - Si `gdprConsentEnabled` es `true`: confirmar que el envío no devuelve
    400 por consentimiento.
  - Provocar un error a propósito (p. ej. `formGuid` temporalmente
    incorrecto) → confirmar que el formulario sigue mostrando el mensaje
    de error en español y no rompe la página; revertir después.
- [ ] `git diff` final: revisar que no se ha añadido ningún API key, token
      privado ni secreto de HubSpot al código (solo `portalId` y
      `formGuid`, que no lo son).
