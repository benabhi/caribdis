/* =====================================================================
   CARIBDIS · dados
   Dados de seis caras en 3D (three.js). El valor se decide antes de
   lanzar y la animación aterriza en él, así el mismo motor sirve para
   dados físicos: el jugador puede escribir lo que sacó en la mesa.
   Si three.js no carga, se usan dados planos.
   ===================================================================== */
'use strict';
(function () {
  const Dd = (CB.dados = {});
  const COLORES = {
    j: { cara: '#efe4cc', borde: '#c9b48e', punto: '#8e3320' }, // hueso con puntos de óxido: tú
    e: { cara: '#2a211d', borde: '#5a4639', punto: '#e9d9b8' }, // hierro con puntos de hueso: el enemigo
    x: { cara: '#3e6773', borde: '#2a4a53', punto: '#f3ebda' }, // azul frío: tiradas del mundo
  };
  // caras de un BoxGeometry: +x, -x, +y, -y, +z, -z
  const VALOR_CARA = [3, 4, 1, 6, 2, 5];
  const NORMAL = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  const PUNTOS = {
    1: [[0.5, 0.5]], 2: [[0.27, 0.27], [0.73, 0.73]], 3: [[0.27, 0.27], [0.5, 0.5], [0.73, 0.73]],
    4: [[0.27, 0.27], [0.73, 0.27], [0.27, 0.73], [0.73, 0.73]],
    5: [[0.27, 0.27], [0.73, 0.27], [0.5, 0.5], [0.27, 0.73], [0.73, 0.73]],
    6: [[0.27, 0.25], [0.73, 0.25], [0.27, 0.5], [0.73, 0.5], [0.27, 0.75], [0.73, 0.75]],
  };
  const reducido = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  let R = null; // renderer compartido
  const texturas = {};

  function textura(tipo, v) {
    const k = tipo + v;
    if (texturas[k]) return texturas[k];
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    const col = COLORES[tipo];
    g.fillStyle = col.borde; g.fillRect(0, 0, 256, 256);
    g.fillStyle = col.cara;
    const r = 46;
    g.beginPath(); g.moveTo(r + 6, 6); g.arcTo(250, 6, 250, 250, r); g.arcTo(250, 250, 6, 250, r); g.arcTo(6, 250, 6, 6, r); g.arcTo(6, 6, 250, 6, r); g.fill();
    // grano del material
    for (let i = 0; i < 380; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.05})`; g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2); }
    for (const [x, y] of PUNTOS[v]) {
      g.beginPath(); g.fillStyle = col.punto; g.arc(x * 256, y * 256, v === 1 ? 30 : 22, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.fillStyle = 'rgba(0,0,0,.25)'; g.arc(x * 256 + 2, y * 256 + 3, v === 1 ? 30 : 22, 0, Math.PI * 2); g.globalCompositeOperation = 'destination-over'; g.fill(); g.globalCompositeOperation = 'source-over';
    }
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    texturas[k] = t;
    return t;
  }

  function iniciar() {
    if (R || !window.THREE) return R;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 2, 0.1, 100);
    camera.position.set(0, 11, 6.2);
    camera.lookAt(0, 0, 0.4);
    scene.add(new THREE.AmbientLight(0xfff1dc, 0.62));
    const sol = new THREE.DirectionalLight(0xffe2bf, 0.85);
    sol.position.set(-4, 10, 5);
    sol.castShadow = true;
    sol.shadow.mapSize.set(1024, 1024);
    Object.assign(sol.shadow.camera, { left: -8, right: 8, top: 6, bottom: -6 });
    sol.shadow.radius = 4;
    scene.add(sol);
    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.32 }));
    suelo.rotation.x = -Math.PI / 2;
    suelo.receiveShadow = true;
    scene.add(suelo);
    R = { renderer, scene, camera, dados: [], anim: null };
    return R;
  }

  function quatParaValor(v, giro) {
    const cara = VALOR_CARA.indexOf(v);
    const n = new THREE.Vector3(...NORMAL[cara]);
    const q = new THREE.Quaternion().setFromUnitVectors(n, new THREE.Vector3(0, 1, 0));
    const yaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), giro);
    return yaw.multiply(q);
  }

  function ajustar(cont) {
    const w = cont.clientWidth || 300, h = cont.clientHeight || 160;
    R.renderer.setSize(w, h, false);
    R.camera.aspect = w / h;
    // que los dados quepan a lo ancho en móvil
    // en recuadros bajos (el tutorial) la cámara se acerca para que los dados no queden chiquitos
    const k = h < 200 ? 0.7 : 1;
    R.camera.position.set(0, (w < 420 ? 15 : 11) * k, (w < 420 ? 7.5 : 6.2) * k);
    R.camera.lookAt(0, 0, 0.4);
    R.camera.updateProjectionMatrix();
  }

  /**
   * Lanza dados. specs: [{tipo:'j'|'e'|'x', v?:1..6}] → Promise<number[]>
   * cont: elemento donde dibujar.
   */
  /* ---------- sonido de los dados: sintetizado (sin archivos), se puede apagar en el menú ---------- */
  let AC = null, RUIDO = null;
  function audio() {
    if (!(CB.app && CB.app.aj && CB.app.aj.sonido !== false)) return null;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      if (AC.state === 'suspended') AC.resume();
      if (!RUIDO) {
        RUIDO = AC.createBuffer(1, AC.sampleRate * 0.08, AC.sampleRate);
        const d = RUIDO.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
      }
      return AC;
    } catch (e) { return null; }
  }
  function clac(ac, cuando, vol) {
    const src = ac.createBufferSource(); src.buffer = RUIDO; src.playbackRate.value = 0.8 + Math.random() * 0.5;
    const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1800 + Math.random() * 1600; f.Q.value = 2.5;
    const g = ac.createGain(); g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(ac.destination);
    src.start(ac.currentTime + cuando);
  }
  // un golpe por cada bote de cada dado, cada vez más suave
  function sonarTirada(dados, dur) {
    const ac = audio();
    if (!ac) return;
    for (const d of dados) {
      const n = Math.floor(d.saltos);
      for (let k = 1; k <= n; k++) {
        const t = k / d.saltos;
        clac(ac, (dur * t) / 1000 + Math.random() * 0.02, 0.5 * Math.pow(0.55, k - 1));
      }
      clac(ac, dur / 1000 * 0.98, 0.12);
    }
  }
  Dd.sonarPlano = function (n) { const ac = audio(); if (!ac) return; for (let i = 0; i < n; i++) { clac(ac, i * 0.05, 0.4); clac(ac, 0.12 + i * 0.05, 0.18); } };

  Dd.lanzar = function (cont, specs) {
    const valores = specs.map((s) => s.v || CB.u.d(6));
    if (!iniciar()) { Dd.sonarPlano(specs.length); return plano(cont, specs, valores); }
    cont.innerHTML = '';
    cont.appendChild(R.renderer.domElement);
    R.renderer.domElement.className = 'lienzo-dados';
    ajustar(cont);
    for (const d of R.dados) R.scene.remove(d.mesh);
    R.dados = [];
    const n = specs.length;
    const sep = n > 4 ? 1.55 : 1.9;
    specs.forEach((s, i) => {
      const mats = VALOR_CARA.map((v) => new THREE.MeshStandardMaterial({ map: textura(s.tipo || 'j', v), roughness: 0.55, metalness: s.tipo === 'e' ? 0.25 : 0.05, transparent: true }));
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mats);
      mesh.castShadow = true;
      R.scene.add(mesh);
      const fx = (i - (n - 1) / 2) * sep;
      const fz = (Math.random() - 0.5) * 0.9 + (s.tipo === 'e' ? -0.3 : 0.3);
      const desde = s.tipo === 'e' ? 1 : -1;
      R.dados.push({
        mesh, v: valores[i],
        p0: new THREE.Vector3(desde * (7 + Math.random() * 2), 2.5 + Math.random(), fz + (Math.random() - 0.5) * 3),
        p1: new THREE.Vector3(fx, 0.5, fz),
        q0: new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6)),
        q1: quatParaValor(valores[i], (Math.random() - 0.5) * 0.9),
        eje: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
        vel: 14 + Math.random() * 8,
        saltos: 2.6 + Math.random() * 1.4,
      });
    });
    const dur = reducido() ? 250 : 1250 + Math.random() * 250;
    sonarTirada(R.dados, dur);
    return new Promise((ok) => {
      const t0 = performance.now();
      if (R.anim) cancelAnimationFrame(R.anim);
      const paso = (ahora) => {
        const t = Math.min(1, (ahora - t0) / dur);
        const e = 1 - Math.pow(1 - t, 3);
        for (const d of R.dados) {
          d.mesh.position.lerpVectors(d.p0, d.p1, e);
          d.mesh.position.y = 0.5 + d.p0.y * Math.pow(1 - t, 2) * Math.abs(Math.sin(Math.PI * d.saltos * t));
          const ang = d.vel * (1 - Math.pow(1 - t, 2)) * 0.9;
          const libre = d.q0.clone().multiply(new THREE.Quaternion().setFromAxisAngle(d.eje, ang));
          const s = Math.min(1, Math.max(0, (t - 0.45) / 0.55));
          const k = s * s * (3 - 2 * s);
          d.mesh.quaternion.copy(libre).slerp(d.q1, k);
        }
        R.renderer.render(R.scene, R.camera);
        if (t < 1) R.anim = requestAnimationFrame(paso);
        else { R.anim = null; ok(valores); }
      };
      R.anim = requestAnimationFrame(paso);
    });
  };

  /** atenúa los dados descartados (Ventaja/Desventaja) */
  Dd.descartar = function (cont, indices) {
    if (R && R.dados.length && cont.querySelector('canvas')) {
      indices.forEach((i) => R.dados[i] && R.dados[i].mesh.material.forEach((m) => (m.opacity = 0.28)));
      R.renderer.render(R.scene, R.camera);
    } else indices.forEach((i) => { const el = cont.querySelectorAll('.dado-plano')[i]; if (el) el.classList.add('fuera'); });
  };

  /** alternativa sin WebGL */
  function plano(cont, specs, valores) {
    cont.innerHTML = '';
    const els = specs.map((s) => {
      const el = CB.el('div.dado-plano.t-' + (s.tipo || 'j'));
      cont.append(el);
      return el;
    });
    const pinta = (el, v) => { el.innerHTML = PUNTOS[v].map(([x, y]) => `<i style="left:${x * 100}%;top:${y * 100}%"></i>`).join(''); };
    return new Promise((ok) => {
      let n = 0;
      const tic = setInterval(() => {
        els.forEach((el) => pinta(el, CB.u.d(6)));
        if (++n > (reducido() ? 1 : 9)) {
          clearInterval(tic);
          els.forEach((el, i) => pinta(el, valores[i]));
          ok(valores);
        }
      }, 70);
    });
  }
  Dd.pintarPlano = function (cont, specs, valores) {
    cont.innerHTML = '';
    specs.forEach((s, i) => {
      const el = CB.el('div.dado-plano.t-' + (s.tipo || 'j'));
      el.innerHTML = PUNTOS[valores[i]].map(([x, y]) => `<i style="left:${x * 100}%;top:${y * 100}%"></i>`).join('');
      cont.append(el);
    });
  };
  Dd.disponible3D = () => !!window.THREE;
})();
