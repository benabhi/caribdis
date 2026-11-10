"""Iconografía de Caribdis: SVG en línea, trazo de tinta, heredan el color del texto.

Cada icono es un viewBox 0 0 24 24. `icono(nombre)` devuelve el <svg> listo para
insertarse en el HTML. Los símbolos del texto (⚔ ♫ ◉ ⌛ ⚙ ☰ ★) se sustituyen por
estos iconos al maquetar.
"""

_T = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"'

ICONOS = {
    # Dado: prueba
    'dado': '<rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor"/>'
            '<circle cx="8.2" cy="8.2" r="1.7" fill="#2b201b"/><circle cx="12" cy="12" r="1.7" fill="#2b201b"/>'
            '<circle cx="15.8" cy="15.8" r="1.7" fill="#2b201b"/>',
    # Herida: tajo sobre una gota
    'herida': f'<path d="M12 3c3.6 4.4 6 7.6 6 10.6a6 6 0 0 1-12 0C6 10.6 8.4 7.4 12 3z" {_T}/>'
              f'<path d="M8.5 15.5l7-4" {_T}/>',
    # Canto: ondas que suben desde un punto
    'canto': '<circle cx="12" cy="18" r="1.8" fill="currentColor"/>'
             f'<path d="M8.2 14.6a5.4 5.4 0 0 1 7.6 0" {_T}/><path d="M5.3 11.7a9.5 9.5 0 0 1 13.4 0" {_T}/>'
             f'<path d="M2.6 8.8a13.4 13.4 0 0 1 18.8 0" {_T}/>',
    # Alerta: ojo con pupila en diana
    'alerta': f'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" {_T}/>'
              f'<circle cx="12" cy="12" r="3.2" {_T}/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
    # Tiempo: reloj de arena
    'tiempo': f'<path d="M6.5 3h11M6.5 21h11" {_T}/>'
              f'<path d="M7.5 3c0 5 4.5 6 4.5 9s-4.5 4-4.5 9M16.5 3c0 5-4.5 6-4.5 9s4.5 4 4.5 9" {_T}/>'
              '<path d="M9.5 19.2h5l-2.5-2.6z" fill="currentColor"/>',
    # Objeto/chatarra: tuerca
    'objeto': f'<path d="M12 2.8l8 4.6v9.2l-8 4.6-8-4.6V7.4z" {_T}/><circle cx="12" cy="12" r="3.3" {_T}/>',
    # Reputación: estandarte
    'reputacion': f'<path d="M6 21V3" {_T}/><path d="M6 4h12l-3 4 3 4H6" {_T}/>',
    # Hito: estrella de cuatro puntas
    'hito': '<path d="M12 1.8l2.4 7.8 7.8 2.4-7.8 2.4L12 22.2l-2.4-7.8L1.8 12l7.8-2.4z" fill="currentColor"/>',
    # Marca: marcapáginas
    'marca': f'<path d="M7 3h10v18l-5-4-5 4z" {_T}/>',
    # Pista: brújula
    'pista': f'<circle cx="12" cy="12" r="9" {_T}/><path d="M15.5 8.5l-2 5-5 2 2-5z" fill="currentColor"/>',
    # Ir a: flecha de rumbo
    'ir': f'<path d="M4 12h14M13 6l6 6-6 6" {_T}/>',
    # Ayuda / consejo / ejemplo / recuerda
    'ayuda': f'<circle cx="12" cy="12" r="9" {_T}/><path d="M9.5 9.3a2.6 2.6 0 1 1 3.6 2.4c-.8.4-1.1.9-1.1 1.8" {_T}/>'
             '<circle cx="12" cy="16.8" r="1.1" fill="currentColor"/>',
    'ejemplo': f'<rect x="3" y="6" width="12" height="12" rx="2.5" {_T}/><rect x="10" y="3" width="11" height="11" rx="2.5" {_T}/>'
               '<circle cx="7" cy="14" r="1.2" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.2" fill="currentColor"/>',
    'recuerda': f'<path d="M12 3l9.5 17h-19z" {_T}/><path d="M12 9.5v5" {_T}/><circle cx="12" cy="17.3" r="1.1" fill="currentColor"/>',
    'consejo': f'<path d="M9 18h6M10 21h4" {_T}/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2h5c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3z" {_T}/>',
    # Combate: dos hojas cruzadas
    'combate': f'<path d="M4 4l11 11M20 4L9 15" {_T}/><path d="M13 17l4 4M11 17l-4 4M15 15l3-1-1 3M9 15l-3-1 1 3" {_T}/>',
    # Nave
    'nave': f'<path d="M12 2.5c3 2.5 4.5 6 4.5 10.5L19 17h-4l-1 3h-4l-1-3H5l2.5-4C7.5 8.5 9 5 12 2.5z" {_T}/>'
            f'<circle cx="12" cy="10" r="1.8" {_T}/>',
    # Región / mapa
    'mapa': f'<path d="M3 6l6-2.5 6 2.5 6-2.5v14.5L15 20.5 9 18l-6 2.5z" {_T}/><path d="M9 3.5V18M15 6v14.5" {_T}/>',
    # Asentamiento
    'asentamiento': f'<path d="M3 20h18M5 20V10l7-5 7 5v10" {_T}/><path d="M10 20v-5h4v5" {_T}/>',
    # Reliquia
    'reliquia': f'<path d="M12 2.5l7 5v9l-7 5-7-5v-9z" {_T}/><path d="M12 7.5l3.5 2.5v4L12 16.5 8.5 14v-4z" fill="currentColor" opacity=".55"/>',
    # Calavera discreta (fin de partida)
    'fin': f'<path d="M5 11a7 7 0 1 1 14 0c0 2.4-1.2 3.8-2.5 4.6V19h-9v-3.4C6.2 14.8 5 13.4 5 11z" {_T}/>'
           '<circle cx="9.3" cy="11" r="1.6" fill="currentColor"/><circle cx="14.7" cy="11" r="1.6" fill="currentColor"/>',
    # Ornamento separador
    'rombo': '<path d="M12 4l8 8-8 8-8-8z" fill="currentColor"/>',
}

