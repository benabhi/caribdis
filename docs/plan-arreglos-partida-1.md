# Plan de arreglos tras la 1.ª partida narrada (Piloto)

Origen: [partidas/piloto.md](../partidas/piloto.md), «Problemas que noté» y «Cosas ambiguas del texto».
Estado: **aplicado con cambios** el 18 de noviembre. Esta es la propuesta original; al medirla con el simulador desequilibraba a los protagonistas (Piloto 87 %, Nativo 57 %), así que se aplicó una versión corregida. Lo que entró de verdad está en la sección M de [revision-definitiva.md](revision-definitiva.md).

---

## Cómo lo vamos a hacer sin romper nada

1. **Cambios mínimos y escritos antes.** Cada arreglo de abajo tiene el texto actual y el texto nuevo, palabra por palabra. Solo se cambia eso.
2. **Una sola palanca por problema.** Si una palanca no alcanza, se ajusta esa, no se suman otras.
3. **Medir antes y después.** Simulador con 3000 partidas por protagonista y la misma semilla, antes y después. Objetivo: Piloto, Nativo y Mente entre el 62 % y el 72 % de victorias, como se acordó el 11 de noviembre. *Ojo: el simulador casi no usa las compras (e405 en el 10 % de las partidas, e416 en el 5 %). Para los problemas 3 y 4, la prueba real es la 2.ª partida narrada.*
4. **Verificador.** `herramientas/verificar.py`: enlaces, montaje y anclas. Si cambia alguna Marca, se regenera el índice de Marcas.
5. **PDF.** Rebuild y comprobación de que siguen siendo **200 páginas**. Se compara el texto página por página con el PDF anterior: solo pueden cambiar las páginas que tocamos, sin títulos huérfanos ni columnas descompensadas. Las páginas cambiadas se revisan como imagen.
6. **Releer el diff completo,** cambio por cambio, antes de entregar.
7. **Registro.** Sección nueva en `docs/revision-definitiva.md` y un PR.
8. **Comprobación final.** 2.ª partida con el Piloto, con el mismo método, para comparar.

---

## Los 8 problemas

### 1 · El hambre domina la partida
**Diagnóstico.** La comida se pensó como palanca de dificultad (11 de noviembre: forrajeo 1, despensa 8), pero en una partida real se come todo lo demás. 11 Heridas por hambre frente a 2 por el resto.
**Palanca:** forrajear da más.

| Dónde | Ahora | Propuesta |
|---|---|---|
| r153 c) | «+1 Ración (el Nativo, +3) o +1 Energía» | «**+2 Raciones** (el Nativo, **+4**) o +1 Energía» |
| r103 Hijo de Caribdis | «forrajeas +3 Raciones en lugar de +1» | «forrajeas **+4** Raciones en lugar de **+2**» |

La dificultad que se pierde se recupera con el problema 8 (menos mejoras) y el 4 (atajos más caros).

### 2 · El truco de la Cicatriz (r182)
| Dónde | Ahora | Propuesta |
|---|---|---|
| r182, último punto | «Los compañeros que dejes en la Cicatriz se apañan con poco y no gastan nada, pero no te acompañan ni cuentan como compañeros.» | «**Al amanecer decides quién va contigo, y vale para todo el día.** Los que se quedan en la Cicatriz se apañan con poco y no gastan nada, pero ese día no te acompañan ni cuentan como compañeros.» |

### 3 · El final fue demasiado fácil
**Diagnóstico.** Se juntaron cuatro cosas: muchas mejoras (8), sistemas Excelentes fáciles de conseguir, las Ventajas de los tripulantes y unos Recolectores que solo aparecen con el Reloj en 15. Los problemas 4 y 8 ya atacan las dos primeras. Aquí, una palanca: los Recolectores.

| Dónde | Ahora | Propuesta |
|---|---|---|
| e900 Paso 3 | «Si el Reloj está en **15 o menos**, o tienes `BALIZA_ACTIVA` → e902» | «Si el Reloj está en **25 o menos**, o tienes `BALIZA_ACTIVA` → e902» |

Así, salir con mucho margen (Reloj 26 o más) sigue siendo la forma de evitarlos, pero hay que ganárselo. *Alternativa, si no te convence:* la Alerta 3 o más también lleva a e902.

### 4 · Los atajos de compra son muy potentes
| Dónde | Ahora | Propuesta |
|---|---|---|
| e405 opción 1 (deuda) | «Te dan **Combustible Sólido** (pesado) gratis» | «Te dan **Combustible Precario** (pesado) gratis» |
| e416 opción 2 | «8 Chatarra o 4 objetos por **Soporte vital Sólido**» | «**12** Chatarra o **6** objetos por **Soporte vital Sólido**» |

