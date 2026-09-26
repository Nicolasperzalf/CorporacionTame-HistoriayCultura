# Corporación Tame, Historia y Cultura — sitio web

Sitio estático (GitHub Pages) con base de datos y panel de administración (Supabase).
El contenido se edita desde **/admin**, así que no hace falta tocar código para publicar.

---

## 1. Estructura de carpetas

```
sitio/
├── index.html              Página pública (estructura general)
├── css/
│   └── styles.css          Todos los estilos (colores y tipografías arriba, en :root)
├── js/
│   ├── config.js           ← AQUÍ se pegan la URL y la clave de Supabase
│   ├── app.js              Capítulos, navegación y efectos
│   ├── datos.js            Lee la base de datos y envía los aportes
│   ├── escena3d.js         Fondo espacial y moneda 3D con el logo
│   └── contenido-local.js  Copia de respaldo del contenido (si la base no responde)
├── admin/
│   ├── index.html          Panel de administración (usuario y contraseña)
│   ├── admin.js            Lógica del panel (qué campos tiene cada sección)
│   └── admin.css
├── assets/
│   ├── img/                Logo, monumentos, línea temporal, portadas de libros
│   └── audio/              himno-tame.mp3 (pendiente de subir)
└── supabase/
    ├── 01-esquema.sql      Tablas, permisos y almacenamiento
    └── 02-datos-iniciales.sql  Contenido actual del sitio
```

### Dónde vive cada contenido

| Capítulo | Tabla en Supabase | Sección del panel |
|---|---|---|
| Inicio · texto de portada | `ajustes` (hero_texto) | Textos y contacto |
| I · Quiénes somos | `ajustes` (misión, visión, valores, objetivos) | Textos y contacto |
| II · Tribuna de la Memoria | `columnas` | Tribuna de la Memoria |
| III · Salón de monumentos | `monumentos` | Salón de monumentos |
| IV · Línea temporal | `hitos` | Línea temporal |
| V · Símbolos | `bandera`, `himno` | Bandera · Himno de Tame |
| VI · Publicaciones | `publicaciones` | Publicaciones |
| VII · Aporte ciudadano | `aportes` (lo que envía la gente) | Aportes ciudadanos |
| Pie · redes y correo | `ajustes` | Textos y contacto |

---

## 2. Crear la base de datos (una sola vez, ~10 min)

1. Crea una cuenta gratuita en **https://supabase.com** → **New project** (región: *South America (São Paulo)*).
2. Menú **SQL Editor** → **New query** → pega el contenido de `supabase/01-esquema.sql`.
   - En la última línea cambia `CAMBIA-ESTE-CORREO@ejemplo.com` por tu correo. → **Run**.
3. Nueva consulta → pega `supabase/02-datos-iniciales.sql` → **Run**.
4. **Authentication → Users → Add user → Create new user**: tu correo (el mismo del paso 2) y una contraseña segura. Marca *Auto confirm user*.
5. **Authentication → Sign In / Providers → Email**: desactiva **Allow new users to sign up** (así nadie más puede crear cuentas).
6. **Project Settings → API**: copia **Project URL** y la clave **anon public** en `js/config.js`.
7. **Authentication → URL Configuration → Site URL**: pon la dirección final del sitio (paso 3), para que funcione "¿Olvidaste tu contraseña?".

> Para agregar otro administrador: créale un usuario (paso 4) y en SQL Editor ejecuta
> `insert into administradores (email) values ('otro@correo.com');`

---

## 3. Publicar en GitHub Pages

1. Crea un repositorio en **https://github.com/new** (ej. `corporacion-tame`, público).
2. **Add file → Upload files** → arrastra **todo el contenido de la carpeta `sitio/`** (no la carpeta, su contenido: `index.html` debe quedar en la raíz del repositorio) → **Commit changes**.
3. **Settings → Pages → Build and deployment**: *Deploy from a branch* → rama `main`, carpeta `/ (root)` → **Save**.
4. En 1–2 minutos el sitio queda en `https://TU-USUARIO.github.io/corporacion-tame/`
   y el panel en `https://TU-USUARIO.github.io/corporacion-tame/admin/`.
5. (Opcional) Dominio propio: **Settings → Pages → Custom domain** (ej. `corporaciontame.org`).

---

## 4. Uso diario (sin tocar código)

Entra a **/admin** con tu correo y contraseña.

- **Publicar una columna**: Tribuna de la Memoria → *+ Nueva columna* → llena los campos → Guardar. Aparece de primera si su fecha es la más reciente.
- **Agregar un monumento, hito o libro**: botón *+ Nuevo* en su sección. Las fotos se suben desde el mismo formulario.
- **Ocultar algo sin borrarlo**: desmarca *Visible en el sitio*.
- **Cambiar el orden**: edita el campo *Orden* (1, 2, 3…).
- **Cambiar textos, redes o correo**: *Textos y contacto*.
- **Revisar aportes**: *Aportes ciudadanos* muestra los pendientes con un contador. Abre el archivo adjunto, escribe una nota interna y márcalo como *Aprobado* o *Rechazado*.

Los cambios se ven al recargar el sitio; no hay que volver a subir archivos a GitHub.

### Cambios que sí se hacen en GitHub
- Colores, tipografías o diseño → `css/styles.css`.
- Nombres de los capítulos o su orden → `PAGES` en `js/app.js`.
- Audio del himno → sube `himno-tame.mp3` a `assets/audio/` (o pega un enlace en *Textos y contacto → audio del himno*).

---

## 5. Probar en tu computador

El sitio usa módulos de JavaScript, así que no abre con doble clic. Desde la carpeta `sitio/`:

```
python -m http.server 8000
```
y abre `http://localhost:8000`.

---

## 6. Seguridad

- La clave **anon** en `config.js` es pública por diseño; lo que protege los datos son las reglas de `01-esquema.sql`: el público solo **lee** contenido publicado y **envía** aportes; solo los correos de la tabla `administradores` pueden editar o ver los aportes.
- Nunca pegues la clave **service_role** en ningún archivo del repositorio.
- Los archivos que envía la gente quedan en un almacenamiento **privado** (`aportes`); solo se ven desde el panel.
