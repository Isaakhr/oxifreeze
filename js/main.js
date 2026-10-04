/* Oxifreeze — navegación: estado al hacer scroll, menú móvil y link activo. */
(() => {
  "use strict";

  const nav = document.querySelector("[data-nav]");
  const burger = document.querySelector("[data-burger]");
  const links = [...document.querySelectorAll(".nav__links a")];
  const SCROLLED_AT = 24;

  const setScrolled = () => nav.classList.toggle("is-scrolled", window.scrollY > SCROLLED_AT);
  window.addEventListener("scroll", setScrolled, { passive: true });
  setScrolled();

  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  };

  burger.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  nav.querySelectorAll(".nav__menu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      setMenu(false);
      burger.focus();
    }
  });
  window.matchMedia("(min-width: 1024px)").addEventListener("change", (e) => e.matches && setMenu(false));

  // Link activo según la sección visible
  const byId = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.remove("is-active"));
        byId.get(entry.target.id)?.classList.add("is-active");
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  document.querySelectorAll("main > section[id]").forEach((s) => observer.observe(s));

  /* ---------- Saltos a secciones (#ancla) ----------
     Con content-visibility las secciones lejanas tienen una altura estimada; al ir llegando se
     miden y cambian de tamaño, así que el salto puede quedar corrido. Después de cada salto se
     revisa dónde quedó la sección y se corrige (hasta 3 veces). */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const STILL_FRAMES = 6;          // ~100 ms sin moverse = el scroll terminó
  const SCROLL_TIMEOUT_MS = 2500;
  const MAX_FIXES = 3;
  const TOLERANCE_PX = 4;

  const waitScrollEnd = () => new Promise((resolve) => {
    const start = performance.now();
    let last = -1;
    let still = 0;
    const tick = () => {
      const y = window.scrollY;
      still = y === last ? still + 1 : 0;
      last = y;
      if (still >= STILL_FRAMES || performance.now() - start > SCROLL_TIMEOUT_MS) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  const scrollPadding = () => parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;

  async function scrollToSection(el, { smooth = true } = {}) {
    el.scrollIntoView({ behavior: smooth && !reduceMotion.matches ? "smooth" : "auto", block: "start" });
    for (let i = 0; i < MAX_FIXES; i++) {
      await waitScrollEnd();
      const delta = el.getBoundingClientRect().top - scrollPadding();
      if (Math.abs(delta) <= TOLERANCE_PX) break;
      window.scrollBy({ top: delta, behavior: "instant" });
    }
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const id = decodeURIComponent(a.getAttribute("href").slice(1));
    const el = id && document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    history.pushState(null, "", `#${id}`);
    scrollToSection(el);
    // El enlace "Saltar al contenido" también debe mover el foco del teclado
    if (a.classList.contains("skip-link")) {
      el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    }
  });

  // Si la página abrió con #ancla (por ejemplo desde un link compartido), se corrige igual.
  const fixInitialHash = () => {
    const el = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (el) scrollToSection(el, { smooth: false });
  };
  if (document.readyState === "complete") fixInitialHash();
  else window.addEventListener("load", fixInitialHash, { once: true });

  window.OxiScrollTo = scrollToSection;
})();
