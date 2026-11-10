/* =====================================================================
   CARIBDIS · base
   Espacio de nombres, utilidades y datos fijos del juego (los que el
   libro da en tablas de reglas). Sin DOM salvo los helpers de `el`.
   ===================================================================== */
'use strict';
const CB = (window.CB = window.CB || {});

/* ---------- utilidades ---------- */
CB.u = {
  clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
  esc: (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
  norm: (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(),
  d: (n = 6) => 1 + Math.floor(Math.random() * n),
  uid: () => Math.random().toString(36).slice(2, 9),
  copia: (o) => JSON.parse(JSON.stringify(o)),
  firma: (n) => (n > 0 ? '+' + n : n < 0 ? '−' + Math.abs(n) : '±0'),
  plural: (n, s, p) => (n === 1 ? s : p || s + 's'),
};

/** Partidas de versiones anteriores: el Secreto ya no se tira al empezar (r108), sale de los FRAGMENTO_ en e840. */
CB.migrar = function (S) {
  if (S && S.secreto != null && !(S.marcas || []).includes('SECRETO_DESCUBIERTO')) S.secreto = null;
  return S;
};

/** Crea un elemento: el('div.clase#id', {attr}, hijos...) */
CB.el = function (sel, attrs, ...hijos) {
  const m = sel.match(/^([a-z0-9]+)?((?:[.#][\w-]+)*)$/i);
  const node = document.createElement((m && m[1]) || 'div');
  if (m && m[2]) {
    for (const p of m[2].match(/[.#][\w-]+/g)) {
      if (p[0] === '.') node.classList.add(p.slice(1));
      else node.id = p.slice(1);
    }
  }
  if (attrs && (typeof attrs !== 'object' || attrs instanceof Node || Array.isArray(attrs))) {
    hijos.unshift(attrs);
    attrs = null;
  }
  for (const k in attrs || {}) {
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else node.setAttribute(k, v === true ? '' : v);
  }
  const add = (h) => {
    if (h == null || h === false) return;
    if (Array.isArray(h)) h.forEach(add);
    else node.append(h instanceof Node ? h : document.createTextNode(String(h)));
  };
  hijos.forEach(add);
  return node;
};

/* append() que ignora null/false: así se pueden escribir hijos condicionales
   (cond ? el(...) : null) sin que aparezca el texto "null" */
for (const P of [Element.prototype, DocumentFragment.prototype]) {
  const original = P.append;
  P.append = function (...hijos) { return original.apply(this, hijos.filter((h) => h != null && h !== false)); };
}

/* ---------- datos fijos (reglas) ---------- */
CB.D = {
  ATRIBUTOS: ['Vigor', 'Reflejos', 'Ingenio', 'Voluntad'],
  ATR_USO: {
    Vigor: 'Fuerza, aguante, cuerpo a cuerpo, forzar, cargar',
    Reflejos: 'Disparo, sigilo, esquivar, trepar, huir, pilotar',
    Ingenio: 'Reparar, tecnología, medicina, orientarse, explorar',
    Voluntad: 'Convencer, intimidar, resistir el miedo y el Canto',
  },
  DIFICULTAD: { 7: 'Fácil', 9: 'Normal', 11: 'Dura', 13: 'Extrema' },
  NIVELES_HERIDA: ['Ileso', 'Rasguño', 'Herido', 'Grave', 'Crítico'],
  PEN_HERIDA: [0, 0, -1, -2, -2],

  REGIONES: {
    1: { n: 'Dunas de Óxido', corto: 'Dunas', vec: [2, 3, 4], asent: 'La Cicatriz', ev: null, tabla: 'e200', piezas: ['hueso'], arte: 'r-dunas' },
    2: { n: 'Cementerio de Naves', corto: 'Cementerio', vec: [1, 3, 6], asent: 'Puerto Chatarra', ev: 'e400', tabla: 'e220', piezas: ['cobre'], arte: 'r-cementerio', faccion: 'desguaces' },
    3: { n: 'Salinas Blancas', corto: 'Salinas', vec: [1, 2, 8], asent: null, lugar: 'la Refinería', ev: 'e241', tabla: 'e240', piezas: ['cristal'], arte: 'r-salinas' },
    4: { n: 'Cañones de las Bestias', corto: 'Cañones', vec: [1, 5, 7], asent: 'Quilla', ev: 'e410', tabla: 'e300', piezas: ['cobre', 'hueso'], arte: 'r-canones', faccion: 'hijos' },
    5: { n: 'Bosque Petrificado', corto: 'Bosque', vec: [4, 6, 7], asent: null, lugar: 'el Santuario', ev: 'e261', tabla: 'e260', piezas: ['cristal'], arte: 'r-bosque' },
    6: { n: 'Ciudad Enterrada', corto: 'Ciudad', vec: [2, 5, 8], asent: 'El Nodo', ev: 'e430', tabla: 'e320', piezas: ['luz'], arte: 'r-ciudad', faccion: 'vigias' },
    7: { n: 'Torres del Canto', corto: 'Torres', vec: [4, 5, 8], asent: 'El Atrio', ev: 'e420', tabla: 'e340', piezas: ['luz'], arte: 'r-torres', faccion: 'coro' },
    8: { n: 'Polo Helado', corto: 'Polo', vec: [3, 6, 7], asent: null, lugar: 'el Pozo', ev: 'e281', tabla: 'e280', piezas: ['cristal'], arte: 'r-polo' },
  },
  // posición en el mapa (0..100), siguiendo el esquema de r150
  MAPA_POS: { 8: [50, 9], 3: [14, 34], 6: [50, 33], 7: [86, 34], 2: [30, 58], 5: [68, 58], 1: [22, 86], 4: [66, 86] },

  SISTEMAS: ['Casco', 'Motor', 'Navegación', 'Soporte vital', 'Combustible'],
  PESADOS: ['Motor', 'Combustible'],
  RESCATE: { Casco: 'e560', Motor: 'e562', Navegación: 'e564', 'Soporte vital': 'e566', Combustible: 'e568' },
  CALIDADES: ['Precaria', 'Sólida', 'Excelente'],
  CAL_DIF: { Precaria: 11, Sólida: 9, Excelente: 7 },

  TRIPULACION: {
    Iria: { n: 'Dra. Iria Salcedo', rol: 'médica', ev: 'e600', leal: 'e602', hab: 'Al descansar, el grupo recupera 1 Herida extra. Ventaja en pruebas de medicina', arte: 'crew-iria' },
    Bruno: { n: 'Bruno Kessler', rol: 'guardaespaldas', ev: 'e605', leal: 'e607', hab: '+2 Ataque (en lugar de +1). Ventaja en pruebas de Vigor', arte: 'crew-bruno', atk: 2, ventaja: 'Vigor' },
    Amara: { n: 'Amara Oyelaran', rol: 'arqueóloga', ev: 'e610', leal: 'e612', hab: 'Lee lo antiguo: Ventaja en Ingenio con los Antiguos', arte: 'crew-amara' },
    Noemí: { n: 'Noemí «Grasa» Vidal', rol: 'mecánica', ev: 'e615', leal: 'e617', hab: 'Ventaja para instalar sistemas; +1 Chatarra en cada sala de Restos', arte: 'crew-noemi' },
    Tadeo: { n: 'Hermano Tadeo', rol: 'capellán', ev: 'e620', leal: 'e622', hab: 'Ventaja en pruebas de Voluntad; al descansar, −1 de Canto', arte: 'crew-tadeo', ventaja: 'Voluntad' },
    Lio: { n: 'Lio', rol: 'polizón', ev: 'e625', leal: 'e627', hab: 'Ventaja en sigilo y para huir; puede robar', arte: 'crew-lio' },
  },

  FACCIONES: {
    hijos: { n: 'Hijos del Pecio', aliado: 'e640', enemigo: 'e641', rival: 'coro', region: 4 },
    desguaces: { n: 'Desguaces', aliado: 'e642', enemigo: 'e643', rival: 'vigias', region: 2 },
    coro: { n: 'Coro', aliado: 'e644', enemigo: 'e645', rival: 'hijos', region: 7 },
    vigias: { n: 'Vigías', aliado: 'e646', enemigo: 'e647', rival: 'desguaces', region: 6 },
  },

  PIEZAS: { cobre: 'Cobre', hueso: 'Hueso', cristal: 'Cristal', luz: 'Luz fría' },

  PROTAS: {
    piloto: {
      n: 'el Piloto', N: 'El Piloto', regla: 'r102', arte: 'piloto', especie: 'Humano con implantes',
      lema: 'Implantes de vuelo bajo la piel. Sobreviviste a una caída que no pudiste evitar.',
      ajuste: { Reflejos: 1 }, recursos: { aire: 6, raciones: 5, energia: 3 },
      contador: { n: 'CULPA', ini: 3, bajo: 'e805', alto: 'e806' },
      historia: ['e800', 'e801', 'e802', 'e803', 'e804'], canto6: 'e830', personal: 'Caja negra', personalEv: 'e807',
      rasgos: { n: 'Implantes', rango: [700, 707], elige: 2 }, afinidad: 'cobre', planos: ['e761', 'e763'],
      resumen: ['+1 Reflejos', 'Aire, Raciones y Energía', '2 implantes', 'Ventaja al pilotar y al despegar'],
    },
    nativo: {
      n: 'el Nativo', N: 'El Nativo', regla: 'r103', arte: 'nativo', especie: 'Mutante, hijo de Caribdis',
      lema: 'Viste caer la nave y corriste hacia ella, no lejos de ella.',
      ajuste: { elige: ['Vigor', 'Voluntad'] }, recursos: { aire: 0, raciones: 5, energia: 0 },
      contador: { n: 'ARRAIGO', ini: 3, bajo: 'e815', alto: 'e816' },
      historia: ['e810', 'e811', 'e812', 'e813', 'e814'], canto6: 'e831', personal: 'Mapa del primer pecio', personalEv: 'e812',
      rasgos: { n: 'Mutaciones', rango: [710, 721], tira: 2 }, afinidad: 'hueso', planos: ['e760', 'e762'],
      resumen: ['+1 Vigor o Voluntad', 'Solo Raciones', '2 mutaciones al azar', 'Nunca te pierdes, forrajeas con Ventaja'],
    },
    mente: {
      n: 'la Mente', N: 'La Mente', regla: 'r104', arte: 'mente', especie: 'La IA de tu nave, en un dron',
      lema: 'Te falta memoria. Te sobran preguntas.',
      ajuste: { Ingenio: 1, Voluntad: -1 }, recursos: { aire: 0, raciones: 0, energia: 6 },
      contador: { n: 'MEMORIA', ini: 0, bajo: null, alto: 'e825' },
      historia: ['e820', 'e821', 'e822', 'e823', 'e824'], canto6: 'e832', personal: 'Núcleo de memoria', personalEv: 'e826',
      rasgos: { n: 'Protocolos', rango: [725, 732], elige: 2 }, afinidad: 'cristal', planos: ['e766', 'e767'],
      resumen: ['+1 Ingenio, −1 Voluntad', 'Solo Energía · Blindaje 2', '2 protocolos', 'Hablas con las máquinas'],
    },
  },

  ORIGENES: {
    piloto: [
      ['Ex militar', '+1 al Ataque con armas de distancia', 'Pistola de clavos', 'VETERANO'],
      ['Contrabandista', 'Ventaja al regatear (r161)', '4 Chatarra extra', 'DEUDAS'],
      ['Piloto de rescate', 'Ventaja para buscar supervivientes', 'Botiquín', 'RESCATADOR'],
      ['Hijo de colonos', '+1 Ración al forrajear', 'Navaja', 'COLONO'],
      ['Desertor', 'Al Ocultarte, la Alerta baja 2 (r135)', 'Uniforme robado', 'DESERTOR'],
      ['Piloto de carreras', 'Una vez por partida, repite una prueba del despegue', 'Gafas de vuelo', 'TEMERARIO'],
    ],
    nativo: [
      ['Chamán de esporas', 'Ventaja contra el Canto (Voluntad ♫)', 'Saquito de esporas', 'CHAMAN'],
      ['Carroñero', 'Ventaja al explorar pecios (r170)', 'Gancho de casco', 'CARRONERO'],
      ['Exiliado', 'Ventaja para huir', 'Capa de piel de duna', 'EXILIADO'],
      ['Domador', 'Calmas a las [Bestias] con Voluntad · 9', 'Silbato de hueso', 'DOMADOR'],
      ['Guerrero de Quilla', '+1 al Ataque cuerpo a cuerpo', 'Lanza de hueso', 'GUERRERO'],
      ['Mirasol', '+1 Temple máximo', 'Lente de cristal antiguo', 'MIRASOL'],
    ],
    mente: [
      ['IA de carga', 'Llevas 2 sistemas pesados (r180) con solo −1 a Reflejos', 'Brazos de carga', 'ESTIBADORA'],
      ['IA médica', 'Al descansar, curas 1 Herida a cada compañero por 1 Chatarra', 'Bisturí láser', 'MEDICA'],
      ['IA de combate reconvertida', '+1 al Ataque', 'Cañón de remaches', 'ARMA'],
      ['IA de navegación', 'Ventaja al viajar y al usar la Navegación', 'Mapa estelar dañado', 'NAVEGANTE'],
      ['IA de entretenimiento', 'Ventaja al Hablar con humanos', 'Proyector de hologramas', 'ACTRIZ'],
      ['IA sin registro', 'Una vez por partida, convierte un Fallo en Éxito', 'Nada', 'SIN_REGISTRO'],
    ],
  },

  // r107 + r161
  ARMAS: {
    'Puños': { atk: 0, silenciosa: true },
    'Navaja': { atk: 1, silenciosa: true },
    'Bisturí láser': { atk: 1, silenciosa: true },
    'Pistola de clavos': { atk: 1, dist: true },
    'Gancho de casco': { atk: 1 },
    'Lanza de hueso': { atk: 2, silenciosa: true },
    'Hacha de casco': { atk: 2, ruidosa: true },
    'Rifle de rescate': { atk: 2, dist: true, ruidosa: true },
    'Cañón de remaches': { atk: 2, dist: true, ruidosa: true },
    'Lanza de luz fría': { atk: 3, antigua: true },
    'Lezna cantora': { atk: 2, silenciosa: true, antigua: true },
  },
  PROTECCIONES: {
    'Traje de vuelo': { bl: 0 },
    'Placas improvisadas': { bl: 1, reflejos: -1 },
    'Placas de casco': { bl: 1 },
    'Capa de piel de duna': { bl: 1 },
    'Coraza de Vigía': { bl: 2, reflejos: -1 },
    'Chasis': { bl: 2 },
  },
  TIENDA: [
    ['2 Raciones', 1, 'raciones'], ['Botiquín', 3, 'obj'], ['Célula de energía', 2, 'obj'], ['Bombona de aire', 2, 'obj'],
    ['Navaja', 2, 'arma'], ['Pistola de clavos', 4, 'arma'], ['Hacha de casco', 4, 'arma'], ['Rifle de rescate', 7, 'arma'],
    ['Placas improvisadas', 4, 'prot'], ['Cuerda y garfio', 1, 'obj'], ['Antídoto de esporas', 2, 'obj'],
    ['Cobre', 1, 'pieza:cobre'], ['Hueso', 1, 'pieza:hueso'], ['Cristal', 2, 'pieza:cristal'],
  ],
  RUMORES: {
    2: ['Polo', 8, 'La puerta', 'e288'], 3: ['Cañones', 4, 'El crucero dormido', 'e309'], 4: ['Ciudad', 6, 'El encargo de Primo', 'e433'],
    5: ['Cementerio', 2, 'El cartógrafo', 'e226'], 6: ['Salinas', 3, 'Luces en la sal', 'e245'], 7: null,
    8: ['Torres', 7, 'La procesión', 'e345'], 9: ['Bosque', 5, 'La seta de la Madre', 'e267'], 10: ['Dunas', 1, 'El búnker', 'e207'],
    11: ['Ciudad', 6, 'El Vigía que reza', 'e327'], 12: ['Cementerio', 2, 'Los del Argo Pálido', 'e231'],
  },
  // r171
  PECIOS: {
    1: { n: 'Carguero', g: 'Ratas de óxido · Ataque 2 · Blind. 0 · Heridas 3 · [Bestia][Enjambre]', rasgo: '+1 Chatarra en cada sala de Restos' },
    2: { n: 'Nave colonia', g: 'Colono hueco · Ataque 3 · Blind. 0 · Heridas 2 · [Cantor]', rasgo: 'Las salas de Suministros dan el doble' },
    3: { n: 'Nave militar', g: 'Torreta despierta · Ataque 4 · Blind. 2 · Heridas 2 · [Máquina]', rasgo: 'En una sala de Equipo, eliges el objeto' },
    4: { n: 'Yate de lujo', g: 'Mayordomo roto · Ataque 2 · Blind. 1 · Heridas 2 · [Máquina]', rasgo: 'En una sala de Restos, además 1 objeto vendible por 3' },
    5: { n: 'Arca de los Antiguos', g: 'Vigía menor · Ataque 4 · Blind. 2 · Heridas 3 · [Máquina][Antiguo]', rasgo: '+1 Canto al entrar; Reliquia también con el 9' },
    6: { n: 'Pecio sin nombre', g: 'Lo que vive dentro · Ataque 5 · Blind. 1 · Heridas 3 · [Bestia][Grande]', rasgo: 'Sala especial también con el 10' },
  },
  SALAS: { 2: 'Guardián', 3: 'Trampa', 4: 'Derrumbe', 5: 'Vacía', 6: 'Restos', 7: 'Suministros', 8: 'Restos', 9: 'Equipo', 10: 'Reliquia', 11: 'Sala especial', 12: 'Superviviente o tesoro' },
  EQUIPO_PECIO: { 1: 'Botiquín', 2: 'Célula de energía o bombona de aire', 3: 'Navaja o cuerda y garfio', 4: 'Pistola de clavos', 5: 'Placas improvisadas', 6: 'Rifle de rescate' },
  ASPECTOS_RELIQUIA: { 1: 'Un cilindro tibio que zumba', 2: 'Una esfera de cristal con humo dentro', 3: 'Un guante de escamas de metal', 4: 'Un disco que flota a un dedo de tu mano', 5: 'Una máscara sin agujeros para los ojos', 6: 'Un hueso de metal con espirales de puntos' },
  // r193: filas por 2d6+Ingenio
  IDENT_RELIQUIA: [[5, 'e740', 'e741'], [7, 'e742', 'e743'], [9, 'e744', 'e745'], [11, 'e746', 'e747'], [13, 'e748', 'e749'], [99, 'e750', 'e751']],
  // r300
  PLANTILLAS: {
    Hablar: { 1: 'r303', 2: 'r301', 3: 'r302', 4: 'r312', 5: 'r318', 6: 'r304' },
    Esquivar: { 1: 'r309', 2: 'r309', 3: 'r310', 4: 'r308', 5: 'r311', 6: 'r304' },
    Luchar: { 1: 'r306', 2: 'r306', 3: 'r305', 4: 'r305', 5: 'r319', 6: 'r304' },
    Estudiar: { 1: 'r314', 2: 'r315', 3: 'r314', 4: 'r302', 5: 'r316', 6: 'r309' },
  },
  PULSOS: ['e020', 'e021', 'e022', 'e023', 'e024', 'e025'],
  CONOCIDOS: {
    peregrina: { n: 'La Peregrina', evs: ['e060', 'e061', 'e062', 'e063'] },
    perro: { n: 'El Perro de latón', evs: ['e064', 'e065', 'e066', 'e067'] },
    mirasoles: { n: 'Los Mirasoles', evs: ['e068', 'e069', 'e070', 'e071'] },
  },
  ESTACIONES: {
    1: ['Año de óxido', 'Un 5 en el dado del pulso trae una tormenta de óxido hasta el día siguiente'],
    2: ['Sol bajo', 'En el Polo y las Salinas, toda noche a la intemperie es Noche helada'],
    3: ['Corona inquieta', '+1 Alerta ◉ al amanecer con el Reloj en 50, 40, 30, 20 y 10'],
    4: ['Coro en procesión', 'En el Bosque y la Ciudad, tira dos veces en los encuentros y usa el que tenga [Cantor]'],
    5: ['Mercado de pecios', 'Cada asentamiento vende un sistema Precario por 12 Chatarra'],
    6: ['Silencio', 'No hay pulso del Canto los días en que el Reloj acaba en 5'],
  },
  MODOS: {
    estandar: { n: 'Estándar', reloj: 60, alerta: 1, historia: [50, 40, 30, 20, 10], desc: 'Las reglas tal cual. La mejor primera partida.' },
    desesperado: { n: 'Desesperado', reloj: 40, alerta: 2, historia: [35, 28, 20, 12, 5], desc: 'Reloj en 40 y Alerta en 2.' },
    corta: { n: 'Partida corta', reloj: 35, alerta: 1, historia: [30, 25, 20, 15, 10], desc: 'Para una tarde: cinco sistemas y un tripulante esperando (r211).' },
    naufrago: { n: 'Náufrago', reloj: 60, alerta: 1, historia: [50, 40, 30, 20, 10], desc: 'Los Recolectores no vienen: el Reloj se para en 0. El Canto sube cada 5 días. Despega con 3 tripulantes.' },
  },
  DIFICULTADES: {
    clemencia: { n: 'Clemencia', reloj: 70, temple: 3, desc: 'Las pruebas Extremas cuentan como Duras.' },
    superviviente: { n: 'Superviviente', reloj: 60, temple: 2, desc: 'Las reglas tal como están escritas.' },
    leyenda: { n: 'Leyenda', reloj: 50, temple: 1, desc: 'Alerta mínima 2. Repetir con Temple cuesta 2.' },
  },
};

/* ---------- almacenamiento local (tolerante a fallos) ---------- */
CB.guardado = {
  CLAVE: 'caribdis.partida.v1',
  AJUSTES: 'caribdis.ajustes.v1',
  leer(clave) {
    try { const t = localStorage.getItem(clave); return t ? JSON.parse(t) : null; } catch (e) { return null; }
  },
  escribir(clave, v) {
    try { localStorage.setItem(clave, JSON.stringify(v)); return true; } catch (e) { return false; }
  },
  borrar(clave) { try { localStorage.removeItem(clave); } catch (e) { /* nada */ } },
  /* ---- varias partidas: un índice y una clave por partida ---- */
  INDICE: 'caribdis.partidas.v2',
  ACTUAL: 'caribdis.actual.v2',
  clavePartida: (id) => 'caribdis.partida.v2.' + id,
  nuevoId: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
  indice() {
    let ix = this.leer(this.INDICE);
    if (!Array.isArray(ix)) ix = [];
    // migración: una partida con el formato anterior (una sola) entra en la lista como la actual
    const vieja = this.leer(this.CLAVE);
    if (vieja && vieja.prota) {
      vieja.id = vieja.id || this.nuevoId();
      this.escribir(this.clavePartida(vieja.id), vieja);
      ix = [this.resumen(vieja)].concat(ix.filter((x) => x.id !== vieja.id));
      this.escribir(this.ACTUAL, vieja.id);
      this.borrar(this.CLAVE);
      this.escribir(this.INDICE, ix);
    }
    return ix;
  },
  resumen: (S) => ({ id: S.id, nombre: S.nombre, prota: S.prota, nave: S.nave, dia: S.dia || 1, reloj: S.reloj, fin: S.fin ? (CB.libro && CB.libro.titulo ? CB.libro.titulo(S.fin) : 'Terminada') : null, fecha: Date.now() }),
  guardarPartida(S) {
    if (!S) return;
    S.id = S.id || this.nuevoId();
    const ok = this.escribir(this.clavePartida(S.id), S);
    const ix = this.indice().filter((x) => x.id !== S.id);
    ix.unshift(this.resumen(S));
    this.escribir(this.INDICE, ix);
    this.escribir(this.ACTUAL, S.id);
    return ok;
  },
  cargar(id) { return CB.migrar(this.leer(this.clavePartida(id))); },
  cargarActual() {
    const ix = this.indice();
    const id = this.leer(this.ACTUAL) || (ix[0] && ix[0].id);
    return id ? this.cargar(id) : null;
  },
  borrarPartida(id) {
    this.borrar(this.clavePartida(id));
    this.escribir(this.INDICE, this.indice().filter((x) => x.id !== id));
    if (this.leer(this.ACTUAL) === id) this.borrar(this.ACTUAL);
  },
};
