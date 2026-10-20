# Instrucciones para Claude Code — Corporación Tame, Historia y Cultura

Este repositorio ES el sitio en producción (GitHub Pages, rama `main`, raíz `/`).
Sitio estático sin build: HTML + CSS + JavaScript (módulos ES). No agregar frameworks, npm ni pasos de compilación.
Publicado en: https://corporaciontamehistoriaycultura.co/ (ÚNICO acceso, dominio propio en Cloudflare) · Panel: `/admin`.
Las direcciones viejas (`*.github.io`, `*.workers.dev`) redirigen al dominio (script al inicio de `index.html` y `admin/index.html`). Por eso las vistas previas de rama también saltan al dominio: probar en local. (Apagar `workers_dev`/`preview_urls` en `wrangler.jsonc` hace fallar las compilaciones de rama de Cloudflare; no hacerlo.)

## Cómo trabajar
- El dueño no es programador: explica en español, breve y sin jerga.
- Haz los cambios, pruébalos localmente (`python -m http.server 8000`) y súbelos con commit a `main` (o PR si el usuario lo pide). Mensajes de commit en español.
- Cambios pequeños = solo lo pedido. No rediseñar lo que no se pidió.
- Nunca subir la clave `service_role` de Supabase. La clave `anon` en `js/config.js` es pública por diseño.
- Imágenes en `assets/` sin subcarpetas y con nombres sin espacios ni tildes.

