# Scenia Wealth — contexto completo (rules + specs)

Documento generado concatenando las rules de Cursor y los documentos de spec referenciados. Cada sección está separada por el path del archivo de origen.

---

## `.cursor/rules/scenia-project.mdc`

---
description: Qué es Scenia Wealth, fuente de verdad y alcance CORE/MVP
alwaysApply: true
---

# Scenia Wealth — alcance del proyecto

Mockup clicable del MVP de **Scenia Wealth**: SaaS de planificación patrimonial y fiscal para asesores financieros independientes (EAF) en España.

## Fuente de verdad

- Funcionalidades y pantallas: `docs/spec/scenia-wealth-funcionalidades.md` (v12)
- Sistema de diseño: `docs/spec/scenia-wealth-design-tokens.md`

**Construir solo lo marcado CORE y MVP.** Lo marcado V2 y Futura no se construye, pero la navegación queda preparada para que quepa.

**Si algo no está en el maestro, PREGUNTA antes de inventarlo.** Lo que queda fuera suele estar fuera por una decisión, no por olvido.

Si algo en la conversación contradice estas reglas, mandan las reglas del proyecto.

---

## `.cursor/rules/scenia-architecture.mdc`

---
description: Arquitectura de navegación, escenarios y plan base
alwaysApply: true
---

# Arquitectura — 3 reglas que no se negocian

1. **Las fichas NO son entradas de menú.** Se abren pinchando el elemento en el treemap o en las pestañas de Patrimonio. La barra de nivel 1 tiene exactamente 5 entradas: `Patrimonio · Fiscalidad · Proyección · Escenarios · Historial`.
2. **El escenario es del CLIENTE, no del activo.** Dentro de un escenario, el menú de eventos aparece **completo** (cualquier activo), no limitado al elemento por el que se entró.
3. **El plan base es el primer escenario** ("Situación actual"), no un caso especial: aparece en la lista, es comparable y editable como cualquier otro.

---

## `.cursor/rules/scenia-firewall.mdc`

---
description: Firewall MiFID — Scenia muestra cálculo fiscal, nunca recomienda
alwaysApply: true
---

# EL FIREWALL — 8 reglas innegociables

Scenia *muestra* el cálculo fiscal; **nunca recomienda**. Esa línea es su posición legal (MiFID) y vive en la interfaz. Ninguna se rompe por ningún motivo.

1. **Tinta neutra en toda comparación fiscal.** Nunca verde/rojo/ámbar para señalar qué opción es mejor. **Nunca coronar un ganador.**
2. **"orientativo"** acompaña siempre a cualquier cifra fiscal.
3. **Verde** (`--green` `#0E7C4A`) y **ámbar** (`#B5732A`): solo para hechos objetivos de un activo (plusvalía latente, semáforo de liquidez). **Rojo** (`--coral-deep` `#D14A38`): solo para errores de validación de formulario. Nada más.
4. **Nota del asesor obligatoria** en el modal antes de generar cualquier informe PDF.
5. **El asesor no puede editar parámetros fiscales** (tramos, tipos, reglas). Viven en la tabla del motor.
6. **Cifra calculada ≠ cifra introducida.** Lo que calcula el motor nunca tiene el mismo aspecto visual que lo que teclea el asesor. Marcar "introducido por el asesor, no calculado".
7. **CCAA sin cobertura → aviso explícito.** Solo la Comunitat Valenciana tiene parámetros fiscales. Si se elige otra: *"el cálculo fiscal solo está disponible para la Comunitat Valenciana"*. **Nunca mostrar cifras de CV para otra comunidad.**
8. **NO construir el liquidador de Impuesto de Sociedades.** F4 Sociedad sí (datos, participación, eventos); el cálculo societario queda marcado "pendiente de definir". **No inventar cifras.**

**Regla de oro:** ante la duda, no inventes un número. Un hueco marcado es correcto; una cifra fiscal inventada es un fallo grave.

---

## `.cursor/rules/scenia-stack.mdc`

---
description: Stack Next.js/Tailwind y límites estrictos del mockup
alwaysApply: true
---

# Stack y límites del mockup

**Next.js (App Router) + TypeScript + Tailwind.** Se eligió Next.js aunque sea un mockup porque migrará a producto real: el salto debe ser *rellenar*, no reconstruir.

**Esto es un MOCKUP. NO construir:**

