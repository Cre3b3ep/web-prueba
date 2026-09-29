import { HtmlBasePlugin } from "@11ty/eleventy";

// Configuración de Eleventy (https://www.11ty.dev/docs/config/)
//
// Estrategia de migración ("estrangulador"):
//  - Las páginas antiguas (*.html de la raíz) se copian TAL CUAL, sin procesar.
//  - Lo nuevo (diario, sección de IA) se escribe en Markdown/Nunjucks y usa
//    el layout compartido de _includes/layouts/.
//  - Las páginas antiguas se irán pasando al layout de una en una.
export default function (eleventyConfig) {
  // --- Archivos que se publican sin transformar
  eleventyConfig.addPassthroughCopy("*.html");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("fonts");
  eleventyConfig.addPassthroughCopy("fav70x70.png");

  // Reescribe las rutas absolutas ("/css/style.css") añadiendo pathPrefix,
  // para que funcionen en https://cre3b3ep.github.io/web-prueba/
  eleventyConfig.addPlugin(HtmlBasePlugin);

  // --- Borradores: front matter `borrador: true`
  // Se ven con `npm start` (modo serve) pero NO se publican con `npm run build`.
  eleventyConfig.addPreprocessor("borradores", "*", (data) => {
    if (data.borrador && process.env.ELEVENTY_RUN_MODE === "build") {
      return false;
    }
  });

  // --- Filtros para las plantillas
  const fechaLarga = new Intl.DateTimeFormat("es-ES", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
  eleventyConfig.addFilter("fecha", (d) => fechaLarga.format(d));
  eleventyConfig.addFilter("fechaISO", (d) => d.toISOString().slice(0, 10));

  // Etiquetas "de verdad" de una entrada (sin la etiqueta interna "diario")
  eleventyConfig.addFilter("etiquetasVisibles", (tags = []) =>
    tags.filter((t) => !["diario", "ia", "all"].includes(t)),
  );

  // Todas las etiquetas usadas en el diario, ordenadas
  eleventyConfig.addCollection("etiquetasDiario", (api) => {
    const set = new Set();
    for (const entrada of api.getFilteredByTag("diario")) {
      for (const t of entrada.data.tags || []) {
        if (t !== "diario") set.add(t);
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b, "es"));
  });

  return {
    // Sólo Markdown y Nunjucks son plantillas: los .html antiguos no se tocan
    templateFormats: ["md", "njk"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    // En GitHub Pages la web vive en /web-prueba/. Con dominio propio sería "/".
    pathPrefix: process.env.PATH_PREFIX ?? "/web-prueba/",
    dir: {
      input: ".",
      includes: "_includes",
      output: "_site",
    },
  };
}
