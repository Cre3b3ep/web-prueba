// Recorre las etiquetas de un HTML sin dependencias y sin reescribirlo:
// devuelve cada elemento con su padre y la posición exacta de su atributo
// class, para poder editar sólo esos bytes y dejar el resto intacto.
// Basta para el HTML de este sitio; no pretende ser un parser completo.

const VACIOS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
  'param', 'source', 'track', 'wbr',
]);

export function elementos(html) {
  const lista = [];
  const pila = [];
  const re = /<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1>|<\/([a-zA-Z][\w-]*)\s*>|<([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
  let m;
  while ((m = re.exec(html))) {
    if (m[0].startsWith('<!--') || m[1]) continue;
    if (m[2]) {
      // cierre: saca de la pila hasta encontrar la etiqueta (tolera HTML sin cerrar)
      const nombre = m[2].toLowerCase();
      const i = pila.map((e) => e.tag).lastIndexOf(nombre);
      if (i !== -1) pila.length = i;
      continue;
    }
    const tag = m[3].toLowerCase();
    const attrs = m[4];
    const el = { tag, padre: pila.at(-1) ?? null, hijos: [], clase: null };
    const c = /\sclass\s*=\s*"([^"]*)"/.exec(attrs);
    if (c) {
      const ini = m.index + 1 + m[3].length + c.index + c[0].indexOf('"') + 1;
      el.clase = { ini, fin: ini + c[1].length, valor: c[1] };
    }
    if (el.padre) el.padre.hijos.push(el);
    lista.push(el);
    if (!VACIOS.has(tag) && !/\/\s*$/.test(attrs)) pila.push(el);
  }
  return lista;
}

export const clasesDe = (el) => (el.clase ? el.clase.valor.split(/\s+/).filter(Boolean) : []);
