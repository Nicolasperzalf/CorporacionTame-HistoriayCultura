// ==========================================================
//  Corporación Tame, Historia y Cultura — aplicación del sitio
//  Índice: 1 Estado y utilidades · 2 Capítulos (vistas)
//          3 Navegación · 4 Efectos · 5 Arranque
//  El CONTENIDO no se escribe aquí: viene de la base de datos
//  (js/datos.js) o del respaldo js/contenido-local.js.
// ==========================================================
import { cargarContenido, enviarAporte, conectado } from "./datos.js";
import { iniciarEscena } from "./escena3d.js";

/* 1 · ESTADO Y UTILIDADES ------------------------------------ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pad = n => String(n).padStart(2, "0");
const parrafos = t => String(t || "").split(/\n\s*\n/).map(x => x.trim()).filter(Boolean);
const lineas = t => String(t || "").split("\n").map(x => x.trim()).filter(Boolean);
const TZ = "America/Bogota";
const F = o => new Intl.DateTimeFormat("es-CO", { ...o, timeZone: TZ });
const fCorta = d => F({ day: "2-digit", month: "short", year: "numeric" }).format(new Date(d));
const fHora = d => F({ hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(d));
const fDia = d => F({ day: "2-digit" }).format(new Date(d));
const fMesAnio = d => F({ month: "long", year: "numeric" }).format(new Date(d));
const fSemana = d => F({ weekday: "long" }).format(new Date(d));
const hace = d => { const n = Math.floor((Date.now() - new Date(d)) / 864e5); return n <= 0 ? "HOY" : n === 1 ? "HACE 1 DÍA" : "HACE " + n + " DÍAS"; };
const iniciales = a => String(a).replace(/^(Dra?\.|Mg\.|Lic\.|Ing\.|Prof\.)\s*/i, "").split(" ").filter(Boolean).slice(0, 2).map(x => x[0]).join("");
const PALABRAS = ["Cero", "Un", "Dos", "Tres", "Cuatro", "Cinco", "Seis", "Siete", "Ocho", "Nueve", "Diez", "Once", "Doce", "Trece", "Catorce", "Quince", "Dieciséis", "Diecisiete", "Dieciocho", "Diecinueve", "Veinte"];
const enPalabras = n => PALABRAS[n] || String(n);

const S = { // estado compartido con la escena 3D
  page: "inicio", mouse: { x: 0, y: 0, tx: 0, ty: 0 }, scrollVel: 0, boostT: 0, introT0: null,
  reduce: matchMedia("(prefers-reduced-motion: reduce)").matches,
  coarse: matchMedia("(pointer: coarse)").matches
};
let C = null, A = {};           // contenido y ajustes
let limpiar = [];               // tareas a detener al salir de un capítulo
const alSalir = f => limpiar.push(f);

const PAGES = [
  { id: "inicio", n: "—", label: "Inicio" },
  { id: "nosotros", n: "I", label: "Quiénes somos", kicker: "Institución", blurb: "Misión, visión y objetivos de la Corporación." },
  { id: "tribuna", n: "II", label: "Tribuna de la Memoria", kicker: "Opinión", blurb: "Columnas de opinión sobre el Llano y su historia." },
  { id: "monumentos", n: "III", label: "Salón de monumentos", kicker: () => C.monumentos.length + " piezas", blurb: "Recorre uno a uno los monumentos de Tame." },
  { id: "historia", n: "IV", label: "Línea temporal", kicker: () => C.hitos.length ? parseInt(C.hitos[0].anio, 10) + "–" + parseInt(C.hitos[C.hitos.length - 1].anio, 10) : "Historia", blurb: "Los hitos de Tame, de la misión a la libertad." },
  { id: "publicaciones", n: "V", label: "Publicaciones", kicker: "Biblioteca", blurb: "Libros que leen el territorio." },
  { id: "aportar", n: "VI", label: "Aporte ciudadano", kicker: "Participa", blurb: "Suma tu recuerdo al archivo." }
];
const kicker = p => typeof p.kicker === "function" ? p.kicker() : p.kicker;
const vacio = (cap, titulo) => `<section class="seccion"><p class="antetitulo">${cap}</p><h1 class="titulo">${titulo}</h1><p class="lead" style="margin-top:24px">Pronto publicaremos contenido en esta sección.</p></section>`;

/* 2 · CAPÍTULOS ---------------------------------------------- */
const V = {}, M = {}; // V = HTML de cada capítulo · M = comportamiento al montarlo

