#!/usr/bin/env python3
"""Convierte el libro (caribdis/libro/*.md) en datos para la app.

Salida: app/datos/libro.json con
  entradas: {id: {id, tipo, n, titulo, cap, grupo, lugar, tiempo, md}}
  orden:    ids en el orden del libro
  tablas:   {region: {2d6: [e de alerta 1..4]}}
  marcas:   {MARCA: [ids donde aparece]}
  lore:     [{titulo, md}]    (Lo que se sabe de Caribdis, Bestiario, Tablas resumidas)
  iconos:   {nombre: cuerpo svg}
La app no reescribe el libro: lo lee. Cambia el libro, vuelve a correr esto.
"""
import glob, json, os, re, sys, datetime

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAIZ = os.path.dirname(APP)
sys.path.insert(0, os.path.join(RAIZ, 'maqueta'))
from iconos import ICONOS, EMBLEMAS  # noqa: E402

TABLAS = {1: 'e200', 2: 'e220', 3: 'e240', 4: 'e300', 5: 'e260', 6: 'e320', 7: 'e340', 8: 'e280'}


def main():
    archivos = sorted(glob.glob(os.path.join(RAIZ, 'libro', '*.md')))
    entradas, orden, lore = {}, [], []
    for f in archivos:
        base = os.path.basename(f)
        if base.startswith('91-'):
            continue
        texto = open(f, encoding='utf-8').read()
        cap, grupo = '', ''
        actual = None
        lore_actual = None
        bloque = []

        def cerrar():
            nonlocal actual, lore_actual, bloque
            md = '\n'.join(bloque).strip()
            md = re.sub(r'\n-{3,}\s*$', '', md).strip()
            if actual:
                e = entradas[actual]
                lineas = md.split('\n')
                # línea de lugar (cursiva justo bajo el título)
                if lineas and re.match(r'^\*[^*].*\*$', lineas[0].strip()):
                    e['lugar'] = lineas[0].strip().strip('*')
                    m = re.search(r'⌛\s*(0|día|\+1)', e['lugar'])
                    if m:
                        e['tiempo'] = m.group(1)
                    md = '\n'.join(lineas[1:]).strip()
                e['md'] = md
            elif lore_actual is not None:
                lore_actual['md'] = md
            actual, lore_actual, bloque = None, None, []

        for linea in texto.split('\n'):
            if re.match(r'^<a id="[re]\d{3}"></a>\s*$', linea):
                continue
            m2 = re.match(r'^## (.+)$', linea)
            m3 = re.match(r'^### (.+)$', linea)
            if m2:
                cerrar()
                cap = m2.group(1).strip()
                grupo = ''
                if base.startswith('90-') and cap in ('Bestiario', 'Tablas resumidas'):
                    lore_actual = {'titulo': cap, 'md': '', 'fuente': 'Apéndices'}
                    lore.append(lore_actual)
                continue
            if m3:
                t = m3.group(1).strip()
                mm = re.match(r'^([re])(\d{3}) · (.+)$', t)
                if mm:
                    cerrar()
                    eid = mm.group(1) + mm.group(2)
                    titulo = mm.group(3).strip()
                    if eid in entradas and len(entradas[eid].get('md', '')) > 0:
                        print('duplicado', eid, file=sys.stderr)
                    entradas[eid] = {'id': eid, 'tipo': mm.group(1), 'n': int(mm.group(2)), 'titulo': titulo,
                                     'cap': cap, 'grupo': grupo, 'lugar': '', 'tiempo': None, 'md': ''}
                    orden.append(eid)
                    actual = eid
                    continue
                if base.startswith('03-'):
                    cerrar()
                    lore_actual = {'titulo': t, 'md': '', 'fuente': 'Lo que se sabe de Caribdis'}
                    lore.append(lore_actual)
                    continue
                if base.startswith('90-'):
                    if lore_actual is not None:
                        bloque.append('#### ' + t)
                    continue
                if base.startswith('00-'):
                    continue
                cerrar()
                grupo = t
                continue
            bloque.append(linea)
        cerrar()

    # tablas de encuentros
    tablas = {}
    for reg, eid in TABLAS.items():
        filas = {}
        for m in re.finditer(r'^\| (\d+) \|(.+)\|$', entradas[eid]['md'], re.M):
            celdas = [c.strip() for c in m.group(2).split('|')]
            filas[m.group(1)] = [(re.search(r'e\d{3}', c) or [None])[0] for c in celdas]
        tablas[reg] = filas

    # índice de marcas
    marcas = {}
    idx = open(os.path.join(RAIZ, 'libro', '91-indice-marcas.md'), encoding='utf-8').read()
    for m in re.finditer(r'^\| `([^`]+)` \| (.+) \|$', idx, re.M):
        marcas[m.group(1)] = re.findall(r'\[([re]\d{3})\]', m.group(2))

    portada = open(os.path.join(RAIZ, 'libro', '00-portada.md'), encoding='utf-8').read()
    lema = re.search(r'^\*(.+)\*$', portada, re.M).group(1)

    datos = {
        'version': datetime.datetime.now().strftime('%Y-%m-%d %H:%M'),
        'lema': lema,
        'entradas': entradas, 'orden': orden, 'tablas': tablas, 'marcas': marcas, 'lore': lore,
        'iconos': ICONOS, 'emblemas': EMBLEMAS,
    }
    os.makedirs(os.path.join(APP, 'datos'), exist_ok=True)
    salida = os.path.join(APP, 'datos', 'libro.json')
    with open(salida, 'w', encoding='utf-8') as fh:
        json.dump(datos, fh, ensure_ascii=False, separators=(',', ':'))
    nr = sum(1 for e in entradas.values() if e['tipo'] == 'r')
    print(f'{len(entradas)} entradas ({nr} reglas, {len(entradas) - nr} eventos), {len(marcas)} marcas, '
          f'{len(lore)} textos de mundo · {os.path.getsize(salida) // 1024} KB')


if __name__ == '__main__':
    main()
