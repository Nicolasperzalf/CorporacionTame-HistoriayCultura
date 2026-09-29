# Instrucciones para Claude Code — Corporación Tame, Historia y Cultura

Este repositorio ES el sitio en producción (GitHub Pages, rama `main`, raíz `/`).
Sitio estático sin build: HTML + CSS + JavaScript (módulos ES). No agregar frameworks, npm ni pasos de compilación.
Publicado en: https://nicolasperzalf.github.io/CorporacionTame-HistoriayCultura/ · Panel: `/admin`.

## Cómo trabajar
- El dueño no es programador: explica en español, breve y sin jerga.
- Haz los cambios, pruébalos localmente (`python -m http.server 8000`) y súbelos con commit a `main` (o PR si el usuario lo pide). Mensajes de commit en español.
- Cambios pequeños = solo lo pedido. No rediseñar lo que no se pidió.
- Nunca subir la clave `service_role` de Supabase. La clave `anon` en `js/config.js` es pública por diseño.
- Imágenes en `assets/` sin subcarpetas y con nombres sin espacios ni tildes.

## Estructura
- `index.html` — estructura pública. `css/styles.css` — estilos (variables en `:root`).
- `js/app.js` — capítulos (`PAGES`), navegación `#/id` con transición, libros 3D (Cap. V), formulario (Cap. VI).
- `js/escena3d.js` — fondo three.js (three@0.184.0 por import dinámico): estrellas warp + reloj de bolsillo dorado; el logotipo es la esfera; las manecillas marcan la hora del capítulo (Inicio = XII, I…VI).
- `js/datos.js` — lee Supabase; si falla usa `js/contenido-local.js`. Publicaciones: si la tabla no tiene la columna `lomo`, usa los libros locales.
- `admin/` — panel (Supabase Auth). Campos de cada sección en `admin/admin.js`.
- `supabase/01-esquema.sql`, `02-datos-iniciales.sql`, `03-libros.sql` (añade columna `lomo` y reemplaza los 5 libros).
- Si cambias contenido, mantén sincronizados `contenido-local.js` y los SQL.

## Diseño (no cambiar sin pedirlo)
- Nombre: "Corporación Tame, Historia y Cultura". Conservar el logotipo (`assets/logo.jpeg`).
- Fondo #0B0E14 / #050505, oro #C5A059 / #8B6B3D, perla #F3EFE7. Bandera: verde #2f7a45, rojo #b3322b.
- Tipos: Lora (titulares, más legible), Cinzel (numerales), Space Grotesk (UI, ≥12px).
- Tono: serio, territorial, respetuoso con la memoria local. Sin emojis.
- 6 capítulos: I Quiénes somos · II Tribuna de la Memoria · III Salón de monumentos · IV Línea temporal · V Publicaciones · VI Aporte ciudadano.

## Pendientes conocidos
1. Confirmar con el usuario que ejecutó `supabase/03-libros.sql` en Supabase (SQL Editor).
2. Faltan fotos de lomo de "De Macaguán a Corocito" y "Los jagüeyes" (hoy usan color + texto).
3. Propuesta: galería pública "Archivo ciudadano" en Cap. VI con aportes aprobados + casilla de consentimiento en el formulario.
4. Propuesta: perfil "Revisor" en el panel que solo aprueba aportes.
