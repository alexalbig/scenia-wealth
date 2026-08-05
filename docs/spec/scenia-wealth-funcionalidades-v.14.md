# Scenia Wealth — Funcionalidades (documento maestro · v14)

> **Documento único de funcionalidades.** Sustituye por completo a cualquier versión anterior.
>
> **Formato de cada sección:** overview · tabla de funcionalidades numeradas · variables · cómo la usa el asesor.
>
> **La crítica vive aparte**, en `scenia-wealth-critica.md`, para que este documento quede como especificación limpia. Los dos se leen juntos: aquí está lo decidido, allí dónde el producto es frágil.
>
> **Columnas de la tabla:** `Funcionalidad` · `Nº` (correlativo global, sirve de clave) · `Detalle` · `Fase`.
>
> **Las fases** — un solo token por fila, para importar a Notion como *status*:
> - **CORE** — el espinazo. Define el producto; sin esto no hay Scenia. Va dentro del MVP.
> - **MVP** — la primera tanda construible.
> - **V2** — profundidad, según feedback de los EAFs.
> - **Futura** — escala; caro y dependiente de terceros.
> - **Descartado** — decidido no hacer.
>
> **Numeración:** `P` = pantalla con entrada propia · `F` = ficha (drill-down, no está en el menú) · `CT` = componente transversal.
>
> **Estado de las validaciones:**
> - ✅ **Foto-primero validado** — Dani (design partner, Mediolanum) confirma que entrar por la foto del patrimonio le convence.
> - ⏳ **Motor fiscal en validación con fiscalista** — prerrequisito para enseñar cifras a cualquier asesor fuera del círculo de design partners. Todo parámetro va marcado `(a verificar)` hasta entonces.
> - ⚙️ **Estado del motor:** liquidación de **un ejercicio** funcionando (escalas oficiales estatal + Comunitat Valenciana, base general apilada sobre ingresos, base del ahorro). La **acumulación de periodo** (FIFO multi-año, interacción entre eventos) no está construida: los eventos multi-año liquidan solo el primer ejercicio.
>
> **Principio rector:** el asesor entra por la foto, actúa desde donde mira, y el motor calcula la fiscalidad de una decisión antes de tomarla — sin recomendar nunca.

---

## Cambios de la v14

Revisión centrada en **la composición del expediente**: hasta ahora todo se había diseñado asumiendo dos titulares con nómina en la Comunitat Valenciana. Al probar otras composiciones aparecieron seis huecos, dos de ellos de firewall.

| # | Cambio | Por qué |
|---|---|---|
| 1 | **El motor no liquida base general sin ingresos informados** | Sin líneas de ingreso, la aplicación no puede distinguir "no tiene renta" de "no la han cargado". Apilar sobre base 0 daba una cuota bajísima **presentada como cálculo**. Ahora: `sin_calculo` + fila parcial |
| 2 | **La cobertura por CCAA se comprueba por persona, no por expediente** | El modelo permite titulares en comunidades distintas, pero el bloqueo miraba la comunidad del cliente. Un titular de Madrid en un expediente valenciano liquidaba con escalas valencianas sin avisar |
| 3 | **Guarda de titular sin renta calculable en ganancias patrimoniales** | Mismo caso que el 1, aplicado a ventas: la parte de un titular sin datos va a `sin_calculo` en lugar de liquidarse sobre base 0 |
| 4 | **Fuente de renta "actividad económica" declarada como no contemplada** | Un autónomo cargado como "trabajo" hacía que el motor restara cotizaciones de asalariado y la base saliera mal en silencio |
| 5 | **El desglose de base liquidable adapta sus etiquetas a la fuente** | En un pensionista, "− Cotizaciones SS: 0 €" parecía un dato que faltaba, no un concepto que no aplica |
| 6 | **P4 admite titulares en estados mixtos** | Con una persona calculable y otra sin datos, la pantalla muestra a cada una en su estado en lugar de bloquear todo o calcular todo |

**Composiciones de expediente soportadas:** un titular · dos titulares · tres o más · titular sin ingresos informados · titular jubilado (pensión) · titular autónomo (declarado, no calculado) · titulares en comunidades distintas · persona menor titular de un activo.

**Principio que se consolida:** toda persona del expediente queda **o calculada o declarada**. Nunca una cuota que parezca resultado cuando en realidad falta el dato.

---

# 1 · Arquitectura

## Navegación

```
FUERA DEL CLIENTE
  P1 · Cartera ............... entrada de la aplicación
     └─ P2 · Alta de cliente (modal)
  P8 · Ajustes
  P9 · Escritorio ............ [V2 entero]

DENTRO DE UN CLIENTE — barra plana de 5 entradas
  Patrimonio · Fiscalidad · Proyección · Escenarios · Historial

  P3 · PATRIMONIO ★ entrada del cliente — 7 pestañas
       Resumen · Personas · Activos · Pasivos · Ingresos · Gastos · Ahorro
       └─ FICHAS (drill-down: se abren pinchando el elemento)
            F1 Persona · F2 Portfolio · F3 Inmueble · F4 Sociedad · F5 Otros

  P4 · FISCALIDAD ★ ...... la foto fiscal (diferencial)
  P5 · PROYECCIÓN ........ series año a año + eventos del plan base
  P6 · ESCENARIOS ★ ...... espacio libre + comparador (diferencial)
  P7 · HISTORIAL ......... informes emitidos
```

## Las tres decisiones que la explican

**1 · Barra plana de cinco entradas, sin grupos.** Wealthabout necesita cuatro grupos y quince entradas porque separa "mirar" (Monitores) de "editar" (Fichas). Aquí se actúa desde donde se mira, así que esa separación no aplica y sobra la mitad de la navegación.

**2 · Las fichas no están en el menú.** Se llega a ellas pinchando el elemento. La riqueza futura de cada ficha (catastro, motor de pensión, depreciación) crece **hacia dentro**, sin tocar el menú.

**3 · Fiscalidad y Proyección en primer nivel.** Las dos cosas que diferencian se ven desde el primer segundo.

## Alta de elementos vs. eventos — dos gestos distintos

Son operaciones diferentes y **nunca comparten botón**:

| | **«+ Añadir»** | **«⚡ Evento»** |
|---|---|---|
| Qué hace | Crea un elemento que **existe hoy** | Describe una **decisión futura** sobre algo que ya existe |
| Ejemplo | Dar de alta el Fondo A que el cliente ya tiene | Reembolsar 35.000 € del Fondo A en 2027 |
| Dónde va | Al patrimonio del cliente | Al plan base o a un escenario |
| Fiscalidad | Ninguna | La calcula el motor (si aplica) |

Sin el alta, la carga por capas no tiene por dónde entrar: el alta de cliente (P2) es deliberadamente mínima, así que **todo lo demás debe poder crearse desde las pestañas de Patrimonio**.

---

# P1 · Cartera

## Overview

**Qué es.** La lista de clientes del asesor y la entrada de la aplicación. Pinchar una fila entra en el Patrimonio de ese cliente.

**Por qué existe así.** Se eligió tabla y no tarjetas porque escala mejor y permite ordenar: un asesor con sesenta clientes necesita barrer, no navegar. Y la barra de composición dentro de la celda de patrimonio convierte una columna de números en información de forma — de un vistazo se ve **de qué tipo** es cada patrimonio, no solo cuánto.

**Qué no es.** No es un escritorio ni un panel de control. No hay KPIs agregados ni gráficos de cartera: eso es P9 y está entero en V2.

## Funcionalidades

| Funcionalidad | Nº | Detalle | Fase |
|---|---|---|---|
| Tabla de clientes | 1 | Listado en tabla, no en tarjetas: escala mejor y permite ordenar | MVP |
| Columna Cliente | 2 | Nombre o alias del expediente, con avatar de iniciales y NIF debajo | MVP |
| Columna Segmento | 3 | Etiqueta del tipo de cliente, en formato pill | MVP |
| Columna Patrimonio | 4 | Patrimonio **neto** consolidado (activos − pasivos) | MVP |
| Barra de composición | 5 | Mini-barra apilada dentro de la celda de Patrimonio: financiero / inmobiliario / empresarial / otros | MVP |
| Columna Escenarios | 6 | Cuántos escenarios tiene abiertos el cliente. Se recalcula al crear, clonar o eliminar | MVP |
| Columna Última revisión | 7 | Fecha del último informe emitido, en formato relativo ("hace 2 meses", "hoy") | MVP |
| Buscador | 8 | Filtra por nombre o NIF, en vivo | MVP |
| Ordenar por columnas | 9 | Clic en la cabecera; segundo clic invierte el orden | MVP |
| Totales al pie | 10 | Nº de clientes + patrimonio total, en `tfoot` | MVP |
| Botón "+ Nuevo cliente" | 11 | Abre el modal de alta (P2) | MVP |
| Entrada al cliente | 12 | Pinchar una fila entra en su Patrimonio | MVP |
| Estado vacío | 13 | Un asesor que entra por primera vez ve una tabla sin filas: debe haber una invitación a dar de alta el primer cliente, no un hueco | MVP |
| Columna Alertas | 14 | Avisos por cliente. Depende del motor de alertas | V2 |
| Columna % líquido | 15 | Qué parte del patrimonio es realizable a corto plazo | V2 |
| Listado en tarjetas | 16 | Alternativa visual a la tabla | Descartado |

## Variables

- **Segmento:** Empresario · Pre-jubilado · Jubilado · Alto ingreso · Herencia en curso
- **Composición del patrimonio:** financiero · inmobiliario · empresarial · otros (fracciones que suman 100 %)
- **Estado de valoración:** valorado · con elementos no valorados
- **Última revisión:** fecha relativa calculada sobre la fecha actual, nunca hardcodeada
- **Orden:** ascendente · descendente, por cualquier columna

## Cómo la usa el asesor

**Flujo 1 · Localizar (el 90 % de las veces).** Sabe a quién busca y quiere entrar. Teclea tres letras en el buscador y pincha. Lo que exige de la pantalla: que el buscador esté a mano y filtre en vivo. Todo lo demás sobra en este flujo.

**Flujo 2 · Barrer la cartera.** Ordena por patrimonio o por última revisión para ver quién lleva tiempo sin tocarse. Es el uso que sustituye al escritorio que no existe: "¿a quién le debo una revisión?". Lo que exige: que "última revisión" sea fiable — y hoy mide cuándo se emitió el último informe, no cuándo se tocaron los datos.

**Flujo 3 · El primer día.** Abre Scenia y no tiene clientes. Es el flujo que menos se prueba y el que decide si el producto arranca.

# P2 · Alta de cliente (modal)

## Overview

**Qué es.** El formulario de alta, de **baja fricción**: pide lo mínimo para que el cliente exista (unos 30 segundos) y el resto se rellena progresivamente desde las pestañas de Patrimonio.

**Por qué es tan corto.** Es la filosofía de carga por capas. Un formulario largo en el alta es la barrera que hace que un asesor no llegue a probar el producto. Todo lo que no sea imprescindible para que el expediente exista se pide después.

