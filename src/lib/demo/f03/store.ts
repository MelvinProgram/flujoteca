import type { Accion, Comando, Correo, EstadoDemo, Evento, Expediente } from "./types.ts";
import {
  claveRecordatorio,
  diaDe,
  docsPendientes,
  estadoDe,
  formatDia,
  MIN_DIA,
  puedeFinalizar,
  puedeMarcarRevision,
  puedeRecibir,
  puedeRecordar,
  puedeResolver,
  puedeSolicitar,
  recordatorioDuplicado,
} from "./rules.ts";
import { crearEstadoInicial } from "./seed.ts";

/** Plazo (días) que se da al cliente al solicitar o reclamar documentación. */
const PLAZO_DIAS = 7;
/** Minutos simulados que consume cada acción manual del equipo. */
const MIN_POR_ACCION = 2;

const emailCliente = (exp: Expediente) => `contacto@${exp.id.toLowerCase()}.ejemplo.test`;

function correoSolicitud(exp: Expediente, dia: number): Correo {
  const lista = exp.documentos
    .filter((d) => d.estado === "pendiente")
    .map((d) => `  - ${d.nombre}`)
    .join("\n");
  return {
    para: emailCliente(exp),
    asunto: `[DEMO] Documentación para ${exp.tramite}`,
    cuerpo: `Hola, ${exp.cliente}:\n\nPara tramitar «${exp.tramite}» necesitamos que nos envíes antes del ${formatDia(dia + PLAZO_DIAS)}:\n${lista}\n\nGracias.\n\n(Previsualización simulada con datos ficticios. No se ha enviado ningún correo.)`,
  };
}

function correoRecordatorio(exp: Expediente): Correo {
  const lista = docsPendientes(exp)
    .map((d) => `  - ${d.nombre} (vence el ${formatDia(d.vencimiento)})`)
    .join("\n");
  return {
    para: emailCliente(exp),
    asunto: `[DEMO] Recordatorio: documentación pendiente de ${exp.tramite}`,
    cuerpo: `Hola, ${exp.cliente}:\n\nTodavía nos falta:\n${lista}\n\nCuando puedas, súbelo y comprobamos el resto.\n\n(Previsualización simulada con datos ficticios. No se ha enviado ningún correo.)`,
  };
}

export interface Resultado {
  state: EstadoDemo;
  eventos: Evento[];
}

/**
 * Reductor puro: aplica un comando y devuelve el nuevo estado y los eventos
 * registrados. No muta el estado recibido. Toda regla de negocio se hace
 * cumplir aquí, aunque la interfaz ya deshabilite el botón.
 */
