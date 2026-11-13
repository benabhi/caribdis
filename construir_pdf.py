#!/usr/bin/env python3
"""Construye el manual de Caribdis en PDF a partir de los capítulos de libro/.

Uso:
    python3 construir_pdf.py                # Caribdis.pdf (pantalla)
    python3 construir_pdf.py --imprenta     # Caribdis-imprenta.pdf (3 mm de sangrado y marcas de corte)
    python3 construir_pdf.py --html         # además guarda maqueta/manual.html para depurar

Requisitos: weasyprint, markdown-it-py, beautifulsoup4, pyphen, Pillow.
Archivos: libro/*.md (texto), estilo.css (diseño), maqueta/extras.py (citas, cajas,
ilustraciones por capítulo), maqueta/iconos.py, maqueta/mapa.py, arte/, fuentes/.
"""
import os, re, sys, glob, html, json, shutil, subprocess
from markdown_it import MarkdownIt
from bs4 import BeautifulSoup, NavigableString

RAIZ = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(RAIZ, 'maqueta'))
import extras as X
import columnas_justas  # noqa: F401  (reparto fino de columnas)
from iconos import icono, emblema, SIMBOLOS
from mapa import svg_mapa

LIBRO = os.path.join(RAIZ, 'libro')
md = MarkdownIt('commonmark', {'html': True, 'typographer': False}).enable('table')

# --------------------------------------------------------------------------- utilidades

def slug(t):
    t = t.lower()
    for a, b in zip('áéíóúñü', 'aeiounu'):
        t = t.replace(a, b)
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')


def esc(t):
    return html.escape(t, quote=True)


ANCLAS = set()   # se llena al leer el libro


RE_CRIATURA = re.compile(
    r'(?P<em>\*{1,2})?(?P<nombre>[A-ZÁÉÍÓÚÑ¿](?:[^·*.,:;()\[\]\n|]|,\s+[a-záéíóúñ]){1,60}?)(?P<em2>\*{1,2})? · Ataque (?P<a>\d+) · '
    r'Blind\. (?P<b>\d+) · Heridas (?P<h>\d+)(?P<tags>(?: · )?(?:\[[^\]\n]+\])*)(?P<cierre>\*{1,2})?')


def separar_nombre(nombre):
    """«Combate contra Guardias de la rampa» → ('Combate contra ', 'Guardias de la rampa')."""
    corte = re.search(r'^(.*?\b(?:contra|ante|Contra))\s+(?=\S)', nombre)
    if corte and len(corte.group(1).split()) <= 4:
        return corte.group(0), nombre[corte.end():]
    return '', nombre


def criatura(m):
    nombre = m.group('nombre').strip()
    previo = ''
    previo, nombre = separar_nombre(nombre)
    tags = ' · '.join(re.findall(r'\[([^\]]+)\]', m.group('tags') or ''))
    stats = ''.join(f'<span class="cr-s"><i>{k}</i>{m.group(g)}</span>' for k, g in (('Atq', 'a'), ('Bl', 'b'), ('Her', 'h')))
    t_html = f'<span class="cr-t">{esc(tags)}</span>' if tags else ''
    abre = m.group('em') or ''
    sobra = abre if not (m.group('em2') or m.group('cierre')) else ''   # un * suelto que no cierra aquí
    return (f'{sobra}{previo}'
            f'<span class="criatura">{icono("combate")}<b class="cr-n">{esc(nombre)}</b>{stats}{t_html}</span>')


def inline_previo(t):
    """Transformaciones sobre el Markdown antes de renderizar."""
    # código en línea: pruebas, pistas y marcas
    def cod(m):
        c = m.group(1)
        if c.startswith('[') and c.endswith(']') and '·' in c:
            partes = [p.strip() for p in c[1:-1].split('·')]
            attr, dif = partes[0], (partes[1] if len(partes) > 1 else '')
            extra = ''.join(f'<span class="mod">{esc(p)}</span>' for p in partes[2:])
            return (f'<span class="prueba">{icono("dado")}<span class="attr">{esc(attr)}</span>'
                    f'<span class="dif">{esc(dif)}</span>{extra}</span>')
        if re.fullmatch(r'[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ0-9_]{2,}', c):
            v = esc(c).replace('_', '_<wbr>')
            return f'<span class="marca">{v}</span>'
        if re.search(r'\b[er]\d{3}\b', c) and '·' in c:
            v = re.sub(r'\b([er]\d{3})\b', r'<a href="#\1">\1</a>', esc(c))
            return f'<span class="pista">{icono("pista")}{v}</span>'
        return f'<code>{esc(c)}</code>'
    t = re.sub(r'`([^`\n]+)`', cod, t)
    # criaturas en línea: «Nombre · Ataque 4 · Blind. 2 · Heridas 4 · [Etiqueta]»
    t = '\n'.join(ln if ln.lstrip().startswith('>') else RE_CRIATURA.sub(criatura, ln) for ln in t.split('\n'))
    # símbolos → iconos
    for s, n in SIMBOLOS.items():
        t = t.replace(s, icono(n, 'sim'))
    return t


def render(t):
    return md.render(inline_previo(t))


RE_REF = re.compile(r'(?<![\w#/-])([er]\d{3})(?![\w])')
ROT = {'éxito pleno': 'pleno', 'éxito': 'ok', 'fallo': 'ko', 'si ganas': 'gana', 'si pierdes': 'ko',
       'si huyes': 'huye', 'si hablas': 'habla', 'si pasas': 'ok'}


def pulir(htmls, contexto=''):
    """Transformaciones sobre el HTML renderizado."""
    s = BeautifulSoup(htmls, 'html.parser')
    # referencias sueltas eXXX / rXXX → enlaces
    for nodo in list(s.find_all(string=True)):
        if nodo.parent.name in ('a', 'code', 'pre', 'svg', 'text', 'style'):
            continue
        if not RE_REF.search(nodo):
            continue
        trozos = RE_REF.split(str(nodo))
        nuevos = []
        for i, tr in enumerate(trozos):
            if i % 2 == 1 and tr in ANCLAS:
                a = s.new_tag('a', href='#' + tr)
                a.string = tr
                nuevos.append(a)
            elif tr:
                nuevos.append(NavigableString(tr))
        for n in nuevos:
            nodo.insert_before(n)
        nodo.extract()
    # enlaces internos: clase según destino
    for a in s.find_all('a', href=True):
        h = a['href']
        if h.startswith('#e'):
            a['class'] = a.get('class', []) + ['ref', 'ref-e']
        elif h.startswith('#r'):
            a['class'] = a.get('class', []) + ['ref', 'ref-r']
    # flechas → e123: la flecha va dentro del enlace
    for a in s.find_all('a', class_='ref'):
        prev = a.previous_sibling
        if isinstance(prev, NavigableString) and prev.rstrip().endswith('→'):
            prev.replace_with(NavigableString(prev.rstrip()[:-1] + ' '))
            a['class'] = a['class'] + ['ir']
    # rótulos de resultado
    for em in s.find_all('em'):
        t = em.get_text().strip()
        if t.endswith(':') and len(t) < 40:
            clave = t[:-1].strip().lower()
            em.name = 'span'
            em['class'] = ['rot', 'rot-' + ROT.get(clave, 'otro')]
            em.string = t[:-1]
    # negritas de resultado: **Si ganas** / **Si pasas.**
    for b in s.find_all('strong'):
        t = b.get_text().strip().rstrip('.:').lower()
        if t in ('si ganas', 'si pasas', 'si huyes', 'si hablas', 'si pierdes'):
            b['class'] = ['rot', 'rot-' + ROT.get(t, 'otro')]
    # bloques de enemigo
    for bq in s.find_all('blockquote'):
        txt = bq.get_text(' ', strip=True)
        if 'Ataque' in txt and ('Heridas' in txt or 'Daño' in txt):
            nombre = bq.find('strong')
            nombre_t = nombre.get_text() if nombre else ''
            resto = txt.replace(nombre_t, '', 1)
            tags = re.findall(r'\[([^\]]+)\]', resto)
            resto = re.sub(r'\[[^\]]+\]', '', resto)
            campos = [c.strip() for c in resto.split('·') if c.strip()]
            stats = ''.join(
                f'<span class="st"><b>{esc(re.sub(r"[0-9]+$", "", c).strip())}</b>'
                f'<i>{esc((re.findall(r"[0-9]+", c) or [""])[-1])}</i></span>' for c in campos)
            tg = ''.join(f'<span class="tag">{esc(t)}</span>' for t in tags)
            nuevo = BeautifulSoup(
                f'<div class="enemigo">{icono("combate", "ico-enemigo")}<div class="en-nombre">{esc(nombre_t)}</div>'
                f'<div class="en-stats">{stats}</div><div class="en-tags">{tg}</div></div>', 'html.parser')
            bq.replace_with(nuevo)
        else:
            bq['class'] = ['cita-texto']
    # listas numeradas → opciones
    for ol in s.find_all('ol'):
        ol['class'] = ['opciones']
    # tablas
    for tb in s.find_all('table'):
        cab = [th.get_text().strip() for th in tb.find_all('th')]
        clases = ['tabla']
        if cab and cab[0] == '2d6' and any('Alerta' in c for c in cab):
            clases.append('encuentros')
        elif cab and cab[0] == 'd6' and 'Hablar' in cab:
            clases.append('posturas')
        elif cab and cab[0] in ('d6', '1d6', 'd12', '1d12', '2d6', 'd66', '1d8'):
            clases.append('aleatoria')
        tb['class'] = clases
        larga = len(tb.find_all('tr')) > 8
        filas = len(tb.find_all('tr'))
        envoltura = s.new_tag('div', **{'class': ('tabla-env larga' if larga else 'tabla-env') + (' partible' if filas > 13 or (cab and cab[0].startswith('2d6 +')) else '')})
        tb.wrap(envoltura)
        # el texto que presenta la tabla no se queda solo al pie de la página
        previo = envoltura.find_previous_sibling()
        if previo is not None and previo.name in ('p', 'h4', 'h5', 'ul', 'ol'):
            previo['class'] = (previo.get('class') or []) + ['pre-tabla']
    # un primer párrafo corto no se queda solo bajo el título
    primero = next((c for c in s.contents if getattr(c, 'name', None)), None)
    if primero is not None and primero.name == 'p' and len(primero.get_text()) < 140 \
            and primero.find_next_sibling() is not None:
        primero['class'] = (primero.get('class') or []) + ['pre-tabla']
    # bloques de código
    for pre in s.find_all('pre'):
        txt = pre.get_text()
        if 'POLO HELADO' in txt:
            pre.replace_with(BeautifulSoup(f'<figure class="mapa-col">{svg_mapa()}</figure>', 'html.parser'))
        else:
            pre['class'] = ['terminal']
    return str(s)