Siguen siendo atajos (te ahorran la Ciudad o las Torres), pero ya no son la mejor opción siempre: la deuda da un sistema peor y el huerto cuesta tanto como pagar el combustible al contado.

### 5 · La historia del personaje se pierde si despegas pronto
| Dónde | Ahora | Propuesta |
|---|---|---|
| e900 Paso 0, al principio | — | «**Si te falta historia.** Si no has leído toda tu historia personal (r102–r104), lee ahora las entradas que falten, en orden, como si fuera su noche. Ignora las Pistas que den.» |

Comprobé las seis entradas afectadas (e803, e804, e813, e814, e823 y e824): todas funcionan leídas justo antes de despegar. e804, la de las plazas, incluso gana sentido.

### 6 · Los pulsos se repiten mucho
**Diagnóstico.** Solo hay 6 pulsos y salen 1 de cada 3 días: unos 17 por partida, cada uno casi 3 veces.
**Palanca:** que no se repitan hasta haberlos visto todos.

| Dónde | Ahora | Propuesta |
|---|---|---|
| r131 paso 4 | «…tira otro d6 y lee e020–e025: 1 = e020, 2 = e021, y así sucesivamente.» | «…tira otro d6 y lee e020–e025: 1 = e020, 2 = e021, y así sucesivamente. **Anota los que leas: si te sale uno que ya leíste, lee el siguiente que no hayas leído (después de e025 viene e020). Cuando los hayas leído todos, borra las notas y empieza otra vez.**» |

*Mejor solución, si querés más contenido:* escribir 6 pulsos nuevos para la segunda mitad de la partida (Reloj 30 o menos). Es la que más rejugabilidad da, pero ocupa una página más y obliga a ajustar la maqueta. Te la propongo para después.

### 7 · El *Minuto robado* (e021) castiga sin avisar
| Dónde | Ahora | Propuesta |
|---|---|---|
| e021 | «Si tienes a Amara contigo, la lee: es una **dirección**. Gana la Pista `Polo · La puerta · e288`.» | «Si tienes a Amara contigo **o esperándote en la Cicatriz**, la copias y ella la lee: es una **dirección**. Gana la Pista `Polo · La puerta · e288`.» |
| e021 | «Con 1–3, pierdes 1 objeto común» | «Con **1–2**, pierdes 1 objeto común» |

### 8 · Demasiadas mejoras
**Diagnóstico.** Cada instalación da una mejora: 6 por partida, más los ★. El simulador da 5,8 de media; en mi partida fueron 8.

| Dónde | Ahora | Propuesta |
|---|---|---|
| r190 | «Cada vez que **instales un sistema** o superes un evento o una opción con **★**…» | «Cada vez que **instales tu 2.º, 4.º y 6.º sistema**, o superes un evento o una opción con **★**…» |
| r190 | «+1 a un atributo (máximo 6).» | «+1 a un atributo (máximo **5**; solo los eventos pueden subirlo a 6).» |

Con esto, la media baja a unas 4 mejoras y los atributos se quedan en 5. El simulador dirá si hay que compensar en algún protagonista (la Mente es la que más depende de las mejoras).

---

## Las ambigüedades

| Dónde | Duda | Arreglo |
|---|---|---|
| **e302** El puente | ¿Qué pasa si te agarras? | «`[Vigor · 9]` para agarrarte: **si lo logras, vuelves a tu orilla y hoy no cruzas**; si fallas, caes…» |
| **e060** La Peregrina | ¿La ayuda se gasta si no fallas? | «la próxima vez que **falles al explorar** esta región, cuenta como Éxito.» |
| **r102** CULPA | ¿Encontrar a un tripulante la baja? | «Baja cuando salvas a alguien de la tripulación **(lo dice su evento)**…». Así queda claro que solo baja cuando el evento lo indica, como el de Iria. |
| **e900** Paso 2 | ¿Cuentan las Ventajas generales de los tripulantes (Tadeo en Voluntad)? | Después de la tabla: «**Solo cuentan las ayudas de esta tabla**, no las habilidades generales de los compañeros (r185).» |
| **r152** Vehículos | ¿Dónde queda el vehículo si vas a pie? | Al final: «Si viajas sin él, se queda en la región donde lo dejaste: anótala y recógelo al volver.» |
| **e702** Filtro pulmonar | ¿Cómo se cuentan los «dos amaneceres»? | «Solo gastas Aire **uno de cada dos amaneceres en que te tocaría gastarlo**.» |
| **e009** | El +1 Temple se pierde si ya estás al máximo | Sin cambio: no es un error, es la regla general (r122). |

---

## Lo que queda para después

- 6 pulsos nuevos (problema 6, solución grande).
- Revisar el resto de atajos de compra (e404, e414, e242, e261) con el mismo criterio que e405 y e416, si la 2.ª partida lo pide.
- Dejar el método de partida narrada como procedimiento estándar para todos los libros.
