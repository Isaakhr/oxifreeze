/* Oxifreeze — hero: el scroll baja la temperatura de 38 °C a 22 °C
   y las partículas pasan de brasas que suben a aire frío que fluye. */
(() => {
  "use strict";

  const hero = document.querySelector("[data-hero]");
  if (!hero) return;

  const T_HOT = 38;
  const T_COLD = 22;
  const SCALE_MIN = 15;          // °C en la base de la escala del termómetro
  const SCALE_Y_MIN = 230;       // y (SVG) de 15 °C
  const PX_PER_DEGREE = 7;       // 45 °C queda en y = 20
  const MERCURY_BOTTOM = 258;

  const tempEl = hero.querySelector("[data-temp]");
  const statusEl = hero.querySelector("[data-status]");
  const mercury = hero.querySelector("[data-mercury]");
  const hint = hero.querySelector("[data-hint]");
  const canvas = hero.querySelector("[data-particles]");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const STATUSES = [
    [34, "Sofocante"],
    [29, "Bochorno"],
    [25, "Refrescando"],
    [-Infinity, "Ideal"],
  ];
  const statusFor = (t) => STATUSES.find(([min]) => t >= min)[1];

  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  let target = 1;   // calor objetivo según scroll (1 = 38 °C, 0 = 22 °C)
  let heat = 1;     // calor actual (suavizado)
  let lastShownTemp = null;

  function progressFromScroll() {
    const rect = hero.getBoundingClientRect();
    const travel = hero.offsetHeight - window.innerHeight;
    if (travel <= 0) return 0;
    // El enfriamiento termina un poco antes del final para que se lea el 22 °C.
    return clamp01(-rect.top / (travel * 0.85));
  }

  // Solo toca el DOM cuando el calor cambió: cambiar --heat recalcula estilos de todo el hero.
  let lastRenderedHeat = null;
  function render() {
    const rounded = heat.toFixed(3);
    if (rounded === lastRenderedHeat) return;
    lastRenderedHeat = rounded;
    hero.style.setProperty("--heat", rounded);
    const t = Math.round(lerp(T_COLD, T_HOT, heat));
    if (t !== lastShownTemp) {
      lastShownTemp = t;
      tempEl.textContent = t;
      statusEl.textContent = statusFor(t);
    }
    const exact = lerp(T_COLD, T_HOT, heat);
    const y = SCALE_Y_MIN - (exact - SCALE_MIN) * PX_PER_DEGREE;
    mercury.setAttribute("y", y.toFixed(1));
    mercury.setAttribute("height", (MERCURY_BOTTOM - y).toFixed(1));
    hint.style.opacity = heat < 0.08 ? "0" : "";
  }

  /* ---------------- Partículas ---------------- */
  const ctx = canvas.getContext("2d");
  const particles = [];
  let width = 0;
  let height = 0;
  let heroVisible = true;

  const HOT_RGB = [255, 122, 48];
  const COLD_RGB = [190, 242, 255];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.round(Math.min(140, Math.max(50, (width * height) / 14000)));
    particles.length = 0;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.6 + Math.random() * 2.2,
        speed: 0.4 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.25 + Math.random() * 0.6,
      });
    }
  }

  function step(p, h, time) {
    const wobble = Math.sin(time * 0.0015 + p.phase);
    // Calor: suben lento y ondulan. Frío: corriente de aire diagonal (como sale de un minisplit).
    const vx = lerp(-1.6 * p.speed, wobble * 0.35, h);
    const vy = lerp(0.55 * p.speed + wobble * 0.15, -0.9 * p.speed, h);
    p.x += vx;
    p.y += vy;
    if (p.x < -10) p.x = width + 10;
    if (p.x > width + 10) p.x = -10;
    if (p.y < -10) p.y = height + 10;
    if (p.y > height + 10) p.y = -10;
  }

  function draw(time, animate) {
    ctx.clearRect(0, 0, width, height);
    const h = heat;
    const rgb = HOT_RGB.map((c, i) => Math.round(lerp(COLD_RGB[i], c, h)));
    ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
    ctx.strokeStyle = ctx.fillStyle;
    ctx.globalCompositeOperation = "lighter";

    for (const p of particles) {
      if (animate) step(p, h, time);
      ctx.globalAlpha = p.alpha * lerp(0.9, 0.75, h);
      // En frío, las partículas grandes dejan una estela (flujo de aire).
      if (h < 0.6 && p.r > 1.6) {
        ctx.lineWidth = p.r * 0.7;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + 14 * p.speed * (1 - h), p.y - 5 * p.speed * (1 - h));
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * lerp(1, 1.35, h), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  /* ---------------- Loop ---------------- */
  let rafId = 0;
  // Las partículas se mueven hasta que la página terminó de cargar y el navegador está libre:
  // así la animación no compite con la carga (antes se dibujan quietas).
  let particlesLive = false;
  const IDLE_TIMEOUT_MS = 2500;

  function frame(time) {
    rafId = 0;
    const smooth = reduceMotion.matches ? 1 : 0.12;
    heat += (target - heat) * smooth;
    if (Math.abs(target - heat) < 0.0005) heat = target;
    render();
    const animate = particlesLive && !reduceMotion.matches;
    draw(time, animate);
    if ((animate && heroVisible && !document.hidden) || heat !== target) schedule();
  }

  function startParticles() {
    particlesLive = true;
    schedule();
  }
  const whenIdle = () => (window.requestIdleCallback
    ? requestIdleCallback(startParticles, { timeout: IDLE_TIMEOUT_MS })
    : setTimeout(startParticles, 300));
  if (document.readyState === "complete") whenIdle();
  else window.addEventListener("load", whenIdle, { once: true });

  function schedule() {
    if (!rafId) rafId = requestAnimationFrame(frame);
  }

  function onScroll() {
    target = 1 - progressFromScroll();
    schedule();
  }

  new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    if (heroVisible) schedule();
  }).observe(hero);

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => { resize(); onScroll(); });
  document.addEventListener("visibilitychange", schedule);
  reduceMotion.addEventListener("change", schedule);

  resize();
  target = 1 - progressFromScroll();
  heat = target;
  schedule();
})();
