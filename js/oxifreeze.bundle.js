/* ARCHIVO GENERADO por tools/build.mjs — no lo edites a mano.
   Edita los JS de js/ fuente y corre: npm run build */
(() => {
"use strict";
const MODULES = [
/* ---- js/config.js ---- */
["js/config.js", () => {
try {
/* Oxifreeze — configuración editable (todo lo que el equipo puede cambiar sin tocar código).

   whatsappNumber: WhatsApp del equipo para la expo: 52 + 10 dígitos, sin "+", espacios ni guiones.

   team: roles y fotos. Para usar foto, guarden la imagen en assets/equipo/ (cuadrada, ~400 px)
   y escriban la ruta en "photo", por ejemplo "assets/equipo/luka.jpg". Si "photo" está vacío,
   se muestran las iniciales. */
window.OXI_CONFIG = Object.freeze({
  whatsappNumber: "526631015003",

  team: [
    { name: "Luka", role: "CEO · Dirección general", focus: "Estrategia, alianzas y la presentación del proyecto", photo: "" },
    { name: "Iker", role: "CFO · Finanzas", focus: "Costos, precios, impuestos y el reparto de cada $100", photo: "" },
    { name: "Isaak", role: "CTO · Tecnología", focus: "Esta web: cotizador, agenda en línea y diseño", photo: "" },
    { name: "Felipe", role: "COO · Operaciones", focus: "Técnicos, rutas por zona y calidad del servicio", photo: "" },
    { name: "Camarena", role: "CMO · Marketing", focus: "Redes sociales, WhatsApp y atención al cliente", photo: "" },
  ],
});
} catch (err) {
  console.error("[oxifreeze] Falló js/config.js", err);
}
}],

/* ---- js/pricing.js ---- */
["js/pricing.js", () => {
try {
/* Oxifreeze — motor de precios (fuente única de verdad para tarjetas y cotizador).
   Precios ESTIMADOS de una empresa ficticia, en MXN con IVA incluido
   (Profeco exige mostrar al consumidor el precio final con impuestos). */
(function (root) {
  "use strict";

  const IVA_RATE = 0.16;
  const M2_PER_TON = 16;              // clima cálido de Tijuana con sol directo
  const VOLUME_DISCOUNT = 0.10;       // 10 % menos a partir del 2.º equipo

  const EQUIPOS = {
    minisplit: { label: "Minisplit", sizes: [1, 1.5, 2, 3], minTons: 1 },
    ventana: { label: "Ventana", sizes: [1, 1.5, 2], minTons: 1 },
    central: { label: "Central", sizes: [3, 4, 5], minTons: 3 },
  };

  // base = precio por equipo con el tamaño mínimo; perTon = extra por cada tonelada arriba del mínimo
  const SERVICES = {
    instalacion: {
      label: "Instalación",
      equipos: {
        minisplit: { base: 2800, perTon: 600, time: "3–4 h" },
        ventana: { base: 1200, perTon: 300, time: "1–2 h" },
        central: { base: 14000, perTon: 3000, time: "1–2 días" },
      },
    },
    mantenimiento: {
      label: "Mantenimiento preventivo",
      equipos: {
        minisplit: { base: 750, perTon: 150, time: "1–1.5 h" },
        ventana: { base: 550, perTon: 100, time: "45 min" },
        central: { base: 2200, perTon: 300, time: "3 h" },
      },
    },
    reparacion: {
      label: "Reparación / recarga de gas",
      equipos: {
        minisplit: { base: 1400, perTon: 400, time: "1–2 h" },
        ventana: { base: 1100, perTon: 300, time: "1–2 h" },
        central: { base: 3500, perTon: 700, time: "2–4 h" },
      },
    },
    limpieza: {
      label: "Limpieza profunda",
      equipos: {
        minisplit: { base: 1100, perTon: 200, time: "2 h" },
        ventana: { base: 800, perTon: 150, time: "1.5 h" },
        central: { base: 3000, perTon: 500, time: "4 h" },
      },
    },
  };

  const ZONAS = [
    { id: "centro", label: "Zona Centro / Zona Río", fee: 0 },
    { id: "otay", label: "Otay / Garita de Otay", fee: 0 },
    { id: "mesa", label: "La Mesa / Las Américas", fee: 0 },
    { id: "cacho", label: "Chapultepec / Hipódromo / Cacho", fee: 0 },
    { id: "playas", label: "Playas de Tijuana", fee: 150 },
    { id: "presa", label: "La Presa / El Florido", fee: 200 },
    { id: "natura", label: "Santa Fe / Natura / Terrazas", fee: 200 },
    { id: "valle", label: "Valle de las Palmas", fee: 350 },
  ];

  function tonsForArea(m2, equipoId) {
    const { sizes } = EQUIPOS[equipoId];
    const raw = m2 / M2_PER_TON;
    const fit = sizes.find((s) => s >= raw);
    return {
      raw,
      tons: fit ?? sizes[sizes.length - 1],
      exceeds: fit === undefined,
    };
  }

  function unitPrice(serviceId, equipoId, tons) {
    const { base, perTon } = SERVICES[serviceId].equipos[equipoId];
    const extraTons = Math.max(0, tons - EQUIPOS[equipoId].minTons);
    return Math.round(base + perTon * extraTons);
  }

  function fromPrice(serviceId, equipoId) {
    return SERVICES[serviceId].equipos[equipoId].base;
  }

  /**
   * @param {{service:string, equipo:string, mode:"m2"|"tons", m2:number, tons:number, units:number, zona:string}} input
   */
  function quote(input) {
    const service = SERVICES[input.service];
    const equipo = EQUIPOS[input.equipo];
    const zona = ZONAS.find((z) => z.id === input.zona);
    if (!service || !equipo || !zona) throw new Error("Cotización incompleta");

    const units = Math.min(10, Math.max(1, Math.round(input.units) || 1));
    const sizing = input.mode === "m2"
      ? tonsForArea(input.m2, input.equipo)
      : { raw: input.tons, tons: input.tons, exceeds: false };
    if (!equipo.sizes.includes(sizing.tons)) throw new Error("Tamaño no disponible para este equipo");

    const perUnit = unitPrice(input.service, input.equipo, sizing.tons);
    const gross = perUnit * units;
    const discount = Math.round(perUnit * (units - 1) * VOLUME_DISCOUNT);
    const travel = zona.fee;
    const total = gross - discount + travel;
    const iva = Math.round(total - total / (1 + IVA_RATE));

    return {
      serviceLabel: service.label,
      equipoLabel: equipo.label,
      zonaLabel: zona.label,
      tons: sizing.tons,
      exceeds: sizing.exceeds,
      m2: input.mode === "m2" ? input.m2 : null,
      units,
      perUnit,
      gross,
      discount,
      travel,
      total,
      iva,
      time: service.equipos[input.equipo].time,
    };
  }

  const api = { IVA_RATE, M2_PER_TON, VOLUME_DISCOUNT, EQUIPOS, SERVICES, ZONAS, tonsForArea, unitPrice, fromPrice, quote };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.OxiPricing = api;
})(typeof window !== "undefined" ? window : globalThis);
} catch (err) {
  console.error("[oxifreeze] Falló js/pricing.js", err);
}
}],

/* ---- js/whatsapp.js ---- */
["js/whatsapp.js", () => {
try {
/* Oxifreeze — arma mensajes de WhatsApp (link wa.me con texto prellenado). */
(function (root) {
  "use strict";

  const money = (n) => "$" + Math.round(n).toLocaleString("es-MX") + " MXN";

  function tonsText(t) {
    return `${String(t)} ton`;
  }

  function quoteMessage(q, folio) {
    const size = q.m2 ? `${tonsText(q.tons)} (cuarto de ${q.m2} m²)` : tonsText(q.tons);
    const lines = [
      "¡Hola, Oxifreeze! Quiero esta cotización:",
      "",
      `• Folio: ${folio}`,
      `• Servicio: ${q.serviceLabel}`,
      `• Equipo: ${q.equipoLabel} de ${size}`,
      `• Cantidad: ${q.units} ${q.units === 1 ? "equipo" : "equipos"}`,
      `• Zona: ${q.zonaLabel}`,
      "",
      `Precio por equipo: ${money(q.perUnit)}`,
    ];
    if (q.discount > 0) lines.push(`Descuento por volumen: -${money(q.discount)}`);
    if (q.travel > 0) lines.push(`Traslado: ${money(q.travel)}`);
    lines.push(`*Total estimado: ${money(q.total)}* (IVA incluido)`);
    lines.push("", "¿Me confirman disponibilidad?");
    return lines.join("\n");
  }

  function waLink(number, text) {
    if (!/^\d{10,15}$/.test(number)) throw new Error("Número de WhatsApp inválido");
    return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  }

  function makeFolio(prefix, date = new Date()) {
    const stamp = date.getTime().toString(36).toUpperCase().slice(-5);
    const rand = Math.floor(Math.random() * 36 ** 2).toString(36).toUpperCase().padStart(2, "0");
    return `${prefix}-${stamp}${rand}`;
  }

  const api = { money, quoteMessage, waLink, makeFolio };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.OxiWhatsApp = api;
})(typeof window !== "undefined" ? window : globalThis);
} catch (err) {
  console.error("[oxifreeze] Falló js/whatsapp.js", err);
}
}],

/* ---- js/main.js ---- */
["js/main.js", () => {
try {
/* Oxifreeze — navegación: estado al hacer scroll, menú móvil y link activo. */
(() => {
  "use strict";

  const nav = document.querySelector("[data-nav]");
  const burger = document.querySelector("[data-burger]");
  const links = [...document.querySelectorAll(".nav__links a")];
  const SCROLLED_AT = 24;

  const setScrolled = () => nav.classList.toggle("is-scrolled", window.scrollY > SCROLLED_AT);
  window.addEventListener("scroll", setScrolled, { passive: true });
  setScrolled();

  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  };

  burger.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  nav.querySelectorAll(".nav__menu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      setMenu(false);
      burger.focus();
    }
  });
  window.matchMedia("(min-width: 1024px)").addEventListener("change", (e) => e.matches && setMenu(false));

  // Link activo según la sección visible
  const byId = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.remove("is-active"));
        byId.get(entry.target.id)?.classList.add("is-active");
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  document.querySelectorAll("main > section[id]").forEach((s) => observer.observe(s));

  /* ---------- Saltos a secciones (#ancla) ----------
     Con content-visibility las secciones lejanas tienen una altura estimada; al ir llegando se
     miden y cambian de tamaño, así que el salto puede quedar corrido. Después de cada salto se
     revisa dónde quedó la sección y se corrige (hasta 3 veces). */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const STILL_FRAMES = 6;          // ~100 ms sin moverse = el scroll terminó
  const SCROLL_TIMEOUT_MS = 2500;
  const MAX_FIXES = 3;
  const TOLERANCE_PX = 4;

  const waitScrollEnd = () => new Promise((resolve) => {
    const start = performance.now();
    let last = -1;
    let still = 0;
    const tick = () => {
      const y = window.scrollY;
      still = y === last ? still + 1 : 0;
      last = y;
      if (still >= STILL_FRAMES || performance.now() - start > SCROLL_TIMEOUT_MS) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  const scrollPadding = () => parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;

  async function scrollToSection(el, { smooth = true } = {}) {
    el.scrollIntoView({ behavior: smooth && !reduceMotion.matches ? "smooth" : "auto", block: "start" });
    for (let i = 0; i < MAX_FIXES; i++) {
      await waitScrollEnd();
      const delta = el.getBoundingClientRect().top - scrollPadding();
      if (Math.abs(delta) <= TOLERANCE_PX) break;
      window.scrollBy({ top: delta, behavior: "instant" });
    }
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const id = decodeURIComponent(a.getAttribute("href").slice(1));
    const el = id && document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    history.pushState(null, "", `#${id}`);
    scrollToSection(el);
    // El enlace "Saltar al contenido" también debe mover el foco del teclado
    if (a.classList.contains("skip-link")) {
      el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    }
  });

  // Si la página abrió con #ancla (por ejemplo desde un link compartido), se corrige igual.
  const fixInitialHash = () => {
    const el = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (el) scrollToSection(el, { smooth: false });
  };
  if (document.readyState === "complete") fixInitialHash();
  else window.addEventListener("load", fixInitialHash, { once: true });

  window.OxiScrollTo = scrollToSection;
})();
} catch (err) {
  console.error("[oxifreeze] Falló js/main.js", err);
}
}],

/* ---- js/hero.js ---- */
["js/hero.js", () => {
try {
/* Oxifreeze — hero: el scroll baja la temperatura de 38 °C a 22 °C
   y las partículas pasan de brasas que suben a aire frío que fluye. */
(() => {
  "use strict";

  const hero = document.querySelector("[data-hero]");
  if (!hero) return;

  const T_HOT = 38;
  const T_COLD = 22;
  const SCALE_MIN = 15;          // °C en la base de la escala del termómetro
  const SCALE_Y_MIN = 230;       // y (SVG) de 15 °C
  const PX_PER_DEGREE = 7;       // 45 °C queda en y = 20
  const MERCURY_BOTTOM = 258;

  const tempEl = hero.querySelector("[data-temp]");
  const statusEl = hero.querySelector("[data-status]");
  const mercury = hero.querySelector("[data-mercury]");
  const hint = hero.querySelector("[data-hint]");
  const canvas = hero.querySelector("[data-particles]");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const STATUSES = [
    [34, "Sofocante"],
    [29, "Bochorno"],
    [25, "Refrescando"],
    [-Infinity, "Ideal"],
  ];
  const statusFor = (t) => STATUSES.find(([min]) => t >= min)[1];

  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  let target = 1;   // calor objetivo según scroll (1 = 38 °C, 0 = 22 °C)
  let heat = 1;     // calor actual (suavizado)
  let lastShownTemp = null;

  function progressFromScroll() {
    const rect = hero.getBoundingClientRect();
    const travel = hero.offsetHeight - window.innerHeight;
    if (travel <= 0) return 0;
    // El enfriamiento termina un poco antes del final para que se lea el 22 °C.
    return clamp01(-rect.top / (travel * 0.85));
  }

  // Solo toca el DOM cuando el calor cambió: cambiar --heat recalcula estilos de todo el hero.
  let lastRenderedHeat = null;
  function render() {
    const rounded = heat.toFixed(3);
    if (rounded === lastRenderedHeat) return;
    lastRenderedHeat = rounded;
    hero.style.setProperty("--heat", rounded);
    const t = Math.round(lerp(T_COLD, T_HOT, heat));
    if (t !== lastShownTemp) {
      lastShownTemp = t;
      tempEl.textContent = t;
      statusEl.textContent = statusFor(t);
    }
    const exact = lerp(T_COLD, T_HOT, heat);
    const y = SCALE_Y_MIN - (exact - SCALE_MIN) * PX_PER_DEGREE;
    mercury.setAttribute("y", y.toFixed(1));
    mercury.setAttribute("height", (MERCURY_BOTTOM - y).toFixed(1));
    hint.style.opacity = heat < 0.08 ? "0" : "";
  }

  /* ---------------- Partículas ---------------- */
  const ctx = canvas.getContext("2d");
  const particles = [];
  let width = 0;
  let height = 0;
  let heroVisible = true;

  const HOT_RGB = [255, 122, 48];
  const COLD_RGB = [190, 242, 255];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.round(Math.min(140, Math.max(50, (width * height) / 14000)));
    particles.length = 0;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.6 + Math.random() * 2.2,
        speed: 0.4 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.25 + Math.random() * 0.6,
      });
    }
  }

  function step(p, h, time) {
    const wobble = Math.sin(time * 0.0015 + p.phase);
    // Calor: suben lento y ondulan. Frío: corriente de aire diagonal (como sale de un minisplit).
    const vx = lerp(-1.6 * p.speed, wobble * 0.35, h);
    const vy = lerp(0.55 * p.speed + wobble * 0.15, -0.9 * p.speed, h);
    p.x += vx;
    p.y += vy;
    if (p.x < -10) p.x = width + 10;
    if (p.x > width + 10) p.x = -10;
    if (p.y < -10) p.y = height + 10;
    if (p.y > height + 10) p.y = -10;
  }

  function draw(time, animate) {
    ctx.clearRect(0, 0, width, height);
    const h = heat;
    const rgb = HOT_RGB.map((c, i) => Math.round(lerp(COLD_RGB[i], c, h)));
    ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
    ctx.strokeStyle = ctx.fillStyle;
    ctx.globalCompositeOperation = "lighter";

    for (const p of particles) {
      if (animate) step(p, h, time);
      ctx.globalAlpha = p.alpha * lerp(0.9, 0.75, h);
      // En frío, las partículas grandes dejan una estela (flujo de aire).
      if (h < 0.6 && p.r > 1.6) {
        ctx.lineWidth = p.r * 0.7;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + 14 * p.speed * (1 - h), p.y - 5 * p.speed * (1 - h));
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * lerp(1, 1.35, h), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  /* ---------------- Loop ---------------- */
  let rafId = 0;
  // Las partículas se mueven hasta que la página terminó de cargar y el navegador está libre:
  // así la animación no compite con la carga (antes se dibujan quietas).
  let particlesLive = false;
  const IDLE_TIMEOUT_MS = 2500;

  function frame(time) {
    rafId = 0;
    const smooth = reduceMotion.matches ? 1 : 0.12;
    heat += (target - heat) * smooth;
    if (Math.abs(target - heat) < 0.0005) heat = target;
    render();
    const animate = particlesLive && !reduceMotion.matches;
    draw(time, animate);
    if ((animate && heroVisible && !document.hidden) || heat !== target) schedule();
  }

  function startParticles() {
    particlesLive = true;
    schedule();
  }
  const whenIdle = () => (window.requestIdleCallback
    ? requestIdleCallback(startParticles, { timeout: IDLE_TIMEOUT_MS })
    : setTimeout(startParticles, 300));
  if (document.readyState === "complete") whenIdle();
  else window.addEventListener("load", whenIdle, { once: true });

  function schedule() {
    if (!rafId) rafId = requestAnimationFrame(frame);
  }

  function onScroll() {
    target = 1 - progressFromScroll();
    schedule();
  }

  new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    if (heroVisible) schedule();
  }).observe(hero);

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => { resize(); onScroll(); });
  document.addEventListener("visibilitychange", schedule);
  reduceMotion.addEventListener("change", schedule);

  resize();
  target = 1 - progressFromScroll();
  heat = target;
  schedule();
})();
} catch (err) {
  console.error("[oxifreeze] Falló js/hero.js", err);
}
}],

