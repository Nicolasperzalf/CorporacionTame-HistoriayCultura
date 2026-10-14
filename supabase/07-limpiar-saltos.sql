-- 07 · Limpia los "\n" que quedaron guardados como texto (barra + n) en vez de saltos de línea.
-- Ejecutar una vez en Supabase → SQL Editor. Se puede repetir sin riesgo.
update public.publicaciones set
  descripcion = replace(descripcion, '\n', E'\n'),
  subtitulo   = replace(subtitulo,   '\n', E'\n'),
  autores     = replace(autores,     '\n', E'\n')
where strpos(descripcion, '\n') > 0 or strpos(subtitulo, '\n') > 0 or strpos(autores, '\n') > 0;

update public.columnas set
  entradilla = replace(entradilla, '\n', E'\n'),
  cuerpo     = replace(cuerpo,     '\n', E'\n')
where strpos(entradilla, '\n') > 0 or strpos(cuerpo, '\n') > 0;

update public.monumentos set descripcion = replace(descripcion, '\n', E'\n') where strpos(descripcion, '\n') > 0;
update public.hitos      set texto       = replace(texto,       '\n', E'\n') where strpos(texto, '\n') > 0;
update public.ajustes    set valor       = replace(valor,       '\n', E'\n') where strpos(valor, '\n') > 0;
