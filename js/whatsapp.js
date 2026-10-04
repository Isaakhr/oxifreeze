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