- Backend, rutas API (`app/api/...`), Server Actions, fetching real.
- Base de datos ni Supabase. El seed vive hardcodeado en `/lib/seed.ts`.
- Autenticación, variables de entorno, deployment.
- Motor fiscal real: se simula con funciones puras que devuelven las cifras fijas del seed (A ≈ 14.200 € / B ≈ 9.800 €).

Client components (`'use client'`) donde haga falta interactividad: pestañas, selectores, clic-en-año, modales.

---

## `.cursor/rules/scenia-design.mdc`

---
description: Tokens Estilo G, tipografía, superficies y FilaFiscal con firewall
alwaysApply: true
---

# Diseño

Usar **exactamente** los tokens de `docs/spec/scenia-wealth-design-tokens.md` (Estilo G · "Papel frío").

- **Doble plano:** fondo de app azul-noche `#0C1424`; contenido en superficies de papel claro `#FBFCFE` con tinta oscura encima.
- **Sin sombras.** Las superficies se separan por color y borde, nunca por elevación.
- **DM Sans**, densidad alta (11px es el tamaño de trabajo), labels en mayúsculas con tracking, `font-variant-numeric: tabular-nums` SIEMPRE en columnas de cifras.
- Radio de trabajo **8px**; bordes `1px solid var(--line-2)`.
- **Prohibido el aspecto genérico de IA:** ni Inter, ni degradados violeta-índigo, ni glassmorphism, ni sombras marcadas.

**El componente `FilaFiscal` (CT2) debe llevar el firewall incorporado por diseño** — que sea imposible pintarla en verde/rojo/ámbar desde fuera.

---

## `.cursor/rules/scenia-language.mdc`

---
description: Idioma del código vs UI, formato de números, nomenclatura de dominio
alwaysApply: true
---

# Idioma

- **Código, nombres de variables y funciones: inglés.**
- **Todo el texto visible por el usuario: español (es-ES).** Ningún "Save", "Search" ni "Dashboard" suelto en la interfaz.
- **Números en formato español:** `14.200,00 €` · usar `Intl.NumberFormat('es-ES', { style:'currency', currency:'EUR' })`.
- Los nombres de dominio pueden ir en español (`FilaFiscal`, `FichaPersona`) — coherente con la especificación. Los componentes genéricos, en inglés (`Card`, `Button`, `Table`).
- **Nunca usar la voz de Wealthabout** ("Lo que tengo / lo que gano / lo que gasto"). Los nombres son neutrales: Activos, Pasivos, Ingresos, Gastos, Ahorro.

---

## `.cursor/rules/scenia-workflow.mdc`

---
description: Forma de trabajar — enseñar pantallas, no inventar fuera del maestro
alwaysApply: true
---

# Forma de trabajar

- **Enseña cada pantalla según la termines**, no todas al final.
- No añadas funcionalidad que no esté pedida en el maestro, aunque parezca una mejora obvia.
- No copies patrones de competidores por iniciativa propia; lo relevante ya está absorbido en el maestro.

---

## `.cursor/rules/scenia-visual-reference.mdc`

---
alwaysApply: true
---
# Referencia visual

`docs/spec/scenia-wealth-mockup.html` es la **realización visual de referencia** del producto: composición de tablas, treemap, tarjetas, chips, modales y fila fiscal.

- Los **tokens** (`docs/spec/scenia-wealth-design-tokens.md`) definen los valores; el **mockup** define cómo se componen. Ante duda visual, manda el mockup.
- El mockup es HTML/CSS plano; el producto es Next.js + Tailwind. **Traducir, no copiar**: usar las variables de `tailwind.config.ts` y los componentes React existentes.
- El mockup **no** es referencia de arquitectura ni de lógica — para eso manda `docs/spec/scenia-wealth-funcionalidades.md`.
- **No importar los atajos de la demo**: cifras fijas, datos hardcodeados, edición de eventos por eliminar-y-recrear, ni el `!important` del CSS.
- Cualquier pantalla nueva debe heredar el patrón visual de P1 Cartera y P3 Patrimonio, ya alineadas.
---

## `docs/spec/parametros-fiscales-pendientes.md`

# Parámetros fiscales pendientes de verificación

Documento para el fiscalista. Toda cifra que consume el motor de Scenia aparece aquí.
**Estado actual de todos los parámetros: `a-verificar`.** Fecha de consulta de fuentes: **2026-07-29**.

Fuente de verdad en código: `src/lib/fiscal/parametros.ts`. Ninguna cifra fiscal debe vivir fuera de ese módulo.

---

## Cómo leer esta lista

