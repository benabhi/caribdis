#!/usr/bin/env python3
"""
Genera la versión Print-Friendly (blanco y negro, bajo consumo de tinta y alta
legibilidad) a partir del PDF compilado de Caribdis (`Caribdis.pdf`).

Conserva el 100 % de la maquetación, paginación (200 páginas), fuentes
incrustadas, marcadores (TOC) e hipervínculos internos (#e001, #r140, etc.).

Uso:
    python3 generar_print_friendly.py
    python3 generar_print_friendly.py --entrada Caribdis.pdf --salida Caribdis_Print_Friendly.pdf
"""

import argparse
import io
import os
import re
import numpy as np
from PIL import Image, ImageFilter
import pymupdf


def process_art_image(pil_img, is_full_bleed=False):
    """
    Convierte ilustraciones RGB a blanco y negro de bajo consumo de tinta
    preservando el contraste local (líneas de tinta nítidas sobre medios tonos
    y sombras aclaradas).
    """
    gray = pil_img.convert("L")
    arr = np.asarray(gray, dtype=np.float32) / 255.0

    # Capa base suave (iluminación de baja frecuencia / aguadas oscuras)
    radius = max(12, int(min(gray.size) * 0.025))
    blur_img = gray.filter(ImageFilter.GaussianBlur(radius=radius))
    base = np.asarray(blur_img, dtype=np.float32) / 255.0

    # Capa de detalle (trazos de tinta y texturas de alta frecuencia)
    detail = arr - base

    if is_full_bleed:
        # Láminas a sangre, portada y contratapa: levantar sombras con fuerza
        # para ahorrar el máximo de tóner/tinta
        base_lifted = 0.58 + 0.42 * (base ** 0.62)
        detail_boost = np.where(detail < 0, detail * 2.35, detail * 1.35)
        out = np.clip(base_lifted + detail_boost, 0.08, 1.0)

        # Esfumado blanco suave en los bordes de página para evitar gasto de
        # tinta y cortes bruscos en los márgenes no imprimibles de impresoras hogareñas
        h, w = out.shape
        y_idx = np.linspace(0, 1, h)[:, None]
        x_idx = np.linspace(0, 1, w)[None, :]
        mx = 0.045  # ~7.5 mm en los laterales
        my = 0.035  # ~8.5 mm arriba/abajo
        fx = np.clip(np.minimum(x_idx, 1.0 - x_idx) / mx, 0.0, 1.0)
        fy = np.clip(np.minimum(y_idx, 1.0 - y_idx) / my, 0.0, 1.0)
        edge_mask = (fx * fy) ** 0.7
        out = 1.0 - (1.0 - out) * edge_mask
    else:
        # Bandas de capítulo, retratos, medallones y viñetas interiores
        base_lifted = 0.46 + 0.53 * (base ** 0.65)
        detail_boost = np.where(detail < 0, detail * 2.2, detail * 1.4)
        out = np.clip(base_lifted + detail_boost, 0.04, 1.0)

    out_u8 = (out * 255.0).round().astype(np.uint8)
    return Image.fromarray(out_u8, mode="L")


def get_path_height(path_str):
    """Calcula la altura aproximada en puntos de un trazado PDF (`re` o `m/l/c`)."""
    m_re = re.search(r'[0-9.-]+\s+[0-9.-]+\s+[0-9.-]+\s+([0-9.-]+)\s+re\b', path_str)
    if m_re:
        return abs(float(m_re.group(1)))
    ys = [float(m.group(1)) for m in re.finditer(r'[0-9.-]+\s+([0-9.-]+)\s+(?:m|l)\b', path_str)]
    if len(ys) >= 2:
        return max(ys) - min(ys)
    return 15.0


