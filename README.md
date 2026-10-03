# DWB · web-prueba

Apuntes de HTML, CSS y JavaScript + diario de aprendizaje.
Publicada en **https://cre3b3ep.github.io/web-prueba/**

## Trabajar en local

Necesitas [Node.js](https://nodejs.org/) 18 o superior.

```bash
npm ci          # instala EXACTAMENTE lo del package-lock.json (no lo modifica)
npm start       # abre http://localhost:8080/web-prueba/ y recarga al guardar
```

> `npm ci`, no `npm install`: `install` puede reescribir `package-lock.json`
> aunque no añadas nada. Si `git status` muestra ese archivo modificado,
> deshazlo con `git restore package-lock.json` y vuelve a hacer `npm ci`.
>
> `npm audit` avisa de "5 vulnerabilidades altas": es **una sola** (`braces`,
> dentro del vigilante de archivos de `npm start`), sólo afecta a quien pueda
> escribir patrones de archivos en tu máquina y se arregla en Eleventy 4.
> **No ejecutes `npm audit fix --force`**: bajaría Eleventy a la 0.6 (2018).

> Usa `npm start` en lugar de Live Server: el diario se genera a partir de
> Markdown y sólo existe después de construir la web.

## Escribir una entrada del diario

1. Copia `herramientas/plantilla-entrada.md` a `diario/entradas/` con el nombre
   `AAAA-MM-DD-titulo-corto.md` (ej. `2026-09-29-mi-primera-web-revive.md`).
2. Cambia `title` y `tags`, y escribe en Markdown. `autor` es `jBaton` por defecto;
   las entradas escritas por Claude llevan `autor: Claude` y se distinguen visualmente.
3. Mientras la escribes deja `borrador: true`: la verás en `npm start` con un
   aviso amarillo, pero **no se publica**.
4. Cuando esté lista, quita `borrador: true`, haz commit y push a `main`.
   GitHub Actions construye y publica sola en uno o dos minutos
   (pestaña **Actions** del repo para ver el progreso).

## Dónde se cambia cada cosa

| Quiero cambiar… | Archivo |
|---|---|
| Colores, fuentes, espaciados | `css/style.css` → bloque `:root` del principio |
| Menú (escritorio y móvil) | `_includes/partials/menu.njk` |
| Pie de página | `_includes/partials/pie.njk` |
| Redes sociales y contacto del pie | `_data/sitio.js` |
| Estructura común de todas las páginas (`<head>`, scripts) | `_includes/layouts/base.njk` |
| Comportamiento (menús, visor de imágenes, parallax) | `js/ui.js` |
| El contenido de una página | su `.html` en la raíz (debajo del front matter) |

## Páginas de la raíz (`*.html`)

Cada página lleva sólo **su contenido**. Arriba tiene un *front matter* (entre
`---`) con sus datos; el menú, la botonera y el pie los pone el layout:

```yaml
---
layout: layouts/base.njk   # plantilla común
title: "CSS"               # <title> de la pestaña
descripcion: "..."         # opcional: <meta name="description">
permalink: /css.html       # URL de la página (no cambiarla: rompería enlaces)
anchoCompleto: true        # sin márgenes laterales (banners de lado a lado)
---
```

Para una página nueva: copia una existente, cambia el front matter y el contenido.

## VS Code y los archivos `.njk`

VS Code no reconoce Nunjucks de serie. Sin instalar nada, dile que los trate
como HTML (colores, Emmet y autocompletado): `Ctrl+Shift+P` → *Preferences:
Open User Settings (JSON)* y añade:

```json
"files.associations": { "*.njk": "html" },
"emmet.includeLanguages": { "njk": "html" }
```

Las etiquetas `{% … %}` y `{{ … }}` se verán como texto normal, pero el HTML
de alrededor quedará coloreado. (Hay extensiones de Nunjucks en el
Marketplace; como con npm, cada extensión es código de terceros que se
ejecuta en tu máquina: si instalas una, que sea muy usada y mantenida.)

## Estructura

| Carpeta / archivo | Qué es |
|---|---|
| `*.html` (raíz) | Páginas del sitio: contenido + front matter (ver arriba). |
| `_data/sitio.js` | Datos comunes: autor, redes sociales, contacto. |
| `archivo/` | Páginas apartadas (nadie las enlazaba). No se publica. Ver su `LEEME.md`. |
| `diario/` | Portada del diario, etiquetas y `entradas/` (tus `.md`). |
| `ia/` | Sección de IA. Ahora todo en **borrador** esperando tu texto. |
| `_includes/` | Layout compartido (`layouts/`) y piezas comunes: menú y pie (`partials/`). |
| `css/`, `js/`, `img/`, `fonts/` | Recursos. Todo servido desde la propia web, sin terceros. |
| `herramientas/` | Plantilla de entrada, script de iconos y scripts de migración ya usados. No se publica. |
| `eleventy.config.js` | Configuración de [Eleventy](https://www.11ty.dev/). |
| `.github/workflows/publicar.yml` | Construye en cada PR y publica en cada push a `main`. |

## Seguridad de dependencias

- Una sola dependencia directa (Eleventy), con **versión exacta** y `package-lock.json`.
- `.npmrc` con `ignore-scripts=true`: ningún paquete puede ejecutar código al instalarse.
- Instala siempre con `npm ci` (respeta el lockfile), no con `npm install <paquete>`
  salvo que quieras añadir o actualizar algo a propósito.
- Nada de npm llega a quien visita la web: la web publicada es HTML estático.
