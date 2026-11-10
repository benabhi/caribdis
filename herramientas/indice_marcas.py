#!/usr/bin/env python3
"""Regenera libro/91-indice-marcas.md a partir de las Marcas citadas en el libro."""
import re, glob, os
from collections import defaultdict
base = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'libro')
usos = defaultdict(set)
NO_SON_MARCAS = {'MARCA', 'VERSALITAS'}
for f in sorted(glob.glob(os.path.join(base, '*.md'))):
    if f.endswith('91-indice-marcas.md'):
        continue
    cur = None
    for line in open(f, encoding='utf-8'):
        m = re.search(r'<a id="([re]\d{3})"></a>', line)
        if m:
            cur = m.group(1); continue
        if cur:
            for mk in re.findall(r'`([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ0-9_]{2,})`', line):
                if mk in NO_SON_MARCAS or mk.endswith('_'):
                    continue      # ejemplos del texto y prefijos (FRAGMENTO_, PERDIDO_)
                usos[mk].add(cur)
out = ['', '---', '', '## Índice de Marcas', '',
       '*Dónde aparece cada Marca. Útil para saber qué abre lo que llevas anotado.*', '',
       '| Marca | Entradas |', '|---|---|']
for mk in sorted(usos):
    out.append(f'| `{mk}` | ' + ' · '.join(f'[{e}](#{e})' for e in sorted(usos[mk])) + ' |')
open(os.path.join(base, '91-indice-marcas.md'), 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print(len(usos), 'marcas')
