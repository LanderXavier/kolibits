// Los enlaces entre sitios se adaptan a dónde se está viendo la página:
// - dominio real (kolibits.com): se quedan como https://<subdominio>
// - Docker en tu computadora (*.localhost): van a <subdominio>.localhost con el mismo puerto
// - archivos abiertos directamente: van a la carpeta vecina
const host = location.hostname;
if (!host.endsWith("kolibits.com")) {
  document.querySelectorAll("[data-sitio]").forEach((enlace) => {
    const sitio = enlace.dataset.sitio;
    enlace.href = host.endsWith(".localhost")
      ? `${location.protocol}//${sitio.replace(/\.com$/, ".localhost")}${location.port ? `:${location.port}` : ""}/`
      : `../${sitio}/index.html`;
  });
}

document.querySelectorAll("[data-anio]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// Correo y WhatsApp salen de contacto.json: edítalo ahí y se actualizan todos los botones.
// Mientras carga, los botones ocupan su lugar pero no se ven (así la página no salta).
// Si falta un dato o el archivo falla, ese botón se quita.
fetch("contacto.json")
  .then((respuesta) => {
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    return respuesta.json();
  })
  .then(({ correo, whatsapp, asunto = "", mensaje = "" }) => {
    const datos = {
      correo: correo && { href: `mailto:${correo}?subject=${encodeURIComponent(asunto)}`, texto: correo },
      whatsapp: whatsapp && { href: `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(mensaje)}`, texto: whatsapp },
    };
    document.querySelectorAll("[data-contacto]").forEach((el) => {
      const dato = datos[el.dataset.contacto];
      if (!dato) { el.hidden = true; return; }
      el.href = dato.href;
      if (!el.textContent.trim()) el.textContent = dato.texto;
    });
  })
  .catch((error) => {
    console.warn("No se pudo leer contacto.json:", error);
    document.querySelectorAll("[data-contacto]").forEach((el) => { el.hidden = true; });
  });