/* ---- js/services.js ---- */
["js/services.js", () => {
try {
/* Oxifreeze — tarjetas de servicios. Los precios "desde" salen de pricing.js
   para que nunca se contradigan con el cotizador. */
(() => {
  "use strict";

  const grid = document.querySelector("[data-services]");
  if (!grid || !window.OxiPricing) return;
  const { fromPrice, SERVICES } = window.OxiPricing;
  const { money } = window.OxiWhatsApp;

  const ICONS = {
    minisplit: '<rect x="4" y="10" width="40" height="16" rx="4"/><path d="M9 20h30M13 32l-2 6M24 32v6M35 32l2 6"/>',
    ventana: '<rect x="8" y="7" width="32" height="34" rx="4"/><path d="M8 27h32M13 33h7M28 33h7M13 14h22M13 19h22"/>',
    central: '<path d="M5 22 24 7l19 15M10 19v22h28V19"/><path d="M17 29h14M17 34h14"/>',
    reparacion: '<path d="M24 6c6 8 10 13 10 19a10 10 0 0 1-20 0c0-6 4-11 10-19Z"/><path d="M20 27a4 4 0 0 0 4 4"/>',
    limpieza: '<path d="M24 5v10M24 33v10M5 24h10M33 24h10M11 11l6 6M31 31l6 6M37 11l-6 6M17 31l-6 6"/><circle cx="24" cy="24" r="4"/>',
    mantenimiento: '<path d="M30 8a9 9 0 0 0-8.5 12L8 33.5a3.5 3.5 0 0 0 5 5L26.5 25A9 9 0 0 0 39 15l-5.5 5.5-5-1-1-5L33 9a9 9 0 0 0-3-1Z"/>',
  };

  const CARDS = [
    { service: "instalacion", equipo: "minisplit", icon: "minisplit", title: "Instalación de minisplit", tag: "El más pedido", featured: "dark",
      desc: "Soportes, tubería de cobre (3 m), vacío al sistema y prueba de funcionamiento. Te dejamos todo limpio." },
    { service: "instalacion", equipo: "ventana", icon: "ventana", title: "Equipo de ventana",
      desc: "Montaje firme, sellado contra polvo y conexión eléctrica segura." },
    { service: "instalacion", equipo: "central", icon: "central", title: "Aire central",
      desc: "Casas completas y negocios: ductos, rejillas y termostato." },
    { service: "reparacion", equipo: "minisplit", icon: "reparacion", title: "Reparación y recarga de gas",
      desc: "Detección de fugas, reparación y recarga de refrigerante R-410A o R-32." },
    { service: "limpieza", equipo: "minisplit", icon: "limpieza", title: "Limpieza profunda",
      desc: "Lavado a presión con bolsa colectora. Adiós moho, polvo y mal olor." },
    { service: "mantenimiento", equipo: "minisplit", icon: "mantenimiento", title: "Mantenimiento preventivo", tag: "Cada 6 meses", featured: "ice",
      desc: "Filtros, serpentines, presión de gas y revisión eléctrica. Un equipo limpio gasta menos luz y dura más años." },
  ];

  const cardHtml = (c) => {
    const time = SERVICES[c.service].equipos[c.equipo].time;
    const price = money(fromPrice(c.service, c.equipo)).replace(" MXN", "");
    return `
      <article class="svc${c.featured ? ` svc--${c.featured}` : ""}">
        <div class="svc__top">
          <span class="svc__icon"><svg viewBox="0 0 48 48" aria-hidden="true">${ICONS[c.icon]}</svg></span>
          ${c.tag ? `<span class="svc__tag">${c.tag}</span>` : ""}
        </div>
        <h3 class="svc__title">${c.title}</h3>
        <p class="svc__desc">${c.desc}</p>
        <div class="svc__foot">
          <p class="svc__price"><span>desde</span> ${price}</p>
          <p class="svc__time"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>${time}</p>
        </div>
        <button class="svc__cta" type="button" data-service="${c.service}" data-equipo="${c.equipo}">
          Cotizar este servicio
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </button>
      </article>`;
  };

  grid.innerHTML = CARDS.map(cardHtml).join("");

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".svc__cta");
    if (!btn) return;
    document.dispatchEvent(new CustomEvent("oxi:pick", { detail: { service: btn.dataset.service, equipo: btn.dataset.equipo } }));
  });
})();
} catch (err) {
  console.error("[oxifreeze] Falló js/services.js", err);
}
}],

