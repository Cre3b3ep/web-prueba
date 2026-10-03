// Migración única: quita Materialize del HTML y cambia sus clases por las de css/style.css.
//
//   node herramientas/migrar-materialize.mjs <archivos...>
//
// Sólo toca: los valores de los atributos class, las líneas que cargan
// materialize.css/js e init.js, los <script> en línea que usan M.*, y el
// crédito a Materialize del pie. Todo lo demás se deja byte a byte igual.

import fs from 'node:fs';
import { elementos, clasesDe } from './html-tokens.mjs';

// --- Equivalencias directas (clase de Materialize → clase propia; '' = se elimina)
const DIRECTAS = {
  // layout
  container: 'container', section: 'section', 'no-pad-bot': '', 'valign-wrapper': '',
  center: 'texto-centro', 'center-align': 'texto-centro', 'left-align': 'texto-izquierda',
  'hide-on-med-and-down': 'solo-escritorio', 'responsive-img': '', light: '', bottom: '',
  // botones
  btn: 'btn', 'btn-large': 'btn--grande', 'btn-small': 'btn--pequeno',
  'btn-floating': 'btn btn--redondo', disabled: '',
  'waves-effect': '', 'waves-light': '', 'waves-red': '', 'waves-amber': '',
  // tarjetas
  card: 'card', 'card-content': 'card-contenido', 'card-title': 'card-titulo',
  'card-action': 'card-acciones', 'collection-header': '',
  // navegación
  'nav-wrapper': 'barra', 'brand-logo': 'marca',
  'dropdown-content': 'desplegable', 'dropdown-trigger': 'desplegable-boton',
  sidenav: 'menu-lateral', 'sidenav-trigger': 'menu-boton',
  'user-view': 'menu-lateral-cabecera', background: 'menu-lateral-fondo',
  'fixed-action-btn': 'botonera-flotante',
  // pie, parallax, imágenes, tooltips
  'page-footer': 'pie', 'footer-copyright': 'pie-copyright',
  'parallax-container': 'banner', parallax: 'banner-imagen',
  materialboxed: 'ampliable', tooltipped: '',
  // iconos
  tiny: 'icono-pequeno', medium: 'icono-grande', 'mdi-content-send': '',
  // flotados
  right: 'flotar-dcha', left: 'flotar-izda',
};

// --- Colores: familia de Materialize → color del sitio
const FAMILIAS = {
  html: ['red', 'materialize-red', 'pink'],
  css: ['blue', 'light-blue', 'indigo'],
  js: ['yellow', 'amber', 'orange'],
  php: ['purple', 'deep-purple'],
  acento: ['cyan', 'teal', 'green', 'lime'],
  claro: ['white'],
  suave: ['grey'],
  oscuro: ['black'],
};
const familiaDe = (nombre) => Object.keys(FAMILIAS).find((k) => FAMILIAS[k].includes(nombre));
const MATICES = /^(text-)?(lighten|darken|accent)-\d?$/;
const FONDOS_ESPECIALES = { transparent: 'fondo-transparente' };

// --- Rejilla
const TAMANOS = /^(s|m|l|xl)\d+$|^offset-/;
const anchoEscritorio = (cs) => {
  const g = (p) => {
    const x = cs.find((c) => new RegExp(`^${p}(\\d+)$`).test(c));
    return x ? Number(x.slice(p.length)) : null;
  };
  return g('l') ?? g('m') ?? g('s') ?? 12;
};
const esCol = (el) => clasesDe(el).includes('col');

function clasesRejilla(el) {
  const cols = el.hijos.filter(esCol);
  if (cols.length < 2) return [];
  const parciales = cols.map((c) => anchoEscritorio(clasesDe(c))).filter((w) => w < 11);
  if (!parciales.length) return [];
  // columnas mezcladas con contenido suelto (títulos, párrafos): éste ocupa la fila entera
  const mixta = el.hijos.some((h) => !esCol(h) && !['br', 'a', 'script'].includes(h.tag)) ? ['grid--mixta'] : [];
  const unicos = [...new Set(parciales)];
  if (unicos.length === 1) {
    const w = unicos[0];
    if (w <= 2) return ['grid', 'grid--compacta', ...mixta];
    if (12 % w === 0) return ['grid', `grid--${12 / w}`, ...mixta];
    return ['grid', ...mixta];
  }
  if (parciales.reduce((a, b) => a + b, 0) <= 12) {
    return ['grid', 'grid--a-medida', ...mixta, { columnas: parciales.map((w) => `${w}fr`).join(' ') }];
  }
  // varias "filas" de Materialize seguidas (4+8, 3+9...): 12 pistas, cada columna con su --span
  return ['grid', 'grid--12'];
}