// ── Inicio ──
V.inicio = () => {
  const pal = [["Viaja"], ["cuatro", 1], ["siglos", 1], ["sin"], ["salir"], ["de"], ["Tame."]];
  return `
  <section class="hero" data-screen-label="Inicio">
    <div class="hero-txt">
      <h1 aria-label="Viaja cuatro siglos sin salir de Tame.">${pal.map(([w, o], i) => `<span class="pal" aria-hidden="true"><span class="${o ? "oro" : ""}" style="transition-delay:${(1.25 + i * .08).toFixed(2)}s">${w}</span></span>`).join(" ")}</h1>
      <p class="hero-p aparece" style="--d:1.9s">${esc(A.hero_texto)}</p>
      <div class="hero-btns aparece" style="--d:2.05s">
        <button type="button" class="btn-oro mag" data-scroll="capitulos">Iniciar el viaje <i>↓</i></button>
        <button type="button" class="btn-vidrio mag" data-ir="aportar">Aportar un recuerdo</button>
      </div>
    </div>
  </section>
  <section class="seccion capitulos" id="capitulos" data-screen-label="Capítulos">
    <div class="cabecera" data-rv>
      <div><p class="antetitulo">Destinos del viaje</p><h2 class="titulo-2">Seis puertas <em>al tiempo.</em></h2></div>
      <p class="lead">Cada capítulo es una estación del archivo. Entra por la que prefieras; el viaje continúa en la siguiente.</p>
    </div>
    <div class="rejilla-destinos">${PAGES.slice(1).map((p, i) => `
      <div data-rv data-rv-delay="${(i % 3) * 120}">
        <button type="button" class="destino tilt" data-ir="${p.id}">
          <span class="destino-top"><b>${p.n}</b><small>${esc(kicker(p))}</small></span>
          <span><span class="d-t">${p.label}</span><span class="d-b">${p.blurb}</span></span>
          <span class="destino-pie">Viajar <span>→</span></span>
        </button>
      </div>`).join("")}
    </div>
  </section>`;
};

// ── I · Quiénes somos ──
V.nosotros = () => `
  <section class="seccion nosotros" data-screen-label="I · Quiénes somos">
    <div class="nosotros-in">
      <p class="antetitulo" data-rv>Capítulo I · Quiénes somos</p>
      <h1 class="titulo" data-rv>Un lugar para <em>volver a mirar.</em></h1>
      <p class="intro" data-rv data-rv-delay="100">${esc(A.nosotros_intro)}</p>
      <div class="pilares">${[["I", "Misión", A.mision], ["II", "Visión", A.vision], ["III", "Valores", A.valores]].map(([n, t, d]) => `
        <div class="pilar vidrio" data-rv><b>${n}</b><div><h3>${t}</h3><p>${esc(d)}</p></div></div>`).join("")}
      </div>
      <p class="etiqueta sub-seccion" data-rv>Objetivos</p>
      <div class="objetivos">${lineas(A.objetivos).map((o, i) => `
        <div class="objetivo vidrio" data-rv><b>${pad(i + 1)}</b><span>${esc(o)}</span></div>`).join("")}
      </div>
    </div>
  </section>`;

// ── II · Tribuna de la Memoria ──
let colI = 0;
V.tribuna = () => {
  const cols = C.columnas;
  if (!cols.length) return vacio("Capítulo II · Columna de opinión", "Tribuna de la Memoria");
  colI = Math.min(colI, cols.length - 1);
  return `
  <section class="seccion" data-screen-label="II · Tribuna">
    <div class="tribuna-cab vidrio" data-rv>
      <span class="etiqueta">Capítulo II · Columna de opinión</span>
      <h1>Tribuna de la Memoria</h1>
      <small id="col-ed"></small>
    </div>
    <div class="columna-actual" id="col-actual"></div>
    <p class="etiqueta sub-seccion" data-rv>Entregas recientes</p>
    <div class="col-lista" data-rv>${cols.map((c, i) => `
      <button type="button" class="col-item" data-col="${i}" aria-pressed="${i === colI}">
        <small>${fCorta(c.fecha)} · ${fHora(c.fecha)} h</small><b>${esc(c.titulo)}</b><span>${esc(c.autor)}</span>
      </button>`).join("")}
    </div>
  </section>`;
};
const htmlColumna = c => {
  const palabras = String(c.cuerpo || "").split(/\s+/).length;
  return `
    <div class="col-fecha vidrio">
      <time datetime="${esc(c.fecha)}">
        <span class="col-dia">${fDia(c.fecha)}</span>
        <span class="col-mes">${fSemana(c.fecha)} · ${fMesAnio(c.fecha)}</span>
        <span class="col-hora"><b>${fHora(c.fecha)}</b><small>HORA COL · ${hace(c.fecha)}</small></span>
      </time>
      <div class="col-autor"><span class="iniciales" aria-hidden="true">${esc(iniciales(c.autor))}</span><div><p>${esc(c.autor)}</p><small>${esc(c.cargo)}</small></div></div>
    </div>
    <article class="col-articulo vidrio" lang="es">
      <p class="col-cat">${esc(c.categoria)} · ${Math.max(2, Math.round(palabras / 200))} min</p>
      <h2>${esc(c.titulo)}</h2>
      ${c.entradilla ? `<p class="col-entradilla">${esc(c.entradilla)}</p>` : ""}
      <div class="col-cuerpo">${parrafos(c.cuerpo).map(p => `<p>${esc(p)}</p>`).join("")}</div>
    </article>`;
};
M.tribuna = () => {
  const caja = $("#col-actual"); if (!caja) return;
  const pintar = () => {
    const c = C.columnas[colI];
    caja.innerHTML = htmlColumna(c);
    $("#col-ed").textContent = (c.edicion ? "Edición N.º " + c.edicion + " · " : "") + fCorta(c.fecha);
    $$("[data-col]").forEach(b => b.setAttribute("aria-pressed", +b.dataset.col === colI));
  };
  pintar();
  $$("[data-col]").forEach(b => b.onclick = () => {
    const i = +b.dataset.col; if (i === colI) return;
    colI = i; caja.classList.add("cambiando");
    setTimeout(() => { pintar(); caja.classList.remove("cambiando"); }, 420);
  });
};

