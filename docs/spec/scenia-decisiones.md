# Scenia Wealth — Registro de decisiones

> **Qué es esto.** Las decisiones que se van tomando en la revisión pantalla a pantalla: qué se arregla ahora, qué se aplaza, qué se descarta, y qué hay que preguntar antes de decidir.
>
> **Por qué existe aparte del maestro.** El maestro dice qué hace el producto. Esto dice **por qué** se decidió así y qué está pendiente de decidir. Evita reabrir la misma conversación cada tres semanas.
>
> **Cómo se usa.** Cada entrada lleva su estado. Cuando algo se implementa, se marca y pasa al maestro. Cuando algo se decide no hacer, se queda aquí con su motivo.

**Estados:** `AHORA` (antes de Dani) · `SIGUIENTE` (tras su feedback) · `V2` · `FUTURA` · `DESCARTADO` · `PREGUNTAR` (falta información para decidir)

---

# Transversales

Cosas que afectan a varias pantallas.

| # | Decisión | Estado | Motivo |
|---|---|---|---|
| T1 | **Importación por pegado desde el portapapeles** — copiar la cartera de un Excel, previsualizar y confirmar | `SIGUIENTE` | 47 campos para un cliente sencillo, 200+ para uno real. **No es comodidad: decide si se carga un segundo cliente.** Aplazado por decisión: primero cerrar las pantallas, luego atacar la entrada de datos |
| T2 | **Plantilla .xlsx descargable** con las columnas correctas | `SIGUIENTE` | Media hora de trabajo. Va junto con T1: la plantilla dice qué datos hacen falta, el pegado los mete. **Sin T1 la plantilla no sirve** (tendrías el Excel y seguirías tecleando), y sin T2 el que empieza de cero no sabe qué columnas necesita |
| T3 | **PDF real del informe** — hoy está simulado | `SIGUIENTE` | Es lo único que ve el cliente final del asesor. Esperar al feedback de Dani sobre qué formato quiere |
| T4 | **Validación del motor por un fiscalista** | `AHORA` | 1.500-3.500 € · 29 parámetros con fuente ya listos para entregar. Bloquea enseñar cifras fuera de design partners |
| T5 | **Crecer por comunidades solo cuando un cliente concreto lo pida** | Decidido | Cada CCAA es mantenimiento anual permanente (3.000-5.000 €/año con las 17). Nunca por cubrir el mapa |
| T6 | **Mensaje comercial: "producto nacional con una regla limitada a Valencia"** | `HECHO` | Texto nuevo en `avisoCoberturaCcaa` (alta de cliente, alta de elemento, P4): distingue plusvalías —que se calculan con normalidad— del rescate de planes, atado a la escala autonómica. **Y el motor se comporta como dice el mensaje:** un titular de Madrid con ingresos sale `calculable`, el reembolso liquida y solo el rescate queda en `sin_calculo`. Forales con aviso propio, sin matiz de ahorro |
| T8 | **Paleta de categorías patrimoniales, consistente en todo el producto** | `HECHO` | Unificada en `globals.css` (no había definiciones por pantalla). Orden por liquidez descendente: financiero `--blue` · inmobiliario `--ink-3` · **empresarial `--slate`** (antes coral) · otros `--faintest`. | **Es un código de color del producto, no una decisión de una pantalla.** Hoy el empresarial va en **coral**, que es el color de acción principal (botón "+ Nuevo cliente"): el ojo no distingue si es algo en lo que pulsar o información. Cuatro categorías se distinguen bien con `--blue` + tres tintas. **El bloque empresarial se mantiene: lo que cambia es su color.** El orden de tono puede seguir un criterio (de más líquido a menos), que además comunica algo |
| T9 | **Ningún color con significado reservado puede usarse para categorías de datos** — coral = acción · verde = plusvalía latente · rojo = error de validación · ámbar = semáforo de liquidez | `HECHO` (parcial) | Corregidas la capacidad de ahorro y el badge del Resumen, ambos a tinta. **Pendientes de decidir tres casos encontrados:** ver T11, T12 y T13 |
| T11 | **El pill verde "Activo" de Ajustes pasa a tinta** | `AHORA` | Un asiento activo o inactivo es un estado, no una valoración. El verde ahí dice "esto está bien" |
| T12 | **Borrar los tokens huérfanos** `--dk-green`, `--dk-tag`, `--pill-coral` de `:root` | `AHORA` | Ya no alimentan nada, y así es como vuelve una infracción: alguien los ve declarados, asume que son válidos, y los usa |
| T13 | **El subrayado coral de las pestañas se mantiene** | Decidido | No es infracción: marca "dónde estoy", que es navegación, no un dato. La regla T9 es sobre categorías y cifras derivadas |
| T14 | **El tooltip de composición usa `title` nativo** | Decidido (con reserva) | Funciona para MVP, pero en móvil no existe y su aspecto lo decide el navegador, no el sistema de diseño. Anotado por si chirría |
| T10 | **La palabra "vincular" significa dos cosas distintas** — "Vincular a" en Gastos (asociar un gasto a un activo, ya construido) y "vincular Persona existente" en el alta (reutilizar la misma persona en dos expedientes, sin construir) | `SIGUIENTE` | Si un día coexisten, el asesor no sabrá qué significa en cada sitio. Resolver el vocabulario **antes** de construir el segundo: por ejemplo "Asociar a" para gastos y reservar "vincular" para la identidad compartida |
| T15 | **Nada en el expediente tiene principio y fin: solo un valor anual perpetuo** | `SIGUIENTE` | **Es un hueco de modelo, no de tres pantallas.** Se manifiesta en: ingresos que no caducan (IN6 — el sueldo figura para siempre y lo corta un evento de otra pantalla) · gastos que no caducan (GA4) · y la proyección contando en 2050 los intereses de una hipoteca terminada en 2040 (PR3, que es lo que hace que la curva cuente una historia falsa). **Arreglarlo en un sitio no arregla los otros dos**: la solución es dar vigencia (año de inicio y de fin) a ingresos y gastos, y que la proyección la respete |
| T16 | **Los intereses se derivan del capital vivo, no de una línea de gasto fija** | `HECHO` | Antes, amortizar bajaba la deuda pero **el cliente seguía pagando los mismos intereses para siempre** — y una hipoteca terminada en 2047 seguía cargando intereses en 2060. Ahora: interés ≈ capital × tipo, recalculado cada año. **Cierra parte de T15 sin necesitar campos de vigencia**, y es el prerrequisito de AC7. Efecto en García-Llorente: la capacidad deja de ser −5.340 € eternos y se recupera (2036: −1.250 · 2040: +743 · desde 2048: −6.300 estable). **P3.7 usa la misma derivación**, para no tener una cifra en Ahorro y otra en Proyección |
| T17 | **Ningún evento cae a un elemento por defecto cuando no encuentra su objetivo** | `HECHO` | Amortizar desde un inmueble mandaba el id del inmueble y la proyección, al no encontrarlo entre los pasivos, **caía al primero**: con dos hipotecas amortizaba la equivocada **en silencio**. Ahora el evento lleva el id del pasivo, con un inmueble de dos hipotecas el modal pregunta cuál, y sin objetivo válido no actúa. Vender un inmueble liquida **todas** sus hipotecas |
| T7 | **No copiar el modelo de ProjectionLab** (descargo fuerte, sin validación, comunidad que reporta errores) | Decidido | Ellos venden a particulares que asumen el margen de error. Un EAF responde ante la CNMV. **La firma del fiscalista es parte de lo que se vende** |
| T18 | **Verificar moviendo el dato de entrada, no comprobando la salida esperada** | Decidido | Cuando un prompt le da a Cursor el resultado literal que se espera ver, hay tres formas de producir esa captura y dos están rotas: calcular bien · calcular con el patrón del caso de prueba (por ejemplo, asumir siempre que manda una escala concreta) · o guardar la cadena. **Las tres dan la misma captura.** La única forma de distinguirlas es cambiar un dato de entrada y comprobar que la salida se mueve como debe. Todo prompt de verificación debe incluir un cambio de dato, y ese dato **no puede caer en un borde** (ver F11). Es la diferencia entre "la pantalla está bien" y "la pantalla estaría bien con el cliente de Dani" |

---

# P1 · Cartera

