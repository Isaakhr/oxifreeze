/* Oxifreeze — interruptor calor / frío: la demo visual del producto.
   Modo calor = "Tijuana sin Oxifreeze": toda la página se tiñe de naranja sofocante.
   Atajo de teclado: C. Siempre arranca en frío (no se guarda). */
(() => {
  "use strict";

  const root = document.documentElement;
  const toggle = document.querySelector("[data-climate-toggle]");
  const toast = document.querySelector("[data-toast]");
  if (!toggle) return;

  const TOAST_MS = 2600;
  const FADE_MS = 950;           // igual que la transición de opacidad en extras.css
  const layers = [...document.querySelectorAll(".climate-layer, .climate-haze")];
  let hideTimer = 0;
  const MESSAGES = {
    hot: "🔥 Así se siente Tijuana sin Oxifreeze: 38 °C",
    cold: "❄️ Con Oxifreeze: 22 °C. Respira.",
  };
  let toastTimer = 0;

  function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), TOAST_MS);
  }

  function setClimate(mode, { announce = true } = {}) {
    const hot = mode === "hot";
    clearTimeout(hideTimer);
    if (hot) {
      // Las capas con mix-blend-mode cuestan caro aunque sean invisibles: solo existen en modo calor.
      layers.forEach((el) => { el.hidden = false; });
      void root.offsetWidth; // aplica el display antes de animar la opacidad
    } else {
      hideTimer = setTimeout(() => layers.forEach((el) => { el.hidden = true; }), FADE_MS);
    }
    root.dataset.climate = hot ? "hot" : "cold";
    toggle.setAttribute("aria-checked", String(hot));
    toggle.setAttribute("aria-label", hot ? "Volver al modo frío con Oxifreeze" : "Simular Tijuana sin aire acondicionado");
    if (announce) showToast(MESSAGES[hot ? "hot" : "cold"]);
  }

  const isTyping = (el) => el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

  toggle.addEventListener("click", () => setClimate(root.dataset.climate === "hot" ? "cold" : "hot"));
  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() !== "c" || e.ctrlKey || e.metaKey || e.altKey || isTyping(document.activeElement)) return;
    setClimate(root.dataset.climate === "hot" ? "cold" : "hot");
  });

  setClimate("cold", { announce: false });
  window.OxiClimate = { setClimate, showToast };
})();
