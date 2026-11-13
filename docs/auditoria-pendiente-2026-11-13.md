# Auditoría pendiente de Caribdis

**Fecha:** 13 de noviembre de 2026
**Base:** `main` tras `3e50636` (PDF de 200 páginas).
**Estado:** bloqueantes de enlaces y reglas críticas corregidos. Lo que sigue es lo que queda antes de una impresión definitiva.

---

## 1. Prioridad alta

| # | Dónde | Problema | Arreglo propuesto |
|---|---|---|---|
| A1 | `80-finales.md` e918 / e910 | e918 destruye Caribdis y ordena ignorar Quilla/Cicatriz/Santuario, pero e910 sigue leyendo «(Nombre) se queda en Caribdis». | Epílogo propio para e918 o enumerar todas las líneas que se omiten, incluida «se queda en Caribdis». |
| A2 | `80-finales.md` e920 / r196 | El relevo con un compañero de Lealtad 3 no tiene hoja: faltan Heridas, Canto, Reputación y Lealtad. | Hoja mínima del relevo (Heridas 2, Canto 0, Lealtad 3, sin contador) o eliminar la continuación. |
| A3 | `11-comunes.md` e039.1, e050.4, e057.1 | Combates de Fallo/azar sin «Si ganas»: no queda claro el botín, la carne o el Motor. | Añadir «Si ganas: …» en cada uno. |
| A4 | `01-reglas.md` r212 | `ALGUIEN_LO_LOGRO` promete +1 Reputación en la primera visita a cada asentamiento y nadie lo comprueba; `TE_RECUERDAS` no tiene efecto. | Comprobación en e400/e410/e420/e430 o nota en r160; dar efecto a `TE_RECUERDAS` o quitarla. |
| A5 | `01-reglas.md` r105 | Nueve Marcas de Origen (`ACTRIZ`, `ARMA`, `CARRONERO`, `COLONO`, `DESERTOR`, `EXILIADO`, `MEDICA`, `SIN_REGISTRO`, `TEMERARIO`) solo existen en la tabla. | Usarlas en al menos una entrada o declarar en r105 que son apuntes de ficción. |
| A6 | `24-polo.md` e286 | La estación del Polo sigue dando descanso, pantallas, 5 Chatarra y batería después de «La estación muere». | Anotar `ESTACION_MUERTA` y cerrar las opciones 1–3 cuando esté destruida. |
| A7 | `27-torres.md` e350 / `55-facciones.md` e644 | Matar a La Voz no deja estado; e426/e644 siguen haciéndola hablar y descender. | Anotar `LA_VOZ_MUERTA` y añadir ramas en e426/e644/e645. |

---

## 2. Reglas base (M1–M30)

Resueltos: M1, M5, M8, M9, M11, M14, M15, M16, M18, M21, M22, M25.

| # | Dónde | Problema | Arreglo |
|---|---|---|---|
| M2 | r133 / r155 | No se aclara si dormir en un vehículo o refugio evita la tirada nocturna. | «En un refugio (r155) no tiras la nocturna» o «un vehículo no cuenta». |
| M3 | r135 | Ocultarte no dice si cuenta como descanso. | «Ocultarte no recupera Heridas ni Temple». |
| M4 | r136 | Tabla de Mente: «1 Energía (r104)» sin «solo fuera de la Cicatriz». | Añadir «solo fuera». |
| M6 | r142 / r198 | «Tu daño» vs «su daño» en el ejemplo del Enjambre. | Unificar a «tu daño». |
| M7 | r143 | Un compañero muere y no se suma +1 CULPA ni se tacha la ficha. | «Si eres el Piloto, +1 CULPA; tacha su ficha». |
| M10 | r161 | «La compra te cuesta 1 menos» no distingue por objeto o por total. | «1 menos por objeto» o «1 menos en el total». |
| M12 | r163 | El sanador no cura `ESPORAS` ni `DEDOS_HELADOS`, pero e052/e569 lo usan. | Añadir «También borra ESPORAS o DEDOS_HELADOS». |
| M13 | r171 | «También el 9/10» no dice si sustituyen Equipo/Reliquia o se suman. | «El 9 cuenta como Reliquia en lugar de Equipo; el 10 como Sala especial en lugar de Reliquia». |
| M17 | r190 | Los eventos de lealtad son ★, pero el ★ está solo en una opción. | Poner ★ en la cabecera del evento. |
| M19 | r315 | Pista «región actual · este evento» como texto literal. | «Escribe la región y el evento reales». |
| M23 | r201 | Llevar 10 piezas: no dice qué pasa con el exceso. | «Si ganas más, descarta el exceso». |
| M24 | r203 | «Hasta dos planos pequeños» pero la prueba va en singular. | «Dos pruebas, una por plano». |
| M26 | r206 | Desmontar armas/protecciones da 2 piezas sin tabla por receta; una lanza de luz fría no da Luz fría. | Tabla de desmontaje por receta y redondeo por tipo. |
| M27 | r210 | Leyenda empieza con Alerta 1 (r106) pero «nunca baja de 2». | «Leyenda empieza con Alerta 2» o aclarar que se aplica tras la primera subida. |
| M28 | r211 | «Un tripulante a tu elección» puede duplicar al que ya lleva el Piloto. | «Otro distinto del que ya llevas». |
| M29 | r212 | Ver A4. | — |
| M30 | r213 | «Coro en procesión» no dice qué pasa si ninguno de los dos encuentros tiene [Cantor]. | «Si ninguno, usa el primero». |