// ── III · Salón de monumentos ──
const MON_MS = 7000;
let monI = 0, monPausa = false;
V.monumentos = () => {
  const L = C.monumentos;
  if (!L.length) return vacio("Capítulo III · Salón de monumentos", "Salón de monumentos");
  monI = Math.min(monI, L.length - 1);
  return `
  <section class="monumentos" id="mon" data-screen-label="III · Monumentos">
    ${L.map((m, i) => `
    <div class="mon-slide${i === monI ? " activo" : ""}" aria-hidden="${i !== monI}">
      <img class="fondo" src="${esc(m.imagen)}" alt="" loading="${i < 2 ? "eager" : "lazy"}">
      <img class="foto" src="${esc(m.imagen)}" alt="${esc(m.alt || m.titulo)}" loading="${i < 2 ? "eager" : "lazy"}">
    </div>`).join("")}
    <div class="mon-arriba">
      <div><span class="antetitulo">Capítulo III · Salón de monumentos</span><button type="button" class="btn-linea" id="mon-auto"></button></div>
      <div class="mon-segs" aria-hidden="true">${L.map(() => "<span><i></i></span>").join("")}</div>
    </div>
    <div class="mon-abajo">
      <div class="mon-txt" id="mon-txt" aria-live="polite"></div>
      <div class="mon-flechas">
        <button type="button" class="btn-circ grande" data-mon="-1" aria-label="Monumento anterior">←</button>
        <button type="button" class="btn-circ grande" data-mon="1" aria-label="Monumento siguiente">→</button>
      </div>
    </div>
  </section>`;
};
M.monumentos = () => {
  const sec = $("#mon"); if (!sec) return;
  const L = C.monumentos, txt = $("#mon-txt"), auto = $("#mon-auto");
  let timer;
  const texto = () => { const m = L[monI]; txt.innerHTML = `<p class="mon-num"><b>${pad(monI + 1)}</b><small>de ${pad(L.length)} · ${esc(m.lugar)}</small></p><h2>${esc(m.titulo)}</h2><p>${esc(m.descripcion)}</p>`; };
  const etiqueta = () => { auto.textContent = monPausa ? "▶ Reproducir recorrido" : "❚❚ Pausar"; };
  const barras = () => {
    const segs = $$(".mon-segs i", sec);
    segs.forEach((el, i) => { el.style.transition = "none"; el.style.width = i < monI || (i === monI && monPausa) ? "100%" : "0%"; });
    if (!monPausa && segs[monI]) { void segs[monI].offsetWidth; segs[monI].style.transition = `width ${(MON_MS - 100) / 1000}s linear`; segs[monI].style.width = "100%"; }
  };
  const reiniciar = () => { clearInterval(timer); timer = setInterval(() => { if (!monPausa) paso(1); }, MON_MS); barras(); };
  const paso = d => {
    monI = (monI + d + L.length) % L.length;
    $$(".mon-slide", sec).forEach((s, i) => { s.classList.toggle("activo", i === monI); s.setAttribute("aria-hidden", i !== monI); });
    txt.style.opacity = 0; txt.style.transform = "translateY(22px)";
    setTimeout(() => { texto(); txt.style.opacity = 1; txt.style.transform = "none"; }, 420);
    reiniciar();
  };
  const manual = d => { monPausa = true; etiqueta(); paso(d); };
  texto(); etiqueta(); reiniciar();
  auto.onclick = () => { monPausa = !monPausa; etiqueta(); reiniciar(); };
  $$("[data-mon]", sec).forEach(b => b.onclick = () => manual(+b.dataset.mon));
  let x0 = null;
  sec.addEventListener("pointerdown", e => { if (!e.target.closest("button")) x0 = e.clientX; });
  sec.addEventListener("pointerup", e => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 50) manual(dx < 0 ? 1 : -1); });
  const tecla = e => { if (e.key === "ArrowRight") manual(1); if (e.key === "ArrowLeft") manual(-1); };
  addEventListener("keydown", tecla);
  alSalir(() => { clearInterval(timer); removeEventListener("keydown", tecla); });
};

