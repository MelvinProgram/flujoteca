import { demoF03 as t } from "../../../content/demo-f03.ts";
import { crearAlmacen } from "./store.ts";
import { calcularAhorro, calcularMetricas } from "./metrics.ts";
import {
  estadoDe,
  formatDia,
  formatReloj,
  puedeFinalizar,
  puedeMarcarRevision,
  puedeRecibir,
  puedeRecordar,
  puedeResolver,
  puedeSolicitar,
} from "./rules.ts";
import type { Correo, EstadoDemo, EstadoDocumento, EstadoExpediente, Evento, Expediente } from "./types.ts";

/**
 * Interfaz de la demo. Renderiza siempre desde el estado del almacén y construye
 * el DOM con createElement/textContent (nunca innerHTML), de modo que ningún
 * texto se interpreta como HTML. No hay red, correo ni almacenamiento local.
 */

type Filtro = "todos" | EstadoExpediente;

const BADGE: Record<EstadoExpediente, string> = {
  pendiente: "border-tinta-suave text-tinta-suave",
  parcial: "border-senal text-senal",
  completo: "border-confirma text-confirma",
  revision: "border-urgencia text-urgencia",
};
const DOC_BADGE: Record<EstadoDocumento, string> = {
  pendiente: "border-tinta-suave text-tinta-suave",
  recibido: "border-confirma text-confirma",
  dudoso: "border-urgencia text-urgencia",
};
const BTN =
  "inline-flex items-center border border-borde bg-superficie px-3 py-1.5 text-sm font-medium text-tinta transition-colors hover:border-senal hover:text-senal disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-borde disabled:hover:text-tinta";
const BTN_PRIMARY =
  "inline-flex items-center border border-tinta-fija bg-tinta-fija px-3 py-1.5 text-sm font-medium text-blanco transition-colors hover:border-senal hover:bg-senal disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-tinta-fija disabled:hover:bg-tinta-fija";

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = "",
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function q<T extends HTMLElement>(sel: string): T {
  const node = document.querySelector<T>(sel);
  if (!node) throw new Error(`Demo F-03: falta ${sel}`);
  return node;
}

function badge(text: string, cls: string): HTMLElement {
  return el("span", `inline-flex shrink-0 border px-2 py-0.5 font-mono text-[11px] uppercase ${cls}`, text);
}

function formatMinutos(min: number): string {
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")} min`;
}

