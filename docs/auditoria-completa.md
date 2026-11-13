# Auditoría completa de *Caribdis*

**Fecha:** 13 de noviembre de 2026  
**Alcance:** las 443 entradas del libro (93 reglas y 350 eventos), las tablas de los apéndices, el índice de Marcas y los archivos de construcción del PDF.  
**Modo:** solo lectura. No se ha modificado ningún archivo del juego ni se han regenerado los PDF.  
**Estado del libro:** 200 páginas, 0 enlaces internos rotos, 0 IDs duplicados, 0 entradas huérfanas en `verificar.py`, índice de Marcas reproducible al 100 %.

---

## Veredicto

El libro está **estructuralmente completo**, pero **no está listo para imprimirse tal cual**. La auditoría ha encontrado:

- **15 bloqueantes**: contenido inalcanzable, encuentros sin desenlace, contradicciones que cambian una regla central, un bucle económico infinito, dos modos de juego incompatibles y finales que se contradicen.
- **Más de 30 incidencias graves**: cadenas de tripulantes rotas, recompensas que no se pueden cobrar, marcas que prometen efectos inexistentes, tablas de referencia que enseñan mal una regla.
- **Más de 70 incidencias moderadas y menores**: ambigüedades, precios duplicados, objetos sin ficha, erratas y remisiones imprecisas.

La buena noticia: **casi todas se arreglan con una o dos líneas**. Ninguna exige rediseñar el juego. Con los 15 bloqueantes y las incidencias graves corregidas, el libro queda perfectamente jugable; el resto es pulido.

> Este informe no toca el libro. Los números de línea se refieren al estado actual de `libro/*.md`. Las rutas son relativas a la raíz del repositorio.

---

## Metodología

1. **Lectura completa por sectores.** Ocho auditores independientes leyeron todas las reglas y todos los eventos, opción por opción, contrastando cada remisión con su destino.
2. **Comprobaciones automáticas.** Anclas, enlaces, duplicados, huérfanos, cobertura de las tablas de encuentro, marcas dadas/usadas, topes numéricos, recetas, precios, estados de tripulantes y finales.
3. **Contraste con las reglas.** Cada hallazgo se verificó contra `01-reglas.md`, `02-plantillas.md`, `90-apendices.md` y `91-indice-marcas.md`.
4. **Criterio de severidad.**
   - **Bloqueante:** impide jugar una parte del libro, hace imposible obtener contenido o contradice una regla central.
   - **Grave:** obliga a decidir una regla por cuenta propia en un momento importante, o rompe una cadena/estado.
   - **Moderado:** ambigüedad que se puede resolver con sentido común, pero que genera dudas de mesa.
   - **Menor:** errata, repetición, precio duplicado, remisión mejorable.

No se han incluido preferencias de estilo ni cambios de diseño. Todo lo que sigue es una discrepancia verificable.

---

# 1. Bloqueantes

## B1. Tres eventos comunes son inalcanzables y tres fragmentos son imposibles de conseguir

**Dónde:** `libro/11-comunes.md:238` (e040), `:477` (e057), `:489` (e058); tablas `e200`, `e220`, `e240`, `e260`, `e280`, `e300`, `e320`, `e340`.

**Qué pasa:** e040, e057 y e058 no aparecen en ninguna tabla de encuentros, no los llama ningún evento, Pista ni rumor, y solo existen en su propio encabezado y en el índice de Marcas. La cabecera de la sección dice: «Pueden salir en cualquier región: las tablas de encuentros los indican» (`11-comunes.md:82`), pero las tablas no los indican.

**Consecuencias:**
- `FRAGMENTO_EL_PILOTO_FANTASMA` (e040) no se puede obtener en ningún otro sitio.
- `FRAGMENTO_CORTES_LIMPIOS` (e057) no se puede obtener en ningún otro sitio.
- `FRAGMENTO_LOS_QUE_SE_FUERON` (e058) no se puede obtener en ningún otro sitio.
- Con tres fragmentos menos, las verdades 4 y 6 quedan infrarrepresentadas en e840 y algunos Secretos son prácticamente inalcanzables.
- e058, además, contiene un bucle de comida si se añade sin corregirlo (ver G8).

**Arreglo:** incluir los tres eventos en las tablas de encuentro (o darles una Pista/rumor que los despierte) y corregir e058 antes de hacerlo.

---

## B2. Cuatro encuentros tienen Precio o Botín sin salida

**Dónde:** `libro/11-comunes.md:455` (e055), `libro/25-canones.md:100` (e306), `libro/26-ciudad.md:91` (e325), `libro/27-torres.md:64` (e343).

**Qué pasa:** r300 dice que el Botín se cobra en «Si ganas» y que el Precio se paga para pasar o negociar. Pero:

| Evento | Precio | Botín | Salidas que tiene |
|---|---|---|---|
| e055 | 4 Chatarra | 1d6 Chatarra + hacha | solo «Si ganas» |
| e306 | 3 Chatarra | 5 Chatarra + cuerda y garfio | solo «Si ganas» |
| e325 | 2 Raciones | lanza de luz fría | solo «Si pasas» |
| e343 | 1 de Canto | lanza vibrante | solo «Si ganas» |

**Consecuencias:**
- En e055 y e306, pagar el Precio no lleva a ninguna parte: no hay «Si pasas» al que volver.
- En e325, si luchas y ganas, no hay «Si ganas»: por la regla general vuelves al mapa **sin el Botín**.
- En e343, pagar 1 de Canto no tiene salida, y el Botín no se menciona en «Si ganas».
- Cualquier mesa tiene que improvisar justo en los cuatro encuentros que usan las plantillas de r300.

**Arreglo:** añadir la salida que falta en cada uno (una línea por evento), o quitar el Precio/Botín que no se pueda cobrar.

---

## B3. e626 puede dispararse sin Lio

**Dónde:** `libro/50-tripulacion.md:344` (e625, opción 2) y `:353` (e626).

**Qué pasa:** `EL_PADRE_DE_LIO` solo se obtiene en e625 opción 2, que **no recluta a Lio** (las que lo reclutan son la 1 y la 3). e626 se dispara con cualquier encuentro [Náufrago] si tienes la Marca y da por hecho que Lio está contigo: «Lio se esconde detrás de ti», le suma +2 Lealtad o permite `PERDIDO_LIO`.

**Consecuencia:** el padre de Lio puede aparecer cuando Lio está en la Cicatriz o cuando nunca lo has reclutado. La cadena entera de Lio queda rota.

**Arreglo:** condicionar e626 a «si Lio está contigo» (y posponerlo si no), o hacer que la opción 2 de e625 lo reclute explícitamente.

---

## B4. El Tadeo perdido no se puede recuperar en e424

**Dónde:** `libro/50-tripulacion.md:300` (e623) y `libro/30-asentamientos.md:348` (e424).

**Qué pasa:** e623 option 2 anota `PERDIDO_TADEO` y promete: «lo encontrarás allí, como acogido (e424)». Pero e424 solo funciona «si tienes a un tripulante cuya región sea las Torres y aún no lo has encontrado». Tadeo perdido ya fue encontrado y su región es la que se tiró en r108. `PERDIDO_TADEO` no se consulta en ningún evento.

**Consecuencia:** la Pista promete una recuperación que solo funciona si Tadeo tenía la región Torres por casualidad. En el resto de partidas, Tadeo desaparece para siempre sin que el libro lo diga.

**Arreglo:** añadir en e424 «Si tienes `PERDIDO_TADEO`, está aquí», o condicionar la Pista a que su región sea las Torres.

---

## B5. Bucle económico infinito con las reliquias en e403

**Dónde:** `libro/30-asentamientos.md:70-71` y `libro/01-reglas.md:597`.

**Qué pasa:** e403 compra una reliquia sin identificar por 5 Chatarra y vende reliquias «al doble del precio normal». r161 fija el precio normal de venta en 4 Chatarra (la mitad de 8), así que e403 la compra a 5 y la vende a 8: **+3 Chatarra por ciclo**. La identificada se compra a 10 y se vende a 12: +2. No hay stock limitado y la visita es repetible.

**Consecuencia:** qualquer personaje con 5 Chatarra puede generar dinero infinito en Puerto Chatarra sin tirada ni riesgo. Rompe la economía de todo el libro.

**Arreglo:** que e403 compre por encima de 8/12, que venda al precio normal (4/6), o que limite la venta a una reliquia por visita.

---

## B6. El taller del Nodo contradice r162

**Dónde:** `libro/01-reglas.md:604` (r162) y `libro/30-asentamientos.md:396` (e430).

**Qué pasa:** r162 dice: «Por 3 Chatarra… de Precaria pasa a Sólida. **Ellos no pueden llevarlo a Excelente**». e430 dice: «taller (r162; aquí pueden llevar un sistema de Sólido a Excelente por 6 Chatarra)». cita r162 como si la excepción estuviera en la regla, pero no está.

**Consecuencia:** dos precios y dos límites distintos para el mismo taller. Un jugador que lea r162 no puede mejorar a Excelente; el que lea e430 sí. Afecta a la progresión de los seis sistemas.

**Arreglo:** quitar «(r162)» y declarar la excepción explícita en e430, o eliminar la mejora a Excelente del Nodo.

---

## B7. La Mente no tiene regla de caída

**Dónde:** `libro/01-reglas.md:132-135` (r104), `:185` (r106), `:859` (r195), `libro/80-finales.md:343` (e920).

**Qué pasa:** la Mente tiene «4 niveles de Daño en lugar de Heridas». r195 dice: «Si recibes una Herida en Crítico, caes. Gasta 1 Temple… Sin Temple → e920». Pero la Mente no recibe Heridas: recibe Daño. No hay ninguna regla que diga qué pasa cuando la Mente llena sus cuatro niveles de Daño, ni si puede «caer», ni cómo paga Temple, ni qué final lee. e920, además, está escrito para un cuerpo humano («Te quedas tumbado en la arena roja», «El viento cubre tu cuerpo»).

**Consecuencia:** la Mente es potencialmente inmortal o, como mínimo, su derrota no está definida. Es el protagonista con más reglas propias y el único sin regla de fin.

**Arreglo:** añadir en r195 una rama para la Mente («si llenas los cuatro niveles de Daño, caes; gasta 1 Temple y despiertas en la Cicatriz con 2 Daño…») y una rama de e920 para la Mente (dron destruido, copia de seguridad, etc.).

---

## B8. r141 «Hablar» omite las dos habilidades que sí permiten hablar con cualquiera

**Dónde:** `libro/01-reglas.md:420` (r141), `:802` (r190), `libro/70-historias.md:311` (Voz de los Antiguos), `libro/02-plantillas.md:23` (r300).

**Qué pasa:** r141 limita Hablar a:
- [Náufrago] y [Cantor] siempre.
- [Máquina] si eres la Mente.
- [Bestia] con `DOMADOR` o *Lengua de bestias*.

Pero r190 incluye la habilidad **Voz de la nave** («puedes usar Hablar contra cualquier enemigo») y el evento de la Voz de los Antiguos permite hablar con [Antiguo]. r300 sí las contempla. r141, que es la regla de combate que se consulta en mesa, no.

**Consecuencia:** un jugador con Voz de la nave lee r141 y cree que no puede hablar con un [Antiguo] o con una [Máquina] si no es la Mente. La regla general y la tabla de plantillas dicen lo contrario.

**Arreglo:** añadir en r141: «o con `Voz de la nave` / `Voz de los Antiguos` contra cualquier enemigo», y aclarar si `Voz de los Antiguos` permite hablar con [Antiguo] aunque no seas la Mente.

---

## B9. El Temple máximo es 3 o 4 según dónde se lea

**Dónde:** `libro/01-reglas.md:188` (r106), `:276` (r122), `:794` (r190), `libro/90-apendices.md:16` (hoja).

