# Scenia Wealth — Funcionalidades (documento maestro · v12)

> **Documento único de funcionalidades (v13).** Sustituye por completo a cualquier versión anterior. Organizado por pantalla; cada funcionalidad lleva su fase.
>
> **Las fases:**
> - **CORE** — el espinazo. Define el producto; sin esto no hay Scenia. Va dentro del MVP.
> - **MVP** — la primera tanda construible.
> - **V2** — profundidad, según feedback de los EAFs.
> - **Futura** — escala; caro y dependiente de terceros.
> - **❌** — decidido no hacer.
>
> **Numeración:** `P` = pantalla con entrada propia · `F` = ficha (se llega pinchando un elemento, no está en el menú) · `CT` = componente transversal.
>
> **Estado de las validaciones:**
> - ✅ **Foto-primero validado** — Dani (design partner, Mediolanum) confirma que entrar por la foto del patrimonio le convence.
> - ⏳ **Motor fiscal en validación con fiscalista** — prerrequisito para enseñar cifras a cualquier asesor. Todo parámetro va marcado `(a verificar)` hasta entonces.
> - ⚙️ **Estado del motor (v13):** liquidación de **un ejercicio** funcionando (escalas oficiales estatal + CV, base general apilada, base del ahorro). La **acumulación de periodo** (FIFO multi-año, interacción entre eventos) no está construida: los eventos multi-año liquidan solo el primer ejercicio.
>
> **Principio rector:** el asesor entra por la foto, actúa desde donde mira, y el motor calcula la fiscalidad de una decisión antes de tomarla — sin recomendar nunca.

---

# 1 · Arquitectura de la aplicación

## Navegación

```
FUERA DEL CLIENTE
  P1 · Cartera ............... entrada de la aplicación
     └─ P2 · Alta de cliente (modal)
  P8 · Ajustes
  P9 · Escritorio ............ [V2 entero]

DENTRO DE UN CLIENTE — barra de 5 entradas, plana
  Patrimonio · Fiscalidad · Proyección · Escenarios · Historial

  P3 · PATRIMONIO ★ entrada del cliente — 7 pestañas
       ?tab=resumen ...... treemap tengo/debo
       ?tab=personas ..... las personas del expediente
       ?tab=activos ...... agrupado por tipo, columnas propias por grupo
       ?tab=pasivos ...... hipotecas y créditos
       ?tab=ingresos ..... por persona y fuente (alimenta el motor)
       ?tab=gastos ....... por categoría, con "Vincular a"
       ?tab=ahorro ....... resultado calculado (solo lectura)

       └─ FICHAS (drill-down: se abren pinchando el elemento)
            F1 · Persona    F2 · Portfolio    F3 · Inmueble
            F4 · Sociedad   F5 · Otros activos

  P4 · FISCALIDAD ★ ...... la foto fiscal (diferencial)
  P5 · PROYECCIÓN ........ series año a año + eventos del plan base
  P6 · ESCENARIOS ★ ...... espacio libre + comparador (diferencial)
  P7 · HISTORIAL ......... informes emitidos
```

## Las tres decisiones de arquitectura que la explican

**1 · Barra plana de cinco entradas, sin grupos.** Wealthabout necesita cuatro grupos y quince entradas porque separa "mirar" (Monitores) de "editar" (Fichas). Aquí se actúa desde donde se mira, así que esa separación no aplica y sobra la mitad de la navegación.

**2 · Las fichas no están en el menú.** Se llega a ellas pinchando el elemento en el treemap o en las pestañas. La riqueza futura de cada ficha (catastro, motor de pensión, depreciación) crece **hacia dentro**, sin tocar el menú.

**3 · Fiscalidad y Proyección en primer nivel.** Las dos cosas que diferencian se ven desde el primer segundo. (Donde WA tiene "Módulos", su submenú opaco que nunca llega a desplegarse en su propia demo.)

## Alta de elementos vs. eventos — dos gestos distintos

Son operaciones diferentes y **nunca comparten botón**:

| | **«+ Añadir»** | **«⚡ Evento»** |
|---|---|---|
| Qué hace | Crea un elemento que **existe hoy** | Describe una **decisión futura** sobre algo que ya existe |
| Ejemplo | Dar de alta el Fondo A que el cliente ya tiene | Reembolsar 35.000 € del Fondo A en 2027 |
| Dónde va | Al patrimonio del cliente | Al plan base o a un escenario |
| Fiscalidad | Ninguna | La calcula el motor (si aplica) |

Sin el alta, la carga por capas no tiene por dónde entrar: el alta de cliente (P2) es deliberadamente mínima, así que **todo lo demás debe poder crearse desde las pestañas de Patrimonio**. Un cliente recién creado empieza vacío y se rellena desde ahí.

---

# 2 · Pantallas fuera del cliente

## P1 · Cartera — entrada de la aplicación

**Qué es.** La lista de clientes del asesor. Al abrir Scenia es lo primero que se ve. Pinchar una fila entra en el Patrimonio de ese cliente.

