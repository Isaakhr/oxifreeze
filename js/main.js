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
})();
