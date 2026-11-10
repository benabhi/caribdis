/* =====================================================================
   CARIBDIS · archivos
   El enlace al manual en PDF (en el repositorio del libro) y guardar o
   cargar una partida en un archivo. Todo es estático: la página no
   necesita servidor y las partidas viven en el localStorage.
   ===================================================================== */
'use strict';
(function () {
  const el = CB.el;
  const T = CB.texto, A = CB.app;
  const Ma = (CB.manual = {});

  let descargas; // namespace de downloads, null si no hay
  async function capDescargas() {
    if (descargas !== undefined) return descargas;
    try { descargas = window.claude && window.claude.use ? await window.claude.use('downloads') : null; } catch (e) { descargas = null; }
    return descargas;
  }
  /** guarda un archivo: devuelve 'ok' | 'no' (rechazado) | 'error' */
  async function guardarArchivo(nombre, datos, tipo) {
    const dl = await capDescargas();
    if (dl) {
      try { await dl.save({ filename: nombre, data: datos }); return 'ok'; }
      catch (e) { return e && e.code === 'declined' ? 'no' : 'error'; }
    }
    try {
      const blob = datos instanceof Blob ? datos : new Blob([datos], { type: tipo });
      const url = URL.createObjectURL(blob);
      const a = el('a', { href: url, download: nombre });
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      return 'ok';
    } catch (e) { return 'error'; }
  }

    /* ---------- manual en PDF ---------- */
  // El PDF vive en el repositorio del libro: el botón lleva directamente a él.
  Ma.descargar = function () {
    const R = (CB.libro && CB.libro.repo) || {};
    const pdf = R.pdf || 'Caribdis.pdf';
    A.modal(`${T.ico('libro')} El manual de Caribdis`, [
      el('div.manual-dl', el('img', { src: 'arte/portada.jpg', alt: '' }),
        el('div', el('p', 'El libro completo: reglas, más de cuatrocientos eventos, el catálogo y los apéndices. A4, 200 páginas, listo para leer en pantalla o imprimir.'),
          el('div.botones',
            el('a.btn.primario', { href: R.descarga || pdf, target: '_blank', rel: 'noopener', download: pdf, html: `${T.ico('bajar')} Descargar el PDF` }),
            R.carpeta ? el('a.btn.secundario', { href: R.carpeta, target: '_blank', rel: 'noopener' }, 'Ver en GitHub') : null),
          el('p.ayuda-mini', 'Se descarga desde el repositorio del libro en GitHub, siempre en su última versión.'))),
    ], { clase: 'estrecho' });
  };

  /* ---------- partida en archivo ---------- */
  Ma.exportar = async function () {
    if (!A.S) return;
    const S = A.S;
    const nombre = `caribdis-${CB.u.norm(S.nombre).replace(/[^a-z0-9]+/g, '-')}-dia-${S.dia || 1}.json`;
    const r = await guardarArchivo(nombre, JSON.stringify({ juego: 'caribdis', v: 1, partida: S }), 'application/json');
    A.aviso(r === 'ok' ? 'Partida guardada en un archivo.' : r === 'no' ? 'Cancelado.' : 'No se pudo guardar el archivo aquí.');
  };
  Ma.importar = function () {
    const inp = el('input', { type: 'file', accept: '.json,application/json', style: { display: 'none' } });
    inp.addEventListener('change', async () => {
      const f = inp.files && inp.files[0];
      inp.remove();
      if (!f) return;
      try {
        const o = JSON.parse(await f.text());
        const S = o && o.juego === 'caribdis' ? o.partida : o;
        if (!S || !S.prota || !S.escena || !S.attr) throw new Error('formato');
        S.id = CB.guardado.nuevoId(); // una partida importada entra como partida nueva, sin pisar otra
        A.S = S;
        A.deshacer = [];
        A.vista = 'mesa';
        A.guardar();
        A.cerrarModal();
        CB.crear.salir();
        A.aviso(`Partida cargada: ${CB.u.esc(S.nombre)}, día ${S.dia || 1}.`);
      } catch (e) {
        A.aviso('Ese archivo no es una partida de Caribdis.');
      }
    });
    document.body.append(inp);
    inp.click();
  };
})();
