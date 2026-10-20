// ==========================================================
//  Sonido del viaje (Web Audio, sin archivos: todo se sintetiza)
//  Fondo: espacio profundo (un pulso grave que respira, polvo
//  cósmico y destellos lejanos con eco).
//  Cuatro llanero: el instrumento de cuerdas del joropo, afinado como
//  el real (La-Re-Fa#-Si, la cuarta cuerda aguda). Rasgueo corto al
//  acercarse a una puerta, golpe de joropo al cruzarla y un acorde
//  que queda sonando al llegar. Cada capítulo es un acorde en re mayor.
//  Solo suena si la persona lo elige; la elección se recuerda.
// ==========================================================
const CLAVE = "tame-sonido";
let ctx = null, master = null, cuatroBus = null, ambiente = null, activo = false, destellos = null;
const cuerdas = new Map(); // una muestra por frecuencia, generada una sola vez

// Afinación del cuatro llanero, de la 4.ª a la 1.ª cuerda (afinación «reentrante»: la 4.ª es aguda)
const AFINACION = [220.0, 293.66, 369.99, 246.94]; // La3 · Re4 · Fa#4 · Si3
const semitono = 2 ** (1 / 12);
// Acordes por capítulo (re mayor, como el joropo): Inicio D · I D · II G · III A7 · IV Bm · V Em · VI A7
const ACORDES = [
  [2, 6, 9], [2, 6, 9], [7, 11, 2], [9, 1, 4, 7], [11, 2, 6], [4, 7, 11], [9, 1, 4, 7]
]; // clases de altura (0 = do)
const clase = f => ((Math.round(12 * Math.log2(f / 261.63)) % 12) + 12) % 12;
// Para cada cuerda, la nota del acorde más cercana por encima de la cuerda al aire (lo que haría la mano izquierda)
function posicion(n) {
  const notas = ACORDES[Math.max(0, Math.min(ACORDES.length - 1, n))];
  return AFINACION.map(f => { let k = 0; while (k < 6 && !notas.includes(clase(f * semitono ** k))) k++; return f * semitono ** k; });
}

function preparar() {
  if (ctx) return true;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  ctx = new AC();
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16; comp.ratio.value = 3;
  master = ctx.createGain(); master.gain.value = 0;
  master.connect(comp).connect(ctx.destination);
  // Caja del cuatro: dos resonancias de madera y un poco de brillo de nailon
  const caja1 = ctx.createBiquadFilter(); caja1.type = "peaking"; caja1.frequency.value = 230; caja1.Q.value = 1.4; caja1.gain.value = 5;
  const caja2 = ctx.createBiquadFilter(); caja2.type = "peaking"; caja2.frequency.value = 480; caja2.Q.value = 1.8; caja2.gain.value = 3;
  const brillo = ctx.createBiquadFilter(); brillo.type = "highshelf"; brillo.frequency.value = 3200; brillo.gain.value = -4;
  cuatroBus = ctx.createGain(); cuatroBus.gain.value = 1;
  cuatroBus.connect(caja1).connect(caja2).connect(brillo).connect(master);
  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else if (activo) ctx.resume();
  });
  return true;
}

function ruido() {
  if (ruido.buf) return ruido.buf;
  const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate), d = buf.getChannelData(0); let b = 0;
  for (let i = 0; i < d.length; i++) { const r = Math.random() * 2 - 1; b = 0.985 * b + 0.015 * r; d[i] = b * 9; }
  return (ruido.buf = buf);
}

// Eco largo para el espacio (retardo con realimentación)
function eco(destino, tiempo = 0.48, vuelta = 0.55) {
  const ent = ctx.createGain(), dl = ctx.createDelay(2), fb = ctx.createGain(), lp = ctx.createBiquadFilter();
  dl.delayTime.value = tiempo; fb.gain.value = vuelta; lp.type = "lowpass"; lp.frequency.value = 2400;
  ent.connect(dl); dl.connect(lp).connect(fb).connect(dl); lp.connect(destino); ent.connect(destino);
  return ent;
}