---

## 3. Prólogo y eventos comunes (M31–M52)

Resueltos/parciales: M51 resuelto; M44 parcial. Quedan:

| # | Dónde | Problema | Arreglo |
|---|---|---|---|
| M31 | e005 | «Sube la Alerta a 2» no hace nada si ya está en 2. | «Sube 1 (máximo 2); si ya estaba, Reloj −1». |
| M32 | e008 | El Fallo de la prueba ♫ no cuesta nada. | +1 Canto o pérdida de la acción. |
| M33 | e032 | «Pieza de motor» no existe como objeto ni pieza. | Definir Pista o «pieza del Motor». |
| M34 | e036 | La regla de `DEUDAS` va después de las opciones y anula lo elegido. | Mover al inicio y condicionar las opciones. |
| M35 | e038 | 1d6 sin tabla; el Fallo no cubre «ya están todos». | Fijar tabla y rama vacía. |
| M36 | e044 | «+2 Chatarra en cristal fino» no aclara Chatarra o Cristal. | «+2 Cristal». |
| M37 | e045 | «Menos de 6 tripulantes» ignora plazas y pasajeros. | «Si te queda una plaza en e900». |
| M38 | e049 | Pista que no se borra + +3 Raciones = comida renovable. | Limitar a una vez o borrar la Pista. |
| M39 | e051 | «Protocolo copiado» no existe en las reglas. | Definirlo o quitarlo. |
| M40 | e052 | Sanador/`ESPORAS` (ver M12). | — |
| M41 | e053 | «La región de un tripulante» no dice cuál ni deja Marca. | Elegir uno o definir la Marca. |
| M42 | e054 | Prueba sin Fallo y botín en la misma frase. | Separar Éxito/Fallo y condicionar el botín. |
| M43 | e056 | «Sistema pesado sin penalización» no deja Marca ni alcance. | Anotar `DRON_DE_CARGA` y definir si permite dos pesados. |
| M44 | e058 | La opción 1 vuelve a dar la Pista: se puede repetir +3 Raciones y descanso gratis. | «Una vez por refugio» o no reemitir la Pista. |
| M45 | e059 | `DORMIDO_ATADO` no se consulta en r182. | Consultar en r182 o resolverlo en e059. |
| M46 | e061 | El saqueo promete una reacción de la Peregrina que e062/e063 no tienen. | Anotar Marca y consultarla, o quitar la promesa. |
| M47 | e064 | «1 Ración o 1 Chatarra: come las dos cosas» se contradice. | «1 Ración **y** 1 Chatarra» o «o». |
| M48 | e064 | «Si usas el taller, r201»: r201 es Piezas; el cable da +1 Chatarra, no +1 Cobre. | Corregir referencia y unidad. |
| M49 | e070 | Salvar a la nieta con la opción 2 no da `DEUDA_DE_LOS_MIRASOLES`; e071 no la reconoce. | Dar la Marca o añadir condición. |
| M50 | e071 | El espejo de la matriarca no tiene efecto. | Convertirlo en objeto o quitarlo. |
| M52 | e069 | El trepador regalado no repite «no puede entrar en la Ciudad Enterrada». | Añadir el límite. |

