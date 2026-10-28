import type { Correo } from "./types.ts";
import { MINUTOS_MANUALES_HIPOTESIS } from "./metrics.ts";

/**
 * Simulador "¿Y si el cliente no responde?". Lógica pura y determinista:
 * dada una configuración, calcula el recorrido completo; la interfaz solo
 * revela los pasos uno a uno. Independiente del panel de expedientes y con
 * datos ficticios. Cada aviso lleva un plazo nuevo (nunca dos avisos para el
 * mismo plazo) y un documento dudoso o sin respuesta nunca se da por bueno:
 * pasa siempre a una persona del despacho.
 */

export type Comportamiento = "primer_aviso" | "tras_dos" | "nunca" | "dudoso";
export type Intervalo = 2 | 3 | 5;
export type MaxReintentos = 2 | 3 | 4;

export interface ConfigReintentos {
  comportamiento: Comportamiento;
  intervalo: Intervalo;
  maxReintentos: MaxReintentos;
}

export type TipoPaso = "solicitud" | "reintento" | "recepcion" | "resultado";

export interface PasoReintento {
  n: number;
  /** Día simulado (0 = solicitud inicial). */
  dia: number;
  tipo: TipoPaso;
  titulo: string;
  detalle: string;
  /** Día límite que se da al cliente en este aviso. */
  plazo?: number;
  /** Último reintento antes de pasar a una persona. */
  ultimoAviso?: boolean;
  correo?: Correo;
  final?: "completo" | "persona";
}

export const CLIENTE = "Taller Norte Demo S.L.";
export const TRAMITE = "IVA 1T";
export const DOCUMENTOS = ["Facturas emitidas", "Facturas recibidas", "Extracto bancario"] as const;

export const CONFIG_INICIAL: ConfigReintentos = { comportamiento: "tras_dos", intervalo: 3, maxReintentos: 3 };

const COMPORTAMIENTOS: readonly Comportamiento[] = ["primer_aviso", "tras_dos", "nunca", "dudoso"];
const INTERVALOS: readonly Intervalo[] = [2, 3, 5];
const MAXIMOS: readonly MaxReintentos[] = [2, 3, 4];

/** Valores fuera de rango (por ejemplo, un `<select>` manipulado) vuelven a los iniciales. */
export function normalizarConfig(c: { comportamiento: string; intervalo: number; maxReintentos: number }): ConfigReintentos {
  return {
    comportamiento: COMPORTAMIENTOS.find((x) => x === c.comportamiento) ?? CONFIG_INICIAL.comportamiento,
    intervalo: INTERVALOS.find((x) => x === c.intervalo) ?? CONFIG_INICIAL.intervalo,
    maxReintentos: MAXIMOS.find((x) => x === c.maxReintentos) ?? CONFIG_INICIAL.maxReintentos,
  };
}

const PIE = "(Previsualización simulada con datos ficticios. No se ha enviado ningún correo.)";
const lista = DOCUMENTOS.map((d) => `  - ${d}`).join("\n");

function correoAviso(r: number, plazo: number, ultimo: boolean): Correo {
  const para = "contacto@taller-norte.ejemplo.test";
  if (r === 0) {
    return {
      para,
      asunto: `[DEMO] Documentación para ${TRAMITE}`,
      cuerpo: `Hola, ${CLIENTE}:\n\nPara tramitar «${TRAMITE}» necesitamos que nos envíes antes del día ${plazo}:\n${lista}\n\nGracias.\n\n${PIE}`,
    };
  }
  if (ultimo) {
    return {
      para,
      asunto: `[DEMO] Último aviso: documentación de ${TRAMITE}`,
      cuerpo: `Hola, ${CLIENTE}:\n\nEste es el último aviso automático. Si no recibimos esto antes del día ${plazo}, una persona del despacho te contactará para ayudarte:\n${lista}\n\n${PIE}`,
    };
  }
  return {
    para,
    asunto: `[DEMO] Recordatorio ${r}: documentación de ${TRAMITE}`,
    cuerpo: `Hola, ${CLIENTE}:\n\nTodavía nos faltan estos documentos de «${TRAMITE}». Te damos un plazo nuevo, hasta el día ${plazo}:\n${lista}\n\nCuando puedas, súbelos y comprobamos el resto.\n\n${PIE}`,
  };
}