/* ---- js/quoter.js ---- */
["js/quoter.js", () => {
try {
/* Oxifreeze — cotizador interactivo: calcula en vivo y arma el mensaje de WhatsApp.
   Todo el HTML que se inyecta sale de constantes propias o de números ya validados. */
(() => {
  "use strict";

  const form = document.querySelector("[data-quoter]");
  if (!form || !window.OxiPricing) return;

  const P = window.OxiPricing;
  const W = window.OxiWhatsApp;
  const config = window.OXI_CONFIG;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const M2_MIN = 8;
  const M2_MAX = 120;
  const MAX_UNITS = 10;
  const MAX_M2_PER_MINISPLIT = 48;
  const TWEEN_MS = 550;

  const $ = (sel, root = document) => root.querySelector(sel);
  const els = {
    m2Box: $("[data-size-m2]", form),
    tonsBox: $("[data-size-tons]", form),
    tonsChips: $("[data-tons-chips]", form),
    m2Out: $("[data-m2-out]", form),
    tonsHint: $("[data-tons-hint]", form),
    zonas: $("[data-zonas]", form),
    units: form.elements.units,
    folio: $("[data-folio]"),
    lines: $("[data-lines]"),
    total: $("[data-total]"),
    iva: $("[data-iva]"),
    time: $("[data-time]"),
    warn: $("[data-warn]"),
    wa: $("[data-wa]"),
    bar: $("[data-quote-bar]"),
    barTotal: $("[data-bar-total]"),
    receipt: $("[data-receipt]"),
  };

  const folio = W.makeFolio("COT");
  els.folio.textContent = folio;
  els.zonas.innerHTML = P.ZONAS.map(
    (z) => `<option value="${z.id}">${z.label}${z.fee ? ` (+$${z.fee} traslado)` : ""}</option>`
  ).join("");

  const fmtTons = (t) => `${t} ton`;
  const money = (n) => W.money(n).replace(" MXN", "");
  const clampUnits = (v) => Math.min(MAX_UNITS, Math.max(1, Math.round(Number(v)) || 1));

  function renderTonsChips(equipoId) {
    const current = Number(form.elements.tons?.value);
    const { sizes } = P.EQUIPOS[equipoId];
    const selected = sizes.includes(current) ? current : sizes[0];
    els.tonsChips.innerHTML = sizes.map((s) => `
      <label class="chip"><input type="radio" name="tons" value="${s}"${s === selected ? " checked" : ""}><span>${fmtTons(s)}</span></label>`
    ).join("");
  }

  function readInput() {
    const f = form.elements;
    return {
      service: f.service.value,
      equipo: f.equipo.value,
      mode: f.mode.value,
      m2: Number(f.m2.value),
      tons: Number(f.tons?.value),
      units: clampUnits(f.units.value),
      zona: f.zona.value,
    };
  }

  /* ---------- Número animado ---------- */
  let shownTotal = 0;
  let tweenId = 0;
  let fallbackId = 0;

  function paintTotal(v) {
    shownTotal = v;
    els.total.textContent = money(v);
    els.barTotal.textContent = money(v);
  }

  const BUMP_KEYFRAMES = [{ transform: "scale(1)" }, { transform: "scale(1.06)", offset: 0.4 }, { transform: "scale(1)" }];
  let isFirstRender = true;

  function animateTotal(to) {
    cancelAnimationFrame(tweenId);
    const from = shownTotal;
    clearTimeout(fallbackId);
    // Al cargar la página el total aparece directo (sin animación que trabaje mientras arranca).
    if (isFirstRender || reduceMotion.matches || document.hidden || from === to) {
      isFirstRender = false;
      return paintTotal(to);
    }
    // Si el navegador pausa requestAnimationFrame (pestaña en segundo plano), el total final se pinta igual.
    fallbackId = setTimeout(() => { cancelAnimationFrame(tweenId); paintTotal(to); }, TWEEN_MS + 150);
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / TWEEN_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      paintTotal(Math.round(from + (to - from) * eased));
      if (t < 1) tweenId = requestAnimationFrame(tick);
    };
    tweenId = requestAnimationFrame(tick);
    // Web Animations: reinicia el "salto" sin forzar un recálculo de layout de la página
    els.total.animate?.(BUMP_KEYFRAMES, { duration: 450, easing: "cubic-bezier(.22, 1, .36, 1)" });
  }

  const line = (label, value, cls = "") =>
    `<div class="receipt__line ${cls}"><dt>${label}</dt><dd>${value}</dd></div>`;

  function renderSize(input) {
    els.m2Box.hidden = input.mode !== "m2";
    els.tonsBox.hidden = input.mode !== "tons";
    els.m2Out.textContent = `${input.m2} m²`;
    form.elements.m2.style.setProperty("--fill", `${((input.m2 - M2_MIN) / (M2_MAX - M2_MIN)) * 100}%`);
    if (input.mode === "m2") {
      const sizing = P.tonsForArea(input.m2, input.equipo);
      els.tonsHint.innerHTML = `≈ ${sizing.raw.toFixed(2)} ton → te recomendamos <strong>${fmtTons(sizing.tons)}</strong>`;
    }
  }

  function renderReceipt(q, input) {
    const size = q.m2 ? `${fmtTons(q.tons)} · ${q.m2} m²` : fmtTons(q.tons);
    els.lines.innerHTML = [
      line("Servicio", q.serviceLabel),
      line("Equipo", `${q.equipoLabel} · ${size}`),
      line("Precio por equipo", money(q.perUnit)),
      q.units > 1 ? line(`× ${q.units} equipos`, money(q.gross)) : "",
      q.discount ? line("Descuento por volumen", `−${money(q.discount)}`, "is-discount") : "",
      line("Traslado", q.travel ? money(q.travel) : "Incluido", q.travel ? "" : "is-free"),
    ].join("");

    els.iva.textContent = `IVA incluido: ${money(q.iva)}`;
    els.time.textContent = `${q.time} por equipo`;
    els.warn.hidden = !q.exceeds;
    if (q.exceeds) {
      els.warn.textContent = input.equipo === "central"
        ? "Un espacio tan grande requiere visita técnica: el precio final puede cambiar."
        : `Para ${q.m2} m² un solo equipo no alcanza: te convienen ${Math.ceil(q.m2 / MAX_M2_PER_MINISPLIT)} equipos o aire central.`;
    }
    els.wa.href = W.waLink(config.whatsappNumber, W.quoteMessage(q, folio));
    animateTotal(q.total);
    document.dispatchEvent(new CustomEvent("oxi:quote", { detail: { service: input.service, equipo: input.equipo } }));
  }

  function render() {
    const input = readInput();
    renderSize(input);
    try {
      renderReceipt(P.quote(input), input);
    } catch (err) {
      els.warn.hidden = false;
      els.warn.textContent = "Revisa los datos de la cotización.";
      console.error("[cotizador]", err);
    }
  }

  /* ---------- Eventos ---------- */
  form.addEventListener("input", (e) => {
    if (e.target.name === "equipo") renderTonsChips(e.target.value);
    render();
  });
  form.addEventListener("change", (e) => {
    if (e.target.name === "units") {
      e.target.value = clampUnits(e.target.value);
      render();
    }
  });
  form.addEventListener("submit", (e) => e.preventDefault());

  form.querySelectorAll("[data-step]").forEach((btn) => {
    btn.addEventListener("click", () => {
      els.units.value = clampUnits(Number(els.units.value) + Number(btn.dataset.step));
      render();
    });
  });

  document.addEventListener("oxi:pick", (e) => {
    const { service, equipo } = e.detail;
    form.querySelector(`input[name="service"][value="${service}"]`).checked = true;
    form.querySelector(`input[name="equipo"][value="${equipo}"]`).checked = true;
    renderTonsChips(equipo);
    render();
    const target = document.getElementById("cotizador");
    if (window.OxiScrollTo) window.OxiScrollTo(target);
    else target.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth" });
  });

  /* ---------- Barra flotante del total (móvil) ---------- */
  let sectionVisible = false;
  let receiptVisible = false;
  const syncBar = () => els.bar.classList.toggle("is-visible", sectionVisible && !receiptVisible);
  new IntersectionObserver(([en]) => { sectionVisible = en.isIntersecting; syncBar(); }, { rootMargin: "-30% 0px -30% 0px" })
    .observe(document.getElementById("cotizador"));
  new IntersectionObserver(([en]) => { receiptVisible = en.isIntersecting; syncBar(); }, { threshold: 0.35 })
    .observe(els.receipt);

  renderTonsChips(form.elements.equipo.value);
  render();

  // Para pruebas desde la consola: OxiQuoter.current()
  window.OxiQuoter = { current: () => P.quote(readInput()), waHref: () => els.wa.href, folio };
})();
} catch (err) {
  console.error("[oxifreeze] Falló js/quoter.js", err);
}
}],

