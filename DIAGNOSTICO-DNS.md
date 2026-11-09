# Problema: `auto.kolibits.com` y `www.kolibits.com` no cargan en mi PC

Te adjunto una captura del error. Ayúdame a resolverlo **en mi PC o en mi router**. El servidor y Cloudflare ya están comprobados y no hay que tocarlos.

## Síntoma

- `https://kolibits.com` carga bien.
- `https://auto.kolibits.com` y `https://www.kolibits.com` dan en Chrome:
  `This site can't be reached — DNS address could not be found. DNS_PROBE_POSSIBLE`

## Montaje

- Servidor Debian `debian-lander@192.168.101.174`, con un contenedor nginx (`kolibits-web-1`) en `127.0.0.1:8080`.
- Lo publica un Cloudflare Tunnel (`lander`) con 3 rutas, todas a `http://localhost:8080`:
  `kolibits.com`, `www.kolibits.com` y `auto.kolibits.com`.
- nginx elige el sitio según el `Host`, así que es correcto que las 3 rutas usen el mismo puerto.

## Lo que ya está comprobado (funciona)

```
dig +short auto.kolibits.com @1.1.1.1              -> 104.21.41.72 172.67.189.202
dig +short auto.kolibits.com @vicky.ns.cloudflare.com -> 104.21.41.72 172.67.189.202
dig +short www.kolibits.com  @1.1.1.1              -> 104.21.41.72 172.67.189.202
```

Al forzar la IP, los dos sitios responden `200` con su página correcta:

```
curl --resolve auto.kolibits.com:443:104.21.41.72 https://auto.kolibits.com/   -> 200
curl --resolve www.kolibits.com:443:104.21.41.72  https://www.kolibits.com/    -> 200
```

## Lo que falla

Mi DNS local no devuelve nada:

```
dig +short auto.kolibits.com     -> (vacío)
resolvectl status                -> Current DNS Server: 192.168.1.1 (el router)
```

## Causa probable

Se consultaron esos nombres **antes** de crear las rutas en Cloudflare. El router (`192.168.1.1`) y/o `systemd-resolved` guardaron la respuesta "no existe" (caché negativa, hasta unos 30 min).

## Lo que necesito

Que me guíes para:

1. Limpiar la caché DNS de mi PC (CachyOS, `systemd-resolved`) y de Chrome.
2. Si sigue fallando, saltarme el router: poner `1.1.1.1` como DNS en mi PC o reiniciar el router.
3. Comprobar con `dig` y en el navegador que ya resuelve.
