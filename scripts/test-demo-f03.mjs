// Pruebas de la lógica pura de la demo F-03. Uso: node scripts/test-demo-f03.mjs
import assert from "node:assert/strict";
import { crearEstadoInicial } from "../src/lib/demo/f03/seed.ts";
import { reducir, crearAlmacen } from "../src/lib/demo/f03/store.ts";
import { estadoDe } from "../src/lib/demo/f03/rules.ts";
import { calcularMetricas, calcularAhorro } from "../src/lib/demo/f03/metrics.ts";
import { generarPasos, resumir, ultimoCorreo, normalizarConfig, CONFIG_INICIAL } from "../src/lib/demo/f03/reintentos.ts";

let n = 0;
const test = (nombre, fn) => {
  fn();
  n++;
  console.log("ok -", nombre);
};
const run = (s, ...cmds) => cmds.reduce((st, c) => reducir(st, c).state, s);
const por = (s, estado) => s.expedientes.filter((e) => estadoDe(e) === estado);

test("semilla: 24 expedientes, 8/6/7/3", () => {
  const s = crearEstadoInicial();
  assert.equal(s.expedientes.length, 24);
  const m = calcularMetricas(s);
  assert.deepEqual([m.pendientes, m.parciales, m.completos, m.enRevision], [8, 6, 7, 3]);
  assert.equal(new Set(s.expedientes.map((e) => e.id)).size, 24);
  assert.equal(s.historial.length, 0);
});

test("semilla: 4 pendientes sin solicitar; el resto solicitado", () => {
  const s = crearEstadoInicial();
  assert.equal(por(s, "pendiente").filter((e) => !e.solicitado).length, 4);
  assert.ok(s.expedientes.filter((e) => estadoDe(e) !== "pendiente").every((e) => e.solicitado));
});

test("el reductor no muta el estado anterior", () => {
  const s = crearEstadoInicial();
  const copia = structuredClone(s);
  const exp = por(s, "pendiente").find((e) => !e.solicitado);
  reducir(s, { tipo: "solicitar", expediente: exp.id });
  assert.deepEqual(s, copia);
});

test("solicitar: actualiza estado, historial y métricas; segunda vez bloqueada", () => {
  let s = crearEstadoInicial();
  const exp = por(s, "pendiente").find((e) => !e.solicitado);
  s = run(s, { tipo: "solicitar", expediente: exp.id });
  assert.equal(s.expedientes.find((e) => e.id === exp.id).solicitado, true);
  assert.equal(calcularMetricas(s).solicitudes, 1);
  const r = reducir(s, { tipo: "solicitar", expediente: exp.id });
  assert.equal(r.eventos[0].resultado, "bloqueado");
  assert.equal(calcularMetricas(r.state).solicitudes, 1);
  assert.ok(s.historial[0].correo.asunto.startsWith("[DEMO]"));
});

test("recibir: no se puede recibir sin solicitud", () => {
  const s = crearEstadoInicial();
  const exp = por(s, "pendiente").find((e) => !e.solicitado);
  const r = reducir(s, { tipo: "recibir", expediente: exp.id, documento: "d1", dudoso: false });
  assert.equal(r.eventos[0].resultado, "bloqueado");
  assert.equal(r.state.expedientes.find((e) => e.id === exp.id).documentos[0].estado, "pendiente");
});

test("pendiente -> parcial -> completo al recibir documentos", () => {
  let s = crearEstadoInicial();
  const exp = por(s, "pendiente").find((e) => e.solicitado);
  const id = exp.id;
  s = run(s, { tipo: "recibir", expediente: id, documento: "d1", dudoso: false });
  assert.equal(estadoDe(s.expedientes.find((e) => e.id === id)), "parcial");
  for (const d of exp.documentos.slice(1)) s = run(s, { tipo: "recibir", expediente: id, documento: d.id, dudoso: false });
  assert.equal(estadoDe(s.expedientes.find((e) => e.id === id)), "completo");
});