function traducir(el) {
  const cs = clasesDe(el);
  const fuera = [];
  let estilo = null;

  // rejilla: el contenedor de las columnas
  for (const c of clasesRejilla(el)) {
    if (typeof c === 'string') fuera.push(c);
    else estilo = c;
  }
  // columna dentro de una rejilla que ocupa toda la fila
  const rejillaPadre = el.padre ? clasesRejilla(el.padre) : [];
  if (esCol(el) && rejillaPadre.length) {
    const w = anchoEscritorio(cs);
    if (rejillaPadre.includes('grid--12')) {
      fuera.push('celda');
      if (w < 12) estilo = { span: w };
    } else {
      if (rejillaPadre.includes('grid--mixta')) fuera.push('celda');
      if (w >= 11) fuera.push('grid-completa');
    }
  }

  for (const c of cs) {
    if (c === 'row' || c === 'col' || TAMANOS.test(c) || MATICES.test(c)) continue;
    if (c in DIRECTAS) {
      // la barra de navegación se alinea con flex, sin flotados
      if (c === 'right' && cs.includes('hide-on-med-and-down')) continue;
      fuera.push(...DIRECTAS[c].split(' ').filter(Boolean));
      continue;
    }
    if (c in FONDOS_ESPECIALES) { fuera.push(FONDOS_ESPECIALES[c]); continue; }
    const texto = /^(.+)-text$/.exec(c);
    if (texto && familiaDe(texto[1])) { fuera.push(`texto-${familiaDe(texto[1])}`); continue; }
    if (familiaDe(c) || c === 'grey') {
      // color de fondo: el <nav> blanco y el pie negro ya lo son por defecto
      if ((el.tag === 'nav' && c === 'white') || (cs.includes('page-footer') && c === 'black')) continue;
      fuera.push(`fondo-${c === 'grey' ? 'oscuro' : familiaDe(c)}`);
      continue;
    }
    fuera.push(c); // clase propia del sitio: se queda
  }
  return { clases: [...new Set(fuera)], estilo };
}

// --- Líneas y bloques que sobran
const QUITAR = [
  // <link> a materialize(.min).css (línea completa)
  /^[^\n]*<link[^>]*materialize(\.min)?\.css[^>]*>[^\n]*\n/gm,
  // <script> de materialize(.min).js e init.js (línea completa)
  /^[^\n]*<script[^>]*src="[^"]*(materialize(\.min)?|init)\.js"[^>]*><\/script>[^\n]*\n/gm,
  // <script> en línea que usa la API de Materialize (M.algo)
  /^[ \t]*<script>(?:(?!<\/script>)[\s\S])*?\bM\.[A-Z][\s\S]*?<\/script>[ \t]*\n/gm,
  // crédito del pie: enlace + logo de Materialize
  /^[ \t]*<a href="https:\/\/materializecss\.com[^"]*"[^>]*>\s*<img[^>]*>\s*<\/a>[ \t]*\n/gm,
  /^[ \t]*Made by&with <a[^>]*materializecss\.com[^>]*>Materialize<\/a>[ \t]*\n/gm,
];

export function migrar(html) {
  let salida = html;
  for (const re of QUITAR) salida = salida.replace(re, '');

  const cambios = [];
  for (const el of elementos(salida)) {
    // clases con Nunjucks dentro ({{ … }}) no se tocan: partirlas rompería la plantilla
    if (!el.clase || /[{}]/.test(el.clase.valor)) continue;
    const { clases, estilo } = traducir(el);
    let valor = clases.join(' ');
    if (estilo?.columnas) valor += `" style="--columnas: ${estilo.columnas}`;
    if (estilo?.span) valor += `" style="--span: ${estilo.span}`;
    if (valor !== el.clase.valor) cambios.push({ ...el.clase, valor });
  }
  // aplica de atrás hacia delante para no mover las posiciones pendientes
  for (const c of cambios.sort((a, b) => b.ini - a.ini)) {
    salida = salida.slice(0, c.ini) + c.valor + salida.slice(c.fin);
  }
  // class="" vacío tras quitar clases de Materialize
  salida = salida.replace(/ class=""/g, '');
  return { salida, cambios: cambios.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const archivo of process.argv.slice(2)) {
    const antes = fs.readFileSync(archivo, 'utf8');
    const { salida, cambios } = migrar(antes);
    if (salida !== antes) fs.writeFileSync(archivo, salida);
    console.log(`${String(cambios).padStart(4)} clases  ${archivo}`);
  }
}