Para cada parámetro:

| Campo | Significado |
| --- | --- |
| **Qué es** | Rol en el liquidador |
| **Valor actual** | Lo que lleva el mockup hoy |
| **Fuente citada** | Dónde se buscó (BOE / AEAT / DOGV / hisenda.gva) |
| **Qué confirmar** | Pregunta concreta al fiscalista |

Mientras el estado sea `a-verificar`, la UI marca **orientativo · parámetros (a verificar)** junto a toda cifra dependiente.

---

## 1. Escala estatal · base liquidable general

- **Qué es:** Tipos del art. 63.1 LIRPF (cuota íntegra estatal).
- **Valor actual:**  
  0–12.450 @ 9,5 % · 12.450–20.200 @ 12 % · 20.200–35.200 @ 15 % · 35.200–60.000 @ 18,5 % · 60.000–300.000 @ 22,5 % · >300.000 @ 24,5 %  
  (con cuotas acumuladas AEAT: 0 / 1.182,75 / 2.112,75 / 4.362,75 / 8.950,75 / 62.950,75)
- **Fuente citada:** Ley 35/2006 art. 63.1 · AEAT Manual Renta 2025 — [Gravamen estatal](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c15-calculo-impuesto-determinacion-cuotas-integras/gravamen-base-liquidable-general/gravamen-estatal.html)
- **Qué confirmar:** Vigencia para ejercicios **2026–2033** (horizonte del comparador). ¿Alguna PGE posterior modifica tramos o tipos?

## 2. Escala autonómica · Comunitat Valenciana · base general

- **Qué es:** Tramo autonómico art. 2 Ley 13/1997 (CV).
- **Valor actual (texto a 1-ene-2024):**  
  0–12.000 @ 9 % · … · >200.000 @ 29,5 %  
  (cuotas acum.: 0 / 1.080 / 2.280 / 3.780 / 5.530 / 7.530 / 9.780 / 12.280 / 19.700 / 33.450 / 47.700)
- **Fuente citada:** Ley 13/1997 art. 2 · texto actualizado hisenda.gva.es a 1-ene-2024. Ley 9/2022 (escala 11 tramos). Ley 5/2025 (DOGV) parece no tocar la tarifa (solo deducciones).
- **Qué confirmar:**  
  1) ¿La escala de 2024 sigue vigente en **2025 y 2026**?  
  2) Hay noticias de reforma CV 2026 que rebajaría cuotas hasta 200.000 € — **no incorporada**. ¿Aplica al ejercicio 2026?

## 3. Escala del ahorro · estatal (art. 66)

- **Qué es:** Mitad estatal de la base del ahorro.
- **Valor actual (efectos 1-ene-2025, Ley 7/2024):**  
  0–6.000 @ 9,5 % · 6.000–50.000 @ 10,5 % · 50.000–200.000 @ 11,5 % · 200.000–300.000 @ 13,5 % · >300.000 @ **15 %**
- **Fuente citada:** Ley 35/2006 art. 66 · Ley 7/2024 DF 7ª · AEAT novedades normativa 2024
- **Qué confirmar:** Último tramo 15 % (antes 14 %) vigente en 2026+. Combinado con autonómica = 30 % en el tope.

## 4. Escala del ahorro · autonómica (art. 76)

- **Qué es:** Mitad autonómica espejo de la estatal tras Ley 7/2024.
- **Valor actual:** Idénticos tramos/tipos a la mitad estatal (tope 15 %).
- **Fuente citada:** Ley 35/2006 art. 76 · Ley 7/2024 DF 7ª · AEAT novedades 2024
- **Qué confirmar:** Que CV no tenga especialidad distinta en el ahorro (régimen común).

## 5. Mínimo del contribuyente

- **Qué es:** Art. 57 LIRPF — se minora de la base al calcular cuota (tipo cero sobre el mínimo).
- **Valor actual:** 5.550 € general · +1.150 si >65 · +1.400 adicional si >75
- **Fuente citada:** Ley 35/2006 art. 57 · AEAT Manual Renta 2025
- **Qué confirmar:** Cuantías estatales 2026+. ¿CV aplica mínimo autonómico distinto para el gravamen autonómico? (hoy el motor usa el mismo mínimo en ambas mitades — simplificación).

## 6. Mínimo familiar (descendientes / ascendientes / discapacidad)

