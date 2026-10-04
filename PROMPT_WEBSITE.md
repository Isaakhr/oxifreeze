# PROMPT — Página web Oxifreeze (para la exposición)

## Contexto
Somos un equipo de prepa (Luka, Iker, Isaak, Felipe y Camarena) con un proyecto de Economía: **"Crea una empresa que transforme tu comunidad"**. Nuestra empresa ficticia es **Oxifreeze**: instalación y mantenimiento de aire acondicionado en **Tijuana, B.C.** La página web ES nuestro prototipo: se va a mostrar en vivo durante una exposición de 8–10 min, y los maestros/compañeros la van a abrir en su celular escaneando un QR de la mampara.

Objetivo: que sea la página más impresionante del salón. Que se sienta como una empresa real con un producto real, no como una tarea.

## Stack y restricciones
- Sitio estático: HTML + CSS + JS vanilla (o Vite si hace falta), **sin backend**. Deploy en **GitHub Pages**.
- Mobile-first (la mayoría la verá en celular), pero que se vea brutal en el proyector (1920×1080).
- Todo en **español**.
- Carga rápida: < 2 s en 4G, sin librerías pesadas innecesarias. Si usas 3D/animación (Three.js, GSAP), que valga la pena y tenga fallback.
- Respeta `prefers-reduced-motion`.
- Precios y datos son de una empresa ficticia: márcalos como "precios estimados".

## Identidad visual
- Nombre: **Oxifreeze**. Concepto: aire frío y limpio, alivio del calor de Tijuana.
- Paleta fría: azul hielo, cian y blanco, con un acento cálido (naranja/rojo) SOLO para representar el "calor" que Oxifreeze elimina.
- Tipografía moderna y limpia (Google Fonts). Logo simple en SVG hecho por ti (copo de nieve / ventila / letra O estilizada).
- Nada de look de plantilla genérica. Que tenga personalidad.

## Secciones (en este orden)
1. **Hero**: "Tijuana se calienta. Tú no." (o una mejor). Animación de partículas de aire frío / termómetro que baja de 38 °C a 22 °C al hacer scroll. CTA: "Cotiza en 30 segundos" y "Agenda tu servicio".
2. **Servicios**: instalación (minisplit, ventana, central), mantenimiento preventivo, reparación/recarga de gas, limpieza profunda. Cards con ícono, precio "desde" y tiempo estimado.
3. **Cotizador interactivo** (la estrella del demo): el usuario elige tipo de servicio, tamaño del cuarto (m²) o toneladas, número de equipos, tipo de equipo y colonia/zona. Calcula el precio estimado en vivo, con animación del número. Incluye la regla de toneladas por m² explicada. Botón "Enviar cotización por WhatsApp" que arma el mensaje con todo prellenado (link `wa.me`).
4. **Agenda en línea**: calendario visual (próximos 14 días), horarios disponibles y formulario (nombre, teléfono, dirección, servicio). Al confirmar: pantalla de éxito con número de folio generado y opción de enviar por WhatsApp / agregar a Google Calendar (archivo `.ics` o URL de Google Calendar). Sin backend: todo en el cliente.
5. **Cómo transforma nuestra comunidad**: impacto en salud ante golpes de calor, empleos locales (técnicos), ahorro de luz en el recibo de CFE gracias al mantenimiento, manejo responsable de refrigerantes. Contadores animados, marcados como estimados y con fuente si existe.
6. **Nuestra economía** (la sección que conecta con la materia):
   - **Agentes económicos**: Familias (clientes que pagan el servicio + trabajadores que reciben salario), Empresas (proveedores de gas refrigerante, cobre, filtros, herramientas, hosting/dominio y transporte; Oxifreeze también le vende a negocios locales), Gobierno (IVA/ISR vía SAT, calles y luz de CFE, permisos municipales, normas de refrigerantes, Profeco). Mostrarlo como **diagrama de flujo circular interactivo**: flujo de dinero vs. flujo de bienes/servicios, animado; al tocar un agente se expande su explicación.
   - **Sectores económicos**: Primario (extracción de cobre/materias primas), Secundario (fabricación de equipos, refrigerante, tubería), Terciario (Oxifreeze: servicio de instalación y mantenimiento). Visual tipo cadena de valor.
7. **Equipo**: Luka, Iker, Isaak, Felipe y Camarena, cada uno con su rol en la empresa (placeholders editables para roles y fotos/avatars).
8. **FAQ**: 5–6 preguntas reales (¿cada cuánto dar mantenimiento?, ¿qué tamaño de minisplit necesito?, ¿dan garantía?, etc.).
9. **Footer**: WhatsApp, zona de cobertura (colonias de Tijuana) y el aviso "Proyecto escolar — empresa ficticia".

## Extras "wow" para la exposición
- **Modo presentación**: tecla `P` (o un botón discreto) que convierte la página en slides a pantalla completa, sección por sección, navegables con las flechas del teclado. Así la expo se da desde la misma web.
- **Página de QR** (`/qr` o una sección) que muestra en grande el QR de la URL para imprimirlo en la mampara.
- **Toggle "calor / frío"**: un switch que cambia toda la página de rojo/naranja sofocante a azul fresco con una transición suave. Es la demo visual del producto.
- Micro-interacciones: botones con feedback, scroll reveal sutil, cursor/partículas de frío en desktop.
- Favicon, meta tags y Open Graph para que al compartir el link por WhatsApp se vea con imagen y título.

## Forma de trabajar (OBLIGATORIO)
Trabaja **UNA FASE A LA VEZ**. Al terminar cada fase, corre un **canary**: ábrela en el navegador, revisa que la consola no tenga errores, pruébala en 375 px y en 1920 px y toma un screenshot. Luego reporta **PASS/FAIL** con evidencia. No pases a la siguiente fase sin PASS, y no me digas "ya quedó" sin prueba.

- **Fase 1**: estructura, identidad visual (paleta, tipografía, logo SVG), hero + navegación. Canary: carga sin errores y es responsive.
- **Fase 2**: servicios + cotizador interactivo + envío por WhatsApp. Canary: 3 cotizaciones de prueba con resultado correcto y mensaje de WhatsApp bien formado.
- **Fase 3**: agenda en línea con folio y link de calendario. Canary: agendar una cita de prueba de punta a punta.
- **Fase 4**: impacto en la comunidad + Nuestra economía (diagrama de flujo circular + sectores). Canary: todos los agentes son clickeables y el contenido es correcto.
- **Fase 5**: equipo, FAQ, footer, toggle calor/frío, modo presentación, página de QR, meta tags. Canary: el modo presentación se navega de inicio a fin.
- **Fase 6**: pulido final. Performance (Lighthouse ≥ 90 en Performance y Accessibility), accesibilidad, deploy a GitHub Pages, URL final + QR. Canary: la URL pública abre en un celular real.

Empieza con la Fase 1.
