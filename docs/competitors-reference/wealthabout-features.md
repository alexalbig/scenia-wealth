# Wealthabout — Ingeniería inversa del producto

**Documento de síntesis a partir de la demo (capturas + transcripciones + fuentes públicas)**

Reconstrucción exhaustiva de la funcionalidad de Wealthabout, plataforma B2B española de planificación patrimonial. Documento consolidado a partir de tres tandas de capturas de la demo oficial, las transcripciones de sus vídeos corporativos y la información pública disponible. Se distingue en todo momento **lo observado** de **lo inferido** *(inferido)*.

---

## 1. Resumen ejecutivo del producto

Wealthabout es un **SaaS B2B** ("Lifeplanner") que se vende a entidades —banca privada, EAFs, aseguradoras, asesorías— para que sus asesores presten un **servicio continuado de planificación patrimonial** al cliente final (el "HENRY"). No es una herramienta de venta directa al particular: el cliente de Wealthabout es la entidad, y la herramienta llega al usuario final a través del asesor.

Su propuesta se apoya en dos pilares declarados: **(1) minería de datos** —captación automática y consolidación del patrimonio del cliente desde fuentes públicas y privadas— y **(2) acompañamiento** —una foto viva, actualizada y proyectada a ~50 años sobre la que simular decisiones vitales. El producto **consolida** (activos financieros, inmobiliarios, participaciones empresariales y pasivos), **proyecta** (deterministamente, no Monte Carlo) y **simula escenarios** ("¿qué pasa si me jubilo en la playa?"), pero **evita deliberadamente** hacer recomendaciones de inversión y de estructuras fiscales (por cautela regulatoria y porque la recomendación la pone la entidad).

El producto tiene **dos sabores**: la versión para **persona física** (familia/unidad familiar) y la variante **"wealthabout PATRIMONIAL"** para **personas jurídicas** (sociedades patrimoniales y holdings).

---

## 2. Mapa de navegación / estructura del producto

### Dos niveles de aplicación

- **Nivel GESTOR (asesor)**: login → **Listado de clientes** (búsqueda por NIF/nombre, alta de cliente) → entra a la ficha de un cliente.
- **Nivel CLIENTE**: el espacio de trabajo con todos los monitores y fichas de ese cliente.

### Menú lateral — Cliente persona física

| Grupo | Entradas |
|---|---|
| **MONITORES** | Resumen de situación · Cuadro patrimonial · Cuenta de resultados · Monitor vital · Monitor anual · Lo que tengo · Lo que debo · Lo que gano · Lo que gasto · Lo que ahorro |
| **FICHAS** | Miembros · Inmuebles · Inv. Empresariales · Portfolio financiero · Otros activos |
| **MÓDULOS** ▾ | *(submenú nunca desplegado — contenido no documentado)* |
| **LABORATORIO** ▾ | Simulador · Comparador |
| pie | CONFIGURACIÓN |

### Menú lateral — Cliente persona jurídica ("PATRIMONIAL")

| Grupo | Entradas |
|---|---|
| **MONITORES** | Cuadro patrimonial · **Resumen contable** · **Plan de negocio** · Monitor anual · Activos · Deudas · Ingresos · Gastos · Ahorro |
| **FICHAS** | **Compañía** · Inmuebles · Inv. Empresariales · Portfolio financiero · Otros activos |
| **MÓDULOS** ▾ | *(no documentado)* |
| pie | breadcrumb "‹ SAMUEL" (la sociedad cuelga de un miembro) · CONFIGURACIÓN |

### Barra superior (común)
Logo · icono multiusuario/compartir · notificaciones (campana, con badge de alertas) · perfil de usuario.

---

## 3. Inventario de funcionalidades por módulo

### 3.0 — Acceso y gestión (nivel gestor)

**Login.** Email + contraseña + "He olvidado la contraseña". Cuenta de ejemplo `samuel-gestor@email.com` (rol gestor).

**Listado de clientes.** Título de la cuenta ("Wealthabout Demo"), **buscador "Búsqueda por NIF o nombre"**, botón **+** (alta). Tarjetas de cliente con nombre + NIF. En la demo conviven varios tipos: *Samuel Lite*, *Samuel PB* (sufijos = **tipos de cuenta/plan**, *inferido*), *Pablo Fernández Puig*, *PerTab Patrimonial* (NIF A12345678 → **persona jurídica**) y *Samuel Perera Taboada*.