**Qué pasa:**
- r106: «Temple (r122): de 0 a 3».
- r122: «El Temple es tu reserva de coraje y suerte (**máximo 3**)».
- r190: «+1 Temple máximo (**máximo 4**, con cualquier bonificación)».
- La hoja de protagonista tiene **cuatro casillas** de Temple (tres + una punteada).
- El origen Mirasol da «+1 Temple máximo».

**Consecuencia:** no se sabe si el máximo real es 3 o 4. Afecta a la supervivencia, porque caer cuesta 1 Temple y sin Temple se va a e920.

**Arreglo:** decidir que el máximo base es 3 y el absoluto 4 con mejoras, y escribir «de 0 a 3 (máximo 4 con mejoras)» en r106 y r122; o bajar la hoja a 3 casillas y quitar el +1 de r190. La opción coherente con la hoja y con r190 es la primera.

---

## B10. e271 tiene una frase literalmente incompleta

**Dónde:** `libro/23-bosque.md:192` (e271, opción 3).

**Qué pasa:** el texto dice: «Baja tu Canto a 0 y suma esa cantidad a… algo, en algún lado». No hay ninguna regla que explique qué se suma, a qué contador ni dónde se anota. `ALIMENTASTE_EL_CORAZON` solo reaparece en el epílogo.

**Consecuencia:** la opción más narrativa del corazón del bosque no tiene efecto mecánico. El jugador no sabe qué anotar.

**Arreglo:** concretar el destino (por ejemplo, «suma esa cantidad a tu Temple, hasta el máximo» o «anota +1 por cada 2 de Canto para e910») y borrar el «algo, en algún lado».

---

## B11. e433 «Ninguno» no tiene desenlace

**Dónde:** `libro/30-asentamientos.md:429` (e433, opción 2).

**Qué pasa:** «*Ninguno:* combate contra *Guardianes del reactor…*». No hay «Si ganas», no se dice qué pasa si vences, no se obtiene el núcleo y el evento no remite a ninguna parte.

**Consecuencia:** si el jugador falla las dos tiradas y gana el combate, el evento se queda sin resolución. No puede saber si consigue el Motor, si huye o si vuelve a intentarlo.

**Arreglo:** añadir «*Si ganas:* consigues un Motor Sólido y −3 de Reputación; si pierdes, huyes sin núcleo» o similar.

---

## B12. Los muertos del viaje siguen vivos en el epílogo

**Dónde:** `libro/80-finales.md:37` (e900, Paso 4) y `:163` (e910).

**Qué pasa:** con 3–4 Daños de nave, «cada pasajero o tripulante a bordo tira 1d6: con un 1, no sobrevive al viaje». e900 no anota ninguna Marca ni tacha la ficha. e910 dice «Por cada tripulante a bordo: “(Nombre) vive”» y añade sus líneas personales. El epílogo afirma que vive alguien que acaba de morir.

**Consecuencia:** el final puede contradecir la tirada anterior; además, los puntos de r196 siguen contando al tripulante muerto.

**Arreglo:** anotar los muertos (por ejemplo, `MURIO_EN_EL_VIAJE_<nombre>`) y condicionar las líneas de e910; o cambiar el 1 por «herido grave».

---

## B13. e918 destruye Caribdis y luego remite a un epílogo que cuenta Quilla y la Cicatriz

**Dónde:** `libro/80-finales.md:315` (e918) y `:177-208` (e910).

**Qué pasa:** e918 termina: «Lee e910 y añade: “Nadie volverá a caer en Caribdis. Ya no existe”». Pero e910 incluye líneas como «(Nombre) se queda en Caribdis», «En Quilla hay una pintura nueva» y «En el Santuario hay una Jardinera nueva», imposibles si el planeta se rompe. Además, la condición «(o despegas antes de que el Reloj baje 3…; si no, es una derrota)» no dice a qué se aplica el «si no».

**Consecuencia:** el final más épico del juego produce un epílogo incoherente.

**Arreglo:** dar a e918 su propio epílogo (o marcar qué líneas de e910 se omiten) y reescribir la condición como «Secreto 3 + `LO_VISTE` + despegue».

---

## B14. Las grandes obras se pueden construir en un taller, aunque r205 dice que solo en la Cicatriz

**Dónde:** `libro/01-reglas.md:990` (r205), `:958` (r203) y `:606` (r162).

**Qué pasa:** r205: «Se construye en tres fases, cada una en un día de Ensamblar distinto, y **solo en la Cicatriz**». r203: «Puedes hacerla en la Cicatriz, **o en un taller pagando 1 Chatarra**… una fase de una gran obra». r162: «En los talleres también se venden planos y puedes **Ensamblar** pagando 1 Chatarra». No hay ninguna excepción que excluya las grandes obras del taller.

**Consecuencia:** no se sabe si las tres fases de una gran obra se pueden hacer en Puerto Chatarra o el Nodo. Si se puede, r205 es falso; si no, r203 y r162 prometen algo que no se puede hacer.

**Arreglo:** añadir en r203 y r162 «las grandes obras, solo en la Cicatriz», o quitar «solo en la Cicatriz» de r205.

---

## B15. El modo Náufrago se contradice a sí mismo y su victoria no se comprueba

**Dónde:** `libro/01-reglas.md:240` (r109), `:864` (r196), `libro/80-finales.md:9` (e900).

**Qué pasa:** r109 dice tres cosas incompatibles:
1. «**no hay Reloj**; los Recolectores no vienen».
2. «**Lleva el Reloj igual** (para las historias y los eventos), pero se para en 0 y no pasa nada».
3. «En cambio, el Canto sube 1 cada 5 días».

Además, «Para ganar, debes despegar con **al menos 3 tripulantes**» no se comprueba en e900/e903 ni en r196: se puede despegar solo y leer un final de victoria normal. Y si el Reloj se para en 0, el «Canto sube 1 cada 5 días» se queda sin contador de días.

**Consecuencia:** el modo Náufrago, que existe para jugar sin la presión de los Recolectores, no tiene una condición de victoria verificable y puede terminar en un final que no le corresponde.

**Arreglo:** aclarar que el Reloj sigue bajando como cuenta de días/Canto (sin Recolectores), y añadir en e900/e903/r196: «En Náufrago, con menos de 3 tripulantes no es una victoria; lee e914/e908».

---

# 2. Graves

> Las incidencias graves no impiden jugar, pero obligan a decidir una regla por cuenta propia o rompen una cadena de recompensas. Están agrupadas por tema.

## 2.1. Contenido y remisiones

### G1. Umbral de fragmentos: 2 o 3 según el evento
- **Dónde:** r191 (`01-reglas.md:811`), e512 (`40-pecios-sistemas.md:171`), e063 (`12-conocidos.md:74`), e350 (`27-torres.md:167`), e749 (`60-catalogo.md:183`).
- **Qué pasa:** r191 manda ir a e840 «cuando tengas 3 `FRAGMENTO_` distintos». e512 y e063 mandan ir con 2; e350 dice que «esto cuenta como el tercero»; e749 dice «aunque no tengas 3».
- **Consecuencia:** el Secreto se puede descubrir antes de tiempo y las excepciones no están marcadas como tales. e512, además, no gana ningún fragmento nuevo en la opción que remite a e840.
- **Arreglo:** unificar el umbral en 3 y marcar las excepciones que de verdad quieran adelantar el descubrimiento (e350/e749), o cambiar r191 a «2 o más».

### G2. e324 no comprueba `ENCARGO_DE_REPARAR`
- **Dónde:** e433 (`30-asentamientos.md:445`) y e324 (`26-ciudad.md:72`).
- **Qué pasa:** e433 encarga reparar a tres Vigías y dice «cuenta los que repares en e324 (+1 Rep. extra cada uno)». e324 repara a un Vigía, pero no menciona el encargo ni lleva contador; solo da +2 Rep y `AMIGO_DE_UN_VIGIA`.
- **Consecuencia:** el encargo no se puede completar; `PERMISO_DE_PRIMO` queda inalcanzable por esta vía.
- **Arreglo:** añadir en e324 una rama «si tienes `ENCARGO_DE_REPARAR`…» con contador y el +1 Rep.

### G3. e433 remite a e900 para el permiso de Primo, pero el efecto está en e901/e902
- **Dónde:** e433 (`30-asentamientos.md:415`), e901 (`80-finales.md:52`), e902 (`80-finales.md:56`).
- **Qué pasa:** «en la secuencia de despegue, los Vigías te escoltan (ver e900)». e900 no menciona `PERMISO_DE_PRIMO`; el efecto está en las Ayudas de e901/e902.
- **Arreglo:** cambiar la remisión a e901–e902.

### G4. `EXPULSADO_DE_LOS_CAÑONES` no se comprueba en Quilla
- **Dónde:** e641 (`55-facciones.md:32`) y e410 (`30-asentamientos.md:161`).
- **Qué pasa:** la Marca dice «No puedes volver a entrar en los Cañones (salvo de paso, con un vehículo)», pero Quilla no la consulta; el jugador puede seguir entrando.
- **Arreglo:** añadir en e410 «Si tienes `EXPULSADO_DE_LOS_CAÑONES` → e415».

### G5. `SEÑAL_EN_ROCA` promete Lealtad 3 y ningún evento la lee
- **Dónde:** e037 (`11-comunes.md:201`), r186 (`01-reglas.md:780`), e600–e627.
- **Qué pasa:** e037 anota `SEÑAL_EN_ROCA` «con su nombre» y dice que, al encontrar a ese tripulante, empieza con Lealtad 3. Ningún evento de tripulante la menciona y r186 los hace empezar en Lealtad 2.
- **Arreglo:** consultarla en r185/e600s, o borrar la Marca y dejar solo la nota «Lealtad 3 al encontrarlo».

### G6. `JARDINERO` no se consulta nunca
- **Dónde:** e416 (`30-asentamientos.md:259`), fuentes de Soporte vital Precario (e566, `40-pecios-sistemas.md:15`, `23-bosque.md:40`, `30-asentamientos.md:260`).
- **Qué pasa:** la Marca dice que un Soporte vital Precario sube automáticamente a Sólido, pero ninguna de las cuatro fuentes la lee y el índice solo la lista en e416.
- **Arreglo:** aplicarla en las cuatro fuentes o cambiarla por una mejora inmediata.

### G7. `MAPA_DEL_CIEGO` y `SABES_DE_LAS_TORRETAS` son recompensas muertas
- **Dónde:** `MAPA_DEL_CIEGO` (`21-cementerio.md:103`), r151 (`01-reglas.md:499`); `SABES_DE_LAS_TORRETAS` (`25-canones.md:145`), r171 (`01-reglas.md:656`).
- **Qué pasa:** la primera promete «nunca te pierdes al viajar» y r151 no la menciona; la segunda promete Ventaja contra torretas y la única otra torreta (r171) no la consulta. En e309, las torretas solo existen en la opción 1 del mismo evento, que ya no se puede elegir al leer la opción 3.
- **Arreglo:** añadir la comprobación en r151 y en la torreta de r171, o cambiar ambas por Ventajas inmediatas.

### G8. `ALGUIEN_LO_LOGRO` y `TE_RECUERDAS` no tienen implementación en eventos
- **Dónde:** r212 (`01-reglas.md:1036-1039`).
- **Qué pasa:** `ALGUIEN_LO_LOGRO` promete +1 Reputación en la primera visita a cada asentamiento, pero ningún asentamiento la comprueba; el jugador debe acordarse. `TE_RECUERDAS` solo se anota, no tiene efecto definido.
- **Arreglo:** añadir la comprobación en e400/e410/e420/e430 o una nota en r160; dar a `TE_RECUERDAS` un efecto o eliminarla.

## 2.2. Economía, objetos y precios

