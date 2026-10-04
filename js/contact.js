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
