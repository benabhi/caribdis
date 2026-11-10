# SEGUNDA PARTE · EVENTOS

---

## Prólogo: la caída

<a id="e001"></a>
### e001 · La caída
*Prólogo*

Primero falla la navegación. Después las luces. Después algo que no es ruido, sino **la ausencia de ruido**: un silencio que se te mete en los dientes como un zumbido al revés.

El casco tiembla como un animal herido. Por la ventanilla, el anillo de restos pasa tan cerca que lees matrículas.

Las pantallas muestran un planeta que no estaba en la carta. Rojo como una herida vieja, con un anillo de restos brillando alrededor. Las alarmas gritan nombres de sistemas que ya no responden.

Y debajo de las alarmas, muy bajito, alguien canta.

La nave entra en la atmósfera de lado.

- Si eres **el Piloto** → [e002](#e002).
- Si eres **el Nativo** → [e003](#e003).
- Si eres **la Mente** → [e004](#e004).

---

<a id="e002"></a>
### e002 · Manos en los mandos
*Prólogo · Piloto*

Los implantes de tus muñecas arden: intentan hablar con una nave que ya no escucha. Tienes quizá diez segundos de control antes del suelo. Diez segundos para decidir **qué parte de la nave salvar**.

1. **Levantar el morro.** `[Reflejos · 9]`. Salvas la cabina y el casco delantero.
   - *Éxito:* la nave se arrastra un kilómetro por la arena y se detiene entera. Tendrás Ventaja al instalar tu primer sistema: anota `MORRO_ENTERO`.
   - *Fallo:* el golpe te deja Herido (2 Heridas). La nave se parte, pero tú sigues vivo.
2. **Desviar a la sección de carga.** Allí iban los suministros. Empiezas con +3 Raciones y +2 Chatarra, pero recibes 1 Herida en el impacto.
3. **Desviar a la sección de la tripulación.** Allí iban ellos. No sabes cuántos sobrevivirán, pero algunos sí. Baja tu `CULPA` en 1 y elige qué tripulante estará contigo al despertar (en lugar de tirarlo). Recibes 2 Heridas.

Después, oscuridad → [e005](#e005).

---

<a id="e003"></a>
### e003 · Una estrella que no se apaga
*Prólogo · Nativo*

En Quilla dicen que mirar a la Corona trae mala suerte, así que tú siempre la miras. Esta noche una de sus estrellas no cae como las demás: **frena**. Se tuerce. Escupe fuego hacia arriba, como si quisiera volver.

Te subes al tejado de chapa del secadero para verla mejor. La estrella deja una cicatriz de humo en el cielo, de norte a sur, y el viento trae un olor que no conoces: metal caliente, plástico quemado, algo que podría ser comida. Los perros de la aldea no ladran. Miran hacia el mismo sitio que tú.

Nadie en tu aldea ha visto nunca una nave que luche.

1. **Correr hacia ella.** Tres días de marcha por los cañones y las dunas. Llegas antes que los Desguaces. Gana `PRIMERO_EN_LLEGAR`; empiezas con −1 Ración.
2. **Avisar a la Madre Óxida.** Ella te mira mucho rato y luego te da su bendición y un amuleto de cobre (cuenta como reliquia identificada: **Amuleto de la Madre**, una vez por partida evita 1 subida de Canto). Llegas a la nave detrás de los carroñeros. +1 `ARRAIGO`.
3. **Robar un trepador de la aldea y salir esa misma noche.** Llegas en un día. Empiezas con un **trepador** (vehículo, r152: consume 1 Ración extra por viaje, no puede entrar en la Ciudad Enterrada). −1 `ARRAIGO` y −1 de Reputación con los Hijos del Pecio.

Llegas a la nave → [e005](#e005).

---

<a id="e004"></a>
### e004 · Arranque en frío
*Prólogo · Mente*

```
> ARRANQUE DE EMERGENCIA
> NÚCLEO PRINCIPAL: SIN RESPUESTA
> TRANSFERENCIA A UNIDAD DE REPARACIÓN R-7: 61 %
> MEMORIA DISPONIBLE: INSUFICIENTE
```

Eres la nave. Eras la nave. Ahora eres una esfera de reparación del tamaño de una cabeza, abollada, que flota a palmo y medio del suelo con antenas dobladas y un manojo de cables por cola, y te queda espacio para **una sola cosa más** antes de que el núcleo muera del todo.

1. **El diario de navegación.** Sabes de dónde venías y por qué te desviaste. Gana `FRAGMENTO_DESVIO`. +1 `MEMORIA`.
2. **La lista de tripulantes**, con sus fichas médicas y sus constantes. Ventaja la primera vez que Explores en la región de un tripulante. Anota `LISTA_DE_A_BORDO`.
3. **Tu propia personalidad.** Lo que te hacía *tú*. Empiezas con +1 Temple máximo y con `YO_ENTERA`. Sin ella, serías solo una herramienta muy lista.

El núcleo se apaga. Tus nuevos ojos se encienden → [e005](#e005).

---

<a id="e005"></a>
### e005 · La Cicatriz
*Prólogo · Dunas de Óxido*

La nave ha abierto un surco de dos kilómetros en la arena roja. Los locales lo llamarán **la Cicatriz**, y será tu casa hasta que te vayas o te mueras.

Desde fuera, el diagnóstico es fácil: está muerta. Desde dentro es peor. El **casco** está abierto como una lata. El **motor** se ha soltado de sus anclajes y ha rodado colina abajo hasta romperse. La **navegación** no sabe en qué planeta está. El **soporte vital** silba. Los tanques de **combustible** gotean un líquido azul que se evapora antes de tocar la arena.

Lo único que funciona perfectamente es la **baliza de socorro**. Parpadea en rojo. Emite en todas las frecuencias.

*Anota en la Hoja de la nave los cinco sistemas como «perdidos», y el sistema personal de tu protagonista como «por descubrir».*

¿Qué haces con la baliza?

1. **Dejarla encendida.** Alguien vendrá. Quizá alguien bueno → [e006](#e006).
2. **Intentar apagarla.** `[Ingenio · 9]`. *(Así se hace una prueba: tira 2d6, suma tu Ingenio y compáralo con 9.)*
   - *Éxito:* el parpadeo se apaga. Borra `BALIZA_ACTIVA`, anota `BALIZA_MUDA` y ve a [e007](#e007).
   - *Fallo:* la baliza se defiende como una cosa viva. Sube la Alerta a 2 → [e006](#e006).
3. **Romperla a golpes.** Anota `BALIZA_ROTA` y borra `BALIZA_ACTIVA`. Ya nadie te oirá, ni amigo ni enemigo. Pero algo que ya venía no necesita oírte más → [e007](#e007).

---

<a id="e006"></a>
### e006 · Los primeros en llegar
*Prólogo · Dunas de Óxido*

Llegan con la noche: tres siluetas sobre un arenero de ruedas de tractor, con faros de nave pegados con cinta. Llevan máscaras de soldador y abrigos hechos de asientos de cabina. **Desguaces.** Vienen a por tu nave antes de que se enfríe.

Si tienes `PRIMERO_EN_LLEGAR`, estás tú solo delante de los restos, y ellos lo saben.

> **Carroñeros de Puerto Chatarra** · Ataque 3 · Blind. 1 · Heridas 3 · [Náufrago]

*Este es tu primer encuentro. Aquí se usan las plantillas (r300): elige una postura y tira 1d6.*

**Encuentro (r300).** Precio: 2 Chatarra. Botín: una **pistola de clavos**.

- **Si pasas:** se marchan, pero anotan dónde estás. +1 de Reputación con los Desguaces (y −1 con los Vigías, r194) si les pagaste o comerciaste con ellos → [e008](#e008).
- **Si ganas:** quédate su Botín. −1 de Reputación con los Desguaces → [e008](#e008).
- **Si huyes:** se llevan lo que pueden de la nave: pierdes 2 Chatarra o 2 Raciones (eliges) → [e008](#e008).

---

<a id="e007"></a>
### e007 · Lo que sale de la arena
*Prólogo · Dunas de Óxido*

Silencio. Solo el viento, que arrastra el óxido en remolinos que parecen manos. Te sientas junto a la nave y escuchas cómo se enfría el metal.

Entonces la arena se mueve. Algo pequeño, con demasiadas patas y una boca que es todo dientes de chapa, sale de debajo del casco y te mira. Viene **a comerse tu nave**.

> **Rata de óxido** · Ataque 2 · Blind. 0 · Heridas 2 · [Bestia]

*Tu primer combate (r140). Cada ronda, tira 2d6 + Vigor (o Reflejos si tienes arma de distancia) + tu arma, contra 2d6 + 2.*

1. **Pelear.** Combate.
   - *Si ganas:* la desmontas. Dentro, entre los dientes, hay restos de otras naves: gana 2 Chatarra → [e008](#e008).
2. **Ahuyentarla con fuego** (con un trapo empapado en el aceite del motor): se va. Pero vuelve con más ratas. Gana la Pista `Dunas · El nido · e203` → [e008](#e008).
3. **Dejar que se coma un trozo de casco que ya no sirve.** Mientras mastica, la estudias. Gana `RATAS_AMIGAS` (en el futuro, las ratas de óxido no te atacarán si les ofreces 1 Chatarra) → [e008](#e008).

---

<a id="e008"></a>
### e008 · El primer amanecer
*Prólogo · Dunas de Óxido*

Escila sale por el horizonte: enorme, roja, cansada. La luz no calienta, solo tiñe. Tu sombra es larga y se dobla sobre la arena como si quisiera volver a la nave.

Y entonces lo oyes de verdad, sin interferencias: **el Canto**. Viene del este. No tiene palabras, pero tú las entiendes de todos modos: *quédate*.

*Sube tu Canto en 1 (r137).*

1. **Taparte los oídos y concentrarte en el trabajo.** `[Voluntad · 9]` ♫.
   - *Éxito:* no te vence. Baja el Canto en 1.
   - *Fallo:* te pasas una hora mirando al este sin darte cuenta. Nada más… esta vez.
2. **Escucharlo con atención.** +1 Canto ♫, pero gana `FRAGMENTO_LA_VOZ`: crees haber oído, dentro del Canto, una voz que conoces.
3. **Cantar tú, más fuerte.** Te sientes ridículo. Y mejor. +1 Temple.

→ [e009](#e009).

---

<a id="e009"></a>
### e009 · Luces en formación
*Prólogo · Dunas de Óxido*

Esa noche, la Corona brilla como siempre. Pero entre los restos en órbita hay algo nuevo: **seis puntos de luz** que no se mueven con el resto. Están en formación. Muy lejos, en el borde del sistema.

Si eres la Mente, lo sabes enseguida: tus registros identifican el patrón con lo poco que se sabe de ellos. Si no, lo entenderás pronto. Los náufragos tienen una palabra para esas luces, y es una palabra que se dice en voz baja: **Recolectores**.

Vienen hacia aquí. A esta velocidad, en unos **sesenta días**.

*El Reloj empieza en 60 (r134). Cada amanecer baja 1. Si llega a 0, te encuentran.*

- Si tienes `BALIZA_ACTIVA`, ya sabes por qué vienen. Y ellos saben exactamente adónde.
- Si tienes `BALIZA_ROTA` o `BALIZA_MUDA`, quizá llegaste a tiempo. Quizá no. Gana 1 Temple.

→ [e010](#e010).

---

<a id="e010"></a>
### e010 · Por dónde empezar
*Prólogo · Dunas de Óxido*

Tu nave necesita seis sistemas. Tú necesitas no morirte. El planeta es enorme, y tienes sesenta días.

Hace frío y el sol rojo apenas asoma. Abajo, la nave cruje mientras se enfría, y cada crujido suena a pregunta: por dónde, cuánto tiempo, para qué.

Respiras hondo. El aire sabe a polvo y a hierro, pero se puede respirar. Más abajo, entre los restos, algo pequeño se mueve y se esconde.

Desde lo alto de la Cicatriz se ven tres caminos:

- Al **norte**, el resplandor de miles de cascos de metal: el **Cementerio de Naves**. Donde hay naves hay piezas, y donde hay piezas hay Desguaces.
- Al **oeste**, la blancura cegadora de las **Salinas**. Dicen que allí se puede refinar combustible.
- Al **este**, las gargantas de los **Cañones**, y más allá, las agujas que cantan.

Elige uno. Ganas la Pista correspondiente:

1. **Cementerio de Naves** · *El rastro de humo* · [e221](#e221).
2. **Salinas Blancas** · *La refinería abandonada* · [e241](#e241).
3. **Cañones de las Bestias** · *Las huellas descalzas* · [e301](#e301).

Si eres **el Nativo**, ganas además la Pista `Cañones · Quilla · e410` (ya sabes volver a casa).

→ [e011](#e011).

---

<a id="e011"></a>
### e011 · Inventario
*Prólogo · Dunas de Óxido*

Antes de salir, rebuscas en los restos de la nave. Tira 1d6 dos veces y gana ambas cosas (si repites, elige otra):

| d6 | Encuentras |
|---|---|
| 1 | Botiquín de a bordo |
| 2 | Bombona de aire (Piloto) o célula de energía (los demás) |
| 3 | 3 Chatarra en piezas sueltas |
| 4 | Hacha de casco de emergencia |
| 5 | 3 Raciones de emergencia (saben a cartón dulce) |
| 6 | Una caja con candado de la tripulación: si la abres con `[Vigor · 9]` (con un Fallo, no cede), dentro hay una **reliquia sin identificar** que alguien traía de contrabando. Anota `CONTRABANDO` |

→ [e012](#e012).

---

<a id="e012"></a>
### e012 · Día uno
*Prólogo*

Recuerda:
- **Cada día:** amanecer (r131), una acción (r132) y anochecer (r133).
- **Para encontrar los sistemas y a tu tripulación**, explora las regiones que anotaste en la Hoja de la nave (r153).
- **Lleva los sistemas a la Cicatriz** e instálalos (r181).
- **Cuidado con la Alerta**: cuanto más ruido hagas, peor será lo que te encuentre.

El viento borra tus huellas en cuanto las haces. Escila ya está alta. Detrás de ti, la baliza parpadea o calla.

**Comienza el día 1.** Ve al amanecer (r131). El Reloj pasa de 60 a 59.

*Buena suerte. Nadie ha salido nunca de Caribdis. Todavía.*
