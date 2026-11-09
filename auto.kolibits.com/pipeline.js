// «Todo lo que entra, resumido.»: el papeleo entra, la IA lo entiende
// y queda resumido en un tablero. Todo es local; no se llama a ningún servicio real.
//
// Cada recorrido define:
// - docs:     lo que llega (tipo + un dato de ejemplo)
// - proceso:  lo que hace la IA, en orden (se encienden al ritmo de los documentos)
// - cifras:   [valor, rótulo] que aparecen en el tablero al final
// - barras:   alturas del gráfico semanal (%, relativas) + su leyenda
// - frases:   la narración de la línea de detalle, del inicio al cierre
const FLUJOS = {
  cobranzas: {
    docs: [
      { tipo: "PDF", texto: "Factura A-118 · $1.426,00" },
      { tipo: "PDF", texto: "Factura A-121 · $380,50" },
      { tipo: "Correo", texto: "«¿Cómo la puedo pagar?»" },
      { tipo: "Planilla", texto: "Clientes con saldo pendiente" },
    ],
    proceso: [
      "Lee cada documento al llegar",
      "Consulta el saldo real en tu sistema",
      "Empareja la pregunta con su factura",
      "Redacta el aviso con el dato exacto",
    ],
    cifras: [
      ["14", "Avisos enviados esta semana"],
      ["$6.214", "Saldo en seguimiento"],
      ["3,5 h", "De copia y pegado guardadas"],
    ],
    barras: [35, 55, 45, 70, 62, 88, 40],
    barrasCaption: "Avisos por día, esta semana",
    frases: [
      "Esto es lo que te llega en una sola semana.",
      "Cada documento entra solo; nadie lo pega en ninguna parte.",
      "La IA lee, consulta y redacta con el dato real del sistema.",
      "Y todo cae resumido en tu tablero: cero planilla a mano.",
      "Los avisos salieron solos, con el saldo exacto, y quedó registrado quién los recibió.",
    ],
  },
  soporte: {
    docs: [
      { tipo: "WhatsApp", texto: "«Mi pedido no llegó» + foto" },
      { tipo: "Correo", texto: "Guía n.º BG-2441 perdida" },
      { tipo: "WhatsApp", texto: "Cambio de dirección de entrega" },
      { tipo: "Casos", texto: "Casos abiertos de la semana" },
    ],
    proceso: [
      "Entiende la queja y adjunta la foto",
      "Abre el caso con el número de guía",
      "Consulta el estado real del envío",
      "Responde, o deriva a una persona",
    ],
    cifras: [
      ["11", "Casos resueltos sin ayuda humana"],
      ["9", "Respondidos en menos de 5 min"],
      ["2", "Derivados a una persona"],
    ],
    barras: [55, 70, 62, 85, 78, 58, 66],
    barrasCaption: "Respuestas por día, esta semana",
    frases: [
      "Las quejas entran por donde entra el cliente.",
      "Cada mensaje se convierte en un caso, con su foto y su guía.",
      "La IA consulta el envío y responde con lo que de verdad pasó.",
      "Y te queda la semana completa, contada caso a caso.",
      "Lo raro llegó a una persona con todo el historial; lo demás, resuelto solo.",
    ],
  },
  leads: {
    docs: [
      { tipo: "WhatsApp", texto: "«¿Cuánto cuesta el plan?»" },
      { tipo: "Web", texto: "Formulario: empresa nueva" },
      { tipo: "Correo", texto: "Pregunta técnica larga" },
      { tipo: "Lista", texto: "3 contactos repetidos" },
    ],
    proceso: [
      "Valida número y correo de origen",
      "Descarta duplicados antes de que ensucien",
      "Resume la necesidad en dos líneas",
      "Le pone prioridad y etiqueta",
    ],
    cifras: [
      ["9", "Leads calificados"],
      ["4", "Marcados como calientes"],
      ["3", "Duplicados descartados"],
    ],
    barras: [30, 58, 48, 75, 66, 82, 52],
    barrasCaption: "Leads por día, esta semana",
    frases: [
      "Un lead puede entrar por cinco lugares distintos.",
      "Todos llegan al mismo CRM ya limpios y con nombre.",
      "La IA resume y puntúa; nadie lee chats vacíos.",
      "Y el tablero dice dónde dar la primera llamada.",
      "Tu equipo recibe conversaciones listas para llamar, no un chat sin leer.",
    ],
  },
};

const sinMovimiento = matchMedia("(prefers-reduced-motion: reduce)");
const PASO_MS = 640; // ritmo entre documento y documento