// ── IV · Línea temporal ──
let tlI = 0;
const anioNum = h => parseInt(h.anio, 10);
V.historia = () => {
  const T = C.hitos;
  if (!T.length) return vacio("Capítulo IV · Línea temporal", "Línea temporal");
  tlI = Math.min(tlI, T.length - 1);
  const a0 = anioNum(T[0]), a1 = anioNum(T[T.length - 1]), span = Math.max(1, a1 - a0);
  const izq = y => ((y - a0) / span * 100).toFixed(2) + "%";
  const marcas = [a0];
  for (let y = Math.ceil((a0 + 1) / 100) * 100; y < a1 - 30; y += 100) if (y - a0 > 30) marcas.push(y);
  marcas.push(a1);
  return `
  <section class="seccion historia" data-screen-label="IV · Línea temporal">
    <p class="antetitulo" data-rv>Capítulo IV · Línea temporal ${a0}–${a1}</p>
    <h1 class="titulo" data-rv>${enPalabras(T.length)} hitos entre la misión y la <em>libertad.</em></h1>
    <div class="tl-eje" id="tl-eje">
      <span class="tl-base"></span><span class="tl-oro" id="tl-oro"></span><span class="tl-destello" id="tl-dest" aria-hidden="true"></span>
      ${T.map((h, i) => `<button type="button" class="tl-punto" data-tl="${i}" style="left:${izq(anioNum(h))};--d:${i * 60}ms" aria-label="${esc(h.anio)}"><i></i></button>`).join("")}
      <span class="tl-anio" id="tl-anio"></span>
      ${marcas.map((y, i) => `<span class="tl-marca" style="left:${izq(y)};${i === 0 ? "transform:none" : i === marcas.length - 1 ? "transform:translateX(-100%)" : ""}">${y}</span>`).join("")}
    </div>
    <div class="tl-chips">${T.map((h, i) => `<button type="button" class="chip" data-tl="${i}">${esc(h.anio)}</button>`).join("")}</div>
    <div class="tl-detalle" id="tl-det"></div>
  </section>`;
};
M.historia = () => {
  const sec = $(".historia"); if (!sec) return;
  const T = C.hitos, a0 = anioNum(T[0]), span = Math.max(1, anioNum(T[T.length - 1]) - a0), det = $("#tl-det");
  const detalle = () => {
    const h = T[tlI];
    det.innerHTML = `
      <p class="tl-grande" aria-hidden="true">${esc(h.anio)}</p>
      <div class="tl-fila">
        ${h.imagen ? `<div class="tl-img"><img src="${esc(h.imagen)}" alt="" style="object-position:${esc(h.encuadre || "center")}"></div>` : ""}
        <div class="tl-texto vidrio">
          <p class="meta"><span>Hito ${pad(tlI + 1)} / ${pad(T.length)}</span><span>${esc(h.etapa)}</span></p>
          <h2>${esc(h.titulo)}</h2><p>${esc(h.texto)}</p>
          <div class="fila-btns"><button type="button" class="btn-circ" data-tlpaso="-1" aria-label="Hito anterior">←</button><button type="button" class="btn-circ" data-tlpaso="1" aria-label="Hito siguiente">→</button></div>
        </div>
      </div>`;
  };
  const eje = () => {
    const p = ((anioNum(T[tlI]) - a0) / span * 100).toFixed(2) + "%";
    $("#tl-oro").style.width = p; $("#tl-dest").style.left = p;
    const an = $("#tl-anio"); an.style.left = p; an.textContent = T[tlI].anio;
    $$(".tl-punto", sec).forEach((b, i) => { b.classList.toggle("activo", i === tlI); b.classList.toggle("pasado", i < tlI); b.setAttribute("aria-pressed", i === tlI); });
    $$(".chip[data-tl]", sec).forEach((b, i) => { b.classList.toggle("activo", i === tlI); b.setAttribute("aria-pressed", i === tlI); });
  };
  const elegir = i => {
    i = (i + T.length) % T.length; if (i === tlI) return;
    tlI = i; S.boostT = performance.now() / 1000 + 0.7; eje();
    det.classList.add("cambiando");
    setTimeout(() => { detalle(); det.classList.remove("cambiando"); }, 420);
  };
  detalle(); eje();
  setTimeout(() => $("#tl-eje")?.classList.add("listo"), 250);
  sec.addEventListener("click", e => {
    const b = e.target.closest("[data-tl],[data-tlpaso]"); if (!b) return;
    if (b.dataset.tl != null) elegir(+b.dataset.tl); else elegir(tlI + +b.dataset.tlpaso);
  });
  const tecla = e => { if (e.key === "ArrowRight") elegir(tlI + 1); if (e.key === "ArrowLeft") elegir(tlI - 1); };
  addEventListener("keydown", tecla);
  alSalir(() => removeEventListener("keydown", tecla));
};

