"""Regenera las fuentes de iconos recortadas de /fonts.

La web sólo incluye los glifos que usa (≈4 KB en vez de ≈200 KB). Si añades un
icono nuevo en el HTML, añádelo a las listas de abajo y vuelve a ejecutar:

    pip install fonttools brotli
    npm pack @fontsource/material-icons@5 @fortawesome/fontawesome-free@5.15.4
    (descomprime los .tgz en esta carpeta: material-icons/ y fontawesome/)
    python3 herramientas/subset_iconos.py

Después añade la regla .fa-<nombre>:before a css/fuentes.css (el código está
en fontawesome/package/css/all.css).
"""
import os
import re

from fontTools import subset
from fontTools.ttLib import TTFont

AQUI = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(AQUI, '..', 'fonts')

MATERIAL = ['check_box_outline_blank', 'open_in_new', 'menu', 'home',
            'arrow_drop_down', 'check_box', 'developer_board']
FA_BRANDS = ['html5', 'twitter', 'telegram', 'facebook-f', 'youtube', 'soundcloud',
             'css3-alt', 'js', 'php', 'java', 'node-js', 'css3']
FA_SOLID = ['cog', 'chevron-down', 'chevron-up']


def material_icons(src):
    # Los iconos se dibujan con ligaduras: "menu" (4 letras) -> glifo del icono.
    # Material Icons usa la característica 'rlig' (no 'liga'): si no se conserva,
    # el navegador pinta las letras (invisibles) en lugar del icono.
    font = TTFont(src)
    cmap = font.getBestCmap()
    ligaduras = {}
    for lookup in font['GSUB'].table.LookupList.Lookup:
        for st in lookup.SubTable:
            st = getattr(st, 'ExtSubTable', st)
            for primero, lista in getattr(st, 'ligatures', {}).items():
                for lig in lista:
                    ligaduras[tuple([primero] + list(lig.Component))] = lig.LigGlyph
    glifos = [ligaduras[tuple(cmap[ord(c)] for c in nombre)] for nombre in MATERIAL]
    glifos += [cmap[ord(c)] for c in set(''.join(MATERIAL))]
    opciones = subset.Options()
    opciones.flavor = 'woff2'
    opciones.layout_closure = False          # no arrastrar las otras 2000 ligaduras
    opciones.layout_features = ['rlig', 'liga']
    s = subset.Subsetter(opciones)
    s.populate(glyphs=glifos)
    s.subset(font)
    subset.save_font(font, os.path.join(FONTS, 'material-icons-subset.woff2'), opciones)


def font_awesome(base):
    css = open(os.path.join(base, 'css', 'all.css')).read()

    def codigo(nombre):
        m = re.search(r'\.fa-%s:before\s*\{\s*content:\s*"\\([0-9a-f]+)"' % re.escape(nombre), css)
        return int(m.group(1), 16)

    for origen, nombres, destino in [('fa-brands-400', FA_BRANDS, 'fa-brands-subset.woff2'),
                                     ('fa-solid-900', FA_SOLID, 'fa-solid-subset.woff2')]:
        font = TTFont(os.path.join(base, 'webfonts', origen + '.woff2'))
        opciones = subset.Options()
        opciones.flavor = 'woff2'
        s = subset.Subsetter(opciones)
        s.populate(unicodes=[codigo(n) for n in nombres])
        s.subset(font)
        subset.save_font(font, os.path.join(FONTS, destino), opciones)


if __name__ == '__main__':
    material_icons(os.path.join(AQUI, 'material-icons', 'package', 'files',
                                'material-icons-latin-400-normal.woff2'))
    font_awesome(os.path.join(AQUI, 'fontawesome', 'package'))
    print('Listo: fuentes de iconos regeneradas en /fonts')