def transform_stream(stream_str):
    """
    Transforma los operadores de color y relleno de un flujo de contenido PDF
    (página o Form XObject vectorial) al esquema Print-Friendly B&W.
    """
    # 1. Fondos CSS con esquinas redondeadas (border-radius):
    # WeasyPrint emite un recorte redondeado exterior (`m ... l/c ... W n`) que
    # envuelve un rectángulo `re` interior relleno (`f`). Rellenamos el interior
    # en gris claro/blanco y trazamos el contorno redondeado exterior (`S`).
    re_rounded_bg = re.compile(
        r'q\n([0-9.-]+\s+[0-9.-]+\s+m\n(?:[0-9.-]+\s+)+(?:l|c)\n(?:[^W]+?\n)?)'
        r'W\nn\n'
        r'q\n(/a([0-9.]+)\s+gs\n)?(?:([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s+rg\n)?'
        r'([0-9.-]+\s+[0-9.-]+\s+([0-9.-]+)\s+([0-9.-]+)\s+re)\nW\nn\n\7\nf\nQ\nQ'
    )

    def repl_rounded_bg(m):
        round_path = m.group(1)
        alpha = float(m.group(3)) if m.group(3) else 1.0
        rect_path = m.group(7)
        w = abs(float(m.group(8)))
        h = abs(float(m.group(9)))

        if alpha < 0.80:
            if alpha <= 0.08 and h < 10.5:
                # Etiqueta `code` en línea
                return (
                    f"q\n{round_path}W\nn\n"
                    f"q\n/a0.06 gs\n0 0 0 rg\n{rect_path}\nW\nn\n{rect_path}\nf\nQ\nQ"
                )
            else:
                # Resaltado `.marca` o círculos blancos translúcidos (`.dano-pip`, `.circ` en hojas)
                return (
                    f"q\n{round_path}W\nn\n"
                    f"q\n/a1.0 gs\n1 1 1 rg\n{rect_path}\nW\nn\n{rect_path}\nf\nQ\nQ"
                )

        if w < 9.0 and h < 9.0:
            # Punto de línea de tiempo (`.arco-punto`, que ya tiene su propio borde circular)
            return (
                f"q\n{round_path}W\nn\n"
                f"q\n/a1.0 gs\n1 1 1 rg\n{rect_path}\nW\nn\n{rect_path}\nf\nQ\nQ"
            )

        # Pastillas y círculos opacos (`.prueba`, `ol.opciones > li::before`, `.im-v`, `.tag`)
        return (
            f"q\n{round_path}W\nn\n"
            f"q\n/a1.0 gs\n0.90 0.90 0.90 rg\n{rect_path}\nW\nn\n{rect_path}\nf\nQ\nQ\n"
            f"q\n/a1.0 gs\n0.12 0.12 0.12 RG\n0.85 w\n[] 0 d\n{round_path}h\nS\nQ"
        )

    stream_str = re_rounded_bg.sub(repl_rounded_bg, stream_str)

    # 2. Fondos CSS rectangulares o poligonales (incluyendo los que heredan `rg`):
    re_css_bg = re.compile(
        r'q\n(/a([0-9.]+)\s+gs\n)?(?:([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s+rg\n)?([^Q]+?)\nW\nn\n\6\nf\nQ'
    )

    def repl_css_bg(m):
        alpha = float(m.group(2)) if m.group(2) else 1.0
        has_rgb = m.group(3) is not None
        r = float(m.group(3)) if has_rgb else 0.1686
        g = float(m.group(4)) if has_rgb else 0.1255
        b = float(m.group(5)) if has_rgb else 0.1059
        path = m.group(6)
        hex_c = f"#{round(r*255):02x}{round(g*255):02x}{round(b*255):02x}"

        # Rectángulo de fondo de página completa -> blanco puro
        if '0 0 642.519685 908.598425 re' in path:
            return f"q\n/a1.0 gs\n1 1 1 rg\n{path}\nW\nn\n{path}\nf\nQ"

        # Rellenos semitransparentes (excepto /a0.92 que corresponde a .entrada.mente)
        if alpha < 0.80:
            if alpha <= 0.055:
                # Filas pares de tablas
                return f"q\n/a0.05 gs\n0 0 0 rg\n{path}\nW\nn\n{path}\nf\nQ"
            elif alpha in (0.09, 0.1):
                # `.marca` en línea (ya cuenta con línea inferior)
                return f"q\n/a1.0 gs\n1 1 1 rg\n{path}\nW\nn\n{path}\nf\nQ"
            elif alpha <= 0.12:
                # `.caja`, `.recuerda-mini`, `code`, `.h-secreto`, `.zona-oscura .enemigo`
                return f"q\n/a0.05 gs\n0 0 0 rg\n{path}\nW\nn\n{path}\nf\nQ"
            else:
                # Cajas blancas/translúcidas en hojas de registro (`.c`, `.h-attr`, `.doc-libro`)
                return f"q\n/a1.0 gs\n1 1 1 rg\n{path}\nW\nn\n{path}\nf\nQ"

        if hex_c == '#ffffff':
            return f"q\n/a1.0 gs\n1 1 1 rg\n{path}\nW\nn\n{path}\nf\nQ"

        # Contenedores crema/pergamino (`.enemigo`, `.grupo-asent`, `.grupo-crew`, `.doc-notas`, `.doc-carta`)
        if hex_c in ('#f3ebda', '#e7dbc3', '#efe3c8', '#f6eedd'):
            return f"q\n/a1.0 gs\n0.965 0.965 0.965 rg\n0.2 0.2 0.2 RG\n0.6 w\n{path}\nW\nn\n{path}\nB\nQ"

        # Cajas oscuras grandes (`.arco`, `.panel`, `.doc-himno`, `pre.terminal`, `.doc-rumores`, `.entrada.mente`)
        # frente a encabezados de tabla y celdas destacadas (`table th`, `.h-attr-n`, `.rl.hito`)
        h_est = get_path_height(path)
        if h_est > 28.0:
            return f"q\n/a1.0 gs\n0.96 0.96 0.96 rg\n0.15 0.15 0.15 RG\n1.0 w\n{path}\nW\nn\n{path}\nB\nQ"
        else:
            return f"q\n/a1.0 gs\n0.915 0.915 0.915 rg\n0.12 0.12 0.12 RG\n0.8 w\n{path}\nW\nn\n{path}\nB\nQ"

    stream_str = re_css_bg.sub(repl_css_bg, stream_str)

    # 3. Bordes CSS y anillos de sombra (`\nf*\nQ`):
    re_border = re.compile(
        r'((?:W\*\nn\n)?(?:/a[0-9.]+\s+gs\n)?)([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s+rg\n([^Q]+?\nf\*\nQ)'
    )

    def repl_border(m):
        prefix = m.group(1)
        r, g, b = float(m.group(2)), float(m.group(3)), float(m.group(4))
        rest = m.group(5)
        hex_c = f"#{round(r*255):02x}{round(g*255):02x}{round(b*255):02x}"
        # Anillo espaciador alrededor de medallones/viñetas -> blanco puro
        if hex_c in ('#f3ebda', '#1d1512'):
            return f"{prefix}1 1 1 rg\n{rest}"
        return f"{prefix}0.12 0.12 0.12 rg\n{rest}"

    stream_str = re_border.sub(repl_border, stream_str)

    # 4. Rellenos vectoriales SVG:
    re_svg_fill = re.compile(
        r'(q\n)?(/a[0-9.]+\s+gs\n)?([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s+rg\n\[\] 0 d\n([^Q]+?)\nf(\nQ)?'
    )

    def repl_svg_fill(m):
        q_open = m.group(1) or ''
        gs_line = m.group(2) or '/a1.0 gs\n'
        r, g, b = float(m.group(3)), float(m.group(4)), float(m.group(5))
        body = m.group(6)
        q_close = m.group(7) or ''
        hex_c = f"#{round(r*255):02x}{round(g*255):02x}{round(b*255):02x}"
        # Cuerpo del icono de dado (`ico-dado`): fondo blanco con borde negro para que destaquen los 3 puntos
        if '7 3 m\n17 3 l' in body:
            return f"{q_open}{gs_line}1 1 1 rg\n0 0 0 RG\n1.6 w\n[] 0 d\n{body}\nB{q_close}"
        # Halos de etiquetas y círculos de nodos en el mapa SVG
        if hex_c in ('#f1e8d6', '#efe4cd'):
            return f"{q_open}{gs_line}1 1 1 rg\n[] 0 d\n{body}\nf{q_close}"
        return f"{q_open}{gs_line}0.08 0.08 0.08 rg\n[] 0 d\n{body}\nf{q_close}"

    stream_str = re_svg_fill.sub(repl_svg_fill, stream_str)

    # 5. Círculos de nodos del mapa que combinan relleno y trazo (`B`):
    stream_str = stream_str.replace('0.937255 0.894118 0.803922 rg', '1 1 1 rg')

    # 6. Colores de trazo (`RG`) a gris oscuro/negro nítido:
    stream_str = re.sub(
        r'([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s+RG\b',
        lambda m: '0 0 0 RG' if m.group(0) == '0 0 0 RG' else '0.12 0.12 0.12 RG',
        stream_str
    )

    # 7. Colores de texto (`BT ... ET`):
    def repl_bt_block(m):
        block = m.group(0)
        def map_text_rg(cm):
            r, g, b = float(cm.group(1)), float(cm.group(2)), float(cm.group(3))
            hex_c = f"#{round(r*255):02x}{round(g*255):02x}{round(b*255):02x}"
            if hex_c in ('#4a3a31', '#4d7c89', '#c9a27c', '#b8a78f', '#a89580', '#8fb0b8', '#d8c9b1', '#d9cdb6', '#eadbc0'):
                return '0.22 0.22 0.22 rg'
            return '0 0 0 rg'
        return re.sub(r'([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s+rg\b', map_text_rg, block)

    stream_str = re.sub(
        r'(?:(?:/a[0-9.]+\s+gs\n)?[0-9.]+\s+[0-9.]+\s+[0-9.]+\s+rg\n+(?:\[\] 0 d\n0 J\n0 j\n4 M\n)?)+BT\b.*?ET\b',
        repl_bt_block,
        stream_str,
        flags=re.S
    )

    return stream_str


