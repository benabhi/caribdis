"""Colorea los iconos SVG en línea.

WeasyPrint 70 dibuja el SVG en línea con su propio motor y no hereda el `color`
de CSS: `currentColor` sale siempre negro. Aquí resolvemos la cascada de `color`
del estilo (solo esa propiedad) con lxml + cssselect y escribimos el color final
dentro de cada <svg>, en lugar de `currentColor`.
"""
import re

import cssselect
import lxml.html
import tinycss2

_TRANSLATOR = cssselect.HTMLTranslator()


def _variables(reglas):
    var = {}
    for r in reglas:
        if r.type == 'qualified-rule' and tinycss2.serialize(r.prelude).strip() == ':root':
            for d in tinycss2.parse_declaration_list(r.content, skip_whitespace=True, skip_comments=True):
                if d.type == 'declaration' and d.name.startswith('--'):
                    var[d.name] = tinycss2.serialize(d.value).strip()
    return var


def _resolver(valor, var):
    for _ in range(5):
        nuevo = re.sub(r'var\((--[\w-]+)\)', lambda m: var.get(m.group(1), 'black'), valor)
        if nuevo == valor:
            break
        valor = nuevo
    return valor.replace('!important', '').strip()


def _especificidad(sel):
    try:
        s = cssselect.parse(sel)[0].specificity()
    except Exception:
        return (0, 0, 0)
    return s


def _reglas_color(css):
    reglas = tinycss2.parse_stylesheet(css, skip_whitespace=True, skip_comments=True)
    var = _variables(reglas)
    salida = []
    orden = 0

    def recorrer(lista):
        nonlocal orden
        for r in lista:
            if r.type == 'at-rule':
                # @media print / screen: entramos; @page, @font-face: no
                if r.lower_at_keyword == 'media' and r.content:
                    recorrer(tinycss2.parse_rule_list(r.content, skip_whitespace=True, skip_comments=True))
                continue
            if r.type != 'qualified-rule':
                continue
            decls = tinycss2.parse_declaration_list(r.content, skip_whitespace=True, skip_comments=True)
            color = None
            for d in decls:
                if d.type == 'declaration' and d.name == 'color':
                    color = _resolver(tinycss2.serialize(d.value), var)
            if not color or color in ('inherit', 'currentColor', 'currentcolor'):
                continue
            for sel in tinycss2.serialize(r.prelude).split(','):
                sel = sel.strip()
                if not sel or '::' in sel or ':before' in sel or ':after' in sel or sel.startswith('@'):
                    continue
                try:
                    xpath = _TRANSLATOR.css_to_xpath(sel)
                except Exception:
                    continue
                orden += 1
                salida.append((_especificidad(sel), orden, xpath, color))

    recorrer(reglas)
    return salida


def colorear(html, css):
    """Devuelve `html` con el color resuelto dentro de cada <svg> que use currentColor."""
    k = 0

    def marcar(m):
        nonlocal k
        k += 1
        return f'<svg data-k="{k}"'
    marcado = re.sub(r'<svg(?=[\s>])', marcar, html)
    arbol = lxml.html.fromstring(marcado)
    reglas = _reglas_color(css)
    elegido = {}     # elemento -> (especificidad, orden, color)
    for esp, orden, xpath, color in reglas:
        try:
            nodos = arbol.xpath(xpath)
        except Exception:
            continue
        for n in nodos:
            clave = (esp, orden)
            if n not in elegido or clave >= elegido[n][0]:
                elegido[n] = (clave, color)
    # inline style="color:…"
    for n in arbol.xpath('//*[@style]'):
        m = re.search(r'(?:^|;)\s*color\s*:\s*([^;]+)', n.get('style'))
        if m:
            elegido[n] = (((9, 9, 9), 0), m.group(1).strip())

    def color_de(n):
        while n is not None:
            if n in elegido:
                return elegido[n][1]
            n = n.getparent()
        return '#2b201b'

    colores = {}
    for svg in arbol.xpath('//svg[@data-k]'):
        colores[svg.get('data-k')] = color_de(svg)

    def sustituir(m):
        num = m.group(1)
        cuerpo = m.group(2)
        c = colores.get(num, '#2b201b')
        return '<svg' + cuerpo.replace('currentColor', c) + '</svg>'
    return re.sub(r'<svg data-k="(\d+)"(.*?)</svg>', sustituir, marcado, flags=re.S)
