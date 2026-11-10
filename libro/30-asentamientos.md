## Asentamientos

*Visitar un asentamiento consume el día (r160). Puedes usar todos sus servicios ese día y hacer **una** actividad especial.*

---

### Puerto Chatarra (Desguaces)

<a id="e400"></a>
### e400 · Puerto Chatarra
*Cementerio de Naves · ⌛ día*

Un portanaves de guerra de dos kilómetros, tumbado de lado en un cráter. Dentro, una ciudad de cinco mil almas: calles que son pasillos, plazas que son hangares y casas hechas con cabinas. Huele a soldadura, a aceite frito y a gente. Todo está en venta. Todo tiene precio.

- **Si tu Reputación con los Desguaces es −2 o menos** → [e407](#e407).
- **Si tienes `TRABAJO_DEL_CONTABLE` y llevas una reliquia de los Antiguos**, o `ENCARGO_DEL_SUBASTADOR` con `TOMO_DE_LUZ` → [e406](#e406) (no gasta tu actividad).
- **Si tienes `PAQUETE_DE_MENDANA`**: aquí no es; es en Quilla.

**Servicios:** comprar y vender (r161; los precios de armas, −1), rellenar Aire o Energía, sanador (r163), rumores (r164), descanso a cubierto y **taller** (r162).

**Actividad especial (elige una):**
1. **La arena** → [e401](#e401).
2. **La taberna del Motor Muerto** → [e402](#e402).
3. **El mercado negro** → [e403](#e403).
4. **El astillero** (si te falta el Casco) → [e404](#e404).
5. **El depósito de combustible** (si te falta el Combustible) → [e405](#e405).
6. **Pedir audiencia al Contable** → [e406](#e406).

---

<a id="e401"></a>
### e401 · La arena
*Puerto Chatarra · ⌛ 0*

En el hangar principal, un ring de chapa rodeado de gradas. La gente apuesta a gritos. Hoy pelean náufragos recién llegados contra lo que haya en las jaulas.

1. **Pelear.** Elige rival:
   - *Rata gigante · Ataque 3 · Blind. 1 · Heridas 3 · [Bestia]*. Premio: 3 Chatarra.
   - *Campeón Desguace «Bisagra» · Ataque 5 · Blind. 2 · Heridas 4 · [Náufrago]*. Premio: 8 Chatarra y +1 de Reputación con los Desguaces.
   - *Vigía encadenado · Ataque 6 · Blind. 3 · Heridas 4 · [Máquina][Antiguo]*. Premio: 12 Chatarra y una coraza de Vigía. −1 de Reputación con los Vigías. **★**
   Puedes rendirte en cualquier ronda (pierdes, pero sin más daño).
2. **Apostar.** Apuesta lo que quieras y tira 1d6: con 1–4 pierdes lo apostado; con 5 lo doblas; con 6 lo triplicas.
3. **Liberar al Vigía de la jaula.** `[Ingenio · 11]` o `[Reflejos · 11]`. *Éxito:* se escapa rompiendo media arena. +2 de Reputación con los Vigías y −2 con los Desguaces si te descubren (1d6: 1–3). *Fallo:* te pillan. Pagas 4 Chatarra de multa o peleas contra Bisagra sin premio.

---

<a id="e402"></a>
### e402 · La taberna del Motor Muerto
*Puerto Chatarra · ⌛ 0*

Construida dentro de un motor de salto vaciado: la barra es la cámara de combustión. Sirven licor de combustible y caldo de cardador. Aquí se cuentan historias, se cierran tratos y se pierden dedos.

Las paredes curvas están cubiertas de placas de naves perdidas, clavadas por los que sobrevivieron. Alguien toca un instrumento hecho con un tanque y cuerdas de freno. Las mesas son tapas de escotilla. El dueño, un hombre con un tubo de respiración, te sirve antes de que pidas nada y apunta la deuda con tiza en tu manga.

1. **Invitar a una ronda.** 2 Chatarra. Tira dos rumores (r164) y quédate con los dos.
2. **Preguntar por tu tripulación.** `[Voluntad · 9]`. *Éxito:* elige un tripulante no encontrado: descubres su región (o, si ya la sabías, Ventaja al explorar). *Éxito pleno:* alguien sabe dónde está exactamente: ve a su primer evento la próxima vez que estés en su región, sin tirar Explorar. *Fallo:* nadie sabe nada, o nadie quiere decirlo.
3. **Jugar a los dados de hueso.** Apuesta y tira 2d6 contra el tahúr, que tira 2d6 + 1. El que saque más gana. Si ganas, doblas tu apuesta. Si eres el Contrabandista (`DEUDAS`), tienes Ventaja… y el tahúr te reconoce: «*Tú le debes al Contable.*»
4. **Reclutar ayuda.** Por 4 Chatarra, un Desguace te acompaña hasta que el Reloj baje 5 (anota el número) como compañero (no cuenta para el límite de 2; +1 Ataque; no tiene historia; se va entonces).

---

<a id="e403"></a>
### e403 · El mercado negro
*Puerto Chatarra · ⌛ 0*

En las bodegas del portanaves, sin luz, puestos que venden lo que no se vende arriba: tecnología de los Antiguos, implantes usados, mapas robados y **gente**.

Entre los puestos se mueven compradores con capucha y vendedores que no dicen su nombre. Las mercancías se muestran a la luz de linternas tapadas con trapos rojos. Nadie regatea en voz alta. Al fondo, detrás de una cortina de cadenas, alguien llora y alguien le manda callar.

1. **Comprar reliquias.** Una reliquia sin identificar: 5 Chatarra. Una ya identificada (eliges cuál en la tabla de r193, salvo [e751](#e751)): 10 Chatarra.
2. **Vender reliquias.** El doble del precio normal (r161). Si tienes `CONTRABANDO`, alguien reconoce la caja de la que salió tu reliquia: te paga 4 Chatarra extra por ella, o te dice para quién era (gana una Pista de la tabla de rumores, eliges).
3. **Comprar un implante** (Piloto). 5 Chatarra, eliges del catálogo. Se instala solo, sin prueba, pero tira 1d6: con un 1, el implante tiene un rastreador: ◉ +1 Alerta permanente (la Alerta nunca baja de 2 mientras lo lleves).
4. **Ver la mercancía humana.** En una jaula hay alguien. Tira 1d6 entre tus tripulantes no encontrados. Si sale uno, está aquí, a la venta: 8 Chatarra. Si lo compras, ve a su primer evento. Si no puedes pagar, `[Reflejos · 13]` para liberarlo: *Éxito:* ve a su primer evento, −2 de Reputación con los Desguaces. *Fallo:* te echan a patadas: 1 Herida y −1 de Reputación. Si no sale nadie de tu tripulación, es un niño de Quilla: si lo compras, anota `NIÑO_DE_QUILLA`; al llevarlo a Quilla, +3 de Reputación con los Hijos del Pecio.

---

<a id="e404"></a>
### e404 · El astillero
*Puerto Chatarra · ⌛ 0*

Un dique seco dentro del portanaves, donde los Desguaces reconstruyen naves para vender. Montañas de placas de casco ordenadas por tamaño. El capataz es un hombre enorme con las cejas quemadas.

«¿Placas? Tengo placas. ¿Tienes con qué pagar?»

1. **Comprar un Casco Sólido.** 10 Chatarra (o 8, si tienes Reputación +2 o más con los Desguaces).
2. **Comprar un Casco Precario.** 5 Chatarra.
3. **Trabajar a cambio.** ⌛ +1 ⌛ +1 (pierdes 2 días más). Al terminar, **Casco Sólido**. Con `[Vigor · 11]`, terminas un día antes.
4. **Ofrecer un sistema de los Antiguos a cambio.** Si llevas una lente de emisión o una reliquia de los Antiguos: te da un **Casco Excelente** y queda encantado. +1 de Reputación con los Desguaces.

---

<a id="e405"></a>
### e405 · Los bidones del Contable
*Puerto Chatarra · ⌛ 0*

El depósito de combustible de la ciudad, guardado por los matones dorados del Contable. Cien bidones azules. El Contable vende combustible, pero no a cualquiera: solo a quien **le deba algo**.

1. **Firmar una deuda.** Te dan **Combustible Sólido** (pesado) gratis, pero anotas `DEUDA_CON_EL_CONTABLE`. Antes de despegar tendrás que pagar 12 Chatarra en Puerto Chatarra, o en la secuencia de despegue sus hombres vendrán a cobrar (ver [e900](#e900)).
2. **Pagar en el acto.** 12 Chatarra por **Combustible Sólido**, o 18 por **Excelente**.
3. **Robar un bidón.** `[Reflejos · 13]` (Lio: Ventaja). *Éxito:* **Combustible Precario**, nadie lo sabe. *Fallo:* combate contra *Matones dorados · Ataque 4 · Blind. 2 · Heridas 4 · [Náufrago]*. Si ganas, te llevas el bidón y anotas `ENEMIGO_DEL_CONTABLE`. −3 de Reputación con los Desguaces.
4. **Si tienes `FAVOR_DESGUACE`:** te dejan un bidón «a cuenta del favor». Borra la Marca. **Combustible Precario**.

---

<a id="e406"></a>
### e406 · El despacho del Contable
*Puerto Chatarra · ⌛ 0*

El puente de mando del portanaves, convertido en despacho. Paredes forradas de libros de cuentas. El Contable, sentado en su silla de piloto, con la media cabeza de latón brillando bajo un flexo.

Huele a papel viejo, a aceite de lámpara y a café de verdad, lo más caro que has olido en Caribdis.

«Todo el mundo me debe algo. La pregunta es: ¿qué me debes tú?»

Una lámpara verde ilumina una sola página abierta.

- **Si tienes `TRABAJO_DEL_CONTABLE`** y le traes una reliquia de los Antiguos: la pierdes y ganas 6 Chatarra y +2 de Reputación con los Desguaces. Borra la Marca. Si te había robado un sistema ([e210](#e210)), te lo devuelve.
- **Si tienes `ENCARGO_DEL_SUBASTADOR` y `TOMO_DE_LUZ`:** el subastador trabaja para él. Te da el sistema de la subasta ([e228](#e228)) con calidad Sólida. Borra ambas Marcas.
- **Si tienes `DEUDA_CON_EL_CONTABLE`:** puedes pagar ahora 12 Chatarra y borrarla.

Si no:
1. **Ofrecerle un trato.** «*Te doy información sobre los Recolectores a cambio de piezas.*» `[Voluntad · 11]`. *Éxito:* le interesa. Si tienes 2 o más `FRAGMENTO_`, te da 8 Chatarra (una sola vez). *Fallo:* «*Ya sé todo lo que tú sabes.*»
2. **Preguntarle por qué no se ha ido.** Se ríe. «*¿Irme? Aquí soy rey. Allí fuera sería un hombre con media cabeza.*» Luego, más bajo: «*Y porque los que se van... vuelven a caer. Siempre.*» Gana `FRAGMENTO_EL_CONTABLE`.
3. **Ofrecerle un sitio en tu nave.** Te mira largo rato. «*Si me llevas, te pago la nave entera.*» Si no la tenías, anota `PASAJERO_EL_CONTABLE`: te da 10 Chatarra ya. Si despegas sin él (o si él no está a bordo), su gente te perseguirá en tu epílogo.

---

<a id="e407"></a>
### e407 · Rechazado en Puerto Chatarra
*Puerto Chatarra · ⌛ día*

Los guardias de la rampa te reconocen. Te apuntan con rifles de rescate.

Nadie dice tu nombre, pero todos lo saben. Desde lo alto de la rampa, un niño te escupe y se ríe. Las mujeres que cargan agua en la rampa se apartan para no estar cerca de ti cuando pase lo que vaya a pasar. Detrás de los guardias, el humo de las forjas sube recto, sin viento, y se oye la música de la taberna como si nada.

Las puertas de los talleres se cierran a tu paso, una detrás de otra, como si la ciudad entera contuviera el aliento.

1. **Irte.** Nada.
2. **Sobornar a los guardias.** 4 Chatarra. Entras, pero solo puedes usar el mercado negro ([e403](#e403)).
3. **Colarte.** `[Reflejos · 11]` (Lio: Ventaja). *Éxito:* entras como en [e400](#e400), pero sin taller ni audiencia. *Fallo:* combate contra *Guardias de la rampa · Ataque 4 · Blind. 2 · Heridas 4 · [Náufrago]*. Si ganas, huyes con 3 Chatarra de sus bolsillos. −1 de Reputación más.

Te vas sin mirar atrás. Detrás de ti, alguien silba.


---

### Quilla (Hijos del Pecio)

<a id="e410"></a>
### e410 · Quilla
*Cañones de las Bestias · ⌛ día*

La aldea está construida **dentro de un casco de nave antigua** encajado en la pared de un cañón: la quilla de la *Esperanza de Ur*, que se desprendió al caer hace mil años. Las ventanas son portillas. Las escaleras son conductos. Hay huertos en las bodegas y niños de seis dedos que se te quedan mirando.

Por las ventanillas del casco asoman ropa tendida, macetas y caras curiosas. El humo de las cocinas sube por la pared del cañón, y huele a raíces asadas y a algo dulce que no sabes nombrar. Los niños te siguen a distancia, imitando tu forma de andar.

- **Si tienes `MATASTE_A_LA_MADRE` o −2 o menos con los Hijos del Pecio** → [e415](#e415).
- **Si tienes `PAQUETE_DE_MENDANA`:** lo entregas. Ganas 5 Chatarra. Borra la Marca.
- **Reloj en 30 o menos** (una vez) → [e417](#e417).

**Servicios:** comprar y vender (r161; las Raciones, 2 por cada Chatarra; no venden armas de distancia), sanador (r163, acepta Raciones), rumores (r164) y descanso a cubierto. El Piloto **no** puede rellenar Aire aquí; la Mente sí puede recargar (tienen paneles de luz fría).

**Actividad especial (elige una):**
1. **Audiencia con la Madre Óxida** → [e411](#e411).
2. **El mercado de trueque** → [e412](#e412).
3. **Los Mirasoles** → [e413](#e413).
4. **La forja** (si te falta el Motor) → [e414](#e414).
5. **El huerto de las bodegas** (si te falta el Soporte vital) → [e416](#e416).

---

<a id="e411"></a>
### e411 · La Madre Óxida
*Quilla · ⌛ 0*

En lo que fue la cabina de la *Esperanza*, entre plantas colgantes, una anciana de piel cobriza como una moneda vieja. Tiene diez dedos en cada mano y unos ojos que no parpadean.

Hay macetas hechas con cascos de soldado y plantas que crecen hacia las ventanillas rotas. La Madre trenza fibras mientras habla, sin mirar sus manos. Los niños de la aldea se asoman a la puerta y se van corriendo.

«Otro que cayó. Siéntate. Te contaré cómo caímos nosotros.»

1. **Escuchar su historia.** Gana `FRAGMENTO_LA_MADRE`: los Hijos del Pecio descienden de una nave colonia que oyó el Canto hace mil años. Y lo que pasó después, cuando llegaron las luces.
2. **Pedirle ayuda.** Según tu Reputación con los Hijos del Pecio:
   - **+1 o menos:** «*Gánatela.*» Te encarga algo: elige entre traer la seta de la Madre ([e267](#e267)), rescatar a un niño del Coro ([e347](#e347) o [e417](#e417)) o matar al tragón ([e202](#e202)). Si lo haces, +2 de Reputación.
   - **+2 o más** (una vez): te ofrece **un guía** (compañero para toda la partida, no cuenta para el límite: nunca te pierdes, +1 Ataque) **o** una pieza de la *Esperanza*: un sistema a tu elección entre Motor y Soporte vital, calidad Sólida.
3. **Si eres el Nativo:** la Madre te conoce desde que naciste. «*Te vas, ¿verdad? Lo sabía antes que tú.*» Si tu `ARRAIGO` es 4 o más, te pide que lleves contigo a los Mirasoles → [e413](#e413). Si es 2 o menos, te da la espalda: −1 `ARRAIGO`.
4. **Si llevas la seta de la Madre:** se la das. La Madre llora. «*Es la seta de mi madre. Creía que se había perdido.*» +3 de Reputación con los Hijos del Pecio y elige un sistema de Quilla: Motor o Soporte vital, calidad Excelente. **★**

---

<a id="e412"></a>
### e412 · El mercado de trueque
*Quilla · ⌛ 0*

En la bodega principal, bajo luces de luz fría, los Hijos del Pecio intercambian cosas. No usan Chatarra: usan **objetos**.

Todo el mundo regatea en voz muy baja. Un relojero cambia un reloj parado por una cuchara, y los dos salen contentos.

1. **Cambiar objetos.** Cualquier objeto común o arma tuya por otro de la tabla r161 del mismo precio o menor.
2. **Cambiar juguetes** (si traes del carguero de [e225](#e225)): cada juguete vale 2 Raciones o 1 objeto de precio 1. Los niños te siguen a todas partes durante el resto de la visita.
3. **Cambiar historias.** Cuenta lo que has visto: si tienes `FRAGMENTO_`, cada una (una vez) vale 2 Raciones o 1 punto de Reputación con los Hijos del Pecio (máximo 2 puntos por visita).
4. **Comprar un trepador.** 6 objetos o 8 Chatarra. Vehículo (r152): consume 1 Ración extra por viaje; no entra en la Ciudad Enterrada.

Al caer la noche, los puestos se recogen en silencio y las luces frías se apagan una a una. Solo queda el olor a setas tostadas y a sal.


---

<a id="e413"></a>
### e413 · Los Mirasoles
*Quilla · ⌛ 0*

Un grupo de jóvenes de Quilla que se reúne en la popa, de noche, para mirar la Corona. Se llaman **Mirasoles**, como la caravana. Quieren irse; saben que es herejía. No les importa.

Su líder es una chica con alas de piel que no le sirven para volar: **Ixa**.

1. **Ofrecerles un sitio en tu nave.** Ixa te mira con los ojos llenos de lágrimas. Anota `MIRASOLES_A_BORDO` (en el final cuentan como 2 pasajeros). A cambio, trabajan para ti: anota `INSTALACION_GRATIS`: **la próxima instalación es automática** (sin prueba, con +1 de calidad). −1 de Reputación con los Hijos del Pecio (la Madre no está contenta). Si eres el Nativo, −1 `ARRAIGO`.
2. **Convencerles de que se queden.** `[Voluntad · 11]`. *Éxito:* «*Tienes razón. Aquí hay mucho por hacer.*» +2 de Reputación con los Hijos del Pecio. Si eres el Nativo, +1 `ARRAIGO`. *Fallo:* Ixa te escupe a los pies.
3. **Preguntarles qué saben.** Ixa te enseña un dibujo de la Corona que han hecho durante años: hay **una ruta** a través de los restos. Anota `CARTA_DE_LOS_MIRASOLES` (Ventaja en la prueba de Navegación de la secuencia de despegue).

---

<a id="e414"></a>
### e414 · La forja de Quilla
*Quilla · ⌛ +1*

En las tripas de la *Esperanza*, una forja alimentada por un reactor antiguo que los Hijos del Pecio mantienen vivo con rezos y llaves inglesas. El herrero, un hombre con cuatro brazos, puede fabricar casi cualquier pieza… si le das tiempo y material.

1. **Encargar un motor.** Necesitas 6 Chatarra o 3 objetos, y Reputación +1 o más con los Hijos del Pecio. Tarda ⌛ +1. Al terminar, `[Ingenio · 9]` para ayudarle (Noemí: Ventaja): *Éxito:* **Motor Sólido** (pesado). *Éxito pleno:* **Motor Excelente**. *Fallo:* **Motor Precario**.
2. **Ayudarle en la forja a cambio.** `[Vigor · 9]` ⌛ +1. *Éxito:* te hace el motor sin cobrarte nada: **Motor Precario**, o **Sólido** si tienes Reputación +2. *Fallo:* 1 Herida (quemaduras).
3. **Pedirle que mejore un arma.** 2 Chatarra: un arma tuya gana +1 Ataque (máximo +3).

---

<a id="e415"></a>
### e415 · Rechazado en Quilla
*Quilla · ⌛ día*

Los guerreros de la entrada cruzan las lanzas. Detrás, en las portillas, cientos de ojos.

- **Si tienes `MATASTE_A_LA_MADRE`:** no hay negociación. *Guerreros de Quilla · Ataque 5 · Blind. 1 · Heridas 5 · [Náufrago]*. Combate o huida (`[Reflejos · 9]`). Aunque ganes, hoy no entras.

1. **Irte.** Nada.
2. **Pedir perdón.** `[Voluntad · 11]`. *Éxito:* puedes entrar, pero solo al sanador. +1 de Reputación con los Hijos del Pecio. *Fallo:* te tiran piedras. 1 Herida.
3. **Dejar una ofrenda en la puerta.** 3 Raciones o 3 Chatarra. +1 de Reputación con los Hijos del Pecio. No te dejan entrar hoy.

---

<a id="e416"></a>
### e416 · El huerto de las bodegas
*Quilla · ⌛ 0*

Las bodegas de la *Esperanza* son un huerto: algas que producen aire, setas comestibles, insectos de luz. Es un **soporte vital** vivo, que funciona desde hace mil años.

Huele a tierra húmeda y a verde.

1. **Pedir un cultivo.** Con Reputación +1 o más: **Soporte vital Sólido** (no pesado). Con Reputación +3: **Excelente**.
2. **Comprarlo.** 8 Chatarra o 4 objetos por **Soporte vital Sólido**.
3. **Aprender a cuidarlo.** `[Ingenio · 9]` ⌛ +1. *Éxito:* aprendes. Si consigues un Soporte vital Precario por cualquier vía, sube automáticamente a Sólido. Anota `JARDINERO`. *Fallo:* matas tres plantas. −1 de Reputación.
4. **Robar algas.** `[Reflejos · 9]`. *Éxito:* **Soporte vital Precario**. *Fallo:* −2 de Reputación con los Hijos del Pecio.

---

<a id="e417"></a>
### e417 · La noche de los niños
*Quilla · ⌛ día*

Despiertas con gritos. Una banda del Coro ha entrado en Quilla por los conductos y se lleva a los niños dormidos. Los guerreros persiguen a unos; los demás huyen hacia las Torres con cuatro niños en sacos.

1. **Perseguirlos.** `[Reflejos · 9]`. *Éxito:* los alcanzas. Combate contra *Raptores del Coro · Ataque 4 · Blind. 1 · Heridas 4 · [Cantor]*. *Si ganas:* rescatas a los niños. +3 de Reputación con los Hijos del Pecio y **★**. −2 de Reputación con el Coro. Si eres el Nativo, +2 `ARRAIGO`. *Fallo:* se escapan. Gana la Pista `Torres · El coro de niños · e347`.
2. **Defender la aldea.** Combate contra *Raptores en los pasillos · Ataque 3 · Blind. 1 · Heridas 3 · [Cantor]*. *Si ganas:* +2 de Reputación con los Hijos del Pecio.
3. **Esconderte.** Nadie te ve. Al día siguiente, la Madre Óxida te mira y no dice nada. −2 de Reputación con los Hijos del Pecio.

---

### El Atrio (Coro)

<a id="e420"></a>
### e420 · El Atrio
*Torres del Canto · ⌛ día*

En la base de la torre más ancha, un templo abierto: una escalinata de mármol negro que sube hacia una plaza circular, columnas de luz azul y cientos de personas vestidas de blanco que cantan sin descanso. Es hermoso. Es terrible.

El mármol está tibio bajo los pies, aunque el aire es frío. Las voces no paran nunca: cuando un cantor se cansa, otro ocupa su lugar sin que la nota se rompa. Huele a incienso, a sudor y a ozono, y la luz azul hace que todos parezcan enfermos. Hay niños entre los cantores, y ancianos que ya no pueden ponerse de pie y cantan tumbados. En lo alto de la escalinata, una figura con máscara de cobre mira hacia ti.

Al entrar, +1 Canto ♫.

- **Si tu Reputación con el Coro es −2 o menos** → [e421](#e421).
- **Si tienes `SALUDO_DEL_CORO`:** te reciben como peregrino. No subes Canto al entrar.

**Servicios:** sanador (r163; aquí cura Heridas gratis, pero +1 Canto por Herida curada), descanso a cubierto (sin la bajada de Canto de la Cicatriz) y rumores (r164; los rumores aquí son gratis).

**Actividad especial (elige una):**
1. **La comunión** → [e422](#e422).
2. **El archivo** → [e423](#e423).
3. **Buscar a los acogidos** → [e424](#e424).
4. **Hacer penitencia** → [e425](#e425).
5. **Pedir el cristal de ruta** (si te falta la Navegación) → [e426](#e426).

---

<a id="e421"></a>
### e421 · Rechazado en el Atrio
*Torres del Canto · ⌛ día*

Los cantores bajan la escalinata en silencio y forman una pared. Uno da un paso adelante y te pone una mano en el pecho: no te empuja. Solo espera.

1. **Irte.** Nada.
2. **Arrodillarte y pedir perdón.** +2 Canto ♫. +1 de Reputación con el Coro. Puedes entrar.
3. **Entrar a la fuerza.** *Cantores del Atrio · Ataque 5 · Blind. 1 · Heridas 6 · [Cantor]*. Combate. *Si ganas:* puedes ir directamente a [e424](#e424) o a [e426](#e426), pero ◉ +2 Alerta y −1 de Reputación con el Coro.

---

<a id="e422"></a>
### e422 · La comunión
*El Atrio · ⌛ 0*

Te sientas en la plaza con los demás. Te cogen de las manos. Cantáis. El Canto entra por todas partes, y por primera vez **no te hace daño**: te llena.

Las manos que te sujetan son cálidas, callosas, de gente que ha trabajado mucho. A tu izquierda, una mujer llora sin dejar de sonreír.

Hace años que nadie te cogía la mano. Nadie te pregunta de dónde vienes. Por una vez, no importa.

1. **Dejarte llevar.** +3 Canto ♫. Pero recuperas todas tus Heridas y todo tu Temple. Y ves algo, dentro del Canto: gana `FRAGMENTO_LA_COMUNION`. +1 de Reputación con el Coro.
2. **Resistir desde dentro.** `[Voluntad · 13]`. *Éxito:* estás dentro del Canto sin perderte. Ves cómo funciona, de dónde viene, qué quiere. Si tienes 2 `FRAGMENTO_` o más → [e840](#e840). Si no, gana `FRAGMENTO_LA_COMUNION` y −2 Canto. **★** *Fallo:* +3 Canto ♫, y no recuerdas nada.
3. **Soltar las manos y salir.** Los cantores te miran con pena. −1 de Reputación con el Coro.

---

<a id="e423"></a>
### e423 · El archivo
*El Atrio · ⌛ 0*

Bajo el templo, una cripta con miles de cajas de metal. Cada una tiene un nombre y una fecha: las pertenencias de los «acogidos». Diarios, fotos, insignias de naves. El Coro lo guarda todo con un cuidado amoroso.

1. **Buscar a tu tripulación.** `[Ingenio · 9]`. *Éxito:* encuentras una caja con el nombre de alguien de tu nave. Tira 1d6 entre los no encontrados. Si es Tadeo, ya es uno de ellos: anota `RASTRO_DE_TADEO`. Si es otro, está en el Atrio como acogido → [e424](#e424). *Fallo:* no está, o no lo encuentras.
2. **Leer los diarios más antiguos.** `[Ingenio · 11]`. *Éxito:* el más antiguo tiene doscientos años y está escrito por una mujer que fundó el Coro: «*El Canto no es Dios. Es una puerta. Y nosotros somos los porteros.*» Gana `FRAGMENTO_LA_FUNDADORA`. *Fallo:* nada.
3. **Robar cartas estelares** de las cajas. `[Reflejos · 9]`. *Éxito:* anota `CARTAS_ROBADAS` (Ventaja en la vía del Cristal de ruta y en la prueba de Navegación de la secuencia de despegue). *Fallo:* −2 de Reputación con el Coro.

---

<a id="e424"></a>
### e424 · Los acogidos
*El Atrio · ⌛ 0*

En las galerías de la torre duermen los recién llegados: náufragos que el Coro ha recogido. Están limpios, bien alimentados y muy tranquilos. No quieren irse.

Si tienes a un tripulante cuya región sea las Torres y aún no lo has encontrado, está aquí: ve a su primer evento, pero antes haz `[Voluntad · 11]` ♫ para despertarlo del Canto. Si fallas, no te reconoce, y tendrás que volver otro día. Si es **Tadeo**, no necesita despertar: él eligió estar aquí.

Si no:
1. **Despertar a un desconocido.** `[Voluntad · 9]`. *Éxito:* un ingeniero de otra nave te lo agradece con 4 Chatarra y una pieza: +1 de calidad a un sistema llevado. *Fallo:* te mira sin verte.
2. **Hablar con el que cuida a los acogidos.** Es un médico. Te cuenta que el Canto los «calma» antes de llevarlos a la cima. «*Allí arriba se van. Nadie baja.*» Gana la Pista `Torres · La cima · e351`.

---

<a id="e425"></a>
### e425 · Penitencia
*El Atrio · ⌛ +1*

El Coro acoge a todos, pero no regala nada. A cambio de su favor, puedes **cantar** durante un día y una noche sin descanso.

La túnica que te dan está remendada muchas veces y huele a quien la llevó antes. Los demás penitentes no te miran.

`[Vigor · 9]` y `[Voluntad · 9]` ♫.
- **Dos Éxitos:** +2 de Reputación con el Coro. +2 Canto. Te regalan una túnica bendita: mientras la lleves, ningún [Cantor] te ataca: puedes evitar sus combates.
- **Uno:** +1 de Reputación con el Coro. +2 Canto.
- **Ninguno:** caes rendido. 1 Herida y +3 Canto ♫.

---

<a id="e426"></a>
### e426 · El cristal de ruta
*El Atrio · ⌛ 0*

En el altar del templo, flotando en un haz de luz, un cristal del tamaño de un puño: el **cristal de ruta**, una brújula de los Antiguos que marca siempre el camino de salida de cualquier sistema estelar. El Coro lo guarda como lo más sagrado. Para ellos, es el objeto que **no debe usarse nunca**.

1. **Pedirlo.** Con Reputación +2 o más con el Coro, la Voz te lo da en una ceremonia: «*Si te vas, que te vayas sabiendo.*» **Navegación Excelente**. Pero el Coro te lo da porque cree que volverás: anota `PROMESA_AL_CORO`. **★**
2. **Robarlo.** `[Reflejos · 13]` ◉ (Lio, `CARTAS_ROBADAS` o `NOTA_DEL_PILOTO`: Ventaja). *Éxito:* **Navegación Excelente**. −3 de Reputación con el Coro. Te persiguen: ◉ +2 Alerta. *Fallo:* combate contra *Guardianes del altar · Ataque 5 · Blind. 2 · Heridas 5 · [Cantor]*. Si ganas, es tuyo, con las mismas consecuencias.
3. **Copiarlo** (la Mente, Amara o con `CARTAS_ROBADAS`): `[Ingenio · 11]` (`NOTA_DEL_PILOTO`: Ventaja). *Éxito:* no te lo llevas, pero copias su rumbo: **Navegación Sólida**. Nadie se entera. *Fallo:* el cristal te mira (de algún modo) y la Voz lo sabe. −1 de Reputación con el Coro.

---

### El Nodo (Vigías)

<a id="e430"></a>
### e430 · El Nodo
*Ciudad Enterrada · ⌛ día*

En el centro de la Ciudad, una esfera de cristal negro del tamaño de un estadio, flotando a dos metros del suelo. Alrededor, centenares de Vigías inmóviles, en círculos perfectos. Dentro, luz fría. Es el centro de mando de las máquinas de los Antiguos.

No es un asentamiento: no hay comercio. Pero si te dejan entrar, hay **talleres**.

- **Si tu Reputación con los Vigías es −2 o menos** → [e434](#e434).
- **Si no tienes `CODIGO_VIGIA` ni Reputación +1 o más con los Vigías:** `[Voluntad · 11]` para que te dejen pasar (mostrar Luz fría, pieza o batería, da Ventaja). Si fallas → [e434](#e434).

**Servicios:** recargar Energía (la Mente: completa, gratis), **taller** (r162; aquí pueden llevar un sistema de Sólido a Excelente por 6 Chatarra) y descanso a cubierto.

**Actividad especial (elige una):**
1. **Hablar con Custodio Primo** → [e431](#e431).
2. **El reactor** (si te falta el Motor) → [e432](#e432).
3. **Pedir un encargo** → [e433](#e433).

---

<a id="e431"></a>
### e431 · Custodio Primo
*El Nodo · ⌛ 0*

En el corazón de la esfera, una figura de cuatro brazos, más alta que las demás, sentada en un trono de luz. Es el Vigía más antiguo. Tiene la cara lisa. Cuando habla, lo hace con un coro de voces grabadas.

«ORDEN VIGENTE: CUSTODIAR. ORDEN VIGENTE: QUE NADIE SALGA. ORDEN VIGENTE: QUE NADIE ENTRE. ESTADO: FALLO EN LA SEGUNDA ORDEN. MOTIVO: LA SEÑAL.»

1. **Preguntarle quién dio la orden.** «*LOS QUE ESCUCHAN. ÚLTIMA COMUNICACIÓN: HACE 10.212 AÑOS.*» `[Ingenio · 11]` (Amara, la Mente: Ventaja). *Éxito:* te enseña la última grabación: gana `FRAGMENTO_LA_ORDEN`. *Fallo:* repite la orden.
2. **Preguntarle por qué deja que se vayan los que se van.** «*NO SE VA NADIE.*» Pausa. «*LOS QUE INTENTAN IRSE, CAEN. LA SEÑAL LOS DEVUELVE.*» Si insistes, `[Voluntad · 11]`: *Éxito:* Primo admite que **hay una forma**: si la Señal calla un instante, una nave podría salir. Anota `LA_SEÑAL_PUEDE_CALLAR`.
3. **Pedirle permiso para irte.** «*DENEGADO.*» Pero si tu Reputación con los Vigías es +3, o si eres la Mente y tu `MEMORIA` es 4 o más: «*...REEVALUANDO. CONCEDIDO. LOS QUE ESCUCHAN NO PREVIERON QUE VOLVERÍAMOS A TENER A QUIÉN PROTEGER.*» Anota `PERMISO_DE_PRIMO`: en la secuencia de despegue, los Vigías te escoltan (ver [e900](#e900)). **★**
4. **Si eres la Mente:** Primo te reconoce como «unidad sin orden». Te ofrece una: custodiar. Si aceptas, +2 de Reputación con los Vigías y anota `UNIDAD_DE_PRIMO`: en tu final, tendrás una opción más.

---

<a id="e432"></a>
### e432 · El reactor del Nodo
*El Nodo · ⌛ +1*

Bajo la esfera, un reactor de luz fría del tamaño de una casa, que alimenta a todos los Vigías de la Ciudad. Tiene módulos de repuesto: **núcleos de propulsión** que, en otro tiempo, movían naves de los Antiguos.

El calor no viene del reactor: viene de la luz, que se te pega a la piel como polvo. Los Vigías que lo cuidan se mueven en silencio, con movimientos lentos, y ninguno te da la espalda. Las paredes están cubiertas de cables gruesos como brazos que laten al mismo ritmo, igual que venas.

1. **Pedir un núcleo.** Con Reputación +2 o más con los Vigías, o con `PERMISO_DE_PRIMO`: **Motor Excelente** (pesado). Todo motor de aquí lleva `MOTOR_DEL_NODO`: +1 Canto en el despegue ([e900](#e900)).
2. **Robar un núcleo.** `[Ingenio · 13]` y `[Reflejos · 11]` ◉ ◉. *Dos Éxitos:* **Motor Excelente**. −3 de Reputación con los Vigías. *Uno:* **Motor Sólido**, y te persiguen → [e035](#e035). *Ninguno:* combate contra *Guardianes del reactor · Ataque 6 · Blind. 3 · Heridas 5 · [Máquina][Antiguo]*.
3. **Ofrecer un trueque.** Si llevas una lente de emisión ([e342](#e342)) o `TORRE_ROTA`: «*LA SEÑAL TE HA DAÑADO. TÚ HAS DAÑADO LA SEÑAL. EQUILIBRIO.*» Te dan un **Motor Sólido** a cambio de la lente, o gratis si tienes `TORRE_ROTA`.

---

<a id="e433"></a>
### e433 · El encargo de Primo
*El Nodo · ⌛ 0*

«*UNIDAD DESVIADA. MODELO: VIGÍA DE PATRULLA. ESTADO: AUTÓNOMO. REZA. DEVOLVER AL NODO.*»

Quieren que traigas al Vigía que reza ([e327](#e327)).

1. **Aceptar.** Anota `ENCARGO_DE_PRIMO` y la Pista `Ciudad · El Vigía que reza · e327`. Si vuelves al Nodo con el Vigía sin dueño como compañero (opción 2 de [e327](#e327)), te dan **un sistema a tu elección, calidad Sólida**, y +2 de Reputación con los Vigías. El Vigía será «reprogramado». Si eres la Mente, −1 Temple: sabes lo que eso significa.
2. **Rechazar.** «*ANOTADO.*» −1 de Reputación con los Vigías.
3. **Preguntar qué le harán.** «*BORRADO.*» Si después de saberlo traes al Vigía igualmente, +1 `CULPA` si eres el Piloto, −1 Temple si no.
4. **Ofrecer otro encargo.** Si tienes `AMIGO_DE_UN_VIGIA`, Primo te encarga en cambio reparar a tres Vigías caídos: anota `ENCARGO_DE_REPARAR` y cuenta los que repares en [e324](#e324) (+1 de Reputación extra cada uno). Al tercero, gana `PERMISO_DE_PRIMO`.

---

<a id="e434"></a>
### e434 · Intruso
*El Nodo · ⌛ 0*

Las luces de la esfera se ponen rojas. Doce Vigías giran la cabeza a la vez.

«*INTRUSO. EXPULSIÓN.*»

Sus pasos resuenan en la esfera, perfectamente sincronizados. No hay rabia en sus voces; solo un procedimiento que se ha repetido mil veces, con la misma calma, contra todos los que entraron antes que tú.

1. **Huir.** `[Reflejos · 11]` (`TUNELES_DE_LA_SOMBRA`: Ventaja). *Éxito:* escapas. ◉ +1 Alerta. *Fallo:* combate contra *Vigías de expulsión · Ataque 5 · Blind. 3 · Heridas 5 · [Máquina][Antiguo]*.
2. **Rendirte.** Te sacan en volandas y te dejan en la frontera de la Ciudad. Te quitan todo lo que sea de los Antiguos (reliquias, células, lanzas). Viajas a una región vecina a tu elección, sin encuentro.
3. **Enlazarte** (Mente): `[Ingenio · 13]`. *Éxito:* te reconocen como unidad: +1 de Reputación con los Vigías y puedes entrar → [e430](#e430). *Fallo:* combate como en la 1.