// Espacio profundo: un acorde grave muy lento (La1–Mi2–La2) que respira, y polvo cósmico filtrado
function crearAmbiente() {
  const salida = ctx.createGain(); salida.connect(master);
  salida.gain.setValueAtTime(0, ctx.currentTime); salida.gain.linearRampToValueAtTime(1, ctx.currentTime + 5); // entra despacio
  const pad = ctx.createBiquadFilter(); pad.type = "lowpass"; pad.frequency.value = 420; pad.Q.value = 0.7;
  const padG = ctx.createGain(); padG.gain.value = 0.055; pad.connect(padG).connect(salida);
  const barrido = ctx.createOscillator(), barridoP = ctx.createGain(); barrido.frequency.value = 0.025; barridoP.gain.value = 220; barrido.connect(barridoP).connect(pad.frequency); barrido.start();
  [[55, 0], [55.4, 0], [82.41, 0.6], [110, 1.1], [110.6, 1.6], [164.81, 2.2]].forEach(([f, fase], i) => {
    const o = ctx.createOscillator(); o.type = i % 2 ? "triangle" : "sine"; o.frequency.value = f;
    const v = ctx.createGain(); v.gain.value = i < 2 ? 0.9 : 0.45;
    const l = ctx.createOscillator(), lp = ctx.createGain(); l.frequency.value = 0.03 + i * 0.011; lp.gain.value = 0.35; l.connect(lp).connect(v.gain);
    o.connect(v).connect(pad); o.start(ctx.currentTime + fase * 0.1); l.start();
  });
  // Polvo cósmico: ruido grave que se abre y se cierra muy lento
  const n = ctx.createBufferSource(); n.buffer = ruido(); n.loop = true;
  const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 260; bp.Q.value = 0.9;
  const ng = ctx.createGain(); ng.gain.value = 0.03;
  const l2 = ctx.createOscillator(), p2 = ctx.createGain(); l2.frequency.value = 0.04; p2.gain.value = 160; l2.connect(p2).connect(bp.frequency); l2.start();
  n.connect(bp).connect(ng).connect(salida); n.start();
  salida.eco = eco(salida, 0.62, 0.6);
  return salida;
}

// Destellos lejanos: una nota alta y fría, con eco largo, cada tantos segundos
function iniciarDestellos() {
  const ESCALA = [880, 987.77, 1318.51, 1479.98, 1760, 2217.46];
  const sonar = () => {
    destellos = setTimeout(sonar, 4500 + Math.random() * 7000);
    if (!activo || document.hidden || ctx.state !== "running") return;
    const t = ctx.currentTime + 0.05, f = ESCALA[Math.floor(Math.random() * ESCALA.length)];
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), v = ctx.createGain();
    o.type = "sine"; o.frequency.value = f; o2.type = "sine"; o2.frequency.value = f * 2.005;
    v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(0.018, t + 0.6); v.gain.exponentialRampToValueAtTime(0.0001, t + 4.5);
    let fin = v; if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = Math.random() * 1.6 - 0.8; v.connect(p); fin = p; }
    o.connect(v); o2.connect(v); fin.connect(ambiente.eco); o.start(t); o2.start(t); o.stop(t + 4.6); o2.stop(t + 4.6);
  };
  destellos = setTimeout(sonar, 2500);
}

