#!/bin/sh
# Publica los dos sitios en Cloudflare.
# La primera vez, inicia sesión con: npx wrangler login
# Uso, desde esta carpeta: ./publicar.sh
set -e
cd "$(dirname "$0")"

# Validar el contacto antes de subir: un JSON roto ocultaría todos los botones
node -e 'JSON.parse(require("fs").readFileSync("datos/contacto.json", "utf8"))' \
  || { echo "datos/contacto.json tiene un error de formato. No se publicó nada."; exit 1; }

for sitio in kolibits.com auto.kolibits.com; do
  cp datos/contacto.json "$sitio/contacto.json"
done

npx --yes wrangler@4 deploy --config cloudflare/principal.jsonc "$@"
npx --yes wrangler@4 deploy --config cloudflare/auto.jsonc "$@"
