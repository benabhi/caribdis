"""Contenido de maquetación que no está en el texto del libro.

Aquí viven las citas de ambientación, las cajas de ayuda y la configuración de cada
capítulo: qué ilustración lo abre, con qué composición se maqueta y en qué orden van
los archivos. Edítalo para cambiar el aspecto del manual sin tocar el texto del juego.
"""

# Orden de los archivos de libro/ en el manual (las regiones, por número).
ORDEN = [
    '00-portada.md', '01-reglas.md', '02-plantillas.md', '03-mundo.md',
    '10-prologo.md', '11-comunes.md', '12-conocidos.md',
    '20-dunas.md', '21-cementerio.md', '22-salinas.md', '25-canones.md',
    '23-bosque.md', '26-ciudad.md', '27-torres.md', '24-polo.md',
    '30-asentamientos.md', '40-pecios-sistemas.md', '50-tripulacion.md', '55-facciones.md',
    '60-catalogo.md', '70-historias.md', '80-finales.md',
    '90-apendices.md', '91-indice-marcas.md',
]

# Partes (h1). lamina: ilustración a sangre; pos: encuadre (object-position).
PARTES = {
    'PRIMERA PARTE · REGLAS': dict(
        lamina='reglas-lamina.jpg', pos='50% 70%', numero='I', nombre='Reglas',
        cita=('Lo primero que aprende un náufrago es a contar. Días, raciones, aire. '
              'Lo segundo, a dejar de contar lo que ya no tiene.', 'Madre Óxida, de los Hijos del Pecio')),
    'SEGUNDA PARTE · EVENTOS': dict(
        lamina='cicatriz.jpg', pos='50% 60%', numero='II', nombre='Eventos',
        cita=('Desde aquí abajo la Corona parece un collar. De cerca son todas las naves '
              'que oyeron lo mismo que tú.', 'Amara Oyelaran, cuaderno de campo')),
    'APÉNDICES': dict(
        lamina='apendices.jpg', pos='50% 60%', numero='III', nombre='Apéndices',
        cita=('Anota. Lo que no se anota, Caribdis se lo queda.', 'Registro de la Mente, entrada 0412')),
}