**Carga automática del cliente (huella digital vía Cl@ve PIN).** El flujo estrella de captación de datos, en tres pasos:
1. **Modal inicial.** Lista "Información recogida de la huella digital": Últimas declaraciones de la renta · Últimas declaraciones del patrimonio · Vida laboral · Informe de bases de cotización · Información catastral de los inmuebles · Valor de mercado de los inmuebles · Relaciones mercantiles. Campo **"Introduce DNI o NIE del cliente"**, identificación por **Cl@ve PIN**, checkbox de **Términos y Condiciones**, enlace "¿Cómo registrarme en Cl@ve PIN?", botones **Cancelar / Continuar**.
2. **"Conectando con el servicio de huella digital…"**
3. **Acceso por organismo** con **código QR + código de verificación** confirmado por la app móvil Cl@ve. Organismos confirmados en capturas: **AEAT — Agencia Estatal de Administración Tributaria** (código KLR), **Catastro** (YR4) y **Seguridad Social** (FYA).

> Fuentes adicionales de datos (de transcripciones/notas de prensa, no vistas en captura): **idealista** (valor de mercado de inmuebles), **Flanks** (consolidación del patrimonio financiero multi-banco) e **Informa** (participaciones empresariales).

### 3.1 — MONITORES

**Resumen de situación.** Cuadro de mando con scoring. Cabecera con **slider temporal** (2021 ··· 2025 ··· 2076). Cuatro tarjetas KPI: **Patrimonio Neto** (= Lo que tengo − Lo que debo), **Lo que gano** (Rentas del trabajo / del patrimonio), **Lo que gasto** (Gasto familiar / en bienes productivos), **Lo que ahorro** (Ahorro corriente / Reducción de deuda / Revalorización de activos). Pieza central: **Índice de Fortaleza Financiera** (68 · "Bueno") con medidor y **texto explicativo en lenguaje natural**. Debajo, dos columnas — **Fortalezas** vs **Debilidades** — con cinco indicadores tipo velocímetro, cada uno con su explicación redactada:
- Fortalezas: **Nivel de endeudamiento** (9 % · "bajo"), **Nivel de solvencia** (15 · activo >15× pasivo), **Ratio de ahorro** (43 % · "alto").
- Debilidades: **Nivel del fondo de emergencia** (3 · meses cubiertos), **Nivel de independencia financiera** (22 %).

**Cuadro patrimonial.** Existe en **dos representaciones**:
- **Mapa radial** — diagrama de árbol centrado en el logo, con ramas a **Unidad familiar** (todos los miembros), **Inmuebles**, **Inversiones empresariales**, **Otros activos** y **Portfolio financiero**; cada nodo con **+** para añadir. KPIs Lo que tengo/debo/gano/gasto + **Nivel de madurez** (Experto 96 %).
- **Treemap (mapa de árbol)** — descompone **Lo que tengo** (5,1 M) en **Inmobiliario (25 %) · Mercantil (66 %) · Financiero (7 %) · Otros (2 %)**, y dentro, cada activo con su **% del total, % Productivo vs Líquido y TIR**. El bloque Financiero se subdivide en Cuentas y depósitos / Cartera de inversión / Ahorro para la jubilación. A la derecha, **Lo que debo** con cada hipoteca y crédito y su %. Cabecera con slider Hoy/2021–2076, **desplegable de agrupación** ("Mi Wealthabout"), botón **exportar a PDF** y **ampliar**.

**Cuenta de resultados.** Treemap de **pérdidas y ganancias**: **Resultado neto** arriba (134.838,30 €), y dos lados — **Lo que gano** (segmentado en % Miembros / Inmobiliario / Mercantil / Otros) vs **Lo que gasto** (idéntica segmentación) — cada bloque desglosado por persona/activo con % (y TIR donde aplica). Slider temporal + desplegable de agrupación.

