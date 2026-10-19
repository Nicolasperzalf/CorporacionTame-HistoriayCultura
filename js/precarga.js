// ==========================================================
//  Pantalla de carga: «Hace 400 años, a orillas del río Tame»
//  - El logotipo dentro de un aro que se llena como un reloj: sus
//    12 marcas aparecen una a una (en el arte rupestre del Casanare
//    hay círculos y puntos que se leen como calendarios del cielo).
//  - El contador de años va de 1629 a 2029.
//  - Abajo, un friso de línea se dibuja solo de izquierda a derecha
//    mientras carga: la cordillera, el río Tame con una canoa de un
//    solo tronco, la vasija de barro, el caney (casa comunal), el
//    chinchorro, el arco de macana y el morichal. El avance del dibujo
//    ES la barra de progreso; una plumilla dorada marca dónde va.
//  - Para que la espera no frustre: mensajes de etapa, datos de la
//    época (citas de la crónica de Gumilla) y, si la conexión es lenta,
//    un botón para entrar sin esperar el fondo 3D.
//  Fuentes y criterios: /mnt/project-files/investigacion/ (informe).
// ==========================================================

// ── Motivos del friso (lienzo de 2000 × 400; el suelo está en y ≈ 340) ──
// Cada motivo devuelve trazos "d"; los que llevan clase se pintan distinto (cielo, agua…).
const T = (d, c = "") => ({ d, c });

// Espiral de Arquímedes (motivo frecuente en las rocas grabadas de Sabanalarga, Casanare)
function espiral(cx, cy, vueltas, rMax, c = "cielo") {
  let d = "", pasos = Math.round(vueltas * 36);
  for (let i = 0; i <= pasos; i++) {
    const a = i / 36 * Math.PI * 2, r = rMax * i / pasos;
    d += (i ? "L" : "M") + (cx + Math.cos(a) * r).toFixed(1) + " " + (cy + Math.sin(a) * r).toFixed(1);
  }
  return T(d, c);
}
const circ = (cx, cy, r, c = "") => T(`M${cx} ${cy - r}a${r} ${r} 0 1 1 0 ${2 * r}a${r} ${r} 0 1 1 0 ${-2 * r}`, c);

// Palma de moriche: tronco delgado y una corona de hojas en abanico que caen
function moriche(x, y0, y1, s = 1, inclina = 0) {
  const tx = x + inclina, hojas = [];
  for (const [a, l, caida] of [[-150, 62, 22], [-122, 70, 8], [-95, 58, -4], [-60, 66, 6], [-32, 70, 20], [-172, 46, 30], [-8, 50, 30]]) {
    const r = a * Math.PI / 180, ex = tx + Math.cos(r) * l * s, ey = y1 + Math.sin(r) * l * s + caida * s;
    const mx = tx + Math.cos(r) * l * s * 0.55, my = y1 + Math.sin(r) * l * s * 0.55 - 10 * s;
    hojas.push(T(`M${tx} ${y1}Q${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`));
  }
  return [T(`M${x} ${y0}C${x + 4} ${(y0 * 0.6 + y1 * 0.4).toFixed(0)} ${tx - 4} ${(y0 * 0.3 + y1 * 0.7).toFixed(0)} ${tx} ${y1}`), ...hojas];
}