**La consecuencia.** El alta mínima crea clientes vacíos, así que **exige que las altas por pestaña funcionen impecablemente**. Si no, el cliente se queda en cáscara y el producto solo funciona con datos de demostración.

## Funcionalidades

| Funcionalidad | Nº | Detalle | Fase |
|---|---|---|---|
| Nombre del expediente | 17 | Campo obligatorio. Ej.: "Familia García-Llorente" | MVP |
| Crear Persona | 18 | Nombre + fecha de nacimiento + CCAA. Al menos una es obligatoria | CORE |
| Añadir varias Personas | 19 | Un expediente puede contener N personas | MVP |
| Selector de Segmento | 20 | Desplegable con los cinco segmentos | MVP |
| **Selector de CCAA por persona** | 21 | Por defecto Comunitat Valenciana. **La comunidad vive en la persona, no en el expediente** | CORE |
| **Aviso de cobertura fiscal** | 22 | Si se elige una CCAA distinta de la Valenciana, aviso visible y **matizado**: la base del ahorro (plusvalías) se calcula en todo el régimen común; la base general (rescate / aportación a plan) solo tiene cargada la escala de la Comunitat Valenciana. País Vasco y Navarra con aviso propio de régimen foral (bloqueo total). **Nunca dejar elegir sin avisar** | CORE |
| Validación de obligatorios | 23 | Nombre del expediente + una Persona con nombre y nacimiento. Error en `--coral-deep`, el único rojo permitido | MVP |
| Creación del plan base | 24 | Al crear el cliente se genera automáticamente su primer escenario ("Situación actual"), vacío | CORE |
| Vincular Persona existente | 25 | Buscador entre Personas ya dadas de alta, para no re-teclear a alguien presente en otro expediente. El modelo ya lo soporta; solo falta exponerlo | V2 |
| Añadir Sociedad desde el alta | 26 | La Sociedad se añade después, desde la pestaña Activos; aquí engordaría el formulario | V2 |
| Cadencia de revisión | 27 | Anual / semestral. Hoy solo alimentaría alertas, que son V2: campo sin consumidor | V2 |
| Importación por plantilla | 28 | Volcar la foto patrimonial de una vez, en lugar de teclearla | V2 |
| Onboarding Cl@ve PIN | 29 | Carga automática desde AEAT · Catastro · Seguridad Social | Futura |

## Variables

- **Segmento:** Empresario · Pre-jubilado · Jubilado · Alto ingreso · Herencia en curso
- **CCAA (por persona):** las 17 comunidades · por defecto Comunitat Valenciana
- **Estado de cobertura fiscal:** cobertura completa (Comunitat Valenciana) · base del ahorro disponible, base general pendiente (resto de régimen común) · sin cobertura por régimen foral (País Vasco, Navarra)
- **Campos obligatorios:** nombre del expediente · al menos una Persona (nombre + fecha de nacimiento)

## Cómo la usa el asesor

**Flujo 1 · Alta rápida antes de una reunión.** Tiene diez minutos y quiere meter al cliente para poder cargar su patrimonio. Nombre, una persona, listo. Lo que exige: que no haya campos que le frenen. Cualquier campo obligatorio de más es fricción en el momento más frágil de la relación con el producto.

**Flujo 2 · Alta de un cliente que no es valenciano.** Elige Madrid y ve el aviso matizado: las plusvalías se calculan; el rescate de planes todavía no. **Este flujo es una decepción y cómo se comunica decide mucho:** o entiende que el producto es honesto sobre su alcance, o concluye que está a medias. La diferencia está en el texto.

# P8 · Ajustes

## Overview

**Qué es.** La configuración del despacho: marca para los informes y gestión de asientos. Mínima a propósito — no es una pantalla de producto, es infraestructura.

## Funcionalidades

| Funcionalidad | Nº | Detalle | Fase |
|---|---|---|---|
| Marca del despacho | 30 | Nombre, datos y logo para los informes PDF | MVP |
| Usuarios y asientos | 31 | Modelo por asiento, con listado de usuarios del workspace | MVP |
| Consulta de parámetros fiscales | 32 | Ver (nunca editar) tramos, tipos y límites por año y comunidad, **con su fuente**. Es lo que hace defendible el motor ante un asesor que responde de sus recomendaciones | V2 |

## Variables

- **Rol de usuario:** titular · colaborador
- **Estado del asiento:** activo · invitado · inactivo

## Cómo la usa el asesor

**Flujo único · configurar una vez.** Sube su logo el primer día y no vuelve. Es correcto que sea así.

**El flujo que falta:** cuando quiera defender una cifra ante un cliente o ante el supervisor, querrá ver de dónde sale. Hoy no puede.

# P9 · Escritorio

## Overview

**Qué es.** El panel de nivel superior del asesor: qué reuniones tiene que preparar, qué ha tocado últimamente, qué alertas hay abiertas.

**Está entero en V2, y a propósito.** Con foto-primero y pocos clientes, un escritorio se ve vacío y hace que el producto parezca menos de lo que es.

## Funcionalidades

| Funcionalidad | Nº | Detalle | Fase |
|---|---|---|---|
| Reuniones por preparar | 33 | Qué clientes tienen revisión pendiente | V2 |
| Actividad reciente | 34 | Últimos escenarios e informes tocados | V2 |
| Motor de alertas | 35 | Cumple 65 · meses sin revisión · escenario sin cerrar · aportaciones ≥10 años · cruce de umbral IP/ISGF · cambio de parámetros fiscales · fin de tipo fijo de hipoteca | V2 |
| Panel de KPIs decorativo | 36 | Contradice la regla de "sin paneles que no lleven a una acción" | Descartado |

## Variables

- **Tipo de alerta:** vital · temporal · fiscal · normativa
- **Prioridad:** alta · media · baja

# P3 · Patrimonio — la entrada del cliente

## Overview

**Qué es.** La foto del patrimonio y el punto desde el que se navega todo lo demás. Siete pestañas: una de resumen y seis de detalle. Las tres primeras son **stock** (lo que hay), las tres últimas **flujo** (lo que entra y sale), y la séptima es un resultado.

**Por qué siete pestañas y no una tabla larga.** Un patrimonio real mezcla cosas que no comparten columnas: la fecha de adquisición importa en un fondo y no en un coche. Agrupar por naturaleza permite que cada grupo tenga sus propios campos sin dejar media tabla vacía.

**Lo que hace distinta a esta pantalla.** Se actúa desde donde se mira: cada línea permite dar de alta, editar, o lanzar una decisión futura, sin salir. En Wealthabout los monitores son de solo lectura y hay que ir a otra sección para tocar nada.

---

## P3.1 · Pestaña Resumen

### Funcionalidades

| Funcionalidad | Nº | Detalle | Fase |
|---|---|---|---|
| Treemap de activos | 37 | Bloques proporcionales por categoría: financiero, inmobiliario, empresarial, otros | MVP |
| Bloque de pasivos | 38 | Representación separada de lo que se debe | MVP |
| Drill-down desde el bloque | 39 | Pinchar lleva a la pestaña o ficha correspondiente | MVP |
| Atajo "+" por categoría | 40 | Da de alta un elemento de ese tipo sin salir de la foto | MVP |
| Tarjeta de capacidad de ahorro | 41 | Superficie oscura destacada; viene calculada de la pestaña Ahorro | MVP |
| Tarjeta de patrimonio neto | 42 | Activos − pasivos, con el desglose de la resta explícito | MVP |
| **Elementos sin valorar** | 43 | Una sociedad sin valorar aparece como "no valorada", **nunca como 0 €**: un cero se lee como cifra | CORE |
| Sello "datos a fecha de" | 44 | Los valores no se actualizan solos en MVP: la fecha lo dice sin ambigüedad | CORE |
| Estado de expediente ligero | 45 | Un cliente que solo puebla la Cartera muestra "foto ligera · sin detalle cargado" con su total agregado, no un treemap a cero | MVP |
| Botón de informe | 46 | Genera el PDF de la foto patrimonial (ver CT3) | MVP |
| Agrupación de bloques minoritarios | 47 | Con quince activos pequeños el treemap se vuelve confeti. Falta decidir el umbral por debajo del cual se agrupan en "otros" | V2 |
| Mapa radial | 48 | Representación alternativa al treemap | V2 |
| TIR por activo | 49 | Rentabilidad interna de cada elemento | V2 |
| Slider temporal | 50 | Ver la foto en un año futuro | V2 |
| Scores de fortaleza financiera | 51 | Índice y gauges de salud patrimonial | V2 |

### Variables

- **Categorías del treemap:** financiero · inmobiliario · empresarial · otros · pasivos
- **Paleta de categorías (de más líquido a menos):** financiero `--blue` · inmobiliario `--ink-3` · empresarial `--slate` · otros `--faintest`. El coral no se usa en categorías (reservado a acción principal).
- **Capacidad de ahorro:** cifra a tinta (sin verde/ámbar de valoración)
- **Estado de valoración:** valorado · no valorado
- **Estado del expediente:** completo · ligero (solo puebla la Cartera)
- **Fecha de los datos:** siempre visible, formato es-ES

### Cómo la usa el asesor

**Flujo 1 · Reconocer al cliente (30 segundos).** Mira el treemap sin leer cifras: busca **proporciones**. Medio financiero y medio ladrillo es una conversación; 90 % inmobiliario es otra muy distinta. Con eso ya sabe de qué va a ir la reunión.

**Flujo 2 · Punto de partida para navegar.** Pincha el bloque que le interesa y entra al detalle. La foto es el índice, no el destino.

**Flujo 3 · Enseñarla en la reunión.** Muchos clientes no han visto nunca su patrimonio entero en una pantalla — está repartido entre banco, gestora, notaría y la carpeta del cajón. Este flujo exige que la pantalla aguante ser proyectada.

## P3.2 · Pestaña Personas

### Overview

**Por qué tiene pestaña propia.** Una Persona no es un activo. Sin esta pestaña no habría forma de llegar a F1 · Persona — que contiene los ingresos del año, el dato que el motor necesita para liquidar la base general.

### Funcionalidades

| Funcionalidad | Nº | Detalle | Fase |
|---|---|---|---|
| Lista de personas | 52 | Nombre · edad · CCAA · ingresos del año · patrimonio atribuido | CORE |
| **Estado de cálculo por persona** | 53 | Cada persona se marca como *con renta calculable* o *sin cálculo*, con el motivo. Es lo que alimenta el selector de P4 y las guardas del motor | CORE |
| Drill-down a la ficha | 54 | Pinchar abre F1 · Persona | CORE |
| Alta de persona | 55 | Botón «+ Añadir»: nombre · fecha de nacimiento · CCAA | CORE |
| Edición y borrado | 56 | Modificar o eliminar. Al borrar, avisa de titularidades e ingresos asociados y los limpia | MVP |
| Patrimonio atribuido | 57 | Suma de lo que le corresponde según los repartos de titularidad | MVP |
| Rol en el expediente | 58 | Titular · cónyuge · hijo. Hoy se suple con el estado de cálculo | V2 |

