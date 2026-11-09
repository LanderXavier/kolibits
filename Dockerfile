FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY kolibits-comun.conf /etc/nginx/kolibits-comun.conf
COPY auto.kolibits.com /usr/share/nginx/auto.kolibits.com
# Datos compartidos por todos los sitios, como contacto.json
COPY datos /datos

EXPOSE 80
