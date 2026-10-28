import type { EstadoDemo } from "./types.ts";
import { contar } from "./rules.ts";

/**
 * HIPÓTESIS de minutos que costaría hacer cada acción a mano. No son datos
 * medidos de ningún despacho; la interfaz los etiqueta como estimación.
 */
export const MINUTOS_MANUALES_HIPOTESIS = {
  solicitud: 8,
  recepcion: 4,
  recordatorio: 5,
  revision: 10,
} as const;

export interface Metricas {
  pendientes: number;
  parciales: number;
  completos: number;
  enRevision: number;
  finalizados: number;
  solicitudes: number;
  recordatorios: number;
  duplicadosEvitados: number;
  /** Minutos de trabajo manual equivalente (hipótesis), derivados del historial. */
  minutosManualesEstimados: number;
}

/** Todas las métricas salen del estado: no hay contadores aparte que puedan desincronizarse. */
export function calcularMetricas(state: EstadoDemo): Metricas {
  const ok = (accion: string) => state.historial.filter((e) => e.accion === accion && e.resultado === "ok");
  const solicitudes = ok("solicitud").length;
  const recordatorios = ok("recordatorio").length;
  const recepciones = ok("recepcion").length;
  const revisiones = ok("revision").length + ok("revision_resuelta").filter((e) => e.detalle.startsWith("Revisión humana")).length;
  const m = MINUTOS_MANUALES_HIPOTESIS;

  return {
    pendientes: contar(state, "pendiente"),
    parciales: contar(state, "parcial"),
    completos: contar(state, "completo"),
    enRevision: contar(state, "revision"),
    finalizados: state.expedientes.filter((e) => e.cerrado).length,
    solicitudes,
    recordatorios,
    duplicadosEvitados: state.historial.filter((e) => e.accion === "recordatorio" && e.resultado === "bloqueado" && e.detalle.startsWith("Duplicado")).length,
    minutosManualesEstimados:
      solicitudes * m.solicitud + recordatorios * m.recordatorio + recepciones * m.recepcion + revisiones * m.revision,
  };
}

export interface EntradaCalculadora {
  expedientesMes: number;
  minutosManuales: number;
  reduccionPct: number;
  costeHora: number;
}

export type ResultadoCalculadora =
  | { valido: true; horasManualesMes: number; horasAhorradasMes: number; ahorroMes: number; ahorroAnio: number }
  | { valido: false; errores: string[] };

const RANGOS = {
  expedientesMes: [1, 5000, "Expedientes al mes"],
  minutosManuales: [1, 600, "Minutos manuales por expediente"],
  reduccionPct: [0, 100, "Reducción hipotética (%)"],
  costeHora: [1, 500, "Coste laboral por hora (€)"],
} as const;

export function calcularAhorro(e: EntradaCalculadora): ResultadoCalculadora {
  const errores: string[] = [];
  for (const k of Object.keys(RANGOS) as (keyof typeof RANGOS)[]) {
    const [min, max, etiqueta] = RANGOS[k];
    const v = e[k];
    if (!Number.isFinite(v) || v < min || v > max) errores.push(`${etiqueta}: introduce un valor entre ${min} y ${max}.`);
  }
  if (errores.length > 0) return { valido: false, errores };

  const horasManualesMes = (e.expedientesMes * e.minutosManuales) / 60;
  const horasAhorradasMes = horasManualesMes * (e.reduccionPct / 100);
  const ahorroMes = horasAhorradasMes * e.costeHora;
  return { valido: true, horasManualesMes, horasAhorradasMes, ahorroMes, ahorroAnio: ahorroMes * 12 };
}
