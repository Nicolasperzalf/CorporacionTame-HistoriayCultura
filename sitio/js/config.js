// ─────────────────────────────────────────────────────────────
//  CONFIGURACIÓN DE LA BASE DE DATOS (Supabase)
//  1. Entra a supabase.com → tu proyecto → Project Settings → API
//  2. Copia "Project URL" y la clave "anon public" aquí abajo.
//  La clave "anon" es pública por diseño: la seguridad la dan las
//  reglas (RLS) de supabase/01-esquema.sql. NUNCA pegues aquí la
//  clave "service_role".
//  Si se dejan vacías, el sitio muestra el contenido de respaldo
//  (js/contenido-local.js) y el formulario funciona en modo demostración.
// ─────────────────────────────────────────────────────────────

export const SUPABASE_URL = "https://uilwakreevwnffstzcot.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_RMDusCEmc9XygjQZalMRSQ_guvjh2Wd";
