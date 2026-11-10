#!/usr/bin/env python3
"""
CARIBDIS · construir la app
Une los módulos de src/ en un único dist/index.html y prepara las
ilustraciones, las fuentes y three.js en dist/. El resultado es una
página estática: se puede abrir en local o publicar en GitHub Pages.
El botón del manual enlaza al PDF del repositorio (REPO, abajo).

Uso:  cd caribdis/app && python3 herramientas/construir_app.py
"""
import json, re, shutil, subprocess, sys
from pathlib import Path
from PIL import Image

APP = Path(__file__).resolve().parent.parent
RAIZ = APP.parent
SRC = APP / 'src'
DIST = APP / 'dist'

ORDEN_JS = ['motor.js', 'texto.js', 'dados.js', 'ui-nucleo.js', 'ui-hoja.js', 'ui-mesa.js', 'ui-crear.js', 'manual.js']
# repositorio del libro: de aquí sale el enlace de descarga del manual
REPO = 'https://github.com/benabhi/caribdis'
RAMA = 'main'
PDF = 'Caribdis.pdf'

# ilustraciones: (patrón, ancho máximo)
ARTE = [('r-*.jpg', 1280), ('b-*.jpg', 1200), ('crew-*.jpg', 440), ('piloto.jpg', 720), ('nativo.jpg', 720),
        ('mente.jpg', 720), ('portada.jpg', 520), ('portada-panoramica.jpg', 2000)]


def datos():
    subprocess.run([sys.executable, str(APP / 'herramientas' / 'construir_datos.py')], check=True, cwd=APP)


def arte():
    dest = DIST / 'arte'
    dest.mkdir(parents=True, exist_ok=True)
    hechos = 0
    for patron, ancho in ARTE:
        for f in sorted((RAIZ / 'arte').glob(patron)):
            out = dest / f.name
            if out.exists() and out.stat().st_mtime > f.stat().st_mtime:
                continue
            im = Image.open(f).convert('RGB')
            if im.width > ancho:
                im = im.resize((ancho, round(im.height * ancho / im.width)), Image.LANCZOS)
            im.save(out, 'JPEG', quality=78, optimize=True, progressive=True)
            hechos += 1
    # el logo de la editorial (pantalla de inicio): PNG con transparencia
    logo = Image.open(RAIZ / 'arte' / 'marca' / 'utopia-logo-claro.png').convert('RGBA')
    logo = logo.resize((480, round(logo.height * 480 / logo.width)), Image.LANCZOS)
    logo.save(dest / 'utopia.png', 'PNG', optimize=True)
    for n in ['papel.jpg', 'papel-oscuro.jpg']:
        im = Image.open(RAIZ / 'maqueta' / n).convert('RGB')
        im.save(dest / n, 'JPEG', quality=72, optimize=True, progressive=True)
    total = sum(p.stat().st_size for p in dest.iterdir())
    print(f'arte: {hechos} nuevas, {len(list(dest.iterdir()))} archivos, {total / 1048576:.1f} MB')


def mapa_svg():
    """El mapa del manual (maqueta/mapa.py), con sus regiones enlazadas al Códice."""
    sys.path.insert(0, str(RAIZ / 'maqueta'))
    from mapa import svg_mapa
    svg = svg_mapa(clase='mapa-libro', enlaces=True)
    svg = re.sub(r'<a href="#(e\d{3})">', r'<a class="ref" href="#\1" data-ref="\1"><title>Abrir la tabla \1</title>', svg)
    return svg.replace('<svg ', '<svg role="img" aria-label="Mapa de las ocho regiones de Caribdis" ', 1)


def vendor():
    """three.js y las fuentes van dentro de la app: funciona sin internet."""
    (DIST / 'vendor').mkdir(parents=True, exist_ok=True)
    shutil.copy2(APP / 'vendor' / 'three.min.js', DIST / 'vendor' / 'three.min.js')
    (DIST / 'fuentes').mkdir(parents=True, exist_ok=True)
    for f in (APP / 'vendor' / 'fuentes').glob('*.woff2'):
        shutil.copy2(f, DIST / 'fuentes' / f.name)


def pagina():
    plantilla = (SRC / 'plantilla.html').read_text(encoding='utf-8')
    css = (SRC / 'estilo.css').read_text(encoding='utf-8')
    base = (SRC / 'base.js').read_text(encoding='utf-8')
    js = '\n'.join((SRC / f).read_text(encoding='utf-8') for f in ORDEN_JS)
    libro = (APP / 'datos' / 'libro.json').read_text(encoding='utf-8')
    libro = json.loads(libro)
    libro['mapa_svg'] = mapa_svg()
    # la entradilla de «Lo que se sabe de Caribdis», para el Códice
    m = re.search(r'^## Lo que se sabe de Caribdis\s*\n+\*(.+?)\*\s*$', (RAIZ / 'libro' / '03-mundo.md').read_text(encoding='utf-8'), re.M)
    libro['lore_intro'] = m.group(1) if m else ''
    # r191 · a qué verdad apunta cada FRAGMENTO_ (la misma tabla que usa el índice de Marcas)
    sys.path.insert(0, str(RAIZ / 'herramientas'))
    from verdades import VERDADES
    libro['verdades'] = VERDADES
    libro['repo'] = {'url': REPO, 'pdf': PDF, 'descarga': f'{REPO}/raw/{RAMA}/{PDF}', 'carpeta': f'{REPO}/blob/{RAMA}/{PDF}'}
    libro = json.dumps(libro, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    fuentes = (APP / 'vendor' / 'fuentes' / 'fuentes.css').read_text(encoding='utf-8')
    for k, v in [('FUENTES', fuentes), ('CSS', css), ('BASE', base), ('LIBRO', libro), ('JS', js)]:
        if '</script' in v.lower() and k != 'CSS':
            raise SystemExit(f'{k} contiene </script>')
        plantilla = plantilla.replace(f'/*@@{k}@@*/', v)
    # Documento completo (modo estándar).
    if not plantilla.lstrip().lower().startswith('<!doctype'):
        plantilla = ('<!doctype html>\n<meta name="viewport" content="width=device-width,'
                     'initial-scale=1,viewport-fit=cover">\n') + plantilla
    (DIST / 'index.html').write_text(plantilla, encoding='utf-8')
    print(f'index.html: {len(plantilla.encode()) / 1048576:.2f} MB')


if __name__ == '__main__':
    DIST.mkdir(exist_ok=True)
    datos()
    arte()
    vendor()
    vieja = DIST / 'manual'  # el PDF troceado de versiones anteriores ya no hace falta
    if vieja.exists():
        shutil.rmtree(vieja)
    pagina()