/* ---- js/booking.js ---- */
["js/booking.js", () => {
try {
/* Oxifreeze — lógica de la agenda (sin DOM): días, horarios, validación,
   folio, link de Google Calendar y archivo .ics. Todo corre en el cliente. */
(function (root) {
  "use strict";

  const DAYS_AHEAD = 14;
  const LEAD_HOURS = 2;                 // no se agenda con menos de 2 h de anticipación
  const BUSY_EVERY = 4;                 // ~1 de cada 4 horarios aparece ocupado (demo realista)
  const HOUR_MS = 3600 * 1000;
  const TIMEZONE = "America/Tijuana";

  // 0 = domingo … 6 = sábado
  const SCHEDULE = { 0: [], 1: [9, 11, 13, 15, 17], 2: [9, 11, 13, 15, 17], 3: [9, 11, 13, 15, 17], 4: [9, 11, 13, 15, 17], 5: [9, 11, 13, 15, 17], 6: [9, 11, 13] };

  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const DIAS_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

  const SERVICE_OPTIONS = [
    { id: "instalacion-minisplit", label: "Instalación de minisplit", hours: 4 },
    { id: "instalacion-ventana", label: "Instalación de equipo de ventana", hours: 2 },
    { id: "instalacion-central", label: "Instalación de aire central (visita técnica)", hours: 2 },
    { id: "mantenimiento", label: "Mantenimiento preventivo", hours: 2 },
    { id: "reparacion", label: "Reparación / recarga de gas", hours: 2 },
    { id: "limpieza", label: "Limpieza profunda", hours: 2 },
  ];

  const pad = (n) => String(n).padStart(2, "0");
  const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const slotKey = (d, hour) => `${dateKey(d)}T${pad(hour)}`;
  const hourLabel = (h) => `${pad(h)}:00`;

  function hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
    return h;
  }

  function nextDays(now, n = DAYS_AHEAD) {
    return Array.from({ length: n }, (_, i) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + i));
  }

  function slotsFor(day, now, booked = []) {
    return (SCHEDULE[day.getDay()] || []).map((hour) => {
      const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour);
      const key = slotKey(day, hour);
      let status = "free";
      if (start.getTime() - now.getTime() < LEAD_HOURS * HOUR_MS) status = "past";
      else if (booked.includes(key) || hash(key) % BUSY_EVERY === 0) status = "busy";
      return { hour, key, label: hourLabel(hour), start, status };
    });
  }

  const hasFreeSlot = (day, now, booked) => slotsFor(day, now, booked).some((s) => s.status === "free");

  function formatLong(d) {
    return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
  }

  /* ---------- Validación ---------- */
  function normalizePhone(raw) {
    let digits = String(raw || "").replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("52")) digits = digits.slice(2);
    return digits;
  }

  function validate(data) {
    const errors = {};
    const name = String(data.name || "").trim().replace(/\s+/g, " ");
    const phone = normalizePhone(data.phone);
    const address = String(data.address || "").trim().replace(/\s+/g, " ");
    const service = SERVICE_OPTIONS.find((s) => s.id === data.service);

    if (name.length < 3 || !/^[\p{L} .'-]+$/u.test(name)) errors.name = "Escribe tu nombre (solo letras).";
    if (phone.length !== 10) errors.phone = "El teléfono debe tener 10 dígitos.";
    if (address.length < 8) errors.address = "Escribe calle, número y colonia.";
    if (!service) errors.service = "Elige un servicio.";
    if (!data.slot) errors.slot = "Elige día y hora en el calendario.";

    return { ok: Object.keys(errors).length === 0, errors, clean: { name, phone, address, service } };
  }

  /* ---------- Folio y calendario ---------- */
  function makeFolio(date, rand = Math.random) {
    const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin O/0/I/1 para que se dicte fácil
    const code = Array.from({ length: 4 }, () => ALPHABET[Math.floor(rand() * ALPHABET.length)]).join("");
    return `OXI-${pad(date.getMonth() + 1)}${pad(date.getDate())}-${code}`;
  }

  function buildEvent({ folio, service, start, name, phone, address }) {
    const end = new Date(start.getTime() + service.hours * HOUR_MS);
    return {
      title: `Oxifreeze · ${service.label}`,
      start,
      end,
      location: `${address}, Tijuana, B.C.`,
      details: [
        `Folio: ${folio}`,
        `Cliente: ${name}`,
        `Teléfono: ${phone}`,
        "El técnico te escribe por WhatsApp 30 min antes de llegar.",
        "Proyecto escolar — empresa ficticia.",
      ].join("\n"),
    };
  }

  const utcStamp = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  function googleCalendarUrl(ev) {
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: ev.title,
      dates: `${utcStamp(ev.start)}/${utcStamp(ev.end)}`,
      details: ev.details,
      location: ev.location,
      ctz: TIMEZONE,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  const icsEscape = (s) => String(s).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");

  // RFC 5545: líneas de máx. 75 octetos (UTF-8); la continuación empieza con un espacio.
  const MAX_OCTETS = 74;
  const encoder = new TextEncoder();
  function fold(line) {
    const parts = [];
    let current = "";
    let bytes = 0;
    for (const ch of line) {
      const size = encoder.encode(ch).length;
      if (bytes + size > MAX_OCTETS) {
        parts.push(current);
        current = "";
        bytes = 1; // espacio inicial de la línea de continuación
      }
      current += ch;
      bytes += size;
    }
    parts.push(current);
    return parts.join("\r\n ");
  }

  function toIcs(ev, folio, now = new Date()) {
    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Oxifreeze//Agenda//ES",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${folio}@oxifreeze.mx`,
      `DTSTAMP:${utcStamp(now)}`,
      `DTSTART:${utcStamp(ev.start)}`,
      `DTEND:${utcStamp(ev.end)}`,
      `SUMMARY:${icsEscape(ev.title)}`,
      `LOCATION:${icsEscape(ev.location)}`,
      `DESCRIPTION:${icsEscape(ev.details)}`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "DESCRIPTION:Tu técnico de Oxifreeze llega en 2 horas",
      "TRIGGER:-PT2H",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].map(fold).join("\r\n") + "\r\n";
  }

  function bookingMessage({ folio, service, start, name, phone, address }) {
    return [
      "¡Hola, Oxifreeze! Acabo de agendar una cita:",
      "",
      `• Folio: ${folio}`,
      `• Servicio: ${service.label}`,
      `• Fecha: ${formatLong(start)}, ${hourLabel(start.getHours())} h`,
      `• Nombre: ${name}`,
      `• Teléfono: ${phone}`,
      `• Dirección: ${address}`,
      "",
      "¿Me la confirman, por favor?",
    ].join("\n");
  }

  const api = {
    DAYS_AHEAD, SCHEDULE, DIAS_CORTOS, MESES, SERVICE_OPTIONS,
    dateKey, slotKey, nextDays, slotsFor, hasFreeSlot, formatLong, hourLabel,
    normalizePhone, validate, makeFolio, buildEvent, googleCalendarUrl, toIcs, bookingMessage,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.OxiBooking = api;
})(typeof window !== "undefined" ? window : globalThis);
} catch (err) {
  console.error("[oxifreeze] Falló js/booking.js", err);
}
}],