---

## 4. Regiones (M53–M99)

Resueltos: M53, M55, M56, M60, M61, M62, M65, M69. Parciales: M54, M63. Quedan:

| # | Dónde | Problema | Arreglo |
|---|---|---|---|
| M57 | e225 | Opción 4 sin Fallo; si ya tienes Combustible no da nada. | Añadir Fallo y «si ya lo tienes, +3 Chatarra». |
| M58 | e224 | La pieza de la grúa no sirve si ya tienes Motor y Combustible. | +3 Chatarra o elegir otra pieza. |
| M59 | e264 | Leer el nombre de la nave solo premia al Nativo; sin Fallo. | Fragmento/Pista para todos o Fallo. |
| M63 | e250 | Sigue a ⌛ 0 pero consume la acción. | Cabecera ⌛ día. |
| M64 | e261 | Vencer a los Jardineros no da botín y anota `QUEMASTE_EL_JARDIN`. | Botín normal + Marca. |
| M66 | e202 | Baja 1 calidad sin suelo para Precaria. | «Si es Precaria, se pierde». |
| M67 | e246 | Remite a e606 sin abrir la cápsula. | «La abrís». |
| M68 | e248 | Fallo de sabotaje: no dice si al ganar te llevas el bidón. | «Si ganas, lo coges». |
| M70 | e282 | Vuelve a la tabla con ⌛ 0 y sin límite; «esta tabla» no es una tabla. | «e280, columna 1, una vez» o ⌛ +1. |
| M71 | e286 | Estación destruible y repetible. | `ESTACION_MUERTA` (ver A6). |
| M72 | e286 / r155 | El refugio del Polo no coincide con r155. | Remitir a r155 + `ESTACION_MUERTA`. |
| M73 | e330 | El fragmento se gana antes de elegir; la opción 1 solo cuesta +1 Canto. | Mover el fragmento a la opción 1. |
| M74 | e284 | +1 MEMORIA a cualquiera. | «Si eres la Mente, además +1 MEMORIA». |
| M75 | e326 | Identificación gratuita de la fila 12–13 sin tirada ni consumo. | Exigir tirada o consumir la reliquia. |
| M76 | e347 | «Pulso del Canto» ambiguo; tercera `TORRE_ROTA` solo se comprueba aquí. | Citar r131.4 y contar en e342. |
| M77 | e350 | La Voz no deja estado. | `LA_VOZ_MUERTA` (ver A7). |
| M78 | e309 | `SABES_DE_LAS_TORRETAS` se gana después de las torretas y no se usa. | Dar Ventaja inmediata o usarla en r171. |
| M79 | e327 | −2 Reputación «mientras lo lleves» no tiene fin registrable. | Aplicar al reclutar/devolver. |
| M80 | e347 | Opción 2 sin Fallo. | Añadir Fallo. |
| M81 | e341 | Desventaja definida como «+1 al dado». | «3d6, los 2 más bajos». |
| M82 | e284 | «No ve el calor» contra la Mente de metal. | Reescribir el sentido. |
| M83 | e347 / e628 | Tacha a Lio y luego se recupera. | `LIO_EN_EL_CORO` (ya aplicado parcialmente). |
| M84 | e281 | La ofrenda no cuesta nada y `OFRENDA_AL_POZO` no se lee. | Perder el objeto y usar/quitar la Marca. |
| M85 | e284 | `BESTIA_DE_HIELO` no está en la regla de frío. | Añadirla a los refugios. |
| M86 | e286 | +1 calidad sin tope. | «Máximo Excelente». |
| M87 | e285 | ◉/⌛ sin efecto declarado. | Explicitar. |
| M88 | e303 | «Si la tuya no está conseguida» sin antecedente ni Fallo. | «Si no tienes Navegación» + Fallo. |
| M89 | e323 | «Dos FRAGMENTO_ a elegir entre dos». | «Gana los dos» o «elige uno». |
| M90 | e350 | El tercer fragmento salta a e840 sin la regla de Amara. | «Con Amara, primero e611». |
| M91 | e285 | Doble «si no» y salto a e813 sin entrar. | Reescribir. |
| M92 | e349 | Baja calidad sin suelo. | Mínimo Precaria. |
| M93 | e308 | «3 Chatarra» sin verbo. | «Ganas 3 Chatarra». |
| M94 | e283 | `DESGUACE_HELADO` sin reglas de acompañante. | Definir límite/Raciones. |
| M95 | e311 | Fallo sin consecuencia mecánica. | −1 Rep o cerrar intento. |
| M96 | e322 | «Amara: automático» contradice r185 (Ventaja). | «Amara: Ventaja». |
| M97 | e288 | Doble ★ por el mismo descubrimiento. | Quitar uno. |
| M98 | e343 | «1 de Canto» y orden con Canto 6. | «+1 Canto» y aclarar orden. |
| M99 | e323 | «O un manual de navegación» sin elección. | «Elige: …». |

