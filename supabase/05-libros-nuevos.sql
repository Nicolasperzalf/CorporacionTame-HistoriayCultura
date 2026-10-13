-- 05 · Dos libros nuevos: «Río Arauca» y «La Mujer de la Luna»
-- Ejecutar una vez en Supabase → SQL Editor. Si ya existen, primero los borra para no duplicarlos.
delete from public.publicaciones where titulo in ('Río Arauca', 'La Mujer de la Luna');
insert into public.publicaciones (orden, volumen, titulo, subtitulo, tipo, texto_lomo, portada, contraportada, lomo, color_lomo, color_tinta_lomo, grosor, autores, descripcion) values
(6, null, 'Río Arauca', 'Ecos de un legado ancestral', 'Ríos e identidad', 'RÍO ARAUCA', 'assets/libro-rioarauca.jpeg', 'assets/libro-rioarauca-back.jpeg', 'assets/lomo-rioarauca.jpeg', '#24402a', '#f3efe7', 22, 'Eddy Arley Cristiano Medina.', 'Nuestra tierra también cuenta historias.

Ríos, historias e identidad.

Ya disponible en libro físico.'),
(7, null, 'La Mujer de la Luna', 'Novela', 'Novela · Leyenda llanera', 'LA MUJER DE LA LUNA', 'assets/libro-mujerluna.jpeg', 'assets/libro-mujerluna-back.jpeg', 'assets/lomo-mujerluna.jpeg', '#f4f3f0', '#282828', 24, 'Reinaldo Díaz Sarmiento.', '«La Mujer de la Luna» es una fascinante historia que recopila la tradicional narrativa oral propia de los inicios del siglo XIX y de la cual surge esta leyenda, cuando al compás de la soledad y bajo la estela de la luna llena se tejían hermosos cuentos que unían a las familias.

Es quizás el primer secuestro que se da en Colombia, del cual es víctima una hermosa dama que, por los vaivenes de lo que se llama «ley de la compensación», tuvo que cargar con las malas acciones de su progenitor. No es un cautiverio extorsivo, mucho menos por venganzas personales: es simplemente una situación de esas en las que solo encuentran una razón lógica quienes reflexionan sobre su pasado.

Los giraras, una tribu indómita, se alzan con el trofeo más valioso para toda la horda y agradecen a la luna llena haberles enviado su propia reina, a la que idolatran y cuidan con más ahínco que a su propia prole.');