test("documento dudoso envía el expediente a revisión y bloquea la finalización", () => {
  let s = crearEstadoInicial();
  const exp = por(s, "pendiente").find((e) => e.solicitado);
  for (const d of exp.documentos) s = run(s, { tipo: "recibir", expediente: exp.id, documento: d.id, dudoso: d.id === "d1" });
  assert.equal(estadoDe(s.expedientes.find((e) => e.id === exp.id)), "revision");
  const r = reducir(s, { tipo: "finalizar", expediente: exp.id });
  assert.equal(r.eventos[0].resultado, "bloqueado");
  assert.equal(r.state.expedientes.find((e) => e.id === exp.id).cerrado, false);
  const ok = run(s, { tipo: "resolver", expediente: exp.id, decision: "aprobar" }, { tipo: "finalizar", expediente: exp.id });
  assert.equal(ok.expedientes.find((e) => e.id === exp.id).cerrado, true);
});

test("incompleto no puede finalizarse", () => {
  const s = crearEstadoInicial();
  for (const e of [...por(s, "pendiente"), ...por(s, "parcial")]) {
    assert.equal(reducir(s, { tipo: "finalizar", expediente: e.id }).eventos[0].resultado, "bloqueado");
  }
});

test("resolver 'reclamar' devuelve los dudosos a pendiente", () => {
  const s = crearEstadoInicial();
  const exp = por(s, "revision")[0];
  const r = reducir(s, { tipo: "resolver", expediente: exp.id, decision: "reclamar" });
  const e = r.state.expedientes.find((x) => x.id === exp.id);
  assert.ok(e.documentos.every((d) => d.estado !== "dudoso"));
  assert.notEqual(estadoDe(e), "revision");
});

test("marcar revisión manual y resolver", () => {
  let s = crearEstadoInicial();
  const exp = por(s, "completo")[0];
  s = run(s, { tipo: "revisar", expediente: exp.id });
  assert.equal(estadoDe(s.expedientes.find((e) => e.id === exp.id)), "revision");
  assert.equal(reducir(s, { tipo: "revisar", expediente: exp.id }).eventos[0].resultado, "bloqueado");
  s = run(s, { tipo: "resolver", expediente: exp.id, decision: "aprobar" });
  assert.equal(estadoDe(s.expedientes.find((e) => e.id === exp.id)), "completo");
});

test("recordatorio duplicado bloqueado para mismo documento y vencimiento", () => {
  let s = crearEstadoInicial();
  const exp = por(s, "pendiente").find((e) => e.solicitado);
  s = run(s, { tipo: "recordar", expediente: exp.id });
  assert.equal(calcularMetricas(s).recordatorios, 1);
  const r = reducir(s, { tipo: "recordar", expediente: exp.id });
  assert.equal(r.eventos.length, 1);
  assert.equal(r.eventos[0].resultado, "bloqueado");
  const m = calcularMetricas(r.state);
  assert.equal(m.recordatorios, 1);
  assert.equal(m.duplicadosEvitados, 1);
});

test("recordatorio parcial: solo se bloquea el documento ya recordado", () => {
  let s = crearEstadoInicial();
  const exp = por(s, "parcial")[0];
  s = run(s, { tipo: "recordar", expediente: exp.id });
  const claves = s.historial.at(-1).claves;
  assert.equal(claves.length, exp.documentos.filter((d) => d.estado === "pendiente").length);
});

test("avanzar el tiempo amplía vencimientos y permite un recordatorio nuevo", () => {
  let s = crearEstadoInicial();
  const exp = por(s, "pendiente").find((e) => e.solicitado);
  s = run(s, { tipo: "recordar", expediente: exp.id });
  s = run(s, { tipo: "avanzar", dias: 7 }, { tipo: "avanzar", dias: 7 });
  assert.ok(s.historial.some((e) => e.accion === "plazo_ampliado" && e.expediente === exp.id));
  const r = reducir(s, { tipo: "recordar", expediente: exp.id });
  assert.equal(r.eventos.at(-1).resultado, "ok");
  assert.equal(calcularMetricas(r.state).recordatorios, 2);
});