### G9. La célula de combustible de e243 contradice r161
- **Dónde:** e243 (`22-salinas.md:36`), r161 (`01-reglas.md:587`).
- **Qué pasa:** e243 da una «célula de combustible» (+4 Energía, se vende por 4); r161 vende la «Célula de energía» a 2 Chatarra y +3 Energía. Es un objeto nuevo, mejor y sin prueba.
- **Arreglo:** usar la célula de energía normal o añadir la de combustible a r161 con su precio.

### G10. Las baterías de e222 valen 4 Chatarra, no 6
- **Dónde:** e222 (`21-cementerio.md:45`), r201 (`01-reglas.md:935`), e046 (`11-comunes.md:328`).
- **Qué pasa:** e222 da «+6 Energía o 4 Chatarra»; r201 dice que las baterías valen 6 Chatarra y e046 las vende por 6.
- **Arreglo:** unificar en 6 Chatarra.

### G11. e500 puede superar el máximo de 8 Raciones
- **Dónde:** e500 (`40-pecios-sistemas.md:13`), r106 (`01-reglas.md:189`), hoja (`90-apendices.md`).
- **Qué pasa:** e500 da +6 Raciones «y mientras tengas más de 6, −1 Reflejos». Un Piloto que empieza con 5 puede llegar a 11, pero r106 y la hoja fijan el máximo en 8.
- **Arreglo:** añadir «hasta un máximo de 8» o subir el máximo de la hoja y de r106 a 12.

### G12. El «Casco de minero» de e247 no sirve en e241
- **Dónde:** e247 (`22-salinas.md:129`), e241 (`22-salinas.md:33`).
- **Qué pasa:** e247 vende un Casco de minero por 2 Chatarra «Ventaja para Hablar con el capataz en e241». e241 solo admite «Mente: Ventaja; o mostrando `CODIGO_VIGIA`». El casco no aparece en e241 ni en ningún otro evento.
- **Arreglo:** añadir el casco a e241 o cambiar la recompensa de e247.

### G13. La receta de e761 cuesta más que comprar el objeto
- **Dónde:** e761 (`60-catalogo.md:205`), r161 (`01-reglas.md:587`), r201 (`01-reglas.md:932`).
- **Qué pasa:** 1 Cobre + 1 Cristal = 3 Chatarra de materiales, más un día y una prueba, para una bombona/célula de +3; r161 la vende por 2. El plano inicial del Piloto es peor que ir a la tienda. Algo parecido pasa con e763.
- **Arreglo:** bajar la receta a 1 Cobre (o 1 Cristal) o subir el efecto a +4/+5.

### G14. e403 vende implantes sin ranura ni prueba
- **Dónde:** e403 (`30-asentamientos.md:72`), r102 (`01-reglas.md:102`), e051 (`11-comunes.md:403`).
- **Qué pasa:** e403 vende un implante por 5 Chatarra, «se instala solo, sin prueba»; e051 exige «si tienes ranura libre» y `[Vigor · 9]`, y cobra 6. e403 se salta las dos restricciones y es más barato.
- **Arreglo:** añadir «si tienes ranura libre» y la prueba, o explicar la excepción.

### G15. El «sistema a tu elección» puede ser el Sistema personal
- **Dónde:** e400 (`30-asentamientos.md:14`), e646 (`55-facciones.md:44`), r180 (`01-reglas.md:721`).
- **Qué pasa:** las recompensas dicen «un sistema a tu elección, calidad Excelente», y r180 incluye el Sistema personal entre los seis. No se aclara si se puede elegir ese, saltándose la historia personal.
- **Arreglo:** «uno de los cinco sistemas de la nave (no el Sistema personal)».

## 2.3. Combate y daño

### G16. e515 y e626 tienen combates sin desenlace
- **Dónde:** e515 (`40-pecios-sistemas.md:210`), e626 (`50-tripulacion.md:362`).
- **Qué pasa:** e515: «*Fallo:* la nave se defiende: *Defensas…*». No hay «Si ganas»: no se sabe si el órgano se puede cortar tras vencer. e626: «*Fallo:* combate con Emboscada». No se dice qué pasa si ganas (¿huye como en la opción 1?).
- **Arreglo:** añadir «*Si ganas:* como en el Éxito» en ambos.

### G17. e603: fallar la tirada vale lo mismo que acertar
- **Dónde:** e603 (`50-tripulacion.md:66`).
- **Qué pasa:** el Fallo dice «Como en la opción 1», que incluye `IRIA_CURADA`, +1 Lealtad, −2 CULPA y **★**. Fallar no cuesta nada; la opción 1 y el Fallo son idénticos.
- **Arreglo:** «Como en la opción 1, pero sin el ★» (o sin la Lealtad/CULPA).

### G18. r198 enseña mal las Heridas de Sela
- **Dónde:** r198 (`01-reglas.md:894`), r106 (`:185`), e002/e003.
- **Qué pasa:** el ejemplo dice «Sela cuenta seis de Chatarra, un hueso y **tres Heridas**». Sela tiene *Herido* (−1) del aterrizaje y *Grave* (−2) del guardián: dos niveles, no tres. «Tres Heridas» se lee como tres casillas.
- **Arreglo:** «dos Heridas» o «Herido y Grave».

### G19. e039 permite a cualquier Nativo calmar [Bestias]
- **Dónde:** e039 (`11-comunes.md:233`), r141 (`01-reglas.md:420`), r142 (`:429`), r105 (`:167`).
- **Qué pasa:** «Calmarlos (Nativo o `DOMADOR`)». `DOMADOR` ya es una Marca del Nativo, así que «Nativo o DOMADOR» equivale a cualquier Nativo y le regala la habilidad de hablar con bestias. e202 usa el patrón correcto: «solo el Nativo con `DOMADOR`, o el Nativo con `GUERRERO`».
- **Arreglo:** «(`DOMADOR` o *Lengua de bestias*)».

### G20. e046 da +1 Canto por una batería que r201 excluye
- **Dónde:** e046 (`11-comunes.md:328`), r201 (`01-reglas.md:935`).
- **Qué pasa:** e046 da una batería de luz fría y «+1 Canto y +1 Alerta»; r201 dice «Al ganar Luz fría (no baterías…), +1 Canto». La batería existe justamente para no dar Canto.
- **Arreglo:** dejar solo «+1 Alerta», o cambiar el botín a 1 pieza de Luz fría con su +1 Canto.

### G21. e042 pide «2d6 + 1» en una tabla de 2–12
- **Dónde:** e042 (`11-comunes.md:271`), r154 (`01-reglas.md`).
- **Qué pasa:** «tira 2d6 en la tabla de encuentros con +1». 2d6+1 puede dar 13, y no se aclara si el +1 va al dado o a la columna de Alerta (que solo llega a 4).
- **Arreglo:** «cuenta el resultado como un punto más alto (máximo 12)» o «usa la columna de Alerta +1 (máximo 4)».

### G22. e714 crea un quinto nivel de Heridas sin regla
- **Dónde:** e714 (`60-catalogo.md:70`), r106 (`01-reglas.md:185`), r195 (`:859`), hoja (`90-apendices.md:16`).
- **Qué pasa:** la mutación «Segundo corazón» da «un nivel de Heridas más (un segundo Crítico)». No hay regla para el segundo Crítico ni casilla en la hoja; no se sabe si caes al llenar el primero o el segundo.
- **Arreglo:** «tienes una casilla de Crítico más; solo caes al llenar la segunda» y añadir la casilla a la hoja.

## 2.4. Marcas y estados

### G23. Diez Marcas de Origen no se consultan nunca
- **Dónde:** r105 (`01-reglas.md:150-168`), índice (`91-indice-marcas.md`).
- **Qué pasa:** `COLONO`, `DESERTOR`, `TEMERARIO`, `CARRONERO`, `EXILIADO`, `MIRASOL`, `ARMA`, `MEDICA`, `ACTRIZ` y `SIN_REGISTRO` solo aparecen en la tabla de Orígenes. Las otras ocho sí se consultan (VETERANO, DEUDAS, RESCATADOR, CHAMAN, DOMADOR, GUERRERO, NAVEGANTE, ESTIBADORA).
- **Consecuencia:** el jugador aprende que la Marca de Origen sirve… salvo cuando no.
- **Arreglo:** consultarlas en al menos una entrada, o avisar en r105 de que son apuntes de ficción y el efecto real es la Habilidad.

### G24. `MIRASOL` no la reconocen los Mirasoles
- **Dónde:** r105 (`01-reglas.md:167`), e068 (`12-conocidos.md:159`), e071 (`:216`).
- **Qué pasa:** el Origen Mirasol del Nativo da la Marca `MIRASOL`, pero la familia de los Mirasoles solo reacciona a `LOS_MIRASOLES_TE_CONOCEN`/`DEUDA_DE_LOS_MIRASOLES`. Un Nativo Mirasol llega a e068 como un desconocido.
- **Arreglo:** que e068 trate `MIRASOL` como `LOS_MIRASOLES_TE_CONOCEN`, o renombrar la Marca.

### G25. `RUTA_SALINAS` solo existe como ejemplo del glosario
- **Dónde:** r191 (`01-reglas.md:809`), índice (`91-indice-marcas.md:248`).
- **Qué pasa:** la única aparición es el ejemplo tipográfico de cómo completar la familia `RUTA_`. Ningún evento la concede, aunque otras rutas sí (RUTA_BOSQUE, RUTA_CIUDAD, RUTA_POLO). El índice la convierte en una Marca real.
- **Arreglo:** excluir la línea de ejemplo al generar el índice, o concederla en las Salinas.

### G26. `VERSALITAS` se renderiza como Marca
- **Dónde:** r191 (`01-reglas.md:807`), `estilo.css` (`.marca`).
- **Qué pasa:** el texto «Las Marcas son palabras clave en `VERSALITAS`» usa backticks y el PDF lo pinta como una ficha de Marca. No es una Marca; es el nombre del espacio de la hoja.
- **Arreglo:** quitar los backticks o marcarlo como código sin estilo de Marca.

### G27. `INSTALACION_GRATIS` tiene dos efectos distintos
- **Dónde:** e413 (`30-asentamientos.md:217`), e616 (`50-tripulacion.md:237`).
- **Qué pasa:** e413: «la próxima instalación es automática (sin prueba, **con +1 de calidad**)». e616: «próxima instalación automática». La misma Marca da dos premios distintos; si se obtiene dos veces, el segundo se pierde.
- **Arreglo:** unificar el texto y añadir «si no la tienes» en ambas entradas.

### G28. `CAZADO_…` no se borra al reconciliarse
- **Dónde:** e641/e643/e645/e647 (`55-facciones.md`).
- **Qué pasa:** los éxitos de reconciliación perdonan la Reputación pero no borran `CAZADO_EN_LOS_CAÑONES`, `CAZADO_EN_EL_CEMENTERIO`, `CAZADO_EN_LAS_TORRES` ni `CAZADO_POR_LOS_VIGIAS`. El jugador sigue marcado como enemigo aunque el texto diga que lo perdonan.
- **Arreglo:** añadir «borra `CAZADO_…`» a cada éxito.

### G29. La túnica bendita no está registrada y anula todos los combates [Cantor]
- **Dónde:** e425 (`30-asentamientos.md:365`).
- **Qué pasa:** «mientras la lleves, ningún [Cantor] te ataca: puedes evitar sus combates». No es objeto de r107/r161 ni Marca del índice; no hay forma de perderla. Deja sin sentido e417/e421.3/e645.
- **Arreglo:** convertirla en Marca con un uso o en objeto con precio/ranura.

### G30. El descuento permanente del Contable no tiene Marca
- **Dónde:** e642 (`55-facciones.md:45`).
- **Qué pasa:** «los precios de Puerto Chatarra quedan a mitad para ti… el resto de la partida». No dice «anota» y no hay Marca en el índice; no interactúa con r161 ni con el «sin regatear».
- **Arreglo:** añadir `PRECIOS_DE_SOCIO` y referenciarla en r161/e400.