| Funcionalidad | Detalle | Fase |
|---|---|---|
| Tabla de clientes | Se eligió tabla, no tarjetas: escala mejor y permite ordenar | MVP |
| Columna Cliente | Nombre/alias del expediente | MVP |
| Columna Segmento | Etiqueta del tipo de cliente (ver variables) | MVP |
| Columna Patrimonio | Total consolidado | MVP |
| Barra de composición | Mini-barra apilada dentro de la celda de Patrimonio: financiero / inmobiliario / otros. De un vistazo se ve de qué tipo es el patrimonio, no solo cuánto | MVP |
| Columna Escenarios | Cuántos escenarios abiertos tiene el cliente *(renombrada — antes decía "Decisiones abiertas", concepto retirado)* | MVP |
| Columna Última revisión | Fecha del último informe emitido | MVP |
| Buscador | Por nombre o NIF | MVP |
| Ordenar por columnas | Clic en la cabecera | MVP |
| Totales al pie | Nº de clientes + patrimonio total seguido | MVP |
| Botón "+ Nuevo cliente" | Abre P2 | MVP |
| Columna Alertas | Avisos por cliente. Depende del motor de alertas | V2 |
| Columna % líquido | — | V2 |
| Listado en tarjetas | Alternativa a la tabla | ❌ |

**Variables — Segmento:** Empresario · Pre-jubilado · Jubilado · Alto ingreso *(término español en vez del "HENRY" anglosajón)* · Herencia en curso.

---

## P2 · Alta de cliente (modal)

**Qué es.** El formulario de alta, de **baja fricción**: pide lo mínimo para que el cliente exista (~30 s) y el resto se rellena progresivamente. Es la filosofía de carga por capas.

| Funcionalidad | Detalle | Fase |
|---|---|---|
| Nombre/alias del expediente | Ej: "Familia García-Llorente" | MVP |
| Crear Persona | Nombre + fecha de nacimiento + CCAA | CORE·MVP |
| Añadir varias Personas | Un expediente puede tener N personas | MVP |
| Segmento | Desplegable | MVP |
| **CCAA con aviso de cobertura** | Por defecto Comunitat Valenciana. Si se elige otra, aviso visible: *"el cálculo fiscal solo está disponible para la Comunitat Valenciana"*. **Nunca dejar elegir sin avisar**: mostrar cifras de CV para otra comunidad sería una cifra incorrecta, y eso rompe el firewall | CORE·MVP |
| Alta mínima (capa 1) | Solo nombre + una Persona con nacimiento y CCAA son obligatorios | MVP |
| Vincular Persona existente | Buscador entre Personas ya dadas de alta, para no re-teclear a alguien presente en otro expediente | V2 *(prematuro en MVP: el modelo de datos ya lo soporta, solo no se expone el botón)* |
| Añadir Sociedad desde el alta | — | V2 *(la Sociedad se añade desde la pestaña Activos; en el alta engorda sin necesidad)* |
| Cadencia de revisión | Anual / semestral | V2 *(hoy solo alimentaría alertas, que son V2: campo sin consumidor)* |
| Seed vs vacío | Empezar de un cliente de ejemplo | Solo andamiaje del mockup — no es funcionalidad de producto |
| Importación por plantilla Excel | Volcar la foto de una vez | **V2 temprano** |
| Onboarding Cl@ve PIN | AEAT · Catastro · Seguridad Social | Futura |

---

## P8 · Ajustes

| Funcionalidad | Detalle | Fase |
|---|---|---|
| Marca del despacho | Logo y datos para los informes PDF | MVP |
| Usuarios / asientos | Modelo por asiento | MVP |
| Consulta de la tabla de parámetros fiscales | Ver (no editar) tramos por año y CCAA | V2 |

## P9 · Escritorio

**Toda la pantalla es V2.** Con foto-primero y pocos clientes, un escritorio de nivel superior aporta poco y se ve vacío. Se construye cuando un asesor tenga cartera grande.

| Funcionalidad | Detalle | Fase |
|---|---|---|
| Reuniones por preparar | — | V2 |
| Actividad reciente | Últimos escenarios e informes | V2 |
| Motor de alertas | Cumple 65 · meses sin revisión · escenario sin cerrar · aportaciones ≥10 años · cruce umbral IP/ISGF · cambio de parámetros fiscales · fin de tipo fijo de hipoteca | V2 |
| Panel de KPIs decorativo | — | ❌ (contradice "sin paneles decorativos") |

---

# 3 · P3 · Patrimonio — la entrada del cliente

**Qué es.** La foto del patrimonio, y el punto desde el que se navega todo lo demás. Siete pestañas: una de resumen y seis de detalle. Las tres primeras son **stock** (lo que hay), las tres últimas **flujo** (lo que entra y sale).

## 3.1 · Pestaña Resumen

| Funcionalidad | Detalle | Fase |
|---|---|---|
| Treemap "lo que tengo / lo que debo" | Bloques por categoría: financiero, inmobiliario, empresarial, otros · y los pasivos | MVP |
| Drill-down desde el bloque | Pinchar un bloque lleva a la pestaña o ficha correspondiente | MVP |
| Atajo "+" por categoría | Da de alta un elemento de ese tipo sin salir de la foto | MVP |
| Tarjeta de capacidad de ahorro | Viene calculada de la pestaña Ahorro | MVP |
| Sello "datos a fecha de [X]" | Los valores no se actualizan solos en MVP | CORE·MVP |
| Botón de informe | Genera el PDF de la foto (ver CT3) | MVP |
| Mapa radial · TIR por activo · slider temporal · scores de fortaleza | La capa visual rica de WA | V2 |

## 3.2 · Pestaña Personas

> **Pestaña propia porque una Persona no es un activo.** Sin ella no habría forma de llegar a F1 · Persona — que contiene los ingresos del año, dato que el motor necesita para liquidar el rescate del plan (regla ②).

