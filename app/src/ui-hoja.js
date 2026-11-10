/* =====================================================================
   CARIBDIS · interfaz: la Hoja
   Hoja de protagonista, de la nave, tripulación, mochila, Marcas y
   Pistas, y el mapa de Caribdis. Todo se puede corregir a mano: la app
   ayuda, pero quien manda es el libro (y tú).
   ===================================================================== */
'use strict';
(function () {
  const { esc } = CB.u;
  const el = CB.el;
  const D = CB.D, M = CB.motor, T = CB.texto, A = CB.app;
  const H = (CB.hoja = { pestana: 'prota' });

  const PESTANAS = [['prota', 'persona', 'Protagonista'], ['nave', 'nave', 'Nave'], ['tripu', 'grupo', 'Tripulación'], ['mochila', 'mochila', 'Mochila'], ['marcas', 'marca', 'Marcas']];

  H.pintar = function (cont) {
    const S = A.S;
    cont.innerHTML = '';
    const tabs = el('div.hoja-tabs', { role: 'tablist' }, PESTANAS.map(([k, ico, t]) => el('button' + (H.pestana === k ? '.activo' : ''), { type: 'button', role: 'tab', 'aria-selected': H.pestana === k ? 'true' : 'false', onclick: () => { H.pestana = k; H.pintar(cont); A.enlazarRefs(cont); }, title: t, html: `${T.ico(ico)}<span>${t}</span>` })));
    const cuerpo = el('div.hoja-cuerpo');
    cont.append(tabs, cuerpo);
    ({ prota, nave, tripu, mochila, marcas })[H.pestana](cuerpo, S);
    A.enlazarRefs(cont);
  };

  /* ---------- piezas reutilizables ---------- */
  function ajuste(k, etiqueta, valor, { regla, max, min = 0, ico } = {}) {
    const menos = el('button.aj', { type: 'button', 'aria-label': 'Restar 1 a ' + etiqueta, onclick: () => A.hacer((S) => M.cambiar(S, k, -1, 'ajuste a mano')) }, '−');
    const mas = el('button.aj', { type: 'button', 'aria-label': 'Sumar 1 a ' + etiqueta, onclick: () => A.hacer((S) => M.cambiar(S, k, 1, 'ajuste a mano')) }, '+');
    return el('div.registro', el('span.reg-et', { html: `${ico ? T.ico(ico) : ''}${etiqueta}${regla ? ' ' + T.ref(regla) : ''}` }), el('span.reg-ctl', menos, el('b.reg-v', String(valor), max != null ? el('small', '/' + max) : null), mas));
  }
  // el innerHTML de <b> con <small>
  const fixHTML = (n) => n;

  /* ---------- protagonista ---------- */
  function prota(c, S) {
    const P = M.P(S);
    c.append(el('div.ficha-cab',
      el('img.retrato', { src: `arte/${P.arte}.jpg`, alt: '', loading: 'lazy' }),
      el('div', el('div.ficha-n', S.nombre), el('div.ficha-sub', { html: `${P.N} · ${esc(S.origen[0])} · ${T.ref(P.regla)}` }), el('div.ficha-nave', { html: `${T.ico('nave')} ${esc(S.nave)}` }))));
    // atributos
    const at = el('div.atributos');
    for (const a of D.ATRIBUTOS) {
      const ef = M.atributo(S, a);
      at.append(el('div.atr', { title: D.ATR_USO[a] }, el('span.atr-n', a), el('b.atr-v', String(S.attr[a])), ef.total !== S.attr[a] ? el('span.atr-ef', { title: ef.partes.map((p) => `${p.t} ${CB.u.firma(p.v)}`).join(', ') }, `efectivo ${ef.total}`) : el('span.atr-ef.vacio', D.ATR_USO[a].split(',')[0])));
    }
    c.append(el('h4.hoja-sec', { html: `Atributos ${T.ref('r101')}` }), at);
    // heridas
    const her = el('div.pista-heridas');
    for (let i = 1; i <= S.nivelesHerida; i++) {
      const n = D.NIVELES_HERIDA[Math.min(i, 4)];
      her.append(el('button.her' + (i <= S.heridas ? '.on' : ''), { type: 'button', title: `${n}${D.PEN_HERIDA[Math.min(i, 4)] ? ' (' + D.PEN_HERIDA[Math.min(i, 4)] + ' a todo)' : ''}`, onclick: () => A.hacer((S) => { const d = (i <= S.heridas ? i - 1 : i) - S.heridas; if (d > 0) M.herir(S, d, 'ajuste a mano'); else M.curar(S, -d, 'ajuste a mano'); }) }, el('span', n), D.PEN_HERIDA[Math.min(i, 4)] ? el('small', String(D.PEN_HERIDA[Math.min(i, 4)])) : null));
    }
    c.append(el('h4.hoja-sec', { html: `${S.prota === 'mente' ? 'Daño' : 'Heridas'} ${T.ref('r106')} <small>· Blindaje ${M.blindaje(S)}</small>` }), her);
    // recursos
    const rec = el('div.registros');
    if (S.prota === 'piloto') rec.append(ajuste('aire', 'Aire', S.aire, { regla: 'r136', max: 6 }));
    if (S.prota !== 'mente') rec.append(ajuste('raciones', 'Raciones', S.raciones, { regla: 'r136', max: 8 }));
    if (S.prota !== 'nativo' || S.energia) rec.append(ajuste('energia', 'Energía', S.energia, { regla: 'r136', max: 6 }));
    rec.append(ajuste('chatarra', 'Chatarra', S.chatarra, { regla: 'r161', ico: 'objeto' }));
    rec.append(ajuste('temple', 'Temple', S.temple, { regla: 'r122', max: S.templeMax }));
    rec.append(ajuste('canto', 'Canto', S.canto, { regla: 'r137', max: 6, ico: 'canto' }));
    rec.append(ajuste('alerta', 'Alerta', S.alerta, { regla: 'r135', max: 4, ico: 'alerta' }));
    rec.append(ajuste('contador', P.contador.n.charAt(0) + P.contador.n.slice(1).toLowerCase(), S.contador, { regla: P.regla, max: 6 }));
    if (S.reloj != null) rec.append(ajuste('reloj', 'Reloj', S.reloj, { regla: 'r134', ico: 'tiempo' }));
    c.append(el('h4.hoja-sec', { html: `Recursos ${T.ref('r106')}` }), fixHTML(rec));
    // reputación
    const rep = el('div.reputacion');
    for (const f in D.FACCIONES) {
      const v = S.rep[f];
      const barra = el('div.rep-barra');
      for (let i = -3; i <= 3; i++) barra.append(el('i' + (i === 0 ? '.cero' : '') + ((v > 0 && i > 0 && i <= v) || (v < 0 && i < 0 && i >= v) ? (v > 0 ? '.pos' : '.neg') : '')));
      rep.append(el('div.rep', el('span.rep-emb', { html: `<svg viewBox="0 0 48 48">${CB.libro.emblemas[f]}</svg>` }), el('span.rep-n', D.FACCIONES[f].n), barra, el('span.rep-ctl', el('button.aj', { type: 'button', 'aria-label': 'Bajar reputación', onclick: () => A.hacer((S) => M.cambiar(S, 'rep:' + f, -1, 'ajuste a mano', { sinRival: true })) }, '−'), el('b', CB.u.firma(v)), el('button.aj', { type: 'button', 'aria-label': 'Subir reputación', onclick: () => A.hacer((S) => M.cambiar(S, 'rep:' + f, 1, 'ajuste a mano', { sinRival: true })) }, '+'))));
    }
    c.append(el('h4.hoja-sec', { html: `Reputación ${T.ref('r194')}` }), rep, el('p.rep-rivales', { html: 'Enemistades: subir con una baja 1 con su rival. <b>Hijos ⇄ Coro</b> · <b>Desguaces ⇄ Vigías</b>' }));
    // rasgos y habilidades
    const ras = el('div.lista-rasgos');
    S.rasgos.forEach((id) => ras.append(el('button.rasgo', { type: 'button', onclick: () => A.abrirCodice(id) }, el('b', CB.libro.titulo(id).replace(/^\d+ · /, '')), el('small', id))));
    ras.append(el('div.rasgo.origen', el('b', S.origen[0]), el('small', S.origen[1])));
    S.habilidades.forEach((h) => ras.append(el('div.rasgo.hab', el('b', h), el('small', 'habilidad (r190)'))));
    c.append(el('h4.hoja-sec', { html: `${P.rasgos.n}, origen y habilidades ${T.ref('r105')}` }), ras);
    if (S.mejoras > 0) c.append(el('button.btn.primario.ancho', { type: 'button', onclick: () => CB.mesa.mejora() }, `Elegir mejora (${S.mejoras} pendiente${S.mejoras > 1 ? 's' : ''})`));
  }

  /* ---------- nave ---------- */
  function nave(c, S) {
    c.append(el('div.ficha-cab.nave-cab', el('div', el('div.ficha-n', S.nave), el('div.ficha-sub', { html: `Hoja de la nave · ${T.ref('r180')}` }))));
    const lista = el('div.sistemas');
    const ESTADO = { perdido: 'Perdido', llevado: 'Lo llevas', instalado: 'Instalado', oculto: 'Por descubrir' };
    for (const s of [...D.SISTEMAS, 'Personal']) {
      const sis = S.sistemas[s];
      const nombre = s === 'Personal' ? sis.n : s;
      const donde = sis.region ? `Pecio en ${D.REGIONES[sis.region].corto}` : s === 'Personal' ? 'Tu historia personal' : '';
      const cal = sis.cal ? el('span.cal.c-' + CB.u.norm(sis.cal), sis.cal) : null;
      const fila = el('div.sistema.s-' + sis.estado,
        el('div.sis-ico', { html: T.ico(sis.estado === 'instalado' ? 'check' : 'nave') }),
        el('div.sis-n', el('b', nombre), el('small', [ESTADO[sis.estado], donde ? ' · ' + donde : '', D.PESADOS.includes(s) ? ' · pesado' : ''].join(''))),
        cal,
        el('select.sis-sel', { 'aria-label': 'Estado de ' + nombre, onchange: (e) => A.hacer((S) => { const [est, ca] = e.target.value.split('|'); S.sistemas[s].estado = est; S.sistemas[s].cal = ca || null; M.log(S, `${nombre}: ${ESTADO[est]}${ca ? ' (' + ca + ')' : ''} · ajuste a mano`, ['r180']); }) },
          ['perdido|', 'llevado|Precaria', 'llevado|Sólida', 'llevado|Excelente', 'instalado|Precaria', 'instalado|Sólida', 'instalado|Excelente'].concat(s === 'Personal' ? ['oculto|'] : []).map((v) => {
            const [est, ca] = v.split('|');
            return el('option', { value: v, selected: sis.estado === est && (sis.cal || '') === ca ? true : null }, ESTADO[est] + (ca ? ' · ' + ca : ''));
          })),
      );
      lista.append(fila);
    }
    const n = M.instalados(S).length;
    c.append(el('div.progreso-nave', el('div.pn-barra', el('i', { style: { width: (n / 6) * 100 + '%' } })), el('span', { html: `<b>${n}/6</b> sistemas instalados · el despegue es ${T.ref('e900')}` })));
    c.append(lista);
    c.append(el('h4.hoja-sec', { html: `La Cicatriz ${T.ref('r182')}` }), fixHTML(el('div.registros', ajuste('despensa', 'Despensa', S.despensa, { regla: 'r182' }))));
    c.append(el('p.ayuda-mini', { html: `Cada pecio que anotaste al preparar la partida es un <b>Hallazgo</b> (${T.ref('r108')}): explora esa región (${T.ref('r153')}) para encontrarlo. Precaria = prueba Dura (11) al despegar, Sólida = 9, Excelente = 7.` }));
  }

  /* ---------- tripulación ---------- */
  function tripu(c, S) {
    c.append(el('p.ayuda-mini', { html: `Puedes llevar 2 compañeros (${T.ref('r185')}). Cada uno suma +1 al Ataque y aguanta 2 Heridas (${T.ref('r143')}). Lealtad 0 = se va; 3 = su evento (${T.ref('r186')}).` }));
    const ESTADO = { perdido: 'Perdido en Caribdis', contigo: 'Va contigo', cicatriz: 'Espera en la Cicatriz', fuera: 'Fuera de combate', muerto: 'Muerto', perdida: 'Se fue', encontrado: 'Encontrado' };
    for (const t in D.TRIPULACION) {
      const TT = D.TRIPULACION[t], st = S.tripu[t];
      const leal = el('span.leal', Array.from({ length: 3 }, (_, i) => el('i' + (i < st.lealtad ? '.on' : ''))));
      const sel = el('select', { 'aria-label': 'Estado de ' + t, onchange: (e) => A.hacer((S) => { S.tripu[t].estado = e.target.value; if (e.target.value !== 'perdido') S.tripu[t].region = null; M.log(S, `${TT.n}: ${ESTADO[e.target.value]} · ajuste a mano`, ['r185']); }) },
        Object.keys(ESTADO).filter((k) => k !== 'encontrado').map((k) => el('option', { value: k, selected: st.estado === k ? true : null }, ESTADO[k])));
      c.append(el('div.tripulante.t-' + st.estado,
        el('img.mini', { src: `arte/${TT.arte}.jpg`, alt: '', loading: 'lazy' }),
        el('div.tri-cuerpo',
          el('div.tri-n', el('b', TT.n), el('small', TT.rol)),
          el('div.tri-hab', TT.hab),
          el('div.tri-pie', sel, st.estado === 'perdido' && st.region ? el('span.tri-donde', { html: `${T.ico('mapa')} ${D.REGIONES[st.region].corto}` }) : null,
            ['contigo', 'cicatriz', 'fuera'].includes(st.estado) ? el('span.tri-leal', 'Lealtad ', leal, el('button.aj', { type: 'button', 'aria-label': 'Bajar lealtad', onclick: () => A.hacer((S) => M.lealtad(S, t, -1)) }, '−'), el('button.aj', { type: 'button', 'aria-label': 'Subir lealtad', onclick: () => A.hacer((S) => M.lealtad(S, t, 1)) }, '+')) : null,
            st.estado === 'contigo' && st.heridas ? el('span.tri-her', `${st.heridas}/2 Heridas`) : null),
          el('div.tri-evs', { html: `Primer evento ${T.ref(TT.ev)} · lealtad ${T.ref(TT.leal)}` }))));
    }
  }

  /* ---------- mochila ---------- */
  function mochila(c, S) {
    const arma = M.arma(S);
    const selArma = el('select', { 'aria-label': 'Arma', onchange: (e) => A.hacer((S) => { if (S.arma !== 'Puños') S.equipo.push(S.arma); S.arma = e.target.value; const i = S.equipo.indexOf(e.target.value); if (i >= 0) S.equipo.splice(i, 1); M.log(S, `Empuñas: ${S.arma}.`, ['r107']); }) },
      ['Puños', ...new Set([S.arma, ...S.equipo.filter((x) => D.ARMAS[x])])].map((a) => el('option', { value: a, selected: a === S.arma ? true : null }, a)));
    const selProt = el('select', { 'aria-label': 'Protección', onchange: (e) => A.hacer((S) => { if (!['Traje de vuelo', 'Chasis'].includes(S.proteccion)) S.equipo.push(S.proteccion); S.proteccion = e.target.value; const i = S.equipo.indexOf(e.target.value); if (i >= 0) S.equipo.splice(i, 1); M.log(S, `Te pones: ${S.proteccion}.`, ['r107']); }) },
      [...new Set([S.prota === 'mente' ? 'Chasis' : 'Traje de vuelo', S.proteccion, ...S.equipo.filter((x) => D.PROTECCIONES[x])])].map((a) => el('option', { value: a, selected: a === S.proteccion ? true : null }, a)));
    c.append(el('h4.hoja-sec', { html: `Arma y protección ${T.ref('r107')}` }),
      el('div.equipo-fila', el('span', 'Arma'), selArma, el('small', `+${arma.atk} · ${arma.dist ? 'distancia (Reflejos)' : 'cuerpo a cuerpo (Vigor)'}${arma.ruidosa ? ' · ruidosa' : ''}${arma.silenciosa ? ' · silenciosa' : ''}`)),
      el('div.equipo-fila', el('span', 'Protección'), selProt, el('small', `Blindaje total ${M.blindaje(S)}`)));
    // objetos
    const lista = el('div.objetos');
    S.equipo.forEach((o, i) => lista.append(el('div.objeto', el('span', o), el('button.btn-icono.peq', { type: 'button', 'aria-label': 'Quitar ' + o, onclick: () => A.hacer((S) => { S.equipo.splice(i, 1); M.log(S, `Gastas o pierdes: ${o}.`, ['r106']); }), html: T.ico('cerrar') }))));
    const inp = el('input#nuevo-obj', { type: 'text', placeholder: 'Añadir objeto (botiquín, cuerda…)', list: 'objetos-conocidos' });
    const datalist = el('datalist#objetos-conocidos', [...Object.keys(D.ARMAS), ...Object.keys(D.PROTECCIONES), ...D.TIENDA.map((x) => x[0])].map((o) => el('option', { value: o })));
    const add = () => { const v = inp.value.trim(); if (!v) return; A.hacer((S) => M.objeto(S, v)); };
    c.append(el('h4.hoja-sec', { html: `Equipo ${T.ref('r106')}` }), lista, el('div.anadir', inp, datalist, el('button.btn.secundario', { type: 'button', onclick: add }, 'Añadir')));
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') add(); });
    // reliquias
    const rel = el('div.reliquias');
    S.reliquias.forEach((r) => rel.append(el('div.reliquia' + (r.id ? '.ident' : ''),
      el('span.rel-ico', { html: T.ico('reliquia') }),
      el('div', el('b', r.id ? CB.libro.titulo(r.id) : 'Sin identificar'), el('small', r.aspecto)),
      r.id ? el('button.btn.mini', { type: 'button', onclick: () => A.abrirCodice(r.id) }, 'Leer') : el('button.btn.mini', { type: 'button', onclick: () => CB.mesa.identificar(r.uid) }, 'Usar e identificar'),
      el('button.btn-icono.peq', { type: 'button', 'aria-label': 'Quitar reliquia', onclick: () => A.hacer((S) => { S.reliquias = S.reliquias.filter((x) => x.uid !== r.uid); M.log(S, 'Dejas o pierdes una reliquia.', ['r193']); }), html: T.ico('cerrar') }))));
    c.append(el('h4.hoja-sec', { html: `Reliquias <small>${S.reliquias.length}/6</small> ${T.ref('r193')}` }), S.reliquias.length ? rel : el('p.vacio', 'Ninguna todavía. Se encuentran en pecios y ruinas.'),
      el('button.btn.mini.secundario', { type: 'button', onclick: () => A.hacer((S) => A.notas(M.reliquia(S).notas)) }, '+ Reliquia sin identificar'));
    // piezas y planos
    const pz = el('div.registros.piezas');
    for (const p in D.PIEZAS) pz.append(ajuste('pieza:' + p, D.PIEZAS[p], S.piezas[p]));
    const total = Object.values(S.piezas).reduce((a, b) => a + b, 0);
    c.append(el('h4.hoja-sec', { html: `Piezas <small>${total}/10 fuera de la Cicatriz</small> ${T.ref('r201')}` }), pz);
    c.append(el('h4.hoja-sec', { html: `Planos ${T.ref('r202')}` }), el('div.lista-rasgos', S.planos.map((id) => el('button.rasgo', { type: 'button', onclick: () => A.abrirCodice(id) }, el('b', CB.libro.titulo(id)), el('small', id)))));
  }

  /* ---------- marcas y pistas ---------- */
  function marcas(c, S) {
    c.append(el('h4.hoja-sec', { html: `Pistas <small>${S.pistas.length}/5</small> ${T.ref('r192')}` }));
    if (!S.pistas.length) c.append(el('p.vacio', 'Sin Pistas. Se ganan con rumores y eventos.'));
    S.pistas.forEach((p, i) => c.append(el('div.pista' + (p.region === S.region ? '.aqui' : ''),
      el('span.pi-ico', { html: T.ico('pista') }),
      el('div', el('b', p.nombre), el('small', { html: `${D.REGIONES[p.region] ? D.REGIONES[p.region].corto : p.region} · ${T.ref(p.ev)}${p.region === S.region ? ' · <em>estás aquí</em>' : ''}` })),
      el('button.btn-icono.peq', { type: 'button', 'aria-label': 'Borrar Pista', onclick: () => A.hacer((S) => { S.pistas.splice(i, 1); M.log(S, `Borras la Pista «${p.nombre}».`, ['r192']); }), html: T.ico('cerrar') }))));
    c.append(el('h4.hoja-sec', { html: `Marcas ${T.ref('r191')} <small>· ${M.cuentaFragmentos(S)}/3 FRAGMENTO_</small>` }));
    const lista = el('div.marcas-lista');
    S.marcas.forEach((m) => lista.append(el('span.marca-chip', el('a.marca', { href: '#marca-' + m, onclick: (e) => { e.preventDefault(); A.cod.filtro = 'marcas'; A.cod.q = m; A.cod.id = null; A.abrirCodice(); } }, m), el('button', { type: 'button', 'aria-label': 'Borrar ' + m, onclick: () => A.hacer((S) => M.marcar(S, m, false, 'a mano')) }, '×'))));
    c.append(lista);
    const inp = el('input', { type: 'text', placeholder: 'NUEVA_MARCA', list: 'marcas-conocidas', 'aria-label': 'Anotar una Marca' });
    const dl = el('datalist#marcas-conocidas', Object.keys(CB.libro.marcas).map((m) => el('option', { value: m })));
    const add = () => { const v = inp.value.trim().toUpperCase().replace(/\s+/g, '_'); if (v) A.hacer((S) => M.marcar(S, v, true, 'a mano')); };
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') add(); });
    c.append(el('div.anadir', inp, dl, el('button.btn.secundario', { type: 'button', onclick: add }, 'Anotar')));
    // viejos conocidos
    c.append(el('h4.hoja-sec', { html: `Viejos conocidos ${T.ref('r156')}` }));
    for (const k in D.CONOCIDOS) {
      const C = D.CONOCIDOS[k], i = S.conocidos[k];
      c.append(el('div.conocido', el('b', C.n), el('span', i < 0 ? 'Tachado' : i >= 4 ? 'Historia terminada' : { html: `Siguiente: ${T.ref(C.evs[i])}` }), el('small', i >= 0 ? `${Math.min(i, 4)}/4` : '')));
    }
  }

  /* ---------- mapa ---------- */
  /**
   * opts: {elegibles:[ids], alElegir:fn, compacto}
   */
  H.mapa = function (S, opts = {}) {
    const W = 100, Hh = 96;
    const P = D.MAPA_POS;
    let svg = `<svg class="mapa-svg" viewBox="-6 -4 ${W + 12} ${Hh + 6}" role="img" aria-label="Mapa de Caribdis">`;
    svg += `<defs><radialGradient id="mp-halo"><stop offset="0" stop-color="var(--oxido-2)" stop-opacity=".55"/><stop offset="1" stop-color="var(--oxido-2)" stop-opacity="0"/></radialGradient></defs>`;
    const hechas = new Set();
    for (const a in D.REGIONES) for (const b of D.REGIONES[a].vec) {
      const k = [a, b].sort().join('-');
      if (hechas.has(k)) continue;
      hechas.add(k);
      const activa = opts.elegibles && ((+a === S.region && opts.elegibles.includes(b)) || (b === S.region && opts.elegibles.includes(+a)));
      svg += `<line x1="${P[a][0]}" y1="${P[a][1]}" x2="${P[b][0]}" y2="${P[b][1]}" class="mp-ruta${activa ? ' activa' : ''}"/>`;
    }
    for (const r in D.REGIONES) {
      const R = D.REGIONES[r];
      const [x, y] = P[r];
      const aqui = +r === S.region;
      const eleg = opts.elegibles && opts.elegibles.includes(+r);
      const sis = D.SISTEMAS.filter((s) => S.sistemas[s].region === +r && S.sistemas[s].estado === 'perdido');
      const tri = Object.keys(S.tripu).filter((t) => S.tripu[t].region === +r && S.tripu[t].estado === 'perdido');
      const pis = S.pistas.filter((p) => p.region === +r);
      svg += `<g class="mp-reg${aqui ? ' aqui' : ''}${eleg ? ' elegible' : ''}" data-region="${r}" ${eleg ? 'tabindex="0" role="button"' : ''} aria-label="${R.n}${aqui ? ', estás aquí' : ''}">`;
      if (aqui) svg += `<circle cx="${x}" cy="${y}" r="11" fill="url(#mp-halo)" class="mp-halo"/>`;
      svg += `<circle cx="${x}" cy="${y}" r="5.6" class="mp-nodo"/><text x="${x}" y="${y + 1.9}" class="mp-num">${r}</text>`;
      svg += `<text x="${x}" y="${y + 10}" class="mp-n">${R.corto}${+r === 1 ? ' · Cicatriz' : ''}</text>`;
      // marcadores
      const marcas = [...sis.map((s) => ['s', s[0]]), ...tri.map((t) => ['t', t[0]]), ...pis.map(() => ['p', '?'])];
      marcas.slice(0, 5).forEach(([k, l], i) => {
        const mx = x - ((Math.min(5, marcas.length) - 1) * 4.2) / 2 + i * 4.2, my = y - 9.5;
        svg += `<g class="mp-m mp-${k}"><circle cx="${mx}" cy="${my}" r="2"/><text x="${mx}" y="${my + 0.85}">${l}</text></g>`;
      });
      svg += `</g>`;
    }
    svg += '</svg>';
    const cont = el('div.mapa' + (opts.compacto ? '.compacto' : ''), { html: svg });
    const ley = el('div.mapa-ley', { html: `<span><i class="l-s"></i>Sistema</span><span><i class="l-t"></i>Tripulante</span><span><i class="l-p"></i>Pista</span>` });
    cont.append(ley);
    if (opts.alElegir) {
      cont.querySelectorAll('.mp-reg.elegible').forEach((g) => {
        const f = () => opts.alElegir(+g.dataset.region);
        g.addEventListener('click', f);
        g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f(); } });
      });
    }
    return cont;
  };
  H.pintarMapaVista = function (cont) {
    const S = A.S;
    cont.innerHTML = '';
    cont.append(el('div.panel-cab', el('h2', { html: `${T.ico('mapa')} Caribdis` }), el('p.sub', { html: `Ocho regiones. Viajar te lleva a una vecina (${T.ref('r150')}).` })), H.mapa(S));
    const tabla = el('div.regiones-lista');
    for (const r in D.REGIONES) {
      const R = D.REGIONES[r];
      const hall = [...D.SISTEMAS.filter((s) => S.sistemas[s].region === +r && S.sistemas[s].estado === 'perdido'), ...Object.keys(S.tripu).filter((t) => S.tripu[t].region === +r && S.tripu[t].estado === 'perdido')];
      tabla.append(el('div.reg-fila' + (+r === S.region ? '.aqui' : ''),
        el('span.d-arte', { style: { backgroundImage: `url(arte/${R.arte}.jpg)` } }),
        el('div',
          el('b', `${r} · ${R.n}`, +r === S.region ? el('small.aqui-et', ' · estás aquí') : null),
          el('small', { html: `${T.ico('asentamiento')} ${R.asent || 'Sin asentamiento (' + R.lugar + ')'}${R.ev ? ' ' + T.ref(R.ev) : ''} · vecinas ${R.vec.join(', ')} · encuentros ${T.ref(R.tabla)}` }),
          hall.length ? el('small.reg-hall', `Hallazgos: ${hall.join(', ')}`) : null)));
    }
    cont.append(tabla);
    A.enlazarRefs(cont);
  };
})();