## 2.5. Tripulantes

### G31. El menú de los encuentros mezcla reclutamiento y seguimiento
- **Dónde:** e600 (`50-tripulacion.md:155`), e605 (`:87`), e615 (`:218`).
- **Qué pasa:** las opciones numeradas mezclan «se une como compañera» con «preguntarle qué hace aquí», que aplica Lealtad sin que la opción 1 haya ocurrido. El libro no dice si las opciones son excluyentes. Si lo son, las tres cadenas de Lealtad quedan huérfanas; si no, chocan e600 opciones 1 y 2 (contigo / en la Cicatriz).
- **Arreglo:** separar «se une» (siempre) de las opciones de conversación, o marcar cuáles son excluyentes.

### G32. `PROMESA_A_BRUNO` no se consulta en e606
- **Dónde:** e605 (`50-tripulacion.md:87`), e606 (`:104`), e910 (`80-finales.md:197`).
- **Qué pasa:** la promesa de recuperar la carga solo aparece en el epílogo. e606 se alcanza por la opción 2, sin haber prometido nada, y aun así Bruno actúa como compañero.
- **Arreglo:** exigir `PROMESA_A_BRUNO` (o reclutamiento) para entrar a e606, y consultarla en e606.

### G33. e618 repite con Ingenio una prueba de otro atributo
- **Dónde:** e618 (`50-tripulacion.md:266`), e900 (`80-finales.md:18-26`).
- **Qué pasa:** e900 usa Reflejos para el Casco, Voluntad para el Canto, Vigor para el Soporte vital y el atributo del protagonista para el sistema personal. «Repite la prueba con tu Ingenio» es imposible si lo que falló fue el Casco o el Canto.
- **Arreglo:** «Repite la misma prueba, con Ventaja, usando su atributo».

### G34. `NIÑA_DORMIDA` no se puede canjear
- **Dónde:** e606 (`50-tripulacion.md:104`), r163 (`01-reglas.md:611`), e900 (`80-finales.md:9`).
- **Qué pasa:** el Fallo de e606 anota `NIÑA_DORMIDA` y dice «con un sanador o con Iria, cámbiala por la otra Marca». Ningún evento lee `NIÑA_DORMIDA` ni define el coste/momento del canje; e900 solo cuenta `LA_NIÑA_DE_LA_CAPSULA` como pasajera.
- **Arreglo:** implementar el canje en r163 o contar `NIÑA_DORMIDA` en el Paso 0.

### G35. e608/e618 no anotan `PERDIDO_`
- **Dónde:** e608 (`50-tripulacion.md:136`), e618 (`:265`), e623 (`:329`), e910 (`80-finales.md:177`).
- **Qué pasa:** e910 cuenta «cada tripulante que no subió (o `PERDIDO_` / `PERDIDO_BRUNO`)», pero e608 no manda anotar la Marca ni tachar la ficha. Bruno sigue como tripulante a bordo, «vive» en el epílogo y r196 le da 3 puntos.
- **Arreglo:** añadir `PERDIDO_BRUNO` / `PERDIDO_NOEMÍ` / `PERDIDO_TADEO` en cada desenlace.

### G36. El corazón del bosque no cura a Iria
- **Dónde:** e600 (`50-tripulacion.md:21`), e271 (`23-bosque.md:190-192`).
- **Qué pasa:** e600 da la Pista «Bosque · El corazón del bosque · e271» como una forma de curar a Iria. e271 no permite llevar muestra ni curar a Iria: sus tres opciones dan un fragmento, una reliquia y `ALIMENTASTE_EL_CORAZON`. La única cura es la seta (e603) o el Santuario (e601 opción 3). La Pista es un señuelo muerto.
- **Arreglo:** añadir en e271 una opción «llevarte una muestra» que habilite e603, o quitar esa Pista de e600.

### G37. e567: la opción 3 es estrictamente peor que la 1 y no suma CULPA
- **Dónde:** e567 (`40-pecios-sistemas.md:347`).
- **Qué pasa:** la opción 1 da el mismo Soporte vital Sólido, además el pasajero y sin coste de Temple; la 3 da el sistema y −2 Temple. Abandonar a un herido que depende del soporte vital no suma `CULPA`, contra r102.
- **Arreglo:** dar a la 3 algo que la 1 no tenga (por ejemplo +3 Chatarra) y añadir «Si eres el Piloto, +1 `CULPA`».

### G38. Vender a la niña no suma CULPA
- **Dónde:** e606 (`50-tripulacion.md:106`).
- **Qué pasa:** entregar a una niña al Contable y perder a un compañero no cuesta `CULPA`, mientras que entregar a Lio cuesta +2 y matar a los pacientes de e566 cuesta +1. Misma escala, criterios distintos.
- **Arreglo:** «Si eres el Piloto, +2 `CULPA`».

### G39. e626: +2 Lealtad puede pasar del máximo
- **Dónde:** e626 (`50-tripulacion.md:361`), r186 (`01-reglas.md:779`).
- **Qué pasa:** Lio puede llegar a 3 al unirse (e625 opción 3) y e626 le suma 2 sin tope, dejándolo en 5.
- **Arreglo:** «+2 Lealtad (máximo 3)» o «sube a 3».

### G40. La celda de la jaula de Iria cuesta 6; las demás, 8/5/4
- **Dónde:** e600 (`50-tripulacion.md:17`), e403 (`30-asentamientos.md:73`), e610 (`:152`), e615 (`:214`), e605 (`:84`).
- **Qué pasa:** dos precios y dos dificultades para la misma ficción: Iria 6 Chatarra / Reflejos 11; paquete de e403 8 / Reflejos 13; otras 5 y 4.
- **Arreglo:** unificar el precio/dificultad o explicar la diferencia.

## 2.6. Finales y despegue

### G41. e900 cuenta siete pruebas y dice «una por cada sistema»
- **Dónde:** e900 (`80-finales.md:16-26`), r180 (`01-reglas.md:721`).
- **Qué pasa:** hay seis sistemas y siete filas; la cuarta es «El Canto», que no es un sistema. Además, «cada Fallo es un Daño de nave» hace que fallar el Canto dañe la nave, lo que no encaja con «no darte la vuelta».
- **Arreglo:** «una prueba por cada sistema, más la prueba del Canto» y aclarar si el Fallo del Canto cuenta como Daño.

### G42. e804 y e900 cobran CULPA dos veces
- **Dónde:** e804 (`70-historias.md:83`), e900 (`80-finales.md:9`).
- **Qué pasa:** e804 opción 1 ya cobra +1 CULPA por cada tripulante que dejas; e900 Paso 0 lo vuelve a cobrar. Con la opción 2 («decidirlo en el último momento») el cobro de e900 es el único, pero con la 1 se paga doble.
- **Arreglo:** que e900 solo cobre si no se decidió en e804, o que e804 no cobre.

### G43. e804 «hacer sitio» no deja Marca y e900 no puede comprobarlo
- **Dónde:** e804 (`70-historias.md:85`), e900 (`80-finales.md:9`).
- **Qué pasa:** e900 dice «8 plazas si en e804 hiciste sitio». e804 option 3 no anota ninguna Marca; solo baja la calidad de un sistema. El jugador tiene que recordarlo o deducirlo de la hoja.
- **Arreglo:** anotar `HIZO_SITIO` en e804 o cambiar e900 a «si bajaste la calidad de un sistema en e804».

### G44. e804 no puede bajar una calidad que ya es Precaria
- **Dónde:** e804 (`70-historias.md:85`), r180 (`01-reglas.md:709`).
- **Qué pasa:** si el Casco o el Soporte vital están en Precaria (el mínimo) o no están instalados, no hay calidad que bajar y la opción no se puede cumplir; no dice qué pasa.
- **Arreglo:** «hasta un mínimo de Precaria; si ya lo es, no puedes usar esta opción» (o permitir bajar otro sistema).

### G45. e906 manda a e910, que supone que despegaste en tu nave
- **Dónde:** e906 (`80-finales.md:121`), e910 (`:157`).
- **Qué pasa:** (a) la prueba 7 es «que la nave te reconozca», pero te vas en el Argo y abandonas la tuya; (b) e910 dice «Vuelves a volar» y «Lo has conseguido», aunque pilota Orla; (c) los 2 Daños de e902 no cuentan para el «0–1 Fallos», así que puedes fallar la huida y aun ganar.
- **Arreglo:** dar a e906 su propio desenlace (o adaptar e910), quitar la prueba 7 y contar los Daños de e902.

### G46. e915 da un epílogo humano a la Mente
- **Dónde:** e915 (`80-finales.md:274`).
- **Qué pasa:** la Mente es un dron de reparación (r104: «Cuerpo de metal», Blindaje 2, Daño en vez de Heridas, no come ni duerme). «Envejeces» y «con tus propias manos» no le corresponden; solo la Mente con `UNIDAD_DE_PRIMO` recibe un epílogo de máquina.
- **Arreglo:** añadir una rama para la Mente sin `UNIDAD_DE_PRIMO` (o prohibirle ese final).

### G47. e911 da Ventaja automática a la Mente
- **Dónde:** e911 (`80-finales.md:220`).
- **Qué pasa:** «(con Amara o la Mente a bordo: Ventaja)». Si juegas la Mente, «la Mente a bordo» es siempre cierto: la prueba final tiene Ventaja garantizada.
- **Arreglo:** «con Amara a bordo, o si eres la Mente».

### G48. e824 «seguir en el dron» no deja Marca
- **Dónde:** e824 (`70-historias.md:296`), e910 (`80-finales.md:160`).
- **Qué pasa:** e910 lee «Si seguiste en el dron», pero e824 opción 2 no anota nada; y e824 se lee en el Reloj 10, así que una partida que despegue antes nunca toma esa decisión.
- **Arreglo:** anotar `SIGUE_EN_EL_DRON` en e824 o convertir «seguir en el dron» en la opción por defecto.

### G49. e910 no cubre los Secretos 1, 3 y 5
- **Dónde:** e910 (`80-finales.md:204-208`), e903 (`:203`).
- **Qué pasa:** el epílogo del Secreto solo cubre 2, 4 y 6. Faltan las líneas para 1, 3 y 5, y e903 permite elegir Regreso con cualquier Secreto. Además, el encabezado dice «solo si lo descubriste» pero el último punto es «Si no descubriste el Secreto».
- **Arreglo:** añadir las líneas 1/3/5 y quitar la restricción del encabezado.

### G50. e816 «pedir tiempo» no deja Marca
- **Dónde:** e816 (`70-historias.md:229`), e900 (`80-finales.md:11`).
- **Qué pasa:** e900 pregunta «Si eres el Nativo con ARRAIGO 6 y elegiste “pedir tiempo” en e816», pero e816 no anota nada. Con Arraigo 6 no se puede saber si elegiste aceptar (Hogar), rechazar o pedir tiempo.
- **Arreglo:** anotar `PIDIO_TIEMPO` en la opción 3 de e816 y consultarla en e900.

### G51. e920 permite seguir jugando contra r196 y sin hoja para el relevo
- **Dónde:** e920 (`80-finales.md:349`), r196 (`01-reglas.md:864`).
- **Qué pasa:** r196 dice que la partida termina al caer sin Temple (e920); e920 ofrece seguir con un compañero, pero el relevo no tiene Heridas, Canto, Reputación, Lealtad ni contador personal, y e910 («Sobre ti») está escrito por protagonista, no por compañero.
- **Arreglo:** mover la regla a r196 como variante opcional y dar hoja completa al relevo, o eliminar la continuación.

### G52. e918: ver B13.
### G53. e900/e910: ver B12.

