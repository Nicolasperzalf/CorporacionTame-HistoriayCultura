-- 03 · Actualización de publicaciones (lomos con imagen + 3 libros nuevos)
-- Ejecutar una vez en Supabase → SQL Editor. Reemplaza la lista de libros por la versión actual.
alter table public.publicaciones add column if not exists lomo text;
delete from public.publicaciones;
insert into public.publicaciones (orden, volumen, titulo, subtitulo, tipo, texto_lomo, portada, contraportada, lomo, color_lomo, color_tinta_lomo, grosor, autores, descripcion) values
(1, null, 'Tame, 400 años', 'Demografía histórica, sociedad y familia', 'Demografía histórica', 'TAME, 400 AÑOS', 'assets/libro-tame400.jpeg', 'assets/libro-tame400-back.jpeg', 'assets/lomo-tame400.jpeg', '#cfcfcb', '#1c1c1c', 30, 'Luis Milciades Pérez González, Julio César Lamus Gélvez y Juan Jacobo Carrizales Casas.', 'La serie «Tame, 400 años» corresponde a una línea de investigación que realiza un grupo de profesionales de la Corporación Tame, Historia y Cultura. Los hallazgos y resultados de dichos estudios, sobre los acontecimientos sociales, políticos, económicos, culturales y ambientales ocurridos en el actual territorio de Tame, se publican ad portas de conmemorar su cuatricentenaria existencia.\n\nEn este libro, Tame, 400 años. Demografía histórica, sociedad y familia, sus autores, miembros de la Corporación Tame, Historia y Cultura, plantean las transformaciones que desde el siglo XVII se fueron dando en este territorio: su poblamiento como pueblo de indios, su demografía histórica y los apellidos que había en los orígenes de Tame (siglos XVII–XVIII).\n\nAsimismo, abordan su desarrollo y sus conflictos sociales y económicos entre 1900 y 1950: ¿Quiénes somos?, con algunos «apuntes de aproximación a la génesis de nuestro pueblo».'),
(2, null, 'De Macaguán a Corocito', 'Historia jesuita en los Llanos de Tame, 1661–2026', 'Historia misional', 'DE MACAGUÁN A COROCITO', 'assets/libro-macaguan.jpeg', 'assets/libro-macaguan-back.jpeg', null, '#4b1e2b', '#e8c66f', 20, 'Julio César Lamus Gélvez y Luis Milcíades Pérez González.', 'Este libro reúne, bajo un solo marco narrativo, más de veinte años de investigación sobre la historia del territorio de Macaguán-Corocito, en el municipio de Tame, departamento de Arauca.\n\nSus autores, Julio César Lamus Gélvez y Luis Milciades Pérez González, son historiadores regionales con vínculos familiares y biográficos directos con el territorio que describen, lo que confiere a su escritura una dimensión de testimonio que complementa —y a su vez trasciende— el rigor documental.\n\nLa obra fue concebida como un libro de historia regional, con una narración que aspira a ser leída por cualquier colombiano interesado en entender de dónde vienen los pueblos del piedemonte llanero araucano, por qué desaparecen y cómo resisten. Esa vocación de legibilidad amplia no sacrifica el rigor: cada afirmación relevante está respaldada por fuentes primarias o secundarias debidamente citadas.\n\nLa estructura del libro sigue un orden cronológico que parte del tiempo prehispánico y llega hasta el presente, pero no es una historia lineal en el sentido convencional: los autores vuelven sobre los mismos hechos desde ángulos distintos, acumulando capas de comprensión que revelan, al final, la complejidad de un territorio que ha sido al mismo tiempo víctima y protagonista de la historia colombiana.'),
(3, 'Vol. I', 'Los orígenes de Tame', 'Desde la ciudad colonial «La Palma de Espinosa» (1629) al Pueblo de Indios y Parroquia de Nuestra Señora de Tame (1661)', 'Historia colonial', 'LOS ORÍGENES DE TAME', 'assets/libro-origenes.jpeg', 'assets/libro-origenes-back.jpeg', 'assets/lomo-origenes.jpeg', '#6b2a91', '#f4d83a', 22, 'Luis Milciades Pérez González, Julio César Lamus Gélvez y Giovanni Zorro López.', '«Los orígenes de Tame» narra el fascinante proceso de conquista y fundación de una de las primeras ciudades hispánicas en el piedemonte llanero, La Palma de Espinosa, establecida en 1629. A través de un riguroso análisis histórico, esta obra explora la evolución de esta región, desde su transformación en pueblo de indios hasta la erección de la Parroquia Nuestra Señora de Tame en 1661, revelando los desafíos, las dinámicas culturales y los aportes de sus habitantes en la construcción de su identidad.

Esta obra es el resultado del trabajo académico y cultural realizado por los investigadores Julio César Lamus Gélvez, Luis Milcíades Pérez González y Giovanni Zorro López, miembros de la Corporación Tame, Historia y Cultura, dentro de su línea de investigación TAME, 400 AÑOS. Con un enfoque interdisciplinario, esta investigación conmemora y preserva la memoria histórica de la región, ofreciendo una valiosa contribución al entendimiento de sus raíces y de su papel en el contexto histórico de Colombia.'),
(4, null, 'La ciudad La Palma de Espinosa', 'Capitulación del capitán Alonso Pérez de Guzmán, pleitos por la conquista de territorios, reducción de indios y orígenes de Tame', 'Historia de la conquista', 'LA CIUDAD LA PALMA DE ESPINOSA', 'assets/libro-palma.jpeg', 'assets/libro-palma-back.jpeg', 'assets/lomo-palma.jpeg', '#2f8a2c', '#ffffff', 14, 'Julio César Lamus Gélvez.', 'El examen de los orígenes del poblamiento y la fundación de Tame debe partir de la de Palma de Espinosa, una ciudad fundada por el capitán Alonso Pérez de Guzmán. Efectivamente, este firmó con el presidente Juan de Borja el 28 de enero de 1628 una capitulación para descubrir y poblar una parte de los llanos de la provincia de Casanare. Vino entonces al mundo político la ciudad titulada «La Palma de Espinosa», el 18 de febrero de 1629, y además ayudó a reducir, dos años después, indios Tunebos y Giraras en un asentamiento llamado Tame.

Tame lo ayudaría a poblar después Pérez de Guzmán con indios Giraras, Tunebos o Tames, dos años después del incendio de Palmas de Espinosa provocado por los Giraras, estableciendo 18 caneyes o casas grandes y juntando 450 indígenas a media legua de la anterior fundación.

Tame derivó su nombre del cacique Tambria, un cacique Tunebo que habitó la parte alta del río Tambria o Tame, y tanto encomenderos españoles como jesuitas en desuso convirtieron el vocablo en Tame, que en lengua ancestral significa «hombre de tierra alta, cordillera alta o agua fría».

«¡Todos somos! Y tendremos un nuevo “compromiso en serio”, lo que en democracia es apoyar un proyecto regional importante: la prosperidad regional para los araucanos». — Nixon Bareño Martínez'),
(5, null, 'Los jagüeyes', 'Una historia de patrimonio y nostalgias', 'Patrimonio y memoria', 'LOS JAGÜEYES', 'assets/libro-jagueyes.jpeg', 'assets/libro-jagueyes-back.jpeg', null, '#f1ece6', '#8a1f24', 16, 'Julio César Lamus Gélvez.', 'Desde El Encanto al Crismao
había una sabana larga
con un viento atravesao
que le daba fresco al agua.
— JCLG / 24

«Surtidores de agua fresca
Gualabao y la Itibana,
cañitos de ensoñación
y en sus aguas cristalinas
canta la musa llanera
los versos de esta canción».
— Alain Ríos Montilla

Los jagüeyes de mi pueblo
eran la fuente bendita
como si allá desde el cielo
nos dieran agua clarita.
— Juan Jacobo Carrizales C.

Se bañaba en El Encanto
pero cuando era bien niña
Bolívar la fue falseando.
Aniceta Cotoarruma.
— Gustavo Macualo Jácome');
