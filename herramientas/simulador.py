#!/usr/bin/env python3
"""Simulador de Caribdis: juega miles de partidas con un jugador automático.

Lee los eventos del libro (libro/*.md) y resuelve sus opciones con un intérprete
aproximado: pruebas `[Atributo · N]`, Heridas, Chatarra, Canto, Alerta, Reloj,
combates, saltos → eXXX y calidades de sistema. El motor del día (r130–r213) está
programado a mano. No es el libro entero (las Marcas casi no se siguen), pero mide
el ritmo, la economía y la mortalidad del sistema.

Uso:
    python3 herramientas/simulador.py                 # 3000 partidas por protagonista
    python3 herramientas/simulador.py -n 500 --prota piloto --semilla 7
    python3 herramientas/simulador.py --traza         # narra una partida día a día
"""
import argparse, glob, os, random, re, statistics as st
from collections import Counter, defaultdict

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ATTRS = ('Vigor', 'Reflejos', 'Ingenio', 'Voluntad')
SISTEMAS = ('Casco', 'Motor', 'Navegación', 'Soporte vital', 'Combustible')
CAL = {'Precaria': 11, 'Sólida': 9, 'Excelente': 7}
ORDEN_CAL = ['Precaria', 'Sólida', 'Excelente']
VECINAS = {1: (2, 3, 4), 2: (1, 3, 6), 3: (1, 2, 8), 4: (1, 5, 7),
           5: (4, 6, 7), 6: (2, 5, 8), 7: (4, 5, 8), 8: (3, 6, 7)}
NOMBRE_REG = {1: 'Dunas', 2: 'Cementerio', 3: 'Salinas', 4: 'Cañones', 5: 'Bosque',
              6: 'Ciudad', 7: 'Torres', 8: 'Polo'}
TABLA = {1: 'e200', 2: 'e220', 3: 'e240', 4: 'e300', 5: 'e260', 6: 'e320', 7: 'e340', 8: 'e280'}
PIEZA_REG = {1: 'Hueso', 2: 'Cobre', 3: 'Cristal', 4: 'Cobre', 5: 'Cristal', 6: 'Luz', 7: 'Luz', 8: 'Cristal'}
RESCATE = {'Casco': 'e560', 'Motor': 'e562', 'Navegación': 'e564', 'Soporte vital': 'e566', 'Combustible': 'e568'}
SYS_DE_EVENTO = {'e560': 'Casco', 'e561': 'Casco', 'e562': 'Motor', 'e563': 'Motor', 'e564': 'Navegación',
                 'e565': 'Navegación', 'e566': 'Soporte vital', 'e567': 'Soporte vital',
                 'e568': 'Combustible', 'e569': 'Combustible', 'e404': 'Casco', 'e414': 'Motor',
                 'e416': 'Soporte vital', 'e242': 'Combustible', 'e405': 'Combustible', 'e261': 'Soporte vital',
                 'e329': 'Casco', 'e613': 'Navegación', 'e426': 'Navegación', 'e432': 'Motor'}
TRIPU = ['Iria', 'Bruno', 'Amara', 'Noemí', 'Tadeo', 'Lio']


def dist(a, b):
    vistos, frontera, d = {a}, [a], 0
    while frontera:
        if b in frontera:
            return d
        d += 1
        nueva = []
        for x in frontera:
            for v in VECINAS[x]:
                if v not in vistos:
                    vistos.add(v); nueva.append(v)
        frontera = nueva
    return 99


def paso_hacia(a, b):
    return min(VECINAS[a], key=lambda v: (dist(v, b), v))


# ---------------------------------------------------------------- lectura del libro
def leer_eventos():
    texto = ''
    for f in sorted(glob.glob(os.path.join(RAIZ, 'libro', '*.md'))):
        texto += open(f, encoding='utf-8').read() + '\n'
    partes = re.split(r'<a id="(e\d{3})"></a>', texto)
    ev = {}
    for i in range(1, len(partes), 2):
        cuerpo = partes[i + 1]
        if partes[i] not in ev or len(cuerpo.strip()) > len(ev[partes[i]].strip()):
            ev[partes[i]] = cuerpo
    return ev


def leer_tablas(ev):
    tablas = {}
    for reg, e in TABLA.items():
        filas = {}
        for m in re.finditer(r'^\| (\d+) \|(.+)\|$', ev[e], re.M):
            celdas = [c.strip() for c in m.group(2).split('|')]
            filas[int(m.group(1))] = [re.search(r'e\d{3}', c).group(0) if re.search(r'e\d{3}', c) else None
                                      for c in celdas]
        tablas[reg] = filas
    return tablas


RE_ENEMIGO = re.compile(r'\*{0,2}([A-ZÁÉÍÓÚÑ][^·*\n|]{1,60}?)\*{0,2} · Ataque (\d+) · Blind\. (\d+) · Heridas (\d+)((?: · )?(?:\[[^\]\n]+\])*)')
RE_PRUEBA = re.compile(r'\[(Vigor|Reflejos|Ingenio|Voluntad) · (\d+)(?: · (Desv|Vent)\.?)?\]')
RE_REQ = re.compile(r'\b(Si tienes|si tienes|Si llevas|si llevas|Necesitas|necesitas|Si eres|si eres|Solo si|solo si|'
                    r'Con Reputación|con Reputación|\(si |Requiere|Si has|si has|Si ya|Si te|Si no tienes|'
                    r'Si lees|si lees|Mientras|la Mente,|el Nativo,|el Piloto,)')


def enemigo_de(texto):
    m = RE_ENEMIGO.search(texto)
    if not m:
        return None
    return {'n': m.group(1).strip(), 'atk': int(m.group(2)), 'bl': int(m.group(3)), 'h': int(m.group(4)),
            'tags': set(re.findall(r'\[([^\]]+)\]', m.group(5) or ''))}


def opciones_de(cuerpo):
    """Devuelve la lista de opciones numeradas [(titulo, texto)] del evento."""
    ops = []
    for m in re.finditer(r'^(\d+)\. \*\*(.+?)\*\*(.*?)(?=^\d+\. \*\*|^---|^\*\*Mientras|\Z)', cuerpo, re.M | re.S):
        ops.append((m.group(2), m.group(3)))
    return ops


