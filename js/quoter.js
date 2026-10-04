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

  function animateTotal(to) {
    cancelAnimationFrame(tweenId);
    const from = shownTotal;
    clearTimeout(fallbackId);
    if (reduceMotion.matches || document.hidden || from === to) return paintTotal(to);
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
    els.total.classList.remove("is-bump");
    void els.total.offsetWidth; // reinicia la animación CSS
    els.total.classList.add("is-bump");
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
    document.getElementById("cotizador").scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth" });
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
