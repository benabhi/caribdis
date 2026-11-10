# Auditoría final de reglas y eventos (10 de noviembre de 2026)

Revisión completa del libro buscando reglas viejas, ambiguas o sin salida, objetos sin uso y mecánicas muertas. Todas las correcciones están aplicadas sin mover la maqueta: el PDF sigue teniendo 200 páginas, cada evento está en la misma página y los remates no cambiaron.

## Reglas

| Regla | Problema | Arreglo |
|---|---|---|
| r105 Orígenes | Varios objetos de Origen (Uniforme robado, Silbato, Brazos de carga, Mapa estelar, Proyector…) no decían qué hacen. | Si el objeto no dice qué hace, una vez por partida da Ventaja en una prueba en la que encaje. |
| r109 Náufrago | No estaba claro qué pasa al bajar de 0. | Se para en 0 y no pasa nada. |
| r133 Anochecer | Si el Reloj saltaba una cifra (por ⌛+1 o la Alerta), el evento de historia personal se perdía. | Si el Reloj se saltó esa cifra, se lee ese día igual. |
| r143 Compañeros | No decía cómo se curan. | Al descansar se curan como tú. |
| r153 Explorar | No decía qué hacer con el Hallazgo encontrado. | Se tacha de la lista. |
| r180 La nave | No decía qué pasa si consigues un segundo sistema pesado. | Dejas uno donde estés, anotas la región y lo recoges al volver. |
| r190 Mejoras | «Completes la historia de un tripulante» no estaba definido. | Ahora: cuando un compañero llegue a Lealtad 3. |
| r194 Reputación | El evento de enemigo podía tirarse cada vez que pasabas. | Se tira solo esa vez. |

## Eventos

| Evento | Problema | Arreglo |
|---|---|---|
| e007 | Pedía la bengala del Piloto o «un objeto que haga fuego», que no existen. | Un trapo empapado en el aceite del motor. |
| e043 | La Marca `PADRE_DE_LA_NIÑA` se anotaba con una condición imposible de comprobar. | Se anota al preguntar, y se usa en el Polo (e283). |
| e225 | Los juguetes daban Chatarra en Quilla sin evento que lo resolviera. | +1 de Reputación con los Hijos del Pecio y se cambian en su mercado (e412). |
| e228 | `TOMO_DE_LUZ` no tenía dónde canjearse. | Se lleva a Puerto Chatarra (e406). |
| e261 / e264 | e264 prohibía el esqueje sin dejar Marca. | e264 anota `TIRASTE_LA_NAVE` y e261 la consulta. |
| e266, e282, e284 | Pedían «fuego» o «una llama», que no son objetos del juego. | 1 Ración de grasa como antorcha, como ya hacía e203. |
| Frío del Polo | Citaba `BUNKER` y «una cueva», que no existen. | Capa de piel de duna, traje térmico o la estación e286. |
| e413 | Los Mirasoles de Quilla se confundían con la caravana nómada. | Se aclara que toman el nombre de la caravana. |
| e563 | El Fallo no decía si la explosión ocurría. | Explota igual y la onda te alcanza. |
| e731 | Decía que el protocolo se gana en eventos que no existen. | Solo se elige como mejora (r190). |
| e770 Moto | Prohibía regiones que no tienen sentido para ella. | No sube a las Torres ni entra en la Ciudad; la Maestra sube a las Torres. |
| e842, e843 | No decían en qué momento del despegue se elige. | En el paso 0 del despegue (e843 pide `LO_VISTE`). |
| e845 | El Éxito no dejaba Marca y el final no podía comprobarlo. | Con un Éxito, anota `LA_ESPERANZA_CALLA`. |
| e906 | Condición ambigua del final del Argo. | Reloj en 5 o menos y estar en el Cementerio. |
| Epílogo de Quilla | Nombraba a Ixa aunque no fuera a bordo. | «Los Mirasoles ven…». |

## Verificación

- `herramientas/verificar.py`: 0 enlaces rotos, 0 duplicados, 0 eventos huérfanos.
- Las únicas Marcas «consultadas que nunca se ganan» son las de Origen y las de familia (`PERDIDO_…`), que se anotan al crear el personaje o por familia.
- `91-indice-marcas.md` regenerado.
