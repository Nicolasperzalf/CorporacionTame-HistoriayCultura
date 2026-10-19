// ==========================================================
//  Contexto global de movimiento
//  Todo lo que se mueve en el sitio usa estas mismas curvas y
//  tiempos, para que el viaje se sienta coordinado (las mismas
//  variables existen en CSS: --sale y --mueve en css/styles.css).
//  Índice: 1 Ajustes · 2 Revelado (máscara, cadena, autodibujo)
//          3 Luz que sigue el cursor y chispas · 4 Puertas del tiempo
//          5 Portal: transición de salida y entrada entre capítulos
// ==========================================================

/* 1 · AJUSTES ------------------------------------------------- */
export const MOV = {
  reduce: matchMedia("(prefers-reduced-motion: reduce)").matches,
  fino: matchMedia("(hover: hover) and (pointer: fine)").matches // ratón o trackpad (no pantallas táctiles)
};
export const CURVA = {
  sale: "cubic-bezier(.23, 1, .32, 1)",     // entradas y respuestas: arranca rápido, frena suave
  mueve: "cubic-bezier(.77, 0, .175, 1)"    // desplazamientos en pantalla: acelera y frena
};
// Tiempos del cruce entre capítulos (en milisegundos). El sonido y el reloj 3D se sincronizan con ellos.
export const TIEMPOS = { abre: 680, mantiene: 420, cruza: 700 };
const esperar = ms => new Promise(r => setTimeout(r, ms));
const $ = (s, r = document) => r.querySelector(s);

/* 2 · REVELADO ------------------------------------------------ */
// Máscara: cada palabra del titular vive en una "ventana" (overflow oculto) y sube desde
// abajo. El texto sigue siendo texto real: lectores de pantalla y buscadores lo leen igual.
export function enmascarar(el) {
  if (!el || el.dataset.mk) return el;
  el.dataset.mk = "1"; let i = 0;
  const partir = nodo => [...nodo.childNodes].forEach(n => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(w => {
        if (!w) return;
        if (!w.trim()) { frag.append(" "); return; }
        const caja = document.createElement("span"), pal = document.createElement("span");
        caja.className = "mk"; pal.className = "mk-i"; pal.style.setProperty("--i", i++); pal.textContent = w;
        caja.append(pal); frag.append(caja);
      });
      n.replaceWith(frag);
    } else if (n.nodeType === 1 && n.tagName !== "BR") partir(n);
  });
  partir(el); return el;
}
// Para titulares que cambian sin salir del capítulo (monumento, hito, libro)
export function mascaraViva(el) {
  if (!el) return;
  enmascarar(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("visto")));
}
// Movimientos encadenados: lo que entra a la vez en pantalla se revela en orden de lectura
// (antetítulo → titular palabra a palabra → texto → botones), con 110 ms entre cada paso.
// [data-rv] aparece · [data-mask] sube palabra a palabra · [data-dibujo] (SVG) se dibuja solo.
let io;
export function revelar(raices) {
  io && io.disconnect();
  const els = raices.flatMap(r => r ? [...r.querySelectorAll("[data-rv],[data-mask],[data-dibujo]")] : []).filter(el => !el.classList.contains("visto"));
  els.forEach(el => el.hasAttribute("data-mask") && enmascarar(el));
  if (MOV.reduce || !("IntersectionObserver" in window)) { els.forEach(el => el.classList.add("visto")); return; }
  io = new IntersectionObserver(es => {
    es.filter(en => en.isIntersecting).map(en => en.target)
      .sort((a, b) => a.compareDocumentPosition(b) & 4 ? -1 : 1)
      .forEach((el, n) => {
        const d = Math.min(n, 4) * 110;
        el.style.setProperty("--d0", d + "ms");
        el.classList.remove("oculto"); el.classList.add("visto");
        setTimeout(() => el.style.removeProperty("--d0"), 2200 + d);
        io.unobserve(el);
      });
  }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });
  els.forEach(el => { if (el.hasAttribute("data-rv")) el.classList.add("oculto"); io.observe(el); });
}
// Vuelve a dibujar un SVG (por ejemplo, al pasar el cursor sobre una puerta)
export function redibujar(svg) {
  if (!svg || MOV.reduce) return;
  svg.classList.remove("visto"); void svg.getBoundingClientRect(); svg.classList.add("visto");
}

