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
