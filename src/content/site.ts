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
  legalName: "Melvin Brito Aquino", // persona física titular (aún no dado de alta como autónomo)
  tagline: "Automatización de procesos para asesorías y gestorías",
  // <title> de la portada
  seoTitle: "Automatización para Asesorías y Gestorías | Flujoteca",
  // Descripción corta para <meta name="description"> y Open Graph (140-160 caracteres aprox.)
  description:
    "Automatizamos procesos repetitivos de asesorías y gestorías: documentación, recordatorios, onboarding, expedientes y captación de leads.",
  url: "https://flujoteca.es",
  locale: "es_ES",

  contact: {
    email: "hola@flujoteca.es",
    address: "Valdemoro, Madrid",    // Coordenadas aproximadas del municipio de Valdemoro (sin dirección exacta, por privacidad)
    geo: {
      latitude: 40.1903,
      longitude: -3.6772,
    },
  },
  // Zona de servicio mostrada al público (más amplia que el domicilio legal exacto de "contact.address")
  serviceArea: "Sur de Madrid",
  nif: "03481090V", // NIF personal del titular (persona física, aún no dado de alta como autónomo)
} as const;

export const nav = {
  links: [
    { label: "La flujoteca", href: "/#flujoteca" },
    { label: "Cómo funciona", href: "/#como-funciona" },
    { label: "Ejemplo", href: "/#ejemplo" },
    { label: "FAQ", href: "/#faq" },
  ],
  cta: { label: "Analizar mi despacho", href: "/#contacto" },
} as const;

// Tecnologías de automatización que usamos (JSON-LD y llms.txt). Quedan en segundo
// plano en la web: el cliente compra el resultado, no la herramienta.
export const stack = ["Make", "n8n", "API de OpenAI (ChatGPT)"] as const;

export const hero = {
  kicker: "AUTOMATIZACIÓN PARA ASESORÍAS Y GESTORÍAS",
  title: "Recupera las horas que se van en lo repetitivo",
  subtitle:
    "Automatizamos los procesos repetitivos de asesorías y gestorías para que tu equipo dedique menos tiempo a perseguir documentos, enviar recordatorios y actualizar expedientes.",
  cta: { label: "Analizar mi despacho", href: "#contacto" },
  secondaryCta: { label: "Ver automatizaciones", href: "#flujoteca" },
  meta: "Diagnóstico inicial gratuito · Sin compromiso",
  transparencyBadge: "Seleccionando despachos piloto en el sur de Madrid",
} as const;

export const problem = {
  title: "El problema no es la falta de tiempo. Es dónde se va.",
  intro:
    "En muchos despachos, una parte importante del día se va en tareas que se repiten una y otra vez:",
  tasks: [
    "Perseguir documentos que el cliente no envía",
    "Enviar recordatorios de plazos y vencimientos",
    "Actualizar el estado de los expedientes",
    "Responder las mismas consultas de seguimiento",
  ],
  // Solo cifras con fuente verificable. No añadir datos sin comprobar la fuente original.
  stats: [
    {
      value: "84%",
      description:
        "de los asesores reconoce que la tecnología permite automatizar tareas repetitivas y liberar tiempo para actividades más estratégicas",
    },
  ],
  source: {
    label: "Fuente: Wolters Kluwer, Barómetro de la Asesoría 2026.",
    href: "https://www.wolterskluwer.com/es-es/news/barometro-asesoria-2026-retos-despacho-profesional",
  },
} as const;

export const flows = {
  title: "La flujoteca",
  subtitle:
    "Catálogo de automatizaciones pensadas para asesorías y gestorías del sur de Madrid. Cada una se adapta al funcionamiento de tu equipo antes de ponerse en marcha.",
  labels: { problem: "Problema", automates: "Qué automatiza", result: "Resultado" },
  items: [
    {
      code: "F-01",
      name: "Onboarding de clientes",
      problem:
        "Cada cliente nuevo implica cadenas de correo y formularios sueltos para reunir sus datos.",
      automates:
        "Recoge los datos y la documentación del cliente nuevo en un único flujo, con seguimiento de lo que falta.",
      result: "Altas más ordenadas y menos correos de ida y vuelta.",
    },
    {
      code: "F-02",
      name: "Recordatorios",
      problem:
        "Los vencimientos fiscales y administrativos se controlan a mano y acaban convirtiéndose en urgencia.",
      automates:
        "Genera avisos automáticos de plazos, con antelación, para el equipo y para los clientes.",
      result: "Menos plazos al límite y menos seguimiento manual.",
    },
    {
      code: "F-03",
      name: "Recogida documental",
      problem: "Tu equipo pierde tiempo enviando correos para recordar qué documentos faltan.",
      automates: "Centraliza la solicitud, recepción y seguimiento de documentación.",
      result:
        "Menos correos de seguimiento y una visión clara de qué documentación falta en cada expediente.",
    },
    {
      code: "F-04",
      name: "Estados de expediente",
      problem: "Los clientes llaman o escriben para preguntar cómo va su expediente.",
      automates:
        "Informa al cliente del estado de su expediente cuando cambia, sin intervención manual.",
      result: "Menos llamadas de seguimiento y clientes mejor informados.",
    },
    {
      code: "F-05",
      name: "Captación de leads",
      problem:
        "Las solicitudes que llegan por la web se atienden sin filtrar antes de la primera reunión.",
      automates: "Recoge, cualifica y enruta cada solicitud a la persona adecuada.",
      result: "Primeras reuniones con la información ya recogida.",
    },
  ],
} as const;