| # | Decisión | Estado | Motivo |
|---|---|---|---|
| C2 | **Tooltip en la barra de composición** — "Financiero · 52 % · 505.000 €" | `HECHO` | Cuatro categorías sin leyenda ni tooltip: nadie sabe qué es cada color. Alternativa preferida: tooltip al pasar el ratón con categoría, porcentaje e importe — resuelve lo mismo sin ocupar espacio. Ver T8 |
| C3 | **La columna se llama ahora "Último informe"** | `HECHO` — opción (b) | Hoy mide cuándo se emitió el informe. Rompe el único flujo que sustituye al escritorio: "¿a quién le debo una revisión?" |
| C4 | **Estado vacío con invitación** | `HECHO` | Sin clientes: texto sobrio + botón "+ Nuevo cliente", sin tabla ni buscador. Con búsqueda sin resultados, mensaje propio. | Hoy ve una tabla sin filas y sin instrucciones. Es el momento más frágil de la relación con el producto. Veinte minutos de trabajo |
| C5 | **La columna "Escenarios" cuenta solo los que tienen eventos** — los vacíos no suman | `HECHO` | Los cinco ligeros pasan de 1-2 a **0**. | Hoy los clientes ligeros muestran "1" y al entrar solo hay un aviso de expediente ligero: **la expectativa que crea la columna no se cumple**. Y pone en el mismo eje seis alternativas con cifras y un contenedor vacío. **No se toca el seed** —existe para que la cartera no se vea vacía en una demostración—: lo que cambia es qué se cuenta. Los ligeros pasan a mostrar cero, coherente con el resto de su fila |
| C11 | **"Situación actual" (plan base) no cuenta como escenario, tenga eventos o no** | `HECHO` | `countEscenariosConEventos` excluye siempre el plan base. García-Llorente muestra **6** (A–F; el seed añadió F · Amortizar tras redactar C11, que pedía 5). Criterio «solo con eventos» se mantiene en alternativas. Las jubilaciones del plan base son dato del expediente, no exploración del asesor — la columna mide **"alternativas montadas"** |
| C6 | **Mantener la barra de composición** (con C1 y C2 aplicados) | Decidido | Convierte una columna de números en información de forma. Si tras arreglarla sigue sin decir nada en tres segundos, se revisa |
| C7 | **No añadir KPIs agregados** | Decidido | Un KPI solo vale si lleva a hacer algo distinto. "Patrimonio total" ya está al pie y no cambia ninguna decisión. Lo que sí valdría ("3 clientes sin revisar en 6 meses") es el escritorio P9 |
| C8 | **No añadir columna de alertas ni de % líquido** | Decidido | La pantalla funciona porque es sobria. La primera depende del motor de alertas; la segunda es ruido |
| C9 | **Los cinco segmentos mezclan tres ejes** — momento vital, origen del patrimonio y estado transitorio | `PREGUNTAR` | Un empresario de 60 años es "empresario" y "pre-jubilado" a la vez. O etiquetas múltiples, o un solo eje. **Preguntar a Dani cómo agrupa él a sus clientes** |
| C10 | **Escritorio (P9)** | `V2` | Con seis clientes cualquier panel se ve vacío. No tocar hasta tener feedback de alguien con cuarenta clientes reales |

**Pregunta abierta para Dani:** *¿cómo decides por qué cliente empezar el lunes?* Si tiene un criterio claro, esa es la columna que falta. Si no lo tiene, Cartera está bien como está.

---

# El seed

Ya no es decorado: los seis clientes tienen datos completos y cada uno cubre casos de prueba que antes no existían.

| # | Decisión | Estado | Motivo |
|---|---|---|---|
| S1 | **Eliminado el concepto de "expediente ligero"** | `HECHO` | Cinco clientes tenían solo un total agregado, y para justificarlo se inventó un estado que producía mensajes del tipo *"esto solo puebla la Cartera"* o *"el comparador completo está en García-Llorente"*. **Eso es una demo, no un producto** |
| S2 | **Los seis clientes cubren los doce casos de prueba** | `HECHO` | Navarro: líquidos que se agotan (2040) y titular joven con nómina · Beltrán: sociedad valorada (1.880.000 €), diez fondos y dos hipotecas sobre el mismo inmueble · Server: titular único, ~90 % inmobiliario y alquiler como renta · Requena: autónomo, menor sin ingresos, titular de otra comunidad y crédito personal sin inmueble · Tormo: plan pre-2007 y titulares en el umbral de los 65 |
| S3 | **El estado "calculable" es binario cuando la realidad tiene tres niveles** | `SIGUIENTE` | Andreu (Madrid) sale como **calculable**, y es correcto: la base del ahorro se le liquida. Pero un asesor lee eso y asume que todo funciona con él, hasta que monta un rescate y encuentra el hueco. Merece un matiz: *"calculable · solo base del ahorro"* |
| S4 | **Las dos hipotecas de Beltrán están sobre el mismo inmueble** | `SIGUIENTE` | Sirve para probar el selector, pero es una configuración poco natural. **Dos hipotecas en inmuebles distintos probarían el caso frecuente**: que amortizar la del local no toque la de la vivienda |
| S5 | **Falta el caso de cobertura mixta real** | Anotado | Haría falta un titular **foral** dentro de un expediente valenciano, que sí bloquearía todo incluido el reembolso. **Es un caso raro de verdad** y no está claro que merezca un cliente del seed |

---

# P2 · Alta de cliente

| # | Decisión | Estado | Motivo |
|---|---|---|---|
| A1 | **Explicar por qué se pide la fecha de nacimiento** — una línea del tipo *"necesaria para calcular edades y plazos fiscales"* | `HECHO` | Es obligatoria e imprescindible (la exención de vivienda a los 65, la jubilación, los plazos de la DT 12ª cuelgan de ahí), pero el asesor no lo sabe. Si no la tiene a mano, se atasca en el primer paso sin entender por qué |
| A2 | **Estado vacío del cliente recién creado** — al aterrizar en Patrimonio, una guía de qué cargar primero en lugar de un treemap a cero | `HECHO` | **Verificado en recorrido:** un cliente nuevo aterriza con el treemap a 0 €, la capacidad a 0 €/año, el patrimonio neto a 0 € y **el botón "Generar informe" activo** — se puede emitir un PDF de un expediente vacío. Nada indica por dónde empezar. Debe decir dos cosas: **por dónde entrar** (activos primero, luego ingresos) **y que el producto se completa por capas**, que es lo que baja la ansiedad de cargar un patrimonio entero |
| A7 | **"Generar informe" está activo en un cliente sin datos** | `HECHO` | Detectado al crear un cliente vacío. Un informe de un expediente a cero no tiene sentido y **sale con la marca del despacho**. O se desactiva hasta que haya algo que informar, o se explica qué contendría | Hoy ve siete pestañas vacías y varios ceros justo después de invertir 30 segundos y sin haber visto nada de valor. Debe decir por dónde empezar (activos → ingresos) **y que el producto se completa por capas**: eso baja la ansiedad de los 47 campos y hoy nadie se lo dice |
| A3 | **Comprobar que el aviso de CCAA sale también al añadir personas desde Patrimonio** | `HECHO` | Con la comunidad viviendo en la persona, el aviso ya no es una decisión única del alta: puede aparecer más tarde. Verificar que no se pierde en ese camino |
| A4 | **Mantener el alta mínima** — no añadir Sociedad ni cadencia de revisión | Decidido | La brevedad **es** la funcionalidad. Un formulario largo aquí es la barrera que impide llegar a probar el producto |
| A5 | **"Vincular Persona existente": el modelo ya lo soporta, falta exponerlo** — no hay nada que eliminar, falta el buscador en el alta | `V2` | `Persona` ya es una entidad con identidad propia y compartible entre expedientes (maestro nº 115, "MVP (modelo)"). Lo que no existe es la interfaz: hoy hay que reteclear nombre, fecha y CCAA, y se crea una persona distinta aunque sea la misma. **Se aplaza por dos razones:** con carteras pequeñas casi nunca se repite, y hay que decidir antes qué pasa al editar una persona compartida (si cambias su fecha en un expediente, cambia en todos) |
| A6 | **El copy no debe prometer menos campos de los que pide** | Decidido | Decía "solo el nombre y una persona" y la fecha era obligatoria. Ya corregido, pero queda como patrón: **prometer facilidad y luego pedir más es peor que pedir de entrada** |

