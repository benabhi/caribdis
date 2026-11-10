#!/usr/bin/env python3
"""Revisa la maquetación del PDF ya generado.

Busca dos defectos:
  1. Títulos de entrada (rXXX / eXXX) que quedan al pie de una página con
     menos de 3 líneas de texto debajo en su columna (títulos huérfanos).
  2. Huecos grandes: bandas vacías de más del 20 % del alto de la caja, por columna.

Uso: python3 herramientas/revisar_maqueta.py [Caribdis.pdf]
"""
import os, re, subprocess, sys, tempfile, glob
import xml.etree.ElementTree as ET

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
pdf = sys.argv[1] if len(sys.argv) > 1 else os.path.join(RAIZ, 'Caribdis.pdf')


def huerfanos():
    xml = subprocess.run(['pdftotext', '-bbox-layout', pdf, '-'], capture_output=True, text=True).stdout
    xml = re.sub(r'<!DOCTYPE[^>]*>', '', xml)
    xml = re.sub(r'xmlns="[^"]*"', '', xml)
    raiz = ET.fromstring(xml)
    malos = []
    for n, pag in enumerate(raiz.iter('page'), 1):
        H = float(pag.get('height')); W = float(pag.get('width'))
        lineas = []
        for ln in pag.iter('line'):
            ws = [w.text or '' for w in ln.iter('word')]
            if not ws:
                continue
            lineas.append((float(ln.get('xMin')), float(ln.get('yMin')), float(ln.get('yMax')), ' '.join(ws)))
        pie = H * 0.905          # por debajo empieza el folio
        for x, y0, y1, t in lineas:
            letras = re.sub(r'[^A-Za-zÁÉÍÓÚÑáéíóúñ]', '', t)
            titulo = bool(re.match(r'^\d{3}\s', t)) and len(letras) >= 3 and letras.upper() == letras and 13 <= (y1 - y0) <= 30
            capitulo = len(letras) >= 4 and letras.upper() == letras and (y1 - y0) >= 24
            if capitulo and H * 0.6 < y0 < H * 0.9 and len(lineas) > 30:
                debajo = [l for l in lineas if y1 + 1 < l[1] < H * 0.905]
                if len(debajo) < 4:
                    malos.append((n, 'CAPÍTULO ' + t[:40], len(debajo)))
                continue
            if not titulo or y0 < H * 0.62 or y0 > H * 0.9:
                continue
            col = 'izq' if x < W * 0.5 else 'der'
            debajo = [l for l in lineas if l[1] > y1 + 1 and l[1] < pie and
                      ((l[0] < W * 0.5) == (col == 'izq') or l[0] < W * 0.2 and col == 'izq')]
            if len(debajo) < 3:
                malos.append((n, t[:50], len(debajo)))
    return malos


def huecos():
    import numpy as np
    from PIL import Image
    d = tempfile.mkdtemp()
    subprocess.run(['pdftoppm', '-r', '30', '-png', pdf, d + '/p'])
    out = []
    for f in sorted(glob.glob(d + '/*.png')):
        a = np.asarray(Image.open(f).convert('L')).astype(float)
        h, w = a.shape
        n = int(f.split('-')[-1][:-4])
        cuerpo = a[int(h * .09):int(h * .91), int(w * .08):int(w * .92)]
        med = np.median(cuerpo)
        if med < 110:
            continue          # láminas y páginas oscuras
        for nom, c in (('izq', cuerpo[:, :cuerpo.shape[1] // 2]), ('der', cuerpo[:, cuerpo.shape[1] // 2:])):
            filas = (np.abs(c - med) > 35).mean(axis=1) > 0.015
            mejor = cur = 0
            for r in filas:
                cur = 0 if r else cur + 1
                mejor = max(mejor, cur)
            if mejor / len(filas) > 0.2:
                out.append((n, nom, round(mejor / len(filas), 2)))
    return out


if __name__ == '__main__':
    h = huerfanos()
    print(f'Títulos huérfanos ({len(h)}):')
    for x in h:
        print('  p.%d  %s  (%d líneas debajo)' % x)
    g = huecos()
    print(f'Huecos > 20 % ({len(g)}):')
    for x in g:
        print('  p.%d  %s  %.0f %%' % (x[0], x[1], x[2] * 100))