# --------------------------------------------------------------------------- lectura

def leer():
    """Devuelve una lista de nodos: parte, capitulo, grupo, entrada, texto."""
    nodos = []
    for nombre in X.ORDEN:
        lineas = open(os.path.join(LIBRO, nombre), encoding='utf-8').read().splitlines()
        buf, anc = [], None

        def volcar():
            if buf and nodos:
                nodos[-1].setdefault('cuerpo', []).extend(buf)
            elif buf:
                nodos.append({'tipo': 'texto', 'cuerpo': list(buf)})
            buf.clear()

        for ln in lineas:
            m_a = re.match(r'<a id="([re]\d{3})"></a>\s*$', ln)
            if m_a:
                volcar(); anc = m_a.group(1); continue
            if ln.strip() == '---':
                continue
            if ln.startswith('# '):
                volcar(); nodos.append({'tipo': 'parte', 'titulo': ln[2:].strip(), 'archivo': nombre}); continue
            if ln.startswith('## '):
                volcar(); nodos.append({'tipo': 'capitulo', 'titulo': ln[3:].strip(), 'archivo': nombre}); continue
            if ln.startswith('### '):
                volcar()
                t = ln[4:].strip()
                if anc:
                    tit = re.sub(r'^[re]\d{3}\s*·\s*', '', t)
                    nodos.append({'tipo': 'entrada', 'id': anc, 'titulo': tit, 'archivo': nombre})
                    ANCLAS.add(anc); anc = None
                else:
                    nodos.append({'tipo': 'grupo', 'titulo': t, 'archivo': nombre})
                continue
            buf.append(ln)
        volcar()
    return nodos


# --------------------------------------------------------------------------- piezas

def cita_html(c, clase='epigrafe'):
    if not c:
        return ''
    texto, autor = c
    a = f'<cite>{esc(autor)}</cite>' if autor else ''
    return f'<blockquote class="{clase}"><p>{esc(texto)}</p>{a}</blockquote>'


def img(nombre, pos='50% 50%', clase=''):
    return f'<img class="{clase}" src="arte/{nombre}" style="object-position:{pos}" alt=""/>'


def caja_html(id_):
    tipo, titulo, texto = X.CAJAS[id_]
    cuerpo = pulir(render(texto.strip()))
    return (f'<aside class="caja caja-{tipo}"><div class="caja-cab">{icono(tipo)}<span>{esc(titulo)}</span></div>'
            f'{cuerpo}</aside>')


def entrada_html(n, clases_extra=()):
    id_ = n['id']
    cuerpo = '\n'.join(n.get('cuerpo', [])).strip('\n')
    meta = ''
    lineas = cuerpo.split('\n')
    # línea de lugar y tiempo: «*Dunas de Óxido · ⌛ 0*»
    if lineas and re.fullmatch(r'\*[^*].*\*', lineas[0].strip()) and ('⌛' in lineas[0] or id_[0] == 'e'):
        m = lineas[0].strip()[1:-1]
        partes = [p.strip() for p in m.split('·')]
        tiempo = ''
        if partes and partes[-1].startswith('⌛'):
            tiempo = partes.pop()[1:].strip()
        lugar = ' · '.join(partes)
        t_html = (f'<span class="tiempo">{icono("tiempo")}{esc(tiempo)}</span>' if tiempo else '')
        meta = f'<div class="meta"><span class="lugar">{esc(lugar)}</span>{t_html}</div>'
        lineas = lineas[1:]
    cuerpo_html = pulir(render('\n'.join(lineas)))
    tipo = 'evento' if id_[0] == 'e' else 'regla'
    clases = ['entrada', tipo] + list(clases_extra)
    if '★' in cuerpo:
        clases.append('hito')
    num = id_[1:]
    emb = ''
    if id_ in X.FACCIONES_EVENTO:
        emb = emblema(X.FACCIONES_EVENTO[id_], 'emb-entrada')
    titulo = re.sub(r'\*([^*]+)\*', r'<em class="t-nota">\1</em>', inline_previo(esc(n['titulo'])))
    return (f'<section class="{" ".join(clases)}" id="{id_}" data-num="{id_}">'
            f'<header class="cab"><span class="num"><span class="pfx">{id_[0]}</span>{num}</span>'
            f'<h3 class="tit" data-marca="{id_} · {esc(n["titulo"].replace('*', ''))}">{emb}{titulo}</h3></header>{meta}'
            f'<div class="texto">{cuerpo_html}</div></section>')


ARCOS = {
    'r102': ('CULPA', 3, ('e805', 'En paz'), ('e806', 'El peso'),
             [('e800', 'Pitidos'), ('e801', 'El sueño de la caída'), ('e802', 'Voz en la radio'),
              ('e803', 'Lo que grabó la caja'), ('e804', 'Plazas')],
             'Nadie te pidió que los salvaras a todos. Lo vas a intentar igual.'),
    'r103': ('ARRAIGO', 3, ('e815', 'Sin raíces'), ('e816', 'Uno de los nuestros'),
             [('e810', 'La Madre sueña contigo'), ('e811', 'Tu hermano'), ('e812', 'El mapa del primer pecio'),
              ('e813', 'La Esperanza'), ('e814', 'La última noche en Caribdis')],
             'Las estrellas o tu gente. Caribdis no deja quedarse con las dos.'),
    'r104': ('MEMORIA', 0, None, ('e825', 'Recuerdo completo'),
             [('e820', 'Hueco en el registro'), ('e821', 'La otra voz'), ('e822', 'La copia de seguridad'),
              ('e823', 'Los siete segundos'), ('e824', 'Quién vuelve')],
             'Cada recuerdo que recuperas pesa. Algunos no son tuyos.'),
}


def arco_html(rid):
    cont, ini, bajo, alto, hist, lema = ARCOS[rid]
    ref = lambda e: f'<a class="ref ref-e" href="#{e}">{e}</a>'
    dias = ''.join(f'<li><span class="ar-dia">{d}</span><span class="ar-tit">{esc(t)}</span>{ref(e)}</li>'
                   for d, (e, t) in zip((50, 40, 30, 20, 10), hist))
    celdas = ''.join(f'<span class="ar-c{" ar-ini" if k == ini else ""}">{k}</span>' for k in range(7))
    extremos = (f'<div class="ar-ext"><span>{("0 → " + ref(bajo[0]) + " " + esc(bajo[1])) if bajo else ""}</span>'
                f'<span>6 → {ref(alto[0])} {esc(alto[1])}</span></div>')
    return (f'<aside class="arco"><div class="ar-cab">{icono("tiempo")}<span>Tu historia</span></div>'
            f'<ol class="ar-linea">{dias}</ol>'
            f'<div class="ar-cont"><b class="marca">{cont}</b><div class="ar-escala">{celdas}</div></div>{extremos}'
            f'<p class="ar-lema">{esc(lema)}</p></aside>')


def protagonista_html(n):
    """Fichas r102–r104: página propia con retrato."""
    retrato = X.PROTAGONISTAS[n['id']]
    e = entrada_html(n, ['ficha-prota'])
    arco = arco_html(n['id']) if n['id'] in ARCOS else ''
    pos = {'mente.jpg': '27% 30%'}.get(retrato, '50% 30%')     # el dron de la Mente está a la izquierda del cuadro
    return (f'<div class="pagina-prota"><div class="prota-retrato">{img(retrato, pos)}</div>'
            f'<div class="prota-texto">{e}{arco}</div></div>')


# --------------------------------------------------------------------------- composición

