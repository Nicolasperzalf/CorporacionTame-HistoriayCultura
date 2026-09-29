-- 04 · Solo "Los orígenes de Tame" lleva volumen (Vol. I); los demás libros muestran solo su nombre.
-- Ejecutar una vez en Supabase → SQL Editor. (El panel /admin también lo aplica solo al entrar.)
update public.publicaciones set volumen = 'Vol. I' where titulo = 'Los orígenes de Tame';
update public.publicaciones set volumen = null where titulo <> 'Los orígenes de Tame';
