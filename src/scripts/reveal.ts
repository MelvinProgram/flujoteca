/**
 * Entrada de secciones al hacer scroll (GSAP ScrollTrigger) para `.reveal`.
 * El estado oculto inicial lo pone global.css (`html.motion-pending .reveal`);
 * este script solo lo revela. Se reinicia en `astro:page-load` y limpia las
 * instancias anteriores en `astro:before-swap`. GSAP escribe estilos por CSSOM,
 * que la CSP (`style-src 'self'`) permite.
 */
const root = document.documentElement;
// El `y` inicial de global.css (translateY(60px)) debe coincidir con estos valores.
const REVEAL = {
  desktop: { start: "top 85%", y: 60, duration: 1.8, stagger: 0.2 },
  mobile: { start: "top 90%", y: 60, duration: 1.8, stagger: 0.2 },
} as const;
let batches:{ kill: () => void }[] = [];
let starting = false;

async function init() {
  if (batches.length || starting) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  starting = true;

  try {
    const [{ gsap }, { ScrollTrigger }] = await Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]);
    gsap.registerPlugin(ScrollTrigger);

    // Móvil (< 768 px): el scroll táctil es nativo (Lenis sin syncTouch), así que
    // el reveal compensa disparándose antes (top 90 %). Desktop no cambia.
    const { start, y, duration, stagger } = matchMedia("(max-width: 767px)").matches
      ? REVEAL.mobile
      : REVEAL.desktop;

    batches = ScrollTrigger.batch(gsap.utils.toArray<HTMLElement>(".reveal"), {
      start,
      once: true,
      onEnter: (els) => {
        gsap.fromTo(
          els,
          { opacity: 0, y },
          { opacity: 1, y: 0, duration, ease: "power3.out", stagger, overwrite: true },
        );
      },
    });
    root.classList.add("motion-ready");
  } catch {
    // Si algo falla, el contenido nunca debe quedar oculto
    root.classList.remove("motion-pending");
  } finally {
    starting = false;
  }
}

async function destroy() {
  batches.forEach((t) => t.kill());
  batches = [];
  root.classList.remove("motion-ready");
  const { ScrollTrigger } = await import("gsap/ScrollTrigger");
  ScrollTrigger.getAll().forEach((t) => t.kill());
}

document.addEventListener("astro:page-load", init);
document.addEventListener("astro:before-swap", destroy);
init();