/* ---- js/agenda.js ---- */
["js/agenda.js", () => {
try {
/* Oxifreeze — agenda en línea: calendario de 14 días, horarios, formulario y
   pantalla de éxito con folio, WhatsApp, Google Calendar y .ics. Sin backend.
   Los datos que escribe el usuario solo se insertan con textContent. */
(() => {
  "use strict";

  const form = document.querySelector("[data-booking]");
  if (!form || !window.OxiBooking) return;

  const B = window.OxiBooking;
  const W = window.OxiWhatsApp;
  const config = window.OXI_CONFIG;
  const STORAGE_KEY = "oxi:booked";

  const $ = (sel, root = document) => root.querySelector(sel);
  const els = {
    month: $("[data-month]"),
    days: $("[data-days]"),
    slots: $("[data-slots]"),
    dayLabel: $("[data-day-label]"),
    pick: $("[data-pick-summary]"),
    pickText: $("[data-pick-text]"),
    services: $("[data-booking-services]", form),
    success: $("[data-success]"),
  };

  /* ---------- Reservas guardadas en este navegador ---------- */
  function loadBooked() {
    try {
      const v = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(v) ? v.filter((k) => typeof k === "string") : [];
    } catch {
      return [];
    }
  }
  function saveBooked(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* modo privado: no pasa nada */ }
  }

  const state = {
    now: new Date(),
    booked: loadBooked(),
    day: null,
    slot: null,
    serviceTouched: false,
    icsUrl: null,
  };

  els.services.innerHTML = `<option value="">Elige un servicio…</option>` +
    B.SERVICE_OPTIONS.map((s) => `<option value="${s.id}">${s.label}</option>`).join("");

  /* ---------- Calendario ---------- */
  const days = B.nextDays(state.now);

  function renderMonth() {
    const first = days[0];
    const last = days[days.length - 1];
    const m1 = B.MESES[first.getMonth()];
    const m2 = B.MESES[last.getMonth()];
    els.month.textContent = m1 === m2 ? `${m1} ${first.getFullYear()}` : `${m1} – ${m2} ${last.getFullYear()}`;
  }

  function renderDays() {
    els.days.innerHTML = days.map((d, i) => {
      const open = B.hasFreeSlot(d, state.now, state.booked);
      const closed = B.SCHEDULE[d.getDay()].length === 0;
      const selected = state.day && B.dateKey(d) === B.dateKey(state.day);
      const note = closed
        ? '<span class="cal__long">Cerrado</span><span class="cal__short">Cerr.</span>'
        : open ? (i === 0 ? "Hoy" : "") : "Lleno";
      return `
        <button type="button" class="cal__day${selected ? " is-selected" : ""}" data-day="${i}"
          aria-pressed="${selected}" ${open ? "" : "disabled"}
          aria-label="${B.formatLong(d)}${open ? "" : `, ${closed ? "cerrado" : "sin horarios"}`}">
          <span class="cal__wd">${B.DIAS_CORTOS[d.getDay()]}</span>
          <span class="cal__n">${d.getDate()}</span>
          <span class="cal__note">${note}</span>
        </button>`;
    }).join("");
  }

  function renderSlots() {
    if (!state.day) {
      els.dayLabel.textContent = "elige un día";
      els.slots.innerHTML = "";
      return;
    }
    els.dayLabel.textContent = B.formatLong(state.day);
    const slots = B.slotsFor(state.day, state.now, state.booked);
    els.slots.innerHTML = slots.map((s) => {
      const selected = state.slot === s.key;
      const label = s.status === "free" ? "Libre" : s.status === "busy" ? "Ocupado" : "No disponible";
      return `
        <button type="button" class="slot slot--${s.status}${selected ? " is-selected" : ""}" data-slot="${s.key}"
          aria-pressed="${selected}" ${s.status === "free" ? "" : "disabled"} aria-label="${s.label}, ${label}">
          <span class="slot__time">${s.label}</span><span class="slot__state">${label}</span>
        </button>`;
    }).join("");
  }

  function renderPick() {
    const slot = currentSlot();
    els.pick.classList.toggle("is-set", Boolean(slot));
    els.pickText.textContent = slot
      ? `${capitalize(B.formatLong(state.day))} · ${slot.label} h`
      : "Elige día y hora en el calendario";
  }

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const currentSlot = () =>
    state.day && state.slot ? B.slotsFor(state.day, state.now, state.booked).find((s) => s.key === state.slot && s.status === "free") : null;

  function selectDay(d) {
    state.day = d;
    state.slot = null;
    renderDays();
    renderSlots();
    renderPick();
  }

  els.days.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-day]");
    if (btn && !btn.disabled) selectDay(days[Number(btn.dataset.day)]);
  });

  els.slots.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-slot]");
    if (!btn || btn.disabled) return;
    state.slot = btn.dataset.slot;
    renderSlots();
    renderPick();
    showError("slot", "");
    // En celular, lleva al formulario después de elegir hora
    if (window.matchMedia("(max-width: 1023px)").matches) {
      els.pick.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });

  /* ---------- Formulario ---------- */
  function showError(field, msg) {
    const p = form.querySelector(`[data-error="${field}"]`);
    if (p) p.textContent = msg;
    const input = form.elements[field];
    if (input && input.setAttribute) input.setAttribute("aria-invalid", msg ? "true" : "false");
  }

  form.addEventListener("input", (e) => {
    if (e.target.name === "service") state.serviceTouched = true;
    if (e.target.name) showError(e.target.name, "");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const slot = currentSlot();
    const result = B.validate({
      name: form.elements.name.value,
      phone: form.elements.phone.value,
      address: form.elements.address.value,
      service: form.elements.service.value,
      slot: slot ? slot.key : "",
    });

    ["slot", "name", "phone", "address", "service"].forEach((f) => showError(f, result.errors[f] || ""));
    if (!result.ok) {
      const first = ["slot", "name", "phone", "address", "service"].find((f) => result.errors[f]);
      (first === "slot" ? els.pick : form.elements[first]).focus?.();
      if (first === "slot") els.pick.scrollIntoView({ behavior: "smooth", block: "center" });
      form.classList.remove("is-shake");
      void form.offsetWidth;
      form.classList.add("is-shake");
      return;
    }
    confirmBooking(result.clean, slot);
  });

  function confirmBooking(clean, slot) {
    const folio = B.makeFolio(slot.start);
    const booking = { folio, service: clean.service, start: slot.start, name: clean.name, phone: clean.phone, address: clean.address };
    const ev = B.buildEvent(booking);

    state.booked = [...state.booked, slot.key];
    saveBooked(state.booked);
    state.slot = null;
    renderDays();
    renderSlots();
    renderPick();

    if (state.icsUrl) URL.revokeObjectURL(state.icsUrl);
    state.icsUrl = URL.createObjectURL(new Blob([B.toIcs(ev, folio)], { type: "text/calendar;charset=utf-8" }));

    const s = (sel) => $(sel, els.success);
    s("[data-s-name]").textContent = clean.name.split(" ")[0];
    s("[data-s-folio]").textContent = folio;
    s("[data-s-service]").textContent = clean.service.label;
    s("[data-s-date]").textContent = `${capitalize(B.formatLong(slot.start))}, ${slot.label} h`;
    s("[data-s-address]").textContent = clean.address;
    s("[data-s-wa]").href = W.waLink(config.whatsappNumber, B.bookingMessage(booking));
    s("[data-s-gcal]").href = B.googleCalendarUrl(ev);
    s("[data-s-ics]").href = state.icsUrl;
    s("[data-s-ics]").download = `oxifreeze-${folio}.ics`;

    form.hidden = true;
    els.success.hidden = false;
    els.success.classList.remove("is-in");
    void els.success.offsetWidth;
    els.success.classList.add("is-in");
    els.success.focus({ preventScroll: true });
    els.success.scrollIntoView({ behavior: "smooth", block: "center" });

    window.OxiAgenda.last = { folio, ev, gcal: B.googleCalendarUrl(ev), ics: B.toIcs(ev, folio), wa: s("[data-s-wa]").href };
  }

  $("[data-copy]", els.success).addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    try {
      await navigator.clipboard.writeText($("[data-s-folio]", els.success).textContent);
      btn.textContent = "¡Copiado!";
    } catch {
      btn.textContent = "Cópialo a mano";
    }
    setTimeout(() => { btn.textContent = "Copiar"; }, 1800);
  });

  $("[data-again]", els.success).addEventListener("click", () => {
    form.reset();
    state.serviceTouched = false;
    state.slot = null;
    els.success.hidden = true;
    form.hidden = false;
    const firstOpen = days.find((d) => B.hasFreeSlot(d, state.now, state.booked));
    selectDay(firstOpen || null);
    form.elements.name.focus();
  });

  /* ---------- Conexión con el cotizador ---------- */
  const SERVICE_FROM_QUOTE = {
    "instalacion:minisplit": "instalacion-minisplit",
    "instalacion:ventana": "instalacion-ventana",
    "instalacion:central": "instalacion-central",
  };
  function syncServiceFromQuote({ service, equipo }) {
    if (state.serviceTouched || !service) return;
    els.services.value = SERVICE_FROM_QUOTE[`${service}:${equipo}`] || service;
  }
  document.addEventListener("oxi:quote", (e) => syncServiceFromQuote(e.detail));
  const quoterForm = document.querySelector("[data-quoter]");
  if (quoterForm) syncServiceFromQuote({ service: quoterForm.elements.service.value, equipo: quoterForm.elements.equipo.value });

  renderMonth();
  selectDay(days.find((d) => B.hasFreeSlot(d, state.now, state.booked)) || null);

  window.OxiAgenda = { last: null };
})();
} catch (err) {
  console.error("[oxifreeze] Falló js/agenda.js", err);
}
}],

