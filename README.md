# DWB · web-prueba

Apuntes de HTML, CSS y JavaScript + diario de aprendizaje.
Publicada en **https://cre3b3ep.github.io/web-prueba/**

## Trabajar en local

Necesitas [Node.js](https://nodejs.org/) 18 o superior.

```bash
npm install     # sólo la primera vez (o si cambia package.json)
npm start       # abre http://localhost:8080/web-prueba/ y recarga al guardar
```

> Usa `npm start` en lugar de Live Server: el diario se genera a partir de
> Markdown y sólo existe después de construir la web.

## Escribir una entrada del diario

1. Copia `herramientas/plantilla-entrada.md` a `diario/entradas/` con el nombre
   `AAAA-MM-DD-titulo-corto.md` (ej. `2026-09-29-mi-primera-web-revive.md`).
2. Cambia `title` y `tags`, y escribe en Markdown.
3. Mientras la escribes deja `borrador: true`: la verás en `npm start` con un
   aviso amarillo, pero **no se publica**.
4. Cuando esté lista, quita `borrador: true`, haz commit y push a `main`.
   GitHub Actions construye y publica sola en uno o dos minutos
   (pestaña **Actions** del repo para ver el progreso).

## Estructura

| Carpeta / archivo | Qué es |
|---|---|
| `*.html` (raíz) | Páginas originales. Se publican **tal cual**, sin procesar. |
| `diario/` | Portada del diario, etiquetas y `entradas/` (tus `.md`). |
| `ia/` | Sección de IA. Ahora todo en **borrador** esperando tu texto. |
| `_includes/` | Layout compartido (menú, pie) de las páginas nuevas. |
| `css/`, `js/`, `img/`, `fonts/` | Recursos. Todo servido desde la propia web, sin terceros. |
| `herramientas/` | Plantilla de entrada y script de iconos. No se publica. |
| `eleventy.config.js` | Configuración de [Eleventy](https://www.11ty.dev/). |
| `.github/workflows/publicar.yml` | Construye en cada PR y publica en cada push a `main`. |

## Páginas antiguas → layout compartido

Las páginas `*.html` de la raíz tienen cada una su propia versión del menú y
el pie. Se irán pasando al layout de `_includes/` **de una en una**, revisando
las diferencias, para no cambiar ningún texto sin querer.
