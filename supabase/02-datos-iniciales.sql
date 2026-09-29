-- ==========================================================
--  Datos iniciales (contenido actual del sitio).
--  Ejecutar DESPUÉS de 01-esquema.sql. Se puede ejecutar una sola vez.
--  Las imágenes apuntan a assets/ del repositorio; las nuevas que
--  subas desde /admin quedarán en el almacenamiento de Supabase.
-- ==========================================================

insert into public.ajustes (clave, valor, descripcion) values
  ('hero_texto', 'Misiones, batallas, monumentos y memoria viva: cada capítulo es una parada en el tiempo. Elige tu destino y despega.', 'Inicio · texto bajo el titular'),
  ('nosotros_intro', 'La Corporación Tame, Historia y Cultura, reúne investigación, patrimonio y participación para que la memoria local permanezca accesible y viva.', 'I · Introducción'),
  ('mision', 'Investigar, preservar, proteger y divulgar la historia, el patrimonio y las expresiones culturales de Tame, conectando el conocimiento institucional con la participación de la comunidad.', 'I · Misión'),
  ('vision', 'Ser referente en la conservación de la memoria, la identidad y el patrimonio de Tame, con una ciudadanía que conoce, valora y comparte su historia.', 'I · Visión'),
  ('valores', 'Coherencia, responsabilidad, honestidad, rigor investigativo y transparencia en el manejo administrativo.', 'I · Valores'),
  ('objetivos', 'Desarrollar proyectos de investigación cultural.
Asesorar a gobiernos en proyectos socioculturales.
Organizar conferencias y seminarios sobre el Llano.
Promover la clasificación de archivos históricos.
Fundar una revista de investigación.
Estimular una conciencia ciudadana sobre la historia regional.', 'I · Objetivos (uno por línea)'),
  ('aporte_texto', 'Una fotografía, una carta, un relato de los abuelos. Cada aporte se revisa y cataloga antes de entrar al archivo digital.', 'VII · Texto del aporte ciudadano'),
  ('facebook', 'https://facebook.com/turistame', 'Pie · Enlace de Facebook'),
  ('instagram', 'https://instagram.com/turistame', 'Pie · Enlace de Instagram'),
  ('correo', 'contacto@corporaciontame.org', 'Pie · Correo de contacto'),
  ('ubicacion', 'Tame, Arauca · Colombia', 'Pie · Ubicación')
on conflict (clave) do nothing;

insert into public.columnas (edicion, fecha, categoria, autor, cargo, titulo, entradilla, cuerpo) values
  (null, '2026-09-23T15:00:00-05:00', 'Infraestructura regional', 'Leonel Pérez Bareño', 'Columnista', 'Socializar las propuestas para mejorarlas y lograr su apoyo definitivo', null, 'Esta tarde del miércoles 23 de septiembre del 2026 expondré en el teatro La Vorágine de Villavicencio mis propuestas sobre los desafíos financieros del sistema vial llanero. Allí me referiré a la infraestructura carreteable, fluvial y aérea del territorio llanero.

Mostraré el atraso relativo del Meta con relación a Arauca y Casanare en términos de vías pavimentadas, no obstante sus enormes ingresos de regalías. Aludiré a los diez primeros aeropuertos de la región. Señalaré los problemas de los principales ríos locales. Insistiré en la necesidad de la integración regional orinoquense y, finalmente, plantearé mi propuesta de financiamiento sobre la base de transformar el actual sistema de regalías.

Recibiremos (Meta, Casanare, Arauca) 52 billones de pesos de regalías en los próximos veinte años. Pues bien, dediquemos la mitad, el 50 % de este recurso, al Fondo Vial del Llano. Con tal cantidad (26 billones de pesos) construiríamos la TOTALIDAD de las vías de Arauca, Casanare, Meta y Vichada. Son 15 vías que suman 1.600 km, incluyendo dos puentes sobre el río Meta y el aeropuerto del Piedemonte araucano: ARPA, Aeropuerto Regional del Piedemonte Araucano.

En síntesis, se requieren 4 billones de pesos para Arauca, 6 para Casanare, 7 para Vichada y 9 para Meta. Esto último incluye la solución de los cien puntos críticos de la Autopista Bogotá-Villavicencio y la vía Uribe-Colombia.'),
  (null, '2026-09-21T15:00:00-05:00', 'Desarrollo económico', 'Leonel Pérez Bareño', 'Columnista', 'Aceite de palma rumbo al mar Atlántico', null, 'Un mil cien (1.100) km toma el trayecto Villavicencio-Barranquilla, vía Bogotá, frente a 800 km entre Villavicencio y La Ceiba, puerto en el Lago de Maracaibo, por la Troncal del Llano que pasa por Yopal, Tame y Saravena. Diferencia sustancial. Recuérdese que Meta y Casanare son los grandes productores de aceite de palma de Colombia, con un aporte superior al 70 % del total nacional.

Un trancón fácil de resolver obstaculiza esta ruta de oro para el Piedemonte llanero: el puente internacional en Puerto Contreras sobre el río Arauca, en el área de la isla del Charo. Se trata de un puente muy pequeño, de solo 250 metros, que exige acuerdos binacionales hoy difíciles y mañana muy fáciles, cuando se logre la estabilización democrática de Venezuela.

Conviene prepararnos para esta oportunidad, pues nuestro aceite es bienvenido en Estados Unidos, Europa y Asia, además del Caribe y Centroamérica, y, como todos sabemos, el transporte marítimo es el más barato del mundo. Esta opción requiere la nacionalización del tramo Hato Corozal-Tame, lo cual acarrea un trámite muy sencillo ante el DNP.');

insert into public.monumentos (orden, titulo, lugar, imagen, alt, descripcion) values
  (1, 'Bolívar y Santander', 'Plaza · Tame', 'assets/m-bolivar-santander.jpeg', 'Esculturas de Simón Bolívar y Francisco de Paula Santander sentados frente a frente', 'Recuerda el encuentro de 1819 en Tame entre Simón Bolívar y Francisco de Paula Santander, que unió a las tropas en la campaña libertadora.'),
  (2, 'Busto de Santander', 'Monumento · Tame', 'assets/m-santander.jpeg', 'Busto de Francisco de Paula Santander', 'Homenaje a Francisco de Paula Santander en su faceta de coronel al mando del ejército, frente a la resistencia de los soldados llaneros a ser dirigidos por un militar ajeno a la región.'),
  (3, 'Piedra Esculpida · Ruta Bolívar', 'Parque central', 'assets/m-piedra.jpeg', 'Piedra esculpida de la Ruta Bolívar', 'Monumento de honor junto al parque central, con las fechas talladas en que el General Simón Bolívar pasó por el municipio de Tame.'),
  (4, 'Monumento al Ejército Patriota', 'Memoria pública', 'assets/m-ejercito.jpeg', 'Monumento al Ejército Patriota', 'Simboliza la unión en Tame de las tropas de Bolívar y Santander, que formaron el Ejército Patriota que marcharía hacia la liberación del país.'),
  (5, 'Inocencio Chincá', 'Héroes de la libertad', 'assets/m-chinca.jpeg', 'Monumento a Inocencio Chincá', 'Homenaje al joven lancero indígena tameño que luchó con valentía y dio su vida por la libertad en la Batalla del Pantano de Vargas.'),
  (6, 'Indio Girara', 'Pueblos originarios', 'assets/m-girara.jpeg', 'Monumento al indio Girara', 'Rotonda y placa en memoria de los Giraras, de la familia Arawak, pobladores originarios que dieron origen a Tame.'),
  (7, 'Iglesia Nuestra Señora de la Asunción', 'Arquitectura religiosa', 'assets/m-iglesia.jpeg', 'Iglesia Nuestra Señora de la Asunción de Tame', 'Templo principal del municipio. La parroquia de Nuestra Señora de Tame fue erigida el 26 de abril de 1661.'),
  (8, 'Mujer Tameña', 'Identidad', 'assets/m-mujer.jpg', 'Monumento a la Mujer Tameña', 'Celebra la fuerza, el trabajo y el papel fundamental de las mujeres tameñas en la construcción de la vida comunitaria.'),
  (9, 'Monumento a los Caballos', 'Cultura llanera', 'assets/m-caballos.jpg', 'Monumento a los caballos', 'Evoca la relación entre el caballo, el paisaje llanero y las historias de movilidad, trabajo y libertad que definen a Tame.');

insert into public.hitos (orden, anio, etapa, titulo, texto, imagen, encuadre) values
  (1, '1625–1628', 'Misiones jesuitas', 'Primera entrada jesuita', 'Primeras entradas de la Compañía de Jesús al territorio de los Giraras, antecedente de la fundación histórica de Tame.', 'assets/p-3.jpeg', 'center 60%'),
  (2, '1629', 'Fundación', 'Fundación de La Palma de Espinosa', 'El 18 de febrero se funda la ciudad de La Palma de Espinosa. Entre febrero y junio se realiza la reducción del pueblo de indios de Tame.', 'assets/p-4.jpg', 'center'),
  (3, '1637', 'Fundación', 'Destrucción de la ciudad', 'La ciudad es destruida y muere su fundador.', 'assets/p-2.jpeg', 'center 70%'),
  (4, '1637–1647', 'Pueblos originarios', 'Persecución y dispersión de los Giraras', 'D. Martín de Mendoza persigue y dispersa a los Giraras, que se asientan en las orillas del río Arauca asistidos por Párraga.', 'assets/m-girara.jpeg', 'center'),
  (5, '1647', 'Pueblos originarios', 'Reasentamiento de los Giraras', 'Los Giraras regresan al primitivo asentamiento de la reducción de Tame.', 'assets/p-rio.jpeg', 'center'),
  (6, '1650', 'Organización colonial', 'Curato de Tame y San Miguel de Punapuna', 'Se establece el curato de Tame con el clérigo Damián Ugarte y se funda San Miguel de Punapuna, entre Tame y Casanare. El gobernador Alonso Sánchez Chamorro, de Antequera, interviene en la Real Audiencia.', 'assets/p-3.jpeg', 'center 60%'),
  (7, '1657', 'Organización colonial', 'Hernando de Ortiz, teniente de corregidor', 'Hernando de Ortiz asume como teniente de corregidor de Tame.', 'assets/p-4.jpg', 'center'),
  (8, '1659', 'Misiones jesuitas', 'Segunda entrada de la Compañía de Jesús', 'Los jesuitas regresan al territorio e inician una nueva etapa misional.', 'assets/p-2.jpeg', 'center 70%'),
  (9, '1661', 'Organización colonial', 'Erección de la Parroquia Nuestra Señora de Tame', 'El 26 de abril de 1661 se erige la parroquia de Nuestra Señora de Tame.', 'assets/m-iglesia.jpeg', 'center'),
  (10, '1661–1663', 'Pueblos originarios', 'Nuevas reducciones indígenas', 'Reducción de Tunebos en Pilar de Patute, Airicos en San Javier de Macaguane y Achaguas en San Salvador del Puerto.', 'assets/p-rio.jpeg', 'center'),
  (11, '1662', 'Misiones jesuitas', 'Creación de la Hacienda Caribabare', 'Se crea la Hacienda Caribabare.', 'assets/p-4.jpg', 'center'),
  (12, '1715', 'Pueblos originarios', 'Reducción de los Betoyes', 'Reducción de indios Betoyes en San Ignacio, a orillas del río Tame.', 'assets/p-3.jpeg', 'center 60%'),
  (13, '1767', 'Misiones jesuitas', 'Expulsión de los jesuitas', 'La expulsión de la Compañía de Jesús transforma el curso de las misiones y de los asentamientos de la región.', 'assets/p-2.jpeg', 'center 70%'),
  (14, '1819', 'Independencia', 'Tame, Cuna de la Libertad', 'Formación de la República de Colombia. El encuentro de Bolívar y Santander en Tame, junto con la entrega de tropas de Fray Ignacio Mariño, marca la campaña libertadora.', 'assets/m-bolivar-santander.jpeg', 'center');

insert into public.publicaciones (orden, volumen, titulo, subtitulo, tipo, texto_lomo, portada, contraportada, color_lomo, color_tinta_lomo, grosor, autores, descripcion) values
  (1, 'Vol. I', 'Tame, 400 años', 'Demografía histórica, sociedad y familia', 'Demografía histórica', 'TAME, 400 AÑOS', 'assets/libro-tame400.jpeg', 'assets/libro-tame400-back.jpeg', '#d9d8d1', '#1f7a45', 36, 'Luis Milciades Pérez González, Julio César Lamus Gélvez y Juan Jacobo Carrizales Casas.', 'La serie «Tame, 400 años» corresponde a una línea de investigación que realiza un grupo de profesionales de la Corporación Tame, Historia y Cultura. Los hallazgos y resultados de dichos estudios, sobre los acontecimientos sociales, políticos, económicos, culturales y ambientales ocurridos en el actual territorio de Tame, se publican ad portas de conmemorar su cuatricentenaria existencia.

En este libro, Tame, 400 años. Demografía histórica, sociedad y familia, sus autores, miembros de la Corporación Tame, Historia y Cultura, plantean las transformaciones que desde el siglo XVII se fueron dando en este territorio: su poblamiento como pueblo de indios, su demografía histórica y los apellidos que había en los orígenes de Tame (siglos XVII–XVIII).

Asimismo, abordan su desarrollo y sus conflictos sociales y económicos entre 1900 y 1950: ¿Quiénes somos?, con algunos «apuntes de aproximación a la génesis de nuestro pueblo».'),
  (2, null, 'De Macaguán a Corocito', 'Historia jesuita en los Llanos de Tame, 1661–2026', 'Historia misional', 'DE MACAGUÁN A COROCITO', 'assets/libro-macaguan.jpeg', 'assets/libro-macaguan-back.jpeg', '#4b1e2b', '#e8c66f', 28, 'Julio César Lamus Gélvez y Luis Milcíades Pérez González.', 'Este libro reúne, bajo un solo marco narrativo, más de veinte años de investigación sobre la historia del territorio de Macaguán-Corocito, en el municipio de Tame, departamento de Arauca.

Sus autores, Julio César Lamus Gélvez y Luis Milciades Pérez González, son historiadores regionales con vínculos familiares y biográficos directos con el territorio que describen, lo que confiere a su escritura una dimensión de testimonio que complementa —y a su vez trasciende— el rigor documental.

La obra fue concebida como un libro de historia regional, con una narración que aspira a ser leída por cualquier colombiano interesado en entender de dónde vienen los pueblos del piedemonte llanero araucano, por qué desaparecen y cómo resisten. Esa vocación de legibilidad amplia no sacrifica el rigor: cada afirmación relevante está respaldada por fuentes primarias o secundarias debidamente citadas.

La estructura del libro sigue un orden cronológico que parte del tiempo prehispánico y llega hasta el presente, pero no es una historia lineal en el sentido convencional: los autores vuelven sobre los mismos hechos desde ángulos distintos, acumulando capas de comprensión que revelan, al final, la complejidad de un territorio que ha sido al mismo tiempo víctima y protagonista de la historia colombiana.');
