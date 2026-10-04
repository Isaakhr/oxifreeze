const test = require("node:test");
const assert = require("node:assert/strict");
const P = require("../js/pricing.js");
const W = require("../js/whatsapp.js");

test("regla de toneladas: 16 m² por tonelada, redondeando al tamaño comercial", () => {
  assert.equal(P.tonsForArea(12, "minisplit").tons, 1);
  assert.equal(P.tonsForArea(16, "minisplit").tons, 1);
  assert.equal(P.tonsForArea(20, "minisplit").tons, 1.5);
  assert.equal(P.tonsForArea(40, "minisplit").tons, 3);
  assert.equal(P.tonsForArea(30, "ventana").tons, 2);
  assert.equal(P.tonsForArea(20, "central").tons, 3);
});

test("cuarto más grande que el equipo máximo se marca como excedido", () => {
  const r = P.tonsForArea(70, "minisplit");
  assert.equal(r.tons, 3);
  assert.equal(r.exceeds, true);
});

test("cotización 1: instalación minisplit, cuarto de 20 m², 1 equipo, Zona Río", () => {
  const q = P.quote({ service: "instalacion", equipo: "minisplit", mode: "m2", m2: 20, units: 1, zona: "centro" });
  assert.equal(q.tons, 1.5);
  assert.equal(q.perUnit, 3100);   // 2800 + 600 × 0.5
  assert.equal(q.discount, 0);
  assert.equal(q.travel, 0);
  assert.equal(q.total, 3100);
  assert.equal(q.iva, 428);        // 3100 − 3100 / 1.16
});

test("cotización 2: mantenimiento 3 minisplits de 2 ton en Playas", () => {
  const q = P.quote({ service: "mantenimiento", equipo: "minisplit", mode: "tons", tons: 2, units: 3, zona: "playas" });
  assert.equal(q.perUnit, 900);    // 750 + 150 × 1
  assert.equal(q.gross, 2700);
  assert.equal(q.discount, 180);   // 10 % de 2 equipos × 900
  assert.equal(q.travel, 150);
  assert.equal(q.total, 2670);
});

test("cotización 3: recarga de gas a equipo de ventana, cuarto de 30 m², Valle de las Palmas", () => {
  const q = P.quote({ service: "reparacion", equipo: "ventana", mode: "m2", m2: 30, units: 1, zona: "valle" });
  assert.equal(q.tons, 2);
  assert.equal(q.perUnit, 1400);   // 1100 + 300 × 1
  assert.equal(q.total, 1750);     // + 350 traslado
});

test("rechaza datos incompletos o tamaños que no existen", () => {
  assert.throws(() => P.quote({ service: "x", equipo: "minisplit", mode: "m2", m2: 20, units: 1, zona: "centro" }));
  assert.throws(() => P.quote({ service: "instalacion", equipo: "central", mode: "tons", tons: 1, units: 1, zona: "centro" }));
});

test("unidades se limitan a 1–10", () => {
  const q = P.quote({ service: "limpieza", equipo: "minisplit", mode: "tons", tons: 1, units: 99, zona: "centro" });
  assert.equal(q.units, 10);
});

test("mensaje de WhatsApp incluye todos los datos y el link es válido", () => {
  const q = P.quote({ service: "mantenimiento", equipo: "minisplit", mode: "tons", tons: 2, units: 3, zona: "playas" });
  const msg = W.quoteMessage(q, "COT-TEST1");
  for (const s of ["COT-TEST1", "Mantenimiento preventivo", "Minisplit de 2 ton", "3 equipos", "Playas de Tijuana", "-$180 MXN", "$2,670 MXN"]) {
    assert.ok(msg.includes(s), `falta "${s}"`);
  }
  const link = W.waLink("526640000000", msg);
  assert.match(link, /^https:\/\/wa\.me\/526640000000\?text=/);
  assert.equal(decodeURIComponent(link.split("?text=")[1]), msg);
  assert.throws(() => W.waLink("+52 664", msg));
});

test("reparto de un pago real: IVA exacto y el resto proporcional, suma exacta", () => {
  const parts = P.paymentBreakdown(3100);
  const by = Object.fromEntries(parts.map((p) => [p.key, p.amount]));
  assert.equal(by.iva, 428);                 // 3100 − 3100 / 1.16
  assert.equal(by.salarios, 1087);
  assert.equal(by.materiales, 932);
  assert.equal(by.transporte, 249);
  assert.equal(by.herramientas, 155);
  assert.equal(by.ganancia, 249);
  assert.equal(parts.reduce((s, p) => s + p.amount, 0), 3100);
});

test("el reparto siempre suma el total, aunque haya redondeos", () => {
  for (const total of [750, 1200, 2670, 1750, 14000, 999, 1]) {
    const sum = P.paymentBreakdown(total).reduce((s, p) => s + p.amount, 0);
    assert.equal(sum, total, `total ${total}`);
  }
});

test("la cotización incluye los ids de servicio y equipo (para agendar)", () => {
  const q = P.quote({ service: "limpieza", equipo: "ventana", mode: "tons", tons: 1, units: 1, zona: "centro" });
  assert.equal(q.service, "limpieza");
  assert.equal(q.equipo, "ventana");
});