| Funcionalidad | Detalle | Fase |
|---|---|---|
| Lista de personas del expediente | Nombre · edad · CCAA · ingresos del año · titularidad agregada | CORE·MVP |
| Pinchar abre F1 · Persona | Drill-down a la ficha | CORE·MVP |
| **Alta de persona** | Botón «+ Añadir» al expediente ya creado: nombre · fecha de nacimiento · CCAA | CORE·MVP |
| Rol en el expediente | Titular · cónyuge · hijo | V2 |

## 3.3 · Pestaña Activos

> **Agrupada internamente por tipo, con columnas propias por grupo.** Una tabla plana obligaría a mostrar columnas vacías para media tabla (la fecha de adquisición importa en un fondo, no en un coche). La agrupación recupera la centralización por tipo que da el grupo FICHAS de WA, sin añadir entradas de menú.

| Funcionalidad | Detalle | Fase |
|---|---|---|
| **Grupo Portfolio financiero** | Columnas: instrumento · tipo fiscal · valor · **fecha de adquisición** · plusvalía latente · titularidad | CORE·MVP |
| **Grupo Inmuebles** | Columnas: nombre · valor · fecha de adquisición · hipoteca asociada · titularidad | MVP |
| **Grupo Inversiones empresariales** | La participación en una Sociedad es un activo. Columnas: sociedad · % participación · valor. Pinchar abre F4 · Sociedad | MVP |
| **Grupo Otros activos** | Columnas: nombre · tipo · valor · titularidad. Captación 100 % manual, también en V2 | MVP |
| **Alta de activo por grupo** | Botón «+ Añadir» en cada grupo, con los campos propios del tipo: **fondo/plan** (nombre · tipo fiscal · valor · fecha de adquisición · coste · titularidad) · **inmueble** (nombre · valor · fecha · coste · hipoteca asociada · titularidad) · **participación** (sociedad · % · valor) · **otros** (nombre · tipo · valor · fecha · titularidad) | CORE·MVP |
| Cada línea abre la plantilla de evento (CT1) | **Diferencia con WA**, donde los monitores son solo lectura | CORE·MVP |
| Pinchar el nombre abre su ficha | Drill-down a F2/F3/F4/F5 | MVP |
| Total por grupo y total general | — | MVP |
| Gauges · donuts de titulares · selector de agrupación | Capa visual de WA | V2 |

## 3.4 · Pestaña Pasivos

| Funcionalidad | Detalle | Fase |
|---|---|---|
| Hipotecas | Prestamista · capital pendiente · tipo · cuota · inmueble asociado · titularidad | MVP |
| Créditos personales | Mismos campos, sin inmueble. Captación manual | MVP |
| Cada línea abre CT1 | Amortizar, cancelar | MVP |
| **Alta de pasivo** | Botón «+ Añadir»: tipo (hipoteca / crédito) · prestamista · capital pendiente · tipo de interés · cuota · inmueble asociado (si hipoteca) · titularidad | MVP |
| Campo "fin de tipo fijo" | Para el nivel 2 de amortización y la alerta correspondiente | V2 |

## 3.5 · Pestaña Ingresos

| Funcionalidad | Detalle | Fase |
|---|---|---|
| Desglose por Persona y fuente | Trabajo · alquiler · dividendo · pensión · otros | CORE·MVP |
| **Alimenta el motor fiscal** | El total por persona es el input del liquidador de base general (regla ②) | CORE·MVP |
| **Alta de línea de ingreso** | Botón «+ Añadir»: persona · fuente · importe anual. **Crítico**: es lo que alimenta el liquidador de base general | CORE·MVP |
| Eventos genéricos desde la pestaña | Cambios de flujo futuros ("en 2028 entra un ingreso extraordinario"). Sin cálculo fiscal | MVP |

## 3.6 · Pestaña Gastos

| Funcionalidad | Detalle | Fase |
|---|---|---|
| Categorías de gasto recurrente | — | MVP |
| Campo "Vincular a" | Persona · inmueble · sociedad · sin vincular. Permite ver el coste real de un activo sin repartir el gasto por siete fichas como hace WA | MVP |
| Solo los intereses de deuda cuentan como gasto | Ver separación interés/capital abajo | MVP |
| **Alta de línea de gasto** | Botón «+ Añadir»: categoría · importe anual · vincular a | MVP |
| Eventos genéricos desde la pestaña | "A partir de 2030 baja el gasto familiar" | MVP |

## 3.7 · Pestaña Ahorro

| Funcionalidad | Detalle | Fase |
|---|---|---|
| Capacidad de ahorro | Ingresos − gastos + amortización de capital | MVP |
| Solo lectura | Es un resultado calculado, no un dato que se toque. **No admite altas ni eventos** | MVP |
| Revalorización de activos | Requiere histórico de valoración que el modelo no guarda | V2 |

## Transversal a las pestañas

| Funcionalidad | Detalle | Fase |
|---|---|---|
| **Separación interés / capital en deudas** | La cuota nunca va entera a un sitio: los intereses son gasto, la amortización es ahorro. **Nivel 1**: aproximación anual, orientativa | MVP |
| Nivel 2: tabla de amortización francesa mes a mes | Requiere dato nuevo (plazo del préstamo) | V2 |
| **Cashflow anual tipo Sankey** | El dato ya existe; solo falta la visual. De lo más rápido de V2 | V2 |
| Cuenta de resultados como vista propia | Patrón WA | V2 |
| Monitor anual (comparativa entre años) | Patrón WA | V2 |

---

# 4 · Fichas (drill-down — no están en el menú)

> Se abren pinchando el elemento. **Toda la riqueza futura crece aquí dentro sin tocar la navegación.**

## F1 · Persona

