// ==========================================================
//  Sonido del viaje (Web Audio, sin archivos: todo se sintetiza)
//  Ambiente: un bordón grave y cálido, el viento del Llano y,
//  a lo lejos, los grillos de la sabana de noche. El reloj marca
//  cada segundo junto con el segundero del reloj 3D.
//  Efectos: al cruzar una puerta suena un soplo que acelera con
//  las estrellas, y al llegar, un arpegio de arpa (el arpa llanera)
//  afinado en la "hora" de cada capítulo.
//  Solo suena si la persona lo elige; la elección se recuerda.
// ==========================================================
const CLAVE = "tame-sonido";
let ctx = null, master = null, ambiente = null, activo = false, tics = null, grillos = null;
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

// Ambiente continuo: bordón (re y la graves) + viento
function crearAmbiente() {
  const salida = ctx.createGain(); salida.connect(master);
  salida.gain.setValueAtTime(0, ctx.currentTime); salida.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 5); // el ambiente entra despacio
  const filtro = ctx.createBiquadFilter(); filtro.type = "lowpass"; filtro.frequency.value = 380; filtro.Q.value = 0.6;
  const bordon = ctx.createGain(); bordon.gain.value = 0.16; filtro.connect(bordon).connect(salida);
  [[73.42, "sine", 0.9], [110.0, "sine", 0.55], [146.9, "triangle", 0.18], [110.4, "sine", 0.4]].forEach(([f, tipo, g]) => {
    const o = ctx.createOscillator(), v = ctx.createGain(); o.type = tipo; o.frequency.value = f; v.gain.value = g; o.connect(v).connect(filtro); o.start();
  });
  // respiración lenta del bordón y del filtro
  const lfo = ctx.createOscillator(), prof = ctx.createGain(); lfo.frequency.value = 0.045; prof.gain.value = 140; lfo.connect(prof).connect(filtro.frequency); lfo.start();
  const lfo2 = ctx.createOscillator(), prof2 = ctx.createGain(); lfo2.frequency.value = 0.07; prof2.gain.value = 0.05; lfo2.connect(prof2).connect(bordon.gain); lfo2.start();
  // viento del Llano
  const v = ctx.createBufferSource(); v.buffer = ruido(); v.loop = true;
  const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 650; bp.Q.value = 0.8;
  const vg = ctx.createGain(); vg.gain.value = 0.05;
  const lfo3 = ctx.createOscillator(), prof3 = ctx.createGain(); lfo3.frequency.value = 0.031; prof3.gain.value = 380; lfo3.connect(prof3).connect(bp.frequency); lfo3.start();
  v.connect(bp).connect(vg).connect(salida); v.start();
  return salida;
}

// Tic-tac sincronizado con el segundero del reloj 3D (que salta en cada segundo entero)
function iniciarTics() {
  let proximo = Math.ceil(performance.now() / 1000), par = false;
  tics = setInterval(() => {
    if (!activo || document.hidden || ctx.state !== "running") { proximo = Math.ceil(performance.now() / 1000); return; } // en pausa no se acumulan tics
    const ahora = performance.now() / 1000;
    while (proximo < ahora + 0.3) {
      if (proximo > ahora) clic(ctx.currentTime + (proximo - ahora), par ? 1900 : 2500, 0.05);
      proximo += 1; par = !par;
    }
  }, 120);
}
function clic(t, f, g) {
  const s = ctx.createBufferSource(); s.buffer = ruido("blanco");
  const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = f; bp.Q.value = 9;
  const v = ctx.createGain(); v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(g, t + 0.002); v.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  s.connect(bp).connect(v).connect(master); s.start(t, Math.random()); s.stop(t + 0.08);
}

// Grillos de la sabana: chirridos breves, lejanos y al azar
function iniciarGrillos() {
  const cantar = () => {
    grillos = setTimeout(cantar, 1800 + Math.random() * 4200);
    if (!activo || document.hidden || ctx.state !== "running") return;
    const t = ctx.currentTime + 0.05, f = 4200 + Math.random() * 700, pulsos = 2 + Math.floor(Math.random() * 3);
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null; if (pan) pan.pan.value = Math.random() * 1.6 - 0.8;
    const v = ctx.createGain(); v.gain.value = 0;
    const o = ctx.createOscillator(); o.frequency.value = f; o.connect(v);
    if (pan) v.connect(pan).connect(master); else v.connect(master);
    for (let i = 0; i < pulsos; i++) { const a = t + i * 0.07; v.gain.setValueAtTime(0, a); v.gain.linearRampToValueAtTime(0.006, a + 0.012); v.gain.linearRampToValueAtTime(0, a + 0.045); }
    o.start(t); o.stop(t + pulsos * 0.07 + 0.05);
  };
  grillos = setTimeout(cantar, 2500);
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
    if (!ambiente) { ambiente = crearAmbiente(); iniciarTics(); iniciarGrillos(); }
    activo = true;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 0.4);
    document.documentElement.classList.add("con-sonido");
  },

  // Cruce de puerta: soplo que acelera con las estrellas (dura lo mismo que la transición)
  viaje(duracion = 1.2) {
    if (!activo) return;
    const t = ctx.currentTime, s = ctx.createBufferSource(); s.buffer = ruido(); s.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(160, t); bp.frequency.exponentialRampToValueAtTime(2600, t + duracion * 0.75); bp.frequency.exponentialRampToValueAtTime(500, t + duracion * 1.4);
    const v = ctx.createGain(); v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(0.5, t + duracion * 0.7); v.gain.exponentialRampToValueAtTime(0.0001, t + duracion * 1.5);
    s.connect(bp).connect(v).connect(master); s.start(t); s.stop(t + duracion * 1.6);
    // tono que sube por debajo del soplo
    const o = ctx.createOscillator(), og = ctx.createGain(); o.type = "sine";
    o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(440, t + duracion);
    og.gain.setValueAtTime(0, t); og.gain.linearRampToValueAtTime(0.05, t + duracion * 0.6); og.gain.linearRampToValueAtTime(0, t + duracion * 1.1);
    o.connect(og).connect(master); o.start(t); o.stop(t + duracion * 1.2);
  },

  // Llegada a un capítulo: arpegio de arpa que sube desde la nota de su hora
  llegada(n = 0) {
    if (!activo) return;
    const t = ctx.currentTime + 0.02, base = nota(n);
    [1, 1.25, 1.5, 2].forEach((k, i) => pulsar(base * k, t + i * 0.075, 0.2 - i * 0.03, -0.3 + i * 0.2));
  },

  // Al pasar sobre una puerta: una sola cuerda, muy suave
  nota(n = 0) { if (activo) pulsar(nota(n) * 2, ctx.currentTime + 0.01, 0.07, (n - 3) * 0.15); },

  // Al presionar un botón: un tic de madera
  toque() { if (activo) clic(ctx.currentTime + 0.005, 1400, 0.12); }
};