**Monitor vital.** **El motor de proyección, e interactivo.** Cuatro gráficos de área a ~50 años (2021→2076): **Patrimonio neto** · **Flujos de caja** (positivos / negativos / netos) · **Ahorro corriente** (ingresos / gastos corrientes) · **Activos líquidos** (Invertido / Cuentas y depósitos). Interacción central: **"Haz clic en la línea para fijar el año"** → al fijar un año, recalcula el panel lateral derecho con **Flujos** y **Eventos** de ese año concreto (p. ej. 2025 compra "Casa de la Playa" −500.000 €; 2035 venta M.M.P. +325.000 €; 2041 Jubilación de Samuel). **Toggle € hoy / € futuro** (valor presente vs valor futuro) que recalcula toda la proyección. Es un motor **determinista basado en asset allocation**; **no hay Monte Carlo ni bandas de probabilidad** *(observado: ninguna captura los muestra)*.

**Monitor anual.** Vista comparativa interanual: cinco columnas (Lo que tengo / debo / gano / gasto / ahorro), cada una con un **gráfico de barras apiladas '24 / '25 / '26**, dos donuts (Activos u Origen o Categorías + **Titulares**) y el desglose con porcentajes.

**Lo que tengo / debo / gano / gasto / ahorro.** Cinco vistas gemelas con el mismo patrón: total + **slider temporal** + **desplegable de agrupación** (arriba dcha.) + desglose jerárquico por categorías + **donut "Origen/Recurso"** + **donut "Titulares"** (reparto por persona con %) + un **medidor (gauge)** específico de cada vista:

| Vista | Desglose principal | Gauge(s) propio(s) |
|---|---|---|
| **Lo que tengo** | Inv. empresariales · Inmuebles · Portfolio financiero · Otros activos · **Liquidez (Líquido/No líquido)** | Nivel de solvencia · Nivel del fondo de emergencia |
| **Lo que debo** | Hipotecas · Créditos al consumo | Nivel de endeudamiento |
| **Lo que gano** | Rentas del trabajo · Otros ingresos · Dividendos · Rentas de inmueble | Nivel de independencia financiera |
| **Lo que gasto** | Miembros · Inmuebles · Otros activos | *(agrupación "Por recurso")* |
| **Lo que ahorro** | Ahorro corriente · Reducción de deuda · Revalorización de activos | Ratio de ahorro |

### 3.2 — FICHAS

**Miembros (listado).** Galería de tarjetas con foto, nombre, **rol** (Usuario / Cónyuge / Hijo) y fecha de nacimiento (edad). En la demo: Samuel (Usuario), Mónica (Cónyuge) y cinco hijos (Cristina, Jaime, Pablo, Lucía, Marta). Algunas tarjetas muestran **badge rojo** (alerta/aviso, *inferido*). Iconos vista lista / carpeta / **+**.

**Ficha de miembro — adulto.** La ficha más rica del producto. Incluye:
- **Ingresos anuales** — gráfico de área apilada por fuente (Trabajo, Income II…) y total del año.
- **Jubilación (motor de pensión pública)** — Fecha de jubilación · Pensión (€/año y €/mes) · **Tasa de reemplazo** · edad (67) · **cotizado** (años/meses/días) y **pendiente** · **Tu base reguladora** · **Tu porcentaje** (99,11 %) · **Bonificación** · barra **min–max** · **Condiciones para recibir pensión** (cotizar 15 años; 2 en los últimos 15, con checks verdes) · **slider "Periodo de jubilación"** (65–69 años) que **recalcula la pensión** en cada extremo.
- **Calendario vital** — matriz de puntos (una "vida" por décadas) con hitos fechados: Nacimiento, Vida laboral, Hoy, Jubilación, Deceso.
- **Vida laboral** — días totales cotizados + tabla **Empresa · Régimen · Periodo · Nº de días** (importada de la Seguridad Social).
- **Relaciones mercantiles** — tabla **Empresa · Rol** (Adm. único, Presidente, Consejero…).
- **Créditos personales** — tarjetas de préstamo con **Cuota anual · Tipo de interés · Plazo · barras de Capital/Intereses · Titulares con % de reparto**, y botón **+**.
- **Estructura de gastos** — donut + lista que **incluye IRPF, Seguridad Social y Cuota de Solidaridad calculados**, además de seguros y cuotas de crédito. → Confirma que el motor **calcula la fiscalidad del miembro** (IRPF y cotizaciones), aunque solo como gasto corriente, no como módulo de optimización.
- **Eventos** — línea temporal (Cambio de ingreso, Amortización total…).