---

## 5. Asentamientos, tripulación, catálogo y finales (M100–M168)

Resueltos: M100, M102–M104, M108–M112, M115–M118, M121, M122, M124, M127, M131, M132, M138, M142–M145, M147, M150, M152–M154, M158–M161, M164.

| # | Dónde | Problema | Arreglo |
|---|---|---|---|
| M119 | e507 | Sin rama de Fallo y dice «conseguida». | Añadir Fallo y «instalada». |
| M120 | e511 | Sin rama si no tienes `PARTITURA_INCOMPLETA`. | Añadir rama. |
| M123 | e563/e569/e414 | Falta «(pesado)» en varios resultados. | Añadirlo. |
| M125 | e569 | Condición añadida, pero no dice qué pasa si no la cumples. | Cerrar la opción. |
| M129 | e617 | El premio solo existe en la Cicatriz. | Diferir o permitir guardarlo. |
| M130 | e618 | «Usando su atributo» es ambiguo. | Fijar atributo. |
| M134 | e719 | Defecto con «sin efecto en el juego salvo…». | Dar coste real. |
| M135 | e720 | Ventaja al Hablar con [Bestia] sin la condición de r141. | Ya parcial: revisar texto final. |
| M136 | e748 | Instala un Motor sin procedimiento de r181. | Definir instalación. |
| M137 | e749 | Promete una respuesta y e840 da un Secreto aleatorio. | Elegir verdad. |
| M139 | e711 | Ventaja contra Noche helada, que no tiene tirada. | Cambiar efecto. |
| M140 | e802 | La Pista a e288 pierde la tirada de 1d6. | Añadir rama. |
| M141 | e803/e807 | Precaria fija frente a tirada 1d6. | Condicionar. |
| M146 | e823 | La revelación común se lee también con MEMORIA ≤2. | Condicionar. |
| M148 | e845 | Condicional anidado y sin Fallo. | Desglosar. |
| M149 | e846 | +1 Temple por Marca sin tope. | «Hasta el máximo». |
| M151 | e900 | Iria/Noemí dan Ventaja en pruebas que r185 no cubre. | Ampliar r185. |
| M155 | e901 | «Las Ayudas la anulan» para una prueba que no es ataque. | Aclarar. |
| M157 | e910 | Falta la franja ARRAIGO 3 del Nativo. | Añadir. |
| M162 | e914 | Sigue remitiendo a e900; el bucle no se evita. | Reescribir. |
| M163 | e914 | Recibe en Quilla aunque `MATASTE_A_LA_MADRE`/`EXPULSADO`. | Añadir rama. |
| M165 | e917 | Teletransporte a la torre sin condición de lugar. | Restringir. |
| M166 | e918 | Ver A1. | — |
| M167 | e920 | Ver A2. | — |
| M168 | e908 | Dos reglas de legado (`ESTRELLA_FUGAZ` vs r212). | Unificar. |

---

## 6. Maqueta y hoja

- 2 títulos huérfanos: p. 42 «COMBATE» (1 línea debajo) y p. 157 «BRAZOS LARGOS» (2 líneas).
- 22 huecos de columna >20 % (lista generada por `revisar_maqueta.py`).
- La hoja ya tiene 70 casillas, segunda casilla de Crítico, 4 líneas de implantes y días de historia con línea; falta decidir si el reloj de Clemencia se marca de otra forma.

## 7. Orden sugerido de implementación

1. A1/A2 (e918/e920).
2. A3–A7.
3. M2–M30.
4. M31–M52.
5. M53–M99.
6. M119–M168.
7. Repasar maqueta y reconstruir PDF; verificar 200 páginas después de cada bloque.