- **Qué es:** Arts. 58–60 LIRPF.
- **Valor actual:** **VACÍO — no modelado.**
- **Fuente citada:** —
- **Qué confirmar:** Si el liquidador MVP debe aplicar mínimos por hijos. Hoy se ignora (hueco marcado).

## 7. Reducción 40 % planes pre-2007 (DT 12ª)

- **Qué es:** Reducción sobre la parte de prestación en **forma de capital** correspondiente a aportaciones ≤ 31/12/2006.
- **Valor actual:** 40 % · solo capital · fecha corte 2006-12-31
- **Fuente citada:** LIRPF DT 12ª · AEAT Manual Renta 2025 (prestaciones capital)
- **Qué confirmar:**  
  1) Plazos temporales (contingencia + 2 ejercicios) en el flujo del producto.  
  2) El motor **no inventa** la fracción pre-2007: si falta el dato del partícipe, **no aplica** la reducción y lo declara. ¿OK?

## 8. Exención reinversión renta vitalicia >65 (art. 38.3)

- **Qué es:** Excluye de gravamen ganancias si se reinvierten en renta vitalicia.
- **Valor actual:** Límite 240.000 € · plazo 6 meses
- **Fuente citada:** Ley 35/2006 art. 38.3 · AEAT Manual Renta 2025
- **Qué confirmar:** Requisitos reglamentarios del contrato (DA 9ª) — hoy solo se muestra aviso, sin liquidar la exención automáticamente cuando hay reinversión.

## 9. Horizonte del periodo de la fila fiscal (CT2)

- **Qué es:** Años sobre los que se agrega `impuestosPeriodo` en el comparador.
- **Valor actual:** 2026–2033
- **Fuente citada:** Spec de producto (no norma)
- **Qué confirmar:** Si el periodo debe ser configurable o anclarse a otro horizonte.

## 10. Aproximaciones UI de tramos combinados

- **Qué es:** Barras del visor P4 (19/24/30/37/45/47 % general · 19/21/23/27/30 % ahorro).
- **Valor actual:** Suma orientativa estatal+autonómica / mitades del ahorro.
- **Fuente citada:** Mockup HTML · **NO es tarifa oficial**
- **Qué confirmar:** Si se mantienen como pedagogía visual o se sustituyen por dos escalas separadas oficiales.

---

## Huecos explícitos (no hay valor)

| Hueco | Por qué |
| --- | --- |
| % aportaciones pre-2007 por plan | Dato de partícipe; sin él no se aplica DT 12ª |
| Mínimos por descendientes/ascendientes | No modelados en MVP |
| Escala CV 2026 post-reforma | Noticia de prensa no contrastada con DOGV definitivo |
| Liquidador IS (dividendos / venta participación) | Firewall · pendiente de definir |
| Reducción trabajo / cotizaciones | El motor apila el rescate sobre **ingresos brutos seed**, no sobre base liquidable neta de reducciones |

---

## Cómo liquida el motor hoy (para contrastar cifras)

1. **Reembolso de fondo:** `ganancia = importe × (plusvalíaLatente / valor)` · se reparte por titularidad · cada titular paga **cuota marginal del ahorro** (base ahorro previa = 0) · anual × años del rango.
2. **Traspaso de fondo:** cuota 0 (art. 94).
3. **Rescate de plan (renta):** importe íntegro a base general · **sin** reducción 40 % · cuota = IRPF(base+rescate) − IRPF(base) con escalas estatal+CV y mínimo personal · anual × años.
4. **Rescate capital:** igual, pero solo aplica 40 % si se informa `fraccionPre2007`.
5. **Rollup del escenario:** suma solo aportaciones `calculado`/`neutro` en 2026–2033. Eventos IS / impacto tecleado → **parcial**, no sumados.

Cualquier cifra distinta de las ilustrativas 14.200 / 9.800 del seed antiguo es **esperable**: aquellas no provenían de este liquidador.

---

## `docs/spec/scenia-wealth-design-tokens.md`

# Scenia Wealth — Sistema de diseño (tokens del Estilo G · "Papel frío")

> **Origen.** Valores **medidos** del mockup de referencia `patrimonio-estilo-G-17pantallas.html` (17 pantallas, estilo validado). Este documento sustituye por completo a la versión anterior. Cursor debe usar estos tokens tal cual, sin desviarse hacia el aspecto genérico de IA (Inter, degradados violeta-índigo, glassmorphism), que el "Template Test" de la marca rechaza.
>
> **Territorio de marca:** *"tinta sobre papel, luz sobre escena"* — tradición del documento notarial español, sobrio, denso en información, sin decoración gratuita.

