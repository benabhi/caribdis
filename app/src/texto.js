/* =====================================================================
   CARIBDIS · texto
   Markdown del libro → HTML, y "lectura activa": en un evento, el texto
   se vuelve jugable. Las pruebas son botones de tirada, los → eXXX son
   saltos, las Marcas y los efectos (+2 Raciones, 1 Herida…) son fichas
   que se aplican con un toque, y las reglas citadas se abren al lado.
   En el Códice el mismo texto se lee sin fichas, solo con enlaces.
   ===================================================================== */
'use strict';
(function () {
  const { esc } = CB.u;
  const T = (CB.texto = {});

  /* ---------- iconos ---------- */
  T.ico = function (n, cls = '') {
    const cuerpo = (CB.libro.iconos || {})[n] || EXTRA_ICO[n] || '';
    return `<svg class="ico ico-${n} ${cls}" viewBox="0 0 24 24" aria-hidden="true">${cuerpo}</svg>`;
  };
  const _T = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  const EXTRA_ICO = {
    racion: `<rect x="6" y="6" width="12" height="14" rx="2" ${_T}/><path d="M6 10h12M9 3h6v3H9z" ${_T}/>`,
    buscar: `<circle cx="10.5" cy="10.5" r="6.5" ${_T}/><path d="M15.5 15.5L21 21" ${_T}/>`,
    libro: `<path d="M4 4.5h6a2 2 0 0 1 2 2V20a2 2 0 0 0-2-2H4z" ${_T}/><path d="M20 4.5h-6a2 2 0 0 0-2 2V20a2 2 0 0 1 2-2h6z" ${_T}/>`,
    bajar: `<path d="M12 3v12M7 10l5 5 5-5" ${_T}/><path d="M4 19h16" ${_T}/>`,
    cerrar: `<path d="M6 6l12 12M18 6L6 18" ${_T}/>`,
    menu: `<path d="M4 7h16M4 12h16M4 17h16" ${_T}/>`,
    bitacora: `<path d="M6 3h11a2 2 0 0 1 2 2v16H8a2 2 0 0 1-2-2z" ${_T}/><path d="M6 17a2 2 0 0 1 2-2h11M10 7h6M10 10.5h6" ${_T}/>`,
    persona: `<circle cx="12" cy="8" r="4" ${_T}/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" ${_T}/>`,
    grupo: `<circle cx="9" cy="8.5" r="3.4" ${_T}/><circle cx="17" cy="9.5" r="2.6" ${_T}/><path d="M2.5 20c1-3.5 3.5-5.2 6.5-5.2s5.5 1.7 6.5 5.2M15.5 14.6c2.6 0 4.8 1.6 6 4.6" ${_T}/>`,
    mochila: `<path d="M6 8a6 6 0 0 1 12 0v12H6z" ${_T}/><path d="M9 8V6a3 3 0 0 1 6 0v2M6 13h12" ${_T}/>`,
    sol: `<circle cx="12" cy="14" r="4.5" ${_T}/><path d="M3 20h18M12 4v3M4.5 8.5l2 2M19.5 8.5l-2 2" ${_T}/>`,
    luna: `<path d="M19 15.5A8 8 0 0 1 8.5 5a8 8 0 1 0 10.5 10.5z" ${_T}/>`,
    deshacer: `<path d="M9 8H4V3" ${_T}/><path d="M4.5 8.2A8 8 0 1 1 6 17" ${_T}/>`,
    ojo: `<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" ${_T}/><circle cx="12" cy="12" r="3" ${_T}/>`,
    check: `<path d="M5 12.5l4.5 4.5L19 7.5" ${_T}/>`,
    mas: `<path d="M12 5v14M5 12h14" ${_T}/>`,
    menos: `<path d="M5 12h14" ${_T}/>`,
    escudo: `<path d="M12 3l7.5 3v6c0 4.5-3.2 7.8-7.5 9-4.3-1.2-7.5-4.5-7.5-9V6z" ${_T}/>`,
    correr: `<circle cx="14.5" cy="4.5" r="2" ${_T}/><path d="M7 21l3.5-6 3 2.5V22M5 11.5l3.5-3.5 4.5.5 2.5 3.5 3.5 1" ${_T}/>`,
    boca: `<path d="M4 6h16v9H11l-5 4v-4H4z" ${_T}/>`,
    llave: `<circle cx="8" cy="15" r="4" ${_T}/><path d="M11 12l9-9M16.5 6.5l2.5 2.5M14 9l2 2" ${_T}/>`,
    martillo: `<path d="M13.5 6.5l4 4M4 20l9.5-9.5M14 3l7 7-2.5 2.5-7-7z" ${_T}/>`,
    cama: `<path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5" ${_T}/><circle cx="7" cy="11" r="1.8" ${_T}/>`,
    sombra: `<path d="M3 20h18M6 20c0-5 2.7-9 6-9s6 4 6 9" ${_T}/><path d="M12 11V4" ${_T}/>`,
    cohete: `<path d="M12 2.5c3 2.5 4.5 6 4.5 10.5L19 17h-4l-1 3h-4l-1-3H5l2.5-4C7.5 8.5 9 5 12 2.5z" ${_T}/>`,
  };

  /* ---------- referencias ---------- */
  const titulo = (id) => (CB.libro.entradas[id] ? CB.libro.entradas[id].titulo : '');
  const refHTML = (id, txt) => `<a class="ref ref-${id[0]}" href="#${id}" data-ref="${id}" title="${esc(titulo(id))}">${txt || id}</a>`;
  T.ref = refHTML;

  /* ---------- efectos reconocibles en el texto de un evento ---------- */
  const RECURSO = { 'Ración': 'raciones', 'Raciones': 'raciones', 'Chatarra': 'chatarra', 'Aire': 'aire', 'Energía': 'energia', 'Canto': 'canto', 'Temple': 'temple', 'Alerta': 'alerta' };
  const FACC = { 'Hijos del Pecio': 'hijos', 'Hijos': 'hijos', 'Desguaces': 'desguaces', 'Coro': 'coro', 'Vigías': 'vigias' };
  const SIGNO = (s) => (s === '+' ? 1 : -1);
  const chip = (ef, txt, cls = '') => `<button type="button" class="tk ef ${cls}" data-ef="${esc(JSON.stringify(ef))}">${txt}</button>`;
  const REGLAS_EFECTO = [
    // +1 de Reputación con los Desguaces
    [/([+−-])(\d+) de Reputación con (?:los |el )?(Hijos del Pecio|Desguaces|Coro|Vigías)/g, (m, s, n, f) => {
      // r194: ganar con una facción cuesta 1 con su rival; se avisa en la misma ficha
      const F = CB.D.FACCIONES[FACC[f]], d = SIGNO(s) * n;
      const extra = d > 0 && F && F.rival ? ` <small class="tk-rival" title="Enemistad (r194): ganar con ${F.n} cuesta 1 con ${CB.D.FACCIONES[F.rival].n}">· −1 ${CB.D.FACCIONES[F.rival].n}</small>` : '';
      return chip({ k: 'rep:' + FACC[f], d }, m + extra);
    }],
    // +2 Raciones, −1 Temple
    [/([+−-])(\d+) (Raciones|Ración|Chatarra|Aire|Energía|Canto|Temple|Alerta)(?! máximo)/g, (m, s, n, r) => chip({ k: RECURSO[r], d: SIGNO(s) * n }, m)],
    // Ganas 3 Chatarra / pierdes 2 Raciones / paga 2 Chatarra
    [/\b(Ganas|ganas|Gana|gana|Recibes|recibes)( \d+) (Raciones|Ración|Chatarra|Aire|Energía|Temple)\b/g, (m, v, n, r) => chip({ k: RECURSO[r], d: +n }, m)],
    [/\b(Pierdes|pierdes|Pierde|pierde|Paga|paga|Pagas|pagas|Gastas|gastas|Gasta|gasta)( \d+) (Raciones|Ración|Chatarra|Aire|Energía|Temple)\b/g, (m, v, n, r) => chip({ k: RECURSO[r], d: -n }, m)],
    // Sube la Alerta a 2 / Sube tu Canto en 1 / Baja el Canto en 1
    [/\b(Sube|sube) (?:la |tu |el )?Alerta a (\d)/g, (m, v, n) => chip({ k: 'alerta', fijar: +n }, m)],
    [/\b(Sube|sube|Baja|baja|Bajas|bajas) (?:la |tu |el )?(Canto|Alerta) en (\d+)/g, (m, v, r, n) => chip({ k: RECURSO[r], d: (/^[Bb]aj/.test(v) ? -1 : 1) * n }, m)],
    [/\b(Bajas|bajas|Baja|baja) (\d+) (?:de )?(Canto|Alerta)/g, (m, v, n, r) => chip({ k: RECURSO[r], d: -n }, m)],
    // curas / recuperas N Heridas
    [/\b(cura|curas|Cura|Curas|recuperas|Recuperas|recupera|Recupera)( \d+) (Heridas?|Daños?)/g, (m, v, n) => chip({ k: 'heridas', d: -n }, m, 'bueno')],
    // N Heridas (daño)
    [/(^|[^+−\-\d\w])(\d+) (Heridas?|Daños?)(?! de nave)(?! más)\b/g, (m, pre, n) => pre + chip({ k: 'heridas', d: +n }, `${n} ${m.trim().split(' ').slice(1).join(' ')}`, 'malo')],
    // reliquia sin identificar
    [/(una |la )?reliquia sin identificar/g, (m) => chip({ k: 'reliquia' }, m, 'raro')],
    // Casco Precario / Motor Sólido …
    [/(Casco|Motor|Navegación|Soporte vital|Combustible) (Precari[oa]|Sólid[oa]|Excelente)\b/g, (m, s, c) => chip({ k: 'sistema', s, cal: c.startsWith('Precari') ? 'Precaria' : c.startsWith('Sólid') ? 'Sólida' : 'Excelente' }, m, 'nave')],
  ];

  // cantidades sueltas («restos: 3 Chatarra», «cuesta 2 Chatarra»): el libro no siempre dice si se gana o se paga,
  // así que la ficha pregunta al tocarla y sugiere el signo que parece por el contexto
  const RE_MENOS = /(pierdes|pierde|paga|pagas|pagar|pagarle|cuesta|cuestan|gastas|gasta|gastar|ofrece|ofreces|entregas|entrega|consume|dejas|\bdas|\bdale)\b[^.:;]{0,22}$/i;
  const RE_MAS = /(ganas|gana|te dan|te da|valen|vale|hay|tienen|tiene|encuentras|restos|recibes|llevaba|lleva|guarda|sacas|consigues|obtienes|botín)[^.;]{0,26}$/i;
  function sueltas(t) {
    return t.replace(/(^|[^+−\-\w·])(\d+) (Raciones|Ración|Chatarra|Energía|Aire)\b/g, (m, pre, n, r, off, all) => {
      const antes = all.slice(Math.max(0, off - 40), off + pre.length);
      if (/(Precio|Botín|precio)\W{0,12}$/.test(antes) || /\b(por cada|cada uno|cada una)\b/.test(all.slice(off, off + 40))) return m;
      // gana la pista más cercana al número
      const mm = antes.match(RE_MENOS), mp = antes.match(RE_MAS);
      const sug = mm && mp ? (mm.index > mp.index ? -1 : 1) : mm ? -1 : mp ? 1 : 0;
      return pre + chip({ k: RECURSO[r], d: +n, ambos: 1, sug }, `${n} ${r}`, 'suelta');
    });
  }
  function efectos(txt) {
    // trabaja solo fuera de etiquetas ya generadas
    const trozos = txt.split(/(<[^>]+>[^<]*<\/[^>]+>|<[^>]+>)/);
    for (let i = 0; i < trozos.length; i += 2) {
      let t = trozos[i];
      for (const [re, f] of REGLAS_EFECTO) t = t.replace(re, f);
      trozos[i] = t;
    }
    // segunda pasada, solo sobre el texto que quedó sin fichas
    const t2 = trozos.join('').split(/(<[^>]+>[^<]*<\/[^>]+>|<[^>]+>)/);
    for (let i = 0; i < t2.length; i += 2) t2[i] = sueltas(t2[i]);
    return t2.join('');
  }

  /* ---------- inline ---------- */
  const SIMB = { '⚔': 'herida', '♫': 'canto', '◉': 'alerta', '⌛': 'tiempo', '⚙': 'objeto', '☰': 'reputacion', '★': 'hito' };
  const RE_PRUEBA = /^\[(Vigor|Reflejos|Ingenio|Voluntad)(?: o (Vigor|Reflejos|Ingenio|Voluntad))? · (\d+)(?: · (Desv|Vent)\.?)?\]$/;
  const RE_PISTA = /^([A-ZÁÉÍÓÚa-z][\wáéíóúñ ]+?) · ([^·]+?) · (e\d{3}|este evento)$/;
  const REGION_CORTA = { Dunas: 1, Cementerio: 2, Salinas: 3, Cañones: 4, Bosque: 5, Ciudad: 6, Torres: 7, Polo: 8, 'Cementerio de Naves': 2, 'Salinas Blancas': 3, 'Cañones de las Bestias': 4, 'Bosque Petrificado': 5, 'Ciudad Enterrada': 6, 'Torres del Canto': 7, 'Polo Helado': 8, 'Dunas de Óxido': 1 };
  T.REGION_CORTA = REGION_CORTA;

  T.GLOSARIO = {
    Precio: 'El <b>Precio</b> es lo que te piden por dejarte pasar sin pelear. Solo lo pagas si la plantilla que te toca lo pide, como el Peaje (r318). Si el evento no lo indica, son 2 Chatarra.',
    Botín: 'El <b>Botín</b> es lo que llevan encima y puedes ganarte, sobre todo si los vences o los espantas (r315, r319). Si el evento no lo indica, suele ser Chatarra.',
  };
  T.inline = function (src, ctx) {
    const activo = ctx && ctx.modo === 'evento';
    const S = ctx && ctx.S;
    const guard = [];
    const hold = (h) => `\u0000${guard.push(h) - 1}\u0000`;
    let t = esc(src);
    // código: pruebas, marcas, pistas
    t = t.replace(/`([^`]+)`/g, (m, c) => {
      const raw = c.replace(/&amp;/g, '&');
      const p = raw.match(RE_PRUEBA);
      if (p) {
        const attr = p[1], alt = p[2], dif = +p[3], mod = p[4] === 'Desv' ? 'D' : p[4] === 'Vent' ? 'V' : '';
        const lab = `${attr}${alt ? ' o ' + alt : ''} · ${dif}${mod ? (mod === 'D' ? ' · Desv.' : ' · Vent.') : ''}`;
        if (!activo) return hold(`<span class="tk prueba lectura">${T.ico('dado')}${esc(lab)}</span>`);
        return hold(`<button type="button" class="tk prueba" data-prueba="${esc(JSON.stringify({ attr, alt, dif, mod }))}" title="Tirar: 2d6 + ${attr} contra ${dif} (r120)">${T.ico('dado')}${esc(lab)}</button>`);
      }
      const pi = raw.match(RE_PISTA);
      // «esta región» / «región actual» y «este evento» se resuelven con la partida en curso
      const regAqui = pi && /^(esta región|región actual)$/i.test(pi[1]);
      if (pi && (REGION_CORTA[pi[1]] || regAqui)) {
        const evAqui = pi[3] === 'este evento' ? (S && S.escena && S.escena.id) : pi[3];
        const pista = { region: regAqui ? (S ? S.region : null) : REGION_CORTA[pi[1]], nombre: pi[2].trim(), ev: evAqui };
        if (!activo) return hold(`<span class="tk pista lectura">${T.ico('pista')}${esc(raw)}</span>`);
        return hold(`<button type="button" class="tk ef pista" data-ef="${esc(JSON.stringify({ k: 'pista', pista }))}">${T.ico('pista')}${esc(raw)}</button>`);
      }
      if (/^[A-ZÁÉÍÓÚÑ0-9_]{3,}$/.test(raw)) {
        const tiene = S && CB.motor.tiene(S, raw);
        if (['CULPA', 'ARRAIGO', 'MEMORIA'].includes(raw)) return hold(`<span class="marca contador">${raw}</span>`);
        if (!activo) return hold(`<a class="marca" href="#marca-${raw}" data-marca="${raw}">${raw.replace(/_/g, '_<wbr>')}</a>`);
        return hold(`<button type="button" class="marca tk${tiene ? ' tiene' : ''}" data-marca="${raw}" title="${tiene ? 'La tienes anotada' : 'No la tienes'} · toca para anotarla o borrarla (r191)">${raw.replace(/_/g, '_<wbr>')}</button>`);
      }
      return hold(`<code>${c}</code>`);
    });
    // contadores en efectos: +1 `ARRAIGO`, Baja tu `CULPA` en 1
    if (activo) {
      t = t.replace(/([+−-])(\d+) \u0000(\d+)\u0000/g, (m, s, n, i) => {
        const g = guard[+i];
        if (!/contador/.test(g)) return m;
        return hold(chip({ k: 'contador', d: SIGNO(s) * n }, `${s}${n} ${g.replace(/<[^>]+>/g, '')}`));
      });
      t = t.replace(/\b(Baja|baja|Sube|sube) (?:tu |el |la )?\u0000(\d+)\u0000 en (\d+)/g, (m, v, i, n) => {
        const g = guard[+i];
        if (!/contador/.test(g)) return m;
        return hold(chip({ k: 'contador', d: (/^[Bb]/.test(v) ? -1 : 1) * n }, m.replace(/\u0000\d+\u0000/, g.replace(/<[^>]+>/g, ''))));
      });
    }
    // enlaces del libro
    t = t.replace(/(→\s*)?\[([re]\d{3})\]\(#[re]\d{3}\)/g, (m, flecha, id) => {
      if (flecha && activo && id[0] === 'e') return hold(`<button type="button" class="tk ir" data-ir="${id}">${T.ico('ir')}<b>${id}</b><span>${esc(titulo(id))}</span></button>`);
      return (flecha ? '→ ' : '') + hold(refHTML(id));
    });
    // enemigos
    t = t.replace(new RegExp(CB.motor.RE_ENEMIGO.source + '\\*{0,2}', 'g'), (m) => {
      const en = CB.motor.leerEnemigo(m.replace(/&amp;/g, '&'));
      if (!en) return m;
      const tags = en.tags.map((x) => `<span class="etq">${esc(x)}</span>`).join('');
      const ficha = `<span class="enemigo"><b>${esc(en.n)}</b><span class="stat">Ataque <i>${en.atk}</i></span><span class="stat">Blind. <i>${en.bl}</i></span><span class="stat">Heridas <i>${en.h}</i></span>${tags}</span>`;
      if (!activo) return hold(ficha);
      return hold(`${ficha}<button type="button" class="tk combate" data-enemigo="${esc(JSON.stringify(en))}">${T.ico('combate')}Combatir</button>`);
    });
    // reglas citadas sueltas: (r140), r120, e020–e025
    t = t.replace(/\b([re]\d{3})\b/g, (m, id) => (CB.libro.entradas[id] ? hold(refHTML(id)) : m));
    // dados sueltos
    if (activo) t = t.replace(/\b([Tt]ira(?:s)? )?(\d?d(?:6|8|12|66))\b/g, (m, pre, dado) => hold(`${pre || ''}<button type="button" class="tk dado" data-dado="${dado}" title="Tirar ${dado}">${T.ico('dado')}${dado}</button>`));
    // efectos
    if (activo && ctx.sistema) t = t.replace(/\*\*(Precari[oa]|Sólid[oa]|Excelente)\*\*/g, (m, c) => '**' + chip({ k: 'sistema', s: ctx.sistema, cal: c.startsWith('Precari') ? 'Precaria' : c.startsWith('Sólid') ? 'Sólida' : 'Excelente' }, ctx.sistema + ' ' + c, 'nave') + '**');
    if (activo) t = efectos(t);
    // énfasis
    // términos de los encuentros que el libro usa sin definir donde aparecen: se pueden tocar
    t = t.replace(/(^|[\s(])(Precio|Botín)(?=:)/g, (m, pre, w) => pre + hold(`<button type="button" class="glosa" data-glosa="${w}" title="¿Qué es el ${w}?">${w}</button>`));
    t = t.replace(/\*\*((?:[^*]|\*[^*]+\*)+?)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*\w])\*([^*\n]+?)\*(?!\w)/g, '$1<em>$2</em>');
    // símbolos
    t = t.replace(/[⚔♫◉⌛⚙☰★]/g, (s) => {
      if (s === '★' && activo) return chip({ k: 'hito' }, T.ico('hito', 'sim') + 'Hito', 'hito');
      return T.ico(SIMB[s], 'sim');
    });
    // restaurar (dos pasadas por si hay anidados)
    for (let k = 0; k < 3; k++) t = t.replace(/\u0000(\d+)\u0000/g, (m, i) => guard[+i]);
    return t;
  };

  /* ---------- condiciones: ¿te aplica esta línea? ---------- */
  function aplica(txt, S) {
    if (!S) return null;
    const P = { 'el Piloto': 'piloto', 'el Nativo': 'nativo', 'la Mente': 'mente' };
    let m = txt.match(/^\s*(?:\*\*)?(?:-\s*)?[Ss]i eres (?:\*\*)?(el Piloto|el Nativo|la Mente)/);
    if (m) return S.prota === P[m[1]];
    m = txt.match(/\((?:solo )?(el Piloto|el Nativo|la Mente)[),]/);
    if (m && txt.indexOf(m[0]) < 80) return S.prota === P[m[1]];
    m = txt.match(/^\s*(?:\*\*)?[Ss]i (?:tienes|llevas) (?:\*\*)?`([A-ZÁÉÍÓÚÑ0-9_]+)`/);
    if (m) return CB.motor.tiene(S, m[1]);
    m = txt.match(/\((?:si|solo si|solo con) (?:tienes )?`([A-ZÁÉÍÓÚÑ0-9_]+)`/);
    if (m) return CB.motor.tiene(S, m[1]);
    m = txt.match(/^\s*(?:\*\*)?[Ss]i no tienes `([A-ZÁÉÍÓÚÑ0-9_]+)`/);
    if (m) return !CB.motor.tiene(S, m[1]);
    return null;
  }

  /* ---------- ramas: Éxito / Fallo / Si ganas ---------- */
  const RE_RAMA = /\*(Éxito pleno|Éxito|Fallo):\*/g;
  function partirRamas(txt) {
    const marcas = [...txt.matchAll(RE_RAMA)];
    if (!marcas.length) return null;
    const cab = txt.slice(0, marcas[0].index).trim();
    const ramas = marcas.map((m, i) => ({ k: m[1] === 'Éxito pleno' ? 'pl' : m[1] === 'Éxito' ? 'ex' : 'fa', et: m[1], t: txt.slice(m.index + m[0].length, i + 1 < marcas.length ? marcas[i + 1].index : txt.length).trim() }));
    return { cab, ramas };
  }
  const RE_SI = /^\*\*Si (ganas|huyes|hablas|pasas|pierdes)[.:]?\*\*/;

  /* ---------- bloques ---------- */
  T.render = function (md, ctx = {}) {
    const lineas = String(md || '').split('\n');
    const out = [];
    let i = 0;
    const inl = (s) => T.inline(s, ctx);
    while (i < lineas.length) {
      const l = lineas[i];
      if (!l.trim()) { i++; continue; }
      if (/^```/.test(l)) {
        const buf = [];
        i++;
        while (i < lineas.length && !/^```/.test(lineas[i])) buf.push(lineas[i++]);
        i++;
        if (CB.libro && CB.libro.mapa_svg && /POLO HELADO/.test(buf.join(' '))) out.push(`<figure class="mapa-libro">${CB.libro.mapa_svg}<figcaption>Toca una región para abrir su tabla de exploración.</figcaption></figure>`);
        else out.push(`<pre class="terminal">${esc(buf.join('\n'))}</pre>`);
        continue;
      }
      if (/^-{3,}\s*$/.test(l)) { out.push('<hr>'); i++; continue; }
      const h = l.match(/^(#{2,4}) (.+)$/);
      if (h) { out.push(`<h${h[1].length + 1} class="md-h">${inl(h[2])}</h${h[1].length + 1}>`); i++; continue; }
      if (/^\|/.test(l)) {
        const filas = [];
        while (i < lineas.length && /^\|/.test(lineas[i])) filas.push(lineas[i++]);
        out.push(tabla(filas, inl));
        continue;
      }
      if (/^>/.test(l)) {
        const buf = [];
        while (i < lineas.length && /^>/.test(lineas[i])) buf.push(lineas[i++].replace(/^>\s?/, ''));
        const txt = buf.join('\n');
        if (CB.motor.RE_ENEMIGO.test(txt)) out.push(`<div class="bloque-enemigo">${inl(txt)}</div>`);
        else out.push(`<blockquote class="cita">${buf.map((b) => (b.trim() ? inl(b) : '')).join('<br>')}</blockquote>`);
        continue;
      }
      if (/^\s*(\d+\.|[-*])\s+/.test(l)) {
        const items = [];
        while (i < lineas.length && (/^\s*(\d+\.|[-*])\s+/.test(lineas[i]) || (/^\s{2,}\S/.test(lineas[i]) && items.length))) {
          const m = lineas[i].match(/^(\s*)(\d+\.|[-*])\s+(.*)$/);
          if (m) items.push({ ind: m[1].length, ord: /\d/.test(m[2]), num: parseInt(m[2]), txt: m[3] });
          else items[items.length - 1].txt += ' ' + lineas[i].trim();
          i++;
        }
        out.push(lista(items, 0, inl, ctx).html);
        continue;
      }
      const buf = [l];
      i++;
      while (i < lineas.length && lineas[i].trim() && !/^(\s*(\d+\.|[-*])\s|\||>|#{2,4} |```|-{3,})/.test(lineas[i])) buf.push(lineas[i++]);
      out.push(parrafo(buf.join(' '), inl, ctx));
    }
    return out.join('\n');
  };

  function parrafo(txt, inl, ctx) {
    const r = partirRamas(txt);
    const ap = aplica(txt, ctx.S);
    const cls = ap === true ? ' aplica' : ap === false ? ' no-aplica' : '';
    if (/^\*[^*].*\*$/.test(txt.trim()) && !r) return `<p class="nota${cls}">${inl(txt.trim().slice(1, -1))}</p>`;
    if (/^\*\*Encuentro \(r300\)\.?\*\*/.test(txt) && ctx.modo === 'evento') {
      return `<div class="encuentro-r300"><p>${inl(txt)}</p><button type="button" class="tk plantilla" data-plantilla="1">${T.ico('dado')}Elegir postura y tirar (r300)</button></div>`;
    }
    if (!r) return `<p class="${cls.trim()}">${inl(txt)}</p>`;
    return `<div class="con-ramas${cls}">${r.cab ? `<p>${inl(r.cab)}</p>` : ''}${ramasHTML(r.ramas, inl)}</div>`;
  }
  function ramasHTML(ramas, inl) {
    return `<div class="ramas">${ramas.map((x) => `<div class="rama" data-rama="${x.k}"><span class="rama-et">${x.et}</span><span class="rama-t">${inl(x.t)}</span></div>`).join('')}</div>`;
  }
  function lista(items, desde, inl, ctx) {
    const base = items[desde].ind;
    const ord = items[desde].ord;
    let html = '';
    let i = desde;
    let nOp = 0;
    while (i < items.length && items[i].ind >= base) {
      const it = items[i];
      if (it.ind > base) { i++; continue; }
      // hijos
      let j = i + 1;
      let hijos = '';
      if (j < items.length && items[j].ind > base) {
        const sub = lista(items, j, inl, ctx);
        hijos = sub.html;
        j = sub.fin;
      }
      const ap = aplica(it.txt, ctx.S);
      const clsAp = ap === true ? ' aplica' : ap === false ? ' no-aplica' : '';
      const r = partirRamas(it.txt);
      let cuerpo;
      if (r) cuerpo = `${r.cab ? `<div class="li-cab">${inl(r.cab)}</div>` : ''}${ramasHTML(r.ramas, inl)}`;
      else {
        const rm = it.txt.match(/^\*(Éxito pleno|Éxito|Fallo):\*\s*(.*)$/);
        const si = it.txt.match(RE_SI);
        if (rm) cuerpo = `<div class="rama" data-rama="${rm[1] === 'Éxito pleno' ? 'pl' : rm[1] === 'Éxito' ? 'ex' : 'fa'}"><span class="rama-et">${rm[1]}</span><span class="rama-t">${inl(rm[2])}</span></div>`;
        else if (si) cuerpo = `<div class="rama-si" data-si="${si[1]}">${inl(it.txt)}</div>`;
        else cuerpo = inl(it.txt);
      }
      if (ord && base === 0 && ctx.modo === 'evento') {
        nOp++;
        const tit = it.txt.match(/^\*\*(.+?)\*\*/);
        html += `<li class="opcion${clsAp}" data-op="${it.num || nOp}"><div class="op-num">${it.num || nOp}</div><div class="op-cuerpo">${cuerpo}${hijos}</div>${tit ? `<button type="button" class="op-elegir" data-elegir="${it.num || nOp}">Elegir</button>` : ''}</li>`;
      } else html += `<li class="${clsAp.trim()}">${cuerpo}${hijos}</li>`;
      i = j;
    }
    const tag = ord ? 'ol' : 'ul';
    const cls = ord && base === 0 && ctx.modo === 'evento' ? ' class="opciones"' : ord ? ' class="num"' : '';
    return { html: `<${tag}${cls}>${html}</${tag}>`, fin: i };
  }
  function tabla(filas, inl) {
    const celdas = (f) => f.replace(/^\||\|\s*$/g, '').split('|').map((c) => c.trim());
    const cab = celdas(filas[0]);
    const cuerpo = filas.slice(2).map(celdas);
    const num = cuerpo.length && cuerpo.every((c) => /^[\d–+\-\s]+$/.test(c[0].replace(/\*\*/g, '')));
    return `<div class="tabla-env"><table class="${num ? 'tirada' : ''}"><thead><tr>${cab.map((c) => `<th>${inl(c)}</th>`).join('')}</tr></thead><tbody>${cuerpo
      .map((c) => `<tr data-fila="${esc(c[0].replace(/\*\*/g, ''))}">${c.map((x) => `<td>${inl(x)}</td>`).join('')}</tr>`)
      .join('')}</tbody></table></div>`;
  }

  /** ¿una fila de tabla ("1–3", "14+", "7") contiene este número? */
  T.filaContiene = function (fila, n) {
    const f = String(fila).replace(/\s/g, '');
    let m = f.match(/^(\d+)[–-](\d+)$/);
    if (m) return n >= +m[1] && n <= +m[2];
    m = f.match(/^(\d+)\+$/);
    if (m) return n >= +m[1];
    return +f === n;
  };

  /** texto plano para buscar */
  T.plano = (md) => String(md || '').replace(/<[^>]+>/g, ' ').replace(/[`*_#>|]/g, ' ').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\s+/g, ' ');
})();