## 2.7. Asentamientos y facciones

### G54. e407 cierra con «Te vas» después de opciones que te dejan entrar
- **Dónde:** e407 (`30-asentamientos.md:142`).
- **Qué pasa:** la frase «Te vas sin mirar atrás» es incondicional; en la opción 2 (soborno) y en la 3 con Éxito el jugador entra. El cierre contradice las opciones.
- **Arreglo:** moverlo bajo la opción 1 o borrarlo.

### G55. e415 dice «no hay negociación» y luego ofrece negociaciones
- **Dónde:** e415 (`30-asentamientos.md:241-245`).
- **Qué pasa:** con `MATASTE_A_LA_MADRE`: «no hay negociación… Aunque ganes, hoy no entras». Debajo siguen «Pedir perdón» y «Dejar una ofrenda», que son negociaciones.
- **Arreglo:** añadir «solo si no tienes `MATASTE_A_LA_MADRE`» a las opciones 2–3, o quitar «no hay negociación».

### G56. e411 no tiene rama para ARRAIGO 3
- **Dónde:** e411 (`30-asentamientos.md:186`), r103 (`01-reglas.md:118`).
- **Qué pasa:** el Nativo empieza con ARRAIGO 3; la opción 3 solo dice «si es 4 o más» y «si es 2 o menos». En la primera visita, un Nativo con 3 no obtiene nada.
- **Arreglo:** añadir una rama para 3.

### G57. e411 pide llevar a los Mirasoles y e413 lo penaliza
- **Dónde:** e411 (`30-asentamientos.md:186`), e413 (`:217`).
- **Qué pasa:** con ARRAIGO 4+, la Madre te pide que lleves contigo a los Mirasoles → e413; e413.1 da −1 Reputación con los Hijos «la Madre no está contenta» si los llevas. La Madre castiga exactamente lo que pidió.
- **Arreglo:** quitar el −1 Rep si el encargo está activo, o que e411.3 no lo pida.

### G58. La seta de la Madre tiene tres premios distintos
- **Dónde:** e267 (`23-bosque.md:134`), e411 (`30-asentamientos.md:184-187`).
- **Qué pasa:** e267 promete «cualquier cosa que tenga Quilla (incluido un sistema)»; e411.4 limita a Motor/Soporte vital Excelente; e411.2 ofrece +2 Reputación por el mismo encargo. Tres precios distintos para la misma seta.
- **Arreglo:** hacer que e267 remita a e411.4 y quitar el +2 de e411.2, o separar la seta como encargo con su propio premio.

### G59. `JARDINERO`: ver G6.
### G60. La túnica bendita: ver G29.

### G61. El Nodo no es un asentamiento, pero r150/r160 lo tratan como tal
- **Dónde:** e430 (`30-asentamientos.md:391`), r150 (`01-reglas.md`), r160 (`:575`), r104 (`:135`).
- **Qué pasa:** e430 dice «No es un asentamiento: no hay comercio»; r150 lo lista como asentamiento y r160 lo trata como tal. Además, r104 dice que recargar por completo cuesta 2 Chatarra y e430 da la recarga de la Mente gratis.
- **Arreglo:** «Es un asentamiento sin comercio» y cobrar 2 Chatarra (o marcar la excepción).

### G62. e432 «Ninguno»: ver B11.

### G63. `CAZADO_…`: ver G28.
### G64. `EXPULSADO_DE_LOS_CAÑONES`: ver G4.
### G65. «Los Vigías no entran en el Bosque» contradice la tabla del Bosque
- **Dónde:** e645 (`55-facciones.md:115`), e260 (`23-bosque.md`).
- **Qué pasa:** la tabla del Bosque incluye e035 (patrulla de Vigías) en la fila 9, Alerta 4; e035 se titula «Cualquier región».
- **Arreglo:** quitar la frase o quitar e035 de la tabla del Bosque.

### G66. El Vigía compañero no dice «no consume Raciones»
- **Dónde:** e327 (`26-ciudad.md:100`), r136 (`01-reglas.md:360`), r185.
- **Qué pasa:** r136 dice que cada compañero consume 1 Ración; e327 sí especifica «no consume Raciones», pero el Vigía de e646 no.
- **Arreglo:** añadir «no consume Raciones».

### G67. El Atrio no tiene compraventa, pero dos eventos venden allí
- **Dónde:** e420 (`30-asentamientos.md:291`), e342 (`27-torres.md:45`), e052 (`11-comunes.md:417`).
- **Qué pasa:** e420 solo ofrece sanador, descanso y rumores; e342 dice que en el Atrio compran la lente por 10 Chatarra y e052 que las esporas valen 2 Chatarra «en Quilla o en el Atrio». No hay servicio de compraventa.
- **Arreglo:** añadir «comprar y vender (r161)» a e420 o cambiar las referencias.

## 2.8. Tablas resumidas y apéndices

### G68. La tabla del día hace pagar Aire al Piloto en la Cicatriz
- **Dónde:** `90-apendices.md:101`, r136 (`01-reglas.md:360`), r102 (`:108`), r182 (`:738`).
- **Qué pasa:** el resumen dice «Piloto: 1 Ración y 1 Aire» sin el calificador; r136 dice «el Aire solo fuera de la Cicatriz y de los asentamientos» y r182 que en la Cicatriz «no gastas Aire». Quien juegue con el resumen quema Aire donde es gratis.
- **Arreglo:** añadir el calificador.

### G69. La tabla del día se salta el +1 Canto de las Torres
- **Dónde:** `90-apendices.md:101`, r131 (`01-reglas.md:312`).
- **Qué pasa:** r131 tiene cuatro pasos y el tercero es «Las Torres: +1 Canto». El resumen salta del segundo al cuarto.
- **Arreglo:** añadir «· Torres: +1 Canto ♫».

### G70. La tabla de combate no dice qué pasa en un empate
- **Dónde:** `90-apendices.md:109`, r140 (`01-reglas.md:408`).
- **Qué pasa:** la diferencia 0 no aparece; es el caso más frecuente en 2d6 contra 2d6. r140 dice «Empate: nadie golpea».
- **Arreglo:** añadir «empate (0): nadie golpea».

### G71. La Alerta solo sube por «combates ruidosos»
- **Dónde:** `90-apendices.md:118`, r145 (`01-reglas.md:456`).
- **Qué pasa:** r145 también la sube si el combate duró más de 3 rondas, aunque nadie usara arma ruidosa.
- **Arreglo:** «…o de más de 3 rondas (r145)».

### G72. Improvisar sin la excepción de la Luz fría
- **Dónde:** `90-apendices.md:121`, r203 (`01-reglas.md:958`).
- **Qué pasa:** el resumen autoriza a improvisar 2 piezas por 1; r203 dice «La Luz fría no se puede sustituir».
- **Arreglo:** añadir la excepción.

### G73. La tabla del Secreto no cubre los empates
- **Dónde:** `90-apendices.md:115`, e840 (`70-historias.md:377`).
- **Qué pasa:** con 3 fragmentos y 6 verdades, el empate es el caso más probable; e840 lo resuelve con «la del último fragmento anotado», y el resumen lo omite.
- **Arreglo:** añadir «empate: la del último fragmento anotado; sin fragmentos, 1d6».

### G74. La hoja no marca el modificador ni la restricción de Crítico
- **Dónde:** `90-apendices.md:16`, r106 (`01-reglas.md:185`).
- **Qué pasa:** el resumen marca −1 y −2 en los dos niveles anteriores y deja el peor sin penalizador, como si fuera cosmético.
- **Arreglo:** «□ Crítico(−2)» y una nota «solo Viajar a la Cicatriz».

### G75. La hoja se queda corta para implantes, mutaciones y protocolos
- **Dónde:** `90-apendices.md:32-33`, r103 (`01-reglas.md:118`), r190 (`:794`).
- **Qué pasa:** el Nativo gana mutaciones sin tope; las ranuras de implante del Piloto llegan a 4; la Mente empieza con 2 protocolos y gana uno por mejora. La hoja tiene tres líneas.
- **Arreglo:** dejar la línea abierta («1-4» + renglón libre) o añadir dos casillas más.

### G76. Las tablas de e500–e517 no indican región ni tiempo
- **Dónde:** `40-pecios-sistemas.md:9` y siguientes.
- **Qué pasa:** r003 exige que cada evento indique región y tiempo; las 18 salas solo dicen el tipo de pecio. No se sabe si consumen el día. Además, la sección dice «con un 11» pero r171 también manda aquí con un 10 en el Pecio sin nombre.
- **Arreglo:** añadir «*La región del pecio · ⌛ 0*» y «con un 11 (o un 10 en el Pecio sin nombre)».

---

## 2.9. Otras reglas base y maqueta

### G77. No se puede desmontar una reliquia «en lugar de usarla»
- **Dónde:** r193 (`01-reglas.md:834`), r206 (`:1005`), r202 (`:951`).
- **Qué pasa:** r193 dice que la reliquia se identifica «la primera vez que la uses». r202 permite «desmontarla en lugar de usarla» para aprender un plano, pero para identificarla hay que usarla; no existe un procedimiento de identificación sin uso. r206 vuelve a exigir que esté «identificada».
- **Arreglo:** permitir desmontar una reliquia sin identificar (aprendiendo el plano) o añadir una prueba de identificación previa.

### G78. Los atributos de Sela suman 12, pero deberían sumar 13
- **Dónde:** r100 (`01-reglas.md:72`), r102 (`:100`), r198 (`:876`).
- **Qué pasa:** r100 manda repartir 12 puntos y luego aplicar el +1 Reflejos del Piloto; Sela tiene Vigor 3, Reflejos 4, Ingenio 3 y Voluntad 2 = 12, no 13. El ejemplo usa un personaje que se queda un punto por debajo de la creación legal.
- **Arreglo:** subir Voluntad a 3 (no afecta a las tiradas del ejemplo) o bajar otro atributo y anotar el +1.

### G79. r181 «Mejorar» no fija techo ni consecuencias del Fallo
- **Dónde:** r181 (`01-reglas.md:729`).
- **Qué pasa:** «gasta 3 Chatarra y haz [Ingenio · 11]. Con un Éxito, sube 1 de calidad». No dice si el máximo es Excelente, qué pasa si ya es Excelente, ni si el Fallo consume las 3 Chatarra (r120 solo dice «no pasa nada»).
- **Arreglo:** «máximo Excelente; con Fallo pierdes la Chatarra y no sube; no se puede intentar en un sistema Excelente».

### G80. Despegar no está en la lista de acciones del día
- **Dónde:** r132 (`01-reglas.md:318`), r183 (`:746`), r184 (`:751`).
- **Qué pasa:** r132 presenta ocho acciones como lista cerrada; el despegue no está. r183 y r184 lo llaman «acción del día».
- **Arreglo:** añadir «Despegar (solo en la Cicatriz, con los seis sistemas o el despegue desesperado) | r183–r184».

### G81. Las tablas de `maqueta/extras.py` cobran Aire/Energía en la Cicatriz y añaden una fuente de Alerta inexistente
- **Dónde:** `maqueta/extras.py:395` y `:399`.
- **Qué pasa:** el panel «Al amanecer se gasta» dice «Piloto: 1 Ración y 1 Aire» y «Mente: 1 Energía» sin las excepciones de la Cicatriz; y «La Alerta sube con ◉, el ruido y **lo antiguo**»: «lo antiguo» no es una fuente de Alerta en ninguna regla (el Arca da Canto, no Alerta).
- **Arreglo:** añadir «fuera de la Cicatriz» a Piloto/Mente y quitar «lo antiguo».