---

## La estructura de doble plano (la clave del estilo)

- **El escenario** — el fondo de la aplicación es azul-noche `#0C1424` (`body`).
- **El papel** — el contenido vive en superficies claras `#FBFCFE` que flotan sobre el escenario, con **tinta oscura** encima.

Es decir: **pantallas de papel claro sobre fondo oscuro de app.** El mismo color `#0C1424` es a la vez el escenario y la tinta principal — esa dualidad es deliberada y da coherencia al conjunto.

**Sin sombras.** Las superficies se separan por color y borde, no por elevación. Nada de `box-shadow` perceptible, nada de glassmorphism, nada de degradados.

---

## Variables CSS (copiar tal cual a `:root` / Tailwind)

```css
:root{
  /* Tinta — escala de 7 niveles */
  --ink:#0C1424;        /* tinta principal (y color del escenario/fondo de app) */
  --ink-2:#1A2438;      /* tinta secundaria · también superficie oscura destacada */
  --ink-3:#3A4660;      /* tinta terciaria */
  --slate:#6E7A92;      /* texto secundario */
  --mute:#8A95A8;       /* texto atenuado (el más usado en labels) */
  --faint:#9AA4B6;      /* texto muy atenuado */
  --faintest:#B8C0CE;   /* el más claro de la escala */

  /* Papel y líneas */
  --paper:#FBFCFE;      /* superficie principal (las "pantallas") */
  --paper-2:#F4F6FA;    /* superficie secundaria, fondos suaves, pills neutras */
  --line:#EEF1F6;       /* separadores suaves */
  --line-2:#E2E6EE;     /* bordes estándar */

  /* Acentos */
  --blue:#3A5BC8;       /* azul informativo: enlaces, selección, elementos activos */
  --blue-2:#3A5BC8;     /* reservado (hoy idéntico al azul) */
  --coral:#FF6B5A;      /* coral de marca — uso MUY moderado */
  --coral-deep:#D14A38; /* hover del coral · único rojo permitido (errores de formulario) */
  --green:#0E7C4A;      /* verde de hechos objetivos (plusvalía latente, liquidez alta) */
  --green-bg:#E3F5EC;   /* fondo suave del verde */
}
```

## Colores contextuales (fuera de `:root`, con su uso exacto)

**Fondos suaves de acento (sobre papel):**
- `#E7ECFB` — azul suave: fondo de avatares/iniciales (`.av.f`).
- `#FBEAE7` — coral suave: fondo de pills de categoría (`.pill.emp`); texto en coral.
- Pills neutras: `--paper-2` de fondo + `--slate` de texto (`.pill.ind`).

**El semáforo de liquidez** (propiedad objetiva del activo — ver firewall):
- Liquidez alta (`.liq.a`): fondo `--green-bg` + texto `--green`.
- Liquidez media/baja (`.liq.b`): fondo `#FBF1E7` + texto **ámbar `#B5732A`**.

**Superficies oscuras** (tarjetas destacadas sobre el papel, p. ej. la de capacidad de ahorro — paleta propia invertida):
- Fondo: `--ink-2` (`#1A2438`) · líneas internas: `#1E2A42` · bordes: `#2A3650`.
- Texto claro: `#E8ECF4` · cifra positiva: verde claro `#5FD89A`.
- Tags fiscales sobre oscuro: fondo `#3A2E1A` + texto ámbar `#E0A868` (`.ftag.p`) · fondo `#3A1E1A` + texto coral claro `#FF9585` (`.ftag.v`).
- El coral sobre oscuro puede ir con fondo `--ink-2` y borde `#2A3650`.

---

## Tipografía

- **Familia única:** `'DM Sans'` (Google Fonts, pesos 400/500/600/700). Nada de Inter ni pila de sistema.
- **Pesos:** 600 y 700 dominan casi a partes iguales (700 para cifras y énfasis, 600 para el trabajo diario), 500 para texto secundario, 400 residual.
- **Escala — densidad alta, el estilo es compacto:** `11px` es el tamaño rey (labels y datos), luego 13 / 12 (cuerpo), 14 / 15 (cuerpo destacado), 16 / 17 / 19 (subtítulos), 28px (título grande). Micro: 10.5 / 10 / 9.5.
- **Labels en mayúsculas:** `text-transform: uppercase` + `letter-spacing: 0.04–0.08em` + tamaño 10-11px + color `--mute`. Es el patrón de micro-etiqueta del estilo.
- **Títulos grandes:** `letter-spacing` **negativo** (−0.02 a −0.03em).
- **Cifras:** `font-variant-numeric: tabular-nums` SIEMPRE en columnas de números — imprescindible en tablas financieras.

