# Guía de auto.kolibits.com

Esta carpeta es la landing de automatizaciones. La pieza central es el ejemplo
animado («Todo lo que entra, resumido.»): la persona elige un caso (cobranzas,
soporte o leads) y ve cómo el papeleo entra, la IA lo entiende y todo queda
resumido en un tablero. Todo es una simulación con datos de ejemplo.

Se publica tal cual en **kolibits.com, www.kolibits.com y auto.kolibits.com**:
quien busca «Kolibits» aterriza en esta misma página. Los `canonical`, el
sitemap y los datos estructurales apuntan a kolibits.com, el dominio principal.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Todo el contenido y la estructura de la página |
| `styles.css` | Colores, tipografía, espacios y adaptación a celular |
| `main.js` | Enlaces entre sitios, año del pie y botones de correo/WhatsApp |
| `pipeline.js` | El ejemplo animado: recorridos, datos y secuencia |
| `contacto.json` | Copia local de los datos de contacto (la genera `publicar.sh`) |
| `assets/` | Logo, tipografías, favicon, video y portada |
| `GUIA.md` | Este archivo |

Los datos reales de contacto viven en `../datos/contacto.json`. Al publicar,
`../publicar.sh` los copia a esta carpeta y a `kolibits.com/`.

## Probar en tu computadora

Con Docker, desde `web/`:

```bash
docker compose up -d --build
```

Abre <http://auto.kolibits.localhost:8080>. Los cambios en `datos/contacto.json`
se ven al recargar, sin reconstruir.

Sin Docker, desde esta carpeta:

```bash
python3 -m http.server 8099
```

Abre <http://localhost:8099>. Si abres `index.html` haciendo doble clic, la
página funciona igual: los enlaces de contacto tienen un destino de respaldo en
el HTML y solo pierden el mensaje precargado de WhatsApp.

## El ejemplo animado

### Qué hace

- Ocupa todo el ancho debajo de la portada, en una escena de tres carriles:
  **llega el papeleo → se entiende solo → y queda resumido**.
- Los documentos entran uno a uno en el primer carril; cada uno «vuela» hacia el
  núcleo «IA + tu sistema» y queda con un visto bueno.
- En el carril del medio se encienden los pasos de la IA al ritmo de los
  documentos; la narración dice qué consulta y qué redacta, siempre con datos
  del sistema, nunca inventados.
- Al final el tablero se arma solo: cifras que aparecen y un gráfico de barras
  de la semana, distinto para cada caso.
- La línea de detalle bajo la escena narra lo que pasa, con
  `aria-live="polite"` para los lectores de pantalla.
- Tiene tres casos: cobranzas pendientes, soporte postventa y extracción de
  leads.
- Arranca solo cuando la escena entra en pantalla. «Repetir» y el botón
  «Mirar el ejemplo» de la portada lo relanzan.
- Con `prefers-reduced-motion` no hay animación: se muestra el resultado final
  de una vez. Sin JavaScript la escena también se ve completa, estática.

### Cambiar los recorridos

Todo está en `pipeline.js`, en el objeto `FLUJOS`. Cada recorrido tiene cinco
partes:

```js
cobranzas: {
  docs: [
    { tipo: "PDF", texto: "Factura A-118 · $1.426,00" },
    // tipo corto + un dato de ejemplo; entran 4 documentos
  ],
  proceso: [ "Lee cada documento al llegar" /* … ×4 */ ],
  cifras: [ ["14", "Avisos enviados esta semana"] /* [valor, rótulo] ×3 */ ],
  barras: [35, 55, 45, 70, 62, 88, 40], // alturas del gráfico, en %
  barrasCaption: "Avisos por día, esta semana",
  frases: [ /* 5 frases: entrada, documentos, IA, tablero, cierre */ ],
}
```

| Parte | Qué controla |
|---|---|
| `docs` | Los documentos que llegan (carril 1) |
| `proceso` | Lo que hace la IA, en orden (carril 2) |
| `cifras` | Las tres cifras del tablero final (carril 3) |
| `barras` + `barrasCaption` | El gráfico de la semana y su leyenda |
| `frases` | La narración de la línea de detalle, en orden |

El HTML trae el recorrido de cobranzas escrito para que la página se entienda
sin JavaScript. Si cambias ese recorrido, cambia también la escena en
`index.html` dentro de `.demo-panel` (documentos, pasos, cifras y las alturas
`--h` de las barras).

Para agregar un cuarto recorrido:

1. Copia un bloque dentro de `FLUJOS` y cámbialo.
2. Agrega un botón en `index.html` dentro de `.demo-casos`:
   `<button type="button" class="chip" data-dolor="mi-clave" aria-pressed="false">Mi caso</button>`
3. La clave del objeto y el `data-dolor` deben coincidir.

