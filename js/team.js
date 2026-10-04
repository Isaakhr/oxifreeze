/* Oxifreeze — tarjetas del equipo, generadas desde OXI_CONFIG.team.
   Se construyen con nodos del DOM (textContent), sin insertar HTML. */
(() => {
  "use strict";

  const list = document.querySelector("[data-team]");
  const team = window.OXI_CONFIG?.team;
  if (!list || !Array.isArray(team)) return;

  // Degradados fríos distintos para cada avatar
  const GRADIENTS = [
    ["#7df9ff", "#1e7bff"],
    ["#b9fbff", "#22d3ee"],
    ["#94dcff", "#135fd6"],
    ["#c6ecff", "#3a8dff"],
    ["#7df9ff", "#0b2147"],
  ];

  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  const initials = (name) => name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  team.forEach((member, i) => {
    const [from, to] = GRADIENTS[i % GRADIENTS.length];
    const li = make("li", "member");
    li.style.setProperty("--g1", from);
    li.style.setProperty("--g2", to);

    const avatar = make("div", "member__avatar");
    if (member.photo) {
      const img = document.createElement("img");
      img.src = member.photo;
      img.alt = `Foto de ${member.name}`;
      img.width = 320;
      img.height = 320;
      img.loading = "lazy";
      img.decoding = "async";
      // Si la foto no existe, se regresa a las iniciales
      img.addEventListener("error", () => { img.remove(); avatar.append(make("span", "member__initials", initials(member.name))); });
      avatar.append(img);
    } else {
      avatar.append(make("span", "member__initials", initials(member.name)));
    }

    li.append(
      avatar,
      make("h3", "member__name", member.name),
      make("p", "member__role", member.role),
      make("p", "member__focus", member.focus || "")
    );
    list.append(li);
  });
})();
