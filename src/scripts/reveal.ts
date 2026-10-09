/**
 * Entrada de secciones al hacer scroll (GSAP ScrollTrigger) para `.reveal`.
 * El estado oculto inicial lo pone global.css (`html.motion-pending .reveal`);
 * este script solo lo revela. Se reinicia en `astro:page-load` y limpia las
 * instancias anteriores en `astro:before-swap`. GSAP escribe estilos por CSSOM,
 * que la CSP (`style-src 'self'`) permite.
 */
const root = document.documentElement;
let batches: { kill: () => void }[] = [];
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

    batches = ScrollTrigger.batch(gsap.utils.toArray<HTMLElement>(".reveal"), {
      start: "top 85%",
      once: true,
      onEnter: (els) => {
        gsap.fromTo(
          els,
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 1.8, ease: "power3.out", stagger: 0.2, overwrite: true },
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