export function reducir(prev: EstadoDemo, cmd: Comando): Resultado {
  const state = structuredClone(prev);
  const eventos: Evento[] = [];

  const log = (
    accion: Accion,
    expediente: string | null,
    resultado: Evento["resultado"],
    detalle: string,
    extra: Pick<Evento, "claves" | "correo"> = {},
  ) => {
    const ev: Evento = {
      n: state.historial.length + 1,
      t: state.ahora,
      expediente,
      accion,
      resultado,
      detalle,
      ...extra,
    };
    state.historial.push(ev);
    eventos.push(ev);
  };

  if (cmd.tipo === "avanzar") {
    state.ahora += cmd.dias * MIN_DIA;
    const dia = diaDe(state.ahora);
    log("avance_tiempo", null, "ok", `El reloj simulado avanza ${cmd.dias} ${cmd.dias === 1 ? "día" : "días"}.`);
    for (const exp of state.expedientes) {
      if (exp.cerrado || !exp.solicitado) continue;
      const vencidos = docsPendientes(exp).filter((d) => d.vencimiento < dia);
      if (vencidos.length === 0) continue;
      // Un vencimiento nuevo es un plazo distinto: permite un recordatorio nuevo.
      for (const d of vencidos) d.vencimiento = dia + PLAZO_DIAS;
      log("plazo_ampliado", exp.id, "ok", `${vencidos.length} documento(s) vencido(s): nuevo plazo el ${formatDia(dia + PLAZO_DIAS)}.`);
    }
    return { state, eventos };
  }

  const exp = state.expedientes.find((e) => e.id === cmd.expediente);
  if (!exp) return { state: prev, eventos: [] };

  state.ahora += MIN_POR_ACCION;
  const dia = diaDe(state.ahora);

  switch (cmd.tipo) {
    case "solicitar": {
      const v = puedeSolicitar(exp);
      if (!v.ok) return log("solicitud", exp.id, "bloqueado", v.motivo), { state, eventos };
      exp.solicitado = true;
      for (const d of docsPendientes(exp)) d.vencimiento = dia + PLAZO_DIAS;
      log("solicitud", exp.id, "ok", `Solicitud simulada de ${docsPendientes(exp).length} documento(s).`, {
        correo: correoSolicitud(exp, dia),
      });
      break;
    }

    case "recibir": {
      const doc = exp.documentos.find((d) => d.id === cmd.documento);
      if (!doc) return { state: prev, eventos: [] };
      const v = puedeRecibir(exp, doc);
      if (!v.ok) return log("recepcion", exp.id, "bloqueado", `${doc.nombre}: ${v.motivo}`), { state, eventos };
      if (cmd.dudoso) {
        doc.estado = "dudoso";
        exp.motivoRevision = `Documento dudoso: «${doc.nombre}» ilegible o incoherente.`;
        log("recepcion", exp.id, "ok", `«${doc.nombre}» recibido pero dudoso: pasa a revisión humana.`);
      } else {
        doc.estado = "recibido";
        const completo = estadoDe(exp) === "completo";
        log("recepcion", exp.id, "ok", `«${doc.nombre}» recibido.${completo ? " Documentación completa: listo para finalizar." : ""}`);
      }
      break;
    }

    case "recordar": {
      const v = puedeRecordar(exp);
      if (!v.ok) return log("recordatorio", exp.id, "bloqueado", v.motivo), { state, eventos };
      const nuevos: string[] = [];
      const duplicados: string[] = [];
      for (const d of docsPendientes(exp)) {
        const clave = claveRecordatorio(exp.id, d);
        // Se comprueba contra el historial, sin contar lo ya enviado en este mismo comando.
        (recordatorioDuplicado(prev.historial, clave) ? duplicados : nuevos).push(clave);
      }
      if (duplicados.length > 0) {
        log(
          "recordatorio",
          exp.id,
          "bloqueado",
          `Duplicado evitado: ${duplicados.length} documento(s) ya recordados para el mismo vencimiento.`,
        );
      }
      if (nuevos.length > 0) {
        const nombres = docsPendientes(exp)
          .filter((d) => nuevos.includes(claveRecordatorio(exp.id, d)))
          .map((d) => d.nombre);
        log("recordatorio", exp.id, "ok", `Recordatorio simulado: ${nombres.join(", ")}.`, {
          claves: nuevos,
          correo: correoRecordatorio(exp),
        });
      }
      break;
    }

    case "revisar": {
      const v = puedeMarcarRevision(exp);
      if (!v.ok) return log("revision", exp.id, "bloqueado", v.motivo), { state, eventos };
      exp.enRevision = true;
      exp.motivoRevision = "Marcado para revisión por el equipo.";
      log("revision", exp.id, "ok", "El expediente pasa a revisión humana.");
      break;
    }

    case "resolver": {
      const v = puedeResolver(exp);
      if (!v.ok) return log("revision_resuelta", exp.id, "bloqueado", v.motivo), { state, eventos };
      const dudosos = exp.documentos.filter((d) => d.estado === "dudoso");
      if (cmd.decision === "aprobar") {
        for (const d of dudosos) d.estado = "recibido";
        log("revision_resuelta", exp.id, "ok", `Revisión humana: documentación validada (${dudosos.length} dudoso(s) aprobado(s)).`);
      } else {
        for (const d of dudosos) {
          d.estado = "pendiente";
          d.vencimiento = dia + PLAZO_DIAS;
        }
        log("revision_resuelta", exp.id, "ok", `Revisión humana: se reclaman de nuevo ${dudosos.length} documento(s).`, {
          correo: correoRecordatorio(exp),
        });
      }
      exp.enRevision = false;
      delete exp.motivoRevision;
      break;
    }

    case "finalizar": {
      const v = puedeFinalizar(exp);
      if (!v.ok) return log("finalizacion", exp.id, "bloqueado", v.motivo), { state, eventos };
      exp.cerrado = true;
      log("finalizacion", exp.id, "ok", "Expediente finalizado.");
      break;
    }
  }

  return { state, eventos };
}

type Oyente = (state: EstadoDemo, eventos: Evento[]) => void;

/** Almacén mínimo: única fuente de verdad de la demo. */
export function crearAlmacen() {
  let state = crearEstadoInicial();
  const oyentes = new Set<Oyente>();
  const emitir = (eventos: Evento[]) => oyentes.forEach((fn) => fn(state, eventos));

  return {
    obtener: () => state,
    despachar(cmd: Comando): Evento[] {
      const r = reducir(state, cmd);
      state = r.state;
      emitir(r.eventos);
      return r.eventos;
    },
    reiniciar() {
      state = crearEstadoInicial();
      emitir([]);
    },
    suscribir(fn: Oyente) {
      oyentes.add(fn);
      return () => oyentes.delete(fn);
    },
  };
}
