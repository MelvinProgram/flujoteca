/**
 * Contenido editable de la landing de Flujoteca.
 *
 * Todos los textos visibles de la página viven en este archivo.
 * Para cambiar cualquier texto, edita aquí — no hace falta tocar los
 * componentes .astro.
 *
 * Los campos marcados con "// TODO:" son marcadores a rellenar con
 * datos reales antes de publicar el sitio.
 */

export const site = {
  name: "Flujoteca",
  legalName: "Flujoteca", // TODO: razón social completa si difiere del nombre comercial
  tagline: "Automatización de procesos para asesorías y gestorías",
  // Descripción corta para <meta name="description"> y Open Graph (140-160 caracteres aprox.)
  description:
    "Flujoteca automatiza las tareas repetitivas de asesorías y gestorías del sur de Madrid: onboarding, plazos, documentación y estados de expediente.",
  url: "https://www.flujoteca.es", // TODO: dominio real, debe coincidir con astro.config.mjs (site)
  locale: "es_ES",

  contact: {
    email: "hola@flujoteca.es",
    address: "Sur de la Comunidad de Madrid", // TODO: dirección real si aplica
    // Coordenadas para schema.org LocalBusiness — TODO: sustituir por las reales
    geo: {
      latitude: 40.2085,
      longitude: -3.7128,
    },
  },
} as const;

export const nav = {
  links: [
    { label: "La flujoteca", href: "/#flujoteca" },
    { label: "Cómo funciona", href: "/#como-funciona" },
    { label: "Kit Digital", href: "/#kit-digital" },
  ],
  cta: { label: "Diagnóstico gratuito", href: "/#contacto" },
} as const;

export const hero = {
  kicker: "AUTOMATIZACIÓN DE PROCESOS · DESPACHOS PROFESIONALES",
  title: "Recupera las horas que se van en lo repetitivo",
  subtitle:
    "Automatizamos las tareas que ocupan el día a día de asesorías y gestorías del sur de Madrid — onboarding de clientes, plazos, documentación y estado de expedientes — sin cambiar el software que ya usa tu despacho.",
  cta: { label: "Solicita tu diagnóstico gratuito", href: "#contacto" },
  meta: "Sesión de 30 minutos · Sin compromiso",
} as const;

export const problem = {
  title: "El problema no es la falta de tiempo. Es dónde se va.",
  stats: [
    {
      value: "68%",
      unit: "%",
      description: "de las pymes dedica más de 10 horas semanales a tareas repetitivas",
    },
    {
      value: "2027",
      unit: "",
      description: "es el plazo límite para adaptarse a Verifactu",
    },
    {
      value: "83%",
      unit: "%",
      description: "de las empresas desconoce las nuevas pautas de facturación electrónica",
    },
  ],
} as const;

export const flows = {
  title: "La flujoteca",
  subtitle:
    "Catálogo de flujos ya diseñados para despachos profesionales. Cada uno se adapta al funcionamiento de tu equipo antes de ponerse en marcha.",
  items: [
    {
      code: "F-01",
      name: "Onboarding de clientes",
      resolves:
        "Automatiza la recogida de datos y documentación cuando entra un cliente nuevo, sin cadenas de correo ni formularios sueltos.",
      audience: "Gestorías con alta rotación de altas de clientes",
    },
    {
      code: "F-02",
      name: "Recordatorios de plazos",
      resolves:
        "Avisa automáticamente de vencimientos fiscales y administrativos antes de que se conviertan en urgencia.",
      audience: "Asesorías con varios clientes y plazos simultáneos",
    },
    {
      code: "F-03",
      name: "Recogida documental",
      resolves:
        "Centraliza la petición y recepción de documentos en un único canal, con seguimiento de lo que falta.",
      audience: "Despachos que dependen de que el cliente envíe papeles a tiempo",
    },
    {
      code: "F-04",
      name: "Estados de expediente",
      resolves:
        "Informa al cliente del estado de su expediente de forma automática, sin que tenga que llamar para preguntar.",
      audience: "Equipos que reciben muchas llamadas de seguimiento",
    },
    {
      code: "F-05",
      name: "Captación de leads",
      resolves:
        "Cualifica y enruta las solicitudes que llegan por la web antes de la primera reunión.",
      audience: "Despachos que quieren filtrar antes de reunirse",
    },
  ],
} as const;

export const howItWorks = {
  title: "Cómo funciona",
  steps: [
    {
      number: "01",
      title: "Diagnóstico gratuito",
      description:
        "Una sesión de 30 minutos para identificar qué tareas de tu despacho se pueden automatizar y con qué prioridad.",
    },
    {
      number: "02",
      title: "Implementación",
      description:
        "Configuramos el flujo elegido y lo conectamos con las herramientas que ya usa tu equipo. Sin migraciones.",
    },
    {
      number: "03",
      title: "Soporte mensual",
      description:
        "Seguimiento y ajustes continuos para que el flujo se mantenga al día con tu forma de trabajar.",
    },
  ],
} as const;

export const kitDigital = {
  title: "Kit Digital 2026",
  body: "La convocatoria 2026 del Kit Digital cubre entre 3.000 € y 12.000 € para proyectos de automatización e inteligencia artificial, según el tamaño de la empresa.",
  cta: { label: "Consulta si tu despacho es elegible", href: "#contacto" },
} as const;

export const contactForm = {
  title: "Solicita tu diagnóstico gratuito",
  subtitle:
    "Cuéntanos brevemente cómo trabaja tu despacho y te proponemos horario para la sesión de diagnóstico.",
  fields: {
    name: { label: "Nombre", placeholder: "Nombre y apellidos" },
    email: { label: "Email", placeholder: "tu@despacho.es" },
    phone: { label: "Teléfono", placeholder: "600 000 000" },
    company: { label: "Empresa", placeholder: "Nombre de la asesoría o gestoría" },
    message: {
      label: "Mensaje",
      placeholder: "¿Qué tarea repetitiva te gustaría automatizar primero?",
    },
  },
  consent: {
    text: "He leído y acepto la",
    linkLabel: "política de privacidad",
    linkHref: "/politica-privacidad",
  },
  submitLabel: "Enviar solicitud",
  submittingLabel: "Enviando…",
  successMessage: "Solicitud recibida. Te responderemos en menos de 48 horas laborables.",
  errorMessage:
    "No se ha podido enviar la solicitud. Escríbenos directamente a " + "hola@flujoteca.es" + " o inténtalo de nuevo.",
} as const;

export const footer = {
  legalLinks: [
    { label: "Aviso legal", href: "/aviso-legal" },
    { label: "Política de privacidad", href: "/politica-privacidad" },
  ],
  copyright: `© ${new Date().getFullYear()} ${site.name}. Todos los derechos reservados.`,
} as const;
