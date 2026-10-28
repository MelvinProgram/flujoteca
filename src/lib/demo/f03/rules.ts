import type { Documento, EstadoDemo, EstadoExpediente, Evento, Expediente } from "./types.ts";

/** Fecha ficticia de inicio del escenario: lunes 09:00 (no corresponde a ningún calendario real). */
const INICIO = Date.UTC(2026, 2, 2, 9, 0);

export const MIN_DIA = 1440;

export function diaDe(t: number): number {
  return Math.floor(t / MIN_DIA);
}

/** "dd/mm/aaaa hh:mm" del reloj simulado. */
export function formatReloj(t: number): string {
  const d = new Date(INICIO + t * 60000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getUTCDate())}/${p(d.getUTCMonth() + 1)}/${d.getUTCFullYear()} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
}

/** "dd/mm" de un día simulado (vencimientos). */
export function formatDia(dia: number): string {
  const d = new Date(INICIO + dia * MIN_DIA * 60000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getUTCDate())}/${p(d.getUTCMonth() + 1)}`;
}

/** Estado derivado: nunca se almacena, siempre sale de documentos y marcas. */
export function estadoDe(exp: Expediente): EstadoExpediente {
  if (exp.enRevision || exp.documentos.some((d) => d.estado === "dudoso")) return "revision";
  const recibidos = exp.documentos.filter((d) => d.estado === "recibido").length;
  if (recibidos === exp.documentos.length) return "completo";
  return recibidos > 0 ? "parcial" : "pendiente";
}

export function docsPendientes(exp: Expediente): Documento[] {
  return exp.documentos.filter((d) => d.estado === "pendiente");
}

export function claveRecordatorio(exp: string, doc: Documento): string {
  return `${exp}|${doc.id}|${doc.vencimiento}`;
}

/** Un recordatorio es duplicado si ya se envió otro para el mismo documento y vencimiento. */
export function recordatorioDuplicado(historial: readonly Evento[], clave: string): boolean {
  return historial.some(
    (e) => e.accion === "recordatorio" && e.resultado === "ok" && e.claves?.includes(clave),
  );
}

export type Veredicto = { ok: true } | { ok: false; motivo: string };

export function puedeFinalizar(exp: Expediente): Veredicto {
  if (exp.cerrado) return { ok: false, motivo: "El expediente ya está finalizado." };
  const estado = estadoDe(exp);
  if (estado === "revision") {
    return { ok: false, motivo: "Requiere revisión humana antes de poder finalizarse." };
  }
  if (estado !== "completo") {
    return { ok: false, motivo: "Documentación incompleta: no se puede finalizar." };
  }
  return { ok: true };
}

export function puedeSolicitar(exp: Expediente): Veredicto {
  if (exp.cerrado) return { ok: false, motivo: "El expediente está finalizado." };
  if (exp.solicitado) return { ok: false, motivo: "La documentación ya fue solicitada." };
  return { ok: true };
}

export function puedeRecibir(exp: Expediente, doc: Documento): Veredicto {
  if (exp.cerrado) return { ok: false, motivo: "El expediente está finalizado." };
  if (!exp.solicitado) return { ok: false, motivo: "Solicita antes la documentación." };
  if (doc.estado !== "pendiente") return { ok: false, motivo: "El documento ya está registrado." };
  return { ok: true };
}

export function puedeRecordar(exp: Expediente): Veredicto {
  if (exp.cerrado) return { ok: false, motivo: "El expediente está finalizado." };
  if (!exp.solicitado) return { ok: false, motivo: "Aún no se ha solicitado la documentación." };
  if (docsPendientes(exp).length === 0) return { ok: false, motivo: "No hay documentos pendientes." };
  return { ok: true };
}

export function puedeMarcarRevision(exp: Expediente): Veredicto {
  if (exp.cerrado) return { ok: false, motivo: "El expediente está finalizado." };
  if (estadoDe(exp) === "revision") return { ok: false, motivo: "Ya está en revisión." };
  return { ok: true };
}

export function puedeResolver(exp: Expediente): Veredicto {
  if (estadoDe(exp) !== "revision") return { ok: false, motivo: "No está en revisión." };
  return { ok: true };
}

export function contar(state: EstadoDemo, estado: EstadoExpediente): number {
  return state.expedientes.filter((e) => estadoDe(e) === estado).length;
}