test("avanzar el tiempo no altera expedientes sin solicitar", () => {
  const s = crearEstadoInicial();
  const antes = s.expedientes.filter((e) => !e.solicitado).map((e) => JSON.stringify(e.documentos));
  const r = run(s, { tipo: "avanzar", dias: 7 });
  const despues = r.expedientes.filter((e) => !e.solicitado).map((e) => JSON.stringify(e.documentos));
  assert.deepEqual(antes, despues);
});

test("historial: n correlativo y tiempo no decreciente", () => {
  let s = crearEstadoInicial();
  const exp = por(s, "pendiente").find((e) => e.solicitado);
  s = run(s, { tipo: "recordar", expediente: exp.id }, { tipo: "avanzar", dias: 1 }, { tipo: "recordar", expediente: exp.id }, { tipo: "revisar", expediente: exp.id });
  s.historial.forEach((e, i) => assert.equal(e.n, i + 1));
  for (let i = 1; i < s.historial.length; i++) assert.ok(s.historial[i].t >= s.historial[i - 1].t);
});

test("tiempo manual estimado se deriva del historial", () => {
  let s = crearEstadoInicial();
  assert.equal(calcularMetricas(s).minutosManualesEstimados, 0);
  const exp = por(s, "pendiente").find((e) => !e.solicitado);
  s = run(s, { tipo: "solicitar", expediente: exp.id }, { tipo: "recibir", expediente: exp.id, documento: "d1", dudoso: false });
  assert.equal(calcularMetricas(s).minutosManualesEstimados, 8 + 4);
});

test("almacén: despachar notifica y reiniciar restaura la semilla", () => {
  const a = crearAlmacen();
  let avisos = 0;
  a.suscribir(() => avisos++);
  a.despachar({ tipo: "avanzar", dias: 1 });
  assert.equal(a.obtener().historial.length, 1);
  a.reiniciar();
  assert.deepEqual(a.obtener(), crearEstadoInicial());
  assert.equal(avisos, 2);
});

test("calculadora: cálculo y validación", () => {
  const r = calcularAhorro({ expedientesMes: 100, minutosManuales: 30, reduccionPct: 40, costeHora: 25 });
  assert.equal(r.valido, true);
  assert.equal(r.horasManualesMes, 50);
  assert.equal(r.horasAhorradasMes, 20);
  assert.equal(r.ahorroMes, 500);
  assert.equal(r.ahorroAnio, 6000);
  for (const mal of [{ expedientesMes: 0 }, { minutosManuales: -5 }, { reduccionPct: 101 }, { costeHora: NaN }, { expedientesMes: 9999 }]) {
    assert.equal(calcularAhorro({ expedientesMes: 10, minutosManuales: 10, reduccionPct: 10, costeHora: 10, ...mal }).valido, false);
  }
  assert.equal(calcularAhorro({ expedientesMes: 10, minutosManuales: 10, reduccionPct: 0, costeHora: 10 }).ahorroMes, 0);
});

/* ---------- Simulador de reintentos ---------- */
const cfg = (comportamiento, intervalo = 3, maxReintentos = 3) => ({ comportamiento, intervalo, maxReintentos });
const tipos = (c) => generarPasos(c).map((p) => p.tipo);
const COMPORTAMIENTOS = ["primer_aviso", "tras_dos", "nunca", "dudoso"];

test("reintentos: responde al primer aviso -> completo sin reintentos", () => {
  const p = generarPasos(cfg("primer_aviso"));
  assert.deepEqual(tipos(cfg("primer_aviso")), ["solicitud", "recepcion", "resultado"]);
  assert.equal(p.at(-1).final, "completo");
  assert.deepEqual(p.map((x) => x.dia), [0, 1, 3]);
});