/* ---- js/impact.js ---- */
["js/impact.js", () => {
try {
/* Oxifreeze — impacto: contadores animados y calculadora de ahorro en CFE. */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const COUNT_MS = 1400;

  /* ---------- Contadores ---------- */
  const fmt = (n) => Math.round(n).toLocaleString("es-MX");

  function countUp(el) {
    const target = Number(el.dataset.count);
    if (reduceMotion.matches || document.hidden) {
      el.textContent = fmt(target);
      return;
    }
    let done = false;
    const finish = () => { done = true; el.textContent = fmt(target); };
    const start = performance.now();
    const tick = () => {
      if (done) return;
      const t = Math.min(1, (performance.now() - start) / COUNT_MS);
      if (t >= 1) return finish();
      el.textContent = fmt(target * (1 - Math.pow(1 - t, 4)));
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    // Respaldo por si el navegador pausa requestAnimationFrame: el número final siempre llega.
    setTimeout(finish, COUNT_MS + 200);
  }

  const counters = document.querySelectorAll("[data-count]");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      countUp(entry.target);
    });
  }, { threshold: 0.6 });
  counters.forEach((el) => io.observe(el));

  /* ---------- Calculadora de ahorro ---------- */
  const saver = document.querySelector("[data-saver]");
  if (!saver) return;

  const AC_SHARE = 0.5;          // el A/C como mitad del recibo en verano (supuesto)
  const SAVING_MIN = 0.05;       // U.S. DOE: 5 %
  const SAVING_MAX = 0.15;       // U.S. DOE: 15 %
  const range = saver.querySelector("input[type=range]");
  const billOut = saver.querySelector("[data-saver-bill]");
  const resultOut = saver.querySelector("[data-saver-out]");
  const money = (n) => "$" + fmt(n);

  function renderSaver() {
    const bill = Number(range.value);
    const min = Number(range.min);
    const max = Number(range.max);
    range.style.setProperty("--fill", `${((bill - min) / (max - min)) * 100}%`);
    billOut.textContent = money(bill);
    resultOut.textContent = `${money(bill * AC_SHARE * SAVING_MIN)} – ${money(bill * AC_SHARE * SAVING_MAX)}`;
  }
  range.addEventListener("input", renderSaver);
  renderSaver();
})();
} catch (err) {
  console.error("[oxifreeze] Falló js/impact.js", err);
}
}],

/* ---- js/economy.js ---- */
["js/economy.js", () => {
try {
/* Oxifreeze — "Nuestra economía": flujo circular interactivo (SVG generado desde datos),
   pestañas de agentes y reparto de cada $100. */
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
    { id: "a1", kind: "money", from: "familias", to: "empresas", label: "Pago del servicio", side: 1, pts: [[170, 425], [260, 355], [380, 355], [470, 425]] },
    { id: "a2", kind: "goods", from: "empresas", to: "familias", label: "Instalación y mantenimiento", side: -1, pts: [[462, 452], [380, 405], [260, 405], [178, 452]] },
    { id: "a3", kind: "goods", from: "familias", to: "empresas", label: "Trabajo", side: 1, pts: [[178, 488], [260, 535], [380, 535], [462, 488]] },
    { id: "a4", kind: "money", from: "empresas", to: "familias", label: "Salarios", side: -1, pts: [[470, 515], [380, 590], [260, 590], [170, 515]] },
    { id: "b1", kind: "money", from: "familias", to: "gobierno", label: "Impuestos: IVA", side: 1, pts: [[70, 410], [40, 290], [130, 150], [252, 95]] },
    { id: "b2", kind: "goods", from: "gobierno", to: "familias", label: "Salud, calles, luz", side: -1, pts: [[262, 140], [190, 180], [150, 290], [138, 402]] },
    { id: "c1", kind: "money", from: "empresas", to: "gobierno", label: "ISR, IVA, IMSS", side: 1, pts: [[570, 410], [600, 290], [510, 150], [388, 95]] },
    { id: "c2", kind: "goods", from: "gobierno", to: "empresas", label: "Permisos y normas", side: -1, pts: [[378, 140], [450, 180], [490, 290], [502, 402]] },
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
    const common = { "data-kind": f.kind, "data-agents": `${f.from} ${f.to}` };
    el("path", { id: `flow-${f.id}`, d: toD(f.pts), class: `flow-path flow-path--${f.kind}`, "marker-end": `url(#arrow-${f.kind})`, ...common }, gPaths);

    const labelPts = offsetCurve(leftToRight(f.pts), f.side * LABEL_GAP);
    el("path", { id: `label-${f.id}`, d: toD(labelPts), fill: "none", stroke: "none" }, defs);
    const text = el("text", { class: `flow-label flow-label--${f.kind}`, "dominant-baseline": "middle", ...common }, gLabels);
    const tp = el("textPath", { href: `#label-${f.id}`, startOffset: "50%", "text-anchor": "middle" }, text);
    tp.textContent = f.kind === "money" ? `${f.label} $` : f.label;

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
  const hint = panel.querySelector("[data-flow-hint]");
  const tabs = [...panel.querySelectorAll("[data-agent-tab]")];
  const agents = [...panel.querySelectorAll("[data-agent]")];
  const nodes = [...svg.querySelectorAll("[data-node]")];
  const filters = [...document.querySelectorAll("[data-filter]")];

  function selectAgent(key, { scroll = false } = {}) {
    svg.dataset.active = key;
    nodes.forEach((n) => n.setAttribute("aria-pressed", String(n.dataset.node === key)));
    tabs.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.agentTab === key)));
    agents.forEach((a) => { a.hidden = a.dataset.agent !== key; });
    hint.hidden = true;
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
  const SPLIT = [
    { label: "Salarios", value: 35, color: "#7df9ff" },
    { label: "Materiales y refrigerante", value: 30, color: "#22d3ee" },
    { label: "IVA al SAT", value: 14, color: "#1e7bff" },
    { label: "Transporte", value: 8, color: "#8aa4ff" },
    { label: "Herramientas y web", value: 5, color: "#c6ecff" },
    { label: "Ganancia", value: 8, color: "#ffffff" },
  ];
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

  window.OxiEconomy = { selectAgent, FLOWS };
})();
} catch (err) {
  console.error("[oxifreeze] Falló js/economy.js", err);
}
}],

