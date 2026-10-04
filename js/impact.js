/* Oxifreeze — impacto: contadores animados y calculadora de ahorro en CFE. */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const COUNT_MS = 1400;

  /* ---------- Contadores ---------- */
  const fmt = (n) => Math.round(n).toLocaleString("es-MX");

  function countUp(el) {
    const target = Number(el.dataset.count);
    if (reduceMotion.matches || document.hidden) {
      el.textContent = fmt(target);
      return;
    }
    let done = false;
    const finish = () => { done = true; el.textContent = fmt(target); };
    const start = performance.now();
    const tick = () => {
      if (done) return;
      const t = Math.min(1, (performance.now() - start) / COUNT_MS);
      if (t >= 1) return finish();
      el.textContent = fmt(target * (1 - Math.pow(1 - t, 4)));
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    // Respaldo por si el navegador pausa requestAnimationFrame: el número final siempre llega.
    setTimeout(finish, COUNT_MS + 200);
  }

  const counters = document.querySelectorAll("[data-count]");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      countUp(entry.target);
    });
  }, { threshold: 0.6 });
  counters.forEach((el) => io.observe(el));

  /* ---------- Calculadora de ahorro ---------- */
  const saver = document.querySelector("[data-saver]");
  if (!saver) return;

  const AC_SHARE = 0.5;          // el A/C como mitad del recibo en verano (supuesto)
  const SAVING_MIN = 0.05;       // U.S. DOE: 5 %
  const SAVING_MAX = 0.15;       // U.S. DOE: 15 %
  const range = saver.querySelector("input[type=range]");
  const billOut = saver.querySelector("[data-saver-bill]");
  const resultOut = saver.querySelector("[data-saver-out]");
  const money = (n) => "$" + fmt(n);

  function renderSaver() {
    const bill = Number(range.value);
    const min = Number(range.min);
    const max = Number(range.max);
    range.style.setProperty("--fill", `${((bill - min) / (max - min)) * 100}%`);
    billOut.textContent = money(bill);
    resultOut.textContent = `${money(bill * AC_SHARE * SAVING_MIN)} – ${money(bill * AC_SHARE * SAVING_MAX)}`;
  }
  range.addEventListener("input", renderSaver);
  renderSaver();
})();
