# Caribdis

*Tu nave cayó. El planeta canta. Algo viene.*

Juego de rol en solitario de naufragio, ruinas y regreso. Un libro de **UtopIA**.

Este repositorio contiene todo lo necesario para recrear el manual en PDF (A4, 200 páginas) y la app para jugarlo.

- **Manual:** [`Caribdis.pdf`](Caribdis.pdf) ([descarga directa](https://github.com/benabhi/caribdis/raw/main/Caribdis.pdf)).
- **Manual Print-Friendly (blanco y negro, ahorro de tinta):** [`Caribdis_Print_Friendly.pdf`](Caribdis_Print_Friendly.pdf) ([descarga directa](https://github.com/benabhi/caribdis/raw/main/Caribdis_Print_Friendly.pdf)).
- **App:** [benabhi.github.io/caribdis](https://benabhi.github.io/caribdis/), en el navegador, sin instalar nada. Las partidas se guardan en tu navegador.

## Estructura

```
caribdis/
├── README.md                  este archivo
├── requirements.txt           dependencias de Python
├── construir_pdf.py           genera el manual a color (Caribdis.pdf)
├── generar_print_friendly.py  genera el manual en blanco y negro (Caribdis_Print_Friendly.pdf)
├── estilo.css                 hoja de estilos del manual
├── libro/                     el texto del juego en Markdown, en orden de lectura
│                              (rNNN = reglas, eNNN = eventos)
├── maqueta/                   módulos de maquetación: partes, cajas, remates,
│                              iconos, mapa, papel y cortes de columna fijados
├── arte/                      ilustraciones del libro
│   └── marca/                 logo de la editorial (UtopIA)
├── fuentes/                   tipografías (todas con licencia SIL Open Font)
├── herramientas/              verificación y análisis (enlaces, Marcas, maqueta, simulador)
├── app/                       la app para jugar con el libro (página estática)
├── docs/                      diseño (plan, biblia del mundo), auditoría final y archivo
├── .github/workflows/         publica la app en GitHub Pages
└── dist/                      salidas que no se versionan
```

## Construir el manual

Requisitos: Python 3.11 o superior, las dependencias de `requirements.txt` y Poppler (`pdftoppm`, `pdftotext`) para las herramientas de revisión.

```bash
pip install -r requirements.txt
python3 construir_pdf.py              # Caribdis.pdf, para pantalla
python3 generar_print_friendly.py     # Caribdis_Print_Friendly.pdf, blanco y negro (ahorro de tinta)
python3 construir_pdf.py --imprenta   # Caribdis-imprenta.pdf, con sangrado y marcas de corte
python3 construir_pdf.py --html       # además guarda maqueta/manual.html para depurar
```

La construcción tarda unos cinco minutos: mide cada hueco de columna y lo rellena antes de componer la versión final. El resultado tiene siempre 200 páginas.

## Revisar

```bash
python3 herramientas/verificar.py         # enlaces rotos, eventos huérfanos, Marcas que no se consultan
python3 herramientas/indice_marcas.py     # regenera libro/91-indice-marcas.md
python3 herramientas/revisar_maqueta.py   # títulos huérfanos al pie y huecos en el PDF
python3 herramientas/simulador.py         # partidas automáticas para medir la dificultad
```

Si cambias el texto de un evento, vuelve a correr `indice_marcas.py` y `verificar.py` antes de construir.

## La app

Ver [`app/README.md`](app/README.md). Se construye a partir de `libro/` y `arte/`, y GitHub Actions la publica en GitHub Pages en cada cambio. El botón de descarga del manual enlaza a `Caribdis.pdf` de este repositorio.

## Para un libro nuevo

Esta misma estructura sirve de plantilla: copia la carpeta, vacía `libro/`, `arte/` y `docs/`, conserva `arte/marca/`, `fuentes/` y `herramientas/`, y ajusta `maqueta/extras.py` (partes, capítulos, láminas y cajas) el nombre del archivo de salida en `construir_pdf.py` y `REPO` en `app/herramientas/construir_app.py`.