---

## Formas

- **Border-radius:** `8px` es el radio de trabajo (el más usado). Después 12px (tarjetas grandes), 9-10px (medianas), 5-6px (pills, tags pequeños), 14px (contenedores destacados), 2-3px (marcas mínimas), `50%` (avatares circulares).
- **Estilo de tarjeta sobre papel:** fondo `--paper` o blanco, borde `1px solid var(--line-2)`, radio 8-12px, **sin sombra**.
- **Separadores:** `1px solid var(--line)` para filas internas; `--line-2` para contornos.

---

## Reglas de color del firewall (NO negociables)

1. **Toda comparación fiscal va en tinta neutra** (`--ink` / `--blue`). La fila fiscal (CT2) **nunca** usa verde/rojo/ámbar para señalar qué opción es mejor. Nunca se corona un ganador.
2. **El verde** (`--green`) es solo para **hechos objetivos de un activo**: la plusvalía latente y la liquidez alta del semáforo. Jamás para "esta opción es mejor".
3. **El ámbar** (`#B5732A`) es solo para el **semáforo de liquidez** (media/baja) — describe una propiedad del activo, no compara escenarios. *(Ampliación derivada de este diseño de referencia: el semáforo es compatible con el firewall precisamente porque califica un hecho, no una alternativa.)*
4. **El rojo** (`--coral-deep` `#D14A38`) es solo para **errores de validación de formulario**. Nunca para cifras fiscales.
5. **Coral y azul son marca/interacción, no estado** — no significan bueno ni malo.
6. `"orientativo"` acompaña a toda cifra fiscal, como texto en `--mute`.

---

## Cómo usarlo en Cursor

1. Volcar las variables `:root` tal cual en el CSS global, y mapearlas en `tailwind.config.ts` (`theme.extend.colors: { ink: 'var(--ink)', ... }`).
2. Importar DM Sans (400/500/600/700) en el layout raíz.
3. `body` con `background: var(--ink)`; el contenido en contenedores `--paper`.
4. Construir los componentes base ANTES de ninguna pantalla: `Card`, `Button`, `Table` (con `tabular-nums`), `Tabs`, `Badge`/pills, `Modal`, el label-uppercase, el semáforo de liquidez, y **`FilaFiscal` (CT2) con la regla 1 incorporada por diseño** — que sea imposible pintarla en verde/rojo/ámbar desde fuera.
5. La tarjeta oscura (capacidad de ahorro y similares) es un componente propio con la paleta de superficie oscura de arriba.
---

## `docs/spec/scenia-wealth-funcionalidades.md`

# Scenia Wealth — Funcionalidades (documento maestro · v12)

> **Documento único de funcionalidades.** Sustituye por completo a cualquier versión anterior. Organizado por pantalla; cada funcionalidad lleva su fase.
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
| Añadir persona | Al expediente ya creado | MVP |
| Rol en el expediente | Titular · cónyuge · hijo | V2 |

## 3.3 · Pestaña Activos

> **Agrupada internamente por tipo, con columnas propias por grupo.** Una tabla plana obligaría a mostrar columnas vacías para media tabla (la fecha de adquisición importa en un fondo, no en un coche). La agrupación recupera la centralización por tipo que da el grupo FICHAS de WA, sin añadir entradas de menú.

| Funcionalidad | Detalle | Fase |
|---|---|---|
| **Grupo Portfolio financiero** | Columnas: instrumento · tipo fiscal · valor · **fecha de adquisición** · plusvalía latente · titularidad | CORE·MVP |
| **Grupo Inmuebles** | Columnas: nombre · valor · fecha de adquisición · hipoteca asociada · titularidad | MVP |
| **Grupo Inversiones empresariales** | La participación en una Sociedad es un activo. Columnas: sociedad · % participación · valor. Pinchar abre F4 · Sociedad | MVP |
| **Grupo Otros activos** | Columnas: nombre · tipo · valor · titularidad. Captación 100 % manual, también en V2 | MVP |
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
| Campo "fin de tipo fijo" | Para el nivel 2 de amortización y la alerta correspondiente | V2 |

## 3.5 · Pestaña Ingresos