### Variables

- **Estado de cálculo:** con renta calculable · sin cálculo (sin ingresos informados · CCAA sin cobertura · fuente de renta no contemplada)
- **CCAA por persona:** puede diferir entre personas del mismo expediente
- **Rol (V2):** titular · cónyuge · hijo
- **Ingresos del año:** calculados desde la pestaña Ingresos, no tecleados aquí

### Cómo la usa el asesor

**Flujo 1 · Comprobar quién es quién.** Sobre todo en expedientes con tres o más personas: quién tiene renta, quién es solo titular de un activo, quién vive fuera de la comunidad.

**Flujo 2 · Diagnosticar por qué algo no calcula.** Si P4 le dice que un titular no tiene cálculo, aquí ve el motivo y desde aquí llega al sitio donde arreglarlo.

## P3.3 · Pestaña Activos

### Overview

**Qué es.** El inventario de lo que el cliente tiene, agrupado internamente por tipo con columnas propias por grupo.

**Por qué agrupado y no una tabla plana.** Una tabla única obligaría a mostrar columnas vacías para media tabla: la fecha de adquisición importa en un fondo, no en un coche. La agrupación recupera la centralización por tipo sin añadir entradas de menú.

**Es la pestaña que sostiene el diferencial.** La fecha de adquisición y el reparto de titularidad **por instrumento** son exactamente lo que permite calcular una plusvalía y liquidar a cada titular en su escala.

### Funcionalidades

| Funcionalidad | Nº | Detalle | Fase |
|---|---|---|---|
| Grupo Portfolio financiero | 59 | Columnas: instrumento · tipo fiscal · valor · **fecha de adquisición** · plusvalía latente · titularidad | CORE |
| Grupo Inmuebles | 60 | Columnas: nombre · **uso** · valor · fecha de adquisición · hipoteca asociada · titularidad | CORE |
| Grupo Inversiones empresariales | 61 | La participación en una Sociedad es un activo. Columnas: sociedad · % participación · valor | MVP |
| Grupo Otros activos | 62 | Columnas: nombre · tipo · valor · titularidad. Captación 100 % manual, también en V2 | MVP |
| Alta de activo por grupo | 63 | Botón «+ Añadir» con los campos propios del tipo. Nunca comparte botón con «⚡ Evento» | CORE |
| Edición y borrado | 64 | Modificar o eliminar cualquier línea. Al borrar, avisa de los eventos que la referencian y los elimina | MVP |
| Lanzar evento desde la línea | 65 | Cada línea abre la plantilla de evento (CT1). **Diferencia con WA**, donde los monitores son de solo lectura | CORE |
| Drill-down a la ficha | 66 | Pinchar el nombre abre F2 / F3 / F4 / F5 | MVP |
| Plusvalía latente calculada | 67 | Valor − coste de adquisición. No se teclea: se deriva. Único uso permitido del verde | CORE |
| Semáforo de liquidez | 68 | Alta / media / baja, **derivado del tipo de activo**, no introducido. Hecho objetivo, compatible con el firewall | MVP |
| Barra de titularidad | 69 | Representación visual del reparto por porcentajes | MVP |
| Subtotal por grupo y total general | 70 | En `tfoot` | MVP |
| Importación por pegado | 71 | Volcar una cartera desde una hoja de cálculo. **Sin esto, cargar un patrimonio real son dos horas de tecleo** | V2 |
| Gauges y donuts de titulares | 72 | Capa visual rica de Wealthabout | V2 |
| Selector de agrupación | 73 | Reagrupar por titular, categoría o recurso | V2 |

### Variables

- **Tipo fiscal (portfolio):** fondo traspasable · plan de pensiones · acciones · otro
- **Uso del inmueble:** vivienda habitual · segunda residencia · en alquiler · local
- **Tipo de otros activos:** vehículo · obra de arte · joyería · embarcación · otro
- **Liquidez (derivada):** alta (portfolio líquido) · media (otros activos) · baja (plan de pensiones, inmuebles, participaciones)
- **Titularidad:** reparto en % entre las Personas del expediente · debe sumar 100 %
- **Campos especiales:** `fraccionPre2007` y año de contingencia (planes) · `uso` (inmuebles)

### Cómo la usa el asesor

**Flujo 1 · Cargar el patrimonio (el primer día, y es el más duro).** Da de alta cada elemento a mano. Un patrimonio tipo son unos 65-70 campos. Este flujo decide si el producto se usa una segunda vez.

**Flujo 2 · Buscar el dato que decide.** Antes de proponer nada, mira la plusvalía latente y la titularidad: son los dos números que determinan cuánto cuesta mover dinero y a nombre de quién conviene hacerlo.

**Flujo 3 · Lanzar una decisión.** Desde la línea del activo, sin salir de la tabla. Es lo que hace que la pantalla no sea un informe.

## P3.4 · Pestaña Pasivos

### Funcionalidades

| Funcionalidad | Nº | Detalle | Fase |
|---|---|---|---|
| Listado de hipotecas | 74 | Prestamista · capital pendiente · tipo · cuota · inmueble asociado · titularidad | MVP |
| Listado de créditos personales | 75 | Mismos campos, sin inmueble asociado | MVP |
| Alta de pasivo | 76 | Botón «+ Añadir» con sus campos | MVP |
| Edición y borrado | 77 | Modificar o eliminar cualquier línea | MVP |
| Lanzar evento desde la línea | 78 | Amortizar, cancelar | MVP |
| **Separación interés / capital** | 79 | La cuota nunca va entera a un sitio: los intereses son gasto, la amortización es ahorro. **Nivel 1**: aproximación anual, orientativa | MVP |
| Total de pasivos | 80 | En `tfoot`, alimenta el patrimonio neto | MVP |
| Modalidad del tipo de interés | 81 | Fijo · variable · mixto. Cambia por completo la conversación de amortizar-vs-invertir | V2 |
| Campo "fin de tipo fijo" | 82 | Para el nivel 2 de amortización y su alerta | V2 |
| Tabla de amortización francesa | 83 | Nivel 2: cálculo mes a mes. Requiere el plazo del préstamo | V2 |

### Variables

- **Tipo de pasivo:** hipoteca · crédito personal
- **Modalidad de interés (V2):** fijo · variable · mixto *(hoy solo se guarda el porcentaje)*
- **Inmueble asociado:** cualquiera del expediente · ninguno

### Cómo la usa el asesor

**Flujo único · contexto para la capacidad de ahorro.** Los pasivos casi nunca se consultan por sí mismos: importan porque restan del patrimonio neto y porque sus intereses son gasto. El asesor entra aquí cuando va a plantear una amortización.

## P3.5 · Pestaña Ingresos

### Overview

**Por qué es la pestaña más crítica del producto y no lo parece.** El total por persona es el input del liquidador de base general. Si los ingresos están mal, **la cifra fiscal que Scenia enseña está mal** — y esa cifra es todo el diferencial.

### Funcionalidades

| Funcionalidad | Nº | Detalle | Fase |
|---|---|---|---|
| Desglose por Persona y fuente | 84 | Trabajo · alquiler · dividendo · pensión · actividad económica · otros | CORE |
| Alta de línea de ingreso | 85 | Botón «+ Añadir»: persona · fuente · importe anual | CORE |
| **Cotizaciones a la Seguridad Social** | 86 | Campo del asesor. **No se estiman**: si no se informan, no se restan, y la base sale más alta | CORE |
| **Etiquetas según la fuente** | 87 | El desglose de base liquidable adapta sus conceptos: un pensionista no tiene cotizaciones de trabajador, así que no se muestra "− Cotizaciones SS: 0 €" como si faltara el dato | MVP |
| **Fuente "actividad económica" declarada** | 88 | Los autónomos llegan a la base de otra forma (RETA, gastos propios) que el motor **no modela**. La fuente existe y devuelve `sin_calculo` con su aviso, para que nadie cargue a un autónomo como "trabajo" | CORE |
| Edición y borrado | 89 | Modificar o eliminar cualquier línea | MVP |
| Total por persona | 90 | El input que consume el motor | CORE |
| Total general | 91 | En `tfoot` | MVP |
| Evento genérico desde la pestaña | 92 | Cambios de flujo futuros. Sin cálculo fiscal | MVP |
| Validación de coherencia | 93 | Aviso suave ante valores atípicos (950.000 € tecleados en vez de 95.000 €) | V2 |
| Periodicidad distinta de anual | 94 | Un ingreso que empieza a mitad de año o dura tres años se modela mal hoy | V2 |
| Rendimientos de actividades económicas calculados | 95 | Requiere modelar RETA y gastos deducibles propios | V2 |

### Variables

- **Fuente de ingreso:** trabajo · alquiler · dividendo · pensión · **actividad económica (declarada, no calculada)** · otros
- **Periodicidad:** anual *(única soportada)*
- **Cotizaciones:** informadas · no informadas *(nunca estimadas)*

### Cómo la usa el asesor

**Flujo 1 · Cargar los ingresos.** Rutinario, pero es de lo que depende todo lo demás.

**Flujo 2 · Actualizar tras un cambio.** Una subida de sueldo, una jubilación, un alquiler nuevo. Aquí es donde el producto se mantiene vivo entre revisiones.

## P3.6 · Pestaña Gastos

### Funcionalidades

| Funcionalidad | Nº | Detalle | Fase |
|---|---|---|---|
| Categorías de gasto recurrente | 96 | Listado por concepto, con importe anual | MVP |
| Alta de línea de gasto | 97 | Botón «+ Añadir»: categoría · importe anual · vincular a | MVP |
| Edición y borrado | 98 | Modificar o eliminar cualquier línea | MVP |
| **Campo "Vincular a"** | 99 | Persona · inmueble · sociedad · sin vincular. Permite ver el coste real de un activo sin repartir el gasto por siete fichas como hace WA | MVP |
| Solo intereses como gasto | 100 | La amortización de capital no es gasto: es ahorro | MVP |
| Total de gastos | 101 | En `tfoot`, alimenta la capacidad de ahorro | MVP |
| Evento genérico desde la pestaña | 102 | "A partir de 2030 baja el gasto familiar" | MVP |
| Coste agregado por activo | 103 | La vuelta del "Vincular a": ver en la ficha del inmueble lo que cuesta al año | V2 |

### Variables

- **Categoría:** libre, con sugerencias (intereses de deuda · suministros · familia · seguros · vehículo · otros)
- **Vincular a:** persona · inmueble · sociedad · sin vincular
- **Periodicidad:** anual

### Cómo la usa el asesor

**Flujo único · estimar.** Los gastos son la parte del patrimonio que peor conoce cualquier cliente. El asesor va a recibir una estimación, no un dato — y toda la proyección cuelga de ahí.

## P3.7 · Pestaña Ahorro