const FRISO = [
  // Cielo: espirales y círculos concéntricos, como constelaciones (arte rupestre regional)
  espiral(200, 118, 2.5, 20), circ(1238, 140, 8, "cielo"), circ(1238, 140, 16, "cielo"), circ(1238, 140, 24, "cielo"), espiral(1880, 128, 2.5, 20),
  // La cordillera: el piedemonte donde nace el río Tame («baxa caudaloso de las nevadas de Chita»)
  T("M0 226C34 212 62 196 90 204C112 210 128 156 156 152C178 150 196 186 222 176C242 168 256 134 278 136C304 138 318 174 346 170C380 164 404 198 444 200C484 202 520 226 560 250"),
  T("M0 284C60 266 132 258 204 268C276 278 330 280 398 290C430 296 452 300 470 304"),
  // El río Tame: baja de la montaña y se abre hacia nosotros
  T("M470 304C480 324 474 350 452 370C436 384 424 394 414 400", "agua"),
  T("M514 300C544 318 584 334 636 348C690 362 748 382 820 400", "agua"),
  T("M456 392q10-4 20 0t20 0", "agua"), T("M660 380q10-4 20 0t20 0", "agua"), T("M740 394q10-4 20 0t20 0", "agua"),
  // Canoa de un solo tronco, ahuecada con fuego, y su remero
  T("M500 356C530 370 612 372 652 352C644 368 618 380 572 381C532 381 512 372 500 356Z"),
  circ(574, 314, 8),
  T("M574 322C570 332 570 344 574 360"),
  T("M573 330C582 334 590 334 600 326M574 336C582 344 590 348 594 352"),
  T("M608 314L584 374M584 374c-4 7-6 15-3 21c5-4 8-12 6-21", "remo"),
  // El suelo de la sabana
  T("M0 340C150 338 300 341 474 340"),
  T("M612 340C760 342 900 341 1060 341C1300 339 1600 341 2000 339"),
  // Vasija de barro hecha con rollos, con su banda de volutas y dos asas
  T("M712 344C696 332 692 304 708 290C714 284 718 280 718 274H754C754 280 758 284 764 290C780 304 776 332 760 344Z"),
  T("M714 274H758"),
  T("M708 296c-10 2-12 14-4 18M764 296c10 2 12 14 4 18"),
  T("M714 308c4-6 11-4 9 2c-2 4-6 3-6 0M730 308c4-6 11-4 9 2c-2 4-6 3-6 0M746 308c4-6 11-4 9 2c-2 4-6 3-6 0"),
  T("M706 324C722 328 750 328 766 324"),
  // El conuco: yuca y plátano («grandes labranceros de la yuca y el plátano», Rivero)
  T("M806 340V300M806 300l-13-9M806 300l-7-15M806 300l2-16M806 300l9-13M806 300l14-5"),
  T("M856 340C854 310 858 282 856 254"),
  T("M856 256C836 240 812 242 796 256M856 256C878 236 906 236 922 250M856 258C848 230 852 210 864 196M856 262C872 248 890 250 902 266"),
  T("M862 272c6 4 8 12 4 18"),
  T("M914 340V308M914 308l-11-8M914 308l-5-13M914 308l2-14M914 308l8-11M914 308l12-4"),
  // El caney: la casa grande comunal, de techo de palma hasta casi el suelo
  T("M960 300C996 236 1034 196 1060 176C1086 196 1124 236 1160 300"),
  T("M950 302C1010 312 1110 312 1170 302"),
  T("M1060 186L1030 300M1060 186L1090 300M1060 186L1060 306M1048 200L1000 296M1072 200L1120 296"),
  T("M1060 176V158"),
  T("M976 306V340M1144 306V340"),
  T("M1042 340V320C1042 312 1078 312 1078 320V340"),
  // La enramada con el chinchorro tejido de moriche, y alguien que descansa en él
  T("M1200 340V254M1340 340V254"),
  T("M1188 256L1270 228L1352 256"),
  T("M1200 270L1220 288M1340 270L1320 288"),
  T("M1220 288C1246 322 1294 322 1320 288"),
  T("M1220 288C1244 330 1296 330 1320 288"),
  T("M1236 300l10 14M1256 305l8 12M1276 305l-8 12M1296 300l-10 14", "malla"),
  circ(1236, 286, 7),
  // El arco de macana, apoyado en el poste
  T("M1352 340C1372 300 1372 262 1356 226M1352 340L1356 226", "arco"),
  // El morichal
  ...moriche(1450, 340, 176, 1, 6), ...moriche(1560, 340, 150, 1.15, -10), ...moriche(1680, 340, 206, 0.85, 4),
  // Garzas que cruzan hacia el oriente y matas de monte en el horizonte
  T("M1740 160q10-9 20-2q10-9 22-3M1786 138q8-7 16-1q8-7 18-2M1812 176q9-8 18-2q9-8 20-3", "cielo"),
  T("M1760 340C1772 326 1790 322 1802 330C1812 320 1834 320 1846 332C1854 328 1866 330 1872 340"),
  T("M1900 340C1910 330 1924 328 1934 334C1944 326 1960 326 1970 336")
];