# Capítulos (h2), por su título exacto.
#  maqueta: dos | una | tres | oscuro | mente | finales | region
#  lamina: ilustración a página completa antes del capítulo
#  banda: tira de ilustración en la cabecera del capítulo (con encuadre)
CAPITULOS = {
    'Asentamientos': dict(maqueta='dos',
        cita=('En Puerto Chatarra se compra. En Quilla se da la palabra. En el Atrio se escucha. En el Nodo, ni se te ocurra.', 'Bruno Kessler')),
    'Cómo leer este libro': dict(maqueta='dos', banda=('b-leer.jpg', '50% 50%'),
        cita=('Tres caímos aquella noche. Ninguno era el mismo al amanecer.', 'Cuaderno de a bordo, entrada sin fecha')),
    'Crear a tu protagonista': dict(maqueta='dos',
        cita=('No elegiste caer. Elige, al menos, quién se levanta.', 'Hermano Tadeo, capellán')),
    'Pruebas y Temple': dict(maqueta='dos', banda=('b-pruebas.jpg', '50% 50%'),
        cita=('La suerte no existe en Caribdis. Existe la arena, y lo que la arena decide devolverte.',
              'Dicho de los carroñeros')),
    'El día': dict(maqueta='dos',
        cita=('Aquí el sol no sale. Se arrastra.', 'Bruno Kessler')),
    'Combate': dict(maqueta='dos', banda=('b-combate.jpg', '50% 50%'),
        cita=('Pelea como si la nave dependiera de ello. Depende.', 'Noemí «Grasa» Vidal')),
    'Viaje y exploración': dict(maqueta='dos',
        cita=('Las dunas se mueven de noche. Los mapas, también.', 'Proverbio de Quilla')),
    '30-asentamientos.md:Asentamientos': dict(maqueta='dos', lamina=('puerto-chatarra.jpg', '50% 55%'),
        cita=('Aquí todo tiene precio. Hasta el aire. Sobre todo el aire.', 'El Contable, de Puerto Chatarra')),
    'Pecios y ruinas': dict(maqueta='dos', banda=('b-pecios.jpg', '50% 50%'),
        cita=('Cada pecio es una tumba con la puerta abierta. Entra con respeto y sal con algo.', 'Hermano Tadeo')),
    'La nave': dict(maqueta='dos', banda=('b-nave.jpg', '50% 50%'),
        cita=('No estás reparando una nave. Estás convenciendo a un cadáver de que vuelva a volar.', 'Noemí «Grasa» Vidal')),
    'Tripulación': dict(maqueta='dos',
        cita=('Cuenta cabezas. Siempre. Por la mañana y por la noche.', 'Dra. Iria Salcedo')),
    'Progresión, Marcas, Pistas y Reliquias': dict(maqueta='dos',
        cita=('Lo que traigas a la Cicatriz es tuyo. Lo que dejes por el camino, también.', 'Madre Óxida')),
    'El taller': dict(maqueta='dos', banda=('b-taller.jpg', '50% 50%'),
        cita=('Dame tres tornillos, un hueso y una mañana sin Canto, y te hago lo que quieras. Bueno, casi.', 'Noemí «Grasa» Vidal')),
    'Bestiario': dict(maqueta='dos', banda=('b-bestiario.jpg', '50% 50%'),
        cita=('Si sangra, se puede matar. Si no sangra, corre. Si canta, tápate los oídos y corre más.', 'Bruno Kessler')),
    'Lo que se sabe de Caribdis': dict(maqueta='mundo', lamina=('antiguos-apogeo.jpg', '50% 50%'),
        cita=('Construyeron escaleras para pies que no tenemos, y puertas que se abren desde dentro.', 'Amara Oyelaran')),
    'Ejemplo de juego': dict(maqueta='dos', banda=('b-ejemplo.jpg', '50% 50%'),
        cita=('Nadie aprende a sobrevivir leyendo. Pero ayuda.', 'Dra. Iria Salcedo')),
    'Variantes': dict(maqueta='dos',
        cita=('Nadie cae dos veces en el mismo planeta. Excepto aquí.', 'Grafiti en Puerto Chatarra')),
    'Viejos conocidos': dict(maqueta='dos', banda=('b-conocidos.jpg', '50% 50%'),
        cita=('En Caribdis no hay desconocidos. Hay gente que todavía no te ha vuelto a encontrar.', 'Proverbio de los Mirasoles')),
    'Plantillas de encuentro': dict(maqueta='tres',
        cita=('Antes de desenfundar, mira. Antes de mirar, escucha.', 'Lio, polizón')),
    'Prólogo: la caída': dict(maqueta='dos', banda=('b-prologo.jpg', '50% 50%'),
        cita=('REGISTRO 0001: impacto. REGISTRO 0002: sigo aquí. REGISTRO 0003: ¿quién canta?', 'La Mente')),
    'Pulsos del Canto': dict(maqueta='oscuro',
        cita=('No es un sonido. Es un recuerdo que no es tuyo, y que insiste.', 'La Voz, del Coro')),
    'Eventos comunes': dict(maqueta='dos', banda=('b-comunes.jpg', '50% 50%'),
        cita=('En Caribdis no hay caminos. Hay sitios por donde alguien no murió.', 'Grafiti en Puerto Chatarra')),
    'Salas especiales de pecios': dict(maqueta='dos', banda=('b-salas.jpg', '50% 50%'),
        cita=('Si buscas una pieza, está aquí. Si buscas a su dueño, también.', 'Chatarrero anónimo')),
    'Sistemas de la nave': dict(maqueta='dos', banda=('b-sistemas.jpg', '50% 50%'),
        cita=('Casco, motor, navegación, aire, combustible. Y algo tuyo. Seis razones para volver.', 'Noemí «Grasa» Vidal')),
    'La tripulación': dict(maqueta='dos', banda=('tripulacion.jpg', '50% 40%'), banda_alta=True,
        cita=('Seis almas. Seis nombres. Recítalos cada noche, por si alguno se te olvida.', 'Hermano Tadeo')),
    'Facciones': dict(maqueta='dos',
        cita=('No odiamos a los que caen. Solo están donde no deben.', 'Custodio Primo, de los Vigías')),
    'Catálogo': dict(maqueta='tres', lamina=('reliquias.jpg', '50% 50%'),
        cita=('No sabemos para qué servía. Sabemos que todavía funciona. Con eso basta.', 'El Contable')),
    'Historias personales': dict(maqueta='dos',
        cita=('Cada uno cayó de una forma distinta. Cada uno tendrá que levantarse a su manera.', 'Dra. Iria Salcedo')),
    'El Canto a 6': dict(maqueta='oscuro', cita=('Ven.', None)),
    'El Secreto': dict(maqueta='oscuro', lamina=('antiguos.jpg', '50% 40%'),
        cita=('Pregúntate quién encendió la señal. Después pregúntate por qué sigue encendida.', 'Amara Oyelaran')),
    'Despegue': dict(maqueta='dos', lamina=('recolectores.jpg', '50% 30%'),
        cita=('Seis sistemas. Un intento. Y un cielo que nunca ha soltado a nadie.', 'La Mente')),
    'Finales': dict(maqueta='finales', lamina=('despegue.jpg', '50% 50%'),
        cita=('Todo naufragio termina. Lo que importa es quién sigue a bordo.', 'Hermano Tadeo')),
    'Hoja de protagonista': dict(maqueta='hoja'),
    'Hoja de la nave': dict(maqueta='hoja'),
    'Tablas resumidas': dict(maqueta='dos'),
    'Índice de Marcas': dict(maqueta='tres'),
}