### G82. La hoja del Reloj no cubre los modos de 70/40 ni las fechas de historia
- **Dónde:** `90-apendices.md:22`, r210 (`01-reglas.md:1021`), r109 (`:239`), `construir_pdf.py:787`, `:802`, `:813`.
- **Qué pasa:** la hoja arranca en 60 y dibuja 60 casillas; Clemencia empieza en 70 y Desesperado en 40. Los «días de historia» están fijados a 50/40/30/20/10 aunque los modos usan otras fechas.
- **Arreglo:** añadir la decena 61–70 y una nota para reescribir los días de historia según el modo.

### G83. La puntuación de r196 no incluye el +3 de `AMARA_TENIA_RAZON`
- **Dónde:** e611 (`50-tripulacion.md:170`), r196 (`01-reglas.md:866`).
- **Qué pasa:** e611 promete «en la puntuación, suma 3»; r196 no lo recoge.
- **Arreglo:** añadir «+3 con `AMARA_TENIA_RAZON`».

### G84. Pequeñas inconsistencias de reglas base
- **r160** (`:571`): «cualquier número de servicios» choca con los rumores «una vez por visita» (r164).
- **r302** (`02-plantillas.md:36`): promete una Pista de la tabla de rumores, pero la fila 7 de r164 no tiene Pista ni eXXX.
- **r210** (`:1023`): Leyenda empieza con Alerta 1 y dice «nunca baja de 2»; las reglas de creación la ponen en 1.
- **r156** (`:560`): la hoja de los Apéndices no tiene campo para las tres figuras de «Viejos conocidos»; la del PDF sí.
- **r154** (`:506`): viaje de dos regiones no dice dónde se resuelve el Fallo de Orientación.
- **r118** (`:156`): «Gafas de vuelo (Ventaja contra el resplandor)»: no hay regla de «resplandor».
- **r137** (`:378`): «♫» se usa como sinónimo de «prueba de Voluntad», pero e425 tiene un `[Vigor · 9]` con ♫.
- **`02-plantillas.md`**: faltan r307, r313 y r317; el índice anuncia r300–r319.

---

# 3. Moderados

> Se pueden resolver con sentido común, pero conviene fijarlos antes de imprimir. Se agrupan por archivo.

## 3.1. Reglas base (`01-reglas.md`, `02-plantillas.md`)

| # | Dónde | Hallazgo | Arreglo |
|---|---|---|---|
| M1 | r106:188 / r122:276 / r190:794 | Temple máximo 3 vs 4 (ver B9) | Unificar |
| M2 | r133:335 | «Si descansaste a la intemperie» no aclara si dormir en un vehículo cuenta como refugio | Decir «vehículo no cuenta» o incluirlo |
| M3 | r135:353 | Ocultarte «también tiras por la noche»: no se sabe si cuenta como descanso | Aclarar que no recupera |
| M4 | r136:364 | La tabla de Mente dice 1 Energía al amanecer, pero r104/r182 dicen que en la Cicatriz recupera 1 | Añadir «solo fuera» |
| M5 | r141:420 | Hablar omite Voz de la nave / Voz de los Antiguos (ver B8) | Añadir |
| M6 | r142:433 | «Tu daño» vs «su daño» en el ejemplo de Enjambre (r198) | Unificar |
| M7 | r143:440 | Un compañero muere y no se recuerda +1 CULPA / tachar ficha | Añadir |
| M8 | r153:520 | «Forrajeas con Ventaja»: Forrajear es un Hallazgo fijo, no una prueba | Cambiar por «+3 Raciones» o eliminar |
| M9 | r160:575 | «Lee la entrada Rechazado»: el Nodo tiene «Intruso» (e434) | Nombrar e407/e415/e421/e434 |
| M10 | r161:597 | Regatear «la compra» no distingue por objeto o por total | Aclarar |
| M11 | r162:604 | Taller no dice qué pasa si el sistema ya es Sólido; e430 contradice (B6) | Aclarar |
| M12 | r163:611 | Sanador no cura `ESPORAS`/`DEDOS_HELADOS`, pero e052/e569 lo usan | Añadir servicio |
| M13 | r170:648 / r171:655 | Arca «Reliquia también con 9» y Pecio «especial también con 10» no dicen qué pasa con Equipo/Reliquia de la tabla | Reescribir la excepción |
| M14 | r180:721 | «Otras vías» ya está corregido; queda «sistema personal» como Hallazgo sin evento | Ver G19 de historias |
| M15 | r185:767 | Noemí solo «Ventaja para instalar»; r203 le da Ventaja para Ensamblar | Ampliar ficha o quitar |
| M16 | r186:779 | Lealtad 0–3, pero e626 da +2 sin tope | Añadir tope |
| M17 | r190:794 | Hito por evento ★: los ★ están en una sola opción de cada evento de lealtad | Poner ★ en la cabecera o en todas las opciones |
| M18 | r191:807 | `VERSALITAS` se renderiza como Marca (G26) | Quitar backticks |
| M19 | r192:816 | Pista `Región · Nombre · eXXX`: varios eventos usan «esta región» | Escribir la región real |
| M20 | r193:830 | Identificación de reliquias: e326/e330 regalan la fila 12–13 sin tirada | Exigir tirada o consumir reliquia |
| M21 | r195:859 | Mente sin regla de caída (B7) | Añadir rama |
| M22 | r198:894 | «Tres Heridas» (G18) | Corregir |
| M23 | r201:926 | Llevar 10 piezas: no se dice qué pasa si ganas más estando al máximo | Añadir «descarta el exceso» |
| M24 | r203:958 | «Hasta dos planos pequeños»: no se dice si son dos pruebas o una | Aclarar |
| M25 | r203:960 | Noemí/Amara dan Ventaja para Ensamblar, no está en r185 | Ampliar r185 |
| M26 | r206:1003 | Desmontar arma/protección «Cobre o Hueso, según sea»: una lanza de luz fría (Antiguo) no da Luz fría | Aclarar |
| M27 | r210:1017 | Modos de dificultad y modos de r109 se mezclan; solo se aclara el Reloj | Aclarar Temple/Alerta |
| M28 | r211:1028 | Partida corta da un compañero que puede duplicar al del Piloto | Elegir uno |
| M29 | r212:1034 | `ALGUIEN_LO_LOGRO`/`TE_RECUERDAS` sin implementación (G8) | Implementar o quitar |
| M30 | r213:1047 | «Coro en procesión»: si ninguno de los dos encuentros tiene [Cantor], no dice cuál usar | Aclarar |

## 3.2. Prólogo y eventos comunes (`10-prologo.md`, `11-comunes.md`, `12-conocidos.md`)

| # | Dónde | Hallazgo | Arreglo |
|---|---|---|---|
| M31 | e005:99 | «Sube la Alerta a 2» no hace nada en Desesperado/Leyenda si ya está en 2 | «Sube 1 (máximo 2); si ya estaba, Reloj −1» |
| M32 | e008:155 | El Fallo de la prueba ♫ no cuesta nada | Añadir +1 Canto o pérdida de acción |
| M33 | e032:120 | «Pieza de motor» no existe como objeto ni pieza | Definir como Pista o «pieza del Motor» |
| M34 | e036:187 | La regla de `DEUDAS` va después de las opciones y anula lo elegido | Mover al inicio |
| M35 | e038:214-215 | 1d6 «por los que aún no has encontrado» sin tabla; el Fallo no cubre «ya están todos» | Fijar tabla y caso vacío |
| M36 | e044:299 | «+2 Chatarra en cristal fino»: ¿Cristal o Chatarra? | «+2 Cristal» |
| M37 | e045:316 | «menos de 6 tripulantes» no contempla plazas ni pasajeros | «si te queda una plaza en e900» |
| M38 | e049:371 | Pista que no se borra + +3 Raciones = comida infinita | Limitar a una vez |
| M39 | e051:404 | «Protocolo copiado» no existe en las reglas | Definir o quitar |
| M40 | e052:415 | El sanador no cura `ESPORAS` (M12) | Añadir servicio |
| M41 | e053:428 | «La región de un tripulante» sin decir cuál | Elegir uno |
| M42 | e054:439 | Éxito y botín en la misma frase; el Fallo no dice qué pasa con la mochila | Separar |
| M43 | e056:471 | «Llevar un sistema pesado sin penalización» sin Marca ni alcance | Anotar `DRON_DE_CARGA` y definirlo |
| M44 | e058:494 | Pista que no se borra + +3 Raciones + descanso gratis | Limitar a una vez |
| M45 | e059:511 | `DORMIDO_ATADO` no se consulta al llegar a la Cicatriz | Consultar en r182 |
| M46 | e061:40 | El saqueo de los dormidos no tiene consecuencia en e062/e063 | Anotar Marca o borrar la promesa |
| M47 | e064:94 | «(1 Ración o 1 Chatarra: come las dos cosas)» se contradice | «1 Ración **y** 1 Chatarra» o «o» |
| M48 | e064:90 | «+1 Hueso (si usas el taller, r201)»: r201 no es el taller; el cable de cobre debería ser Cobre | Corregir referencias/unidades |
| M49 | e070:203 | Salvar a la nieta con la opción 2 no da `DEUDA_DE_LOS_MIRASOLES` y e071 no lo reconoce | Dar la Marca o añadir condición |
| M50 | e071:222 | El espejo de la matriarca no tiene efecto | Convertirlo en objeto o quitarlo |
| M51 | e063:74 | «Si tienes al menos 2 FRAGMENTO_ → e840» frente a los 3 de r191 | Unificar umbral |
| M52 | e068:189 | El trepador de los Mirasoles no repite «no puede entrar en la Ciudad Enterrada» | Añadir límite |

## 3.3. Regiones 1–4 (`20-dunas.md` a `23-bosque.md`)

| # | Dónde | Hallazgo | Arreglo |
|---|---|---|---|
| M53 | e203:69 | Nocturna con 8+ y «aunque estés en las Dunas», contra r133 (9+) y r182 (Cicatriz no tira) | Declarar excepción o unificar |
| M54 | e210:172 | Compañeros en la Cicatriz luchan y dan +1 sin tope, contra r182/r143 | Limitar a 2 y usar r143 |
| M55 | e203:65 | `RATAS_AMIGAS` solo remite a la opción 4, abierta a todos | Hacer la opción 4 exclusiva o dar otro beneficio |
| M56 | e228:33 | `EN_PUERTO_CHATARRA` solo se consulta para Iria/Bruno/Amara/Noemí; Tadeo/Lio no tienen rama | Restringir la elección |
| M57 | e224:86 | La opción de combustible no da nada si ya tienes Combustible y no tiene Fallo | Añadir alternativa |
| M58 | e221:71 | La pieza de la grúa no sirve si ya tienes Motor y Combustible | Añadir +3 Chatarra o elegir |
| M59 | e268:90 | Leer el nombre de la nave solo da algo al Nativo; sin Fallo | Dar fragmento/Pista a todos |
| M60 | e222:45 | Las baterías valen 4 y r201/e046 dicen 6 | Unificar |
| M61 | e230:164 | «Pagar 3 Chatarra» no devuelve el sistema; el paréntesis dice 4 | Separar precios |
| M62 | e231:181 | Dar un sistema «instalado» no tiene regla de desinstalación | «solo llevado» |
| M63 | e242:69 / e250:174 | Eventos ⌛ 0 que consumen el día o dan descanso completo | Pasar a ⌛ día |
| M64 | e269:40 | Ganar contra los Jardineros no da nada y anota Marca negativa | Dar botín normal |
| M65 | e267:134 | «Cualquier cosa que tenga Quilla» vs e411 (solo Motor/Soporte) | Remitir a e411 |
| M66 | e202:51 | «Baja 1 de calidad» sin suelo si el sistema es Precario | «si es Precario, se pierde» |
| M67 | e247:116 | Cápsula sellada que e606 abre sin transición | Añadir «la abrís» |
| M68 | e248:146 | Fallo de sabotaje: combate sin decir si sueltas el bidón | Añadir «si ganas, lo coges» |
| M69 | e203:65 | `RATAS_AMIGAS` no cambia nada (M55) | — |

