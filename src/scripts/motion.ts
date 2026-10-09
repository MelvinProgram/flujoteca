/**
 * Movimiento de la página: scroll suave (Lenis) + entrada de bloques (GSAP).
 *
 * - Con `prefers-reduced-motion: reduce` no se carga nada: scroll nativo y
 *   contenido visible (el <head> ni siquiera añade `motion-pending`).
 * - El estado oculto inicial lo pone global.css (`html.motion-pending …`) para
 *   evitar parpadeo; este script solo lo revela. Los selectores de abajo deben
 *   coincidir con los de global.css.
 * - GSAP escribe estilos por CSSOM, que la CSP (`style-src 'self'`) permite.
 */
const BLOCKS =
  "main > section:not(#inicio) .container-page > :not(ul, ol, [data-reveal-group], .hidden)";
const ITEMS =
  "main > section:not(#inicio) .container-page > :is(ul, ol, [data-reveal-group]) > :not(.hidden)";

const root = document.documentElement;

async function init() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
    import("lenis"),
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);
  gsap.registerPlugin(ScrollTrigger);

  // --- Scroll suave ---------------------------------------------------------
  const lenis = new Lenis({
    duration: 1.6,
    easing: (t: number) => (t === 1 ? 1 : 1 - 2 ** (-10 * t)), // expo.out
    anchors: { offset: -64 }, // altura del header sticky (h-16)
    autoRaf: false,
  });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // --- Reveal al 85 % del viewport, una sola vez ----------------------------
  ScrollTrigger.batch(gsap.utils.toArray<HTMLElement>(`${BLOCKS}, ${ITEMS}`), {
    start: "top 85%",
    once: true,
    onEnter: (batch) => {
      gsap.fromTo(
        batch,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          // Escalonado de 0,15 s; con lotes grandes (chips) se acota a 0,6 s en total
          stagger: batch.length > 5 ? { amount: 0.6 } : 0.15,
          overwrite: true,
        },
      );
    },
  });

  (window as unknown as { __motionReady?: boolean }).__motionReady = true;
}

init().catch(() => {
  // Si algo falla, el contenido nunca debe quedar oculto
  root.classList.remove("motion-pending");
});