| Funcionalidad | Detalle | Fase |
|---|---|---|
| Datos básicos | Nombre · fecha de nacimiento · CCAA | CORE·MVP |
| **Ingresos del año** | Calculado desde la pestaña Ingresos. Es el input del motor para el rescate | CORE·MVP |
| Jubilación prevista | Año/edad estimados, introducidos por el asesor | MVP |
| Titularidad agregada | Qué parte del patrimonio le corresponde | MVP |
| Identidad única entre expedientes | La misma Persona puede estar en varios Clientes | MVP (modelo) |
| Motor de pensión público | Base reguladora · tasa de reemplazo · años cotizados · slider de edad que recalcula | V2 |
| Vida laboral · relaciones mercantiles · calendario vital | Requieren captación automática | V2/Futura |

## F2 · Portfolio (pieza CORE)

| Funcionalidad | Detalle | Fase |
|---|---|---|
| **Modelo por instrumento** | Cada fondo con valor + **fecha de adquisición** + tipo fiscal. Sin esto no hay traspaso ni plusvalía calculable. **Es lo que WA no tiene** | CORE·MVP |
| **Reparto de titularidad por instrumento** | Ej: Fondo A · Carlos 60 % / Marta 40 %. Permite liquidar a cada uno en su escala. **WA reparte % en inmuebles y empresas, pero no por fondo** | CORE·MVP |
| Plusvalía latente por instrumento | Único uso permitido del verde (hecho objetivo, no comparación) | MVP |
| **Fracción de aportaciones anteriores a 2007** | Campo del plan de pensiones, introducido por el asesor y marcado como tal. Sin este dato el motor **no aplica** la reducción del 40 % (DT 12ª) y lo declara | CORE·MVP |
| Menú de eventos por línea | Reembolsar · traspasar · pignorar · aportar | CORE·MVP |
| Familia de riesgo · entidad · vista por banco · proyección por familia | Riqueza de WA | V2 |
| Precio por ISIN actualizado | Quefondos / Morningstar | Futura |

## F3 · Inmueble

| Funcionalidad | Detalle | Fase |
|---|---|---|
| Valor y fecha de adquisición | Necesario para venta >65 y amortizar-vs-invertir | CORE·MVP |
| Hipoteca básica | Capital pendiente · tipo · cuota | MVP |
| Reparto de titularidad | Ej: 50/50 | CORE·MVP |
| Menú de eventos | Comprar · vender · amortizar | MVP |
| Información catastral · valoración de mercado · estructura de gastos · renta potencial · documentos | Riqueza de WA, casi toda dependiente de integraciones | V2/Futura |

## F4 · Sociedad

| Funcionalidad | Detalle | Fase |
|---|---|---|
| Datos mercantiles | NIF · capital social · fecha de constitución · situación · objeto social | MVP |
| Tabla de participación | Por Persona, con % | MVP |
| Activos de la sociedad | Portfolio e inmuebles que cuelgan de la persona jurídica | MVP |
| Menú de eventos | Repartir dividendo · vender participación | MVP |
| ⚠️ **Liquidador de Impuesto de Sociedades** | **Sin reglas diseñadas.** La ficha se construye y los eventos se registran, pero **no hay cálculo fiscal societario**: el hueco se marca visiblemente como "pendiente de definir". No inventar cifras | V2 (prerrequisito para que F4 calcule) |
| Resumen contable · plan de negocio | Variante "PATRIMONIAL" de WA | V2 |

## F5 · Otros activos

| Funcionalidad | Detalle | Fase |
|---|---|---|
| Datos mínimos | Nombre · tipo · valor · fecha · titularidad | MVP |
| Evento de venta (genérico, sin cálculo fiscal) | Vender el coche genera ganancia patrimonial en IRPF, pero no está entre las 5 reglas → va por el genérico, con su marca "sin cálculo fiscal" | MVP |
| Ficha con curva de depreciación · estructura de gastos | Patrón WA | V2 |

---

# 5 · P4 · Fiscalidad ★ (primera cara del diferencial)

**Qué es.** La foto fiscal estática: *¿cómo está fiscalmente este cliente ahora?* Ocupa la casilla donde WA tiene "Módulos" — su submenú opaco, que nunca se despliega en su propia demo.

> **Alcance MVP: muestra el plan base.** Ver la foto fiscal de un escenario alternativo es V2.

| Funcionalidad | Detalle | Fase |
|---|---|---|
| **Cuota del ejercicio** | Liquidación del año seleccionado con las escalas oficiales. Es lo que el motor calcula hoy | CORE·MVP |
| KPIs de por vida (IRPF total + ETR) | Requieren acumulación de periodo, que no está construida | V2 |
| **Visor de tramos** | Escala estatal + autonómica (CV), con marca de en qué tramo cae cada renta y **cuánto espacio queda hasta el siguiente**. Es la conversación de valor con el cliente | CORE·MVP |
| **Base general vs base del ahorro separadas** | Son dos escalas distintas; mezclarlas sería un error de fondo | CORE·MVP |
| Serie de IRPF año a año | Requiere acumulación de periodo | V2 |
| Controles | Selector de Persona · selector de año | MVP |
| Toggle €hoy/€futuro en P4 | Sin serie temporal no tiene consumidor | V2 |
| **Parámetros no editables por el asesor** | Los tramos y tipos viven en la tabla verificada del motor. Si el asesor pudiera tocarlos, el "orientativo" perdería sentido. **Es firewall** | CORE·MVP |
| Sello y descargo | "Orientativo" siempre presente | CORE·MVP |
| Botón de informe desde esta pantalla | — | V2 |
| Explorador de estrategias / optimizador | Ordena por la métrica que el asesor declara; **nunca corona un ganador** | V2 |
| Foto fiscal de un escenario (no solo del plan base) | — | V2 |

