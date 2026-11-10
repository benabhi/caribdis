## Despegue

<a id="e900"></a>
### e900 · La secuencia de despegue
*La Cicatriz · ⌛ día*

Seis sistemas. Semanas de trabajo. Piezas de cien naves distintas soldadas con rabia y esperanza. Tu nave, la que lleva el nombre que escribiste en la Hoja, está lista. O todo lo lista que puede estar.

Sube a bordo quien vaya a subir. Siéntate. Respira.

**Paso 0 · Quién viene.** Anota quién va a bordo: tus compañeros, los tripulantes que esperan en la Cicatriz y los pasajeros que ganaste con Marcas (`MIRASOLES_A_BORDO` cuenta como 2; `HIJA_DEL_SALINERO`, `LA_NIÑA_DE_LA_CAPSULA`, `EL_PACIENTE`, `HERMANO_A_BORDO`, `PASAJERO_EL_CONTABLE` y `EL_VIEJO_ESPERA` cuentan como 1). Hay **6 plazas** además de la tuya (8 si en [e804](#e804) hiciste sitio; `MODULO_DE_PASAJE` suma otras 2, o 3 si salió *Maestra*). Si hay más gente que plazas, decide quién se queda. Si eres el Piloto, +1 `CULPA` por cada tripulante que dejes. Con `IRIA_SE_QUEDA` y Canto 4 o más, Iria no sube.
- Si tienes `TADEO_SE_QUEDA`, o Tadeo está a bordo y tienes `TADEO_CREE` (en [e622](#e622) le dijiste que quizá era Dios) → [e623](#e623) antes de seguir.
- Si eres el Nativo con `ARRAIGO` 6 y elegiste «pedir tiempo» en [e816](#e816), o tienes `QUIERES_QUEDARTE`: decide ahora si subes. Si no subes → [e914](#e914).

**Paso 1 · Antes de encender.** Si tienes `DEUDA_CON_EL_CONTABLE`, `ENEMIGO_DEL_CONTABLE`, Reputación −3 con cualquier facción o `ROBASTE_AL_ARGO` → [e901](#e901), y luego vuelve aquí.

**Paso 2 · Las pruebas.** Haz una prueba por cada sistema, en este orden. La **dificultad** depende de la calidad del sistema: Precaria 11, Sólida 9, Excelente 7.

| # | Sistema | Atributo | Ayudas |
|---|---|---|---|
| 1 | **Motor:** el encendido | Ingenio | Noemí: Ventaja. `MOTOR_DEL_NODO`: +1 Canto |
| 2 | **Casco:** atravesar la atmósfera | Reflejos | Piloto: Ventaja (Manos de piloto) |
| 3 | **Navegación:** salir por donde el Canto no llega | Ingenio | `RUTA_DE_SALIDA`, `CARTA_DE_LOS_MIRASOLES`, `CARTAS_ROBADAS`, `POSICION_CONOCIDA`: Ventaja (no se acumulan) |
| 4 | **El Canto:** no darte la vuelta | Voluntad | Dificultad = 7 + tu Canto (6 + Canto con `CAMARA_DE_SILENCIO`, 5 si salió *Maestra*). `TADEO_SE_QUEDA`, `BENDICION_DEL_CORO`: Éxito automático. `LA_ESPERANZA_CALLA`: 7 |
| 5 | **Soporte vital:** sobrevivir a la Corona | Vigor | Iria: Ventaja |
| 6 | **Combustible:** alcanzar la velocidad de escape | Ingenio | `REGULADOR_DE_NOEMI`: repite una vez |
| 7 | **Sistema personal:** que la nave te reconozca | Piloto: Reflejos · Nativo: Voluntad · Mente: Ingenio | La Mente con el Núcleo y `VUELVE_A_SER_LA_NAVE` ([e824](#e824)): Ventaja en todas |

- Puedes gastar **Temple** para repetir pruebas, como siempre.
- Si **Noemí** está a bordo y fallas una prueba → [e618](#e618) (una vez).
- Cada **Fallo** es un **Daño de nave**. Anótalo.
- Si llevas el **Fragmento de la Matriz**, convierte un Fallo en Éxito.

**Paso 3 · La huida.** Si el Reloj está en **15 o menos**, o tienes `BALIZA_ACTIVA` → [e902](#e902), y luego vuelve aquí.

**Paso 4 · Resultado.** Cuenta los Daños de nave:
- **0–2:** lo consigues → [e903](#e903).
- **3–4:** lo consigues por los pelos. Cada pasajero o tripulante a bordo tira 1d6: con un 1, no sobrevive al viaje (si eres el Piloto, +1 `CULPA` por cada uno). → [e903](#e903).
- **5 o más:** la nave no aguanta → [e908](#e908).

---

<a id="e901"></a>
### e901 · Visitantes de última hora
*La Cicatriz · ⌛ 0*

Mientras calientas motores, ves polvo en el horizonte. Alguien viene a despedirse a su manera.

Por cada causa que tengas, haz un combate o paga:
- **`DEUDA_CON_EL_CONTABLE`:** paga 12 Chatarra o combate contra *Cobradores · Ataque 4 · Blind. 2 · Heridas 4 · [Náufrago]*.
- **`ENEMIGO_DEL_CONTABLE` o −3 con los Desguaces:** combate contra *Banda del Contable · Ataque 5 · Blind. 2 · Heridas 6 · [Náufrago]*.
- **−3 con los Hijos del Pecio:** combate contra *Cazadores de Quilla · Ataque 5 · Blind. 1 · Heridas 5 · [Náufrago]*.
- **−3 con el Coro:** prueba `[Voluntad · 13]` ♫; si fallas, +3 Canto (prueba 4 del despegue; las Ayudas la anulan como un ataque).
- **−3 con los Vigías:** combate contra *Vigías de eliminación · Ataque 6 · Blind. 3 · Heridas 6 · [Máquina][Antiguo]*.
- **`ROBASTE_AL_ARGO`:** la tripulación del Argo Pálido te bloquea la pista. Combate contra *Tripulación del Argo · Ataque 5 · Blind. 2 · Heridas 5 · [Náufrago]*, o devuélveles el sistema (baja 1 de calidad el sistema que les robaste).

**Ayudas:** `GUERREROS_DE_QUILLA` o `PAZ_DEL_CONTABLE` anulan uno de estos ataques. `ESCOLTA_VIGIA` o `PERMISO_DE_PRIMO` anulan otro. `TORRETA_DE_LA_CICATRIZ` anula otro más (dos si salió *Maestra*). Si `PASAJERO_EL_CONTABLE` está a bordo, los Desguaces no atacan.

Si pierdes un combate, no mueres: te retiras dentro de la nave y despegas igualmente con **1 Daño de nave** extra.

---

<a id="e902"></a>
### e902 · Las seis luces
*Órbita · ⌛ 0*

Sales de la atmósfera. La Corona pasa a tu lado como un río de naves muertas. Y delante, entre tú y las estrellas, **las seis luces**. Ya no son luces. Son formas: cascos que se abren como flores negras, sin ventanas, sin motores visibles.

Se giran hacia ti.

**Prueba de huida:** `[Reflejos · 11]`.
- Ventaja con: `MAPA_DE_LOS_RECOLECTORES`, `ENGAÑASTE_A_LA_SONDA`, 3 o más `TORRE_ROTA` (si el Secreto es 4), `LA_SEÑAL_PUEDE_CALLAR` (si el Secreto es 1 o tienes `FRAGMENTO_PARTITURA`), `SEÑUELO`.
- Si **Bruno** está a bordo → [e608](#e608) antes de tirar.
- *Éxito:* te escabulles entre los restos de la Corona. Te pierden.
- *Fallo:* te alcanzan con un rayo que no hace ruido. 2 Daños de nave. Y algo de ti se queda allí: −1 a las tiradas de [e911](#e911) y [e913](#e913).

Si tienes `PERMISO_DE_PRIMO`, en el último momento cien Vigías se lanzan al cielo desde la Ciudad Enterrada, como estrellas al revés, y se interponen. Tu prueba de huida es un Éxito automático. Primo cumple su nueva orden.

---

<a id="e903"></a>
### e903 · Más allá de la Corona
*Espacio · ⌛ 0*

El silencio del espacio. De verdad. Sin Canto. Tus oídos zumban por la ausencia.

Detrás, Caribdis se hace pequeña: un punto rojo con un anillo brillante. Desde aquí parece bonita.

**Elige tu final.** Puedes elegir cualquiera cuyas condiciones cumplas:

| Final | Condición |
|---|---|
| **Regreso** → [e910](#e910) | Siempre disponible |
| **Romper el bucle** → [e911](#e911) | Secreto 6 y `SECRETO_DESCUBIERTO` |
| **Silencio** → [e912](#e912) | Secreto 5 y `LA_ESPERANZA_CALLA` (ya descubierto) |
| **Sabotaje** → [e913](#e913) | Secreto 4, `SECRETO_DESCUBIERTO` y al menos 1 `TORRE_ROTA` |
| **Retorno** → [e916](#e916) | La Mente con `FRAGMENTO_DE_AQUI` |

---

<a id="e905"></a>
### e905 · Despegue desesperado
*La Cicatriz · ⌛ día*

No tienes todo. No tienes tiempo. Tienes un casco, un motor y combustible, y un cielo que se está llenando de formas negras.

Haz la secuencia de despegue ([e900](#e900)), pero:
- Los sistemas que te falten cuentan como **Fallos automáticos** (1 Daño de nave cada uno).
- Solo caben 3 personas además de ti.
- Si llegas a [e903](#e903), solo puedes elegir el final **Regreso** ([e910](#e910)), y tu epílogo empieza con una línea: *«Nadie sabe cómo llegaste.»*

---

<a id="e906"></a>
### e906 · El Argo Pálido
*Cementerio de Naves · ⌛ día*

*Si tienes `PASAJE_EN_EL_ARGO`, el Reloj está en 5 o menos y estás en el Cementerio.*

Orla Venn te espera en la rampa del Argo, con el brazo de grúa levantado en señal de saludo. «Dijimos que si llegabas, subías. Pues sube.»

1. **Subir al Argo.** Te llevas a 2 personas (compañeros, tripulantes de la Cicatriz o pasajeros). Los demás se quedan. Si eres el Piloto, +1 `CULPA` por cada tripulante que dejes. Haz solo las pruebas 4 (Canto) y 7 (sistema personal; si no lo tienes, es un Fallo) del despegue, y la huida ([e902](#e902)) si corresponde. Con 0–1 Fallos → [e910](#e910). Con 2 o más → [e908](#e908).
2. **Quedarte y seguir con tu nave.** Orla asiente. «*Suerte.*» El Argo despega sin ti. Si tenías `TRIPULANTE_EN_EL_ARGO`, ese tripulante se salva.

---

<a id="e908"></a>
### e908 · Otra estrella fugaz
*Final · Derrota*

El motor tose. El casco cruje. Por un momento, flotas en el borde del espacio, entre la Corona y las estrellas.

Desde la cabina ves Caribdis entera por primera vez: las Salinas como una mancha blanca, los Cañones como arrugas, el Polo brillando en la noche. Es más pequeño de lo que creías. Y más hermoso. Las manos se te sueltan de los mandos sin que se lo pidas. La Corona gira a tu alrededor, llena de naves que también quisieron irse.

Y entonces oyes el Canto, suave, amable, como una mano en la espalda. **Quédate.**

La nave da la vuelta.

Esa noche, en Caribdis, alguien mira la Corona y ve caer una estrella que no cae como las demás: **frena**. Se tuerce. Escupe fuego hacia arriba, como si quisiera volver.

*Fin. Has caído otra vez.*

Si quieres, la próxima partida puede empezar con una **Marca de legado**: anota `ESTRELLA_FUGAZ` en la nueva Hoja. Al principio de la partida, la nave caída que verás desde la Cicatriz es la tuya, y al explorarla (en las Dunas) encontrarás un sistema tuyo de calidad Sólida.

---

## Finales

<a id="e910"></a>
### e910 · Regreso
*Final · Victoria*

Lo has conseguido. Nadie había salido nunca de Caribdis. Tú sí.

**Lee tu epílogo.** Lee solo las líneas que se apliquen.

**Sobre ti:**
- *Piloto:* con `CULPA` 0–2: *«Vuelves a volar. Cada vez que despegas, sonríes, y esta vez sabes por qué.»* Con `CULPA` 3–4: *«Nunca vuelves a pilotar. Pero sueñas con el cielo rojo, y no siempre es una pesadilla.»* Con `CULPA` 5–6: *«Llegas a casa. Nadie sabe que has llegado: no se lo dices a nadie.»*
- *Piloto con `BORRASTE_LA_CAJA`:* *«Nunca sabrás qué grabó la caja. A veces, eso es lo único que te deja dormir.»*
- *Nativo:* con `ARRAIGO` 4 o más: *«Eres el primero de tu pueblo en ver otro sol. Lo describes en tu lengua, en un mensaje que tarda años en llegar a Quilla.»* Con `ARRAIGO` 2 o menos: *«En los mundos de los hombres te llaman mutante. Tú les dices que no: que eres un hijo de Caribdis.»*
- *Mente:* con `VUELVE_A_SER_LA_NAVE`: *«Eres la nave. Llevas a tu tripulación a todas partes, y cuando duermen, les cantas en voz baja tu propia canción.»* Si seguiste en el dron: *«Te quedas en el dron. Te gusta flotar. Te gusta tener nombre.»* Con `COPIA_EN_CARIBDIS`: *«Y en Caribdis, una parte de ti sigue esperando a los siguientes que caigan, para enseñarles el camino.»*

**Sobre los que vinieron:**
- Por cada tripulante a bordo: *«(Nombre) vive.»* Y añade:
  - *Iria* con `IRIA_CURADA`: *«…y nunca vuelve a soñar con su hija. Aprende a recordarla despierta.»*
  - *Bruno* con `LA_NIÑA_DE_LA_CAPSULA`: *«…y cría a la niña de la cápsula como si fuera suya. Lo es.»*
  - *Amara*: *«…y publica su trabajo. Nadie la cree. A ella le da igual.»*
  - *Noemí*: *«…y nunca vuelve a aceptar un contrato que no entiende.»*
  - *Tadeo*: *«…y deja los hábitos. Dice que ya encontró a Dios y que no le gustó.»*
  - *Lio*: *«…y cuando crece, vuelve a robar. Pero solo a los que se lo merecen.»*
- Con `MIRASOLES_A_BORDO`: *«Los Mirasoles ven el primer amanecer amarillo de sus vidas. Lloran todos. Tú también.»*
- Con `EL_VIEJO_ESPERA` (si viene): *«El viejo deja de contar días.»*
- Con `ANILLO_DE_LA_ANCIANA`: *«Entierras el anillo en un jardín de verdad, con hierba. Le hablas de vez en cuando.»*
- Con `PASAJERO_EL_CONTABLE`: *«El Contable abre un negocio de chatarra en un puerto espacial. En un año, es el dueño del puerto.»*
- Con el cuaderno de Amara (aunque Amara no esté): *«Llevas el cuaderno a una universidad. Les cambia la historia.»*

**Sobre los que se quedaron:**
- Por cada tripulante que no subió: *«(Nombre) se queda en Caribdis.»*
- Con `HALCYON`: *«No vuelves a por los dormidos del Halcyon. Siete luces verdes, en un cementerio de naves. Siempre te preguntarás.»*

**Lo que hiciste por el camino** (lee las que tengas):
- `ALIADO_DE_QUILLA`: *«En Quilla hay una pintura nueva en la cueva: tu nave, subiendo.»*
- `SALTASTE`: *«Los jóvenes de Quilla todavía saltan diciendo tu nombre.»*
- `MATASTE_A_LA_MADRE`: *«En los Cañones ya no hay bosque que camine. Tú lo sabes.»*
- `APAGASTE_EL_HALCYON` o `APAGASTE_EL_HOSPITAL`: *«Algunas noches cuentas luces que se apagan. Siempre son siete, o tres.»*
- `PROFANADOR`: *«Vendiste las medallas de los pilotos muertos. Una de ellas era de tu flota. No duermes bien.»*
- `ROBASTE_A_UNA_NIÑA`: *«Llevas su pistola de clavos en el cinturón. Nunca la usas.»*
- `NO_MIRASTE`: *«Nunca sabrás quién iba en aquella cápsula.»*
- `BORRASTE_LA_HUELLA`: *«A veces, en tu casa, encuentras arena roja aplastada junto a la cama.»*
- `CONFESION_EN_EL_BOSQUE`: *«En un bosque de piedra, unas setas repiten tu secreto para siempre. Te consuela.»*
- `QUEMASTE_EL_JARDIN` o `HERISTE_EL_CORAZON`: *«El micelio canta un poco más bajo desde que te fuiste. El Canto, un poco más alto.»*
- `NAVE_VIVA`: *«La nave te habla por las noches. Dice que le gusta volar.»*
- `ALIMENTASTE_EL_CORAZON` o `JARDIN_A_BORDO`: *«Llevas un pedazo del bosque contigo. Florece en tu ventana, dorado.»*
- `IRIA_JARDINERA`: *«En el Santuario hay una Jardinera nueva que cura a quien llega herido. Tiene manos de médica.»*
- `HERMANO_A_BORDO`: *«Tu hermano aprende a leer en un idioma de otro mundo. Te lo lee en voz alta.»* · `PROMESA_AL_HERMANO`: *«Le prometiste volver. Ahorras para una nave.»*
- `HIJA_DEL_SALINERO` o `EL_PACIENTE`: *«Alguien que no tenía que salir, salió gracias a ti.»*
- `PROMESA_A_BRUNO` sin Bruno a bordo: *«Prometiste ayudarle con su carga. No pudiste. Lo cuentas siempre como la promesa que rompiste.»*
- `PROMESA_AL_CORO`: *«El Coro te espera. Cada vez que oyes interferencias, sabes que te recuerdan.»*
- `MUERTO_EN_LOS_PAPELES`: *«En el libro del Contable figuras como muerto. Te parece justo.»*
- `DESPERTASTE_A_LOS_DORMIDOS`: *«Despertaste a los Antiguos y se deshicieron. No sabes si los liberaste o los mataste.»*
- `DOS_EN_UNA` o `EL_VIGIA_APRENDE`: *«Hay otra mente como la tuya. No estás sola.»*
- `AMARA_TENIA_RAZON`: *«Amara tenía razón. Lo escribió todo. Algún día, alguien la creerá.»*

**Sobre el Secreto** (solo si lo descubriste):
- Si descubriste que el Secreto es **2** y no tienes `ENGAÑASTE_A_LA_SONDA` ni `MAPA_DE_LOS_RECOLECTORES`: *«Un año después, seis luces aparecen en el cielo de tu mundo.»*
- Si el Secreto es **4**: *«Cuentas lo que sabes. Nadie te cree. Pero algunos dejan de responder a las llamadas de socorro de los sistemas que no salen en las cartas.»*
- Si el Secreto es **6**: *«A veces, cuando oyes interferencias en una radio, te parece oír tu propia voz.»*
- Si no descubriste el Secreto: *«Nunca supiste qué era el Canto. Quizá sea mejor así.»*

*Fin.*

---

<a id="e911"></a>
### e911 · Romper el bucle
*Final · Victoria · Secreto 6*

Antes de que el planeta desaparezca a tu espalda, enciendes la baliza una última vez. Grabas un mensaje y apuntas la antena **hacia atrás**: hacia el Canto, hacia el bucle, hacia ti mismo hace tanto tiempo.

¿Qué dices? `[Ingenio · 11]` (con Amara o la Mente a bordo: Ventaja; con `FRAGMENTO_LA_CUENTA`: Ventaja).

- *Éxito:* el mensaje es claro. «*No vengas. Gira 1,4 grados a babor. No vengas.*» Y en algún lugar del pasado, una nave gira. En la Corona, durante un instante, desaparece una estrella. **Has roto el bucle.** Lee también [e910](#e910), pero cambia la última línea del Secreto por: *«Y nunca vuelves a oír tu voz en la radio.»*
- *Fallo:* el mensaje sale distorsionado. Al llegar al pasado, alguien lo oirá como un canto. Lee [e910](#e910). La última línea es: *«Y en algún lugar, una nave que es la tuya acaba de oír cantar a alguien.»*

---

<a id="e912"></a>
### e912 · Silencio
*Final · Victoria · Secreto 5*

Callaste a la *Esperanza*. Al subir, ves cómo las Torres del Canto se apagan una a una, en cadena, como velas. Por primera vez en mil años, **Caribdis está en silencio**.

Las naves que pasen cerca ya no caerán. Los Hijos del Pecio podrán irse si quieren. Los Desguaces construirán naves que vuelen. El Coro llorará durante una generación.

Lee [e910](#e910) y añade: *«Diez años después, la primera nave de Quilla llega a un puerto estelar. La capitana tiene seis dedos en cada mano. Pregunta por ti.»*

---

<a id="e913"></a>
### e913 · Sabotaje
*Final · Victoria · Secreto 4*

Desde la órbita apuntas los motores hacia la torre más alta, la de la cima, y le disparas todo el combustible de reserva en un chorro de fuego. Pierdes velocidad. Pierdes tiempo. Ganas algo más importante.

`[Reflejos · 11]` (Piloto: Ventaja).

- *Éxito:* la torre se parte. El Canto aúlla, se rompe y **calla**. Las seis luces de los Recolectores se detienen, confusas: su granja ya no llama. Se dan la vuelta. Lee [e910](#e910) y añade: *«Caribdis es libre. Y nadie sabrá nunca que fuiste tú.»*
- *Fallo:* fallas el disparo. El Canto sigue. Lee [e910](#e910) y añade: *«Lo intentaste. Algún día, otro lo conseguirá. Le dejaste el camino marcado.»*

---

<a id="e914"></a>
### e914 · Hogar
*Final · Nativo*

No subes. Miras cómo la nave se eleva con tu tripulación a bordo (o vacía, si nadie quiso ir), y te das la vuelta hacia los Cañones.

Si la nave despega sin ti, haz la secuencia de despegue (e900) con 3 en todos los atributos en lugar de los tuyos (o con +0 si no hay nadie a bordo), solo para saber si llegan.

*«Tu nave se va. Tú te quedas. Eres el primero que ha tenido la elección, y has elegido. La Madre Óxida te recibe en Quilla con un plato de caldo y no dice nada. Años después, cuando la Madre muere, tú eres la Madre. Cuentas a los niños la historia de la nave que se fue, y de cómo tú la ayudaste a irse. Los niños miran la Corona. Uno de ellos, un día, se irá.»*

*Fin.*

---

<a id="e915"></a>
### e915 · Guardián
*Final · Secreto 2*

No despegas. Sabes lo que pasa si una nave sale de Caribdis: el mundo de origen es el siguiente. Bajas de la nave, la desmontas pieza a pieza con tus propias manos y entregas los restos a los Desguaces.

Si eres la Mente con `UNIDAD_DE_PRIMO`: *«Te conviertes en el Vigía número diez mil uno. Primo te da la bienvenida. Juntos mantenéis la orden: que nadie salga. Pero ahora también tenéis otra: que los que caen no estén solos.»*

Si no: *«Vives en Caribdis el resto de tu vida. Envejeces. A veces, de noche, miras las estrellas y piensas en todos los mundos que siguen a salvo porque tú te quedaste. Nadie lo sabrá nunca. Tú sí.»*

*Fin. Es una victoria, aunque no lo parezca.*

---

<a id="e916"></a>
### e916 · Retorno
*Final · Mente · Victoria*

A medio camino de las estrellas, te das cuenta de que no quieres ir allí. Quieres ir **a casa**. Y tu casa está en un punto azul muy lejano del mapa de la galaxia que viste en un arca de los Antiguos.

Dejas a tu tripulación en el primer puerto estelar (lee las líneas de los que vinieron en [e910](#e910)) y sigues sola. Durante años. Hacia el origen de los Antiguos.

*«Lo que encuentras allí no cabe en este libro. Pero cuando llegas, alguien te espera en la puerta. Tiene cuatro brazos y la cara lisa. Te dice algo que reconoces: es la primera palabra que oíste en Caribdis. Bienvenida.»*

*Fin.*

---

<a id="e917"></a>
### e917 · Comunión
*Final*

Dejas de resistirte. El Canto te envuelve como agua tibia y, por primera vez desde que caíste, **no tienes miedo**.

Subes a la cima de la torre más alta. Te sientas en el trono. Y te vas, hacia dentro, con todos los demás.

- **Si el Secreto es 1** (si no lo sabías, cuéntalo: [e840](#e840)): *«Es verdad. Nadie muere. Estás con los Antiguos, con los niños de las cunas vacías, con los ancianos del jardín, con cada náufrago que oyó la llamada. Sois millones. Sois uno. Y cuando llegan los Recolectores, el Canto canta más fuerte, y ellos no encuentran a nadie que llevarse.»* **Es una victoria.**
- **Si no:** *«Durante un tiempo, es maravilloso. Luego, poco a poco, ya no recuerdas por qué. Te conviertes en una nota más del Canto, que llama a la siguiente nave. Y la siguiente nave te oye.»* **Es una derrota.**

*Fin.*

---

<a id="e918"></a>
### e918 · Despertar
*Final*

El Polo se abre. El hielo estalla en una columna que llega hasta la Corona. Y de debajo sale algo tan grande que no lo entiendes: un ojo, una boca, un horizonte vivo.

- **Si el Secreto es 3** (si no lo sabías, cuéntalo: [e840](#e840)) **y estás en la secuencia de despegue** (o despegas antes de que el Reloj baje 3, mientras el planeta se rompe; si no, es una derrota): *«Los Recolectores la ven. Por fin. Las seis luces se lanzan sobre ella como lobos sobre un ciervo. Nadie te mira mientras te vas. Detrás de ti, Caribdis se rompe como un huevo. Lo que salió de él y lo que la cazaba se pierden juntos en la oscuridad.»* Lee [e910](#e910) y añade: *«Nadie volverá a caer en Caribdis. Ya no existe.»* **Es una victoria terrible.**
- **Si no:** *«La Bestia despierta hambrienta. Y tú estás encima.»* **Es una derrota.**

*Fin.*

---

<a id="e919"></a>
### e919 · Las seis luces
*Final · Derrota · Reloj 0*

Amanece. Pero Escila no sale sola: a su lado hay seis soles negros.

Los Recolectores han llegado.

No hacen ruido. No disparan. Simplemente **bajan**. Uno se posa sobre el Cementerio de Naves y Puerto Chatarra deja de existir. Otro sobre Quilla. Otro sobre las Torres, y el Canto, por fin, calla.

El último baja sobre la Cicatriz. Tu nave, tan cerca de estar lista, brilla un instante bajo su sombra.

- Si tienes `SABE_ESCONDERSE` y estás en los Cañones: te escondes como hicieron los Hijos del Pecio hace mil años. Sobrevives. *«Cuando se van, sales de la cueva. No queda casi nada. Pero tú sí. Y tu nave, medio enterrada bajo la arena, sigue allí. Quizá dentro de mil años…»* **Es una derrota, pero estás vivo.**
- Si no: *«Lo último que ves es una flor negra que se abre.»*

*Fin.*

---

<a id="e920"></a>
### e920 · Polvo rojo
*Final · Derrota · Has caído*

Te quedas tumbado en la arena roja. Escila es enorme sobre ti. El Canto te susurra que no pasa nada, que descanses, que nadie se va de Caribdis.

Por una vez, le crees.

- Si tienes compañeros con Lealtad 3, uno de ellos sigue adelante con tu trabajo. Puedes seguir jugando con él como protagonista: usa sus habilidades, tus sistemas, tu Reloj. Tiene atributos 3 en todo y Temple 1. Si despega, lee [e910](#e910) en su nombre.
- Si no: *«El viento cubre tu cuerpo en una noche. En un año, los Desguaces encuentran tu nave y la desmontan. Una placa de tu casco acaba en el tejado de una casa de Quilla. Un niño la mira a veces, sin saber por qué, y piensa en irse.»*

*Fin.*