**Pregunta abierta para Dani:** *¿daría de alta a sus clientes uno a uno, o querría importar su lista de golpe?* Si tiene cuarenta en un CRM, esta pantalla se usa cuarenta veces y la conversación cambia.

---

# P3 · Patrimonio

## Transversal a las siete pestañas

| # | Decisión | Estado | Motivo |
|---|---|---|---|
| P0 | **Las cifras en pantalla venían de un `localStorage` viejo, no del seed** | `HECHO` | El seed estaba bien (127.000 / 58.020 / 75.160) y Hugo ya estaba en Navarro. Lo que ganaba era un bag clonado **antes** de moverlo. Los +1.000 € de gasto no están en ningún commit: solo vivían en ese bag. **Arreglo: `SEED_BAG_REVISION`** — si un cliente seed no lleva la revisión actual, se borra el bag y se reclona. **Comprobar que no borra trabajo real de un asesor que haya editado un cliente del seed** | La diferencia son exactamente 24.000 €: **el sueldo de Hugo**, que se decidió mover a Navarro Sanchís. Y los gastos salen 59.020 € cuando el seed tenía 58.020 €. O el arreglo no se aplicó, o hay un `localStorage` viejo. **Comprobar antes que ninguna otra cosa de esta pantalla** |
| P1 | **La pestaña Ahorro: desplegable en la tarjeta oscura primero, retirarla después** | `SIGUIENTE` | Analizado: lo único que **no** está en otro sitio es la **tasa de ahorro** (% sobre ingresos) y el paso intermedio "ahorro líquido". La tasa es la única cifra que dice algo que las otras no —*"esta familia ahorra el 59 % de lo que ingresa"* es una lectura, no un total— y debe sobrevivir a la fusión. Hacer el desplegable, dejar la pestaña un tiempo, y quitarla al comprobar que no se echa de menos. Quitar una pestaña es fácil; recuperarla tras repartir su contenido, no | Muestra una cifra que ya está en el Resumen, compuesta de tres números que están en otras dos pestañas. Su única aportación es el desglose auditable, y eso cabe en un tooltip. Siete pestañas es mucho. Se mantiene solo si en V2 recibe la revalorización de activos, que sí tiene entidad propia |
| P2 | **La vuelta del "Vincular a"** — la ficha muestra lo que cuesta el activo al año | `HECHO` | Jávea: *"10.020 €/año · 2,4 % de su valor"* con desglose (intereses 5.220 € + suministros 4.800 €). Audi: 3.600 €. Sociedad preparada. **Es de las pocas cosas que un asesor puede llevarse a una conversación tal cual** | Los gastos ya se asocian a un activo, pero eso no se usa para nada más que etiquetar. *"Esta casa te cuesta 10.020 € al año, un 2,4 % de su valor"* es **valor gratis sobre la mesa sin recoger** |
| P3g | **Se actúa desde donde se mira** — cada línea permite dar de alta, editar o lanzar una decisión | Decidido | Es lo que separa P3 de un visor de solo lectura, y la diferencia real con las herramientas de consolidación patrimonial |

## P3.1 · Pestaña Resumen

| # | Decisión | Estado | Motivo |
|---|---|---|---|
| R1 | **La capacidad de ahorro no puede ir en verde** — a tinta | `HECHO` | **Firewall.** El verde está reservado a hechos objetivos de un activo (plusvalía latente). Aquí es una cifra derivada que se lee como "esto está bien". La prueba: si la capacidad fuera negativa, ¿saldría en rojo? Ahí se ve que **estás valorando, no informando** |
| R2 | **El badge "calculado en la pestaña Ahorro" no puede ir en ámbar** — a tinta | `HECHO` | **Firewall.** El ámbar es el color del semáforo de liquidez |
| R3 | **Comprobar si el treemap comunica proporción de verdad** | `AHORA` | Un treemap ordena por tamaño y llena el espacio proporcionalmente. Hoy "Otros" (45.000 €) ocupa un bloque comparable al empresarial, que no tiene valor. **Si el uso principal es "mirar proporciones treinta segundos", que la proporción no se lea es el fallo central de la pantalla.** Probar con un cliente desequilibrado (90 % inmobiliario) antes de decidir si se rediseña |
| R4 | **Los pasivos, fuera del treemap** — fila punteada debajo, "Restan del patrimonio neto", cifra en negativo, sin rojo | `HECHO` | Hoy están en un bloque punteado a la derecha, dentro del conjunto. Parecen una categoría más de activos y son lo contrario: restan del neto. Mejor debajo, o con otra orientación |
| R5 | **"Generar informe" a la cabecera del bloque de la foto** | `HECHO` | Flota entre el título y la tarjeta de capacidad, sin pertenecer a ninguno de los dos |
| R6 | **Fecha de los datos dentro del bloque de la foto** | `HECHO` | Está en la cabecera del cliente, que está bien, pero **la foto patrimonial es lo que se enseña al cliente** y esa fecha es la que evita que alguien tome una cifra desactualizada por buena |
| R7 | **Mantener la estructura de tres piezas** — treemap, capacidad, patrimonio neto | Decidido | Es correcta. Con el desglose de la resta escrito (activos − pasivos) y la capacidad diciendo de dónde sale |
| R8 | **"No valorada" en lugar de 0 €** para la sociedad, y leyenda al pie del treemap | Hecho | Los dos arreglos que estaban pendientes están aplicados |

**Los cuatro flujos de la pestaña Resumen:**
1. **Reconocer al cliente (30 s)** — mira proporciones, no cifras. El uso más frecuente con diferencia
2. **Punto de partida para navegar** — pincha un bloque y baja al detalle. La foto es el índice
3. **Enseñarla en la reunión** — muchos clientes no han visto nunca su patrimonio entero en una pantalla
4. **Comprobar que cuadra** — el flujo de auditoría. Bien resuelto: la resta se muestra

---

## P3.2 · Pestaña Personas

De esta pestaña cuelgan cinco cosas: la **edad** decide la exención de vivienda y la jubilación · la **CCAA** decide la cobertura fiscal, ahora por persona · los **ingresos** deciden el apilamiento del rescate · la **titularidad** decide el reparto de cualquier plusvalía · el **estado de cálculo** decide si el motor liquida o declara hueco. Cinco dependencias sobre una pestaña de tres campos.

