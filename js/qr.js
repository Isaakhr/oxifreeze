/* Oxifreeze — QR de la URL del sitio. La librería (vendor/qrcode.js, MIT) se carga bajo demanda. */
(function (root) {
  "use strict";

  const LIB_SRC = "vendor/qrcode.js";
  let loading = null;

  function loadLib() {
    if (root.qrcode) return Promise.resolve(root.qrcode);
    if (!loading) {
      loading = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = LIB_SRC;
        s.async = true;
        s.onload = () => (root.qrcode ? resolve(root.qrcode) : reject(new Error("qrcode no se cargó")));
        s.onerror = () => reject(new Error(`No se pudo cargar ${LIB_SRC}`));
        document.head.append(s);
      });
    }
    return loading;
  }

  /** URL pública de la página principal (sin hash, query ni "qr.html"). ?url= la sobrescribe. */
  function siteUrl() {
    const override = new URLSearchParams(location.search).get("url");
    if (override && /^https?:\/\//.test(override)) return override;
    return new URL("./", location.href).href;
  }

  async function render(el, url) {
    const qrcode = await loadLib();
    const qr = qrcode(0, "M");       // versión automática, corrección de errores media (~15 %)
    qr.addData(url);
    qr.make();
    // SVG generado por la librería a partir de la URL (no hay texto de usuario dentro).
    el.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    const svg = el.querySelector("svg");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", `Código QR de ${url}`);
    return qr.getModuleCount();
  }

  root.OxiQR = { siteUrl, render };
})(window);