export const howItWorks = {
  title: "Cómo funciona",
  steps: [
    {
      number: "01",
      title: "Analizamos",
      description: "Identificamos las tareas repetitivas que más tiempo consumen.",
    },
    {
      number: "02",
      title: "Diseñamos",
      description: "Elegimos qué proceso tiene sentido automatizar y cómo debe funcionar.",
    },
    {
      number: "03",
      title: "Implementamos",
      description: "Construimos el flujo utilizando las herramientas adecuadas.",
    },
    {
      number: "04",
      title: "Probamos",
      description:
        "Comprobamos que el flujo funciona correctamente antes de ponerlo en producción.",
    },
    {
      number: "05",
      title: "Mantenemos",
      description: "Monitorizamos y ajustamos el flujo cuando sea necesario.",
    },
  ],
  closing: "El objetivo no es añadir más tecnología a tu despacho. Es quitar trabajo manual.",
} as const;

export const flowDemo = {
  badge: "Ejemplo de funcionamiento",
  title: "Así puede funcionar una automatización",
  subtitle:
    "Escenario ilustrativo del flujo F-03 · Recogida documental. Es un ejemplo con datos ficticios: no corresponde a ningún cliente real.",
  steps: [
    {
      title: "Cliente",
      description: "Un cliente (ficticio) tiene que entregar documentación a su asesoría.",
    },
    {
      title: "Solicitud automática de documentos",
      description:
        "Recibe un correo con la lista de lo que debe aportar (por ejemplo: DNI, extractos, facturas).",
    },
    {
      title: "Recepción de archivos",
      description: "Los archivos llegan a un único lugar, ordenados por expediente.",
    },
    {
      title: "Comprobación de documentación",
      description: "El flujo revisa qué documentos están y cuáles faltan.",
    },
  ],
  decision: {
    question: "¿Falta algún documento?",
    yes: {
      label: "Sí",
      title: "Recordatorio automático",
      description: "El cliente recibe un aviso con lo que falta y el flujo vuelve a comprobar.",
    },
    no: {
      label: "No",
      title: "Aviso al equipo",
      description: "El equipo recibe la notificación de que la documentación está completa.",
    },
  },
  final: {
    title: "Expediente completo",
    description: "Todo en orden, sin haber perseguido a nadie por correo.",
  },
} as const;

export const technology = {
  title: "Conectamos las herramientas que ya utilizas",
  body: "Flujoteca se adapta al ecosistema tecnológico de cada despacho. Diseñamos automatizaciones que conectan correo electrónico, formularios, CRM, gestores documentales, bases de datos y otras herramientas.",
  items: [
    "Correo electrónico",
    "Formularios",
    "CRM",
    "Gestores documentales",
    "Bases de datos",
    "APIs",
    "Make",
    "n8n",
    "OpenAI",
  ],
  note: "La tecnología es el medio. Lo que importa es el resultado en tu día a día.",
} as const;

