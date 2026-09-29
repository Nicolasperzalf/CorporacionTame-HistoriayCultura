// ==========================================================
//  Panel de administración — Corporación Tame, Historia y Cultura
//  Editar contenido, subir imágenes y revisar aportes ciudadanos.
//  Para agregar o quitar campos de una sección, edita TABLAS.
// ==========================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../js/config.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fecha = d => d ? new Date(d).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Bogota" }) : "";
const verImg = u => !u ? "" : /^(https?:|data:|blob:)/.test(u) ? u : "../" + u; // rutas del repositorio vs. URLs de Supabase

// ── Definición de las secciones editables ──
const TABLAS = {
  columnas: {
    nombre: "Tribuna de la Memoria", unidad: "columna", orden: ["fecha", false],
    ayuda: "Columnas de opinión. La más reciente aparece primero en el sitio.",
    fila: r => [r.titulo, `${fecha(r.fecha)} · ${r.autor}`, null],
    campos: [
      { k: "titulo", l: "Título", t: "texto", req: 1, ancho: 1 },
      { k: "autor", l: "Autor", t: "texto", req: 1 }, { k: "cargo", l: "Cargo o rol del autor", t: "texto" },
      { k: "categoria", l: "Categoría", t: "texto" }, { k: "edicion", l: "Edición N.º", t: "numero" },
      { k: "fecha", l: "Fecha y hora de publicación", t: "fecha" }, { k: "publicado", l: "Visible en el sitio", t: "si-no", def: true },
      { k: "entradilla", l: "Entradilla (resumen corto)", t: "area", ancho: 1 },
      { k: "cuerpo", l: "Texto completo", t: "area-grande", req: 1, ancho: 1, ayuda: "Separa los párrafos con una línea en blanco." }
    ]
  },
  monumentos: {
    nombre: "Salón de monumentos", unidad: "monumento", orden: ["orden", true],
    ayuda: "Se muestran uno a uno a pantalla completa, en el orden indicado.",
    fila: r => [r.titulo, r.lugar, r.imagen],
    campos: [
      { k: "titulo", l: "Nombre del monumento", t: "texto", req: 1, ancho: 1 },
      { k: "lugar", l: "Lugar o categoría", t: "texto" }, { k: "orden", l: "Orden", t: "numero", def: 0 },
      { k: "descripcion", l: "Descripción", t: "area", ancho: 1 },
      { k: "imagen", l: "Fotografía", t: "imagen", ancho: 1 },
      { k: "alt", l: "Descripción de la foto (accesibilidad)", t: "texto", ancho: 1 },
      { k: "publicado", l: "Visible en el sitio", t: "si-no", def: true }
    ]
  },
  hitos: {
    nombre: "Línea temporal", unidad: "hito", orden: ["orden", true],
    ayuda: "Los hitos se ubican en la línea según el año. Mantén el orden cronológico.",
    fila: r => [`${r.anio} · ${r.titulo}`, r.etapa, r.imagen],
    campos: [
      { k: "anio", l: "Año o periodo", t: "texto", req: 1, ayuda: "Ej.: 1629 o 1625–1628" }, { k: "orden", l: "Orden", t: "numero", def: 0 },
      { k: "titulo", l: "Título", t: "texto", req: 1, ancho: 1 },
      { k: "etapa", l: "Etapa", t: "texto" }, { k: "encuadre", l: "Encuadre de la imagen", t: "opciones", op: ["center", "center top", "center 30%", "center 60%", "center 70%", "center bottom"], def: "center" },
      { k: "texto", l: "Texto", t: "area", ancho: 1 },
      { k: "imagen", l: "Imagen", t: "imagen", ancho: 1 },
      { k: "publicado", l: "Visible en el sitio", t: "si-no", def: true }
    ]
  },
  publicaciones: {
    nombre: "Publicaciones", unidad: "libro", orden: ["orden", true],
    ayuda: "Libros que se muestran en 3D. Sube portada, contraportada y (opcional) la foto del lomo en vertical. La descripción es el texto de la contraportada.",
    fila: r => [`${r.volumen ? r.volumen + " · " : ""}${r.titulo}`, r.tipo, r.portada],
    campos: [
      { k: "titulo", l: "Título", t: "texto", req: 1 }, { k: "volumen", l: "Volumen", t: "texto", ayuda: "Solo si el libro es parte de una serie (ej.: Vol. I). Déjalo vacío si no." },
      { k: "subtitulo", l: "Subtítulo", t: "texto", ancho: 1 },
      { k: "tipo", l: "Tipo o tema", t: "texto" }, { k: "orden", l: "Orden", t: "numero", def: 0 },
      { k: "autores", l: "Autores", t: "texto", ancho: 1 },
      { k: "descripcion", l: "Descripción", t: "area", ancho: 1 },
      { k: "portada", l: "Portada", t: "imagen", ancho: 1 }, { k: "contraportada", l: "Contraportada", t: "imagen", ancho: 1 },
      { k: "lomo", l: "Imagen del lomo (vertical, opcional)", t: "imagen", ancho: 1 },
      { k: "texto_lomo", l: "Texto del lomo", t: "texto" }, { k: "grosor", l: "Grosor del lomo (px)", t: "numero", def: 30 },
      { k: "color_lomo", l: "Color del lomo", t: "color", def: "#d9d8d1" }, { k: "color_tinta_lomo", l: "Color del texto del lomo", t: "color", def: "#1f2924" },
      { k: "publicado", l: "Visible en el sitio", t: "si-no", def: true }
    ]
  }
};
const MENU = [
  { grupo: "Participación" }, { id: "aportes", l: "Aportes ciudadanos" },
  { grupo: "Contenido" }, { id: "columnas" }, { id: "monumentos" }, { id: "hitos" }, { id: "publicaciones" },
  { grupo: "General" }, { id: "ajustes", l: "Textos y contacto" }
];