# Emblemas de facción (viewBox 0 0 48 48)
_E = 'fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"'
EMBLEMAS = {
    'hijos': f'<circle cx="24" cy="24" r="21" {_E}/><path d="M10 28c6 6 22 6 28 0M14 18c4 3 16 3 20 0M24 9v30" {_E}/>'
             f'<path d="M16 34l-3 5M32 34l3 5" {_E}/>',
    'desguaces': f'<circle cx="24" cy="24" r="21" {_E}/><path d="M24 10v6M24 32v6M10 24h6M32 24h6M14 14l4 4M30 30l4 4M34 14l-4 4M18 30l-4 4" {_E}/>'
                 f'<circle cx="24" cy="24" r="7" {_E}/>',
    'coro': f'<circle cx="24" cy="24" r="21" {_E}/><circle cx="24" cy="30" r="2.6" fill="currentColor"/>'
            f'<path d="M18 25a8.5 8.5 0 0 1 12 0M13.5 20.5a15 15 0 0 1 21 0M9.5 16a20.5 20.5 0 0 1 29 0" {_E}/>',
    'vigias': f'<circle cx="24" cy="24" r="21" {_E}/><path d="M24 8l13 24H11z" {_E}/><path d="M17.5 25h13" {_E}/>',
}


def icono(nombre, clase=''):
    cuerpo = ICONOS[nombre]
    return (f'<svg class="ico ico-{nombre} {clase}" viewBox="0 0 24 24" '
            f'xmlns="http://www.w3.org/2000/svg" aria-hidden="true">{cuerpo}</svg>')


def emblema(nombre, clase=''):
    return (f'<svg class="emblema {clase}" viewBox="0 0 48 48" '
            f'xmlns="http://www.w3.org/2000/svg" aria-hidden="true">{EMBLEMAS[nombre]}</svg>')


# Símbolo del texto → icono
SIMBOLOS = {
    '⚔': 'herida', '♫': 'canto', '◉': 'alerta', '⌛': 'tiempo',
    '⚙': 'objeto', '☰': 'reputacion', '★': 'hito',
}
