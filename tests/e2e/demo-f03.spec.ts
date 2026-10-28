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

/* ---------- Simulador de reintentos ---------- */
const sim = (page: Page, id: string) => page.locator(`#demo-retry-${id}`);

test("reintentos: sin respuesta se agotan los reintentos y pasa a una persona", async ({ page }) => {
  await page.getByLabel("El cliente…").selectOption("nunca");
  await expect(sim(page, "avisos")).toHaveText("0");
  const siguiente = page.getByRole("button", { name: "Siguiente paso" });
  for (let i = 0; i < 5; i++) await siguiente.click();
  await expect(sim(page, "avisos")).toHaveText("4");
  await expect(sim(page, "dias")).toHaveText("12");
  await expect(sim(page, "steps")).toContainText("Resultado: pasa a una persona del despacho");
  await expect(sim(page, "steps")).toContainText("Último plazo: día");
  await expect(siguiente).toBeDisabled();
  await expect(sim(page, "mail")).toContainText("Último aviso");
  await expect(sim(page, "mail")).toContainText("No se ha enviado ningún correo");
});

test("reintentos: documento dudoso nunca termina como completo", async ({ page }) => {
  await page.getByLabel("El cliente…").selectOption("dudoso");
  const siguiente = page.getByRole("button", { name: "Siguiente paso" });
  for (let i = 0; i < 3; i++) await siguiente.click();
  await expect(sim(page, "steps")).toContainText("Resultado: pasa a una persona del despacho");
  await expect(sim(page, "steps")).not.toContainText("expediente completo");
});

test("reintentos: cambiar la configuración reinicia el recorrido", async ({ page }) => {
  const siguiente = page.getByRole("button", { name: "Siguiente paso" });
  await siguiente.click();
  await siguiente.click();
  await expect(sim(page, "avisos")).toHaveText("2");
  await page.getByLabel("Reintentar cada").selectOption("5");
  await expect(sim(page, "avisos")).toHaveText("0");
  await expect(sim(page, "mail")).toContainText("Pulsa «Siguiente paso»");
});

test("reintentos: reproducir avanza solo hasta el resultado", async ({ page }) => {
  await page.getByLabel("El cliente…").selectOption("primer_aviso");
  await page.getByRole("button", { name: "Reproducir" }).click();
  await expect(sim(page, "steps")).toContainText("Resultado: expediente completo", { timeout: 10_000 });
  await expect(page.getByRole("button", { name: "Reproducir" })).toBeDisabled();
  await page.getByRole("button", { name: "Reiniciar", exact: true }).last().click();
  await expect(sim(page, "avisos")).toHaveText("0");
});

test("reintentos: el correo se ve junto al paso en móvil y en el panel en escritorio", async ({ page }, testInfo) => {
  await page.getByRole("button", { name: "Siguiente paso" }).click();
  const textoCorreo = "Para tramitar"; // frase única del cuerpo del primer correo
  if (testInfo.project.name === "movil") {
    await expect(sim(page, "steps").getByText(textoCorreo)).toBeVisible();
    await expect(sim(page, "mail")).toBeHidden();
    // Al avanzar, el correo del nuevo paso queda abierto y el anterior se pliega
    await page.getByRole("button", { name: "Siguiente paso" }).click();
    await expect(sim(page, "steps").locator("details[open]")).toHaveCount(1);
    await expect(sim(page, "steps").locator("details")).toHaveCount(2);
  } else {
    await expect(sim(page, "mail").getByText(textoCorreo)).toBeVisible();
    await expect(sim(page, "steps").locator("details").first()).toBeHidden();
  }
});

/* ---------- Accesibilidad: teclado y modo oscuro ---------- */
test("teclado: el primer Tab ofrece «Saltar al contenido» y lleva al main", async ({ page }) => {
  await page.keyboard.press("Tab");
  const salto = page.getByRole("link", { name: "Saltar al contenido" });
  await expect(salto).toBeFocused();
  await expect(salto).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.locator("main#contenido")).toBeFocused();
});

test("teclado: el foco en la cabecera la muestra aunque se haya ocultado al hacer scroll", async ({ page }) => {
  await page.mouse.move(5, 300);
  await page.mouse.wheel(0, 1600);
  await expect.poll(() => page.evaluate(() => document.querySelector("#site-header")!.getBoundingClientRect().top)).toBeLessThan(0);
  // Esperar a que Lenis termine de frenar: sus últimos eventos de scroll volverían a ocultar la cabecera
  let previo = -1;
  await expect
    .poll(async () => {
      const y = await page.evaluate(() => Math.round(scrollY));
      const quieto = y === previo;
      previo = y;
      return quieto;
    }, { intervals: [400] })
    .toBe(true);
  await page.evaluate(() => document.querySelector<HTMLElement>("#site-header a")!.focus());
  await expect.poll(() => page.evaluate(() => document.querySelector("#site-header")!.getBoundingClientRect().top)).toBeGreaterThanOrEqual(0);
});

test.describe("modo oscuro", () => {
  test.use({ colorScheme: "dark" });

  test("axe (contraste incluido) con el simulador y el detalle abiertos, y botón en hover", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("flujoteca-theme", "dark"));
    await page.goto(URL);
    await expect(page.locator("html")).toHaveClass(/dark/);
    await fila(page, "EXP-004").click();
    await page.getByLabel("El cliente…").selectOption("nunca");
    for (let i = 0; i < 4; i++) await page.getByRole("button", { name: "Siguiente paso" }).click();
    await page.getByRole("button", { name: "Siguiente paso" }).hover();
    await page.waitForTimeout(500); // fin de la transición de color
    const r = await new AxeBuilder({ page }).analyze();
    const fallos = r.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`);
    expect(fallos).toEqual([]);
  });
});
