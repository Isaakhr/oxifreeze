const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const ROOT = join(__dirname, "..");
const read = (f) => readFileSync(join(ROOT, f), "utf8").replace(/\r\n/g, "\n");

test("los paquetes CSS/JS están al día con los archivos fuente (si falla: npm run build)", async () => {
  const build = await import("../tools/build.mjs");
  const { css, js } = await build.buildBundles();
  assert.equal(read(build.OUT_CSS), css, "css/oxifreeze.bundle.css desactualizado");
  assert.equal(read(build.OUT_JS), js, "js/oxifreeze.bundle.js desactualizado");
});

test("index.html carga solo los paquetes (y nada de css/ o js/ suelto)", async () => {
  const build = await import("../tools/build.mjs");
  const html = read("index.html");
  assert.ok(html.includes(`href="${build.OUT_CSS}"`), "falta el CSS empaquetado");
  assert.ok(html.includes(`src="${build.OUT_JS}"`), "falta el JS empaquetado");
  for (const f of [...build.CSS_FILES, ...build.JS_FILES]) {
    assert.ok(!html.includes(`"${f}"`), `index.html todavía carga ${f}`);
  }
});