| Funcionalidad | Detalle | Fase |
|---|---|---|
| Desglose por Persona y fuente | Trabajo · alquiler · dividendo · pensión · otros | CORE·MVP |
| **Alimenta el motor fiscal** | El total por persona es el input del liquidador de base general (regla ②) | CORE·MVP |
| Eventos genéricos desde la pestaña | Cambios de flujo futuros ("en 2028 entra un ingreso extraordinario"). Sin cálculo fiscal | MVP |

## 3.6 · Pestaña Gastos

| Funcionalidad | Detalle | Fase |
|---|---|---|
| Categorías de gasto recurrente | — | MVP |
| Campo "Vincular a" | Persona · inmueble · sociedad · sin vincular. Permite ver el coste real de un activo sin repartir el gasto por siete fichas como hace WA | MVP |
| Solo los intereses de deuda cuentan como gasto | Ver separación interés/capital abajo | MVP |
| Eventos genéricos desde la pestaña | "A partir de 2030 baja el gasto familiar" | MVP |

## 3.7 · Pestaña Ahorro

| Funcionalidad | Detalle | Fase |
|---|---|---|
| Capacidad de ahorro | Ingresos − gastos + amortización de capital | MVP |
| Solo lectura | Es un resultado calculado, no un dato que se toque. **No admite eventos** | MVP |
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
| KPIs de por vida | IRPF total proyectado + tipo efectivo medio (ETR) | MVP |
| **Visor de tramos** | Escala estatal + autonómica (CV), con marca de en qué tramo cae cada renta y **cuánto espacio queda hasta el siguiente**. Es la conversación de valor con el cliente | CORE·MVP |
| **Base general vs base del ahorro separadas** | Son dos escalas distintas; mezclarlas sería un error de fondo | CORE·MVP |
| Serie de IRPF año a año | Con clic-en-año | MVP |
| Controles | Selector de Persona · selector de año · toggle €hoy/€futuro | MVP |
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
| Un gráfico + selector de serie | Patrimonio · flujos · ahorro · líquidos · **IRPF proyectado** | MVP |
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
| **Comparador: superponer escenarios** | Un gráfico + selector de métrica (patrimonio · líquidos · IRPF acumulado). Soporta N escenarios | CORE·MVP |
| **Fila fiscal neutra (CT2)** | `Impuestos del periodo · A 14.200 € · B 9.800 € · Δ 4.400 € · orientativo`. **La pieza central del producto** | CORE·MVP |
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
| **Aportar a plan de pensiones** | Importe · año | Tiene fiscalidad real (reducción en base general con límite) pero **no está entre las 5 reglas** → va como genérico sin cálculo. Candidata a **regla ⑥ en V2** | MVP (genérico) · V2 (regla) |
| **Evento genérico** | Ingreso / gasto / movimiento libre | **Sin cálculo fiscal.** Si el asesor teclea un impacto, se marca "introducido por el asesor, no calculado". Disponible también desde Ingresos y Gastos | MVP |

| Funcionalidad del modal | Detalle | Fase |
|---|---|---|
| Menú contextual por tipo de activo | Solo ofrece los eventos posibles para ese elemento | CORE·MVP |
| Reparto de titularidad en el evento | Si el activo tiene varios titulares, por defecto actúa en proporción a su % | MVP |
| Distinción visual calculado vs introducido | Una cifra del motor nunca tiene el mismo aspecto que una tecleada por el asesor. **Es firewall** | CORE·MVP |

## CT2 · Fila fiscal neutra

| Funcionalidad | Detalle | Fase |
|---|---|---|
| La fila del comparador | `Impuestos del periodo · A · B · Δ · orientativo` | CORE·MVP |
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