class Libro:
    def __init__(self, nodos):
        self.nodos = nodos
        self.out = []
        self.indice = []       # (nivel, titulo, ancla)
        self.parte = ''
        self.col = None        # clase de columnas abierta
        self.capitulo = None
        self.remates = []
        self.remates_parte = []
        self.fincols = []      # finales de flujo a dos columnas: el hueco de la columna corta se rellena

    # -- columnas
    def abrir_col(self, clase):
        # la apertura es perezosa: el <div> solo se escribe con el primer contenido
        if self.col != clase:
            self.cerrar_col()
            self.col = clase
            self.col_vacia = True

    def cerrar_col(self):
        if self.col:
            if not getattr(self, 'col_vacia', False):
                if self.col == 'col2' and not self.oscuro_abierto_now():
                    self.out.append(f'@@FINCOL{len(self.fincols)}@@')
                    self.fincols.append((self.parte, getattr(self, 'cap_titulo', ''), getattr(self, 'ultimo_id', '')))
                self.out.append('</div>')
            self.col = None
            self.col_vacia = False

    def oscuro_abierto_now(self):
        return getattr(self, 'oscuro_abierto', False)

    def poner(self, h):
        if self.col and self.col_vacia:
            self.out.append(f'<div class="flujo {self.col}">')
            self.col_vacia = False
        self.out.append(h)

    def ancho(self, h, remate=True):
        """Bloque a toda anchura: cierra las columnas y las reabre después.

        Antes deja una marca de remate: si el bloque no cabe y salta de página,
        el hueco que deja se rellena en la segunda pasada."""
        ultimo = self.out[-1].lstrip() if self.out else ''
        if remate and ultimo and not ultimo.startswith('@@REMATE') and not ultimo.startswith('<header'):
            self.remate()
        clase = self.col
        self.cerrar_col()
        self.out.append(h)
        if clase:
            self.abrir_col(clase)

    # -- portada y preliminares
    def preliminares(self, cuerpo_portada):
        epi = ''
        m = re.findall(r'^> ?(.*)$', '\n'.join(cuerpo_portada), re.M)
        if m:
            versos = '<br/>'.join(esc(x) for x in m if x.strip())
            epi = f'<p>{versos}</p>'
        self.out.append(f'''
<section class="portada">
  {img('portada.jpg', '50% 50%', 'portada-img')}
  <div class="portada-velo"></div>
  <div class="portada-titulo">
    <div class="portada-kicker">Un juego de rol en solitario</div>
    <h1 class="portada-nombre">Caribdis</h1>
    <div class="portada-sub">de naufragio, ruinas y regreso</div>
  </div>
  <div class="portada-pie">Tu nave cayó. El planeta canta. Algo viene.</div>
</section>
<section class="pagina-epigrafe"><div class="epi-centro">{icono('canto', 'epi-ico')}{epi}</div></section>
<section class="pagina-creditos">
  <div class="cred-titulo">Caribdis</div>
  <div class="cred-sub">Un juego de rol en solitario de naufragio, ruinas y regreso</div>
  <div class="cred-orn">{icono('rombo')}{icono('rombo')}{icono('rombo')}</div>
  <p>Para jugar necesitas este libro, tres dados de seis caras, un lápiz y las hojas de los Apéndices.
  Cada número del libro es un enlace: toca <b>e001</b> en el índice y empieza.</p>
  <p class="cred-peq">Edición 1.0 · 2026<br/>Ilustraciones creadas con ayuda de Gemini a partir de la dirección de arte del manual.<br/>
  Tipografías: Spectral, Cormorant Garamond, Barlow Condensed, Big Shoulders Stencil e IBM Plex Mono (SIL Open Font License).</p>
  <p class="cred-peq">Puedes imprimir las hojas de los Apéndices para uso personal.</p>
  <div class="cred-sello"><img src="arte/marca/utopia-logo.png" alt="UtopIA"/><div class="cred-sello-txt">Una publicación de UtopIA</div></div>
</section>
<nav class="indice" id="indice"><h2 class="indice-tit" data-titulo="Índice">Índice</h2>
<div class="indice-cuerpo">@@INDICE@@</div></nav>
''')

    def indice_html(self):
        filas = []
        for nivel, titulo, ancla in self.indice:
            if nivel == 1:
                filas.append(f'<div class="ix-parte"><a href="#{ancla}">{esc(titulo)}</a></div>')
            else:
                filas.append(f'<div class="ix-cap"><a href="#{ancla}"><span class="ix-t">{esc(titulo)}</span></a></div>')
        return '\n'.join(filas)

    # -- partes
    def parte_html(self, n):
        self.cerrar_col()
        cfg = X.PARTES.get(n['titulo'], {})
        nombre = cfg.get('nombre', n['titulo'].title())
        ancla = 'parte-' + slug(nombre)
        self.parte = nombre
        self.indice.append((1, f'{cfg.get("numero", "")} · {nombre}', ancla))
        cita = cita_html(cfg.get('cita'), 'cita-parte')
        if cfg.get('lamina'):
            self.arte_actual = cfg['lamina']
            self.out.append(
                f'<section class="lamina lamina-parte" id="{ancla}" data-parte="{esc(nombre)}">'
                f'{img(cfg["lamina"], cfg.get("pos", "50% 50%"), "lamina-img")}<div class="velo-abajo"></div>'
                f'<div class="parte-rot"><div class="parte-num">{cfg.get("numero", "")}</div>'
                f'<h1 class="parte-tit" data-marca="{esc(nombre)}">{esc(nombre)}</h1>{cita}</div></section>')
        else:
            self.out.append(
                f'<section class="parte-sola" id="{ancla}" data-parte="{esc(nombre)}">'
                f'<div class="parte-num">{cfg.get("numero", "")}</div>'
                f'<h1 class="parte-tit" data-marca="{esc(nombre)}">{esc(nombre)}</h1>{cita}</section>')

    # -- capítulos
    def capitulo_html(self, n):
        self.cerrar_col()
        titulo = n['titulo']
        self.cap_titulo = titulo
        intro = '\n'.join(n.get('cuerpo', [])).strip()
        m_reg = re.match(r'Región (\d) · (.+)', titulo)
        if m_reg:
            return self.region_html(n, m_reg.group(2), intro)
        cfg = X.CAPITULOS.get(f"{n['archivo']}:{titulo}") or X.CAPITULOS.get(titulo, {'maqueta': 'dos'})
        self.capitulo = cfg
        ancla = 'cap-' + slug(titulo)
        self.indice.append((2, titulo, ancla))
        maq = cfg.get('maqueta', 'dos')
        self.arte_actual = (cfg.get('lamina') or cfg.get('banda') or (None,))[0]
        if maq == 'hoja':
            return self.hoja_html(titulo, ancla)
        if cfg.get('lamina') or cfg.get('banda'):
            self.arte_actual = (cfg.get('lamina') or cfg.get('banda'))[0]
        if cfg.get('lamina'):
            arte, pos = cfg['lamina']
            self.out.append(f'<section class="lamina lamina-cap">{img(arte, pos, "lamina-img")}'
                            f'<div class="velo-abajo suave"></div>'
                            f'<div class="lamina-rot"><div class="lamina-kicker">{esc(self.parte)}</div>'
                            f'<div class="lamina-tit">{esc(titulo)}</div></div></section>')
        clases = ['cap-cab', 'maq-' + maq]
        banda = ''
        if cfg.get('banda'):
            arte, pos = cfg['banda']
            clases.append('con-banda')
            if cfg.get('banda_alta'):
                clases.append('banda-alta')
            banda = f'<div class="banda">{img(arte, pos)}</div>'
        if cfg.get('lamina') or cfg.get('banda') or maq in ('oscuro', 'finales', 'tres'):
            clases.append('salto')
        if titulo in ('Índice de Marcas', 'Bestiario'):
            intro = ''      # su cuerpo lo compone una función propia
        intro_html = pulir(render(intro)) if intro else ''
        envol = 'oscuro' if maq == 'oscuro' else ''
        if envol:
            self.out.append('<div class="zona-oscura">')
            self.oscuro_abierto = True
        self.out.append(
            f'<header class="{" ".join(clases)}" id="{ancla}" data-titulo="{esc(titulo)}">{banda}'
            f'<div class="cap-kicker">{esc(self.parte)}</div><h2 class="cap-tit" data-marca="{esc(titulo)}">{esc(titulo)}</h2>'
            f'{cita_html(cfg.get("cita"))}<div class="cap-intro">{intro_html}</div></header>')
        self.abrir_col({'dos': 'col2', 'tres': 'col3', 'una': 'col1', 'oscuro': 'col2',
                        'finales': 'col1 finales', 'mente': 'col2', 'mundo': 'col1'}[maq])

    def region_html(self, n, nombre, intro):
        r = X.REGIONES[nombre]
        ancla = 'region-' + slug(nombre)
        self.indice.append((2, f'Región {r["n"]} · {nombre}', ancla))
        self.capitulo = {'maqueta': 'region'}
        self.arte_actual = r['arte']
        cita = cita_html(r['cita'], 'cita-region')
        lema = re.sub(r'^\*(.*)\*$', r'\1', intro.strip())
        self.out.append(
            f'<section class="lamina lamina-region" id="{ancla}">{img(r["arte"], r["pos"], "lamina-img")}'
            f'<div class="velo-abajo"></div><div class="region-rot">'
            f'<div class="region-num"><span>Región</span>{r["n"]}</div>'
            f'<h2 class="region-tit" data-marca="Región {r["n"]} · {esc(nombre)}">{esc(nombre)}</h2>{cita}</div></section>')
        self.out.append(
            f'<header class="cap-cab region-cab" data-titulo="Región {r["n"]} · {esc(nombre)}">'
            f'<div class="region-ficha">'
            f'<div class="rf-num">{r["n"]}</div>'
            f'<div class="rf-datos"><div class="rf-nombre">{esc(nombre)}</div>'
            f'<div class="rf-lema">{esc(lema)}</div>'
            f'<div class="rf-fila">{icono("mapa")}<b>Vecinas</b> {esc(r["vecinas"])}</div>'
            f'<div class="rf-fila">{icono("asentamiento")}<b>Lugar</b> {esc(r["lugar"])}</div></div></div></header>')
        self.region_pendiente = True

    def hoja_html(self, titulo, ancla):
        if titulo == 'Hoja de protagonista':
            self.out.append(hoja_protagonista(ancla))
        else:
            self.out.append(hoja_nave(ancla))
            self.out.append(pagina_mapa())
        self.saltar_cuerpo = True

    # -- recorrido
    def componer(self):
        nodos = self.nodos
        self.saltar_cuerpo = False
        self.region_pendiente = False
        self.oscuro_abierto = False
        grupo_actual = ''
        i = 0
        # portada
        if nodos and nodos[0]['tipo'] == 'parte' and nodos[0]['titulo'] == 'CARIBDIS':
            cuerpo = nodos[0].get('cuerpo', [])
            # el «Índice» del md se sustituye por uno generado
            j = 1
            while j < len(nodos) and nodos[j]['archivo'] == '00-portada.md':
                cuerpo += nodos[j].get('cuerpo', []) if nodos[j]['tipo'] == 'grupo' else []
                j += 1
            self.preliminares(cuerpo)
            i = j
        while i < len(nodos):
            n = nodos[i]
            t = n['tipo']
            if t == 'parte':
                self.remate()
                self.cerrar_oscuro()
                self.saltar_cuerpo = False
                self.parte_html(n)
            elif t == 'capitulo':
                self.remate()
                self.cerrar_oscuro()
                self.saltar_cuerpo = False
                grupo_actual = ''
                self.capitulo_html(n)
                if n['titulo'] == 'Bestiario':
                    self.bestiario(n)
                    self.saltar_cuerpo = True
                if n['titulo'] == 'Índice de Marcas':
                    self.indice_marcas(n)
                    self.saltar_cuerpo = True
            elif self.saltar_cuerpo:
                pass
            elif t == 'grupo':
                grupo_actual = n['titulo']
                self.grupo_html(n)
            elif t == 'entrada':
                self.entrada(n, grupo_actual)
            i += 1
        self.remate()
        self.cerrar_col()
        self.cerrar_oscuro()
        self.out.append('@@DIARIO@@')
        self.out.append(contratapa())
        cuerpo = '\n'.join(self.out).replace('@@INDICE@@', self.indice_html())
        return cuerpo

    def bestiario(self, n):
        fichas = {}
        for e in self.nodos:
            if e['tipo'] != 'entrada':
                continue
            for ln in e.get('cuerpo', []):
                for m in RE_CRIATURA.finditer(ln.replace('**', '')):
                    nombre = separar_nombre(m.group('nombre').strip())[1]
                    d = fichas.setdefault(nombre.lower(), dict(n=nombre, a=m.group('a'), b=m.group('b'), h=m.group('h'),
                                                                t=re.findall(r'\[([^\]]+)\]', m.group('tags') or ''), e=[]))
                    if e['id'] not in d['e']:
                        d['e'].append(e['id'])
        intro = [ln for ln in n.get('cuerpo', []) if ln.strip()]
        self.cerrar_col()
        if intro:
            self.out.append(pulir(render('\n'.join(intro))))
        for clase, (titulo, lema) in X.BESTIARIO.items():
            grupo = sorted((f for f in fichas.values() if (f['t'] or ['Náufrago'])[0] == clase or
                            (clase == 'Antiguo' and 'Antiguo' in f['t'])), key=lambda f: f['n'])
            if clase == 'Máquina':
                grupo = [f for f in grupo if 'Antiguo' not in f['t']]
            if not grupo:
                continue
            self.cerrar_col()
            self.out.append(f'<div class="bt-cab"><h3>{esc(titulo)}</h3><p>{esc(lema)}</p></div>')
            self.abrir_col('col3 bestiario')
            for f in grupo:
                stats = ''.join(f'<span class="cr-s"><i>{k}</i>{f[g]}</span>' for k, g in (('Atq', 'a'), ('Bl', 'b'), ('Her', 'h')))
                refs = ' '.join(f'<a class="ref ref-{x[0]}" href="#{x}">{x}</a>' for x in f['e'])
                self.poner(f'<div class="bt-ficha criatura"><b class="cr-n">{icono("combate")}{esc(f["n"])}</b>'
                           f'<div class="bt-st">{stats}</div><div class="cr-t">{esc(" · ".join(f["t"]))}</div>'
                           f'<div class="bt-en">{refs}</div></div>')

    def tras_salto(self):
        """¿Lo último escrito obliga a saltar de página? Entonces no hay hueco que rellenar."""
        for trozo in reversed(self.out):
            t = trozo.strip()
            if not t or t == '</div>' or t.startswith('@@REMATE'):
                continue
            return bool(re.search(r'class="(?:lamina|pagina-prota|hoja|parte-sola|pagina-mapa|pagina-epigrafe|portada|'
                                  r'pagina-creditos|indice|contratapa|diario)', t[:400] if not t.startswith('</') else t[-1:])) \
                or 'pagina-prota' in t[:200]
        return True

    def remate(self):
        """Marca el final de una sección: en la segunda pasada, el hueco se rellena con una viñeta."""
        if self.tras_salto():
            return
        clase = self.col
        self.cerrar_col()
        k = len(self.remates)
        self.remates.append(getattr(self, 'arte_actual', None)); self.remates_parte.append(getattr(self, 'parte', ''))
        self.out.append(f'@@REMATE{k}@@')
        if clase:
            self.abrir_col(clase)

    def cerrar_oscuro(self):
        if self.oscuro_abierto:
            self.cerrar_col()
            self.out.append('</div>')
            self.oscuro_abierto = False

    def grupo_html(self, n):
        t = n['titulo']
        cuerpo = pulir(render('\n'.join(n.get('cuerpo', [])).strip())) if n.get('cuerpo') else ''
        cap = self.capitulo or {}
        if cap.get('maqueta') == 'mundo':
            tipo, kicker = X.DOCUMENTOS.get(t, ('cronica', 'Documento'))
            if tipo == 'himno':
                cuerpo = pulir(render('\n'.join(l.rstrip() + '  ' for l in n.get('cuerpo', []))))
            orn = f'<div class="doc-orn">{icono("rombo")}</div>' if tipo in ('himno', 'relato') else ''
            # los documentos añadidos después no llevan remate propio: así no cambia el reparto de citas del resto del libro
            return self.ancho(f'<article class="doc doc-{tipo}">{orn}<div class="doc-kicker">{esc(kicker)}</div>'
                              f'<h3 class="doc-tit">{esc(t)}</h3><div class="doc-cuerpo">{cuerpo}</div></article>',
                              remate=tipo not in ('glosario', 'regiones', 'rumores'))
        # asentamientos
        for nombre, emb in X.ASENTAMIENTOS.items():
            if t.startswith(nombre):
                return self.ancho(f'<div class="grupo grupo-asent">{emblema(emb)}<div><div class="g-kicker">Asentamiento</div>'
                                  f'<h3 class="g-tit">{esc(t)}</h3>{cuerpo}</div></div>')
        for nombre, foto in X.TRIPULACION.items():
            if nombre in t.split(',')[0]:
                return self.ancho(f'<div class="grupo grupo-crew"><div class="medallon">{img(foto)}</div><div>'
                                  f'<div class="g-kicker">Tripulación</div><h3 class="g-tit">{esc(t)}</h3>{cuerpo}</div></div>')
        protas = {'El Piloto': 'piloto.jpg', 'El Nativo': 'nativo.jpg', 'La Mente': 'mente.jpg'}
        if t in protas:
            return self.ancho(f'<div class="grupo grupo-crew grupo-prota"><div class="medallon">{img(protas[t], "50% 22%")}</div><div>'
                              f'<div class="g-kicker">Historia personal</div><h3 class="g-tit">{esc(t)}</h3>{cuerpo}</div></div>')
        if cap.get('maqueta') == 'dos' and self.parte == 'Apéndices':
            self.poner(f'<h3 class="g-caja">{esc(t)}</h3>{cuerpo}')
            return
        self.ancho(f'<div class="grupo grupo-simple"><h3 class="g-tit">{esc(t)}</h3>{cuerpo}</div>')

    def entrada(self, n, grupo):
        id_ = n['id']
        self.ultimo_id = id_
        if id_ in X.PROTAGONISTAS:
            self.remate()
            return self.ancho(protagonista_html(n))
        if self.region_pendiente and id_ in ('e200', 'e220', 'e240', 'e260', 'e280', 'e300', 'e320', 'e340'):
            self.region_pendiente = False
            self.ancho(f'<div class="tabla-region">{entrada_html(n, ["entrada-tabla"])}</div>')
            self.abrir_col('col2')
            return
        if self.region_pendiente:
            self.region_pendiente = False
            self.abrir_col('col2')
        extra = []
        if grupo == 'La Mente':
            extra.append('mente')
        if (self.capitulo or {}).get('maqueta') == 'finales':
            extra.append('final')
        h = entrada_html(n, extra)
        if 'mapa-col' in h and '<div class="tabla-env' in h:
            # si la tabla no cabe bajo el mapa y salta, el hueco que deja también se rellena
            k = len(self.remates)
            self.remates.append(getattr(self, 'arte_actual', None)); self.remates_parte.append(getattr(self, 'parte', ''))
            h = h.replace('<div class="tabla-env', f'@@REMATE{k}@@<div class="tabla-env', 1)
        primera = re.search(r'<tr>(.*?)</tr>', h, re.S)
        anchas = primera and primera.group(1).count('<th') >= 4
        if (('tabla-env larga' in h or anchas) and self.col == 'col2') or (id_ in X.ANCHAS and self.col in ('col2', 'col3')):
            if '@@REMATE' not in h and '<div class="tabla-env' in h:
                # a toda anchura, si la tabla no cabe y salta de página, el hueco que deja se rellena
                k = len(self.remates)
                self.remates.append(getattr(self, 'arte_actual', None)); self.remates_parte.append(getattr(self, 'parte', ''))
                tabla = h.find('<div class="tabla-env')
                previo = h.rfind('<p class="pre-tabla"', 0, tabla)
                pegado = previo >= 0 and not h[h.find('</p>', previo) + 4:tabla].strip()
                donde = previo if pegado else tabla
                antes = re.sub(r'<[^>]+>', '', h[h.find('<div class="texto">'):donde]).strip()
                if len(antes) > 250:     # solo si la tabla va tras texto de verdad; si no, salta la entrada entera
                    h = h[:donde] + f'@@REMATE{k}@@' + h[donde:]
                else:
                    self.remates.pop(); self.remates_parte.pop()
            self.ancho(h)      # las tablas largas no caben bien en media columna
        else:
            self.poner(h)
        if id_ in X.CAJAS:
            self.poner(caja_html(id_))
        if self.col == 'col2' and not self.oscuro_abierto_now() and not self.col_vacia:
            # si la entrada siguiente salta de columna o de página, el pie de esta columna se rellena
            self.poner(f'@@FINCOL{len(self.fincols)}@@')
            self.fincols.append((self.parte, getattr(self, 'cap_titulo', ''), id_))
        if id_ in X.CITAS_SUELTAS:
            self.ancho(cita_html(X.CITAS_SUELTAS[id_], 'cita-suelta'))
        if id_ in X.FIGURAS:
            arte, pos, pie = X.FIGURAS[id_]
            self.ancho(f'<figure class="figura-ancha">{img(arte, pos)}<figcaption>{esc(pie)}</figcaption></figure>')

    def indice_marcas(self, n):
        filas = []
        for ln in n.get('cuerpo', []):
            m = re.match(r'\|\s*`([^`]+)`\s*\|(.*)\|\s*$', ln)
            if m:
                refs = re.findall(r'\[([er]\d{3})\]', m.group(2))
                r = ' '.join(f'<a class="ref ref-{x[0]}" href="#{x}">{x}</a>' for x in refs)
                v = re.match(r'\s*\*\*(\d)\*\*', m.group(2))
                if v:
                    r = f'<span class="im-v">{v.group(1)}</span> ' + r
                filas.append(f'<p class="im"><span class="marca">{esc(m.group(1)).replace("_", "_<wbr>")}</span> {r}</p>')
        intro = [ln for ln in n.get('cuerpo', []) if ln.startswith('*')]
        self.cerrar_col()
        if intro:
            self.out.append(f'<p class="im-intro">{esc(intro[0].strip("*"))}</p>')
        self.abrir_col('col3 im-flujo')
        for f in filas:
            self.poner(f)


