-- ==========================================================
--  Corporación Tame, Historia y Cultura — esquema de base de datos
--  Ejecutar UNA vez en Supabase → SQL Editor → New query → Run.
--  Después ejecutar 02-datos-iniciales.sql.
-- ==========================================================

create extension if not exists pgcrypto;

-- ── Administradores (solo estos correos pueden editar) ──────
create table if not exists public.administradores (
  email text primary key
);
alter table public.administradores enable row level security;

create or replace function public.es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.administradores where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

-- ── Contenido del sitio ─────────────────────────────────────
create table if not exists public.ajustes (
  clave text primary key,
  valor text not null default '',
  descripcion text
);

create table if not exists public.columnas (               -- II · Tribuna de la Memoria
  id uuid primary key default gen_random_uuid(),
  edicion int,
  fecha timestamptz not null default now(),
  categoria text,
  autor text not null,
  cargo text,
  titulo text not null,
  entradilla text,
  cuerpo text not null,                                     -- párrafos separados por una línea en blanco
  publicado boolean not null default true,
  creado timestamptz not null default now()
);

create table if not exists public.monumentos (             -- III · Salón de monumentos
  id uuid primary key default gen_random_uuid(),
  orden int not null default 0,
  titulo text not null,
  lugar text,
  descripcion text,
  imagen text,
  alt text,
  publicado boolean not null default true,
  creado timestamptz not null default now()
);

create table if not exists public.hitos (                  -- IV · Línea temporal
  id uuid primary key default gen_random_uuid(),
  orden int not null default 0,
  anio text not null,                                       -- "1629" o "1625–1628"
  etapa text,
  titulo text not null,
  texto text,
  imagen text,
  encuadre text default 'center',
  publicado boolean not null default true,
  creado timestamptz not null default now()
);

create table if not exists public.publicaciones (          -- VI · Publicaciones
  id uuid primary key default gen_random_uuid(),
  orden int not null default 0,
  volumen text,
  titulo text not null,
  subtitulo text,
  tipo text,
  texto_lomo text,
  portada text,
  contraportada text,
  color_lomo text default '#d9d8d1',
  color_tinta_lomo text default '#1f2924',
  grosor int default 30,
  autores text,
  descripcion text,
  publicado boolean not null default true,
  creado timestamptz not null default now()
);

-- ── Aportes ciudadanos (formulario del capítulo VI) ───────
create table if not exists public.aportes (
  id uuid primary key default gen_random_uuid(),
  creado timestamptz not null default now(),
  nombre text not null check (char_length(nombre) between 2 and 120),
  correo text not null check (char_length(correo) <= 160),
  tipo text,
  relato text check (char_length(relato) <= 4000),
  archivo text,                                             -- ruta en el bucket privado "aportes"
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobado', 'rechazado')),
  nota text                                                 -- nota interna del revisor
);

-- ── Reglas de seguridad (RLS) ──────────────────────────────
do $$
declare t text;
begin
  foreach t in array array['columnas','monumentos','hitos','publicaciones'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "lectura publica" on public.%I', t);
    execute format('create policy "lectura publica" on public.%I for select using (publicado or public.es_admin())', t);
    execute format('drop policy if exists "admin edita" on public.%I', t);
    execute format('create policy "admin edita" on public.%I for all to authenticated using (public.es_admin()) with check (public.es_admin())', t);
  end loop;
end $$;

alter table public.ajustes enable row level security;
drop policy if exists "lectura publica" on public.ajustes;
create policy "lectura publica" on public.ajustes for select using (true);
drop policy if exists "admin edita" on public.ajustes;
create policy "admin edita" on public.ajustes for all to authenticated using (public.es_admin()) with check (public.es_admin());

alter table public.aportes enable row level security;
drop policy if exists "cualquiera envia" on public.aportes;
create policy "cualquiera envia" on public.aportes for insert to anon, authenticated with check (estado = 'pendiente' and nota is null);
drop policy if exists "admin revisa" on public.aportes;
create policy "admin revisa" on public.aportes for all to authenticated using (public.es_admin()) with check (public.es_admin());

-- ── Almacenamiento de archivos ─────────────────────────────
--  imagenes: público (fotos de monumentos, hitos, portadas…)
--  aportes:  privado (solo los administradores ven lo que envía la gente)
insert into storage.buckets (id, name, public, file_size_limit)
values ('imagenes', 'imagenes', true, 10485760), ('aportes', 'aportes', false, 10485760)
on conflict (id) do nothing;

drop policy if exists "imagenes lectura" on storage.objects;
create policy "imagenes lectura" on storage.objects for select using (bucket_id = 'imagenes');
drop policy if exists "imagenes admin" on storage.objects;
create policy "imagenes admin" on storage.objects for all to authenticated using (bucket_id = 'imagenes' and public.es_admin()) with check (bucket_id = 'imagenes' and public.es_admin());
drop policy if exists "aportes subir" on storage.objects;
create policy "aportes subir" on storage.objects for insert to anon, authenticated with check (bucket_id = 'aportes');
drop policy if exists "aportes admin" on storage.objects;
create policy "aportes admin" on storage.objects for all to authenticated using (bucket_id = 'aportes' and public.es_admin()) with check (bucket_id = 'aportes' and public.es_admin());

-- ── Tu correo de administrador ─────────────────────────────
--  Cambia el correo por el que usarás para entrar a /admin
--  (debe ser el mismo del usuario creado en Authentication → Users).
insert into public.administradores (email) values ('CAMBIA-ESTE-CORREO@ejemplo.com') on conflict do nothing;
