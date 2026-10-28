// Servidor estático mínimo para `dist/`, solo para las pruebas E2E.
// `astro preview` se desacopla del proceso en algunos entornos, y Playwright
// necesita un servidor que siga en primer plano. Uso: node scripts/serve-dist.mjs [puerto]
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve("dist");
const port = Number(process.argv[2] ?? 4399);
const tipos = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".xml": "application/xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

createServer(async (req, res) => {
  const ruta = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let archivo = normalize(join(root, ruta));
  if (!archivo.startsWith(root)) return res.writeHead(403).end();
  if (!extname(archivo)) archivo = join(archivo, "index.html");
  try {
    const datos = await readFile(archivo);
    res.writeHead(200, { "content-type": tipos[extname(archivo)] ?? "application/octet-stream" }).end(datos);
  } catch {
    res.writeHead(404, { "content-type": "text/plain" }).end("404");
  }
}).listen(port, () => console.log(`dist/ en http://localhost:${port}`));