// Cuerda de nailon del cuatro (Karplus-Strong): ataque con uña, decaimiento corto y cálido
function cuerda(f) {
  const clave = Math.round(f * 100);
  if (cuerdas.has(clave)) return cuerdas.get(clave);
  const sr = ctx.sampleRate, N = Math.round(sr / f), len = Math.floor(sr * 1.8);
  const buf = ctx.createBuffer(1, len, sr), d = buf.getChannelData(0), anillo = new Float32Array(N);
  let prev = 0;
  for (let i = 0; i < N; i++) { const r = Math.random() * 2 - 1; prev = prev * 0.3 + r * 0.7; anillo[i] = prev; }
  // punto de pulsación cerca del puente: quita un poco de grave para el timbre del cuatro
  const p = Math.max(1, Math.round(N * 0.13)), copia = anillo.slice();
  for (let i = 0; i < N; i++) anillo[i] = copia[i] - copia[(i + p) % N] * 0.6;
  for (let i = 0, j = 0; i < len; i++) { const a = anillo[j], b = anillo[(j + 1) % N]; d[i] = a; anillo[j] = 0.4965 * (a + b); j = (j + 1) % N; }
  cuerdas.set(clave, buf); return buf;
}
function pulsar(f, t, g, pan = 0, corta = 0) {
  const s = ctx.createBufferSource(); s.buffer = cuerda(f);
  s.detune.value = (Math.random() - 0.5) * 6; // cuerdas de verdad nunca están perfectas
  const v = ctx.createGain(); v.gain.setValueAtTime(g, t);
  if (corta) v.gain.setTargetAtTime(0, t + corta, 0.02); // apagada con la palma (el «chasquido»)
  let fin = v; if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; v.connect(p); fin = p; }
  s.connect(v); fin.connect(cuatroBus); s.start(t); s.stop(t + (corta ? corta + 0.15 : 1.8));
}
// Un golpe de la mano derecha: «abajo» va de la 4.ª a la 1.ª cuerda; «arriba», al revés
function rasgueo(n, t, { arriba = false, g = 0.16, corta = 0, abre = 0.011 } = {}) {
  const notas = posicion(n), orden = arriba ? [3, 2, 1, 0] : [0, 1, 2, 3];
  orden.forEach((k, i) => pulsar(notas[k], t + i * (abre + Math.random() * 0.004), g * (arriba ? 0.75 : 1) * (1 - i * 0.06), -0.2 + k * 0.13, corta));
  if (corta) { // el chasquido: ruido corto de la mano sobre las cuerdas
    const s = ctx.createBufferSource(); s.buffer = ruido();
    const hp = ctx.createBiquadFilter(); hp.type = "bandpass"; hp.frequency.value = 1800; hp.Q.value = 0.8;
    const v = ctx.createGain(); v.gain.setValueAtTime(0.05, t + corta); v.gain.exponentialRampToValueAtTime(0.0001, t + corta + 0.05);
    s.connect(hp).connect(v).connect(cuatroBus); s.start(t + corta, Math.random()); s.stop(t + corta + 0.08);
  }
}

export const sonido = {
  get activo() { return activo; },
  // Preferencia guardada: null = aún no ha elegido
  get preferencia() { try { const v = localStorage.getItem(CLAVE); return v == null ? null : v === "1"; } catch (e) { return null; } },

  // Encender o apagar (debe llamarse desde un clic o toque: así lo exigen los navegadores)
  async activar(si) {
    try { localStorage.setItem(CLAVE, si ? "1" : "0"); } catch (e) {}
    if (!si) {
      activo = false;
      if (ctx) { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(0, ctx.currentTime, 0.25); }
      document.documentElement.classList.remove("con-sonido");
      return;
    }
    if (!preparar()) return;
    // Si no vino de un clic (p. ej. visita repetida que entra sola), el navegador lo deja en pausa:
    // arranca con el primer toque o tecla.
    ctx.resume();
    if (ctx.state !== "running") {
      // iPhone solo acepta arrancar el audio en un toque completo (touchend/click), no en pointerdown
      const gestos = ["pointerdown", "touchend", "click", "keydown"];
      const despertar = () => { if (!activo) return; ctx.resume().then(() => { if (ctx.state === "running") gestos.forEach(g => removeEventListener(g, despertar, true)); }); };
      gestos.forEach(g => addEventListener(g, despertar, true));
    }
    if (!ambiente) { ambiente = crearAmbiente(); iniciarDestellos(); }
    activo = true;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.85, ctx.currentTime + 0.4);
    document.documentElement.classList.add("con-sonido");
  },

  // Cruce de puerta: un golpe de joropo (abajo, chasquido, arriba, abajo…) que acelera con el portal
  viaje(duracion = 1.2, n = 0) {
    if (!activo) return;
    const t = ctx.currentTime + 0.02, golpe = Math.min(0.15, duracion / 8);
    [["abajo", 0], ["abajo", 1], ["arriba", 0], ["abajo", 0], ["abajo", 1], ["arriba", 0]].forEach(([dir, ch], i) =>
      rasgueo(n, t + i * golpe, { arriba: dir === "arriba", g: 0.1 + i * 0.012, corta: ch ? 0.06 : 0 }));
  },

  // Llegada a un capítulo: su acorde, rasgueado y dejado sonar, con una nota que canta arriba
  llegada(n = 0) {
    if (!activo) return;
    const t = ctx.currentTime + 0.02, notas = posicion(n);
    rasgueo(n, t, { g: 0.2, abre: 0.022 });
    pulsar(Math.max(...notas) * 2, t + 0.32, 0.08, 0.3);
  },

  // Al acercarse a una puerta: un rasgueo corto y suave de su acorde
  nota(n = 0) {
    if (!activo) return;
    const t = ctx.currentTime + 0.01;
    rasgueo(n, t, { g: 0.07, abre: 0.016 });
  },

  // Al presionar un botón: sin sonido
  toque() {}
};