**Ficha de miembro — hijo.** Variante con: **Educación** (Colegio / Universidad, etapas y cursos pendientes, coste), **Créditos personales** (puede estar vacío), **Calendario vital** (Nacimiento, Colegio, Universidad, Hoy, Vida laboral, **Emancipación**), **Eventos** (Cambio en educación, Boda, Emancipación) y **Estructura de gastos** (Universidad, clases, paga, etc.).

**Inmuebles (listado).** Tarjetas con foto + nombre + valor. Bloque **Eventos** (Compra, con importe negativo). Iconos lista / **+**.

**Ficha de inmueble.** Detalle muy completo:
- Cabecera: dirección, etiqueta de uso (**"Vivienda habitual"**), **% de propiedad por titulares** (50/50).
- **Información catastral** — referencia catastral, año, clase, uso principal, superficie (de Catastro).
- **Valor** — gráfico + **Mi adquisición** (fecha/precio) · **Valor catastral** (desglose suelo/construcción) · **Valor del m²** · **Mi plusvalía latente** · **Referencia de mercado** (valoración de **idealista.com**).
- **Renta anual (potencial)** — Potencial de renta (€/año y €/mes) · Potencial de rentabilidad neta (%) · Multiplicador de renta neta (años).
- **Hipoteca** — entidad, solicitud, capital inicial, plazo, total, intereses · gráfico **Euríbor + Tipo de interés** + Cuota mensual · **pendiente/amortizado de capital e intereses** (gráficos tipo "depósito").
- **Estructura de gastos** del inmueble (cuota hipoteca, comunidad, luz, IBI, gas, seguro de hogar, agua…) · **Documentos** (drag & drop) · **Comentarios**.

**Inv. Empresariales (listado).** Tarjetas de sociedad con logo + valor; badges **"Empresa familiar"** y de vinculación. En la demo: PerTab Patrimonial (12,4 M) y M.M.P. Publicidad (2,3 M).

**Ficha de inversión empresarial.** Cabecera con denominación social, badge **Empresa familiar** y **% de participación**. **Información mercantil**: **Situación mercantil** (desplegable: *Activa*…) · Fecha de constitución · **Capital social** · **NIF** · Objeto social. **Dividendo anual** (gráfico + Mi dividendo + Rendimiento neto). **Valor** (Mi adquisición · **Mi participación** · **Mi plusvalía latente**). **Estructura de gastos** · **Comentarios**.

**Portfolio financiero.** Tiene tres vistas combinadas:
- **Situación actual** — **Cuentas y depósitos** (tabla Activo · Entidad · Inversión · %) + **Cartera de inversión** (tabla Activo · **Tipo** [Fondo] · Entidad · **Familia de riesgo** [Renta Fija/Mixta/Variable/Monetario/Alternativos] · Inversión · %), con **fondos nominales reales** (Carmignac, DPAM, Pictet, Amundi…) y barra de composición por familia de riesgo. Métricas **Revalorización prevista** (4,30 %) y **Plusvalía acumulada**.
- **Proyección futura** — gráfico de área a 50 años por familia de riesgo (se alterna con la situación actual).
- **Vista por entidades** — **tarjetas por banco** (Santander, ING, Mutuactivos, MyInvestor) con saldo, desglose de cuentas/carteras, **botón + y engranaje ⚙ por entidad**, y **"Última actualización"** con fecha distinta por entidad (cadencia de agregación). MyInvestor desglosa **"Ahorro [nombre de cada hijo]"**. Bloque **Eventos** ("Rebalancear portfolio").

**Otros activos.** Listado tipo galería (Audi Q8, Rolex Sky-Dweller, Mercedes…) + **Eventos** (Compra de un barco). **Ficha individual** con: **Valor** y **gráfico de depreciación** (el valor decae con el tiempo, p. ej. 90.000 → 959 €), **Mi adquisición**, **Mi plusvalía latente** (puede ser **negativa**), **% de titularidad**, **Estructura de gastos** (gasolina, seguro de vehículo, mantenimiento, peajes, parking…), **Renta anual** ("Sin rentas definidas"), **Documentos** y **Comentarios**. → Confirma que el motor **modela depreciación** de bienes.

### 3.3 — MÓDULOS

**Contenido NO documentado.** El submenú "MÓDULOS" aparece colapsado en todas las pantallas y **nunca se despliega** en ninguna captura, ni se describe en la web oficial, notas de prensa o transcripciones.

