// ==========================================================
//  Sonido del viaje (Web Audio, sin archivos: todo se sintetiza)
//  Fondo: la brisa y las aves del Llano abierto.
//  Arpa llanera: un glissando al cruzar una puerta, un arpegio al
//  llegar (afinado en la «hora» de cada capítulo) y una cuerda suave
//  al acercarse a una puerta.
//  Solo suena si la persona lo elige; la elección se recuerda.
// ==========================================================
const CLAVE = "tame-sonido";
let ctx = null, master = null, ambiente = null, activo = false, aves = null;
const cuerdas = new Map(); // arpa: una nota por frecuencia, generada una sola vez

// Notas de re mayor (tono habitual del joropo): cada capítulo es un grado de la escala
const NOTAS = [146.83, 164.81, 185.0, 220.0, 246.94, 293.66, 329.63]; // Inicio, I … VI
const nota = n => NOTAS[Math.max(0, Math.min(NOTAS.length - 1, n))];

function preparar() {
  if (ctx) return true;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  ctx = new AC();
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18; comp.ratio.value = 3;
  master = ctx.createGain(); master.gain.value = 0;
  master.connect(comp).connect(ctx.destination);
  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else if (activo) ctx.resume();
  });
  return true;
}

// Ruido reutilizable: "suave" (grave, para viento y soplos) y "blanco" (brillante, para los tics)
const ruidos = {};
function ruido(tipo = "suave") {
  if (ruidos[tipo]) return ruidos[tipo];
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = buf.getChannelData(0); let b = 0;
  for (let i = 0; i < d.length; i++) { const r = Math.random() * 2 - 1; b = 0.97 * b + 0.03 * r; d[i] = tipo === "suave" ? b * 6 : r * 0.5; }
  return (ruidos[tipo] = buf);
}

// Ambiente del Llano abierto: brisa que sube y baja, y aves a lo lejos
function crearAmbiente() {
  const salida = ctx.createGain(); salida.connect(master);
  salida.gain.setValueAtTime(0, ctx.currentTime); salida.gain.linearRampToValueAtTime(1, ctx.currentTime + 4); // el ambiente entra despacio
  // Brisa: ruido suave filtrado, con ráfagas lentas
  const v = ctx.createBufferSource(); v.buffer = ruido(); v.loop = true;
  const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 520; bp.Q.value = 0.5;
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1800;
  const vg = ctx.createGain(); vg.gain.value = 0.07;
  const lfo = ctx.createOscillator(), prof = ctx.createGain(); lfo.frequency.value = 0.06; prof.gain.value = 300; lfo.connect(prof).connect(bp.frequency); lfo.start();
  const lfo2 = ctx.createOscillator(), prof2 = ctx.createGain(); lfo2.frequency.value = 0.09; prof2.gain.value = 0.035; lfo2.connect(prof2).connect(vg.gain); lfo2.start();
  v.connect(bp).connect(lp).connect(vg).connect(salida); v.start();
  return salida;
}

// Aves llaneras (sintetizadas): un canto distinto cada pocos segundos, en un lado u otro del paisaje
function silbo(t, f0, f1, dur, g, pan) {
  const o = ctx.createOscillator(), v = ctx.createGain(); o.type = "sine";
  o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(g, t + dur * 0.15); v.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let fin = v; if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; v.connect(p); fin = p; }
  o.connect(v); fin.connect(ambiente || master); o.start(t); o.stop(t + dur + 0.02);
}
const CANTOS = [
  // gritos dobles y repetidos, como el alcaraván en la sabana
  (t, pan) => { for (let i = 0; i < 4; i++) { const a = t + i * 0.32; silbo(a, 1250, 1750, 0.12, 0.05, pan); silbo(a + 0.14, 1700, 1150, 0.14, 0.045, pan); } },
  // trino de pajarito: notas cortas que bajan
  (t, pan) => { const n = 6 + Math.floor(Math.random() * 6); for (let i = 0; i < n; i++) silbo(t + i * 0.07, 4200 - i * 120, 3300 - i * 100, 0.05, 0.022, pan); },
  // arrullo de paloma, grave y lejano
  (t, pan) => { [0, 0.55, 0.85].forEach((d, i) => silbo(t + d, 560, i === 0 ? 470 : 500, i === 0 ? 0.45 : 0.28, 0.05, pan)); },
  // silbido largo que sube, como un llamado entre el monte
  (t, pan) => { silbo(t, 2100, 2900, 0.35, 0.028, pan); silbo(t + 0.45, 2100, 3100, 0.4, 0.024, pan); }
];
function iniciarAves() {
  const cantar = () => {
    aves = setTimeout(cantar, 3500 + Math.random() * 6500);
    if (!activo || document.hidden || ctx.state !== "running") return;
    CANTOS[Math.floor(Math.random() * CANTOS.length)](ctx.currentTime + 0.05, Math.random() * 1.6 - 0.8);
  };
  aves = setTimeout(cantar, 1800);
}

// Arpa (síntesis Karplus-Strong): una cuerda pulsada, generada una vez por nota
function cuerda(f) {
  if (cuerdas.has(f)) return cuerdas.get(f);
  const sr = ctx.sampleRate, N = Math.round(sr / f), len = Math.floor(sr * 2.6);
  const buf = ctx.createBuffer(1, len, sr), d = buf.getChannelData(0), anillo = new Float32Array(N);
  let prev = 0;
  for (let i = 0; i < N; i++) { const r = Math.random() * 2 - 1; prev = prev * 0.55 + r * 0.45; anillo[i] = prev; } // ataque suave, de dedo y no de uña
  for (let i = 0, j = 0; i < len; i++) { const a = anillo[j], b = anillo[(j + 1) % N]; d[i] = a; anillo[j] = 0.4985 * (a + b); j = (j + 1) % N; }
  cuerdas.set(f, buf); return buf;
}
function pulsar(f, t, g = 0.22, pan = 0) {
  const s = ctx.createBufferSource(); s.buffer = cuerda(f);
  const v = ctx.createGain(); v.gain.value = g;
  let fin = v; if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; v.connect(p); fin = p; }
  s.connect(v); fin.connect(master); s.start(t);
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
    if (!ambiente) { ambiente = crearAmbiente(); iniciarAves(); }
    activo = true;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 0.4);
    document.documentElement.classList.add("con-sonido");
  },

  // Cruce de puerta: un glissando de arpa que sube mientras se abre el portal
  viaje(duracion = 1.2) {
    if (!activo) return;
    const t = ctx.currentTime + 0.02, pasos = [1, 1.125, 1.25, 1.5, 1.6875, 2, 2.25, 2.5], paso = Math.min(0.09, duracion * 0.6 / pasos.length);
    pasos.forEach((k, i) => pulsar(NOTAS[0] * k, t + i * paso, 0.1, -0.5 + i * 0.14));
  },

  // Llegada a un capítulo: arpegio de arpa que sube desde la nota de su hora
  llegada(n = 0) {
    if (!activo) return;
    const t = ctx.currentTime + 0.02, base = nota(n);
    [1, 1.25, 1.5, 2].forEach((k, i) => pulsar(base * k, t + i * 0.075, 0.2 - i * 0.03, -0.3 + i * 0.2));
  },

  // Al pasar sobre una puerta: una sola cuerda, muy suave
  nota(n = 0) { if (activo) pulsar(nota(n) * 2, ctx.currentTime + 0.01, 0.07, (n - 3) * 0.15); },

  // Al presionar un botón: sin sonido (solo arpa y Llano)
  toque() {}
};
