import type { Documento, EstadoDemo, Expediente } from "./types.ts";

/** Trámites ficticios y los documentos que requiere cada uno. */
const TRAMITES: { nombre: string; docs: string[] }[] = [
  {
    nombre: "IRPF 2025",
    docs: ["DNI/NIE del titular", "Certificado de retenciones", "Datos fiscales", "Justificantes de deducciones"],
  },
  { nombre: "IVA 1T", docs: ["Facturas emitidas", "Facturas recibidas", "Extracto bancario"] },
  { nombre: "Alta de autónomo", docs: ["DNI/NIE", "Certificado bancario", "Contrato de alquiler"] },
  { nombre: "Cierre contable", docs: ["Extractos bancarios", "Facturas de proveedores", "Inventario"] },
  { nombre: "Nóminas", docs: ["Altas y bajas", "Partes de variación", "Contratos"] },
  {
    nombre: "Impuesto de Sociedades",
    docs: ["Cuentas anuales", "Libro de actas", "Modelo 200 previo"],
  },
];

/** Nombres inventados (no corresponden a ninguna empresa o persona real). */
const CLIENTES = [
  "Taller Norte Demo S.L.",
  "Clínica Muestra",
  "Panadería La Hogaza (ficticia)",
  "Estudio Plano Cero",
  "Ferretería Sur Demo",
  "Academia Prueba",
  "Transportes Getafe Demo",
  "Peluquería Ejemplo Centro",
  "Gestión Ficticia Pinto S.L.",
  "Carpintería Valle Demo",
  "Papelería Cuaderno Azul",
  "Consultora Brújula Demo",
  "Frutería El Cesto (ficticia)",
  "Lavandería Burbuja Demo",
  "Estudio Fotográfico Lente",
  "Electricidad Chispa Demo",
  "Librería Páginas Demo",
  "Mudanzas Camino Demo",
  "Cafetería Rincón Ficticio",
  "Reformas Ladrillo Demo",
  "Floristería Pétalo Demo",
  "Óptica Visión Demo",
  "Gimnasio Impulso Demo",
  "Imprenta Tinta Demo",
];

type Objetivo = "pendiente" | "parcial" | "completo" | "revision";

/** 8 pendientes, 6 parciales, 7 completos y 3 en revisión. */
const OBJETIVOS: Objetivo[] = [
  ...Array<Objetivo>(8).fill("pendiente"),
  ...Array<Objetivo>(6).fill("parcial"),
  ...Array<Objetivo>(7).fill("completo"),
  ...Array<Objetivo>(3).fill("revision"),
];

/**
 * Escenario inicial determinista: sin azar, para que el reinicio sea idéntico.
 * El índice 7 es coprimo con 24, así que reparte los estados sin repetir ninguno.
 */
export function crearEstadoInicial(): EstadoDemo {
  let pendientesVistos = 0;

  const expedientes: Expediente[] = CLIENTES.map((cliente, i) => {
    const objetivo = OBJETIVOS[(i * 7) % OBJETIVOS.length];
    const tramite = TRAMITES[i % TRAMITES.length];
    const n = tramite.docs.length;
    const recibidos = objetivo === "parcial" ? 1 + (i % (n - 1)) : 0;

    const documentos: Documento[] = tramite.docs.map((nombre, j) => {
      let estado: Documento["estado"] = "pendiente";
      if (objetivo === "completo") estado = "recibido";
      else if (objetivo === "parcial" && j < recibidos) estado = "recibido";
      else if (objetivo === "revision") estado = j === 0 ? "dudoso" : j === 1 ? "recibido" : "pendiente";
      return { id: `d${j + 1}`, nombre, estado, vencimiento: 2 + ((i * 3 + j) % 6) };
    });

    // De los pendientes, los 4 primeros aún no se han solicitado.
    let solicitado = true;
    if (objetivo === "pendiente") {
      solicitado = pendientesVistos >= 4;
      pendientesVistos++;
    }

    const exp: Expediente = {
      id: `EXP-${String(i + 1).padStart(3, "0")}`,
      cliente,
      tramite: tramite.nombre,
      documentos,
      solicitado,
      enRevision: false,
      cerrado: false,
    };
    if (objetivo === "revision") {
      exp.motivoRevision = `Documento dudoso: «${documentos[0].nombre}» ilegible o incoherente.`;
    }
    return exp;
  });

  return { ahora: 0, expedientes, historial: [] };
}
