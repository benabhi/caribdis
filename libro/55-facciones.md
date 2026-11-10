## Facciones

*Eventos de aliado (Reputación +3) y de enemigo (Reputación −3). Ver r194: los Hijos del Pecio y el Coro son rivales, igual que los Desguaces y los Vigías.*

<a id="e640"></a>
### e640 · Hijo de la Quilla
*Quilla · Aliado · ⌛ 0*

La Madre Óxida te recibe en la cabina con toda la aldea reunida. Te ponen un collar de cobre y te pintan la frente de ocre.

«Ya no eres de fuera. Si te vas, te vas como uno de los nuestros. Y si te quedas, tienes casa.»

Elige un regalo:
1. **Una pieza de la *Esperanza*:** un sistema a tu elección, calidad Excelente, salvo Combustible.
2. **Guerreros para el despegue:** anota `GUERREROS_DE_QUILLA`. En la secuencia de despegue, los Hijos del Pecio defienden la Cicatriz: superas automáticamente un ataque de facción.
3. **Un nombre:** te dan un nombre en su lengua. +1 Temple máximo. Si eres el Nativo, +2 `ARRAIGO`.

Anota `ALIADO_DE_QUILLA`. **★**

---

<a id="e641"></a>
### e641 · La caza
*Cañones de las Bestias, o donde estés · Enemigo · ⌛ 0*

Los Hijos del Pecio han decidido que eres una amenaza. Seis cazadores con lanzas de hueso y pintura de guerra te rodean al amanecer.

> **Cazadores de Quilla** · Ataque 5 · Blind. 1 · Heridas 5 · [Náufrago]

1. **Luchar.** Combate. *Si ganas:* huyen, pero volverán: anota `CAZADO_EN_LOS_CAÑONES`. Cada vez que entres en los Cañones, tira 1d6: con 1–2, repite este evento.
2. **Huir.** `[Reflejos · 11]`. *Fallo:* combate con Emboscada.
3. **Rendirte y pedir juicio.** Te llevan ante la Madre Óxida. `[Voluntad · 13]`. *Éxito:* te perdona: tu Reputación con los Hijos del Pecio vuelve a −1. *Fallo:* te expulsan de los Cañones: anota `EXPULSADO_DE_LOS_CAÑONES`. No puedes volver a entrar en los Cañones (salvo de paso, con un vehículo).

---

<a id="e642"></a>
### e642 · Socio del Contable
*Puerto Chatarra · Aliado · ⌛ 0*

El Contable cierra su libro de cuentas y te mira con algo parecido al respeto.

«Has hecho más dinero para mi ciudad en semanas que la mitad de mis hombres en años. Te propongo algo. Te ayudo a irte. Y tú me llevas contigo.»

1. **Aceptar.** Anota `PASAJERO_EL_CONTABLE`. Te da **un sistema a tu elección, calidad Excelente**, y 10 Chatarra. En la secuencia de despegue, los Desguaces no te atacarán. **★**
2. **Rechazar, pero mantener la amistad.** Te da 10 Chatarra y los precios de Puerto Chatarra quedan a mitad para ti (hacia arriba, mínimo 1, sin regatear) el resto de la partida.
3. **Pedirle que deje en paz a los Hijos del Pecio.** Se ríe. «*¿Por qué haría eso?*» `[Voluntad · 11]`. *Éxito:* acepta un pacto. +2 de Reputación con los Hijos del Pecio. Anota `PAZ_DEL_CONTABLE`. **★**

---

<a id="e643"></a>
### e643 · La recompensa
*Cementerio de Naves, o donde estés · Enemigo · ⌛ 0*

Tu cara está en carteles por todo el Cementerio: *SE BUSCA · VIVO O EN PIEZAS · 50 CHATARRA*. Un grupo de cazarrecompensas Desguaces te ha encontrado.

> **Cazarrecompensas** · Ataque 5 · Blind. 2 · Heridas 5 · [Náufrago]

1. **Luchar.** Combate. *Si ganas:* sus armas valen 6 Chatarra. Pero vendrán más: anota `CAZADO_EN_EL_CEMENTERIO`. Cada vez que estés en el Cementerio, tira 1d6; con 1–2, repite este evento.
2. **Pagarles.** 10 Chatarra y te dejan en paz (esta vez).
3. **Fingir tu muerte.** `[Ingenio · 13]`. *Éxito:* les entregas un cadáver con tu ropa. Ya no te buscan: tu Reputación con los Desguaces vuelve a −1. Anota `MUERTO_EN_LOS_PAPELES`. *Fallo:* te descubren. Combate con Emboscada.