# Regiones: ilustración y cita de la lámina de apertura.
REGIONES = {
    'Dunas de Óxido': dict(n=1, arte='dunas.jpg', pos='50% 50%', vecinas='Cementerio · Salinas · Cañones',
        lugar='La Cicatriz, tu campamento',
        cita=('La arena roja no se quita. Te acostumbras a ella, como a una deuda.', 'Bruno Kessler')),
    'Cementerio de Naves': dict(n=2, arte='cementerio.jpg', pos='50% 50%', vecinas='Dunas · Salinas · Ciudad',
        lugar='Puerto Chatarra (Desguaces)',
        cita=('Hay más naves aquí que estrellas en el cielo. Y ninguna ha vuelto a despegar.', 'El Contable')),
    'Salinas Blancas': dict(n=3, arte='salinas.jpg', pos='50% 50%', vecinas='Dunas · Cementerio · Polo',
        lugar='La Refinería',
        cita=('La sal lo conserva todo: la carne, el agua y los errores.', 'Madre Óxida')),
    'Cañones de las Bestias': dict(n=4, arte='canones.jpg', pos='50% 50%', vecinas='Dunas · Bosque · Torres',
        lugar='Quilla (Hijos del Pecio)',
        cita=('Allí abajo las bestias no te cazan. Te pastorean.', 'Proverbio de Quilla')),
    'Bosque Petrificado': dict(n=5, arte='bosque.jpg', pos='50% 50%', vecinas='Cañones · Ciudad · Torres',
        lugar='El Santuario',
        cita=('Los árboles de cristal crecen un dedo por siglo. Imagina lo que han visto.', 'Amara Oyelaran')),
    'Ciudad Enterrada': dict(n=6, arte='ciudad.jpg', pos='50% 50%', vecinas='Cementerio · Bosque · Polo',
        lugar='El Nodo (Vigías)',
        cita=('Construyeron escaleras para pies que no tenemos.', 'Amara Oyelaran')),
    'Torres del Canto': dict(n=7, arte='torres.jpg', pos='50% 50%', vecinas='Cañones · Bosque · Polo',
        lugar='El Atrio (Coro)',
        cita=('Quien llega a las Torres y no oye nada es que ya forma parte de la canción.', 'La Voz, del Coro')),
    'Polo Helado': dict(n=8, arte='polo.jpg', pos='50% 50%', vecinas='Salinas · Ciudad · Torres',
        lugar='El Pozo',
        cita=('En el Polo el frío no muerde. Espera.', 'Lio, polizón')),
}

# Protagonistas: las reglas r102–r104 se maquetan como ficha con retrato.
PROTAGONISTAS = {'r102': 'piloto.jpg', 'r103': 'nativo.jpg', 'r104': 'mente.jpg'}

# Retratos de la tripulación (subtítulos h3 de 50-tripulacion.md)
TRIPULACION = {
    'Iria': 'crew-iria.jpg', 'Bruno': 'crew-bruno.jpg', 'Amara': 'crew-amara.jpg',
    'Noemí': 'crew-noemi.jpg', 'Tadeo': 'crew-tadeo.jpg', 'Lio': 'crew-lio.jpg',
}

# Asentamientos (subtítulos h3 de 30-asentamientos.md) → emblema de facción
ASENTAMIENTOS = {'Puerto Chatarra': 'desguaces', 'Quilla': 'hijos', 'El Atrio': 'coro', 'El Nodo': 'vigias'}

# Facciones: emblema según el nombre que aparece en la línea de lugar del evento
FACCIONES_EVENTO = {'e640': 'hijos', 'e641': 'hijos', 'e642': 'desguaces', 'e643': 'desguaces',
                    'e644': 'coro', 'e645': 'coro', 'e646': 'vigias', 'e647': 'vigias'}

# Ilustraciones intercaladas dentro de un capítulo (después de la entrada indicada).
FIGURAS = {
    'e644': ('coro.jpg', '50% 40%', 'Los fieles del Coro esperan el pulso con los cuencos llenos.'),
    'e646': ('vigia.jpg', '50% 30%', 'Un Vigía al pie de su torre. Lleva siglos sin cambiar de postura.'),
}