// ── V · Publicaciones ──
let libI = 0;
const proporciones = {};
V.publicaciones = () => {
  const P = C.publicaciones;
  if (!P.length) return vacio("Capítulo V · Publicaciones", "El territorio también se lee.");
  libI = Math.min(libI, P.length - 1);
  return `
  <section class="seccion" data-screen-label="V · Publicaciones">
    <div class="cabecera" data-rv>
      <div><p class="antetitulo">Capítulo V · Publicaciones</p><h1 class="titulo">El territorio <em style="color:var(--perla)">también se lee.</em></h1></div>
      <div class="pestanas" role="tablist" aria-label="Libros">${P.map((b, i) => `<button type="button" role="tab" class="pestana" data-lib="${i}">${esc(b.volumen)} · ${esc(b.titulo)}</button>`).join("")}</div>
    </div>
    <div class="libro-caja vidrio" data-rv data-rv-delay="100">
      <div class="libro-escena" id="lib-escena">
        <div class="libro-persp" id="lib-persp"></div>
        <span class="libro-sombra" id="lib-sombra" aria-hidden="true"></span>
        <div class="libro-vistas">
          <button type="button" data-vista="0">Portada</button><button type="button" data-vista="90">Lomo</button><button type="button" data-vista="180">Contraportada</button>
          <button type="button" class="giro" id="lib-giro"></button>
        </div>
        <span class="libro-pista">↔ Arrastra para girar</span>
      </div>
      <div class="libro-info" id="lib-info"></div>
    </div>
  </section>`;
};
M.publicaciones = () => {
  const esc3d = $("#lib-escena"); if (!esc3d) return;
  const P = C.publicaciones, persp = $("#lib-persp"), info = $("#lib-info"), giroBtn = $("#lib-giro");
  let rot = { x: -8, y: -28 }, giro = true, arr = null, raf;
  const px = v => Math.round(v) + "px";
  const aplicar = () => { const l = $("#libro"); if (l) l.style.transform = `rotateX(${rot.x.toFixed(1)}deg) rotateY(${rot.y.toFixed(1)}deg)`; };
  const pintar = () => {
    const b = P[libI], W = innerWidth >= 700 ? 280 : 210;
    const ratio = proporciones[b.portada] || 1.41, H = W * ratio, D = (b.grosor || 30) * W / 280;
    if (!proporciones[b.portada] && b.portada) { const im = new Image(); im.onload = () => { proporciones[b.portada] = im.naturalHeight / im.naturalWidth; if (P[libI] === b) pintar(); }; im.src = b.portada; }
    persp.innerHTML = `
      <div class="libro" id="libro" style="width:${px(W)};height:${px(H)}">
        <img src="${esc(b.portada)}" alt="Portada de ${esc(b.titulo)}" draggable="false" style="transform:translateZ(${px(D / 2)})">
        <img src="${esc(b.contraportada || b.portada)}" alt="Contraportada de ${esc(b.titulo)}" draggable="false" style="transform:rotateY(180deg) translateZ(${px(D / 2)})">
        <div class="lomo" style="left:${px((W - D) / 2)};width:${px(D)};background:${esc(b.color_lomo)};color:${esc(b.color_tinta_lomo)};transform:rotateY(-90deg) translateZ(${px(W / 2)})"><span style="font-size:${px(Math.min(D * .46, 15))}">${esc(b.texto_lomo || b.titulo)}</span></div>
        <div class="hojas-v" style="left:${px((W - D) / 2)};width:${px(D)};transform:rotateY(90deg) translateZ(${px(W / 2)})"></div>
        <div class="hojas-h" style="top:${px((H - D) / 2)};height:${px(D)};transform:rotateX(90deg) translateZ(${px(H / 2)})"></div>
        <div class="hojas-h" style="top:${px((H - D) / 2)};height:${px(D)};transform:rotateX(-90deg) translateZ(${px(H / 2)})"></div>
      </div>`;
    $("#lib-sombra").style.width = px(W);
    aplicar();
    info.innerHTML = `
      <p class="tipo">${esc(b.volumen)} · ${esc(b.tipo)}</p>
      <h2>${esc(b.titulo)}</h2>
      ${b.subtitulo ? `<p class="sub">${esc(b.subtitulo)}</p>` : ""}
      <p class="desc">${esc(b.descripcion)}</p>
      ${b.autores ? `<p class="autores"><b>AUTORES · </b>${esc(b.autores)}</p>` : ""}
      <button type="button" class="btn-oro" data-ir="aportar">Solicitar ejemplar →</button>`;
    $$("[data-lib]").forEach(t => t.setAttribute("aria-selected", +t.dataset.lib === libI));
  };
  const etiqueta = () => { giroBtn.textContent = giro ? "❚❚ Detener giro" : "↻ Girar 360°"; };
  const bucle = () => { if (giro && !arr && !S.reduce) { rot.y += 0.35; aplicar(); } raf = requestAnimationFrame(bucle); };
  const vista = y => {
    let t = y; while (t - rot.y > 180) t -= 360; while (rot.y - t > 180) t += 360;
    giro = false; etiqueta();
    const l = $("#libro"); if (!l) return;
    l.style.transition = "transform .9s cubic-bezier(.2,.75,.2,1)";
    rot = { x: -6, y: t }; aplicar();
    setTimeout(() => { if (l) l.style.transition = ""; }, 950);
  };
  pintar(); etiqueta(); bucle();
  $$("[data-lib]").forEach(t => t.onclick = () => {
    const i = +t.dataset.lib; if (i === libI) return;
    libI = i; persp.classList.add("cambiando"); info.classList.add("cambiando");
    setTimeout(() => { pintar(); persp.classList.remove("cambiando"); info.classList.remove("cambiando"); }, 420);
  });
  $$("[data-vista]").forEach(b => b.onclick = () => vista(+b.dataset.vista));
  giroBtn.onclick = () => { giro = !giro; etiqueta(); };
  esc3d.addEventListener("pointerdown", e => {
    if (e.target.closest("button")) return;
    arr = { x: e.clientX, y: e.clientY, rx: rot.x, ry: rot.y };
    esc3d.setPointerCapture?.(e.pointerId);
    if (giro) { giro = false; etiqueta(); }
  });
  esc3d.addEventListener("pointermove", e => {
    if (!arr) return;
    rot.y = arr.ry + (e.clientX - arr.x) * 0.6;
    rot.x = Math.max(-35, Math.min(35, arr.rx - (e.clientY - arr.y) * 0.3));
    aplicar();
  });
  const soltar = () => { arr = null; };
  esc3d.addEventListener("pointerup", soltar); esc3d.addEventListener("pointercancel", soltar);
  alSalir(() => cancelAnimationFrame(raf));
};

