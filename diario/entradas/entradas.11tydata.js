// Datos comunes a todas las entradas del diario (las que pongas en esta carpeta).
// Nombre de archivo: AAAA-MM-DD-titulo-corto.md  -> la fecha se toma del nombre
// y la URL queda como /diario/titulo-corto/
export default {
  layout: "layouts/entrada.njk",
  tags: ["diario"],
  permalink: "/diario/{{ page.fileSlug }}/",
};