---

# 6 · P5 · Proyección

**Qué es.** Las series año a año del **plan base**, y **el hogar de los eventos**: aquí se ve reflejado todo lo que se anota desde las fichas. Responde a *"he anotado que el coche se vende en 2027, ¿dónde lo veo?"*.

| Funcionalidad | Detalle | Fase |
|---|---|---|
| Proyección determinista año a año | El esqueleto temporal del que cuelga todo | CORE·MVP |
| Un gráfico + selector de serie | Patrimonio · flujos · ahorro · líquidos | MVP |
| Serie de IRPF proyectado | Requiere acumulación de periodo. Retirada del selector hasta entonces | V2 |
| Clic-en-año | Fija un año | MVP |
| **Panel de eventos del año fijado** | Al fijar un año, el lateral muestra los eventos de ese ejercicio y permite **editarlos o eliminarlos**. Sin esto, los eventos anotados no tendrían dónde consultarse ni gestionarse. Patrón validado en el Monitor vital de WA | MVP |
| Hitos sobre el eje temporal | Marcas visuales de los eventos | MVP |
| Toggle €hoy/€futuro | — | MVP |
| Sliders de supuestos en vivo · drill-down de métricas · tasa de retirada | Pulido de ProjectionLab | V2 |
| Alerta de cruce de umbral IP/ISGF | — | V2 |
| Monte Carlo | Banda p10/p90. Cuando entre, muestra inputs, no emite veredicto | Futura |

---

# 7 · P6 · Escenarios + comparador ★ (segunda cara del diferencial)

**Qué es.** El espacio de trabajo libre. **Sin pasos guiados** — se entra, se sale, se deja a medias y se vuelve.

> **Dos decisiones de fondo:**
> 1. **El escenario es del CLIENTE, no del activo.** Se clona el plan base y dentro se añaden eventos de **cualquier** activo. Esto permite montar decisiones de vida que cruzan varios ("jubilarse en 2035 + vender el coche + amortizar hipoteca"), imposible cuando la decisión estaba encerrada en un activo.
> 2. **El plan base es el primer escenario.** No es un caso especial: aparece en la lista como uno más ("Situación actual"), es comparable y editable desde aquí igual que los demás. Así el comparador enfrenta "seguir como está" contra "traspaso" sin lógica aparte.

| Funcionalidad | Detalle | Fase |
|---|---|---|
| Lista de escenarios del cliente | El plan base ("Situación actual") es el primero | CORE·MVP |
| Clonar un escenario | Punto de partida de cualquier alternativa | CORE·MVP |
| Escenarios con nombre | "A · Reembolso", "B · Traspaso + rescate", "Jubilación anticipada" | CORE·MVP |
| **Menú de eventos completo dentro del escenario** | De cualquier activo, no solo del que se entró. Es el cambio clave de la arquitectura | CORE·MVP |
| Lanzar evento desde la ficha de un activo | Atajo contextual: se elige a qué escenario va | MVP |
| Supuestos por escenario | Rentabilidad esperada e inflación (campos numéricos) | MVP |
| **Comparador: superponer escenarios** | Un gráfico + selector de métrica (patrimonio · líquidos · impacto fiscal de los eventos). Soporta N escenarios. La métrica fiscal es el impacto de los eventos del escenario, no el IRPF total del cliente (nombre provisional hasta proyección real de IRPF) | CORE·MVP |
| **Fila fiscal neutra (CT2)** | `Impacto fiscal · primer año · A · B · Δ · orientativo`. **La pieza central del producto.** Los eventos multi-año liquidan solo el primer ejercicio hasta que exista la acumulación de periodo | CORE·MVP |
| Eventos de cada escenario en paralelo | Para ver qué los diferencia | MVP |
| Clic-en-año + toggle €hoy/€futuro | — | MVP |
| Etiqueta de régimen (IRPF / IS) | Si un escenario mezcla titulares Persona y Sociedad | MVP |
| Botón de informe | Genera el PDF con la comparación (ver CT3) | MVP |
| Modo presentación | Limpia navegación y agranda tipografía para la reunión | V2 |
| Desplegable de métrica por gráfico | Patrón WA | V2 |
| What-if en vivo / "Modo Explorar" | El asesor no recalcula delante del cliente | ❌ |
| Flujo guiado ①②③④ con estados | Guiaba demasiado | ❌ |

---

# 8 · P7 · Historial

| Funcionalidad | Detalle | Fase |
|---|---|---|
| Timeline autogenerado | Cada informe emitido: fecha · título · PDF descargable. Es el argumento de renovación del fee | MVP |
| Parámetros usados por entrega + aviso de cambio normativo | Trazabilidad | V2 |

---

# 9 · Componentes transversales

## CT1 · Plantilla de evento

**Qué es.** El modal donde el asesor **describe** una decisión con 2-3 campos, y el motor calcula la fiscalidad. El asesor nunca teclea un tipo impositivo. Se abre desde dentro de un escenario (menú completo) o desde una ficha (contextual).