---

<a id="e644"></a>
### e644 · El elegido del Coro
*El Atrio · Aliado · ⌛ 0*

La Voz desciende de la escalinata y se arrodilla ante ti. Todo el Atrio guarda silencio.

Cientos de rostros se vuelven hacia ti. Nadie respira. Las columnas de luz azul laten más despacio, como un corazón que espera una respuesta.

«El Canto te ha elegido. Puedes subir a la cima y unirte a él para siempre. O puedes irte con su bendición. Nadie ha recibido nunca esa elección.»

1. **Unirte al Canto.** → [e917](#e917).
2. **Irte con su bendición.** Anota `BENDICION_DEL_CORO`. En la secuencia de despegue, **el Canto no te afecta**: superas automáticamente la prueba 4 (el Canto). **★**
3. **Pedirle la verdad.** La Voz calla. Luego, con una voz que no es de nadie, dice: «*Pregúntale al que duerme.*» Gana `FRAGMENTO_EL_QUE_DUERME` y la Pista `Polo · El Pozo · e281`.

---

<a id="e645"></a>
### e645 · El coro te llama
*Torres del Canto, o donde estés · Enemigo · ⌛ 0*

No vienen con armas. Vienen cantando. Treinta cantores con la boca cosida forman un círculo a tu alrededor, y el Canto, a través de ellos, **te aprieta**.

1. **Resistir.** `[Voluntad · 13]` ♫. *Éxito:* el círculo se rompe. Los cantores caen al suelo, agotados. *Fallo:* +3 Canto. Si llegas a 6, ve a tu evento de Canto 6.
2. **Romper el círculo a golpes.** *Círculo de cantores · Ataque 4 · Blind. 0 · Heridas 6 · [Cantor][Enjambre]*. Combate. *Si ganas:* ◉ +1 Alerta, y vuelven: anota `CAZADO_EN_LAS_TORRES`. Cada vez que estés en las Torres, tira 1d6; con 1–2, repite este evento.
3. **Cantar más fuerte que ellos.** `[Voluntad · 11]`. Si tienes `FRAGMENTO_LA_CONTRAMELODIA`, Ventaja. *Éxito:* el círculo se deshace en confusión. Tu Reputación con el Coro vuelve a −1: les has impresionado. *Fallo:* +2 Canto ♫.

---

<a id="e646"></a>
### e646 · Unidad de confianza
*El Nodo · Aliado · ⌛ 0*

Custodio Primo se levanta de su trono por primera vez en diez mil años.

«*UNIDAD VALIOSA. ORDEN NUEVA: PROTEGER A LA UNIDAD.*»

1. **Aceptar la protección.** Anota `PERMISO_DE_PRIMO` y `ESCOLTA_VIGIA`. Un Vigía te acompaña como compañero (no cuenta para el límite; +2 Ataque; [Máquina]). En la secuencia de despegue, los Vigías te escoltan. **★**
2. **Pedirle el reactor.** **Motor Excelente** (pesado; anota `MOTOR_DEL_NODO`).
3. **Pedirle la verdad.** «*ACCESO CONCEDIDO.*» Ve a [e840](#e840) inmediatamente, aunque no tengas 3 `FRAGMENTO_`.

---

<a id="e647"></a>
### e647 · Protocolo de eliminación
*Ciudad Enterrada, o donde estés · Enemigo · ⌛ 0*

Tres Vigías de combate, más grandes que los de patrulla, con cañones de luz fría en lugar de brazos. Tu imagen está en su memoria.

> **Vigías de eliminación** · Ataque 6 · Blind. 3 · Heridas 6 · [Máquina][Antiguo]

1. **Luchar.** Combate. *Si ganas:* sus restos valen 8 Chatarra y una batería de luz fría. Anota `CAZADO_POR_LOS_VIGIAS`: cada vez que estés en la Ciudad o en el Polo, tira 1d6; con un 1, repite este evento.
2. **Huir al Bosque.** Los Vigías no entran en el Bosque (el micelio los ataca). Si estás en una región vecina al Bosque, `[Reflejos · 11]` para llegar allí; si lo consigues, viajas al Bosque sin encuentro.
3. **Enlazarte** (Mente): `[Ingenio · 13]`. *Éxito:* borras tu imagen de su memoria. Tu Reputación con los Vigías vuelve a −1. *Fallo:* combate, y te atacan con +2 en la primera ronda.
