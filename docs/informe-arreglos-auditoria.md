# Informe de arreglos de la auditoría

**Fecha:** 13 de noviembre de 2026  
**Base:** `d8c37a6`  
**Estado:** cambios aplicados, PDF reconstruido y commit/push realizados con la nota de la imagen p40.

---

## 1. Resultado de maquetación

- **200 páginas** en `Caribdis.pdf` y en `Caribdis_Print_Friendly.pdf`.
- **364 cabeceras** de entrada, todas en la misma página que antes.
- **0 enlaces rotos, 0 IDs duplicados, 0 entradas huérfanas** (`verificar.py`).
- **Índice de Marcas regenerado** (276 marcas; incluye las nuevas y elimina `RUTA_SALINAS`, que era un ejemplo).
- **Imágenes:** se mantienen las ilustraciones de capítulo y las viñetas; **falta una viñeta en la página 40** (`r-polo.jpg`). Es el único punto visual pendiente y queda anotado en el commit.

---

## 2. Bloqueantes corregidos

1. **e040/e057/e058 inalcanzables:** añadidos a las tablas de Dunas, Cañones y Cementerio. Los tres fragmentos vuelven a ser obtenibles.
2. **Encuentros sin salida:** añadidas las ramas que faltaban en e055, e306, e325 y e343.
3. **e626 sin Lio:** e625 opción 2 ahora recluta a Lio; e626 exige que Lio esté contigo.
4. **Tadeo perdido:** e424 reconoce `PERDIDO_TADEO` y permite recuperarlo.
5. **Bucle de e403:** las reliquias se compran y venden sin margen infinito; el extra de `CONTRABANDO` es una vez por partida.
6. **Taller del Nodo:** r162 ahora distingue Puerto Chatarra (Precaria→Sólida, 3 Chatarra) y Nodo (Sólido→Excelente, 6 Chatarra).
7. **Caída de la Mente:** r195 incluye los cuatro niveles de Daño y e920 tiene una salida para la Mente.
8. **r141 Hablar:** añadidas `Voz de la nave` y `Voz de los Antiguos`; el +2 del Fallo ahora dice a qué se aplica.
9. **Temple máximo:** r106 y r122 admiten 4 con mejoras, coherente con r190 y la hoja.
10. **e271:** la frase incompleta se sustituyó por un efecto real (Temple según el Canto bajado).
11. **e433:** «Ninguno» tiene desenlace (Motor Sólido y −3 Reputación si ganas).
12. **Muertos del viaje:** e900 anota `MURIO_EN_EL_VIAJE_<nombre>` y e910 ignora a los muertos.
13. **e918:** su epílogo ignora las líneas de Quilla/Cicatriz/Santuario, que ya no existen.
14. **Grandes obras:** r203 y r162 aclaran que solo se construyen en la Cicatriz.
15. **Modo Náufrago:** el Reloj sigue bajando como cuenta de días; la victoria con 3 tripulantes se comprueba en e900/e903/r196.

---

## 3. Correcciones graves y moderadas aplicadas

- **Fragmentos:** e512 y e063 usan el umbral de 3; e350/e749 quedan como excepciones explícitas.
- **e222:** las baterías valen 6 Chatarra; apagar a los siete dormidos cuesta CULPA y Temple.
- **e500:** +6 Raciones con tope de 8.
- **e247/e241:** el Casco de minero da Ventaja real en e241.
- **e403:** implante con ranura libre; precios de venta sin bucle.
- **e515/e626:** combates con «Si ganas».
- **e603:** el Fallo ya no incluye el ★.
- **r198:** Sela tiene dos Heridas, no tres.
- **e039:** solo `DOMADOR` o `Lengua de bestias` calman bestias.
- **e046:** la batería ya no da +1 Canto.
- **e042:** el +1 de la tabla se aplica como un punto más alto, máximo 12.
- **e714:** el segundo Crítico tiene regla de caída.
- **e500/e271:** topes de Raciones y Temple/MEMORIA corregidos.
- **e567/e603/e608/e618/e623:** estados, CULPA y `PERDIDO_` corregidos.
- **e900/e910:** CULPA sin doble cobro, `HIZO_SITIO`, `NIÑA_DORMIDA`, Secrets 1/3/5, Mente en e911/e915, `SIGUE_EN_EL_DRON`, `PIDIO_TIEMPO`.
- **e804/e900:** `HIZO_SITIO` y CULPA coordinados.
- **e407/e415/e411/e413/e420/e430/e432/e433:** cierres, opciones y precios corregidos.
- **e641/e643/e645/e647:** las reconciliaciones borran `CAZADO_…`; `EXPULSADO_DE_LOS_CAÑOS` se comprueba en Quilla.
- **e646:** el Vigía compañero no consume Raciones.
- **e324:** `ENCARGO_DE_REPARAR` cuenta las reparaciones.
- **e058:** se eliminó la Pista que no se borraba y permitía repetir comida.
- **e803/e807/e824** (histórico): Caja negra, dron y Secrets con marcas.
- **90-apendices:** Aire del Piloto, Torres, empate, Alerta por rondas, improvisar Luz fría, empates del Secreto, Crítico −2.
- **00-portada / 03-mundo:** lista de apéndices y «Mendaña».
- **Índice:** regenerado; `VERSALITAS` deja de renderizarse como Marca; `RUTA_SALINAS` ya no aparece.

---

## 4. Pendiente conocido

- **Imagen p40 (`r-polo.jpg`)**: la viñeta de cierre de «Variantes» no se está generando en el nuevo reflow. Hay que revisar el sistema de remates para que vuelva a colocarla en la página 40 sin cambiar el número de páginas. **No se ha tocado la maquetación para forzarla.**
- **Revisión final de moderados/menores**: el informe `docs/auditoria-completa.md` sigue siendo la referencia completa; algunos puntos de estilo y precios menores quedan para una segunda pasada.

---

## 5. Verificación

```
verificar.py: 443 entradas, 0 enlaces rotos, 0 duplicados, 0 huérfanas
PDF: 200 páginas
Print-friendly: 200 páginas
Cabeceras: 364/364 en la misma página
```

Commit y push realizados en `main`.
