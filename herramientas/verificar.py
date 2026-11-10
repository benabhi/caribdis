#!/usr/bin/env python3
"""Verifica el libro de Caribdis: enlaces rotos, entradas duplicadas, huérfanas y Marcas.

Uso: python3 verificar.py [carpeta_libro] [--montar salida.md]
"""
import re, sys, os, glob
from collections import defaultdict

base = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('--') else os.path.join(os.path.dirname(__file__), '..', 'libro')
files = sorted(glob.glob(os.path.join(base, '*.md')))

anchors = {}           # id -> file
dups = []
links = defaultdict(set)  # target -> set(source ids)
marks_given = defaultdict(set)
marks_used = defaultdict(set)
cur = None
text_all = ''

for f in files:
    s = open(f, encoding='utf-8').read()
    text_all += s + '\n\n'
    for line in s.splitlines():
        m = re.search(r'<a id="([re]\d{3})"></a>', line)
        if m:
            cur = m.group(1)
            if cur in anchors:
                dups.append(cur)
            anchors[cur] = os.path.basename(f)
            continue
        for t in re.findall(r'\]\(#([re]\d{3})\)', line):
            links[t].add(cur or os.path.basename(f))
        # bare references like "→ e214", "(r140)", "· e214`" also count as links
        for t in re.findall(r'(?<![\w#\[])([re]\d{3})(?![\w\]])', line):
            links[t].add(cur or os.path.basename(f))
        for mk in re.findall(r'`([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ0-9_]{2,})`', line):
            if re.search(r'(anota|gana|Gana|Anota)[^.]*`' + re.escape(mk) + '`', line):
                marks_given[mk].add(cur)
            else:
                marks_used[mk].add(cur)

broken = sorted(t for t in links if t not in anchors)
orphans = sorted(a for a in anchors if a not in links and a not in ('r001',) and not a.startswith('e00') )

print(f'Archivos: {len(files)}')
print(f'Entradas: {len(anchors)}  (reglas: {sum(1 for a in anchors if a[0]=="r")}, eventos: {sum(1 for a in anchors if a[0]=="e")})')
print(f'Palabras: {len(text_all.split())}')
print(f'Enlaces rotos ({len(broken)}):')
for b in broken:
    print('  ', b, '<-', ', '.join(sorted(x for x in links[b] if x)))
print(f'Duplicados ({len(dups)}):', dups)
print(f'Huérfanas ({len(orphans)}):', orphans)
never_used = sorted(m for m in marks_given if m not in marks_used and not m.startswith('FRAGMENTO_') and not m.startswith('RUTA_'))
never_given = sorted(m for m in marks_used if m not in marks_given and not m.endswith('_'))
print(f'Marcas que se ganan y nunca se consultan ({len(never_used)}):', ', '.join(never_used))
print(f'Marcas consultadas que nunca se ganan explícitamente ({len(never_given)}):', ', '.join(never_given))
frags = sorted(m for m in marks_given if m.startswith('FRAGMENTO_'))
print(f'Fragmentos distintos: {len(frags)}')

if '--montar' in sys.argv:
    out = sys.argv[sys.argv.index('--montar') + 1]
    with open(out, 'w', encoding='utf-8') as o:
        o.write(text_all)
    print('Libro montado en', out)

sys.exit(1 if broken or dups else 0)
