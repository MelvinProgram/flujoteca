/**
 * Textos de la demo interactiva F-03 (recogida documental).
 * Igual que el resto de la web, el copy vive aquí y no en los componentes.
 * Todos los datos de la demo son ficticios.
 */

export const demoF03 = {
  seoTitle: "Demo interactiva: recogida documental (F-03)",
  seoDescription:
    "Prueba con datos ficticios cómo Flujoteca automatiza la solicitud, recepción y seguimiento de documentación en una asesoría.",

  badge: "DEMO CON DATOS FICTICIOS",
  badgeNote:
    "Ningún dato es real, no se envía ningún correo y no se conecta con ningún sistema. Todo ocurre en tu navegador y se pierde al cerrar la página.",
  kicker: "F-03 · Recogida documental",
  title: "Panel de recogida documental",
  intro:
    "Simula el día a día de una asesoría: solicita documentación, registra lo que llega, deja pasar el tiempo, envía recordatorios y finaliza expedientes. Cada acción actualiza el estado, el historial y las métricas.",
  reset: "Reiniciar escenario",
  resetDone: "Escenario reiniciado: 24 expedientes ficticios.",

  clock: { label: "Reloj simulado", day: "Avanzar 1 día", week: "Avanzar 7 días" },

  kpis: {
    title: "Métricas del escenario",
    items: [
      { key: "pendientes", label: "Pendientes" },
      { key: "completos", label: "Completos" },
      { key: "enRevision", label: "En revisión" },
      { key: "solicitudes", label: "Solicitudes simuladas" },
      { key: "recordatorios", label: "Recordatorios simulados" },
      { key: "minutos", label: "Tiempo manual estimado" },
    ],
    note: "Las métricas se calculan a partir del historial de esta sesión. El tiempo manual usa duraciones hipotéticas por tarea (solicitud 8 min, recordatorio 5 min, recepción 4 min, revisión 10 min): es una estimación, no un resultado medido.",
    duplicates: "Recordatorios duplicados evitados",
  },

  filters: {
    label: "Filtrar expedientes",
    search: "Buscar cliente",
    searchPlaceholder: "Nombre del cliente ficticio",
    all: "Todos",
    empty: "Ningún expediente coincide con el filtro.",
  },

  states: {
    pendiente: "Pendiente",
    parcial: "Parcial",
    completo: "Completo",
    revision: "En revisión",
  },
  docStates: {
    pendiente: "Pendiente",
    recibido: "Recibido",
    dudoso: "Dudoso",
  },

  list: {
    title: "Expedientes",
    finished: "Finalizado",
    docs: "docs",
    columns: { expediente: "Expediente", estado: "Estado", documentos: "Documentos" },
  },

  detail: {
    placeholder: "Selecciona un expediente para ver sus documentos y acciones.",
    docs: "Documentos requeridos",
    due: "Vence",
    dueToday: "Vence hoy",
    dueTomorrow: "Vence mañana",
    dueIn: "en",
    dueDays: "días",
    actions: "Acciones simuladas",
    back: "Volver a la lista",
    reviewTitle: "Revisión humana",
    reviewNote:
      "Un expediente dudoso o incompleto no se da por bueno de forma automática: una persona debe validarlo.",
    emailTitle: "Previsualización de correo",
    emailNote: "Simulada: no se ha enviado ningún correo.",
    emailNone: "Todavía no hay ningún correo simulado para este expediente.",
    emailTo: "Para",
    emailSubject: "Asunto",
  },

  actions: {
    request: "Solicitar documentación",
    remind: "Enviar recordatorio",
    receive: "Recibir",
    receiveDoubt: "Recibir (dudoso)",
    review: "Marcar para revisión",
    approve: "Aprobar revisión",
    reclaim: "Reclamar de nuevo",
    finish: "Finalizar expediente",
  },

  history: {
    title: "Historial",
    empty: "Aún no hay acciones. Prueba a solicitar documentación.",
    blocked: "Bloqueado",
    ok: "Hecho",
    actions: {
      solicitud: "Solicitud",
      recepcion: "Recepción",
      recordatorio: "Recordatorio",
      avance_tiempo: "Tiempo",
      plazo_ampliado: "Plazo",
      revision: "Revisión",
      revision_resuelta: "Revisión",
      finalizacion: "Finalización",
    },
  },

  calculator: {
    title: "Calculadora económica",
    badge: "HIPÓTESIS, NO RESULTADOS REALES",
    intro:
      "Estima con tus propios números cuánto tiempo y coste podría liberar una automatización de este tipo. Los valores iniciales son ejemplos editables: no proceden de ningún cliente ni de ninguna medición.",
    fields: {
      expedientesMes: "Expedientes al mes",
      minutosManuales: "Minutos manuales por expediente",
      reduccionPct: "Reducción hipotética (%)",
      costeHora: "Coste laboral por hora (€)",
    },
    results: {
      title: "Estimación hipotética",
      horasManualesMes: "Horas manuales al mes",
      horasAhorradasMes: "Horas que podrían liberarse al mes",
      ahorroMes: "Coste laboral liberado al mes",
      ahorroAnio: "Coste laboral liberado al año",
    },
    disclaimer:
      "Cálculo ilustrativo basado en las hipótesis que has introducido. El resultado real depende de cada despacho y se valora en el diagnóstico.",
  },

  cta: {
    title: "¿Cómo sería en tu despacho?",
    body: "Esta demo usa datos inventados. En el diagnóstico gratuito analizamos tus procesos reales y te decimos si tiene sentido automatizarlos.",
    label: "Analizar mi despacho",
    href: "/#contacto",
    secondary: { label: "Volver a la web", href: "/#flujoteca" },
  },
} as const;
