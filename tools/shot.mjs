// Capturas reales a cualquier tamaño usando Edge/Chrome headless por el protocolo DevTools.
// Uso: node tools/shot.mjs <url> <salida-sin-extensión> <ancho>x<alto> [selector1 selector2 …] [--reduced-motion] [--eval=<js>]
//   Sin selectores: una captura arriba de la página. Con selectores: una por cada uno (hace scroll).
//   --reduced-motion emula prefers-reduced-motion: reduce. --cpu=4 frena el CPU como un celular.
//   --act=<js> corre ANTES de las capturas; --eval=<js> imprime el resultado de una expresión al final.
// Requiere Node 22+ (WebSocket nativo).
import { spawn } from "node:child_process";
import { writeFile, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BROWSERS = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
];
const PORT = 9333;
const args = process.argv.slice(2);
const flags = args.filter((a) => a.startsWith("--"));
const [url, outBase, size = "1920x1080", ...selectors] = args.filter((a) => !a.startsWith("--"));
const reducedMotion = flags.includes("--reduced-motion");
const cpuRate = Number(flags.find((f) => f.startsWith("--cpu="))?.slice(6) || 1); // --cpu=4 ≈ celular
const evalExpr = flags.find((f) => f.startsWith("--eval="))?.slice(7);
const actExpr = flags.find((f) => f.startsWith("--act="))?.slice(6);
if (!url || !outBase) {
  console.error("Uso: node tools/shot.mjs <url> <salida> <ancho>x<alto> [selectores…]");
  process.exit(1);
}
const [width, height] = size.split("x").map(Number);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const profile = await mkdtemp(join(tmpdir(), "oxi-shot-"));
const browser = spawn(BROWSERS[0], [
  "--headless=new", "--disable-gpu", "--hide-scrollbars", `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`, `--window-size=${width},${height}`, "about:blank",
], { stdio: "ignore" });

try {
  let target;
  for (let i = 0; i < 40 && !target; i++) {
    await sleep(250);
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      target = list.find((t) => t.type === "page");
    } catch { /* todavía arrancando */ }
  }
  if (!target) throw new Error("El navegador no respondió");

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0;
  const pending = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const n = ++id;
    pending.set(n, (m) => (m.error ? reject(new Error(m.error.message)) : resolve(m.result)));
    ws.send(JSON.stringify({ id: n, method, params }));
  });
  const evaluate = async (expression) =>
    (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result.value;

  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 768 });
  if (cpuRate > 1) await send("Emulation.setCPUThrottlingRate", { rate: cpuRate });
  if (reducedMotion) {
    await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  }
  await send("Page.enable");
  await send("Page.navigate", { url });
  await sleep(3500);

  const errors = await evaluate("JSON.stringify(window.__oxiErrors || [])");
  if (actExpr) console.log("act:", JSON.stringify(await evaluate(actExpr)));
  const shots = selectors.length ? selectors : [null];
  for (const [i, sel] of shots.entries()) {
    if (sel) {
      // Usa el salto del propio sitio (corrige alturas estimadas de content-visibility) si existe.
      const ok = await evaluate(`(async () => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return false;
        if (window.OxiScrollTo) { await window.OxiScrollTo(el, { smooth: false }); return true; }
        let y = 0, n = el; while (n) { y += n.offsetTop; n = n.offsetParent; }
        window.scrollTo({ top: y - 90, behavior: "instant" }); return true; })()`);
      if (!ok) { console.error(`No existe ${sel}`); continue; }
      await sleep(1800);
    }
    const { data } = await send("Page.captureScreenshot", { format: "png" });
    const file = `${outBase}${shots.length > 1 ? `-${i + 1}` : ""}.png`;
    await writeFile(file, Buffer.from(data, "base64"));
    console.log(`ok ${file}${sel ? ` (${sel})` : ""}`);
  }
  if (errors !== "[]") console.log("errores:", errors);
  if (evalExpr) console.log("eval:", JSON.stringify(await evaluate(evalExpr)));
  ws.close();
} finally {
  browser.kill();
}
