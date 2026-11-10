"""Reparto de columnas más fino para WeasyPrint 70.

WeasyPrint equilibra el último tramo de un bloque a varias columnas subiendo la altura a saltos
(el alto entero del siguiente bloque), y por eso muchas columnas acaban desparejas. Aquí se
cambia ese bucle por una búsqueda binaria: la altura más baja (con 1 px de margen) en la que
todo el contenido cabe. Se aplica al importar este módulo, antes de componer el libro."""
import inspect
import weasyprint.layout.column as _col
import weasyprint.layout.block as _block

_VIEJO = """            if balancing:
                if column_skip_stack is None:
                    # We rendered the whole content, stop
                    break

                # Increase the column heights and render them again
                add_height = 1 if lost_space == inf else lost_space
                height += add_height

                if height > max_height:
                    # We reached max height, stop rendering
                    height = max_height
                    stop_rendering = True
                    break
"""
_NUEVO = """            if balancing:
                if column_skip_stack is None:
                    _hi = height
                    if _lo is None or _hi - _lo <= 1:
                        break
                    height = (_lo + _hi) / 2
                    continue
                _lo = height
                if _hi is None:
                    add_height = 1 if lost_space == inf else lost_space
                    height += add_height
                    if height > max_height:
                        height = max_height
                        stop_rendering = True
                        break
                elif _hi - _lo <= 1:
                    height = _hi
                else:
                    height = (_lo + _hi) / 2
                continue
"""
_src = inspect.getsource(_col)
assert _VIEJO in _src, 'columnas_justas: la versión de WeasyPrint no coincide'
_src = _src.replace(_VIEJO, _NUEVO)
_src = _src.replace("        page_is_empty = stop_rendering = balancing = False\n",
                    "        page_is_empty = stop_rendering = balancing = False\n        _lo = _hi = None\n")
_ns = dict(vars(_col))
exec(compile(_src, _col.__file__, 'exec'), _ns)
_col.columns_layout = _ns['columns_layout']
_block.columns_layout = _ns['columns_layout']
