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

  // Duración de la cita (para el calendario). La instalación de minisplit es la más larga;
  // el aire central solo agenda la visita técnica. Cada equipo extra suma 1 h, hasta un día de trabajo.
  const BASE_HOURS = 2;
  const MINISPLIT_INSTALL_HOURS = 4;
  const CENTRAL_VISIT_HOURS = 2;
  const MAX_HOURS = 8;

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

    if (name.length < 3 || !/^[\p{L} .'-]+$/u.test(name)) errors.name = "Escribe tu nombre (solo letras).";
    if (phone.length !== 10) errors.phone = "El teléfono debe tener 10 dígitos.";
    if (address.length < 8) errors.address = "Escribe calle, número y colonia.";
    if (!data.slot) errors.slot = "Elige día y hora en el calendario.";

    return { ok: Object.keys(errors).length === 0, errors, clean: { name, phone, address } };
  }

  /* ---------- Servicio de la cita: sale de la cotización ---------- */
  function serviceFromQuote(q) {
    const units = q.units > 1 ? ` ×${q.units}` : "";
    const label = `${q.serviceLabel} · ${q.equipoLabel} ${q.tons} ton${units}`;
    if (q.service === "instalacion" && q.equipo === "central") return { label, hours: CENTRAL_VISIT_HOURS };
    const base = q.service === "instalacion" && q.equipo === "minisplit" ? MINISPLIT_INSTALL_HOURS : BASE_HOURS;
    return { label, hours: Math.min(MAX_HOURS, base + (q.units - 1)) };
  }

  const money = (n) => "$" + Math.round(n).toLocaleString("es-MX") + " MXN";

  /* ---------- Folio y calendario ---------- */
  function makeFolio(date, rand = Math.random) {
    const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin O/0/I/1 para que se dicte fácil
    const code = Array.from({ length: 4 }, () => ALPHABET[Math.floor(rand() * ALPHABET.length)]).join("");
    return `OXI-${pad(date.getMonth() + 1)}${pad(date.getDate())}-${code}`;
  }

  function buildEvent({ folio, service, total, start, name, phone, address }) {
    const end = new Date(start.getTime() + service.hours * HOUR_MS);
    return {
      title: `Oxifreeze · ${service.label}`,
      start,
      end,
      location: `${address}, Tijuana, B.C.`,
      details: [
        `Folio: ${folio}`,
        `Total estimado: ${money(total)} (IVA incluido)`,
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

  function bookingMessage({ folio, service, total, start, name, phone, address }) {
    return [
      "¡Hola, Oxifreeze! Acabo de agendar mi servicio:",
      "",
      `• Folio: ${folio}`,
      `• Servicio: ${service.label}`,
      `• Total estimado: ${money(total)} (IVA incluido)`,
      `• Fecha: ${formatLong(start)}, ${hourLabel(start.getHours())} h`,
      `• Nombre: ${name}`,
      `• Teléfono: ${phone}`,
      `• Dirección: ${address}`,
      "",
      "¿Me la confirman, por favor?",
    ].join("\n");
  }

  const api = {
    DAYS_AHEAD, SCHEDULE, DIAS_CORTOS, MESES, serviceFromQuote,
    dateKey, slotKey, nextDays, slotsFor, hasFreeSlot, formatLong, hourLabel,
    normalizePhone, validate, makeFolio, buildEvent, googleCalendarUrl, toIcs, bookingMessage,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.OxiBooking = api;
})(typeof window !== "undefined" ? window : globalThis);