*Hipótesis (inferida, no verificada):* dado que el cálculo fiscal básico (IRPF, Seguridad Social, Cuota de Solidaridad) ya vive dentro de las fichas de miembro, y que MÓDULOS está separado de Monitores/Fichas/Laboratorio, lo más probable es que contenga **utilidades temáticas empaquetadas** (p. ej. "Jubilación", "Sucesión/Herencia", "Fiscalidad", "Protección/Seguros") que **reagrupan y presentan** el cálculo existente, más que un motor nuevo. La única pista pública es que iCapital/iSafe (marca blanca de Wealthabout) menciona analizar "implicaciones fiscales" de los escenarios — a alto nivel, sin evidencia de un motor de optimización fiscal o de ISD por comunidad autónoma. **Queda como el único hueco real del inventario.**

### 3.4 — LABORATORIO

El espacio de **escenarios "qué pasaría si"**, con dos pantallas:

**Simulador.** Lista de simulaciones guardadas como tarjetas; la tarjeta **"Mi Wealthabout"** es el escenario base, con "Última modificación". Cada simulación es un **escenario clonado y editable** del plan. Modal **"Nueva simulación"**: campo **Título** (obligatorio) + **Descripción** (máx. **280** caracteres, contador 0/280) + botones **Eliminar / Cancelar / Continuar**.

**Comparador de simulaciones.** Superpone **dos o más escenarios guardados** ("Mi Wealthabout" vs "Jubilación en la playa") sobre los mismos gráficos — **Patrimonio neto · Flujos netos · Ahorro corriente · Activos líquidos** —, **cada gráfico con su propio desplegable de métrica (▾)**. Panel lateral **"Comparador"** con la lista de escenarios comparados y, debajo, los **Eventos de cada escenario** mostrados en paralelo (p. ej. el escenario "Jubilación en la playa" añade en 2041 la compra de una casa de playa −2,5 M y la venta de la casa actual +1,2 M). Mantiene el **clic en la línea para fijar el año** y el **toggle € hoy / € futuro**.

> Matiz (corregido): los escenarios **sí son editables y personalizables** — el Simulador es donde se construye cada escenario (añadiendo/modificando eventos y supuestos), y por eso existen "Mi Wealthabout" y "Jubilación en la playa" con eventos propios. Lo que **no se llegó a capturar** es la pantalla de edición de un escenario. La única diferencia *posible* frente al "Compare/what-if" de ProjectionLab sería de **flujo** (en WA: construir el escenario en el Simulador → guardarlo → superponerlo en el Comparador; en PL: editar supuestos en vivo dentro de la propia comparación), pero **esto es una inferencia no verificada**, no una carencia confirmada de WA.

### 3.5 — CONFIGURACIÓN

**No capturada.** Solo visible como entrada del menú al pie. Contenido desconocido (*inferido:* gestión de cuenta, preferencias, datos del cliente).

### 3.6 — Variante "wealthabout PATRIMONIAL" (persona jurídica)

Sabor del producto para **sociedades patrimoniales y holdings**, con menú propio (ver §2). Se accede desde un miembro (breadcrumb "‹ SAMUEL"), es decir, la sociedad **cuelga de la unidad familiar**. Reutiliza los mismos componentes (Cuadro patrimonial en treemap y radial, Monitor anual, fichas de Inmuebles/Inv. Empresariales/Portfolio/Otros activos) pero añade entradas contables: **Resumen contable**, **Plan de negocio**, y desglosa Activos/Deudas/Ingresos/Gastos/Ahorro de la compañía. Su **Cuadro patrimonial** incorpora la totalidad de los activos de la sociedad (naves, despachos, fincas, participaciones en otras empresas como "Maderas Spain S.L"/"Eco Wine", autocaravana…). **Nivel de madurez** propio (Avanzado 63 %).

---

## 4. Tabla completa de elementos configurables