### Funcionalidades

| Funcionalidad | Nº | Detalle | Fase |
|---|---|---|---|
| Capacidad de ahorro | 104 | Ingresos − gastos + amortización de capital. **Los ingresos suman todas las líneas de ingreso de todas las personas del expediente, con independencia de la cobertura fiscal de cada titular** — el expediente es una unidad económica; filtrar por CCAA mezclaría capacidad de ahorro con liquidación IRPF | MVP |
| Desglose del cálculo | 105 | Las tres líneas visibles, para que la cifra sea auditable | MVP |
| Tasa de ahorro | 106 | Capacidad sobre ingresos, en % | MVP |
| Solo lectura | 107 | Es un resultado calculado. **No admite altas ni eventos** | MVP |
| Revalorización de activos | 108 | Requiere histórico de valoración que el modelo no guarda | V2 |

### Variables

- **Componentes:** ingresos · gastos · amortización de capital
- **Naturaleza:** calculado, nunca editable

# Fichas (drill-down — no están en el menú)

> Se abren pinchando el elemento en el treemap o en las pestañas. **Toda la riqueza futura crece aquí dentro sin tocar la navegación.**

---

## F1 · Persona

### Overview

**Qué es.** El detalle de una persona del expediente: quién es, qué gana, qué parte del patrimonio le corresponde y cuándo se jubila.

**Por qué importa al motor.** Contiene los ingresos del año, que es el input de la base general, y la CCAA, que determina su cobertura fiscal. Es la ficha de la que más depende el cálculo.

### Funcionalidades

| Funcionalidad | Nº | Detalle | Fase |
|---|---|---|---|
| Datos básicos | 109 | Nombre · fecha de nacimiento · edad calculada | CORE |
| **CCAA por persona, con efecto real** | 110 | La comunidad vive en la persona, no en el expediente. **La cobertura se comprueba al liquidar a cada uno** | CORE |
| Ingresos del año | 111 | Calculado desde la pestaña Ingresos. Input del motor para la base general | CORE |
| **Estado de cálculo** | 112 | Con renta calculable · sin cálculo, con su motivo | CORE |
| Jubilación prevista | 113 | Año/edad estimados, introducidos por el asesor y marcados como tales | MVP |
| Patrimonio atribuido | 114 | Desglose de qué parte de cada activo le corresponde según titularidad | MVP |
| Identidad única entre expedientes | 115 | La misma Persona puede estar en varios Clientes | MVP (modelo) |
| Lanzar evento desde la ficha | 116 | Jubilarse, evento genérico | MVP |
| Motor de pensión público | 117 | Base reguladora · tasa de reemplazo · años cotizados · slider de edad que recalcula | V2 |
| Calendario vital | 118 | Matriz de hitos por décadas | V2 |
| Vida laboral | 119 | Empresas, regímenes y días cotizados. Requiere captación automática | Futura |
| Relaciones mercantiles | 120 | En qué sociedades tiene cargo. Requiere captación automática | Futura |

### Variables

- **Edad:** calculada desde la fecha de nacimiento, nunca tecleada
- **Estado de cálculo:** con renta calculable · sin ingresos informados · CCAA sin cobertura · fuente no contemplada
- **Jubilación:** año o edad · siempre marcada como estimación del asesor
- **Perfil de renta:** trabajo · pensión · mixto · otras

### Cómo la usa el asesor

**Flujo 1 · Comprobar los ingresos que usa el motor.** Es el flujo de auditoría: si la base no le cuadra, viene aquí a ver de dónde sale.

**Flujo 2 · Anotar la jubilación.** El evento más consecuente del producto: cambia la base general de los años siguientes y con ella el coste de cualquier rescate.

## F2 · Portfolio

### Overview

**Es la pieza CORE del producto.** Si esta ficha está bien, el motor tiene de dónde calcular; si no, nada más importa. El modelo por instrumento con fecha de adquisición y reparto de titularidad propio es exactamente lo que Wealthabout no tiene.

### Funcionalidades

| Funcionalidad | Nº | Detalle | Fase |
|---|---|---|---|
| **Modelo por instrumento** | 121 | Cada fondo con valor + **fecha de adquisición** + tipo fiscal. Sin esto no hay traspaso ni plusvalía calculable | CORE |
| Coste de adquisición | 122 | Base de la plusvalía y de lo que hereda el destino en un traspaso | CORE |
| **Reparto de titularidad por instrumento** | 123 | Ej.: Fondo A · Carlos 60 % / Marta 40 %. Permite liquidar a cada uno en su escala. **WA reparte % en inmuebles y empresas, pero no por fondo** | CORE |
| **Fracción de aportaciones pre-2007** | 124 | Campo del plan de pensiones, introducido y marcado como tal. Sin este dato el motor **no aplica** la reducción del 40 % (DT 12ª) y lo declara | CORE |
| **Año de contingencia** | 125 | Necesario para el control de plazos de la DT 12ª: en 2026 la reducción solo aplica a contingencias de 2024–2026 | CORE |
| Plusvalía latente | 126 | Valor − coste. Único uso permitido del verde: es un hecho objetivo | MVP |
| Semáforo de liquidez | 127 | Derivado del tipo de instrumento | MVP |
| Menú de eventos | 128 | Reembolsar · traspasar · pignorar · aportar | CORE |
| Familia de riesgo | 129 | Renta fija · mixta · variable · monetario · alternativos | V2 |
| Entidad depositaria | 130 | Con vista agrupada por banco | V2 |
| Lotes de adquisición (FIFO real) | 131 | Partidas con fecha, importe y coste, para calcular la ganancia por orden de compra como impone el art. 37.2 | V2 |
| Precio por ISIN actualizado | 132 | Quefondos (gratis) o Morningstar. Barato, sin consentimiento, y actualiza lo más volátil de la foto | Futura |

### Variables

- **Tipo fiscal:** fondo traspasable · plan de pensiones · acciones · otro
- **Titularidad:** % por Persona, suma 100 %
- **Plusvalía:** positiva (verde) · negativa (tinta neutra, nunca roja)
- **Campos del plan:** `fraccionPre2007` · año de contingencia

### Cómo la usa el asesor

**Flujo 1 · Ver cuánto cuesta tocar este instrumento.** La plusvalía latente y el reparto le dicen, sin calcular nada, si sacar dinero de aquí es caro o barato y a quién le toca pagarlo.

**Flujo 2 · Lanzar la decisión.** Reembolsar, traspasar o pignorar, desde la propia ficha.

## F3 · Inmueble

### Funcionalidades

| Funcionalidad | Nº | Detalle | Fase |
|---|---|---|---|
| Valor y fecha de adquisición | 133 | Necesario para la venta >65 y para amortizar-vs-invertir | CORE |
| Coste de adquisición | 134 | Base de la plusvalía latente | CORE |
| **Campo `uso`** | 135 | Vivienda habitual · segunda residencia · en alquiler · local. **La exención del art. 33.4.b) depende de esta condición** | CORE |
| Reparto de titularidad | 136 | Ej.: 50/50 entre cónyuges. **La exención se evalúa por titular, no por inmueble** | CORE |
| Plusvalía latente | 137 | Valor actual − coste | MVP |
| Hipoteca asociada | 138 | Capital pendiente · tipo · cuota, traída del pasivo vinculado | MVP |
| Menú de eventos | 139 | Comprar · vender · amortizar | MVP |
| Estructura de gastos del inmueble | 140 | IBI, comunidad, suministros, seguro — agregados vía "Vincular a" | V2 |
| Renta potencial | 141 | Ingreso teórico por alquiler y rentabilidad neta | V2 |
| Información catastral | 142 | Referencia, superficie, valor catastral. Requiere integración con Catastro | Futura |
| Valoración de mercado | 143 | Referencia de idealista o Tinsa | Futura |
| Documentos adjuntos | 144 | Bóveda documental por elemento | Futura |

### Variables

- **Uso:** vivienda habitual · segunda residencia · en alquiler · local
- **Estado hipotecario:** con hipoteca · libre de cargas
- **Titularidad:** % por Persona

### Cómo la usa el asesor

**Flujo 1 · La conversación de cuándo vender.** Con el `uso` y las edades de los titulares, el producto puede decir que vender en 2033 cuesta 13.255 € y en 2036 cero. **Es el mejor argumento del producto**, y no necesita saber fiscalidad para entenderse.

**Flujo 2 · Amortizar o no.** La hipoteca asociada y su tipo son el punto de partida.

## F4 · Sociedad

### Funcionalidades

| Funcionalidad | Nº | Detalle | Fase |
|---|---|---|---|
| Datos mercantiles | 145 | NIF · capital social · fecha de constitución · situación · objeto social | MVP |
| Tabla de participación | 146 | Por Persona, con % | MVP |
| Activos de la sociedad | 147 | Portfolio e inmuebles que cuelgan de la persona jurídica | MVP |
| Menú de eventos | 148 | Repartir dividendo · vender participación | MVP |
| **Hueco fiscal marcado** | 149 | **Sin reglas diseñadas.** Los eventos se registran, pero no hay cálculo societario: el hueco se marca como "pendiente de definir". **No inventar cifras** | CORE |
| Estado "no valorada" | 150 | Una sociedad sin valorar nunca aparece como 0 € | CORE |
| Liquidador de Impuesto de Sociedades | 151 | Prerrequisito para que esta ficha calcule | V2 |
| Resumen contable | 152 | Variante "PATRIMONIAL" de Wealthabout | V2 |
| Plan de negocio | 153 | Proyección de la actividad de la sociedad | V2 |

### Variables

- **Situación mercantil:** activa · inactiva · en liquidación · concurso
- **Participación:** % por Persona
- **Estado de valoración:** valorada · no valorada
- **Estado fiscal:** siempre "pendiente de definir" en MVP

### Cómo la usa el asesor

**Flujo único · registrar, no resolver.** Anota la sociedad para que aparezca en la foto y para que sus eventos queden constancia. Pero la pregunta que le trae —"¿le conviene sacar el dinero como dividendo, como sueldo, o dejarlo dentro?"— no se responde aquí.

## F5 · Otros activos

### Funcionalidades

| Funcionalidad | Nº | Detalle | Fase |
|---|---|---|---|
| Datos mínimos | 154 | Nombre · tipo · valor · fecha de adquisición · titularidad | MVP |
| Evento de venta genérico | 155 | Vender el coche genera ganancia patrimonial en IRPF, pero no está entre las reglas del motor → va por el genérico, con su marca "sin cálculo fiscal" | MVP |
| Curva de depreciación | 156 | El valor decae con el tiempo. Sin esto, la proyección tiene un sesgo alcista conocido | V2 |
| Estructura de gastos | 157 | Seguro, mantenimiento, combustible — vía "Vincular a" | V2 |

### Variables

- **Tipo:** vehículo · obra de arte · joyería · embarcación · otro
- **Plusvalía:** puede ser negativa (depreciación)

# P4 · Fiscalidad ★

## Overview

