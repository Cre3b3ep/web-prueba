// Migración única: las páginas sueltas de la raíz pasan a usar el layout compartido.
//
//   node herramientas/pasar-a-layout.mjs            → muestra qué haría (no toca nada)
//   node herramientas/pasar-a-layout.mjs --escribir → reescribe los archivos
//
// De cada página se queda SÓLO su contenido (lo que hay entre el menú y el pie)
// y se le pone delante un front matter con título, descripción y URL.
// El menú, la botonera y el pie salen de _includes/partials/.

import fs from 'node:fs';

// Título de cada página (el <title> antiguo era a veces de una plantilla copiada)
const TITULOS = {
  '404.html': 'Página no encontrada',
  'accesibilidad.html': 'Accesibilidad',
  'contacto.html': 'Formulario de contacto',
  'css.html': 'Hoja de Estilos en Cascada',
  'es6.html': 'JavaScript ES6',
  'estr_html5.html': 'Estructura HTML5',
  'fundamentospro.html': 'Fundamentos de Programación',
  'fw-css.html': 'Frameworks CSS',
  'fw-html.html': 'Útiles HTML',
  'fw-js.html': 'Frameworks JavaScript',
  'guias.html': 'Guías',
  'html.html': 'HTML',
  'html5.html': 'HTML5',
  'index.html': 'Inicio',
  'js.html': 'JavaScript',
  'links.html': 'Recopilación de enlaces',
  'practicahtml.html': 'Práctica HTML',
  'relacionando.html': 'Documentos relacionados',
};

// Atajos propios de la botonera flotante (el resto de páginas sólo tiene subir/bajar)
const ATAJOS = {
  'index.html': [
    { href: '#html', etiqueta: 'HTML', icono: 'fab fa-html5', clase: 'fondo-html' },
    { href: '#css', etiqueta: 'CSS', icono: 'fab fa-css3-alt', clase: 'fondo-css' },
    { href: '#js', etiqueta: 'JavaScript', icono: 'fab fa-js', clase: 'fondo-js' },
  ],
};

// Piezas compartidas que se quitan de cada página (el contenido empieza después)
const PIEZAS = [
  /<a id="(anchorTarget|index)"><\/a>/g,
  /<div id="[^"]*">\s*<ul id="dropdown[\s\S]*?<\/div>/g, // desplegables
  /<header>[\s\S]*?<\/header>/g,
  /<nav>[\s\S]*?<\/nav>/g,
  /<div class="botonera-flotante">[\s\S]*?<\/ul>\s*<\/div>/g,
];

const yaml = (v) => JSON.stringify(v); // una cadena JSON es YAML válido

function convertir(archivo, html) {
  const cuerpo = html.slice(html.indexOf('>', html.indexOf('<body')) + 1, html.indexOf('</body>'));
  const finContenido = cuerpo.indexOf('<footer');

  // Se quitan las piezas compartidas ESTÉN DONDE ESTÉN (en algunas páginas la
  // botonera va después del contenido) y queda el resto, hasta el pie.
  let contenido = cuerpo.slice(0, finContenido);
  for (const re of PIEZAS) contenido = contenido.replace(re, '');
  // la envoltura #contenedor la pone el layout (su cierre estaba tras el pie)
  contenido = contenido.replace(/<div id="contenedor">/, '');

  // 404: su contenido estaba DENTRO del pie, mezclado con las columnas.
  // Se saca a una sección propia, con el mismo texto y las mismas clases.
  if (archivo === '404.html') {
    const pie = cuerpo.slice(finContenido);
    const m = /<div class="grid-completa">([\s\S]*?)<\/div>\s*<div class="texto-centro">/.exec(pie);
    contenido += `\n<section class="fondo-oscuro texto-claro section">\n\t<div class="container">${m[1].replace(/\s+$/, '')}\n\t</div>\n</section>`;
  }
  // comentarios sueltos al principio y al final ("Fin menú", "Pie de página"...)
  // OJO: (?!-->) impide que un comentario se "coma" lo que hay hasta el siguiente
  const comentario = '<!--(?:(?!-->)[\\s\\S])*-->';
  contenido = contenido
    .replace(new RegExp(`^(?:\\s|${comentario})+`), '')
    .replace(new RegExp(`(?:\\s|${comentario})+$`), '');

  const descartado = [];
  // Un </div> sin pareja cerraría el <main> del layout antes de tiempo.
  // Se recorre el contenido contando los <div> abiertos y se quita exactamente
  // el cierre que llega cuando no queda ninguno abierto (no "el último").
  let abiertos = 0;
  contenido = contenido.replace(/<div[\s>]|<\/div>/g, (etiqueta) => {
    if (etiqueta !== '</div>') { abiertos++; return etiqueta; }
    if (abiertos === 0) {
      descartado.push('corregido: quitado un </div> sin pareja');
      return '';
    }
    abiertos--;
    return etiqueta;
  });
  // Un <div> sin cerrar NO se toca: el navegador lo cierra solo (al llegar a
  // </section>, </main>...). Añadir un </div> "que falta" según el recuento
  // de texto puede sobrar en el árbol real y cerrar el <main> (pasó en css.html).
  if (abiertos > 0) descartado.push(`aviso: ${abiertos} <div> sin cerrar (lo cierra el navegador)`);

  // js.html usaba id="contenido", que ya es el <main> del layout
  if (archivo === 'js.html') {
    contenido = contenido.replace('id="contenido"', 'id="contenido-js"')
      .replace("muestra_oculta('contenido')", "muestra_oculta('contenido-js')");
  }
  // 404: GitHub Pages la sirve en cualquier ruta (/web-prueba/a/b/c), así que
  // sus enlaces deben ser absolutos; el layout les añade /web-prueba/
  if (archivo === '404.html') {
    contenido = contenido.replace(/(href|src)="(?!https?:|#|\/|mailto:)([^"]+)"/g, '$1="/$2"');
  }

  const desc = /<meta\s+name="description"\s+content="([^"]*)"/s.exec(html)
    ?? /<meta\s+content="([^"]*)"\s+name="description"/s.exec(html);

  const fm = ['---', 'layout: layouts/base.njk', `title: ${yaml(TITULOS[archivo])}`];
  if (desc) fm.push(`descripcion: ${yaml(desc[1].replace(/\s+/g, ' ').trim())}`);
  fm.push(`permalink: /${archivo}`, 'anchoCompleto: true');
  if (archivo === '404.html') fm.push('noindex: true');
  if (ATAJOS[archivo]) {
    fm.push('atajos:');
    for (const a of ATAJOS[archivo]) fm.push(`  - { href: ${yaml(a.href)}, etiqueta: ${yaml(a.etiqueta)}, icono: ${yaml(a.icono)}, clase: ${yaml(a.clase)} }`);
  }
  fm.push('---', '');

  return { salida: fm.join('\n') + contenido + '\n', descartado, lineas: contenido.split('\n').length };
}

const escribir = process.argv.includes('--escribir');
for (const archivo of Object.keys(TITULOS)) {
  const html = fs.readFileSync(archivo, 'utf8');
  if (html.startsWith('---')) { console.log(`ya convertida  ${archivo}`); continue; }
  const { salida, descartado, lineas } = convertir(archivo, html);
  console.log(`${String(lineas).padStart(4)} líneas de contenido  ${archivo}`);
  for (const d of descartado) console.log('      ⚠', d);
  if (escribir) fs.writeFileSync(archivo, salida);
}
