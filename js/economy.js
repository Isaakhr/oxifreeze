/* Oxifreeze — "Nuestra economía": flujo circular interactivo (SVG generado desde datos),
   pestañas de agentes, resaltado para "Sigue un pago" (payment-story.js) y reparto de cada $100. */
(() => {
  "use strict";

  const svg = document.querySelector("[data-flow]");
  if (!svg) return;

  const NS = "http://www.w3.org/2000/svg";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const TOKEN_DUR = 5;           // segundos que tarda una ficha en recorrer su flujo
  const TOKENS_PER_FLOW = 2;
  const NODE_R = 64;

  const NODES = {
    gobierno: { x: 320, y: 100, name: "Gobierno", sub: "SAT · Ayto. · CFE", icon: "M-22 14h44M-18 10V-6M-6 10V-6M6 10V-6M18 10V-6M-24-10 0-24l24 14Z" },
    familias: { x: 110, y: 470, name: "Familias", sub: "clientes y trabajadores", icon: "M-20 2-0-16 20 2M-14-3v19h28V-3M-4 16V6h8v10" },
    empresas: { x: 530, y: 470, name: "Empresas", sub: "Oxifreeze + proveedores", icon: "M-20 16v-22l12-8v8l12-8v8l12-8v30ZM-12 8h4M0 8h4M12 8h-2" },
  };

  // pts: curva cúbica en el sentido del flujo. side: 1 = etiqueta arriba del texto, -1 = abajo (sin que choque con su pareja).
  const FLOWS = [
    { id: "a1", kind: "money", from: "familias", to: "empresas", label: "Pago", side: 1, pts: [[170, 425], [260, 355], [380, 355], [470, 425]] },
    { id: "a2", kind: "goods", from: "empresas", to: "familias", label: "Servicio de A/C", side: -1, pts: [[462, 452], [380, 405], [260, 405], [178, 452]] },
    { id: "a3", kind: "goods", from: "familias", to: "empresas", label: "Trabajo", side: 1, pts: [[178, 488], [260, 535], [380, 535], [462, 488]] },
    { id: "a4", kind: "money", from: "empresas", to: "familias", label: "Salarios", side: -1, pts: [[470, 515], [380, 590], [260, 590], [170, 515]] },
    { id: "b1", kind: "money", from: "familias", to: "gobierno", label: "Impuestos", side: 1, pts: [[70, 410], [40, 290], [130, 150], [252, 95]] },
    { id: "b2", kind: "goods", from: "gobierno", to: "familias", label: "Calles y luz", side: -1, pts: [[262, 140], [190, 180], [150, 290], [138, 402]] },
    { id: "c1", kind: "money", from: "empresas", to: "gobierno", label: "Impuestos", side: 1, pts: [[570, 410], [600, 290], [510, 150], [388, 95]] },
    { id: "c2", kind: "goods", from: "gobierno", to: "empresas", label: "Permisos", side: -1, pts: [[378, 140], [450, 180], [490, 290], [502, 402]] },
  ];

  const el = (tag, attrs = {}, parent) => {
    const node = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    if (parent) parent.appendChild(node);
    return node;
  };
  const toD = (p) => `M${p[0]} C${p[1]} ${p[2]} ${p[3]}`.replace(/,/g, " ");
  // Para que el texto nunca salga de cabeza, la etiqueta usa la curva en sentido izquierda → derecha.
  const leftToRight = (p) => (p[3][0] >= p[0][0] ? p : [...p].reverse());
  const LABEL_GAP = 17;
  // Curva paralela: desplaza la curva a lo largo de la normal de su cuerda ("arriba" del texto = +).
  function offsetCurve(p, dist) {
    const dx = p[3][0] - p[0][0];
    const dy = p[3][1] - p[0][1];
    const len = Math.hypot(dx, dy);
    const nx = (dy / len) * dist;
    const ny = (-dx / len) * dist;
    return p.map(([x, y]) => [Math.round(x + nx), Math.round(y + ny)]);
  }

  /* ---------- Construcción del SVG ---------- */
  const defs = el("defs", {}, svg);
  ["money", "goods"].forEach((kind) => {
    const m = el("marker", { id: `arrow-${kind}`, viewBox: "0 0 10 10", refX: "7", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse" }, defs);
    el("path", { d: "M0 0 10 5 0 10Z", class: `arrow arrow--${kind}` }, m);
  });

  el("text", { x: 320, y: 278, class: "flow__center" }, svg).textContent = "FLUJO CIRCULAR";
  el("text", { x: 320, y: 300, class: "flow__center flow__center--sub" }, svg).textContent = "de la economía";

  const gPaths = el("g", { class: "flow__paths" }, svg);
  const gLabels = el("g", { class: "flow__labels", "aria-hidden": "true" }, svg);
  const gTokens = el("g", { class: "flow__tokens", "aria-hidden": "true" }, svg);
  const gNodes = el("g", { class: "flow__nodes" }, svg);

  FLOWS.forEach((f) => {
    const common = { "data-kind": f.kind, "data-agents": `${f.from} ${f.to}`, "data-flow-id": f.id };
    el("path", { id: `flow-${f.id}`, d: toD(f.pts), class: `flow-path flow-path--${f.kind}`, "marker-end": `url(#arrow-${f.kind})`, ...common }, gPaths);

    const labelPts = offsetCurve(leftToRight(f.pts), f.side * LABEL_GAP);
    el("path", { id: `label-${f.id}`, d: toD(labelPts), fill: "none", stroke: "none" }, defs);
    const text = el("text", { class: `flow-label flow-label--${f.kind}`, "dominant-baseline": "middle", ...common }, gLabels);
    const tp = el("textPath", { href: `#label-${f.id}`, startOffset: "50%", "text-anchor": "middle" }, text);
    tp.textContent = f.label;

    for (let i = 0; i < TOKENS_PER_FLOW; i++) {
      const g = el("g", { class: `token token--${f.kind}`, ...common }, gTokens);
      if (f.kind === "money") {
        el("circle", { r: "10" }, g);
        el("text", { y: "4.5" }, g).textContent = "$";
      } else {
        el("rect", { x: "-7", y: "-7", width: "14", height: "14", rx: "3", transform: "rotate(45)" }, g);
      }
      const anim = el("animateMotion", { dur: `${TOKEN_DUR}s`, repeatCount: "indefinite", begin: `${-(TOKEN_DUR / TOKENS_PER_FLOW) * i}s` }, g);
      el("mpath", { href: `#flow-${f.id}` }, anim);
    }
  });

  Object.entries(NODES).forEach(([key, n]) => {
    const g = el("g", {
      class: "node", "data-node": key, transform: `translate(${n.x} ${n.y})`,
      tabindex: "0", role: "button", "aria-pressed": "false", "aria-label": `${n.name}: ver qué da y qué recibe`,
    }, gNodes);
    el("circle", { r: NODE_R + 14, class: "node__halo" }, g);
    el("circle", { r: NODE_R, class: "node__disc" }, g);
    el("path", { d: n.icon, class: "node__icon", transform: "translate(0 -24) scale(.9)" }, g);
    el("text", { y: "14", class: "node__name" }, g).textContent = n.name;
    el("text", { y: "34", class: "node__sub" }, g).textContent = n.sub;
  });

  /* ---------- Interacción ---------- */
  const panel = document.querySelector("[data-flow-panel]");
  const tabs = [...panel.querySelectorAll("[data-agent-tab]")];
  const agents = [...panel.querySelectorAll("[data-agent]")];
  const nodes = [...svg.querySelectorAll("[data-node]")];
  const filters = [...document.querySelectorAll("[data-filter]")];

  /* ---------- Resaltado para "Sigue un pago" ---------- */
  const BADGE_CHAR_PX = 13;
  const BADGE_PAD_PX = 26;
  const BADGE_H = 38;
  const NODE_BADGE_OFFSET = NODE_R + 30;
  let badgeLayer = null;

  function badge(x, y, text) {
    // Grupo externo = posición; interno = animación (una animación CSS de transform pisaría el translate).
    const at = el("g", { transform: `translate(${Math.round(x)} ${Math.round(y)})` }, badgeLayer);
    const g = el("g", { class: "flow-badge" }, at);
    const w = text.length * BADGE_CHAR_PX + BADGE_PAD_PX;
    el("rect", { x: -w / 2, y: -BADGE_H / 2, width: w, height: BADGE_H, rx: BADGE_H / 2 }, g);
    el("text", { y: 7 }, g).textContent = text;
  }

  function clearSpotlight() {
    delete svg.dataset.mode;
    svg.querySelectorAll(".is-dim, .is-spot, .is-badged").forEach((n) => n.classList.remove("is-dim", "is-spot", "is-badged"));
    badgeLayer?.remove();
    badgeLayer = null;
  }

  /** Resalta flujos y nodos, y pone montos sobre ellos. Todo lo demás se atenúa. */
  function spotlight({ flows = [], nodes: spotNodes = [], badges = [] }) {
    clearSpotlight();
    resetAgents();
    svg.dataset.mode = "story";
    svg.querySelectorAll("[data-flow-id]").forEach((item) => {
      item.classList.toggle("is-dim", !flows.includes(item.dataset.flowId));
    });
    nodes.forEach((n) => n.classList.toggle("is-spot", spotNodes.includes(n.dataset.node)));
    badgeLayer = el("g", { class: "flow__badges", "aria-hidden": "true" }, svg);
    badges.forEach((b) => {
      if (b.flow) {
        // La etiqueta de esa flecha se oculta: el monto la reemplaza
        svg.querySelector(`.flow-label[data-flow-id="${b.flow}"]`)?.classList.add("is-badged");
        const path = svg.querySelector(`#flow-${b.flow}`);
        const pt = path.getPointAtLength(path.getTotalLength() / 2);
        badge(pt.x, pt.y, b.text);
      } else if (b.node) {
        const n = NODES[b.node];
        badge(n.x, n.y - NODE_BADGE_OFFSET, b.text);
      }
    });
  }

  function resetAgents() {
    delete svg.dataset.active;
    nodes.forEach((n) => n.setAttribute("aria-pressed", "false"));
    tabs.forEach((t) => t.setAttribute("aria-selected", "false"));
    agents.forEach((a) => { a.hidden = true; });
  }

  function selectAgent(key, { scroll = false } = {}) {
    clearSpotlight();
    svg.dataset.active = key;
    nodes.forEach((n) => n.setAttribute("aria-pressed", String(n.dataset.node === key)));
    tabs.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.agentTab === key)));
    agents.forEach((a) => { a.hidden = a.dataset.agent !== key; });
    document.dispatchEvent(new CustomEvent("oxi:agent", { detail: { key } }));
    svg.querySelectorAll("[data-agents]").forEach((item) => {
      item.classList.toggle("is-dim", !item.dataset.agents.split(" ").includes(key));
    });
    if (scroll && window.matchMedia("(max-width: 1023px)").matches) {
      panel.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
    }
  }

  nodes.forEach((n) => {
    n.addEventListener("click", () => selectAgent(n.dataset.node, { scroll: true }));
    n.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectAgent(n.dataset.node, { scroll: true });
      }
    });
  });
  tabs.forEach((t) => t.addEventListener("click", () => selectAgent(t.dataset.agentTab)));
  panel.querySelector("[role=tablist]").addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    next.focus();
    selectAgent(next.dataset.agentTab);
  });

  filters.forEach((btn) => btn.addEventListener("click", () => {
    svg.dataset.filter = btn.dataset.filter;
    filters.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
  }));

  /* ---------- Movimiento ---------- */
  const syncMotion = () => (reduceMotion.matches ? svg.pauseAnimations() : svg.unpauseAnimations());
  reduceMotion.addEventListener("change", syncMotion);
  new IntersectionObserver(([en]) => {
    if (!en.isIntersecting || reduceMotion.matches) svg.pauseAnimations();
    else svg.unpauseAnimations();
  }).observe(svg);
  syncMotion();

  /* ---------- ¿A dónde va cada $100? ---------- */
  const SPLIT_COLORS = { salarios: "#7df9ff", materiales: "#22d3ee", iva: "#1e7bff", transporte: "#8aa4ff", herramientas: "#c6ecff", ganancia: "#ffffff" };
  const SPLIT_ORDER = ["salarios", "materiales", "iva", "transporte", "herramientas", "ganancia"];
  const parts = window.OxiPricing.paymentBreakdown(100);
  const SPLIT = SPLIT_ORDER.map((key) => {
    const p = parts.find((x) => x.key === key);
    return { label: p.label, value: p.amount, color: SPLIT_COLORS[key] };
  });
  const bar = document.querySelector("[data-split]");
  const legend = document.querySelector("[data-split-legend]");
  if (bar && legend) {
    bar.innerHTML = SPLIT.map((s, i) =>
      `<span class="split__seg" style="--w:${s.value}%;--c:${s.color};--i:${i}"><b>$${s.value}</b></span>`).join("");
    legend.innerHTML = SPLIT.map((s) =>
      `<li><i style="--c:${s.color}"></i>${s.label} <strong>$${s.value}</strong></li>`).join("");
    new IntersectionObserver(([en], obs) => {
      if (!en.isIntersecting) return;
      bar.classList.add("is-in");
      obs.disconnect();
    }, { threshold: 0.4 }).observe(bar);
  }

  window.OxiEconomy = { selectAgent, spotlight, clearSpotlight, FLOWS };
})();