def ramas(texto):
    """Separa una opción en (cabecera, éxito pleno, éxito, fallo)."""
    t = texto
    def corta(et):
        i = t.find(et)
        return i
    i_pl = corta('*Éxito pleno:*'); i_ex = corta('*Éxito:*'); i_fa = corta('*Fallo:*')
    marcas = sorted([(i, k) for i, k in ((i_pl, 'pl'), (i_ex, 'ex'), (i_fa, 'fa')) if i >= 0])
    if not marcas:
        return t, None, None, None
    cab = t[:marcas[0][0]]
    trozos = {}
    for j, (i, k) in enumerate(marcas):
        fin = marcas[j + 1][0] if j + 1 < len(marcas) else len(t)
        trozos[k] = t[i:fin]
    return cab, trozos.get('pl'), trozos.get('ex'), trozos.get('fa')


def num(p, t, grupo=1):
    return sum(int(m.group(grupo)) for m in re.finditer(p, t))


def efectos(t):
    """Interpreta los efectos de un trozo de texto."""
    e = Counter()
    limpio = re.sub(r'\b(cura|curas|recuperas|Cura|Curas|Recuperas)\s+(\d+)\s+Heridas?', '', t)
    e['curas'] = num(r'\b(?:cura|curas|recuperas|Cura|Curas|Recuperas)\s+(\d+)\s+Heridas?', t)
    e['heridas'] = num(r'(?<![+−-])\b(\d+) Heridas?\b', limpio) + num(r'(?<![+−-])\b(\d+) Daños?\b(?! de nave)', limpio)
    e['chatarra'] = num(r'\+(\d+) Chatarra', t) + num(r'[Gg]anas? (\d+) Chatarra', t) - num(r'[Pp]ierdes (\d+) Chatarra', t) \
        - num(r'[Pp]aga(?:r|s)? (\d+) Chatarra', t)
    e['raciones'] = num(r'\+(\d+) Raci', t) - num(r'[Pp]ierdes (\d+) Raci', t)
    e['aire'] = num(r'\+(\d+) Aire', t) - num(r'[Pp]ierdes (\d+) Aire', t)
    e['energia'] = num(r'\+(\d+) Energía', t) - num(r'[Pp]ierdes (\d+) Energía', t)
    c = num(r'\+(\d+) Canto', t) - num(r'[−-](\d+) (?:de )?Canto', t) - num(r'[Bb]ajas? (\d+) (?:de )?Canto', t)
    if c == 0 and not re.search(r'Canto', t):
        c = t.count('♫')
    e['canto'] = c
    a = num(r'\+(\d+) Alerta', t) - num(r'[Bb]aja (\d+) (?:de )?(?:la )?Alerta', t)
    if a == 0:
        a = t.count('◉')
    e['alerta'] = a
    e['reloj'] = -t.count('⌛ +1') - num(r'[Rr]eloj baja (\d+)', t)
    e['temple'] = num(r'\+(\d+) Temple', t) - num(r'[−-](\d+) Temple', t)
    e['reliquia'] = len(re.findall(r'reliquia sin identificar|[Gg]anas una reliquia|una reliquia\b', t))
    e['frag'] = len(set(re.findall(r'FRAGMENTO_[A-ZÁÉÍÓÚÑ_]+', t)))
    e['hito'] = t.count('★')
    for f, k in (('Hijos', 'rep_hijos'), ('Desguaces', 'rep_desg'), ('Coro', 'rep_coro'), ('Vigías', 'rep_vig')):
        e[k] = num(r'\+(\d+) de Reputación con (?:los |el )?' + f, t) - num(r'[−-](\d+) de Reputación con (?:los |el )?' + f, t)
    m = re.search(r'→ \[(e\d{3})\]', t)
    e_goto = m.group(1) if m else None
    m = re.search(r'\*\*(?:(Casco|Motor|Navegación|Soporte vital|Combustible) )?(Precari[oa]|Sólid[oa]|Excelente)\*\*', t)
    cal = None
    if m:
        g = m.group(2)
        cal = 'Precaria' if g.startswith('Precari') else ('Sólida' if g.startswith('Sólid') else 'Excelente')
        cal = (m.group(1), cal)
    return e, e_goto, cal


# ---------------------------------------------------------------- estado
class Muerte(Exception):
    pass