// ── Utilidades de interfaz ──
let sb, vista = "aportes", filtroAportes = "pendiente";
const aviso = (t, err) => { const a = $("#aviso"); a.textContent = t; a.className = "aviso" + (err ? " error" : ""); a.hidden = false; clearTimeout(aviso.t); aviso.t = setTimeout(() => a.hidden = true, 3200); };
const mostrar = id => ["acceso", "sin-config", "panel"].forEach(x => $("#" + x).hidden = x !== id);

// ── Arranque y sesión ──
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) mostrar("sin-config");
else {
  sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  sb.auth.onAuthStateChange(async (ev, sesion) => {
    if (ev === "PASSWORD_RECOVERY") {
      const nueva = prompt("Escribe tu nueva contraseña (mínimo 8 caracteres):");
      if (nueva && nueva.length >= 8) { const { error } = await sb.auth.updateUser({ password: nueva }); aviso(error ? error.message : "Contraseña actualizada.", !!error); }
    }
    sesion ? entrar(sesion) : mostrar("acceso");
  });
}
$("#form-acceso").onsubmit = async e => {
  e.preventDefault();
  const d = new FormData(e.target), msg = $("#msg-acceso");
  msg.className = "msg"; msg.textContent = "Entrando…";
  const { error } = await sb.auth.signInWithPassword({ email: d.get("email"), password: d.get("clave") });
  if (error) { msg.className = "msg error"; msg.textContent = "Correo o contraseña incorrectos."; }
};
$("#olvide").onclick = async () => {
  const email = $("#form-acceso").email.value; const msg = $("#msg-acceso");
  if (!email) { msg.className = "msg error"; msg.textContent = "Escribe tu correo primero."; return; }
  await sb.auth.resetPasswordForEmail(email, { redirectTo: location.href.split("#")[0] });
  msg.className = "msg"; msg.textContent = "Te enviamos un correo para restablecer la contraseña.";
};
$("#salir").onclick = () => sb.auth.signOut();

let dentro = false;
async function entrar(sesion) {
  mostrar("panel");
  $("#usuario-email").textContent = sesion.user.email;
  if (dentro) return; dentro = true;
  const { data: admin } = await sb.rpc("es_admin");
  if (!admin) { $("#contenido").innerHTML = `<div class="tarjeta vacio">Tu usuario (${esc(sesion.user.email)}) no está registrado como administrador.<br>Agrega tu correo a la tabla <code>administradores</code> en Supabase.</div>`; return; }
  await quitarVolumenes();
  pintarMenu(); abrir(vista);
}

// Solo «Tame, 400 años» lleva volumen: al entrar se borran los «Vol. II–V» antiguos
// (equivale a supabase/04-volumenes.sql; no toca volúmenes escritos después a mano).
async function quitarVolumenes() {
  await sb.from("publicaciones").update({ volumen: null })
    .in("volumen", ["Vol. II", "Vol. III", "Vol. IV", "Vol. V"])
    .neq("titulo", "Tame, 400 años");
}

