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
// Los enlaces llevan un destino de respaldo en el HTML, así funcionan aunque el
// archivo no cargue (por ejemplo, al abrir index.html con doble clic).
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
      if (el.hasAttribute("data-rellenar")) el.textContent = dato.texto;
    });
  })
  .catch((error) => {
    console.warn("No se pudo leer contacto.json; se usan los enlaces de respaldo:", error);
  });

// Aparición suave de secciones al hacer scroll (respetando movimiento reducido).
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const reveals = document.querySelectorAll(".reveal");
if (reveals.length) {
  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("in-view"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach((el) => io.observe(el));
  }
}

// Marca el video como listo cuando tiene datos para mostrar el póster/transición sin parpadeo.
document.querySelectorAll("video").forEach((video) => {
  const ready = () => video.classList.add("is-ready");
  if (video.readyState >= 2) ready();
  else video.addEventListener("loadeddata", ready, { once: true });
});
