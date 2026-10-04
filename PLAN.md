# PLAN — Oxifreeze (web para la exposición)

> Una fase no se cierra sin evidencia real (canary PASS). Nada se marca completo sobre promesas.

**Fecha de inicio:** 2026-10-02
**Objetivo general:** prototipo web de Oxifreeze (empresa ficticia de A/C en Tijuana) que se presenta en vivo y se abre por QR en celulares.

---

## Fase 0 — Setup

- [x] Alcance: sitio estático HTML/CSS/JS vanilla, sin backend, deploy en GitHub Pages. Brief completo en `PROMPT_WEBSITE.md`.
- [x] Dependencias: ninguna en runtime salvo Google Fonts. Servidor local: `python -m http.server 5173`.
- [x] Estructura base: `index.html`, `css/`, `js/`, `assets/`.

**Estado:** [x] completo (sin `npm install`: no hay dependencias)

---

## Fase 1 — Estructura, identidad visual, hero + navegación

- [x] Tokens de color (azul hielo / cian / blanco + acento calor), tipografía (Unbounded + Manrope)
- [x] Logo SVG propio (O-copo) + favicon
- [x] Navegación fija + menú móvil
- [x] Hero con termómetro 38 → 22 °C ligado al scroll + partículas (canvas) + CTAs
- [x] `prefers-reduced-motion` respetado

**Canary PASS:** carga sin errores de consola; screenshots en 375 px y 1920 px; termómetro llega a 22 °C al final del hero.

**Estado:** [x] PASS (2026-10-02) — 0 errores de consola; 375 px y 1920 px sin scroll horizontal; scroll 38 → 30 → 22 °C medido; menú móvil abre, navega y cierra. Evidencia: `canary/fase1/`.

---

## Fase 2 — Servicios + cotizador + WhatsApp

- [x] Motor de precios único (`js/pricing.js`), IVA incluido, regla 16 m²/ton, -10 % desde el 2.º equipo, cargo por zona
- [x] 6 tarjetas de servicios (bento) con precio "desde" y tiempo, generadas desde el mismo motor
- [x] Cotizador: servicio, equipo, m² o toneladas, nº de equipos, zona; total animado; recibo tipo ticket; barra flotante en móvil
- [x] Mensaje de WhatsApp prellenado (`wa.me`) — número FICTICIO en `js/config.js`
- [x] Pruebas: `npm test` → 8/8

**Canary PASS:** 3 cotizaciones de prueba con resultado correcto y mensaje `wa.me` bien formado.
**Estado:** [x] PASS (2026-10-02) — desde la UI: instalación minisplit 20 m² Centro = $3,100 · mantenimiento 3×2 ton Playas = $2,670 · gas ventana 30 m² Valle = $1,750; los 3 coinciden con el cálculo a mano y el texto decodificado del link. 0 errores de consola, sin scroll horizontal en 375/1920. Evidencia: `canary/fase2/`.

## Fase 3 — Agenda en línea (folio + calendario)

- [x] Lógica pura en `js/booking.js` (14 días, horarios L–V 9–17, sáb 9–13, dom cerrado, 2 h de anticipación, validación, folio, Google Calendar, .ics RFC 5545)
- [x] UI: calendario, horarios libres/ocupados, formulario con errores en línea, pantalla de éxito (folio, copiar, WhatsApp, Google Calendar, .ics, agendar otra)
- [x] Horarios reservados se guardan en el navegador (localStorage) y aparecen "Ocupado"
- [x] El servicio se prellena desde el cotizador
- [x] Pruebas: `npm test` → 19/19

**Canary PASS:** cita de prueba de punta a punta (folio, link Google Calendar / .ics).
**Estado:** [x] PASS (2026-10-02) — cita escrita con teclado en 375 px: mar 6 oct 11:00, folio OXI-1006-NBZY; Google Calendar `dates=20261006T180000Z/20261006T200000Z` (11:00 Tijuana = 18:00 UTC); .ics descargable idéntico al generado; WhatsApp con folio/fecha/datos; 11:00 queda "Ocupado" tras recargar. 2.ª y 3.ª cita en 1920 y 375 OK. 0 errores de consola. **Pendiente:** abrir el link de Google Calendar con sesión iniciada (este navegador no tiene cuenta de Google → redirige al login); se valida en Fase 6 con celular real. Evidencia: `canary/fase3/`.

