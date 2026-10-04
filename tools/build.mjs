// Empaqueta los CSS y JS del sitio en un archivo cada uno (menos peticiones = carga más rápida en celular).
// Los archivos fuente de css/ y js/ son los que se editan; después se corre:  npm run build
// tests/bundle.test.js falla si los paquetes quedaron desactualizados.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export const CSS_FILES = [
  "css/fonts.css", "css/styles.css", "css/services.css", "css/quoter.css", "css/agenda.css",
  "css/impact.css", "css/economy.css", "css/extras.css",
];

// El orden importa: config → lógica pura → secciones → efectos.
export const JS_FILES = [
  "js/config.js", "js/pricing.js", "js/whatsapp.js", "js/main.js", "js/hero.js",
  "js/services.js", "js/quoter.js", "js/booking.js", "js/agenda.js", "js/impact.js",
  "js/economy.js", "js/payment-story.js", "js/qr.js", "js/contact.js", "js/team.js", "js/climate.js",
  "js/present.js", "js/fx.js",
];

export const OUT_CSS = "css/oxifreeze.bundle.css";
export const OUT_JS = "js/oxifreeze.bundle.js";

const HEADER = (kind) =>
  `/* ARCHIVO GENERADO por tools/build.mjs — no lo edites a mano.\n   Edita los ${kind} fuente y corre: npm run build */\n`;

// En JS cada archivo va en su propio try/catch: si una sección falla, las demás siguen funcionando
// (igual que cuando eran <script> separados).
// Cada archivo queda como una función de la lista MODULES; se ejecutan en tareas separadas.
const wrapJs = (f, src) =>
  `["${f}", () => {\ntry {\n${src}\n} catch (err) {\n  console.error("[oxifreeze] Falló ${f}", err);\n}\n}],\n`;

async function concat(files, wrap) {
  const parts = await Promise.all(files.map(async (f) => {
    const src = (await readFile(join(ROOT, f), "utf8")).replace(/\r\n/g, "\n").trimEnd();
    return `/* ---- ${f} ---- */\n${wrap ? wrap(f, src) : `${src}\n`}`;
  }));
  return parts.join("\n");
}

// Todo el JS arranca DESPUÉS del primer pintado: así el hero (HTML + CSS) se ve de inmediato
// y el trabajo de JS (armar secciones, medir el layout) no retrasa lo primero que ve el usuario.
// Además, cada módulo corre en su propia tarea y entre uno y otro se le cede el control al
// navegador: así nunca hay una sola tarea larga que congele la página mientras arranca.
const bootJs = (body) => `(() => {
"use strict";
const MODULES = [
${body}
];
const yieldToMain = () =>
  (globalThis.scheduler && typeof scheduler.yield === "function")
    ? scheduler.yield()
    : new Promise((resolve) => setTimeout(resolve, 0));
// Tiempo de arranque de cada módulo (ms), para diagnosticar rendimiento: OxiBootTimes en la consola.
const times = (window.OxiBootTimes = {});
async function bootOxifreeze() {
  for (const [name, run] of MODULES) {
    const t0 = performance.now();
    run();
    times[name] = Math.round(performance.now() - t0);
    // En segundo plano los timers se frenan (~1/s): ahí conviene terminar de corrido.
    if (!document.hidden) await yieldToMain();
  }
}
// rAF → setTimeout: corre justo después de que el navegador pintó el primer cuadro.
const start = () => requestAnimationFrame(() => setTimeout(bootOxifreeze, 0));
if (document.visibilityState === "hidden") setTimeout(bootOxifreeze, 0); // pestaña en segundo plano: rAF no corre
else start();
})();
`;

export async function buildBundles() {
  return {
    css: HEADER("CSS de css/") + await concat(CSS_FILES),
    js: HEADER("JS de js/") + bootJs(await concat(JS_FILES, wrapJs)),
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { css, js } = await buildBundles();
  await writeFile(join(ROOT, OUT_CSS), css);
  await writeFile(join(ROOT, OUT_JS), js);
  console.log(`ok ${OUT_CSS} (${(css.length / 1024).toFixed(1)} KB) · ${OUT_JS} (${(js.length / 1024).toFixed(1)} KB)`);
}