# --------------------------------------------------------------------------- hojas

def casillas(n, clase='c'):
    return ''.join(f'<span class="{clase}"></span>' for _ in range(n))


def escala(desde, hasta):
    return ''.join(f'<span class="n">{i}</span>' for i in range(desde, hasta + 1))


def hoja_protagonista(ancla):
    attrs = ''.join(f'<div class="h-attr"><div class="h-attr-n">{a}</div><div class="h-attr-v"></div></div>'
                    for a in ('Vigor', 'Reflejos', 'Ingenio', 'Voluntad'))
    heridas = ''.join(f'<div class="h-her"><span class="c"></span>{t}</div>'
                      for t in ('Rasguño', 'Herido −1', 'Grave −2', 'Crítico −2'))
    recursos = ''.join(f'<div class="h-rec">{icono(ic)}<b>{t}</b><div class="h-esc">{escala(0, m)}</div></div>'
                       for t, ic, m in (('Aire', 'canto', 6), ('Energía', 'hito', 6), ('Raciones', 'objeto', 8)))
    facc = ''.join(f'<div class="h-fac">{emblema(e)}<b>{t}</b><div class="h-esc rep">'
                   + ''.join(f'<span class="n">{v}</span>' for v in ('−3', '−2', '−1', '0', '+1', '+2', '+3')) + '</div></div>'
                   for t, e in (('Hijos del Pecio', 'hijos'), ('Desguaces', 'desguaces'), ('Coro', 'coro'), ('Vigías', 'vigias')))
    lineas = lambda k: ''.join('<div class="h-linea"></div>' for _ in range(k))
    reloj = ''.join(f'<span class="rl{" hito" if i in (50, 40, 30, 20, 10) else ""}">{i}</span>' for i in range(60, 0, -1))
    return f'''
<section class="hoja" id="{ancla}" data-titulo="Hoja de protagonista">
 <div class="bm-hojas" data-marca="Hojas de juego"></div>
 <div class="h-cab"><div class="h-tit" data-marca="Hoja de protagonista">Hoja de protagonista</div>
   <div class="h-protas"><span class="c"></span>Piloto <span class="c"></span>Nativo <span class="c"></span>Mente</div></div>
 <div class="h-fila2"><div class="h-campo"><label>Nombre</label></div><div class="h-campo"><label>Origen</label></div></div>
 <div class="h-attrs">{attrs}</div>
 <div class="h-dos">
  <div class="h-bloque"><div class="h-rot">{icono("herida")} Heridas / Daño</div>{heridas}
     <div class="h-rot">{icono("ayuda")} Temple</div><div class="h-temple">{casillas(3, "c gr")}<span class="c gr ext"></span></div>
     <div class="h-rot">{icono("canto")} Canto</div><div class="h-esc">{escala(0, 6)}</div></div>
  <div class="h-bloque">{recursos}<div class="h-rec">{icono("objeto")}<b>Chatarra</b><div class="h-caja"></div></div>
     <div class="h-rec">{icono("marca")}<b>Contador</b><div class="h-campo mini"></div><div class="h-esc">{escala(0, 6)}</div></div></div>
 </div>
 <div class="h-rot">{icono("tiempo")} Reloj de los Recolectores <span class="h-nota">tacha un número cada amanecer · los marcados son días de historia · Clemencia: 70</span></div>
 <div class="h-reloj">{reloj}</div>
 <div class="h-dos">
  <div class="h-bloque"><div class="h-rot">{icono("alerta")} Alerta</div><div class="h-esc">{escala(1, 4)}</div>
     <div class="h-rot">{icono("reputacion")} Reputación</div>{facc}</div>
  <div class="h-bloque"><div class="h-rot">{icono("combate")} Arma y protección</div>
     <div class="h-campo"><label>Arma (+ )</label></div><div class="h-campo"><label>Protección (Blindaje )</label></div>
     <div class="h-rot">{icono("ejemplo")} Implantes · Mutaciones · Protocolos</div>{lineas(2)}
     <div class="h-rot">{icono("consejo")} Habilidades</div>{lineas(2)}</div>
 </div>
 <div class="h-rot">{icono("tiempo")} Historia personal <span class="h-nota">marca cada evento de historia leído</span></div>
 <div class="h-dias">{''.join(f'<span><span class="c"></span>Día {d}</span>' for d in (50, 40, 30, 20, 10))}</div>
 <div class="h-rot">{icono("asentamiento")} Viejos conocidos <span class="h-nota">r156 · marca cada encuentro</span></div>
 <div class="h-dias">{''.join(f'<span>{t} {casillas(4)}</span>' for t in ('Peregrina', 'Perro de latón', 'Mirasoles'))}</div>
 <div class="h-cab h-cab2"><div class="h-tit" data-marca="Equipo y registro">Equipo y registro</div><div class="h-protas">Nombre: ____________________</div></div>
 <div class="h-dos h-pag2">
  <div class="h-bloque"><div class="h-rot">{icono("reliquia")} Reliquias <span class="h-nota">máx. 6 · aspecto → función</span></div>{lineas(6)}
     <div class="h-rot">{icono("objeto")} Equipo</div>{lineas(6)}
     <div class="h-rot">{icono("objeto")} Piezas <span class="h-nota">llevas 10 como máximo</span></div>
     <div class="h-piezas">{''.join(f'<div><b>{t}</b><span class="h-caja"></span></div>' for t in ('Cobre', 'Hueso', 'Cristal', 'Luz fría'))}</div>
     <div class="h-rot">{icono("ayuda")} Notas</div>{lineas(12)}</div>
  <div class="h-bloque"><div class="h-rot">{icono("pista")} Pistas <span class="h-nota">máx. 5 · región · nombre · eXXX</span></div>{lineas(5)}
     <div class="h-rot">{icono("marca")} Marcas</div>{lineas(22)}
     <div class="h-rot">{icono("hito")} Fragmentos <span class="h-nota">al tercero → e840</span></div><div class="h-temple">{casillas(3, "c gr")}</div></div>
 </div>
</section>'''