## 3.4. Regiones 5–8 (`24-polo.md` a `27-torres.md`)

| # | Dónde | Hallazgo | Arreglo |
|---|---|---|---|
| M70 | e282:48 | Éxito devuelve a la tabla con ⌛ 0; se pueden encadenar encuentros y recursos | Limitar a una vez o ⌛ +1 |
| M71 | e286:106 | Se puede repetir la estación destruida y cobrar 5 Chatarra + batería | Anotar `ESTACION_MUERTA` |
| M72 | e286:5 | El refugio del Polo no coincide con r155 (cueva/pecio) y sigue contando la estación destruida | Remitir a r155 + `ESTACION_MUERTA` |
| M73 | e330:169 | El fragmento se gana antes de elegir; la opción 1 solo cuesta +1 Canto | Mover el fragmento a la opción 1 |
| M74 | e284:77 | +1 MEMORIA para quien no es la Mente | «si eres la Mente, además +1 MEMORIA» |
| M75 | e326:108 | Identificación gratuita de la fila 12–13; no consume reliquia | Exigir tirada/consumo |
| M76 | e347:76 | «El pulso del Canto» ambiguo; la tercera TORRE_ROTA solo se comprueba aquí | Citar r131.4 y llevar contador |
| M77 | e350:169 | Matar a La Voz no deja Marca; e350/e644 siguen vivos | Anotar `LA_VOZ_MUERTA` |
| M78 | e309:145 | `SABES_DE_LAS_TORRETAS` no se puede usar (G7) | Usarla en otra torreta |
| M79 | e326:122 | «−2 Reputación mientras lo lleves» no es rastreable | Aplicar al reclutar/devolver |
| M80 | e347:123 | Pruebas sin Fallo en eventos repetibles | Añadir Fallo o cerrar intento |
| M81 | e347:33 | «Desventaja» definida como «+1 al dado» | Aclarar si es 3d6 o +1 |
| M82 | e289:79 | «No ve el calor» contra la Mente de metal | Reescribir el sentido |
| M83 | e347:125 | «Tacha su ficha» pero se recupera en e628 | Anotar `LIO_EN_EL_CORO` |
| M84 | e281:37 | La ofrenda no cuesta nada y `OFRENDA_AL_POZO` no se consulta | Perder el objeto |
| M85 | e284:80 | `BESTIA_DE_HIELO` no se consulta en la regla del Polo | Añadirla a los refugios |
| M86 | e290:105 | «+1 calidad» sin tope | máximo Excelente |
| M87 | e290:93 | ◉ y ⌛ sin efecto declarado | Explicitar |
| M88 | e303:64 | «Si la tuya no está conseguida»: pronombre sin antecedente; sin Fallo | «si no tienes Navegación»; añadir Fallo |
| M89 | e323:63 | «Dos FRAGMENTO_ a elegir entre dos» | «gana los dos» o «uno de los dos» |
| M90 | e350:167 | Tercer fragmento va a e840 aunque lleves a Amara | Añadir «con Amara, primero e611» |
| M91 | e290:159 | Doble «si no» y salto al puente sin entrar | Reescribir |
| M92 | e351:155 | «Baja 1 de calidad» sin suelo | mínimo Precaria |
| M93 | e303:129 | «3 Chatarra» sin verbo | «Ganas 3 Chatarra» |
| M94 | e284:65 | `DESGUACE_HELADO` sin reglas de acompañante | Definir límite/Raciones |
| M95 | e306:175 | Fallo sin consecuencia | −1 Rep o cerrar intento |
| M96 | e323:49 | «Amara: automático» contradice su Ventaja | «Amara: Ventaja» |
| M97 | e288:132 | Doble ★ por el mismo descubrimiento | Quitar uno |
| M98 | e343:64 | «1 de Canto» y orden con Canto 6 | «+1 Canto» y aclarar orden |
| M99 | e326:61 | «O un manual de navegación» sin elección | «Elige:…» |

## 3.5. Asentamientos, facciones y pecios

| # | Dónde | Hallazgo | Arreglo |
|---|---|---|---|
| M100 | e403:70 | Bucle de reliquias (B5) | Corregir |
| M101 | e403:72 | Implante sin ranura/prueba (G14) | Añadir |
| M102 | e407:142 | Cierre contradictorio (G54) | Mover |
| M103 | e411:186 | ARRAIGO 3 sin rama (G56) | Añadir |
| M104 | e411:186 | Mirasoles pedidos y penalizados (G57) | Quitar penalización |
| M105 | e411:184 | Seta con tres premios (G58) | Unificar |
| M106 | e413:217 | `INSTALACION_GRATIS` duplicada (G27) | Unificar |
| M107 | e416:259 | `JARDINERO` muerta (G6) | Consultar |
| M108 | e420:365 | Túnica bendita sin registro (G29) | Registrar |
| M109 | e420:291 | Atrio sin compraventa (G67) | Añadir |
| M110 | e430:396 | Taller contradice r162 (B6) | Corregir |
| M111 | e430:391 | Nodo no es asentamiento / recarga gratis (G61) | Aclarar |
| M112 | e432:429 | «Ninguno» sin salida (B11) | Añadir |
| M113 | e433:445 | `ENCARGO_DE_REPARAR` no se cuenta (G2) | Añadir |
| M114 | e433:415 | «ver e900» erróneo (G3) | e901–e902 |
| M115 | e641:30 | `CAZADO_` no se borra (G28) | Borrar |
| M116 | e641:32 | `EXPULSADO_` no se comprueba (G4) | e410 |
| M117 | e645:115 | Vigías en el Bosque (G65) | Quitar |
| M118 | e646:44 | Vigía compañero no dice Raciones (G66) | Añadir |
| M119 | e507:105 | Opción sin Fallo y «conseguida» | Añadir Fallo, «instalada» |
| M120 | e511:157 | Partitura sin rama si no tienes `PARTITURA_INCOMPLETA` | Añadir rama |
| M121 | e512:171 | Umbral 2 vs 3 (G1) | 3 |
| M122 | e515:210 | Combate sin desenlace (G16) | Añadir |
| M123 | e563:294 | Motor Sólido sin «(pesado)» | Añadir |
| M124 | e567:347 | Opción 3 dominada (G37) | Rediseñar |
| M125 | e569:375 | Opción 3 sin rama para no-Mente/no-SAL | Cerrar opción |
| M126 | e603:66 | Fallo = Éxito (G17) | Quitar ★ |
| M127 | e608:136 | Sin `PERDIDO_` (G35) | Añadir |
| M128 | e610:156 | Fragmentos ya ganados / sin mapeo | Mapear y «elige uno que no tengas» |
| M129 | e617:250 | Premio solo en la Cicatriz | Diferir |
| M130 | e618:266 | Ingenio en prueba de otro atributo (G33) | Usar atributo |
| M131 | e625:344 | e626 sin Lio (B3) | Condicionar |
| M132 | e626:362 | Combate sin desenlace (G16) | Añadir |

## 3.6. Catálogo, historias y finales

| # | Dónde | Hallazgo | Arreglo |
|---|---|---|---|
| M133 | e714:70 | Quinto nivel de Heridas (G22) | Regla/casilla |
| M134 | e719:90 | Defecto sin castigo real | Dar coste |
| M135 | e720:94 | Ventaja al Hablar con Bestia, prohibido | Condicionar |
| M136 | e748:179 | Instala Motor sin procedimiento | Definir |
| M137 | e749:183 | Promete respuesta y e840 da Secreto aleatorio | Elegir verdad |
| M138 | e761:205 | Receta más cara que comprar (G13) | Bajar coste |
| M139 | e711:58 | Ventaja contra Noche helada sin tirada | Cambiar efecto |
| M140 | e802:50 | Pista muere en e288 | Añadir rama |
| M141 | e803:60 / e807:123 | Caja negra Precaria vs tirada | Condicionar |
| M142 | e804:83 | Doble CULPA con e900 (G42) | Unificar |
| M143 | e804:85 | «Hacer sitio» sin Marca (G43) | Anotar |
| M144 | e804:85 | Bajar calidad ya Precaria (G44) | Aclarar |
| M145 | e816:229 | «Pedir tiempo» sin Marca (G50) | Anotar |
| M146 | e823:277 | Revelación incompatible con MEMORIA ≤2 | Condicionar |
| M147 | e824:296 | «Seguir en el dron» sin Marca (G48) | Anotar |
| M148 | e845:450 | Condicional anidado sin Fallo | Desglosar |
| M149 | e846:464 | +6 Temple por encima del máximo | «hasta el máximo» |
| M150 | e900:16 | 7 pruebas vs 6 sistemas (G41) | Aclarar |
| M151 | e900:26 | Noemí/Iria ayudan en pruebas que sus fichas no cubren | Ampliar r185 |
| M152 | e900:37 | Muertos del viaje (B12) | Anotar |
| M153 | e900:9 | CULPA doble (G42) | Unificar |
| M154 | e900:9 | «8 si e804» sin Marca (G43) | Anotar |
| M155 | e901:52 | Coro no es ataque; Ayudas lo anulan «como ataque» | Aclarar |
| M156 | e906:121 | Argo/e910 (G45) | Adaptar |
| M157 | e910:159 | ARRAIGO 3 sin franja | Añadir |
| M158 | e910:163 | Muertos (B12) | Condicionar |
| M159 | e910:165 | Bruno cría a una niña que puede no estar | Condicionar |
| M160 | e910:204 | Secretos 1/3/5 (G49) | Añadir |
| M161 | e911:220 | Mente Ventaja automática (G47) | Aclarar |
| M162 | e914:258 | Bucle a e900 y sin resultado | Reescribir |
| M163 | e914:260 | Hogar con MATASTE/Quilla hostil | Rama |
| M164 | e915:274 | Mente «envejece» (G46) | Rama |
| M165 | e917:298 | Teletransporte a la torre | Restringir |
| M166 | e918:315 | Destruye Caribdis y e910 (B13) | Epílogo propio |
| M167 | e920:349 | Continuación contra r196 (G51) | Mover a r196 |
| M168 | e908:142 | Dos reglas de legado (ESTRELLA_FUGAZ vs r212) | Unificar |

---

# 4. Menores

> Erratas, repeticiones, precios duplicados y remisiones que no impiden jugar. Se listan para una pasada final de estilo.

## 4.1. Índice, portada y mundo

- `91-indice-marcas.md:6`: las familias `RUTA_`, `PERDIDO_` y `FRAGMENTO_` no se listan; la cabecera no avisa.
- `91-indice-marcas.md:139-140` y `:157-158`: `FRAGMENTO_LA_MADRE`/`_2` y `FRAGMENTO_LA_VOZ`/`_2` se distinguen por numeración de código; al contar pueden confundirse.
- `91-indice-marcas.md:248`: `RUTA_SALINAS` es un ejemplo, no una Marca obtenible.
- `03-mundo.md:28`: «Mendieta» vs «Sal Mendaña» (probable errata).
- `03-mundo.md:42`: «Cada náufrago tiene la suya» choca con «la Cicatriz» como topónimo único.
- `00-portada.md:56`: la lista de Apéndices omite el Bestiario y dice «Hoja de personaje» en vez de «Hoja de protagonista».
- `00-portada.md:16-54`: ese índice no se imprime (se sustituye por `@@INDICE@@`); nada valida sus rangos.
- `90-apendices.md:101`: falta «Torres: +1 Canto» (G69).
- `90-apendices.md:109`: falta el empate (G70).
- `90-apendices.md:118`: falta «>3 rondas» (G71).
- `90-apendices.md:121`: falta la excepción de Luz fría (G72).
- `90-apendices.md:115`: faltan empates del Secreto (G73).
- `90-apendices.md:16`: falta modificador/restricción de Crítico (G74).
- `90-apendices.md:32-33`: faltan ranuras (G75).
- `90-apendices.md:88`: «una raya por cada FRAGMENTO_» no explica los sufijos `_2`.

