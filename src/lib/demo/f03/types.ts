/**
 * Modelo de la demo F-03 (recogida documental). Todo el estado de la demo vive
 * en `EstadoDemo`; las métricas y el estado de cada expediente se derivan de él.
 * Los datos son ficticios y no hay ningún dato personal.
 */

export type EstadoExpediente = "pendiente" | "parcial" | "completo" | "revision";
export type EstadoDocumento = "pendiente" | "recibido" | "dudoso";

export interface Documento {
  id: string;
  nombre: string;
  estado: EstadoDocumento;
  /** Día simulado (0 = inicio del escenario) en que vence la entrega. */
  vencimiento: number;
}

export interface Expediente {
  id: string;
  cliente: string;
  tramite: string;
  documentos: Documento[];
  /** Ya se ha simulado la solicitud inicial de documentación. */
  solicitado: boolean;
  /** Marcado para revisión humana (además de los documentos dudosos). */
  enRevision: boolean;
  motivoRevision?: string;
  cerrado: boolean;
}

export type Accion =
  | "solicitud"
  | "recepcion"
  | "recordatorio"
  | "avance_tiempo"
  | "plazo_ampliado"
  | "revision"
  | "revision_resuelta"
  | "finalizacion";

export interface Correo {
  para: string;
  asunto: string;
  cuerpo: string;
}

export interface Evento {
  n: number;
  /** Minutos simulados desde el inicio del escenario. */
  t: number;
  expediente: string | null;
  accion: Accion;
  resultado: "ok" | "bloqueado";
  detalle: string;
  /** Recordatorios: claves `expediente|documento|vencimiento` enviadas. */
  claves?: string[];
  /** Previsualización del correo simulado. Nunca se envía. */
  correo?: Correo;
}

export interface EstadoDemo {
  /** Minutos simulados desde el inicio del escenario. */
  ahora: number;
  expedientes: Expediente[];
  historial: Evento[];
}

export type Comando =
  | { tipo: "solicitar"; expediente: string }
  | { tipo: "recibir"; expediente: string; documento: string; dudoso: boolean }
  | { tipo: "recordar"; expediente: string }
  | { tipo: "avanzar"; dias: 1 | 7 }
  | { tipo: "revisar"; expediente: string }
  | { tipo: "resolver"; expediente: string; decision: "aprobar" | "reclamar" }
  | { tipo: "finalizar"; expediente: string };