/* 3 · LUZ QUE SIGUE EL CURSOR Y CHISPAS -------------------------- */
// Los elementos con clase .luz tienen un filo de luz dorada que se ubica en el punto del borde
// más cercano al cursor y se enciende cuando el cursor se acerca (aunque aún no esté encima),
// con un halo y chispas que saltan desde ese punto. En pantallas táctiles la luz gira sola
// alrededor del botón, como el segundero de un reloj (ver css/movimiento.css).
const ALCANCE = 120;           // px a los que el botón "siente" el cursor
const luces = new Map();       // elemento → { a: ángulo actual, ta: ángulo meta, i: intensidad, ti: meta, ver: visible }
let px = -1e4, py = -1e4, rafLuz = 0, ultimaChispa = 0, movido = false;
const ioLuz = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { const s = luces.get(e.target); if (s) s.ver = e.isIntersecting; })) : null;

export function observarLuces(raiz = document) {
  for (const el of luces.keys()) if (!el.isConnected) { ioLuz?.unobserve(el); luces.delete(el); }
  if (MOV.reduce) return;
  raiz.querySelectorAll(".luz").forEach(el => {
    if (luces.has(el)) return;
    luces.set(el, { a: 0, ta: 0, i: 0, ti: 0, ver: !ioLuz });
    ioLuz?.observe(el);
  });
}
function pasoLuz(t) {
  rafLuz = 0; let sigue = false;
  for (const [el, s] of luces) {
    if (!s.ver && s.i < 0.01) continue;
    if (movido && s.ver) {
      const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = Math.max(r.left - px, 0, px - r.right), dy = Math.max(r.top - py, 0, py - r.bottom);
      s.ti = Math.max(0, 1 - Math.hypot(dx, dy) / ALCANCE);
      if (s.ti > 0) s.ta = Math.atan2(px - cx, cy - py) * 180 / Math.PI; // 0° = arriba, como en conic-gradient
      // chispas desde el punto del borde que mira al cursor
      if (s.ti > 0.6 && t - ultimaChispa > 38) {
        ultimaChispa = t;
        const vx = px - cx, vy = py - cy, k = Math.min((r.width / 2) / Math.abs(vx || 1e-6), (r.height / 2) / Math.abs(vy || 1e-6));
        const len = Math.hypot(vx, vy) || 1;
        chispas(cx + vx * k, cy + vy * k, vx / len, vy / len, 1);
      }
    }
    const d = ((s.ta - s.a + 540) % 360) - 180;
    s.a += d * 0.22; s.i += (s.ti - s.i) * 0.16;
    if (Math.abs(d) > 0.3 || Math.abs(s.ti - s.i) > 0.004) sigue = true;
    el.style.setProperty("--ang", s.a.toFixed(1) + "deg");
    el.style.setProperty("--luz", s.i.toFixed(3));
  }
  movido = false;
  if (sigue) rafLuz = requestAnimationFrame(pasoLuz);
}

