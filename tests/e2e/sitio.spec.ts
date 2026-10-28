import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Estilo "Folios de cristal" en toda la web: contraste y accesibilidad en claro y
 * oscuro, y comprobación de que el formulario de contacto no ha cambiado.
 * Se usa `reducedMotion` para que el reveal de GSAP no deje secciones a opacidad 0
 * mientras axe calcula el contraste.
 */
const PAGINAS = ["/", "/aviso-legal/", "/politica-privacidad/", "/condiciones-contratacion/"];

for (const tema of ["claro", "oscuro"] as const) {
  test.describe(`web completa · ${tema}`, () => {
    test.use({ colorScheme: tema === "oscuro" ? "dark" : "light", reducedMotion: "reduce" });

    for (const ruta of PAGINAS) {
      test(`axe sin violaciones en ${ruta}`, async ({ page }) => {
        await page.addInitScript((t) => localStorage.setItem("flujoteca-theme", t), tema === "oscuro" ? "dark" : "light");
        await page.goto(ruta);
        await expect(page.locator("html")).toHaveClass(tema === "oscuro" ? /dark/ : /^(?!.*dark).*$/);
        await page.waitForTimeout(500);
        const r = await new AxeBuilder({ page }).analyze();
        const fallos = r.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`);
        expect(fallos).toEqual([]);
      });
    }
  });
}

test("el formulario de contacto conserva campos, consentimiento y señuelo anti-spam", async ({ page }) => {
  await page.goto("/");
  const form = page.locator("#contact-form");
  for (const name of ["name", "email", "phone", "company", "process", "message", "website", "consent"]) {
    await expect(form.locator(`[name="${name}"]`)).toHaveCount(1);
  }
  await expect(form.locator('[name="name"]')).toHaveAttribute("required", "");
  await expect(form.locator('[name="email"]')).toHaveAttribute("required", "");
  await expect(form.locator('[name="consent"]')).toHaveAttribute("required", "");
  await expect(form.getByRole("button", { type: "submit" } as never)).toBeVisible();
});

test("la portada mantiene sus secciones y el SEO", async ({ page }) => {
  await page.goto("/");
  for (const id of ["inicio", "problema", "flujoteca", "como-funciona", "ejemplo", "herramientas", "faq", "contacto"]) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(3); // Organization, Service y FAQPage
  await expect(page.locator('meta[name="description"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator("main#contenido")).toHaveCount(1);
});