| Pieza | Detalle | Fase |
|---|---|---|
| Clasificador + liquidadores | Función pura, sin efectos secundarios | CORE·MVP |
| Tabla de parámetros por (año, CCAA) | Arranca en **Comunitat Valenciana** | CORE·MVP |
| **① Traspaso vs reembolso** | Traspaso Art. 94 sin peaje, el destino hereda valor y fecha; reembolso realiza plusvalía → base del ahorro. FIFO básico | CORE·MVP |
| **② Rescate del plan** | Capital / renta / mixto → base general, apilado sobre ingresos del año | CORE·MVP |
| **③ Amortizar hipoteca vs invertir** | — | CORE·MVP |
| **④ Pignorar** | No realiza plusvalía → cuota 0 | CORE·MVP |
| **⑤ Venta de inmueble >65** | Exención por reinversión en renta vitalicia, con límite `(a verificar)` | CORE·MVP |
| ⑥ Aportación a plan de pensiones | Reducción en base general con límite | V2 |
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
- **Personas:** Carlos (58, nacido 1968) · Marta (55, nacida 1971) · Lucía (sin ingresos, demo `sin_ingresos`)
- **Fondo A:** 300.000 €, adquirido en 2014, **Carlos 60 % / Marta 40 %**, plusvalía latente +120.000 €
- **Plan de pensiones de Carlos:** 120.000 €, desde 2009, 100 % suyo
- **Vivienda en Jávea:** 420.000 €, **50/50**, hipoteca de 180.000 € (~950 €/mes)
- **Otros activos:** Audi Q8, 45.000 €, Carlos 100 %
- **Sociedad:** García Consulting SL, Carlos 100 % (sin cálculo fiscal — ver F4)
- **Ingresos:** Carlos 95.000 €/año (trabajo) · Marta 32.000 €/año (trabajo) → **127.000 €/año** en el expediente
- **Escenarios:** "Situación actual" (plan base) · "A · Reembolso" (≈ **14.200 €** de impuestos del periodo) · "B · Traspaso + rescate" (≈ **9.800 €**). Cifras fijas en el mockup.

## F.2 · Clientes ligeros (solo para poblar la Cartera)

| Cliente | Segmento | Patrimonio | Composición (barra) | Escenarios | Última revisión |
|---|---|---|---|---|---|
| **Familia Beltrán Ortiz** | Empresario | 2.840.000 € | Empresarial 62 % · financiero 21 % · inmobiliario 15 % · otros 2 % | 1 | hace 2 meses |
| **Familia Navarro Sanchís** | Jubilado | 1.150.000 € | Inmobiliario 58 % · financiero 39 % · otros 3 % | 0 | hace 5 meses |
| **Familia Requena Poveda** | Alto ingreso | 610.000 € | Financiero 71 % · inmobiliario 26 % · otros 3 % | 2 | hace 3 semanas |
| **Familia Server Alcaraz** | Herencia en curso | 1.930.000 € | Inmobiliario 64 % · financiero 28 % · empresarial 8 % | 1 | hace 8 meses |
| **Familia Tormo Gisbert** | Pre-jubilado | 875.000 € | Financiero 46 % · inmobiliario 44 % · otros 10 % | 0 | hace 1 mes |

**Navarro · demo CCAA sin cobertura:** expediente Madrid + Hugo (Madrid, 24.000 €/año trabajo) → aviso de cobertura en P4 y clasificador `ccaa_sin_cobertura` por persona.

**Capacidad de ahorro (decisión de producto):** suma los ingresos de **todas** las personas del expediente, sin filtrar por cobertura fiscal del titular. El expediente es una unidad económica; la liquidación IRPF y la capacidad de ahorro son conceptos distintos.

**Notas para el mockup:**
- **La columna Patrimonio de P1 es patrimonio NETO** (activos − pasivos). Para García-Llorente: 885.000 € de activos − 180.000 € de hipoteca = **705.000 €**. Las cifras de la tabla de arriba ya son netas.
- **Total de la cartera:** 6 clientes · **8.110.000 €** seguidos (fila de totales al pie de P1).
- Todos con CCAA **Comunitat Valenciana** salvo **Navarro** (Madrid, demo aviso de cobertura).
- Los apellidos son de la Comunitat Valenciana a propósito: coherente con el mercado objetivo y con el segmento de EAF valenciano.
- Las cifras de "última revisión" deben calcularse **relativas a la fecha actual** (restando meses a `new Date()`), no hardcodearse como fechas fijas, para que la tabla no envejezca.
- García-Llorente es el más pequeño de la cartera en patrimonio: es lo correcto, porque es el que tiene el caso fiscal interesante, no el más rico. No cambiar sus cifras — están calibradas con el ejemplo del motor.

---

# ANEXO G · B2C (futuro, solo anotado)

El modelo de datos aguanta gracias a la capa **Cuenta**. El motor fiscal se queda y gana protagonismo; el flujo de asesor se retira; la captación automática pasa a ser casi obligatoria. **El problema real no es técnico:** el firewall se apoya en que un asesor humano concluye y firma. Sin asesor, hay que decidir si la herramienta solo muestra (seguro, menos útil) o empieza a orientar (robo-advisor, terreno regulado). Decisión de producto y regulación, a resolver antes de abrir B2C.
