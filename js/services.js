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