/* ---- js/qr.js ---- */
["js/qr.js", () => {
try {
/* Oxifreeze — QR de la URL del sitio. La librería (vendor/qrcode.js, MIT) se carga bajo demanda. */
(function (root) {
  "use strict";

  const LIB_SRC = "vendor/qrcode.js";
  let loading = null;

  function loadLib() {
    if (root.qrcode) return Promise.resolve(root.qrcode);
    if (!loading) {
      loading = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = LIB_SRC;
        s.async = true;
        s.onload = () => (root.qrcode ? resolve(root.qrcode) : reject(new Error("qrcode no se cargó")));
        s.onerror = () => reject(new Error(`No se pudo cargar ${LIB_SRC}`));
        document.head.append(s);
      });
    }
    return loading;
  }

  /** URL pública de la página principal (sin hash, query ni "qr.html"). ?url= la sobrescribe. */
  function siteUrl() {
    const override = new URLSearchParams(location.search).get("url");
    if (override && /^https?:\/\//.test(override)) return override;
    return new URL("./", location.href).href;
  }

  async function render(el, url) {
    const qrcode = await loadLib();
    const qr = qrcode(0, "M");       // versión automática, corrección de errores media (~15 %)
    qr.addData(url);
    qr.make();
    // SVG generado por la librería a partir de la URL (no hay texto de usuario dentro).
    el.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    const svg = el.querySelector("svg");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", `Código QR de ${url}`);
    return qr.getModuleCount();
  }

  root.OxiQR = { siteUrl, render };
})(window);
} catch (err) {
  console.error("[oxifreeze] Falló js/qr.js", err);
}
}],

