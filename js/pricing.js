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
      service: input.service,
      equipo: input.equipo,
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

  // ¿A dónde va el dinero de un pago? El IVA es exacto (16 % sobre el precio sin impuesto);
  // el resto se reparte con estos pesos (estimado del equipo). Para $100 da 14·35·30·8·5·8.
  const PAYMENT_SPLIT = [
    { key: "salarios", label: "Salarios de técnicos", weight: 35 },
    { key: "materiales", label: "Cobre, gas y filtros", weight: 30 },
    { key: "transporte", label: "Transporte", weight: 8 },
    { key: "herramientas", label: "Herramientas y web", weight: 5 },
    { key: "ganancia", label: "Ganancia", weight: 8 },
  ];

  /** Reparte un total (con IVA) en partes enteras que suman exactamente el total (mayor residuo). */
  function paymentBreakdown(total) {
    const iva = Math.round(total - total / (1 + IVA_RATE));
    const rest = total - iva;
    const weightSum = PAYMENT_SPLIT.reduce((s, p) => s + p.weight, 0);
    const raw = PAYMENT_SPLIT.map((p) => ({ ...p, exact: (rest * p.weight) / weightSum }));
    const parts = raw.map((p) => ({ ...p, amount: Math.floor(p.exact) }));
    let missing = rest - parts.reduce((s, p) => s + p.amount, 0);
    const byRemainder = [...parts.keys()].sort((a, b) => (raw[b].exact % 1) - (raw[a].exact % 1));
    for (const i of byRemainder) {
      if (missing <= 0) break;
      parts[i] = { ...parts[i], amount: parts[i].amount + 1 };
      missing -= 1;
    }
    return [
      { key: "iva", label: "IVA al SAT", amount: iva },
      ...parts.map(({ key, label, amount }) => ({ key, label, amount })),
    ];
  }

  const api = { IVA_RATE, M2_PER_TON, VOLUME_DISCOUNT, EQUIPOS, SERVICES, ZONAS, PAYMENT_SPLIT, tonsForArea, unitPrice, fromPrice, quote, paymentBreakdown };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.OxiPricing = api;
})(typeof window !== "undefined" ? window : globalThis);
