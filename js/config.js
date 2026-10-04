/* Oxifreeze — configuración editable (todo lo que el equipo puede cambiar sin tocar código).

   whatsappNumber: WhatsApp del equipo para la expo: 52 + 10 dígitos, sin "+", espacios ni guiones.

   team: roles y fotos. Para usar foto, guarden la imagen en assets/equipo/ (cuadrada, ~400 px)
   y escriban la ruta en "photo", por ejemplo "assets/equipo/luka.jpg". Si "photo" está vacío,
   se muestran las iniciales. */
window.OXI_CONFIG = Object.freeze({
  whatsappNumber: "526631015003",

  team: [
    { name: "Luka", role: "CEO · Dirección general", focus: "Estrategia, alianzas y la presentación del proyecto", photo: "assets/equipo/luka-web.jpg" },
    { name: "Iker", role: "CFO · Finanzas", focus: "Costos, precios, impuestos y el reparto de cada $100", photo: "assets/equipo/iker-web.jpg" },
    { name: "Isaak", role: "CTO · Tecnología", focus: "Esta web: cotizador, agenda en línea y diseño", photo: "assets/equipo/isaak-web.jpg" },
    { name: "Felipe", role: "COO · Operaciones", focus: "Técnicos, rutas por zona y calidad del servicio", photo: "assets/equipo/felipe-web.jpg" },
    { name: "Camarena", role: "CMO · Marketing", focus: "Redes sociales, WhatsApp y atención al cliente", photo: "assets/equipo/camarena-web.jpg" },
  ],
});