# Citas a toda anchura entre entradas (después de la entrada indicada).
CITAS_SUELTAS = {
    'e036': ('Si oyes motores en el cielo, no mires arriba. Mira dónde esconderte.', 'Bruno Kessler'),
    'e050': ('La Corona gira. Cada noche hay una nave nueva en ella. Cada noche.', 'Lio, polizón'),
    'e205': ('La arena guarda lo que cae. A veces lo devuelve. Nunca entero.', 'Madre Óxida'),
    'e226': ('En el Cementerio, todo el mundo conoce a alguien que encontró su propia nave. Nadie quiere ser ese alguien.',
             'Chatarrera de Puerto Chatarra'),
    'e245': ('Bebe solo agua que hayas visto hervir. Y aun así, reza.', 'Dra. Iria Salcedo'),
    'e305': ('Si una bestia te mira y no ataca, no es piedad. Está decidiendo cuándo.', 'Cazador de Quilla'),
    'e265': ('El micelio recuerda los pasos. Pisa con cuidado: te va a reconocer.', 'Amara Oyelaran'),
    'e325': ('Los Antiguos no dejaron puertas. Dejaron preguntas con forma de puerta.', 'Amara Oyelaran'),
    'e345': ('Cantan para no oír. Eso es lo que nadie entiende del Coro.', 'Hermano Tadeo'),
    'e285': ('Al fondo del Pozo hay una luz. Nadie que haya bajado a verla ha contado de qué color es.', 'Lio, polizón'),
    'e412': ('Quilla no tiene muros. Tiene cien cazadores y una abuela que no duerme.', 'Bruno Kessler'),
    'e510': ('Cada pecio tiene una última voluntad escrita en algún panel. Léela antes de saquearlo.', 'Hermano Tadeo'),
    'e613': ('Lo que se pierde en Caribdis no se pierde. Cambia de dueño.', 'Noemí «Grasa» Vidal'),
    'e805': ('Volar es fácil. Lo difícil es aterrizar con todos.', 'El Piloto'),
}

# Cajas de ayuda (después de la entrada indicada). tipo: ayuda | ejemplo | recuerda | consejo
CAJAS = {
    'r004': ('ayuda', 'Tu primera partida', """
1. Lee r001–r004 (esta página y la anterior).
2. Crea tu protagonista con r100: elige quién eres, reparte 12 puntos y apunta tus recursos.
3. Prepara la partida con r108: el Secreto, los pecios y la tripulación.
4. Empieza en **e001** y deja que el libro te lleve.

No hace falta memorizar nada. Cada evento te remite a la regla que necesitas cuando la necesitas.
"""),
    'r101': ('consejo', 'Repartir los 12 puntos', """
Un reparto equilibrado (3 · 3 · 3 · 3) nunca falla. Si quieres especializarte, pon un 4 en lo que mejor
encaja con tu protagonista: **Reflejos** para el Piloto, **Vigor** para el Nativo, **Ingenio** para la Mente.
Ningún atributo puede quedar por debajo de 1.
"""),
    'r120': ('ejemplo', 'Una prueba, paso a paso', """
El Piloto, con **Ingenio 3**, intenta abrir una compuerta: `[Ingenio · 9]`.
Tira 2d6 y saca 4 y 3: **7 + 3 = 10**. Iguala o supera el 9: **Éxito**.
Para un **Éxito pleno** habría necesitado 12 o más (la dificultad más 3).
"""),
    'r121': ('ejemplo', 'Ventaja en la mesa', """
Tiras tres dados: **5, 2 y 6**. Con Ventaja te quedas con 6 + 5 = **11**.
Con Desventaja, con 5 + 2 = **7**. Ventaja y Desventaja a la vez se anulan: tiras 2d6 sin más.
"""),
    'r130': ('ayuda', 'Un día en Caribdis', """
**Amanecer.** El Reloj baja 1, gastas tus recursos y tiras el pulso del Canto.

**Acción.** Haces *una sola* cosa: viajar, explorar, visitar, trabajar en la nave, descansar, ocultarte, seguir Pista o ensamblar.

**Anochecer.** Descansas si toca, tiras por la noche a la intemperie y miras si hoy hay historia personal.
"""),
    'r135': ('recuerda', 'La Alerta elige la columna', """
En todas las tablas de encuentros, la **columna** es tu Alerta. Con Alerta 1 te cruzas con curiosos; con
Alerta 4, con lo que caza a los curiosos. Si ya estás en 4 y vuelve a subir, el Reloj baja 2.
"""),
    'r137': ('consejo', 'Antes de ir a las Torres', """
Descansa en la Cicatriz y baja el Canto todo lo que puedas. Con 3 o más tendrás Desventaja justo
cuando más falta te hace la Voluntad, y en las Torres los pulsos llegan con 4 a 6.
"""),
    'r141': ('ejemplo', 'Una ronda de combate', """
Luchas con **Vigor 3** y una navaja (+1) contra un *Carroñero de pecio* (Ataque 3 · Blind. 1 · Heridas 2).
Tú sacas 8 + 3 + 1 = **12**. Él saca 6 + 3 = **9**. Ganas por 3: daño 1, menos su Blindaje 1… **0**.
Como la diferencia no llegó a 4, el golpe rebota en su chapa. Siguiente ronda.
"""),
    'r146': ('recuerda', 'Ruido y botín', """
Las armas **ruidosas** suben la Alerta al acabar el combate, y también los combates de más de 3 rondas.
Ganar a un [Náufrago] o una [Máquina] da Chatarra aunque el evento no lo diga (r146).
"""),
    'r153': ('consejo', 'Explorar o viajar', """
Explorar es la forma más segura de encontrar los **Hallazgos** que anotaste al preparar la partida.
Si ya sabes dónde está el sistema que buscas, ve a esa región y explórala hasta dar con él.
"""),
    'r186': ('recuerda', 'Plazas a bordo', """
La nave tiene **6 plazas** (+2 si haces sitio; +2/+3 con módulo). Cuenta a tu tripulación y pasajeros
antes de despegar: quien no quepa, se queda en Caribdis.
"""),
    'r200': ('recuerda', 'Cada día cuenta', """
**Rebuscar cuesta un día**: un día que no pasas buscando sistemas ni tripulación. Empieza por lo pequeño
(una lanza, unas vendas) y deja las grandes obras para cuando la nave vaya bien encaminada.
"""),
    'r205': ('consejo', '¿Merece la pena una gran obra?', """
Una gran obra cuesta unas siete u ocho jornadas en total: cuatro de rebuscar y tres de taller.
Si vas bien de sistemas antes del día 30, es tu mejor seguro para el despegue. Si vas tarde,
quizá lo mejor sea una lanza de hueso y seguir adelante.
"""),
    'r300': ('ayuda', 'Cuándo usar las plantillas', """
Solo cuando un evento diga **Encuentro (r300)**. Elige postura *antes* de tirar el d6. Las plantillas
hacen que el mismo encuentro no se repita nunca igual.
"""),
}