| # | Decisión | Estado | Motivo |
|---|---|---|---|
| PE1 | **El modal dice "ALTA DE ELEMENTO" mientras el título dice "Editar"** | `HECHO` | El encabezado no cambia al editar. Pequeño y visible |
| PE2 | **Texto de ayuda sustituido** — ahora explica por qué la fecha de nacimiento es obligatoria | `HECHO` | Es información sobre cómo funciona el sistema por dentro; a un asesor no le dice nada porque no esperaba que dar de alta a alguien calculara impuestos. **Lo que sí necesita saber no está: por qué la fecha de nacimiento es obligatoria** — de ella dependen la exención de vivienda a los 65, la jubilación y los plazos de la DT 12ª. Es la misma decisión A1, aplicada aquí |
| PE3 | **Estado de cálculo visible en la lista y en la ficha** | `HECHO` | Chip «Calculable» / «Sin cálculo · motivo». Lucía enlaza a Ingresos. | Es CORE (maestro nº 53) y hoy no aparece entre las columnas visibles. **El flujo de diagnóstico depende de ella**: si Fiscalidad dice que un titular no calcula, aquí debe verse y decir por qué |
| PE12 | **La columna "Ingresos del año" dice 0 € cuando el estado dice "sin ingresos"** | `HECHO` | «—» si sin ingresos · «—» en patrimonio sin titularidades. Evita contradecir el estado de cálculo |
| PE4 | **Añadir jubilación prevista a la lista** | `HECHO` | Año del plan base, o estimación por edad con «· est.» — la vista de conjunto donde el asesor la busca al hablar de rescatar o vender |
| PE8 | **Una persona solo se jubila una vez por escenario: el evento reemplaza, no añade** | `HECHO` | Plan base de GL con 2 jubilaciones. **Rescate de Carlos en 2035 verificado en 5.243 € exactos** — confirmaba que el motor no usaba la jubilación equivocada. | Hoy el plan base de García-Llorente tiene **tres jubilaciones**: Carlos 2033, Marta 2036, y una tercera suelta en 2029 sin decir de quién es. El motor tiene dos jubilaciones para Carlos. Si ya existe una para esa persona, el modal debe **precargarla y editarla**, no crear otra |
| PE9 | **La jubilación de la ficha y el evento del plan base son el mismo dato** | `HECHO` | El modal precarga el valor existente. **F1 siempre toca el plan base, sin selector de escenario** — la ficha describe la vida real, no una hipótesis. Al borrar el evento, la tarjeta vuelve a la estimación por edad. | La ficha dice "2033 · estimación del asesor" y el evento dice lo mismo: no son dos verdades, son una vista desde dos sitios. Editarla en la ficha debe editar el evento del plan base, y al revés. En un escenario alternativo —*"¿y si se jubila en 2029?"*— se **modifica el evento heredado**, no se añade uno nuevo |
| PE10 | **Estado de cálculo en la ficha F1** — quinta tarjeta | `HECHO` | Cuatro tarjetas —nacimiento, comunidad, ingresos, jubilación— y ninguna dice si esta persona es calculable. En Lucía, sin ingresos, **esta ficha es el sitio natural para explicar por qué** |
| PE11 | **La ficha enseña la base liquidable con su desglose** | `HECHO` | Carlos muestra 88.950 € con el paso bruto → cotizaciones → art. 19.2.f). | Dice "95.000 € · alimenta el motor fiscal", pero lo que alimenta el motor son 88.950 € tras restar cotizaciones y gastos. **Es el número que un asesor comprobaría contra la declaración de su cliente** (flujo de credibilidad de P4). Debe verse el bruto **y** la base, con el paso entre los dos |
| PE5 | **Las cotizaciones a la Seguridad Social son un dato de la persona, no del ingreso** | `HECHO` | Campo en alta/edición de persona · motor lee `Persona.cotizacionesSS` · migración en `normalizeBag` · seed revision 7 |
| PE6 | **El rol (titular · cónyuge · hijo) se mantiene en V2** | `V2` | Decidido pese a que Wealthabout lo usa para cambiar la ficha entera según el rol. **Dejará de ser opcional cuando lleguen los mínimos familiares**: para aplicar el mínimo por descendientes hay que saber quién es descendiente de quién. Y con expedientes de cinco personas —dos con renta y tres sin— la lista actual no distingue quién es quién |
| PE7 | **No copiar la riqueza de la ficha de miembro de Wealthabout** | Decidido | Su ficha es la más rica de su producto (vida laboral, relaciones mercantiles, educación y emancipación en hijos, IRPF y cotizaciones como gasto corriente) **porque viene de Cl@ve y la Seguridad Social**. Sin captación automática, replicarla sería pedirle al asesor que teclee una vida entera |

**Lo que Wealthabout no tiene y aquí sí:** ellos reparten por porcentaje en inmuebles, créditos, otros activos y empresas, pero **no por instrumento financiero**. Ese reparto por fondo es lo que permite liquidar a cada cónyuge en su propia escala. Y aunque lo tuvieran, su fiscalidad es un gasto anual calculado, no el resultado de una decisión: reparten para saber de quién es cada cosa; aquí se reparte para saber cuánto paga cada uno al mover dinero.

---

## P3.3 · Pestaña Activos

Es la pestaña que sostiene el diferencial: la fecha de adquisición y el **reparto de titularidad por instrumento** son lo que permite calcular una plusvalía y liquidar a cada titular en su propia escala.

**Lo que ya funciona bien y no se toca:** el menú "¿Qué decisión?" con la consecuencia fiscal bajo cada opción (*"Reembolsar → plusvalía a base del ahorro"*, *"Traspasar → neutro, art. 94"*, *"Pignorar → no realiza plusvalía"*), que enseña sin recomendar · los eventos de sociedad con su hueco declarado (*"el evento se registra, pero Scenia no muestra cifras fiscales societarias que no puede calcular"*) · el aviso del evento genérico antes de teclear un impacto · y la plusvalía derivándose en vivo en el modal de edición.

| # | Decisión | Estado | Motivo |
|---|---|---|---|
| AC1 | **"Falta el coste de adquisición" en el reembolso** | `HECHO` | **No era el motor ni el almacenamiento:** el botón de evento de la tabla de Activos no pasaba la referencia del elemento, así que el contexto caía a vacío. **Desde la ficha funcionaba y desde la tabla no** — dos caminos al mismo evento con comportamientos distintos. Reembolso verificado en ≈ 2.708 €. | El modal se niega a calcular por datos incompletos, pero ese mismo fondo tiene 180.000 € de coste y 120.000 € de plusvalía calculada **en su propia ficha de edición**. O es un `localStorage` desincronizado, o el evento no está leyendo el instrumento — y entonces **la regla del reembolso está rota** |
| AC2 | **El reparto de titularidad ya no bloquea** | `HECHO` | 100 % al primer titular por defecto. Etiquetas con un decimal y resto al primero (33,4 · 33,3 · 33,3). Al teclear a mano, el producto cuadra la diferencia si está a ±0,1 de 100. | Al dar de alta un activo reparte entre las tres personas a 33,3 % y salta el error de validación de entrada. Dos fallos: **el redondeo produce una suma imposible** —nunca puede pasar— y reparte entre todos, incluida quien no tiene sentido. Debería dejar 100 % al primer titular, o cuadrar el decimal sobrante |
| AC3 | **"ALTA DE ELEMENTO" al editar** — en todos los modales de activo | `HECHO` | Mismo fallo que en Personas (PE1), pero está en toda la familia de modales |
| AC4 | **"Comprar inmueble" ya no arrastra el nombre del origen** | `HECHO` | En el evento genérico sí se mantiene: saber que ese ingreso viene del Audi es útil. | *"Comprar inmueble · Vivienda · Jávea"* se lee como que vas a comprar Jávea. **Cuando el evento crea un elemento nuevo, el origen confunde.** En el genérico sí aporta (saber que ese ingreso viene del Audi es útil) y se queda |
| AC5 | **Texto de ayuda de los modales de activo** | `HECHO` | En fondo e inmueble ahora explica que el coste y la fecha son lo que permite calcular la plusvalía. | *"El alta no dispara cálculo fiscal"* — misma crítica que PE2, aplicada a toda la familia de modales de activo |
| AC8 | **La liquidez se deriva del tipo de activo y no es editable** | Decidido | Efectivo y fondos alta · planes e inmuebles baja · otros activos media. **Es un hecho objetivo del tipo, no una valoración**: un plan no se puede sacar cuando quieras por ley, y un inmueble tarda meses en venderse. Si el asesor pudiera cambiarlo, el semáforo dejaría de ser comparable entre clientes. Mismo criterio que la plusvalía latente: se calcula, no se introduce |
| AC9 | **La derivación por tipo se queda corta en dos casos** | `SIGUIENTE` | **Un fondo pignorado no es líquido** —está dado como garantía y no se puede tocar— pero hoy sigue marcado como liquidez alta, porque la liquidez sale del tipo y no del estado. Y **las participaciones en una sociedad no cotizada** comparten "baja" con un inmueble, que al menos tiene mercado. **Importará cuando la liquidez se use para algo más que el semáforo** — la columna de sostenibilidad ya distingue líquidos de no líquidos |
| AC6 | **"Segunda residencia" e "Inmueble en alquiler" existen sin consecuencia** | Anotado | El desplegable de uso las ofrece, pero el motor no modela rendimientos de alquiler ni la fiscalidad distinta de una segunda residencia. **No es grave** —el uso sí decide la exención del art. 33.4.b)— pero conviene saber que elegir "alquiler" no activa nada |

### AC7 · Amortizar vs invertir: cómo se gestiona

**`HECHO` — construida y verificada en navegador.**

**Cifras de García-Llorente** (amortizar 50.000 € en 2026 sobre una hipoteca de 180.000 € al 2,9 %):

| | Amortizar | Invertir |
|---|---|---|
| Al 4 % declarado | **24.315 €** | **36.118 €** |
| Al 2 % declarado | 24.315 € (no cambia) | **15.794 €** |

**Dos decisiones de implementación que mejoraron el planteamiento:**

**Capitalización en las dos patas**, no interés simple: `X × ((1 + tasa)^n − 1)`. El plan original usaba `X × tasa × n`, que **contradecía a la proyección** —donde el mismo 4 % capitaliza— y habría dado dos resultados distintos para el mismo porcentaje en dos pantallas del producto.