**Qué es.** La foto fiscal de diagnóstico de un cliente: *¿cómo está fiscalmente ahora mismo?* Es una pantalla de **diagnóstico**, no de simulación — no compara caminos ni proyecta el futuro. Responde a "dónde estás" para que Escenarios responda a "a dónde puedes ir".

**Por qué existe.** Es la primera cara del diferencial. Un asesor sin herramienta hace este cálculo de cabeza y mal: sabe que su cliente "paga mucho", pero no sabe cuánto margen le queda antes de saltar de tramo. Esa cifra es la que decide a nombre de quién conviene hacer las cosas.

**Qué muestra.** La base liquidable de cada persona (no el sueldo bruto), la cuota del ejercicio calculada por el motor, y el visor de tramos con las dos escalas separadas, marcando en cuál cae y cuánto espacio queda.

**Qué NO muestra.** Nada acumulado ni proyectado. Los KPIs de por vida, el tipo efectivo del periodo y la serie año a año se retiraron: necesitan acumulación multi-año. Antes existían como cifras inventadas; ahora no existen.

**Alcance.** Solo el plan base, solo IRPF, y la base general solo para la Comunitat Valenciana. La base del ahorro sí vale para toda España de régimen común. Los forales quedan fuera por completo.

## Funcionalidades

| Funcionalidad | Nº | Detalle | Fase |
|---|---|---|---|
| Cuota del ejercicio | 158 | Liquidación del año seleccionado: escala estatal + autonómica sobre la base liquidable. Es la cifra central | CORE |
| Base liquidable explícita | 159 | La base real, no el bruto. Con su desglose adaptado a la fuente de renta | CORE |
| **Visor de tramos** | 160 | Escala estatal y autonómica, **cada una por separado**, con marca de en qué tramo cae la renta | CORE |
| **Zona activa desplegada** | 161 | Los tramos superados y los lejanos se pliegan; el actual se muestra abierto con la posición exacta. Se pueden desplegar todos con un clic | CORE |
| **Espacio hasta el siguiente tramo** | 162 | Cuánto margen queda antes de saltar de tipo marginal, en cada escala | CORE |
| **Frase de lectura** | 163 | Traduce el margen a la conversación real: *"una renta adicional tributa al 49 % hasta agotar 11.050 €; a partir de ahí, al 50 %"*. Calculada, no escrita | CORE |
| **Base general y base del ahorro separadas** | 164 | Dos escalas distintas con reglas propias; mezclarlas sería un error de fondo | CORE |
| Hueco de la base del ahorro | 165 | Sin rentas del ahorro modeladas, hueco explícito en lugar de un 0 € que se leería como resultado | CORE |
| **Titulares en estados mixtos** | 166 | Con una persona calculable y otra sin datos, muestra **a cada una en su estado**: ni bloquea todo ni calcula todo | CORE |
| **Estado "sin ingresos informados"** | 167 | Un titular sin líneas de ingreso no tiene cuota 0 €: tiene un hueco con su motivo y un enlace a Ingresos | CORE |
| **Selector con no calculables marcados** | 168 | Las personas sin cálculo aparecen en el selector con etiqueta neutra "sin cálculo", no se ocultan: el selector deja de mentir sin dejar de ser auditable | CORE |
| Expediente de un solo titular | 169 | El selector se reduce o desaparece; la pantalla no deja huecos de una comparación que no existe | MVP |
| Selector de año | 170 | Ver la foto fiscal de un ejercicio concreto del horizonte | MVP |
| Parámetros no editables | 171 | Tramos y tipos viven en la tabla verificada, con candado visible. **Es firewall** | CORE |
| Sello "orientativo" | 172 | Acompaña a toda cifra fiscal, sin excepción | CORE |
| Marca "(a verificar)" | 173 | Cada parámetro no confirmado por el fiscalista va marcado | CORE |
| Aviso de cobertura por CCAA | 174 | **Se evalúa antes que cualquier otro estado**, incluido el de expediente ligero. Texto matizado: plusvalías OK en régimen común; base general solo CV; forales fuera | CORE |
| Aviso de simplificación del mínimo autonómico | 175 | El motor usa el mínimo estatal en ambas mitades y lo declara | MVP |
| Aviso de cálculo individual | 176 | La tributación conjunta no está contemplada y se dice | MVP |
| Vista comparada de titulares | 177 | Ver dos o más personas en paralelo. **Capa opcional cuando hay dos o más calculables**, nunca el fundamento de la pantalla | V2 |
| Puente hacia Escenarios | 178 | Desde el margen detectado, lanzar un escenario que lo aproveche | V2 |
| Tributación conjunta vs individual | 179 | Un matrimonio puede declarar de las dos formas y la diferencia puede ser relevante | V2 |
| Rentas del ahorro en el modelo | 180 | Dividendos, cupones y alquileres recurrentes | V2 |
| Deducciones autonómicas | 181 | Existen y son numerosas; hoy no se aplica ninguna | V2 |
| Cuota diferencial (retenciones) | 182 | Lo que sale a pagar o devolver, tras descontar lo retenido | V2 |
| KPIs de por vida (IRPF total + ETR) | 183 | Requieren acumulación de periodo | V2 |
| Serie de IRPF año a año | 184 | Requiere acumulación de periodo | V2 |
| Toggle € hoy / € futuro | 185 | Sin serie temporal no tiene consumidor aquí | V2 |
| Botón de informe desde Fiscalidad | 186 | Hoy solo desde Patrimonio y el comparador | V2 |
| Foto fiscal de un escenario | 187 | Hoy muestra únicamente el plan base | V2 |
| Explorador de estrategias | 188 | Ordena por la métrica que el asesor declara; **nunca corona un ganador** | V2 |
| Mínimo autonómico propio | 189 | Sustituir la simplificación actual por los importes reales | V2 |
| Mínimos familiares | 190 | Por descendientes, ascendientes y discapacidad | V2 |
| Más comunidades autónomas | 191 | Cada una con su escala, mínimos y deducciones. Multiplica el mantenimiento anual, no solo el trabajo inicial | V2 |
| Alerta de cruce de umbral IP/ISGF | 192 | Requiere un motor distinto | V2 |
| Regímenes forales | 193 | No es "una comunidad más": es normativa completamente distinta | Futura |
| Régimen de impatriados | 194 | Tributación especial para desplazados a España | Futura |
| Comparativa entre comunidades | 195 | Qué pagaría el mismo cliente en otra comunidad. **Ver nota de firewall en la crítica** | Futura |

## Variables

- **Base:** general · del ahorro *(nunca mezcladas)*
- **Ámbito de la escala:** estatal · autonómico *(solo Comunitat Valenciana cargada)*
- **Persona:** cualquiera del expediente, con su estado de cálculo
- **Año:** ejercicio seleccionable del horizonte
- **Estado del parámetro:** verificado · **(a verificar)** *(hoy: todos a verificar)*
- **Estado de cobertura:** cobertura completa (CV) · base del ahorro disponible / base general pendiente (resto régimen común) · sin cobertura por régimen foral
- **Estado del titular:** calculable · sin ingresos informados · fuente no contemplada · CCAA sin cobertura
- **Modalidad de declaración:** individual *(la conjunta no está contemplada)*
- **Componentes de la base liquidable:** bruto − cotizaciones − gastos art. 19.2.f) − reducción art. 20

## Cómo la usa el asesor

**Flujo 1 · El reconocimiento previo (el más frecuente).** Minutos antes de una reunión. Mira la cuota, cambia de una persona a otra, y sale. Treinta segundos. Se lleva: *"Carlos está caro y sin margen; Marta está barata pero con poco recorrido."* Exige que se entienda de un vistazo y que cambiar de persona sea inmediato.

**Flujo 2 · La pregunta de a nombre de quién (el de más valor).** Va a mover dinero y necesita saber **cuánto cabe antes de que se encarezca**. Se lleva: *"A Marta le caben 4.080 € antes de subir de tramo; a Carlos no le cabe nada barato."* De ahí sale una estrategia concreta. **Dónde se queda corto:** hoy tiene que comparar a las dos personas de memoria, alternando el selector.

**Flujo 3 · La comprobación de credibilidad (la que decide si te creen).** La primera vez que abre la pantalla con un cliente que conoce bien, **no está usando el producto: lo está auditando**. Compara la base liquidable con lo que sabe. Si cuadra, sigue; si no, deja de mirar todo lo demás. Por eso importa que diga 88.950 € y no 95.000, y que se explique de dónde sale.

**Flujo 4 · El cliente que no cubrimos.** Abre un cliente de otra comunidad y encuentra un aviso en lugar de cifras. Exige que el aviso sea **claro y sin culpa**: la diferencia entre *"todavía no llegamos a Madrid"* y *"esto no funciona"*.

**El flujo que la pantalla abre y no cierra.** En los cuatro casos, el asesor saca una conclusión y **tiene que irse a otro sitio a actuar sobre ella**. Ve que a Marta le quedan 4.080 € y lo natural sería preguntar "¿y qué le meto ahí?". Hoy navega a Escenarios a mano.

# P5 · Proyección

## Overview

**Qué es.** Las series año a año del plan base, y **el hogar de los eventos**: aquí se ve reflejado todo lo que se anota desde las fichas. Responde a *"he anotado que el coche se vende en 2027, ¿dónde lo veo?"*.

**Por qué es del plan base y no de un escenario.** La proyección muestra la vida tal como va. Las alternativas viven en Escenarios y se comparan allí.

## Funcionalidades

| Funcionalidad | Nº | Detalle | Fase |
|---|---|---|---|
| Proyección determinista año a año | 196 | El esqueleto temporal del que cuelga todo | CORE |
| Selector de serie | 197 | Patrimonio · flujos · ahorro · líquidos | MVP |
| Gráfico con área | 198 | Una sola serie visible cada vez, para no saturar | MVP |
| Clic-en-año | 199 | Fija un ejercicio y recalcula el panel lateral | MVP |
| **Panel de eventos del año fijado** | 200 | El lateral muestra los eventos de ese ejercicio. Sin esto, los eventos anotados no tendrían dónde consultarse | MVP |
| Eliminar evento desde el panel | 201 | Borrado directo, con refresco de la proyección | MVP |
| Editar evento desde el panel | 202 | Abre CT1 con los campos precargados y actualiza al guardar | MVP |
| Hitos sobre el eje temporal | 203 | Marcas visuales donde hay eventos | MVP |
| Toggle € hoy / € futuro | 204 | Deflacta la serie o muestra nominales. **No afecta a la cuota fiscal del primer ejercicio**, y se dice | MVP |
| Distinción calculado / introducido | 205 | Los eventos con cifra del motor y los tecleados se ven distinto. **Es firewall** | CORE |
| Supuestos explícitos | 206 | Rentabilidad e inflación visibles y atribuibles al asesor, no un defecto silencioso del sistema | MVP |
| Serie de IRPF proyectado | 207 | Requiere acumulación de periodo | V2 |
| Sliders de supuestos en vivo | 208 | Cambiar rentabilidad o inflación y ver el efecto al momento | V2 |
| Drill-down de métricas | 209 | Descomponer una serie en sus componentes | V2 |
| Tasa de retirada | 210 | Qué % del patrimonio se consume al año | V2 |
| Alerta de cruce de umbral IP/ISGF | 211 | Aviso cuando el patrimonio cruza el mínimo exento | V2 |
| Monte Carlo | 212 | Banda p10/p90. Cuando entre, muestra inputs, no emite veredicto | Futura |