# --------------------------------------------------------------------------- remates
# Citas para rellenar los huecos al final de una sección antes de un salto de página.
REMATES = [
    ('El óxido no tiene prisa. Por eso gana siempre.', 'Proverbio de Quilla'),
    ('Si oyes tu nombre en el viento, no contestes. Nadie aquí sabe tu nombre.', 'Advertencia de Puerto Chatarra'),
    ('Un Vigía no te odia. Un Vigía no te quiere. Un Vigía te cuenta.', 'Amara Oyelaran'),
    ('Contamos los días hacia atrás porque hacia delante no hay nada que contar.', 'Hermano Tadeo'),
    ('La chatarra de hoy es el motor de mañana. O la tumba. Depende de quién la suelde.', 'Noemí «Grasa» Vidal'),
    ('Aquí abajo hay dos clases de gente: los que miran al cielo y los que ya no pueden.', 'La Madre Óxida'),
    ('He reparado esta pieza cuatro veces. Ya no sé si es de la nave o es mía.', 'La Mente'),
    ('Las seis luces no tienen prisa. Saben que no tenemos adónde ir.', 'Bruno Kessler'),
    ('En el Coro te quitan la voz. Lo malo es que te dan otra.', 'Lio, polizón'),
    ('Toda herida aquí se infecta de algo. La pregunta es de qué.', 'Dra. Iria Salcedo'),
    ('Nadie entierra a nadie en las Dunas. La arena lo hace sola.', 'Dicho de los Desguaces'),
    ('El sol rojo no calienta. Solo mira.', 'Canción de cuna de Quilla'),
    ('Si vuelves, que sea con alguien. Volver solo es otra forma de quedarse.', 'Inscripción en un pecio'),
    ('El Canto no miente. Por eso da tanto miedo.', 'La Voz del Atrio'),
    ('Un mapa de Caribdis vale lo que dure el que lo dibujó.', 'El cartógrafo'),
    ('Hay más naves en la Corona que estrellas en el cielo. Y todas iban a alguna parte.', 'Libro de cuentas de Puerto Chatarra'),
    ('El primer día cuentas lo que tienes. El décimo, lo que te falta. El trigésimo, a quién.', 'Dra. Iria Salcedo'),
    ('No te fíes de un cielo limpio. En Caribdis, eso significa que algo se ha comido las nubes.', 'Bruno Kessler'),
    ('Las naves no mueren cuando caen. Mueren cuando alguien deja de pensar en ellas.', 'Noemí «Grasa» Vidal'),
    ('REGISTRO 1187: he soñado. No sé con qué. Archivo el dato por si vuelve a pasar.', 'La Mente'),
    ('Mi abuela decía que el viento rojo trae voces. Mi madre decía que solo trae arena. Las dos tenían razón.', 'Lio, polizón'),
    ('Todo lo que brilla aquí abajo es de alguien. Casi siempre, de alguien que ya no lo necesita.', 'El Contable'),
    ('He enterrado a muchos náufragos. Ninguno se fue sin pedirme que lo despertara si llegaba una nave.', 'Hermano Tadeo'),
    ('La sal cruje como un hueso. Aprendes a pisar despacio.', 'Madre Óxida'),
    ('Los Antiguos no nos dejaron un mensaje. Nos dejaron una pregunta, y la escribieron en todas partes.', 'Amara Oyelaran'),
    ('Si oyes tu nombre en el viento, no contestes. Nunca es quien crees.', 'Proverbio de Quilla'),
    ('Una bombona, un cuchillo y un mapa mal dibujado. Con menos he cruzado peores sitios.', 'Bruno Kessler'),
    ('No hay héroes en el Cementerio. Hay gente que volvió y gente que no.', 'Grafiti en Puerto Chatarra'),
    ('ORDEN 1: vigilar. ORDEN 2: vigilar. ORDEN 3: no recuerdo la orden 3.', 'Inscripción en un Vigía desactivado'),
    ('La Corona gira despacio. Si la miras mucho rato, juras que te está buscando.', 'Dra. Iria Salcedo'),
    ('El Canto no te obliga a nada. Solo te recuerda lo cansado que estás.', 'La Voz, del Coro'),
    ('Cada tornillo que aprietas es un día menos que le debes a este planeta.', 'Noemí «Grasa» Vidal'),
    ('Cuando los Recolectores bajan, los pájaros de vidrio se callan. Si los pájaros se callan, corre.', 'Lio, polizón'),
    ('No vendo agua. Vendo tiempo. Lo que hagas con él es cosa tuya.', 'El Contable'),
    ('Quien dice que conoce las dunas no ha dormido en ellas.', 'Madre Óxida'),
    ('Rezo por los que se van. Por los que se quedan, rezo dos veces.', 'Hermano Tadeo'),
    ('REGISTRO 2290: Aire 3. Raciones 2. Esperanza: dato no disponible.', 'La Mente'),
    ('Hay una puerta en el hielo que se abre desde dentro. Nadie quiere saber quién la abre.', 'Rumor de Puerto Chatarra'),
    ('El cristal recuerda. Por eso en el Bosque nadie habla en voz alta.', 'Amara Oyelaran'),
    ('Aquí abajo la noche dura lo que tarda en irse el miedo.', 'Cuaderno de a bordo, entrada sin fecha'),
    ('No mires a las Torres al amanecer. No por el Canto. Por lo bonitas que son.', 'Bruno Kessler'),
    ('Arreglar, rebuscar, comer, dormir. Y otra vez. Así se sale de Caribdis: a pequeños bocados.', 'Noemí «Grasa» Vidal'),
    ('Las bestias de los cañones no son crueles. Solo tienen hambre desde hace mil años.', 'Proverbio de Quilla'),
    ('Primo nos dejó pasar. Dijo que olíamos a pregunta.', 'Diario de un náufrago'),
    ('Si vuelves a casa, cuéntales que aquí abajo también hubo gente buena. Que no se les olvide.', 'Madre Óxida'),
    ('El día que dejes de oír el Canto, preocúpate. Significa que estás cantando tú.', 'Hermano Tadeo'),
    ('Todo lo que cae aquí acaba sirviendo para algo. Hasta nosotros.', 'Chatarrero anónimo'),
    ('Seis luces en el cielo. Cada noche, un poco más grandes.', 'Lio, polizón'),
]