def hoja_nave(ancla):
    sist = ''.join(
        f'<tr><td class="hs-n">{t}</td><td class="hs-reg"></td><td>{"".join(f"<span class=c></span>{e} " for e in ("perdido", "llevado", "instalado"))}</td>'
        f'<td class="hs-cal"><span class="c"></span>P <span class="c"></span>S <span class="c"></span>E</td></tr>'
        for t in ('Casco', 'Motor <small>(pesado)</small>', 'Navegación', 'Soporte vital', 'Combustible <small>(pesado)</small>', 'Personal: ________'))
    crew = ''.join(
        f'<tr><td class="hs-cr"><img src="arte/crew-{f}.jpg" alt=""/>{t}</td><td class="hs-reg"></td>'
        f'<td><span class="c"></span>perdido <span class="c"></span>contigo <span class="c"></span>Cicatriz</td>'
        f'<td class="hs-lea">0 1 2 3</td><td>{casillas(2)}</td></tr>'
        for t, f in (('Iria', 'iria'), ('Bruno', 'bruno'), ('Amara', 'amara'), ('Noemí', 'noemi'), ('Tadeo', 'tadeo'), ('Lio', 'lio')))
    lineas = lambda k: ''.join('<div class="h-linea"></div>' for _ in range(k))
    return f'''
<section class="hoja hoja-nave" id="{ancla}" data-titulo="Hoja de la nave">
 <div class="h-cab"><div class="h-tit" data-marca="Hoja de la nave">Hoja de la nave</div>{icono("nave", "h-ico-nave")}</div>
 <div class="h-campo grande"><label>Nombre de la nave</label></div>
 <div class="h-rot">{icono("objeto")} Sistemas</div>
 <table class="hs"><tr><th>Sistema</th><th>Pecio (región)</th><th>Estado</th><th>Calidad</th></tr>{sist}</table>
 <div class="h-rot">{icono("asentamiento")} Tripulación</div>
 <table class="hs"><tr><th>Tripulante</th><th>Región</th><th>Estado</th><th>Lealtad</th><th>Her.</th></tr>{crew}</table>
 <div class="h-dos">
  <div class="h-bloque"><div class="h-rot">{icono("ayuda")} Pasajeros</div>{lineas(2)}
    <div class="h-rec"><b>Plazas</b> 6 <span class="h-nota">(+2 si haces sitio · +2/+3 módulo de pasaje)</span></div>
    <div class="h-rec h-danos"><b>Daños de nave</b> <span class="h-danos-circulos">{casillas(5, "c gr")}</span></div></div>
  <div class="h-bloque"><div class="h-rot">{icono("reliquia")} Guardado en la Cicatriz</div>{lineas(2)}
    <div class="h-rec h-despensa"><b>Despensa</b> <span class="h-nota">empieza en 8 Raciones (r182)</span><div class="h-caja"></div></div></div>
 </div>
 <div class="h-dos">
  <div class="h-bloque"><div class="h-rot">{icono("ejemplo")} Planos conocidos</div>{lineas(2)}</div>
  <div class="h-bloque"><div class="h-rot">{icono("asentamiento")} Grandes obras <span class="h-nota">fases I · II · III</span></div>
    {''.join(f'<div class="h-obra"><div class="h-campo mini"></div>{casillas(3, "c gr")}</div>' for _ in range(2))}</div>
 </div>
 <div class="h-secreto"><div class="h-sec-txt"><b>El Secreto.</b> Una raya por cada FRAGMENTO_ en la verdad a la que apunta (índice de Marcas).
  En e840, rodea la que más tenga: es tu Secreto.</div>
  <div class="h-sec-cuenta">{''.join(f'<div><span>{i}</span></div>' for i in range(1, 7))}</div></div>
</section>'''


