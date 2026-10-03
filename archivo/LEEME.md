# archivo/

Páginas apartadas del sitio publicado (octubre de 2026, al retirar Materialize).
**No se publican**: Eleventy sólo copia los `*.html` de la raíz y esta carpeta
está en `.eleventyignore`.

Criterio: ninguna página del sitio las enlazaba (o sólo las enlazaba otra
página de esta misma lista). Ya tienen las clases nuevas de `css/style.css`.

| Archivo | Qué es |
|---|---|
| `definiciones.html` (+ `definiciones.hmtl.txt`) | Glosario |
| `pruebas3.html` | Página de pruebas |
| `haciendoparallax.html` | Plantilla de parallax |
| `proyectotk.html` | Proyecto; enlaza a `practicacss` y `solohtml` |
| `practicacss.html`, `solohtml.html` | Prácticas (sólo las enlazaba `proyectotk`) |
| `sinestesia.html` + `css/stylo_sinestesia.css` | Experimento de sinestesia |
| `dibujandoconcss.html` + `css/dibujando.css` | Ejercicio de dibujo con CSS |
| `ejemlpospruebas.html` | Ejemplos de prueba |

Decisión pendiente para cada una: devolverla a la raíz (y enlazarla desde el
menú o una sección), pasarla a Markdown/Nunjucks con el layout, o borrarla.

Ojo al verlas en local: usan rutas relativas a la raíz (`css/style.css`,
`img/...`). Para verlas con estilos, ábrelas desde la raíz con el servidor de
desarrollo copiándolas allí, o devuélvelas con `git mv archivo/X.html .`.