// Chispas: un solo lienzo para todo el sitio, que solo se anima mientras hay chispas vivas
let lienzo, c2d, vivas = [], rafCh = 0, dpr = 1;
function prepararLienzo() {
  if (lienzo) return;
  lienzo = document.createElement("canvas"); lienzo.id = "chispas"; lienzo.setAttribute("aria-hidden", "true");
  document.body.append(lienzo); c2d = lienzo.getContext("2d");
  const medir = () => { dpr = Math.min(2, devicePixelRatio || 1); lienzo.width = innerWidth * dpr; lienzo.height = innerHeight * dpr; };
  medir(); addEventListener("resize", medir);
}
export function chispas(x, y, nx = 0, ny = -1, n = 10) {
  if (MOV.reduce) return;
  prepararLienzo();
  for (let k = 0; k < n; k++) {
    const ang = Math.atan2(ny, nx) + (Math.random() - 0.5) * (n > 1 ? Math.PI * 2 : 1.4), v = 0.25 + Math.random() * (n > 1 ? 1.4 : 0.6);
    vivas.push({ x, y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v - 0.15, vida: 0, max: 600 + Math.random() * 700, r: 0.6 + Math.random() * 1.3, perla: Math.random() < 0.3 });
  }
  if (!rafCh) { let t0 = performance.now(); rafCh = requestAnimationFrame(function pintar(t) {
    const dt = Math.min(40, t - t0); t0 = t;
    c2d.setTransform(dpr, 0, 0, dpr, 0, 0); c2d.clearRect(0, 0, innerWidth, innerHeight);
    c2d.globalCompositeOperation = "lighter";
    vivas = vivas.filter(p => (p.vida += dt) < p.max);
    for (const p of vivas) {
      p.x += p.vx * dt / 16; p.y += p.vy * dt / 16; p.vx *= 0.985; p.vy = p.vy * 0.985 - 0.004;
      const a = 1 - p.vida / p.max;
      c2d.fillStyle = p.perla ? `rgba(243,239,231,${a * 0.9})` : `rgba(226,196,138,${a})`;
      c2d.beginPath(); c2d.arc(p.x, p.y, p.r * (0.6 + a * 0.6), 0, 6.283); c2d.fill();
    }
    rafCh = vivas.length ? requestAnimationFrame(pintar) : 0;
    if (!rafCh) c2d.clearRect(0, 0, innerWidth, innerHeight);
  }); }
}
export function iniciarLuces() {
  if (MOV.reduce) return;
  if (MOV.fino) {
    addEventListener("pointermove", e => { px = e.clientX; py = e.clientY; movido = true; if (!rafLuz) rafLuz = requestAnimationFrame(pasoLuz); }, { passive: true });
    document.addEventListener("pointerleave", () => { px = py = -1e4; movido = true; if (!rafLuz) rafLuz = requestAnimationFrame(pasoLuz); });
  }
  // Al tocar (celular) o hacer clic: una ráfaga de chispas desde el punto tocado
  addEventListener("pointerdown", e => { if (e.target.closest?.(".luz")) chispas(e.clientX, e.clientY, 0, -1, MOV.fino ? 8 : 14); }, { passive: true });
}

/* 4 · PUERTAS DEL TIEMPO ---------------------------------------- */
// Cada puerta tiene un túnel de arcos que avanza sin fin. Al acercar el cursor o enfocarla,
// el túnel acelera suavemente (como el salto a la velocidad de la luz) y vuelve a su ritmo al salir.
// Fuera de pantalla los túneles se pausan para no gastar batería.
export function animarPuertas(raiz, alEntrar) {
  const puertas = [...raiz.querySelectorAll(".puerta")];
  if (!puertas.length) return () => {};
  const vista = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle("quieta", !e.isIntersecting)), { rootMargin: "80px" }) : null;
  puertas.forEach(p => {
    vista?.observe(p);
    let vel = 1, meta = 1, raf = 0;
    const paso = () => {
      vel += (meta - vel) * 0.07;
      p.querySelectorAll(".anillo").forEach(a => a.getAnimations?.().forEach(an => { an.playbackRate = vel; }));
      raf = Math.abs(meta - vel) > 0.01 ? requestAnimationFrame(paso) : 0;
    };
    const acelerar = m => { meta = m; if (!raf && !MOV.reduce) raf = requestAnimationFrame(paso); };
    const entra = () => { acelerar(4.5); alEntrar?.(p); };
    p.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") entra(); });
    p.addEventListener("pointerleave", () => acelerar(1));
    p.addEventListener("focus", entra); p.addEventListener("blur", () => acelerar(1));
  });
  return () => vista?.disconnect();
}