**El plazo efectivo, no el nominal.** Amortizar 50.000 € manteniendo la cuota acorta la hipoteca de 21 años a **13,9**. Comparar sobre los 21 declarados habría inflado las dos patas. *Falta explicarlo en pantalla: el asesor declaró 21 y el producto compara sobre 13,9, y sin decirlo parece un error.*

**Y la prueba que valida el firewall:** al bajar la rentabilidad declarada del 4 % al 2 %, la pata de expectativa cae de 36.118 € a 15.794 € y **la de certeza no se mueve**. El asesor ve que una cifra es suya y la otra es del contrato.

**Prerrequisito · `HECHO`** — los intereses derivados del capital vivo (T16).

**El problema:** el menú anuncia *"Amortizar vs invertir"* y el modal dice que la comparación se muestra en el comparador. **Eso hoy no pasa** — la regla ③ es un stub que solo registra el evento. El producto promete algo que no existe.

**Ahora — que el modal diga la verdad.** Cambiar el texto por lo que realmente hace: el evento se registra y mueve el patrimonio (baja el pasivo, baja el efectivo), pero **la comparación entre interés ahorrado y rentabilidad esperada no está construida**. Con el mismo tratamiento que los eventos de sociedad, que ya lo resuelven bien.

**Después — construir la regla, y hay tres razones para que suba de prioridad:**

1. **No depende del fiscalista.** Es interés ahorrado contra rentabilidad esperada, casi sin fiscalidad. Se puede construir sin esperar a la validación, que es el cuello de botella de todo lo demás.
2. **Es una de las tres preguntas más frecuentes** que le hacen a un asesor, y hoy la resuelve de cabeza.
3. **Es de las pocas comparaciones que separan las curvas de verdad.** No reordena el balance como vender un inmueble: cambia la trayectoria durante veinte años. Ataca directamente el problema del comparador.

**Lo que le falta para funcionar:** la **modalidad del tipo de interés** (fijo · variable · mixto), que no está en el modelo de pasivos. Con Euríbor moviéndose, amortizar una hipoteca variable y una fija son decisiones distintas.

**Y el borde de firewall que hay que cuidar:** enseñar *"amortizar te ahorra 12.000 €, invertir te da 31.000 €"* está cerca de decir cuál es mejor. La diferencia es que **compara una certeza contra una expectativa** — el interés de la hipoteca es un hecho, la rentabilidad es una hipótesis. Eso tiene que ser visible: la rentabilidad es un supuesto que **declara el asesor**, no un número que pone el producto. Formulado así, el firewall aguanta: *"con la rentabilidad que tú has declarado, esto sale así"*.

**El marco acordado, para no volver a discutirlo:**
- **Primera versión solo para hipoteca fija.** En variable o mixto, chip de registro y *"comparación no aplicable: el tipo no es contractual fijo"*. Proyectar veinte años al Euríbor de hoy sería fingir certeza.
- **Fiscalidad de lo invertido fuera, con hueco declarado.** Calcularla exige vehículo, horizonte y momento de realización — es casi otra regla, y aplicar la escala del ahorro "al final" inventaría el timing.
- **Presentación en dos patas**: una fila de certeza (*"interés contractual que deja de pagarse"*) y otra de expectativa (*"rendimiento esperado con la rentabilidad que has declarado en este escenario"*), con la línea de cierre: *"no se señala ganador: una pata es certeza del contrato; la otra es la hipótesis que tú has puesto"*.
- **El plazo como campo explícito, no inferido.** Se puede deducir de cuota, capital y tipo, pero un plazo marcado "a verificar" es una cifra más que auditar — y el asesor ya tiene bastantes.
- **Resultado en dos sitios:** el modal en el momento de decidir, y la tabla de hechos del comparador como dos hechos neutros.

**Prerrequisitos:** modalidad y plazo del pasivo (PA1 y PA2), **ya añadidos**.

**Comportamiento con datos incompletos:** varios eventos de amortizar sobre el mismo pasivo se suman · sobre pasivos distintos, no se compara y se dice por qué · sin modalidad, sin plazo o sin rentabilidad declarada, no hay cifras.

**Lo que queda por hacer, y es de conversación, no de código:** *¿cuántos de tus clientes te preguntan si les compensa amortizar?* Si dice muchos, sube por delante de otras cosas de V2. **No construirla hasta tener esa respuesta:** es funcionalidad nueva, y hay arreglos de lo que ya existe por delante.

---

## P3.4 · Pestaña Pasivos

**Lo que está muy bien y no se toca:** la nota al pie —*"la cuota nunca va entera a un sitio: los intereses cuentan como gasto y la amortización de capital como ahorro. Aproximación anual orientativa (nivel 1)"*— es probablemente el mejor texto del producto. Enseña un concepto que muchos clientes no conocen **y declara la simplificación en la misma frase**.

| # | Decisión | Estado | Motivo |
|---|---|---|---|
| PA1 | **Modalidad del tipo de interés** (fijo · variable · mixto) | `HECHO` | La tabla dice "2,9 %" pero no de qué tipo. En el mercado español eso **cambia la decisión entera**: amortizar una variable con el Euríbor subiendo no es lo mismo que una fija. **Sin este dato la regla ③ (AC7) no se puede construir bien** — es su prerrequisito |
| PA2 | **Plazo restante del préstamo** | `HECHO` | Campo explícito, no inferido | No se sabe cuántos años quedan, y es lo primero que pregunta un cliente. Además es lo que haría falta para la amortización real (nivel 2) en vez de la aproximación anual |
| PA3 | **El desglose interés/capital de la cuota** | `SIGUIENTE` | Sigue pendiente en la tabla de Pasivos, aunque el cálculo ya deriva el interés del capital vivo | El producto ya lo calcula —6.180 €/año de amortización en García-Llorente— pero solo aparece dentro de la capacidad de ahorro. **Es el dato que el asesor quiere ver aquí**, y ya existe: solo hay que enseñarlo |
| PA4 | **Solo hay una acción posible en el menú de la línea** | `V2` | Amortizar y nada más. Faltan al menos "cancelar" y "refinanciar", que son decisiones reales de un cliente con deuda |
| PA5 | **No hay ningún crédito personal en el seed** | `SIGUIENTE` | Todos los pasivos de prueba son hipotecas con inmueble asociado. **No sabemos si la tabla se comporta bien sin inmueble vinculado**, y ese caso afecta al cálculo de amortización (que descuenta intereses por hipoteca vinculada) |
| PA6 | **El modal de amortizar ya no promete la comparación** | `HECHO` | Mismo tratamiento que los eventos de sociedad: el evento se registra y mueve pasivo y efectivo; el interés ahorrado frente a la rentabilidad **no está calculado**, y se dice | Mismo caso que AC7, y aquí es más visible porque **es la única acción que ofrece la pantalla**. Ver la gestión completa en AC7 |

---

## P3.5 · Pestaña Ingresos

**Es la pestaña de la que más depende el producto y la que menos lo parece.** El total por persona es el input del liquidador de base general: si los ingresos están mal, la cifra fiscal que Scenia enseña está mal — y esa cifra es todo el diferencial.

**Lo que está bien y no se toca:** la nota al pie que distingue bruto de base liquidable (*"el rescate del plan se apila ahí, no sobre el bruto"*) · el campo de cotizaciones diciendo la verdad (*"si no se informa, el motor resta 0 € · no inventa cotizaciones"*) · y que "Actividad económica" esté en el desplegable, que era el arreglo de la v14.