## Fase 4 — Impacto + Nuestra economía (flujo circular + sectores)

- [x] Impacto: 4 contadores animados (estimados marcados, fuentes DOE e IPCC AR4), 4 pilares (salud/golpe de calor, empleo, ahorro CFE con calculadora, refrigerantes)
- [x] Flujo circular SVG generado desde datos: 3 agentes, 8 flujos (4 de dinero, 4 de bienes/servicios), fichas animadas, filtros, panel por agente (clic, teclado y pestañas)
- [x] ¿A dónde va cada $100? (reparto estimado, suma 100)
- [x] Cadena de valor: primario → secundario → terciario (Oxifreeze)

**Canary PASS:** todos los agentes clickeables y contenido correcto.
**Estado:** [x] PASS (2026-10-02) — clic real en Familias / Gobierno / Empresas en 375 px: cada uno abre su panel y apaga solo los flujos que no lo tocan (c1,c2 / a1–a4 / b1,b2); Enter en el nodo y flechas en las pestañas funcionan; filtros Dinero 4/0, Bienes 0/4, Todo 4/4; contadores terminan en 1,200 · 8 · 15 % · 3×; calculadora 1,200 → $30–$90. 0 errores de consola, sin scroll horizontal. Evidencia: `canary/fase4/`.

Fuentes usadas: U.S. DOE “Maintaining Your Air Conditioner” (5–15 % con filtro limpio); IPCC AR4 (PCG R-410A 2,088 / R-32 675); México ratificó la Enmienda de Kigali (2018); Secretaría de Salud, avisos de “Temporada de calor”. Todo lo demás está marcado como estimado del equipo o ficticio.

## Fase 5 — Equipo, FAQ, footer, toggle calor/frío, modo presentación, QR, meta tags

- [x] Equipo desde `js/config.js` (roles de ejemplo editables, fotos opcionales con respaldo a iniciales)
- [x] FAQ de 6 preguntas (acordeón exclusivo) + botón de WhatsApp
- [x] Footer: CTA con QR, WhatsApp, zonas de cobertura (mismas del cotizador), aviso "Proyecto escolar — empresa ficticia"
- [x] Interruptor calor/frío (clic o tecla C): capa `mix-blend-mode: hue` + bruma cálida, aviso en pantalla
- [x] Modo presentación (tecla P o botón): 13 diapositivas, → / ← / PageUp / PageDown / Espacio / Inicio / Fin / Esc, barra de progreso
- [x] `qr.html` imprimible (carta), descarga PNG 1600 px, `?url=` para cambiar la URL; librería `vendor/qrcode.js` (MIT) local
- [x] Meta tags + Open Graph + Twitter, imagen `assets/og.png` 1200×630, apple-touch-icon
- [x] Aparición al hacer scroll + estela de escarcha del cursor (solo escritorio, respetan reduced-motion)

**Canary PASS:** modo presentación navegable de inicio a fin.
**Estado:** [x] PASS (2026-10-02) — con teclas reales en 1920×1080: P inicia (1/13), → recorre las 13 diapositivas cada una en su posición exacta (scrollY = objetivo), en la 13 la flecha ya no avanza, ← / Inicio / Fin funcionan, Esc sale y restaura la navegación; "Tú no." llega a 22 °C. En 375 px: inicio desde el botón del footer y avance con el botón → de la barra (clics reales). Calor/frío: clic y tecla C. QR decodificado con jsQR = URL exacta (también con `?url=`). 0 errores de consola. Evidencia: `canary/fase5/`.

Pendiente para Fase 6: `og:image` y `og:url` deben ser URL absolutas (WhatsApp no lee rutas relativas) → se ponen al conocer la URL de GitHub Pages. Pantalla completa no se pudo activar dentro del panel de vista previa (lo bloquea el panel); se valida en navegador normal.

## Fase 6 — Pulido, Lighthouse ≥ 90, deploy GitHub Pages

