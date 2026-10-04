/* Oxifreeze — agendar la cotización: calendario de 14 días, horarios, datos del cliente y
   pantalla de éxito con un solo folio (precio + cita), WhatsApp, Google Calendar y .ics.
   El servicio y el total salen del cotizador (OxiQuoter). Sin backend.
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
    bqService: $("[data-bq-service]", form),
    bqTotal: $("[data-bq-total]", form),
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
    icsUrl: null,
  };

  const money = (n) => W.money(n).replace(" MXN", "");
  const currentQuote = () => {
    try { return window.OxiQuoter ? window.OxiQuoter.current() : null; } catch { return null; }
  };

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
    if (e.target.name) showError(e.target.name, "");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const slot = currentSlot();
    const result = B.validate({
      name: form.elements.name.value,
      phone: form.elements.phone.value,
      address: form.elements.address.value,
      slot: slot ? slot.key : "",
    });
    const quote = currentQuote();
    if (!quote) result.errors.slot = "Revisa tu cotización arriba: hay un dato incompleto.";

    const FIELDS = ["slot", "name", "phone", "address"];
    FIELDS.forEach((f) => showError(f, result.errors[f] || ""));
    if (!result.ok || !quote) {
      const first = FIELDS.find((f) => result.errors[f]);
      (first === "slot" ? els.pick : form.elements[first]).focus?.();
      if (first === "slot") els.pick.scrollIntoView({ behavior: "smooth", block: "center" });
      form.classList.remove("is-shake");
      void form.offsetWidth;
      form.classList.add("is-shake");
      return;
    }
    confirmBooking(result.clean, slot, quote);
  });

  function confirmBooking(clean, slot, quote) {
    const folio = B.makeFolio(slot.start);
    const service = B.serviceFromQuote(quote);
    const booking = { folio, service, total: quote.total, start: slot.start, name: clean.name, phone: clean.phone, address: clean.address };
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
    s("[data-s-service]").textContent = service.label;
    s("[data-s-total]").textContent = `${money(quote.total)} (IVA incluido)`;
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

    window.OxiAgenda.last = { folio, ev, total: quote.total, gcal: B.googleCalendarUrl(ev), ics: B.toIcs(ev, folio), wa: s("[data-s-wa]").href };
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

  // "Hacer otra cotización": limpia los datos y regresa al cotizador
  $("[data-again]", els.success).addEventListener("click", () => {
    form.reset();
    state.slot = null;
    els.success.hidden = true;
    form.hidden = false;
    const firstOpen = days.find((d) => B.hasFreeSlot(d, state.now, state.booked));
    selectDay(firstOpen || null);
    const quoter = document.getElementById("cotizador");
    if (window.OxiScrollTo) window.OxiScrollTo(quoter);
    else quoter.scrollIntoView();
  });

  /* ---------- La cotización de arriba, resumida en el formulario ---------- */
  function renderQuote() {
    const q = currentQuote();
    els.bqService.textContent = q ? B.serviceFromQuote(q).label : "Completa tu cotización arriba";
    els.bqTotal.textContent = q ? `${money(q.total)} · IVA incluido` : "";
  }
  document.addEventListener("oxi:quote", renderQuote);
  renderQuote();

  renderMonth();
  selectDay(days.find((d) => B.hasFreeSlot(d, state.now, state.booked)) || null);

  window.OxiAgenda = { last: null };
})();