| Evento | Campos que introduce el asesor | Cálculo | Fase |
|---|---|---|---|
| **Reembolsar fondo** | Importe · año(s) | Regla ① — plusvalía a base del ahorro (FIFO básico) | CORE·MVP |
| **Traspasar fondo** | Fondo origen · destino | Regla ① — neutro (Art. 94); el destino **hereda valor y fecha** | CORE·MVP |
| **Pignorar** | Importe pignorado | Regla ④ — no realiza plusvalía: cuota 0, solo coste financiero | CORE·MVP |
| **Aportar a fondo** | Importe · año | Sin consecuencia fiscal | MVP |
| **Rescatar plan** | Modalidad **capital / renta / mixto** · importe · años | Regla ② — base general, apilado sobre los ingresos del año. Reducción 40 % pre-2007 `(a verificar)` | CORE·MVP |
| **Amortizar hipoteca** | Importe · año | Regla ③ — comparación amortizar vs invertir | CORE·MVP |
| **Vender inmueble** | Importe · año · ¿reinversión en renta vitalicia? | Regla ⑤ — exención por reinversión >65 `(a verificar)` | CORE·MVP |
| **Comprar inmueble** | Precio · año · ¿hipoteca? | **Sin fiscalidad** (comprar no tributa en IRPF) pero crea el activo y descuenta liquidez. Guiado por ser un caso muy común | MVP |
| **Jubilarse** | Año/edad · **pensión estimada introducida a mano** | Sin motor de pensión en MVP: cambia los ingresos de la persona al importe que indique el asesor, marcado como introducido | MVP |
| **Repartir dividendo / vender participación** | Importe · año | ⚠️ **Sin cálculo — el liquidador de IS no existe.** El hueco se marca visiblemente | MVP (registro) · V2 (cálculo) |
| **Aportar a plan de pensiones** | Importe · año | **Regla ⑥** — reduce la base liquidable general hasta el límite art. 52 (min. 1.500 € / 30 % RNT · plan individual). Exceso avisado, no aplicado en silencio. Ahorro = Δ cuota | CORE·MVP |
| **Evento genérico** | Ingreso / gasto / movimiento libre | **Sin cálculo fiscal.** Si el asesor teclea un impacto, se marca "introducido por el asesor, no calculado". Disponible también desde Ingresos y Gastos | MVP |

| Funcionalidad del modal | Detalle | Fase |
|---|---|---|
| Menú contextual por tipo de activo | Solo ofrece los eventos posibles para ese elemento | CORE·MVP |
| Reparto de titularidad en el evento | Si el activo tiene varios titulares, por defecto actúa en proporción a su % | MVP |
| Distinción visual calculado vs introducido | Una cifra del motor nunca tiene el mismo aspecto que una tecleada por el asesor. **Es firewall** | CORE·MVP |

## CT2 · Fila fiscal neutra

| Funcionalidad | Detalle | Fase |
|---|---|---|
| La fila del comparador | `Impacto fiscal · primer año · A · B · Δ · orientativo` | CORE·MVP |
| **Marca de cálculo parcial** | Si el escenario contiene eventos sin liquidador (IS, genérico con impacto tecleado, `sin_calculo`), la fila lo indica. **Nunca sumar en silencio lo que no se calcula** | CORE·MVP |
| Acumulación de periodo | Sumar la cuota año a año con bases que cambian. Requiere FIFO real e interacción entre eventos | V2 |
| **Tinta neutra obligatoria** | Nunca verde/rojo para comparar opciones. Nunca corona un ganador. El componente debe hacer **imposible** pintarla de otro modo | CORE·MVP |

## CT3 · Informe

**Qué es.** **No es una pantalla ni una fase.** Un botón contextual que genera un PDF de lo que se está viendo. Sustituye a la antigua pantalla "Entregar".

| Funcionalidad | Detalle | Fase |
|---|---|---|
| Botón contextual | Desde Patrimonio → informe de la foto · desde el comparador → informe con la comparación y la fila fiscal | MVP |
| **Nota del asesor obligatoria** | Modal corto: el asesor escribe su conclusión → se genera el PDF. **Es el firewall**: todo documento con la marca del despacho lleva conclusión humana | CORE·MVP |
| Marca del despacho + sello | Logo y datos + "cálculo orientativo, no asesoramiento" | MVP |
| Sello "datos a fecha de [X]" | — | MVP |
| Entrada automática en el Historial | — | MVP |
| Anexo de trazabilidad de parámetros | — | V2 |

## CT4 · Controles compartidos

| Funcionalidad | Dónde | Fase |
|---|---|---|
| Clic-en-año | Proyección · Escenarios · Fiscalidad | MVP |
| Toggle €hoy / €futuro | Las mismas | MVP |
| Tira de contexto del cliente | Todas las pantallas de cliente: nombre · edad · CCAA · segmento · patrimonio | MVP |

---

# ANEXO A · El motor fiscal

**Arquitectura.** Clasificador (evento → categoría) → liquidador de la base del ahorro (tramos) + liquidador de la base general (estatal + autonómica) → función pura por año. **Ninguna cifra fiscal vive en el código**: todas en una tabla de parámetros indexada por (año, CCAA), cada una marcada `(a verificar)` hasta que el fiscalista la confirme.

**Fuentes de los parámetros:** solo oficiales — **BOE** (Ley 35/2006 y leyes de Presupuestos) · **DOGV** (escala autonómica valenciana) · **AEAT** (manuales, solo para contrastar). Cada parámetro con norma, artículo y fecha de consulta. Lo que no se confirme queda como hueco marcado en `parametros-fiscales-pendientes.md`.

**Dos capas, construidas por separado:**
- **Liquidación de ejercicio** *(construida)* — base, escala progresiva, cuota de un año. Es lo que responde a las preguntas frecuentes del asesor: rescate en capital/renta/mixto, pignorar vs rescatar, reembolso.
- **Acumulación de periodo** *(V2)* — FIFO real a través de reembolsos sucesivos, interacción entre eventos del mismo año, herencia patrimonial del traspaso, y suma año a año con bases que cambian.