test("reintentos: responde tras dos recordatorios", () => {
  const p = generarPasos(cfg("tras_dos", 3, 3));
  assert.deepEqual(tipos(cfg("tras_dos")), ["solicitud", "reintento", "reintento", "recepcion", "resultado"]);
  assert.deepEqual(p.map((x) => x.dia), [0, 3, 6, 7, 9]);
  assert.equal(p.at(-1).final, "completo");
  assert.equal(p.filter((x) => x.ultimoAviso).length, 0, "con max 3 el segundo reintento no es el último");
});

test("reintentos: no responde nunca -> agota reintentos y pasa a una persona", () => {
  for (const max of [2, 3, 4]) {
    const p = generarPasos(cfg("nunca", 5, max));
    assert.equal(p.filter((x) => x.tipo === "reintento").length, max);
    assert.equal(p.filter((x) => x.ultimoAviso).length, 1);
    assert.equal(p.filter((x) => x.ultimoAviso)[0].n, max + 1);
    assert.equal(p.at(-1).final, "persona");
    assert.equal(p.at(-1).dia, (max + 1) * 5);
  }
});

test("reintentos: documento dudoso nunca se da por bueno", () => {
  const p = generarPasos(cfg("dudoso"));
  assert.deepEqual(tipos(cfg("dudoso")), ["solicitud", "recepcion", "resultado"]);
  assert.equal(p.at(-1).final, "persona");
});

test("reintentos: solo termina completo si el cliente responde con documentos correctos", () => {
  for (const c of COMPORTAMIENTOS)
    for (const i of [2, 3, 5])
      for (const m of [2, 3, 4]) {
        const p = generarPasos(cfg(c, i, m));
        assert.equal(p.at(-1).final === "completo", c === "primer_aviso" || c === "tras_dos", c);
        assert.equal(p.filter((x) => x.final).length, 1);
        p.forEach((x, k) => assert.equal(x.n, k + 1));
        for (let k = 1; k < p.length; k++) assert.ok(p[k].dia >= p[k - 1].dia);
      }
});

test("reintentos: cada aviso lleva un plazo nuevo (sin duplicados)", () => {
  for (const c of COMPORTAMIENTOS)
    for (const i of [2, 3, 5])
      for (const m of [2, 3, 4]) {
        const plazos = generarPasos(cfg(c, i, m)).filter((x) => x.correo).map((x) => x.plazo);
        assert.equal(new Set(plazos).size, plazos.length);
      }
});

test("reintentos: resumen derivado de los pasos revelados", () => {
  const p = generarPasos(cfg("nunca", 3, 3));
  assert.deepEqual(resumir(p, 0), { avisos: 0, dias: 0, minutosManuales: 0 });
  assert.deepEqual(resumir(p, 1), { avisos: 1, dias: 0, minutosManuales: 8 });
  assert.deepEqual(resumir(p, 3), { avisos: 3, dias: 6, minutosManuales: 8 + 5 + 5 });
  assert.equal(ultimoCorreo(p, 0), null);
  assert.equal(ultimoCorreo(p, 3).n, 3);
  assert.ok(ultimoCorreo(p, 4).correo.asunto.includes("Último aviso"));
  assert.ok(p.filter((x) => x.correo).every((x) => x.correo.cuerpo.includes("No se ha enviado ningún correo")));
});

test("reintentos: configuración fuera de rango vuelve a la inicial", () => {
  assert.deepEqual(normalizarConfig({ comportamiento: "x", intervalo: 99, maxReintentos: 0 }), CONFIG_INICIAL);
  assert.deepEqual(normalizarConfig({ comportamiento: "nunca", intervalo: 5, maxReintentos: 4 }), cfg("nunca", 5, 4));
});

console.log(`\n${n} pruebas pasadas`);
