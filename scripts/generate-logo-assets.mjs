// Script puntual: genera public/logo.png (transparente) y public/logo-dark.png
// a partir del logo.png original, que tiene el fondo claro incrustado sin canal
// alfa. No forma parte de npm run build; se ejecuta a mano cuando haga falta
// regenerar los assets. Depende de `sharp`, ya presente en node_modules como
// dependencia transitiva de Astro.
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, "..", "public", "logo.png");
const OUT_LIGHT = SRC;
const OUT_DARK = path.join(__dirname, "..", "public", "logo-dark.png");

const BG = [241, 243, 245]; // hueso
const INK = [20, 39, 62]; // tinta
const ACCENT = [10, 90, 160]; // señal

const DARK_INK_RGB = [241, 243, 245]; // hueso-fija
const DARK_ACCENT_RGB = [76, 159, 224]; // señal modo oscuro (#4c9fe0)

function dist(a, b) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
if (channels !== 4) throw new Error(`Se esperaban 4 canales, se obtuvieron ${channels}`);

const lightOut = Buffer.alloc(data.length);
const darkOut = Buffer.alloc(data.length);

// Para depurar/verificar la clasificación de color: acumula muestras únicas.
const seen = new Map();

for (let i = 0; i < data.length; i += 4) {
  const rgb = [data[i], data[i + 1], data[i + 2]];
  const dBg = dist(rgb, BG);
  const dInk = dist(rgb, INK);
  const dAccent = dist(rgb, ACCENT);
  const cluster = dInk <= dAccent ? "ink" : "accent";
  const dFg = Math.min(dInk, dAccent);

  let alpha;
  if (dBg < 6) alpha = 0;
  else if (dFg < 6) alpha = 255;
  else alpha = Math.round(clamp(dBg / (dBg + dFg), 0, 1) * 255);

  // claro: color original + alfa calculado
  lightOut[i] = rgb[0];
  lightOut[i + 1] = rgb[1];
  lightOut[i + 2] = rgb[2];
  lightOut[i + 3] = alpha;

  // oscuro: recolorea según el clúster, mismo alfa
  const darkRgb = alpha === 0 ? [0, 0, 0] : cluster === "ink" ? DARK_INK_RGB : DARK_ACCENT_RGB;
  darkOut[i] = darkRgb[0];
  darkOut[i + 1] = darkRgb[1];
  darkOut[i + 2] = darkRgb[2];
  darkOut[i + 3] = alpha;

  if (alpha > 10) {
    const key = rgb.join(",");
    if (!seen.has(key)) seen.set(key, { count: 0, cluster, alpha });
    seen.get(key).count++;
  }
}

console.log(`Clústeres de color detectados (alfa > 10), ${seen.size} tonos únicos:`);
for (const [rgb, info] of [...seen.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 15)) {
  console.log(`  rgb(${rgb}) -> ${info.cluster}, alpha~${info.alpha}, ${info.count}px`);
}

await sharp(lightOut, { raw: { width, height, channels: 4 } }).png().toFile(OUT_LIGHT);
await sharp(darkOut, { raw: { width, height, channels: 4 } }).png().toFile(OUT_DARK);

console.log(`\nEscrito: ${OUT_LIGHT}`);
console.log(`Escrito: ${OUT_DARK}`);
