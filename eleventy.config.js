import { HtmlBasePlugin } from "@11ty/eleventy";

// Configuración de Eleventy (https://www.11ty.dev/docs/config/)
//
// Todas las páginas usan el layout compartido de _includes/layouts/:
//  - Las páginas sueltas de la raíz (*.html) son plantillas Nunjucks: sólo
//    llevan su contenido y un front matter (título, URL...). El menú, la
//    botonera y el pie salen de _includes/partials/.
//  - Lo nuevo (diario, sección de IA) se escribe en Markdown/Nunjucks.
export default function (eleventyConfig) {
  // --- Archivos que se publican sin transformar
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
    // .html también: se procesan con Nunjucks (htmlTemplateEngine)
    templateFormats: ["md", "njk", "html"],
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
