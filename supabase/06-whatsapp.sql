-- 06 · Pedidos por WhatsApp y contacto sin redes sociales
-- Ejecutar una vez en Supabase → SQL Editor.
-- 1) WhatsApp de la Corporación (se edita luego en /admin → Textos y contacto).
insert into public.ajustes (clave, valor, descripcion) values
  ('whatsapp', '573222070839', 'Pie y pedidos de libros · WhatsApp de la Corporación (con 57 adelante)')
on conflict (clave) do update set valor = excluded.valor, descripcion = excluded.descripcion;
-- 2) Quitar Facebook e Instagram del pie.
delete from public.ajustes where clave in ('facebook', 'instagram');
-- 3) Libros que se piden a otro número (vacío = WhatsApp de la Corporación).
alter table public.publicaciones add column if not exists whatsapp text;