# Ilustraciones que se pueden usar como viñeta de remate (con el encuadre que mejor funciona en franja).
ARTE_REMATE = [
    ('r-dunas.jpg', '50% 50%'),
    ('r-cementerio.jpg', '50% 50%'),
    ('r-salinas.jpg', '50% 50%'),
    ('r-bosque.jpg', '50% 50%'),
    ('r-polo.jpg', '50% 50%'),
    ('r-canones.jpg', '50% 50%'),
    ('r-ciudad.jpg', '50% 50%'),
    ('r-torres.jpg', '50% 50%'),
    ('r-puerto.jpg', '50% 50%'),
    ('r-reliquias.jpg', '50% 50%'),
    ('r-antiguos.jpg', '50% 50%'),
    ('r-recolectores.jpg', '50% 50%'),
    ('r-cicatriz.jpg', '50% 50%'),
    ('r-vigia.jpg', '50% 50%'),
    ('r-coro.jpg', '50% 50%'),
    ('r-tripulacion.jpg', '50% 50%'),
    ('r-despegue.jpg', '50% 50%'),
    ('r-panoramica.jpg', '50% 50%'),
    ('r-quilla.jpg', '50% 50%'),
    ('r-ermitano.jpg', '50% 50%'),
]


# Bestiario: grupos por etiqueta principal
BESTIARIO = {
    'Bestia': ('Bestias', 'Lo que el planeta hizo con lo que trajeron las naves. Tienen hambre desde hace siglos.'),
    'Náufrago': ('Náufragos', 'Gente como tú, que llegó antes y dejó de esperar. Los más peligrosos de Caribdis.'),
    'Máquina': ('Máquinas', 'Restos que todavía obedecen alguna orden. Casi nunca la tuya.'),
    'Antiguo': ('Obra de los Antiguos', 'Vigías y guardianes de un pueblo que se fue. Siguen de servicio.'),
    'Cantor': ('Cantores', 'Los que oyeron el Canto y respondieron. Algunos aún recuerdan su nombre.'),
}