### Límite importante

El ejemplo **no se conecta a nada**. Es una explicación visual con datos de
ejemplo; no hay webhooks ni APIs reales detrás. La nota bajo la escena lo dice
y debe seguir siendo verdadera. Si algún día quieres un ejemplo que procese
datos reales, hace falta un servicio aparte y cambiar la escena para que la
llame.

### Accesibilidad

- Los problemas usan `aria-pressed`.
- El detalle del paso se anuncia con `aria-live="polite"`.
- Los iconos son decorativos (`aria-hidden`); el texto de cada nodo es el que
  se lee.
- Sin JavaScript se ve el recorrido completo; con JavaScript se anima.

## Textos y contacto

- El título, los botones, los servicios, las preguntas y el cierre están en
  `index.html`.
- El asunto del correo y el mensaje de WhatsApp están en
  `../datos/contacto.json`:

```json
{
  "correo": "…",
  "whatsapp": "+593…",
  "asunto": "…",
  "mensaje": "…"
}
```

El mensaje actual pide el diagnóstico y deja dos espacios para que la persona
complete su negocio y la tarea que quiere automatizar. Si cambias el mensaje,
cambia solo `../datos/contacto.json` y vuelve a publicar; el script copia el
archivo. Las copias dentro de cada sitio son solo para cuando se sirven los
archivos sin Docker.

Los enlaces de `index.html` llevan un correo y un WhatsApp de respaldo. Si
cambias de número o de correo, actualiza también esos `href` para que la página
siga funcionando cuando `contacto.json` no cargue.

## Diseño

Los colores y la tipografía salen de `identidad-visual/paleta/colores.css`.

- **Sora** para todo el texto.
- **JetBrains Mono** solo para los datos de ejemplo del recorrido: son datos,
  no decoración.
- Los botones principales usan 19 px en negrita porque el blanco sobre el azul
  de marca solo cumple contraste como texto grande.
- El botón pequeño del encabezado usa fondo azul cielo y texto azul noche, que
  sí cumple contraste a 14 px.
- El único movimiento de la página es el ejemplo animado. El resto no tiene
  animaciones de entrada.
- La escena del ejemplo apila sus tres carriles abajo de 900 px de pantalla.
  La portada ocupa todo el ancho y el ejemplo vive debajo, también a todo el
  ancho.

### Dónde tocar el diseño

| Quiero cambiar… | Voy a… |
|---|---|
| Colores y tamaños de letra | `:root` en `styles.css` |
| Ancho de la página | `.barra-interior`, `main`, `.pie` (1180 px) |
| Tamaño del título | `--t-titulo` |
| Botones | `.boton`, `.boton-secundario`, `.boton-compacto` |
| La escena del ejemplo | `.demo-panel`, `.demo-escena`, `.carril`, `.tablero` |
| Los espacios entre secciones | `.inicio`, `.seccion`, `.franja` |

## Publicar

Desde `web/`:

```bash
./publicar.sh
```

El script revisa que `datos/contacto.json` tenga formato válido, lo copia a los
dos sitios y sube los Workers a Cloudflare.

Antes de publicar:

1. Prueba los tres casos y el botón «Repetir».
2. Revisa la página en celular (ancho 390) y en escritorio.
3. Comprueba que los botones de correo y WhatsApp abren con el mensaje nuevo.
4. Si cambiaste CSS o JS, sube el número de versión en `index.html`:
   `styles.css?v=5`, `main.js?v=5`, `pipeline.js?v=2`.
5. Si reemplazas un archivo de `assets/`, cámbiale el nombre: la caché lo guarda
   una semana.

## Por qué no hay React ni Vite

Esta página es contenido estático con **una** parte interactiva. React añadiría
un paso de compilación, dependencias y cambios en `publicar.sh`, el `Dockerfile`
y `nginx.conf` para ganar nada: el navegador descargaría más código y el
ejemplo seguiría haciendo lo mismo.

La modularidad ya está en tres archivos separados (`main.js`, `pipeline.js` y
`styles.css` con tokens). Para editar el ejemplo, abres un archivo y cambias un
objeto.

Tiene sentido pasar a React, Vite o Astro cuando exista:

- más de una página o vistas con rutas;
- cuentas, sesiones o un panel privado;
- componentes compartidos entre `auto.` y la tienda;
- La pieza que llame a un backend real y maneje estados de servidor.

Ahí sí conviene una carpeta nueva. Mientras tanto, duplicar el sitio en una
`web2.0` solo crea dos versiones que se van a separar.

## Límites conocidos

- No hay analítica ni medición de clics.
- El video no tiene subtítulos.
- No hay formulario: el contacto es por WhatsApp o correo.
- La página está solo en español.
- El ejemplo es una simulación; no hay conexiones reales.
