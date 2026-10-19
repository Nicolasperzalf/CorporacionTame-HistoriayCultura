// ==========================================================
//  Íconos de línea que se dibujan solos
//  Todos comparten el mismo trazo (1.5, puntas redondas) y se
//  dibujan con stroke-dashoffset: cada trazo lleva pathLength="1"
//  y un número de orden --k para dibujarse uno tras otro.
//  La animación vive en css/movimiento.css ([data-dibujo]).
// ==========================================================

// Convierte una lista de trazos "d" en un SVG listo para dibujarse
const svg = (trazos, caja = 48, clase = "") =>
  `<svg class="ico ${clase}" viewBox="0 0 ${caja} ${caja}" aria-hidden="true" focusable="false" data-dibujo>${trazos
    .map((t, k) => (typeof t === "string" ? `<path d="${t}" pathLength="1" style="--k:${k}"/>` : `<path d="${t.d}" pathLength="1" style="--k:${k}" class="${t.c}"/>`))
    .join("")}</svg>`;

// Círculo escrito como trazo (así todos los elementos son <path> y se dibujan igual)
const circulo = (cx, cy, r) => `M${cx} ${cy - r}a${r} ${r} 0 1 1 0 ${2 * r}a${r} ${r} 0 1 1 0 ${-2 * r}`;

// Ícono de cada capítulo (I a VI). La clase de cada trazo permite animarlo al pasar el cursor.
export const ICONOS = {
  // I · Quiénes somos: la comunidad (tres personas sobre un mismo suelo)
  nosotros: () => svg([
    { d: circulo(24, 14, 5), c: "i-cab" },
    { d: "M14 37v-3a10 10 0 0 1 20 0v3", c: "i-cuerpo" },
    { d: circulo(10.5, 20, 3.5), c: "i-lado" },
    { d: "M3.5 37v-2a7 7 0 0 1 11.5-5.4", c: "i-lado" },
    { d: circulo(37.5, 20, 3.5), c: "i-lado2" },
    { d: "M44.5 37v-2a7 7 0 0 0-11.5-5.4", c: "i-lado2" },
    "M6 42h36"
  ]),
  // II · Tribuna de la Memoria: la pluma que escribe
  tribuna: () => svg([
    { d: "M41 5C29 6 20 15 15.5 28L13 35l3.6-5.2C27.5 29 36.5 20.5 41 5z", c: "i-pluma" },
    { d: "M41 5L15 32", c: "i-pluma" },
    { d: "M5 42c3.5-3 6.5 2.5 10 0s6.5-3 10 0 6.5 2.5 10 0", c: "i-escritura" }
  ]),
  // III · Salón de monumentos: el obelisco sobre su pedestal, con su halo
  monumentos: () => svg([
    { d: "M9 26a15 15 0 0 1 30 0", c: "i-halo" },
    "M21.2 34L22.4 12 24 7l1.6 5 1.2 22z",
    "M16 34h16v5H16z",
    "M10 39h28v4H10z"
  ]),
  // IV · Línea temporal: el reloj de arena
  historia: () => svg([
    "M14 6h20M14 42h20",
    "M16.5 6c0 9 6.5 13 6.5 18s-6.5 9-6.5 18",
    "M31.5 6c0 9-6.5 13-6.5 18s6.5 9 6.5 18",
    { d: "M19.5 12.5h9L24 19z", c: "i-arena" },
    { d: "M24 22v12", c: "i-chorro" },
    { d: "M18.5 40.5c2-4 9-4 11 0z", c: "i-arena" }
  ], 48, "i-reloj-arena"),
  // V · Publicaciones: el libro abierto que pasa una hoja
  publicaciones: () => svg([
    "M24 13c-5-4-13-4-18-2v26c5-2 13-2 18 2",
    "M24 13c5-4 13-4 18-2v26c-5-2-13-2-18 2",
    "M24 13v26",
    "M10 18c3-1 7-1 10 .5M10 23c3-1 7-1 10 .5M10 28c3-1 7-1 10 .5",
    { d: "M24 13c4-3.5 10-4 14.5-3v25c-4.5-1-10.5-.5-14.5 3", c: "i-hoja" }
  ]),
  // VI · Aporte ciudadano: la fotografía antigua del Llano (palma, sol y horizonte)
  aportar: () => svg([
    { d: "M9 11h30v26H9z", c: "i-foto" },
    { d: "M12 31c5-3 9-1 13-3s8-2 11-1", c: "i-foto" },
    { d: circulo(31, 19, 3.2), c: "i-foto" },
    { d: "M18 31v-9m0 0c-3-1-5 0-6 2m6-2c3-1 5 0 6 2m-6-2c-1-3-3-4-5-4m5 4c1-3 3-4 5-4", c: "i-foto" },
    "M7 42h34"
  ])
};

// Reloj-flecha de los botones: la manecilla apunta hacia donde vas
// (dir en grados: 90 = derecha, 180 = abajo, 45 = enlace externo, -90 = izquierda)
export const reloj = (dir = 90) => `<span class="reloj" style="--dir:${dir}deg" aria-hidden="true"><svg viewBox="0 0 40 40" focusable="false">
  <path class="r-aro" d="${circulo(20, 20, 16)}"/>
  <path class="r-marcas" d="${Array.from({ length: 12 }, (_, i) => {
    const a = i / 12 * Math.PI * 2, s = Math.sin(a), c = -Math.cos(a), r0 = i % 3 ? 13.6 : 12.4;
    return `M${(20 + s * r0).toFixed(2)} ${(20 + c * r0).toFixed(2)}L${(20 + s * 15).toFixed(2)} ${(20 + c * 15).toFixed(2)}`;
  }).join("")}"/>
  <g class="r-aguja"><path d="M20 22.5V9.5"/><path d="M16.6 13 20 9.5l3.4 3.5"/></g>
  <path class="r-eje" d="${circulo(20, 20, 1.6)}"/>
</svg></span>`;

// Ondas de sonido (el botón de sonido las anima cuando está activo)
export const ondas = () => `<svg class="ondas" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path class="o-punto" d="${circulo(6, 12, 2.2)}"/>
  <path class="o-1" d="M10 8.5a5 5 0 0 1 0 7"/>
  <path class="o-2" d="M13.5 6a8.5 8.5 0 0 1 0 12"/>
  <path class="o-3" d="M17 3.5a12 12 0 0 1 0 17"/>
  <path class="o-corte" d="M4 20 20 4"/>
</svg>`;