| Elemento | Ubicación | Opciones / detalle (observado · *inferido*) |
|---|---|---|
| **Buscador de clientes** | Listado de clientes (gestor) | por NIF o nombre |
| **Alta de cliente (+)** | Listado de clientes | crea cliente nuevo |
| **Carga automática — campo identidad** | Modal huella digital | "Introduce DNI o NIE del cliente" + checkbox T&C |
| **Carga automática — organismos (Cl@ve PIN)** | Modal huella digital | **AEAT** ✅ · **Catastro** ✅ · **Seguridad Social** ✅ (QR + código de verificación) |
| **Slider temporal** | Todos los Monitores | Hoy · 2021 → 2076 (fija el año mostrado) |
| **Desplegable de agrupación** | Monitores (arriba dcha.) | "Mi Wealthabout" · **"Por recurso"** · *(por miembro / titular / categoría)* |
| **Clic en la línea "fijar año"** | Monitor vital · Comparador | cualquier año del eje 2021–2076 |
| **Toggle € hoy / € futuro** | Monitor vital · Comparador | valor presente vs valor futuro |
| **Exportar a PDF / Ampliar** | Cuadro patrimonial | iconos de la cabecera |
| **Slider "Periodo de jubilación"** | Ficha miembro › Jubilación | 65–69 años; recalcula pensión, €/mes y % en cada extremo |
| **Desplegable "Situación mercantil"** | Ficha Inv. Empresarial | *Activa* · *(inactiva / en liquidación)* |
| **Botón + y engranaje ⚙ por entidad** | Portfolio financiero | añadir/configurar cuenta-cartera por banco |
| **% de titularidad** | Inmuebles · créditos · otros activos · empresas | reparto editable entre titulares |
| **Botones + (alta de elemento)** | Todas las fichas y el mapa patrimonial | alta de inmueble / empresa / activo / crédito / hito |
| **Modal "Nueva simulación"** | Laboratorio › Simulador | Título* · Descripción (0/280) · Eliminar / Cancelar / Continuar |
| **Selector de escenarios a comparar** | Laboratorio › Comparador | añade N escenarios guardados |
| **Desplegable de métrica por gráfico (▾)** | Comparador | Patrimonio neto · Flujos netos · Ahorro corriente · Activos líquidos · *(otras)* |
| **Drag & drop de documentos** | Fichas (Documentos) | bóveda documental por elemento |
| **Comentarios (texto libre)** | Fichas | nota por activo/elemento |

> Los **modales de alta/edición** de cada elemento (qué campos exactos pide al crear un inmueble, un ingreso, un evento, un crédito…) **no se han capturado**: solo vemos sus resultados. Es la principal laguna de configurabilidad.

---

## 5. Flujos de usuario principales

1. **Onboarding exprés de un cliente (el flujo diferencial).** Gestor → Listado de clientes → **+** → modal "Carga automática del cliente" → introduce DNI/NIE → el cliente valida con **Cl@ve PIN** organismo por organismo (AEAT, Catastro, Seguridad Social) → Wealthabout baja IRPF, Patrimonio, vida laboral, fichas catastrales, valoración de inmuebles y relaciones mercantiles → en **una sola reunión** el patrimonio queda consolidado y proyectado.
2. **Revisión patrimonial 360°.** Cliente → **Cuadro patrimonial** (treemap/radial) para ver la foto completa → drill-down por **Lo que tengo/debo/gano/gasto/ahorro** → **Resumen de situación** para los scores de salud financiera.
3. **Proyección a largo plazo.** **Monitor vital** → clic en un año para inspeccionar patrimonio, flujos y eventos de ese ejercicio → alternar **€ hoy / € futuro**.
4. **Profundizar en una ficha.** Fichas → Miembro (jubilación, vida laboral, créditos), Inmueble (catastro, hipoteca, valoración idealista), Empresa (mercantil, dividendo), Portfolio (carteras por entidad), Otros activos (depreciación).
5. **Simular una decisión vital.** **Laboratorio › Simulador** → "Nueva simulación" (clonar el plan) → añadir/editar eventos (compra/venta/jubilación/cambio de ingreso) → **Comparador** para superponer el escenario base contra el alternativo y cuantificar el impacto.
6. **Planificación de una sociedad.** Acceder a la variante **PATRIMONIAL** desde un miembro → Resumen contable / Plan de negocio + fichas de la sociedad.

---

## 6. Huecos / zonas no cubiertas por las capturas

