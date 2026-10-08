/**
 * Eventos de conversión. No instala ni carga ninguna herramienta de analítica:
 * solo emite el evento en `window.dataLayer` (formato GTM/GA4) y como CustomEvent
 * "flujoteca:track". Mientras no exista un script de analítica, no sale nada del
 * navegador. Si se añade GA/GTM en el futuro, hará falta antes un sistema de
 * consentimiento de cookies coherente con ese script.
 */
type TrackParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(event: string, params: TrackParams = {}): void {
  try {
    (window.dataLayer ??= []).push({ event, ...params });
    window.dispatchEvent(new CustomEvent("flujoteca:track", { detail: { event, ...params } }));
  } catch {
    /* el tracking nunca debe romper la página */
  }
}

/** Escucha clics en [data-track] y en enlaces mailto:/tel:/WhatsApp. */
export function initClickTracking(): void {
  document.addEventListener("click", (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;

    const tracked = target.closest<HTMLElement>("[data-track]");
    if (tracked) {
      const { track: event, trackLabel } = tracked.dataset;
      if (event) track(event, trackLabel ? { label: trackLabel } : {});
    }

    const link = target.closest<HTMLAnchorElement>("a[href]");
    const href = link?.getAttribute("href") ?? "";
    if (href.startsWith("mailto:")) track("click_email");
    else if (href.startsWith("tel:")) track("click_phone");
    else if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)) track("click_whatsapp");
  });
}
