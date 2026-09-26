// Capa de datos del sitio público: lee el contenido de Supabase
// y envía los aportes ciudadanos. Sin dependencias externas.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";
import { LOCAL } from "./contenido-local.js";

export const conectado = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const BASE = (SUPABASE_URL || "").replace(/\/$/, "");
const cab = extra => ({ apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + SUPABASE_ANON_KEY, ...extra });

async function leer(tabla, orden) {
  const r = await fetch(`${BASE}/rest/v1/${tabla}?select=*&publicado=eq.true&order=${orden}`, { headers: cab() });
  if (!r.ok) throw new Error(tabla + ": " + r.status);
  return r.json();
}

export async function cargarContenido() {
  if (!conectado) return LOCAL;
  try {
    const [aj, columnas, monumentos, hitos, publicaciones, himno, bandera] = await Promise.all([
      fetch(`${BASE}/rest/v1/ajustes?select=clave,valor`, { headers: cab() }).then(r => { if (!r.ok) throw new Error("ajustes"); return r.json(); }),
      leer("columnas", "fecha.desc"),
      leer("monumentos", "orden.asc"),
      leer("hitos", "orden.asc"),
      leer("publicaciones", "orden.asc"),
      leer("himno", "orden.asc"),
      leer("bandera", "orden.asc")
    ]);
    const ajustes = { ...LOCAL.ajustes };
    aj.forEach(a => { if (a.valor !== null && a.valor !== "") ajustes[a.clave] = a.valor; });
    return { ajustes, columnas, monumentos, hitos, publicaciones, himno, bandera };
  } catch (e) {
    console.warn("No se pudo leer la base de datos; se usa el contenido de respaldo.", e);
    return LOCAL;
  }
}

// Guarda un aporte (y su archivo) con estado "pendiente" para revisión en /admin.
export async function enviarAporte({ nombre, correo, tipo, relato, archivo }) {
  if (!conectado) return { demo: true };
  let ruta = null;
  if (archivo && archivo.size) {
    if (archivo.size > 10 * 1024 * 1024) throw new Error("El archivo supera 10 MB.");
    const limpio = archivo.name.normalize("NFD").replace(/[^\w.\-]+/g, "_").slice(-80);
    ruta = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${limpio}`;
    const up = await fetch(`${BASE}/storage/v1/object/aportes/${ruta}`, {
      method: "POST", headers: cab({ "Content-Type": archivo.type || "application/octet-stream" }), body: archivo
    });
    if (!up.ok) throw new Error("No se pudo subir el archivo.");
  }
  const r = await fetch(`${BASE}/rest/v1/aportes`, {
    method: "POST",
    headers: cab({ "Content-Type": "application/json", Prefer: "return=minimal" }),
    body: JSON.stringify({ nombre, correo, tipo, relato, archivo: ruta })
  });
  if (!r.ok) throw new Error("No se pudo guardar el aporte.");
  return { ok: true };
}
