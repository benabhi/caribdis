/* =====================================================================
   CARIBDIS · interfaz: núcleo
   Estado de la app, guardado, deshacer, cabecera con los relojes,
   navegación, Códice (lector y buscador), Bitácora, Guía y la bandeja
   de dados donde se resuelven todas las tiradas.
   ===================================================================== */
'use strict';
(function () {
  const { esc, norm, clamp } = CB.u;
  const el = CB.el;
  const D = CB.D, M = CB.motor, T = CB.texto;
  const A = (CB.app = {
    S: null,
    aj: Object.assign({ guia: true, manual: false, sonido: true, vistos: {} }, CB.guardado.leer(CB.guardado.AJUSTES) || {}),
    deshacer: [],
    vista: 'mesa',
    cod: { abierto: false, id: null, q: '', filtro: 'todo', historial: [] },
  });

  /* ---------- libro ---------- */
  CB.libro.titulo = (id) => (CB.libro.entradas[id] ? CB.libro.entradas[id].titulo : id);
  // quién enlaza a quién (para "Aparece en")
  CB.libro.entrantes = {};
  for (const id of CB.libro.orden) {
    const md = CB.libro.entradas[id].md;
    for (const m of md.matchAll(/\b([re]\d{3})\b/g)) {
      if (m[1] === id) continue;
      (CB.libro.entrantes[m[1]] = CB.libro.entrantes[m[1]] || new Set()).add(id);
    }
  }
  const indice = CB.libro.orden.map((id) => {
    const e = CB.libro.entradas[id];
    return { id, t: norm(e.titulo), x: norm(T.plano(e.md)), e };
  });

  /* ---------- guardado y deshacer ---------- */
  A.guardar = function () {
    if (A.S && !CB.guardado.guardarPartida(A.S) && !A._avisoLleno) { A._avisoLleno = 1; A.aviso('No queda espacio para guardar en este navegador. Exporta la partida a un archivo desde el menú, o borra partidas viejas.', 'regla'); }
    CB.guardado.escribir(CB.guardado.AJUSTES, A.aj);
  };
  A.foto = function () {
    if (!A.S) return;
    A.deshacer.push(JSON.stringify(A.S));
    if (A.deshacer.length > 40) A.deshacer.shift();
  };
  A.deshacerUno = function () {
    const f = A.deshacer.pop();
    if (!f) return A.aviso('No hay nada que deshacer.');
    A.S = JSON.parse(f);
    A.guardar();
    A.render();
    A.aviso('Deshecho.');
  };
  /** envuelve un cambio: foto → cambio → guardar → pintar */
  A.hacer = function (fn, { foto = true, pintar = true } = {}) {
    if (foto) A.foto();
    const r = fn(A.S);
    A.guardar();
    if (pintar) A.render();
    return r;
  };
  A.visto = function (k) {
    if (A.aj.vistos[k]) return true;
    A.aj.vistos[k] = 1;
    A.guardar();
    return false;
  };

  /* ---------- avisos breves ---------- */
  // definición breve junto al término tocado
  A.glosa = function (b) {
    document.querySelectorAll('.glosa-pop').forEach((x) => x.remove());
    const pop = el('div.glosa-pop', { role: 'note', html: T.inline(T.GLOSARIO[b.dataset.glosa].replace(/<b>|<\/b>/g, '**'), {}) });
    pop.querySelectorAll('.ref').forEach(enlazarRef);
    document.body.append(pop);
    const r = b.getBoundingClientRect(), w = Math.min(320, innerWidth - 32);
    pop.style.width = w + 'px';
    pop.style.left = Math.max(16, Math.min(innerWidth - w - 16, r.left)) + 'px';
    const arriba = r.bottom + pop.offsetHeight + 12 > innerHeight;
    pop.style.top = (arriba ? r.top - pop.offsetHeight - 8 : r.bottom + 8) + 'px';
    setTimeout(() => document.addEventListener('click', function f(ev) { if (!pop.contains(ev.target)) { pop.remove(); document.removeEventListener('click', f, true); } }, true), 0);
  };
  A.aviso = function (txt, tipo = '') {
    const caja = document.getElementById('avisos') || document.body.appendChild(el('div#avisos'));
    const n = el('div.aviso' + (tipo ? '.' + tipo : ''), { html: txt });
    caja.append(n);
    setTimeout(() => n.classList.add("sale"), txt.length > 120 ? 6000 : 3200);
    setTimeout(() => n.remove(), txt.length > 120 ? 6600 : 3800);
  };
  A.notas = (notas) => (notas || []).forEach((n) => A.aviso(T.inline(n, {}), 'regla'));

  /* ---------- modal ---------- */
  A.modal = function (titulo, cuerpo, { clase = '', cerrable = true, alCerrar } = {}) {
    A.cerrarModal();
    const fondo = el('div.modal-fondo#modal');
    const caja = el('div.modal' + (clase ? '.' + clase : ''), { role: 'dialog', 'aria-modal': 'true', 'aria-label': titulo.replace(/<[^>]+>/g, '') });
    const cab = el('div.modal-cab', el('h2', { html: titulo }));
    if (cerrable) cab.append(el('button.btn-icono', { 'aria-label': 'Cerrar', onclick: () => { A.cerrarModal(); alCerrar && alCerrar(); }, html: T.ico('cerrar') }));
    caja.append(cab, el('div.modal-cuerpo', cuerpo));
    fondo.append(caja);
    if (cerrable) fondo.addEventListener('click', (e) => { if (e.target === fondo) { A.cerrarModal(); alCerrar && alCerrar(); } });
    document.body.append(fondo);
    requestAnimationFrame(() => fondo.classList.add('abierto'));
    return caja;
  };
  A.cerrarModal = () => { const m = document.getElementById('modal'); if (m) m.remove(); };

  /* =====================================================================
     BANDEJA DE DADOS
     ===================================================================== */
  /**
   * Tirada genérica. cfg:
   *  {titulo, regla, attr, dif, modo:'V'|'D'|null, extra:[{t,v,r}], sugerencias:[{t,modo,r}],
   *   dados:[{tipo}] (si no es prueba), explicar, templeOk:true, fijo:{...}}
   * Devuelve Promise<{res,total,dados,usados,fuera,...}>
   */
  A.tirar = function (cfg) {
    return new Promise((resolver) => {
      const S = A.S;
      const esPrueba = cfg.dif != null;
      const CONTEXTO = { r153: 'explorar', r151: 'orientacion', r181: 'instalar' };
      const contexto = cfg.contexto || CONTEXTO[cfg.regla] || 'prueba';
      let modo = cfg.modo || null;
      let resultado = null;
      let templeUsado = false;
      const zona = el('div.bandeja-zona');
      const info = el('div.bandeja-info');
      const pie = el('div.bandeja-pie');
      const manual = A.aj.manual;

      const nDados = () => (esPrueba ? (modo ? 3 : 2) : cfg.dados.length);
      const specs = () => (esPrueba ? Array.from({ length: nDados() }, () => ({ tipo: 'j' })) : cfg.dados);

      function pintarFormula() {
        info.innerHTML = '';
        if (esPrueba) {
          const at = cfg.attr ? M.atributo(S, cfg.attr) : { total: 0, partes: [] };
          const partes = at.partes.concat(cfg.extra || []);
          const dif = S.dificultad === 'clemencia' && cfg.dif >= 13 ? 11 : cfg.dif;
          info.append(
            el('div.formula', { html: `<span class="f-dados">${modo === 'V' ? '3d6 → 2 altos' : modo === 'D' ? '3d6 → 2 bajos' : '2d6'}</span>${partes.map((p) => `<span class="f-parte">${CB.u.firma(p.v)} <small>${esc(p.t)}</small>${p.r ? ' ' + T.ref(p.r) : ''}</span>`).join('')}<span class="f-vs">contra <b>${dif}</b> <small>${D.DIFICULTAD[dif] || ''}</small></span>` }),
          );
          const prob = probabilidad(at.total + (cfg.extra || []).reduce((s, x) => s + x.v, 0), dif, modo);
          info.append(el('div.prob', { html: `Probabilidad de éxito: <b>${Math.round(prob * 100)} %</b>${cfg.explicar ? ' · ' + cfg.explicar : ''}` }));
          // Ventaja / Desventaja
          const seg = el('div.segmento', { role: 'group', 'aria-label': 'Ventaja o Desventaja' });
          [['D', 'Desventaja'], [null, 'Normal'], ['V', 'Ventaja']].forEach(([m, t]) =>
            seg.append(el('button' + (modo === m ? '.activo' : ''), { type: 'button', disabled: !!resultado, onclick: () => { modo = m; pintarFormula(); prepararZona(); } }, t)),
          );
          info.append(el('div.fila-modo', seg, el('span.ayuda-mini', { html: `Ventaja: tiras 3 y te quedas los 2 altos. Nunca se acumulan (${T.ref('r121')}).` })));
          // recordatorios con Ventaja guardados de un evento (p. ej. «la próxima vez que explores allí, tienes Ventaja»)
          const venGuard = M.notasPara(S, 'ventaja', contexto);
          if (venGuard.length && !resultado) info.append(el('div.notas-tirada', venGuard.map((n) => el('div.nota-tirada', el('span', { html: `${T.ico('recuerda')} <b>Guardado${n.ev ? ' en ' + T.ref(n.ev) : ''}:</b> ${esc(n.txt)}` }),
            el('button.btn.mini', { type: 'button', onclick: () => { A.foto(); if (/calidad/.test(n.txt)) { n.tipo = 'nota'; M.log(S, `Usas la Ventaja guardada (${n.ev}); el resto del recordatorio sigue en pie.`, n.ev ? [n.ev] : []); } else M.notaUsada(S, n.id, 'usado: Ventaja'); A.guardar(); modo = 'V'; pintarFormula(); prepararZona(); } }, 'Usar: Ventaja')))));
          if (cfg.sugerencias && cfg.sugerencias.length) {
            info.append(el('ul.sugerencias', cfg.sugerencias.map((s) => el('li.' + (s.modo === 'V' ? 'ven' : s.modo === 'D' ? 'des' : 'neu'), { html: `${s.modo === 'V' ? '▲' : s.modo === 'D' ? '▼' : '•'} ${T.inline(s.t, {})}${s.r ? ' ' + T.ref(s.r) : ''}` }))));
          }
        } else if (cfg.explicar) info.append(el('div.prob', { html: cfg.explicar }));
      }
      function prepararZona() {
        if (resultado) return;
        zona.innerHTML = '';
        if (manual) {
          zona.classList.add('manual');
          specs().forEach((s, i) => {
            const fila = el('div.dado-manual', el('span.t-' + s.tipo, { html: `Dado ${i + 1}` }));
            const sel = el('div.caras');
            for (let v = 1; v <= 6; v++) sel.append(el('button', { type: 'button', 'data-v': v, onclick: (e) => { sel.querySelectorAll('button').forEach((b) => b.classList.remove('activo')); e.target.classList.add('activo'); } }, String(v)));
            fila.append(sel);
            zona.append(fila);
          });
        } else {
          zona.classList.remove('manual');
          CB.dados.pintarPlano(zona, specs(), specs().map(() => 1 + ((Math.random() * 6) | 0)));
          zona.classList.add('en-espera');
        }
      }
      async function lanzar() {
        let valores;
        const sp = specs();
        if (manual) {
          valores = [...zona.querySelectorAll('.caras')].map((c) => +(c.querySelector('.activo') || {}).dataset?.v || 0);
          if (valores.some((v) => !v)) return A.aviso('Elige el valor de cada dado.');
          sp.forEach((s, i) => (s.v = valores[i]));
        }
        zona.classList.remove('en-espera');
        btnTirar.disabled = true;
        valores = await CB.dados.lanzar(zona, sp.map((s, i) => ({ tipo: s.tipo, v: manual ? valores[i] : null })));
        sp.forEach((s) => delete s.v);
        mostrar(valores);
      }
      function mostrar(valores) {
        pie.innerHTML = '';
        if (esPrueba) {
          resultado = M.prueba(S, { attr: cfg.attr, dif: cfg.dif, modo, extra: cfg.extra, dados: valores });
          resultado.dados = valores; resultado.modo = modo;
          if (resultado.fuera.length) CB.dados.descartar(zona, resultado.fuera);
          const r = resultado;
          pie.append(
            el('div.veredicto.v-' + r.res, el('b', M.RES[r.res]), el('span', { html: `${r.usados.join(' + ')}${r.partes.map((p) => ` ${p.v < 0 ? '−' : '+'} ${Math.abs(p.v)}`).join('')} = <b>${r.total}</b> contra ${r.dif}${r.res === 'pl' ? ' (por 3 o más)' : ''} · ${T.ref('r120')}` })),
          );
          const coste = S.dificultad === 'leyenda' ? 2 : 1;
          const fila = el('div.botones');
          if (cfg.templeOk !== false && S.temple >= coste && !templeUsado) {
            fila.append(el('button.btn.secundario', { type: 'button', onclick: () => { templeUsado = true; A.foto(); S.temple -= coste; M.log(S, `Gastas ${coste} Temple para repetir la tirada.`, ['r122']); A.guardar(); A.pintarCabecera(); resultado = null; pie.innerHTML = ''; btnTirar.disabled = false; prepararZona(); pie.append(btnTirar); lanzar(); }, html: `${T.ico('deshacer')} Repetir con Temple <small>(${coste}, te quedan ${S.temple})</small>` }));
          }
          if (r.res === 'fa') {
            // recordatorios que convierten un Fallo en Éxito (p. ej. la mujer sin ojos, e060)
            M.notasPara(S, 'fallo', contexto).forEach((n) => fila.append(el('button.btn.secundario', { type: 'button', title: n.txt, onclick: () => { A.foto(); M.notaUsada(S, n.id, 'usado: ignoras el Fallo'); resultado.res = 'ex'; A.guardar(); cerrar(); }, html: `Ignorar este Fallo <small>(${n.ev || 'guardado'}${n.region ? ' · ' + D.REGIONES[n.region].corto : ''})</small>` })));
          }
          if (r.res === 'fa' && M.tiene(S, 'SIN_REGISTRO') && !S.umbrales.sinRegistro) {
            fila.append(el('button.btn.secundario', { type: 'button', onclick: () => { S.umbrales.sinRegistro = 1; resultado.res = 'ex'; M.log(S, 'IA sin registro: conviertes un Fallo en Éxito.', ['r105']); cerrar(); }, html: 'Convertir en Éxito <small>(IA sin registro, una vez)</small>' }));
          }
          fila.append(el('button.btn.primario', { type: 'button', onclick: cerrar }, 'Seguir'));
          pie.append(fila);
          M.log(S, `${cfg.titulo}: ${valores.join('·')}${modo ? (modo === 'V' ? ' (Ventaja)' : ' (Desventaja)') : ''} → ${r.total} contra ${r.dif}: ${M.RES[r.res]}.`, ['r120'].concat(cfg.regla ? [cfg.regla] : []));
        } else {
          resultado = { dados: valores, suma: valores.reduce((a, b) => a + b, 0) };
          if (cfg.conversion) Object.assign(resultado, cfg.conversion(valores));
          pie.append(el('div.veredicto.v-neutro', el('b', String(resultado.valor ?? resultado.suma)), el('span', { html: resultado.texto || (valores.length > 1 ? valores.join(' + ') : 'Resultado') })));
          pie.append(el('div.botones', el('button.btn.primario', { type: 'button', onclick: cerrar }, 'Seguir')));
        }
        A.guardar();
      }
      function cerrar() {
        A.cerrarModal();
        resolver(resultado);
      }
      const btnTirar = el('button.btn.primario.tirar', { type: 'button', onclick: lanzar, html: `${T.ico('dado')} ${manual ? 'Confirmar mis dados' : 'Tirar'}` });
      pintarFormula();
      prepararZona();
      pie.append(btnTirar);
      const caja = A.modal(`${esc(cfg.titulo)}${cfg.regla ? ' ' + T.ref(cfg.regla) : ''}`, [info, zona, pie], { clase: 'bandeja', cerrable: !!cfg.cancelable, alCerrar: () => resolver(null) });
      caja.querySelectorAll('.ref').forEach(enlazarRef);
      setTimeout(() => btnTirar.focus(), 50);
      if (cfg.auto && !manual) lanzar();
    });
  };
  /** atajos de tirada */
  A.tirarDados = (titulo, n, tipo = 'x', extra = {}) => A.tirar(Object.assign({ titulo, dados: Array.from({ length: n }, () => ({ tipo })) }, extra));
  /** 1d6, 2d6, 1d8, 1d12, d66 (r002: d8 y d12 con dados de seis) */
  A.tirarNotacion = function (nota, titulo) {
    nota = nota.toLowerCase();
    if (nota === '1d12' || nota === 'd12') {
      return A.tirarDados(titulo || '1d12 con dos d6', 2, 'x', { regla: 'r002', explicar: 'Con dados de seis: si el segundo sale 4–6, suma 6 al primero.', conversion: (v) => ({ valor: v[0] + (v[1] >= 4 ? 6 : 0), texto: `${v[0]} ${v[1] >= 4 ? '+ 6 (el segundo salió ' + v[1] + ')' : '(el segundo salió ' + v[1] + ')'}` }) });
    }
    if (nota === '1d8' || nota === 'd8') {
      return A.tirarDados(titulo || '1d8 con dos d6', 2, 'x', { regla: 'r002', explicar: 'El segundo da de 1 a 4 (con 5–6 se vuelve a tirar); suma 4 si el primero sale 4–6.', conversion: (v) => { let b = v[1]; while (b > 4) b = CB.u.d(6); return { valor: b + (v[0] >= 4 ? 4 : 0), texto: `${b}${v[1] > 4 ? ' (el 2.º se repitió)' : ''} ${v[0] >= 4 ? '+ 4' : ''}` }; } });
    }
    if (nota === 'd66') return A.tirarDados(titulo || 'd66', 2, 'x', { conversion: (v) => ({ valor: v[0] * 10 + v[1], texto: 'Decenas y unidades' }) });
    const m = nota.match(/^(\d*)d6$/);
    const n = m && m[1] ? +m[1] : 1;
    return A.tirarDados(titulo || `${n}d6`, n, 'x');
  };
  /** probabilidad exacta de 2d6 (+Ventaja/Desventaja) + mod ≥ dif */
  const DIST = {};
  function dist(modo) {
    const k = modo || 'N';
    if (DIST[k]) return DIST[k];
    const d = {};
    if (!modo) for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) d[a + b] = (d[a + b] || 0) + 1 / 36;
    else for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) for (let c = 1; c <= 6; c++) { const s = [a, b, c].sort((x, y) => x - y); const v = modo === 'V' ? s[1] + s[2] : s[0] + s[1]; d[v] = (d[v] || 0) + 1 / 216; }
    return (DIST[k] = d);
  }
  function probabilidad(mod, dif, modo) {
    const d = dist(modo);
    let p = 0;
    for (const k in d) if (+k + mod >= dif) p += d[k];
    return p;
  }
  A.probabilidad = probabilidad;

  /** sugerencias de Ventaja/Desventaja para una prueba */
  A.sugerencias = function (attr, { canto = false, contexto = '' } = {}) {
    const S = A.S;
    const s = [];
    for (const t of M.compas(S)) {
      const T_ = D.TRIPULACION[t];
      if (T_.ventaja === attr) s.push({ t: `${t}: Ventaja en pruebas de ${attr}`, modo: 'V', r: 'r185' });
    }
    if (canto && S.canto >= 3) s.push({ t: `Canto ${S.canto}: Desventaja en Voluntad contra el Canto`, modo: 'D', r: 'r137' });
    if (canto && M.tiene(S, 'CHAMAN')) s.push({ t: 'Chamán de esporas: Ventaja contra el Canto', modo: 'V', r: 'r105' });
    if (canto && S.rasgos.includes('e715')) s.push({ t: 'Oído profundo: Ventaja en Voluntad ♫', modo: 'V', r: 'e715' });
    if (canto && S.habilidades.includes('Cortafuegos')) s.push({ t: 'Cortafuegos: Ventaja contra el Canto', modo: 'V', r: 'r190' });
    if (S.clima && S.clima.n === 'Pulso del Canto' && attr === 'Voluntad') s.push({ t: 'Pulso del Canto: Desventaja en Voluntad', modo: 'D', r: 'r155' });
    if (S.clima && S.clima.n === 'Tormenta de óxido' && (contexto === 'orientacion' || contexto === 'distancia')) s.push({ t: 'Tormenta de óxido: Desventaja', modo: 'D', r: 'r155' });
    if ((S.hoy.desventajas || []).includes(attr)) s.push({ t: `Hoy tienes Desventaja en ${attr} (lo dijo un evento)`, modo: 'D' });
    if (M.compas(S).length) s.push({ t: 'Un compañero cuya habilidad encaje con la prueba te da Ventaja (salvo si el evento dice «solo»)', modo: null, r: 'r123' });
    return s;
  };

  /* =====================================================================
     CABECERA
     ===================================================================== */
  // fase del día (r130): amanecer · acción · anochecer, o el prólogo
  function faseIdx(S) {
    const e = S.escena || {};
    if (e.tipo === 'evento' && e.origen === 'prologo') return -1;
    if (e.tipo === 'amanecer' || (e.tipo === 'evento' && e.origen === 'amanecer')) return 0;
    if (e.tipo === 'anochecer' || (e.tipo === 'evento' && e.origen === 'noche')) return 2;
    return 1;
  }
  function faseDia(S) {
    const e = S.escena || {};
    const f = faseIdx(S);
    if (f < 0) return `<button class="med fase" data-regla="r130" title="El prólogo (antes del día 1)"><span class="et">Fase</span><b class="fase-n">Prólogo</b></button>`;
    const nom = ['Amanecer', 'Acción', 'Anochecer'];
    const ico = ['sol', 'ir', 'luna'];
    return `<button class="med fase" data-regla="r130" title="Fase del día (r130): ${nom[f]}"><span class="et">Fase</span><span class="fases">${nom.map((n, i) => `<i class="${i === f ? 'on' : i < f ? 'hecha' : ''}" title="${n}">${T.ico(ico[i])}</i>`).join('')}</span><span class="sub">${nom[f]}</span></button>`;
  }
  A.pintarCabecera = function () {
    const S = A.S;
    const cab = document.getElementById('cabecera');
    if (!cab) return;
    if (!S) { cab.innerHTML = ''; cab.hidden = true; return; }
    cab.hidden = false;
    const pips = (n, max, cls) => Array.from({ length: max }, (_, i) => `<i class="${i < n ? 'on' : ''} ${cls || ''}"></i>`).join('');
    const reloj = S.reloj == null ? '∞' : S.reloj;
    const urg = S.reloj != null && S.reloj <= 10 ? ' urgente' : '';
    const her = Array.from({ length: S.nivelesHerida }, (_, i) => `<i class="${i < S.heridas ? 'on' : ''}" title="${D.NIVELES_HERIDA[Math.min(i + 1, 4)]}"></i>`).join('');
    cab.innerHTML = `
      <button class="marca-juego" data-ir-titulo title="Menú principal">Caribdis</button>
      <div class="medidores">
        <button class="med reloj${urg}" data-regla="r134" title="Reloj de los Recolectores (r134)"><span class="et">Reloj</span><b>${reloj}</b><span class="sub">Día ${S.dia || '—'}</span>${faseIdx(S) >= 0 ? `<span class="fase-mini" title="${['Amanecer', 'Acción', 'Anochecer'][faseIdx(S)]}">${T.ico(['sol', 'ir', 'luna'][faseIdx(S)])}</span>` : ''}</button>
        <button class="med" data-regla="r135" title="Alerta (r135)"><span class="et">${T.ico('alerta')}Alerta</span><span class="pips alerta">${pips(S.alerta, 4)}</span></button>
        <button class="med" data-regla="r137" title="Canto (r137)"><span class="et">${T.ico('canto')}Canto</span><span class="pips canto">${pips(S.canto, 6)}</span></button>
        <button class="med" data-regla="r106" title="Heridas (r106): ${M.nivel(S)}"><span class="et">${T.ico('herida')}${S.prota === 'mente' ? 'Daño' : 'Heridas'}</span><span class="pips herida">${her}</span><span class="sub">${M.nivel(S)}</span></button>
        <button class="med" data-regla="r122" title="Temple (r122)"><span class="et">${T.ico('hito')}Temple</span><span class="pips temple">${pips(S.temple, S.templeMax)}</span></button>
        ${S.prota === 'mente' ? `<button class="med raciones${S.energia <= 1 ? ' urgente' : ''}" data-regla="r136" title="Energía (r136)"><span class="et">${T.ico('racion')}Energía</span><b>${S.energia}<small>/6</small></b></button>` : `<button class="med raciones${S.raciones <= 1 ? ' urgente' : ''}" data-regla="r136" title="Raciones (r136)"><span class="et">${T.ico('racion')}Raciones</span><b>${S.raciones}<small>/8</small></b></button>`}
        ${faseDia(S)}
        <button class="med lugar${A.vista === 'mapa' ? ' activo' : ''}" data-ir-vista="mapa" title="${A.vista === 'mapa' ? 'Volver a la mesa' : 'Ver el mapa: dónde estás'}" aria-pressed="${A.vista === 'mapa'}"><span class="et">${T.ico('mapa')}Estás en</span><b class="lugar-n">${S.region === 1 ? 'La Cicatriz' : D.REGIONES[S.region].corto}</b></button>
      </div>
      <div class="herr">
        <button class="btn-icono" data-deshacer title="Deshacer (Ctrl+Z)" aria-label="Deshacer">${T.ico('deshacer')}</button>
        <button class="btn-icono${A.vista === 'bitacora' ? ' activo' : ''}" data-ir-vista="bitacora" title="Bitácora" aria-label="Bitácora" aria-pressed="${A.vista === 'bitacora'}">${T.ico('bitacora')}</button>
        <button class="btn-icono" data-codice title="Códice: reglas y eventos (/)" aria-label="Abrir el Códice">${T.ico('libro')}</button>
        <button class="btn-icono" data-menu title="Menú" aria-label="Menú">${T.ico('menu')}</button>
      </div>`;
  };

  /* =====================================================================
     CÓDICE: lector y buscador del libro
     ===================================================================== */
  A.abrirCodice = function (id, { empujar = true } = {}) {
    A.cod.abierto = true;
    if (id && id !== A.cod.id) {
      if (empujar && A.cod.id) A.cod.historial.push(A.cod.id);
      A.cod.id = id;
    }
    document.body.classList.add('codice-abierto');
    pintarCodice();
    if (!id) setTimeout(() => { const q = document.getElementById('cod-q'); q && q.focus(); }, 60);
  };
  A.cerrarCodice = function () {
    A.cod.abierto = false;
    document.body.classList.remove('codice-abierto');
  };
  const FILTROS = [['todo', 'Todo'], ['r', 'Reglas'], ['e', 'Eventos'], ['cat', 'Catálogo'], ['mundo', 'Mundo'], ['marcas', 'Marcas']];
  function buscar(q, filtro) {
    const nq = norm(q.trim());
    let base = indice;
    if (filtro === 'r') base = base.filter((x) => x.e.tipo === 'r');
    if (filtro === 'e') base = base.filter((x) => x.e.tipo === 'e' && x.e.cap !== 'Catálogo');
    if (filtro === 'cat') base = base.filter((x) => x.e.cap === 'Catálogo');
    if (!nq) return base.slice(0, filtro === 'todo' ? 0 : 400);
    const mId = nq.match(/^([re])?\s*(\d{1,3})$/);
    if (mId) {
      const n = mId[2].padStart(3, '0');
      return base.filter((x) => x.id.slice(1) === n || x.id.slice(1).startsWith(n)).slice(0, 60);
    }
    const pal = nq.split(/\s+/);
    return base
      .map((x) => {
        let p = 0;
        for (const w of pal) {
          if (x.id === w) p += 100;
          if (x.t === w) p += 60;
          else if (x.t.startsWith(w)) p += 25;
          if (x.t.includes(w)) p += 10;
          else if (x.x.includes(w)) p += 1;
          else return null;
        }
        return { x, p };
      })
      .filter(Boolean)
      .sort((a, b) => b.p - a.p)
      .slice(0, 80)
      .map((r) => r.x);
  }
  function fragmento(x, q) {
    const nq = norm(q.trim()).split(/\s+/)[0];
    if (!nq) return '';
    const txt = T.plano(x.e.md);
    const i = norm(txt).indexOf(nq);
    if (i < 0) return '';
    const a = Math.max(0, i - 50);
    return (a ? '…' : '') + esc(txt.slice(a, i)) + '<mark>' + esc(txt.slice(i, i + nq.length)) + '</mark>' + esc(txt.slice(i + nq.length, i + 90)) + '…';
  }
  function pintarCodice() {
    const panel = document.getElementById('codice');
    if (!panel) return;
    panel.innerHTML = '';
    const cab = el('div.cod-cab',
      el('div.cod-titulo', el('span', { html: `${T.ico('libro')} Códice` }), el('span.cod-sub', 'El libro entero, siempre a mano'), el('button.btn-icono', { 'aria-label': 'Cerrar el Códice', onclick: A.cerrarCodice, html: T.ico('cerrar') })),
      el('div.cod-busca', el('span.lupa', { html: T.ico('buscar') }), el('input#cod-q', { type: 'search', placeholder: 'Busca: «combate», «Lio», «e202», «Canto»…', value: A.cod.q, autocomplete: 'off', oninput: (e) => { A.cod.q = e.target.value; A.cod.id = null; pintarLista(); } })),
      el('div.cod-filtros', FILTROS.map(([k, t]) => el('button' + (A.cod.filtro === k ? '.activo' : ''), { type: 'button', onclick: () => { A.cod.filtro = k; A.cod.id = null; pintarCodice(); } }, t))),
    );
    const cuerpo = el('div.cod-cuerpo#cod-cuerpo');
    panel.append(cab, cuerpo);
    if (A.cod.id) pintarEntrada(cuerpo, A.cod.id);
    else pintarLista();
  }
  function pintarLista() {
    const cuerpo = document.getElementById('cod-cuerpo');
    if (!cuerpo) return;
    cuerpo.innerHTML = '';
    const f = A.cod.filtro;
    if (f === 'mundo') {
      cuerpo.append(el('p.cod-intro', CB.libro.lore_intro ? el('em', CB.libro.lore_intro) : 'Documentos del mundo y apéndices del libro.'));
      CB.libro.lore.forEach((l, i) => cuerpo.append(el('button.cod-item', { type: 'button', onclick: () => { A.cod.id = 'lore:' + i; pintarCodice(); } }, el('span.cod-id', l.fuente === 'Apéndices' ? 'Apéndice' : 'Mundo'), el('span.cod-t', l.titulo))));
      return;
    }
    if (f === 'marcas') {
      const S = A.S;
      const q = norm(A.cod.q);
      cuerpo.append(el('p.cod-intro', { html: `Cada Marca y dónde aparece (${T.ref('r191')}). ${S ? 'Las que tienes anotadas van resaltadas.' : ''}` }));
      Object.keys(CB.libro.marcas).filter((m) => !q || norm(m).includes(q)).forEach((m) => {
        cuerpo.append(el('div.cod-marca' + (S && M.tiene(S, m) ? '.tiene' : ''), { id: 'marca-' + m, html: `<span class="marca">${m.replace(/_/g, '_<wbr>')}</span><span>${(CB.libro.verdades || {})[m] ? `<b class="cod-verdad" title="Apunta a la verdad ${CB.libro.verdades[m]} (e840)">${CB.libro.verdades[m]}</b> ` : ''}${CB.libro.marcas[m].map((id) => T.ref(id)).join(' ')}</span>` }));
      });
      cuerpo.querySelectorAll('.ref').forEach(enlazarRef);
      return;
    }
    const res = buscar(A.cod.q, f);
    if (!A.cod.q.trim() && f === 'todo') return pintarPortadaCodice(cuerpo);
    if (!res.length) { cuerpo.append(el('p.vacio', 'Nada con eso. Prueba con otra palabra o con un número (e202, r140).')); return; }
    let cap = '';
    for (const x of res) {
      if (!A.cod.q.trim() && x.e.cap !== cap) { cap = x.e.cap; cuerpo.append(el('h4.cod-cap', cap)); }
      cuerpo.append(el('button.cod-item', { type: 'button', onclick: () => A.abrirCodice(x.id) },
        el('span.cod-id.t-' + x.e.tipo, x.id), el('span.cod-t', x.e.titulo),
        x.e.lugar ? el('span.cod-lugar', { html: T.inline(x.e.lugar, {}) }) : null,
        A.cod.q.trim() ? el('span.cod-frag', { html: fragmento(x, A.cod.q) }) : null));
    }
  }
  function pintarPortadaCodice(cuerpo) {
    const sec = (t, ids) => el('div.cod-seccion', el('h4.cod-cap', t), el('div.cod-chips', ids.map((id) => el('button.chip-ref', { type: 'button', onclick: () => A.abrirCodice(id) }, el('b', id), ' ', CB.libro.titulo(id)))));
    cuerpo.append(
      el('p.cod-intro', 'Busca cualquier regla o evento, o empieza por lo esencial. Cuando la mesa cite una regla, se abre aquí.'),
      sec('Para empezar', ['r001', 'r003', 'r004', 'r130', 'r120']),
      sec('Las reglas que más usarás', ['r131', 'r132', 'r133', 'r140', 'r141', 'r151', 'r153', 'r154', 'r170', 'r181']),
      sec('Recursos y amenazas', ['r106', 'r122', 'r134', 'r135', 'r136', 'r137', 'r195']),
      sec('Progresar', ['r180', 'r185', 'r190', 'r191', 'r192', 'r193', 'r194', 'r200']),
      sec('Ejemplo de juego', ['r198']),
    );
  }
  const NOTAS_CODICE = {
    r300: { yaEnLibro: /Precio\*\* es /, md: 'El **Precio** es lo que te piden por dejarte pasar sin pelear: solo lo pagas si te toca una plantilla que lo pide, como el Peaje ([r318](#r318)); si el evento no lo indica, son 2 Chatarra. El **Botín** es lo que llevan encima y puedes ganarte al vencerlos o espantarlos ([r315](#r315), [r319](#r319)).' },
  };
  function pintarEntrada(cuerpo, id) {
    if (id.startsWith('lore:')) {
      const l = CB.libro.lore[+id.slice(5)];
      cuerpo.append(el('button.volver', { type: 'button', onclick: () => { A.cod.id = null; pintarCodice(); } }, '← Volver'), el('article.entrada.lore', el('div.ent-cab', el('span.ent-id', l.fuente), el('h3', l.titulo)), el('div.texto', { html: T.render(l.md, { modo: 'lectura' }) })));
      cuerpo.querySelectorAll('.ref').forEach(enlazarRef);
      return;
    }
    const e = CB.libro.entradas[id];
    if (!e) return;
    const nav = el('div.ent-nav',
      el('button.volver', { type: 'button', onclick: () => { const prev = A.cod.historial.pop(); A.cod.id = prev || null; pintarCodice(); } }, A.cod.historial.length ? '← Atrás' : '← Índice'),
      el('span.ent-pos', e.cap + (e.grupo ? ' · ' + e.grupo : '')),
    );
    const i = CB.libro.orden.indexOf(id);
    const prev = CB.libro.orden[i - 1], next = CB.libro.orden[i + 1];
    const art = el('article.entrada.t-' + e.tipo,
      el('div.ent-cab', el('span.ent-id', id), el('h3', e.titulo), e.lugar ? el('div.ent-lugar', { html: T.inline(e.lugar, {}) }) : null),
      el('div.texto', { html: T.render(e.md, { modo: 'lectura' }) }),
    );
    const ent = [...(CB.libro.entrantes[id] || [])].sort();
    const pie = el('div.ent-pie');
    if (ent.length) pie.append(el('div.ent-entrantes', el('span.et', 'Te pueden traer aquí'), el('div', { html: ent.slice(0, 40).map((x) => T.ref(x)).join(' ') })));
    const S = A.S;
    if (e.tipo === 'e' && S && !S.fin && S.escena && e.cap !== 'Catálogo') {
      pie.append(el('button.btn.secundario.jugar-aqui', { type: 'button', onclick: () => { CB.mesa.jugarEvento(id, 'libre'); A.cerrarCodice(); }, html: `${T.ico('ir')} Jugar este evento ahora` }), el('p.ayuda-mini', 'Para cuando el libro te manda aquí por una regla que la app no lleva sola. Al terminar, vuelves adonde estabas.'));
    }
    pie.append(el('div.ent-pasar', prev ? el('button.chip-ref', { type: 'button', onclick: () => A.abrirCodice(prev) }, '← ', el('b', prev)) : el('span'), next ? el('button.chip-ref', { type: 'button', onclick: () => A.abrirCodice(next) }, el('b', next), ' →') : el('span')));
    cuerpo.append(nav, art, pie);
    // notas de la app para reglas que nombran algo sin definirlo
    const nota = NOTAS_CODICE[id];
    if (nota && !nota.yaEnLibro.test(e.md)) {
      const p1 = art.querySelector('.texto > p');
      const caja = el('div.nota-app', { html: `<span class="na-et">Nota de la app</span>${T.inline(nota.md, {})}` });
      p1 ? p1.after(caja) : art.querySelector('.texto').prepend(caja);
    }
    cuerpo.querySelectorAll('.ref').forEach(enlazarRef);
    cuerpo.querySelectorAll('a.marca').forEach((a) => a.addEventListener('click', (ev) => { ev.preventDefault(); A.cod.filtro = 'marcas'; A.cod.q = a.dataset.marca; A.cod.id = null; pintarCodice(); }));
    cuerpo.scrollTop = 0;
  }
  function enlazarRef(a) {
    if (a._ok) return;
    a._ok = 1;
    a.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); A.abrirCodice(a.dataset.ref); });
  }
  A.enlazarRefs = (raiz) => raiz.querySelectorAll('.ref').forEach(enlazarRef);

  /* =====================================================================
     BITÁCORA
     ===================================================================== */
  A.pintarBitacora = function (cont) {
    const S = A.S;
    cont.innerHTML = '';
    cont.append(el('div.panel-cab', el('h2', { html: `${T.ico('bitacora')} Bitácora` }), el('p.sub', 'Todo lo que pasó, con la regla que lo explica.')));
    const lista = el('div.bitacora');
    let dia = null;
    [...S.bitacora].reverse().forEach((b) => {
      if (b.tipo === 'dia') { lista.append(el('div.bit-dia', b.txt.replace(/─/g, '').trim())); return; }
      if (b.dia !== dia && !lista.lastChild) dia = b.dia;
      lista.append(el('div.bit-linea', { html: `<span class="bit-t">${T.inline(b.txt, {})}</span>${(b.reglas || []).filter(Boolean).map((r) => T.ref(r)).join(' ')}` }));
    });
    cont.append(lista);
    A.enlazarRefs(cont);
  };

  /* =====================================================================
     MENÚ
     ===================================================================== */
  A.menu = function () {
    const S = A.S;
    const fila = (ico, t, sub, fn) => el('button.menu-item', { type: 'button', onclick: fn }, el('span.mi-ico', { html: T.ico(ico) }), el('span', el('b', t), sub ? el('small', sub) : null));
    const cuerpo = el('div.menu',
      fila('libro', 'Descargar el manual', 'La última versión del libro en PDF', () => { A.cerrarModal(); CB.manual.descargar(); }),
      fila('dado', A.aj.manual ? 'Dados: los míos (físicos)' : 'Dados: los de la app (3D)', 'Cambia si quieres tirar tus propios dados', () => { A.aj.manual = !A.aj.manual; A.guardar(); A.menu(); }),
      fila('dado', A.aj.sonido !== false ? 'Sonido de los dados: activado' : 'Sonido de los dados: desactivado', 'Un golpe por cada bote del dado', () => { A.aj.sonido = A.aj.sonido === false; A.guardar(); A.menu(); }),
      fila('ayuda', A.aj.guia ? 'Guía: activada' : 'Guía: desactivada', 'Consejos que te enseñan a jugar sobre la marcha', () => { A.aj.guia = !A.aj.guia; if (A.aj.guia) A.aj.vistos = {}; A.guardar(); A.render(); A.menu(); }),
      S ? fila('bajar', 'Guardar partida en un archivo', 'Para seguirla en otro equipo', () => CB.manual.exportar()) : null,
      fila('mas', 'Cargar partida desde un archivo', null, () => CB.manual.importar()),
      S ? fila('dado', 'Herramientas', 'Una prueba, un pecio, un rumor, moverte… lo que pida el libro, sin terminar el día', () => { A.cerrarModal(); CB.mesa.herramientas(); }) : null,
      S ? fila('deshacer', 'Deshacer el último paso', null, () => { A.cerrarModal(); A.deshacerUno(); }) : null,
      fila('nave', 'Pantalla de título', 'Nueva partida, continuar, leer el libro', () => { A.cerrarModal(); CB.crear.titulo(); }),
    );
    A.modal('Menú', cuerpo, { clase: 'estrecho' });
  };

  /* =====================================================================
     RENDER GENERAL
     ===================================================================== */
  A.render = function () {
    const S = A.S;
    document.body.classList.toggle('en-partida', !!S);
    A.pintarCabecera();
    if (!S) return;
    const mesa = document.getElementById('mesa');
    const hoja = document.getElementById('hoja');
    const bit = document.getElementById('vista-bitacora');
    const mapa = document.getElementById('vista-mapa');
    CB.hoja.pintar(hoja);
    CB.mesa.pintar(mesa);
    const clave = (S.escena && (S.escena.tipo + ':' + (S.escena.id || '') + ':' + (S.fin || ''))) + ':' + A.vista;
    if (A._escena && A._escena !== clave && A.vista === 'mesa') {
      mesa.classList.remove('entra'); void mesa.offsetWidth; mesa.classList.add('entra');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    A._escena = clave;
    if (A.vista === 'bitacora') A.pintarBitacora(bit);
    if (A.vista === 'mapa') CB.hoja.pintarMapaVista(mapa);
    document.querySelectorAll('[data-vista]').forEach((v) => v.classList.toggle('activa', v.dataset.vista === A.vista));
    document.querySelectorAll('#nav-movil button').forEach((b) => b.classList.toggle('activo', b.dataset.irVista === A.vista));
    if (A.cod.abierto) pintarCodice();
    A.enlazarRefs(document.getElementById('app'));
  };
  A.irVista = function (v) {
    A.vista = A.vista === v && v !== 'mesa' ? 'mesa' : v;
    A.render();
    window.scrollTo({ top: 0 });
  };

  /* ---------- eventos globales ---------- */
  document.addEventListener('click', (ev) => {
    const g = ev.target.closest('.glosa');
    if (g) { ev.preventDefault(); ev.stopPropagation(); A.glosa(g); return; }
    const t = ev.target.closest('[data-regla],[data-ir-vista],[data-codice],[data-menu],[data-deshacer],[data-ir-titulo]');
    if (!t) return;
    if (t.dataset.regla) A.abrirCodice(t.dataset.regla);
    else if (t.dataset.irVista) A.irVista(t.dataset.irVista);
    else if (t.hasAttribute('data-codice')) (A.cod.abierto ? A.cerrarCodice() : A.abrirCodice());
    else if (t.hasAttribute('data-menu')) A.menu();
    else if (t.hasAttribute('data-deshacer')) A.deshacerUno();
    else if (t.hasAttribute('data-ir-titulo')) CB.crear.titulo();
  });
  document.addEventListener('keydown', (ev) => {
    const enCampo = /input|textarea|select/i.test(document.activeElement && document.activeElement.tagName);
    if (ev.key === 'Escape') { if (document.getElementById('modal') && !document.querySelector('.bandeja')) A.cerrarModal(); else if (A.cod.abierto) A.cerrarCodice(); }
    if (ev.key === '/' && !enCampo) { ev.preventDefault(); A.abrirCodice(); }
    if ((ev.ctrlKey || ev.metaKey) && ev.key === 'z' && !enCampo && A.S) { ev.preventDefault(); A.deshacerUno(); }
  });
})();