export const faq = {
  title: "Preguntas frecuentes",
  subtitle: "Las dudas que más nos plantean los despachos antes de empezar.",
  items: [
    {
      question: "¿Tengo que cambiar mi software actual?",
      answer:
        "No. Flujoteca está diseñada para conectar y automatizar procesos alrededor de las herramientas que ya utiliza tu despacho siempre que técnicamente sea posible.",
    },
    {
      question: "¿Necesito conocimientos técnicos?",
      answer:
        "No. Nosotros diseñamos e implementamos la automatización. Solo necesitamos conocer cómo funciona actualmente el proceso.",
    },
    {
      question: "¿Qué herramientas podéis conectar?",
      answer:
        "Depende del proceso. Podemos trabajar con APIs, correo electrónico, formularios, CRM, bases de datos y plataformas de automatización como Make o n8n.",
    },
    {
      question: "¿Cuánto tarda una automatización?",
      answer:
        "Los flujos estándar pueden estar listos en pocos días. El plazo depende de la complejidad, integraciones y accesos necesarios.",
    },
    {
      question: "¿Qué pasa si algo deja de funcionar?",
      answer: "Ofrecemos mantenimiento y soporte según el plan contratado.",
    },
    {
      question: "¿La automatización sustituye a mi equipo?",
      answer:
        "No. El objetivo es eliminar tareas repetitivas para que el equipo pueda centrarse en tareas de mayor valor.",
    },
    {
      question: "¿Cómo automatizar la captación de leads de un despacho?",
      answer:
        "Se conecta el formulario de la web con un flujo (por ejemplo, en Make o n8n) que recoge la solicitud, la cualifica, la envía al CRM o a la herramienta que use el despacho y avisa al equipo. Así la primera reunión empieza con la información ya ordenada.",
    },
    {
      question: "¿Cuánto tiempo ahorra una automatización?",
      answer:
        "Depende del proceso y de cuántas veces se repite. No damos cifras genéricas: en el diagnóstico gratuito analizamos una tarea concreta de tu despacho y vemos qué parte puede automatizarse.",
    },
    {
      question: "¿Qué pasa si mi despacho usa un programa poco habitual o hecho a medida?",
      answer:
        "La mayoría de conexiones se pueden hacer por correo, ficheros o formularios web, así que no depende de que tu programa tenga una integración oficial. En el diagnóstico gratuito se revisa caso por caso.",
    },
    {
      question: "¿Es seguro dar acceso a los datos de mi despacho?",
      answer:
        "Solo se accede a lo estrictamente necesario para el flujo contratado y, cuando corresponde, se formaliza un contrato de encargo de tratamiento de datos antes de empezar.",
    },
    {
      question: "¿Cuánto cuesta?",
      answer:
        "Depende del número de flujos y de la complejidad de cada uno. Se concreta después del diagnóstico gratuito, una vez entendido el proceso.",
    },
    {
      question: "¿Ayuda esto con Verifactu?",
      answer:
        "Flujoteca no es un software de facturación y no sustituye la adaptación de tu despacho a Verifactu. Automatizamos los procesos administrativos que rodean esa gestión.",
    },
  ],
} as const;

export const contactForm = {
  title: "Solicita tu diagnóstico gratuito",
  subtitle:
    "En una sesión de aproximadamente 30 minutos analizamos un proceso concreto de tu despacho, identificamos tareas repetitivas y te mostramos qué partes podrían automatizarse.",
  note: "Sin compromiso. Sin necesidad de cambiar tu software actual.",
  fields: {
    name: { label: "Nombre", placeholder: "Nombre y apellidos" },
    email: { label: "Email", placeholder: "tu@despacho.es" },
    phone: { label: "Teléfono", placeholder: "600 000 000" },
    company: { label: "Empresa", placeholder: "Nombre de la asesoría o gestoría" },
    process: {
      label: "¿Qué proceso te gustaría automatizar?",
      placeholder: "Selecciona una opción",
      options: [
        "Alta de clientes",
        "Recogida de documentación",
        "Recordatorios",
        "Seguimiento de expedientes",
        "Captación de leads",
        "Otro",
      ],
    },
    message: {
      label: "Cuéntanos brevemente qué tarea quieres mejorar",
      placeholder: "Por ejemplo: cómo se hace hoy y qué parte te quita más tiempo",
    },
  },
  consent: {
    text: "He leído y acepto la",
    linkLabel: "política de privacidad",
    linkHref: "/politica-privacidad",
  },
  submitLabel: "Enviar solicitud",
  submittingLabel: "Enviando…",
  success: {
    title: "Solicitud recibida",
    body: "Gracias. Hemos recibido tu solicitud de diagnóstico.",
    next: "Revisaremos la información y nos pondremos en contacto contigo para concretar la sesión.",
  },
  errorMessage:
    "No se ha podido enviar la solicitud. Escríbenos directamente a " + "hola@flujoteca.es" + " o inténtalo de nuevo.",
} as const;

// Estructura preparada para casos reales. NO añadir casos ficticios: solo clientes reales
// y con su permiso. Cuando exista el primero, crear una sección que renderice este array.
export type CaseStudy = {
  client: string;
  initialSituation: string;
  problem: string;
  solution: string;
  result: string;
  tools: readonly string[];
};
export const caseStudies: readonly CaseStudy[] = [];

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