document.querySelectorAll("[data-flujo-demo]").forEach((panel) => {
  // Los chips de casos viven fuera del panel (en el encabezado de la sección).
  const chips = [...document.querySelectorAll("[data-dolor]")];
  const escena = panel.querySelector(".demo-escena");
  const docs = [...escena.querySelectorAll(".doc")];
  const nucleo = escena.querySelector(".proceso-nucleo");
  const nucleoIcono = escena.querySelector(".nucleo-icono");
  const pasos = [...escena.querySelectorAll(".proceso-pasos li")];
  const tablero = escena.querySelector(".tablero");
  const cifras = [...escena.querySelectorAll(".tablero-cifras > div")];
  const barras = [...escena.querySelectorAll(".tablero-barras span")];
  const grafico = escena.querySelector(".tablero-grafico");
  const barrasCaption = escena.querySelector("[data-barras-caption]");
  const detalle = panel.querySelector("[data-detalle]");
  const repetir = panel.querySelector("[data-repetir]");

  let actual = chips.find((chip) => chip.getAttribute("aria-pressed") === "true")?.dataset.dolor || "cobranzas";
  let temporizadores = [];

  const luego = (ms, fn) => temporizadores.push(setTimeout(fn, ms));

  const limpiar = () => {
    temporizadores.forEach(clearTimeout);
    temporizadores = [];
  };

  // Vuelca los datos del recorrido elegido en la escena (textos y alturas).
  const pintar = (clave) => {
    const flujo = FLUJOS[clave];
    docs.forEach((doc, i) => {
      doc.querySelector(".doc-tipo").textContent = flujo.docs[i].tipo;
      doc.querySelector(".doc-texto").textContent = flujo.docs[i].texto;
    });
    pasos.forEach((paso, i) => { paso.textContent = flujo.proceso[i]; });
    cifras.forEach((cifra, i) => {
      cifra.querySelector(".tablero-valor").textContent = flujo.cifras[i][0];
      cifra.querySelector(".tablero-rotulo").textContent = flujo.cifras[i][1];
    });
    barras.forEach((barra, i) => { barra.style.setProperty("--h", `${flujo.barras[i]}%`); });
    barrasCaption.textContent = flujo.barrasCaption;
    chips.forEach((chip) => chip.setAttribute("aria-pressed", String(chip.dataset.dolor === clave)));
  };

  // Quita los estados de una jugada anterior sin despintar los textos.
  const limpiarEstados = () => {
    docs.forEach((doc) => doc.classList.remove("activo", "enviado", "enviando"));
    nucleo.classList.remove("activo", "logrado");
    pasos.forEach((paso) => paso.classList.remove("activo"));
    tablero.classList.remove("activo");
    grafico.classList.remove("activo");
    cifras.forEach((cifra) => cifra.classList.remove("activo"));
  };

  // El documento "vuela" hacia el núcleo de IA y queda procesado.
  const volar = (doc) => {
    let animo = false;
    if (doc.animate && !sinMovimiento.matches) {
      const origen = doc.getBoundingClientRect();
      const destino = (nucleoIcono || nucleo).getBoundingClientRect();
      const clon = doc.cloneNode(true);
      Object.assign(clon.style, {
        position: "fixed",
        left: `${origen.left}px`,
        top: `${origen.top}px`,
        width: `${origen.width}px`,
        margin: "0",
        zIndex: "40",
        pointerEvents: "none",
      });
      document.body.appendChild(clon);
      const dx = destino.left + destino.width / 2 - (origen.left + origen.width / 2);
      const dy = destino.top + destino.height / 2 - (origen.top + origen.height / 2);
      const vuelo = clon.animate(
        [
          { transform: "translate(0, 0) scale(1)", opacity: 1 },
          { transform: `translate(${dx * 0.25}px, ${dy * 0.25}px) scale(0.82)`, opacity: 0.95 },
          { transform: `translate(${dx}px, ${dy}px) scale(0.16)`, opacity: 0.85 },
          { transform: `translate(${dx}px, ${dy}px) scale(0.05)`, opacity: 0 },
        ],
        { duration: 640, easing: "cubic-bezier(.55, 0, .8, .4)" },
      );
      vuelo.onfinish = () => clon.remove();
      vuelo.oncancel = () => clon.remove();
      doc.classList.add("enviando"); // el original se apaga mientras vuela su copia
      luego(680, () => {
        doc.classList.remove("enviando");
        doc.classList.add("enviado");
      });
      animo = true;
    }
    if (!animo) doc.classList.add("enviado");
  };

  // Secuencia: entra el papeleo, la IA lo entiende y el tablero se arma.
  const reproducir = (clave = actual) => {
    actual = clave;
    limpiar();
    limpiarEstados();
    pintar(clave);
    const frases = FLUJOS[clave].frases;
    detalle.textContent = frases[0];

    if (sinMovimiento.matches) {
      docs.forEach((doc) => doc.classList.add("activo", "enviado"));
      nucleo.classList.add("activo", "logrado");
      pasos.forEach((paso) => paso.classList.add("activo"));
      tablero.classList.add("activo");
      grafico.classList.add("activo");
      cifras.forEach((cifra) => cifra.classList.add("activo"));
      detalle.textContent = frases[frases.length - 1];
      return;
    }

    escena.classList.add("en-juego");
    docs.forEach((doc, i) => {
      luego(420 + i * PASO_MS, () => {
        doc.classList.add("activo");
        if (i === 0) nucleo.classList.add("activo");
        detalle.textContent = frases[i];
        luego(100, () => {
          volar(doc);
          pasos[i].classList.add("activo");
        });
      });
    });

    const cierre = 420 + docs.length * PASO_MS + 240;
    luego(cierre, () => {
      nucleo.classList.add("logrado");
      tablero.classList.add("activo");
      grafico.classList.add("activo");
      detalle.textContent = frases[docs.length];
      cifras.forEach((cifra, i) => luego(140 * i, () => cifra.classList.add("activo")));
      luego(560, () => { detalle.textContent = frases[frases.length - 1]; });
    });
  };

  chips.forEach((chip) => chip.addEventListener("click", () => reproducir(chip.dataset.dolor)));
  repetir.addEventListener("click", () => reproducir());

  // La primera vez, arranca cuando la demo entra en pantalla.
  if (!("IntersectionObserver" in window)) { reproducir(); return; }
  const observador = new IntersectionObserver((entradas) => {
    if (!entradas.some((entrada) => entrada.isIntersecting)) return;
    observador.disconnect();
    reproducir();
  }, { threshold: 0.35 });
  observador.observe(panel);
});

// «Mirar el ejemplo» desde la portada: salta a la sección y relanza la jugada.
document.querySelectorAll("[data-reproducir]").forEach((enlace) => {
  enlace.addEventListener("click", () => {
    document.querySelector("[data-flujo-demo] [data-repetir]")?.click();
  });
});