| # | Decisión | Estado | Motivo |
|---|---|---|---|
| IN1 | **Solo hay periodicidad anual** | `SIGUIENTE` | Un ingreso que empieza a mitad de año, dura tres o termina con la jubilación no se puede modelar. **No es un caso raro**: un alquiler firmado en septiembre, una indemnización, un contrato temporal. Hoy se aproxima a mano o va al evento genérico, donde ya no calcula |
| IN2 | **No hay ninguna validación de coherencia** | `AHORA` | Nada impide teclear 950.000 € en vez de 95.000 € y que toda la fiscalidad salga mal sin un aviso. **En la pestaña de la que cuelga el motor, eso es frágil.** Un aviso suave ante valores atípicos, sin bloquear |
| IN3 | **Marcar en la tabla los ingresos de trabajo sin cotizaciones informadas** | `AHORA` | El campo está bien resuelto y es honesto, pero es opcional y un asesor con prisa lo salta. Entonces la base sale alta y **no hay nada en pantalla que se lo recuerde**. No hace falta obligar: basta con que se vea qué falta |
| IN4 | **El total no distingue por fuente** | `SIGUIENTE` | Dice 127.000 € sin separar lo que va a base general de lo que iría a base del ahorro. **Un dividendo y un sueldo suman igual en esa fila y tributan en escalas distintas** |
| IN5 | **"Alquiler" y "Dividendo" existen en el desplegable sin consecuencia y sin aviso** | `AHORA` | El motor no aplica la reducción por arrendamiento de vivienda ni lleva los dividendos a la base del ahorro: los suma como si fueran trabajo. **Es distinto de "actividad económica", que sí se declara como no contemplada.** O se declaran igual, o se calculan |
| IN6 | **Nada dice cuándo dejan de existir estos ingresos** | `SIGUIENTE` | El sueldo de Carlos figura como 95.000 € para siempre; lo que lo corta es el evento de jubilación, que vive en otra pantalla. **Un asesor que mire solo esta tabla no tiene forma de saberlo.** Relacionado con PE4: la jubilación debería verse donde sus consecuencias se notan |
| IN8 | **El estado vacío de Ingresos dice "El alta alimenta el liquidador de base general"** | `AHORA` | Habla de la maquinaria, no del asesor. **Y el liquidador de base general no es lo único que depende de esta pestaña:** también la capacidad de ahorro y toda la proyección. Mejor algo como *"sin ingresos cargados · sin ellos no se puede calcular la fiscalidad ni la capacidad de ahorro"*, con el botón para añadir |
| IN9 | **La tabla no muestra las cotizaciones informadas** | `AHORA` | Se introducen en el modal pero no se ven en la tabla. **Es el dato que decide si la base liquidable es correcta** (IN3), y hoy hay que abrir cada línea para saber si está |
| IN7 | **Rendimientos de actividades económicas calculados** (RETA, gastos propios del autónomo) | `V2` | Hoy la fuente existe y devuelve `sin_calculo` con su aviso, que es la respuesta honesta |

---

## P3.6 · Pestaña Gastos

| # | Decisión | Estado | Motivo |
|---|---|---|---|
| GA1 | **"Impuestos y tasas" invita a un doble cómputo del IRPF** | `AHORA` | Un asesor puede meter ahí el IRPF —es lo que hace Wealthabout, que lo trata como gasto corriente— pero **aquí lo calcula el motor**: se contaría dos veces, como gasto en la capacidad de ahorro y como cuota en Fiscalidad. Aviso explícito, o desambiguar la etiqueta: IBI y tasas municipales sí, IRPF no |
| GA2 | **Las categorías pasaron a ser una lista cerrada de doce** | `SIGUIENTE` | El maestro decía "libre, con sugerencias". Un gasto que no encaje —pensión compensatoria, apoyo a un familiar dependiente— acaba en "Otros" y pierde identidad. Decidir si se reabre o se asume la lista |
| GA3 | **"Intereses de deuda" es la categoría por defecto** | `AHORA` | Es la que menos se teclea a mano: normalmente viene del pasivo vinculado. No debería ser el valor inicial |
| GA4 | **Mismos huecos que Ingresos: sin periodicidad, sin validación, sin fecha de fin** | `SIGUIENTE` | Ver IN1, IN2 e IN6. Aquí duele especialmente lo último: **los intereses de una hipoteca que se termina de pagar en 2040 siguen contando en 2050** — es la causa de PR3 |

---

## P3.7 · Pestaña Ahorro

**Está mejor de lo que la crítica inicial sugería:** el paso intermedio "ahorro líquido" y la tasa de ahorro no están en ninguna otra pantalla, y el aviso de solo lectura es correcto.

| # | Decisión | Estado | Motivo |
|---|---|---|---|
| AH1 | **La tasa de ahorro mide sobre la capacidad, que incluye la amortización** | `AHORA` | 59,2 % sale de 75.160 / 127.000. Pero la amortización es ahorro patrimonial, **no dinero disponible**. Sobre el ahorro líquido sería 54,3 %. Las dos son defendibles: decidir cuál y **decir cuál se está midiendo** |
| AH2 | **Esta pestaña dice 75.160 € y la proyección dice capacidad negativa desde 2036** | `AHORA` | Es PR4 visto desde aquí, y es donde más engaña: **un asesor que mire esta pantalla concluye que la familia ahorra bien**, y la proyección dice lo contrario. Falta una línea del tipo *"capacidad a fecha de hoy · cambia con la jubilación, ver Proyección"* |
| AH3 | **La fusión con el Resumen sigue en pie** | `SIGUIENTE` | Ver P1. Lo que debe sobrevivir está ahora identificado: **la tasa de ahorro y el paso "ahorro líquido"**. El desplegable en la tarjeta oscura los absorbe |

---

# P4 · Fiscalidad