**Base del motor:** liquidable aproximada (arts. 19/20 LIRPF) — no brutos. Cotizaciones SS solo si las informa el asesor (no se estiman). La UI etiqueta explícitamente «base liquidable».

| Pieza | Detalle | Fase |
|---|---|---|
| Clasificador + liquidadores | Función pura, sin efectos secundarios | CORE·MVP |
| Tabla de parámetros por (año, CCAA) | Arranca en **Comunitat Valenciana** | CORE·MVP |
| **① Traspaso vs reembolso** | Traspaso Art. 94 sin peaje, el destino hereda valor y fecha; reembolso realiza plusvalía → base del ahorro. FIFO básico | CORE·MVP |
| **② Rescate del plan** | Capital / renta / mixto → base general liquidable, apilado sobre arts. 19/20 | CORE·MVP |
| **③ Amortizar hipoteca vs invertir** | ⚠️ **Hoy es un stub**: no calcula interés ahorrado ni coste de oportunidad. El evento se registra sin cifra | V2 |
| **④ Pignorar** | No realiza plusvalía → cuota 0 | CORE·MVP |
| **⑤ Venta de inmueble >65** | **Art. 33.4.b)** vivienda habitual + titular ≥65 → exento (por titular). **Art. 38.3** reinversión renta vitalicia → aviso sin liquidar (art. 42 RIRPF). Resto → plusvalía al ahorro. Campo `uso` del inmueble obligatorio | MVP (33.4.b sí · 38.3 aviso) · V2 (38.3 completa) |
| **⑥ Aportación a plan de pensiones** | Reduce base liquidable · límite art. 52 (1.500 € / 30 % RNT · sin incremento empresarial en MVP) · exceso avisado | CORE·MVP |
| Impuesto de Sociedades | Prerrequisito para que F4 calcule | V2 |
| ISD por CCAA (sucesiones y donaciones) | Motor nuevo | V2 |
| Patrimonio + ISGF | Alerta de cruce de umbral, con deducción cruzada | V2 |
| Más CCAA en la tabla | — | V2 |
| Modelo 720 / IRNR | Extranjero y no residentes | Futura |

---

# ANEXO B · Modelo de datos

| Pieza | Detalle | Fase |
|---|---|---|
| **Cuenta** | Dueño abstracto del expediente. Hoy siempre un asesor/EAF; diseñada para que un particular pueda serlo (B2C) sin reconstruir. Invisible en el MVP | MVP (esquema) |
| **Persona** | Identidad única en todo el sistema. Compartible entre expedientes | CORE·MVP |
| **Cliente (expediente)** | Agrupa N Personas + opcionalmente Sociedades. La unidad de trabajo del asesor | CORE·MVP |
| **Sociedad** | Persona jurídica dentro de un Cliente, ligada a Personas por % de participación | MVP |
| **Instrumento** | Con valor, fecha de adquisición y tipo fiscal | CORE·MVP |
| **Titularidad** | Cada instrumento repartido por % entre Personas/Sociedad | CORE·MVP |
| **Escenario** | Contenedor de eventos, **del cliente**. El plan base es el escenario por defecto | CORE·MVP |
| **Evento** | Pertenece a un escenario, actúa sobre un elemento | CORE·MVP |
| Pseudonimización-ready | Alias-first, PII separable | MVP (esquema) |

---

# ANEXO C · El firewall (transversal, innegociable)

1. **Tinta neutra** en toda comparación fiscal. Nunca verde/rojo para decir qué opción es mejor.
2. **"Orientativo"** acompaña siempre a cualquier cifra fiscal.
3. **Nunca coronar un ganador.** La aplicación muestra; el asesor concluye.
4. **Nota del asesor obligatoria** antes de generar cualquier informe.
5. **El asesor no toca parámetros fiscales** — tramos, tipos y reglas viven en la tabla verificada.
6. **Cifra calculada ≠ cifra introducida** — distinción visual siempre.
7. **Único verde permitido:** plusvalía latente (hecho objetivo). **Único rojo permitido:** error de validación de formulario.
8. **CCAA sin cobertura → aviso explícito.** Nunca mostrar cifras de CV para otra comunidad.

**RGPD:** DPA con cada EAF antes de datos reales; esquema pseudonimización-ready desde el MVP.

---

# ANEXO D · Captación de datos, por fases

| Fase | Detalle |
|---|---|
| **MVP** | Manual, con carga por capas |
| **V2 temprano** | Importación por plantilla Excel |
| **Futura — prioritaria** | Precio de fondos por ISIN (Quefondos gratis / Morningstar): barato, sin consentimiento, y actualiza lo más volátil de la foto |
| **Futura** | Valoración de inmuebles (idealista/Tinsa) · agregación bancaria (Flanks, PSD2: consentimiento caduca cada 90-180 días) · Cl@ve PIN (AEAT, Catastro, Seguridad Social) |

---

# ANEXO E · Decidido no hacer nunca

- **Modo Explorar / What-if en vivo** — el asesor no edita ni recalcula delante del cliente. Una pregunta imprevista se anota y se resuelve en frío.
- **Flujo guiado ①②③④ y pantalla Entregar** — guiaban demasiado.
- **Decisiones atadas a un solo activo** — el escenario es del cliente.
- **Panel de KPIs decorativo** — sin paneles que no lleven a una acción.
- **Tareas / checklist tipo CRM** — riesgo de CRM-creep.
- **La voz de Wealthabout** ("Lo que tengo / lo que gano / lo que gasto") — se usan nombres neutrales a propósito: es su marca hablada y lo más reconocible que tienen.

