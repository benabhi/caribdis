/* =====================================================================
   CARIBDIS · interfaz: la Mesa
   El bucle del día (amanecer, acción, anochecer), los eventos jugables,
   el combate, los pecios, el taller, los asentamientos y el despegue.
   Cada paso muestra las reglas que lo gobiernan.
   ===================================================================== */
'use strict';
(function () {
  const { esc } = CB.u;
  const el = CB.el;
  const D = CB.D, M = CB.motor, T = CB.texto, A = CB.app;
  const Me = (CB.mesa = {});
  const LIB = () => CB.libro.entradas;

  /* ---------------- guía: consejos que enseñan a jugar ---------------- */
  const GUIA = {
    prologo: 'Así empieza: el <b>prólogo</b> son unos pocos eventos seguidos. Lee, elige una opción y sigue la flecha. Nada aquí es una trampa.',
    evento: 'Esto es un <b>evento</b>. Elige una opción numerada. Las <b>pruebas</b> con dado se tiran tocándolas; las <b>fichas</b> (+2 Raciones, 1 Herida, Marcas…) se aplican con un toque y se deshacen con otro. Las flechas te llevan al siguiente evento. Toca cualquier rXXX para leer la regla.',
    amanecer: 'Cada día tiene tres fases: <b>amanecer, una acción y anochecer</b> (r130). Al amanecer el Reloj baja, comes y respiras, y quizá el Canto te visite.',
    accion: 'Ahora eliges <b>una sola acción</b> para hoy (r132). Al principio lo habitual es <b>explorar</b> para buscar los pecios y la tripulación que anotaste, y <b>viajar</b> hacia ellos. Mira el mapa: ahí están marcados.',
    anochecer: 'Al <b>anochecer</b> se cobran los descansos y, si duermes a la intemperie, algo puede encontrarte (r133). En ciertos días toca un evento de tu historia personal.',
    viaje: 'Viajar es ir a una <b>región vecina</b> (r150). Tiras para orientarte y, llegues o no, hay un <b>encuentro</b> en la tabla de la región: la columna es tu Alerta (r154).',
    hallazgo: 'Un <b>Hallazgo</b> (r153): si aquí está algo de lo que anotaste al preparar la partida, ve a por ello. Si no, un pecio da botín, forrajear da comida y rebuscar da piezas.',
    pecio: 'Un pecio se explora <b>sala a sala</b> (r170): tiras 2d6 y miras la tabla. Después de cada sala decides si sigues o sales. Como mucho, 4 salas.',
    combate: 'En el <b>combate</b> (r140) cada ronda eliges una maniobra. Tú y el enemigo tiráis 2d6 + Ataque: quien saque más golpea, y la diferencia da el daño. El Blindaje lo reduce.',
    nave: 'En la Cicatriz puedes <b>instalar</b> los sistemas que traigas. Seis sistemas instalados y podrás despegar (r183).',
    visita: 'En un <b>asentamiento</b> puedes usar todos los servicios que quieras el mismo día, y además una actividad especial (r160). Dormir aquí cuenta como descanso.',
    plantilla: 'Las <b>plantillas</b> (r300) resuelven encuentros sin opciones: elige una postura, tira 1d6 y lee lo que te toca.',
    taller: '<b>Ensamblar</b> (r203) convierte piezas en objetos usando planos. Un Éxito pleno da una obra maestra.',
  };
  function guia(k) {
    if (!A.aj.guia || A.aj.vistos['g-' + k]) return null;
    const caja = el('aside.guia', el('span.guia-ico', { html: T.ico('consejo') }), el('div.guia-t', { html: T.inline(GUIA[k].replace(/<b>/g, '**').replace(/<\/b>/g, '**'), {}) }),
      el('button.guia-x', { type: 'button', 'aria-label': 'Entendido', onclick: () => { A.aj.vistos['g-' + k] = 1; A.guardar(); caja.remove(); } }, 'Entendido'));
    return caja;
  }
  function reglas(ids) {
    return el('div.en-juego', el('span.et', 'Reglas en juego'), ids.map((id) => el('button.chip-ref', { type: 'button', onclick: () => A.abrirCodice(id) }, el('b', id), ' ', CB.libro.titulo(id).replace(/ \(2d6\)| \(1d6\)/, ''))));
  }
  function cab(ico, sobre, titulo, sub) {
    return el('header.fase-cab', el('span.fase-ico', { html: T.ico(ico) }), el('div', el('div.fase-sobre', sobre), el('h1.fase-t', titulo), sub ? el('p.fase-sub', { html: sub }) : null));
  }

  /* ================================================================
     PINTAR
     ================================================================ */
  Me.pintar = function (cont) {
    const S = A.S;
    cont.innerHTML = '';
    if (S.fin) return pintarFin(cont, S);
    pintarAvisos(cont, S);
    const e = S.escena;
    const f = { evento: pintarEvento, amanecer: pintarAmanecer, accion: pintarAccion, anochecer: pintarAnochecer, viaje: pintarViaje, hallazgo: pintarHallazgo, pecio: pintarPecio, nave: pintarNave, pistas: pintarPistas, taller: pintarTaller }[e.tipo];
    (f || pintarAccion)(cont, S, e);
    A.enlazarRefs(cont);
  };

  /* ---------------- avisos: lo que el libro te manda hacer ---------------- */
  function pintarAvisos(cont, S) {
    const urg = S.avisos.filter((a) => !a.tipo || a.tipo === 'tirada');
    const pend = S.avisos.filter((a) => a.tipo === 'pendiente' || a.tipo === 'descanso');
    const notas = S.notas || [];
    if (!urg.length && !pend.length && !notas.length) return;
    const caja = el('div.avisos-libro');
    urg.forEach((a) => {
      caja.append(el('div.aviso-libro', el('span.al-ico', { html: T.ico('recuerda') }),
        el('div.al-t', { html: `<b>El libro te manda:</b> ${T.inline(a.txt, {})} ${a.regla ? T.ref(a.regla) : ''}` }),
        a.tirada ? el('button.btn.primario', { type: 'button', onclick: () => tiradaAviso(a) }, 'Tirar') : el('button.btn.primario', { type: 'button', onclick: () => irAviso(a) }, el('span', { html: `${T.ico('ir')} Ir a ${a.ev}` })),
        el('button.btn-icono.peq', { type: 'button', title: 'Descartar (si ya lo hiciste)', 'aria-label': 'Descartar aviso', onclick: () => A.hacer((S) => { S.avisos = S.avisos.filter((x) => x !== a && x.clave !== a.clave); }), html: T.ico('cerrar') })));
    });
    if (pend.length) {
      caja.append(el('details.pendientes', el('summary', `Pendiente${pend.length > 1 ? 's' : ''} (${pend.length})`), pend.map((a) => el('div.aviso-libro.peq', el('div.al-t', { html: T.inline(a.txt, {}) + ' ' + T.ref(a.regla) }),
        el('button.btn.mini', { type: 'button', onclick: () => irAviso(a) }, `Ir a ${a.ev}`),
        el('button.btn-icono.peq', { type: 'button', 'aria-label': 'Descartar', onclick: () => A.hacer((S) => { S.avisos = S.avisos.filter((x) => x.clave !== a.clave); }), html: T.ico('cerrar') })))));
    }
    if (notas.length) caja.append(cajaNotas(S, notas));
    cont.append(caja);
  }
  /** recordatorios guardados de los eventos: se abren solos si alguno es de esta región */
  function cajaNotas(S, notas) {
    const aqui = notas.filter((n) => n.region === S.region);
    const d = el('details.pendientes.recordatorios', { open: aqui.length ? true : null },
      el('summary', `Recordatorios (${notas.length})${aqui.length ? ' · ' + aqui.length + ' aquí' : ''}`),
      notas.map((n) => el('div.aviso-libro.peq' + (n.region === S.region ? '.aqui' : ''),
        el('div.al-t', { html: `${esc(n.txt)} ${n.ev ? T.ref(n.ev) : ''}${n.region ? ` <small>· ${D.REGIONES[n.region].corto}</small>` : ''}${n.tipo !== 'nota' ? ` <small>· la app te lo ofrece al tirar</small>` : ''}` }),
        el('button.btn.mini', { type: 'button', title: 'Ya lo aplicaste o ya no vale', onclick: () => A.hacer((S) => M.notaUsada(S, n.id, 'cumplido')) }, 'Hecho'))));
    return d;
  }
  Me.cajaNotas = cajaNotas;
  function irAviso(a) {
    A.hacer((S) => {
      S.avisos = S.avisos.filter((x) => x.clave !== a.clave);
      Me._jugar(S, a.ev, 'aviso', { despues: a.despues });
    });
  }
  async function tiradaAviso(a) {
    if (a.tirada === 'inestabilidad') {
      const r = await A.tirarDados('Inestabilidad (r103)', 1, 'x', { regla: 'r103', explicar: 'Con un 1 ganas una mutación nueva al azar.' });
      if (!r) return;
      A.hacer((S) => { S.avisos = S.avisos.filter((x) => x.clave !== a.clave); });
      if (r.dados[0] === 1) {
        let id;
        for (let k = 0; k < 20; k++) {
          const t = await A.tirarNotacion('1d12', 'Mutación nueva (1d12)');
          if (!t) return;
          id = 'e' + (709 + t.valor);
          if (!A.S.rasgos.includes(id)) break;
          A.aviso('Ya la tienes: se vuelve a tirar.');
        }
        A.hacer((S) => { S.rasgos.push(id); M.log(S, `Mutación nueva: ${CB.libro.titulo(id)}.`, ['r103']); });
        A.abrirCodice(id);
      } else A.aviso('Tu cuerpo aguanta. Por ahora.');
    }
  }

  /* ================================================================
     EVENTOS
     ================================================================ */
  Me._jugar = function (S, id, origen, extra = {}) {
    if (['aviso', 'libre'].includes(origen) || (origen === 'noche' && S.escena.tipo === 'anochecer')) {
      S.pila = S.pila || [];
      if (S.escena.tipo !== 'evento' || origen !== 'aviso' || true) S.pila.push(S.escena);
    }
    S.escena = Object.assign({ tipo: 'evento', id, origen, aplicados: {}, ramas: {}, si: {}, dados: {}, elegida: null, plantilla: null }, extra);
    const e = LIB()[id];
    M.log(S, `Lees ${id} · ${e ? e.titulo : ''}.`, [], { ev: id });
    // r194: aliado/enemigo pendiente al estar en su asentamiento
  };
  Me.jugarEvento = (id, origen = 'libre') => A.hacer((S) => Me._jugar(S, id, origen));
  Me.irA = function (id) {
    A.hacer((S) => {
      const e = S.escena;
      S.escena = Object.assign({}, e, { id, aplicados: {}, ramas: {}, si: {}, dados: {}, elegida: null, plantilla: null, sumado: false, combate: null, despegue: null });
      M.log(S, `→ ${id} · ${CB.libro.titulo(id)}.`, [], { ev: id });
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const m = document.getElementById('mesa');
    if (m) m.scrollTop = 0;
  };

  function regionDeEvento(e) {
    const l = e.lugar || '';
    for (const r in D.REGIONES) if (l.startsWith(D.REGIONES[r].n)) return +r;
    return null;
  }
  const FINALES = new Set(['e903', 'e908', 'e910', 'e911', 'e912', 'e913', 'e914', 'e915', 'e916', 'e917', 'e918', 'e919', 'e920']);

  function pintarEvento(cont, S, esc_) {
    const e = LIB()[esc_.id];
    if (!e) { cont.append(el('p', 'Evento no encontrado: ' + esc_.id)); return; }
    const g = guia(esc_.origen === 'prologo' && esc_.id === 'e001' ? 'prologo' : 'evento');
    if (g) cont.append(g);
    const reg = regionDeEvento(e);
    const art = reg ? D.REGIONES[reg].arte : esc_.id.startsWith('e00') || esc_.id === 'e012' ? 'r-panoramica' : null;
    const tiempo = e.tiempo;
    const TIEMPO = { '0': 'No gasta el día', 'día': 'Consume tu acción del día', '+1': 'Consume el día y el Reloj baja 1 más' };
    const cabeza = el('header.ev-cab' + (art ? '.con-arte' : ''),
      art ? el('div.ev-arte', { style: { backgroundImage: `url(arte/${art}.jpg)` } }) : null,
      el('div.ev-sello', el('span.ev-id', esc_.id), el('span.ev-tipo', e.cap.replace(/^Región \d · /, ''))),
      el('h1.ev-t', e.titulo),
      el('div.ev-lugar', { html: `${e.lugar ? T.inline(e.lugar.replace(/ · ⌛.*$/, ''), {}) : ''}${tiempo ? ` <span class="tiempo t-${tiempo === '+1' ? 'mas' : tiempo === '0' ? 'cero' : 'dia'}" title="${TIEMPO[tiempo]} (r003)">${T.ico('tiempo')} ${tiempo === '0' ? '0' : tiempo === '+1' ? '+1' : 'día'} · ${TIEMPO[tiempo]}</span>` : ''}` }),
    );
    const art_ = el('article.evento');
    art_.append(cabeza);
    // barra contextual
    const barra = barraContextual(S, esc_, e);
    if (barra) art_.append(barra);
    const ctx = { modo: 'evento', S, sistema: M.SISTEMA_DE_EVENTO[esc_.id] };
    const cuerpo = el('div.texto.ev-texto', { html: T.render(e.md, ctx) });
    // la narración del principio (párrafos sin fichas ni botones) va en su propio bloque, separada de las opciones
    const narr = el('div.narracion');
    while (cuerpo.firstElementChild && cuerpo.firstElementChild.tagName === 'P' && !cuerpo.firstElementChild.querySelector('button, .tk')) narr.append(cuerpo.firstElementChild);
    if (narr.children.length && cuerpo.children.length) cuerpo.prepend(narr);
    else if (narr.children.length) cuerpo.append(...narr.childNodes);
    art_.append(cuerpo);
    // claves estables para recordar lo que ya hiciste en este evento
    cuerpo.querySelectorAll('.tk, .op-elegir, .marca.tk').forEach((b, i) => (b.dataset.k = i));
    restaurarEvento(cuerpo, esc_);
    herramientasEvento(cuerpo, S, esc_);
    cuerpo.addEventListener('click', (ev) => clicEvento(ev, cuerpo));
    // plantilla r300 ya tirada
    if (esc_.plantilla) {
      const ancla = cuerpo.querySelector('.encuentro-r300');
      if (ancla) ancla.append(pintarPlantilla(S, esc_, e));
    }
    // asistente de despegue
    if (esc_.id === 'e900') art_.insertBefore(asistenteDespegue(S, esc_), cuerpo);
    if (['e400', 'e410', 'e420', 'e430'].includes(esc_.id) && esc_.origen === 'accion') art_.append(servicios(S, esc_));
    else if (esc_.tienda) art_.insertBefore(servicios(S, esc_, { soloTienda: true }), art_.lastElementChild);
    art_.append(pieEvento(S, esc_, e));
    actualizarPie(cuerpo);
    cont.append(art_);
    const refs = [...new Set((e.md.match(/\br\d{3}\b/g) || []))].slice(0, 6);
    if (refs.length) cont.append(reglas(refs));
  }

  function barraContextual(S, esc_, e) {
    const id = esc_.id;
    const tri = Object.keys(D.TRIPULACION).find((t) => D.TRIPULACION[t].ev === id);
    if (tri) {
      const st = S.tripu[tri];
      if (['contigo', 'cicatriz'].includes(st.estado)) return el('div.barra-ctx', { html: `${T.ico('check')} ${D.TRIPULACION[tri].n} ya está con vosotros (${st.estado === 'contigo' ? 'va contigo' : 'en la Cicatriz'}).` });
      return el('div.barra-ctx', el('span', { html: `${T.ico('grupo')} <b>${D.TRIPULACION[tri].n}</b>. Si se une, márcalo aquí (${T.ref('r185')}):` }),
        el('button.btn.mini', { type: 'button', onclick: () => A.hacer((S) => A.notas(M.unirTripulante(S, tri, 'contigo').notas)) }, 'Va conmigo'),
        el('button.btn.mini.secundario', { type: 'button', onclick: () => A.hacer((S) => A.notas(M.unirTripulante(S, tri, 'cicatriz').notas)) }, 'Espera en la Cicatriz'));
    }
    const sis = M.SISTEMA_DE_EVENTO[id];
    if (sis && ['e560', 'e562', 'e564', 'e566', 'e568'].includes(id)) {
      return el('div.barra-ctx', { html: `${T.ico('nave')} El pecio de tu <b>${sis}</b>. Cuando el texto te dé el sistema, toca su ficha de calidad (p. ej. «${sis} Sólido») y se anotará como «llevado». Después, a la Cicatriz para instalarlo (${T.ref('r181')}).` });
    }
    if (FINALES.has(id)) return el('div.barra-ctx.final', { html: `${T.ico('fin')} Este es un final. Al terminar de leerlo, la partida acaba (${T.ref('r196')}).` });
    if (D.PULSOS.includes(id)) return el('div.barra-ctx.canto', { html: `${T.ico('canto')} Un pulso del Canto (${T.ref('r131')}). Si el libro no dice otra cosa, después sigues con tu día.` });
    if (esc_.despues && esc_.despues.canto != null) return el('div.barra-ctx.canto', { html: `${T.ico('canto')} Después de leer esto, tu Canto baja a 4 (${T.ref('r137')}).` });
    return null;
  }

  /* ---------------- herramientas dentro de un evento ----------------
     Lo que el texto manda hacer con otra regla (explorar un pecio, oír un rumor, un Hallazgo…)
     o guardar «para la próxima vez» se puede hacer aquí mismo, sin terminar el día. */
  const RE_DIFERIDO = /(la próxima vez|tu próxima|en tu próxim|hasta tu próxim|los próximos \d+ días|durante (?:dos|tres|\d) días|el próximo Explorar|hasta el próximo|(?:hasta|antes de) que el Reloj baje \d+|al día siguiente|al amanecer de \*?\*?mañana)/i;
  const TIPOS_PECIO = [[/Arca de los Antiguos/, 5], [/[Nn]ave colonia/, 2], [/[Nn]ave militar|\bMilitar\b/, 3], [/\bCarguero\b/, 1], [/\bYate\b/, 4], [/[Pp]ecio sin nombre/, 6]];
  function textoPropio(n) {
    const c = n.cloneNode(true);
    c.querySelectorAll('ul, ol, .ya-hecho, .herr-fila, .op-num, .op-elegir').forEach((x) => x.remove());
    c.querySelectorAll('.tk.ir').forEach((x) => x.replaceWith('→ ' + x.dataset.ir));
    c.querySelectorAll('.rama-et').forEach((x) => x.replaceWith(' ¶ ' + x.textContent + ': '));
    c.querySelectorAll('.rama, .rama-si, p, div').forEach((x) => x.append(' ¶ '));
    return c.textContent.replace(/\s+/g, ' ').replace(/(\s*¶\s*)+$/, '').trim();
  }
  function frases(t) { return t.split(/¶|(?<=[.!?»)])\s*(?=[A-ZÁÉÍÓÚ«*(])/).map((x) => x.replace(/\s+/g, ' ').trim()).filter(Boolean); }
  function herramientasEvento(cuerpo, S, esc_) {
    const nodos = [...cuerpo.querySelectorAll('li, p')].filter((n) => !n.closest('.ya-hecho, .encuentro-r300'));
    for (const n of nodos) {
      const t = textoPropio(n);
      if (!t) continue;
      const bots = [];
      // efectos para más adelante → recordatorio
      frases(t).filter((f) => RE_DIFERIDO.test(f) && !/quizás la próxima vez|^Clima:/.test(f)).forEach((f) => {
        const ya = (S.notas || []).some((x) => x.txt === f && x.ev === esc_.id);
        bots.push(el('button.tk.herr.recordar' + (ya ? '.hecho' : ''), { type: 'button', 'data-herr': JSON.stringify({ k: 'nota', txt: f }), title: ya ? 'Ya lo guardaste: está en Recordatorios' : 'Guárdalo: la app te lo recordará y, si es un Fallo ignorado o una Ventaja, te lo ofrecerá al tirar' }, el('span', { html: T.ico('recuerda') }), ya ? 'Guardado' : 'Guardar para después'));
      });
      // explorar un pecio (r170 / r171)
      if (/\(r17[01]\b|[Pp]ecio \(r170|un pecio en el que/.test(t) && /[Pp]ecio|[Ee]xplóralo/.test(t)) {
        const tipos = TIPOS_PECIO.filter(([re]) => re.test(t)).map(([, v]) => v);
        const veces = /tira(?:ndo)? tres veces el tipo/.test(t) ? 3 : /tira(?:ndo)? dos veces el tipo/.test(t) ? 2 : 1;
        const max = (t.match(/hasta (\d) salas/) || [])[1] || (/máximo 3/.test(t) ? 3 : null);
        bots.push(el('button.tk.herr.pecio', { type: 'button', 'data-herr': JSON.stringify({ k: 'pecio', tipos, veces, max: max ? +max : null, cond: t }) }, el('span', { html: T.ico('reliquia') }), 'Explorar el pecio ahora'));
      }
      // un rumor (r164)
      if (/rumor[^.]*\(r164/.test(t) || /\(r164, tirando 2d6\)/.test(t)) {
        const mas = /con \+1/.test(t) ? 1 : 0;
        bots.push(el('button.tk.herr.rumor', { type: 'button', 'data-herr': JSON.stringify({ k: 'rumor', mas, n: /dos rumores/.test(t) ? 2 : 1 }) }, el('span', { html: T.ico('pista') }), mas ? 'Tirar el rumor (+1)' : /dos rumores/.test(t) ? 'Tirar dos rumores' : 'Tirar un rumor'));
      }
      // un Hallazgo de la región (r153)
      if (/un Hallazgo de la región \(r153\)/.test(t)) bots.push(el('button.tk.herr.hallazgo', { type: 'button', 'data-herr': JSON.stringify({ k: 'hallazgo' }) }, el('span', { html: T.ico('buscar') }), 'Elegir el Hallazgo'));
      // un Hallazgo más que hay que situar (la caja negra, el núcleo de memoria…)
      const hm = t.match(/Tira 1d8 (?:dos veces )?y anota[^.]*Hallazgo más \(r153\)\. Cuando la encuentres → (e\d{3})/);
      if (hm && S.sistemas.Personal) {
        const Pe = S.sistemas.Personal;
        const ya = Pe && Pe.ev === hm[1] && Pe.region;
        bots.push(el('button.tk.herr.hallazgo' + (ya ? '.hecho' : ''), { type: 'button', 'data-herr': JSON.stringify({ k: 'situar', ev: hm[1] }) }, el('span', { html: T.ico('mapa') }), ya ? `Anotado: ${D.REGIONES[Pe.region].corto}` : 'Tirar 1d8 dos veces y elegir'));
      }
      // un tripulante que aún no encontraste está aquí (o lo eliges): su primer evento
      if (/tripulante (?:tuyo )?que (?:aún )?no (?:hayas|has) encontrado/.test(t) && /primer evento/.test(t)) bots.push(el('button.tk.herr.tripu', { type: 'button', 'data-herr': JSON.stringify({ k: 'tripulante' }) }, el('span', { html: T.ico('grupo') }), 'Elegir el tripulante e ir a su evento'));
      // el clima que deja un evento
      const cl = t.match(/Clima: ([^.(]+?) hasta mañana/);
      if (cl) { const ya = S.clima && S.clima.n === cl[1].trim(); bots.push(el('button.tk.herr.clima' + (ya ? '.hecho' : ''), { type: 'button', 'data-herr': JSON.stringify({ k: 'clima', n: cl[1].trim() }) }, el('span', { html: T.ico('tiempo') }), ya ? 'Clima anotado' : 'Anotar el clima')); }
      // comerciar en un evento (r161)
      if (/comprar como en un asentamiento|de la tabla r161/.test(t)) bots.push(el('button.tk.herr.tienda', { type: 'button', 'data-herr': JSON.stringify({ k: 'tienda' }) }, el('span', { html: T.ico('asentamiento') }), 'Abrir la tienda (r161)'));
      if (!bots.length) continue;
      const fila = el('span.herr-fila', bots);
      // en una opción, los botones van al final de su propio texto (antes de sus sublistas)
      const dentro = n.querySelector(':scope > .op-cuerpo') || n;
      const sub = dentro.querySelector(':scope > ul, :scope > ol');
      if (sub) dentro.insertBefore(fila, sub); else dentro.append(fila);
    }
  }
  async function herramienta(h) {
    const S = A.S;
    if (h.k === 'nota') {
      const ya = (S.notas || []).find((x) => x.txt === h.txt && x.ev === S.escena.id);
      if (ya) return A.hacer((S) => M.notaUsada(S, ya.id, 'quitado'));
      if (/elige una región/.test(h.txt)) {
        return A.modal('¿Qué región eliges?', el('div.botones-col', Object.keys(D.REGIONES).map((r) => el('button.btn.secundario', { type: 'button', onclick: () => { A.cerrarModal(); A.hacer((S) => M.notaNueva(S, h.txt, S.escena.id, { region: +r })); } }, `${r} · ${D.REGIONES[r].n}`))), { clase: 'estrecho' });
      }
      A.hacer((S) => M.notaNueva(S, h.txt, S.escena.id));
      return A.aviso('Guardado en <b>Recordatorios</b> (arriba, en la mesa). Si es un Fallo que puedes ignorar o una Ventaja, la app te lo ofrecerá al tirar.', 'regla');
    }
    if (h.k === 'pecio') return Me.pecioDesde(h);
    if (h.k === 'clima') return A.hacer((S) => { S.clima = { n: h.n, hasta: S.dia + 1 }; M.log(S, `Clima: ${h.n} hasta mañana.`, ['r155']); });
    if (h.k === 'tienda') return A.hacer((S) => { S.escena.tienda = !S.escena.tienda; });
    if (h.k === 'tripulante') {
      const perd = Object.keys(S.tripu).filter((t) => S.tripu[t].estado === 'perdido');
      if (!perd.length) return A.aviso('Ya encontraste a toda tu tripulación.');
      return A.modal('¿Qué tripulante?', [el('p.ayuda-mini', 'Lees su primer evento y, al terminarlo, vuelves aquí.'), el('div.botones-col', perd.map((t) => el('button.btn.secundario', { type: 'button', onclick: () => { A.cerrarModal(); A.hacer((S) => { S.tripu[t].region = S.region; Me._jugar(S, D.TRIPULACION[t].ev, 'aviso'); }); } }, `${t} · ${D.TRIPULACION[t].rol}${S.tripu[t].region ? ' (anotado en ' + D.REGIONES[S.tripu[t].region].corto + ')' : ''}`)))], { clase: 'estrecho' });
    }
    if (h.k === 'rumor') { for (let i = 0; i < (h.n || 1); i++) await Me.rumor({ mas: h.mas, gratis: true }); return; }
    if (h.k === 'hallazgo') return A.hacer((S) => { S.escena = { tipo: 'hallazgo', pleno: false }; });
    if (h.k === 'situar') {
      const r1 = await A.tirarNotacion('1d8', 'Dónde está (primer 1d8)');
      if (!r1) return;
      const r2 = await A.tirarNotacion('1d8', 'Dónde está (segundo 1d8)');
      if (!r2) return;
      const memoria = S.prota === 'mente' ? S.contador : 0;
      const ops = h.ev === 'e826' && memoria >= 3 ? [1, 2, 3, 4, 5, 6, 7, 8] : [...new Set([r1.valor, r2.valor])];
      const valor = ops.length === 1 ? ops[0] : await new Promise((ok) => A.modal(ops.length > 2 ? 'Con MEMORIA 3 o más, elige cualquier región' : `Sacaste ${r1.valor} y ${r2.valor}: elige`, el('div.botones-col', ops.map((v) => el('button.btn.secundario', { type: 'button', onclick: () => { A.cerrarModal(); ok(v); } }, `${v} · ${D.REGIONES[v].n}`))), { clase: 'estrecho' }));
      if (!valor) return;
      A.hacer((S) => {
        const Pe = S.sistemas.Personal;
        Object.assign(Pe, { estado: 'perdido', region: valor, ev: h.ev });
        M.log(S, `${Pe.n || 'Tu sistema personal'}: está en ${D.REGIONES[valor].n}. Es un Hallazgo más (r153).`, ['r153', h.ev]);
      });
      return A.aviso(`Anotado en la Hoja (pestaña Nave): está en <b>${D.REGIONES[valor].n}</b>. Explora allí para encontrarlo.`);
    }
  }
  /** explorar un pecio que manda un evento; al salir vuelves al evento para terminarlo */
  Me.pecioDesde = async function (h = {}) {
    let tipo = null;
    const tipos = h.tipos || [];
    const elegir = (ops, titulo) => new Promise((ok) => A.modal(titulo, el('div.botones-col', ops.map((d) => el('button.btn.secundario', { type: 'button', onclick: () => { A.cerrarModal(); ok(d); } }, `${d} · ${D.PECIOS[d].n}`))), { clase: 'estrecho', cerrable: true, alCerrar: () => ok(null) }));
    if (tipos.length === 1) tipo = tipos[0];
    else if (tipos.length > 1) tipo = await elegir(tipos, 'Elige el pecio');
    else {
      const n = h.veces || 1;
      const r = await A.tirarDados(n > 1 ? `Tipo de pecio (${n} veces)` : 'Tipo de pecio (1d6)', n, 'x', { regla: 'r171' });
      if (!r) return;
      const vals = [...new Set(r.dados)];
      tipo = vals.length > 1 ? await elegir(vals, 'Elige el pecio') : vals[0];
    }
    if (!tipo) return;
    A.hacer((S) => {
      const volver = S.escena && S.escena.tipo === 'evento';
      if (volver) { S.pila = S.pila || []; S.pila.push(S.escena); }
      const P = M.pecioNuevo(S, tipo);
      if (h.max) P.max = h.max;
      if (h.cond) P.cond = h.cond;
      if (volver) P.volver = S.escena.id;
      S.escena = { tipo: 'pecio', P };
    });
  };
  function salirPecio(S) {
    const P = S.escena.P;
    if (P && P.volver && S.pila && S.pila.length) { S.escena = S.pila.pop(); M.log(S, `Sales del pecio y vuelves a ${P.volver}.`, ['r170']); return; }
    entrarAnochecer(S);
  }
  /** rumor (r164): de pago en los asentamientos, gratis si lo da un evento */
  Me.rumor = async function ({ mas = 0, gratis = false } = {}) {
    const r = await A.tirarDados(`Rumor (2d6${mas ? ' +' + mas : ''})`, 2, 'x', { regla: 'r164' });
    if (!r) return;
    const suma = Math.min(12, r.suma + mas);
    A.hacer((S) => {
      if (!gratis) { S.hoy.rumor = 1; M.cambiar(S, 'chatarra', -1, 'rumores'); }
      aplicarRumor(S, suma);
    });
  };
  function aplicarRumor(S, suma) {
    const R = D.RUMORES[suma];
    if (!R) {
      M.notaNueva(S, 'Rumor: alguien de tu tripulación pasó por aquí. Elige un tripulante perdido: la próxima vez que explores su región, tienes Ventaja.', 'r164', { tipo: 'ventaja', cuando: 'explorar', region: null });
      A.aviso('Rumor 7: alguien de tu tripulación pasó por aquí (r164). Está en <b>Recordatorios</b>: la Ventaja te la ofrece la app al explorar.');
      return;
    }
    A.notas(M.pista(S, { region: R[1], nombre: R[2], ev: R[3] }).notas);
    A.aviso(`Nueva Pista: <b>${R[2]}</b> (${R[0]})`);
  }
  Me.aplicarRumor = aplicarRumor;

  /* ---------------- herramientas: lo que pide el libro, sin terminar el día ---------------- */
  Me.herramientas = function () {
    const S = A.S;
    if (!S) return;
    const fila = (ico, t, sub, fn) => el('button.menu-item', { type: 'button', onclick: fn }, el('span.mi-ico', { html: T.ico(ico) }), el('span', el('b', t), sub ? el('small', { html: sub }) : null));
    const cerrarY = (fn) => () => { A.cerrarModal(); fn(); };
    const enEvento = S.escena && S.escena.tipo === 'evento';
    const cuerpo = el('div.menu',
      el('p.ayuda-mini', 'Para cuando el libro te manda hacer algo que no tiene botón. Nada de esto termina el día; desde un evento, vuelves a él.'),
      fila('dado', 'Una prueba', 'Atributo y dificultad a tu elección (r120)', cerrarY(pruebaLibre)),
      fila('dado', 'Tirar dados', '1d6, 2d6, 1d8, 1d12 o d66 (r002)', cerrarY(dadosLibres)),
      fila('reliquia', 'Explorar un pecio', `Sala a sala (r170)${enEvento ? '; al salir vuelves al evento' : ''}`, cerrarY(() => Me.pecioDesde({}))),
      fila('pista', 'Tirar un rumor', 'Gratis, como cuando lo da un evento (r164)', cerrarY(() => Me.rumor({ gratis: true }))),
      fila('mapa', 'Moverte a otra región', 'Cuando un evento te lleva a otro sitio, sin viaje ni encuentro', cerrarY(moverLibre)),
      fila('recuerda', 'Anotar un recordatorio', 'Algo «para la próxima vez» que quieras tener a la vista', cerrarY(notaLibre)),
      fila('libro', 'Leer o jugar un evento', 'Desde el Códice: «Jugar este evento ahora»', cerrarY(() => A.abrirCodice())),
    );
    A.modal('Herramientas', cuerpo, { clase: 'estrecho' });
  };
  async function pruebaLibre() {
    const ATR = ['Vigor', 'Reflejos', 'Ingenio', 'Voluntad'];
    const ps = await new Promise((ok) => {
      let attr = 'Ingenio', dif = 9;
      const seg = (vals, v0, on, fmt = String) => { const g = el('div.segmento'); vals.forEach((v) => g.append(el('button' + (v === v0 ? '.activo' : ''), { type: 'button', onclick: (e) => { g.querySelectorAll('button').forEach((b) => b.classList.remove('activo')); e.target.classList.add('activo'); on(v); } }, fmt(v)))); return g; };
      A.modal('Una prueba', [el('p.ayuda-mini', '2d6 + atributo contra la dificultad (r120).'), seg(ATR, attr, (v) => (attr = v)), seg([7, 9, 11, 13], dif, (v) => (dif = v), (v) => `${v} · ${D.DIFICULTAD[v] || ''}`),
        el('div.botones', el('button.btn.primario', { type: 'button', onclick: () => { A.cerrarModal(); ok({ attr, dif }); } }, 'Tirar'))], { clase: 'estrecho', alCerrar: () => ok(null) });
    });
    if (!ps) return;
    await A.tirar({ titulo: `Prueba de ${ps.attr}`, attr: ps.attr, dif: ps.dif, sugerencias: A.sugerencias(ps.attr), regla: 'r120', cancelable: true });
  }
  async function dadosLibres() {
    const nota = await new Promise((ok) => A.modal('Tirar dados', el('div.botones-col', ['1d6', '2d6', '1d8', '1d12', 'd66'].map((n) => el('button.btn.secundario', { type: 'button', onclick: () => { A.cerrarModal(); ok(n); } }, n))), { clase: 'estrecho', alCerrar: () => ok(null) }));
    if (nota) await A.tirarNotacion(nota, `Tirada: ${nota}`);
  }
  function moverLibre() {
    const S = A.S;
    A.modal('¿Adónde te lleva el libro?', el('div.botones-col', Object.keys(D.REGIONES).map((r) => el('button.btn.secundario' + (+r === S.region ? '.activo' : ''), { type: 'button', disabled: +r === S.region, onclick: () => { A.cerrarModal(); A.hacer((S) => { S.region = +r; M.log(S, `Estás en ${D.REGIONES[r].n} (lo dice el libro; sin viaje ni encuentro).`, ['r150']); }); } }, `${r} · ${D.REGIONES[r].n}`))), { clase: 'estrecho' });
  }
  function notaLibre() {
    const inp = el('textarea', { rows: 3, placeholder: 'Por ejemplo: la próxima vez que instales un sistema, sube 1 de calidad.', 'aria-label': 'Recordatorio' });
    A.modal('Anotar un recordatorio', [inp, el('div.botones', el('button.btn.primario', { type: 'button', onclick: () => { const t = inp.value.trim(); if (!t) return; A.cerrarModal(); A.hacer((S) => M.notaNueva(S, t, null)); } }, 'Guardar'))], { clase: 'estrecho' });
    setTimeout(() => inp.focus(), 50);
  }

  function rotularElegir(cuerpo) {
    cuerpo.querySelectorAll('.op-elegir').forEach((b) => { const si = b.closest('li.opcion')?.classList.contains('elegida'); b.textContent = si ? '✓ Elegida' : 'Elegir'; b.setAttribute('aria-pressed', si ? 'true' : 'false'); });
  }
  // fichas fijas (fuera de ramas Éxito/Fallo y de condiciones) de la opción elegida que aún no aplicaste
  function fichasSueltas(cuerpo) {
    const li = cuerpo.querySelector('li.opcion.elegida');
    if (!li) return [];
    return [...li.querySelectorAll('.tk.ef:not(.aplicado)')].filter((c) => c.closest('li.opcion') === li && !c.closest('.rama, .rama-si, .ramas, li.opcion li'));
  }
  // resalta las fichas fijas sin aplicar de la opción elegida
  function avisoFichas(cuerpo) {
    cuerpo.querySelectorAll('.aviso-fichas').forEach((x) => x.remove());
    cuerpo.querySelectorAll('.tk.falta').forEach((x) => x.classList.remove('falta'));
    const sueltas = fichasSueltas(cuerpo);
    if (!sueltas.length) return;
    sueltas.forEach((c) => c.classList.add('falta'));
    // una sola vez en toda la partida: avisa que las fichas se aplican a mano
    if (!A.aj.vistos.fichas1) {
      A.aj.vistos.fichas1 = 1; A.guardar();
      A.aviso('<b>Las fichas se aplican a mano.</b> Toca cada ficha resaltada y se anota en tu Hoja; otro toque la deshace.', 'regla');
    }
  }
  // instrucciones del libro que la app ya resolvió al crear la partida: se dice junto a la instrucción
  const YA_HECHO = {
    e005: [{ re: /cinco sistemas como «perdidos»/, txt: (S) => `<b>Ya está anotado.</b> La app lo hizo al crear tu partida: en la Hoja, pestaña <b>Nave</b>, tienes los cinco sistemas como «Perdido» y tu sistema personal, ${S.sistemas.Personal && S.sistemas.Personal.n ? `la <b>${CB.u.esc(S.sistemas.Personal.n)}</b>` : 'el de tu protagonista'}, como «Por descubrir».` }],
    e840: [{ re: /Cuenta tus FRAGMENTO_/, txt: (S) => {
      const r = M.fijarSecreto(S);
      if (!r.ya) A.guardar();
      return `${cuentaVerdades(S)}<br><b>${r.azar ? `No tenías ningún FRAGMENTO_: la app tiró 1d6 y salió ${r.v}.` : 'La app ya contó.'} Tu Secreto es el ${r.v}:</b> lee ${T.ref('e84' + r.v)}. Queda fijo: aunque ganes más FRAGMENTO_, ya no cambia.`;
    } }],
    e917: [{ re: /Si el Secreto es 1/, txt: secretoAlFinal }],
    e918: [{ re: /Si el Secreto es 3/, txt: secretoAlFinal }],
    e009: [{ re: /El Reloj empieza en 60/, txt: (S) => S.reloj == null ? '<b>Ya está anotado.</b> En este modo no hay Reloj.' : `<b>Ya está anotado.</b> Tu Reloj está en <b>${S.reloj}</b> (arriba, en la barra); la app lo baja sola en cada amanecer.` }],
  };
  function cuentaVerdades(S) {
    const { cuenta } = M.verdades(S);
    return 'Tus FRAGMENTO_ por verdad: ' + [1, 2, 3, 4, 5, 6].map((v) => `<b>${v}</b>: ${cuenta[v]}`).join(' · ');
  }
  function secretoAlFinal(S) {
    if (S.secreto != null) return `<b>Tu Secreto es el ${S.secreto}.</b>`;
    const v = M.secretoContado(S);
    return `${cuentaVerdades(S)}<br><b>${v ? `No lo habías descubierto: tus FRAGMENTO_ dicen que es el ${v}.` : 'No lo habías descubierto y no tienes FRAGMENTO_: tira 1d6.'}</b>`;
  }
  function yaHecho(cuerpo, id) {
    for (const n of YA_HECHO[id] || []) {
      const p = [...cuerpo.querySelectorAll('p, li')].find((x) => n.re.test(x.textContent));
      if (!p) continue;
      const caja = () => el('div.ya-hecho', { html: `<span class="yh-ico">✓</span><span>${n.txt(A.S)}</span>` });
      if (p.tagName === 'LI') { if (!p.querySelector('.ya-hecho')) p.append(caja()); }
      else if (!p.nextElementSibling?.classList.contains('ya-hecho')) p.after(caja());
    }
  }
  function restaurarEvento(cuerpo, e) {
    yaHecho(cuerpo, e.id);
    for (const k in e.aplicados || {}) { const b = cuerpo.querySelector(`[data-k="${k}"]`); if (b) b.classList.add('aplicado'); }
    if (e.elegida != null) {
      cuerpo.querySelectorAll('li.opcion').forEach((li) => li.classList.toggle('elegida', li.dataset.op === String(e.elegida)));
      cuerpo.querySelector('ol.opciones')?.classList.add('hay-elegida');
    }
    rotularElegir(cuerpo);
    avisoFichas(cuerpo);
    for (const k in e.ramas || {}) {
      const b = cuerpo.querySelector(`[data-k="${k}"]`);
      if (b) marcarRama(b, e.ramas[k]);
    }
    for (const k in e.dados || {}) {
      const b = cuerpo.querySelector(`[data-k="${k}"]`);
      if (b) marcarDado(b, e.dados[k]);
    }
    for (const k in e.si || {}) {
      const b = cuerpo.querySelector(`[data-k="${k}"]`);
      if (b) marcarSi(cuerpo, b, e.si[k]);
    }
  }
  function contenedorRamas(b) {
    return b.closest('.con-ramas, li') || b.parentElement;
  }
  function marcarRama(b, res) {
    b.classList.add('tirada', 'r-' + res);
    b.dataset.res = M.RES[res];
    const c = contenedorRamas(b);
    const ramas = [...c.querySelectorAll('.rama')];
    const hayPleno = ramas.some((r) => r.dataset.rama === 'pl');
    ramas.forEach((r) => {
      const k = r.dataset.rama;
      const ok = k === res || (res === 'pl' && k === 'ex' && !hayPleno);
      r.classList.toggle('activa', ok);
      r.classList.toggle('apagada', !ok);
    });
  }
  function marcarDado(b, v) {
    b.classList.add('tirada');
    b.dataset.res = v;
    // resalta la fila de la tabla que sigue (o la de la opción)
    const ambito = b.closest('li, p, .con-ramas') || b.parentElement;
    let tabla = null;
    let n = ambito;
    for (let i = 0; i < 4 && n && !tabla; i++) { n = n.nextElementSibling; if (n && n.classList.contains('tabla-env')) tabla = n; }
    if (!tabla) return;
    tabla.querySelectorAll('tr[data-fila]').forEach((tr) => tr.classList.toggle('activa', T.filaContiene(tr.dataset.fila, v)));
  }
  function marcarSi(cuerpo, b, fin) {
    b.classList.add('tirada');
    b.dataset.res = { ganas: 'Ganaste', huyes: 'Huiste', hablas: 'Hablaste', pierdes: 'Perdiste', pasas: 'Pasaste' }[fin] || fin;
    cuerpo.querySelectorAll('.rama-si').forEach((r) => {
      const ok = r.dataset.si === fin || (fin === 'hablas' && r.dataset.si === 'pasas');
      r.classList.toggle('activa', ok);
    });
  }

  async function clicEvento(ev, cuerpo) {
    const b = ev.target.closest('button');
    if (!b || !cuerpo.contains(b) || b.classList.contains('glosa')) return;
    if (b.dataset.herr) return herramienta(JSON.parse(b.dataset.herr));
    const S = A.S;
    const esc_ = S.escena;
    const k = b.dataset.k;
    const li = b.closest('li.opcion');
    // «Elegir» marca (o desmarca) la opción; va antes que la marca automática, que si no la anulaba
    if (b.dataset.elegir) {
      A.hacer((S) => (S.escena.elegida = S.escena.elegida === +b.dataset.elegir ? null : +b.dataset.elegir));
      return;
    }
    if (li && esc_.elegida == null) A.hacer((S) => (S.escena.elegida = +li.dataset.op), { pintar: false }), cuerpo.querySelector('ol.opciones')?.classList.add('hay-elegida'), li.classList.add('elegida'), rotularElegir(cuerpo), avisoFichas(cuerpo), actualizarPie(cuerpo);
    if (b.dataset.ir) {
      return Me.irA(b.dataset.ir);
    }
    if (b.dataset.marca) {
      const m = b.dataset.marca;
      A.hacer((S) => M.marcar(S, m, !M.tiene(S, m), CB.libro.titulo(esc_.id)));
      A.aviso(M.tiene(A.S, m) ? `Anotada: <b>${m}</b>` : `Borrada: <b>${m}</b>`);
      return;
    }
    if (b.dataset.prueba) {
      const p = JSON.parse(b.dataset.prueba);
      let attr = p.attr;
      let explicar = '';
      if (p.alt) {
        const a1 = M.atributo(S, p.attr).total, a2 = M.atributo(S, p.alt).total;
        if (a2 > a1) attr = p.alt;
        explicar = `Puedes usar ${p.attr} o ${p.alt}: usas ${attr}, el mejor.`;
      }
      const ambito = b.closest('li, p, .con-ramas');
      const canto = !!(ambito && ambito.querySelector('.ico-canto')) || attr === 'Voluntad' && /Canto/.test(ambito ? ambito.textContent : '');
      const sug = A.sugerencias(attr, { canto });
      const r = await A.tirar({ titulo: `Prueba de ${attr}`, attr, dif: p.dif, modo: p.mod || null, sugerencias: sug, regla: 'r120', explicar, cancelable: true });
      if (!r) return;
      A.hacer((S) => { S.escena.ramas[k] = r.res; }, { foto: false });
      return;
    }
    if (b.dataset.dado) {
      const r = await A.tirarNotacion(b.dataset.dado, `Tirada: ${b.dataset.dado}`);
      if (!r) return;
      A.hacer((S) => { S.escena.dados[k] = r.valor ?? r.suma; }, { foto: false });
      return;
    }
    if (b.dataset.enemigo) {
      const en = JSON.parse(b.dataset.enemigo);
      const amb = b.closest('li, p, .con-ramas, .bloque-enemigo');
      const txt = amb ? amb.textContent : '';
      Me.combatir(en, { sorpresa: /Sorpresa/.test(txt) && !/sin sorpresa/.test(txt), emboscada: /Emboscada/.test(txt) }, (fin) => A.hacer((S) => { if (S.escena.tipo === 'evento') S.escena.si[k] = fin; }, { foto: false }));
      return;
    }
    if (b.dataset.ef) {
      const ef = JSON.parse(b.dataset.ef);
      aplicarFicha(ef, k, b);
      return;
    }
    if (b.dataset.plantilla) return Me.plantilla();
  }

  /* ---------------- fichas de efecto ---------------- */
  // ficha de cantidad suelta: ¿la ganas o la pagas? (el signo sugerido va primero y resaltado)
  function preguntarSigno(ef, k, b) {
    document.querySelectorAll('.glosa-pop').forEach((x) => x.remove());
    const nom = b.textContent.trim().replace(/^\d+ /, '');
    const op = (sg) => el('button.btn' + (ef.sug === sg ? '.primario' : '.secundario'), { type: 'button', onclick: () => { pop.remove(); aplicarFicha(Object.assign({}, ef, { ambos: 0, d: sg * ef.d }), k, b); } }, `${sg > 0 ? '+' : '−'}${ef.d} ${nom}`);
    const ops = ef.sug === -1 ? [op(-1), op(1)] : [op(1), op(-1)];
    const pop = el('div.glosa-pop.signo', el('p', { html: `¿Ganas o pagas <b>${ef.d} ${CB.u.esc(nom)}</b>?` }), el('div.botones', ops));
    document.body.append(pop);
    const r = b.getBoundingClientRect(), w = Math.min(300, innerWidth - 32);
    pop.style.width = w + 'px';
    pop.style.left = Math.max(16, Math.min(innerWidth - w - 16, r.left)) + 'px';
    pop.style.top = (r.bottom + pop.offsetHeight + 12 > innerHeight ? r.top - pop.offsetHeight - 8 : r.bottom + 8) + 'px';
    setTimeout(() => document.addEventListener('click', function f(ev) { if (!pop.contains(ev.target)) { pop.remove(); document.removeEventListener('click', f, true); } }, true), 0);
  }
  const NUM = ['aire', 'energia', 'raciones', 'canto', 'temple', 'chatarra', 'alerta', 'contador', 'despensa', 'reloj'];
  function aplicarFicha(ef, k, b) {
    const S = A.S;
    const ya = S.escena.aplicados[k];
    if (ya) {
      A.hacer((S) => { deshacerFicha(S, ya); delete S.escena.aplicados[k]; });
      A.aviso('Deshecho: ' + b.textContent.trim());
      return;
    }
    if (ef.k === 'hito') {
      A.hacer((S) => { S.mejoras += 1; S.escena.aplicados[k] = { k: 'mejoras', d: -1 }; M.log(S, 'Superas un evento ★: eliges una mejora.', ['r190']); });
      Me.mejora();
      return;
    }
    if (ef.ambos) return preguntarSigno(ef, k, b);
    // ¿a quién o a qué? Lealtad sin nombre y calidad sin sistema: se pregunta
    if (ef.k === 'lealtad' && !ef.t) {
      const delEvento = Object.keys(D.TRIPULACION).find((t) => { const n = +S.escena.id.slice(1), b0 = +D.TRIPULACION[t].ev.slice(1); return n >= b0 && n < b0 + 5; });
      const cand = Object.keys(S.tripu).filter((t) => ['contigo', 'cicatriz'].includes(S.tripu[t].estado));
      const amb = b.closest('li, p');
      const nombrado = amb && cand.find((t) => amb.textContent.includes(t));
      if (delEvento || nombrado || cand.length === 1) return aplicarFicha(Object.assign({}, ef, { t: delEvento || nombrado || cand[0] }), k, b);
      if (!cand.length) return A.aviso('No tienes tripulantes contigo ni en la Cicatriz.');
      return elegirEn(b, `¿De quién? (${ef.d > 0 ? '+' : '−'}${Math.abs(ef.d)} Lealtad)`, cand.map((t) => [t, t]), (t) => aplicarFicha(Object.assign({}, ef, { t }), k, b));
    }
    if (ef.k === 'lealtad' && ef.t === 'cada uno') {
      const cand = Object.keys(S.tripu).filter((t) => ['contigo', 'cicatriz'].includes(S.tripu[t].estado));
      return aplicarFicha(Object.assign({}, ef, { k: 'lealtades', ts: cand }), k, b);
    }
    if (ef.k === 'calidad' && !ef.s) {
      const amb = b.closest('li, p');
      const txt = amb ? amb.textContent : '';
      const cand = Object.keys(S.sistemas).filter((s) => S.sistemas[s].cal && ['instalado', 'llevado'].includes(S.sistemas[s].estado));
      const nombrados = cand.filter((s) => txt.includes(s === 'Personal' ? S.sistemas.Personal.n || '··' : s));
      if (nombrados.length === 1) return aplicarFicha(Object.assign({}, ef, { s: nombrados[0] }), k, b);
      if (!cand.length) return A.aviso('No tienes ningún sistema con calidad (instalado o en la mochila).');
      return elegirEn(b, `¿Qué sistema? (${ef.d > 0 ? 'sube' : 'baja'} 1 de calidad)`, cand.map((s) => [s, `${s === 'Personal' ? S.sistemas.Personal.n : s} · ${S.sistemas[s].cal}`]), (s) => aplicarFicha(Object.assign({}, ef, { s }), k, b));
    }
    let notas = [];
    A.hacer((S) => {
      let inv;
      if (NUM.includes(ef.k)) {
        const antes = S[ef.k];
        const d = ef.fijar != null ? Math.max(0, ef.fijar - S[ef.k]) : ef.d;
        notas = M.cambiar(S, ef.k, d, CB.libro.titulo(S.escena.id)).notas;
        inv = { k: ef.k, d: antes - S[ef.k] };
      } else if (ef.k === 'heridas') {
        const antes = S.heridas;
        notas = M.cambiar(S, 'heridas', ef.d, CB.libro.titulo(S.escena.id)).notas || [];
        inv = { k: 'heridas', d: antes - S.heridas };
      } else if (ef.k.startsWith('rep:')) {
        const f = ef.k.slice(4);
        const antes = { ...S.rep };
        notas = M.cambiar(S, ef.k, ef.d, CB.libro.titulo(S.escena.id)).notas;
        inv = { k: 'rep', antes };
      } else if (ef.k === 'reliquia') {
        notas = M.reliquia(S).notas;
        inv = { k: 'reliquia', uid: S.reliquias.length ? S.reliquias[S.reliquias.length - 1].uid : null };
      } else if (ef.k === 'sistema') {
        const prev = { ...S.sistemas[ef.s] };
        notas = M.conseguirSistema(S, ef.s, ef.cal, CB.libro.titulo(S.escena.id)).notas;
        inv = { k: 'sistema', s: ef.s, prev };
      } else if (ef.k === 'pista') {
        notas = M.pista(S, ef.pista).notas;
        inv = { k: 'pista', ev: ef.pista.ev };
      } else if (ef.k === 'lealtad' || ef.k === 'lealtades') {
        const ts = ef.ts || [ef.t];
        const antes = Object.fromEntries(ts.map((t) => [t, { ...S.tripu[t] }]));
        ts.forEach((t) => M.lealtad(S, t, ef.d));
        inv = { k: 'lealtad', antes };
      } else if (ef.k === 'calidad') {
        inv = { k: 'calidad', s: ef.s, cal: S.sistemas[ef.s].cal };
        M.subirCalidad(S, ef.s, ef.d, CB.libro.titulo(S.escena.id));
      }
      S.escena.aplicados[k] = inv || { k: 'nada' };
    });
    A.notas(notas);
  }
  function deshacerFicha(S, inv) {
    if (NUM.includes(inv.k)) { if (inv.k === 'reloj') S.reloj = Math.max(0, S.reloj + inv.d); else S[inv.k] += inv.d; M.log(S, `Deshaces: ${M.NOMBRE[inv.k] || inv.k} ${CB.u.firma(inv.d)}.`, []); }
    else if (inv.k === 'heridas') { S.heridas = Math.max(0, S.heridas + inv.d); M.log(S, 'Deshaces una Herida o una cura.', []); }
    else if (inv.k === 'rep') S.rep = inv.antes;
    else if (inv.k === 'reliquia') S.reliquias = S.reliquias.filter((r) => r.uid !== inv.uid);
    else if (inv.k === 'sistema') S.sistemas[inv.s] = inv.prev;
    else if (inv.k === 'pista') S.pistas = S.pistas.filter((p) => p.ev !== inv.ev);
    else if (inv.k === 'mejoras') S.mejoras = Math.max(0, S.mejoras - 1);
    else if (inv.k === 'lealtad') Object.entries(inv.antes).forEach(([t, v]) => (S.tripu[t] = v));
    else if (inv.k === 'calidad') S.sistemas[inv.s].cal = inv.cal;
  }
  /** pequeño menú junto a una ficha para elegir a quién o a qué se aplica */
  function elegirEn(b, pregunta, ops, fn) {
    document.querySelectorAll('.glosa-pop').forEach((x) => x.remove());
    const pop = el('div.glosa-pop.signo', el('p', pregunta), el('div.botones', ops.map(([v, t]) => el('button.btn.secundario', { type: 'button', onclick: () => { pop.remove(); fn(v); } }, t))));
    document.body.append(pop);
    const r = b.getBoundingClientRect(), w = Math.min(320, innerWidth - 32);
    pop.style.width = w + 'px';
    pop.style.left = Math.max(16, Math.min(innerWidth - w - 16, r.left)) + 'px';
    pop.style.top = (r.bottom + pop.offsetHeight + 12 > innerHeight ? r.top - pop.offsetHeight - 8 : r.bottom + 8) + 'px';
    setTimeout(() => document.addEventListener('click', function f(ev) { if (!pop.contains(ev.target)) { pop.remove(); document.removeEventListener('click', f, true); } }, true), 0);
  }

  /* ---------------- pie del evento: terminar ---------------- */
  function pieEvento(S, esc_, e) {
    const sig = siguiente(S, esc_, e);
    const pie = el('footer.ev-pie');
    const hayIr = /→\s*\[e\d{3}\]/.test(e.md);
    pie.append(el('div.ev-pie-t', { html: sig.txt.charAt(0).toUpperCase() + sig.txt.slice(1) }));
    pie.append(el('button.btn.primario.grande', { type: 'button', onclick: () => Me.terminarEvento() }, el('span', { html: `${sig.ico ? T.ico(sig.ico) : ''} ${sig.boton}` })));
    // si el evento sigue por una flecha, el pie se reduce a una salida discreta
    pie.append(el('div.ev-pie-mini', el('span', 'La historia sigue por la flecha de arriba.'), el('button.enlace', { type: 'button', onclick: () => Me.terminarEvento() }, 'Ninguna me sirve: terminar aquí')));
    pie.append(el('div.ev-pie-herr', el('button.enlace', { type: 'button', onclick: () => Me.herramientas(), html: `${T.ico('dado')} ¿El libro pide algo sin botón? Herramientas` })));
    return pie;
  }
  // ¿la historia sigue por una flecha? Flecha suelta fuera de las opciones (todas van ahí),
  // o la opción elegida tiene la suya. Sin opción elegida y con flechas solo en opciones, también.
  function actualizarPie(cuerpo) {
    const pie = cuerpo.parentElement && cuerpo.parentElement.querySelector('.ev-pie');
    if (!pie) return;
    const flechas = [...cuerpo.querySelectorAll('.tk.ir')];
    const sueltas = flechas.filter((f) => !f.closest('li.opcion'));
    const elegida = cuerpo.querySelector('li.opcion.elegida');
    const enOpciones = flechas.some((f) => f.closest('li.opcion'));
    let porFlecha = sueltas.length > 0;
    if (!porFlecha && enOpciones) porFlecha = elegida ? !!elegida.querySelector('.tk.ir') : true;
    pie.classList.toggle('por-flecha', porFlecha);
  }
  function siguiente(S, esc_, e) {
    const t = e.tiempo;
    if (FINALES.has(esc_.id)) return { boton: 'Terminar la partida', txt: `Has llegado a un final (${T.ref('r196')}).`, ico: 'fin' };
    if (esc_.origen === 'prologo') return esc_.id === 'e012' ? { boton: 'Empezar el día 1', txt: `termina el prólogo y empieza tu primer día (${T.ref('r130')}).`, ico: 'sol' } : { boton: 'Seguir', txt: 'sigue con el prólogo.', ico: 'ir' };
    if (['aviso', 'libre'].includes(esc_.origen)) return { boton: 'Volver a donde estaba', txt: 'vuelve a lo que estabas haciendo.', ico: 'deshacer' };
    if (esc_.origen === 'noche') return { boton: 'Seguir con la noche', txt: `vuelve al anochecer (${T.ref('r133')}).`, ico: 'luna' };
    if (esc_.origen === 'amanecer') {
      if (t === 'día' || t === '+1') return { boton: 'Terminar el día', txt: `este evento consume el día${t === '+1' ? ' y el Reloj baja 1 más' : ''} (${T.ref('r003')}): pasas al anochecer.`, ico: 'luna' };
      return { boton: 'Seguir con mi día', txt: `no gasta el día (${T.ref('r003')}): vuelves a elegir tu acción.`, ico: 'sol' };
    }
    return { boton: 'Terminar el día', txt: `${t === '+1' ? 'el Reloj baja 1 más y ' : ''}tu acción del día termina: vuelves al mapa y llega el anochecer (${T.ref('r004')}).`, ico: 'luna' };
  }
  Me.terminarEvento = function () {
    A.hacer((S) => {
      const esc_ = S.escena;
      const e = LIB()[esc_.id];
      if (e && e.tiempo === '+1' && !esc_.sumado) M.cambiar(S, 'reloj', -1, `${esc_.id} ⌛ +1`);
      if (esc_.despues && esc_.despues.canto != null) { S.canto = esc_.despues.canto; M.log(S, 'Después de tu evento, el Canto baja a 4.', ['r137']); }
      // historia personal: contar la leída
      if (FINALES.has(esc_.id)) { S.fin = esc_.id; M.log(S, `Fin de la partida: ${CB.libro.titulo(esc_.id)}.`, ['r196']); return; }
      if (esc_.origen === 'prologo') {
        if (esc_.id === 'e012' || !/→\s*\[e\d{3}\]/.test(e.md)) { M.empezarDia(S); return; }
        const m = e.md.match(/→\s*\[(e\d{3})\]/g);
        const ult = m ? m[m.length - 1].match(/e\d{3}/)[0] : null;
        if (ult) { Me._jugarMismo(S, ult); return; }
        M.empezarDia(S);
        return;
      }
      if (['aviso', 'libre', 'noche'].includes(esc_.origen) && S.pila && S.pila.length) { S.escena = S.pila.pop(); return; }
      if (esc_.origen === 'amanecer' && !['día', '+1'].includes(e.tiempo)) { S.escena = { tipo: 'accion' }; return; }
      entrarAnochecer(S);
    });
    window.scrollTo({ top: 0 });
  };
  Me._jugarMismo = (S, id) => { S.escena = Object.assign({}, S.escena, { id, aplicados: {}, ramas: {}, si: {}, dados: {}, elegida: null, plantilla: null }); };

  /* ---------------- plantillas de encuentro (r300) ---------------- */
  Me.plantilla = function () {
    const S = A.S;
    const e = LIB()[S.escena.id];
    const en = M.leerEnemigo(e.md);
    const tags = en ? en.tags : [];
    const puedeHablar = !tags.includes('Bestia') || M.tiene(S, 'DOMADOR') || S.habilidades.includes('Lengua de bestias');
    const desc = { Hablar: 'Negociar, pedir paso, comerciar.', Esquivar: 'Pasar sin que te vean.', Luchar: 'Atacar primero.', Estudiar: 'Observar desde lejos antes de decidir.' };
    const cuerpo = el('div.posturas', el('p', { html: `Elige tu postura y tira 1d6 (${T.ref('r300')}).${en ? ` Delante: <b>${esc(en.n)}</b>.` : ''}` }),
      el('div.posturas-grid', Object.keys(D.PLANTILLAS).map((p) => {
        const ok = p !== 'Hablar' || puedeHablar;
        return el('button.postura', { type: 'button', disabled: !ok, onclick: () => tirarPlantilla(p, en) }, el('b', p), el('small', ok ? desc[p] : 'Contra [Bestia], solo con DOMADOR o Lengua de bestias.'));
      })));
    A.modal('Encuentro', cuerpo, { clase: 'estrecho' });
    A.enlazarRefs(cuerpo);
  };
  async function tirarPlantilla(postura, en) {
    const S = A.S;
    const mods = [];
    if (S.alerta >= 3 && postura !== 'Esquivar') mods.push({ t: `Alerta ${S.alerta}`, v: 1 });
    if (postura === 'Hablar' && S.prota === 'mente' && en && en.tags.includes('Máquina')) mods.push({ t: 'La Mente contra [Máquina]', v: -1 });
    if (postura === 'Esquivar' && (M.compas(S).includes('Lio') || S.rasgos.includes('e717') || S.reliquias.some((r) => r.id === 'e745'))) mods.push({ t: 'Lio, Piel de camaleón o Piel de espejo', v: -1 });
    const r = await A.tirarDados(`Postura: ${postura} (1d6)`, 1, 'x', { regla: 'r300', explicar: mods.length ? 'Modificadores: ' + mods.map((m) => `${m.t} ${CB.u.firma(m.v)}`).join(', ') : 'Sin modificadores.' });
    if (!r) return;
    const dado = Math.max(1, Math.min(6, r.dados[0] + mods.reduce((a, m) => a + m.v, 0)));
    const id = D.PLANTILLAS[postura][dado];
    A.hacer((S) => { S.escena.plantilla = { postura, dado, id, aplicados: {} }; M.log(S, `Encuentro: ${postura}, 1d6 = ${dado} → ${id} · ${CB.libro.titulo(id)}.`, ['r300', id]); });
  }
  function pintarPlantilla(S, esc_, e) {
    const p = esc_.plantilla;
    const en = M.leerEnemigo(e.md);
    const rid = p.id;
    const caja = el('div.plantilla-res', el('div.pl-cab', { html: `<span>${esc(p.postura)} · 1d6 = <b>${p.dado}</b></span> ${T.ref(rid)} <b>${esc(CB.libro.titulo(rid))}</b>` }));
    caja.append(el('div.texto', { html: T.render(LIB()[rid].md, { modo: 'evento', S }) }));
    const flags = { r304: { emboscada: true }, r305: {}, r306: { sorpresa: true }, r311: {}, r314: { sorpresa: true }, r315: { sorpresa: true }, r319: { enemigoMas: 1 }, r316: { emboscada: true }, r318: {}, r303: null };
    if (en && flags[rid] !== undefined && flags[rid] !== null) {
      const f = flags[rid];
      caja.append(el('button.tk.combate', { type: 'button', onclick: () => Me.combatir(en, f, (fin) => A.hacer((S) => { S.escena.siPlantilla = fin; }, { foto: false })) }, el('span', { html: `${T.ico('combate')} Combatir contra ${esc(en.n)}${f.sorpresa ? ' (con Sorpresa)' : f.emboscada ? ' (Emboscada)' : f.enemigoMas ? ' (ellos +1 en la 1.ª ronda)' : ''}` })));
    }
    caja.append(el('p.ayuda-mini', { html: 'Después, lee abajo «Si pasas» o «Si ganas», según lo que haya pasado.' }));
    caja.querySelectorAll('.tk:not(.combate)').forEach((b, i) => (b.dataset.k = 'pl' + i));
    caja.addEventListener('click', (ev) => { ev.stopPropagation(); clicEvento(ev, caja); });
    return caja;
  }

  /* ---------------- asistente de despegue (e900) ---------------- */
  function asistenteDespegue(S, esc_) {
    const est = esc_.despegue || {};
    const sis = S.sistemas;
    const fila = (i, n, s, attr, dif, ayuda) => ({ i, n, s, attr, dif, ayuda });
    const difDe = (s) => (sis[s] && sis[s].estado === 'instalado' ? D.CAL_DIF[sis[s].cal] : 13);
    const canto = M.tiene(S, 'CAMARA_DE_SILENCIO') ? 6 + S.canto : 7 + S.canto;
    const personalAttr = { piloto: 'Reflejos', nativo: 'Voluntad', mente: 'Ingenio' }[S.prota];
    const filas = [
      fila(1, 'Motor: el encendido', 'Motor', 'Ingenio', difDe('Motor'), M.compas(S).includes('Noemí') ? 'Noemí: Ventaja' : ''),
      fila(2, 'Casco: atravesar la atmósfera', 'Casco', 'Reflejos', difDe('Casco'), S.prota === 'piloto' ? 'Manos de piloto: Ventaja' : ''),
      fila(3, 'Navegación: salir por donde el Canto no llega', 'Navegación', 'Ingenio', difDe('Navegación'), ['RUTA_DE_SALIDA', 'RUTA_DE_LOS_MIRASOLES', 'CARTAS_ROBADAS', 'POSICION_CONOCIDA'].some((m) => M.tiene(S, m)) ? 'Tienes una Marca de ruta: Ventaja' : ''),
      fila(4, 'El Canto: no darte la vuelta', null, 'Voluntad', canto, 'Tadeo a bordo o BENDICION_DEL_CORO: Éxito automático'),
      fila(5, 'Soporte vital: sobrevivir a la Corona', 'Soporte vital', 'Vigor', difDe('Soporte vital'), M.compas(S).includes('Iria') ? 'Iria: Ventaja' : ''),
      fila(6, 'Combustible: alcanzar la velocidad de escape', 'Combustible', 'Ingenio', difDe('Combustible'), M.tiene(S, 'REGULADOR_DE_NOEMI') ? 'REGULADOR_DE_NOEMI: repite una vez' : ''),
      fila(7, 'Sistema personal: que la nave te reconozca', 'Personal', personalAttr, difDe('Personal'), ''),
    ];
    const fallos = Object.values(est).filter((r) => r === 'fa').length;
    const hechas = Object.keys(est).length;
    const caja = el('section.despegue', el('h3', { html: `${T.ico('cohete')} Secuencia de despegue asistida` }), el('p.ayuda-mini', { html: `Haz antes los pasos 0 y 1 del texto. Cada prueba tiene la dificultad de la calidad del sistema (Precaria 11, Sólida 9, Excelente 7). Cada Fallo es un <b>Daño de nave</b> (${T.ref('r183')}).` }));
    const tabla = el('div.desp-filas');
    filas.forEach((f) => {
      const r = est[f.i];
      tabla.append(el('div.desp-fila' + (r ? '.r-' + r : ''), el('span.desp-n', String(f.i)), el('div.desp-t', el('b', f.n), el('small', `${f.attr} · ${f.dif}${f.ayuda ? ' · ' + f.ayuda : ''}`)),
        r ? el('span.desp-res', M.RES[r]) : el('button.btn.mini', { type: 'button', onclick: async () => {
          const res = await A.tirar({ titulo: f.n, attr: f.attr, dif: f.dif, sugerencias: f.ayuda ? [{ t: f.ayuda, modo: /Ventaja/.test(f.ayuda) ? 'V' : null }] : [], regla: 'r183', cancelable: true });
          if (res) A.hacer((S) => { S.escena.despegue = Object.assign({}, S.escena.despegue, { [f.i]: res.res }); });
        } }, 'Tirar'),
        r ? null : el('button.btn.mini.secundario', { type: 'button', title: 'Éxito automático (si un efecto lo da)', onclick: () => A.hacer((S) => { S.escena.despegue = Object.assign({}, S.escena.despegue, { [f.i]: 'ex' }); M.log(S, `${f.n}: Éxito automático.`, ['e900']); }) }, 'Auto')));
    });
    caja.append(tabla);
    caja.append(el('div.desp-total', { html: `Daños de nave: <b>${fallos}</b>${hechas === 7 ? ` → ${fallos <= 2 ? `lo consigues: ${T.ref('e903')}` : fallos <= 4 ? `por los pelos (cada pasajero tira 1d6): ${T.ref('e903')}` : `la nave no aguanta: ${T.ref('e908')}`}` : ` · ${7 - hechas} pruebas por hacer`}` }));
    if (hechas === 7) caja.append(el('button.btn.primario', { type: 'button', onclick: () => Me.irA(fallos <= 4 ? 'e903' : 'e908') }, `Ir a ${fallos <= 4 ? 'e903' : 'e908'}`));
    return caja;
  }

  /* ---------------- servicios de los asentamientos (r160–r164) ---------------- */
  function servicios(S, esc_, op = {}) {
    const taller = ['e400', 'e430'].includes(esc_.id);
    const quilla = esc_.id === 'e410';
    const caja = el('section.servicios', el('h3', { html: `${T.ico('asentamiento')} Servicios ${T.ref('r160')}` }), el('p.ayuda-mini', 'Todos los que quieras, hoy mismo. Si el evento cambia algún precio, ajústalo a mano en la Hoja.'));
    const grid = el('div.serv-grid');
    // comprar
    const tienda = el('div.serv', el('h4', { html: `Comprar ${T.ref('r161')}` }));
    D.TIENDA.forEach(([n, precio, tipo]) => {
      if (tipo === 'pieza:luz') return;
      tienda.append(el('div.serv-fila', el('span', n), el('b', `${precio}`), el('button.btn.mini', { type: 'button', disabled: S.chatarra < precio, onclick: () => comprar(n, precio, tipo) }, 'Comprar')));
    });
    if (esc_.id === 'e430') tienda.append(el('div.serv-fila', el('span', 'Luz fría'), el('b', '3'), el('button.btn.mini', { type: 'button', disabled: S.chatarra < 3, onclick: () => comprar('Luz fría', 3, 'pieza:luz') }, 'Comprar')));
    tienda.append(el('button.btn.mini.secundario', { type: 'button', onclick: regatear }, 'Regatear la próxima compra (Voluntad · 9)'));
    grid.append(tienda);
    // vender
    const vender = el('div.serv', el('h4', 'Vender'), el('p.ayuda-mini', 'A la mitad, redondeando hacia abajo. Reliquia sin identificar: 4. Identificada: 6.'));
    const precioDe = (o) => { const t = D.TIENDA.find((x) => x[0].toLowerCase() === o.toLowerCase()); return t ? Math.floor(t[1] / 2) : 1; };
    S.equipo.forEach((o, i) => vender.append(el('div.serv-fila', el('span', o), el('b', String(precioDe(o))), el('button.btn.mini', { type: 'button', onclick: () => A.hacer((S) => { S.equipo.splice(i, 1); M.cambiar(S, 'chatarra', precioDe(o), 'venta de ' + o); }) }, 'Vender'))));
    S.reliquias.forEach((r) => { const pr = r.id ? 6 : 4; vender.append(el('div.serv-fila', el('span', r.id ? CB.libro.titulo(r.id) : `Reliquia sin identificar (${r.aspecto.toLowerCase()})`), el('b', String(pr)), el('button.btn.mini', { type: 'button', onclick: () => A.hacer((S) => { S.reliquias = S.reliquias.filter((x) => x.uid !== r.uid); M.cambiar(S, 'chatarra', pr, 'venta de reliquia (r161)'); }) }, 'Vender'))); });
    if (!S.equipo.length && !S.reliquias.length) vender.append(el('p.vacio', 'Nada que vender.'));
    grid.append(vender);
    // otros
    if (op.soloTienda) { caja.querySelector('h3').innerHTML = `${T.ico('asentamiento')} Comerciar ${T.ref('r161')}`; caja.append(grid); A.enlazarRefs(caja); return caja; }
    const otros = el('div.serv', el('h4', 'Más servicios'));
    if (S.prota === 'piloto') otros.append(el('div.serv-fila', el('span', 'Rellenar el Aire'), el('b', '1'), el('button.btn.mini', { type: 'button', disabled: S.chatarra < 1 || S.aire >= 6, onclick: () => A.hacer((S) => { M.cambiar(S, 'chatarra', -1, 'rellenar Aire'); S.aire = 6; M.log(S, 'Aire al máximo.', ['r136']); }) }, 'Rellenar')));
    const costeE = S.prota === 'mente' ? 2 : 1;
    if (S.prota !== 'nativo') otros.append(el('div.serv-fila', el('span', 'Rellenar la Energía'), el('b', String(costeE)), el('button.btn.mini', { type: 'button', disabled: S.chatarra < costeE || S.energia >= 6, onclick: () => A.hacer((S) => { M.cambiar(S, 'chatarra', -costeE, 'rellenar Energía (r160)'); S.energia = 6; M.log(S, 'Energía al máximo.', ['r136']); }) }, 'Rellenar')));
    otros.append(el('div.serv-fila', el('span', { html: `Sanador: cura 2 Heridas ${T.ref('r163')}` }), el('b', quilla ? '2 o Rac.' : '2'), el('button.btn.mini', { type: 'button', disabled: S.heridas === 0, onclick: () => A.hacer((S) => { if (quilla && S.chatarra < 2) M.cambiar(S, 'raciones', -2, 'sanador de Quilla'); else M.cambiar(S, 'chatarra', -2, 'sanador'); M.curar(S, 2, 'sanador'); }) }, 'Curar')));
    otros.append(el('div.serv-fila', el('span', 'Sanador: baja 2 de Canto'), el('b', '3'), el('button.btn.mini', { type: 'button', disabled: S.canto === 0 || S.chatarra < 3, onclick: () => A.hacer((S) => { M.cambiar(S, 'chatarra', -3, 'sanador'); M.cambiar(S, 'canto', -2, 'sanador'); }) }, 'Pagar')));
    otros.append(el('div.serv-fila', el('span', { html: `Rumores: una Pista ${T.ref('r164')}` }), el('b', '1'), el('button.btn.mini', { type: 'button', disabled: S.chatarra < 1 || !!S.hoy.rumor, title: S.hoy.rumor ? 'Una vez por visita (r164)' : '', onclick: rumor }, S.hoy.rumor ? 'Ya escuchaste' : 'Escuchar')));
    if (taller) {
      for (const s of D.SISTEMAS) if (S.sistemas[s].estado === 'llevado' && S.sistemas[s].cal === 'Precaria') otros.append(el('div.serv-fila', el('span', { html: `Taller: ${s} Precario → Sólido ${T.ref('r162')}` }), el('b', '3'), el('button.btn.mini', { type: 'button', disabled: S.chatarra < 3, onclick: () => A.hacer((S) => { M.cambiar(S, 'chatarra', -3, 'taller'); S.sistemas[s].cal = 'Sólida'; M.log(S, `El taller mejora tu ${s}: Sólido.`, ['r162']); }) }, 'Mejorar')));
      otros.append(el('div.serv-fila', el('span', { html: `Taller: comprar un plano ${T.ref('r202')}` }), el('b', '3/5'), el('button.btn.mini', { type: 'button', onclick: comprarPlano }, 'Ver')));
    }
    grid.append(otros);
    caja.append(grid);
    A.enlazarRefs(caja);
    return caja;
  }
  function comprar(n, precio, tipo) {
    A.hacer((S) => {
      let p = precio;
      if (S.hoy.regateo === 'ok') { p = Math.max(1, p - 1); S.hoy.regateo = 'usado'; }
      if (S.hoy.regateo === 'mal') { A.aviso('Hoy ya no te venden más: el regateo salió mal (r161).'); return; }
      M.cambiar(S, 'chatarra', -p, 'compra: ' + n);
      if (tipo === 'raciones') M.cambiar(S, 'raciones', 1, 'compra');
      else if (tipo.startsWith('pieza:')) M.cambiar(S, tipo, 1, 'compra');
      else M.objeto(S, n);
    });
  }
  async function regatear() {
    const S = A.S;
    const sug = M.tiene(S, 'DEUDAS') ? [{ t: 'Contrabandista: Ventaja al regatear', modo: 'V', r: 'r105' }] : [];
    const r = await A.tirar({ titulo: 'Regatear', attr: 'Voluntad', dif: 9, sugerencias: sug, regla: 'r161', cancelable: true, explicar: 'Con un Éxito, la próxima compra cuesta 1 menos. Con un Fallo, hoy no puedes comprar más.' });
    if (r) A.hacer((S) => (S.hoy.regateo = r.res === 'fa' ? 'mal' : 'ok'));
  }
  function rumor() { return Me.rumor({ gratis: false }); }
  function comprarPlano() {
    const S = A.S;
    const nodo = S.region === 6;
    const lista = el('div.lista-planos');
    for (let n = 760; n <= 778; n++) {
      const id = 'e' + n;
      const e = LIB()[id];
      if (!e || S.planos.includes(id)) continue;
      const grande = n >= 775;
      const luz = /Luz fría/.test(e.md.split('\n')[0]);
      if (luz && !nodo) continue;
      const precio = grande ? 5 : 3;
      lista.append(el('div.serv-fila', el('span', { html: `${T.ref(id)} ${esc(e.titulo)}` }), el('b', String(precio)), el('button.btn.mini', { type: 'button', disabled: S.chatarra < precio, onclick: () => { A.hacer((S) => { M.cambiar(S, 'chatarra', -precio, 'plano'); S.planos.push(id); M.log(S, `Aprendes el plano ${e.titulo}.`, ['r202']); }); A.cerrarModal(); } }, 'Comprar')));
    }
    A.modal('Planos del taller', [el('p.ayuda-mini', 'Pequeños: 3 Chatarra. Grandes obras: 5. Los de Luz fría, solo en el Nodo.'), lista], { clase: 'estrecho' });
    A.enlazarRefs(lista);
  }

  /* ================================================================
     EL DÍA
     ================================================================ */
  function pintarAmanecer(cont, S, e) {
    const g = guia('amanecer');
    if (g) cont.append(g);
    cont.append(cab('sol', `Día ${S.dia}${S.reloj != null ? ` · Reloj ${S.reloj}` : ''}`, 'Amanecer', `Escila asoma sobre ${D.REGIONES[S.region].n}. ${S.reloj != null ? `${S.modo === 'naufrago' ? `Reloj en <b>${S.reloj}</b>: en este modo los Recolectores no vienen.` : `Quedan <b>${S.reloj}</b> días para que lleguen los Recolectores.`}` : ''}`));
    const pasos = el('ol.pasos-dia');
    const L = e.lineas || [];
    const estado = (i) => (e.paso > i ? 'hecho' : e.paso === i ? 'ahora' : '');
    pasos.append(el('li.' + (estado(0) || 'x'), el('b', 'El Reloj baja 1'), el('span', { html: T.ref('r131') }), e.paso > 0 && L[0] ? el('small', L[0]) : null));
    pasos.append(el('li.' + (estado(0) || 'x'), el('b', 'Supervivencia'), el('span', { html: T.ref('r136') }), e.paso > 0 ? el('ul.sub', (e.superv || []).map((x) => el('li' + (x.mal ? '.mal' : ''), { html: `${esc(x.t)} ${T.ref(x.r)}` }))) : el('small', 'Comer, respirar, recargar.')));
    if (S.region === 7) pasos.append(el('li.' + (estado(0) || 'x'), el('b', 'Las Torres'), el('span', { html: T.ref('r131') }), el('small', '+1 Canto al amanecer aquí.')));
    pasos.append(el('li.' + (estado(1) || 'x'), el('b', 'Pulso del Canto'), el('span', { html: T.ref('r131') }), el('small', e.pulso ? e.pulso : `Tira 1d6: con ${S.region === 7 ? '4, 5 o 6 (estás en las Torres)' : '5 o 6'}, el Canto te visita.`)));
    cont.append(pasos);
    const bot = el('div.botones-fase');
    if (e.paso === 0) bot.append(el('button.btn.primario.grande', { type: 'button', onclick: amanecer1 }, el('span', { html: `${T.ico('sol')} Amanecer` })));
    else if (e.paso === 1) bot.append(el('button.btn.primario.grande', { type: 'button', onclick: amanecerPulso }, el('span', { html: `${T.ico('dado')} Tirar el pulso del Canto` })));
    else bot.append(el('button.btn.primario.grande', { type: 'button', onclick: () => A.hacer((S) => (S.escena = { tipo: 'accion' })) }, el('span', { html: `${T.ico('ir')} Elegir la acción del día` })));
    cont.append(bot);
    cont.append(reglas(['r131', 'r136', 'r137', 'r134']));
  }
  function amanecer1() {
    A.hacer((S) => {
      const antes = S.reloj;
      const r = M.relojAmanecer(S);
      const superv = M.supervivencia(S);
      const tor = M.torres(S);
      if (tor) superv.push(tor);
      S.escena = { tipo: 'amanecer', paso: 1, lineas: [S.reloj != null ? `${antes} → ${S.reloj}` : 'Sin Reloj (Náufrago)'], superv };
      A.notas(r.notas);
    });
  }
  async function amanecerPulso() {
    const r = await A.tirarDados('Pulso del Canto (1d6)', 1, 'x', { regla: 'r131', explicar: `Con ${A.S.region === 7 ? '4–6' : '5–6'}, el Canto te visita.` });
    if (!r) return;
    const S = A.S;
    const hp = M.hayPulso(S, r.dados[0]);
    if (!hp.pulso) {
      A.hacer((S) => { S.escena = Object.assign({}, S.escena, { paso: 2, pulso: `Sacas ${r.dados[0]}: hoy no hay pulso.${hp.nota ? ' ' + hp.nota : ''}${S.clima ? ` Clima: ${S.clima.n}.` : ''}` }); M.log(S, `Pulso: ${r.dados[0]}, nada.`, ['r131']); });
      return;
    }
    const r2 = await A.tirarDados('¿Qué pulso? (1d6)', 1, 'x', { regla: 'r131', explicar: '1 = e020, 2 = e021… 6 = e025' });
    if (!r2) return;
    const id = D.PULSOS[r2.dados[0] - 1];
    A.hacer((S) => { M.log(S, `Pulso del Canto: ${r.dados[0]}. El Canto te visita → ${id}.`, ['r131']); S.escena = Object.assign({}, S.escena, { paso: 2 }); Me._jugar(S, id, 'amanecer'); });
  }

  /* ---------------- acción ---------------- */
  const ICO_ACC = { viajar: 'mapa', explorar: 'buscar', visitar: 'asentamiento', nave: 'martillo', descansar: 'cama', ocultarte: 'sombra', pista: 'pista', ensamblar: 'objeto', despegar: 'cohete' };
  function pintarAccion(cont, S) {
    const g = guia('accion');
    if (g) cont.append(g);
    const R = M.reg(S);
    cont.append(cab('sol', `Día ${S.dia} · Acción`, '¿Qué haces hoy?', `Una sola acción (${T.ref('r132')}).`));
    // tarjeta de región
    const hall = M.hallazgosAqui(S);
    const pistas = S.pistas.filter((p) => p.region === S.region);
    const tarjeta = el('section.region-card',
      el('div.rc-arte', { style: { backgroundImage: `url(arte/${R.arte}.jpg)` } }),
      el('div.rc-cuerpo',
        el('div.rc-sobre', `Región ${S.region}`),
        el('h2', S.region === 1 ? 'La Cicatriz' : R.n),
        el('p.rc-asent', { html: S.region === 1 ? `Tu campamento junto a la nave, en las Dunas de Óxido (${T.ref('r182')}).` : `${T.ico('asentamiento')} ${R.asent || 'Sin asentamiento (' + R.lugar + ')'}${R.ev ? ' · ' + T.ref(R.ev) : ''} · encuentros ${T.ref(R.tabla)}` }),
        hall.length ? el('p.rc-hall', { html: `<b>Aquí está:</b> ${hall.map((h) => esc(h.n)).join(', ')}. Explora para encontrarlo (${T.ref('r153')}).` }) : el('p.rc-hall.nada', 'Nada de tu lista de Hallazgos está aquí.'),
        pistas.length ? el('p.rc-pistas', { html: `${T.ico('pista')} Pistas aquí: ${pistas.map((p) => esc(p.nombre)).join(', ')}` }) : null,
        S.clima ? el('p.rc-clima', { html: `Clima: <b>${esc(S.clima.n)}</b> ${T.ref('r155')}` }) : null,
      ));
    cont.append(tarjeta);
    const grid = el('div.acciones');
    for (const a of M.ACCIONES) {
      if (a.k === 'despegar' && !M.enCicatriz(S)) continue;
      const disp = M.disponible(S, a.k);
      const ok = disp === true;
      grid.append(el('button.accion' + (ok ? '' : '.no') + (a.k === 'despegar' && ok ? '.destaca' : ''), { type: 'button', disabled: !ok, onclick: () => accion(a.k), title: ok ? a.d : disp },
        el('span.acc-ico', { html: T.ico(ICO_ACC[a.k]) }),
        el('span.acc-n', a.n), el('span.acc-r', a.r), el('span.acc-d', ok ? a.d : disp)));
    }
    cont.append(grid);
    cont.append(el('div.mapa-mesa', H().mapa(S, { compacto: true })));
    cont.append(reglas(['r132', 'r150', 'r153', 'r133', 'r135']));
  }
  const H = () => CB.hoja;

  function accion(k) {
    const S = A.S;
    if (k === 'viajar') return A.hacer((S) => (S.escena = { tipo: 'viaje' }));
    if (k === 'explorar') return explorar();
    if (k === 'visitar') {
      const R = M.reg(S);
      return A.hacer((S) => {
        M.elegirAccion(S, 'visitar');
        S.hoy.cubierto = true; S.hoy.descanso = true;
        // r194: evento de aliado pendiente en su asentamiento
        const al = S.avisos.find((a) => a.tipo === 'pendiente' && R.faccion && a.clave === 'aliado-' + R.faccion);
        if (al) A.aviso(`Tienes pendiente el evento de aliado: ${al.ev} (r194).`, 'regla');
        Me._jugar(S, R.ev, 'accion');
        if (!A.visto('g-visita') && A.aj.guia) A.aviso(GUIA.visita, 'regla');
      });
    }
    if (k === 'nave') return A.hacer((S) => { M.elegirAccion(S, 'nave'); S.escena = { tipo: 'nave' }; });
    if (k === 'descansar') return A.hacer((S) => { M.elegirAccion(S, 'descansar'); S.hoy.descanso = true; entrarAnochecer(S); });
    if (k === 'ocultarte') return A.hacer((S) => { M.elegirAccion(S, 'ocultarte'); A.notas(M.cambiar(S, 'alerta', M.tiene(S, 'DESERTOR') ? -2 : -1, M.tiene(S, 'DESERTOR') ? 'ocultarte, Desertor (r105)' : 'ocultarte (r135)').notas); entrarAnochecer(S); });
    if (k === 'pista') return A.hacer((S) => { S.escena = { tipo: 'pistas' }; });
    if (k === 'ensamblar') return A.hacer((S) => { S.escena = { tipo: 'taller', hechos: 0 }; });
    if (k === 'despegar') return A.hacer((S) => { M.elegirAccion(S, 'despegar'); S.despegando = true; Me._jugar(S, M.puedeDespegar(S) ? 'e900' : 'e905', 'accion'); });
  }

  /* ---------------- viajar (r151) ---------------- */
  function pintarViaje(cont, S) {
    const g = guia('viaje');
    if (g) cont.append(g);
    const R = M.reg(S);
    cont.append(cab('mapa', `Día ${S.dia} · Viajar`, '¿Hacia dónde?', `Desde ${R.n} puedes ir a una región vecina (${T.ref('r151')}).`));
    const vec = M.destinosViaje(S);
    if (M.criticoSolo(S)) cont.append(el('p.ayuda-mini', 'Estás en Crítico, sin compañero ni vehículo: solo puedes Viajar hacia la Cicatriz (r106).'));
    cont.append(el('div.mapa-mesa.grande', H().mapa(S, { elegibles: vec, alElegir: viajar })));
    const lista = el('div.destinos');
    vec.forEach((r) => {
      const RR = D.REGIONES[r];
      const hall = D.SISTEMAS.filter((s) => S.sistemas[s].region === r && S.sistemas[s].estado === 'perdido').concat(Object.keys(S.tripu).filter((t) => S.tripu[t].region === r && S.tripu[t].estado === 'perdido'));
      lista.append(el('button.destino', { type: 'button', onclick: () => viajar(r) }, el('span.d-arte', { style: { backgroundImage: `url(arte/${RR.arte}.jpg)` } }), el('span.d-n', `${r} · ${RR.n}`), el('span.d-sub', hall.length ? 'Hallazgos: ' + hall.join(', ') : (RR.asent || 'Sin asentamiento'))));
    });
    cont.append(lista);
    cont.append(el('div.botones-fase', el('button.btn.secundario', { type: 'button', onclick: () => A.hacer((S) => (S.escena = { tipo: 'accion' })) }, '← Elegir otra acción')));
    cont.append(reglas(['r151', 'r154', 'r156', 'r152']));
  }
  async function viajar(destino) {
    const S = A.S;
    A.hacer((S) => M.elegirAccion(S, 'viajar'));
    let res = 'ex', dFallo = null;
    const ruta = S.marcas.some((m) => m.startsWith('RUTA_') && CB.u.norm(m).includes(CB.u.norm(D.REGIONES[destino].corto).toUpperCase().toLowerCase()));
    if (S.prota === 'nativo' || S.rasgos.includes('e730') || S.habilidades.includes('Paso de duna')) {
      A.aviso(S.prota === 'nativo' ? 'El Nativo no tira para orientarse: nunca se pierde (r151).' : 'Nunca te pierdes al viajar.', 'regla');
    } else {
      const sug = A.sugerencias('Ingenio', { contexto: 'orientacion' });
      if (S.vehiculo) sug.unshift({ t: 'Con un vehículo: Ventaja', modo: 'V', r: 'r151' });
      if (ruta) sug.unshift({ t: 'Tienes una RUTA_ hacia allí: Ventaja', modo: 'V', r: 'r151' });
      if (S.rasgos.includes('e700')) sug.unshift({ t: 'Visor de vuelo: Ventaja al orientarte', modo: 'V', r: 'e700' });
      if (M.tiene(S, 'NAVEGANTE')) sug.unshift({ t: 'IA de navegación: Ventaja al viajar', modo: 'V', r: 'r105' });
      const pr = await A.tirar({ titulo: `Orientación hacia ${D.REGIONES[destino].corto}`, attr: 'Ingenio', dif: 9, sugerencias: sug, regla: 'r151', modo: ruta || S.vehiculo ? 'V' : null });
      if (!pr) return;
      res = pr.res;
      if (res === 'fa') {
        const d = await A.tirarDados('Te pierdes (1d6)', 1, 'x', { regla: 'r151', explicar: '1–3: llegas agotado. 4–6: te desvías y sigues donde estabas.' });
        dFallo = d ? d.dados[0] : 1;
      }
    }
    let info;
    A.hacer((S) => { info = M.viajar(S, destino, res, dFallo); A.notas(info.notas); }, { foto: false });
    await encuentro(A.S.region);
  }
  /** r154 + r156: tira en la tabla y lleva al evento */
  async function encuentro(region, columna, origen = 'accion') {
    const S = A.S;
    if (M.tiene(S, 'SEGUIDO')) {
      A.aviso('Te seguían: en lugar de tirar, repites aquel encuentro empezando en r304 (r308).', 'regla');
      A.hacer((S) => M.marcar(S, 'SEGUIDO', false, 'r308'));
    }
    const r = await A.tirarDados(`Encuentro: ${D.REGIONES[region].corto} (2d6)`, 2, 'x', { regla: 'r154', explicar: `Columna: Alerta ${columna || S.alerta}${columna ? ' (forzada)' : ''}. Con dobles puedes cambiarlo por un viejo conocido (r156).` });
    if (!r) return;
    const enc = M.encuentro(A.S, region, r.dados[0], r.dados[1], columna);
    let ev = enc.ev;
    if (enc.dobles) {
      const opciones = Object.keys(D.CONOCIDOS).filter((k) => M.siguienteConocido(A.S, k));
      if (opciones.length) {
        const elegido = await new Promise((ok) => {
          const cuerpo = el('div.conocidos-elegir', el('p', { html: `¡Dobles! Puedes ignorar ${T.ref(ev)} y leer el siguiente encuentro de un viejo conocido (${T.ref('r156')}).` }),
            el('div.botones-col', opciones.map((k) => el('button.btn.secundario', { type: 'button', onclick: () => { A.cerrarModal(); ok(k); } }, `${D.CONOCIDOS[k].n} → ${M.siguienteConocido(A.S, k)}`)),
              el('button.btn.primario', { type: 'button', onclick: () => { A.cerrarModal(); ok(null); } }, `No, sigo con ${ev}`)));
          A.modal('Viejos conocidos', cuerpo, { clase: 'estrecho', cerrable: false });
          A.enlazarRefs(cuerpo);
        });
        if (elegido) { ev = M.siguienteConocido(A.S, elegido); A.hacer((S) => M.avanzarConocido(S, elegido), { foto: false }); }
      }
    }
    A.hacer((S) => Me._jugar(S, ev, origen), { foto: false });
  }
  Me.encuentro = encuentro;

  /* ---------------- explorar (r153) ---------------- */
  async function explorar() {
    const S = A.S;
    A.hacer((S) => M.elegirAccion(S, 'explorar'));
    const sug = A.sugerencias('Ingenio');
    if (S.habilidades.includes('Ojo de sal')) sug.unshift({ t: 'Ojo de sal: Ventaja al explorar', modo: 'V', r: 'r190' });
    if (S.rasgos.includes('e730') && M.hallazgosAqui(S).some((h) => h.k === 'sistema')) sug.unshift({ t: 'Archivo de mapas: Ventaja para encontrar sistemas', modo: 'V', r: 'e730' });
    if (M.tiene(S, 'LISTA_DE_A_BORDO') && M.hallazgosAqui(S).some((h) => h.k === 'tripu')) sug.unshift({ t: 'LISTA_DE_A_BORDO: Ventaja la primera vez que busques a un tripulante', modo: 'V', r: 'e004' });
    const pr = await A.tirar({ titulo: `Explorar ${M.reg(S).corto}`, attr: 'Ingenio', dif: 9, sugerencias: sug, regla: 'r153', explicar: 'Éxito: un Hallazgo. Éxito pleno: Hallazgo y además forrajeas. Fallo: encuentro.' });
    if (!pr) return;
    if (pr.res === 'fa') return encuentro(A.S.region);
    A.hacer((S) => {
      if (pr.res === 'pl') M.forrajear(S, true);
      S.escena = { tipo: 'hallazgo', pleno: pr.res === 'pl' };
    }, { foto: false });
    if (pr.res === 'pl') A.aviso('Éxito pleno: además forrajeas (r153).', 'regla');
  }
  function pintarHallazgo(cont, S, e) {
    const g = guia('hallazgo');
    if (g) cont.append(g);
    cont.append(cab('buscar', `Día ${S.dia} · Explorar`, 'Hallazgo', `Elige uno (${T.ref('r153')}).${e.pleno ? ' Éxito pleno: ya forrajeaste.' : ''}`));
    const hall = M.hallazgosAqui(S);
    const R = M.reg(S);
    const op = (letra, titulo, sub, fn, ok = true) => el('button.hallazgo' + (ok ? '' : '.no'), { type: 'button', disabled: !ok, onclick: fn }, el('span.h-letra', letra), el('span.h-t', titulo), el('span.h-sub', { html: sub }));
    const grid = el('div.hallazgos');
    if (hall.length) hall.forEach((h) => grid.append(op('a', h.n, `Lo anotaste al preparar la partida. ${h.ev ? '→ ' + T.ref(h.ev) : ''}`, () => A.hacer((S) => { if (h.k === 'tripu') S.tripu[h.t].estado = 'perdido'; Me._jugar(S, h.ev, 'accion'); }))));
    else grid.append(op('a', 'Tu lista de Hallazgos', 'Nada de lo que anotaste está en esta región.', null, false));
    grid.append(op('b', 'Un pecio o una ruina', `Se explora sala a sala (${T.ref('r170')}).${[6, 7].includes(S.region) ? ' Aquí siempre es un Arca de los Antiguos.' : S.region === 2 ? ' En el Cementerio tiras dos veces el tipo y eliges.' : ''}`, () => A.hacer((S) => (S.escena = { tipo: 'pecio', fase: 'tipo' }))));
    grid.append(op('c', 'Forrajear', S.prota === 'mente' ? '+1 Energía.' : `+${S.prota === 'nativo' ? 3 : 1} ${S.prota === 'nativo' ? 'Raciones' : 'Ración'}${M.tiene(S, 'COLONO') ? ' (+1 por Hijo de colonos)' : ''}, o +1 Energía.`, () => A.hacer((S) => { M.forrajear(S); entrarAnochecer(S); })));
    grid.append(op('d', 'Un encuentro tranquilo', `Tabla de la región en la <b>columna 1</b>, sea cual sea tu Alerta (${T.ref(R.tabla)}).`, () => encuentro(S.region, 1)));
    grid.append(op('e', 'Rebuscar', `${e.pleno ? 3 : 2} piezas de ${R.piezas.map((p) => D.PIEZAS[p]).join(' o ')} (${T.ref('r201')}).`, () => rebuscar(e.pleno)));
    cont.append(grid);
    cont.append(reglas(['r153', 'r170', 'r201', 'r108']));
  }
  function rebuscar(pleno) {
    const S = A.S;
    const tipos = M.reg(S).piezas;
    const n = pleno ? 3 : 2;
    const hacer = (p) => A.hacer((S) => { M.cambiar(S, 'pieza:' + p, n, 'rebuscar (r153)'); entrarAnochecer(S); });
    if (tipos.length === 1) return hacer(tipos[0]);
    A.modal('¿Qué piezas?', el('div.botones-col', tipos.map((p) => el('button.btn.secundario', { type: 'button', onclick: () => { A.cerrarModal(); hacer(p); } }, `${n} ${D.PIEZAS[p]}`))), { clase: 'estrecho' });
  }

  /* ---------------- pistas (r192) ---------------- */
  function pintarPistas(cont, S) {
    cont.append(cab('pista', `Día ${S.dia} · Seguir una Pista`, '¿Cuál sigues?', `Vas directo a su evento, sin encuentro. Después se borra (${T.ref('r192')}).`));
    const lista = el('div.destinos');
    S.pistas.filter((p) => p.region === S.region).forEach((p) => lista.append(el('button.destino', { type: 'button', onclick: () => A.hacer((S) => { M.elegirAccion(S, 'pista'); S.pistas = S.pistas.filter((x) => x.ev !== p.ev); M.log(S, `Sigues la Pista «${p.nombre}».`, ['r192']); Me._jugar(S, p.ev, 'accion'); }) }, el('span.d-n', p.nombre), el('span.d-sub', `${p.ev} · ${CB.libro.titulo(p.ev)}`))));
    cont.append(lista, el('div.botones-fase', el('button.btn.secundario', { type: 'button', onclick: () => A.hacer((S) => (S.escena = { tipo: 'accion' })) }, '← Elegir otra acción')));
  }

  /* ---------------- trabajar en la nave (r181) ---------------- */
  function pintarNave(cont, S, e) {
    const g = guia('nave');
    if (g) cont.append(g);
    cont.append(cab('martillo', `Día ${S.dia} · La Cicatriz`, 'Trabajar en la nave', `Elige una tarea (${T.ref('r181')}). Si no hay nada que hacer, vuelve atrás y elige otra acción.`));
    const caja = el('div.tareas');
    const llevados = D.SISTEMAS.concat(['Personal']).filter((s) => S.sistemas[s].estado === 'llevado');
    llevados.forEach((s) => caja.append(el('div.tarea', el('div', el('b', `Instalar el ${s === 'Personal' ? S.sistemas.Personal.n : s}`), el('small', `${S.sistemas[s].cal} · Ingenio · 11. Éxito pleno: +1 calidad. Fallo: −1 Chatarra y reintentas otro día.`)), el('button.btn.primario', { type: 'button', onclick: () => instalar(s) }, 'Instalar'))));
    if (!llevados.length) caja.append(el('p.vacio', 'No llevas ningún sistema para instalar.'));
    D.SISTEMAS.concat(['Personal']).filter((s) => S.sistemas[s].estado === 'instalado' && S.sistemas[s].cal !== 'Excelente').forEach((s) => caja.append(el('div.tarea', el('div', el('b', `Mejorar el ${s === 'Personal' ? S.sistemas.Personal.n : s}`), el('small', `${S.sistemas[s].cal} → ${D.CALIDADES[D.CALIDADES.indexOf(S.sistemas[s].cal) + 1]} · 3 Chatarra e Ingenio · 11`)), el('button.btn.secundario', { type: 'button', disabled: S.chatarra < 3, onclick: () => mejorar(s) }, 'Mejorar'))));
    if (M.tiene(S, 'BALIZA_ACTIVA')) caja.append(el('div.tarea', el('div', el('b', 'Apagar la baliza'), el('small', 'Ingenio · 9 ◉. Éxito: BALIZA_MUDA (la Alerta ya puede bajar de 2). Fallo: +1 Alerta.')), el('button.btn.secundario', { type: 'button', onclick: apagarBaliza }, 'Intentarlo')));
    cont.append(caja);
    // gestión gratis
    const gest = el('div.gestion', el('h4', 'Sin gastar el día'));
    if (S.prota === 'mente' && S.energia < 6) gest.append(el('button.btn.mini.secundario', { type: 'button', disabled: S.chatarra < 2, onclick: () => A.hacer((S) => { M.cambiar(S, 'chatarra', -2, 'recargar Energía (r104)'); S.energia = 6; M.log(S, 'Recargas la Energía por completo.', ['r104', 'r182']); }) }, 'Recargar la Energía (2 Chatarra)'));
    if (S.raciones > 0) gest.append(el('button.btn.mini.secundario', { type: 'button', onclick: () => A.hacer((S) => { S.raciones -= 1; S.despensa += 1; M.log(S, 'Dejas 1 Ración en la despensa.', ['r182']); }) }, 'Dejar 1 Ración en la despensa'));
    for (const t in S.tripu) {
      if (S.tripu[t].estado === 'contigo') gest.append(el('button.btn.mini.secundario', { type: 'button', onclick: () => A.hacer((S) => { S.tripu[t].estado = 'cicatriz'; M.log(S, `${t} se queda en la Cicatriz.`, ['r182']); }) }, `${t}: quedarse en la Cicatriz`));
      if (S.tripu[t].estado === 'cicatriz') gest.append(el('button.btn.mini.secundario', { type: 'button', disabled: M.compas(S).length >= 2, onclick: () => A.hacer((S) => { S.tripu[t].estado = 'contigo'; M.log(S, `${t} viene contigo.`, ['r185']); }) }, `${t}: venir conmigo`));
    }
    cont.append(gest);
    cont.append(el('div.botones-fase', el('button.btn.secundario', { type: 'button', onclick: () => A.hacer((S) => { S.hoy.accion = null; S.escena = { tipo: 'accion' }; }) }, '← Elegir otra acción')));
    cont.append(reglas(['r181', 'r180', 'r182', 'r183']));
  }
  async function instalar(s) {
    const S = A.S;
    const sug = [];
    if (M.compas(S).includes('Noemí') || S.tripu['Noemí'].estado === 'cicatriz') sug.push({ t: 'Noemí: Ventaja para instalar', modo: 'V', r: 'r181' });
    if (S.habilidades.includes('Mecánico de campaña')) sug.push({ t: 'Mecánico de campaña: Ventaja', modo: 'V', r: 'r190' });
    if (M.tiene(S, 'MORRO_ENTERO') && !M.instalados(S).length) sug.push({ t: 'MORRO_ENTERO: tu primer sistema será más fácil', modo: 'V', r: 'e002' });
    const r = await A.tirar({ titulo: `Instalar el ${s}`, attr: 'Ingenio', dif: 11, sugerencias: sug, regla: 'r181', modo: sug.some((x) => x.modo === 'V') ? 'V' : null, cancelable: true });
    if (!r) return;
    A.hacer((S) => { const x = M.instalar(S, s, r.res); if (x.ok) { entrarAnochecer(S); } else entrarAnochecer(S); });
    if (r.res !== 'fa') { A.aviso(`¡${s} instalado! Es un hito: elige una mejora (r190).`, 'bien'); Me.mejora(); }
  }
  async function mejorar(s) {
    const r = await A.tirar({ titulo: `Mejorar el ${s}`, attr: 'Ingenio', dif: 11, sugerencias: A.sugerencias('Ingenio'), regla: 'r181', cancelable: true, explicar: 'Gastas 3 Chatarra pase lo que pase.' });
    if (!r) return;
    A.hacer((S) => { M.cambiar(S, 'chatarra', -3, 'mejorar sistema'); if (r.res !== 'fa') M.subirCalidad(S, s, 1, 'mejora (r181)'); entrarAnochecer(S); });
  }
  async function apagarBaliza() {
    const r = await A.tirar({ titulo: 'Apagar la baliza', attr: 'Ingenio', dif: 9, sugerencias: A.sugerencias('Ingenio'), regla: 'r181', cancelable: true });
    if (!r) return;
    A.hacer((S) => { if (r.res === 'fa') M.cambiar(S, 'alerta', 1, 'la baliza se defiende'); else M.marcar(S, 'BALIZA_MUDA', true, 'r181'); entrarAnochecer(S); });
  }

  /* ---------------- taller (r200–r206) ---------------- */
  function receta(id) {
    const md = LIB()[id].md;
    const m = md.match(/\*\*Receta:\*\* (.+?) · `\[Ingenio · (\d+)\]`/);
    if (!m) return null;
    return { piezas: leerPiezas(m[1]), dif: +m[2] };
  }
  function fases(id) {
    const md = LIB()[id].md;
    const m = [...md.matchAll(/\*\*Fase (I{1,3}):\*\* ([^·\n]+)/g)];
    return m.map((x) => leerPiezas(x[2].replace(/\.$/, '')));
  }
  function leerPiezas(t) {
    const out = {};
    for (const m of t.matchAll(/(\d+) (Cobre|Hueso|Cristal|Luz fría)/g)) out[{ Cobre: 'cobre', Hueso: 'hueso', Cristal: 'cristal', 'Luz fría': 'luz' }[m[2]]] = +m[1];
    return out;
  }
  const textoPiezas = (p) => Object.entries(p).map(([k, n]) => `${n} ${D.PIEZAS[k]}`).join(' + ');
  const tienePiezas = (S, p) => Object.entries(p).every(([k, n]) => S.piezas[k] >= n);
  function pintarTaller(cont, S, e) {
    const g = guia('taller');
    if (g) cont.append(g);
    const enCic = M.enCicatriz(S);
    cont.append(cab('objeto', `Día ${S.dia} · Ensamblar`, 'El taller', `Hasta dos planos pequeños o una fase de una gran obra (${T.ref('r203')}).${enCic ? '' : ' En un taller ajeno cuesta 1 Chatarra.'}`));
    cont.append(el('div.piezas-hoy', Object.keys(D.PIEZAS).map((p) => el('span.pz', el('b', String(S.piezas[p])), ' ', D.PIEZAS[p]))));
    const lista = el('div.planos');
    S.planos.forEach((id) => {
      const n = +id.slice(1);
      const grande = n >= 775;
      if (grande) {
        const fs = fases(id);
        const hechas = S.obras[id] || 0;
        if (hechas >= 3) { lista.append(el('div.plano.hecho', el('b', CB.libro.titulo(id)), el('small', 'Terminada'))); return; }
        const p = fs[hechas];
        const ok = enCic && !e.hechos && tienePiezas(S, p);
        lista.append(el('div.plano', el('div', el('b', { html: `${esc(CB.libro.titulo(id))} ${T.ref(id)}` }), el('small', `Gran obra · fase ${['I', 'II', 'III'][hechas]}: ${textoPiezas(p)} · Ingenio · ${hechas === 2 ? 11 : 9}${enCic ? '' : ' · solo en la Cicatriz'}`)),
          el('button.btn.mini', { type: 'button', disabled: !ok, onclick: () => construirFase(id, hechas, p) }, 'Construir fase')));
      } else {
        const rc = receta(id);
        if (!rc) return;
        const ok = (e.hechos || 0) < 2 && tienePiezas(S, rc.piezas);
        lista.append(el('div.plano', el('div', el('b', { html: `${esc(CB.libro.titulo(id))} ${T.ref(id)}` }), el('small', `${textoPiezas(rc.piezas)} · Ingenio · ${rc.dif}`)),
          el('button.btn.mini', { type: 'button', disabled: !ok, onclick: () => construir(id, rc) }, 'Construir')));
      }
    });
    cont.append(lista);
    cont.append(el('div.botones-fase',
      e.hechos ? el('button.btn.primario', { type: 'button', onclick: () => A.hacer((S) => entrarAnochecer(S)) }, 'Terminar el día') : el('button.btn.secundario', { type: 'button', onclick: () => A.hacer((S) => (S.escena = { tipo: 'accion' })) }, '← Elegir otra acción')));
    cont.append(reglas(['r200', 'r201', 'r202', 'r203', 'r204', 'r205']));
  }
  async function construir(id, rc) {
    const S = A.S;
    const af = M.P(S).afinidad;
    const total = Object.values(rc.piezas).reduce((a, b) => a + b, 0);
    const extra = (rc.piezas[af] || 0) * 2 >= total ? [{ t: 'Afinidad', v: 1, r: 'r202' }] : [];
    const sug = [];
    if (M.compas(S).includes('Noemí')) sug.push({ t: 'Noemí: Ventaja al ensamblar', modo: 'V', r: 'r203' });
    if (rc.piezas.luz && M.compas(S).includes('Amara')) sug.push({ t: 'Amara: Ventaja si lleva Luz fría', modo: 'V', r: 'r203' });
    const r = await A.tirar({ titulo: `Ensamblar: ${CB.libro.titulo(id)}`, attr: 'Ingenio', dif: rc.dif, extra, sugerencias: sug, regla: 'r203', cancelable: true });
    if (!r) return;
    let defecto = null, perder = false;
    if (r.res === 'fa') {
      const elegir = await new Promise((ok) => {
        A.modal('Sale torcido', el('div.botones-col', el('p', { html: `Elige (${T.ref('r203')}):` }),
          el('button.btn.secundario', { type: 'button', onclick: () => { A.cerrarModal(); ok('perder'); } }, 'Perder 1 pieza y no construir nada'),
          el('button.btn.secundario', { type: 'button', onclick: () => { A.cerrarModal(); ok('defecto'); } }, 'Quedármelo con un defecto (1d6, r204)')), { clase: 'estrecho', cerrable: false });
      });
      if (elegir === 'perder') perder = true;
      else { const d = await A.tirarDados('Defecto (1d6)', 1, 'x', { regla: 'r204' }); defecto = ['Ruidoso', 'Hambriento', 'Canta', 'Frágil', 'Caprichoso', 'Feo pero honrado'][(d ? d.dados[0] : 1) - 1]; }
    }
    A.hacer((S) => {
      if (!M.enCicatriz(S) && !S.escena.hechos) M.cambiar(S, 'chatarra', -1, 'taller ajeno (r203)');
      if (perder) { const k = Object.keys(rc.piezas)[0]; M.cambiar(S, 'pieza:' + k, -1, 'ensamblaje fallido'); }
      else {
        for (const [k, n] of Object.entries(rc.piezas)) S.piezas[k] -= n;
        const nombre = CB.libro.titulo(id) + (r.res === 'pl' ? ' (maestra)' : defecto ? ` (${defecto.toLowerCase()})` : '');
        M.objeto(S, nombre);
        M.log(S, `Ensamblas ${nombre}.`, ['r203'].concat(defecto ? ['r204'] : []));
      }
      S.escena.hechos = (S.escena.hechos || 0) + 1;
      S.hoy.accion = 'ensamblar';
    });
  }
  async function construirFase(id, hechas, p) {
    const dif = hechas === 2 ? 11 : 9;
    const r = await A.tirar({ titulo: `${CB.libro.titulo(id)}: fase ${['I', 'II', 'III'][hechas]}`, attr: 'Ingenio', dif, sugerencias: A.sugerencias('Ingenio'), regla: 'r205', cancelable: true });
    if (!r) return;
    A.hacer((S) => {
      S.hoy.accion = 'ensamblar';
      S.escena.hechos = 2;
      if (r.res === 'fa') { const k = Object.keys(p)[0]; M.cambiar(S, 'pieza:' + k, -1, 'fase fallida (r205)'); return; }
      for (const [k, n] of Object.entries(p)) S.piezas[k] -= n;
      S.obras[id] = hechas + 1;
      M.log(S, `${CB.libro.titulo(id)}: fase ${['I', 'II', 'III'][hechas]} terminada.`, ['r205']);
      if (hechas + 1 === 3) {
        const m = LIB()[id].md.match(/gana `([A-Z_ÑÁÉÍÓÚ]+)`/);
        if (m) M.marcar(S, m[1], true, CB.libro.titulo(id));
        if (r.res === 'pl') M.log(S, '¡Obra maestra!', ['r205']);
        S.mejoras += 1;
        M.log(S, 'Terminar una gran obra es un hito: eliges una mejora.', ['r190']);
      }
    });
    if (r.res !== 'fa' && hechas + 1 === 3) Me.mejora();
  }

  /* ---------------- pecios (r170–r174) ---------------- */
  function pintarPecio(cont, S, e) {
    const g = guia('pecio');
    if (g) cont.append(g);
    const P = e.P;
    const tipo = P ? D.PECIOS[P.tipo] : null;
    cont.append(cab('reliquia', `Día ${S.dia} · Pecio`, tipo ? tipo.n : 'Un pecio', tipo ? `${tipo.rasgo}. Guardián: ${tipo.g.split(' · ')[0]}.` : `Primero, qué tipo de nave o ruina es (${T.ref('r171')}).`));
    if (!P) {
      const arca = [6, 7].includes(S.region);
      cont.append(el('div.botones-fase', el('button.btn.primario.grande', { type: 'button', onclick: tipoPecio }, el('span', { html: `${T.ico('dado')} ${arca ? 'Es un Arca de los Antiguos' : S.region === 2 ? 'Tirar el tipo dos veces (1d6)' : 'Tirar el tipo (1d6)'}` }))));
      cont.append(reglas(['r170', 'r171', 'r172']));
      return;
    }
    if (P.cond) cont.append(el('div.barra-ctx.pecio-cond', { html: `${T.ico('recuerda')} <b>Lo que dice ${P.volver ? T.ref(P.volver) : 'el evento'} de este pecio:</b> ${esc(P.cond)}${P.volver ? `<br><small>Al salir vuelves a ${P.volver} para terminarlo.</small>` : ''}` }));
    const maxS = P.max || 4;
    const salas = el('ol.salas');
    P.salas.forEach((s, i) => salas.append(el('li.sala' + (s.fin ? '.cierra' : ''), el('span.sala-n', `Sala ${i + 1}`), el('div', el('b', `${s.suma} · ${s.sala}`), s.nota ? el('small.nota', s.nota) : null, el('div.sala-t', { html: T.inline(s.txt || '', {}) })))));
    cont.append(salas);
    const ult = P.salas[P.salas.length - 1];
    const bot = el('div.botones-fase');
    if (ult && ult.pendiente) {
      bot.append(...botonesSala(S, P, ult));
    } else if (!P.fin && P.salas.length < maxS) {
      bot.append(el('button.btn.primario.grande', { type: 'button', onclick: entrarSala }, el('span', { html: `${T.ico('dado')} ${P.salas.length ? 'Seguir: sala ' + (P.salas.length + 1) : 'Entrar en la primera sala'} (2d6)` })));
      // cuando un evento fija una sala («la primera sala es siempre de Restos»), se elige en lugar de tirar
      if (P.cond) bot.append(el('button.btn.secundario', { type: 'button', onclick: elegirSala }, 'Elegir la sala (lo dice el evento)'));
      if (P.salas.length) bot.append(el('button.btn.secundario', { type: 'button', onclick: () => A.hacer((S) => { M.log(S, 'Sales del pecio.', ['r170']); salirPecio(S); }) }, P.volver ? `Salir y volver a ${P.volver}` : 'Salir del pecio'));
      if (S.alerta >= 4 || S.heridas >= 2) bot.append(el('p.ayuda-mini', { html: `Con Alerta 4 o 2 Heridas puedes salir con prisa en mitad de una sala (${T.ref('r174')}).` }));
    } else {
      bot.append(el('p.ayuda-mini', P.fin ? 'Tienes que salir.' : `${maxS === 4 ? 'Cuatro' : maxS} salas: es todo lo que da de sí (r170).`), el('button.btn.primario', { type: 'button', onclick: () => A.hacer((S) => salirPecio(S)) }, P.volver ? `Salir y volver a ${P.volver}` : 'Salir y terminar el día'));
    }
    cont.append(bot);
    cont.append(reglas(['r172', 'r173', 'r174', 'r193']));
  }
  async function tipoPecio() {
    const S = A.S;
    let tipo;
    if ([6, 7].includes(S.region)) tipo = 5;
    else {
      const n = S.region === 2 ? 2 : 1;
      const r = await A.tirarDados(n === 2 ? 'Tipo de pecio (dos veces)' : 'Tipo de pecio (1d6)', n, 'x', { regla: 'r171' });
      if (!r) return;
      if (n === 2 && r.dados[0] !== r.dados[1]) {
        tipo = await new Promise((ok) => A.modal('Elige el pecio', el('div.botones-col', r.dados.map((d) => el('button.btn.secundario', { type: 'button', onclick: () => { A.cerrarModal(); ok(d); } }, `${d} · ${D.PECIOS[d].n}`))), { clase: 'estrecho', cerrable: false }));
      } else tipo = r.dados[0];
    }
    A.hacer((S) => { S.escena = { tipo: 'pecio', P: M.pecioNuevo(S, tipo) }; });
  }
  function elegirSala() {
    const SAL = D.SALAS;
    const ops = [...new Set(Object.values(SAL))].map((n) => [+Object.keys(SAL).find((k) => SAL[k] === n), n]);
    A.modal('¿Qué sala?', [el('p.ayuda-mini', 'Solo cuando el evento fija la sala. Si no, tira.'), el('div.botones-col', ops.map(([v, n]) => el('button.btn.secundario', { type: 'button', onclick: () => { A.cerrarModal(); entrarSala({ fija: v }); } }, n)))], { clase: 'estrecho' });
  }
  async function entrarSala(op = {}) {
    let suma = op.fija;
    if (suma == null) {
      const r = await A.tirarDados(`Sala ${A.S.escena.P.salas.length + 1} (2d6)`, 2, 'x', { regla: 'r172' });
      if (!r) return;
      suma = r.suma;
    }
    const r = { suma };
    const S = A.S;
    const P = S.escena.P;
    const x = op.fija != null ? { suma, sala: D.SALAS[suma], nota: 'Elegida: lo dice el evento.' } : M.salaDe(P, r.suma);
    const sala = { suma: x.suma, sala: x.sala, nota: x.nota, txt: '', pendiente: true };
    const tipo = D.PECIOS[P.tipo];
    A.hacer((S) => {
      const P = S.escena.P;
      P.salas.push(sala);
      const s = P.salas[P.salas.length - 1];
      const noemi = M.compas(S).includes('Noemí') ? 1 : 0;
      switch (x.sala) {
        case 'Vacía': M.cambiar(S, 'chatarra', 1, 'sala vacía'); s.txt = 'Ecos y polvo. Ganas 1 Chatarra.'; s.pendiente = false; break;
        case 'Restos': { const n = 2 + (P.tipo === 1 ? 1 : 0) + noemi; s.n = n; s.txt = `Ganas ${n} Chatarra${P.tipo === 1 ? ' (Carguero +1)' : ''}${noemi ? ' (Noemí +1)' : ''}, o el mismo número de Cobre (r201).${P.tipo === 4 ? ' Yate: además, un objeto vendible por 3.' : ''}`; break; }
        case 'Suministros': s.txt = `Elige: +2 Raciones, +2 Aire o +2 Energía${P.tipo === 2 ? ' (Nave colonia: el doble)' : ''}.`; break;
        case 'Reliquia': M.reliquia(S); s.txt = 'Una reliquia sin identificar (r193).'; s.pendiente = false; break;
        case 'Guardián': s.txt = tipo.g; break;
        case 'Trampa': s.txt = '`[Reflejos · 9]` ⚔. Fallo: 1 Herida.'; break;
        case 'Derrumbe': s.txt = '`[Reflejos · 9]` ⚔. Fallo: 1 Herida y tienes que salir.'; break;
        case 'Equipo': s.txt = `Tira en la tabla de Equipo (r173).${P.tipo === 3 ? ' Nave militar: eliges el objeto.' : ''}`; break;
        case 'Sala especial': s.txt = 'Tira 1d6: 1–3, la primera sala especial de este tipo; 4–5, la siguiente; 6, la otra.'; break;
        case 'Superviviente o tesoro': s.txt = 'Tira 1d6. 1–3: un superviviente te da una Pista. 4–6: un tesoro, 5 Chatarra y una reliquia.'; break;
      }
      M.log(S, `Sala ${P.salas.length}: ${x.suma} → ${x.sala}.`, ['r172']);
    });
  }
  function botonesSala(S, P, s) {
    const fin = (txt, extra = {}) => A.hacer((S) => { const u = S.escena.P.salas[S.escena.P.salas.length - 1]; u.pendiente = false; if (txt) u.txt += ' ' + txt; Object.assign(u, extra); if (extra.fin) S.escena.P.fin = true; });
    const tipo = D.PECIOS[P.tipo];
    switch (s.sala) {
      case 'Restos':
        return [el('button.btn.primario', { type: 'button', onclick: () => { A.hacer((S) => { M.cambiar(S, 'chatarra', s.n, 'restos'); if (P.tipo === 4) M.objeto(S, 'Objeto de lujo (vale 3)'); }, { foto: false }); fin('→ Chatarra.'); } }, `${s.n} Chatarra`),
          el('button.btn.secundario', { type: 'button', onclick: () => { A.hacer((S) => { M.cambiar(S, 'pieza:cobre', s.n, 'restos (r201)'); if (P.tipo === 4) M.objeto(S, 'Objeto de lujo (vale 3)'); }, { foto: false }); fin('→ Cobre.'); } }, `${s.n} Cobre`)];
      case 'Suministros': {
        const n = P.tipo === 2 ? 4 : 2;
        return [['raciones', 'Raciones'], ['aire', 'Aire'], ['energia', 'Energía']].filter(([k]) => !(k === 'aire' && S.prota !== 'piloto') && !(k === 'raciones' && S.prota === 'mente')).map(([k, t]) => el('button.btn.secundario', { type: 'button', onclick: () => { A.hacer((S) => M.cambiar(S, k, n, 'suministros'), { foto: false }); fin(`→ +${n} ${t}.`); } }, `+${n} ${t}`));
      }
      case 'Guardián': {
        const en = M.leerEnemigo(tipo.g);
        return [el('button.btn.primario', { type: 'button', onclick: () => Me.combatir(en, {}, (res) => { if (res === 'ganas') A.hacer((S) => (S.escena.P.guardianVencido = true), { foto: false }); fin(res === 'ganas' ? 'Vencido: la siguiente sala es de Equipo.' : res === 'huyes' ? 'Huyes del guardián.' : ''); }) }, el('span', { html: `${T.ico('combate')} Combatir` }))];
      }
      case 'Trampa':
      case 'Derrumbe':
        return [el('button.btn.primario', { type: 'button', onclick: async () => {
          const sug = S.rasgos.includes('e711') && s.sala === 'Trampa' ? [{ t: 'Ojos de sombra: Ventaja contra las Trampas', modo: 'V', r: 'e711' }] : [];
          const r = await A.tirar({ titulo: s.sala, attr: 'Reflejos', dif: 9, sugerencias: sug, regla: 'r172' });
          if (!r) return;
          if (r.res === 'fa') { A.hacer((S) => M.herir(S, 1, s.sala.toLowerCase()), { foto: false }); fin(s.sala === 'Derrumbe' ? 'Fallo: 1 Herida y tienes que salir.' : 'Fallo: 1 Herida.', { fin: s.sala === 'Derrumbe' }); }
          else fin('Lo esquivas.');
        } }, el('span', { html: `${T.ico('dado')} Reflejos · 9` }))];
      case 'Equipo':
        return [el('button.btn.primario', { type: 'button', onclick: async () => {
          let v;
          if (P.tipo === 3) v = await new Promise((ok) => A.modal('Elige el equipo', el('div.botones-col', Object.entries(D.EQUIPO_PECIO).map(([k, t]) => el('button.btn.secundario', { type: 'button', onclick: () => { A.cerrarModal(); ok(+k); } }, t))), { clase: 'estrecho', cerrable: false }));
          else { const r = await A.tirarDados('Equipo (1d6)', 1, 'x', { regla: 'r173' }); if (!r) return; v = r.dados[0]; }
          let obj = D.EQUIPO_PECIO[v];
          if (obj.includes(' o ')) {
            const ops = obj.split(' o ').map((x) => x.charAt(0).toUpperCase() + x.slice(1));
            obj = await new Promise((ok) => A.modal('Elige', el('div.botones-col', ops.map((o) => el('button.btn.secundario', { type: 'button', onclick: () => { A.cerrarModal(); ok(o); } }, o))), { clase: 'estrecho', cerrable: false }));
          }
          A.hacer((S) => M.objeto(S, obj), { foto: false });
          fin(`→ ${obj}.`);
        } }, 'Tirar el equipo')];
      case 'Sala especial':
        return [el('button.btn.primario', { type: 'button', onclick: async () => {
          const r = await A.tirarDados('Sala especial (1d6)', 1, 'x', { regla: 'r172' });
          if (!r) return;
          const id = M.salaEspecial(P.tipo, r.dados[0]);
          A.hacer((S) => { const u = S.escena.P.salas[S.escena.P.salas.length - 1]; u.pendiente = false; u.txt += ` → ${id}`; Me._jugar(S, id, 'libre'); }); // e500: al terminar, puedes seguir explorando el pecio o salir
        } }, 'Tirar la sala especial')];
      case 'Superviviente o tesoro':
        return [el('button.btn.primario', { type: 'button', onclick: async () => {
          const r = await A.tirarDados('¿Superviviente o tesoro? (1d6)', 1, 'x', { regla: 'r172' });
          if (!r) return;
          if (r.dados[0] >= 4) { A.hacer((S) => { M.cambiar(S, 'chatarra', 5, 'tesoro'); M.reliquia(S); }, { foto: false }); fin('Tesoro: 5 Chatarra y una reliquia.'); }
          else {
            const r2 = await A.tirarDados('El superviviente sabe algo (2d6, r164)', 2, 'x', { regla: 'r164' });
            const R = r2 && D.RUMORES[r2.suma];
            if (r2) A.hacer((S) => aplicarRumor(S, r2.suma), { foto: false });
            fin(R ? `Un superviviente te da una Pista: ${R[2]}.` : 'Un superviviente: «alguien de tu tripulación pasó por aquí».');
          }
        } }, 'Tirar 1d6')];
      default:
        return [el('button.btn.primario', { type: 'button', onclick: () => fin('') }, 'Seguir')];
    }
  }

  /* ---------------- anochecer (r133) ---------------- */
  function entrarAnochecer(S) {
    const d = M.descansoAnochecer(S);
    const hist = M.historiaHoy(S);
    const leales = S.hoy.descanso ? S.avisos.filter((a) => a.tipo === 'descanso') : [];
    S.escena = { tipo: 'anochecer', lineas: d.L, intemperie: d.intemperie && !d.centinela, centinela: d.intemperie && d.centinela, noche: null, historia: hist, leales: leales.map((a) => a.clave), radio: S.equipo.some((o) => /Radio de galena/.test(o)) };
    if (d.intemperie && d.centinela) M.cambiar(S, 'energia', -1, 'Modo centinela (e726)');
    M.log(S, 'Anochecer.', ['r133']);
  }
  Me.entrarAnochecer = entrarAnochecer;
  function pintarAnochecer(cont, S, e) {
    const g = guia('anochecer');
    if (g) cont.append(g);
    cont.append(cab('luna', `Día ${S.dia}`, 'Anochecer', S.hoy.descanso ? 'Hoy descansaste.' : 'Hoy no descansaste.'));
    const pasos = el('ol.pasos-dia');
    pasos.append(el('li.hecho', el('b', 'Descanso'), el('span', { html: T.ref('r133') }), e.lineas.length ? el('ul.sub', e.lineas.map((x) => el('li', { html: `${esc(x.t)} ${T.ref(x.r)}` }))) : el('small', S.hoy.descanso ? 'Nada que curar.' : 'Sin descanso, no te curas.')));
    let pendiente = false;
    if (e.intemperie) {
      pasos.append(el('li.' + (e.noche ? 'hecho' : 'ahora'), el('b', 'Noche a la intemperie'), el('span', { html: T.ref('r133') }), el('small', e.noche || `Tira 2d6: con ${S.equipo.some((o) => /Capa de sal/.test(o)) ? 10 : 9} o más, algo te encuentra de noche.`)));
      if (!e.noche) pendiente = true;
    } else if (e.centinela) pasos.append(el('li.hecho', el('b', 'Modo centinela'), el('span', { html: T.ref('e726') }), el('small', 'Sin tirada nocturna (1 Energía extra).')));
    else pasos.append(el('li.hecho', el('b', 'A cubierto'), el('span', { html: T.ref('r133') }), el('small', S.region === 1 ? 'Duermes en la Cicatriz: no hay tirada nocturna.' : S.hoy.cubierto ? 'Duermes en el asentamiento.' : 'No dormiste a la intemperie.')));
    if (e.historia) {
      const leida = S.historiaLeida.includes(e.historia.i);
      pasos.append(el('li.' + (leida ? 'hecho' : 'ahora'), el('b', 'Tu historia'), el('span', { html: T.ref(M.P(S).regla) }), el('small', { html: leida ? 'Leída.' : `Reloj en ${S.reloj}: toca ${T.ref(e.historia.ev)} · ${esc(CB.libro.titulo(e.historia.ev))}.` })));
      if (!leida) pendiente = true;
    }
    cont.append(pasos);
    const bot = el('div.botones-fase');
    if (e.intemperie && !e.noche) bot.append(el('button.btn.primario.grande', { type: 'button', onclick: noche }, el('span', { html: `${T.ico('dado')} Tirar la noche (2d6)` })));
    else if (e.historia && !S.historiaLeida.includes(e.historia.i)) bot.append(el('button.btn.primario.grande', { type: 'button', onclick: () => A.hacer((S) => { S.historiaLeida.push(S.escena.historia.i); Me._jugar(S, S.escena.historia.ev, 'noche'); }) }, el('span', { html: `${T.ico('libro')} Leer ${e.historia.ev}` })));
    S.avisos.filter((a) => (e.leales || []).includes(a.clave)).forEach((a) => bot.append(el('button.btn.secundario', { type: 'button', onclick: () => irAviso(a) }, `Evento de lealtad: ${a.ev}`)));
    if (e.radio && !e.radioHecha) bot.append(el('button.btn.secundario', { type: 'button', onclick: async () => { const r = await A.tirarDados('Radio de galena (1d6)', 1, 'x', { explicar: 'Con un 6, captas un rumor (e767).' }); if (!r) return; A.hacer((S) => (S.escena.radioHecha = true)); if (r.dados[0] === 6) rumorGratis(); } }, 'Escuchar la radio'));
    if (!pendiente) bot.append(el('button.btn.primario.grande', { type: 'button', onclick: () => A.hacer((S) => M.empezarDia(S)) }, el('span', { html: `${T.ico('sol')} Dormir · día ${S.dia + 1}` })));
    cont.append(bot);
    cont.append(reglas(['r133', 'r135', 'r154', M.P(S).regla]));
  }
  function rumorGratis() { return Me.rumor({ gratis: true }); }
  async function noche() {
    const S = A.S;
    const umbral = S.equipo.some((o) => /Capa de sal/.test(o)) ? 10 : 9;
    const r = await A.tirarDados('La noche (2d6)', 2, 'x', { regla: 'r133', explicar: `Con ${umbral} o más, algo te encuentra.${S.clima && S.clima.n === 'Noche helada' ? ' Noche helada: sin refugio, +1 Herida (r155).' : ''}` });
    if (!r) return;
    if (r.suma >= umbral) {
      A.hacer((S) => (S.escena.noche = `Sacas ${r.suma}: algo te encuentra.`), { foto: false });
      await encuentro(A.S.region, null, 'noche');
    } else A.hacer((S) => (S.escena.noche = `Sacas ${r.suma}: la noche pasa en calma.`), { foto: false });
  }

  /* ================================================================
     COMBATE
     ================================================================ */
  Me.combatir = function (en, opts = {}, alTerminar) {
    const S = A.S;
    let C = M.combate(S, en, opts);
    A.guardar();
    const gl = guia('combate');
    const caja = el('div.combate');
    let modoJ = C.sorpresa ? 'V' : C.emboscada ? 'D' : null;
    function pintar() {
      caja.innerHTML = '';
      if (gl && !A.aj.vistos['g-combate']) caja.append(gl);
      const aj = M.ataqueJugador(S, C);
      const pct = Math.max(0, C.en.h) / C.en.hMax;
      caja.append(el('div.duelo',
        el('div.lado.tu', el('div.lado-n', S.nombre), el('div.lado-stat', { html: `Ataque <b>${CB.u.firma(aj.total)}</b> <small>${aj.attr}${aj.partes.slice(1).map((p) => ` ${CB.u.firma(p.v)} ${esc(p.t)}`).join('')}</small>` }), el('div.lado-stat', { html: `Blindaje <b>${M.blindajeCombate(S, C)}</b> · ${M.nivel(S)}` }), el('div.her-mini', Array.from({ length: S.nivelesHerida }, (_, i) => el('i' + (i < S.heridas ? '.on' : ''))))),
        el('div.vs', 'VS'),
        el('div.lado.ellos', el('div.lado-n', C.en.n), el('div.lado-stat', { html: `Ataque <b>+${C.en.atk}</b> · Blind. <b>${C.en.bl}</b>` }), el('div.etqs', C.en.tags.map((t) => el('span.etq', { title: etiqueta(t) }, t))), el('div.vida', el('i', { style: { width: pct * 100 + '%' } }), el('span', `${Math.max(0, C.en.h)}/${C.en.hMax}`)))));
      if (C.fin) return pintarFinCombate();
      if (S.avisos.some((a) => a.clave === 'muerte')) { C.fin = 'caes'; return pintarFinCombate(); }
      // log
      const log = el('div.combate-log');
      C.log.slice(-4).forEach((x) => {
        if (x.t) { log.append(el('div.cl-linea', { html: `${esc(x.t)} ${T.ref(x.r)}` })); return; }
        log.append(el('div.cl-ronda', el('b', `Ronda ${x.ronda} · ${x.man}`), x.tirJ != null ? el('span', { html: `Tú ${x.tirJ} · ${esc(C.en.n)} ${x.tirE}` }) : null, x.lineas.map((l) => el('div.cl-linea', { html: `${esc(l.t)} ${T.ref(l.r)}` }))));
      });
      caja.append(log);
      // modo
      const seg = el('div.segmento');
      [['D', 'Desventaja'], [null, 'Normal'], ['V', 'Ventaja']].forEach(([m, t]) => seg.append(el('button' + (modoJ === m ? '.activo' : ''), { type: 'button', onclick: () => { modoJ = m; pintar(); } }, t)));
      caja.append(el('div.fila-modo', seg, el('span.ayuda-mini', { html: C.ronda === 0 && C.sorpresa ? `Sorpresa: Ventaja y no pueden dañarte en la 1.ª ronda (${T.ref('r144')})` : C.ronda === 0 && C.emboscada ? `Emboscada: Desventaja en la 1.ª ronda (${T.ref('r144')})` : `Tu modo para la próxima tirada (${T.ref('r121')})` })));
      // maniobras
      const m = el('div.maniobras');
      const btn = (k, t, sub, ico) => el('button.maniobra', { type: 'button', onclick: () => ronda(k) }, el('span.m-ico', { html: T.ico(ico) }), el('b', t), el('small', { html: sub }));
      m.append(btn('atacar', 'Atacar', 'La tirada normal', 'combate'), btn('defender', 'Defender', '+2; si ganas, nadie recibe daño', 'escudo'), btn('huir', 'Huir', `Reflejos · 9${C.en.tags.includes('Rápido') ? ' con Desventaja [Rápido]' : ''}`, 'correr'));
      const hab = puedeHablar(S, C.en);
      if (hab) m.append(btn('hablar', 'Hablar', `${hab.attr} · ${hab.dif}`, 'boca'));
      caja.append(m);
      // usar
      const usos = usables(S, C);
      if (usos.length) caja.append(el('div.usar', el('span.et', 'Usar'), usos.map((u) => el('button.btn.mini.secundario', { type: 'button', disabled: !!C.usados[u.id], title: u.d, onclick: () => { u.fn(); C.usados[u.id] = 1; A.guardar(); A.pintarCabecera(); pintar(); } }, u.n))));
      caja.append(el('div.combate-pie', el('button.btn.mini.secundario', { type: 'button', onclick: () => terminarAMano() }, 'Terminar a mano')));
      A.enlazarRefs(caja);
    }
    async function ronda(man) {
      let dJ, dE, extra = { modoJ: man === 'huir' && C.en.tags.includes('Rápido') ? 'D' : modoJ };
      if (man === 'huir' || man === 'hablar') {
        const hab = puedeHablar(S, C.en) || {};
        const sug = man === 'huir' ? A.sugerencias('Reflejos').concat(M.compas(S).includes('Lio') ? [{ t: 'Lio: Ventaja para huir', modo: 'V', r: 'r185' }] : [], M.tiene(S, 'EXILIADO') ? [{ t: 'Exiliado: Ventaja para huir', modo: 'V', r: 'r105' }] : []) : A.sugerencias(hab.attr || 'Voluntad');
        const pr = await A.tirar({ titulo: man === 'huir' ? 'Huir' : 'Hablar', attr: man === 'huir' ? 'Reflejos' : hab.attr, dif: man === 'huir' ? 9 : hab.dif, modo: extra.modoJ, sugerencias: sug, regla: 'r141', cancelable: true });
        if (!pr) return abrir();
        dJ = pr.dados; extra.modoJ = pr.modo; extra.attrHablar = hab.attr; extra.difHablar = hab.dif;
        dE = pr.res === 'fa' && man === 'hablar' ? (await A.tirarDados(`${C.en.n} tira la ronda (+2)`, 2, 'e', { auto: true })).dados : [1, 1];
      } else {
        const nJ = extra.modoJ ? 3 : 2;
        const r = await A.tirar({ titulo: `Ronda ${C.ronda + 1}: ${man === 'atacar' ? 'Atacar' : 'Defender'}`, dados: Array.from({ length: nJ }, () => ({ tipo: 'j' })).concat([{ tipo: 'e' }, { tipo: 'e' }]), regla: 'r140', explicar: `Dados de hueso: tú${nJ === 3 ? ` (3, te quedas los 2 ${extra.modoJ === 'V' ? 'altos' : 'bajos'})` : ''}. Dados de hierro: ${esc(C.en.n)}.` });
        if (!r) return abrir();
        dJ = r.dados.slice(0, nJ); dE = r.dados.slice(nJ);
      }
      A.foto();
      const inf = M.ronda(S, C, man, dJ, dE, extra);
      if (C.ronda >= 1 && (C.sorpresa || C.emboscada)) modoJ = null;
      if (inf.danoPendiente) {
        if (inf.puedeAsignar) {
          const quien = await new Promise((ok) => A.modal('¿Quién recibe el golpe?', el('div.botones-col', el('p', { html: `Recibes ${inf.danoPendiente} Heridas. Puedes asignar 1 a un compañero (${T.ref('r143')}).` }),
            el('button.btn.secundario', { type: 'button', onclick: () => { A.cerrarModal(); ok(null); } }, 'Me lo llevo yo'),
            M.compas(S).map((t) => el('button.btn.secundario', { type: 'button', onclick: () => { A.cerrarModal(); ok(t); } }, `${t} recibe 1 (lleva ${S.tripu[t].heridas}/2)`))), { clase: 'estrecho', cerrable: false }));
          M.aplicarDano(S, C, inf, quien);
          if (inf.compaCae) {
            const d = await A.tirarDados(`${inf.compaCae} cae (1d6)`, 1, 'x', { regla: 'r143', explicar: '1–2: muere. 3–6: fuera de combate hasta que descanses.' });
            M.compaCae(S, inf.compaCae, d ? d.dados[0] : 3);
          }
        } else M.aplicarDano(S, C, inf, null);
      }
      S.escena.combate = C;
      A.guardar();
      A.pintarCabecera();
      abrir(); // la bandeja de dados reemplazó al modal del combate: se vuelve a abrir
    }
    function pintarFinCombate() {
      const L = C.cerrado ? C.cierre : M.terminarCombate(S, C);
      if (!C.cerrado) { C.cerrado = true; C.cierre = L; A.guardar(); A.pintarCabecera(); }
      const TXT = { ganas: '¡Ganas!', huyes: 'Huyes', hablas: 'Se resuelve hablando', caes: 'Caes', pierdes: 'Pierdes' };
      caja.append(el('div.fin-combate.f-' + C.fin, el('h3', TXT[C.fin] || C.fin), el('ul', L.map((x) => el('li', { html: `${esc(x.t)} ${T.ref(x.r)}` })))));
      const bot = el('div.botones');
      const lp = L.find((x) => x.piezas);
      if (lp && !C.piezaHecha) lp.piezas.forEach((p) => bot.append(el('button.btn.secundario', { type: 'button', onclick: () => { M.cambiar(S, 'pieza:' + p, 1, 'botín (r201)'); C.piezaHecha = true; A.guardar(); A.pintarCabecera(); A.aviso(`Botín: +1 ${D.PIEZAS[p]}`); abrir(); } }, `Coger 1 ${D.PIEZAS[p]}`)));
      if (L.some((x) => x.botin) && !C.botinHecho) bot.append(el('button.btn.secundario', { type: 'button', onclick: async () => { const r = await A.tirarDados('Botín (1d6 ÷ 2)', 1, 'x', { regla: 'r146' }); if (!r) return abrir(); const n = Math.ceil(r.dados[0] / 2); M.cambiar(S, 'chatarra', n, 'botín (r146)'); C.botinHecho = true; A.guardar(); A.pintarCabecera(); A.aviso(`Botín: +${n} Chatarra`); abrir(); } }, 'Tirar el botín'));
      bot.append(el('button.btn.primario', { type: 'button', onclick: () => { A.cerrarModal(); if (A.S.escena) A.S.escena.combate = null; alTerminar && alTerminar(C.fin === 'caes' ? 'pierdes' : C.fin); A.render(); } }, C.fin === 'ganas' ? 'Volver al evento: «Si ganas»' : C.fin === 'huyes' ? 'Volver: «Si huyes»' : C.fin === 'hablas' ? 'Volver: «Si hablas»' : 'Volver'));
      caja.append(bot);
      A.enlazarRefs(caja);
    }
    function terminarAMano() {
      const cuerpo = el('div.botones-col', el('p', 'Si el combate acabó por algo que la app no lleva (un evento, una reliquia…), elige cómo terminó:'),
        ['ganas', 'huyes', 'hablas', 'pierdes'].map((f) => el('button.btn.secundario', { type: 'button', onclick: () => { C.fin = f; C.sinBotin = f !== 'ganas'; A.cerrarModal(); abrir(); } }, { ganas: 'Lo vencí', huyes: 'Huí', hablas: 'Se resolvió hablando', pierdes: 'Perdí o me retiré' }[f])));
      A.modal('Terminar el combate', cuerpo, { clase: 'estrecho', alCerrar: abrir });
    }
    function abrir() {
      const m = A.modal(`${T.ico('combate')} Combate ${T.ref('r140')}`, caja, { clase: 'combate-modal', cerrable: false });
      A.enlazarRefs(m);
      pintar();
    }
    S.escena.combate = C;
    abrir();
  };
  function etiqueta(t) {
    return { Máquina: 'Inmune al miedo. La Mente puede Hablar con ella', Bestia: 'No se le puede Hablar (salvo DOMADOR o Lengua de bestias)', Náufrago: 'Gente como tú. Puedes Hablar', Cantor: 'Cada ronda que pierdas, +1 Canto', Antiguo: 'Blindaje +1 contra armas que no sean de los Antiguos', Enjambre: 'Tu daño nunca pasa de 1, salvo con armas ruidosas', Rápido: 'Desventaja para huir', Grande: 'Con 7 o más a su favor, 1 Herida extra' }[t] || '';
  }
  function puedeHablar(S, en) {
    const t = en.tags;
    if (S.habilidades.includes('Voz de la nave')) return { attr: 'Ingenio', dif: 11 };
    if (t.includes('Máquina') && (S.prota === 'mente' || S.rasgos.includes('e704'))) return { attr: 'Ingenio', dif: 11 };
    if (t.includes('Bestia')) { if (M.tiene(S, 'DOMADOR')) return { attr: 'Voluntad', dif: 9 }; if (S.habilidades.includes('Lengua de bestias')) return { attr: 'Voluntad', dif: 11 }; return null; }
    if (t.includes('Náufrago') || t.includes('Cantor')) return { attr: 'Voluntad', dif: 11 };
    return null;
  }
  function usables(S, C) {
    const u = [];
    const gasta = (n, que) => { if (S.energia < n) { A.aviso('No te queda Energía.'); return false; } M.cambiar(S, 'energia', -n, que); return true; };
    if (S.rasgos.includes('e703')) u.push({ id: 'e703', n: 'Reflejos sintéticos (+2)', d: '1 Energía: +2 a esta tirada de combate, una vez', fn: () => { if (gasta(1, 'Reflejos sintéticos')) C.plusSig = 2; } });
    if (S.rasgos.includes('e706')) u.push({ id: 'e706', n: 'Escudo dérmico', d: '1 Energía: Blindaje +1 todo el combate', fn: () => { if (gasta(1, 'Escudo dérmico')) C.escudo = true; } });
    if (S.rasgos.includes('e713') && !C.en.tags.includes('Máquina')) u.push({ id: 'e713', n: 'Nube de esporas', d: 'La siguiente ronda el enemigo no tira (tú contra 7)', fn: () => { C.enemigoNoTira = true; } });
    if (S.rasgos.includes('e729')) u.push({ id: 'e729', n: 'Sobrecarga defensiva', d: '2 Energía: Blindaje +2 durante 2 rondas', fn: () => { if (gasta(2, 'Sobrecarga defensiva')) { C.blExtra = 2; C.blRondas = 2; } } });
    if (S.rasgos.includes('e732') && (C.en.tags.includes('Máquina') || C.en.tags.includes('Cantor'))) u.push({ id: 'e732', n: 'Emisor de interferencia', d: '1 Energía y +1 Canto: el enemigo tira con −3 una ronda', fn: () => { if (gasta(1, 'Emisor de interferencia')) { C.enemigoMenos = 3; M.cambiar(S, 'canto', 1, 'Emisor'); } } });
    if (S.equipo.some((o) => /Trampa de chapa/.test(o)) && C.ronda === 0 && !C.sorpresa && !C.emboscada) u.push({ id: 'trampa', n: 'Colocar la trampa', d: 'El enemigo recibe 1 Herida antes de empezar', fn: () => { C.en.h -= 1; const i = S.equipo.findIndex((o) => /Trampa de chapa/.test(o)); S.equipo.splice(i, 1); } });
    return u;
  }

  /* ================================================================
     MEJORAS (r190) E IDENTIFICAR RELIQUIAS (r193)
     ================================================================ */
  Me.mejora = function () {
    const S = A.S;
    if (S.mejoras <= 0) return;
    const P = M.P(S);
    const HAB = { piloto: ['Sangre fría', 'Mecánico de campaña', 'Líder', 'Tirador', 'Pulmón de hierro', 'Regreso'], nativo: ['Lengua de bestias', 'Paso de duna', 'Piel vieja', 'Raíz', 'Ojo de sal', 'Voz de la tribu'], mente: ['Sobrecarga', 'Copia de seguridad', 'Cortafuegos', 'Taller interno', 'Enjambre de reparación', 'Voz de la nave'] }[S.prota];
    const listo = (txt, fn) => { A.hacer((S) => { fn(S); S.mejoras -= 1; M.log(S, 'Mejora: ' + txt + '.', ['r190']); }); A.cerrarModal(); if (A.S.mejoras > 0) setTimeout(Me.mejora, 150); };
    const cuerpo = el('div.mejora',
      el('p', { html: `Un hito te hace mejor (${T.ref('r190')}). Elige una:` }),
      el('h4', '+1 a un atributo (máximo 6)'),
      el('div.botones-fila', D.ATRIBUTOS.map((a) => el('button.btn.secundario', { type: 'button', disabled: S.attr[a] >= 6, onclick: () => listo(`+1 ${a}`, (S) => S.attr[a]++) }, `${a} ${S.attr[a]} → ${S.attr[a] + 1}`))),
      el('h4', 'Otras'),
      el('div.botones-fila',
        el('button.btn.secundario', { type: 'button', disabled: S.templeMax >= 4, onclick: () => listo('+1 Temple máximo', (S) => { S.templeMax++; S.temple++; }) }, `+1 Temple máximo (${S.templeMax} → ${S.templeMax + 1})`),
        el('button.btn.secundario', { type: 'button', onclick: () => listo(`${S.prota === 'piloto' ? 'una ranura de implante' : S.prota === 'nativo' ? 'una mutación' : 'un protocolo'} (elígela en el Códice y anótala)`, () => {}) }, S.prota === 'piloto' ? 'Una ranura de implante más' : S.prota === 'nativo' ? 'Una mutación del catálogo' : 'Un protocolo más'),
        el('button.btn.secundario', { type: 'button', onclick: () => listo('dos planos a tu elección (cómpralos gratis en el taller o anótalos)', () => {}) }, 'Dos planos (r202)')),
      el('h4', { html: `Una habilidad de ${P.n}` }),
      el('div.habilidades', HAB.map((h) => el('button.hab-btn', { type: 'button', disabled: S.habilidades.includes(h), onclick: () => listo(h, (S) => S.habilidades.push(h)) }, el('b', h), el('small', descHab(h))))),
      el('p.ayuda-mini', 'Puedes cerrar esto y elegir más tarde desde la Hoja.'),
    );
    A.modal(`${T.ico('hito')} Mejora`, cuerpo, { clase: 'ancho' });
    A.enlazarRefs(cuerpo);
  };
  function descHab(h) {
    const t = CB.libro.entradas.r190.md;
    const m = t.match(new RegExp('\\*\\*' + h + ':\\*\\* ([^·|]+)'));
    return m ? m[1].trim() : '';
  }
  Me.identificar = async function (uid) {
    const S = A.S;
    const r = await A.tirar({ titulo: 'Identificar la reliquia', attr: 'Ingenio', dif: 2, regla: 'r193', templeOk: false, explicar: '2d6 + Ingenio: la fila dice qué puede ser. Con 12 o más, eliges.' });
    if (!r) return;
    const total = r.total;
    const fila = M.filaReliquia(total);
    let opciones = D.IDENT_RELIQUIA[fila].slice(1);
    let id;
    const ya = new Set(S.reliquias.map((x) => x.id).filter(Boolean));
    const elegir = (filas, txt) => {
      const ops = filas.filter((i) => i >= 0 && i < D.IDENT_RELIQUIA.length).flatMap((i) => D.IDENT_RELIQUIA[i].slice(1)).filter((x) => !ya.has(x));
      return new Promise((ok) => A.modal('Eliges tu reliquia', el('div.botones-col', el('p', { html: `${txt} (${T.ref('r193')}).` }), ops.map((x) => el('button.btn.secundario', { type: 'button', onclick: () => { A.cerrarModal(); ok(x); } }, `${x} · ${CB.libro.titulo(x)}`))), { clase: 'estrecho', cerrable: false }));
    };
    if (total >= 12) {
      id = await elegir([fila - 1, fila, fila + 1], `Sacaste ${total}: eliges cualquiera de tu fila o de una vecina`);
    } else if (opciones.every((x) => ya.has(x))) {
      id = await elegir([fila - 1, fila + 1], 'Ya tienes las dos reliquias de tu fila: eliges una de una fila vecina');
    } else {
      const d = await A.tirarDados('¿Cuál de las dos? (1d6)', 1, 'x', { regla: 'r193', explicar: `1–3: ${CB.libro.titulo(opciones[0])}. 4–6: ${CB.libro.titulo(opciones[1])}.` });
      id = opciones[(d ? d.dados[0] : 1) <= 3 ? 0 : 1];
      if (ya.has(id)) id = opciones.find((x) => x !== id);
    }
    A.hacer((S) => M.identificar(S, uid, id));
    A.abrirCodice(id);
  };

  /* ================================================================
     FIN DE LA PARTIDA
     ================================================================ */
  function pintarFin(cont, S) {
    const aBordo = Object.keys(S.tripu).filter((t) => ['contigo', 'cicatriz'].includes(S.tripu[t].estado));
    const exito = ['e903', 'e910', 'e911', 'e916', 'e917', 'e918'].includes(S.fin);
    const p = M.puntuacion(S, exito ? aBordo : []);
    cont.append(el('section.fin-partida' + (exito ? '.exito' : ''),
      el('div.fin-arte', { style: { backgroundImage: `url(arte/${exito ? 'r-despegue' : 'r-recolectores'}.jpg)` } }),
      el('div.fin-cuerpo',
        el('div.fase-sobre', `Día ${S.dia} · ${M.P(S).N}`),
        el('h1', CB.libro.titulo(S.fin)),
        el('p', exito ? `La ${S.nave} deja atrás Caribdis.` : `La ${S.nave} se queda en Caribdis.`),
        el('div.puntos', el('h3', { html: `Puntuación ${T.ref('r196')}` }), el('table', el('tbody',
          el('tr', el('td', `Tripulantes a bordo (${exito ? aBordo.length : 0} × 3)`), el('td', String(p.tripu))),
          el('tr', el('td', 'Sistemas Excelentes (× 2)'), el('td', String(p.exc))),
          el('tr', el('td', 'Días en el Reloj'), el('td', String(p.dias))),
          el('tr', el('td', 'FRAGMENTO_'), el('td', String(p.frag))),
          el('tr', el('td', 'El Secreto'), el('td', String(p.secreto))),
          el('tr.total', el('td', 'Total'), el('td', String(p.total)))))),
        el('div.botones', el('button.btn.primario', { type: 'button', onclick: () => CB.crear.nueva() }, 'Nueva partida'), el('button.btn.secundario', { type: 'button', onclick: () => A.irVista('bitacora') }, 'Ver la bitácora'), el('button.btn.secundario', { type: 'button', onclick: () => A.hacer((S) => { S.fin = null; }) }, 'Volver al último evento')),
        el('p.ayuda-mini', { html: `Si tu nave no despegó, sigue en Caribdis: en la próxima partida puedes encontrarla (${T.ref('r212')}).` }))));
  }
})();
