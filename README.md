# Oxifreeze — prototipo web

Proyecto escolar de Economía (“Crea una empresa que transforme tu comunidad”).
**Empresa ficticia**: instalación y mantenimiento de aire acondicionado en Tijuana, B.C.
Equipo: Luka, Iker, Isaak, Felipe y Camarena.

Sitio estático (HTML + CSS + JavaScript, sin backend ni dependencias) publicado en GitHub Pages:

- **Sitio:** https://isaakhr.github.io/oxifreeze/
- **QR para imprimir:** https://isaakhr.github.io/oxifreeze/qr.html
- PageSpeed Insights: celular 99 / 100 / 100 / 100 · escritorio 100 / 100 / 100 / 100

Para publicar cambios: `npm run build`, `npm test`, commit y `git push` (GitHub Pages se actualiza en ~1 minuto).

## Para la exposición

| Acción | Cómo |
|---|---|
| Modo presentación | Tecla **P** (o el botón de pantalla en la barra). **→ / ←**, AvPág/RePág o Espacio para avanzar; **Inicio/Fin**; **Esc** para salir. |
| Demo calor / frío | El interruptor de la barra o la tecla **C**. |
| QR para la mampara | Abrir `qr.html` → **Imprimir** o **Descargar PNG**. |
| Cotizador y agenda | Funcionan en vivo durante la presentación; las citas se guardan solo en ese navegador. |

## Editar contenido

- **WhatsApp y equipo** (roles, fotos): `js/config.js`. Fotos en `assets/equipo/` (cuadradas, ~400 px).
- **Precios, zonas y tiempos**: `js/pricing.js` (una sola fuente: tarjetas, cotizador y footer la usan).
- **Horarios de la agenda**: `SCHEDULE` en `js/booking.js`.
- **Textos**: `index.html`.

**Importante:** la página carga dos paquetes (`css/oxifreeze.bundle.css` y `js/oxifreeze.bundle.js`)
para abrir más rápido en celular. Después de editar cualquier archivo de `css/` o `js/`:

```bash
npm run build
```

y luego las pruebas (fallan si olvidaste el build o si un cambio rompe precios u horarios):

```bash
npm test
```

## Correr en tu compu

```bash
python -m http.server 5173
```

y abrir <http://localhost:5173>.

## Estructura

```
index.html        página principal (todas las secciones)
qr.html           QR imprimible
css/              estilos por sección (styles = base y hero) + oxifreeze.bundle.css generado
js/               un archivo por sección + oxifreeze.bundle.js generado; pricing, booking y whatsapp son lógica pura con pruebas
vendor/qrcode.js  generador de QR (Kazuhiko Arase, licencia MIT)
assets/           logo, favicon, imagen para compartir (og.png)
tests/            pruebas con node:test
tools/            build.mjs (paquetes), shot.mjs (capturas) y plantillas de imágenes
canary/           evidencia de cada fase (capturas y reportes)
```

## Fuentes de datos

- Ahorro de 5–15 % con filtro limpio: U.S. Department of Energy, “Maintaining Your Air Conditioner”.
- Potencial de calentamiento R-410A 2,088 / R-32 675: IPCC AR4.
- Todo lo demás (precios, empleos, hogares, reparto de cada $100, “Frío Solidario”) es **estimado o ficticio** y así está marcado en la página.