- [x] WhatsApp real (52 663 101 5003) y roles: CEO Luka · CFO Iker · CTO Isaak · COO Felipe · CMO Camarena
- [x] Accesibilidad: contraste AA corregido (etiquetas, estados de horario, botones de WhatsApp) → 100
- [x] Movimiento reducido verificado por emulación: sin partículas, sin apariciones, sin estela, 0 animaciones CSS, sin scroll suave
- [x] Rendimiento: paquetes únicos de CSS/JS (`npm run build`, con prueba de frescura), fuentes propias (OFL), JS arranca tras el primer pintado y por módulos cediendo el control, content-visibility con saltos de ancla corregidos, sin backdrop-filter sobre el canvas, capas del modo calor fuera del DOM en frío
- [x] Deploy: repo público https://github.com/Isaakhr/oxifreeze → GitHub Pages
- [x] Open Graph con URL absolutas; QR público decodificado = https://isaakhr.github.io/oxifreeze/
- [x] README con uso, edición y mantenimiento

**URL final:** https://isaakhr.github.io/oxifreeze/ · **QR:** https://isaakhr.github.io/oxifreeze/qr.html

**Lighthouse — PageSpeed Insights (servidores de Google), 2026-10-03:**
| | Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| Celular | **99** | **100** | 100 | 100 | 1.5 s | 1.6 s | 0 ms | 0.022 |
| Escritorio | **100** | **100** | 100 | 100 | 0.3 s | 0.4 s | 0 ms | 0.009 |

Punto de partida (Lighthouse local, celular): Performance 32, Accessibility 97. Las corridas locales de Lighthouse en esta compu varían mucho (69–96 en celular con el mismo código) por carga del sistema; la referencia es PageSpeed Insights.

**Canary PASS:** URL pública abre en un celular real.
**Estado:** [x] PASS (2026-10-04) — Isaak lo probó en su celular real: todo funciona. Antes: PASS técnico (2026-10-03) — URL pública 200, 0 recursos rotos, 0 errores de consola, saltos de menú exactos en 375/1920 (y con #ancla en la URL), presentación 13/13, QR verificado. **Falta solo la prueba en un celular real del equipo** (escanear el QR, cotizar, enviar a WhatsApp, agendar, abrir Google Calendar y probar pantalla completa con P en la compu de la expo). Evidencia: `canary/fase6/`.

---

## Fase 7 — Ronda de ajustes (pedidos de Isaak tras la prueba en celular)

- [x] Cotizador + agenda en un solo flujo ("Cotiza y agenda"): el recibo tiene "Agendar esta cotización", el formulario ya no pide servicio (lo toma de la cotización), un solo folio con precio + cita; el total viaja a WhatsApp, Google Calendar y .ics; duración de la cita según servicio y equipos
- [x] "Cómo transformamos Tijuana" fusionada en "Nuestra economía" como bloque final "Lo que Oxifreeze le deja a Tijuana" (4 contadores con fuentes); se quitaron pilares y calculadora
- [x] Diagrama más simple (etiquetas de 1–2 palabras, más grandes) + recorrido "Sigue un pago" de 7 pasos con montos reales de la cotización (reparto exacto: suma = total)
- [x] Script de fotos del equipo (`npm run fotos`) — pendiente que el equipo deje las fotos en `assets/equipo/`
- [x] Pruebas: `npm test` 25/25 (nuevas: reparto del pago, servicio/duración desde cotización, total en evento y mensaje)

**Canary PASS:** flujo cotizar → agendar de punta a punta con un solo folio y total correcto; recorrido de pago completo; navegación y presentación sin regresiones.
**Estado:** [x] PASS (2026-10-04) — 375 px: mantenimiento 3×2 ton Playas → resumen "$2,670" en el formulario → "Agendar esta cotización" cae exacto en #agendar → folio OXI-1006-BJJ7, total $2,670 en éxito / WhatsApp / Google Calendar / .ics, 4 h de duración. Recorrido: 7 pasos con flujos y montos correctos ($428 + $1,087 + $1,336 + $249 = $3,100); tocar un agente pausa el recorrido. Menú 6/6 saltos exactos y presentación 12/12 en 375 y 1920; 0 errores de consola; sin scroll horizontal. Evidencia: `canary/fase7/`. PageSpeed Insights tras los cambios (2026-10-04): celular 100/100/100/100 (FCP 1.4 s, LCP 1.5 s, TBT 0 ms) · escritorio 100/100/100/100.

## Notas / decisiones tomadas en el camino

- 2026-10-02 — Vanilla sin Vite: no hay nada que compilar y GitHub Pages sirve los archivos tal cual. Menos piezas que fallen el día de la expo.
- 2026-10-02 — Partículas en `<canvas>` 2D propio en vez de Three.js: ~3 KB contra ~600 KB, y el efecto (aire frío vs. calor) no necesita 3D.