// Mensajes de etapa y datos de la época (citas literales de José Gumilla, «El Orinoco ilustrado», 1741)
const ETAPAS = ["Encendiendo las estrellas", "Afinando el reloj", "Abriendo el archivo de Tame", "Llegando a 2029"];
const DATOS = [
  ["«…el río Tame, que baxa caudaloso de las nevadas de Chita, y tiene á sus riberas las dos numerosas Misiones de Giraras y de Betoyes».", "José Gumilla, El Orinoco ilustrado, 1741"],
  ["Las canoas se hacían de un solo tronco, ahuecado con fuego; los arcos, flechas y lanzas, «de macana, palo durísimo».", "Según José Gumilla, 1741"],
  ["En la reducción de Tame se levantaron 18 caneyes, casas grandes, donde vivían 450 indígenas.", "Corporación Tame, La ciudad La Palma de Espinosa"],
  ["Se untaban «desde la coronilla de la cabeza hasta las puntas de los piés con aceyte y achote», para vestirse y protegerse del sol y los mosquitos.", "José Gumilla, El Orinoco ilustrado, 1741"],
  ["Hoy pueblos como los makaguán, hitnü y sikuani siguen viviendo en el territorio de Tame.", "Memoria viva"]
];

const NS = "http://www.w3.org/2000/svg";
const lim = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

/**
 * Inicia la pantalla de carga.
 * @param {object} o
 * @param {() => {contenido: boolean, escena: boolean}} o.estado  qué ya cargó
 * @param {boolean} o.reduce      movimiento reducido: sin animación
 * @param {boolean|null} o.preferencia  sonido elegido antes (null = primera visita)
 * @param {(conSonido: boolean) => void} o.alEntrar  se llama al entrar (con la elección de sonido)
 */
