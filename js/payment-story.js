/* Oxifreeze — "Sigue un pago": recorrido paso a paso del dinero de una cotización real
   por el flujo circular (familias → Oxifreeze → SAT, técnicos, proveedores → de vuelta).
   Los montos salen de la cotización actual y del mismo reparto que "¿A dónde va cada $100?". */
(() => {
  "use strict";

  const root = document.querySelector("[data-story]");
  const E = window.OxiEconomy;
  const P = window.OxiPricing;
  if (!root || !E || !P) return;

  const DEFAULT_TOTAL = 3100;
  const els = {
    text: root.querySelector("[data-story-text]"),
    count: root.querySelector("[data-story-count]"),
    dots: root.querySelector("[data-story-dots]"),
    prev: root.querySelector("[data-story-prev]"),
    next: root.querySelector("[data-story-next]"),
  };
  const money = (n) => "$" + Math.round(n).toLocaleString("es-MX");

  function currentTotal() {
    try { return window.OxiQuoter?.current().total || DEFAULT_TOTAL; } catch { return DEFAULT_TOTAL; }
  }

  /** Los pasos se arman con el total de la cotización: así los números siempre cuadran. */
  function buildSteps(total) {
    const part = Object.fromEntries(P.paymentBreakdown(total).map((p) => [p.key, p.amount]));
    const suppliers = part.materiales + part.transporte + part.herramientas;
    return [
      {
        text: `Una familia de Tijuana paga <b>${money(total)}</b> a Oxifreeze por su servicio de aire acondicionado.`,
        spot: { flows: ["a1", "a2"], nodes: ["familias", "empresas"], badges: [{ flow: "a1", text: money(total) }] },
      },
      {
        text: `<b>${money(part.iva)}</b> de ese pago son IVA: Oxifreeze lo cobra y se lo entrega al <b>SAT</b>.`,
        spot: { flows: ["c1"], nodes: ["empresas", "gobierno"], badges: [{ flow: "c1", text: `IVA ${money(part.iva)}` }] },
      },
      {
        text: `<b>${money(part.salarios)}</b> se van en salarios de técnicos que viven en Tijuana.`,
        spot: { flows: ["a4", "a3"], nodes: ["empresas", "familias"], badges: [{ flow: "a4", text: money(part.salarios) }] },
      },
      {
        text: `<b>${money(suppliers)}</b> se pagan a otras empresas: cobre, gas y filtros (${money(part.materiales)}), transporte (${money(part.transporte)}) y herramientas y web (${money(part.herramientas)}).`,
        spot: { flows: [], nodes: ["empresas"], badges: [{ node: "empresas", text: `Proveedores ${money(suppliers)}` }] },
      },
      {
        text: `Queda una ganancia de <b>${money(part.ganancia)}</b>, y de ahí Oxifreeze también paga ISR. Cuenta: ${money(part.iva)} + ${money(part.salarios)} + ${money(suppliers)} + ${money(part.ganancia)} = <b>${money(total)}</b>.`,
        spot: { flows: ["c1"], nodes: ["empresas"], badges: [{ node: "empresas", text: `Ganancia ${money(part.ganancia)}` }] },
      },
      {
        text: "Con esos impuestos, el gobierno regresa <b>calles, alumbrado y salud</b>, y pone las reglas: permisos, normas y Profeco.",
        spot: { flows: ["b2", "c2"], nodes: ["gobierno"], badges: [] },
      },
      {
        text: "Y los técnicos gastan su salario en tiendas y servicios de Tijuana: el dinero <b>vuelve a circular</b>. Eso es el flujo circular de la economía.",
        spot: { flows: ["a1", "a4", "b1"], nodes: ["familias"], badges: [] },
      },
    ];
  }

  let steps = buildSteps(currentTotal());
  let index = -1; // -1 = presentación del recorrido

  function introText() {
    return `Sigue un pago real de <b>${money(currentTotal())}</b> (tu cotización de arriba) y mira a dónde va cada peso.`;
  }

  function render() {
    // El texto solo contiene montos y frases propias (sin datos que escriba el usuario).
    els.text.innerHTML = index < 0 ? introText() : steps[index].text;
    els.count.textContent = index < 0 ? `${steps.length} pasos` : `Paso ${index + 1} de ${steps.length}`;
    els.prev.disabled = index < 0;
    els.next.textContent = index < 0 ? "Empezar ▶" : index === steps.length - 1 ? "Ver de nuevo ↺" : "Siguiente →";
    els.dots.innerHTML = steps.map((_, i) => `<i class="${i === index ? "is-on" : i < index ? "is-done" : ""}"></i>`).join("");
    if (index < 0) E.clearSpotlight();
    else E.spotlight(steps[index].spot);
  }

  function go(i) {
    if (i === 0 || index < 0) steps = buildSteps(currentTotal()); // el recorrido usa la cotización vigente
    index = Math.max(-1, Math.min(steps.length - 1, i));
    render();
  }

  els.next.addEventListener("click", () => go(index === steps.length - 1 ? 0 : index + 1));
  els.prev.addEventListener("click", () => go(index - 1));

  // Si cambian la cotización mientras el recorrido no ha empezado, se actualiza el monto.
  document.addEventListener("oxi:quote", () => { if (index < 0) render(); });
  // Al tocar un agente, el recorrido se pausa (el resaltado lo maneja economy.js).
  document.addEventListener("oxi:agent", () => {
    index = -1;
    els.text.innerHTML = introText();
    els.count.textContent = `${steps.length} pasos`;
    els.prev.disabled = true;
    els.next.textContent = "Empezar ▶";
    els.dots.innerHTML = steps.map(() => "<i></i>").join("");
  });

  render();
  window.OxiStory = { go, get index() { return index; }, get steps() { return steps; } };
})();