def pagina_diario(k):
    bloque = ('<div class="dia-bloque"><div class="dia-cab"><span>Día</span><span>Reloj</span><span>Región</span>'
              '<span>Canto</span></div>' + ''.join('<div class="h-linea"></div>' for _ in range(6)) + '</div>')
    return (f'<section class="hoja diario" data-titulo="Diario de a bordo"><div class="h-cab"><div class="h-tit">Diario de a bordo</div>'
            f'<div class="h-protas">Hoja <span class="h-num-hoja"></span></div></div>{bloque * 4}</section>')


def contratapa():
    datos = [('tiempo', '60 días'), ('nave', '6 sistemas'), ('mapa', '8 regiones'), ('ejemplo', '350 eventos'), ('fin', '12 finales')]
    fila = ''.join(f'<div class="ct-dato">{icono(i)}<span>{esc(t)}</span></div>' for i, t in datos)
    return f'''
<section class="contratapa">
  {img('contratapa.jpg', '50% 30%', 'portada-img')}
  <div class="ct-velo"></div>
  <div class="ct-texto">
    <div class="ct-titulo">Caribdis</div>
    <p class="ct-gancho">Tu nave cayó. El planeta canta. Algo viene.</p>
    <p>Un planeta viejo bajo un sol que se apaga atrae naves con una señal que nadie sabe quién emite. La tuya acaba de
    estrellarse. Tienes sesenta días para encontrar las piezas, reunir a lo que queda de tu tripulación y volver a despegar
    antes de que lleguen las seis luces del cielo.</p>
    <p>Juega como el <b>Piloto</b>, un humano lleno de implantes que no quiere dejar a nadie atrás; como el <b>Nativo</b>, un mutante
    que nunca ha visto otro cielo; o como <b>la Mente</b>, la inteligencia de la nave atrapada en una esfera de reparación.</p>
    <div class="ct-datos">{fila}</div>
    <p class="ct-pie">Un juego de rol en solitario · Necesitas tres dados de seis caras, un lápiz y este libro</p>
  </div>
  <img class="ct-sello" src="arte/marca/utopia-logo-claro.png" alt="UtopIA"/>
</section>'''


def pagina_mapa():
    return (f'<section class="pagina-mapa" id="mapa" data-titulo="Mapa de Caribdis"><div class="pm-tit" data-marca="Mapa de Caribdis">Caribdis</div>'
            f'<div class="pm-sub">Las ocho regiones y sus sendas · toca una región para ir a su tabla de encuentros</div>'
            f'{svg_mapa("mapa mapa-grande")}'
            f'<div class="pm-pie">Viajar te lleva a una región vecina (r151). La Cicatriz está en las Dunas de Óxido.</div></section>')


# --------------------------------------------------------------------------- salida

PX_MM = 25.4 / 96
DEPURA = False
ZOOM_A4 = 210 / 170
PAGINAS = 200


def medir_huecos(documento):
    """Para cada marca de remate, el espacio libre (mm) que queda debajo en su página, si no hay nada más."""
    from weasyprint.formatting_structure import boxes as B
    huecos = {}
    for pagina in documento.pages:
        caja = pagina._page_box
        fondo = caja.content_box_y() + caja.height
        raiz = caja.children[0] if caja.children else None
        if raiz is None:
            continue
        marcas, contenido = [], []
        for b in raiz.descendants():
            el = getattr(b, 'element', None)
            ident = el.get('id', '') if el is not None else ''
            if ident.startswith('remate-') and isinstance(b, B.BlockBox):
                if (b.position_y - caja.content_box_y()) * PX_MM > 6:   # arriba del todo: no hay hueco que tapar
                    marcas.append((int(ident[7:]), b.position_y))
            elif isinstance(b, (B.LineBox, B.ReplacedBox)) or (isinstance(b, B.BlockBox) and b.height and
                                                                 b.style['background_color'][3] > 0):
                contenido.append(b.position_y)
        libres = [(y, k) for k, y in marcas if not any(c > y + 1 for c in contenido)]
        if libres:                      # varias marcas seguidas: solo la última
            y, k = max(libres)
            huecos[k] = (fondo - y) * PX_MM
    return huecos


def medir_fincols(documento):
    """Para cada marca de pie de columna (tras una entrada o al final de un flujo a dos columnas):
    el hueco (mm) que queda debajo en su columna si no hay nada más en ella."""
    from weasyprint.formatting_structure import boxes as B
    huecos = {}
    for pagina in documento.pages:
        for flujo in pagina._page_box.descendants():
            el = getattr(flujo, 'element', None)
            if not isinstance(flujo, B.BlockBox) or el is None or 'flujo' not in (el.get('class') or '') \
                    or getattr(flujo, 'is_column', False):
                continue
            cols = [c for c in flujo.children if getattr(c, 'is_column', False)]
            if not cols or (len(cols) < 2 and 'col2' not in (el.get('class') or '')):
                continue
            fondo = max(c.position_y + c.height for c in cols)
            for i, c in enumerate(cols):
                marcas, contenido = [], []
                for b in c.descendants():
                    e = getattr(b, 'element', None)
                    ident = (e.get('id') or '') if e is not None else ''
                    if ident.startswith('fincol-') and isinstance(b, B.BlockBox):
                        marcas.append((b.position_y, int(ident[7:])))
                    elif isinstance(b, (B.LineBox, B.ReplacedBox)) or (isinstance(b, B.BlockBox) and b.height and
                                                                         b.style['background_color'][3] > 0):
                        contenido.append(b.position_y + b.height)
                libres = [(y, k) for y, k in marcas if not any(t > y + 1 for t in contenido)]
                if not libres:
                    continue
                y, k = max(libres)
                resto = cols[i + 1:]
                vacias = len(cols) == 1 or resto and not any(
                    isinstance(d, (B.LineBox, B.ReplacedBox)) for r in resto for d in r.descendants())
                if vacias:          # la columna siguiente se quedó vacía: el hueco es la columna entera
                    huecos[k] = ((fondo - cols[0].position_y) * PX_MM, 'vacia')
                else:
                    huecos[k] = ((fondo - y) * PX_MM, 'corta')
    return huecos


def desbordados(documento):
    """Rellenos que han acabado al principio de una página o de una columna: ya no tapan ningún hueco."""
    from weasyprint.formatting_structure import boxes as B
    malos = set()
    for pagina in documento.pages:
        caja = pagina._page_box
        tope = caja.content_box_y()
        visto_texto = False
        raices = [h for h in caja.children if not isinstance(h, B.MarginBox)]
        for b in (d for r in raices for d in r.descendants()):
            el = getattr(b, 'element', None)
            ident = (el.get('id') or '') if el is not None else ''
            if ident.startswith('rm-') and isinstance(b, (B.BlockBox, B.FlexBox)) and \
                    ((b.position_y - tope) * PX_MM < 4 or not visto_texto):
                malos.add(ident)
            if isinstance(b, (B.LineBox, B.ReplacedBox)) and not (ident.startswith('rm-')):
                anc = b
                visto_texto = True
            if getattr(b, 'is_column', False):
                hijos = [h for h in b.descendants() if isinstance(h, (B.LineBox, B.ReplacedBox)) or
                         (getattr(h, 'element', None) is not None and (h.element.get('id') or '').startswith('rc-'))]
                if hijos and not isinstance(hijos[0], (B.LineBox, B.ReplacedBox)) \
                        and 'vacia' not in (hijos[0].element.get('class') or ''):
                    malos.add(hijos[0].element.get('id'))
    return malos


RE_BLOQUE = re.compile(r'<(p|li|section|blockquote)(?=[\s>])|<(?:div|aside) (?=class="(?:caja|tabla-env|enemigo|cita-suelta|figura-ancha|mapa-col)[\s"])')


def marcar_bloques(html_):
    """Etiqueta (data-b) los bloques que pueden empezar una columna con una clave estable:
    la entrada en la que están y su posición contando desde el final de la entrada."""
    RE_SEC = re.compile(r'<section class="entrada[^"]*" id="([^"]+)"')
    secs = [(m.start(), m.group(1)) for m in RE_SEC.finditer(html_)]
    marcas = list(RE_BLOQUE.finditer(html_))
    import bisect
    starts = [x for x, _ in secs]
    grupo = [-2 if m.group(1) == 'section' else bisect.bisect_right(starts, m.start()) - 1 for m in marcas]
    total = {}
    for g in grupo:
        total[g] = total.get(g, 0) + 1
    visto, trozos, ult = {}, [], 0
    for m, g in zip(marcas, grupo):
        visto[g] = visto.get(g, 0) + 1
        if g == -2:
            clave = RE_SEC.match(html_, m.start()).group(1) + '~S' if RE_SEC.match(html_, m.start()) else f'sec~{visto[g]}'
        else:
            clave = f'{secs[g][1] if g >= 0 else "inicio"}~{total[g] - visto[g]}'
        trozos.append(html_[ult:m.end()])
        trozos.append((' ' if m.group(1) else '') + f'data-b="{clave}"' + ('' if m.group(1) else ' '))
        ult = m.end()
    trozos.append(html_[ult:])
    return ''.join(trozos)