---

# ANEXO F · Seed (para el mockup)

**Cuenta:** un asesor/EAF, con seis clientes en cartera.

> **Un cliente completo, cinco ligeros.** García-Llorente lleva todos los datos y es el único navegable a fondo: es el que se usa para demostrar el motor, las fichas y los escenarios. Los otros cinco existen **solo para que la Cartera (P1) se vea como una cartera de verdad** — llevan lo justo para rellenar la tabla y su barra de composición. No hace falta construirles fichas ni escenarios; si se entra en ellos, basta con la foto de patrimonio.
>
> Están elegidos para cubrir **los cinco segmentos**, para que el desplegable se vea usado, y con **perfiles patrimoniales distintos** para que las barras de composición no salgan todas iguales.

## F.1 · Cliente completo — Familia García-Llorente

- **Segmento:** Pre-jubilado · **CCAA:** Comunitat Valenciana
- **Personas:** Carlos (58, nacido 1968) · Marta (55, nacida 1971)
- **Fondo A:** 300.000 €, adquirido en 2014, **Carlos 60 % / Marta 40 %**, plusvalía latente +120.000 €
- **Plan de pensiones de Carlos:** 120.000 €, desde 2009, 100 % suyo (sin `fraccionPre2007` — aportaciones posteriores a 2006)
- **Plan de pensiones de Marta:** 85.000 €, desde 2003, 100 % suyo, `fraccionPre2007` = 55 % (demo DT 12ª en rescate capital)
- **Vivienda en Jávea:** 420.000 €, **50/50**, hipoteca de 180.000 € (~950 €/mes)
- **Otros activos:** Audi Q8, 45.000 €, Carlos 100 %
- **Sociedad:** García Consulting SL, Carlos 100 %, **sin valorar** (el treemap muestra «no valorada», nunca 0 €)
- **Ingresos:** Carlos 95.000 €/año (trabajo) · Marta 32.000 €/año (trabajo)
- **Escenarios:** "Situación actual" (plan base) · "A · Reembolso" (35.000 €/año, 2026–2031) · "B · Traspaso + rescate" (traspaso del Fondo A + rescate en renta de 15.000 €/año).
  > **Las cifras fiscales se calculan con el motor**, no están escritas en el seed. Dependen de los parámetros vigentes, así que cambiarán cuando el fiscalista los valide o cuando entre la reforma autonómica. Las cifras ilustrativas antiguas (14.200 / 9.800) **ya no aplican**: no procedían de este liquidador.
  > El evento **jubilarse** sustituye los ingresos de trabajo por la pensión estimada (introducida por el asesor) a partir del año indicado; no marca la fila fiscal como parcial.

## F.2 · Clientes ligeros (solo para poblar la Cartera)

| Cliente | Segmento | Patrimonio | Composición (barra) | Escenarios | Última revisión |
|---|---|---|---|---|---|
| **Familia Beltrán Ortiz** | Empresario | 2.840.000 € | Empresarial 62 % · financiero 21 % · inmobiliario 15 % · otros 2 % | 1 | hace 2 meses |
| **Familia Navarro Sanchís** | Jubilado | 1.150.000 € | Inmobiliario 58 % · financiero 39 % · otros 3 % | 0 | hace 5 meses |
| **Familia Requena Poveda** | Alto ingreso | 610.000 € | Financiero 71 % · inmobiliario 26 % · otros 3 % | 2 | hace 3 semanas |
| **Familia Server Alcaraz** | Herencia en curso | 1.930.000 € | Inmobiliario 64 % · financiero 28 % · empresarial 8 % | 1 | hace 8 meses |
| **Familia Tormo Gisbert** | Pre-jubilado | 875.000 € | Financiero 46 % · inmobiliario 44 % · otros 10 % | 0 | hace 1 mes |

**Notas para el mockup:**
- **La columna Patrimonio de P1 es patrimonio NETO** (activos − pasivos). Para García-Llorente: 970.000 € de activos − 180.000 € de hipoteca = **790.000 €**. Las cifras de la tabla de arriba ya son netas.
- **Total de la cartera:** 6 clientes · **8.195.000 €** seguidos (fila de totales al pie de P1).
- Todos con CCAA **Comunitat Valenciana** en el seed (única con cobertura de base general). País Vasco y Navarra son **forales**: sin cobertura de general ni del ahorro. El resto de régimen común liquida el ahorro; solo el rescate (base general) exige CV.
- Los apellidos son de la Comunitat Valenciana a propósito: coherente con el mercado objetivo y con el segmento de EAF valenciano.
- Las cifras de "última revisión" deben calcularse **relativas a la fecha actual** (restando meses a `new Date()`), no hardcodearse como fechas fijas, para que la tabla no envejezca.
- García-Llorente es el más pequeño de la cartera en patrimonio: es lo correcto, porque es el que tiene el caso fiscal interesante, no el más rico.

---

# ANEXO G · B2C (futuro, solo anotado)

El modelo de datos aguanta gracias a la capa **Cuenta**. El motor fiscal se queda y gana protagonismo; el flujo de asesor se retira; la captación automática pasa a ser casi obligatoria. **El problema real no es técnico:** el firewall se apoya en que un asesor humano concluye y firma. Sin asesor, hay que decidir si la herramienta solo muestra (seguro, menos útil) o empieza a orientar (robo-advisor, terreno regulado). Decisión de producto y regulación, a resolver antes de abrir B2C.