// Pruebas de la lógica pura de la demo F-03. Uso: node scripts/test-demo-f03.mjs
import assert from "node:assert/strict";
import { crearEstadoInicial } from "../src/lib/demo/f03/seed.ts";
import { reducir, crearAlmacen } from "../src/lib/demo/f03/store.ts";
import { estadoDe } from "../src/lib/demo/f03/rules.ts";
import { calcularMetricas, calcularAhorro } from "../src/lib/demo/f03/metrics.ts";

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

console.log(`\n${n} pruebas pasadas`);