def fijar_cortes(documento):
    """Para cada último tramo de un flujo a dos columnas: el bloque que abre la 2.ª columna,
    para fijar ahí el corte (así lo que se añada a una columna no desplaza la otra)."""
    from weasyprint.formatting_structure import boxes as B
    contenedores = []
    for pi, pagina in enumerate(documento.pages):
        for b in pagina._page_box.descendants():
            if any(getattr(h, 'is_column', False) for h in getattr(b, 'children', [])):
                contenedores.append((pi, b))
    cortes, sin = [], 0
    for n, (pi, cont) in enumerate(contenedores):
        if any(c.element is cont.element for _, c in contenedores[n + 1:]):
            continue
        cols = sorted([h for h in cont.children if getattr(h, 'is_column', False)], key=lambda c: c.position_x)
        if len(cols) != 2:
            continue
        en1 = {getattr(h, 'element', None) for h in cols[0].descendants()}
        for h in cols[1].descendants():
            el = getattr(h, 'element', None)
            if el is None or not isinstance(h, B.BlockLevelBox) or not el.get('data-b'):
                continue
            if el in en1:
                sin += 1          # la 2.ª columna empieza con un bloque partido: no se puede fijar
                break
            if el.tag in ('p', 'li', 'section', 'blockquote'):
                cortes.append(el.get('data-b'))
            else:
                sin += 1          # recuadros y tablas: WeasyPrint los estira si se fuerza el corte delante
            break
    return cortes, sin


def equilibrar(documento, minimo=3.0):
    """Busca, en cada final de flujo a dos columnas, el bloque ante el que conviene cortar la columna
    para que las dos terminen a la misma altura. Devuelve {data-b: mejora en mm}."""
    from weasyprint.formatting_structure import boxes as B
    PEGA = ('cab', 'meta', 'pre-tabla', 'cap-cab', 'grupo', 'region-cab', 'bt-cab')

    def clases(b):
        el = getattr(b, 'element', None)
        return ((el.get('class') or '').split() if el is not None else []), (el.tag if el is not None else '')

    def fondo(c):
        m = None
        for h in c.descendants():
            if isinstance(h, (B.LineBox, B.ReplacedBox)) or (isinstance(h, B.BlockBox) and h.height and
                                                            h.style['background_color'][3] > 0):
                y = h.position_y + h.margin_height()
                m = y if m is None else max(m, y)
        return m

    def candidatos(caja, vistos, out):
        hijos = list(caja.children) if hasattr(caja, 'children') else []
        for i, h in enumerate(hijos):
            if not isinstance(h, B.BlockLevelBox):
                continue
            el = getattr(h, 'element', None)
            b = el.get('data-b') if el is not None else None
            cl, tag = clases(h)
            previo = hijos[i - 1] if i else None
            pcl, ptag = clases(previo) if previo is not None else ([], '')
            pegado = previo is not None and (any(c in PEGA for c in pcl) or ptag in ('h2', 'h3', 'h4', 'header'))
            if b and i > 0 and not pegado and b not in vistos and not isinstance(h, B.TableBox):
                out.append((h.position_y, b))
            if b:
                vistos.add(b)
            if h.style['break_inside'] in ('avoid', 'avoid-column') or isinstance(h, (B.TableBox)):
                continue
            candidatos(h, vistos, out)

    contenedores = []
    for pi, pagina in enumerate(documento.pages):
        for b in pagina._page_box.descendants():
            if any(getattr(h, 'is_column', False) for h in getattr(b, 'children', [])):
                contenedores.append((pi, b))
    cortes = {}
    for n, (pi, cont) in enumerate(contenedores):
        if any(c.element is cont.element for _, c in contenedores[n + 1:]):
            continue                      # el flujo sigue en otra página: no es su último tramo
        cols = sorted([h for h in cont.children if getattr(h, 'is_column', False)], key=lambda c: c.position_x)
        if len(cols) != 2:
            continue
        tope = cols[0].position_y
        f1, f2 = fondo(cols[0]), fondo(cols[1])
        if f1 is None or f2 is None:
            continue
        L1, L2 = f1 - tope, f2 - tope
        if abs(L1 - L2) * PX_MM <= minimo:
            continue
        vistos, c1, c2 = set(), [], []
        candidatos(cols[0], vistos, c1)
        candidatos(cols[1], vistos, c2)
        # el primer bloque de la 2.ª columna no se puede elegir (ya empieza ahí)
        opciones = [(y - tope, b) for y, b in c1 if y - tope > 8 / PX_MM] + \
                   [(L1 + y - tope, b) for y, b in c2 if y - tope > 1]
        T = L1 + L2
        actual = max(L1, L2)
        mejor = min(opciones, key=lambda o: max(o[0], T - o[0]), default=None)
        if DEPURA:
            print('EQ', pi + 1, round(L1 * PX_MM, 1), round(L2 * PX_MM, 1), len(c1), len(c2), [(round(o[0] * PX_MM), o[1]) for o in opciones][:12])
        if mejor and (actual - max(mejor[0], T - mejor[0])) * PX_MM > 2.5:
            cortes[mejor[1]] = round((actual - max(mejor[0], T - mejor[0])) * PX_MM, 1)
    return cortes


class Rellenos:
    """Elige qué poner en cada hueco: viñeta (casi siempre sola), alguna cita suelta o nada."""
    CADA_CITA = 12
    def __init__(self, contexto, partes=None):
        self.contexto = contexto
        self.partes = partes or []
        self.i_panel = 3
        self.ultimo = None
        self.i_cita = 0
        self.i_arte = 0
        self.i_corta = 7
        self.n_arte = self.n_cita = 0
        self.k_cita = -99

    def cita(self):
        c = X.REMATES[self.i_cita % len(X.REMATES)]
        self.i_cita += 1
        return c

    def html(self, k, mm):
        """Los huecos pequeños se quedan con aire. Las citas de cierre son pocas y espaciadas
        (como mucho una cada CADA_CITA finales de sección); las viñetas van casi siempre solas."""
        if os.environ.get('DEPURA_RELLENOS'):
            print('RELL', k, self.partes[k] if k < len(self.partes) else '', self.contexto[k], round(mm, 1), self.k_cita, self.i_arte, self.i_cita)
        if mm < 42:
            return ''
        cita_ok = k - self.k_cita >= self.CADA_CITA
        alto = mm - 6
        if mm < 80:
            if 'Reglas' in str(self.partes[k] if k < len(self.partes) else '') and not cita_ok:
                return self.tarjetas(alto)      # en las reglas, una franja de consulta rápida
            if not cita_ok:
                return ''
            self.k_cita = k
            if self.contexto[k] == 'antiguos-apogeo.jpg':
                # «Lo que se sabe de Caribdis» se amplió y su cita bajó al final del capítulo:
                # cuenta donde estaba antes (tras el Registro), para no mover las citas del resto del libro
                self.k_cita = k - 2
            self.n_cita += 1
            texto, autor = self.cita()
            q = (f'<blockquote class="remate-cita"><div class="rc-orn">{icono("rombo")}</div>'
                 f'<p>{esc(texto)}</p><cite>{esc(autor)}</cite></blockquote>')
            return f'<div class="remate solo-cita" style="height:{alto:.1f}mm">{q}</div>'
        evitar = {self.contexto[k], self.ultimo, *self.contexto[k + 1:k + 3]}
        while True:
            arte, pos = X.ARTE_REMATE[self.i_arte % len(X.ARTE_REMATE)]
            self.i_arte += 1
            if arte not in evitar:
                break
        self.ultimo = arte
        self.n_arte += 1
        if cita_ok and mm >= 110:
            self.k_cita = k
            self.n_cita += 1
            texto, autor = self.cita()
            q = (f'<blockquote class="remate-cita"><div class="rc-orn">{icono("rombo")}</div>'
                 f'<p>{esc(texto)}</p><cite>{esc(autor)}</cite></blockquote>')
            return (f'<div class="remate con-arte" style="height:{alto:.1f}mm">'
                    f'<div class="rm-img" style="height:{alto - 34:.1f}mm">{img(arte, pos)}</div>{q}</div>')
        return (f'<div class="remate con-arte solo-arte" style="height:{alto:.1f}mm">'
                f'<div class="rm-img" style="height:{alto - 2:.1f}mm">{img(arte, pos)}</div></div>')


