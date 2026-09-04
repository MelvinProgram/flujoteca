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
  url: "https://www.flujoteca.es",
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
    { label: "FAQ", href: "/#faq" },
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
  transparencyBadge: "Seleccionando despachos piloto en el sur de Madrid — plazas limitadas",
} as const;

export const problem = {
  title: "El problema no es la falta de tiempo. Es dónde se va.",
  stats: [
    {
      value: "16",
      unit: "",
      description:
        "horas semanales pierden de media los empleados españoles en tareas administrativas repetitivas",
    },
    {
      value: "2027",
      unit: "",
      description: "es el plazo límite para adaptarse a Verifactu",
    },
    {
      value: "27%",
      unit: "%",
      description: "de las empresas desconoce las nuevas pautas de facturación electrónica",
    },
  ],
  sources: "Fuentes: estudio de Ricoh (2026) y encuesta de Holded (2026).",
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

export const faq = {
  title: "Preguntas frecuentes",
  subtitle: "Las dudas que más nos plantean los despachos antes de empezar.",
  items: [
    {
      question: "¿Tengo que cambiar el software que ya usamos en el despacho?",
      answer:
        "No. Flujoteca se conecta a las herramientas que ya usa tu equipo (correo, hojas de cálculo, CRM, gestor documental, etc.); no sustituye tu sistema de gestión ni te obliga a migrar nada.",
    },
    {
      question: "¿Cuánto tarda en implementarse un flujo?",
      answer:
        "Entre 3 y 7 días laborables desde el diagnóstico, dependiendo de la complejidad del flujo y de la rapidez del despacho en darnos acceso a las herramientas necesarias. Los flujos del catálogo (onboarding, plazos, documentación, estados de expediente) ya están diseñados, así que la mayor parte del tiempo es adaptación y prueba, no desarrollo desde cero.",
    },
    {
      question: "¿Qué pasa si mi despacho usa un programa poco habitual o hecho a medida?",
      answer:
        "La mayoría de conexiones se hacen por correo, ficheros o formularios web, así que no depende de que tu programa tenga una integración \"oficial\". En el diagnóstico gratuito se revisa caso por caso.",
    },
    {
      question: "¿Es seguro dar acceso a los datos fiscales y de clientes de mi despacho?",
      answer:
        "Se firma un contrato de encargo de tratamiento (RGPD Art. 28) antes de tocar cualquier dato, y solo se accede a lo estrictamente necesario para el flujo contratado.",
    },
    {
      question: "¿Qué incluye el soporte mensual?",
      answer:
        "Ajustes y seguimiento continuo para que el flujo se mantenga al día con la forma de trabajar del despacho a medida que cambian sus procesos.",
    },
    {
      question: "No tenemos a nadie técnico en el despacho, ¿necesitamos formación?",
      answer:
        "El flujo se diseña para funcionar sin que nadie del despacho tenga que tocar configuración técnica; el mantenimiento lo llevamos nosotros.",
    },
    {
      question: "¿Cómo funciona la subvención del Kit Digital?",
      answer:
        "Cubre entre 3.000€ y 12.000€ según el tamaño de la empresa; en el diagnóstico gratuito se revisa si el despacho es elegible y se ayuda con la tramitación.",
    },
    {
      question: "¿Dónde se almacenan los datos?",
      answer:
        "Los flujos de trabajo se ejecutan en infraestructura propia (servidor autoalojado), no en un servicio en la nube de terceros. Los datos del despacho pasan por las herramientas que tu equipo ya usa (correo, hojas de cálculo, CRM) y por este servidor, sin almacenarse de forma permanente fuera de esos sistemas.",
    },
    {
      question: "¿Qué pasa si el flujo no encaja después de un tiempo?",
      answer:
        "El soporte mensual incluye ajustes al flujo cuando cambia la forma de trabajar del despacho, sin coste adicional por esos cambios menores. Si el flujo deja de encajar, puedes cancelar el servicio con 30 días de aviso, sin permanencia forzosa.",
    },
    {
      question: "¿Cuánto cuesta?",
      answer:
        "El coste depende del número de flujos y de la complejidad de cada uno; se concreta en el diagnóstico gratuito. Como referencia, la mayoría de despachos entra dentro de la subvención del Kit Digital (3.000€–12.000€), lo que cubre buena parte o la totalidad de la inversión inicial.",
    },
    {
      question: "¿Ayuda esto con Verifactu?",
      answer:
        "Flujoteca no es un software de facturación ni sustituye tu adaptación a Verifactu — eso lo cubre tu programa de facturación certificado. Lo que sí hacemos es automatizar los procesos alrededor de esa gestión (plazos, documentación, seguimiento), para que el cambio normativo no añada más carga manual a tu día a día.",
    },
  ],
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

export const hubspot = {
  portalId: "147950631",
  formGuid: "0d38920b-4077-4e74-8d99-6021133e92c7",
  hublet: "eu1", // cuenta alojada en la UE — el endpoint de envío debe ser api-eu1.hsforms.com, no api.hsforms.com
  gdprConsentEnabled: false, // confirmado: el formulario no tiene activado el consentimiento GDPR explícito
  // El formulario de HubSpot solo tiene "First name" (sin "Last name"), así que
  // el nombre completo del visitante se manda entero a `firstname`, sin dividir.
  fieldMap: {
    firstname: "firstname",
    email: "email",
    phone: "phone",
    company: "company",
    message: "message", // propiedad personalizada creada para este formulario
  },
} as const;

export const footer = {
  legalLinks: [
    { label: "Aviso legal", href: "/aviso-legal" },
    { label: "Política de privacidad", href: "/politica-privacidad" },
  ],
  copyright: `© ${new Date().getFullYear()} ${site.name}. Todos los derechos reservados.`,
} as const;

export const creator = {
  name: "Melvin Brito",
  role: "Creador y desarrollador",
  photo: "/melvin-brito.jpg",
  linkedin: "https://www.linkedin.com/in/melvin-brito-7b7904296/",
  github: "https://github.com/MelvinProgram",
} as const;
