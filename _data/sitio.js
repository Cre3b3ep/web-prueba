// Datos del sitio que usan las plantillas (en ellas: sitio.redes, sitio.contacto...).
// Cambia aquí y se actualiza en todas las páginas.
export default {
  autor: "jBaton",

  // Redes sociales del pie. Para añadir una, copia una línea y cambia los datos.
  //  - icono: clase de Font Awesome. OJO: las fuentes de iconos están recortadas
  //    a los que se usan; uno nuevo hay que añadirlo al subset
  //    (herramientas/subset_iconos.py) y a css/fuentes.css.
  //  - color: una clase .texto-* de css/style.css
  redes: [
    { nombre: "SoundCloud", url: "https://soundcloud.com/puro3", icono: "fab fa-soundcloud", color: "texto-js" },
  ],

  // Enlaces de la columna "Contacto" del pie. Vacía = la columna no aparece.
  // Ejemplo: { texto: "Formulario", url: "/contacto.html" }
  contacto: [],
};