class Partida:
    def __init__(self, prota, ev, tablas, rng, traza=False, estrategia='normal'):
        self.p, self.ev, self.tablas, self.r = prota, ev, tablas, rng
        self.traza, self.estr = traza, estrategia
        self.at = {'Vigor': 3, 'Reflejos': 3, 'Ingenio': 3, 'Voluntad': 3}
        if prota == 'piloto':
            self.at.update(Vigor=2, Reflejos=4, Ingenio=4, Voluntad=2); self.at['Reflejos'] += 1
        elif prota == 'nativo':
            self.at.update(Vigor=4, Reflejos=3, Ingenio=2, Voluntad=3); self.at['Vigor'] += 1
        else:
            self.at.update(Vigor=2, Reflejos=3, Ingenio=4, Voluntad=3); self.at['Ingenio'] += 1; self.at['Voluntad'] -= 1
        self.her = 0; self.temple = 2; self.temple_max = 3
        self.aire = 6 if prota == 'piloto' else 0
        self.energia = 3 if prota == 'piloto' else (6 if prota == 'mente' else 0)
        self.raciones = 0 if prota == 'mente' else 5
        self.canto = 0; self.chatarra = 3; self.alerta = 1; self.reloj = 60; self.dia = 0
        self.baliza = True; self.region = 1; self.arma = 1 if prota != 'mente' else 1
        self.blind = 2 if prota == 'mente' else 0
        self.rep = {'hijos': 1 if prota == 'nativo' else 0, 'desg': -1 if prota == 'nativo' else 0, 'coro': 0, 'vig': 0}
        self.sis = {}                       # sistema -> [estado, calidad]  estado: llevado / instalado
        self.hall = defaultdict(list)       # región -> ['sis:Casco', 'trip:Iria', ...]
        for s in SISTEMAS:
            self.hall[self.r.randint(1, 8)].append('sis:' + s)
        for t in TRIPU:
            self.hall[self.r.randint(1, 8)].append('trip:' + t)
        self.compas = []; self.cicatriz = []; self.lealtad = {}; self.comp_her = {}
        if prota == 'piloto':
            t = self.r.choice(TRIPU)
            for reg in self.hall.values():
                if 'trip:' + t in reg:
                    reg.remove('trip:' + t)
            self.compas.append(t); self.lealtad[t] = 2; self.comp_her[t] = 0
        self.reliquias = 0; self.frag = 0; self.deuda = False; self.quilla = False
        self.stats = Counter(); self.fin = None; self.danos = None; self.canto6 = 0; self.caidas = 0
        self.dia_sistemas = {}
        self.reglas_v2 = estrategia != 'v1'
        self.despensa = 15 if self.reglas_v2 else 0
        self.max_compas = {'normal': 1, 'sola': 0, 'grupo': 2}.get(estrategia, 1)

    # ----- utilidades
    def log(self, *a):
        if self.traza:
            print(f'  [día {self.dia:2d} · Reloj {self.reloj:2d} · {NOMBRE_REG[self.region]:10s}]', *a)

    def pen(self):
        return {0: 0, 1: 0, 2: -1, 3: -2, 4: -2}[min(self.her, 4)]

    def d2(self, modo=None):
        if modo is None:
            return self.r.randint(1, 6) + self.r.randint(1, 6)
        d = sorted(self.r.randint(1, 6) for _ in range(3))
        return d[1] + d[2] if modo == 'V' else d[0] + d[1]

    def prob(self, attr, dif, modo=None):
        base = self.at[attr] + self.pen()
        n = dif - base
        tabla = {None: P2, 'V': PV, 'D': PD}[modo]
        return tabla.get(max(2, min(13, n)), 0.0) if n <= 12 else 0.0

    def prueba(self, attr, dif, modo=None, importante=False):
        """Devuelve 'pl', 'ex' o 'fa'. Gasta Temple en las importantes."""
        total = self.d2(modo) + self.at[attr] + self.pen()
        self.stats['pruebas'] += 1
        if total < dif and self.temple > (0 if importante else 1):
            self.temple -= 1; self.stats['temple_gastado'] += 1
            total = self.d2(modo) + self.at[attr] + self.pen()
        if total >= dif + 3:
            return 'pl'
        return 'ex' if total >= dif else 'fa'

    def herir(self, n, fuente=''):
        for _ in range(n):
            if n >= 2 and self.compas and self.r.random() < .5:
                c = self.compas[0]; self.comp_her[c] += 1; n -= 1
                if self.comp_her[c] >= 3:
                    self.compas.remove(c)
                    if self.r.randint(1, 6) <= 2:
                        self.stats['tripulantes_muertos'] += 1
                    else:
                        self.cicatriz.append(c)
                continue
            if self.her >= 4:
                self.caer(fuente)
            else:
                self.her += 1

    def caer(self, fuente):
        self.caidas += 1
        if self.temple <= 0:
            self.fin = 'muerte'; self.muerte_por = fuente
            raise Muerte()
        self.temple -= 1; self.reloj -= 2; self.raciones = 0; self.chatarra = 0
        self.log('cae y se despierta en Crítico')

    def subir_alerta(self, n=1):
        for _ in range(max(0, n)):
            if self.alerta >= 4:
                self.reloj -= 2; self.stats['reloj_por_alerta'] += 2
            else:
                self.alerta += 1

    def subir_canto(self, n):
        self.canto = max(0, self.canto + n)
        if self.canto >= 6:
            self.canto6 += 1; self.canto = 4; self.log('Canto 6')
            self.stats['canto6'] += 1

    def aplicar(self, e):
        if e['curas']:
            self.her = max(0, self.her - e['curas'])
        if e['heridas']:
            self.herir(e['heridas'], 'evento')
        self.chatarra = max(0, self.chatarra + e['chatarra'])
        self.raciones = max(0, min(8, self.raciones + e['raciones']))
        if self.p == 'piloto':
            self.aire = max(0, min(6, self.aire + e['aire']))
        if self.p != 'nativo':
            self.energia = max(0, min(6, self.energia + e['energia']))
        if e['canto'] > 0:
            self.subir_canto(e['canto'])
        elif e['canto'] < 0:
            self.canto = max(0, self.canto + e['canto'])
        if e['alerta'] > 0:
            self.subir_alerta(e['alerta'])
        elif e['alerta'] < 0:
            self.alerta = max(2 if self.baliza else 1, self.alerta + e['alerta'])
        self.reloj += e['reloj']
        self.temple = max(0, min(self.temple_max, self.temple + e['temple']))
        self.reliquias += e['reliquia']; self.frag += e['frag']
        for k in ('hijos', 'desg', 'coro', 'vig'):
            self.rep[k] = max(-3, min(3, self.rep[k] + e['rep_' + k]))
        for _ in range(e['hito']):
            self.mejora()

    def mejora(self):
        self.stats['mejoras'] += 1
        for a in ('Ingenio', 'Reflejos', 'Voluntad', 'Vigor'):
            if self.at[a] < 5:
                self.at[a] += 1; return
        if self.temple_max < 4:
            self.temple_max += 1

    # ----- combate (r140–r146)
    def ataque(self):
        base = max(self.at['Vigor'], self.at['Reflejos']) + self.arma
        return base + sum(2 if c == 'Bruno' else 1 for c in self.compas) + self.pen()

    def combate(self, en, emboscada=False):
        self.stats['combates'] += 1
        h = en['h']; rondas = 0; bl = en['bl'] + (1 if 'Antiguo' in en['tags'] else 0)
        if emboscada:
            self.herir(1, en['n'])
        while h > 0:
            rondas += 1
            if self.her >= 3 and h > 1 and rondas > 1:
                modo = 'D' if 'Rápido' in en['tags'] else ('V' if 'Lio' in self.compas else None)
                if self.prueba('Reflejos', 9, modo) != 'fa':
                    self.stats['huidas'] += 1
                    if rondas > 3: self.subir_alerta(1)
                    return 'huye'
                self.herir(1, en['n'])
                continue
            yo = self.d2('D' if emboscada and rondas == 1 else None) + self.ataque()
            el = self.d2() + en['atk']
            dif = abs(yo - el)
            dano = 0 if dif == 0 else (1 if dif <= 3 else (2 if dif <= 6 else 3))
            if yo > el:
                d = max(dano - bl, 1 if dif >= 4 else 0)
                if 'Enjambre' in en['tags']:
                    d = min(d, 1)
                h -= d
            elif el > yo:
                d = max(dano - self.blind, 1 if dif >= 4 else 0)
                if 'Grande' in en['tags'] and dif >= 7:
                    d += 1
                if 'Cantor' in en['tags']:
                    self.subir_canto(1)
                if d:
                    self.herir(d, en['n'])
            if rondas > 12:
                break
        if rondas > 3:
            self.subir_alerta(1)
        if 'Náufrago' in en['tags'] or 'Máquina' in en['tags']:
            self.chatarra += (self.r.randint(1, 6) + 1) // 2
        self.stats['combates_ganados'] += 1
        return 'gana'

    def p_combate(self, en):
        """Estimación barata de victoria sin perder más de 2 Heridas."""
        a = self.ataque() - en['atk']
        rondas = en['h'] / max(.6, 1 + a * .25)
        perdidas = rondas * max(.15, .5 - a * .08) * max(.3, 1 - self.blind * .35)
        return perdidas

    # ----- eventos
    def valor(self, e, cal, sistema):
        v = 0.0
        v -= e['heridas'] * (2.5 + 1.5 * self.her) - e['curas'] * 2
        v += e['chatarra'] * .8 + e['raciones'] * .4 + e['aire'] * .5 * (self.p == 'piloto') + e['energia'] * .3
        v -= e['canto'] * (1 + .4 * self.canto) + e['alerta'] * 1.2 - e['reloj'] * 1.5 + e['temple'] * -1.5
        v += e['reliquia'] * 2 + e['frag'] * 1 + e['hito'] * 2
        if cal and sistema and self.necesita(sistema):
            v += 14 + 4 * ORDEN_CAL.index(cal[1])
        return v

    def necesita(self, s):
        return s not in self.sis

    def evento(self, eid, prof=0, sistema=None):
        if self.fin or prof > 4 or eid not in self.ev:
            return
        self.stats['eventos'] += 1
        self.vistos[eid] += 1
        cuerpo = self.ev[eid]
        sistema = sistema or SYS_DE_EVENTO.get(eid)
        cab_ev = cuerpo.split('\n1. **')[0]
        ops = opciones_de(cuerpo)
        enem_ev = enemigo_de(cuerpo)
        if not ops:
            e, goto, cal = efectos(cab_ev)
            self.aplicar(e)
            if enem_ev and re.search(r'[Cc]ombate', cab_ev):
                self.combate(enem_ev)
            if goto:
                self.evento(goto, prof + 1, sistema)
            return
        mejor, mejor_v = None, -1e9
        for tit, txt in ops:
            cab, pl, ex, fa = ramas(txt)
            if RE_REQ.search(tit + ' ' + cab[:120]):
                continue
            coste = re.match(r'\s*(\d+) Chatarra', cab)
            if coste and int(coste.group(1)) > self.chatarra:
                continue
            m = RE_PRUEBA.search(cab)
            en = enemigo_de(txt) or (enem_ev if re.search(r'[Cc]ombate|Luchar', tit + cab) else None)
            if m:
                attr, dif = m.group(1), int(m.group(2))
                modo = 'D' if m.group(3) == 'Desv' or (attr == 'Voluntad' and '♫' in cab and self.canto >= 3) else None
                p = self.prob(attr, dif, modo); ppl = self.prob(attr, dif + 3, modo)
                e_ex, _, c_ex = efectos(ex or cab); e_pl, _, c_pl = efectos(pl or ex or cab)
                e_fa, _, c_fa = efectos(fa or '')
                if '⚔' in cab and not e_fa['heridas']: e_fa['heridas'] += 1
                e_fa['alerta'] += cab.count('◉'); e_fa['canto'] += cab.count('♫')
                v = ppl * self.valor(e_pl, c_pl, sistema) + (p - ppl) * self.valor(e_ex, c_ex, sistema) \
                    + (1 - p) * self.valor(e_fa, c_fa, sistema)
            else:
                e0, _, c0 = efectos(txt)
                v = self.valor(e0, c0, sistema)
                if en:
                    v -= self.p_combate(en) * (3 + self.her) - 2
            if v > mejor_v:
                mejor, mejor_v = (tit, txt), v
        if mejor is None:
            mejor = ops[-1]
        tit, txt = mejor
        cab, pl, ex, fa = ramas(txt)
        m = RE_PRUEBA.search(cab)
        if m:
            modo = 'D' if m.group(3) == 'Desv' or (m.group(1) == 'Voluntad' and '♫' in cab and self.canto >= 3) else None
            if m.group(1) == 'Ingenio' and re.search(r'Noemí', cab) and 'Noemí' in self.compas:
                modo = 'V'
            res = self.prueba(m.group(1), int(m.group(2)), modo, importante=bool(sistema))
            trozo = {'pl': pl or ex, 'ex': ex, 'fa': fa}[res] or ''
            e, goto, cal = efectos(trozo)
            if res == 'fa':
                if '⚔' in cab and not e['heridas']: e['heridas'] += 1
                e['alerta'] += cab.count('◉'); e['canto'] += cab.count('♫')
            coste = re.match(r'\s*(\d+) Chatarra', cab)
            if coste: e['chatarra'] -= int(coste.group(1))
            self.aplicar(e)
            en = enemigo_de(trozo) or (enem_ev if res == 'fa' and re.search(r'[Cc]ombate', trozo) else None)
            if en:
                self.combate(en, emboscada='Emboscada' in trozo)
        else:
            e, goto, cal = efectos(txt)
            self.aplicar(e)
            en = enemigo_de(txt) or (enem_ev if re.search(r'[Cc]ombate|Luchar', tit + cab) else None)
            if en:
                if self.combate(en) != 'gana':
                    cal = None
        if cal and sistema:
            self.conseguir(cal[0] or sistema, cal[1], eid)
        if goto and not self.fin:
            self.evento(goto, prof + 1, sistema)

    def conseguir(self, s, cal, fuente):
        if s not in SISTEMAS and s != 'Personal':
            return
        if s in self.sis:
            return
        self.sis[s] = ['llevado', cal]; self.dia_sistemas[s] = self.dia
        self.stats['via_' + ('rescate' if fuente in RESCATE.values() or fuente[:3] == 'e56' else fuente)] += 1
        for reg in self.hall.values():
            if 'sis:' + s in reg:
                reg.remove('sis:' + s)
        self.log(f'consigue {s} {cal} ({fuente})')

    # ----- acciones del día
    def encuentro(self, columna=None):
        tira = self.d2()
        col = (columna or self.alerta) - 1
        eid = self.tablas[self.region].get(tira, [None] * 4)[col]
        self.stats['encuentros'] += 1
        if eid:
            self.evento(eid)

    def viajar(self, destino):
        self.stats['acc_viajar'] += 1
        if self.p == 'nativo':
            ok = True
        else:
            ok = self.prueba('Ingenio', 9, 'V' if 'Amara' in self.compas and False else None) != 'fa'
        if ok or self.r.randint(1, 6) <= 3:
            if not ok:
                if self.p == 'mente': self.energia = max(0, self.energia - 1)
                else: self.raciones = max(0, self.raciones - 1)
            self.region = destino
        self.encuentro()

    def explorar(self):
        self.stats['acc_explorar'] += 1
        res = self.prueba('Ingenio', 9, 'V' if 'Amara' in self.compas and self.region in (6, 7) else None)
        if res == 'fa':
            self.encuentro(); return
        if res == 'pl':
            if self.p == 'mente': self.energia = min(6, self.energia + 1)
            else: self.raciones = min(8, self.raciones + 1)
        aqui = self.hall[self.region]
        sis = [h for h in aqui if h.startswith('sis:')]
        per = [h for h in aqui if h == 'personal']
        tri = [h for h in aqui if h.startswith('trip:')]
        if sis:
            s = sis[0][4:]; self.log('rescate de', s)
            self.evento(RESCATE[s], sistema=s)
            if s not in self.sis:      # el pecio no salió bien: queda tachado
                aqui.remove(sis[0]); self.stats['rescate_perdido'] += 1
        elif per:
            aqui.remove('personal')
            cal = self.r.randint(1, 6)
            self.conseguir('Personal', 'Precaria' if cal <= 2 else ('Sólida' if cal <= 5 else 'Excelente'), 'historia')
        elif tri:
            t = tri[0][5:]; aqui.remove(tri[0]); self.stats['tripulantes'] += 1
            if len(self.compas) < self.max_compas:
                self.compas.append(t); self.lealtad[t] = 2; self.comp_her[t] = 0
            else:
                self.cicatriz.append(t)
            self.log('encuentra a', t)
        elif self.p != 'mente' and self.raciones <= 2:
            self.raciones = min(8, self.raciones + (3 if self.p == 'nativo' else 2))
        else:
            self.pecio()

    def pecio(self):
        self.stats['pecios'] += 1
        tipo = self.r.randint(1, 6) if self.region not in (6, 7) else 5
        if self.region == 2:
            tipo = max(tipo, self.r.randint(1, 6))
        guard = {1: (2, 0, 3, {'Bestia', 'Enjambre'}), 2: (3, 0, 2, {'Cantor'}), 3: (4, 2, 2, {'Máquina'}),
                 4: (2, 1, 2, {'Máquina'}), 5: (4, 2, 3, {'Máquina', 'Antiguo'}), 6: (5, 1, 3, {'Bestia', 'Grande'})}[tipo]
        if tipo == 5:
            self.subir_canto(1)
        for sala in range(1, 5):
            t = self.d2()
            if sala == 2 and t in (3, 4, 5):
                t = 2
            if t == 2:
                g = guard
                if self.combate({'n': 'guardián', 'atk': g[0], 'bl': g[1], 'h': g[2], 'tags': g[3]}) != 'gana':
                    return
            elif t in (3, 4):
                if self.prueba('Reflejos', 9) == 'fa':
                    self.herir(1, 'trampa')
                    if t == 4: return
            elif t == 5: self.chatarra += 1
            elif t in (6, 8): self.chatarra += 2 + (tipo == 1) + ('Noemí' in self.compas)
            elif t == 7:
                if self.p == 'piloto' and self.aire < 4: self.aire = min(6, self.aire + 2)
                elif self.p == 'mente': self.energia = min(6, self.energia + 2)
                else: self.raciones = min(8, self.raciones + 2 * (1 + (tipo == 2)))
            elif t == 9 or (t == 10 and tipo == 5 and self.r.random() < .5):
                self.arma = max(self.arma, self.r.choice([1, 1, 1, 2, 2, 2])) if self.r.random() < .5 else self.arma
                self.stats['equipo'] += 1
            elif t == 10: self.reliquias += 1
            elif t == 11: self.evento(f'e{500 + (tipo - 1) * 3 + self.r.choice([0, 0, 0, 1, 1, 2]):03d}')
            elif t == 12:
                if self.r.randint(1, 6) >= 4: self.chatarra += 5; self.reliquias += 1
            if self.fin or self.her >= 2 or self.alerta >= 4:
                return

    def descansar(self):
        self.stats['acc_descansar'] += 1
        en_cicatriz = self.region == 1
        cubierto = en_cicatriz
        if self.p != 'mente':
            self.her = max(0, self.her - (2 if cubierto else 1) - ('Iria' in self.compas or 'Iria' in self.cicatriz))
        elif self.chatarra > 0 or en_cicatriz:
            gratis = 1 if en_cicatriz else 0
            pagar = min(self.her - gratis, self.chatarra)
            self.her = max(0, self.her - gratis - max(0, pagar)); self.chatarra -= max(0, pagar)
        self.temple = min(self.temple_max, self.temple + 1)
        if en_cicatriz: self.canto = max(0, self.canto - 1)
        if 'Tadeo' in self.compas: self.canto = max(0, self.canto - 1)
        for c in self.compas: self.comp_her[c] = 0
        if not cubierto and self.d2() >= 10:
            self.encuentro()

    def visitar(self):
        """Asentamiento: compra, sanador, descanso a cubierto y una vía de sistema si la hay."""
        self.stats['acc_visitar'] += 1
        reg = self.region
        # comprar comida/aire
        if self.p != 'mente':
            while self.raciones < 5 and self.chatarra >= 1:
                self.chatarra -= 1; self.raciones += 2 if reg != 4 else 4
        if self.p == 'piloto' and reg != 4:
            if self.aire < 6 and self.chatarra >= 1: self.chatarra -= 1; self.aire = 6
        if self.p != 'nativo' and self.energia < 6 and self.chatarra >= 1:
            self.chatarra -= 1; self.energia = 6
        # sanador
        while self.her >= 2 and self.chatarra >= 2 and self.p != 'mente':
            self.chatarra -= 2; self.her = max(0, self.her - 2)
        if self.canto >= 4 and self.chatarra >= 3:
            self.chatarra -= 3; self.canto -= 2
        # vías de sistema
        if reg == 2:
            if self.necesita('Combustible'):
                if self.chatarra >= 12: self.chatarra -= 12; self.conseguir('Combustible', 'Sólida', 'e405')
                elif self.estr != 'sin_deuda': self.deuda = True; self.conseguir('Combustible', 'Sólida', 'e405')
            elif self.necesita('Casco') and self.chatarra >= 10:
                self.chatarra -= 10; self.conseguir('Casco', 'Sólida', 'e404')
            elif self.necesita('Casco') and self.chatarra >= 5 and self.reloj < 25:
                self.chatarra -= 5; self.conseguir('Casco', 'Precaria', 'e404')
        elif reg == 4:
            self.quilla = True
            if self.necesita('Soporte vital') and self.rep['hijos'] >= 1:
                self.conseguir('Soporte vital', 'Excelente' if self.rep['hijos'] >= 3 else 'Sólida', 'e416')
            elif self.necesita('Soporte vital') and self.chatarra >= 8:
                self.chatarra -= 8; self.conseguir('Soporte vital', 'Sólida', 'e416')
            elif self.necesita('Motor') and self.rep['hijos'] >= 1 and self.chatarra >= 6:
                self.chatarra -= 6; self.reloj -= 1
                r = self.prueba('Ingenio', 9, 'V' if 'Noemí' in self.compas else None, True)
                self.conseguir('Motor', {'pl': 'Excelente', 'ex': 'Sólida', 'fa': 'Precaria'}[r], 'e414')
            elif self.necesita('Motor'):
                self.reloj -= 1
                if self.prueba('Vigor', 9) != 'fa':
                    self.conseguir('Motor', 'Sólida' if self.rep['hijos'] >= 2 else 'Precaria', 'e414')
                else:
                    self.herir(1, 'forja')
        elif reg == 3 and self.necesita('Combustible'):
            self.evento('e241', sistema='Combustible')
        elif reg == 5 and self.necesita('Soporte vital'):
            self.evento('e261', sistema='Soporte vital')
        elif reg == 6 and self.necesita('Motor') and self.rep['vig'] >= 2:
            self.conseguir('Motor', 'Excelente', 'e432')
        elif reg == 7 and self.necesita('Navegación') and self.rep['coro'] >= 2:
            self.conseguir('Navegación', 'Excelente', 'e426')
        # descanso a cubierto
        if self.p != 'mente':
            self.her = max(0, self.her - 2)
        self.temple = min(self.temple_max, self.temple + 1)

    def instalar(self):
        self.stats['acc_instalar'] += 1
        s = next(k for k, v in self.sis.items() if v[0] == 'llevado')
        modo = 'V' if ('Noemí' in self.compas or 'Noemí' in self.cicatriz or self.p == 'mente') else None
        r = self.prueba('Ingenio', 9, modo)
        if r == 'fa':
            self.chatarra = max(0, self.chatarra - 1); return
        cal = self.sis[s][1]
        if r == 'pl':
            cal = ORDEN_CAL[min(2, ORDEN_CAL.index(cal) + 1)]
        self.sis[s] = ['instalado', cal]; self.mejora()
        self.log('instala', s, cal)

    def mejorar(self):
        self.stats['acc_mejorar'] += 1
        s = min((k for k, v in self.sis.items() if v[1] != 'Excelente'), key=lambda k: ORDEN_CAL.index(self.sis[k][1]))
        self.chatarra -= 3
        if self.prueba('Ingenio', 11) != 'fa':
            self.sis[s][1] = ORDEN_CAL[ORDEN_CAL.index(self.sis[s][1]) + 1]

    # ----- el despegue (e900)
    def despegue(self, desesperado=False):
        danos = 0
        if self.deuda:
            if self.chatarra >= 12: self.chatarra -= 12
            else:
                try:
                    if self.combate({'n': 'Cobradores', 'atk': 4, 'bl': 2, 'h': 4, 'tags': {'Náufrago'}}) != 'gana':
                        danos += 1
                except Muerte:
                    self.fin = None; danos += 1
        pruebas = [('Motor', 'Ingenio'), ('Casco', 'Reflejos'), ('Navegación', 'Ingenio'), ('Canto', 'Voluntad'),
                   ('Soporte vital', 'Vigor'), ('Combustible', 'Ingenio'),
                   ('Personal', {'piloto': 'Reflejos', 'nativo': 'Voluntad', 'mente': 'Ingenio'}[self.p])]
        self.her = 0
        for s, attr in pruebas:
            if s == 'Canto':
                if 'Tadeo' in self.compas + self.cicatriz:
                    continue
                dif = 7 + self.canto
            else:
                if s not in self.sis or self.sis[s][0] != 'instalado':
                    danos += 1; continue
                dif = CAL[self.sis[s][1]]
            modo = 'V' if (s == 'Casco' and self.p == 'piloto') or (s == 'Motor' and 'Noemí' in self.compas + self.cicatriz) \
                or (s == 'Soporte vital' and 'Iria' in self.compas + self.cicatriz) else None
            if self.prueba(attr, dif, modo, True) == 'fa':
                danos += 1
        if self.reloj <= 15 or self.baliza:
            if self.prueba('Reflejos', 11, None, True) == 'fa':
                danos += 2
        self.danos = danos
        if desesperado:
            self.fin = 'desesperado_ok' if danos <= 4 else 'desesperado_mal'
        else:
            self.fin = 'despega' if danos <= 2 else ('despega_justo' if danos <= 4 else 'se_estrella')

    # ----- el bucle
    def amanecer(self):
        self.dia += 1; self.reloj -= 1
        if self.reloj <= 0:
            self.fin = 'recolectores'; return
        if self.p == 'piloto' and self.dia == 11:
            self.hall[self.r.randint(1, 8)].append('personal')       # e800: la Caja negra
        if self.p == 'mente' and self.reloj <= 30 and not self.__dict__.get('nucleo'):
            self.nucleo = True; self.hall[self.r.randint(1, 8)].append('personal')   # e822
        if self.p == 'nativo' and self.reloj <= 30 and 'Personal' not in self.sis:
            self.conseguir('Personal', 'Sólida' if self.quilla else 'Precaria', 'e812')
        cobijo = self.region == 1 or (self.region in (2, 4, 6, 7) and self.ultimo == 'visitar')
        if self.region == 1 and self.p != 'mente' and self.despensa > 0:
            self.despensa -= 1 + len(self.compas); self.despensa = max(0, self.despensa)
            comen_fuera = False
        else:
            comen_fuera = True
        if self.region == 7 and self.reglas_v2:
            self.subir_canto(1)
        if self.p != 'mente' and comen_fuera:
            if self.raciones > 0: self.raciones -= 1
            else: self.herir(1, 'hambre'); self.stats['hambre'] += 1
        if self.p == 'piloto':
            if self.region == 1: self.aire = 6
            elif not cobijo:
                if self.aire > 0: self.aire -= 1
                else: self.herir(1, 'asfixia'); self.stats['asfixia'] += 1
        if self.p == 'mente':
            if self.region == 1: self.energia = 6
            elif self.energia > 0: self.energia -= 1
            else: self.herir(1, 'sin energía'); self.stats['sin_energia'] += 1
        for c in list(self.compas if comen_fuera else []):
            if self.raciones > 0 and self.p != 'mente': self.raciones -= 1
            elif self.p == 'mente' and self.chatarra > 0 and self.r.random() < .5: self.chatarra -= 1
            else:
                self.lealtad[c] -= 1
                if self.lealtad[c] <= 0:
                    self.compas.remove(c); self.stats['tripulantes_perdidos'] += 1
        if self.region == 1 and self.p == 'piloto':
            self.aire = 6
        pulso = self.r.randint(1, 6)
        if pulso == 6 or (pulso == 5 and self.region == 7):
            self.stats['pulsos'] += 1
            self.evento(f'e02{self.r.randint(0, 5)}')

    def objetivo(self):
        """Región a la que ir: el Hallazgo o la vía de sistema más cercana."""
        cand = []
        for reg, lista in self.hall.items():
            for h in lista:
                if h.startswith('sis:') or h == 'personal':
                    cand.append((dist(self.region, reg) - 0.5, reg))
                elif h.startswith('trip:') and len(self.compas) + len(self.cicatriz) < 4:
                    cand.append((dist(self.region, reg) + 1.5, reg))
        if self.necesita('Combustible') and not any('sis:Combustible' in l for l in self.hall.values()):
            cand.append((dist(self.region, 2) - 0.2, 2))
        if self.necesita('Soporte vital') and not any('sis:Soporte vital' in l for l in self.hall.values()):
            cand.append((dist(self.region, 4 if self.rep['hijos'] >= 1 or self.chatarra >= 8 else 5), 4 if self.rep['hijos'] >= 1 or self.chatarra >= 8 else 5))
        if self.necesita('Casco') and not any('sis:Casco' in l for l in self.hall.values()):
            cand.append((dist(self.region, 2) + (0 if self.chatarra >= 10 else 3), 2))
        if self.necesita('Motor') and not any('sis:Motor' in l for l in self.hall.values()):
            cand.append((dist(self.region, 4), 4))
        if self.necesita('Navegación') and not any('sis:Navegación' in l for l in self.hall.values()):
            cand.append((dist(self.region, 2) + 2, 2))   # sin rescate: explorar pecios del Cementerio
        if not cand:
            return None
        return min(cand)[1]

    def asentamiento_aqui(self):
        return self.region in (2, 4, 6, 7) or (self.region in (3, 5))

    def decidir(self):
        llevados = [k for k, v in self.sis.items() if v[0] == 'llevado']
        instalados = [k for k, v in self.sis.items() if v[0] == 'instalado']
        en_dunas = self.region == 1
        if len(instalados) == 6 and en_dunas:
            if self.chatarra >= 3 and self.reloj > 12 and any(v[1] == 'Precaria' for v in self.sis.values()) and self.estr != 'rapida':
                return 'mejorar'
            return 'despegar'
        if en_dunas and self.reloj <= 6 and all(s in instalados for s in ('Casco', 'Motor', 'Combustible')):
            return 'desesperado'
        if en_dunas and llevados and not (self.her >= 3):
            return 'instalar'
        if en_dunas and self.baliza and self.estr != 'baliza' and self.dia > 1 and self.dia < 25:
            return 'baliza'
        if self.her >= 3 or (self.her >= 2 and en_dunas):
            if self.region in (2, 4, 6) and self.rep_ok():
                return 'visitar'
            return 'descansar'
        if self.p == 'piloto' and self.aire <= 1 and not en_dunas:
            return 'visitar' if self.region in (2, 6, 7) and self.chatarra >= 1 and self.rep_ok() else 'ir:1'
        if self.p == 'mente' and self.energia <= 1 and not en_dunas:
            return 'visitar' if self.region in (2, 4, 6, 7) and self.chatarra >= 1 and self.rep_ok() else 'ir:1'
        if self.p != 'mente' and self.raciones <= 1:
            if self.region in (2, 4, 6, 7) and self.chatarra >= 1 and self.rep_ok(): return 'visitar'
            return 'explorar'
        if self.alerta >= 4 and self.region != 7:
            return 'ocultarte'
        pesado = any(self.sis[k][0] == 'llevado' and k in ('Motor', 'Combustible') for k in self.sis)
        if llevados and (pesado or len(llevados) >= 2 or self.reloj < 20):
            return 'ir:1'
        if len(self.sis) >= 6 and llevados:
            return 'ir:1'
        obj = self.objetivo()
        if obj is None:
            return 'ir:1' if not en_dunas else 'explorar'
        if obj == self.region:
            hay = any(h.startswith('sis:') or h == 'personal' or h.startswith('trip:') for h in self.hall[self.region])
            if not hay and self.region in (2, 3, 4, 5, 6, 7) and self.rep_ok():
                if self.vistas[self.region] < 2:
                    return 'visitar'
            return 'explorar'
        return f'ir:{obj}'

    def rep_ok(self):
        f = {2: 'desg', 4: 'hijos', 6: 'vig', 7: 'coro'}.get(self.region)
        return f is None or self.rep[f] > -2

    def jugar(self):
        self.vistos = Counter(); self.vistas = Counter(); self.ultimo = None
        try:
            while not self.fin:
                self.amanecer()
                if self.fin:
                    break
                acc = self.decidir()
                self.ultimo = acc.split(':')[0]
                self.log(acc, f'H{self.her} T{self.temple} Ch{self.chatarra} R{self.raciones} A{self.aire} E{self.energia} '
                              f'Canto{self.canto} Al{self.alerta} sis={len(self.sis)}')
                if acc == 'despegar': self.despegue()
                elif acc == 'desesperado': self.despegue(True)
                elif acc == 'instalar': self.instalar()
                elif acc == 'mejorar': self.mejorar()
                elif acc == 'baliza':
                    self.stats['acc_baliza'] += 1
                    if self.prueba('Ingenio', 9) != 'fa': self.baliza = False
                    else: self.subir_alerta(1)
                elif acc == 'descansar': self.descansar()
                elif acc == 'visitar': self.vistas[self.region] += 1; self.visitar()
                elif acc == 'ocultarte':
                    self.stats['acc_ocultarte'] += 1
                    self.alerta = max(2 if self.baliza else 1, self.alerta - 1)
                    if self.region != 1 and self.d2() >= 10: self.encuentro()
                elif acc == 'explorar': self.explorar()
                elif acc.startswith('ir:'):
                    dest = int(acc[3:])
                    self.viajar(paso_hacia(self.region, dest) if dest != self.region else self.region)
                if self.dia > 120:
                    self.fin = 'bucle'
        except Muerte:
            pass
        return self