/* 5 · PORTAL ENTRE CAPÍTULOS ------------------------------------ */
// Transición de salida conectada: el elemento que tocaste (una puerta, el reloj del siguiente
// capítulo, un botón del menú) se abre hasta cubrir la pantalla con el túnel del tiempo; el
// capítulo actual se aleja, se cambia el contenido y lo atraviesas hacia el nuevo capítulo.
// Recorte inicial: la forma exacta del elemento de origen (arco, círculo o rectángulo).
function recorteDesde(el) {
  const W = innerWidth, H = innerHeight;
  let r = el?.getBoundingClientRect?.();
  if (!r || !r.width || r.bottom < 0 || r.top > H) r = { left: W / 2 - 60, right: W / 2 + 60, top: H / 2 - 90, bottom: H / 2 + 90, width: 120, height: 180 };
  const forma = el?.dataset?.forma || (r.width === 120 && r.height === 180 ? "arco" : "redondo");
  const w = r.width, h = r.height;
  const rad = forma === "arco" ? [w / 2, w / 2, 14, 14] : forma === "circulo" ? [w / 2, w / 2, w / 2, w / 2] : [Math.min(h / 2, 28), Math.min(h / 2, 28), Math.min(h / 2, 28), Math.min(h / 2, 28)];
  return `inset(${r.top.toFixed(1)}px ${(W - r.right).toFixed(1)}px ${(H - r.bottom).toFixed(1)}px ${r.left.toFixed(1)}px round ${rad.map(v => v.toFixed(1) + "px").join(" ")})`;
}
export async function atravesar({ origen, numeral, antes = "Capítulo", titulo, icono = "", cambiar, alCruzar }) {
  const portal = $("#portal"), app = $("#app");
  if (MOV.reduce || !portal?.animate) { cambiar(); alCruzar?.(); return; }
  // Contenido del portal: ícono que se dibuja, numeral y nombre que sube palabra a palabra
  $("#portal-k").textContent = antes;
  $("#portal-n").textContent = numeral;
  const t = $("#portal-t"); t.textContent = titulo; delete t.dataset.mk; t.classList.remove("visto"); enmascarar(t);
  $("#portal-ico").innerHTML = icono;
  const desenfoque = MOV.fino ? "blur(10px)" : "blur(0px)"; // en celular sin desenfoque: rinde más
  portal.hidden = false; portal.classList.remove("cruzando");
  void portal.offsetWidth;
  portal.classList.add("abierto");
  $("#portal-ico svg")?.classList.add("visto");
  t.classList.add("visto");
  app.style.transformOrigin = `50% ${scrollY + innerHeight / 2}px`;
  const abre = portal.animate([{ clipPath: recorteDesde(origen) }, { clipPath: "inset(0px 0px 0px 0px round 0px 0px 0px 0px)" }], { duration: TIEMPOS.abre, easing: CURVA.mueve, fill: "both" });
  const aleja = app.animate([{ opacity: 1, transform: "scale(1)", filter: "blur(0px)" }, { opacity: 0, transform: "scale(.93)", filter: desenfoque }], { duration: TIEMPOS.abre * 0.9, easing: CURVA.mueve, fill: "both" });
  let cruza = null;
  try {
    await abre.finished.catch(() => {});
    cambiar();
    app.style.transformOrigin = `50% ${innerHeight / 2}px`;
    await esperar(TIEMPOS.mantiene);
    alCruzar?.();
    portal.classList.add("cruzando");
    aleja.cancel();
    const llega = app.animate([{ opacity: 0, transform: "scale(.95)", filter: desenfoque }, { opacity: 1, transform: "scale(1)", filter: "blur(0px)" }], { duration: TIEMPOS.cruza, easing: CURVA.sale });
    cruza = portal.animate([{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(1.6)" }], { duration: TIEMPOS.cruza * 0.85, easing: "cubic-bezier(.5, 0, .75, 0)", fill: "both" });
    await Promise.all([cruza.finished, llega.finished].map(p => p.catch(() => {})));
  } finally { // pase lo que pase, el portal se cierra y el sitio vuelve a verse
    portal.hidden = true; portal.classList.remove("abierto", "cruzando");
    abre.cancel(); aleja.cancel(); cruza?.cancel();
    app.style.transformOrigin = "";
  }
}
