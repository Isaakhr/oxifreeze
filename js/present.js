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
    { title: "Cotiza en vivo", y: () => topOf("#cotizador") },
    { title: "Agenda la misma cotización", y: () => topOf("#agendar") },
    { title: "Flujo circular: sigue un pago", y: () => topOf(".flow") },
    { title: "¿A dónde va cada $100?", y: () => topOf(".split") },
    { title: "Sectores económicos", y: () => topOf(".sectors") },
    { title: "Lo que Oxifreeze le deja a Tijuana", y: () => topOf("#impacto") },
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