// ── Menú lateral ──
async function pintarMenu() {
  const { count } = await sb.from("aportes").select("id", { count: "exact", head: true }).eq("estado", "pendiente");
  $("#menu").innerHTML = MENU.map(m => m.grupo ? `<p class="grupo">${m.grupo}</p>` :
    `<button type="button" data-v="${m.id}" aria-current="${m.id === vista}"><span>${m.l || TABLAS[m.id].nombre}</span>${m.id === "aportes" && count ? `<span class="contador">${count}</span>` : ""}</button>`).join("");
  $$("#menu [data-v]").forEach(b => b.onclick = () => abrir(b.dataset.v));
}
function abrir(v) {
  vista = v;
  $$("#menu [data-v]").forEach(b => b.setAttribute("aria-current", b.dataset.v === v));
  if (v === "aportes") return aportes();
  if (v === "ajustes") return ajustes();
  lista(v);
}

// ── Lista genérica de una sección ──
async function lista(tabla) {
  const T = TABLAS[tabla], c = $("#contenido");
  c.innerHTML = `<div class="barra"><div><h1>${T.nombre}</h1><p>${T.ayuda}</p></div><button type="button" class="btn primario" id="nuevo">+ Nuevo ${T.unidad}</button></div><div class="lista" id="filas"><p class="suave">Cargando…</p></div>`;
  $("#nuevo").onclick = () => editor(tabla, null);
  const { data, error } = await sb.from(tabla).select("*").order(T.orden[0], { ascending: T.orden[1] });
  if (error) { $("#filas").innerHTML = `<p class="msg error">${esc(error.message)}</p>`; return; }
  if (!data.length) { $("#filas").innerHTML = `<div class="tarjeta vacio">Aún no hay registros.</div>`; return; }
  $("#filas").innerHTML = data.map((r, i) => {
    const [t, s, img] = T.fila(r);
    return `<div class="tarjeta fila">
      ${img ? `<img class="mini" src="${esc(verImg(img))}" alt="">` : `<span class="mini vacia">${esc(String(t || "?").trim()[0] || "")}</span>`}
      <div><b>${esc(t)}</b><small>${esc(s)}</small></div>
      <div class="acciones"><span class="etq ${r.publicado ? "si" : ""}">${r.publicado ? "Publicado" : "Oculto"}</span><button type="button" class="btn" data-editar="${i}">Editar</button></div>
    </div>`;
  }).join("");
  $$("[data-editar]").forEach(b => b.onclick = () => editor(tabla, data[+b.dataset.editar]));
}