| # | Decisión | Estado | Motivo |
|---|---|---|---|
| F1 | **La reforma valenciana de 2026 se publicará con efectos retroactivos a 1-1-2026** | `AHORA` (vigilar) | El anteproyecto de Ley de Medidas Fiscales rebaja los ocho primeros tramos (hasta 100.000 €) con efectos desde el 1 de enero de 2026. Pendiente de CJC, CES y Corts: previsible en otoño, **es decir alrededor de VDS**. Cuando se publique, toda cifra autonómica enseñada hoy para 2026 queda incorrecta hacia atrás. Acción: vigilar el DOGV y tener la fila de parámetros preparada. **No enseñar cuotas autonómicas de 2026 como definitivas hasta entonces** |
| F2 | **El gravamen autonómico usa el mínimo estatal (5.550 €) en lugar del valenciano (6.105 €)** | `AHORA` | Cuantificado: sobrestima la cuota autonómica en **49,95 € por persona y año** (555 € al 9 % del primer tramo). Es un parámetro, no lógica: coste de arreglo casi nulo y elimina una discrepancia que un asesor que audite contra la declaración sí puede detectar. Fuente: art. 2 bis Ley 13/1997, añadido por el Decreto-ley 14/2022 |
| F3 | **Confirmado: la frase de lectura solo cuenta un escalón** | `HECHO` | Verificado con Marisa Blasco el 06/08/2026. Su recorrido real es 30 % durante 2.210 € · 32,5 % durante 3.200 € · 36 % después, y la pantalla presenta el 32,5 % como si durase. Con Andreu el segundo escalón dura 28.000 € y por eso la frase se sostenía: **el defecto solo se ve con umbrales cercanos**. Un asesor que planifique 5.000 € a nombre de Marisa lee 32,5 % y paga 36 % en el último tramo. Se arregla junto con F5 y F6 |
| F4 | **El margen puede depender de un dato tecleado a mano con precisión de decenas de euros** | `HECHO` | Caso Andreu Ferrer: base 71.950 € contra umbral autonómico 72.000 €. Un error de 50 € en las cotizaciones cambia el marginal del 47,5 % al 49 %. **Cuando el margen sea inferior a ~500 €, la pantalla debe advertir de la sensibilidad**, no dar la cifra como firme. Enlaza con M7 |
| F5 | **Confirmado en pantalla: el margen de 50 € se presenta como si fuera recorrido** | `HECHO` | Verificado con Andreu Ferrer el 06/08/2026. La cifra sale en tipografía grande y la frase de lectura dice "hasta agotar 50 €": las dos son literalmente ciertas y se leen como si quedara margen. **Debe comunicar "sin margen"**. Se resuelve junto con F6 y F3 en una sola intervención, no por separado |
| F6 | **Los dos márgenes compiten con la misma jerarquía visual, y solo uno decide** | `HECHO` | Andreu muestra 50 € (autonómico) y 228.050 € (estatal) con el mismo tamaño, peso y frase. **El margen real es siempre el menor de los dos**, porque es el primero que se agota. El estatal por encima de 60.000 € nunca informa una decisión de un cliente de EAF: nadie genera 228.000 € de renta adicional. La pantalla ya sabe la respuesta —la frase de lectura la da bien—, lo que falta es que las dos columnas no compitan con ella |
| F7 | **La simplificación declarada no dice cuánto cuesta** | `SIGUIENTE` | El pie declara "gravamen autonómico con mínimo estatal" sin cuantificar. Son ~50 € por persona y año (ver F2). Un EAF que audite lo preguntará: tener la cifra en pantalla convierte una carencia en una muestra de rigor |
| F8 | **La frase de lectura debe seguir poniendo un ejemplo genérico, no el activo del cliente** | Decidido | Hoy dice "por ejemplo, un rescate del plan" con un expediente que aún no tiene planes. Tentación evidente: personalizarlo al activo cargado. **No se hace.** Nombrar la operación concreta que este cliente podría ejecutar es proponerla, y ahí se cruza el firewall. El ejemplo genérico ilustra el mecanismo sin señalar a nada |
| F9 | **El margen menor no es siempre el autonómico** | Decidido | Con Andreu (71.950 €) y Marisa (29.790 €) manda el autonómico, pero con una base de 33.000 € manda el estatal: umbral 35.200 frente a 42.000. **La escalera combinada debe comparar los dos umbrales en cada punto**, nunca asumir cuál gobierna. Se anota para que nadie lo "simplifique" más adelante |
| F10 | **El tipo combinado no aparece en ninguna de las dos columnas** | `HECHO` | Marisa muestra "15 %" en las dos escalas y su marginal real es 30 %. La suma solo existía en la frase de lectura. Es el argumento de por qué el recorrido combinado sube a elemento principal: **la cifra que decide no estaba en ningún sitio donde el ojo la busca** |
| F11 | **El valor de prueba para verificar la escalera no puede caer en un umbral** | Decidido | Primer intento: bajar las cotizaciones de Andreu de 4.050 € a 4.000 € · da una base de **exactamente 72.000 €**, que es el umbral, con lo que la pantalla vuelve a mostrar "sin margen" y el test no distingue nada — y encima parece un fallo del arreglo. **El valor correcto es 3.000 €** (base 73.000 €, a mitad del tramo 72.000-100.000): mueve cuatro comportamientos a la vez —número de peldaños, tipo del primero, desaparición de la línea de sensibilidad y regla de corte de los 50.000 €—. Regla general en T18 |
| F12 | **El motor cuadra al euro con el cálculo manual** | Verificado 06/08/2026 | Andreu: base 71.950 € · cuota 22.880,25 € (estatal 11.112,25 + autonómica 11.768,00). Marisa: base 29.790 € · cuota 5.973,00 € (estatal 3.024,00 + autonómica 2.949,00). Contrastado contra la escala estatal del art. 63.1 LIRPF y la autonómica valenciana de once tramos de la Ley 9/2022, con mínimo del contribuyente de 5.550 €. **Ningún defecto encontrado en el cálculo: todos los hallazgos de esta pantalla son de presentación.** Es la línea base contra la que comparar cuando el fiscalista revise |
| F15 | **El recorrido resuelve media cuenta y deja la otra media** | `SIGUIENTE` | Le quitamos al asesor sumar los dos tipos —Marta ve 15 % y 15 %, su tipo real es 30 %— y le dejamos repartir el dinero entre los peldaños: para un rescate de 10.000 € son tres multiplicaciones, una resta y una suma. **La aritmética que le dejamos es más larga que la que le quitamos.** Y el error que produce es real: con la frase antigua el cálculo a mano daba 3.148 € en vez de 3.243 €, porque los últimos 2.720 € tributan al 36 % y la frase decía 32,5 % |
| F16 | **El recorrido habla en euros de base liquidable; el asesor piensa en operaciones** | `SIGUIENTE` | "32,5 % los siguientes 3.200 €" es un tipo marginal. Lo que se dice en voz alta en una reunión es "esto te cuesta 3.243 €". Un tipo es una herramienta de cálculo; un euro es una conversación. **Falta la traducción de cantidad a coste** — pero esa traducción es un escenario, no un diagnóstico: ver F18 |
| F17 | **La comparación entre titulares no está en pantalla** | `SIGUIENTE` | El uso de más valor de Fiscalidad es "¿a nombre de quién?", y hoy exige cambiar de persona en el selector y recordar lo anterior. Los **1.657 € de diferencia** entre rescatar 10.000 € a nombre de Marta (3.243 €) o de Carlos (4.900 €) —el mejor número que ha producido el producto— no aparecen en ninguna parte. **Esto sí es diagnóstico y encaja en Fiscalidad**: es la posición de dos personas puesta junta, sin cantidades ni operaciones |

---

# P6 · Escenarios y comparador

| # | Decisión | Estado | Motivo |
|---|---|---|---|
| E1 | **Líquidos como métrica por defecto**, no patrimonio | `AHORA` | Las decisiones patrimoniales reordenan el balance sin cambiarlo: vender una casa convierte 420.000 € de ladrillo en 420.000 € de efectivo. El patrimonio neto no separa; los líquidos sí (salto de 313.200 € en la venta) |
| E2 | **Recuperar el impuesto acumulado como línea escalonada** — sube en el año de cada evento | `AHORA` | Se retiró porque dibujaba una constante desde 2026. Con la cuota del primer ejercicio ya se puede dibujar honestamente: solo hay que ponerla en su año. **Es la comparación más elocuente que hay** |
| E3 | **Hitos de eventos sobre el eje temporal** | `AHORA` | Una curva sin contexto no se puede narrar. Hoy no se sabe que ese quiebro es la jubilación |
| E4 | **Lectura de sostenibilidad por escenario** — "consume patrimonio desde 2036", "los líquidos se agotan en 2048" | `AHORA` | El producto ya lo calcula y no lo dice. La capacidad de García-Llorente es negativa desde 2036 y el patrimonio sigue subiendo porque la rentabilidad tapa el déficit. **Responde a la pregunta que todo cliente hace** |
| E5 | **Tabla de hechos antes que la curva** — una fila por camino con impacto fiscal, líquidos, sostenibilidad y patrimonio final | `SIGUIENTE` | Es lo que el asesor lee en voz alta en la reunión. La curva es apoyo |
| E16 | **"Aguanta hasta 2050" también es información** — se acepta que con un cliente sano los caminos digan lo mismo | Decidido | Un asesor que ve "aguanta" en los seis caminos sabe que **ninguna de esas decisiones pone en riesgo el plan**. No es espectacular, pero es lo que su cliente quiere oír. No se fuerza la columna a decir algo dramático cuando no hay nada dramático que decir |
| E17 | **Un cliente del seed que sí tense el plan** | `HECHO` | **Navarro Sanchís: los líquidos se agotan en 2040**, y con la venta de la segunda residencia ya no. Es la primera vez que esa mitad de la columna dice algo, y **diferencia dos caminos de la forma más clara posible: uno se queda sin dinero y el otro no**. Es el segundo mejor caso de demostración después de García-Llorente | García-Llorente tiene ~1 M€ de líquidos y un déficit de 5.340 €/año: tardaría siglos en agotarse, así que los seis caminos dicen lo mismo. **Verificado que la columna sí diferencia cuando hay algo que diferenciar** (test sintético: dos caminos con la misma capacidad estructural agotan en 2028 y 2027 porque la cuota sale de los líquidos). Falta un caso del seed donde se vea |
| E18 | **La columna prioriza el agotamiento de líquidos sobre la capacidad negativa** | Decidido | Agotarse es más grave que consumir. Está bien decidido pero no es obvio: se anota para que nadie lo "arregle" al revés |
| E13 | **Elegida la alternativa B del rediseño** — lista de escenarios intacta, resultados primero | Decidido | No regresa en arquitectura, nadie reaprende, y es lo más barato sobre lo que existe. **A** (moldes de pregunta) apuesta por una hipótesis sin validar; **C** (decisiones sin escenario) vuelve a atar las decisiones al activo y pierde los moldes de cambio de vida — con ellos, la comparación "jubilarse en 2033 vs 2036", que es la que mejor separa las curvas |
| E14 | **"Ventana fiscal detectada"** — cuando el motor reconoce un tratamiento distinto para la misma operación, propone mirarlo: pones venta en 2033 y sugiere 2036; pones reembolso y sugiere pignoración | `SIGUIENTE` | **La mejor idea de la alternativa C**, y encaja en B sin su arquitectura. Ataca el problema de "no sé qué comparar" sin necesitar los cinco moldes. Propone qué mirar, nunca qué hacer. Va en tanda aparte: es lógica nueva, no presentación |
| E15 | **El clon se mantiene como forma de crear escenario** | Decidido | La referencia B sugería crear un expediente vacío. Sin clonar, el escenario no hereda las jubilaciones ni la línea temporal del cliente, y un rescate en 2035 dejaría de salir más barato que en 2026 |
| E6 | **Moldes de pregunta** — el asesor elige "¿de dónde saco el dinero?", "¿cuándo lo hago?", "¿y si cambio de vida?", "¿y si pasa algo?", "plan A vs plan B", y el producto monta los escenarios | `V2` | El coste de montar un escenario es alto y el asesor no siempre sabe qué comparar. No rompe el firewall: propone qué mirar, nunca qué hacer |
| E7 | **El delta contado en hechos, con las dos caras** — "B paga 13.255 € menos; A dispone del dinero tres años antes" | `V2` | Neutralidad con contenido, no neutralidad muda |
| E8 | **Limitar a tres caminos comparados a la vez** | `V2` | Nadie decide entre seis cosas. El seed invita a comparar seis y eso contribuyó a que el gráfico pareciera roto |
| E9 | **"Hasta el año" solo en eventos que admiten rango** + validar que el fin no sea anterior al inicio | `AHORA` | Aparece en vender, jubilarse y pignorar, donde no hace nada. Y un rango incoherente se acepta en silencio |
| E10 | **Monte Carlo y probabilidades de éxito** | `DESCARTADO` | Una probabilidad enseñada a un cliente es una promesa con decimales. Es la pieza estrella de ProjectionLab y sería el mayor riesgo aquí |
| E11 | **What-if en vivo delante del cliente** | `DESCARTADO` | El asesor no recalcula en reunión: una cifra inesperada destruye la confianza. Se anota y se resuelve en frío |
| E12 | **Soportar comparación de supuestos explícitamente** (rentabilidad, inflación, edad de jubilación, ahorro) | `V2` | Ya funcionan como campos del escenario pero nada en la interfaz lo sugiere. Son las comparaciones que más separan las curvas |
| E19 | **El campo de cantidad con su coste va en Escenarios, no en Fiscalidad** | `SIGUIENTE` | Un campo donde el asesor escribe una cifra y la pantalla devuelve un coste **ya es un escenario**, esté en la pestaña que esté. Ponerlo en Fiscalidad crearía dos superficies contestando la misma pregunta, y el día que no cuadren —redondeo, mínimo estatal, reforma valenciana aplicada en un sitio y no en otro— se pierde al asesor. **Es PR1 y PR4 otra vez.** Una pregunta, un sitio. Forma prevista: cantidad introducida por el asesor y coste resuelto por titular, con desglose por peldaños desplegable. **No cruza el firewall**: muestra dos costes de una cantidad que ha puesto él, sin ordenarlos ni señalar cuál conviene |

