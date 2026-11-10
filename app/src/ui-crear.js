/* =====================================================================
   CARIBDIS · interfaz: título, aprender a jugar y creación
   La pantalla de título, el recorrido para aprender las reglas y el
   asistente que sigue r100 paso a paso (modo, protagonista, atributos,
   origen, rasgos, nombres y la preparación de r108).
   ===================================================================== */
'use strict';
(function () {
  const { esc } = CB.u;
  const el = CB.el;
  const D = CB.D, M = CB.motor, T = CB.texto, A = CB.app;
  const C = (CB.crear = {});
  const raiz = () => document.getElementById('titulo');
  const ref = (id) => el('button.chip-ref', { type: 'button', onclick: () => A.abrirCodice(id) }, el('b', id), ' ', CB.libro.titulo(id));
  const refs = (ids) => el('div.en-juego', el('span.et', 'Reglas'), ids.map(ref));

  const NAVES = ['Alba Rota', 'Perséfone', 'Kestrel IX', 'Mañana Lejana', 'Santa Ceniza', 'Hija del Vacío', 'Ícaro Tardío', 'Corredora de Sal', 'Viuda de Hierro', 'Arca Menor', 'Último Faro', 'Carmín', 'La Obstinada', 'Nadir', 'Golondrina 7', 'Medianoche Larga'];
  const azar = (a) => a[Math.floor(Math.random() * a.length)];

  function mostrar() {
    document.body.classList.add('en-titulo');
    window.scrollTo({ top: 0 });
  }
  C.salir = function () {
    document.body.classList.remove('en-titulo');
    A.render();
  };

  /* =====================================================================
     PANTALLA DE TÍTULO
     ===================================================================== */
  // lista de partidas guardadas: continuar cualquiera o borrarla (con confirmación en la misma fila)
  C.partidas = function () {
    const lista = el('div.lista-partidas');
    const pintarLista = () => {
      lista.innerHTML = '';
      const ix = CB.guardado.indice();
      if (!ix.length) { lista.append(el('p.vacio', 'No hay partidas guardadas.')); return; }
      ix.forEach((x) => {
        const P = D.PROTAS[x.prota] || {};
        const fila = el('div.partida-fila' + (A.S && A.S.id === x.id ? '.actual' : ''),
          el('img', { src: `arte/${P.arte}.jpg`, alt: '' }),
          el('div.pf-t', el('b', x.nombre || P.N), el('span', x.fin ? `Terminada: ${x.fin}` : `${P.n || ''} · ${x.nave || ''} · día ${x.dia} · Reloj ${x.reloj ?? '∞'}`), el('small', new Date(x.fecha).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' }))),
          el('div.pf-acc',
            el('button.btn.primario', { type: 'button', onclick: () => { const S = CB.guardado.cargar(x.id); if (!S) { A.aviso('No se pudo leer esa partida.'); return; } A.S = S; A.deshacer = []; A.vista = 'mesa'; A.guardar(); A.cerrarModal(); C.salir(); } }, A.S && A.S.id === x.id ? 'Seguir' : 'Jugar'),
            el('button.btn-icono.peq', { type: 'button', 'aria-label': 'Borrar partida', title: 'Borrar', html: T.ico('cerrar'), onclick: () => {
              fila.querySelector('.pf-acc').replaceChildren(el('span.pf-seguro', '¿Borrarla para siempre?'),
                el('button.btn.peligro', { type: 'button', onclick: () => { CB.guardado.borrarPartida(x.id); if (A.S && A.S.id === x.id) A.S = null; pintarLista(); } }, 'Borrar'),
                el('button.btn.secundario', { type: 'button', onclick: pintarLista }, 'No'));
            } })));
        lista.append(fila);
      });
    };
    pintarLista();
    A.modal('Partidas guardadas', [el('p.ayuda-mini', 'Se guardan en este navegador. Para pasarlas a otro dispositivo, expórtalas a un archivo desde el menú.'), lista], { alCerrar: () => C.titulo() });
  };
  C.titulo = function () {
    A.cerrarModal();
    const R = raiz();
    R.innerHTML = '';
    mostrar();
    const S = A.S;
    const P = S && D.PROTAS[S.prota];
    const botones = el('div.tp-botones');
    if (S && !S.fin) {
      botones.append(el('button.tp-continuar', { type: 'button', onclick: C.salir },
        el('img', { src: `arte/${P.arte}.jpg`, alt: '' }),
        el('span', el('small', 'Continuar'), el('b', S.nombre), el('span', `${P.n} · ${S.nave} · día ${S.dia || 1} · Reloj ${S.reloj ?? '∞'}`))));
    } else if (S && S.fin) {
      botones.append(el('button.tp-continuar', { type: 'button', onclick: C.salir },
        el('img', { src: `arte/${P.arte}.jpg`, alt: '' }),
        el('span', el('small', 'Partida terminada'), el('b', S.nombre), el('span', 'Ver el final y la bitácora'))));
    }
    const otras = CB.guardado.indice().filter((x) => !S || x.id !== S.id);
    if (otras.length) botones.append(el('button.btn.fantasma.tp-otras', { type: 'button', onclick: C.partidas }, el('span', { html: T.ico('bitacora') }), `Otras partidas guardadas (${otras.length})`));
    botones.append(
      el('button.btn.primario.grande', { type: 'button', onclick: () => C.nueva() }, el('span', { html: T.ico('nave') }), S && !S.fin ? 'Nueva partida' : 'Empezar a jugar'),
      el('button.btn.secundario.grande', { type: 'button', onclick: C.aprender }, el('span', { html: T.ico('ayuda') }), 'Aprender a jugar'),
      el('div.tp-fila',
        el('button.btn.fantasma', { type: 'button', onclick: () => A.abrirCodice() }, el('span', { html: T.ico('libro') }), 'Leer el libro'),
        el('button.btn.fantasma', { type: 'button', onclick: () => CB.manual.descargar() }, el('span', { html: T.ico('bajar') }), 'Descargar el manual'),
        el('button.btn.fantasma', { type: 'button', onclick: () => CB.manual.importar() }, el('span', { html: T.ico('mas') }), 'Cargar partida'),
      ),
    );
    R.append(
      el('div.tp-fondo', { style: { backgroundImage: 'url(arte/portada-panoramica.jpg)' } }),
      el('div.tp-velo'),
      el('main.tp-centro',
        el('img.tp-utopia', { src: 'arte/utopia.png', alt: 'UtopIA' }),
        el('div.tp-sobre', 'Un juego de rol en solitario'),
        el('h1.tp-marca', 'Caribdis'),
        el('p.tp-lema', CB.libro.lema || 'Tu nave cayó. El planeta canta. Algo viene.'),
        botones,
      ),
      el('footer.tp-pie', el('span', `Libro: versión ${CB.libro.version || ''}`), el('span', 'Pulsa / en cualquier momento para buscar una regla')),
    );
  };

  /* =====================================================================
     APRENDER A JUGAR: un recorrido corto, con una tirada de verdad
     ===================================================================== */
  const TOUR = [
    { arte: 'r-panoramica', sobre: 'La premisa', t: 'Tu nave cayó', p: 'Caribdis es un planeta viejo que <b>canta</b>: una señal que atrae naves y las derriba. La tuya es la última. Tienes que reunir <b>seis sistemas</b> perdidos por el planeta, instalarlos y despegar antes de que lleguen los <b>Recolectores</b>.', r: ['r001', 'r004'] },
    { arte: 'r-tripulacion', sobre: 'Quién eres', t: 'Tres protagonistas', p: 'El <b>Piloto</b> respira mal este aire y carga con la culpa de la caída. El <b>Nativo</b> es hijo del planeta y conoce sus caminos. La <b>Mente</b> es la IA de la nave, metida en un dron, buscando sus recuerdos. Cada uno tiene su historia, que se abre en días fijos.', r: ['r100', 'r102', 'r103', 'r104'] },
    { arte: 'b-pruebas', sobre: 'La regla de oro', t: 'Las pruebas', p: 'Cuando algo es incierto, tiras <b>2d6 + un atributo</b> y comparas con la dificultad: <b>7 Fácil, 9 Normal, 11 Dura, 13 Extrema</b>. Si igualas o superas, es un Éxito; por 3 o más, un Éxito pleno. Con Ventaja tiras 3 dados y te quedas los 2 más altos.', r: ['r120', 'r121'], dados: true },
    { arte: 'r-cicatriz', sobre: 'El ritmo', t: 'Un día en Caribdis', p: 'Cada día tiene tres fases. Al <b>amanecer</b> baja el Reloj y gastas comida y aire. Luego haces <b>una sola acción</b>: explorar, viajar, ir a un pecio, descansar, construir… Al <b>anochecer</b> duermes, si puedes, y quizá algo te encuentre en la oscuridad.', r: ['r130', 'r131', 'r132', 'r133'] },
    { arte: 'b-leer', sobre: 'El libro', t: 'Eventos y Marcas', p: 'El libro está hecho de <b>reglas (r)</b> y <b>eventos (e)</b>. Un evento te cuenta algo y te pide elegir; las flechas te mandan a otro. Las <b>Marcas</b> son palabras en mayúsculas que anotas: el mundo las recuerda y otros eventos las preguntan.', r: ['r003', 'r191'] },
    { arte: 'r-recolectores', sobre: 'La amenaza', t: 'El Reloj, la Alerta y el Canto', p: 'El <b>Reloj</b> marca los días que faltan para los Recolectores. La <b>Alerta</b> dice cuánto te buscan: cuanto más alta, peores encuentros. El <b>Canto</b> sube cuando el planeta se te mete dentro; a 6, te llama para siempre.', r: ['r134', 'r135', 'r137'] },
    { arte: 'r-despegue', sobre: 'Esta app', t: 'Juegas con el libro abierto', p: 'La mesa lleva las cuentas, tira los dados y te dice qué regla está en juego en cada paso. <b>Toca cualquier rXXX o eXXX</b> para leerla. Las fichas de efecto se aplican con un toque y se deshacen con otro. Y si algo no te convence, todo se puede corregir a mano.', r: ['r130'] },
  ];
  C.aprender = function () {
    const R = raiz();
    mostrar();
    let i = 0;
    function pinta() {
      const t = TOUR[i];
      R.innerHTML = '';
      const zonaDados = t.dados ? el('div.tour-dados') : null;
      const res = t.dados ? el('div.tour-res', 'Toca para tirar 2d6 + 2 (un atributo típico) contra una dificultad Normal (9).') : null;
      const tirar = t.dados ? el('button.btn.secundario', {
        type: 'button',
        onclick: async () => {
          tirar.disabled = true;
          const v = await CB.dados.lanzar(zonaDados, [{ tipo: 'j' }, { tipo: 'j' }]);
          const tot = v[0] + v[1] + 2;
          const r = tot >= 12 ? 'Éxito pleno' : tot >= 9 ? 'Éxito' : 'Fallo';
          res.innerHTML = `${v[0]} + ${v[1]} + 2 = <b>${tot}</b> contra 9: <b class="v-${tot >= 12 ? 'pl' : tot >= 9 ? 'ex' : 'fa'}">${r}</b>. ${r === 'Fallo' ? 'En Caribdis, fallar casi nunca es el final: el evento te dice qué pasa.' : 'Así de sencillo. Todo el juego funciona igual.'}`;
          tirar.disabled = false;
          tirar.textContent = 'Otra vez';
        },
        html: `${T.ico('dado')} Tirar los dados`,
      }) : null;
      const puntos = el('div.tour-puntos', TOUR.map((_, k) => el('button' + (k === i ? '.activo' : ''), { type: 'button', 'aria-label': `Paso ${k + 1}`, onclick: () => { i = k; pinta(); } })));
      R.append(
        el('div.tour',
          el('div.tour-arte', { style: { backgroundImage: `url(arte/${t.arte}.jpg)` } }),
          el('article.tour-carta',
            el('div.tour-cont',
              el('div.tour-sobre', `${i + 1} de ${TOUR.length} · ${t.sobre}`),
              el('h2', t.t),
              el('p', { html: t.p }),
              zonaDados, tirar, res,
              refs(t.r)),
            // botonera fija abajo: no se mueve aunque cambie el largo del texto
            el('div.tour-pie', puntos,
            el('div.botones',
              el('button.btn.fantasma', { type: 'button', onclick: () => (i ? (i--, pinta()) : C.titulo()) }, i ? '← Anterior' : '← Título'),
              i < TOUR.length - 1
                ? el('button.btn.primario', { type: 'button', onclick: () => { i++; pinta(); } }, 'Siguiente →')
                : el('button.btn.primario', { type: 'button', onclick: () => C.nueva() }, 'Crear mi protagonista →'),
            )),
          ),
        ),
      );
      A.enlazarRefs(R);
    }
    pinta();
  };

  /* =====================================================================
     ASISTENTE DE CREACIÓN (r100)
     ===================================================================== */
  const PASOS = [
    ['Partida', 'r109'], ['Protagonista', 'r100'], ['Atributos', 'r101'], ['Origen', 'r105'], ['Rasgos', null], ['Nombres', 'r100'], ['Preparar', 'r108'],
  ];
  const RECOMENDADO = {
    piloto: { Vigor: 2, Reflejos: 4, Ingenio: 3, Voluntad: 3 },
    nativo: { Vigor: 4, Reflejos: 3, Ingenio: 2, Voluntad: 3 },
    mente: { Vigor: 2, Reflejos: 3, Ingenio: 4, Voluntad: 3 },
  };
  let W = null;

  C.nueva = function () {
    W = {
      paso: 0, modo: 'estandar', dificultad: 'superviviente', estacion: 'azar',
      prota: null, attr: { Vigor: 3, Reflejos: 3, Ingenio: 3, Voluntad: 3 }, ajusteElige: null,
      origen: null, rasgos: [], defectos: [], nombre: '', nave: azar(NAVES), prep: null,
    };
    mostrar();
    pintar();
  };

  const puntosLibres = () => 12 - D.ATRIBUTOS.reduce((s, a) => s + W.attr[a], 0);
  function attrFinal() {
    const P = D.PROTAS[W.prota];
    const f = Object.assign({}, W.attr);
    const aj = P.ajuste;
    if (aj.elige) { if (W.ajusteElige) f[W.ajusteElige] += 1; }
    else for (const k in aj) f[k] = Math.max(1, f[k] + aj[k]);
    return f;
  }
  function rangoRasgos() {
    const [a, b] = D.PROTAS[W.prota].rasgos.rango;
    const ids = [];
    for (let n = a; n <= b; n++) ids.push('e' + n);
    return ids;
  }
  function listo(p) {
    if (p === 1) return !!W.prota;
    if (p === 2) return puntosLibres() === 0 && (!D.PROTAS[W.prota].ajuste.elige || !!W.ajusteElige);
    if (p === 3) return W.origen != null;
    if (p === 4) return W.rasgos.length === 2;
    if (p === 5) return true;
    if (p === 6) return !!W.prep;
    return true;
  }
  function falta(p) {
    if (p === 1) return 'Elige protagonista.';
    if (p === 2) return puntosLibres() ? `Te quedan ${puntosLibres()} puntos por repartir.` : 'Elige dónde va tu +1 (Vigor o Voluntad).';
    if (p === 3) return 'Elige un Origen o tíralo.';
    if (p === 4) return W.prota === 'nativo' ? 'Tira tus dos mutaciones.' : 'Elige dos.';
    if (p === 6) return 'Tira la preparación.';
    return '';
  }
  function ir(p) {
    if (p > W.paso) for (let k = W.paso; k < p; k++) if (!listo(k)) { A.aviso(falta(k)); W.paso = k; return pintar(); }
    W.paso = p;
    pintar();
    const c = document.querySelector('.as-cuerpo');
    if (c) c.scrollTop = 0;
    window.scrollTo({ top: 0 });
  }

  function pintar() {
    const R = raiz();
    R.innerHTML = '';
    const pasos = el('nav.as-pasos', { 'aria-label': 'Pasos de la creación' },
      el('button.as-volver', { type: 'button', onclick: C.titulo }, '← Título'),
      PASOS.map(([t], k) => el('button.as-paso' + (k === W.paso ? '.activo' : '') + (k < W.paso && listo(k) ? '.hecho' : ''), { type: 'button', disabled: k > 1 && !W.prota, onclick: () => ir(k) }, el('span.n', String(k + 1)), el('span.t', t))),
    );
    const cuerpo = el('section.as-cuerpo');
    [pasoPartida, pasoProta, pasoAtributos, pasoOrigen, pasoRasgos, pasoNombres, pasoPreparar][W.paso](cuerpo);
    const ultimo = W.paso === PASOS.length - 1;
    const pie = el('div.as-pie',
      W.paso ? el('button.btn.fantasma', { type: 'button', onclick: () => ir(W.paso - 1) }, '← Atrás') : el('span'),
      el('span.as-falta', listo(W.paso) ? '' : falta(W.paso)),
      ultimo
        ? el('button.btn.primario.grande', { type: 'button', disabled: !listo(W.paso), onclick: empezar, html: `${T.ico('ir')} Despertar entre los restos` })
        : el('button.btn.primario', { type: 'button', disabled: !listo(W.paso), onclick: () => ir(W.paso + 1) }, 'Siguiente →'),
    );
    R.append(el('div.asistente', el('div.as-fondo', { style: { backgroundImage: `url(arte/${W.prota ? D.PROTAS[W.prota].arte : 'r-cicatriz'}.jpg)` } }), pasos, el('div.as-hoja', cuerpo, pie)));
    A.enlazarRefs(R);
  }
  const cabecera = (n, t, sub, ids) => [el('div.as-sobre', `Paso ${n} de ${PASOS.length}`), el('h2.as-t', t), sub ? el('p.as-sub', { html: sub }) : null, ids ? refs(ids) : null].filter(Boolean);
  const carta = (sel, attrs, ...h) => el('button.op-carta' + (sel ? '.elegida' : ''), Object.assign({ type: 'button', 'aria-pressed': sel ? 'true' : 'false' }, attrs), ...h);

  /* ---------- 1 · partida ---------- */
  function pasoPartida(c) {
    c.append(...cabecera(1, 'Qué partida quieres', 'Si es tu primera vez, deja todo como está: <b>Estándar</b> y <b>Superviviente</b> son el juego tal como se diseñó.', ['r109', 'r210', 'r211', 'r213']));
    if (A.S && !A.S.fin) c.append(el('div.caja-aviso', { html: `${T.ico('alerta')} Tienes una partida guardada (${esc(A.S.nombre)}, día ${A.S.dia || 1}). Si empiezas otra, la reemplaza.` }, el('button.btn.mini', { type: 'button', onclick: () => CB.manual.exportar() }, 'Guardarla en un archivo')));
    c.append(el('h3.as-h', 'Modo'));
    const g = el('div.opciones-grid.dos');
    for (const k in D.MODOS) {
      const m = D.MODOS[k];
      g.append(carta(W.modo === k, { onclick: () => { W.modo = k; pintar(); } }, el('b', m.n), el('span', m.desc), el('small', k === 'naufrago' ? 'Reloj 60 (sin Recolectores)' : k === 'estandar' ? 'Reloj según la dificultad' : `Reloj ${m.reloj}`)));
    }
    c.append(g, el('h3.as-h', 'Dificultad'));
    const g2 = el('div.opciones-grid.tres');
    for (const k in D.DIFICULTADES) {
      const d = D.DIFICULTADES[k];
      g2.append(carta(W.dificultad === k, { onclick: () => { W.dificultad = k; pintar(); } }, el('b', d.n), el('span', d.desc), el('small', `${W.modo === 'estandar' ? 'Reloj ' + d.reloj + ' · ' : ''}Temple ${d.temple}`)));
    }
    c.append(g2, el('h3.as-h', { html: `Estación ${T.ref('r213')}` }), el('p.as-nota', 'Cambia una regla durante toda la partida, para que cada vez el planeta sea distinto.'));
    const g3 = el('div.opciones-grid.estaciones');
    g3.append(carta(W.estacion === 'azar', { onclick: () => { W.estacion = 'azar'; pintar(); } }, el('b', 'Que la decida el dado'), el('span', 'Se tira 1d6 al preparar la partida.')));
    g3.append(carta(W.estacion === 'ninguna', { onclick: () => { W.estacion = 'ninguna'; pintar(); } }, el('b', 'Sin estación'), el('span', 'El planeta como en las reglas básicas.')));
    for (const k in D.ESTACIONES) g3.append(carta(W.estacion === +k, { onclick: () => { W.estacion = +k; pintar(); } }, el('b', `${k} · ${D.ESTACIONES[k][0]}`), el('span', D.ESTACIONES[k][1])));
    c.append(g3);
  }

  /* ---------- 2 · protagonista ---------- */
  function pasoProta(c) {
    c.append(...cabecera(2, 'Quién despierta entre los restos', 'Cada protagonista juega distinto y tiene su propia historia, que se abre en los días 50, 40, 30, 20 y 10 del Reloj.', null));
    const g = el('div.protas');
    for (const k in D.PROTAS) {
      const P = D.PROTAS[k];
      g.append(el('button.prota-carta' + (W.prota === k ? '.elegida' : ''), {
        type: 'button', 'aria-pressed': W.prota === k ? 'true' : 'false',
        onclick: () => { if (W.prota !== k) { W.prota = k; W.rasgos = []; W.defectos = []; W.origen = null; W.ajusteElige = null; W.attr = Object.assign({}, RECOMENDADO[k]); } pintar(); },
      },
        el('span.pc-arte', { style: { backgroundImage: `url(arte/${P.arte}.jpg)` } }),
        el('span.pc-cuerpo',
          el('span.pc-especie', P.especie),
          el('b.pc-n', P.N),
          el('span.pc-lema', P.lema),
          el('ul.pc-lista', P.resumen.map((r) => el('li', r))),
          el('span.pc-contador', { html: `Contador: <b>${P.contador.n}</b> · Sistema personal: ${P.personal}` }),
        ),
      ));
    }
    c.append(g);
    if (W.prota) c.append(refs([D.PROTAS[W.prota].regla]));
    c.append(el('div.as-azar', el('span', '¿Sin ganas de decidir?'), el('button.btn.secundario', { type: 'button', onclick: todoAlAzar, html: `${T.ico('dado')} Que lo decida el azar` }), el('small', 'Protagonista, atributos recomendados, origen y rasgos al azar. Luego solo pones los nombres.')));
  }
  async function todoAlAzar() {
    W.prota = azar(Object.keys(D.PROTAS));
    W.attr = Object.assign({}, RECOMENDADO[W.prota]);
    const P = D.PROTAS[W.prota];
    if (P.ajuste.elige) W.ajusteElige = azar(P.ajuste.elige);
    W.origen = CB.u.d(6) - 1;
    W.rasgos = []; W.defectos = [];
    const ids = rangoRasgos();
    if (W.prota === 'nativo') {
      while (W.rasgos.length < 2) {
        const v = CB.u.d(12);
        const id = 'e' + (709 + v);
        if (W.rasgos.includes(id) || v >= 10) continue; // al azar, sin defectos
        W.rasgos.push(id);
      }
    } else {
      const pool = ids.slice();
      while (W.rasgos.length < 2) W.rasgos.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }
    A.aviso(`El azar dice: <b>${P.N}</b>, ${D.ORIGENES[W.prota][W.origen][0].toLowerCase()}.`);
    ir(5);
  }

  /* ---------- 3 · atributos ---------- */
  function pasoAtributos(c) {
    const P = D.PROTAS[W.prota];
    c.append(...cabecera(3, 'Reparte 12 puntos', `Entre los cuatro atributos, con un mínimo de 1 y un máximo de 4 en cada uno. Luego se aplica el ajuste de ${P.n}. En una prueba tiras <b>2d6 + el atributo</b>.`, ['r101', P.regla]));
    const libres = puntosLibres();
    c.append(el('div.contador-pts' + (libres ? '' : '.ok'), el('b', String(libres)), el('span', libres === 1 ? 'punto por repartir' : 'puntos por repartir')));
    const fin = attrFinal();
    const t = el('div.attr-tabla');
    for (const a of D.ATRIBUTOS) {
      const v = W.attr[a];
      const ajuste = fin[a] - v;
      const pips = el('span.attr-pips', Array.from({ length: 6 }, (_, k) => el('i' + (k < v ? '.on' : k < fin[a] ? '.aj' : ''))));
      t.append(el('div.attr-fila',
        el('div.attr-n', el('b', a), el('small', D.ATR_USO[a])),
        el('div.attr-ctrl',
          el('button.btn-icono', { type: 'button', 'aria-label': `Quitar un punto a ${a}`, disabled: v <= 1, onclick: () => { W.attr[a]--; pintar(); }, html: T.ico('menos') }),
          pips,
          el('button.btn-icono', { type: 'button', 'aria-label': `Añadir un punto a ${a}`, disabled: v >= 4 || libres <= 0, onclick: () => { W.attr[a]++; pintar(); }, html: T.ico('mas') }),
        ),
        el('div.attr-final', el('b', String(fin[a])), ajuste ? el('small', `${CB.u.firma(ajuste)} ajuste`) : null),
      ));
    }
    c.append(t);
    if (P.ajuste.elige) {
      c.append(el('h3.as-h', `Ajuste de ${P.n}: +1 a…`));
      const g = el('div.opciones-grid.dos');
      P.ajuste.elige.forEach((a) => g.append(carta(W.ajusteElige === a, { onclick: () => { W.ajusteElige = a; pintar(); } }, el('b', `+1 ${a}`), el('span', D.ATR_USO[a]))));
      c.append(g);
    }
    c.append(el('div.as-azar', el('button.btn.fantasma', { type: 'button', onclick: () => { W.attr = Object.assign({}, RECOMENDADO[W.prota]); pintar(); } }, 'Usar el reparto recomendado'),
      el('small', 'Con 2d6 + 3, una prueba Normal (9) sale el 58 % de las veces; con + 4, el 72 %.')));
  }

  /* ---------- 4 · origen ---------- */
  function pasoOrigen(c) {
    const P = D.PROTAS[W.prota];
    c.append(...cabecera(4, 'De dónde vienes', 'Elige uno o tira 1d6. Cada Origen te da una <b>habilidad</b>, un <b>objeto</b> y una <b>Marca</b> que algunos eventos te preguntarán.', ['r105']));
    const g = el('div.opciones-grid.origenes');
    D.ORIGENES[W.prota].forEach(([n, hab, obj, marca], i) => {
      g.append(carta(W.origen === i, { onclick: () => { W.origen = i; pintar(); } },
        el('span.oc-d', String(i + 1)), el('b', n), el('span.oc-hab', { html: T.inline(hab, {}) }),
        el('span.oc-obj', { html: `${T.ico('objeto')} ${esc(obj)}` }), el('span.marca', marca)));
    });
    c.append(g, el('div.as-azar', el('button.btn.secundario', {
      type: 'button',
      onclick: async () => {
        const r = await A.tirarDados(`Origen de ${P.n}`, 1, 'j', { regla: 'r105', explicar: 'Un dado: el número es la fila de la tabla.' });
        if (r) { W.origen = r.suma - 1; pintar(); }
      },
      html: `${T.ico('dado')} Tirar 1d6`,
    })));
  }

  /* ---------- 5 · rasgos ---------- */
  function pasoRasgos(c) {
    const P = D.PROTAS[W.prota];
    const RS = P.rasgos;
    const ids = rangoRasgos();
    const LIB = CB.libro.entradas;
    const rango = `${ids[0]}–${ids[ids.length - 1]}`;
    if (RS.tira) {
      c.append(...cabecera(5, 'Tus mutaciones', `Caribdis te cambió al nacer. Tira dos veces 1d12 en el catálogo (${rango}); si repites, vuelves a tirar. Las mutaciones 10–12 son <b>defectos</b>: si te sale uno, eliges entre quedártelo a cambio de +1 Temple máximo o volver a tirar.`, [P.regla, 'e710']));
    } else {
      c.append(...cabecera(5, `Elige 2 ${RS.n.toLowerCase()}`, P.regla === 'r102' ? 'Tienes 3 ranuras; cada implante en uso consume Energía según su entrada. Elige dos.' : 'Programas que te dio la nave. Elige dos.', [P.regla]));
    }
    const g = el('div.rasgos');
    const mostrarIds = RS.tira ? W.rasgos.concat(W.pendiente ? [W.pendiente] : []) : ids;
    for (const id of mostrarIds) {
      const e = LIB[id];
      const sel = W.rasgos.includes(id);
      const def = W.defectos.includes(id);
      const card = el('div.rasgo-carta' + (sel ? '.elegida' : '') + (id === W.pendiente ? '.pendiente' : ''),
        el('div.rc-cab', el('span.ent-id', id), el('b', e.titulo.replace(/\*?\(defecto\)\*?/, '').replace(/^\d+ · /, '')), /defecto/.test(e.titulo) ? el('span.etq-defecto', 'defecto') : null, def ? el('span.etq', '+1 Temple máx.') : null),
        el('div.texto', { html: T.render(e.md, { modo: 'lectura' }) }));
      if (!RS.tira) {
        card.classList.add('elegible');
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-pressed', sel ? 'true' : 'false');
        const alternar = (ev) => {
          if (ev.target.closest('.ref')) return;
          if (sel) W.rasgos = W.rasgos.filter((x) => x !== id);
          else if (W.rasgos.length < 2) W.rasgos.push(id);
          else { W.rasgos.shift(); W.rasgos.push(id); }
          pintar();
        };
        card.addEventListener('click', alternar);
        card.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); alternar(ev); } });
      }
      if (id === W.pendiente) {
        card.append(el('div.botones',
          el('button.btn.primario', { type: 'button', onclick: () => { W.rasgos.push(id); W.defectos.push(id); W.pendiente = null; pintar(); } }, 'Me lo quedo (+1 Temple máximo)'),
          el('button.btn.secundario', { type: 'button', onclick: () => { W.pendiente = null; pintar(); tirarMutacion(); } }, 'Vuelvo a tirar')));
      }
      g.append(card);
    }
    c.append(el('div.as-contador', `${W.rasgos.length} de 2`));
    if (RS.tira) {
      const fila = el('div.as-azar');
      if (W.rasgos.length < 2 && !W.pendiente) fila.append(el('button.btn.primario', { type: 'button', onclick: tirarMutacion, html: `${T.ico('dado')} Tirar mutación ${W.rasgos.length + 1} (1d12)` }));
      if (W.rasgos.length) fila.append(el('button.btn.fantasma', { type: 'button', onclick: () => { W.rasgos = []; W.defectos = []; W.pendiente = null; pintar(); } }, 'Empezar de nuevo'));
      fila.append(el('small', { html: `Sin dado de doce: 1d6 + 1d6 par/impar (${T.ref('r002')}).` }));
      c.append(fila);
    }
    c.append(g);
  }
  async function tirarMutacion() {
    const r = await A.tirarNotacion('1d12', `Mutación ${W.rasgos.length + 1}`);
    if (!r) return;
    const v = r.valor;
    const id = 'e' + (709 + v);
    if (W.rasgos.includes(id)) { A.aviso(`Repetida (${v}): vuelve a tirar.`); pintar(); return; }
    if (v >= 10) { W.pendiente = id; A.aviso(`${v}: un defecto. Decide si te lo quedas.`); }
    else W.rasgos.push(id);
    pintar();
  }

  /* ---------- 6 · nombres ---------- */
  function pasoNombres(c) {
    const P = D.PROTAS[W.prota];
    c.append(...cabecera(6, 'Nombres', 'El tuyo y el de la nave que vas a reconstruir. La nave aparece en muchos eventos.', null));
    const fin = attrFinal();
    const [on, hab, obj, marca] = D.ORIGENES[W.prota][W.origen ?? 0];
    c.append(el('div.campos',
      el('label.campo', el('span', 'Tu nombre'), el('input', { type: 'text', maxlength: 40, placeholder: P.N, value: W.nombre, oninput: (e) => (W.nombre = e.target.value) })),
      el('label.campo', el('span', 'Tu nave'), el('div.campo-con', el('input#in-nave', { type: 'text', maxlength: 40, value: W.nave, oninput: (e) => (W.nave = e.target.value) }),
        el('button.btn-icono', { type: 'button', title: 'Otro nombre', 'aria-label': 'Sugerir otro nombre', onclick: () => { W.nave = azar(NAVES.filter((n) => n !== W.nave)); document.getElementById('in-nave').value = W.nave; }, html: T.ico('dado') }))),
    ));
    // resumen tipo ficha
    c.append(el('div.resumen-ficha',
      el('img', { src: `arte/${P.arte}.jpg`, alt: '' }),
      el('div',
        el('div.rf-n', P.N, el('small', ` · ${on}`)),
        el('div.rf-attr', D.ATRIBUTOS.map((a) => el('span', el('small', a), el('b', String(fin[a]))))),
        el('div.rf-l', { html: `<b>Habilidad:</b> ${T.inline(hab, {})} · <b>Objeto:</b> ${esc(obj)} · <span class="marca">${marca}</span>` }),
        el('div.rf-l', { html: `<b>${P.rasgos.n}:</b> ${W.rasgos.map((id) => `${T.ref(id)} ${esc(CB.libro.titulo(id).replace(/\*?\(defecto\)\*?/, '').replace(/^\d+ · /, ''))}`).join(' · ')}` }),
        el('div.rf-l', { html: `<b>Partida:</b> ${D.MODOS[W.modo].n} · ${D.DIFICULTADES[W.dificultad].n}` }),
      ),
    ));
  }

  /* ---------- 7 · preparar (r108) ---------- */
  function pasoPreparar(c) {
    c.append(...cabecera(7, 'Preparar la partida', 'Los dados reparten por el planeta los cinco sistemas perdidos y a tu tripulación. Esos lugares son tus <b>Hallazgos</b>: cuando explores esa región (r153), podrás encontrarlos. El Secreto no se tira: lo dirán los <b>FRAGMENTO_</b> que reúnas (r191).', ['r108', 'r150', 'r153']));
    const p = W.prep;
    if (!p) {
      c.append(el('div.prep-vacia',
        el('div.secreto-sobre.cerrado', el('span', 'El Secreto'), el('small', 'lo dirán tus FRAGMENTO_')),
        el('button.btn.primario.grande', { type: 'button', onclick: tirarPrep, html: `${T.ico('dado')} Tirar la preparación` }),
        el('p.as-nota', { html: `1d8 por sistema y por tripulante${W.prota === 'piloto' ? ', y 1d6 para el tripulante que ya está contigo' : ''}${W.estacion === 'azar' ? ', y 1d6 para la estación' : ''}. Si juegas con tus propios dados, después puedes corregir cada valor.` }),
      ));
      return;
    }
    const sel = (v, on) => { const s = el('select', { onchange: (e) => { on(+e.target.value); pintar(); } }); for (let r = 1; r <= 8; r++) s.append(el('option', { value: r, selected: r === v ? true : null }, `${r} · ${D.REGIONES[r].n}`)); return s; };
    const mapa = el('div.prep-mapa');
    const filasSis = D.SISTEMAS.map((s, i) => el('tr', { style: { animationDelay: `${i * 70}ms` } },
      el('th', s), el('td.d', String(p.sistemas[i])), el('td', sel(p.sistemas[i], (v) => (p.sistemas[i] = v)))));
    filasSis.push(el('tr', el('th', D.PROTAS[W.prota].personal), el('td.d', '—'),
      el('td', el('small', W.modo === 'corta' ? 'Ya instalado, Precario (r211)' : 'Lo encontrarás por tu historia'))));
    const filasTri = Object.keys(D.TRIPULACION).map((t, i) => {
      const cont = p.compa === t ? el('b', 'Ya está contigo') : W.modo === 'corta' && p.esperando === t ? el('b', 'Te espera en la Cicatriz') : sel(p.tripu[i], (v) => (p.tripu[i] = v));
      return el('tr' + (p.compa === t ? '.con' : ''), { style: { animationDelay: `${(i + 5) * 70}ms` } },
        el('th', el('img.mini', { src: `arte/${D.TRIPULACION[t].arte}.jpg`, alt: '' }), t, el('small', ` · ${D.TRIPULACION[t].rol}`)),
        el('td.d', p.compa === t ? '—' : String(p.tripu[i])),
        el('td', cont));
    });
    c.append(el('div.prep',
      el('div.prep-col',
        el('h3.as-h', 'Sistemas de la nave'),
        el('table.prep-tabla', el('tbody', filasSis)),
        el('h3.as-h', 'Tripulación'),
        el('table.prep-tabla', el('tbody', filasTri)),
      ),
      el('div.prep-col',
        mapa,
        el('div.secreto-sobre', el('span', 'El Secreto'), el('small', 'Sin tirar: lo dirán tus FRAGMENTO_ (e840).'), el('i', { html: T.ico('canto') })),
        W.estacion !== 'ninguna' ? el('div.prep-estacion', { html: `<span class="et">Estación ${T.ref('r213')}</span><b>${p.estacion} · ${D.ESTACIONES[p.estacion][0]}</b><span>${D.ESTACIONES[p.estacion][1]}</span>` }) : null,
        W.modo === 'corta' ? el('label.campo', el('span', { html: `Tripulante esperando en la Cicatriz ${T.ref('r211')}` }), (() => { const s = el('select', { onchange: (e) => { p.esperando = e.target.value; pintar(); } }); Object.keys(D.TRIPULACION).filter((t) => t !== p.compa).forEach((t) => s.append(el('option', { value: t, selected: p.esperando === t ? true : null }, `${t} · ${D.TRIPULACION[t].rol}`))); return s; })()) : null,
        el('button.btn.fantasma', { type: 'button', onclick: tirarPrep, html: `${T.ico('dado')} Volver a tirar todo` }),
      ),
    ));
    // mapa con lo repartido
    const tmp = { sistemas: {}, tripu: {}, region: 1, pistas: [], marcas: [] };
    D.SISTEMAS.forEach((s, i) => (tmp.sistemas[s] = { estado: 'perdido', region: p.sistemas[i] }));
    Object.keys(D.TRIPULACION).forEach((t, i) => (tmp.tripu[t] = { estado: p.compa === t ? 'contigo' : 'perdido', region: p.compa === t ? null : p.tripu[i] }));
    try { mapa.append(CB.hoja.mapa(tmp, { compacto: true })); } catch (e) { /* el mapa es decorativo aquí */ }
  }
  function tirarPrep() {
    const nombres = Object.keys(D.TRIPULACION);
    const p = {
      sistemas: D.SISTEMAS.map(() => CB.u.d(8)),
      tripu: nombres.map(() => CB.u.d(8)),
      compa: W.prota === 'piloto' ? nombres[CB.u.d(6) - 1] : null,
      estacion: W.estacion === 'azar' ? CB.u.d(6) : typeof W.estacion === 'number' ? W.estacion : null,
      esperando: null,
    };
    if (W.modo === 'corta') p.esperando = nombres.find((t) => t !== p.compa);
    W.prep = p;
    pintar();
  }

  /* ---------- empezar ---------- */
  function empezar() {
    const P = D.PROTAS[W.prota];
    const p = W.prep;
    const S = M.nueva({
      prota: W.prota, nombre: W.nombre.trim() || P.N, nave: W.nave.trim() || 'Sin nombre',
      modo: W.modo, dificultad: W.dificultad, estacion: p.estacion,
      attr: attrFinal(), origen: D.ORIGENES[W.prota][W.origen], rasgos: W.rasgos,
    });
    if (W.defectos.length) { S.templeMax += W.defectos.length; M.log(S, `Te quedas ${W.defectos.length === 1 ? 'un defecto' : W.defectos.length + ' defectos'}: +${W.defectos.length} Temple máximo.`, ['e710']); }
    M.preparar(S, { sistemas: p.sistemas, tripu: p.tripu, compa: p.compa, esperando: p.esperando, estacion: p.estacion });
    if (p.compa) M.log(S, `${p.compa} sobrevivió a la caída contigo.`, ['r108']);
    if (p.estacion) M.log(S, `Estación: ${D.ESTACIONES[p.estacion][0]}. ${D.ESTACIONES[p.estacion][1]}.`, ['r213']);
    S.escena = { tipo: 'evento', id: 'e001', origen: 'prologo', aplicados: {}, ramas: {}, si: {}, dados: {}, elegida: null, plantilla: null };
    M.log(S, `Lees e001 · ${CB.libro.titulo('e001')}.`, [], { ev: 'e001' });
    A.S = S;
    A.deshacer = [];
    A.vista = 'mesa';
    W = null;
    A.guardar();
    C.salir();
  }
})();