/* ---- js/contact.js ---- */
["js/contact.js", () => {
try {
/* Oxifreeze — contacto: links generales de WhatsApp, zonas de cobertura y QR del footer. */
(() => {
  "use strict";

  const config = window.OXI_CONFIG;
  const W = window.OxiWhatsApp;
  const P = window.OxiPricing;

  /* ---------- WhatsApp general ---------- */
  const GENERAL_MSG = "¡Hola, Oxifreeze! Tengo una pregunta sobre su servicio de aire acondicionado.";
  document.querySelectorAll("[data-wa-general]").forEach((a) => {
    a.href = W.waLink(config.whatsappNumber, GENERAL_MSG);
  });
  const local = config.whatsappNumber.slice(-10);
  document.querySelectorAll("[data-wa-display]").forEach((el) => {
    el.textContent = `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  });

  /* ---------- Zonas de cobertura (mismas que el cotizador) ---------- */
  const zones = document.querySelector("[data-zones]");
  if (zones && P) {
    P.ZONAS.forEach((z) => {
      const li = document.createElement("li");
      li.textContent = z.label;
      zones.append(li);
    });
  }

  /* ---------- QR del footer (la librería se carga solo cuando hace falta) ---------- */
  const qrBox = document.querySelector("[data-qr]");
  if (!qrBox || !window.OxiQR) return;
  const url = window.OxiQR.siteUrl();
  document.querySelector("[data-qr-url]").textContent = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  new IntersectionObserver(([en], obs) => {
    if (!en.isIntersecting) return;
    obs.disconnect();
    window.OxiQR.render(qrBox, url).catch((err) => {
      qrBox.textContent = "No se pudo generar el QR.";
      console.error("[qr]", err);
    });
  }, { rootMargin: "800px 0px" }).observe(qrBox);
})();
} catch (err) {
  console.error("[oxifreeze] Falló js/contact.js", err);
}
}],

/* ---- js/team.js ---- */
["js/team.js", () => {
try {
/* Oxifreeze — tarjetas del equipo, generadas desde OXI_CONFIG.team.
   Se construyen con nodos del DOM (textContent), sin insertar HTML. */
(() => {
  "use strict";

  const list = document.querySelector("[data-team]");
  const team = window.OXI_CONFIG?.team;
  if (!list || !Array.isArray(team)) return;

  // Degradados fríos distintos para cada avatar
  const GRADIENTS = [
    ["#7df9ff", "#1e7bff"],
    ["#b9fbff", "#22d3ee"],
    ["#94dcff", "#135fd6"],
    ["#c6ecff", "#3a8dff"],
    ["#7df9ff", "#0b2147"],
  ];

  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  const initials = (name) => name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  team.forEach((member, i) => {
    const [from, to] = GRADIENTS[i % GRADIENTS.length];
    const li = make("li", "member");
    li.style.setProperty("--g1", from);
    li.style.setProperty("--g2", to);

    const avatar = make("div", "member__avatar");
    if (member.photo) {
      const img = document.createElement("img");
      img.src = member.photo;
      img.alt = `Foto de ${member.name}`;
      img.width = 320;
      img.height = 320;
      img.loading = "lazy";
      img.decoding = "async";
      // Si la foto no existe, se regresa a las iniciales
      img.addEventListener("error", () => { img.remove(); avatar.append(make("span", "member__initials", initials(member.name))); });
      avatar.append(img);
    } else {
      avatar.append(make("span", "member__initials", initials(member.name)));
    }

    li.append(
      avatar,
      make("h3", "member__name", member.name),
      make("p", "member__role", member.role),
      make("p", "member__focus", member.focus || "")
    );
    list.append(li);
  });
})();
} catch (err) {
  console.error("[oxifreeze] Falló js/team.js", err);
}
}],

/* ---- js/climate.js ---- */
["js/climate.js", () => {
try {
/* Oxifreeze — interruptor calor / frío: la demo visual del producto.
   Modo calor = "Tijuana sin Oxifreeze": toda la página se tiñe de naranja sofocante.
   Atajo de teclado: C. Siempre arranca en frío (no se guarda). */
(() => {
  "use strict";

  const root = document.documentElement;
  const toggle = document.querySelector("[data-climate-toggle]");
  const toast = document.querySelector("[data-toast]");
  if (!toggle) return;

  const TOAST_MS = 2600;
  const FADE_MS = 950;           // igual que la transición de opacidad en extras.css
  const layers = [...document.querySelectorAll(".climate-layer, .climate-haze")];
  let hideTimer = 0;
  const MESSAGES = {
    hot: "🔥 Así se siente Tijuana sin Oxifreeze: 38 °C",
    cold: "❄️ Con Oxifreeze: 22 °C. Respira.",
  };
  let toastTimer = 0;

  function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), TOAST_MS);
  }

  function setClimate(mode, { announce = true } = {}) {
    const hot = mode === "hot";
    clearTimeout(hideTimer);
    if (hot) {
      // Las capas con mix-blend-mode cuestan caro aunque sean invisibles: solo existen en modo calor.
      layers.forEach((el) => { el.hidden = false; });
      void root.offsetWidth; // aplica el display antes de animar la opacidad
    } else {
      hideTimer = setTimeout(() => layers.forEach((el) => { el.hidden = true; }), FADE_MS);
    }
    root.dataset.climate = hot ? "hot" : "cold";
    toggle.setAttribute("aria-checked", String(hot));
    toggle.setAttribute("aria-label", hot ? "Volver al modo frío con Oxifreeze" : "Simular Tijuana sin aire acondicionado");
    if (announce) showToast(MESSAGES[hot ? "hot" : "cold"]);
  }

  const isTyping = (el) => el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

  toggle.addEventListener("click", () => setClimate(root.dataset.climate === "hot" ? "cold" : "hot"));
  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() !== "c" || e.ctrlKey || e.metaKey || e.altKey || isTyping(document.activeElement)) return;
    setClimate(root.dataset.climate === "hot" ? "cold" : "hot");
  });

  setClimate("cold", { announce: false });
  window.OxiClimate = { setClimate, showToast };
})();
} catch (err) {
  console.error("[oxifreeze] Falló js/climate.js", err);
}
}],

/* ---- js/present.js ---- */
["js/present.js", () => {
try {
/* Oxifreeze — modo presentación: la misma página se vuelve diapositivas a pantalla completa.
   Tecla P (o el botón) para entrar · → / PageDown / Espacio = siguiente · ← / PageUp = anterior
   Inicio / Fin · Esc para salir. Los demos (cotizador, agenda, diagrama) siguen siendo interactivos. */
(() => {
  "use strict";

  const root = document.documentElement;
  const hud = document.querySelector("[data-present-hud]");
  if (!hud) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const SLIDE_TOP_GAP = 16;

  const hero = document.querySelector("[data-hero]");
  const heroEnd = () => hero.offsetTop + hero.offsetHeight - window.innerHeight;
  // Posición en la página sin contar transformaciones (la animación de aparición mueve los bloques).
  const topOf = (sel) => {
    let el = document.querySelector(sel);
    if (!el) return 0;
    let y = 0;
    while (el) { y += el.offsetTop; el = el.offsetParent; }
    return y - SLIDE_TOP_GAP;
  };

  // Cada diapositiva es una posición de la página.
  const SLIDES = [
    { title: "Tijuana se calienta", y: () => 0 },
    { title: "Tú no.", y: heroEnd },
    { title: "Servicios", y: () => topOf("#servicios") },
    { title: "Cotizador en vivo", y: () => topOf("#cotizador") },
    { title: "Agenda en línea", y: () => topOf("#agenda") },
    { title: "Impacto en Tijuana", y: () => topOf("#impacto") },
    { title: "Salud, empleo, ahorro y planeta", y: () => topOf(".pillars") },
    { title: "Flujo circular de la economía", y: () => topOf("#economia") },
    { title: "¿A dónde va cada $100?", y: () => topOf(".split") },
    { title: "Sectores económicos", y: () => topOf(".sectors") },
    { title: "Nuestro equipo", y: () => topOf("#equipo") },
    { title: "Preguntas frecuentes", y: () => topOf("#faq") },
    { title: "¡Gracias! Escanea el QR", y: () => topOf("#contacto") },
  ];

  const els = {
    count: hud.querySelector("[data-present-count]"),
    title: hud.querySelector("[data-present-title]"),
    progress: hud.querySelector("[data-present-progress]"),
  };

  let index = 0;
  let active = false;

  const isTyping = (el) => el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

  function renderHud() {
    els.count.textContent = `${index + 1} / ${SLIDES.length}`;
    els.title.textContent = SLIDES[index].title;
    els.progress.style.width = `${((index + 1) / SLIDES.length) * 100}%`;
  }

  let lastGo = 0;
  function go(i) {
    lastGo = performance.now();
    index = Math.max(0, Math.min(SLIDES.length - 1, i));
    window.scrollTo({ top: Math.max(0, SLIDES[index].y()), behavior: reduceMotion.matches ? "auto" : "smooth" });
    renderHud();
  }

  function nearestSlide() {
    const y = window.scrollY + 4;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    let found = 0;
    SLIDES.forEach((s, i) => { if (Math.min(s.y(), maxScroll) <= y) found = i; });
    return found;
  }

  function start() {
    if (active) return;
    active = true;
    root.classList.add("is-presenting");
    hud.hidden = false;
    document.documentElement.requestFullscreen?.().catch(() => { /* sin pantalla completa (iOS): sigue funcionando */ });
    // Esperar a que el layout se acomode sin la barra de navegación
    requestAnimationFrame(() => go(window.scrollY < 40 ? 0 : nearestSlide()));
  }

  function stop() {
    if (!active) return;
    active = false;
    root.classList.remove("is-presenting");
    hud.hidden = true;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || isTyping(document.activeElement)) return;
    const key = e.key;
    if (!active) {
      if (key.toLowerCase() === "p") { e.preventDefault(); start(); }
      return;
    }
    const actions = {
      ArrowRight: () => go(index + 1), PageDown: () => go(index + 1), " ": () => go(index + 1),
      ArrowLeft: () => go(index - 1), PageUp: () => go(index - 1),
      Home: () => go(0), End: () => go(SLIDES.length - 1),
      Escape: stop, p: stop, P: stop,
    };
    if (!actions[key]) return;
    // Espacio sobre un botón o enlace debe seguir funcionando como clic
    if (key === " " && document.activeElement?.matches("button, a, summary, [role=button]")) return;
    e.preventDefault();
    actions[key]();
  });

  document.addEventListener("fullscreenchange", () => { if (!document.fullscreenElement && active) stop(); });
  document.querySelectorAll("[data-present-start]").forEach((b) => b.addEventListener("click", start));
  hud.querySelector("[data-present-next]").addEventListener("click", () => go(index + 1));
  hud.querySelector("[data-present-prev]").addEventListener("click", () => go(index - 1));
  hud.querySelector("[data-present-exit]").addEventListener("click", stop);

  // Si el presentador hace scroll a mano, el contador se mantiene al día
  // (pero no mientras corre un salto hecho con las flechas).
  const SETTLE_MS = 250;
  const GO_GRACE_MS = 1200;
  let settleTimer = 0;
  window.addEventListener("scroll", () => {
    if (!active) return;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      if (performance.now() - lastGo < GO_GRACE_MS) return;
      index = nearestSlide();
      renderHud();
    }, SETTLE_MS);
  }, { passive: true });

  window.OxiPresent = { start, stop, go, get index() { return index; }, slides: SLIDES };
})();
} catch (err) {
  console.error("[oxifreeze] Falló js/present.js", err);
}
}],

/* ---- js/fx.js ---- */
["js/fx.js", () => {
try {
/* Oxifreeze — micro-interacciones: aparición al hacer scroll y estela de escarcha del cursor.
   Nada de esto corre con prefers-reduced-motion; la estela solo en escritorio con mouse. */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduceMotion.matches) return;

  // Todo esto es decorativo: se monta cuando la página ya cargó y el navegador está libre.
  const IDLE_TIMEOUT_MS = 2500;
  const whenIdle = (fn) => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: IDLE_TIMEOUT_MS }) : setTimeout(fn, 300));
  const start = () => whenIdle(() => { setupReveal(); setupFrost(); });
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });

  /* ---------- Aparición al hacer scroll ---------- */
  function setupReveal() {
    const REVEAL = ".section__head, .svc, .q-step, .receipt, .agenda__picker, .agenda__panel, .stat, .pillar, .flow__stage, .split, .chain__step, .member, .faq__item, .footer__cta";
    const STAGGER_MS = 70;
    const groups = new Map();
    // Arriba de todo solo se ve el hero (mide 230 % de la pantalla): no hace falta medir nada,
    // y medir obligaría a calcular las secciones que content-visibility se está saltando.
    const openedMidPage = window.scrollY > 0;
    document.querySelectorAll(REVEAL).forEach((el) => {
      // Lo que ya está en pantalla no se esconde (evita un parpadeo si la página abrió en un #ancla)
      if (openedMidPage && el.getBoundingClientRect().top < window.innerHeight) return;
      const n = groups.get(el.parentElement) || 0;
      groups.set(el.parentElement, n + 1);
      el.style.setProperty("--reveal-delay", `${Math.min(n, 5) * STAGGER_MS}ms`);
      el.classList.add("reveal");
    });
    let ioAlive = false;
    const io = new IntersectionObserver((entries) => {
      ioAlive = true;
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-visible");
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    // Respaldo: si el navegador nunca reporta visibilidad (el observer jamás respondió), nada se queda escondido.
    const REVEAL_FALLBACK_MS = 3000;
    setTimeout(() => {
      if (ioAlive) return;
      document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => el.classList.add("is-visible"));
    }, REVEAL_FALLBACK_MS);
    // El equipo se genera con JS: lo observamos cuando aparezca
    document.querySelectorAll(".member:not(.reveal)").forEach((el) => { el.classList.add("reveal"); io.observe(el); });

  }

  /* ---------- Estela de escarcha (escritorio) ---------- */
  function setupFrost() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const MAX = 70;
    const LIFE_MS = 1100;
    const canvas = document.createElement("canvas");
    canvas.className = "frost-cursor";
    canvas.setAttribute("aria-hidden", "true");
    document.body.append(canvas);
    const ctx = canvas.getContext("2d");
    const flakes = [];
    let running = false;
    let lastSpawn = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawFlake(f, alpha) {
    ctx.globalAlpha = alpha;
    if (f.star) {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rot);
      ctx.beginPath();
      for (let k = 0; k < 3; k++) {
        ctx.rotate(Math.PI / 3);
        ctx.moveTo(-f.r, 0);
        ctx.lineTo(f.r, 0);
      }
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop(now) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.fillStyle = ctx.strokeStyle = "#c6f6ff";
    ctx.lineWidth = 1.4;
    ctx.lineCap = "round";
    for (let i = flakes.length - 1; i >= 0; i--) {
      const f = flakes[i];
      const t = (now - f.born) / LIFE_MS;
      if (t >= 1) { flakes.splice(i, 1); continue; }
      f.x += f.vx;
      f.y += f.vy;
      f.rot += 0.03;
      drawFlake(f, (1 - t) * 0.85);
    }
    ctx.globalAlpha = 1;
    if (flakes.length) requestAnimationFrame(loop);
    else running = false;
  }

  window.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const now = performance.now();
    if (now - lastSpawn < 24) return;
    lastSpawn = now;
    if (flakes.length >= MAX) flakes.shift();
    flakes.push({
      x: e.clientX + (Math.random() - 0.5) * 10,
      y: e.clientY + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 0.6,
      vy: 0.35 + Math.random() * 0.6,
      r: 2.5 + Math.random() * 3.5,
      rot: Math.random() * Math.PI,
      star: Math.random() < 0.45,
      born: now,
    });
    if (!running) { running = true; requestAnimationFrame(loop); }
  }, { passive: true });

  window.addEventListener("resize", resize);
  resize();
  }
})();
} catch (err) {
  console.error("[oxifreeze] Falló js/fx.js", err);
}
}],

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
