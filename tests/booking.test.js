process.env.TZ = "America/Tijuana";
const test = require("node:test");
const assert = require("node:assert/strict");
const B = require("../js/booking.js");

// Viernes 2 de octubre de 2026, 10:30 a. m. en Tijuana
const NOW = new Date(2026, 9, 2, 10, 30);

test("muestra los próximos 14 días empezando hoy", () => {
  const days = B.nextDays(NOW);
  assert.equal(days.length, 14);
  assert.equal(B.dateKey(days[0]), "2026-10-02");
  assert.equal(B.dateKey(days[13]), "2026-10-15");
});

test("domingo cerrado y sábado solo en la mañana", () => {
  assert.equal(B.slotsFor(new Date(2026, 9, 4), NOW).length, 0);        // domingo
  assert.deepEqual(B.slotsFor(new Date(2026, 9, 3), NOW).map((s) => s.hour), [9, 11, 13]); // sábado
});

test("hoy no se pueden elegir horarios con menos de 2 h de anticipación", () => {
  const today = B.slotsFor(new Date(2026, 9, 2), NOW);
  const byHour = Object.fromEntries(today.map((s) => [s.hour, s.status]));
  assert.equal(byHour[9], "past");
  assert.equal(byHour[11], "past");     // 11:00 está a 30 min
  assert.notEqual(byHour[13], "past");  // 13:00 está a 2.5 h
});

test("un horario ya reservado aparece ocupado", () => {
  const day = new Date(2026, 9, 6);
  const free = B.slotsFor(day, NOW).find((s) => s.status === "free");
  const after = B.slotsFor(day, NOW, [free.key]).find((s) => s.key === free.key);
  assert.equal(after.status, "busy");
});

test("validación: acepta datos buenos y normaliza el teléfono", () => {
  const r = B.validate({ name: "  Ana   López ", phone: "+52 (664) 123-4567", address: "Calle 5 #123, Col. Libertad", service: "mantenimiento", slot: "2026-10-06T09" });
  assert.equal(r.ok, true);
  assert.equal(r.clean.name, "Ana López");
  assert.equal(r.clean.phone, "6641234567");
});

test("validación: marca cada campo malo", () => {
  const r = B.validate({ name: "A1", phone: "664", address: "x", service: "nope", slot: "" });
  assert.equal(r.ok, false);
  assert.deepEqual(Object.keys(r.errors).sort(), ["address", "name", "phone", "service", "slot"]);
});

test("folio con formato OXI-MMDD-XXXX", () => {
  assert.match(B.makeFolio(new Date(2026, 9, 6)), /^OXI-1006-[A-HJ-NP-Z2-9]{4}$/);
});

test("evento: link de Google Calendar con horas en UTC correctas", () => {
  const service = B.SERVICE_OPTIONS.find((s) => s.id === "instalacion-minisplit");
  const ev = B.buildEvent({ folio: "OXI-1006-TEST", service, start: new Date(2026, 9, 6, 11), name: "Ana", phone: "6641234567", address: "Calle 5 #123" });
  const url = new URL(B.googleCalendarUrl(ev));
  assert.equal(url.host, "calendar.google.com");
  assert.equal(url.searchParams.get("action"), "TEMPLATE");
  // 11:00 PDT (UTC−7) = 18:00 UTC; instalación dura 4 h
  assert.equal(url.searchParams.get("dates"), "20261006T180000Z/20261006T220000Z");
  assert.ok(url.searchParams.get("details").includes("OXI-1006-TEST"));
});

test("archivo .ics válido: CRLF, campos obligatorios y líneas cortas", () => {
  const service = B.SERVICE_OPTIONS.find((s) => s.id === "limpieza");
  const ev = B.buildEvent({ folio: "OXI-1006-TEST", service, start: new Date(2026, 9, 6, 9), name: "Ana", phone: "6641234567", address: "Av. Revolución 1234, Zona Centro; frente al parque" });
  const ics = B.toIcs(ev, "OXI-1006-TEST", NOW);
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n"));
  assert.ok(ics.endsWith("END:VCALENDAR\r\n"));
  for (const f of ["VERSION:2.0", "UID:OXI-1006-TEST@oxifreeze.mx", "DTSTART:20261006T160000Z", "DTEND:20261006T180000Z"]) {
    assert.ok(ics.includes(f), `falta ${f}`);
  }
  assert.ok(ics.includes("Zona Centro\\; frente"), "debe escapar ';'");
  for (const line of ics.split("\r\n")) assert.ok(Buffer.byteLength(line) <= 75, `línea larga: ${line}`);
});

test("líneas con muchos acentos también se pliegan a ≤ 75 bytes", () => {
  const service = B.SERVICE_OPTIONS[0];
  const ev = B.buildEvent({ folio: "F", service, start: new Date(2026, 9, 6, 9), name: "ÁÉÍÓÚÑ".repeat(20), phone: "6641234567", address: "Ñuñoa ".repeat(20) });
  for (const line of B.toIcs(ev, "F", NOW).split("\r\n")) assert.ok(Buffer.byteLength(line) <= 75);
});

test("mensaje de WhatsApp de la cita trae folio, fecha y hora", () => {
  const service = B.SERVICE_OPTIONS.find((s) => s.id === "mantenimiento");
  const msg = B.bookingMessage({ folio: "OXI-1006-TEST", service, start: new Date(2026, 9, 6, 15), name: "Ana", phone: "6641234567", address: "Calle 5" });
  assert.ok(msg.includes("OXI-1006-TEST"));
  assert.ok(msg.includes("martes 6 de octubre, 15:00 h"));
});