## Estructura
- `index.html` — estructura pública. `css/styles.css` — estilos (variables en `:root`). `css/movimiento.css` — todo el movimiento (revelados, luz, túnel, portal, carga, sonido, `prefers-reduced-motion`).
- `js/app.js` — capítulos (`PAGES`), navegación `#/id`, libros 3D (Cap. V), formulario (Cap. VI) y arranque.
- `js/movimiento.js` — motor de movimiento compartido: `TIEMPOS`/`CURVA`, `revelar` (máscaras y trazos encadenados), luz de borde que sigue el cursor con chispas (`.luz`), `animarPuertas` (túnel que acelera), `atravesar` (portal que crece desde lo pulsado y une la salida de un capítulo con la entrada del siguiente).
- `js/precarga.js` — pantalla de carga SIN textos: aro-reloj con el logo, años 1629→2029 y friso de línea (caney, canoa, conuco, morichal) que se dibuja según el avance real; al final, aviso de que el sitio tiene sonido y puerta «Entrar con sonido / en silencio».
- `js/sonido.js` — sonido sintetizado (Web Audio, sin archivos): fondo de espacio profundo (acorde grave que respira, polvo cósmico, destellos con eco) y cuatro llanero sintetizado (afinación real La-Re-Fa#-Si): rasgueo al acercarse a una puerta, golpe de joropo al cruzar, acorde del capítulo al llegar. Sin arpa, aves, tic-tac ni grillos. Solo con permiso; se recuerda en `localStorage` (`tame-sonido`).
- `js/iconos.js` — íconos de línea por capítulo (se dibujan solos) y los relojes de los botones.
- Cloudflare: `wrangler.jsonc` (vistas previas de ramas), `_headers` (seguridad y caché), `.assetsignore` (lo que no se publica).
- `js/escena3d.js` — fondo three.js (three@0.184.0 por import dinámico): estrellas warp + reloj de bolsillo dorado; el logotipo es la esfera; las manecillas marcan la hora del capítulo (Inicio = XII, I…VI).
- `js/datos.js` — lee Supabase; si falla usa `js/contenido-local.js`. Publicaciones: si la tabla no tiene la columna `lomo`, usa los libros locales.
- `admin/` — panel (Supabase Auth). Campos de cada sección en `admin/admin.js`.
- `supabase/01-esquema.sql`, `02-datos-iniciales.sql`, `03-libros.sql` (añade columna `lomo` y reemplaza los 5 libros), `04-volumenes.sql` (solo "Los orígenes de Tame" lleva volumen: Vol. I), `05-libros-nuevos.sql` (añade «Río Arauca» y «La Mujer de la Luna»), `06-whatsapp.sql` (WhatsApp en ajustes, quita Facebook/Instagram, columna `whatsapp` por libro), `07-limpiar-saltos.sql` (convierte los "\n" guardados como texto en saltos de línea reales).
- Si cambias contenido, mantén sincronizados `contenido-local.js` y los SQL.

## Diseño (no cambiar sin pedirlo)
- Contacto: solo WhatsApp (573222070839, clave `whatsapp` en ajustes) y correo. Sin Facebook ni Instagram (no son de la Corporación).
- «Solicitar ejemplar» abre WhatsApp con el nombre del libro; usa `publicaciones.whatsapp` si existe, si no el de la Corporación.
- Precarga: el contador va de 1629 (fundación de La Palma de Espinosa) a 2029 (Tame, 400 años).
- Nombre: "Corporación Tame, Historia y Cultura". Conservar el logotipo (`assets/logo.jpeg`).
- Fondo #0B0E14 / #050505, oro #C5A059 / #8B6B3D, perla #F3EFE7. Bandera: verde #2f7a45, rojo #b3322b.
- Tipos: Ibarra Real Nova (titulares y numerales; imprenta española del s. XVIII), Schibsted Grotesk (UI, ≥12px). Cuadros/placas: Cormorant Garamond (títulos) y Marcellus (números).
- Cuadros (`.vidrio`) = placas de archivo con esquinas cortadas (clip-path), sin desenfoque de fondo (rendimiento).
- Sin rótulos «Capítulo X · Nombre» en las secciones ni en el portal (solo ícono y numeral).
- Movimiento: capítulos = «puertas del tiempo» (arco de misión con túnel); botones principales (`.btn-oro`, `.btn-vidrio`) = siluetas de reloj de bolsillo (círculo con asa y corona, SIN marcas ni aguja), con luz de borde que sigue el cursor; «Siguiente destino» = placa de esquinas cortadas con una esfera cuya aguja avanza a la hora del próximo capítulo (sin texto «Cruzar la puerta»).
- Monumentos: la foto se ve completa (contain) y aparece abriéndose desde el centro; el texto va algo desvanecido con sombra para leerse. Sin franja de fechas, sin cursor personalizado.
- Puertas: la I (Quiénes somos) lleva el logotipo recortado sin el borde blanco y con más contraste; la VI (Aporte ciudadano) lleva el ícono de líneas que antes tenía la I.
- Friso de carga: basado en Rivero y Gumilla y en el informe `investigacion/reports/Pueblos indígenas de Tame siglo XVII.md` de la carpeta del proyecto. Sin penachos, flautas sagradas ni imágenes de los U'wa; los pueblos siguen vivos (makaguán, hitnü, sikuani).
- Tono: serio, territorial, respetuoso con la memoria local. Sin emojis.
- 6 capítulos: I Quiénes somos · II Tribuna de la Memoria · III Salón de monumentos · IV Línea temporal · V Publicaciones · VI Aporte ciudadano.

## Pendientes conocidos
1. Confirmar con el usuario que ejecutó `supabase/05-libros-nuevos.sql`, `06-whatsapp.sql` y `07-limpiar-saltos.sql` en Supabase (SQL Editor). (03 y 04 ya están aplicados.)
   - Falta el número de WhatsApp de pedidos de «Río Arauca» (autor Eddy Arley Cristiano Medina); mientras tanto usa el de la Corporación.
2. Faltan fotos de lomo de "De Macaguán a Corocito" y "Los jagüeyes" (hoy usan color + texto).
   - «Río Arauca» y «La Mujer de la Luna»: contraportadas PROVISIONALES diseñadas (no son las reales); portada y lomo salen de fotos del usuario. Cambiar cuando haya foto real de la contraportada. «Río Arauca» aún no tiene reseña real.
3. Propuesta: galería pública "Archivo ciudadano" en Cap. VI con aportes aprobados + casilla de consentimiento en el formulario.
4. Propuesta: perfil "Revisor" en el panel que solo aprueba aportes.