// ── VI · Aporte ciudadano ──
V.aportar = () => `
  <section class="seccion aportar" data-screen-label="VI · Aporte ciudadano">
    <p class="antetitulo" data-rv>Capítulo VI · Viaje en el tiempo</p>
    <h1 class="titulo" data-rv>Tu recuerdo<br><em>es historia.</em></h1>
    <div class="aporte-fila">
      <div class="aporte-info vidrio" data-rv>
        <p>${esc(A.aporte_texto)}</p>
        <ol class="pasos"><li><b>I</b>Envías tu material</li><li><b>II</b>Lo revisamos y verificamos</li><li><b>III</b>Lo preservamos en el archivo</li></ol>
      </div>
      <form class="formulario vidrio" id="form-aporte" data-rv data-rv-delay="120" novalidate>
        <label>Tu nombre<input name="nombre" type="text" autocomplete="name" required placeholder="Nombre y apellido" maxlength="120"></label>
        <label>Correo electrónico<input name="correo" type="email" autocomplete="email" required placeholder="nombre@correo.com" maxlength="160"></label>
        <label class="ancho">Tipo de material
          <select name="tipo" required>
            <option value="">Selecciona una opción</option>
            <option>Fotografía antigua</option><option>Relato o testimonio</option><option>Carta o documento</option><option>Otro</option>
          </select>
        </label>
        <label class="ancho">Cuéntanos sobre este recuerdo<textarea name="relato" rows="3" maxlength="4000" placeholder="¿Qué historia guarda? ¿Dónde y cuándo fue?"></textarea></label>
        <label class="ancho adjunto">Adjuntar archivo<input name="archivo" type="file" accept="image/*,.pdf,.doc,.docx"><small>JPG, PNG, PDF o Word · máximo 10 MB</small></label>
        <input name="sitio_web" type="text" tabindex="-1" autocomplete="off" class="sr" aria-hidden="true">
        <div class="ancho enviar"><button type="submit" class="btn-oro">Enviar aporte →</button><p class="estado-form" id="form-estado" role="status" aria-live="polite"></p></div>
      </form>
    </div>
  </section>`;
