/**
 * Scroll suave con Lenis, sincronizado con el ticker de GSAP/ScrollTrigger.
 * Se inicializa en `astro:page-load` (y de inmediato si no hay ClientRouter,
 * que es cuando ese evento no se dispara) y se limpia en `astro:before-swap`.
 * Con `prefers-reduced-motion: reduce` no hace nada: scroll nativo.
 */
import type Lenis from "lenis";

let lenis: Lenis | null = null;
let tick: ((time: number) => void) | null = null;
let starting = false;

async function init() {
  if (lenis || starting) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  starting = true;

  const [{ default: LenisCtor }, { gsap }, { ScrollTrigger }] = await Promise.all([
    import("lenis"),
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);
  gsap.registerPlugin(ScrollTrigger);

  lenis = new LenisCtor({
    duration: 2.2,
    easing: (t: number) => (t === 1 ? 1 : 1 - 2 ** (-10 * t)), // expo.out
    anchors: { offset: -64 }, // altura del header sticky (h-16)
    autoRaf: false,
  });
  lenis.on("scroll", ScrollTrigger.update);
  tick = (time) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  starting = false;
}

async function destroy() {
  if (tick) {
    const { gsap } = await import("gsap");
    gsap.ticker.remove(tick);
    tick = null;
  }
  lenis?.destroy();
  lenis = null;
}

document.addEventListener("astro:page-load", init);
document.addEventListener("astro:before-swap", destroy);
init();