## Variables

- **Serie:** patrimonio · flujos · ahorro · activos líquidos
- **Horizonte:** 2026 → 2060
- **Moneda:** € de hoy (deflactado) · € futuros
- **Origen del evento:** calculado por el motor · introducido por el asesor
- **Supuestos:** rentabilidad esperada (%) · inflación (%)

## Cómo la usa el asesor

**Flujo 1 · ¿Esto acaba bien?** La pregunta que no formula el cliente. Mira la línea del patrimonio y comprueba si el plan aguanta cuando dejen de cobrar sueldo.

**Flujo 2 · ¿Dónde está lo que anoté?** Fija el año y ve los eventos de ese ejercicio. Es el flujo que motivó la pantalla.

**Flujo 3 · Registrar un hecho de la vida.** El cliente vende el coche. No es una decisión que comparar, es algo que pasa: va al plan base y se refleja aquí, sin montar escenario.

# P6 · Escenarios y comparador ★

## Overview

**Qué es.** El espacio de trabajo libre. **Sin pasos guiados** — se entra, se sale, se deja a medias y se vuelve.

**Las dos decisiones de fondo:**

**1 · El escenario es del CLIENTE, no del activo.** Se clona el plan base y dentro se añaden eventos de **cualquier** activo. Esto permite montar decisiones de vida que cruzan varias cosas ("jubilarse en 2033 + vender el coche + amortizar hipoteca"), imposible cuando la decisión estaba encerrada en un activo. Fue el arreglo más importante de todo el rediseño.

**2 · El plan base es el primer escenario.** No es un caso especial: aparece en la lista como uno más ("Situación actual"), es comparable y editable. Así el comparador enfrenta "seguir como está" contra cualquier alternativa sin lógica aparte.

## Funcionalidades

| Funcionalidad | Nº | Detalle | Fase |
|---|---|---|---|
| Lista de escenarios del cliente | 213 | El plan base es el primero de la lista | CORE |
| Clonar un escenario | 214 | Punto de partida de cualquier alternativa. **Hereda los eventos del origen**. Duplicar cualquier escenario (no solo el plan base) pide el nombre en el mismo gesto | CORE |
| Escenarios con nombre | 215 | "A · Reembolso", "C · Venta en 2033". El nombre llega a todas partes, incluida la fila fiscal | CORE |
| Renombrar y eliminar | 216 | Gestión básica del ciclo de vida | MVP |
| **Menú de eventos completo** | 217 | Dentro de un escenario se puede añadir un evento de **cualquier** activo. Es el cambio clave de la arquitectura. Recuerda el último elemento usado | CORE |
| Lanzar evento desde una ficha | 218 | Atajo contextual: se elige a qué escenario va | MVP |
| Supuestos por escenario | 219 | Rentabilidad esperada e inflación, declarados por el asesor | MVP |
| Selección de escenarios a comparar | 220 | Checkbox por escenario; **máximo tres a la vez, incluido el plan base** (siempre marcado como referencia) | CORE |
| Gráfico superpuesto | 221 | Un gráfico con las curvas de todos los seleccionados. Hitos sobre el eje (jubilaciones, ventas, agotamiento). Lectura hasta 2050 | CORE |
| Selector de métrica | 222 | Líquidos (por defecto) · Impuesto acumulado · Patrimonio. El impuesto acumulado es línea escalonada: un escalón por cada año activo del evento, repitiendo la cuota del primer ejercicio (simplificación declarada · no marca parcial). Toggle € hoy / € futuro junto al selector | CORE |
| **Fila fiscal neutra (CT2)** | 223 | En P6 se renderiza como **columna de la tabla de hechos** (`variant="celda"`), no como tira suelta. Misma etiqueta `Impacto fiscal · primer año · orientativo`, mismo firewall (ignora className, sin props de tono). Pie `variant="nota"` con Δ, parcial y avisos. **La pieza central del producto** | CORE |
| Eventos en paralelo | 224 | Cumplido en sustancia: los eventos aparecen como chips dentro de la celda «Camino» de la tabla de hechos (fila a fila). Distinción calculado / introducido en el chip (sólido / borde discontinuo). Editar y borrar siguen en la vista de detalle | MVP |
| Clic-en-año | 225 | Fija el ejercicio de la columna «Líquidos en AAAA» de la tabla. Por defecto: primer año con hecho relevante en los caminos marcados | MVP |
| Toggle € hoy / € futuro | 226 | Junto al selector de métrica. Afecta al gráfico y a la columna de líquidos; **no** a la cuota del primer ejercicio | MVP |
| Etiqueta de régimen (IRPF / IS) | 227 | Si un escenario mezcla titulares Persona y Sociedad | MVP |
| Botón de informe | 228 | Genera el PDF con la comparación. Nota del asesor obligatoria (mín. 20 caracteres) inline antes del modal | MVP |
| Tabla de hechos | 228b | Orden del bloque de resultados: (1) tabla · (2) curva · (3) lectura en hechos · (4) nota. Columnas: camino · impacto fiscal · líquidos en año fijado · ¿se sostiene? · patrimonio en 2050. Plan base siempre presente | CORE |
| Columna «¿se sostiene?» | 228c | Hechos objetivos derivados de la serie: año en que la capacidad se vuelve negativa · agotamiento de líquidos · aguanta el horizonte. Sin semáforo ni valoración («plan sólido», «en riesgo») | CORE |
| Lectura en hechos | 228d | Compuesta automáticamente. Las dos caras siempre. Nunca «B es mejor» | CORE |
| Catálogo de escenarios frecuentes | 229 | Propuestas de qué comparar ("¿y si me jubilo dos años antes?"). **No rompe el firewall: propone qué mirar, no qué hacer** | V2 |
| Modo presentación | 230 | Limpia navegación y agranda tipografía para la reunión | V2 |
| Acumulación de periodo | 231 | Sumar la cuota año a año con bases que cambian. Hoy: (a) la columna fiscal muestra solo el primer ejercicio; (b) el gráfico de impuesto acumulado repite esa cuota en cada año activo (simplificación declarada · orientativo · no parcial) | V2 |
| What-if en vivo / Modo Explorar | 232 | El asesor no recalcula delante del cliente: una pregunta imprevista se anota y se resuelve en frío | Descartado |
| Flujo guiado ①②③④ | 233 | Preparar → Presentar → Entregar. Guiaba demasiado | Descartado |

## Variables

- **Métrica del comparador:** activos líquidos (por defecto) · impuesto acumulado (escalonado · simplificación declarada) · patrimonio
- **Horizonte de lectura:** 2026 → 2050 *(el motor proyecta hasta 2060; la tabla y el gráfico se leen hasta 2050)*
- **Supuestos por escenario:** rentabilidad esperada (%) · inflación (%)
- **Régimen:** IRPF · IS · mixto
- **Naturaleza del escenario:** plan base · alternativo
- **Nº de escenarios comparados:** máximo 3, incluido el plan base

## Cómo la usa el asesor

**Flujo 1 · Explorar en frío (antes de la reunión).** Monta dos o tres caminos y ve a dónde llevan. Es donde el producto sustituye al Excel. **Exige que montar un escenario cueste menos de dos minutos**: si tarda más, nadie monta tres alternativas y el comparador queda de decorado.

**Flujo 2 · Enseñarlo en la reunión.** Superpone las curvas y llega a la tabla de hechos (columna fiscal CT2). **Y aquí empieza el asesor:** la pantalla pone las cifras y se calla; él explica lo que no se ve —que pignorar no paga impuestos pero paga intereses, que un traspaso aplaza y no elimina—. Ese hueco entre lo que la herramienta enseña y lo que el asesor concluye **es el producto**.

**Flujo 3 · Cerrar con un entregable.** Genera el informe con su conclusión firmada.

# P7 · Historial

## Overview

**Qué es.** El timeline de informes emitidos para ese cliente. La pantalla más barata del producto y la que más sostiene el modelo de negocio: es el argumento de renovación del fee hecho pantalla.

## Funcionalidades

| Funcionalidad | Nº | Detalle | Fase |
|---|---|---|---|
| Timeline de informes emitidos | 234 | Cada informe con fecha, título y tipo | MVP |
| Descarga del PDF | 235 | Recuperar cualquier informe pasado | MVP |
| Entrada automática | 236 | Generar un informe crea la entrada sin intervención | MVP |
| Tipo de informe | 237 | Foto del patrimonio · comparación de escenarios | MVP |
| **Trazabilidad de parámetros** | 238 | Qué parámetros fiscales usó cada entrega. Es lo que permite demostrar qué era vigente en cada momento | V2 |
| Aviso de cambio normativo | 239 | Alerta si los parámetros han cambiado desde el último informe | V2 |

## Variables

- **Tipo de informe:** foto del patrimonio · comparación de escenarios
- **Estado:** emitido *(no hay borradores)*

## Cómo la usa el asesor

**Flujo 1 · Recuperar lo que le mandó a un cliente.** Meses después, cuando el cliente pregunta.

**Flujo 2 · Justificar la renovación.** Cuatro informes fechados con conclusiones firmadas son una conversación distinta a "confía en mí".

# CT1 · Plantilla de evento

## Overview

**Qué es.** El modal donde el asesor **describe** una decisión con dos o tres campos, y el motor calcula. **El asesor nunca teclea un tipo impositivo.** Eso es lo que separa a Scenia de una hoja de Excel con fórmulas.

**Dónde se abre.** Desde dentro de un escenario (menú completo, cualquier activo) o desde una ficha (contextual, y se elige el escenario destino).

## Funcionalidades