export function initDemoF03(): void {
  const store = crearAlmacen();
  let filtro: Filtro = "todos";
  let busqueda = "";
  let seleccionado: string | null = null;

  const list = q<HTMLUListElement>("#demo-list");
  const detail = q<HTMLElement>("#demo-detail");
  const history = q<HTMLOListElement>("#demo-history");
  const live = q<HTMLElement>("#demo-live");
  const filtros = q<HTMLElement>("#demo-filters");

  /* ---------- Métricas ---------- */
  function renderMetricas(s: EstadoDemo) {
    const m = calcularMetricas(s);
    const set = (k: string, v: string) => (q(`#kpi-${k}`).textContent = v);
    set("pendientes", String(m.pendientes));
    set("completos", String(m.completos));
    set("enRevision", String(m.enRevision));
    set("solicitudes", String(m.solicitudes));
    set("recordatorios", String(m.recordatorios));
    set("minutos", formatMinutos(m.minutosManualesEstimados));
    set("duplicados", String(m.duplicadosEvitados));
    q("#demo-clock").textContent = formatReloj(s.ahora);
  }

  /* ---------- Filtros ---------- */
  function renderFiltros(s: EstadoDemo) {
    const m = calcularMetricas(s);
    const opciones: [Filtro, string, number][] = [
      ["todos", t.filters.all, s.expedientes.length],
      ["pendiente", t.states.pendiente, m.pendientes],
      ["parcial", t.states.parcial, m.parciales],
      ["completo", t.states.completo, m.completos],
      ["revision", t.states.revision, m.enRevision],
    ];
    filtros.replaceChildren(
      ...opciones.map(([valor, etiqueta, n]) => {
        const b = el(
          "button",
          `border px-3 py-1.5 text-sm transition-colors ${
            filtro === valor
              ? "border-tinta-fija bg-tinta-fija text-blanco"
              : "border-borde bg-superficie text-tinta hover:border-senal hover:text-senal"
          }`,
          `${etiqueta} (${n})`,
        );
        b.type = "button";
        b.dataset.key = `filter:${valor}`;
        b.setAttribute("aria-pressed", String(filtro === valor));
        b.addEventListener("click", () => {
          filtro = valor;
          render();
        });
        return b;
      }),
    );
  }

  /* ---------- Lista ---------- */
  function visibles(s: EstadoDemo): Expediente[] {
    const texto = busqueda.trim().toLowerCase();
    return s.expedientes.filter(
      (e) =>
        (filtro === "todos" || estadoDe(e) === filtro) &&
        (!texto || e.cliente.toLowerCase().includes(texto) || e.id.toLowerCase().includes(texto)),
    );
  }

  function renderLista(s: EstadoDemo) {
    const filas = visibles(s);
    if (filas.length === 0) {
      list.replaceChildren(el("li", "border border-borde bg-superficie p-4 text-sm text-tinta-suave", t.filters.empty));
      return;
    }
    list.replaceChildren(
      ...filas.map((e) => {
        const estado = estadoDe(e);
        const recibidos = e.documentos.filter((d) => d.estado === "recibido").length;
        const li = el("li");
        const b = el(
          "button",
          `grid w-full grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 border bg-superficie p-3 text-left transition-colors hover:border-senal sm:grid-cols-[5rem_1fr_auto_5rem] ${
            e.id === seleccionado ? "border-senal shadow-[2px_2px_0_0_var(--color-senal)]" : "border-borde"
          }`,
        );
        b.type = "button";
        b.dataset.key = `row:${e.id}`;
        if (e.id === seleccionado) b.setAttribute("aria-current", "true");
        b.append(
          el("span", "hidden font-mono text-xs text-tinta-suave sm:block", e.id),
          (() => {
            const w = el("span", "min-w-0");
            w.append(el("span", "block truncate font-medium text-tinta", e.cliente), el("span", "block text-xs text-tinta-suave", `${e.id} · ${e.tramite}`));
            return w;
          })(),
          badge(e.cerrado ? t.list.finished : t.states[estado], e.cerrado ? "border-confirma text-confirma" : BADGE[estado]),
          el("span", "hidden text-right font-mono text-xs text-tinta-suave sm:block", `${recibidos}/${e.documentos.length}`),
        );
        b.addEventListener("click", () => seleccionar(e.id));
        li.append(b);
        return li;
      }),
    );
  }

  /* ---------- Detalle ---------- */
  function ultimoCorreo(s: EstadoDemo, id: string): { correo: Correo; evento: Evento } | null {
    for (let i = s.historial.length - 1; i >= 0; i--) {
      const ev = s.historial[i];
      if (ev.expediente === id && ev.correo && ev.resultado === "ok") return { correo: ev.correo, evento: ev };
    }
    return null;
  }

  function accion(
    key: string,
    label: string,
    ok: boolean,
    fn: () => void,
    primary = false,
  ): HTMLButtonElement {
    const b = el("button", primary ? BTN_PRIMARY : BTN, label);
    b.type = "button";
    b.dataset.key = key;
    b.disabled = !ok;
    b.addEventListener("click", fn);
    return b;
  }

  function renderDetalle(s: EstadoDemo) {
    const exp = s.expedientes.find((e) => e.id === seleccionado);
    if (!exp) {
      detail.replaceChildren(el("p", "text-sm text-tinta-suave", t.detail.placeholder));
      return;
    }
    const estado = estadoDe(exp);
    const nodos: HTMLElement[] = [];

    const volver = el("button", "mb-3 text-sm text-senal underline underline-offset-2 lg:hidden", `← ${t.detail.back}`);
    volver.type = "button";
    volver.addEventListener("click", () => {
      q("#demo-list-section").scrollIntoView({ block: "start" });
      document.querySelector<HTMLElement>(`[data-key="row:${exp.id}"]`)?.focus();
    });
    nodos.push(volver);

    const cab = el("div", "flex flex-wrap items-start justify-between gap-2");
    const titulos = el("div", "min-w-0");
    const h = el("h3", "font-display text-xl font-bold text-tinta", exp.cliente);
    h.tabIndex = -1;
    h.id = "demo-detail-title";
    titulos.append(h, el("p", "mt-1 font-mono text-xs text-tinta-suave", `${exp.id} · ${exp.tramite}`));
    cab.append(titulos, badge(exp.cerrado ? t.list.finished : t.states[estado], exp.cerrado ? "border-confirma text-confirma" : BADGE[estado]));
    nodos.push(cab);

    if (estado === "revision") {
      const r = el("div", "mt-4 border border-urgencia p-3 text-sm");
      r.append(
        el("p", "font-mono text-[11px] uppercase text-urgencia", t.detail.reviewTitle),
        el("p", "mt-1 text-tinta", exp.motivoRevision ?? t.detail.reviewNote),
        el("p", "mt-1 text-xs text-tinta-suave", t.detail.reviewNote),
      );
      nodos.push(r);
    }

    // Documentos
    nodos.push(el("h4", "mt-5 font-mono text-[11px] uppercase tracking-wide text-senal", t.detail.docs));
    const docs = el("ul", "mt-2 divide-y divide-borde border border-borde");
    for (const d of exp.documentos) {
      const li = el("li", "flex flex-wrap items-start gap-x-3 gap-y-2 bg-superficie p-3");
      const info = el("div", "min-w-0 flex-1 basis-40");
      info.append(
        el("p", "text-sm text-tinta", d.nombre),
        el("p", "text-xs text-tinta-suave", d.estado === "pendiente" && exp.solicitado ? `${t.detail.due} ${formatDia(d.vencimiento)}` : ""),
      );
      li.append(info, badge(t.docStates[d.estado], DOC_BADGE[d.estado]));
      if (puedeRecibir(exp, d).ok) {
        // Los botones van en su propia fila para que el nombre del documento no se estreche
        const fila = el("div", "flex w-full flex-wrap gap-2");
        fila.append(
          accion(`recv:${d.id}`, t.actions.receive, true, () => ejecutar({ tipo: "recibir", expediente: exp.id, documento: d.id, dudoso: false })),
          accion(`recvd:${d.id}`, t.actions.receiveDoubt, true, () => ejecutar({ tipo: "recibir", expediente: exp.id, documento: d.id, dudoso: true })),
        );
        li.append(fila);
      }
      docs.append(li);
    }
    nodos.push(docs);

    // Acciones
    nodos.push(el("h4", "mt-5 font-mono text-[11px] uppercase tracking-wide text-senal", t.detail.actions));
    const vSol = puedeSolicitar(exp);
    const vRec = puedeRecordar(exp);
    const vFin = puedeFinalizar(exp);
    const vRev = puedeMarcarRevision(exp);
    const vRes = puedeResolver(exp);
    const barra = el("div", "mt-2 flex flex-wrap gap-2");
    barra.append(
      accion("act:solicitar", t.actions.request, vSol.ok, () => ejecutar({ tipo: "solicitar", expediente: exp.id })),
      accion("act:recordar", t.actions.remind, vRec.ok, () => ejecutar({ tipo: "recordar", expediente: exp.id })),
    );
    if (vRes.ok) {
      barra.append(
        accion("act:aprobar", t.actions.approve, true, () => ejecutar({ tipo: "resolver", expediente: exp.id, decision: "aprobar" })),
        accion("act:reclamar", t.actions.reclaim, true, () => ejecutar({ tipo: "resolver", expediente: exp.id, decision: "reclamar" })),
      );
    } else {
      barra.append(accion("act:revisar", t.actions.review, vRev.ok, () => ejecutar({ tipo: "revisar", expediente: exp.id })));
    }
    barra.append(accion("act:finalizar", t.actions.finish, vFin.ok, () => ejecutar({ tipo: "finalizar", expediente: exp.id }), true));
    nodos.push(barra);

    const motivos = [
      !vSol.ok && `${t.actions.request}: ${vSol.motivo}`,
      !vRec.ok && `${t.actions.remind}: ${vRec.motivo}`,
      !vFin.ok && `${t.actions.finish}: ${vFin.motivo}`,
    ].filter((m): m is string => typeof m === "string");
    if (motivos.length > 0) {
      const ul = el("ul", "mt-2 space-y-0.5 text-xs text-tinta-suave");
      motivos.forEach((m) => ul.append(el("li", "", m)));
      nodos.push(ul);
    }

    // Correo simulado
    nodos.push(el("h4", "mt-5 font-mono text-[11px] uppercase tracking-wide text-senal", t.detail.emailTitle));
    const ultimo = ultimoCorreo(s, exp.id);
    const caja = el("div", "mt-2 border border-dashed border-borde bg-superficie p-3 text-sm");
    if (ultimo) {
      caja.append(
        el("p", "font-mono text-[11px] uppercase text-urgencia", t.detail.emailNote),
        el("p", "mt-2 text-xs text-tinta-suave", `${t.detail.emailTo}: ${ultimo.correo.para}`),
        el("p", "text-xs text-tinta-suave", `${t.detail.emailSubject}: ${ultimo.correo.asunto}`),
        el("pre", "mt-2 font-sans text-sm whitespace-pre-wrap text-tinta", ultimo.correo.cuerpo),
      );
    } else {
      caja.append(el("p", "text-tinta-suave", t.detail.emailNone));
    }
    nodos.push(caja);

    detail.replaceChildren(...nodos);
  }

  /* ---------- Historial ---------- */
  function renderHistorial(s: EstadoDemo) {
    if (s.historial.length === 0) {
      history.replaceChildren(el("li", "p-3 text-sm text-tinta-suave", t.history.empty));
      return;
    }
    history.replaceChildren(
      ...[...s.historial].reverse().map((ev) => {
        const li = el("li", "grid gap-x-3 gap-y-1 border-b border-borde p-3 text-sm last:border-b-0 sm:grid-cols-[9.5rem_6.5rem_1fr]");
        li.append(
          el("span", "font-mono text-xs text-tinta-suave", formatReloj(ev.t)),
          (() => {
            const w = el("span", "flex flex-wrap items-center gap-1");
            w.append(
              badge(t.history.actions[ev.accion], "border-tinta-suave text-tinta-suave"),
              badge(ev.resultado === "ok" ? t.history.ok : t.history.blocked, ev.resultado === "ok" ? "border-confirma text-confirma" : "border-urgencia text-urgencia"),
            );
            return w;
          })(),
          el("span", "text-tinta", `${ev.expediente ? `${ev.expediente} · ` : ""}${ev.detalle}`),
        );
        return li;
      }),
    );
  }

  /* ---------- Render, foco y acciones ---------- */
  function render() {
    const foco = document.activeElement instanceof HTMLElement ? document.activeElement.dataset.key : undefined;
    const s = store.obtener();
    renderMetricas(s);
    renderFiltros(s);
    renderLista(s);
    renderDetalle(s);
    renderHistorial(s);
    if (foco) {
      const destino = document.querySelector<HTMLElement>(`[data-key="${foco}"]`);
      if (destino && !(destino instanceof HTMLButtonElement && destino.disabled)) destino.focus();
      else if (foco.startsWith("act:") || foco.startsWith("recv")) document.getElementById("demo-detail-title")?.focus();
    }
  }

  function ejecutar(cmd: Parameters<typeof store.despachar>[0]) {
    const eventos = store.despachar(cmd);
    const ultimo = eventos.at(-1);
    if (ultimo) live.textContent = `${ultimo.resultado === "ok" ? "" : `${t.history.blocked}: `}${ultimo.detalle}`;
  }

  function seleccionar(id: string) {
    seleccionado = id;
    render();
    if (matchMedia("(max-width: 1023px)").matches) {
      q("#demo-detail-section").scrollIntoView({ block: "start" });
      document.getElementById("demo-detail-title")?.focus({ preventScroll: true });
    }
  }

  store.suscribir(() => render());

  q("#demo-search").addEventListener("input", (e) => {
    busqueda = (e.target as HTMLInputElement).value;
    render();
  });
  q("#demo-day").addEventListener("click", () => ejecutar({ tipo: "avanzar", dias: 1 }));
  q("#demo-week").addEventListener("click", () => ejecutar({ tipo: "avanzar", dias: 7 }));
  q("#demo-reset").addEventListener("click", () => {
    filtro = "todos";
    busqueda = "";
    seleccionado = null;
    q<HTMLInputElement>("#demo-search").value = "";
    store.reiniciar();
    live.textContent = t.resetDone;
  });

  /* ---------- Calculadora ---------- */
  const form = q<HTMLFormElement>("#demo-calc");
  const euros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  const horas = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 });

  function calcular() {
    const num = (name: string) => Number((form.elements.namedItem(name) as HTMLInputElement).value);
    const r = calcularAhorro({
      expedientesMes: num("expedientesMes"),
      minutosManuales: num("minutosManuales"),
      reduccionPct: num("reduccionPct"),
      costeHora: num("costeHora"),
    });
    const errores = q("#demo-calc-errors");
    const out = q("#demo-calc-out");
    if (!r.valido) {
      errores.replaceChildren(...r.errores.map((m) => el("p", "", m)));
      out.hidden = true;
      return;
    }
    errores.replaceChildren();
    out.hidden = false;
    q("#calc-horasManualesMes").textContent = `${horas.format(r.horasManualesMes)} h`;
    q("#calc-horasAhorradasMes").textContent = `${horas.format(r.horasAhorradasMes)} h`;
    q("#calc-ahorroMes").textContent = euros.format(r.ahorroMes);
    q("#calc-ahorroAnio").textContent = euros.format(r.ahorroAnio);
  }
  form.addEventListener("input", calcular);
  form.addEventListener("submit", (e) => e.preventDefault());
  calcular();

  render();
}