**Pregunta abierta para Dani:** *¿montarías tú un escenario, o preferirías que la herramienta te propusiera qué comparar?* Su respuesta decide si E6 sube de prioridad.

---

# Motor fiscal

| # | Decisión | Estado | Motivo |
|---|---|---|---|
| M1 | **Congelar el motor** — no añadir reglas ni parámetros | Decidido | Cada iteración engorda la lista que hay que llevar al fiscalista, y esa validación es el cuello de botella real |
| M2 | **Regla ③ · amortizar hipoteca vs invertir** | `SIGUIENTE` | Casi no depende de fiscalidad, así que **no está bloqueada por el fiscalista**. Es una de las tres preguntas más frecuentes. Necesita la modalidad del tipo de interés (fijo/variable), que no está en el modelo |
| M3 | **Motor de pensión pública** | `PREGUNTAR` | Es el momento exacto en que el asesor sale de Scenia para abrir el simulador de la Seguridad Social. Caro. **Preguntar a Dani cuánto pesa** |
| M4 | **Impuesto de Sociedades** | `V2` | Sin él, el segmento Empresario está en el desplegable y no está servido. Es una decisión de negocio tomada por defecto |
| M5 | **ISD (herencias y donaciones)** | `PREGUNTAR` | Lo pidió Dani. Es un motor nuevo con normativa autonómica propia. Ninguno de los moldes de comparación lo contempla: es hueco de tesis, no de alcance |
| M6 | **Ratio único en lugar de FIFO** — marcado como estimación no válida para autoliquidación | Decidido | Sin lotes en el modelo, implementar FIFO sería fingir precisión. Temporal y declarado |
| M7 | **Las cotizaciones no se estiman** — las introduce el asesor | Decidido | Mejor un hueco que un número inventado. Pero si nadie rellena el campo, la base sale alta y no se nota: **el campo debe ser visible en el alta** |
| M8 | **Toda persona queda o calculada o declarada** | Decidido | Principio de la v14. Nunca una cuota que parezca resultado cuando falta el dato |

---

# Proyección

| # | Decisión | Estado | Motivo |
|---|---|---|---|
| PR1 | **Punto de apertura en la serie** — hoy el primer punto (858.980 €) ya lleva un año de flujo y no coincide con P3 (790.000 €) | `AHORA` | Un asesor abre dos pantallas y ve dos números distintos del mismo cliente. **Es el momento en que decide si te cree** |
| PR2 | **Declarar el efectivo negativo** en vez de taparlo con `max(0, …)` | `AHORA` | Si un cliente se queda sin dinero, la pantalla enseña cero. Es información oculta, no simplificada |
| PR3 | **Los gastos no cambian nunca con la edad** — siguen los mismos a los 82 años, incluidos los intereses de una hipoteca ya pagada | `SIGUIENTE` | Hace que la curva cuente una historia falsa: capacidad negativa desde 2036 y patrimonio creciendo un 43 % |
| PR4 | **Coherencia entre P3 Ahorro y la serie** — P3 dice 75.160 € para siempre, la serie dice −5.340 € desde 2036 | `SIGUIENTE` | Dos números distintos para el mismo concepto en dos pantallas |
| PR5 | **Los inmuebles no revalorizan y los vehículos no se deprecian** | `V2` | Dos sesgos conocidos en direcciones opuestas. Una depreciación lineal tosca costaría poco y quitaría un error sistemático |
| PR6 | **Cuota multi-año = repetir la del primer ejercicio** | Decidido | Nivel 1 declarado. La fila dice "primer año", no "del periodo" |
| PR7 | **Traspaso sin efecto en la proyección** | Decidido | **Es correcto**: mover dinero entre fondos no cambia el patrimonio. Su efecto es fiscal y el motor ya lo recoge |
| PR8 | **Pignoración: la liquidez prestada no capitaliza** | Decidido | Antes generaba rentabilidad de la nada (efectivo al 4 % contra deuda al 0 %). Sin el tipo de la entidad no se inventan intereses: ese hueco lo cierra el asesor |

---

# Preguntas abiertas para Dani

Las que decidirían cosas que hoy están tomadas por hipótesis:

1. **¿Cómo decides por qué cliente empezar el lunes?** → decide si Cartera necesita algo más (C3, C10)
2. **¿Cómo agrupas a tus clientes?** → decide los segmentos (C9)
3. **¿La foto de tu cliente se parece a la que te montas tú?** → destapa huecos del modelo de datos
4. **¿Montarías tú un escenario, o preferirías que la herramienta te propusiera qué comparar?** → decide E6
5. **¿Cuántos de tus clientes te preguntan si les compensa amortizar?** → decide M2
6. **¿Cuánto pesa la conversación de la pensión pública?** → decide M3
7. **¿Y la de herencias?** → decide M5
8. **¿En qué momento del recorrido habrías abierto Excel?** → la que más vale de todas
9. **¿A partir de qué precio lo descartarías? ¿De qué presupuesto saldría?** → si responde "el de software", estás en el bolsillo equivocado
10. **¿Daría de alta a sus clientes uno a uno, o importaría su lista?** → decide A6 y el peso real de T1/T2

---

# Historial de cambios de este documento

| Fecha | Qué |
|---|---|
| — | Creación. Transversales, P1 Cartera, P6 Escenarios, motor y proyección |
| — | Añadidas P2 Alta y P3 Patrimonio. Marcadas como `HECHO` las tandas de transversales, Cartera y Patrimonio |
| 2026-08-06 | Añadida P4 Fiscalidad (F1-F5). Primera entrada fechada: a partir de aquí las filas llevan fecha |
| 2026-08-06 | P4 Fiscalidad reescrita completa (F1-F12) tras revisar la pantalla con Ferrer Blasco · añadido T18 sobre método de verificación |
| 2026-08-08 | P3.2 Personas: PE12 (— sin dato), PE4 (jubilación en lista), PE5 (cotizaciones SS en la persona) → `HECHO` |
