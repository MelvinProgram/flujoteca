import { defineConfig, devices } from "@playwright/test";

// Pruebas E2E de la demo F-03 contra el build local (nada de Netlify).
// Usa el Chrome instalado (`channel: "chrome"`), así que no descarga navegadores.
const PORT = 4399;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: "chrome",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "escritorio", use: { ...devices["Desktop Chrome"], channel: "chrome" } },
    { name: "movil", use: { ...devices["Pixel 7"], channel: "chrome" } },
  ],
  webServer: {
    command: `npm run build && node scripts/serve-dist.mjs ${PORT}`,
    url: `http://localhost:${PORT}/demo/recogida-documental/`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