// ── Editor genérico ──
const aLocal = iso => { if (!iso) return ""; const d = new Date(iso); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };
function campo(f, v) {
  const val = v ?? f.def ?? "", id = "c-" + f.k, req = f.req ? "required" : "", ayuda = f.ayuda ? `<span class="ayuda">${f.ayuda}</span>` : "";
  const cls = f.ancho ? ' class="ancho"' : "";
  switch (f.t) {
    case "area": return `<label${cls}>${f.l}<textarea id="${id}" ${req}>${esc(val)}</textarea>${ayuda}</label>`;
    case "area-grande": return `<label${cls}>${f.l}<textarea id="${id}" class="grande" ${req}>${esc(val)}</textarea>${ayuda}</label>`;
    case "numero": return `<label${cls}>${f.l}<input id="${id}" type="number" value="${esc(val)}" ${req}>${ayuda}</label>`;
    case "fecha": return `<label${cls}>${f.l}<input id="${id}" type="datetime-local" value="${esc(aLocal(v || new Date().toISOString()))}" ${req}>${ayuda}</label>`;
    case "color": return `<label${cls}>${f.l}<input id="${id}" type="color" value="${esc(val || "#000000")}">${ayuda}</label>`;
    case "si-no": return `<label class="check${f.ancho ? " ancho" : ""}"><input id="${id}" type="checkbox" ${val ? "checked" : ""}>${f.l}</label>`;
    case "opciones": return `<label${cls}>${f.l}<select id="${id}">${f.op.map(o => `<option ${o === val ? "selected" : ""}>${o}</option>`).join("")}</select>${ayuda}</label>`;
    case "imagen": return `<div class="ancho"><label>${f.l}</label><div class="campo-img" style="margin-top:6px"><img id="${id}-ver" src="${esc(verImg(val))}" alt=""><div><input id="${id}" type="text" value="${esc(val)}" placeholder="Sube un archivo o pega un enlace"><input id="${id}-archivo" type="file" accept="image/*"><span class="ayuda">JPG o PNG, idealmente de 1600 px de ancho y menos de 2 MB.</span></div></div></div>`;
    default: return `<label${cls}>${f.l}<input id="${id}" type="text" value="${esc(val)}" ${req}>${ayuda}</label>`;
  }
}
function editor(tabla, reg) {
  const T = TABLAS[tabla], c = $("#contenido");
  c.innerHTML = `<div class="barra"><div><h1>${reg ? "Editar" : "Nuevo"} ${T.unidad}</h1><p>${T.nombre}</p></div><button type="button" class="btn" id="volver">← Volver a la lista</button></div>
    <form class="tarjeta editor" id="editor" novalidate>${T.campos.map(f => campo(f, reg ? reg[f.k] : undefined)).join("")}
      <div class="pie-editor">${reg ? `<button type="button" class="btn peligro" id="borrar">Eliminar</button>` : "<span></span>"}<div><button type="button" class="btn" id="cancelar">Cancelar</button><button type="submit" class="btn primario">Guardar</button></div></div>
    </form>`;
  $("#volver").onclick = $("#cancelar").onclick = () => lista(tabla);
  // subida de imágenes
  T.campos.filter(f => f.t === "imagen").forEach(f => {
    const txt = $("#c-" + f.k), ver = $("#c-" + f.k + "-ver"), arch = $("#c-" + f.k + "-archivo");
    txt.oninput = () => ver.src = verImg(txt.value);
    arch.onchange = async () => {
      const file = arch.files[0]; if (!file) return;
      if (file.size > 10 * 1024 * 1024) return aviso("La imagen supera 10 MB.", true);
      aviso("Subiendo imagen…");
      const ruta = `${tabla}/${Date.now()}-${file.name.normalize("NFD").replace(/[^\w.\-]+/g, "_")}`;
      const { error } = await sb.storage.from("imagenes").upload(ruta, file, { cacheControl: "31536000", upsert: false });
      if (error) return aviso(error.message, true);
      txt.value = sb.storage.from("imagenes").getPublicUrl(ruta).data.publicUrl; ver.src = txt.value;
      aviso("Imagen subida. Recuerda guardar.");
    };
  });
  $("#editor").onsubmit = async e => {
    e.preventDefault();
    const datos = {};
    for (const f of T.campos) {
      const el = $("#c-" + f.k);
      let v = f.t === "si-no" ? el.checked : el.value.trim();
      if (f.t === "numero") v = v === "" ? null : Number(v);
      if (f.t === "fecha") v = v ? new Date(v).toISOString() : new Date().toISOString();
      if (f.req && (v === "" || v == null)) { el.focus(); return aviso(`Falta: ${f.l}`, true); }
      if (v === "") v = null;
      datos[f.k] = v;
    }
    const q = reg ? sb.from(tabla).update(datos).eq("id", reg.id) : sb.from(tabla).insert(datos);
    const { error } = await q;
    if (error) return aviso(error.message, true);
    aviso("Guardado. Los cambios ya están en el sitio."); lista(tabla);
  };
  if (reg) $("#borrar").onclick = async () => {
    if (!confirm(`¿Eliminar este ${T.unidad}? No se puede deshacer.`)) return;
    const { error } = await sb.from(tabla).delete().eq("id", reg.id);
    if (error) return aviso(error.message, true);
    aviso("Eliminado."); lista(tabla);
  };
}