| Funcionalidad | Nº | Detalle | Fase |
|---|---|---|---|
| Menú contextual por tipo de elemento | 240 | Solo ofrece los eventos posibles para ese activo | CORE |
| Menú completo dentro de un escenario | 241 | Todos los elementos y todas sus acciones | CORE |
| **Reembolsar fondo** | 242 | Importe · año(s). Plusvalía → base del ahorro. **Ratio único, marcado como estimación no válida para autoliquidación** | CORE |
| **Traspasar fondo** | 243 | Origen · destino. Neutro (art. 94): el destino **hereda valor y fecha** | CORE |
| **Pignorar** | 244 | Importe. No realiza plusvalía: cuota 0, solo coste financiero | CORE |
| **Rescatar plan** | 245 | Modalidad (capital/renta/mixto) · importe · años. Base general, apilado sobre los ingresos. Reducción del 40 % pre-2007 con control de plazos | CORE |
| **Vender inmueble** | 246 | Importe · año · reinversión. Art. 33.4.b) si es vivienda habitual y el titular supera los 65, **evaluado por titular**; art. 38.3 solo como aviso | CORE |
| Aportar a fondo | 247 | Importe · año. Sin consecuencia fiscal | MVP |
| Comprar inmueble | 248 | Precio · año · hipoteca. Sin fiscalidad, pero crea el activo y descuenta liquidez | MVP |
| **Jubilarse** | 249 | Año · pensión estimada. **Sustituye los ingresos de trabajo por la pensión** a partir de ese año, dentro del escenario | CORE |
| Amortizar hipoteca | 250 | Importe · año. Se registra; el cálculo amortizar-vs-invertir no está construido | MVP |
| Aportar a plan de pensiones | 251 | Importe · año. Reduce la base general con su límite; avisa del exceso | CORE |
| Repartir dividendo / vender participación | 252 | **Sin cálculo** — el liquidador de IS no existe. El hueco se marca | MVP |
| Evento genérico | 253 | Ingreso · gasto · movimiento libre. Sin cálculo. Si el asesor teclea un impacto, se marca como introducido | MVP |
| **Guarda: titular sin ingresos informados** | 254 | Un rescate sobre alguien sin líneas de ingreso **no se liquida**: apilar sobre base 0 daría una cuota bajísima presentada como cálculo. **Es regla de oro** | CORE |
| **Guarda: titular sin renta calculable en ganancias** | 255 | En una venta con varios titulares, la parte de quien no tiene datos va a `sin_calculo` | CORE |
| **Guarda: cobertura por titular** | 256 | El motor verifica la comunidad **de la persona que liquida**, no la del expediente | CORE |
| Reparto de titularidad en el evento | 257 | Por defecto actúa en proporción al % de cada titular | MVP |
| Selector de escenario destino | 258 | Al lanzar desde una ficha | MVP |
| Vista previa del cálculo | 259 | El resultado fiscal se muestra antes de guardar, con su "orientativo" | CORE |
| Distinción calculado / introducido | 260 | Una cifra del motor nunca tiene el mismo aspecto que una tecleada. **Es firewall** | CORE |
| Marca de cálculo sobre dato estimado | 261 | Una cuota calculada sobre una pensión que tecleó el asesor lo declara | MVP |
| Validación de rangos | 262 | El año final no puede ser anterior al inicial; los campos se reinician al abrir | MVP |
| Orden visual del menú | 263 | Los eventos que calculan primero, los de registro después, separados: la promesa se lee correcta desde el primer vistazo | V2 |

## Variables

- **Modalidad de rescate:** capital · renta · mixto
- **Tipo de evento genérico:** ingreso · gasto · movimiento libre
- **Destino:** plan base · cualquier escenario
- **Origen de la cifra:** calculada por el motor · introducida por el asesor · calculada sobre dato estimado
- **Resultado del motor:** calculado · neutro · sin cálculo · pendiente de IS

## Cómo la usa el asesor

**Flujo 1 · Describir una decisión.** Dos o tres campos y ve el resultado antes de guardar. Debe costar menos de un minuto.

**Flujo 2 · Corregir.** Vuelve, edita, y la cifra se recalcula.

# CT2 · Fila fiscal neutra

## Overview

**Qué es.** El componente que enseña el impacto fiscal de cada escenario. **La pieza central del producto** en términos legales, y la más pequeña en código. En P6 se renderiza como **columna de la tabla de hechos** (`variant="celda"` + pie `variant="nota"`), no como tira suelta; el firewall es el mismo.

## Funcionalidades

| Funcionalidad | Nº | Detalle | Fase |
|---|---|---|---|
| Columna / tira del comparador | 264 | `Impacto fiscal · primer año · orientativo`. En P6: celda por camino + pie con Δ y avisos | CORE |
| Celdas por escenario | 265 | Una celda por camino comparado (en la tabla de hechos) | CORE |
| Celda de diferencia (Δ) | 266 | Valor absoluto en el pie, sin signo que sugiera dirección | CORE |
| **Tinta neutra obligatoria** | 267 | Nunca verde/rojo/ámbar para comparar opciones. El componente hace **imposible** pintarla de otro modo (`.fila-fiscal *{color:var(--ink) !important}` + ignora `className`) | CORE |
| Sin coronación de ganador | 268 | Sin destacado, sin negrita diferencial, sin orden que sugiera preferencia | CORE |
| Sin props de tono | 269 | El componente no acepta `className` externo ni parámetros de color | CORE |
| Nota "orientativo" | 270 | Siempre presente, junto a la marca de parámetros (a verificar) | CORE |
| **Marca de cálculo parcial** | 271 | Si el escenario contiene eventos sin liquidador, la celda y el pie lo indican. **Nunca sumar en silencio lo que no se calcula** | CORE |
| Etiqueta honesta del periodo | 272 | Dice "primer año" mientras no exista la acumulación: no promete precisión que no tiene | CORE |
| Test automático de neutralidad | 273 | Que el build falle si la fila renderiza un color fuera de la escala de tintas | MVP |

## Variables

- **Nº de columnas:** una por escenario comparado, más la de Δ
- **Estado del cálculo:** disponible · parcial · no disponible

# CT3 · Informe

## Overview

**Qué es.** **No es una pantalla ni una fase.** Un botón contextual que genera un PDF de lo que se está viendo. Sustituyó a la antigua pantalla "Entregar".

**Por qué la Nota es obligatoria.** Es el firewall entero: todo documento que sale con la marca del despacho lleva una conclusión humana firmada. Sin ella, un PDF con cifras fiscales y un logo sería una recomendación automatizada.

## Funcionalidades

| Funcionalidad | Nº | Detalle | Fase |
|---|---|---|---|
| Botón desde Patrimonio | 274 | Informe de la foto patrimonial | MVP |
| Botón desde el comparador | 275 | Informe con la comparación y la fila fiscal | MVP |
| Título editable | 276 | Precargado con un nombre sensato, modificable | MVP |
| **Nota del asesor obligatoria** | 277 | Modal corto: el asesor escribe su conclusión → se genera el PDF. **Es el firewall** | CORE |
| Validación de la Nota | 278 | Sin Nota no hay PDF. Error en `--coral-deep` | CORE |
| Marca del despacho | 279 | Logo y datos, traídos de Ajustes | MVP |
| Sello de descargo | 280 | "Cálculo orientativo, no asesoramiento" | CORE |
| Sello "datos a fecha de" | 281 | Los valores no se actualizan solos | MVP |
| Entrada automática en Historial | 282 | Cada informe emitido queda registrado | MVP |
| **PDF real descargable** | 283 | Hoy la generación está simulada | MVP |
| Diseño propio del documento | 284 | Es lo único que ve el cliente final del asesor y hoy está especificado en cinco líneas | MVP |
| Previsualización | 285 | Ver cómo queda antes de generar | V2 |
| Anexo de trazabilidad | 286 | Qué parámetros fiscales usó este informe | V2 |

## Variables

- **Contexto de generación:** foto del patrimonio · comparación de escenarios
- **Nota del asesor:** texto libre, obligatorio
- **Estado:** generado *(no hay borradores)*

## Cómo la usa el asesor

**Flujo único · cerrar la reunión.** Escribe su conclusión y genera. Debe ser fácil y natural: **si le cuesta escribir la Nota, la escribirá mal o buscará cómo saltársela**, y ahí se rompe el firewall.

# CT4 · Controles compartidos

## Funcionalidades

| Funcionalidad | Nº | Detalle | Fase |
|---|---|---|---|
| Clic-en-año | 287 | Presente en Proyección y Escenarios, con el mismo comportamiento | MVP |
| Toggle € hoy / € futuro | 288 | Deflacta las series. **No afecta a la cuota fiscal del primer ejercicio**, y se declara | MVP |
| Tira de contexto del cliente | 289 | Nombre · edad · CCAA · segmento · patrimonio, en todas las pantallas de cliente | MVP |
| Sello "datos a fecha de" | 290 | Visible en la cabecera del cliente | MVP |
| Semáforo de liquidez | 291 | Componente reutilizable, derivado del tipo de activo | MVP |
| Barra de titularidad | 292 | Componente reutilizable de reparto por porcentajes | MVP |
| Control de reparto de titularidad | 293 | Reparte % entre las personas del expediente, con validación de que suma 100 % | MVP |
| Formato es-ES unificado | 294 | Toda cifra con separador de miles y símbolo de euro consistentes | MVP |

## Variables

- **Moneda:** € de hoy · € futuros
- **Deflactor:** la inflación declarada del escenario
- **Liquidez:** alta · media · baja

# ANEXO A · El motor fiscal

## Overview

**Arquitectura.** Clasificador (evento → categoría fiscal) → liquidador de la base del ahorro + liquidador de la base general (estatal + autonómica, apilando sobre los ingresos) → función pura por año. **Ninguna cifra fiscal vive en el código:** todas en una tabla de parámetros indexada por (año, CCAA), cada una marcada `(a verificar)` hasta que el fiscalista la confirme.

**Fuentes de los parámetros:** solo oficiales — **BOE** (Ley 35/2006 y leyes de Presupuestos) · **DOGV** (escala autonómica valenciana) · **AEAT** (manuales, solo para contrastar). Cada parámetro con norma, artículo y fecha de consulta. Lo que no se confirme queda como hueco marcado.

**Dos capas, construidas por separado:**
- **Liquidación de ejercicio** *(construida)* — base, escala progresiva, cuota de un año. Es lo que responde a las preguntas frecuentes del asesor.
- **Acumulación de periodo** *(V2)* — FIFO real por lotes, interacción entre eventos del mismo año, herencia patrimonial del traspaso, y suma año a año con bases que cambian.

## Funcionalidades