def convert_pdf_to_print_friendly(src_pdf, out_pdf):
    doc = pymupdf.open(src_pdf)

    # Descubrir dinámicamente los diccionarios /Resources de las páginas
    res_xrefs = set()
    for pno in range(len(doc)):
        p_obj = doc.xref_object(doc[pno].xref)
        m_res = re.search(r'/Resources\s+(\d+)\s+0\s+R', p_obj)
        if m_res:
            res_xrefs.add(int(m_res.group(1)))

    res_str = "\n".join(doc.xref_object(rx) for rx in sorted(res_xrefs))

    # Mapear nombres de imágenes (/i...) a su xref
    img_name_to_xref = {}
    for m in re.finditer(r'/(i[a-f0-9]+)\s+(\d+)\s+0\s+R', res_str):
        img_name_to_xref[m.group(1)] = int(m.group(2))

    # 1. Desactivar Form XObjects de texturas de papel (`papel.jpg` y `papel-oscuro.jpg`)
    #    y transformar Form XObjects vectoriales SVG (números y anillos del mapa, iconos)
    paper_img_xrefs = set()
    disabled_forms = 0
    transformed_forms = 0

    for m in re.finditer(r'/(x\d+)\s+(\d+)\s+0\s+R', res_str):
        xname, x_xref = m.group(1), int(m.group(2))
        st_bytes = doc.xref_stream(x_xref)
        if not st_bytes:
            continue
        st = st_bytes.decode('latin1', errors='replace')
        m_bg = re.search(r'642\.519685\s+0\s+0\s+-908\.598425\s+0\s+908\.598425\s+cm\s+/(i[a-f0-9]+)\s+Do', st)
        if m_bg:
            iname = m_bg.group(1)
            if iname in img_name_to_xref:
                paper_img_xrefs.add(img_name_to_xref[iname])
            doc.update_stream(x_xref, b'')
            disabled_forms += 1
        elif '/s0 sh' not in st and ' Do' not in st:
            new_st = transform_stream(st)
            if new_st != st:
                doc.update_stream(x_xref, new_st.encode('latin1'))
                transformed_forms += 1

    # Procesar patrones `/p...` (texturas de papel repetidas vs. velos degradados en láminas/portada/contratapa)
    for m in re.finditer(r'/p(\d+)\s+(\d+)\s+0\s+R', res_str):
        p_xref = int(m.group(2))
        p_obj = doc.xref_object(p_xref)
        r_m = re.search(r'/Resources\s+(\d+)\s+0\s+R', p_obj)
        if not r_m:
            continue
        r_obj = doc.xref_object(int(r_m.group(1)))
        x0_m = re.search(r'/x0\s+(\d+)\s+0\s+R', r_obj)
        if not x0_m:
            continue
        x0_xref = int(x0_m.group(1))
        x0_st = doc.xref_stream(x0_xref).decode('latin1', errors='replace')
        m_bg = re.search(r'/(i[a-f0-9]+)\s+Do', x0_st)
        if m_bg:
            iname = m_bg.group(1)
            if iname in img_name_to_xref:
                paper_img_xrefs.add(img_name_to_xref[iname])
            doc.update_stream(x0_xref, b'')
            disabled_forms += 1
            continue

        x0_obj = doc.xref_object(x0_xref)
        x0_res_m = re.search(r'/Resources\s+(\d+)\s+0\s+R', x0_obj)
        if not x0_res_m:
            continue
        x0_res_obj = doc.xref_object(int(x0_res_m.group(1)))
        sh_m = re.search(r'/Shading\s+<<\s*/s0\s+(\d+)\s+0\s+R', x0_res_obj)
        g_m = re.search(r'/G\s+(\d+)\s+0\s+R', x0_res_obj)
        if not (sh_m and g_m):
            continue
        sh_xref = int(sh_m.group(1))
        g_xref = int(g_m.group(1))
        g_obj = doc.xref_object(g_xref)
        g_res_xref = int(re.search(r'/Resources\s+(\d+)\s+0\s+R', g_obj).group(1))
        g_res_obj = doc.xref_object(g_res_xref)
        mask_sh_xref = int(re.search(r'/s0\s+(\d+)\s+0\s+R', g_res_obj).group(1))

        # Cambiar el color del velo degradado de negro a blanco puro [ 1 1 1 ]
        sh_obj = doc.xref_object(sh_xref)
        sh_obj_white = re.sub(r'/C0\s+\[[^\]]+\]', '/C0 [ 1 1 1 ]', sh_obj)
        sh_obj_white = re.sub(r'/C1\s+\[[^\]]+\]', '/C1 [ 1 1 1 ]', sh_obj_white)
        doc.update_object(sh_xref, sh_obj_white)

        # Elevar suavemente la opacidad del SMask con una curva monótona continua
        mask_obj = doc.xref_object(mask_sh_xref)
        def boost_knot(km):
            key = km.group(1)
            val = float(km.group(2))
            if val <= 0.0:
                return f"/{key} [ 0 ]"
            new_val = min(0.985, round(val ** 0.52, 4))
            return f"/{key} [ {new_val} ]"

        mask_obj_boosted = re.sub(r'/(C[01])\s+\[\s*([0-9.]+)\s*\]', boost_knot, mask_obj)
        doc.update_object(mask_sh_xref, mask_obj_boosted)

    print(f"Form XObjects de papel desactivados: {disabled_forms} | Form XObjects SVG transformados: {transformed_forms}")

    # Reemplazar las imágenes de textura de papel por un JPEG blanco de 4x4 px
    white_4x4 = io.BytesIO()
    Image.new("L", (4, 4), 255).save(white_4x4, format="JPEG", quality=50)
    for bg_xref in sorted(paper_img_xrefs):
        doc.update_stream(bg_xref, white_4x4.getvalue(), compress=False)
        doc.xref_set_key(bg_xref, "DecodeParms", "null")
        doc.xref_set_key(bg_xref, "Filter", "/DCTDecode")
        doc.xref_set_key(bg_xref, "ColorSpace", "/DeviceGray")
        doc.xref_set_key(bg_xref, "Width", "4")
        doc.xref_set_key(bg_xref, "Height", "4")

    # 2. Detectar dinámicamente las 19 ilustraciones a página completa (ancho >= 580pt y alto >= 750pt)
    full_bleed_xrefs = set()
    for pno in range(len(doc)):
        raw = doc[pno].read_contents().decode('latin1', errors='replace')
        for m in re.finditer(r'([0-9.]+)\s+0\s+0\s+-([0-9.]+)\s+[0-9.-]+\s+[0-9.-]+\s+cm\s+/(i[a-f0-9]+)\s+Do', raw):
            draw_w = float(m.group(1))
            draw_h = float(m.group(2))
            iname = m.group(3)
            if draw_w >= 580.0 and draw_h >= 750.0 and iname in img_name_to_xref:
                ix = img_name_to_xref[iname]
                if ix not in paper_img_xrefs:
                    full_bleed_xrefs.add(ix)

    all_img_xrefs = set(img_name_to_xref.values())
    for x in range(1, doc.xref_length()):
        o = doc.xref_object(x)
        for m in re.finditer(r'/(i[a-f0-9]+)\s+(\d+)\s+0\s+R', o):
            all_img_xrefs.add(int(m.group(2)))

    # 3. Convertir todas las imágenes (logos PNG con SMask e ilustraciones JPEG)
    processed_count = 0
    logo_count = 0
    for ix in sorted(all_img_xrefs):
        if ix in paper_img_xrefs:
            continue
        im_obj = doc.xref_object(ix)
        if '/SMask' in im_obj:
            pix = pymupdf.Pixmap(doc, ix)
            dark_logo = np.full((pix.height, pix.width), 20, dtype=np.uint8)
            doc.update_stream(ix, dark_logo.tobytes(), compress=True)
            doc.xref_set_key(ix, "DecodeParms", "null")
            doc.xref_set_key(ix, "Filter", "/FlateDecode")
            doc.xref_set_key(ix, "ColorSpace", "/DeviceGray")
            doc.xref_set_key(ix, "BitsPerComponent", "8")
            logo_count += 1
        else:
            pix = pymupdf.Pixmap(doc, ix)
            mode = "RGB" if pix.n >= 3 else "L"
            pil_im = Image.frombytes(mode, (pix.width, pix.height), pix.samples)
            bw_im = process_art_image(pil_im, is_full_bleed=(ix in full_bleed_xrefs))
            buf = io.BytesIO()
            bw_im.save(buf, format="JPEG", quality=82, optimize=True)
            doc.update_stream(ix, buf.getvalue(), compress=False)
            doc.xref_set_key(ix, "DecodeParms", "null")
            doc.xref_set_key(ix, "Filter", "/DCTDecode")
            doc.xref_set_key(ix, "ColorSpace", "/DeviceGray")
            doc.xref_set_key(ix, "BitsPerComponent", "8")
            processed_count += 1

    print(f"Ilustraciones convertidas a B&W: {processed_count} ({len(full_bleed_xrefs)} a página completa) | Logos: {logo_count}")

    # 4. Transformar los flujos de contenido de las 200 páginas
    for pno in range(len(doc)):
        page = doc[pno]
        c_xref = page.get_contents()[0]
        raw = doc.xref_stream(c_xref).decode('latin1')
        new_raw = transform_stream(raw)
        doc.update_stream(c_xref, new_raw.encode('latin1'))

    doc.save(out_pdf, garbage=4, deflate=True)
    size_mb = os.path.getsize(out_pdf) / (1024 * 1024)
    print(f"PDF Print-Friendly guardado en: {out_pdf} ({size_mb:.2f} MB, {len(doc)} páginas)")


def main():
    parser = argparse.ArgumentParser(description="Genera la versión Print-Friendly de Caribdis.pdf")
    parser.add_argument(
        "--entrada",
        default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "Caribdis.pdf"),
        help="Ruta al archivo Caribdis.pdf de entrada",
    )
    parser.add_argument(
        "--salida",
        default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "Caribdis_Print_Friendly.pdf"),
        help="Ruta al archivo PDF Print-Friendly de salida",
    )
    args = parser.parse_args()
    convert_pdf_to_print_friendly(args.entrada, args.salida)


if __name__ == "__main__":
    main()
