import { demoF03 as t } from "../../../content/demo-f03.ts";
import { generarPasos, normalizarConfig, resumir, ultimoCorreo, type PasoReintento } from "./reintentos.ts";

/**
 * Interfaz del simulador de reintentos. Estado mínimo: la configuración y cuántos
 * pasos se han revelado; todo lo demás se deriva de ahí. DOM con
 * createElement/textContent (sin innerHTML ni estilos en línea, por la CSP).
 */

const PASO_MS = 1600;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className = "", text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function q<T extends HTMLElement>(sel: string): T {
  const node = document.querySelector<T>(sel);
  if (!node) throw new Error(`Simulador de reintentos: falta ${sel}`);
  return node;
}

function minutos(min: number): string {
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")} min`;
}

export function initReintentosF03(): void {
  const form = q<HTMLFormElement>("#demo-retry-config");
  const steps = q<HTMLOListElement>("#demo-retry-steps");
  const mail = q<HTMLElement>("#demo-retry-mail");
  const live = q<HTMLElement>("#demo-retry-live");
  const bNext = q<HTMLButtonElement>("#demo-retry-next");
  const bPlay = q<HTMLButtonElement>("#demo-retry-play");
  const bReset = q<HTMLButtonElement>("#demo-retry-reset");

  const leer = () => {
    const v = (name: string) => (form.elements.namedItem(name) as HTMLSelectElement).value;
    return normalizarConfig({
      comportamiento: v("comportamiento"),
      intervalo: Number(v("intervalo")),
      maxReintentos: Number(v("maxReintentos")),
    });
  };

  let pasos: PasoReintento[] = generarPasos(leer());
  let reveladas = 0;
  let timer: number | null = null;

  const parar = () => {
    if (timer !== null) clearInterval(timer);
    timer = null;
    bPlay.textContent = t.reintentos.buttons.play;
  };

  function avanzar() {
    if (reveladas >= pasos.length) return parar();
    reveladas++;
    const p = pasos[reveladas - 1];
    live.textContent = `${t.reintentos.steps.day} ${p.dia}: ${p.titulo}. ${p.detalle}`;
    render();
    if (reveladas >= pasos.length) parar();
  }

  function reiniciar() {
    parar();
    reveladas = 0;
    live.textContent = "";
    render();
  }

  // Contenido del correo simulado: lo usan el panel lateral (escritorio) y el desplegable de cada paso (móvil).
  function correoNodos(p: PasoReintento): HTMLElement[] {
    if (!p.correo) return [];
    return [
      el("p", "font-mono text-xs font-semibold uppercase text-tinta", t.reintentos.email.note),
      el("p", "mt-2 text-xs text-tinta-suave", `${t.reintentos.email.to}: ${p.correo.para}`),
      el("p", "text-xs text-tinta-suave", `${t.reintentos.email.subject}: ${p.correo.asunto}`),
      el("pre", "mt-2 font-sans text-sm whitespace-pre-wrap text-tinta", p.correo.cuerpo),
    ];
  }

  function renderPaso(p: PasoReintento, i: number): HTMLElement {
    const hecho = i < reveladas;
    const actual = i === reveladas - 1;
    const final = p.final;
    // Nodo cuadrado, sin radio. Hecho: confirma; actual: señal; resultado "persona": tinta.
    const nodoColor = !hecho
      ? "border-borde bg-superficie"
      : actual && !final
        ? "border-senal bg-senal"
        : final === "persona"
          ? "border-tinta bg-tinta"
          : "border-confirma bg-confirma";

    const li = el("li", "relative border-l border-borde pb-6 pl-6 last:border-l-transparent last:pb-0");
    if (actual) li.setAttribute("aria-current", "step");
    li.append(el("span", `absolute top-1 -left-[7px] h-3.5 w-3.5 border ${nodoColor}`));

    const cab = el("div", "flex flex-wrap items-baseline gap-x-3 gap-y-1");
    cab.append(
      el("span", "font-mono text-xs text-tinta-suave", `${t.reintentos.steps.day} ${p.dia}`),
      el("h3", `font-sans text-base font-semibold ${hecho ? "text-tinta" : "text-tinta-suave"}`, p.titulo),
    );
    li.append(cab);

    if (hecho) {
      li.append(el("p", "mt-1 text-sm text-tinta-suave", p.detalle));
      if (p.ultimoAviso && p.plazo !== undefined) {
        li.append(el("p", "mt-1 text-sm font-medium text-urgencia-texto", `${t.reintentos.steps.lastDeadline} ${p.plazo}`));
      }
      if (p.correo) {
        // En pantallas pequeñas el panel lateral no cabe: el correo va dentro del paso,
        // abierto en el más reciente para que se vea justo al pulsar «Siguiente paso».
        const det = el("details", "mt-3 border border-dashed border-borde bg-superficie p-3 text-sm lg:hidden");
        det.open = actual;
        det.append(el("summary", "flex min-h-11 cursor-pointer items-center font-medium text-senal", t.reintentos.email.view), ...correoNodos(p));
        li.append(det);
      }
      if (final) {
        li.append(
          el(
            "p",
            `mt-2 inline-flex border px-2 py-0.5 font-mono text-xs uppercase ${
              final === "completo" ? "border-confirma text-confirma" : "border-tinta bg-tinta/10 font-semibold text-tinta"
            }`,
            t.reintentos.finals[final],
          ),
        );
      }
    } else {
      li.append(el("p", "mt-1 text-xs text-tinta-suave", t.reintentos.steps.pending));
    }
    return li;
  }

  function renderCorreo() {
    const paso = ultimoCorreo(pasos, reveladas);
    if (!paso?.correo) {
      mail.replaceChildren(el("p", "text-sm text-tinta-suave", t.reintentos.email.none));
      return;
    }
    mail.replaceChildren(...correoNodos(paso));
  }

  function render() {
    steps.replaceChildren(...pasos.map(renderPaso));
    renderCorreo();
    const r = resumir(pasos, reveladas);
    q("#demo-retry-avisos").textContent = String(r.avisos);
    q("#demo-retry-dias").textContent = String(r.dias);
    q("#demo-retry-minutos").textContent = minutos(r.minutosManuales);
    const fin = reveladas >= pasos.length;
    bNext.disabled = fin;
    bPlay.disabled = fin;
  }

  bNext.addEventListener("click", () => {
    parar();
    avanzar();
  });
  bPlay.addEventListener("click", () => {
    if (timer !== null) return parar();
    bPlay.textContent = t.reintentos.buttons.pause;
    avanzar();
    if (reveladas < pasos.length) timer = window.setInterval(avanzar, PASO_MS);
  });
  bReset.addEventListener("click", reiniciar);
  form.addEventListener("change", () => {
    pasos = generarPasos(leer());
    reiniciar();
  });
  form.addEventListener("submit", (e) => e.preventDefault());

  render();
}