M.aportar = () => {
  const f = $("#form-aporte"); if (!f) return;
  const estado = $("#form-estado"), btn = $("button[type=submit]", f);
  const aviso = (t, err) => { estado.textContent = t; estado.classList.toggle("error", !!err); };
  f.onsubmit = async e => {
    e.preventDefault();
    const d = new FormData(f);
    if (d.get("sitio_web")) return; // trampa anti-spam
    if (!f.checkValidity()) { aviso("Revisa tu nombre, correo y tipo de material.", true); f.reportValidity(); return; }
    btn.disabled = true; aviso("Enviando…");
    try {
      const r = await enviarAporte({ nombre: d.get("nombre").trim(), correo: d.get("correo").trim(), tipo: d.get("tipo"), relato: d.get("relato").trim(), archivo: d.get("archivo") });
      aviso(r.demo ? "Modo demostración: conecta la base de datos (js/config.js) para guardar aportes." : "Gracias, " + d.get("nombre").trim().split(" ")[0] + ". Tu aporte quedó en revisión.");
      if (!r.demo) f.reset();
    } catch (err) { aviso(err.message || "No se pudo enviar. Intenta de nuevo.", true); }
    btn.disabled = false;
  };
};

/* 3 · NAVEGACIÓN --------------------------------------------- */
function render() {
  limpiar.forEach(f => f()); limpiar = [];
  $("#vista").innerHTML = V[S.page]();
  M[S.page]?.();
  marcarNav();
  revelar();
}
function marcarNav() {
  $$("[data-nav]").forEach(b => b.setAttribute("aria-current", b.dataset.nav === S.page));
  const i = PAGES.findIndex(p => p.id === S.page), sig = PAGES[(i + 1) % PAGES.length], btn = $("#siguiente");
  btn.dataset.ir = sig.id;
  $("small", btn).textContent = sig.id === "inicio" ? "Fin del recorrido · volver" : "Siguiente destino · Capítulo " + sig.n;
  $("b", btn).textContent = sig.id === "inicio" ? "Regresar al inicio" : sig.label;
}
let viajando = false;
function ir(id) {
  if (!PAGES.some(p => p.id === id) || viajando) return;
  cerrarMenu();
  if (id === S.page) { scrollTo({ top: 0, behavior: "smooth" }); return; }
  const cambiar = () => { scrollTo({ top: 0, behavior: "instant" }); try { history.replaceState(null, "", "#/" + id); } catch (e) {} S.page = id; render(); };
  if (S.reduce) { cambiar(); return; }
  const p = PAGES.find(x => x.id === id);
  $("#viaje-n").textContent = p.n; $("#viaje-t").textContent = p.label;
  viajando = true; S.boostT = performance.now() / 1000 + 1.6;
  document.body.classList.add("viajando", "saliendo");
  setTimeout(() => {
    cambiar();
    document.body.classList.replace("saliendo", "entrando");
    void $("#app").offsetWidth;
    setTimeout(() => { document.body.classList.remove("entrando", "viajando"); viajando = false; }, 150);
  }, 750);
}
function abrirMenu() { $("#menu").hidden = false; document.body.style.overflow = "hidden"; $(".menu-cerrar").focus(); }
function cerrarMenu() { if ($("#menu").hidden) return; $("#menu").hidden = true; document.body.style.overflow = ""; }

