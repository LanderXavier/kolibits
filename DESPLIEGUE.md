# Kolibits: despliegue de la web

La web se publica en Cloudflare Workers, como archivos estáticos. Así no depende de ningún servidor propio: sigue en línea aunque el servidor de casa esté apagado. Para una web así es gratis.

## Qué es

**Una sola landing** (la de automatizaciones, `auto.kolibits.com/`) servida en **tres dominios**: la gente busca «Kolibits», cae en `kolibits.com` y ve el producto. La tienda, cuando exista, se hará aparte con su propia carpeta y dominio.

| Dominio | Carpeta que le sirve | Worker en Cloudflare | Contenido |
|---|---|---|---|
| `kolibits.com` y `www.kolibits.com` | `auto.kolibits.com/` | `kolibits-principal` | La landing de automatizaciones, con canonical y sitemap apuntando a kolibits.com |
| `auto.kolibits.com` | `auto.kolibits.com/` | `kolibits-auto` | La misma landing, dirección corta para cuando se comparte |
| `tienda.kolibits.com` | (pendiente, va aparte) | (pendiente) | Tienda online, todavía no existe |

## Estructura

```
web/
├── publicar.sh            # Publica los dominios en Cloudflare
├── cloudflare/
│   ├── principal.jsonc    # kolibits.com y www: sirven la carpeta de auto
│   └── auto.jsonc         # auto.kolibits.com: la misma carpeta
├── datos/
│   └── contacto.json      # Correo y WhatsApp de los botones de la landing
├── auto.kolibits.com/     # LA carpeta que vive en los tres dominios
├── kolibits.com/          # Portada antigua dividida (automatizaciones | tienda);
│                          #   ya no se publica, se guarda como referencia para la tienda
└── Dockerfile, compose.yaml, nginx.conf, kolibits-comun.conf   # Solo para probar en tu computadora
```

Cada `_headers` define las cabeceras que aplica Cloudflare: seguridad, caché de una semana para `assets/` y `contacto.json` sin caché.

## Publicar por primera vez

### 1. Quitar el túnel

Los dominios no pueden apuntar al túnel y a los Workers al mismo tiempo.

1. En Cloudflare, ve a **Networks → Tunnels → lander → Routes** (o **Public Hostnames**) y borra las rutas de `kolibits.com`, `www.kolibits.com` y `auto.kolibits.com`.
2. En **DNS → Records**, comprueba que ya no quede ningún registro `CNAME` de esos tres nombres apuntando a `….cfargotunnel.com`. Si queda alguno, bórralo.

Mientras tanto la web estará caída, así que haz los pasos 1 a 3 seguidos.

### 2. Iniciar sesión en Cloudflare

Desde la carpeta `web/`:

```bash
npx wrangler login
```

Se abre el navegador: autoriza con tu cuenta de Cloudflare. Solo se hace una vez por computadora.

### 3. Publicar

```bash
./publicar.sh
```

El script:

1. Revisa que `datos/contacto.json` no tenga errores de formato.
2. Lo copia dentro de cada sitio.
3. Sube los dos Workers.

Cloudflare crea solo los registros DNS y los certificados HTTPS de los tres dominios. Los certificados pueden tardar unos minutos.

### 4. Comprobar

- `https://kolibits.com` y `https://auto.kolibits.com` muestran la misma landing: el titular «Deja de hacer a mano lo que se repite», la demo y las preguntas.
- Los botones de contacto aparecen, y el correo se ve en la sección final y en el pie.
- `https://kolibits.com/robots.txt` y `https://kolibits.com/sitemap.xml` responden (el sitemap apunta a kolibits.com).
- El video se reproduce.
- Al pegar el enlace en WhatsApp aparece la vista previa con imagen.

## Actualizar la web o el contacto

Edita los archivos, o `datos/contacto.json`, y vuelve a ejecutar:

```bash
./publicar.sh
```

Para probar sin subir nada:

```bash
./publicar.sh --dry-run
```

Los archivos de `assets/` se guardan una semana en la caché del navegador. Si reemplazas un logo o el video, cámbiale el nombre al archivo.

## Probar en tu computadora

```bash
docker compose up -d --build
```

Después abre http://kolibits.localhost:8080 y http://auto.kolibits.localhost:8080. En local, `datos/contacto.json` se lee en vivo, sin reconstruir.

## Redirigir www

`www.kolibits.com` muestra lo mismo que `kolibits.com`, y Google ya sabe cuál es la dirección oficial gracias a la etiqueta `canonical`. Para que además redirija, crea en Cloudflare una regla en **Rules → Redirect Rules**:

- **Cuando coincida:** el nombre de host es igual a `www.kolibits.com`.
- **Redirigir a:** `concat("https://kolibits.com", http.request.uri.path)`.
- **Código:** 301.

## SEO y Google

- **Ya incluido:** cada sitio trae título, descripción, `canonical`, Open Graph, datos estructurados JSON-LD, `robots.txt`, `sitemap.xml` y un H1 visible.
- **Resultado en local:** la versión anterior dio 100 en SEO, accesibilidad, buenas prácticas y rendimiento. Vuelve a medirlo después de cambios grandes.

**Para aparecer en Google:**

1. Entra a Google Search Console (search.google.com/search-console) y agrega `kolibits.com` como propiedad de tipo **dominio**. Esa opción incluye los subdominios.
2. Google te dará un registro `TXT`. Agrégalo en Cloudflare, en **DNS → Records**, y vuelve a Search Console para verificar.
3. En **Sitemaps**, envía `https://kolibits.com/sitemap.xml` y `https://auto.kolibits.com/sitemap.xml`.
4. En **Inspección de URLs**, pega `https://auto.kolibits.com/` y pide **Solicitar indexación**. Repite con `https://kolibits.com/`.

Google suele tardar entre unos días y un par de semanas en mostrar una web nueva.

## Agregar la tienda

La portada ya no es dividida: la tienda se hará aparte, con su propio espacio.

1. Crea la carpeta de la tienda con su `index.html` (por ejemplo `tienda/`).
2. Decide el dominio (`tienda.kolibits.com` u otro).
3. Copia `cloudflare/auto.jsonc` como `cloudflare/tienda.jsonc` y cambia `name`, `directory` y el dominio.
4. En `publicar.sh`, agrega la carpeta al bucle y una línea `deploy` con la configuración nueva.
5. Para probarla en local, agrega también su bloque en `nginx.conf` y una línea `COPY` en el `Dockerfile`.

## Problemas frecuentes

| Síntoma | Causa probable |
|---|---|
| `publicar.sh` dice que el dominio ya está en uso | Queda una ruta del túnel o un `CNAME` viejo (paso 1) |
| No aparecen los botones de contacto | `datos/contacto.json` tiene un error, o no se volvió a publicar después de editarlo |
| Error de certificado justo después de publicar | Cloudflare todavía lo está emitiendo: espera unos minutos |
| Un dominio no carga en tu computadora pero sí en el celular | Tu router guardó una respuesta DNS vieja: espera o reinícialo |
