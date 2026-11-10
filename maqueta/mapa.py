"""Mapa de las ocho regiones de Caribdis en SVG (vecindades de r150)."""

REGIONES = {
    1: ('Dunas de Óxido', 'La Cicatriz', (150, 395), 'e200'),
    2: ('Cementerio de Naves', 'Puerto Chatarra', (205, 268), 'e220'),
    3: ('Salinas Blancas', 'Refinería', (92, 150), 'e240'),
    4: ('Cañones de las Bestias', 'Quilla', (452, 395), 'e300'),
    5: ('Bosque Petrificado', 'Santuario', (402, 268), 'e260'),
    6: ('Ciudad Enterrada', 'El Nodo', (300, 160), 'e320'),
    7: ('Torres del Canto', 'El Atrio', (512, 150), 'e340'),
    8: ('Polo Helado', 'El Pozo', (300, 50), 'e280'),
}
VECINAS = [(1, 2), (1, 3), (1, 4), (2, 3), (2, 6), (3, 8), (4, 5), (4, 7), (5, 6), (5, 7), (6, 8), (7, 8)]

ROJO = '#9e3a22'
TINTA = '#2b201b'
AZUL = '#5f8f9c'
PAPEL = '#f1e8d6'


def svg_mapa(clase='mapa', enlaces=True):
    p = []
    p.append(f'<svg class="{clase}" viewBox="0 0 600 470" xmlns="http://www.w3.org/2000/svg">')
    # anillos del Canto alrededor de las Torres
    x7, y7 = REGIONES[7][2]
    for r in (40, 62, 86, 112):
        p.append(f'<circle cx="{x7}" cy="{y7}" r="{r}" fill="none" stroke="{AZUL}" stroke-width="0.9" '
                 f'stroke-dasharray="2 4" opacity="{0.75 - r / 200:.2f}"/>')
    # sendas
    for a, b in VECINAS:
        xa, ya = REGIONES[a][2]
        xb, yb = REGIONES[b][2]
        mx, my = (xa + xb) / 2, (ya + yb) / 2
        # pequeña curva para que no parezca un diagrama
        dx, dy = (yb - ya), (xa - xb)
        k = 0.08
        cx, cy = mx + dx * k, my + dy * k
        p.append(f'<path d="M{xa},{ya} Q{cx:.1f},{cy:.1f} {xb},{yb}" fill="none" stroke="{TINTA}" '
                 f'stroke-width="1.6" stroke-dasharray="6 4" stroke-linecap="round" opacity=".7"/>')
    # nodos
    et = []
    for n, (nombre, lugar, (x, y), tabla) in REGIONES.items():
        g = []
        g.append(f'<circle cx="{x}" cy="{y}" r="27" fill="#efe4cd" stroke="{TINTA}" stroke-width="2"/>')
        g.append(f'<circle cx="{x}" cy="{y}" r="22" fill="none" stroke="{ROJO}" stroke-width="1" stroke-dasharray="1.5 2.5"/>')
        g.append(f'<text x="{x}" y="{y + 9}" text-anchor="middle" font-family="Big Shoulders Stencil Display" '
                 f'font-weight="800" font-size="27" fill="{ROJO}">{n}</text>')
        ty = y + 46 if n != 8 else y + 44
        w1, w2 = len(nombre) * 8.2 + 10, len(f'{lugar} · {tabla}') * 5.6 + 10
        et.append(f'<rect x="{x - w1 / 2:.1f}" y="{ty - 13}" width="{w1:.1f}" height="16" rx="3" fill="{PAPEL}"/>')
        et.append(f'<rect x="{x - w2 / 2:.1f}" y="{ty + 4}" width="{w2:.1f}" height="14" rx="3" fill="{PAPEL}"/>')
        et.append(f'<text x="{x}" y="{ty}" text-anchor="middle" font-family="Barlow Condensed" font-weight="700" '
                  f'font-size="15" letter-spacing="1.2" fill="{TINTA}">{nombre.upper()}</text>')
        et.append(f'<text x="{x}" y="{ty + 15}" text-anchor="middle" font-family="Spectral" font-style="italic" '
                  f'font-size="12" fill="#5a4a40">{lugar} · {tabla}</text>')
        cuerpo = ''.join(g)
        if enlaces:
            p.append(f'<a href="#{tabla}">{cuerpo}</a>')
        else:
            p.append(cuerpo)
    # etiquetas, encima de todo y con halo de papel
    p.append(''.join(et))
    # rosa de los vientos
    p.append(f'<g transform="translate(48,428)" stroke="{TINTA}" fill="none" stroke-width="1.2">'
             f'<circle r="16"/><path d="M0,-26 L5,0 L0,26 L-5,0Z" fill="{TINTA}"/><path d="M-26,0 L0,4 L26,0 L0,-4Z"/>'
             f'</g><text x="48" y="396" text-anchor="middle" font-family="Barlow Condensed" font-weight="700" '
             f'font-size="11" fill="{TINTA}">N</text>')
    p.append('</svg>')
    return ''.join(p)
