# Kolibits — web

Landing de automatizaciones con IA de Kolibits, publicada en Cloudflare Workers
como archivos estáticos. Un solo sitio (HTML, CSS y JS sin build) servido en
tres dominios:

- `kolibits.com` y `www.kolibits.com` → la landing (lo que la gente encuentra al buscar «Kolibits»)
- `auto.kolibits.com` → la misma landing, dirección corta

| Carpeta | Qué es |
|---|---|
| `auto.kolibits.com/` | **La carpeta que vive en los tres dominios**: landing, demo en vivo, guía de edición |
| `kolibits.com/` | Portada antigua dividida (automatizaciones \| tienda); ya no se publica, queda como referencia para la tienda futura |
| `datos/contacto.json` | Correo y WhatsApp de los botones |
| `cloudflare/` | Configuración de los Workers |
| `Dockerfile`, `compose.yaml`, `nginx.conf`, `kolibits-comun.conf` | Prueba local con Docker |

## Publicar

Desde `web/`:

```bash
./publicar.sh
```

Valida `datos/contacto.json`, lo copia a los sitios y sube los Workers a
Cloudflare. Más detalle en [DESPLIEGUE.md](DESPLIEGUE.md).

## Probar en tu computadora

```bash
docker compose up -d --build
```

Abre `http://kolibits.localhost:8080` (y `auto.kolibits.localhost:8080`).
Sin Docker: entra a `auto.kolibits.com/` y corre `python3 -m http.server`.

## Guía de contenido

La guía para editar textos, la demo y el diseño está en
[auto.kolibits.com/GUIA.md](auto.kolibits.com/GUIA.md).