export function iniciarPrecarga({ estado, reduce, preferencia, alEntrar }) {
  const el = document.getElementById("precarga");
  const $ = s => el.querySelector(s);
  const anio = $("#pre-anio"), msg = $("#pre-msg"), dato = $("#pre-dato"), cita = $("#pre-cita"), aro = $("#pre-aro"), puerta = $("#pre-puerta"), ya = $("#pre-ya");

  // 1 · Construir el friso y las 12 marcas del aro
  const svg = $("#pre-friso"), caja = $(".pre-friso-caja");
  const trazos = FRISO.flat().map(t => { const p = document.createElementNS(NS, "path"); p.setAttribute("d", t.d); if (t.c) p.setAttribute("class", t.c); p.setAttribute("pathLength", "1"); svg.append(p); return p; });
  const pluma = document.createElementNS(NS, "circle"); pluma.setAttribute("r", "4.5"); pluma.setAttribute("class", "pluma"); svg.append(pluma);
  // Cada trazo se dibuja durante el tramo de carga que corresponde a su posición en el friso
  const tramos = trazos.map(p => { const b = p.getBBox(), len = p.getTotalLength(); return { p, len, ini: lim(b.x / 2000 * 0.9), fin: lim((b.x + b.width) / 2000 * 0.9 + 0.1) }; });
  const marcas = [...aro.querySelectorAll(".marca")], avance = aro.querySelector(".aro-avance");

  let paneo = 0, mostrado = 0, t0 = performance.now(), fin = false, iDato = -1, ultimoDato = 0, listoEn = 0;
  const minimo = preferencia == null ? 3200 : 1800; // la primera visita se toma su tiempo para el dibujo
  const pintar = p => {
    anio.textContent = String(1629 + Math.round(p * 400));
    avance.style.strokeDashoffset = (1 - p).toFixed(4);
    marcas.forEach((m, k) => m.classList.toggle("on", p >= (k + 1) / 12 - 0.001));
    let punta = null;
    for (const t of tramos) {
      const f = lim((p - t.ini) / (t.fin - t.ini));
      t.p.style.strokeDashoffset = (1 - f).toFixed(4);
      if (f > 0 && f < 1 && (!punta || t.ini >= punta.t.ini)) punta = { t, f };
    }
    if (punta) { const q = punta.t.p.getPointAtLength(punta.f * punta.t.len); pluma.setAttribute("cx", q.x.toFixed(1)); pluma.setAttribute("cy", q.y.toFixed(1)); pluma.style.opacity = 1; }
    else pluma.style.opacity = 0;
    // Si el friso no cabe, se desliza (suave) para que la plumilla siempre se vea;
    // al terminar se centra en el caney, el corazón de la escena
    const w = svg.getBoundingClientRect().width, vw = caja.clientWidth;
    if (w > vw) {
      const x = (p >= 1 ? 1000 : punta ? +pluma.getAttribute("cx") : p * 2000) / 2000 * w;
      paneo += (lim(vw * (p >= 1 ? 0.5 : 0.55) - x, vw - w, 0) - paneo) * 0.08;
      svg.style.transform = `translateX(${paneo.toFixed(1)}px)`;
    } else svg.style.transform = "";
    msg.textContent = p >= 1 ? "Todo listo para el viaje" : ETAPAS[Math.min(3, Math.floor(p * 4))];
  };
  const cambiarDato = () => {
    iDato = (iDato + 1) % DATOS.length;
    dato.classList.remove("ve"); void dato.offsetWidth;
    dato.querySelector("q").textContent = DATOS[iDato][0].replace(/^«|»\.?$/g, "");
    cita.textContent = DATOS[iDato][1];
    dato.classList.add("ve");
  };
  const mostrarPuerta = () => {
    puerta.hidden = false; ya.hidden = true; el.classList.add("lista");
    puerta.querySelector("[data-entrar='si']").focus({ preventScroll: true });
  };
  const entrar = conSonido => {
    if (fin) return; fin = true;
    el.classList.add("sale");
    alEntrar(conSonido);
    setTimeout(() => el.remove(), 1700);
  };
  puerta.addEventListener("click", e => { const b = e.target.closest("[data-entrar]"); if (b) entrar(b.dataset.entrar === "si"); });
  ya.addEventListener("click", () => entrar(!!preferencia));

  if (reduce) { // sin animación: dibujo completo y entrada directa
    pintar(1); cambiarDato();
    if (preferencia == null) { const v = setInterval(() => { if (estado().contenido) { clearInterval(v); mostrarPuerta(); } }, 100); }
    else { const v = setInterval(() => { if (estado().contenido) { clearInterval(v); entrar(preferencia); } }, 100); }
    return;
  }

  const bucle = ahora => {
    if (fin) return;
    const t = ahora - t0, e = estado();
    // Avance real (contenido 35 %, escena 3D 50 %) y avance mínimo por tiempo. Si algo tarda,
    // el dibujo sigue avanzando despacio hacia el siguiente tramo para que nunca parezca congelado.
    const real = 0.15 + (e.contenido ? 0.35 : 0) + (e.escena ? 0.5 : 0);
    const porTiempo = lim(t / minimo);
    const espera = real < 1 ? Math.min(0.12, (t / 1000) * 0.012) : 0;
    const meta = Math.min(porTiempo, real + espera, 1);
    mostrado += (meta - mostrado) * 0.09;
    if (meta >= 1 && 1 - mostrado < 0.002) mostrado = 1;
    pintar(mostrado);
    if (ahora - ultimoDato > 4200) { ultimoDato = ahora; cambiarDato(); }
    // Conexión lenta: si el contenido ya está pero el fondo 3D no, se puede entrar ya
    if (t > 6500 && e.contenido && !e.escena && ya.hidden && puerta.hidden) { ya.hidden = false; msg.textContent = "La conexión va lenta: el fondo 3D se sumará en el camino"; }
    if (mostrado >= 1) {
      if (!listoEn) listoEn = ahora;
      if (ahora - listoEn > 450) { // pausa breve para ver el dibujo completo
        if (preferencia == null) { if (puerta.hidden) mostrarPuerta(); }
        else return entrar(preferencia);
      }
    }
    requestAnimationFrame(bucle);
  };
  requestAnimationFrame(bucle);
}