def _tarjetas(self, alto):
    """Dos paneles de consulta rápida, uno por columna, que caben en el hueco."""
    elegidos, usados = [], getattr(self, 'paneles_usados', set())
    self.paneles_usados = usados
    for n in range(len(X.PANELES)):
        if len(elegidos) == 2:
            break
        ico, tit, filas, pie = X.PANELES[n]
        if tit in usados:
            continue
        if 11 + 5.1 * len(filas) + 3.6 * (len(pie) // 52 + 1) + 6 <= alto:
            f = ''.join(f'<tr><th>{esc(a)}</th><td>{esc(b)}</td></tr>' for a, b in filas)
            elegidos.append((tit, f'<aside class="panel"><div class="ar-cab">{icono(ico)}<span>{esc(tit)}</span></div>'
                            f'<table>{f}</table><p class="pn-pie">{pulir(render(pie))[3:-5]}</p></aside>'))
    if len(elegidos) < 2:
        return ''
    usados.update(t for t, _ in elegidos)
    self.n_panel = getattr(self, 'n_panel', 0) + 1
    return f'<div class="remate tarjetas">{"".join(h for _, h in elegidos)}</div>'


Rellenos.tarjetas = _tarjetas


class Recordatorios:
    """Rellena el pie de una columna corta. Varía según el sitio: ornamento, cita, panel de consulta,
    recordatorio (solo en las reglas) o viñeta con cita."""
    def __init__(self, contexto):
        self.contexto = contexto
        self.i_cita = 11
        self.i_panel = 0
        self.i_tira = 0
        self.i_rec = 0
        self.i_arte = 5
        self.turno = 0
        self.n = 0
        self.tipos = {}

    def _cita(self, larga=False):
        lista = [c for c in X.REMATES if len(c[0]) < (110 if larga else 75)]
        texto, autor = lista[self.i_cita % len(lista)]
        self.i_cita += 1
        return (f'<blockquote class="remate-cita cita-col"><div class="rc-orn">{icono("rombo")}</div>'
                f'<p>{esc(texto)}</p><cite>{esc(autor)}</cite></blockquote>')

    def _panel(self, alto):
        for _ in range(len(X.PANELES)):
            ico, tit, filas, pie = X.PANELES[self.i_panel % len(X.PANELES)]
            self.i_panel += 1
            necesita = 9 + 4.6 * len(filas) + 4.6 * (len(pie) // 48 + 1) + 4
            if necesita <= alto:
                f = ''.join(f'<tr><th>{esc(a)}</th><td>{esc(b)}</td></tr>' for a, b in filas)
                return (f'<aside class="panel"><div class="ar-cab">{icono(ico)}<span>{esc(tit)}</span></div>'
                        f'<table>{f}</table><p class="pn-pie">{pulir(render(pie))[3:-5]}</p></aside>')
        return ''

    def _recuerda(self, alto):
        for _ in range(len(X.RECORDATORIOS)):
            titulo, texto = X.RECORDATORIOS[self.i_rec % len(X.RECORDATORIOS)]
            self.i_rec += 1
            if 9.5 + 4.1 * (len(texto) // 44 + 1) <= alto:
                return (f'<aside class="recuerda-mini"><div class="caja-cab">{icono("recuerda")}<span>{esc(titulo)}</span></div>'
                        f'{pulir(render(texto))}</aside>')
        return ''

    def html(self, k, mm, tipo):
        parte, cap = self.contexto[k][:2]
        alto = mm - (3.5 if tipo == 'corta' else 2)
        if alto < 11:
            return ''
        clase, cuerpo, t = 'pie', '', ''
        # sin ornamentos ni citas en las columnas: solo paneles de consulta, recordatorios (reglas) o una viñeta
        if (36 <= alto < 62) or (tipo == 'vacia' and alto < 62) or (parte == 'Reglas' and 18 <= alto < 62):
            self.turno += 1
            opciones = ['panel', 'recuerda'] if parte == 'Reglas' else ['panel']
            t = opciones[self.turno % len(opciones)]
            cuerpo = self._panel(alto) if t == 'panel' else self._recuerda(alto)
            if not cuerpo and t == 'recuerda':
                cuerpo, t = self._panel(alto), 'panel'
            if not cuerpo and t == 'panel' and parte == 'Reglas':
                cuerpo, t = self._recuerda(alto), 'recuerda'
        elif 17 <= alto < 36:
            ico, tit, linea = X.TIRAS[self.i_tira % len(X.TIRAS)]
            if 7.5 + 4.3 * (len(linea) // 46 + 1) <= alto:
                self.i_tira += 1
                cuerpo = (f'<aside class="panel tira"><div class="ar-cab">{icono(ico)}<span>{esc(tit)}</span></div>'
                          f'<p class="pn-pie">{pulir(render(linea))[3:-5]}</p></aside>')
                t = 'tira'
        elif alto >= 62:
            nombre, pos = X.ARTE_REMATE[self.i_arte % len(X.ARTE_REMATE)]
            self.i_arte += 7
            cuerpo = f'<div class="rc-img" style="height:{alto - 4:.1f}mm">{img(nombre, pos)}</div>'
            t = 'viñeta'
        if not cuerpo:
            return ''
        if tipo == 'vacia':
            clase += ' vacia'
        self.n += 1
        self.tipos[t] = self.tipos.get(t, 0) + 1
        return f'<div class="relleno-col {clase}" style="height:{alto:.1f}mm">{cuerpo}</div>'


def asegurar_fuentes():
    """Registra las fuentes en fontconfig (para el SVG del mapa) si aún no lo están."""
    destino = os.path.expanduser('~/.local/share/fonts/caribdis')
    if not os.path.isdir(destino):
        os.makedirs(destino, exist_ok=True)
        for f in glob.glob(os.path.join(RAIZ, 'fuentes', '*.ttf')):
            shutil.copy(f, destino)
        subprocess.run(['fc-cache', '-f', destino], check=False, capture_output=True)


def main():
    imprenta = '--imprenta' in sys.argv
    asegurar_fuentes()
    nodos = leer()
    libro = Libro(nodos)
    cuerpo = libro.componer()
    # un párrafo que presenta una lista («…elige una:») no se queda solo al pie de columna o de página
    cuerpo = re.sub(r'<p>((?:(?!</p>).){1,240}?:(?:</strong>|</em>|</b>)*)</p>(\s*<(?:ol|ul)[\s>])', r'<p class="pre-lista">\1</p>\2', cuerpo, flags=re.S)
    css_extra = ''
    if imprenta:
        css_extra = '<style>@page { bleed: 2.43mm; marks: crop cross; }</style>'   # 3 mm tras el zoom
    doc = (f'<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/><title>Caribdis</title>'
           f'<meta name="author" content="Caribdis"/><meta name="description" content="Juego de rol en solitario"/>'
           f'<link rel="stylesheet" href="estilo.css"/>{css_extra}</head><body>{cuerpo}</body></html>')
    if '--html' in sys.argv:
        open(os.path.join(RAIZ, 'maqueta', 'manual.html'), 'w', encoding='utf-8').write(doc)
    from weasyprint import HTML
    salida = os.path.join(RAIZ, 'Caribdis-imprenta.pdf' if imprenta else 'Caribdis.pdf')
    # 1.ª pasada: medir el hueco que deja cada final de sección
    marcas = lambda d, f: re.sub(r'@@REMATE(\d+)@@', f, d)
    prueba = marcas(doc, lambda m: f'<div class="remate-marca" id="remate-{m.group(1)}"></div>').replace('@@DIARIO@@', '')
    prueba = re.sub(r'@@FINCOL(\d+)@@', lambda m: f'<div class="fincol-marca" id="fincol-{m.group(1)}"></div>', prueba)
    # 0.ª pasada: fijar dónde empieza cada 2.ª columna de los finales de flujo (maqueta/cortes.json)
    doc = marcar_bloques(doc)
    prueba = marcar_bloques(prueba)
    f_cortes = os.path.join(RAIZ, 'maqueta', 'cortes.json')
    if '--fijar-cortes' in sys.argv or not os.path.exists(f_cortes):
        cortes, sin = fijar_cortes(HTML(string=prueba, base_url=RAIZ).render())
        json.dump(cortes, open(f_cortes, 'w'), indent=0)
        print(f'Cortes de columna fijados: {len(cortes)} (sin fijar, por bloque partido: {sin})')
    cortes = set(json.load(open(f_cortes)))
    con_corte = lambda d: re.sub(r'data-b="([^"]+)"', lambda m: m.group(0) + (' data-corte=""' if m.group(1) in cortes else ''), d)
    doc, prueba = con_corte(doc), con_corte(prueba)
    documento = HTML(string=prueba, base_url=RAIZ).render()
    huecos = medir_huecos(documento)
    fincols = medir_fincols(documento)
    if os.environ.get('DEPURA_FINCOL'):
        json.dump(huecos, open('/tmp/claude-0/huecos.json', 'w'))
        json.dump({k: [v, libro.fincols[k] if k < len(libro.fincols) else None] for k, v in fincols.items()},
                  open('/tmp/claude-0/fincols.json', 'w'), default=str)
    # 2.ª pasada: rellenar los huecos con viñetas y citas
    rellenos = Rellenos(libro.remates, libro.remates_parte)
    def con_id(html_, ident):
        return re.sub(r'^<div class="', f'<div id="{ident}" class="', html_, count=1) if html_ else ''
    piezas = {}
    for m in re.finditer(r'@@REMATE(\d+)@@', doc):
        k = int(m.group(1))
        piezas[f'rm-{k}'] = con_id(rellenos.html(k, huecos.get(k, 0)), f'rm-{k}')
    recs = Recordatorios(libro.fincols)
    for m in re.finditer(r'@@FINCOL(\d+)@@', doc):
        k = int(m.group(1))
        piezas[f'rc-{k}'] = con_id(recs.html(k, *fincols.get(k, (0, 'corta'))), f'rc-{k}')
    print(f'Remates: {rellenos.n_arte} viñetas, {rellenos.n_cita} citas, {getattr(rellenos, "n_panel", 0)} franjas de consulta · pies de columna: {recs.tipos}')

    def montar():
        f = re.sub(r'@@REMATE(\d+)@@', lambda m: '<div class="remate-marca"></div>' + piezas[f'rm-{m.group(1)}'], doc)
        return re.sub(r'@@FINCOL(\d+)@@', lambda m: piezas[f'rc-{m.group(1)}'], f)
    # 3.ª pasada (y siguientes): un relleno que se ha ido arriba de la página o de la columna siguiente sobra
    for vuelta in range(4):
        final = montar()
        render_ = HTML(string=final.replace('@@DIARIO@@', ''), base_url=RAIZ).render()
        sobran = desbordados(render_)
        n = len(render_.pages)
        if not sobran:
            break
        print(f'  vuelta {vuelta + 1}: se quitan {len(sobran)} rellenos desplazados: {" ".join(sorted(sobran))}')
        for ident in sobran:
            piezas[ident] = ''
    faltan = PAGINAS - n
    if faltan < 0:
        print(f'AVISO: el libro tiene {n} páginas, {-faltan} más de las {PAGINAS} previstas')
    final = final.replace('@@DIARIO@@', ''.join(pagina_diario(k + 1) for k in range(max(faltan, 0))))
    print(f'Páginas sin diario: {n} · hojas de diario: {max(faltan, 0)}')
    if '--html' in sys.argv:
        open(os.path.join(RAIZ, 'maqueta', 'manual.html'), 'w', encoding='utf-8').write(final)
    # El libro se compone a 170 × 240,4 mm y se amplía a A4 (210 × 297 mm) en la salida.
    from colores import colorear
    final = colorear(final, open(os.path.join(RAIZ, 'estilo.css'), encoding='utf-8').read())
    HTML(string=final, base_url=RAIZ).write_pdf(salida, zoom=ZOOM_A4)
    print('PDF:', salida)


if __name__ == '__main__':
    main()
