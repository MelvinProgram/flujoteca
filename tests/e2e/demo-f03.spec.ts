import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const URL = "/demo/recogida-documental/";

const kpi = (page: Page, k: string) => page.locator(`#kpi-${k}`);
const fila = (page: Page, id: string) => page.getByRole("button", { name: new RegExp(id) });
const boton = (page: Page, nombre: string) => page.getByRole("button", { name: nombre, exact: true });

test.beforeEach(async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator("#demo-list li")).toHaveCount(24);
});

test("escenario inicial: aviso, 24 expedientes y métricas 8/7/3", async ({ page }) => {
  await expect(page.getByText("DEMO CON DATOS FICTICIOS")).toBeVisible();
  await expect(kpi(page, "pendientes")).toHaveText("8");
  await expect(kpi(page, "completos")).toHaveText("7");
  await expect(kpi(page, "enRevision")).toHaveText("3");
  await expect(kpi(page, "solicitudes")).toHaveText("0");
  await expect(page.getByRole("button", { name: /^Parcial \(6\)/ })).toBeVisible();
});

test("filtros y búsqueda", async ({ page }) => {
  await page.getByRole("button", { name: /^En revisión \(3\)/ }).click();
  await expect(page.locator("#demo-list li")).toHaveCount(3);
  await page.getByRole("button", { name: /^Todos/ }).click();
  await page.getByLabel("Buscar cliente").fill("zzz");
  await expect(page.getByText("Ningún expediente coincide")).toBeVisible();
});

test("solicitud, recordatorio duplicado bloqueado y nuevo vencimiento", async ({ page }) => {
  await fila(page, "EXP-001").click();
  // Sin solicitar no se puede recordar ni finalizar
  await expect(boton(page, "Enviar recordatorio")).toBeDisabled();
  await expect(boton(page, "Finalizar expediente")).toBeDisabled();

  await boton(page, "Solicitar documentación").click();
  await expect(kpi(page, "solicitudes")).toHaveText("1");
  await expect(boton(page, "Solicitar documentación")).toBeDisabled();
  await expect(page.locator("#demo-detail pre")).toContainText("Para tramitar");

  await boton(page, "Enviar recordatorio").click();
  await expect(kpi(page, "recordatorios")).toHaveText("1");
  await boton(page, "Enviar recordatorio").click();
  await expect(kpi(page, "recordatorios")).toHaveText("1");
  await expect(kpi(page, "duplicados")).toHaveText("1");
  await expect(page.locator("#demo-live")).toContainText("Duplicado evitado");

  // Al pasar el vencimiento hay plazo nuevo y se permite otro recordatorio
  await boton(page, "Avanzar 7 días").click();
  await boton(page, "Avanzar 7 días").click();
  await boton(page, "Enviar recordatorio").click();
  await expect(kpi(page, "recordatorios")).toHaveText("2");
});

test("documento dudoso exige revisión humana antes de finalizar", async ({ page }) => {
  await fila(page, "EXP-001").click();
  await boton(page, "Solicitar documentación").click();
  await boton(page, "Recibir (dudoso)").first().click();
  await expect(kpi(page, "enRevision")).toHaveText("4");
  await expect(boton(page, "Finalizar expediente")).toBeDisabled();

  await boton(page, "Aprobar revisión").click();
  await expect(kpi(page, "enRevision")).toHaveText("3");

  while (await boton(page, "Recibir").count()) await boton(page, "Recibir").first().click();
  await expect(kpi(page, "completos")).toHaveText("8");
  await boton(page, "Finalizar expediente").click();
  await expect(page.locator("#demo-detail")).toContainText("Finalizado");
  await expect(page.locator("#demo-history li").first()).toContainText("Expediente finalizado");
});

test("reinicio restaura el escenario", async ({ page }) => {
  await fila(page, "EXP-001").click();
  await boton(page, "Solicitar documentación").click();
  await page.getByRole("button", { name: "Avanzar 1 día" }).click();
  await page.getByRole("button", { name: "Reiniciar escenario" }).click();
  await expect(kpi(page, "solicitudes")).toHaveText("0");
  await expect(kpi(page, "minutos")).toHaveText("0 min");
  await expect(page.locator("#demo-history")).toContainText("Aún no hay acciones");
  await expect(page.locator("#demo-list li")).toHaveCount(24);
});

test("calculadora: cálculo hipotético y validación", async ({ page }) => {
  await expect(page.getByText("HIPÓTESIS, NO RESULTADOS REALES")).toBeVisible();
  await expect(page.locator("#calc-ahorroMes")).toHaveText(/300\s*€/);
  await expect(page.locator("#calc-ahorroAnio")).toHaveText(/3\.?600\s*€/);
  await page.getByLabel("Reducción hipotética (%)").fill("150");
  await expect(page.locator("#demo-calc-errors")).toContainText("entre 0 y 100");
  await expect(page.locator("#demo-calc-out")).toBeHidden();
});

test("no hay peticiones a otros dominios ni envío de formularios", async ({ page, baseURL }) => {
  const externas: string[] = [];
  page.on("request", (r) => {
    if (!r.url().startsWith(baseURL!) && !r.url().startsWith("data:")) externas.push(r.url());
  });
  await page.goto(URL);
  await fila(page, "EXP-001").click();
  await boton(page, "Solicitar documentación").click();
  await boton(page, "Enviar recordatorio").click();
  expect(externas).toEqual([]);
});

test("sin desbordamiento horizontal", async ({ page }) => {
  const [scrollW, innerW] = await page.evaluate(() => [
    document.documentElement.scrollWidth,
    window.innerWidth,
  ]);
  expect(scrollW).toBeLessThanOrEqual(innerW);
});

test("accesibilidad (axe): sin violaciones graves ni críticas", async ({ page }) => {
  await fila(page, "EXP-006").click();
  const r = await new AxeBuilder({ page }).analyze();
  const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(
    graves.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} nodo(s) · ${v.nodes[0]?.target.join(" ")}`),
  ).toEqual([]);
});
