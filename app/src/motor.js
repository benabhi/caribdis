/* =====================================================================
   CARIBDIS · motor
   Las reglas del libro como funciones puras sobre el estado `S`.
   No toca el DOM ni tira dados: recibe los dados ya tirados (por la
   bandeja 3D o por el jugador con dados de verdad) y devuelve qué pasó,
   siempre con las reglas que lo explican. Así se puede portar tal cual a
   otra plataforma (web, escritorio, móvil).
   ===================================================================== */
'use strict';
(function () {
  const { clamp, copia } = CB.u;
  const D = CB.D;
  const M = (CB.motor = {});

  /* ---------------- creación ---------------- */
  M.nueva = function (cfg) {
    const P = D.PROTAS[cfg.prota];
    const modo = D.MODOS[cfg.modo || 'estandar'];
    const dif = D.DIFICULTADES[cfg.dificultad || 'superviviente'];
    let reloj = cfg.modo === 'estandar' ? dif.reloj : modo.reloj;
    const S = {
      v: 1, id: CB.u.uid(), creado: Date.now(),
      prota: cfg.prota, nombre: cfg.nombre || P.N, nave: cfg.nave || 'Sin nombre',
      modo: cfg.modo || 'estandar', dificultad: cfg.dificultad || 'superviviente', estacion: cfg.estacion || null,
      attr: copia(cfg.attr),
      origen: cfg.origen, // [n, hab, obj, marca]
      rasgos: cfg.rasgos.slice(), habilidades: [], mejoras: 0,
      heridas: 0, nivelesHerida: 4,
      temple: dif.temple, templeMax: 3,
      aire: P.recursos.aire, energia: P.recursos.energia, raciones: P.recursos.raciones,
      canto: 0, chatarra: 3,
      contador: P.contador.ini,
      rep: { hijos: 0, desguaces: 0, coro: 0, vigias: 0 },
      alerta: modo.alerta, reloj, dia: 0, region: 1,
      pistas: [], marcas: [], equipo: [], reliquias: [],
      arma: 'Puños', proteccion: cfg.prota === 'mente' ? 'Chasis' : 'Traje de vuelo',
      piezas: { cobre: 0, hueso: 0, cristal: 0, luz: 0 }, planos: P.planos.slice(), obras: {},
      sistemas: {}, despensa: 15, guardado: [],
      tripu: {}, conocidos: { peregrina: 0, perro: 0, mirasoles: 0 },
      vehiculo: null, secreto: null, clima: null,
      hoy: { accion: null, descanso: false, cubierto: false },
      ayerCubierto: false,
      historiaLeida: [], cola: [], avisos: [], notas: [], bitacora: [],
      escena: { tipo: 'evento', id: 'e001', origen: 'prologo' },
      fin: null, umbrales: {},
    };
    for (const s of D.SISTEMAS) S.sistemas[s] = { estado: 'perdido', cal: null, region: null };
    S.sistemas.Personal = { estado: 'oculto', cal: null, region: null, n: P.personal };
    for (const t in D.TRIPULACION) S.tripu[t] = { estado: 'perdido', region: null, lealtad: 2, heridas: 0 };
    // origen: objeto, Marca, extras
    const [, , obj, marca] = cfg.origen;
    S.marcas.push(marca);
    if (obj === '4 Chatarra extra') S.chatarra += 4;
    else if (D.ARMAS[obj]) S.arma = obj;
    else if (D.PROTECCIONES[obj]) S.proteccion = obj;
    else if (obj && obj !== 'Nada') S.equipo.push(obj);
    if (marca === 'MIRASOL') S.templeMax += 1;
    if (cfg.prota === 'nativo') { S.rep.desguaces = -1; S.rep.hijos = 1; }
    if (cfg.prota === 'mente') S.blindajeBase = 2;
    if (S.rasgos.includes('e714')) S.nivelesHerida = 5;
    S.temple = Math.min(S.temple, S.templeMax);
    if (cfg.modo === 'leyenda' || cfg.dificultad === 'leyenda') S.alerta = Math.max(2, S.alerta);
    if (cfg.modo === 'corta') S.sistemas.Personal = { estado: 'instalado', cal: 'Precaria', region: null, n: P.personal };
    S.marcas.push('BALIZA_ACTIVA');
    M.log(S, `${S.nombre} (${P.n}) despierta entre los restos de la ${S.nave}.`, ['r100']);
    return S;
  };

  /** r108 · preparar la partida con los dados ya tirados */
  M.preparar = function (S, t) {
    D.SISTEMAS.forEach((s, i) => (S.sistemas[s].region = t.sistemas[i]));
    Object.keys(D.TRIPULACION).forEach((n, i) => (S.tripu[n].region = t.tripu[i]));
    if (t.compa) {
      S.tripu[t.compa].estado = 'contigo';
      S.tripu[t.compa].region = null;
    }
    if (S.modo === 'corta' && t.esperando) S.tripu[t.esperando] = { estado: 'cicatriz', region: null, lealtad: 2, heridas: 0 };
    if (S.estacion == null && t.estacion) S.estacion = t.estacion;
    M.log(S, 'Partida preparada: los pecios y la tripulación repartidos por Caribdis. El Secreto lo dirán tus FRAGMENTO_.', ['r108']);
  };

  /* ---------------- consultas ---------------- */
  M.P = (S) => D.PROTAS[S.prota];
  M.reg = (S) => D.REGIONES[S.region];
  M.enCicatriz = (S) => S.region === 1;
  M.pen = (S) => D.PEN_HERIDA[Math.min(S.heridas, 4)] ?? -2;
  M.nivel = (S) => D.NIVELES_HERIDA[Math.min(S.heridas, 4)];
  M.tiene = (S, m) => (m.endsWith('_') ? S.marcas.some((x) => x.startsWith(m)) : S.marcas.includes(m));
  M.compas = (S) => Object.keys(S.tripu).filter((n) => S.tripu[n].estado === 'contigo');
  M.cuentaFragmentos = (S) => new Set(S.marcas.filter((m) => m.startsWith('FRAGMENTO_'))).size;
  /** r191 · cuántos FRAGMENTO_ apuntan a cada verdad (1–6), en el orden en que se anotaron */
  M.verdades = (S) => {
    const V = (CB.libro && CB.libro.verdades) || {};
    const cuenta = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const orden = [];
    S.marcas.forEach((m) => { const v = V[m]; if (v) { cuenta[v] += 1; orden.push(v); } });
    return { cuenta, orden };
  };
  /** e840 · la verdad que más se repite; empate: la del último anotado; sin ninguno: null (se tira 1d6) */
  M.secretoContado = (S) => {
    const { cuenta, orden } = M.verdades(S);
    const max = Math.max(...Object.values(cuenta));
    if (!max) return null;
    for (let i = orden.length - 1; i >= 0; i--) if (cuenta[orden[i]] === max) return orden[i];
    return null;
  };
  /** e840 · fija el Secreto (una sola vez). Devuelve {v, azar} */
  M.fijarSecreto = (S) => {
    if (S.secreto != null) return { v: S.secreto, azar: false, ya: true };
    let v = M.secretoContado(S), azar = false;
    if (v == null) { v = CB.u.d(6); azar = true; }
    S.secreto = v;
    M.log(S, azar ? `No tenías ningún FRAGMENTO_: tiras 1d6 y sale ${v}. Tu Secreto es el ${v}.` : `Cuentas tus FRAGMENTO_: tu Secreto es el ${v}.`, ['e840'], { ev: 'e84' + v });
    return { v, azar, ya: false };
  };
  M.llevaPesado = (S) => D.PESADOS.filter((s) => S.sistemas[s].estado === 'llevado').length;
  M.blindaje = (S) => {
    let b = (D.PROTECCIONES[S.proteccion] || { bl: 0 }).bl;
    if (S.prota === 'mente' && S.proteccion !== 'Chasis') b += 2;
    if (S.rasgos.includes('e710')) b += 1;
    if (S.habilidades.includes('Piel vieja')) b += 1;
    return b;
  };
  M.arma = (S) => Object.assign({ n: S.arma }, D.ARMAS[S.arma] || { atk: 0 });
  /** atributo efectivo con su desglose (r101, r106, r107, r180) */
  M.atributo = function (S, a) {
    const partes = [{ t: a, v: S.attr[a] }];
    if (a === 'Reflejos') {
      const pr = D.PROTECCIONES[S.proteccion];
      if (pr && pr.reflejos) partes.push({ t: S.proteccion, v: pr.reflejos, r: 'r107' });
      if (M.llevaPesado(S) && !S.rasgos.includes('e701')) partes.push({ t: 'Sistema pesado', v: -1, r: 'r180' });
    }
    const p = M.pen(S);
    if (p) partes.push({ t: M.nivel(S), v: p, r: 'r106' });
    return { total: partes.reduce((s, x) => s + x.v, 0), partes };
  };
  M.diaHistoria = (S) => D.MODOS[S.modo].historia;
  M.SISTEMA_DE_EVENTO = { e560: 'Casco', e561: 'Casco', e562: 'Motor', e563: 'Motor', e564: 'Navegación', e565: 'Navegación', e566: 'Soporte vital', e567: 'Soporte vital', e568: 'Combustible', e569: 'Combustible', e404: 'Casco', e414: 'Motor', e416: 'Soporte vital', e242: 'Combustible', e405: 'Combustible', e261: 'Soporte vital', e329: 'Casco', e613: 'Navegación', e426: 'Navegación', e432: 'Motor', e203: 'Casco' };

  /* ---------------- bitácora y avisos ---------------- */
  M.log = function (S, txt, reglas = [], extra = {}) {
    S.bitacora.push(Object.assign({ dia: S.dia, reloj: S.reloj, txt, reglas }, extra));
    if (S.bitacora.length > 600) S.bitacora.splice(0, S.bitacora.length - 600);
  };
  /** un aviso es algo que el libro te manda hacer ya (ir a un evento) */
  M.avisar = function (S, a) {
    if (S.avisos.some((x) => x.clave === a.clave)) return;
    S.avisos.push(a);
  };

  /* ---------------- cambios de recursos ---------------- */
  const TOPE = { aire: [0, 6], energia: [0, 6], raciones: [0, 8], canto: [0, 6], temple: [0, 9], chatarra: [0, 999], contador: [0, 6], despensa: [0, 99], alerta: [1, 4] };
  const NOMBRE = { aire: 'Aire', energia: 'Energía', raciones: 'Raciones', canto: 'Canto', temple: 'Temple', chatarra: 'Chatarra', alerta: 'Alerta', reloj: 'Reloj', heridas: 'Heridas', despensa: 'Despensa' };
  const REGLA = { aire: 'r136', energia: 'r136', raciones: 'r136', canto: 'r137', temple: 'r122', chatarra: 'r106', alerta: 'r135', reloj: 'r134', heridas: 'r106', contador: 'r102' };
  M.NOMBRE = NOMBRE;

  /**
   * Cambia un registro aplicando sus reglas. Devuelve {antes, despues, notas}.
   * k: aire|energia|raciones|canto|temple|chatarra|alerta|reloj|heridas|contador|rep:faccion|pieza:tipo|despensa
   */
  M.cambiar = function (S, k, d, fuente = '', opts = {}) {
    const notas = [];
    if (!d) return { antes: 0, despues: 0, notas };
    if (k.startsWith('rep:')) return cambiarRep(S, k.slice(4), d, fuente, opts);
    if (k.startsWith('pieza:')) {
      const p = k.slice(6);
      S.piezas[p] = Math.max(0, (S.piezas[p] || 0) + d);
      if (p === 'luz' && d > 0) { M.cambiar(S, 'canto', 1, 'Luz fría (r201)'); notas.push('La Luz fría canta: +1 Canto (r201).'); }
      M.log(S, `${CB.u.firma(d)} ${D.PIEZAS[p]}${fuente ? ' · ' + fuente : ''}`, ['r201']);
      return { notas };
    }
    if (k === 'heridas') return d > 0 ? M.herir(S, d, fuente) : M.curar(S, -d, fuente);
    if (k === 'reloj') {
      if (S.reloj == null) return { notas };
      const antes = S.reloj;
      S.reloj = Math.max(0, S.reloj + d);
      M.log(S, `Reloj ${antes} → ${S.reloj}${fuente ? ' · ' + fuente : ''}`, ['r134']);
      if (S.reloj <= 0 && !S.despegando && S.modo !== 'naufrago') M.avisar(S, { clave: 'reloj0', ev: 'e919', regla: 'r134', txt: 'El Reloj llegó a 0: los Recolectores han llegado.' });
      return { antes, despues: S.reloj, notas };
    }
    if (k === 'alerta' && d > 0 && S.alerta >= 4) {
      // r135: ya en 4 y sube → el Reloj baja 2
      notas.push('La Alerta ya estaba en 4: el Reloj baja 2 (r135).');
      M.log(S, 'La Alerta no puede subir de 4: los Recolectores han oído algo.', ['r135']);
      M.cambiar(S, 'reloj', -2, 'Alerta desbordada');
      return { antes: 4, despues: 4, notas };
    }
    if (k === 'canto' && d > 0 && S.reliquias.some((r) => r.id === 'e741')) {
      if (S.canto >= 4) { notas.push('El Ancla negra no deja que el Canto pase de 4 (e741).'); return { notas }; }
    }
    let [lo, hi] = TOPE[k] || [-999, 999];
    if (k === 'temple') hi = S.templeMax;
    if (k === 'alerta') lo = M.alertaMin(S);
    const antes = S[k];
    S[k] = clamp(S[k] + d, lo, hi);
    const real = S[k] - antes;
    const nom = k === 'contador' ? M.P(S).contador.n : NOMBRE[k];
    M.log(S, `${nom} ${antes} → ${S[k]}${fuente ? ' · ' + fuente : ''}${real !== d ? ` (tope ${d > 0 ? hi : lo})` : ''}`, [REGLA[k]]);
    if (k === 'alerta' && d < 0 && real === 0 && lo > 1) notas.push(M.tiene(S, 'BALIZA_ACTIVA') ? 'Con BALIZA_ACTIVA, una vez que la Alerta llega a 2 ya no baja de ahí (r135).' : 'En Leyenda la Alerta nunca baja de 2 (r210).');
    if (k === 'canto' && S.canto >= 6 && antes < 6) {
      M.avisar(S, { clave: 'canto6-' + S.dia + '-' + S.bitacora.length, ev: M.P(S).canto6, regla: 'r137', txt: 'Tu Canto llegó a 6. Lee tu evento; después, el Canto baja a 4.', despues: { canto: 4 } });
    }
    if (k === 'canto' && d > 0 && S.prota === 'nativo' && S.canto >= 3) {
      M.avisar(S, { clave: 'inest-' + S.bitacora.length, tipo: 'tirada', regla: 'r103', txt: 'Inestabilidad: tu Canto quedó en 3 o más. Tira 1d6: con un 1 ganas una mutación nueva al azar.', tirada: 'inestabilidad' });
    }
    if (k === 'contador') {
      const C = M.P(S).contador;
      if (S.contador <= 0 && C.bajo && !S.umbrales.bajo) { S.umbrales.bajo = 1; M.avisar(S, { clave: 'cont0', ev: C.bajo, regla: M.P(S).regla, txt: `Tu ${C.n} llegó a 0.` }); }
      if (S.contador >= 6 && C.alto && !S.umbrales.alto) { S.umbrales.alto = 1; M.avisar(S, { clave: 'cont6', ev: C.alto, regla: M.P(S).regla, txt: `Tu ${C.n} llegó a 6.` }); }
    }
    return { antes, despues: S[k], notas };
  };
  M.alertaMin = (S) => (S.dificultad === 'leyenda' || (M.tiene(S, 'BALIZA_ACTIVA') && S.alerta >= 2) ? 2 : 1);

  function cambiarRep(S, f, d, fuente, opts) {
    const F = D.FACCIONES[f];
    const antes = S.rep[f];
    S.rep[f] = clamp(antes + d, -3, 3);
    M.log(S, `Reputación con ${F.n}: ${antes} → ${S.rep[f]}${fuente ? ' · ' + fuente : ''}`, ['r194']);
    const notas = [];
    if (S.rep[f] === 3 && antes < 3 && !S.umbrales['aliado-' + f] && (S.umbrales['aliado-' + f] = 1)) M.avisar(S, { clave: 'aliado-' + f, tipo: 'pendiente', ev: F.aliado, regla: 'r194', txt: `+3 con ${F.n}: la próxima vez que estés en su asentamiento → ${F.aliado}.` });
    if (S.rep[f] === -3 && antes > -3 && !S.umbrales['enemigo-' + f] && (S.umbrales['enemigo-' + f] = 1)) M.avisar(S, { clave: 'enemigo-' + f, tipo: 'pendiente', ev: F.enemigo, regla: 'r194', txt: `−3 con ${F.n}: la próxima vez que estés en su región, tira 1d6; con 1–3 → ${F.enemigo} (solo esa vez).` });
    // r194 enemistades
    if (d > 0 && !opts.sinRival) {
      notas.push(`Enemistad: ganar con ${F.n} cuesta 1 con ${D.FACCIONES[F.rival].n} (r194).`);
      cambiarRep(S, F.rival, -1, 'enemistad', { sinRival: true });
      if (f !== 'hijos' && S.habilidades.includes('Voz de la tribu')) cambiarRep(S, 'hijos', 1, 'Voz de la tribu', { sinRival: true });
    }
    return { antes, despues: S.rep[f], notas };
  }

  /* ---------------- heridas, caer ---------------- */
  M.herir = function (S, n, fuente = '') {
    const notas = [];
    for (let i = 0; i < n; i++) {
      if (S.heridas >= S.nivelesHerida) {
        // ya estaba en Crítico: cae (r195)
        notas.push(...M.caer(S, fuente).notas);
        return { notas, cayo: true };
      }
      S.heridas += 1;
    }
    M.log(S, `${n} ${S.prota === 'mente' ? 'Daño' : CB.u.plural(n, 'Herida')}${fuente ? ' · ' + fuente : ''} → ${M.nivel(S)}`, ['r106']);
    return { notas };
  };
  M.curar = function (S, n, fuente = '') {
    const antes = S.heridas;
    S.heridas = Math.max(0, S.heridas - n);
    if (antes !== S.heridas) M.log(S, `Curas ${antes - S.heridas} ${S.prota === 'mente' ? 'Daño' : CB.u.plural(antes - S.heridas, 'Herida')}${fuente ? ' · ' + fuente : ''} → ${M.nivel(S)}`, ['r133']);
    return { notas: [] };
  };
  /** r195 · Caer */
  M.caer = function (S, fuente) {
    const notas = [];
    const coste = 1;
    if (S.temple >= coste) {
      S.temple -= coste;
      S.heridas = S.nivelesHerida;
      const perdidas = `${S.raciones} Raciones y ${S.chatarra} Chatarra`;
      S.raciones = 0; S.chatarra = 0;
      M.log(S, `Caes${fuente ? ' (' + fuente + ')' : ''}. Gastas 1 Temple: despiertas en Crítico. Alguien te registró: pierdes ${perdidas}.`, ['r195']);
      M.cambiar(S, 'reloj', -2, 'Caer (r195)');
      notas.push('Caíste: gastas 1 Temple, el Reloj baja 2 y pierdes Raciones y Chatarra (r195).');
    } else if (S.habilidades.includes('Copia de seguridad') && !S.umbrales.copia) {
      S.umbrales.copia = 1; S.heridas = 3; S.region = 1;
      M.log(S, 'Caes, pero tu Copia de seguridad te despierta en la Cicatriz con Daño 3.', ['r190']);
      notas.push('Copia de seguridad: vuelves en la Cicatriz (r190).');
    } else {
      M.log(S, 'Caes sin Temple.', ['r195']);
      M.avisar(S, { clave: 'muerte', ev: 'e920', regla: 'r195', txt: 'Caíste sin Temple que gastar.' });
      notas.push('Sin Temple, caer es el final (r195 → e920).');
    }
    return { notas };
  };

  /* ---------------- recordatorios: efectos que el libro deja «para la próxima vez» ---------------- */
  // tipo: 'fallo' (ignora un Fallo), 'ventaja' (Ventaja en una prueba) o 'nota' (lo aplicas tú)
  // cuando: en qué tirada se ofrece ('explorar', 'orientacion', 'instalar', 'prueba') o null
  M.clasificarNota = function (S, txt) {
    const t = txt.toLowerCase();
    const tipo = /ignora un fallo|cuenta como éxito/.test(t) ? 'fallo' : /(?<!des)ventaja/.test(t) ? 'ventaja' : 'nota';
    const cuando = /orientaci/.test(t) ? 'orientacion' : /explor/.test(t) ? 'explorar' : /instal/.test(t) ? 'instalar' : /prueba/.test(t) ? 'prueba' : null;
    let region = null;
    if (/su región|elige una región|tripulante/.test(t)) region = null;
    else if (/esta región|allí|aquí/.test(t)) region = S.region;
    else for (const [k, v] of Object.entries(CB.texto ? CB.texto.REGION_CORTA || {} : {})) if (t.includes(k.toLowerCase())) { region = v; break; }
    return { tipo, cuando, region };
  };
  M.notaNueva = function (S, txt, ev, extra = {}) {
    S.notas = S.notas || [];
    if (S.notas.some((n) => n.txt === txt && n.ev === ev)) return null;
    const n = Object.assign({ id: CB.u.uid(), txt, ev, dia: S.dia }, M.clasificarNota(S, txt), extra);
    S.notas.push(n);
    M.log(S, `Recordatorio anotado (${ev || 'a mano'}): ${txt}`, ev ? [ev] : []);
    return n;
  };
  M.notaUsada = function (S, id, como = 'usado') {
    const n = (S.notas || []).find((x) => x.id === id);
    if (!n) return;
    S.notas = S.notas.filter((x) => x.id !== id);
    M.log(S, `Recordatorio ${como}${n.ev ? ' (' + n.ev + ')' : ''}: ${n.txt}`, n.ev ? [n.ev] : []);
  };
  /** recordatorios que se ofrecen en una tirada: los de esta región (o sin región) y del momento que encaja */
  M.notasPara = function (S, tipo, contexto) {
    return (S.notas || []).filter((n) => n.tipo === tipo && (n.region == null || n.region === S.region)
      && (!n.cuando || n.cuando === 'prueba' || n.cuando === contexto || (tipo === 'fallo' && n.cuando === 'explorar')));
  };

  /* ---------------- marcas, pistas, objetos ---------------- */
  M.marcar = function (S, m, si = true, fuente = '') {
    const ya = S.marcas.includes(m);
    if (si && !ya) {
      S.marcas.push(m);
      M.log(S, `Anotas la Marca ${m}${fuente ? ' · ' + fuente : ''}`, ['r191']);
      if (m === 'BALIZA_MUDA' || m === 'BALIZA_ROTA') M.marcar(S, 'BALIZA_ACTIVA', false);
      if (m === 'SECRETO_DESCUBIERTO') M.fijarSecreto(S);
      if (m.startsWith('FRAGMENTO_')) {
        if (S.rasgos.includes('e715')) M.cambiar(S, 'temple', 1, 'Oído profundo (e715)');
        if (M.cuentaFragmentos(S) >= 3 && !S.umbrales.verdad) {
          S.umbrales.verdad = 1;
          M.avisar(S, { clave: 'verdad', ev: 'e840', regla: 'r191', txt: 'Tienes 3 FRAGMENTO_ distintos: ve inmediatamente a e840.' });
        }
      }
    } else if (!si && ya) {
      S.marcas = S.marcas.filter((x) => x !== m);
      if (m === 'SECRETO_DESCUBIERTO') S.secreto = null;
      M.log(S, `Borras la Marca ${m}${fuente ? ' · ' + fuente : ''}`, ['r191']);
    }
  };
  M.pista = function (S, p) {
    if (S.pistas.some((x) => x.ev === p.ev)) return { notas: ['Ya tenías esa Pista.'] };
    const notas = [];
    if (S.pistas.length >= 5) { const fuera = S.pistas.shift(); notas.push(`Solo caben 5 Pistas: se borra «${fuera.nombre}» (r192).`); }
    S.pistas.push(p);
    M.log(S, `Pista: ${D.REGIONES[p.region]?.corto || p.region} · ${p.nombre} · ${p.ev}`, ['r192']);
    return { notas };
  };
  M.reliquia = function (S, aspectoDado) {
    if (S.reliquias.length >= 6) return { notas: ['Ya llevas 6 reliquias: guarda alguna en la Cicatriz (r106).'] };
    const aspecto = D.ASPECTOS_RELIQUIA[aspectoDado] || D.ASPECTOS_RELIQUIA[CB.u.d(6)];
    S.reliquias.push({ uid: CB.u.uid(), aspecto, id: null });
    M.log(S, `Reliquia sin identificar: ${aspecto.toLowerCase()}.`, ['r193']);
    return { notas: [] };
  };
  /** r193 · identificar: total = 2d6 + Ingenio; d = 1d6 para elegir de la fila */
  M.filaReliquia = (total) => D.IDENT_RELIQUIA.findIndex((f) => total <= f[0]);
  M.identificar = function (S, uid, id) {
    const r = S.reliquias.find((x) => x.uid === uid);
    if (!r) return;
    r.id = id;
    M.log(S, `Identificas la reliquia: ${CB.libro.titulo(id)} (${id}).`, ['r193']);
    if (id === 'e746') M.cambiar(S, 'rep:vigias', 1, 'Llave de los Vigías');
  };
  M.objeto = function (S, nombre, si = true) {
    if (si) {
      if (D.ARMAS[nombre] && S.arma === 'Puños') S.arma = nombre;
      else if (D.PROTECCIONES[nombre] && ['Traje de vuelo'].includes(S.proteccion)) S.proteccion = nombre;
      else S.equipo.push(nombre);
      M.log(S, `Ganas: ${nombre}.`, ['r106']);
    } else {
      const i = S.equipo.indexOf(nombre);
      if (i >= 0) S.equipo.splice(i, 1);
      else if (S.arma === nombre) S.arma = 'Puños';
      M.log(S, `Pierdes: ${nombre}.`, ['r106']);
    }
  };

  /* ---------------- sistemas y tripulación ---------------- */
  M.conseguirSistema = function (S, s, cal, fuente = '') {
    const sis = S.sistemas[s];
    if (sis.estado === 'instalado') {
      M.log(S, `${s} ya estaba instalado: lo nuevo no sirve.`, ['r180']);
      return { notas: [`Ya tenías el ${s} instalado.`] };
    }
    const notas = [];
    if (D.PESADOS.includes(s) && M.llevaPesado(S) >= (M.tiene(S, 'ESTIBADORA') ? 2 : 1)) notas.push('Ya llevas un sistema pesado (r180): deja uno aquí, anota la región y recógelo al volver.');
    sis.estado = 'llevado'; sis.cal = cal;
    M.log(S, `Consigues el ${s} (${cal})${fuente ? ' · ' + fuente : ''}. Llévalo a la Cicatriz para instalarlo.`, ['r180', 'r181']);
    if (D.PESADOS.includes(s)) notas.push(`El ${s} es pesado: −1 a Reflejos mientras lo lleves (r180).`);
    return { notas };
  };
  M.instalar = function (S, s, resultado) {
    const sis = S.sistemas[s];
    if (resultado === 'fa') {
      M.cambiar(S, 'chatarra', -1, 'instalación fallida');
      M.log(S, `No consigues instalar el ${s}. Puedes reintentarlo otro día.`, ['r181']);
      return { ok: false };
    }
    let cal = sis.cal || 'Precaria';
    const sube = (resultado === 'pl' ? 1 : 0) + (S.habilidades.includes('Enjambre de reparación') ? 1 : 0);
    cal = D.CALIDADES[Math.min(2, D.CALIDADES.indexOf(cal) + sube)];
    sis.estado = 'instalado'; sis.cal = cal;
    M.log(S, `Instalas el ${s}: calidad ${cal}.${resultado === 'pl' ? ' (Éxito pleno: +1 calidad.)' : ''}`, ['r181']);
    S.mejoras += 1;
    M.log(S, 'Instalar un sistema es un hito: eliges una mejora.', ['r190']);
    return { ok: true, cal };
  };
  M.subirCalidad = function (S, s, n = 1, fuente = '') {
    const sis = S.sistemas[s];
    if (!sis.cal) return;
    const antes = sis.cal;
    sis.cal = D.CALIDADES[clamp(D.CALIDADES.indexOf(sis.cal) + n, 0, 2)];
    M.log(S, `${s}: ${antes} → ${sis.cal}${fuente ? ' · ' + fuente : ''}`, ['r180']);
  };
  M.instalados = (S) => Object.keys(S.sistemas).filter((s) => S.sistemas[s].estado === 'instalado');
  M.puedeDespegar = (S) => M.instalados(S).length >= 6;
  M.puedeDesesperado = (S) => S.reloj != null && S.reloj <= 5 && ['Casco', 'Motor', 'Combustible'].every((s) => S.sistemas[s].estado === 'instalado');

  M.unirTripulante = function (S, t, donde = 'contigo') {
    const T = S.tripu[t];
    const notas = [];
    if (donde === 'contigo' && M.compas(S).length >= 2) { donde = 'cicatriz'; notas.push('Ya llevas 2 compañeros: espera en la Cicatriz (r185).'); }
    T.estado = donde; T.region = null;
    if (S.habilidades.includes('Líder')) T.lealtad = 3;
    M.log(S, `${D.TRIPULACION[t].n} se une a ti${donde === 'cicatriz' ? ' (espera en la Cicatriz)' : ''}.`, ['r185']);
    return { notas };
  };
  M.lealtad = function (S, t, d) {
    const T = S.tripu[t];
    const antes = T.lealtad;
    T.lealtad = clamp(T.lealtad + d, 0, 3);
    M.log(S, `Lealtad de ${t}: ${antes} → ${T.lealtad}`, ['r186']);
    if (T.lealtad === 0) {
      T.estado = 'perdida';
      M.marcar(S, 'PERDIDO_' + CB.u.norm(t).toUpperCase());
      if (S.prota === 'piloto') M.cambiar(S, 'contador', 1, `${t} se va`);
    }
    if (T.lealtad === 3 && antes < 3 && !S.umbrales['leal3-' + t]) {
      S.umbrales['leal3-' + t] = 1; S.mejoras += 1;
      M.log(S, `${t} llega a Lealtad 3: es un hito, eliges una mejora.`, ['r190']);
    }
    if (T.lealtad === 3 && antes < 3) M.avisar(S, { clave: 'leal-' + t, tipo: 'descanso', ev: D.TRIPULACION[t].leal, regla: 'r186', txt: `${t} tiene Lealtad 3: lee su evento la próxima vez que descanses.` });
  };

  /* ---------------- pruebas ---------------- */
  /** r121: con 3 dados te quedas con los 2 altos (Ventaja) o bajos (Desventaja) */
  M.quedarse = function (dados, modo) {
    if (dados.length < 3 || !modo) return { usados: dados.slice(0, 2), fuera: [] };
    const idx = [0, 1, 2].sort((a, b) => dados[a] - dados[b]);
    const fuera = modo === 'V' ? idx[0] : idx[2];
    return { usados: dados.filter((_, i) => i !== fuera), fuera: [fuera] };
  };
  /**
   * Resuelve una prueba (r120). p = {attr, dif, modo:'V'|'D'|null, extra:[{t,v}], dados:[..]}
   * Devuelve {total, dif, res:'pl'|'ex'|'fa', partes, usados, fuera}
   */
  M.prueba = function (S, p) {
    let dif = p.dif;
    if (S.dificultad === 'clemencia' && dif >= 13) dif = 11;
    const at = p.attr ? M.atributo(S, p.attr) : { total: 0, partes: [] };
    const q = M.quedarse(p.dados, p.modo);
    const suma = q.usados.reduce((a, b) => a + b, 0);
    const extra = (p.extra || []).reduce((a, x) => a + x.v, 0);
    const total = suma + at.total + extra;
    const res = total >= dif + 3 ? 'pl' : total >= dif ? 'ex' : 'fa';
    return { total, dif, res, suma, partes: at.partes.concat(p.extra || []), usados: q.usados, fuera: q.fuera };
  };
  M.RES = { pl: 'Éxito pleno', ex: 'Éxito', fa: 'Fallo' };

  /* ---------------- el día ---------------- */
  M.empezarDia = function (S) {
    S.dia += 1;
    S.ayerCubierto = S.hoy.cubierto || M.enCicatriz(S);
    S.hoy = { accion: null, descanso: false, cubierto: false, desventajas: [] };
    if (S.clima && S.clima.hasta <= S.dia) S.clima = null;
    S.escena = { tipo: 'amanecer', paso: 0 };
    M.log(S, `── Día ${S.dia} ──`, ['r130'], { tipo: 'dia' });
  };
  /** r131.1 */
  M.relojAmanecer = function (S) {
    const notas = [];
    // Náufrago: el Canto sube cada 5 días (r109)
    if (S.modo === 'naufrago' && S.dia % 5 === 0) { M.cambiar(S, 'canto', 1, 'Náufrago: cada 5 días (r109)'); notas.push('Náufrago: el Canto sube 1 cada 5 días (r109).'); }
    if (S.reloj == null) return { notas };
    if (S.modo === 'naufrago' && S.reloj <= 0) return { notas };
    M.cambiar(S, 'reloj', -1, 'amanecer (r131)');
    if (S.estacion === 3 && [50, 40, 30, 20, 10].includes(S.reloj)) { M.cambiar(S, 'alerta', 1, 'Corona inquieta (r213)'); notas.push('Corona inquieta: +1 Alerta (r213).'); }
    return { notas };
  };
  /** r136 · Supervivencia. Devuelve las líneas para mostrar. */
  M.supervivencia = function (S) {
    const L = [];
    const enCic = M.enCicatriz(S);
    const cubierto = enCic || S.ayerCubierto;
    const comer = (quien) => {
      if (enCic && S.despensa > 0) { S.despensa -= 1; return 'despensa'; }
      if (S.raciones > 0) { S.raciones -= 1; return 'ración'; }
      if (S.rasgos.includes('e718') && S.chatarra > 0) { S.chatarra -= 1; return 'chatarra'; }
      return null;
    };
    if (S.prota === 'piloto' || S.prota === 'nativo') {
      const c = comer('tú');
      if (c) L.push({ t: c === 'despensa' ? 'Comes de la despensa de la nave' : c === 'chatarra' ? 'Comes 1 Chatarra (Lengua de metal)' : 'Gastas 1 Ración', r: c === 'despensa' ? 'r182' : 'r136' });
      else { L.push({ t: 'No te queda comida: 1 Herida', r: 'r136', mal: true }); M.herir(S, 1, 'hambre'); }
    }
    if (S.prota === 'piloto') {
      const filtro = S.rasgos.includes('e702') || S.habilidades.includes('Pulmón de hierro');
      if (cubierto) {
        if (enCic) { S.aire = 6; L.push({ t: 'En la Cicatriz respiras de la nave: Aire al máximo', r: 'r182' }); }
        else L.push({ t: 'Amaneces a cubierto: no gastas Aire', r: 'r136' });
      } else if (filtro && S.dia % 2 === 1) L.push({ t: 'El filtro te ahorra el Aire de hoy', r: 'e702' });
      else if (S.aire > 0) { S.aire -= 1; L.push({ t: 'Gastas 1 Aire: el aire de Caribdis te envenena', r: 'r102' }); }
      else { L.push({ t: 'Sin Aire: 1 Herida', r: 'r136', mal: true }); M.herir(S, 1, 'sin aire'); }
    }
    if (S.prota === 'mente') {
      if (enCic) { S.energia = 6; L.push({ t: 'En la Cicatriz recargas la Energía al máximo', r: 'r104' }); }
      if (S.energia > 0) { S.energia -= 1; L.push({ t: 'Gastas 1 Energía', r: 'r104' }); }
      else { L.push({ t: 'Sin Energía: 1 Daño', r: 'r136', mal: true }); M.herir(S, 1, 'sin energía'); }
    }
    for (const t of M.compas(S)) {
      const c = comer(t);
      if (c) L.push({ t: `${t} come (${c === 'despensa' ? 'despensa' : '1 Ración'})`, r: 'r136' });
      else { L.push({ t: `No hay comida para ${t}: pierde 1 de Lealtad`, r: 'r186', mal: true }); M.lealtad(S, t, -1); }
    }
    if (S.vehiculo && S.vehiculo.n) { /* sin consumo diario */ }
    if (S.rasgos.includes('e707')) {
      if (S.energia > 0) { S.energia -= 1; L.push({ t: 'Silenciador de Canto: 1 Energía', r: 'e707' }); }
    }
    if (S.reliquias.some((r) => r.id === 'e740')) { M.cambiar(S, 'canto', 1, 'Corona del Canto (e740)'); L.push({ t: 'La Corona del Canto: +1 Canto', r: 'e740' }); }
    M.log(S, 'Supervivencia: ' + L.map((x) => x.t.toLowerCase()).join('; ') + '.', ['r136']);
    return L;
  };
  /** r131.3 */
  M.torres = function (S) {
    if (S.region !== 7) return null;
    if (S.habilidades.includes('Raíz')) return { t: 'Raíz: las Torres no te suben el Canto', r: 'r190' };
    M.cambiar(S, 'canto', 1, 'amanecer en las Torres (r131)');
    return { t: 'Amaneces en las Torres del Canto: +1 Canto', r: 'r131' };
  };
  /** r131.4 · ¿hay pulso? */
  M.hayPulso = function (S, d) {
    if (S.estacion === 6 && S.reloj != null && S.reloj % 10 === 5) return { pulso: false, nota: 'Silencio: hoy no hay pulso (r213).' };
    if (S.estacion === 1 && d === 5) { S.clima = { n: 'Tormenta de óxido', hasta: S.dia + 1 }; }
    const umbral = S.region === 7 ? 5 : 6;
    return { pulso: d >= umbral, umbral };
  };

  /* ---------------- acciones ---------------- */
  M.ACCIONES = [
    { k: 'viajar', n: 'Viajar', r: 'r150', d: 'A una región vecina. Prueba de orientación y encuentro.' },
    { k: 'explorar', n: 'Explorar', r: 'r153', d: 'Ingenio · 9. Hallazgos: sistemas, tripulantes, pecios, comida, piezas.' },
    { k: 'visitar', n: 'Visitar', r: 'r160', d: 'El asentamiento de la región: comercio, sanador, rumores, descanso.' },
    { k: 'nave', n: 'Trabajar en la nave', r: 'r181', d: 'Instalar, mejorar o apagar la baliza. Solo en la Cicatriz.' },
    { k: 'descansar', n: 'Descansar', r: 'r133', d: 'Recuperas Heridas y Temple al anochecer.' },
    { k: 'ocultarte', n: 'Ocultarte', r: 'r135', d: 'La Alerta baja 1 (2 si eres Desertor). No en las Torres.' },
    { k: 'pista', n: 'Seguir una Pista', r: 'r192', d: 'Ve directo a un evento que conoces, sin encuentro.' },
    { k: 'ensamblar', n: 'Ensamblar', r: 'r203', d: 'Construir con piezas y planos. En la Cicatriz o en un taller.' },
    { k: 'despegar', n: 'Despegar', r: 'r183', d: 'Con los seis sistemas instalados → e900.' },
  ];
  M.disponible = function (S, k) {
    const R = M.reg(S);
    switch (k) {
      case 'viajar': return S.heridas >= 4 && M.compas(S).length === 0 && !S.vehiculo ? 'En Crítico no puedes viajar sin un compañero o un vehículo (r106).' : true;
      case 'visitar': return S.region === 1 ? 'La Cicatriz es tu casa: aquí no hay asentamiento que visitar.' : !R.asent ? 'En esta región no hay asentamiento (r150).' : true;
      case 'nave': return M.enCicatriz(S) ? true : 'Solo en la Cicatriz (Dunas de Óxido).';
      case 'ocultarte': return S.region === 7 ? 'En las Torres del Canto no hay dónde esconderse (r135).' : true;
      case 'pista': return S.pistas.some((p) => p.region === S.region) ? true : 'No tienes Pistas en esta región.';
      case 'ensamblar': return M.enCicatriz(S) || [2, 6].includes(S.region) ? true : 'En la Cicatriz o en un taller (Puerto Chatarra, el Nodo).';
      case 'despegar':
        if (M.puedeDespegar(S) && M.enCicatriz(S)) return true;
        if (M.puedeDesesperado(S) && M.enCicatriz(S)) return true;
        return `Necesitas los seis sistemas instalados (llevas ${M.instalados(S).length}). Con 5 días o menos, basta con Casco, Motor y Combustible (r184).`;
      default: return true;
    }
  };
  M.elegirAccion = function (S, k) {
    S.hoy.accion = k;
    const A = M.ACCIONES.find((a) => a.k === k);
    M.log(S, `Acción del día: ${A.n}.`, [A.r]);
  };

  /** r154 · encuentro: suma 2d6, columna = Alerta (o forzada) */
  M.encuentro = function (S, region, d1, d2, columna) {
    const tabla = CB.libro.tablas[region];
    const col = columna || S.alerta;
    const fila = tabla[String(d1 + d2)];
    const ev = fila ? fila[col - 1] : null;
    const dobles = d1 === d2;
    M.log(S, `Encuentro en ${D.REGIONES[region].corto}: 2d6 = ${d1 + d2}, columna Alerta ${col} → ${ev}${dobles ? ' (dobles)' : ''}.`, ['r154'], { ev });
    return { ev, suma: d1 + d2, col, dobles };
  };
  M.siguienteConocido = function (S, k) {
    const C = D.CONOCIDOS[k];
    const i = S.conocidos[k];
    if (i < 0 || i >= C.evs.length) return null;
    return C.evs[i];
  };
  M.avanzarConocido = function (S, k) { S.conocidos[k] += 1; };

  M.viajar = function (S, destino, res, dFallo) {
    const notas = [];
    if (res === 'fa') {
      if (dFallo <= 3) {
        S.region = destino;
        if (S.prota === 'mente' || S.raciones === 0) M.cambiar(S, 'energia', -1, 'llegas agotado (r151)');
        else M.cambiar(S, 'raciones', -1, 'llegas agotado (r151)');
        notas.push('Llegas agotado: 1 Ración o 1 Energía extra (r151).');
      } else {
        notas.push('Te desvías: sigues donde estabas, pero sufres el encuentro igual (r151).');
      }
    } else S.region = destino;
    M.log(S, S.region === destino ? `Llegas a ${D.REGIONES[destino].n}.` : `Te desvías y sigues en ${M.reg(S).n}.`, ['r151']);
    if (S.region === 1) M.log(S, 'Estás en la Cicatriz.', ['r182']);
    return { notas, llegaste: S.region === destino };
  };

  /** Hallazgos posibles en la región actual (r153 a) */
  M.hallazgosAqui = function (S) {
    const out = [];
    for (const s of D.SISTEMAS) if (S.sistemas[s].region === S.region && S.sistemas[s].estado === 'perdido') out.push({ k: 'sistema', s, ev: D.RESCATE[s], n: `Pecio del ${s}` });
    const Pe = S.sistemas.Personal;
    if (Pe && Pe.estado === 'perdido' && Pe.region === S.region && Pe.ev) out.push({ k: 'personal', s: 'Personal', ev: Pe.ev, n: Pe.n || 'Tu sistema personal' });
    for (const t in S.tripu) if (S.tripu[t].region === S.region && S.tripu[t].estado === 'perdido') out.push({ k: 'tripu', t, ev: D.TRIPULACION[t].ev, n: D.TRIPULACION[t].n });
    if (S.naveAnterior && S.naveAnterior.region === S.region && !S.naveAnterior.hallada) out.push({ k: 'anterior', n: 'Tu nave anterior (r212)' });
    return out;
  };
  M.forrajear = function (S, pleno = false) {
    if (S.prota === 'mente') { M.cambiar(S, 'energia', 1, 'forrajear (r153)'); return; }
    let n = S.prota === 'nativo' ? 3 : 2;
    if (M.tiene(S, 'COLONO')) n += 1;
    M.cambiar(S, 'raciones', n, 'forrajear (r153)');
  };

  M.descansoAnochecer = function (S) {
    const L = [];
    const enCic = M.enCicatriz(S);
    const cubierto = enCic || S.hoy.cubierto;
    if (S.hoy.descanso) {
      let cura = cubierto ? 2 : 1;
      if (M.compas(S).includes('Iria')) cura += 1;
      if (S.prota === 'mente') {
        L.push({ t: 'Tu cuerpo de metal no se cura descansando: repara Daño con Chatarra', r: 'r104' });
        if (enCic && S.heridas > 0) { M.curar(S, 1, 'reparación gratis en la Cicatriz'); L.push({ t: 'Primera reparación del día gratis en la Cicatriz', r: 'r104' }); }
      } else if (S.heridas > 0) { M.curar(S, cura, 'descanso'); L.push({ t: `Recuperas ${cura} ${CB.u.plural(cura, 'Herida')}`, r: 'r133' }); }
      if (S.temple < S.templeMax) { M.cambiar(S, 'temple', 1, 'descanso'); L.push({ t: 'Recuperas 1 Temple', r: 'r122' }); }
      if (enCic && S.canto > 0) {
        const n = M.tiene(S, 'CAMARA_DE_SILENCIO') ? 2 : 1;
        M.cambiar(S, 'canto', -n, 'descanso en la Cicatriz'); L.push({ t: `En la Cicatriz el Canto baja ${n}`, r: 'r133' });
      }
      if (M.compas(S).includes('Tadeo') && S.canto > 0) { M.cambiar(S, 'canto', -1, 'Tadeo (r185)'); L.push({ t: 'Tadeo reza contigo: −1 Canto', r: 'r185' }); }
      for (const t of M.compas(S)) if (S.tripu[t].heridas > 0) { S.tripu[t].heridas = 0; L.push({ t: `${t} se recupera`, r: 'r143' }); }
      for (const t in S.tripu) if (S.tripu[t].estado === 'fuera') { S.tripu[t].estado = 'contigo'; S.tripu[t].heridas = 0; L.push({ t: `${t} vuelve a estar en pie`, r: 'r143' }); }
    }
    const intemperie = (S.hoy.descanso || S.hoy.accion === 'ocultarte') && !cubierto;
    return { L, intemperie, centinela: S.rasgos.includes('e726') };
  };
  M.historiaHoy = function (S) {
    if (S.reloj == null) return null;
    const dias = M.diaHistoria(S);
    // r133: la primera historia sin leer cuya cifra ya alcanzó (o se saltó) el Reloj
    const i = dias.findIndex((d, j) => d >= S.reloj && !S.historiaLeida.includes(j));
    if (i < 0) return null;
    return { i, ev: M.P(S).historia[i] };
  };

  /* ---------------- combate ---------------- */
  const RE_ENEMIGO = /\*{0,2}([A-ZÁÉÍÓÚÑ][^·*\n|]{1,60}?)\*{0,2} · Ataque (\d+) · Blind\. (\d+) · Heridas (\d+)((?: · )?(?:\[[^\]\n]+\])*)/;
  M.RE_ENEMIGO = RE_ENEMIGO;
  M.leerEnemigo = function (txt) {
    const m = RE_ENEMIGO.exec(txt);
    if (!m) return null;
    return { n: m[1].trim(), atk: +m[2], bl: +m[3], h: +m[4], tags: (m[5].match(/\[([^\]]+)\]/g) || []).map((x) => x.slice(1, -1)) };
  };
  M.combate = function (S, en, opts = {}) {
    const arma = M.arma(S);
    const C = {
      en: Object.assign({}, en, { hMax: en.h }), ronda: 0, log: [], fin: null, ruidoso: !!arma.ruidosa,
      sorpresa: !!opts.sorpresa, emboscada: !!opts.emboscada, enemigoMas: opts.enemigoMas || 0, usados: {},
      blExtra: 0, blRondas: 0, enemigoMenos: 0, enemigoNoTira: false,
    };
    if (C.emboscada) { M.herir(S, 1, 'emboscada (r144)'); C.log.push({ t: 'Emboscada: recibes 1 Herida antes de empezar.', r: 'r144' }); }
    if (M.tiene(S, 'TORRETA_DE_LA_CICATRIZ') && M.enCicatriz(S)) { C.en.h -= 1; C.log.push({ t: 'La torreta de la Cicatriz dispara primero: 1 Herida al enemigo.', r: 'e775' }); }
    M.log(S, `Combate contra ${en.n} (Ataque ${en.atk}, Blind. ${en.bl}, Heridas ${en.h}${en.tags.length ? ', ' + en.tags.join(', ') : ''}).`, ['r140']);
    return C;
  };
  /** Ataque del jugador con desglose (r140, r143, r107) */
  M.ataqueJugador = function (S, C) {
    const arma = M.arma(S);
    const a = arma.dist ? 'Reflejos' : 'Vigor';
    const at = M.atributo(S, a);
    const partes = at.partes.slice();
    if (arma.atk) partes.push({ t: arma.n, v: arma.atk, r: 'r107' });
    if (arma.dist && M.tiene(S, 'VETERANO')) partes.push({ t: 'Ex militar', v: 1, r: 'r105' });
    if (arma.dist && S.habilidades.includes('Tirador')) partes.push({ t: 'Tirador', v: 1, r: 'r190' });
    if (!arma.dist && M.tiene(S, 'GUERRERO')) partes.push({ t: 'Guerrero de Quilla', v: 1, r: 'r105' });
    if (M.tiene(S, 'ARMA')) partes.push({ t: 'IA de combate', v: 1, r: 'r105' });
    if (!arma.dist && S.rasgos.includes('e712')) partes.push({ t: 'Brazos largos', v: 1, r: 'e712' });
    for (const t of M.compas(S)) partes.push({ t, v: D.TRIPULACION[t].atk || 1, r: 'r143' });
    return { attr: a, partes, total: partes.reduce((s, x) => s + x.v, 0) };
  };
  /**
   * Una ronda. man: 'atacar'|'defender'|'huir'|'hablar'. dJ, dE: dados (2 o 3).
   * extra: {modoJ:'V'|'D'|null, modoE, plus: n} — devuelve un informe para mostrar.
   */
  M.ronda = function (S, C, man, dJ, dE, extra = {}) {
    const manPedida = man;
    C.ronda += 1;
    const en = C.en;
    const inf = { ronda: C.ronda, man: manPedida, lineas: [] };
    const L = (t, r) => inf.lineas.push({ t, r });
    const primera = C.ronda === 1;
    if (man === 'huir' || man === 'hablar') {
      // pruebas (r141)
      const attr = man === 'huir' ? 'Reflejos' : extra.attrHablar || 'Voluntad';
      const dif = man === 'huir' ? 9 : extra.difHablar || 11;
      const pr = M.prueba(S, { attr, dif, modo: extra.modoJ, dados: dJ, extra: extra.plusLista || [] });
      inf.prueba = pr;
      if (pr.res !== 'fa') {
        C.fin = man === 'huir' ? 'huyes' : 'hablas';
        L(man === 'huir' ? 'Huyes: el combate termina.' : 'Las palabras funcionan: el combate termina.', 'r141');
      } else if (man === 'huir') {
        L('No consigues huir: recibes 1 Herida y sigue el combate.', 'r141');
        inf.danoJ = 1; M.herir(S, 1, 'huida fallida');
      } else {
        // r141: con un Fallo se tira la ronda (con los mismos dados) y el enemigo suma +2
        L('No te escuchan: se tira la ronda y el enemigo suma +2.', 'r141');
        man = 'atacar'; extra = Object.assign({}, extra, { masE: 2 });
      }
      if (man !== 'atacar') return cerrarRonda(S, C, inf);
    }
    const aj = M.ataqueJugador(S, C);
    const qJ = M.quedarse(dJ, extra.modoJ);
    const qE = M.quedarse(dE, extra.modoE);
    let tirJ = qJ.usados.reduce((a, b) => a + b, 0) + aj.total + (man === 'defender' ? 2 : 0) + (extra.plus || 0);
    let tirE = qE.usados.reduce((a, b) => a + b, 0) + en.atk + (primera ? C.enemigoMas : 0) - (C.enemigoMenos || 0) + (extra.masE || 0);
    if (C.enemigoNoTira) { tirE = 7; C.enemigoNoTira = false; L('Las esporas ciegan al enemigo: no tira, tú tiras contra 7.', 'e713'); }
    C.enemigoMenos = 0;
    inf.tirJ = tirJ; inf.tirE = tirE; inf.usadosJ = qJ; inf.usadosE = qE; inf.aj = aj;
    const dif = tirJ - tirE;
    const danoPor = (x) => (x >= 7 ? 3 : x >= 4 ? 2 : 1);
    if (dif === 0) L('Empate: nadie golpea.', 'r140');
    else if (dif > 0) {
      if (man === 'defender') L('Te cubres bien: no recibes daño (y tampoco lo haces).', 'r141');
      else {
        let bl = en.bl + (en.tags.includes('Antiguo') && !M.arma(S).antigua ? 1 : 0);
        if (S.arma === 'Lanza de luz fría' && (en.tags.includes('Máquina') || en.tags.includes('Antiguo'))) bl = Math.max(0, bl - 1);
        let d = danoPor(dif) - bl;
        if (dif >= 4) d = Math.max(1, d);
        d = Math.max(0, d);
        if (en.tags.includes('Enjambre') && !M.arma(S).ruidosa) d = Math.min(1, d);
        en.h = Math.max(0, en.h - d);
        inf.danoE = d;
        L(`Ganas por ${dif}: ${d} de daño${bl ? ` (Blindaje ${bl})` : ''}${en.tags.includes('Enjambre') && d === 1 && danoPor(dif) > 1 ? ' · [Enjambre]: nunca más de 1' : ''}.`, en.tags.includes('Enjambre') ? 'r142' : 'r140');
        if (en.h <= 0) { C.fin = 'ganas'; L(`${en.n} cae.`, 'r140'); }
      }
    } else {
      if (primera && C.sorpresa) L('Sorpresa: en la primera ronda no pueden hacerte daño.', 'r144');
      else {
        const x = -dif;
        let d = danoPor(x) - M.blindajeCombate(S, C);
        if (x >= 4) d = Math.max(1, d);
        d = Math.max(0, d);
        if (en.tags.includes('Grande') && x >= 7) { d += 1; L('[Grande]: 1 Herida extra.', 'r142'); }
        inf.danoJ = d;
        L(`${en.n} gana por ${x}: ${d} ${CB.u.plural(d, 'Herida')}${M.blindajeCombate(S, C) ? ` (tu Blindaje ${M.blindajeCombate(S, C)})` : ''}.`, 'r140');
        if (d >= 2 && M.compas(S).length) inf.puedeAsignar = true;
        inf.danoPendiente = d;
      }
      if (en.tags.includes('Cantor')) { M.cambiar(S, 'canto', 1, '[Cantor]'); L('[Cantor]: pierdes la ronda y +1 Canto.', 'r142'); }
    }
    if (C.blRondas > 0) { C.blRondas -= 1; if (!C.blRondas) C.blExtra = 0; }
    return cerrarRonda(S, C, inf);
  };
  M.blindajeCombate = (S, C) => M.blindaje(S) + (C.blExtra || 0) + (C.escudo ? 1 : 0);
  /** aplica el daño pendiente de una ronda, con o sin asignar 1 a un compañero (r143) */
  M.aplicarDano = function (S, C, inf, compa) {
    let d = inf.danoPendiente || 0;
    if (!d) return;
    if (compa) {
      const T = S.tripu[compa];
      T.heridas += 1; d -= 1;
      M.log(S, `${compa} recibe 1 Herida por ti (r143).`, ['r143']);
      if (T.heridas >= 3) {
        inf.compaCae = compa;
      }
    }
    inf.danoPendiente = 0;
    M.herir(S, d, C.en.n);
  };
  M.compaCae = function (S, t, dado) {
    const T = S.tripu[t];
    if (dado <= 2) {
      T.estado = 'muerto';
      M.log(S, `${t} cae y no se levanta.`, ['r143']);
      if (S.prota === 'piloto') M.cambiar(S, 'contador', 1, `muere ${t}`);
    } else {
      T.estado = 'fuera';
      M.log(S, `${t} queda fuera de combate hasta que descanses.`, ['r143']);
    }
  };
  function cerrarRonda(S, C, inf) {
    C.log.push(inf);
    return inf;
  }
  /** r145 + r146 al terminar */
  M.terminarCombate = function (S, C) {
    const L = [];
    if (C.ruidoso || C.ronda > 3) {
      M.cambiar(S, 'alerta', 1, 'combate ruidoso (r145)');
      L.push({ t: C.ruidoso ? 'Arma ruidosa: la Alerta sube 1.' : 'El combate duró más de 3 rondas: la Alerta sube 1.', r: 'r145' });
    }
    if (S.arma === 'Lanza de luz fría') { M.cambiar(S, 'canto', 1, 'Lanza de luz fría'); L.push({ t: 'La Lanza de luz fría canta: +1 Canto.', r: 'r107' }); }
    if (C.fin === 'ganas' && !C.sinBotin) {
      const t = C.en.tags;
      if (t.includes('Náufrago') || t.includes('Máquina')) L.push({ t: 'Botín: 1d6 ÷ 2 de Chatarra (redondeando hacia arriba).', r: 'r146', botin: true });
      const ops = [];
      if (t.includes('Máquina') || t.includes('Náufrago')) ops.push('cobre');
      if (t.includes('Bestia')) ops.push('hueso');
      if (t.includes('Antiguo')) ops.push('luz');
      if (ops.length === 1) { M.cambiar(S, 'pieza:' + ops[0], 1, 'botín (r201)'); L.push({ t: `Ganas 1 ${D.PIEZAS[ops[0]]}.`, r: 'r201' }); }
      else if (ops.length > 1) L.push({ t: `Ganas 1 pieza: eliges entre ${ops.map((p) => D.PIEZAS[p]).join(' y ')}.`, r: 'r201', piezas: ops });
    }
    M.log(S, `Fin del combate contra ${C.en.n}: ${C.fin === 'ganas' ? 'ganas' : C.fin === 'huyes' ? 'huyes' : C.fin === 'hablas' ? 'se resuelve hablando' : C.fin}.`, ['r140']);
    return L;
  };

  /* ---------------- pecios (r170) ---------------- */
  M.pecioNuevo = function (S, tipo) {
    const P = { tipo, salas: [], fin: false };
    if (tipo === 5) M.cambiar(S, 'canto', 1, 'Arca de los Antiguos (r171)');
    M.log(S, `Exploras un pecio: ${D.PECIOS[tipo].n}.`, ['r170', 'r171']);
    return P;
  };
  /** traduce la tirada de sala (r172) aplicando el rasgo del tipo y la regla de la segunda sala */
  M.salaDe = function (P, suma) {
    let s = suma;
    const n = P.salas.length + 1;
    let nota = '';
    if (P.guardianVencido) { P.guardianVencido = false; return { suma: s, sala: 'Equipo', nota: 'Venciste al guardián: esta sala es de Equipo (r172).' }; }
    if (n === 2 && [3, 4, 5].includes(s)) { nota = 'Segunda sala: un 3, 4 o 5 se cambia por Guardián (r172).'; s = 2; }
    let sala = D.SALAS[s];
    if (P.tipo === 5 && s === 9) { sala = 'Reliquia'; nota = 'En un Arca, el 9 también es Reliquia (r171).'; }
    if (P.tipo === 6 && s === 10) { sala = 'Sala especial'; nota = 'En el pecio sin nombre, el 10 también es sala especial (r171).'; }
    return { suma: s, sala, nota };
  };
  M.salaEspecial = (tipo, d) => 'e' + String(500 + (tipo - 1) * 3 + (d <= 3 ? 0 : d <= 5 ? 1 : 2)).padStart(3, '0');

  /* ---------------- fin y puntuación (r196) ---------------- */
  M.puntuacion = function (S, aBordo = []) {
    const tripu = aBordo.length;
    const exc = Object.values(S.sistemas).filter((s) => s.estado === 'instalado' && s.cal === 'Excelente').length;
    const dias = Math.max(0, S.reloj || 0);
    const frag = M.cuentaFragmentos(S);
    const secreto = M.tiene(S, 'SECRETO_DESCUBIERTO') ? 5 : 0;
    return { tripu: tripu * 3, exc: exc * 2, dias, frag, secreto, total: tripu * 3 + exc * 2 + dias + frag + secreto };
  };
})();
