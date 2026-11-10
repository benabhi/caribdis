# Caribdis · la app

La app para jugar *Caribdis* con el libro abierto: crea tu protagonista, lleva el día (amanecer, acción, anochecer), tira los dados en 3D y juega los eventos tocando el texto. Cada paso muestra qué regla está en juego, y el Códice busca y abre cualquier regla o evento.

## Construir

```bash
cd caribdis/app
python3 herramientas/construir_app.py
```

El resultado queda en `dist/` y es una **página estática**: no necesita servidor ni internet.

- `dist/index.html`: la página entera (CSS, JS y el libro en JSON, todo dentro).
- `dist/arte/`: las ilustraciones, reducidas.
- `dist/vendor/` y `dist/fuentes/`: three.js y las tipografías.

El botón «Descargar el manual» enlaza al PDF del repositorio (`Caribdis.pdf` en la raíz). La dirección del repositorio está en `REPO`, al principio de `herramientas/construir_app.py`.

Para probarla en local: `cd dist && python3 -m http.server`, y abre `http://localhost:8000`.

## Publicar en GitHub Pages

El flujo `.github/workflows/pages.yml` construye la app y la publica en cada push a `main` que toque `app/` o `libro/`. Solo hay que activarlo una vez: en GitHub, **Settings → Pages → Build and deployment → Source: GitHub Actions**. La app queda en `https://<usuario>.github.io/<repositorio>/`.

Las partidas se guardan en el `localStorage` del navegador de cada jugador.

## Arquitectura (pensada para migrar)

```
libro/*.md ──► herramientas/construir_datos.py ──► datos/libro.json
                                                       │
src/base.js      utilidades, datos fijos de las reglas, guardado local
src/motor.js     el motor del juego: estado y reglas, SIN DOM. Recibe los dados ya tirados.
src/texto.js     Markdown del libro → HTML, y la "lectura activa" de los eventos
src/dados.js     dados 3D (three.js r128) con valor decidido de antemano; si no hay WebGL, dados planos
src/ui-*.js      la interfaz: núcleo (Códice, bandeja de dados, menú), hoja, mesa, creación
src/manual.js    enlace al manual del repositorio, guardar y cargar partidas en archivo
src/estilo.css   la estética del manual
src/plantilla.html  el esqueleto; construir_app.py inserta todo lo demás
```

- **El motor no sabe nada de la pantalla.** `CB.motor` trabaja sobre un objeto de estado plano (JSON) y recibe los valores de los dados. Así se puede reutilizar tal cual en otra plataforma y escribir pruebas sin navegador.
- **El libro es un dato.** Si cambia el texto, se vuelve a correr el constructor y la app se actualiza sola: reglas, eventos, tablas y Marcas salen de los `.md`.
- **La partida es un JSON.** Se puede exportar e importar como archivo (una importada entra como partida nueva).
- **Sin dependencias externas:** three.js (`vendor/three.min.js`) y las fuentes (`vendor/fuentes/`, solo latín) van dentro de la app; el constructor las copia a `dist/vendor` y `dist/fuentes`. Funciona sin internet.
- **Partidas:** varias, en `localStorage` (`caribdis.partidas.v2` es el índice; cada partida en `caribdis.partida.v2.<id>`). La clave vieja `caribdis.partida.v1` se migra sola.