# Documentos del capítulo de ambientación: título → (tipo de maqueta, rótulo)
DOCUMENTOS = {
    'Crónica de un planeta viejo': ('cronica', 'Lo que todo náufrago acaba sabiendo'),
    'Libro de cuentas de Puerto Chatarra': ('libro', 'Copia de una página robada al Contable'),
    'Palabras para recién caídos': ('glosario', 'Apuntado por un Hijo del Pecio en la pared del refugio'),
    'Himno del Atrio': ('himno', 'Se canta al amanecer, de cara a las Torres'),
    'Cuaderno de campo de Amara Oyelaran': ('notas', 'Arqueóloga de la expedición'),
    'Registro de un Vigía': ('registro', 'Volcado de memoria de una unidad desactivada'),
    'Las ocho regiones, según quien te las cuente': ('regiones', 'Oído en la barra de Puerto Chatarra'),
    'Se dice en Caribdis': ('rumores', 'Seis rumores. Alguno es cierto'),
    'Lo que cuentan en Quilla': ('relato', 'Tradición oral de los Hijos del Pecio'),
    'Carta que nadie envió': ('carta', 'Hallada en el Cementerio de Naves'),
}


# Entradas que se maquetan a toda anchura (sus tablas quedan estrechas en media columna)
ANCHAS = {'r180', 'r185', 'r190', 'r213', 'r300'}


# --------------------------------------------------------------------------- recordatorios
# Rellenan la columna corta al final de un flujo a dos columnas. Son reglas de verdad, para confirmar
# lo que el jugador cree recordar sin tener que volver atrás.
RECORDATORIOS = [
    ('Recuerda · Pruebas', 'Éxito pleno: superas la dificultad por 3 o más (r120).'),
    ('Recuerda · Ventaja', 'Tira 3d6 y quédate con los dos más altos. Dos Ventajas siguen siendo una (r121).'),
    ('Recuerda · Temple', 'Gasta 1 de Temple para repetir cualquier tirada tuya. Te quedas con la segunda (r122).'),
    ('Recuerda · El día', 'Una sola acción por día. Si el evento no dice adónde ir, vuelve al mapa (r004).'),
    ('Recuerda · Combate', 'Empate: nadie golpea. Con una diferencia de 4 o más, el golpe hace al menos 1 de daño (r140).'),
    ('Recuerda · Canto', 'Con Canto 3 o más tienes Desventaja en las pruebas de Voluntad contra el Canto (r137).'),
    ('Recuerda · Alerta', 'Si la Alerta ya está en 4 y vuelve a subir, el Reloj baja 2 (r135).'),
    ('Recuerda · Compañeros', 'Cada compañero suma +1 a tu Ataque; Bruno suma +2 (r143).'),
    ('Recuerda · Ruido', 'Un arma ruidosa o un combate de más de 3 rondas suben la Alerta 1 al terminar (r145).'),
    ('Recuerda · Descanso', 'Descansar en la Cicatriz cura 2 Heridas y 1 Temple, y baja 1 el Canto (r133).'),
    ('Recuerda · Defender', 'Defender da +2 a tu tirada. Si ganas, no haces daño, pero tampoco lo recibes (r141).'),
    ('Recuerda · Botín', 'Ganar a un [Náufrago] o a una [Máquina] da 1d6 ÷ 2 de Chatarra y 1 pieza (r146).'),
    ('Recuerda · La noche', 'Si duermes a la intemperie, tira 2d6: con 9 o más, algo te encuentra (r133).'),
    ('Recuerda · Ocultarte', 'Ocultarte ocupa el día y baja la Alerta 1. En las Torres no puedes (r135).'),
    ('Recuerda · Huir', 'Huir es `[Reflejos · 9]`. Si fallas, recibes 1 Herida y el combate sigue (r141).'),
    ('Recuerda · Raciones', 'Cada compañero come 1 Ración al amanecer. Si no tienes, pierde 1 de Lealtad (r136).'),
    ('Recuerda · Las reglas', 'Si una regla y un evento se contradicen, manda el evento (r004).'),
    ('Recuerda · Cantores', 'Contra un [Cantor], cada ronda que pierdas sube 1 tu Canto (r142).'),
    ('Recuerda · Canto 6', 'Al llegar a Canto 6, lee el evento de tu protagonista. Después el Canto baja a 4 (r137).'),
    ('Recuerda · Las Torres', 'Si amaneces en las Torres del Canto, +1 Canto, y el pulso salta con 4 a 6 (r131).'),
]