// ── Aportes ciudadanos ──
async function aportes() {
  const c = $("#contenido");
  const F = [["pendiente", "Pendientes"], ["aprobado", "Aprobados"], ["rechazado", "Rechazados"], ["todos", "Todos"]];
  c.innerHTML = `<div class="barra"><div><h1>Aportes ciudadanos</h1><p>Lo que la comunidad envía desde el capítulo VI. Revisa cada aporte, abre el archivo adjunto y márcalo como aprobado (catalogado en el archivo) o rechazado.</p></div></div>
    <div class="filtros">${F.map(([k, l]) => `<button type="button" data-f="${k}" aria-pressed="${k === filtroAportes}">${l}</button>`).join("")}</div>
    <div class="lista" id="aportes"><p class="suave">Cargando…</p></div>`;
  $$("[data-f]").forEach(b => b.onclick = () => { filtroAportes = b.dataset.f; aportes(); });
  let q = sb.from("aportes").select("*").order("creado", { ascending: false });
  if (filtroAportes !== "todos") q = q.eq("estado", filtroAportes);
  const { data, error } = await q;
  const caja = $("#aportes");
  if (error) { caja.innerHTML = `<p class="msg error">${esc(error.message)}</p>`; return; }
  if (!data.length) { caja.innerHTML = `<div class="tarjeta vacio">No hay aportes en esta categoría.</div>`; return; }
  caja.innerHTML = data.map((a, i) => `
    <article class="tarjeta aporte">
      <div class="aporte-top"><div><b>${esc(a.nombre)}</b> · <a href="mailto:${esc(a.correo)}">${esc(a.correo)}</a></div><small>${fecha(a.creado)} · ${esc(a.tipo || "Sin tipo")} · <span class="etq ${a.estado}">${a.estado}</span></small></div>
      ${a.relato ? `<p>${esc(a.relato)}</p>` : `<p class="suave">Sin relato.</p>`}
      <label>Nota interna<textarea data-nota="${i}" placeholder="Ej.: foto catalogada como FA-0012; pedir permiso de publicación">${esc(a.nota)}</textarea></label>
      <div class="acciones">
        ${a.archivo ? `<button type="button" class="btn" data-archivo="${i}">Ver archivo adjunto</button>` : ""}
        <button type="button" class="btn ok" data-estado="${i}" data-valor="aprobado">Aprobar</button>
        <button type="button" class="btn" data-estado="${i}" data-valor="rechazado">Rechazar</button>
        <button type="button" class="btn" data-estado="${i}" data-valor="pendiente">Dejar pendiente</button>
        <button type="button" class="btn peligro" data-borrar="${i}">Eliminar</button>
      </div>
    </article>`).join("");
  $$("[data-archivo]").forEach(b => b.onclick = async () => {
    const { data: u, error } = await sb.storage.from("aportes").createSignedUrl(data[+b.dataset.archivo].archivo, 3600);
    if (error) return aviso(error.message, true);
    open(u.signedUrl, "_blank", "noopener");
  });
  $$("[data-estado]").forEach(b => b.onclick = async () => {
    const a = data[+b.dataset.estado], nota = $(`[data-nota="${b.dataset.estado}"]`).value.trim() || null;
    const { error } = await sb.from("aportes").update({ estado: b.dataset.valor, nota }).eq("id", a.id);
    if (error) return aviso(error.message, true);
    aviso("Aporte actualizado."); pintarMenu(); aportes();
  });
  $$("[data-borrar]").forEach(b => b.onclick = async () => {
    const a = data[+b.dataset.borrar];
    if (!confirm(`¿Eliminar el aporte de ${a.nombre}? También se borrará su archivo.`)) return;
    if (a.archivo) await sb.storage.from("aportes").remove([a.archivo]);
    const { error } = await sb.from("aportes").delete().eq("id", a.id);
    if (error) return aviso(error.message, true);
    aviso("Aporte eliminado."); pintarMenu(); aportes();
  });
}

// ── Textos generales y contacto ──
async function ajustes() {
  const c = $("#contenido");
  c.innerHTML = `<div class="barra"><div><h1>Textos y contacto</h1><p>Textos que aparecen en varias partes del sitio y los datos del pie de página.</p></div></div><p class="suave">Cargando…</p>`;
  const { data, error } = await sb.from("ajustes").select("*").order("clave");
  if (error) { c.innerHTML += `<p class="msg error">${esc(error.message)}</p>`; return; }
  const largos = ["hero_texto", "nosotros_intro", "mision", "vision", "valores", "objetivos", "aporte_texto"];
  const ordenados = [...data].sort((a, b) => (a.descripcion || a.clave).localeCompare(b.descripcion || b.clave, "es"));
  c.innerHTML = `<div class="barra"><div><h1>Textos y contacto</h1><p>Textos que aparecen en varias partes del sitio y los datos del pie de página.</p></div></div>
    <form class="tarjeta editor" id="f-ajustes">${ordenados.map(a => largos.includes(a.clave)
      ? `<label class="ancho">${esc(a.descripcion || a.clave)}<textarea data-clave="${esc(a.clave)}">${esc(a.valor)}</textarea></label>`
      : `<label>${esc(a.descripcion || a.clave)}<input type="text" data-clave="${esc(a.clave)}" value="${esc(a.valor)}"></label>`).join("")}
      <div class="pie-editor"><span></span><div><button type="submit" class="btn primario">Guardar cambios</button></div></div>
    </form>`;
  $("#f-ajustes").onsubmit = async e => {
    e.preventDefault();
    const filas = $$("[data-clave]").map(el => ({ clave: el.dataset.clave, valor: el.value.trim(), descripcion: data.find(d => d.clave === el.dataset.clave)?.descripcion }));
    const { error } = await sb.from("ajustes").upsert(filas);
    aviso(error ? error.message : "Textos guardados.", !!error);
  };
}