/** Recorrido completo para una configuración. */
export function generarPasos(config: ConfigReintentos): PasoReintento[] {
  const { comportamiento, intervalo: I, maxReintentos: max } = config;
  const pasos: PasoReintento[] = [];
  const add = (p: Omit<PasoReintento, "n">) => pasos.push({ n: pasos.length + 1, ...p });

  // Tras qué aviso responde el cliente (null = nunca)
  const respondeTras = comportamiento === "nunca" ? null : comportamiento === "tras_dos" ? 2 : 0;

  add({
    dia: 0,
    tipo: "solicitud",
    titulo: "Se solicita la documentación",
    detalle: `Se envía la lista de ${DOCUMENTOS.length} documentos, con plazo hasta el día ${I}.`,
    plazo: I,
    correo: correoAviso(0, I, false),
  });

  for (let r = 0; r <= max; r++) {
    if (r > 0) {
      const dia = r * I;
      const plazo = dia + I;
      const ultimo = r === max;
      add({
        dia,
        tipo: "reintento",
        titulo: ultimo ? `Reintento ${r}: último aviso` : `Reintento ${r}`,
        detalle: `Se comprueba la documentación: faltan ${DOCUMENTOS.length} documentos. Se reclaman de nuevo, con plazo nuevo hasta el día ${plazo}${ultimo ? ". Si no llegan, pasará a una persona del despacho" : ""}.`,
        plazo,
        ultimoAviso: ultimo,
        correo: correoAviso(r, plazo, ultimo),
      });
    }

    if (respondeTras === r) {
      const llegada = r * I + 1;
      const dudoso = comportamiento === "dudoso";
      add({
        dia: llegada,
        tipo: "recepcion",
        titulo: dudoso ? "Llegan los documentos, uno dudoso" : "El cliente envía los documentos",
        detalle: dudoso
          ? "Todo llega, pero uno de los documentos no se lee bien o no es coherente."
          : `Llegan los ${DOCUMENTOS.length} documentos y se guardan ordenados por expediente.`,
      });
      add({
        dia: (r + 1) * I,
        tipo: "resultado",
        titulo: dudoso ? "Pasa a una persona del despacho" : "Expediente completo",
        detalle: dudoso
          ? "Se comprueba la documentación. Un documento dudoso nunca se da por bueno de forma automática: una persona lo revisa."
          : "Se comprueba la documentación: está todo. Nadie ha tenido que perseguir al cliente.",
        final: dudoso ? "persona" : "completo",
      });
      return pasos;
    }
  }

  add({
    dia: (max + 1) * I,
    tipo: "resultado",
    titulo: "Pasa a una persona del despacho",
    detalle: `Se agotan los ${max} reintentos sin respuesta. La automatización se detiene y avisa al equipo para que contacte con el cliente.`,
    final: "persona",
  });
  return pasos;
}

export interface ResumenReintentos {
  avisos: number;
  dias: number;
  /** Minutos que habrían costado esos avisos a mano (HIPÓTESIS, no medido). */
  minutosManuales: number;
}

/** Contadores derivados de los pasos ya revelados. */
export function resumir(pasos: readonly PasoReintento[], reveladas: number): ResumenReintentos {
  const hechos = pasos.slice(0, reveladas);
  const solicitudes = hechos.filter((p) => p.tipo === "solicitud").length;
  const reintentos = hechos.filter((p) => p.tipo === "reintento").length;
  return {
    avisos: solicitudes + reintentos,
    dias: hechos.at(-1)?.dia ?? 0,
    minutosManuales: solicitudes * MINUTOS_MANUALES_HIPOTESIS.solicitud + reintentos * MINUTOS_MANUALES_HIPOTESIS.recordatorio,
  };
}

/** Último correo simulado ya revelado, si lo hay. */
export function ultimoCorreo(pasos: readonly PasoReintento[], reveladas: number): PasoReintento | null {
  for (let i = Math.min(reveladas, pasos.length) - 1; i >= 0; i--) if (pasos[i].correo) return pasos[i];
  return null;
}