## 4.2. Eventos comunes y prólogo

- `e005:99`: Alerta a 2 sin efecto en modos altos (M31).
- `e008:155`: Fallo ♫ gratis (M32).
- `e022:37`: «Ignorarlo y recoger» sin objeto directo.
- `e032:120`: «pieza de motor» indefinida (M33).
- `e036:187`: `DEUDAS` al final (M34).
- `e038:214`: 1d6 sin tabla (M35).
- `e042:271`: 2d6+1 (G21).
- `e044:299`: cristal/Chata (M36).
- `e045:316`: plazas (M37).
- `e046:328`: batería +1 Canto (G20).
- `e049:371`: comida infinita (M38).
- `e051:404`: protocolo copiado (M39).
- `e052:415`: sanador/ESPORAS (M40).
- `e053:428`: región de tripulante (M41).
- `e054:439`: éxito/botín (M42).
- `e055:455`: Precio sin salida (B2).
- `e056:471`: sistema pesado sin Marca (M43).
- `e058:494`: comida infinita (M44).
- `e059:511`: `DORMIDO_ATADO` (M45).
- `e061:40`: saqueo sin consecuencia (M46).
- `e064:90/94`: taller/unidades (M47/M48).
- `e070:203`: nieta sin Marca (M49).
- `e071:222`: espejo sin efecto (M50).
- `e063:74`: 2 fragmentos (M51).
- `e068:189`: trepador sin límite (M52).

## 4.3. Regiones

- `e203:69`: nocturna 8 (M53).
- `e210:172`: compañeros sin tope (M54).
- `e203:65`: `RATAS_AMIGAS` (M55).
- `e228:33`: `EN_PUERTO_CHATARRA` (M56).
- `e224:86`: opción vacía (M57).
- `e221:71`: pieza de grúa (M58).
- `e268:90`: nombre de nave (M59).
- `e222:45`: baterías 4 (M60).
- `e230:164`: pagar 3/4 (M61).
- `e231:181`: sistema instalado (M62).
- `e242:69`, `e250:174`: ⌛ 0 con día (M63).
- `e269:40`: sin botín (M64).
- `e267:134`: seta (M65).
- `e202:51`: calidad a Precaria (M66).
- `e247:116`: cápsula (M67).
- `e248:146`: sabotaje (M68).
- `e282:48`: bucle (M70).
- `e286:106`: estación repetible (M71).
- `e286:5`: refugio (M72).
- `e330:169`: fragmento antes de elegir (M73).
- `e284:77`: MEMORIA (M74).
- `e326:108`: reliquia gratis (M75).
- `e347:76`: TORRE_ROTA (M76).
- `e350:169`: La Voz sin estado (M77).
- `e309:145`: torretas (M78).
- `e326:122`: −2 Rep (M79).
- `e347:123`: sin Fallo (M80).
- `e347:33`: Desventaja (M81).
- `e289:79`: calor (M82).
- `e347:125`: tachar Lio (M83).
- `e281:37`: ofrenda (M84).
- `e284:80`: bestia de hielo (M85).
- `e290:105`: +1 calidad (M86).
- `e290:93`: ◉/⌛ (M87).
- `e303:64`: pronombre (M88).
- `e323:63`: dos fragmentos (M89).
- `e350:167`: Amara (M90).
- `e290:159`: doble «si no» (M91).
- `e351:155`: calidad sin suelo (M92).
- `e303:129`: 3 Chatarra (M93).
- `e284:65`: Desguace helado (M94).
- `e306:175`: Fallo (M95).
- `e323:49`: Amara automático (M96).
- `e288:132`: doble ★ (M97).
- `e343:64`: 1 Canto (M98).
- `e326:61`: manual (M99).

## 4.4. Asentamientos, pecios, tripulación

- `e403:70`: bucle (B5).
- `e403:72`: implante (G14).
- `e407:142`: cierre (G54).
- `e411:186`: ARRAIGO 3 (G56).
- `e411:186`: Mirasoles (G57).
- `e411:184`: seta (G58).
- `e413:217`: `INSTALACION_GRATIS` (G27).
- `e416:259`: `JARDINERO` (G6).
- `e420:365`: túnica (G29).
- `e420:291`: Atrio (G67).
- `e430:396`: taller (B6).
- `e430:391`: Nodo (G61).
- `e432:429`: «Ninguno» (B11).
- `e433:445`: encargo (G2).
- `e433:415`: e900 (G3).
- `e507:105`: sin Fallo (M119).
- `e511:157`: partitura (M120).
- `e512:171`: 2 fragmentos (G1).
- `e515:210`: combate (G16).
- `e563:294`: pesado (M123).
- `e567:347`: opción 3 (G37).
- `e569:375`: rama (M125).
- `e603:66`: Fallo (G17).
- `e608:136`: `PERDIDO_` (G35).
- `e610:156`: fragmentos (M128).
- `e617:250`: Cicatriz (M129).
- `e618:266`: Ingenio (G33).
- `e625:344`: Lio (B3).
- `e626:362`: combate (G16).
- `e627:375`: robot de Lio no es Marca/objeto; si se pierde, no hay control.
- `e620:300`: Tadeo perdido (B4).

## 4.5. Catálogo, historias, finales

- `e714:70`: quinto nivel (G22).
- `e719:90`: defecto (M134).
- `e720:94`: Bestia (M135).
- `e748:179`: Motor (M136).
- `e749:183`: respuesta (M137).
- `e761:205`: receta (G13).
- `e711:58`: Noche helada (M139).
- `e802:50`: Pista (M140).
- `e803:60`/`e807:123`: Caja negra (M141).
- `e804:83`: CULPA (G42).
- `e804:85`: sitio (G43/G44).
- `e816:229`: tiempo (G50).
- `e823:277`: MEMORIA (M146).
- `e824:296`: dron (G48).
- `e845:450`: condicional (M148).
- `e846:464`: Temple (M149).
- `e900:16`: 7 pruebas (G41).
- `e900:26`: ayudas (M151).
- `e900:37`: muertos (B12).
- `e900:9`: CULPA/sitio (G42/G43).
- `e901:52`: Coro (M155).
- `e906:121`: Argo (G45).
- `e910:159`: ARRAIGO 3 (M157).
- `e910:163`: muertos (B12).
- `e910:165`: niña (M159).
- `e910:204`: Secretos (G49).
- `e911:220`: Mente (G47).
- `e914:258`: bucle (M162).
- `e914:260`: Hogar (M163).
- `e915:274`: Mente (G46).
- `e917:298`: torre (M165).
- `e918:315`: final (B13).
- `e920:349`: continuación (G51).
- `e908:142`: legado (M168).

---

# 5. Lo que está bien

No todo son problemas. Esta auditoría también confirma:

- **443 entradas presentes**, sin IDs duplicados ni enlaces internos rotos.
- **200 páginas** estables y **364 encabezados** en las mismas páginas.
- **Índice de Marcas reproducible**: las 271 filas cuadran con los usos reales; los 91 fragmentos están mapeados a sus seis verdades; ningún fragmento apunta a un evento inexistente.
- **Bestiario** sin duplicados de nombre con estadísticas distintas.
- **Mapa de regiones** coherente; todas las regiones tienen tabla y las tablas usan eventos existentes.
- **Sistema de combate** claro y completo (r140–r146), con etiquetas bien definidas.
- **Sistema de Canto** coherente en lo esencial (subida, bajada, eventos a 6).
- **Economía de piezas** bien pensada (10 piezas, 4 tipos, recetas y grandes obras).
- **Finales** con variedad real y condiciones legibles en su mayoría.
- **Texto** con una voz consistente y muy buena legibilidad; los problemas son de precisión, no de escritura.

---

# 6. Plan de corrección recomendado

Si hubiera que priorizar antes de imprimir:

### Fase 1 — Bloqueantes (1–2 días)
1. B1: meter e040/e057/e058 en las tablas (y corregir e058).
2. B2: añadir las salidas que faltan en e055/e306/e325/e343.
3. B3/B4: condicionar e626 a Lio y añadir `PERDIDO_TADEO` a e424.
4. B5: cerrar el bucle de e403.
5. B6: unificar r162/e430.
6. B7: regla de caída de la Mente.
7. B8: añadir Voz de la nave/Antiguos a r141.
8. B9: unificar Temple 3/4.
9. B10: terminar la frase de e271.
10. B11: desenlace de e433.
11. B12/B13: marcar muertos y epílogo propio de e918.
12. B14: decidir si las grandes obras se hacen en taller y corregir r203/r162/r205.
13. B15: cerrar el modo Náufrago (Reloj, Canto y victoria con 3 tripulantes).

### Fase 2 — Graves (2–3 días)
14. G1–G8: umbral de fragmentos, encargos, marcas muertas, `CAZADO_`.
15. G9–G15: precios, baterías, Raciones, casco, implantes.
16. G16–G22: combates sin desenlace, e603, r198, e039, e046, e042, e714.
17. G23–G30: Marcas de Origen, Mirasol, `VERSALITAS`, `INSTALACION_GRATIS`, túnica.
18. G31–G40: cadenas de tripulantes.
19. G41–G53: despegue y finales.
20. G54–G67: asentamientos y facciones.
21. G68–G76: tablas resumen.
22. G77–G84: reliquias, Sela, r181, despegar, maqueta, Reloj, Amara y detalles de r160/r302/r210/r156/r154/r118/r137.

### Fase 3 — Moderados y menores (1–2 días)
23. Unificar precios (célula, batería, mapa, antídoto, jaula).
24. Revisar todas las pruebas sin Fallo y todos los eventos con ⌛ 0 que consumen día.
25. Pasada de erratas: «Mendieta», «1 de Canto», «⌛ +1 ⌛ +1», «si no, otro objeto», etc.
26. Regenerar índice y PDF; comprobar que sigue en 200 páginas y que los 364 encabezados no se mueven.

---

# 7. Cobertura

| Sector | Archivos | Entradas | Estado |
|---|---|---|---|
| Reglas base | `01-reglas.md`, `02-plantillas.md` | 93 reglas | Auditado |
| Prólogo | `10-prologo.md` | e001–e012 | Auditado |
| Eventos comunes | `11-comunes.md` | e020–e025, e030–e059 | Auditado |
| Viejos conocidos | `12-conocidos.md` | e060–e071 | Auditado |
| Regiones 1–4 | `20-dunas.md`–`23-bosque.md` | 48 eventos | Auditado |
| Regiones 5–8 | `24-polo.md`–`27-torres.md` | 48 eventos | Auditado |
| Asentamientos | `30-asentamientos.md` | e400–e434 | Auditado |
| Pecios y sistemas | `40-pecios-sistemas.md` | e500–e517, e560–e569 | Auditado |
| Tripulación | `50-tripulacion.md` | e600–e628 | Auditado |
| Facciones | `55-facciones.md` | e640–e647 | Auditado |
| Catálogo | `60-catalogo.md` | e700–e778 | Auditado |
| Historias | `70-historias.md` | e800–e846 | Auditado |
| Finales | `80-finales.md` | e900–e920 | Auditado |
| Apéndices | `90-apendices.md` | tablas y bestiario | Auditado |
| Índice de Marcas | `91-indice-marcas.md` | 271 filas | Auditado |
| Mundo y portada | `00-portada.md`, `03-mundo.md` | — | Auditado |

**Total:** 443 entradas, 200 páginas, ~69.200 palabras.

---

*Fin del informe. No se ha modificado ningún archivo del juego.*