| Funcionalidad | Nº | Detalle | Fase |
|---|---|---|---|
| Clasificador de eventos | 295 | Evento → categoría fiscal | CORE |
| Liquidador de base del ahorro | 296 | Escala del ahorro, común a todo el régimen común | CORE |
| Liquidador de base general | 297 | Estatal + autonómica, apilando sobre los ingresos del año | CORE |
| Función pura por año | 298 | Sin efectos secundarios: mismos inputs, mismo resultado. Auditable | CORE |
| Tabla de parámetros por (año, CCAA) | 299 | Ninguna cifra fiscal en el código. Cuotas acumuladas **derivadas**, no guardadas, con test de consistencia | CORE |
| Marca `(a verificar)` por parámetro | 300 | Hasta que el fiscalista confirme cada valor | CORE |
| **Clasificador de estado por persona** | 301 | Devuelve calculable o sin cálculo con su motivo. Orden: CCAA → fuente → ingresos. Lo consumen P4, P3 Personas y las guardas de CT1 | CORE |
| Base liquidable con conceptos estructurados | 302 | Bruto − cotizaciones − gastos art. 19.2.f) − reducción art. 20, adaptado a la fuente de renta | CORE |
| Regla · Traspaso vs reembolso | 303 | Traspaso art. 94 sin peaje; reembolso realiza plusvalía → base del ahorro | CORE |
| Regla · Rescate del plan | 304 | Capital / renta / mixto → base general, apilado. Reducción del 40 % con control de plazos DT 12ª | CORE |
| Regla · Pignorar | 305 | No realiza plusvalía → cuota 0 | CORE |
| Regla · Venta de vivienda habitual >65 | 306 | Exención art. 33.4.b), **evaluada por titular** | CORE |
| Regla · Aportación a plan de pensiones | 307 | Reducción en base general con su límite; avisa del exceso | CORE |
| Regla · Reinversión en renta vitalicia | 308 | Art. 38.3: avisa, no liquida la exención. Faltan los requisitos del art. 42 RIRPF | MVP (parcial) |
| Regla · Amortizar vs invertir | 309 | Comparación entre interés ahorrado y rentabilidad esperada. Hoy es un stub | V2 |
| Bloqueo de regímenes forales | 310 | País Vasco y Navarra: normativa propia, no una variante de la común | CORE |
| FIFO por lotes | 311 | El art. 37.2 impone identificar por orden de compra. Hoy se usa un ratio único, declarado como no válido para autoliquidación | V2 |
| Acumulación de periodo | 312 | Estado fiscal por ejercicio, con bases que cambian | V2 |
| Herencia patrimonial del traspaso | 313 | Que el fondo destino reciba valor y fecha de verdad, no solo cuota 0 | V2 |
| Mínimos familiares | 314 | Descendientes, ascendientes, discapacidad | V2 |
| Mínimo autonómico propio | 315 | La Comunitat Valenciana tiene los suyos, más altos que los estatales | V2 |
| Liquidador de Impuesto de Sociedades | 316 | Prerrequisito para que F4 calcule | V2 |
| ISD por CCAA | 317 | Sucesiones y donaciones. Motor nuevo con normativa autonómica propia | V2 |
| Patrimonio + ISGF | 318 | Alerta de cruce de umbral | V2 |
| Más CCAA en la tabla | 319 | Cada una multiplica el mantenimiento anual | V2 |
| Rendimientos de actividades económicas | 320 | RETA y gastos propios del autónomo | V2 |
| Modelo 720 / IRNR | 321 | Extranjero y no residentes | Futura |

## Variables

- **Categoría fiscal:** neutro · base del ahorro · base general · sin cálculo · pendiente de IS
- **Estado del parámetro:** verificado · **(a verificar)**
- **Motivo de sin cálculo:** sin ingresos informados · CCAA sin cobertura · régimen foral · fuente no contemplada · datos insuficientes
- **CCAA cubierta:** Comunitat Valenciana (base general) · todo el régimen común (base del ahorro)

## Las guardas de entrada

Antes de liquidar, el motor comprueba que existan los datos necesarios y **se niega a calcular** si no:

- Sin **ingresos informados** del titular → `sin_calculo`. No se apila sobre base 0.
- Titular en **comunidad sin cobertura** → `sin_calculo`, comprobado **por persona**, no por expediente.
- Fuente de renta **no contemplada** (actividad económica) → `sin_calculo` con aviso.

En los tres casos la fila fiscal marca cálculo parcial. **Un hueco declarado es correcto; una cuota sobre datos que faltan es un fallo grave**, porque tiene el mismo aspecto que un cálculo bueno.

## Huecos conocidos y declarados

| Hueco | Efecto |
|---|---|
| Cotizaciones no estimadas | Si el asesor no las informa, la base sale más alta |
| Ratio único en lugar de FIFO | La cifra del reembolso es orientativa en un sentido más fuerte que las demás |
| Mínimo estatal en la mitad autonómica | La cuota autonómica sale algo alta |
| Sin mínimos familiares | Un cliente con hijos ve una cuota alta |
| Reforma autonómica 2026 no incorporada | Solo existe como anteproyecto; no se aplica hasta su publicación |
| Solo primer ejercicio en eventos multi-año | La fila fiscal lo declara en su etiqueta |

# ANEXO B · Modelo de datos

| Funcionalidad | Nº | Detalle | Fase |
|---|---|---|---|
| **Cuenta** | 322 | Dueño abstracto del expediente. Hoy siempre un asesor/EAF; diseñada para que un particular pueda serlo (B2C) sin reconstruir. Invisible en el MVP | MVP |
| **Persona** | 323 | Identidad única en todo el sistema, compartible entre expedientes. **Lleva su propia CCAA**, que determina su cobertura fiscal | CORE |
| **Cliente (expediente)** | 324 | Agrupa N Personas + opcionalmente Sociedades. La unidad de trabajo del asesor | CORE |
| **Sociedad** | 325 | Persona jurídica dentro de un Cliente, ligada a Personas por % de participación | MVP |
| **Instrumento** | 326 | Con valor, fecha de adquisición, tipo fiscal y campos propios del tipo | CORE |
| **Titularidad** | 327 | Cada instrumento repartido por % entre Personas o Sociedad | CORE |
| **Escenario** | 328 | Contenedor de eventos, **del cliente**. El plan base es el escenario por defecto | CORE |
| **Evento** | 329 | Pertenece a un escenario, actúa sobre un elemento | CORE |
| Fuente única de verdad | 330 | Todo el expediente vive en el mismo sitio: no hay datos en sesión y datos en seed conviviendo | CORE |
| Integridad referencial | 331 | Borrar un activo o una persona limpia lo que la referencia, avisando antes | MVP |
| Pseudonimización-ready | 332 | Alias-first, PII separable | MVP |
| Histórico de valoración | 333 | Un Instrumento tiene un valor, no una serie. Sin esto no hay revalorización ni evolución histórica | V2 |

# ANEXO C · El firewall

| Regla | Nº | Detalle | Fase |
|---|---|---|---|
| 1 · Tinta neutra | 334 | En toda comparación fiscal. Nunca verde/rojo/ámbar para decir qué opción es mejor | CORE |
| 2 · "Orientativo" | 335 | Acompaña siempre a cualquier cifra fiscal | CORE |
| 3 · Nunca coronar | 336 | La aplicación muestra; el asesor concluye | CORE |
| 4 · Nota obligatoria | 337 | Antes de generar cualquier informe | CORE |
| 5 · Parámetros intocables | 338 | Tramos, tipos y límites viven en la tabla verificada. **Los datos del contribuyente sí los introduce el asesor** y no son parámetros | CORE |
| 6 · Calculado ≠ introducido | 339 | Distinción visual siempre, incluido el híbrido: cálculo real sobre dato estimado | CORE |
| 7 · Verde y rojo restringidos | 340 | Único verde: hechos objetivos del activo. Único rojo: error de validación de formulario | CORE |
| 8 · Cobertura por CCAA | 341 | Aviso explícito y matizado (ahorro en régimen común; base general solo CV; forales fuera). Nunca mostrar cifras de una comunidad para otra | CORE |
| Regla de oro · No inventar cifras | 342 | Ante la duda, un hueco marcado es correcto; una cifra fiscal inventada es un fallo grave | CORE |
| Fuentes oficiales únicamente | 343 | BOE · DOGV · AEAT. Nunca blogs, comparadores ni conocimiento previo del modelo | CORE |
| DPA con cada EAF | 344 | Antes de tratar datos reales de clientes finales | MVP |
| Esquema pseudonimización-ready | 345 | Alias-first, PII separable desde el modelo | MVP |

# ANEXO D · Captación de datos

| Funcionalidad | Nº | Detalle | Fase |
|---|---|---|---|
| Entrada manual por capas | 346 | El asesor teclea; el alta mínima permite empezar con poco | MVP |
| Importación por pegado | 347 | Volcar una cartera desde una hoja de cálculo. **No es comodidad: es lo que hace usable el producto más de una vez** | V2 |
| Precio de fondos por ISIN | 348 | Quefondos (gratis) o Morningstar. Barato, sin consentimiento, y actualiza lo más volátil | Futura |
| Valoración de inmuebles | 349 | idealista o Tinsa | Futura |
| Agregación bancaria | 350 | Flanks (PSD2). El consentimiento caduca cada 90-180 días | Futura |
| Onboarding Cl@ve PIN | 351 | AEAT · Catastro · Seguridad Social | Futura |

# ANEXO E · Decidido no hacer

| Decisión | Nº | Por qué | Fase |
|---|---|---|---|
| Modo Explorar / What-if en vivo | 352 | El asesor no edita ni recalcula delante del cliente. Una pregunta imprevista se anota y se resuelve en frío | Descartado |
| Flujo guiado ①②③④ | 353 | Preparar → Presentar → Entregar. Guiaba demasiado | Descartado |
| Pantalla Entregar | 354 | Sustituida por el botón de informe contextual | Descartado |
| Decisiones atadas a un solo activo | 355 | El escenario es del cliente | Descartado |
| Panel de KPIs decorativo | 356 | Sin paneles que no lleven a una acción | Descartado |
| Tareas y checklist tipo CRM | 357 | Riesgo de CRM-creep: Scenia no compite con el CRM del despacho | Descartado |
| La voz de Wealthabout | 358 | "Lo que tengo / lo que gano / lo que gasto" es su marca hablada y lo más reconocible que tienen. Se usan nombres neutrales a propósito | Descartado |

# ANEXO F · B2C (anotado, no diseñado)

El modelo de datos aguanta gracias a la capa **Cuenta**. El motor fiscal se queda y gana protagonismo; el flujo de asesor se retira; la captación automática pasa a ser casi obligatoria.

**El problema real no es técnico:** el firewall se apoya en que un asesor humano concluye y firma. Sin asesor, hay que decidir si la herramienta solo muestra (seguro, menos útil) o empieza a orientar (terreno regulado). Decisión de producto y regulación, a resolver antes de abrir B2C.

---

# Resumen por fase

| Fase | Qué significa |
|---|---|
| **CORE** | El espinazo. Sin esto no hay Scenia |
| **MVP** | La primera tanda construible |
| **V2** | Profundidad, según feedback de los EAFs |
| **Futura** | Escala; caro y dependiente de terceros |
| **Descartado** | Decisiones tomadas que no se reabren |

**Lectura de conjunto.** El riesgo no es el número de funcionalidades, es el orden. Si el motor fiscal —las reglas más la tabla de parámetros validada— no está cerrado antes que la riqueza de la interfaz, se llega a la demostración con un producto que se ve muy bien y no puede enseñar la única cifra que justifica su existencia.

**Y una advertencia sobre la proporción CORE.** Un porcentaje alto de CORE significa poco margen de recorte si el calendario aprieta. Conviene revisar si todo lo marcado CORE lo es de verdad, o si alguna etiqueta se puso por importancia percibida más que por dependencia real. Un CORE que se puede aplazar sin romper nada es un MVP mal etiquetado — y en un momento de presión, esa distinción es la que permite decidir rápido.