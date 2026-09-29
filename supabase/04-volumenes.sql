-- 04 · Solo "Tame, 400 años" lleva volumen; los demás libros muestran solo su nombre.
-- Ejecutar una vez en Supabase → SQL Editor.
update public.publicaciones set volumen = 'Vol. I' where titulo = 'Tame, 400 años';
update public.publicaciones set volumen = null where titulo <> 'Tame, 400 años';