| Zona | Estado |
|---|---|
| **Submenú MÓDULOS** | **No documentado** (ni en demo, ni en web, ni en notas de prensa) — único hueco de funcionalidad |
| **Configuración** | No capturada |
| **Resumen contable / Plan de negocio** (variante jurídica) | No capturados |
| **Ficha "Compañía"** (variante jurídica) | No capturada |
| **Modales de alta/edición** de cada ficha | No capturados (solo se ven resultados) |
| **Cómo se crea/configura un evento o hito** | No capturado (se ven los eventos, no su edición) |
| **Reporting/exportación** más allá del PDF del Cuadro patrimonial | No evidenciado |
| **Copiloto de IA / "hablar con tu patrimonio"** | No visto (declarado *en desarrollo* con Arktic en transcripciones) |
| **Vista que ve el cliente final** | No capturada (todo el material es del lado gestor) |
| **Monte Carlo / probabilístico** | No aparece — coherente con su filosofía determinista |
| **Optimización fiscal forward / ISD por CCAA** | No aparece — declaran explícitamente que **no** hacen recomendaciones de estructuras fiscales |

---

## 7. Observaciones de valor

### 7.1 — Público objetivo y casos de uso

**Comprador (cliente de Wealthabout):** la **entidad** — banca privada, EAFs, aseguradoras, asesorías fiscales/legales. **Usuario:** el **asesor/banquero**. **Sujeto:** el cliente final HENRY ("High Earnings, Not Rich Yet") y su unidad familiar, además de sus sociedades patrimoniales. Casos de uso centrales: consolidar el patrimonio 360° en una reunión, dar una foto viva y actualizada, proyectar a ~50 años, y simular decisiones vitales (jubilación, compraventa de inmuebles, prejubilación, ayudar a los hijos) como **herramienta de captación y fidelización** del asesor.

### 7.2 — La arquitectura de valor: el foso está en los datos, no en el cálculo

Lo que hace fuerte a Wealthabout es la **captación y actualización automática del patrimonio**: con Cl@ve PIN baja IRPF y Patrimonio de AEAT, fichas de Catastro, vida laboral y bases de cotización de la Seguridad Social, valoración de inmuebles vía idealista, consolidación financiera vía Flanks y participaciones vía Informa. Eso, sumado a un equipo con ~20 años construyendo herramientas de planificación para entidades y al músculo de integración de Arktic, es un **foso difícil y caro de replicar**. La consolidación 360° (incluyendo sociedades, inmuebles con catastro y depreciación de bienes) es de las más completas del mercado español.

### 7.3 — Diferenciadores de Wealthabout

- **Onboarding por minería de datos** (Cl@ve PIN multi-organismo) — convierte horas de Excel en una reunión.
- **Consolidación 360° real** — financiero + inmobiliario + **participaciones empresariales** + pasivos, con variante específica para personas jurídicas.
- **Datos vivos** — actualización periódica por entidad, no una foto que muere al entregarla.
- **Visualización potente** — treemaps de patrimonio y de P&L, mapa radial, calendario vital, scores de salud financiera con explicación en lenguaje natural.
- **Motor de pensión pública detallado** (base reguladora, %, tasa de reemplazo, condiciones, slider de edad).
- **Distribución institucional** — ya en producción con A&G e iCapital (iSafe), modelo marca blanca.

### 7.4 — Carencias / debilidades (la ventana)

- **No hay motor de optimización fiscal hacia adelante.** Tiene el dato fiscal (IRPF/Patrimonio bajados de Hacienda) y lo computa como gasto, pero **renuncia deliberadamente** a proyectar y optimizar la fiscalidad y a recomendar estructuras (donaciones, rescate de planes, timing de plusvalías). Lo dicen ellos mismos: no hacen recomendaciones de estructuras fiscales.
- **Sin ISD / sucesiones por comunidad autónoma.** La herencia se trata como un hito en la línea temporal, sin motor de Impuesto de Sucesiones y Donaciones por CCAA.
- **Sin Monte Carlo / probabilístico.** Proyección puramente determinista basada en asset allocation; no hay probabilidad de éxito ni bandas de incertidumbre.
- **What-if: diferencia no confirmada.** Los escenarios de WA **son editables** (se construyen en el Simulador). No se pudo verificar si su comparación es menos ágil que la edición en vivo de ProjectionLab; **no debe tratarse como carencia hasta confirmarlo en una demo.**
- **Optimización ausente.** No hay módulos de "optimizar" (llenar tramos de IRPF, drawdown, residencia fiscal).
- **Dependencia de Cl@ve PIN y de terceros** (idealista, Flanks, Informa) — potente, pero con coste y dependencia.
- **IA aún no entregada** — el "hablar con tu patrimonio" está en desarrollo, no es producto.