# probabilidades de 2d6 / 3d6 (Ventaja/Desventaja) de sacar n o más
def _tabla(modo):
    c = Counter()
    rng = range(1, 7)
    if modo is None:
        for a in rng:
            for b in rng: c[a + b] += 1
    else:
        for a in rng:
            for b in rng:
                for d in rng:
                    s = sorted((a, b, d)); c[s[1] + s[2] if modo == 'V' else s[0] + s[1]] += 1
    tot = sum(c.values())
    return {n: sum(v for k, v in c.items() if k >= n) / tot for n in range(-10, 14)}


P2, PV, PD = _tabla(None), _tabla('V'), _tabla('D')


def informe(res, prota):
    n = len(res)
    fines = Counter(p.fin for p in res)
    ganadas = [p for p in res if p.fin in ('despega', 'despega_justo', 'desesperado_ok')]
    print(f'\n=== {prota.upper()} · {n} partidas ===')
    for k, v in fines.most_common():
        print(f'  {k:16s} {v / n:6.1%}')
    print(f'  victoria total   {len(ganadas) / n:6.1%}')
    dias = [p.dia for p in res]
    print(f'  días jugados     media {st.mean(dias):.1f} · mediana {st.median(dias)} · min {min(dias)} · max {max(dias)}')
    if ganadas:
        print(f'  Reloj al ganar   media {st.mean(p.reloj for p in ganadas):.1f}')
        print(f'  daños de nave    {Counter(p.danos for p in ganadas if p.danos is not None).most_common()}')
    print(f'  sistemas al final  media {st.mean(len(p.sis) for p in res):.2f} · instalados '
          f'{st.mean(sum(v[0] == "instalado" for v in p.sis.values()) for p in res):.2f}')
    for s in SISTEMAS + ('Personal',):
        d = [p.dia_sistemas[s] for p in res if s in p.dia_sistemas]
        if d:
            print(f'    {s:14s} conseguido en {len(d) / n:5.1%} · día medio {st.mean(d):5.1f}')
    tot = Counter()
    for p in res:
        tot.update(p.stats)
    for k in sorted(tot):
        if k == 'muerte_por':
            continue
        print(f'  {k:22s} {tot[k] / n:7.2f} por partida')
    muertes = Counter(getattr(p, 'muerte_por', '?') for p in res if p.fin == 'muerte')
    if muertes:
        print('  causas de muerte ', muertes.most_common(6))
    print(f'  caídas (r195)    {st.mean(p.caidas for p in res):.2f} · Canto 6: {st.mean(p.canto6 for p in res):.2f}')
    print(f'  Chatarra final   {st.mean(p.chatarra for p in res):.1f} · reliquias {st.mean(p.reliquias for p in res):.1f}')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('-n', type=int, default=3000)
    ap.add_argument('--prota', choices=['piloto', 'nativo', 'mente', 'todos'], default='todos')
    ap.add_argument('--semilla', type=int, default=1)
    ap.add_argument('--traza', action='store_true')
    ap.add_argument('--estrategia', default='normal')
    a = ap.parse_args()
    ev = leer_eventos(); tablas = leer_tablas(ev)
    rng = random.Random(a.semilla)
    protas = ['piloto', 'nativo', 'mente'] if a.prota == 'todos' else [a.prota]
    if a.traza:
        p = Partida(protas[0], ev, tablas, rng, traza=True, estrategia=a.estrategia).jugar()
        print('FIN:', p.fin, 'día', p.dia, 'daños', p.danos)
        return
    vistos = Counter()
    for pr in protas:
        res = [Partida(pr, ev, tablas, rng, estrategia=a.estrategia).jugar() for _ in range(a.n)]
        for p in res: vistos.update(p.vistos)
        informe(res, pr)
    enc = {e for t in tablas.values() for f in t.values() for e in f if e}
    nunca = sorted(e for e in enc if not vistos[e])
    print(f'\nEventos de las tablas de encuentro: {len(enc)} · nunca visitados: {len(nunca)} {nunca[:20]}')


if __name__ == '__main__':
    main()
