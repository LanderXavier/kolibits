# Sitios web de Kolibits

| Carpeta | Dominio | Qué es |
|---|---|---|
| `kolibits.com/` | kolibits.com | Página principal: lleva a cada proyecto |
| `auto.kolibits.com/` | auto.kolibits.com | Landing de automatizaciones con visor de flujos |
| (pendiente) | tienda.kolibits.com | Tienda online |

Cada carpeta es un sitio completo e independiente, con `index.html`, `styles.css`, `main.js` y `assets/`.

## Probar en tu computadora con Docker

Desde esta carpeta, ejecuta:

    docker compose up -d --build

Después abre:

- http://kolibits.localhost:8080
- http://auto.kolibits.localhost:8080

Si cambias algo, vuelve a ejecutar el mismo comando. Para apagarlo, ejecuta `docker compose down`.

Las direcciones `.localhost` funcionan solas en Chrome, Edge y Firefox, sin configurar nada.

## Probar sin Docker

Abre `kolibits.com/index.html` directamente en el navegador. Los enlaces entre sitios también funcionan así. Los botones de contacto usan el enlace de respaldo escrito en el HTML; solo el mensaje precargado de WhatsApp necesita Docker.

## Cambiar tu correo o WhatsApp

Edita `datos/contacto.json`:

    {
      "correo": "tu correo",
      "whatsapp": "+593…",
      "asunto": "asunto del correo",
      "mensaje": "mensaje inicial de WhatsApp"
    }

Guarda y recarga la página: con Docker, el cambio aparece sin reconstruir. Si dejas `correo` o `whatsapp` vacío, sus botones se ocultan. Si el archivo tiene un error de formato, se usan los enlaces de respaldo escritos en el HTML y la consola del navegador muestra el motivo.

Abriendo los HTML directamente, sin Docker, el navegador no deja leer el JSON: los botones funcionan con los enlaces de respaldo y sin el mensaje precargado. Para ver el mensaje, usa Docker.

## Cómo funciona

- `Dockerfile`: crea una imagen con nginx y los dos sitios.
- `nginx.conf`: según el nombre con el que entras, muestra el sitio correcto. Los nombres desconocidos van a la página principal.
- `kolibits-comun.conf`: ajustes compartidos, como compresión, caché de una semana para `assets/` y cabeceras de seguridad básicas.
- `main.js`: cada sitio adapta sus enlaces a dónde se está viendo. Con el dominio real usa `https://…kolibits.com`, en Docker usa `….localhost:8080` y abriendo los archivos usa la carpeta vecina.
- `auto.kolibits.com/pipeline.js`: el visor de flujos. Todo es local y con datos de ejemplo; no se conecta a nada. Para cambiar los recorridos o los tiempos, mira `auto.kolibits.com/GUIA.md`.

## Para publicarlo con tu dominio

La web se publica en Cloudflare con `./publicar.sh`. Los pasos completos están en `DESPLIEGUE.md`.

## SEO y Google

Cada sitio ya trae:

- Título y descripción para Google.
- Dirección oficial de la página (`canonical`).
- La imagen y el texto que se muestran al compartir el enlace en WhatsApp, Facebook o X (`assets/compartir.*`).
- Datos estructurados (JSON-LD), que le dicen a Google qué es el negocio y que trabaja en Ecuador.
- `robots.txt` y `sitemap.xml`.
- Un solo H1 visible por página.

La versión anterior dio 100 en SEO, accesibilidad, buenas prácticas y rendimiento, en celular y escritorio, probando con Docker en local. Vuelve a medirlo después de cambios grandes.

Cuando el dominio esté publicado:

1. Entra a Google Search Console (search.google.com/search-console) y agrega `kolibits.com` como propiedad de dominio. Así incluyes también los subdominios.
2. Envía `https://kolibits.com/sitemap.xml` y `https://auto.kolibits.com/sitemap.xml`.
3. Crea tu Perfil de Empresa en Google si quieres aparecer en búsquedas locales y en Maps.
4. Prueba cómo se ve el enlace al compartirlo, pegándolo en WhatsApp.

Si cambias de dominio, actualiza las direcciones `https://…` en los `<head>`, en `robots.txt` y en `sitemap.xml`.

## Si cambias el CSS o el JS

En cada `index.html`, sube el número de versión en `styles.css?v=3` y `main.js?v=3` (por ejemplo, a `v=4`). Si cambias el visor de flujos, haz lo mismo con `pipeline.js?v=1`. Así los navegadores que ya visitaron la página descargan el archivo nuevo en vez de usar el que tenían guardado.

## Agregar la tienda

1. Crea la carpeta `tienda.kolibits.com/` con su `index.html`.
2. En `nginx.conf`, copia el bloque de `auto.kolibits.com` y cambia el nombre y la carpeta.
3. En el `Dockerfile`, agrega una línea `COPY` para la carpeta nueva.
4. En `kolibits.com/index.html`, cambia la tarjeta «Próximamente» por un enlace con `data-sitio="tienda.kolibits.com"`.

## Si cambias el video

`auto.kolibits.com/assets/video-pagina.mp4` es una copia de `../videos/Kolibits-video-pagina.mp4`, la versión del anuncio horizontal hecha para la web. Si vuelves a renderizarlo, cópialo otra vez.