### 7.5 — Lectura competitiva frente a la idea de SaaS de Omar

La conclusión operativa es nítida y refuerza lo ya trabajado:

1. **No competir en datos.** El onboarding por minería de datos es su foso; igualarlo es lento y caro. Si se replica algo, que sea lo esencial (bajar IRPF/Patrimonio vía Cl@ve y consolidación financiera vía un agregador), no reconstruir todo.
2. **Competir en cálculo.** El espacio que Wealthabout **deja vacío a propósito** —**proyección y optimización fiscal forward, ISD por CCAA, Monte Carlo, módulos de optimización**— es exactamente la tesis de profundidad del SaaS propuesto. Su propia renuncia (por cautela regulatoria y modelo de negocio) **valida la ventana**.
3. **La línea regulatoria de Omar encaja en esa ventana.** Wealthabout evita recomendar estructuras para no entrar en terreno regulado; el posicionamiento "**herramienta de cálculo y proyección, no asesoramiento**" permite hacer lo que ellos no: *mostrar* el cálculo fiscal y estrategias genéricas, sin recomendar producto.
4. **Pero la ventana no es permanente.** Con sus datos (AEAT/Catastro/Informa) + IA + Arktic, si Wealthabout decidiera activar la proyección y optimización fiscal, sería temible. **La velocidad importa.**

---

## 8. Autocrítica (segunda pasada)

- **El mayor punto ciego de este teardown es MÓDULOS.** Es justo la zona donde Wealthabout *podría* tener funcionalidad fiscal/optimización avanzada que contradiga la tesis de "ventana abierta". No he podido verla ni encontrarla públicamente. La hipótesis de que solo reagrupa cálculo existente es razonable pero **no verificada**; conviene confirmarla en una demo en vivo antes de fijar roadmap.
- **Material sesgado hacia el lado gestor y hacia una demo comercial.** Las capturas son de una demo de ventas con datos de ejemplo; podrían existir funciones reales no mostradas (o, al revés, pantallas "de escaparate" más pulidas que el producto entregado). No se ha visto la experiencia del cliente final.
- **Inferencias marcadas, pero abundantes.** Tipos de cuenta (Lite/PB), opciones de desplegables colapsados, ausencia de Monte Carlo "porque no aparece" — son lecturas razonables, no certezas. La ausencia en capturas no prueba ausencia en el producto.
- **Datos de terceros (Flanks/Informa/idealista) y la IA** proceden de transcripciones y notas de prensa, no de las capturas; su alcance real puede variar.
- **Riesgo de wishful thinking competitivo:** es cómodo concluir que "el hueco fiscal está libre". Es lo más probable según todas las señales, pero el siguiente paso correcto es **verificarlo con una demo y/o probando iSafe**, no darlo por sentado.

## 9. Fuentes y referencias

- **Capturas de la demo oficial de Wealthabout** (tres tandas), base de todo el inventario de pantallas, componentes y configurables.
- **Transcripciones de los vídeos corporativos de Wealthabout** (presentación de la compañía, lifeplanning, minería de datos, "lo que no hacemos", HENRY, alianza con Arktic, entrevista en Capital Intereconomía) — origen del modelo de negocio, los pilares (minería de datos + acompañamiento), las fuentes de datos (AEAT, Catastro, Seguridad Social, idealista, Flanks, Informa) y la renuncia explícita a recomendaciones de inversión y de estructuras fiscales.
- **Web oficial** wealthabout.io (página HENRY/Lifeplanner) — confirma posicionamiento y preguntas guía (cuánto vale tu casa, cuánto será tu pensión, cuánto pagas de impuestos; segunda residencia, prejubilación, herencias).
- **Nota de prensa A&G × Wealthabout** (Funds Society, oct. 2025) — visión 360º, captación de fuentes públicas/privadas, proyección y simulación de hitos.
- **Nota de prensa iCapital × Wealthabout — "iSafe"** (Bolsamania/Europa Press, abr. 2026) — simulación de escenarios con "implicaciones fiscales" a alto nivel + bóveda documental por mapa patrimonial.
- **Limitaciones de fuentes:** el contenido del submenú **MÓDULOS** y la **Configuración** no constan en ninguna fuente pública; el copiloto de **IA** se describe como en desarrollo. Todo lo no observado se ha marcado como *inferido* o como hueco, no como hecho.