/* 4 · EFECTOS ------------------------------------------------ */
let io;
function revelar() {
  io && io.disconnect();
  if (S.reduce || !("IntersectionObserver" in window)) return;
  io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target, d = +(el.dataset.rvDelay || 0);
    el.style.transitionDelay = d + "ms"; el.classList.remove("oculto");
    setTimeout(() => { el.style.transitionDelay = ""; }, 1800 + d);
    io.unobserve(el);
  }), { threshold: 0.08 });
  $$("#vista [data-rv]").forEach(el => { el.classList.add("oculto"); io.observe(el); });
}
function efectos() {
  const cursor = $("#cursor"), m = S.mouse, c = { x: -100, y: -100, px: -100, py: -100 };
  addEventListener("pointermove", e => {
    m.tx = e.clientX / innerWidth * 2 - 1; m.ty = e.clientY / innerHeight * 2 - 1; c.px = e.clientX; c.py = e.clientY;
    if (S.reduce || S.coarse) return;
    const mag = e.target.closest?.(".mag"), tilt = e.target.closest?.(".tilt");
    if (mag) { const r = mag.getBoundingClientRect(); mag.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * .22).toFixed(1)}px,${((e.clientY - r.top - r.height / 2) * .35).toFixed(1)}px)`; }
    if (tilt) { const r = tilt.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; tilt.style.setProperty("--mx", x + "px"); tilt.style.setProperty("--my", y + "px"); tilt.style.transform = `perspective(1400px) rotateX(${((y / r.height - .5) * -4).toFixed(2)}deg) rotateY(${((x / r.width - .5) * 5).toFixed(2)}deg)`; }
  }, { passive: true });
  addEventListener("pointerout", e => { const el = e.target.closest?.(".mag,.tilt"); if (el && !el.contains(e.relatedTarget)) el.style.transform = ""; });
  addEventListener("pointerover", e => cursor.classList.toggle("sobre", !!e.target.closest?.("a,button")), { passive: true });
  const bucle = () => { c.x += (c.px - c.x) * .2; c.y += (c.py - c.y) * .2; cursor.style.transform = `translate3d(${c.x.toFixed(1)}px,${c.y.toFixed(1)}px,0)`; requestAnimationFrame(bucle); };
  if (!S.coarse) bucle();
  let ultimo = scrollY;
  addEventListener("scroll", () => { S.scrollVel = scrollY - ultimo; ultimo = scrollY; }, { passive: true });
}

/* 5 · ARRANQUE ----------------------------------------------- */
function construirNav() {
  const cap = PAGES.slice(1);
  $("#riel-nav").innerHTML = cap.map(p => `<button type="button" class="riel-btn" data-ir="${p.id}" data-nav="${p.id}" aria-label="${p.label}"><span>${p.n}</span><span class="riel-nombre" aria-hidden="true">${p.label}</span></button>`).join("");
  $("#movil-nav").innerHTML = cap.map(p => `<button type="button" data-ir="${p.id}" data-nav="${p.id}" aria-label="${p.label}">${p.n}</button>`).join("");
  $("#menu-nav").innerHTML = cap.map(p => `<button type="button" data-ir="${p.id}" data-nav="${p.id}"><b>${p.n}</b><span>${p.label}</span></button>`).join("");
}
function pie() {
  $("#red-fb").href = A.facebook; $("#red-ig").href = A.instagram;
  $("#red-mail").href = "mailto:" + A.correo; $("#red-mail").setAttribute("aria-label", "Escribir a " + A.correo); $("#red-mail-t").textContent = A.correo;
  $("#pie-lugar").textContent = A.ubicacion; $("#anio").textContent = new Date().getFullYear();
}
function eventos() {
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-ir],[data-menu],[data-scroll]"); if (!t) return;
    if (t.dataset.ir) ir(t.dataset.ir);
    else if (t.dataset.menu) t.dataset.menu === "abrir" ? abrirMenu() : cerrarMenu();
    else if (t.dataset.scroll) { const el = document.getElementById(t.dataset.scroll); if (el) scrollTo({ top: el.getBoundingClientRect().top + scrollY - (innerWidth < 900 ? 60 : 0), behavior: "smooth" }); }
  });
  addEventListener("keydown", e => { if (e.key === "Escape") cerrarMenu(); });
  addEventListener("hashchange", () => { const h = (location.hash.match(/^#\/(\w+)/) || [])[1]; if (h && h !== S.page) ir(h); });
}
function precarga(listo) {
  const el = $("#precarga"), aro = $(".pre-progreso", el), pct = $(".pre-pct", el);
  const fin = () => {
    clearInterval(iv); if (el.classList.contains("sale")) return;
    S.introT0 = performance.now() / 1000;
    el.classList.add("sale"); document.body.classList.add("intro");
    setTimeout(() => el.remove(), 1700);
  };
  if (S.reduce) { S.introT0 = performance.now() / 1000 - 10; el.remove(); document.body.classList.add("intro"); return; }
  const t0 = performance.now();
  const iv = setInterval(() => {
    const t = performance.now() - t0;
    let p = Math.min(1, t / 2200);
    if (!listo() && t < 7000) p = Math.min(p, .94);
    aro.style.setProperty("--p", (p * 360).toFixed(1) + "deg"); pct.textContent = String(Math.round(p * 100)).padStart(3, "0");
    if (p >= 1) fin();
  }, 40);
  el.addEventListener("click", () => { if (listo()) fin(); });
}

let escenaLista = false, contenidoListo = false;
precarga(() => escenaLista && contenidoListo);
efectos(); eventos(); construirNav();
iniciarEscena($("#espacio"), S, () => { escenaLista = true; });
cargarContenido().then(c => {
  C = c; A = c.ajustes;
  const h = (location.hash.match(/^#\/(\w+)/) || [])[1];
  if (h && PAGES.some(p => p.id === h)) S.page = h;
  pie(); render(); contenidoListo = true;
  if (!conectado) console.info("Sitio en modo respaldo: configura js/config.js para leer la base de datos.");
});