# --------------------------------------------------------------------------- paneles de consulta
# Fichas oscuras (como «Tu historia») para huecos medianos de columna: tablas de consulta rápida.
PANELES = [
    ('dado', 'Dificultades', [('Fácil', '7'), ('Normal', '9'), ('Dura', '11'), ('Extrema', '13')],
     'Éxito pleno: superarla por 3 o más (r120).'),
    ('combate', 'Daño en combate', [('Diferencia 1–3', '1 daño'), ('Diferencia 4–6', '2 daños'), ('Diferencia 7+', '3 daños')],
     'Resta el Blindaje. Con 4 o más, siempre al menos 1 (r140).'),
    ('combate', 'Maniobras', [('Atacar', 'tirada normal'), ('Defender', '+2; si ganas, nadie recibe daño'),
                             ('Huir', 'Reflejos · 9'), ('Hablar', 'Voluntad · 11')], 'Elige antes de cada tirada (r141).'),
    ('tiempo', 'El día', [('Amanecer', 'Reloj −1, recursos y pulso'), ('Acción', 'una sola'),
                          ('Anochecer', 'descanso y noche')], 'Si el evento no dice adónde ir, vuelve al mapa (r130).'),
    ('herida', 'Al amanecer se gasta', [('Piloto', '1 Ración y 1 Aire'), ('Nativo', '1 Ración'), ('Mente', '1 Energía')],
     'Cada compañero, 1 Ración más (r136).'),
    ('canto', 'El Canto', [('0 a 2', 'sin efecto'), ('3 a 5', 'Desventaja en Voluntad contra el Canto'),
                           ('6', 'evento de tu protagonista; luego baja a 4')], 'Baja al descansar en la Cicatriz (r137).'),
    ('alerta', 'La Alerta', [('Sube', 'con ◉, el ruido y lo antiguo'), ('Baja', 'ocultándote: −1'),
                             ('En 4 y sube', 'el Reloj baja 2')], 'Marca la columna de los encuentros (r135).'),
    ('herida', 'Descansar', [('Intemperie', 'Cura 1 Herida y 1 Temple'), ('Asentamiento', 'Cura 2 Heridas y 1 Temple'),
                             ('Cicatriz', 'Cura 2 Her., 1 Temple, −1 Canto')], 'A la intemperie, 2d6: con 9 o más, algo te encuentra (r133).'),
]

# Icono del ornamento según el capítulo
ORN_CAPITULO = {'Combate': 'combate', 'La nave': 'nave', 'Sistemas de la nave': 'nave', 'Pecios y ruinas': 'reliquia',
                'Salas especiales de pecios': 'reliquia', 'Asentamientos': 'asentamiento', 'Viaje y exploración': 'mapa',
                'Pulsos del Canto': 'canto', 'Catálogo': 'objeto', 'El taller': 'objeto', 'Historias personales': 'hito',
                'La tripulación': 'hito', 'Facciones': 'reputacion'}

# Tiras de consulta (una línea) para huecos chicos de columna
TIRAS = [
    ('dado', 'Dificultades', 'Fácil 7 · Normal 9 · Dura 11 · Extrema 13. Éxito pleno: 3 o más por encima.'),
    ('combate', 'Daño', 'Diferencia 1–3: 1 · 4–6: 2 · 7 o más: 3. Empate: nadie golpea.'),
    ('combate', 'Maniobras', 'Defender +2 · Huir `[Reflejos · 9]` · Hablar `[Voluntad · 11]`.'),
    ('canto', 'Canto', 'Con 3 o más, Desventaja en Voluntad contra el Canto. Con 6, tu evento.'),
    ('alerta', 'Alerta', 'Ocultarte: −1. Si ya está en 4 y sube, el Reloj baja 2.'),
    ('herida', 'Descanso', 'Cicatriz: cura 2 Her., +1 Temple, −1 Canto. Intemperie: 2d6, con 9+ te encuentran.'),
    ('tiempo', 'Reloj', 'Baja 1 cada amanecer. Si llega a 0, los Recolectores llegan (e919).'),
    ('herida', 'Compañeros', '+1 al Ataque cada uno (Bruno +2). Aguantan 2 Heridas.'),
]
