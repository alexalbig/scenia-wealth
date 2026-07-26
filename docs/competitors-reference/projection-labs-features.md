# ProjectionLab — Pantallas y features (referencia)

> Documento vivo de análisis de referencia. Cada bloque describe una captura de pantalla, qué hace para el usuario y qué patrones de producto encierra.
> 
> **Producto de referencia:** [ProjectionLab](https://projectionlab.com) (planificación financiera B2B/B2C, mercado anglosajón). **Capturas:** `docs/reference/projectionlab/screens/` — organizadas por dominio en subcarpetas. **Última actualización:** junio 2026 · 154 capturas

### Convenciones

  * Cada bloque describe una o más capturas: qué hace la pantalla y qué patrones de producto encierra.
  * **Cobertura parcial:** en pickers y listas largas (Plan data tabs, Income, Expenses, Accounts…) suele documentarse la **taxonomía completa** en el modal **\+ Add** , pero el **editor detallado** solo para uno o dos ejemplos representativos.
  * Las secciones marcadas con _sin captura_ describen flujos conocidos pero no fotografiados en este batch.

### Mapa de cobertura

Área | Nivel | Notas  
---|---|---  
Workspace · ficha cliente | Alta | Clients, Dashboard, Progress, sidebar  
Current Finances | Media-alta | Un flujo por tab; taxonomía US en Investments  
Plan dashboard + sub-nav | Alta | Todas las pestañas (Plan → Settings)  
**Plan data tabs** | **Parcial** | Ver matiz §12k  
Optimize | Media-alta | Tax Strategy completo; Flexible Spending / Drawdown sin captura  
Settings | Alta | Notes sin captura  
  
* * *

## Mapa del producto
    
    
    ProjectionLab Pro
    │
    ├── Workspace asesor                    ← Parte 1
    │   ├── Clients (lista + KPIs firma)
    │   ├── Directory (promoción / más clientes)
    │   └── Account Settings
    │
    └── Ficha cliente (ej. "MyData")        ← Parte 2–3
        ├── Sidebar: Dashboard · Current Finances · Progress · Plans ↓
        ├── Dashboard                       ← landing al entrar; NW + assets + liabilities + planes
        ├── Current Finances                ← KPIs donuts + 5 tabs (shell propio)
        │   ├── About You · Savings · Investments · Real Assets · Unsecured Debts
        ├── Progress                        ← histórico de snapshots patrimoniales
        └── Plans (en sidebar, bajo Dashboard)
            └── [Abrir plan] → Vista Plan   ← Parte 4
                ├── Plan (dashboard + plots + data tabs) · Cash Flow · Tax Analytics…
                └── Milestones · Rates · Notifications (barra superior del plan)
    

**Sidebar global (workspace):** Clients · Directory · Account Settings. Footer: Help Center · Gift Subscriptions · Resources · Support · More Info.

**Sidebar ficha cliente:** Back to Pro · Dashboard · Current Finances · Progress · **Plans** (acordeón: Current Projections · New Plan).

* * *

## Índice

Parte | Sección | Área  
---|---|---  
**1** | Clients | Workspace del asesor  
**1** | Add Client | Alta de cliente  
**2** | Sidebar cliente | Navegación lateral  
**2** | Dashboard | Patrimonio y planes  
**2** | Progress | Histórico de snapshots  
**3** | Current Finances | KPIs donuts + 5 tabs  
**3** | About You | Perfil y modo pareja  
**3** | Savings | Liquidez  
**3** | Investments | Inversiones US  
**3** | Real Assets | Activos reales  
**3** | Unsecured Debts | Pasivos  
**4** | Plan · dashboard | Gráficos y sidebar anual  
**4** | Plan · data tabs | Accounts · Income · Expenses · Assets · Flows  
**4** | Chance of Success | Monte Carlo  
**4** | Tax Analytics | Motor fiscal US  
**4** | Cash Flow | Sankey anual  
**4** | Compare · What-if | Sandbox vs baseline  
**4** | Optimize | Tax strategy · módulos  
**4** | Reports | Explorador chart + tabla  
**4** | Estate | Sucesión · Sankey · legacy  
**4** | Settings | Milestones · Rates · Tax · Metrics  
  
* * *

# Parte 1 · Workspace del asesor

Tras iniciar sesión en **ProjectionLab Pro** , la vista por defecto es la pestaña **Clients**.

* * *

## 1\. Clients

_[imagen: Clients list]_ 

**Qué es.** Panel principal del asesor. Vista de cartera agregada — no la ficha de un cliente concreto.

**KPIs de cabecera**

KPI | Descripción  
---|---  
**Clientes** | Número de clientes en la cartera  
**Seats** | Plazas de suscripción (modelo por asientos)  
**Total Assets** | Activos agregados de todos los clientes ($393K en captura)  
**Total Net Worth** | Patrimonio neto agregado ($290K en captura)  
  
Cada KPI puede llevar mini visualización (gauge de asientos, barras de composición).

**Tabla de clientes**

Columna | Descripción  
---|---  
Nombre | Clic → abre ficha cliente individual (ej. **MyData**)  
Email | Con acción **Invite** por fila  
Assets | Importe + barra de composición por color  
Net Worth | Importe + barra  
Permisos | Icono candado  
Created / Last Active | Fechas  
⋮ | Menú de acciones por cliente  
  
**Acciones globales:** búsqueda · refresh · **+** alta de cliente nuevo.

**Navegación lateral**

Item | Función  
---|---  
**Clients** | Esta pantalla  
**Directory** | Promoción del asesor para captar más clientes  
**Account Settings** | Configuración de cuenta Pro  
_Footer_ | Help Center · Gift Subscriptions · Resources · Support · More Info  
  
**Patrones UX**

  * La tabla es el centro operativo del asesor.
  * Barras de color en Assets/Net Worth dan contexto sin abrir la ficha.
  * Un clic en un cliente (p. ej. MyData) cambia a la **vista individual** — misma app, shell distinto.

* * *

## 2\. Add Client

_[imagen: Add Client]_ 

**Qué es.** Modal mínimo para crear un cliente nuevo.

Feature | Descripción  
---|---  
**Client Name** | Único campo obligatorio  
**Copy** | _" A new client profile will be created, and you can begin adding details right away."_  
**Acciones** | Cancel · **Create**  
  
**Patrón:** fricción mínima en el alta; el perfil rico (pareja, edad, país…) se configura después en **Current Finances → About You**.

* * *

# Parte 2 · Ficha cliente

Al clicar un cliente en la tabla (p. ej. **MyData**), el asesor entra en la **vista individual** del cliente.

* * *

## 3\. Sidebar de la ficha cliente

_[imagen: Sidebar navigation]_ 

**Qué es.** Navegación lateral al entrar en la **vista individual** de un cliente (p. ej. MyData). Sustituye al sidebar del workspace asesor.

Item | Función  
---|---  
**Back to Pro** | Vuelve al workspace asesor (lista Clients)  
**Dashboard** | Resumen patrimonial + planes (§4)  
**Current Finances** | Situación actual con KPIs donuts y 5 tabs (§6)  
**Progress** | Histórico de progress points (§5)  
**Plans** (acordeón) | **Current Projections** · **New Plan** (+)  
  
**Patrones UX**

  * Cada sección tiene su **propio layout de contenido** — no comparten un shell visual único.
  * **Plans** vive en el sidebar como submenú, no como item de primer nivel separado del todo.
  * Dark theme en toda la ficha cliente.

* * *

## 4\. Dashboard del cliente

_[imagen: Dashboard overview]_ 

**Qué es.** Landing al abrir un cliente. Resumen del patrimonio **actual** y acceso a planes futuros. Distinto de **Current Finances** (edición detallada) y de **Progress** (histórico).

### 4a. Fila superior · Net Worth, Assets, Liabilities

Bloque | Contenido  
---|---  
**NET WORTH** | $145K · _All time +$70K (93,33 %)_ en verde  
**Gráfico NW** | Línea de evolución con selectores **1M · 3M · 1Y · 5Y · 10Y · ALL**  
**ASSETS** | Total $196,5K + lista scrollable con icono por posición (Savings, Taxable, 401k, coches…)  
**LIABILITIES** | Total $51,5K + lista (Student Loans, My Car Loan…)  
  
Hover sobre el gráfico NW muestra valor por punto temporal.

### 4b. Plans for the Future

Sección inferior con dropdown **Full Plan** (filtro de vista).

Tarjeta | Contenido  
---|---  
**Current Projections** | Mini área chart de proyección (edades 41–81) · iconos milestones · badge notificación (1) · menú ⋮  
**Add Plan** | CTA **\+ Create a new plan**  
  
**Menú ⋮ del plan** (descrito en recorrido, pendiente captura detallada): Clone · Change Icon · Rename · Add Notes · Rearrange Plans · Delete Plan.

**Notificaciones** en plan: _Missing Monthly Payment_ · _Student Loans is financed_ · _VAS has no monthly payment specified_.

**Patrón:** Dashboard = **hub** del cliente; abrir un plan lleva a la Vista Plan (Parte 4).

* * *

## 5\. Progress

Seguimiento histórico del patrimonio. Los snapshots se crean **automáticamente** al actualizar Current Finances.

### 5a. Progress Points

_[imagen: Progress points]_ 

**KPIs de cabecera:** Net Worth $145K · Assets $196,5K · Liabilities $51,5K · growth all-time.

**Gráfico:** línea de Net Worth con mismos selectores temporales (1M … ALL).

**Tabla Progress Points**

Columna | Descripción  
---|---  
Date | Fecha del snapshot (ordenable)  
Net Worth · Assets · Liabilities | Totales  
Savings · Investments · Real Asset Equity · Unsecured Debt | Desglose  
  
Copy: _" Created automatically when you update Current Finances."_

**Acciones:** **\+ Add** manual · menú ⋮ por fila · paginación (1–10 of 10).

### 5b. Create Progress Point (modal)

_[imagen: Create progress point]_ 

Modal para añadir snapshot manual.

Campo | Ejemplo  
---|---  
**Net Worth** | $145,000 (destacado)  
**Progress Date** | 2026-06-24  
Total Savings | $85,000  
Taxable / Tax-Deferred / Tax-Free Investments | $28K / $37K / $23K  
Cryptocurrency | $0  
Total Asset Value · Asset Loans | $23,5K · $6,5K  
Debt | $45,000  
  
Acciones: Cancel · **Save**.

* * *

# Parte 3 · Current Finances

Sección **Current Finances** : edición de la foto financiera **actual**. Shell **propio** con KPIs en donuts (distinto del Dashboard §4).

**Orden tabs:** Savings · Investments · Real Assets · Unsecured Debts · About You.

* * *

## 6\. Current Finances · shell

_[imagen: Current Finances shell]_ 

**Anatomía** (captura con tab Savings activo):

Zona | Contenido  
---|---  
**KPIs (donuts)** | Net Worth · Assets · Liabilities · Equity  
**Sub-nav** | Cada tab con importe agregado ($85K Savings…)  
**Cuerpo** | Filas editables + **\+ Add …**  
  
Acciones transversales por fila: renombrar · reordenar · duplicar · notas · eliminar · **Owner** (You/Spouse).

* * *

## 7\. About You

Datos personales, modo de planificación y contexto regional.

### 7a. Planning mode (individual vs couple)

_[imagen: Planning mode]_ 

Feature | Descripción  
---|---  
**Toggle** | "As an individual" · "As a couple"  
**Impacto** | Cambia Owner en Savings/Investments, filas de Spouse, etc.  
**Acciones** | Cancel · **Save**  
  
### 7b. Lista About You

_[imagen: About You]_ 

Fila | Ejemplo | Función  
---|---|---  
As a couple | Planning as a couple | Atajo al modal §7a  
You | Age 32 · Jan 1994 | Edad y fecha de nacimiento  
Spouse | Age 30 · Jan 1996 | Pareja (modo couple)  
United States | California | País y subdivisión  
US Dollar | English (United States) | Moneda e idioma  
  
* * *

## 8\. Savings

### 8a. Formulario vacío

_[imagen: Savings form]_ 

Campo | Valor  
---|---  
Balance | $0  
Owner | You  
  
### 8b. Lista

_[imagen: Savings list]_ 

$50K You + $35K Spouse = **$85K** en sub-nav.

* * *

## 9\. Investments

### 9a. Country selector

_[imagen: Country selector]_ 

Filtra tipos de cuenta fiscal: All · US · CA · AU · GB · IL.

### 9b. Add Investments

_[imagen: Add Investments]_ 

Entrada | Tipo  
---|---  
Taxable Investments | CTA directo (+)  
Individual Retirement Accounts | Submenú · 4 cuentas  
Employer Retirement Accounts | Submenú · 7 cuentas  
Cryptocurrency · HSA · 529 Plan | CTA directo (+)  
  
### 9c. Employer Retirement Accounts

_[imagen: Employer retirement]_ 

401k, Roth 401k, 403b, Roth 403b, 457b, Roth 457b, 401a.

### 9d. Individual Retirement Accounts

_[imagen: IRA picker]_ 

IRA, Roth IRA, Inherited IRA, Inherited Roth IRA.

### 9e. Lista Investments

_[imagen: Investments list]_ 

Cuenta | Balance | Owner | Meta  
---|---|---|---  
Taxable Investments | $28K | You | Cost: $14K  
Roth IRA | $18K | You | Contributions: $9K  
HSA | $5K | You | —  
401k/403b | $25K | Spouse | —  
IRA | $12K | Spouse | —  
  
Menú ⋮ por fila. Metadatos fiscales (cost basis, contributions) según tipo.

* * *

## 10\. Real Assets

### 10a. Status (Financed vs Fully Owned)

_[imagen: Asset status]_ 

Status | Efecto  
---|---  
Fully Owned | Precio compra + valor actual  
Financed | Despliega préstamo vinculado (§10c)  
  
### 10b. Add Asset picker

_[imagen: Add Asset]_ 

14 tipologías: House, Car, Rental Property, Motorcycle, Boat, Jewelry…

### 10c. Lista con financiación

_[imagen: Real Assets list]_ 

**My Car (Financed):** $28K compra · $14,5K valor · APR 4,5% · $350/mo · 2 años payoff.

**Spouse 's Car (Fully Owned):** $18K · $9K valor.

**Patrón clave:** activo + deuda embebida en la misma tarjeta cuando está financiado.

* * *

## 11\. Unsecured Debts

### 11a. Formulario vacío

_[imagen: Debt form]_ 

Balance · APR · Owner · Interest (Simple/Compound) · Monthly Payment · _Years to pay off_ (calculado).

### 11b. Add Debt picker

_[imagen: Add Debt]_ 

Debt genérico · Student Loans · Medical Debt · Credit Card Debt.

### 11c. Formulario relleno

_[imagen: Debt filled]_ 

Student Loans: $45K · 5,5% APR · $450/mo · Compound/Daily · **12 años** payoff.

* * *

# Parte 4 · Vista Plan

Al abrir un plan (**Current Projections** u otro) desde el **Dashboard cliente** (§4) o desde **Plans** en el sidebar (§3), se entra en la **vista Plan** : proyección financiera con su propia barra superior y pestañas.

**Acceso:** Dashboard cliente → tarjeta Current Projections · o Sidebar → Plans → Current Projections.

### Arquitectura compartida · shell del plan

Todas las pestañas del plan comparten el mismo **chrome** vertical. El contenido central cambia según la sub-nav activa.
    
    
    ┌──────────────────────────────────────────────────────────────────────────────┐
    │ CAPA 0 · Plan chrome (persistente en Plan · Cash Flow · Tax · Monte Carlo…)  │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │  [☰] Current Projections    [🏠][🚗][👶][🌴]… milestones    📈 Rates  🔔1  │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │  Plan | Cash Flow | Tax Analytics | Chance of Success | Compare▾ | …        │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │                                                                              │
    │  CAPA 1 · Contenido específico de la pestaña activa (ver §12–§15)            │
    │                                                                              │
    └──────────────────────────────────────────────────────────────────────────────┘
    

Capa | Elemento | Función  
---|---|---  
**0a** | Título del plan | Nombre editable (ej. Current Projections)  
**0b** | Barra milestones | Iconos clicables → popover de fecha/edad (§12c)  
**0c** | Rates | Popover supuestos macro: inflation, stocks, bonds (§12d)  
**0d** | Notifications | Alertas de datos incompletos o inconsistentes (§12e)  
**0e** | Sub-nav horizontal | 9 pestañas de análisis del plan  
**1** | Área de contenido | Depende de la pestaña (dashboard, sankey, tax charts, MC…)  
  
**Pestañas del plan:** Plan · Cash Flow · Tax Analytics · Chance of Success · Compare ▾ · Optimize ▾ · Reports · Estate · Settings ▾.

Las capturas viven en `screens/plan/` (`plan-tab/`, `plan-data/`, `compare/`, `optimize/`, `reports/`, `estate/`, `settings/`) y subcarpetas `cashflow/`, `tax-analytics/`, `monte-carlo/`.

* * *

## 12\. Plan · Dashboard

Pestaña **Plan** — vista por defecto al entrar. Dashboard interactivo de proyección con selector de plots, sidebar anual y configuración global del plan.

### Arquitectura de página · Plan dashboard
    
    
    ┌──────────────────────────────────────────────────────────────────────────────┐
    │ CAPA 0 · Shell del plan (§ Parte 4)                                          │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 1 · Plot selector          [Net Worth ▼]  [⚙ Display Options]          │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 2 · Gráfico principal (70%)          │ CAPA 3 · Sidebar año (30%)      │
    │  · Área/línea/barras según plot           │  You 58 · Spouse 56 · 2052      │
    │  · Milestone icons en eje X               │  Slider de año                  │
    │  · Hover tooltip (año, edades, valor)     │  Net Worth → drill-down         │
    │  · Línea vertical año seleccionado        │  ΔNW · Liquid NW · Withdrawals │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 4 · Plan data tabs (overlay inferior, §12k)                             │
    │  Accounts | Income | Expenses | Real Assets | Flows                          │
    └──────────────────────────────────────────────────────────────────────────────┘
    

Capa | Interacción | Estado que persiste  
---|---|---  
**1** | Cambiar plot, Display Options | Plot activo, opciones de visualización  
**2** | Hover, clic en milestone | Año bajo cursor  
**3** | Slider, clic en métrica | Año seleccionado, popover drill-down  
**4** | Editar entidades del plan | Datos del modelo (accounts, income…)  
  
* * *

### 12a. Vista general

_[imagen: Plan dashboard]_ 

**Qué es.** Dashboard completo del plan **Current Projections** , plot **Net Worth** activo, año **2052** seleccionado.

Zona | Contenido  
---|---  
**Gráfico central** | Área de patrimonio neto (eje hasta $5M) · línea vertical en año seleccionado · iconos milestone en el timeline  
**Sidebar derecha** | You 58 · Spouse 56 · **2052** · slider de año · desglose NW / ΔNW / Liquid NW / Withdrawals  
**Overlay inferior** | Popup **Accounts** (Savings, Taxable, Roth, HSA…) · tabs Income · Expenses · Real Assets · Flows  
**Cabecera** | Milestones · Rates · Notificaciones (§12c–12e)  
  
* * *

### 12b. Cabecera y pestañas

_[imagen: Header nav]_ 

Elemento | Descripción  
---|---  
**Título** | Current Projections (nombre del plan)  
**Barra milestones** | Iconos de hitos del plan (§12c)  
**Rates · Notifications** | Accesos rápidos (§12d–12e)  
**Sub-nav** | **Plan** (activo) · Cash Flow · Tax Analytics · Chance of Success · Compare ▾ · Optimize ▾ · Reports · Estate · Settings ▾  
**Plot selector** | Dropdown **Net Worth** (§12f)  
  
* * *

### 12c. Milestones del plan

_[imagen: Milestone retirement]_ 

Barra de iconos bajo el título del plan. Cada milestone es **configurable** y ancla eventos del modelo (ingresos, gastos, jubilación…).

Milestone (ejemplos) | Icono / color | Configuración  
---|---|---  
**Your Retirement** | Palmera teal | Fecha absoluta o _At another milestone_ (ej. Spouse's Retirement +3)  
**Spouse 's Retirement** | Palmera rosa | Idem  
**Life Expectancy** (you / spouse) | Corazón + pulso | Edad fin de plan  
**Financial Independence** | Bandera azul | p. ej. NW > 20× expenses  
**First Home** | Casa + lupa | Año compra  
**Kids** | Siluetas púrpura | Fecha nacimiento / edad  
  
Popover **Your Retirement:** dropdown _At another milestone_ · enlace a _Spouse 's Retirement +3_.

* * *

### 12d. Rates

_[imagen: Rates popover]_ 

Popover **Rates** (icono gráfico junto a milestones). Supuestos macro del plan:

Variable | Valores ejemplo | Notas  
---|---|---  
**Inflation** | 3 % | Icono naranja  
**Stocks** | 6 % · 2,5 % | Dos valores (growth / dividend yield)  
**Bonds** | 1,5 % · 3,5 % | Engranaje para settings avanzados  
  
* * *

### 12e. Notificaciones

_[imagen: Notification]_ 

Campana con badge **1**. Ejemplo de alerta:

  * **Missing monthly payment** — _" Student Loans is financed but has no monthly payment specified."_

Las notificaciones surgen de **inconsistencias en Current Finances** o configuración del plan (datos incompletos para proyectar).

* * *

### 12f. Selector de plots

_[imagen: Plot selector]_ 

Dropdown bajo la pestaña Plan. Cambia la visualización del dashboard.

**\+ New Plot** — crear plot personalizado.

**Your Plots** (usuario): Expenses (Change in Net Worth…) · Change in Net Worth (⋮ editar/eliminar).

**Built-in Plots** (lista parcial):

Plot | Tipo  
---|---  
Net Worth | Línea/área  
Stacked Net Worth | Barras apiladas  
Income · Expenses · Spending | Series temporales  
Spending Overview · Essential Spending | Desglose gasto  
Taxes · Withdrawals | Fiscal / retiradas  
Goal Heatmap | Mapa de calor objetivos  
… | Muchos más  
  
* * *

### 12g. Hover en el gráfico

_[imagen: Chart hover]_ 

Hover sobre un punto del plot **Net Worth** :

Campo | Ejemplo (2059)  
---|---  
Milestone | Start of Medicare: You: $5,477  
Edades | You 65 · Spouse 63  
Net Worth | $3.183.430  
  
Iconos de milestone (cruz naranja = healthcare) aparecen **sobre el eje temporal** en años clave.

* * *

### 12h. Sidebar · año seleccionado

_[imagen: Year sidebar]_ 

Panel derecho sincronizado con el slider de año.

Bloque | Contenido (2050)  
---|---  
**Net Worth** | $3.099.518 · You $1.950.976 · Spouse $1.148.541  
**Change in Net Worth** | $8.127 · Investment Growth $116.834 · Expenses ($108.178) · Withholding ($3.616) · Asset Appreciation · Depreciation  
**Liquid Net Worth** | $2.695.854  
**Withdrawals** | $111.793 (Taxable Investments)  
**Withdrawal Rate** | 4,15 %  
  
Clic en cualquier métrica abre drill-down (§12i). Slider **You 56 · Spouse 54 · 2050** arriba del panel.

* * *

### 12i. Drill-down de métricas

**Net Worth** — popover con mini-gráfico y selectores de chart type (barras apiladas · barras · línea · ⚙):

_[imagen: NW drilldown]_ 

**Withdrawals** — popover _" Drawdown from your portfolio in the selected year"_ \+ **View Granular Combined Plot** :

_[imagen: Withdrawals granular]_ 

Permite **combinar plots** , cambiar tipo de gráfico por métrica y abrir vista granular combinada.

* * *

### 12j. Display Options

_[imagen: Display options]_ 

Popover (icono sliders). Acordeones:

Sección | Función  
---|---  
**Inflation** | Show projections in Today's Currency  
**Time Range** | Acotar horizonte del gráfico  
**Datasets** | Qué series incluir  
**Metrics** · **Metric Settings** | Filtrar y configurar métricas del sidebar  
**Appearance** | Estilo visual  
**Chart Type** | Línea vs barras vs apilado  
**Y-Axis** | Escala vertical  
**X-Labels · Grouping** | Etiquetas temporales y agrupación  
  
Slider de edades (**You 58 · Spouse 56**) integrado en la barra de Display Options.

* * *

### 12k. Plan data tabs

Bajo el dashboard del plot hay **cinco pestañas** de datos del plan. Cada una es una lista editable de entidades que alimentan la simulación.

### Arquitectura de página · Plan data tabs
    
    
    ┌──────────────────────────────────────────────────────────────────────────────┐
    │ CAPA 0 · Shell + gráfico del plan (parcialmente visible arriba)              │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 1 · Tab nav: Accounts | Income | Expenses | Real Assets | Flows         │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 2 · Card header del tab activo                                          │
    │  [icono] Accounts          ⇅  ≡  📌  [+]                                     │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 3 · Lista de entidades (scroll vertical)                                │
    │  ┌─ SAVINGS ─────────────────────────── [collapse] [👁] ─┐                    │
    │  │  Linked to Current Finances                            │                    │
    │  │  [secciones expandibles: Yield · Liquidity · Flows…]  │                    │
    │  └───────────────────────────────────────────────────────┘                    │
    │  ┌─ TAXABLE INVESTMENTS ────────────────────────────────┐                    │
    │  └───────────────────────────────────────────────────────┘                    │
    └──────────────────────────────────────────────────────────────────────────────┘
    

Capa | Patrón | Notas  
---|---|---  
**1** | Tab switcher | Una card visible por tab; no cambia de ruta  
**2** | Toolbar común | ⇅ reorder · ≡ dense · 📌 pin · + add  
**3** | Entity card | Header colapsable + ojo (include/exclude sim)  
**3b** | Editor inline / modal | Clic en entidad → panel con secciones (PURCHASE, YIELD, FLOWS…)  
  
_[imagen: Plan data tabs]_ 

Tab | Contenido  
---|---  
**Accounts** | Cuentas financieras (Savings, Taxable, Roth IRA, HSA…)  
**Income** | Fuentes de ingreso (Salary, RSU, Pension…)  
**Expenses** | Partidas de gasto (Rent, Living, Vacation, Kid…)  
**Real Assets** | Activos reales del plan (House, Car…)  
**Flows** | Reglas de ahorro/inversión (401k, Emergency Fund, HSA…)  
  
> **Matiz de cobertura (§12l–§12p):** Los modales **\+ Add** documentan la taxonomía completa de cada tab. Los **editores inline** solo se detallan para tipos con captura. No implica que los demás tipos sean iguales — comparten shell (secciones colapsables, Time Range, More Options) pero campos distintos.

Tab | Documentado con captura | Tipos en picker sin editor detallado  
---|---|---  
**Accounts** | Savings, Taxable, Roth IRA | 401k, HSA, IRA (spouse), Crypto, 529, resto IRA/Employer  
**Income** | Salary | Hourly, RSU, Side Hustle, Inheritance, Pension, SS, Tax Credit, Custom  
**Expenses** | Lista de 6 ítems (Rent, Living, Vacation, Kid, Emergency, Student Loans) | Wedding, Travel, Charity, Medical, Education, Dependent, Health Care, Debt, Custom  
**Real Assets** | Car, House | Otros del picker Current Finances (land, boat…)  
**Flows** | Emergency Fund, 401k, HSA | Roth IRA, Traditional IRA, Taxable maximize (en lista, sin editor)  
  
**Acciones comunes en cada tab** (iconos en cabecera de la card):

Icono | Acción  
---|---  
⇅ | Reorganizar items  
≡ | Vista densa / colapsar secciones  
📌 | Pinear tab  
**+** | Añadir (Account · Income · Expense · Real Asset · Flow)  
  
**Patrón clave:** **Accounts** y **Real Assets** llevan badge **Linked to Current Finances** — sincronizan con la foto actual (§6–§10). **Income** y **Expenses** se definen solo en el plan. **Flows** conectan cuentas con objetivos (aportaciones, fondos de emergencia…).

* * *

#### 12l. Accounts

_[imagen: Accounts header]_ 

Lista de cuentas del plan. Clic en **+** abre el modal de alta.

_[imagen: New account]_ 

Misma taxonomía que Current Finances → Investments: Savings · Taxable · IRA (4) · Employer (7) · Crypto · HSA · 529. Filtro país US.

**Savings** — linked to Current Finances:

_[imagen: Savings header]_ 

Por cuenta: **Collapse Sections** (expandir Yield · Liquidity · Flows · More Options) · icono **ojo** (activar/desactivar en simulación).

_[imagen: Savings detail]_ 

Sección | Campos  
---|---  
General | Name · Owner · Balance  
**Yield** | APY 0,05 % Default (o fijo / avanzado) · toggle _Yield counts as passive income_  
**Liquidity** | Withdrawals Always · Liquid Always  
**Flows** | Emergency Fund — Build $40K · Maximize contribution  
**More Options** | Allow transfers to support other goals (toggle)  
  
**Taxable Investments** — linked:

_[imagen: Taxable]_ 

Balance $28K · Cost Basis $14K · Growth 6 % · Dividend 2,5 % · Reinvest Always · Bonds Plan · Fees 0 % · Liquidity · Flow "Maximize contribution" (resto income → taxable).

**Roth IRA** — linked:

_[imagen: Roth IRA]_ 

Contributions $9K · Growth/Dividend/Bonds/Fees.

_[imagen: Roth liquidity]_ 

Early withdrawal penalties (ON · age 60 · 10 %) · 72T SEPP · **Flows** \+ Add Flow / Transfer.

* * *

#### 12m. Income

_[imagen: Income list]_ 

My Job $85K · Spouse's Job $95K. Cabecera con ⇅ · dense · pin · **+**.

_[imagen: New income]_ 

Picker (9 tipos): Salary · Hourly Wage · RSU · Side Hustle · Inheritance · Pension · Social Security · Tax Credit/Deduction · Custom. _Solo Salary tiene editor detallado en este documento._

_[imagen: Salary editor]_ 

Sección | Campos  
---|---  
General | Name · Earner · $85K Yearly  
**Time Range** | Start Before Current Year → End Your Retirement  
**Change Over Time** | Increase 5,5 %/año · max $125K · nota real rate  
**Tax Handling** | Type Auto · Withholding 25 % Fixed · Tax-Exempt off  
**More Options** | Part-Time Work · Defined Benefit Pension · Advanced Options  
  
* * *

#### 12n. Expenses

_[imagen: New expense]_ 

14 tipos en picker: Living · Rent · Debt · Student Loans · Dependent · Health Care · Vacation · Wedding · Travel · Emergency · Charity · Medical · Education · Custom. _La lista siguiente muestra 6 ítems configurados; no hay captura de editor por tipo._

_[imagen: Expenses list]_ 

Gasto | Importe | Rango | Regla  
---|---|---|---  
Rent | $2,3K/mo | Before Current Year → End of Plan | Inflation  
Living Expenses | $50K | … | +6 %/año cap $80K  
Vacation | $2,5K | Jan 2024 → Dec 2066 | Inflation  
Kid #1 | $12K | Kid #1 → Kid #1 +17 | Inflation  
Emergency | $45K | Jan 2027 | One-time  
Student Loans | $650/mo | … | —  
  
Gastos anclados a **milestones** (Kid #1), no solo fechas absolutas.

* * *

#### 12o. Real Assets

Activos del plan (pueden linkar a Current Finances). Editor por secciones colapsables.

**Car (My Car)** — Linked to Current Finances:

_[imagen: Car editor]_ 

Purchase $28K · Value $14,5K · Financed · APR 4,5 % · $300/mo · 2 años · Depreciate 8 %/año.

_[imagen: Car more options]_ 

Sale Never · Recurrence off · Exclude loan from Liquid NW · Liquidate if Necessary · Offset account.

**House:**

_[imagen: House purchase]_ 

Purchase @ First Home milestone · $325K · Financed · Down $50K from Taxable Investments · APR 3,4 % · $1.850/mo · 17 años.

_[imagen: House usage]_ 

Primary Residence · Appreciate 3,9 %/año · Property tax 1,25 % · Maintenance 2,5 % · Insurance $1.200 · Sale Never.

_[imagen: House sale/taxes]_ 

Yearly tax · Assessed Value · Sale timing · Broker fee · Capital gains toggle · Send proceeds Automatic.

* * *

#### 12p. Flows

Reglas que mueven dinero entre income, cuentas y objetivos. Lista ordenada con badges **Invest** / **Save**.

_[imagen: Flows list]_ 

  1. 401k/403b — From Spouse's Job · 10 % + 8 % employer · **Invest**
  2. Emergency Fund — $40K · Maximize · **Save**
  3. HSA · Roth IRA · Traditional IRA · Taxable — Maximize · **Invest**

**Emergency Fund (Cash Reserves):**

_[imagen: Emergency fund]_ 

Linked to Savings · Build up to $40K · Maximize · Fund with Income · Allow Drawdown 25 % min · Show chart icon on target.

**401k goal:**

_[imagen: 401k goal]_ 

Source Spouse's Job · 10 % / 8 % · US Limit · Always Fund · Roth toggles · Time Range Before Current Year → End of Plan.

**HSA goal:**

_[imagen: HSA goal]_ 

Maximize Contribution · Employer $0 · US Individual Limit ($4.400 + catch-up) · Always Fund · Payroll deduction off.

* * *

**Patrones UX · Plan dashboard**

  * **Tres ejes de interacción:** tiempo (slider) · métrica (sidebar) · visualización (plot selector + display options).
  * **Milestones como capa semántica** sobre el gráfico, no solo lista aparte.
  * **Drill-down sin cambiar de pestaña:** clic en métrica → popover → granular plot.

* * *

## 13\. Chance of Success (Monte Carlo)

Simulación probabilística del plan. Acceso: pestaña **Chance of Success** en la sub-nav del plan. El flujo tiene **dos estados** : configuración pre-run y dashboard de resultados post-run.

### Arquitectura de página · Chance of Success

**Estado A · Pre-run (setup)**
    
    
    ┌──────────────────────────────────────────────────────────────────────────────┐
    │ CAPA 0 · Shell del plan                                                      │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 1 · CTA central                                                         │
    │                    ( ▶ Run )  — anillo de progreso                           │
    │  "Run a Monte Carlo simulation to assess your plan's chance of success…"     │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 2 · Checklist de configuración (acordeones expandibles)                 │
    │  Data Sources        Blended                              >                  │
    │  Methodology         Historical, Random-Restart             >                  │
    │  Metrics             Net Worth, Expenses +1                 >                  │
    │  Outcome Categories  Kinds of success and failure           >                  │
    │  Success Rates                                            >                  │
    │  More Options                                             >                  │
    └──────────────────────────────────────────────────────────────────────────────┘
    

**Estado B · Post-run (results dashboard)**
    
    
    ┌──────────────────────────────────────────────────────────────────────────────┐
    │ CAPA 0 · Shell del plan                                                      │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 1 · Success summary (fila horizontal)                                   │
    │  [Gauge 95.41%]  |  Narrativa textual  |  Distribución por categoría         │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 2 · Fan chart · Net Worth (percentiles) + milestone markers             │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 3 · Tablas estadísticas (2 columnas)                                    │
    │  Expenses before Retirement  |  Expenses after Retirement                    │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 4 · Milestones distribution (dot plot por trial)                        │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 5 · Trial detail table (sparkline + historical sequence + outcome)      │
    └──────────────────────────────────────────────────────────────────────────────┘
    

* * *

### 13a. Configuración (pre-run)

_[imagen: Monte Carlo setup]_ 

**Qué es.** Landing de la pestaña antes de ejecutar. Botón circular **Run** centrado y lista de 6 bloques de configuración.

Bloque | Valor ejemplo | Función  
---|---|---  
**Data Sources** | Blended | Fuentes de retornos (histórico vs distribución)  
**Methodology** | Historical, Random-Restart | Cómo se muestrea el timeline  
**Metrics** | Net Worth, Expenses +1 | Qué series analizar en resultados  
**Outcome Categories** | Kinds of success and failure | Umbrales de éxito/fracaso por trial  
**Success Rates** | (default) | Tiers del gauge global (Excellent…Non-Viable)  
**More Options** | — | Tax estimation mode, Restore Defaults  
  
* * *

### 13b. Resultados

_[imagen: Monte Carlo results]_ 

**Qué es.** Dashboard tras ejecutar ~196 trials con blend histórico + probabilístico.

Zona | Contenido  
---|---  
**Gauge** | **95,41 %** Success Rate — donut con tiers de color  
**Narrativa** | _" Your portfolio survived 95% of the time, based on 196 trials…"_  
**Distribución** | Large Surplus 19,9 % · Comfortable 63,8 % · Barely Made It 11,7 % · Almost Made It 4,6 %  
**Fan chart** | Net Worth percentiles edad 33→83 · milestones (Kid #1, First Home…) en timeline  
**Expenses tables** | Median/Avg/StdDev/Smallest/Largest antes y después de retirement  
**Milestones dot plot** | Rango de edades por milestone across trials (filtros Earliest · 5-95 % · All)  
**Trial table** | # trial · sparkline · historical sequence (ej. 1928–1981) · NW at retirement · Legacy · badge resultado  
  
* * *

### 13c. Data Sources · Stock Growth Rate

_[imagen: Stock growth rate]_ 

Dropdown por variable: **Historical S &P 500** vs **Normal Distribution**. Si Normal → campos Mean y Std. Dev.

* * *

### 13d. Data Sources · panel completo

_[imagen: Data sources]_ 

Variable | Fuente ejemplo | Parámetros  
---|---|---  
**Stock Growth Rate** | Normal Distribution | Mean 8 % · Std Dev 12 %  
**Stock Dividend Yield** | Historical S&P 500 | —  
**Inflation** | Historical US Inflation | —  
**Bond Returns** | Historical US Bonds (75 % Gov, 25 % Corp) | —  
**Cryptocurrency Returns** | Normal Distribution | Mean 12 % · Std Dev 50 %  
  
Mezcla **backtest histórico** y **distribuciones custom** por clase de activo.

* * *

### 13e. Methodology

_[imagen: Methodology]_ 

Campo | Valor ejemplo | Descripción  
---|---|---  
**Historical Sampling** | Historical, Random-Restart (Default) | Preserva patrones año a año vs mezcla de eras  
**Historical Iterations** | 2 | Repeticiones del trial  
**Worker Threads** | 2 | Paralelismo CPU  
**Set a fixed random seed** | off | Reproducibilidad de resultados  
  
* * *

### 13f. Metrics

_[imagen: Metrics]_ 

Checkboxes por categoría (menos métricas = mejor rendimiento con muchos trials):

Grupo | Opciones (ejemplo activas)  
---|---  
**Net Worth** (azul) | Net Worth ✅ · Liquid NW  
**Expenses** (naranja) | Expenses ✅ · Spending · Essential · Discretionary · Flex  
**Taxes** (gris) | Taxes · Effective Tax Rate  
**Savings** (púrpura) | Savings Rate  
**Withdrawals** (blanco) | Withdrawals · Withdrawal Rate ✅  
**Income** (teal) | Income · Taxable Income · Passive Income  
  
* * *

### 13g. Outcome Categories

_[imagen: Outcome categories]_ 

**Kinds of Success** (icono ✓):

Nombre | Lógica  
---|---  
Large Surplus | Legacy > 300 %  
Comfortable | Legacy 50 %–300 % of NW at retirement  
Barely Made It | Legacy < 50 %  
  
**Kinds of Failure** (icono ✗):

Nombre | Lógica  
---|---  
Almost Made It | Failed after completing 80 %  
Failed in the Middle | Survived 40 %–80 % of plan  
Failed Early | Failed in first 40 %  
  
Cada fila: icono color · Name · condición editable. Botón **Reset**.

* * *

### 13h. Success Rates

_[imagen: Success rates]_ 

Tiers del gauge global (nombre + icono + rango %):

Tier | Rango  
---|---  
Excellent | 90 %–100 %  
Good | 80 %–90 %  
Fair | 60 %–80 %  
Risky | 40 %–60 %  
Concerning | 25 %–40 %  
Non-Viable | 0 %–25 %  
  
* * *

### 13i. More Options

_[imagen: More options]_ 

Configuración avanzada: **tax estimation mode** , valores por defecto. Botón **Restore Defaults**.

* * *

## 14\. Tax Analytics

Análisis fiscal US del plan. Pestaña **Tax Analytics**. Motor de visualización temporal con KPIs agregados, gráfico interactivo por dimensión fiscal y panel inferior de brackets en la vista Income.

### Arquitectura de página · Tax Analytics
    
    
    ┌──────────────────────────────────────────────────────────────────────────────┐
    │ CAPA 0 · Shell del plan                                                      │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 1 · Scope + KPI bar                                                     │
    │  [Plan Totals ▼]     Legacy $2.43M | ETR 13.95% | WR 5.64% | Taxes $1.97M    │
    │                                    [4 Metrics ▼] [⋮ Rearrange · Reset]       │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 2 · Sub-nav fiscal + filtros                                            │
    │  Income | Taxes | Rates | Deductions | Credits    [All ▼] [Composition ▼]  │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 3 · Gráfico principal (stacked bars + línea ETR)     │ CAPA 4 · Leyenda │
    │  · Eje X: edad/año (32→91)                                │  Notable Events  │
    │  · Hover tooltip (año, edades, desglose)                  │  checkboxes      │
    │  · Milestone icons sobre timeline                         │  totales plan    │
    │  · Slider inferior de navegación temporal                 │  año seleccionado│
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 5 · Panel inferior (solo Income) · [Brackets] [Progression]             │
    │  · 3 mini-charts de tramos + tabla Income Type · ETR · Gross · Tax · Net     │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 6 · Controles globales (esquina)                                        │
    │  [⚙ Display Options] [📊 chart type] [⚙ ETR settings en KPI ETR]             │
    └──────────────────────────────────────────────────────────────────────────────┘
    

Capa | Estado clave | Efecto en UI  
---|---|---  
**1** | Plan Totals vs Selected Year | KPIs lifetime vs año concreto  
**2** | Sub-tab activo | Cambia series del gráfico y filtros disponibles  
**3–4** | Año en slider/hover | Sincroniza tooltip, leyenda y panel inferior  
**5** | Brackets vs Progression | Vista estática del año vs curvas marginales  
**6** | Display Options | Inflation, time range, granularity, page width…  
  
* * *

### 14a. Vista general

_[imagen: Overview]_ 

**Qué es.** Vista completa con sub-tab **Income · Composition** activo. Muestra la proyección fiscal de por vida.

Elemento | Detalle  
---|---  
**KPI bar** | Legacy $2,43M · ETR avg 13,95 % · Withdrawal Rate avg 5,64 % · Taxes lifetime $1,97M  
**Gráfico** | Barras apiladas por tipo de ingreso + línea blanca ETR  
**Fases visibles** | Wage income (teal) dominante → gap bajo ingreso (pre-RMD) → RMDs + distribuciones  
**Leyenda** | Wage $5,82M · Employer $253K · Ordinary $221K · Tax-Free $434K · RMDs $753K · Tax-Deferred $1M · Cap Gains $1,1M · **Full Plan $9,58M**  
**Panel inferior** | Brackets activo con 3 columnas (Ordinary · RMDs · Tax-Deferred) + tabla resumen  
  
* * *

### 14b. Plan Totals vs Selected Year

_[imagen: Scope]_ 

Dropdown **Plan Totals** (activo) vs **Selected Year** :

Modo | KPIs muestran | Gráfico  
---|---|---  
**Plan Totals** | Agregados lifetime / promedios del plan completo | Toda la serie temporal  
**Selected Year** | Valores del año en el slider | Resalta año; tabla inferior al año  
  
* * *

### 14c. KPIs · cabecera

_[imagen: KPIs]_ 

Cuatro cards con sparkline integrado:

KPI | Valor | Sparkline  
---|---|---  
**Legacy** | $2,43M | Barras apiladas por tipo de activo residual  
**Effective Tax Rate (Avg)** | 13,95 % | Área — pico pre-retirement, caída, subida tardía  
**Withdrawal Rate (Avg)** | 5,64 % | Pico inicial (down payment?) → baseline bajo → tendencia al alza  
**Taxes (Lifetime)** | $1,97M | Barras por tipo de impuesto (federal, FICA, state…)  
  
Clic en ETR abre **ETR settings** (§14g).

* * *

### 14d. Selector de métricas

_[imagen: Metrics selector]_ 

Dropdown **4 Metrics** con búsqueda. Checkboxes:

Métrica | Estado  
---|---  
Withdrawal Rate | ✅  
Taxes | ✅  
Effective Tax Rate | ✅  
Net Legacy | ⬜  
Liquid Net Worth | ⬜  
  
Las cards visibles en CAPA 1 dependen de esta selección.

* * *

### 14e. Rearrange / Reset metrics

_[imagen: Rearrange]_ 

Menú ⋮ junto a **4 Metrics** :

  * **Rearrange Metrics** — drag-and-drop del orden de cards
  * **Reset Metrics** — restaurar selección y orden por defecto

* * *

### 14f. Display Options

_[imagen: Display options]_ 

Popover (icono sliders). Acordeones:

Sección | Función  
---|---  
**Inflation** | Today's Currency vs nominal  
**Time Range** | Acotar horizonte del gráfico  
**Appearance** | Estilo visual  
**Y-Axis** | Escala y límites  
**X-Labels** | Formato etiquetas temporales  
**Granularity** | Densidad temporal (año/mes…)  
**Page Width** | Ancho del layout  
  
También: toggle leyenda · hide/show series individuales en sidebar.

* * *

### 14g. ETR settings

_[imagen: ETR settings]_ 

Panel **Effective Tax Rate** — fórmula base: `Total Taxes / Total Income`.

**Income — ¿cuenta hacia Total Income?**

Toggle | Descripción  
---|---  
Return of Capital | Retiradas de taxable no sujetas a impuesto  
Non-Taxable Sale Proceeds | Parte no gravada de venta de activos  
Tax-Free Distributions | Retiradas cualificadas de cuentas ventajosas  
  
**Tax — ¿cuenta hacia Total Taxes?**

Toggle | Estado ejemplo  
---|---  
Local Income Tax | ✅ ON  
Property Tax | OFF  
  
Permite alinear la definición de ETR con preferencias del asesor.

* * *

### 14h. Income · Composition

_[imagen: Composition]_ 

Sub-tab **Income** con filtro **All** y vista **Composition**.

Elemento | Detalle  
---|---  
**Hover 2044** | You 50 · Spouse 48 · ETR 26,8 % · Total $330.634  
**Desglose año** | Wage · Employer · Ordinary · Tax-Free · RMDs · Tax-Deferred · Cap Gains  
**Notable Events** | Iconos milestone sobre barras (casa, coche, healthcare…)  
**Leyenda** | Checkboxes para ocultar series · total plan por categoría  
  
_[imagen: View dropdown]_ 

Dropdown de vista Income:

Vista | Descripción  
---|---  
**Composition** | Desglose estándar por fuente de ingreso  
**Rates** | Visualizar ingreso por tipo impositivo  
  
_[imagen: Timeline]_ 

Slider inferior: tooltip `2051 | You 57 · Spouse 55`. Navegación edad 32→91 con handle circular.

* * *

### 14i. Income · Brackets y Progression

_[imagen: Brackets]_ 

Sub-tabs inferiores **Brackets** (activo) · **Progression**.

Tooltip explicativo: visualiza tramos impositivos por tipo de ingreso en el **año seleccionado** (créditos no reflejados).

Tres columnas con bandas 10 % / 12 % / 22 % / 24 %:

Columna | Tipos  
---|---  
Ordinary Interest and Income | Intereses ordinarios  
Roth | Distribuciones Roth  
Tax-Deferred Distributions | 401k, IRA…  
  
**Tabla resumen (año seleccionado):**

Income Type | ETR | Gross | Tax | Net  
---|---|---|---|---  
401k/403b | 19,37 % | $112,42K | $21,78K | $90,64K  
RMD: IRA | 11,09 % | $4,6K | $506 | $4,09K  
Savings Yield | 3,80 % | $2 | $0 | $2  
RMD: 401k/403b | 2,24 % | $77,45K | $1,74K | $75,71K  
**Total** | **12,35 %** | **$194,47K** | **$24,02K** | **$170,45K**  
  
_[imagen: Progression]_ 

**Progression:** curvas escalonadas de tasa marginal vs ingreso hipotético extra ($0→$500K).

Serie | Tasa actual  
---|---  
Ordinary Investment Income | 3,8 %  
RMDs | 11,0 %  
Tax-Deferred Distributions | 33,0 %  
  
Nota: no modela efectos cruzados (un ingreso empujando otro a tramo superior). Misma tabla inferior que Brackets.

* * *

### 14j. Taxes

_[imagen: Taxes]_ 

Sub-tab **Taxes** — barras apiladas por **tipo de impuesto** :

Componente | Total plan  
---|---  
Federal Income Tax | $943.162  
FICA Tax | —  
Capital Gains Tax | —  
NIIT | —  
State Income Tax | —  
California SDI | —  
Property Tax | —  
**Total Taxes** | **$1.972.086**  
  
Línea ETR blanca: pico ~25 % en años de alto ingreso → caída en retirement → repunte tardío (RMDs). Hover 2034: You 40 · Spouse 38 con desglose.

* * *

### 14k. Rates

_[imagen: Rates]_ 

Sub-tab **Rates** — líneas de tasa marginal por fuente. Filtros: **All** · **Marginal** (vs Effective).

Hover 2035: You 41 · Spouse 39:

Serie | Tasa  
---|---  
Your Wage Income | 34,9 %  
Capital Gains Income | 28,1 %  
Ordinary Investment Income | 35,1 %  
Effective Tax Rate | 25,2 %  
  
Útil para ver qué fuente "empuja" el tramo marginal en cada fase.

* * *

### 14l. Deductions

_[imagen: Deductions]_ 

Sub-tab **Deductions** · jurisdicción **Federal**.

Barras apiladas por tipo de deducción + línea ETR federal:

Componente | Ejemplo 2034  
---|---  
Standard Deduction | $32.200  
401k/403b Traditional | $14.076  
HSA Contribution | $4.400  
Medical Expense Deductions | (años tardíos)  
**Total Deductions** | **$50.676**  
Effective Federal Tax Rate | 18,6 %  
  
Filtros adicionales: **State** · **Local**.

* * *

### 14m. Credits

_[imagen: Credits]_ 

Sub-tab **Credits** · **Federal**. Estado vacío: _" No data to display — This view has no data for the selected filters."_

Iconos utilidad: filtros (sliders) · exportar (copy). En planes con créditos aplicables mostraría series temporales equivalentes a Taxes/Deductions.

* * *

## 15\. Cash Flow

Sankey anual **from → to**. Pestaña **Cash Flow**. Una sola vista: el flujo de dinero del **año seleccionado** desde cuentas hasta gastos, pasando por retiradas, retenciones e inflows.

### Arquitectura de página · Cash Flow
    
    
    ┌──────────────────────────────────────────────────────────────────────────────┐
    │ CAPA 0 · Shell del plan                                                      │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 1 · Timeline controller                                                 │
    │  You 77 · Spouse 75 · [2059] 🏥                    ← slider horizontal      │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 2 · Sankey diagram (full width)                         [⚙] [chart]    │
    │                                                                              │
    │  CUENTAS          NODOS INTERMEDIOS              DESTINOS                     │
    │  401k $74K  ──┐                                                              │
    │  401k $38K  ──┼→ Withdrawals ──┬→ Tax Withholding → Withholding: 401k/HSA  │
    │  HSA $21K   ──┤   $133.96K     │                                             │
    │  IRA $2.5K  ──┘                └→ Inflow ──→ Expenses ──→ Living $90K      │
    │  Tax Refund ──→ Refunds ────────→    $117.59K      │      House · Medicare  │
    │                                                     │      Health · Car    │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 3 · Display Options (popover)                                           │
    │  Inflation · Flows · Appearance                                              │
    └──────────────────────────────────────────────────────────────────────────────┘
    

Capa | Interacción | Datos  
---|---|---  
**1** | Slider de año | Sincroniza edades + milestone icons (Medicare…)  
**2** | Hover en link Sankey | Tooltip FROM % → TO % con importe  
**2b** | Grosor de banda | Proporcional al importe del flujo  
**3** | Display Options | Mostrar/ocultar flows, ajustar apariencia  
  
**Flujo lógico del Sankey (izq → der):**
    
    
    Accounts/Refunds → Withdrawals/Refunds → Tax Withholding + Inflow → Expenses → Categorías
    

* * *

### 15a. Vista completa

_[imagen: Sankey]_ 

**Qué es.** Sankey del año **2071** (You 77 · Spouse 75).

Nodo origen | Importe  
---|---  
401k (×2) | $74,05K + $37,74K  
HSA | $21,4K  
IRA | $2,46K  
Tax Refund | $18,76K  
Nodo intermedio | Importe  
---|---  
Withdrawals | $133,96K  
Refunds | $18,76K  
Tax Withholding | $21,33K  
Inflow | $117,59K  
Expenses | $117,59K  
Destino (desde Expenses) | Importe  
---|---  
Living Expenses | $90K  
House | $11,24K  
Medicare | $11,35K  
Health Care | $4K  
Car | $1K  
  
Codificación color: azul cuentas · púrpura withdrawals · gris impuestos · rojo gastos.

* * *

### 15b. Slider de año

_[imagen: Year slider]_ 

Slider con edades **You 65 | Spouse 63** y año **2059**. Icono milestone naranja con tooltip:

  * **Start of Medicare: You: $5,477**

Los milestones del plan aparecen sobre el slider; el Sankey se recalcula al mover el handle.

* * *

### 15c. Tooltip en link

_[imagen: Tooltip]_ 

Hover sobre banda Withdrawals → Inflow (You 77 · Spouse 73):

Campo | Valor  
---|---  
Importe del link | **$106,81K**  
FROM Withdrawals | 83,4 % de $128,1K  
TO Inflow | 90,8 % de $117,6K  
  
Patrón: cada banda muestra cuánto aporta al nodo origen y cuánto recibe el nodo destino.

* * *

### 15d. Display Options

_[imagen: Display options]_ 

Popover con tres acordeones:

Sección | Función  
---|---  
**Inflation** | Valores en Today's Currency  
**Flows** | Mostrar/ocultar tipos de flujo en el Sankey  
**Appearance** | Estilo visual del diagrama  
  
* * *

## 16\. Compare · What-if

Modo **sandbox** del plan. No es una pestaña de contenido distinta: es un **estado transversal** que se activa desde el dropdown **Compare ▾** en la sub-nav. Permite editar el plan en caliente, ver el impacto frente al estado original y decidir qué hacer con los cambios.

### Para qué sirve

Caso de uso | Qué hace el asesor | Valor  
---|---|---  
**Reunión con cliente** | "¿Y si subimos la aportación al 401k un 5 %?" | Respuesta visual inmediata sin tocar el plan guardado  
**Exploración de trade-offs** | Probar jubilación a los 58 vs 62, o vender la casa en 2035 | Compara curvas lado a lado en el mismo gráfico  
**Sensibilidad rápida** | Cambiar un gasto, un income o un flow y ver ΔNW | Evita duplicar planes para cada hipótesis menor  
**Decisión con rollback** | Experimenta libremente sabiendo que puede revertir | Reduce miedo a "romper" el plan del cliente  
**Fork consciente** | Si la hipótesis merece plan propio → Save as New Plan | Separa escenarios sin perder el baseline  
  
En resumen: **Compare convierte el plan en un laboratorio**. El baseline queda congelado como referencia; los cambios son temporales hasta que el usuario elige **Keep** , **Revert** o **Save as New Plan**. Encaja con el flujo asesor-cliente: probar en vivo, cuantificar impacto, decidir si adoptar, descartar o ramificar.

**No sustituye** a escenarios nombrados en sidebar (Current Projections vs New Plan) — es una capa **dentro** del mismo plan para iteración rápida sin crear filas nuevas en la lista de planes.

* * *

### Arquitectura · modo Compare
    
    
    ┌──────────────────────────────────────────────────────────────────────────────┐
    │ CAPA 0 · Shell del plan                                                      │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 0b · Compare chrome (solo cuando activo)                                │
    │  [🔴 Compare ▾]  "Comparing to Baseline"                                     │
    │    ├─ Keep Changes                                                           │
    │    ├─ Revert Changes                                                         │
    │    └─ Save as New Plan                                                       │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 1 · Cualquier pestaña del plan (Plan · Cash Flow · Tax · data tabs…)    │
    │  · UI idéntica — edición permitida en Accounts · Income · Expenses · …        │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 2 · Visualización dual en gráficos                                      │
    │  · Serie sólida  = plan modificado (what-if)                                 │
    │  · Serie outline = Baseline (estado al entrar en Compare)                    │
    │  · Tooltip: Net Worth vs Baseline Net Worth por año                          │
    └──────────────────────────────────────────────────────────────────────────────┘
    

Estado | Qué se guarda | Qué ve el usuario  
---|---|---  
**Normal** | Un solo plan | Una serie en gráficos  
**Compare activo** | Snapshot baseline en memoria + working copy editable | Dos series superpuestas  
**Keep Changes** | Working copy → plan definitivo | Sale de Compare  
**Revert Changes** | Descarta working copy | Vuelve al baseline  
**Save as New Plan** | Working copy → plan nuevo; actual → baseline | Dos planes en sidebar  
  
* * *

### 16a. Entrada · What-if

Al abrir **Compare ▾** , la primera opción es **What-if** con texto explicativo:

> _Make changes and see how they compare to the current state, with the option to roll back._

Activa el modo sandbox. El botón **Compare** pasa a estado activo (punto rojo de grabación) indicando que hay cambios pendientes de resolver.

* * *

### 16b. Dropdown · Comparing to Baseline

_[imagen: Compare dropdown]_ 

Cabecera del menú: icono split-pane + **Comparing to Baseline**.

Acción | Icono | Descripción  
---|---|---  
**Keep Changes** | ✓ blanco | Salir de Compare y **persistir** el plan modificado como nuevo estado  
**Revert Changes** | ↩ rojo | **Descartar** todos los cambios y restaurar el baseline  
**Save as New Plan** | ⑂ azul | **Fork** : el estado actual pasa a un plan separado; este plan vuelve al baseline  
  
_[imagen: Compare active]_ 

Mismo menú con **Compare** resaltado (fondo rojo + icono record) — indicador visual de sesión what-if abierta.

* * *

### 16c. Comparación en gráfico

_[imagen: Chart tooltip baseline]_ 

Hover en el plot (cualquier pestaña con gráfico temporal: Plan, Tax Analytics…):

Campo | Ejemplo 2048  
---|---  
Año · edades | 2048 · You 54 | Spouse 52  
**Net Worth** (sólido) | $3.320.816 — plan modificado  
**Baseline Net Worth** (outline) | $2.981.716 — plan original  
  
Delta en este punto: **+$339.100** a favor del what-if. La línea vertical blanca marca el año; la discontinua suele ser el cursor de hover.

Misma lógica aplicable a otras métricas del sidebar y plots si el motor las expone en modo dual.

* * *

### 16d. Edición bajo Compare

Una vez activo Compare, **todas las superficies de edición siguen disponibles** :

  * Pestaña **Plan** → data tabs **Accounts · Income · Expenses · Real Assets · Flows**
  * **Rates** , milestones, flows de aportación…
  * Otras pestañas de análisis (Cash Flow, Tax Analytics) muestran el impacto recalculado

Los cambios viven en la **working copy** hasta Keep / Revert / Save as New Plan. El baseline no se escribe en BD hasta que el usuario confirma.

**Patrones UX**

  * **Sandbox sin fricción** — no obliga a crear "Plan B" antes de probar.
  * **Rollback explícito** — Revert siempre visible; reduce riesgo en reunión.
  * **Fork opcional** — Save as New Plan cuando la hipótesis merece escenario persistente (alineado con acordeón Plans en sidebar §3).
  * **Feedback cuantificado** — tooltip dual año a año, no solo sensación cualitativa.

* * *

## 17\. Optimize

Motor de **optimización automática** del plan (principalmente fiscal US). Acceso: dropdown **Optimize ▾** en la sub-nav — no es una pestaña de contenido, sino un **hub de módulos** que el motor aplica sobre la proyección.

### Para qué sirve

vs Compare (§16) | Optimize  
---|---  
El asesor cambia datos manualmente | El motor **calcula** conversiones, retiradas, harvesting…  
Sandbox reversible | Estrategia con target + constraints + módulos  
"¿Y si subo el gasto?" | "¿Cuánto convierto a Roth para llenar el tramo del 12 %?"  
  
**Casos de uso:**

  * **Roth ladder / bracket filling** — target de ingreso gravable ($50K) + conversiones automáticas desde tax-deferred.
  * **Evitar cliffs** — IRMAA, ACA subsidy cliff, NIIT como constraints.
  * **Trade-off taxes vs legacy** — la UI muestra explícitamente _saved in taxes_ vs _lost in net legacy_.
  * **Orden de drawdown** — módulo Drawdown (sin captura) para secuencia de retiradas.
  * **Gastos flexibles** — módulo Flexible Spending (None vs Flexible).

* * *

### Arquitectura · Optimize
    
    
    ┌──────────────────────────────────────────────────────────────────────────────┐
    │ CAPA 0 · Shell del plan                                                      │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 1 · Optimize ▾ dropdown                                                 │
    │  Tax Strategy | Flexible Spending | Roth Conversions | Drawdown | Gain Harv. │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 2 · Vista activa (una de):                                              │
    │  A) Wizard Tax Strategy (modal centrado, 4–5 pasos)                          │
    │  B) Combined Impact dashboard (resultados post-Create strategy)                │
    │  C) Module-only view (Roth / Shielding / Harvesting)                          │
    │  D) Config panel lateral (Tax Strategy · Roth Conversions…)                  │
    └──────────────────────────────────────────────────────────────────────────────┘
    

**Flujo wizard Tax Strategy (siempre igual tras elegir target):**
    
    
    Set up → New strategy → ① Choose target → ② Define strategy → ③ Add constraints → ④ Enable modules → Create strategy → Combined Impact
    

Los pasos **③ Add constraints** y **④ Enable modules** aparecen **siempre** , independientemente del target (Tax Bracket · IRMAA · ACA/FPL · Income Target).

**Navegación post-creación:**
    
    
    Combined Impact (vista agregada)
        ├─ clic Tax Strategy card → panel config / volver Combined
        ├─ clic Roth Conversions → vista solo Roth → [← Tax Strategy] Combined Impact
        ├─ clic Withdrawal Shielding → vista solo Shielding → idem
        └─ clic Gain Harvesting → vista solo Harvesting → idem
    

* * *

### 17a. Dropdown Optimize

_[imagen: Optimize menu]_ 

Opción | Icono | Función  
---|---|---  
**Tax Strategy** | ✨ | Hub principal: target + módulos coordinados  
**Flexible Spending** | 🛒 | None vs Flexible  
**Roth Conversions** | 🪙→ | Conversiones standalone (también módulo de Tax Strategy)  
**Drawdown** | 📉 | Orden/secuencia de retiradas  
**Gain Harvesting** | 🌱 | Realizar ganancias a tipos favorables  
  
* * *

### 17b. Tax Strategy · entrada

_[imagen: Setup entry]_ 

**Set up your tax strategy** — _Discover savings and tax planning opportunities to help you reach your goals._

Ruta | Descripción  
---|---  
**New strategy** | Wizard manual (documentado abajo)  
**Common strategy** | Plantillas preconfiguradas de jubilación  
**Optimize** | El motor prueba múltiples estrategias y estima la mejor  
  
* * *

### 17c. Wizard · ① Choose your target

_[imagen: Choose target]_ 

_What taxable income ceiling are you aiming for?_

Target | Descripción  
---|---  
**Tax Bracket** | Llenar un tramo marginal cada año  
**IRMAA Cliff** | Quedarse bajo umbral de recargo Medicare  
**ACA / FPL** | Mantener ingreso bajo múltiplo FPL para subsidios  
**Income Target** | Cifra concreta de ingreso gravable anual  
  
* * *

### 17d. Wizard · ② Define your strategy

_How do you want the strategy to work?_ — el formulario **cambia según el target** elegido:

**Income Target:**

_[imagen: Income target]_ 

$50.000/año · ajustado por inflación · menú ⋮ para opciones avanzadas.

**Tax Bracket:**

_[imagen: Tax bracket]_ 

Dropdown **12 %** — _Fill this marginal rate without crossing into the next._

**IRMAA Cliff:**

_[imagen: IRMAA dropdown]_ 

Cliff | Surcharge | Umbral  
---|---|---  
Cliff 1 | No Surcharges | Below $218.000  
Cliff 2 | +$81/mo | Below $274.000  
Cliff 3 | +$203/mo | Below $342.000  
Cliff 4 | +$325/mo | Below $410.000  
  
_[imagen: IRMAA selected]_ 

**ACA / FPL:**

_[imagen: ACA FPL]_ 

Opción | Badge | Notas  
---|---|---  
250 % FPL | Last CSR Tier | Último tier con cost-sharing reductions  
300 % FPL | Credits Only | Solo premium tax credits  
400 % FPL | Subsidy Cliff | Créditos desaparecen por encima  
  
* * *

### 17e. Wizard · ③ Add constraints

_Optionally add ceilings and guardrails…_ — **siempre** tras Define, para cualquier target.

_[imagen: Add constraints]_ 

Constraint | Descripción  
---|---  
**Capital Gains Bracket** | No cruzar tramo de capital gains  
**Avoid NIIT** | Cap ingreso inversión · evitar 3,8 %  
**Avoid IRMAA Surcharges** | Cap ingreso · evitar recargo Medicare  
**Preserve ACA Subsidies** | Cap ingreso · mantener subsidios marketplace  
  
Todos off por defecto. Botones **← Back** · **Continue**.

* * *

### 17f. Wizard · ④ Enable modules

_Choose which strategy modules to activate._ — **siempre** el último paso antes de crear.

_[imagen: Enable modules]_ 

Módulo | Función  
---|---  
**Roth Conversions** ✓ | Convertir tax-deferred → Roth para llenar target  
**Withdrawal Shielding** ✓ | Cap retiradas deferred; exceso a fuentes tax-free  
**Gain Harvesting** ✓ | Realizar cap gains a tipos favorables · reset cost basis  
  
Botón **Create strategy** (no "Continue").

* * *

### 17g. Combined Impact · dashboard de resultados

Vista principal tras crear la estrategia. Muestra el **impacto agregado** de todos los módulos activos vs baseline.

_[imagen: Combined Impact]_ 

#### Barra de módulos (CAPA superior)

Card | Estado | Acción  
---|---|---  
**Tax Strategy** | $50K target | → panel config  
**Roth Conversions** | Active + sparkline | → vista solo Roth  
**Withdrawal Shielding** | Active | → vista solo Shielding  
**Gain Harvesting** | Active | → vista solo Harvesting  
  
Clic en módulo → drill-down. Clic en **Tax Strategy** (arriba) → vuelta a **Combined Impact**.

#### KPI cards principales

Card | Color | Valor ejemplo | Subtexto  
---|---|---|---  
**Saved in taxes** | Azul 👍 | **$30,9K** | _Your strategy saves you $30,912 in taxes over the life of your plan_  
|  | 1,6 % · $1,96M vs $1,99M | Comparación lifetime tax liability  
**Lost in net legacy** | Rojo 👎 | **$101,3K** | _Your strategy reduces what you leave behind by $101,308_  
|  | 2,3 % · $4,38M vs $4,48M | Comparación net legacy final  
  
Patrón: ● sólido = Strategy · ○ outline = Baseline.

#### Gráfico central · stacked bar

  * Filtros: **Income** · **Federal** · **Rates** · iconos vista tabla / expand
  * Barras apiladas por tramo impositivo (15 % · 12 % · 10 % · 0 %)
  * Iconos numerados 1–8 = acciones de estrategia por año
  * **Tooltip 2041** (You 54 · Spouse 52): 15 % $55.928 · 12 % $18.839 · 10 % $24.800 · 0 % $87.461 · **Total $187.028**

#### Fila media · acciones + Monte Carlo

Elemento | Contenido  
---|---  
**Optimize** card | _Find the best strategy for your goals_ →  
**Compare** card | _Explore and compare alternative strategies_ →  
**Chance of Success impact** | **-1,0 %** · 95,9 % With Strategy vs 96,9 % No Strategy  
  
#### Gráficos inferiores · líneas temporales

Chart | Métrica | Resumen derecha  
---|---|---  
**Saved in Taxes** | Línea sólida vs dashed baseline | 1,6 % · $1,96M vs $1,99M  
**Lost in Net Legacy** | Idem | 2,3 % · $4,38M vs $4,48M  
  
Iconos ⭐ y ⚙ en esquina de cada chart.

#### KPI dropdown (métrica intercambiable)

_[imagen: KPI taxes]_ 

Clic en chevron del KPI principal abre selector de métrica:

Métrica | Delta vs baseline  
---|---  
Tax Liability | -$30,91K ↓ (azul, favorable)  
Net Legacy | -$101,31K ↓ (rojo, desfavorable)  
Net Worth | -$468,33K ↓  
Effective Tax Rate | -0,2 % ↓  
RMDs | -$635,66K ↓  
IRMAA | No change  
Tax-Deferred Investments | (cortado)  
  
_[imagen: KPI legacy]_ 

Mismo dropdown con **Net Legacy** seleccionado — $101,3K lost · 2,3 % · $4,4M vs $4,5M.

* * *

### 17h. Combined Impact · tabla Details

_[imagen: Details table]_ 

**Details · 54 years** — desglose año a año.

Columna | Dot color | Ejemplo 2026  
---|---|---  
Year | — | 2026  
Tax Liability | blanco | $74,49K  
Effective Tax Rate | blanco | 26,6 %  
Net Worth | púrpura | $1,04M  
Net Legacy | verde | $1,02M  
Taxable Income | verde claro | $225,09K  
Withdrawals | blanco | $0 / $50K  
RMDs | rosa | $0 (early)  
IRMAA | naranja | $0  
**Roth Conversions** | azul | $0 → **$50K** (2041–43)  
Gain Harvesting | teal | $0  
Withdrawal Shielding | azul | $0  
  
**Tooltip 2040 · Effective Tax Rate:** Strategy 18,8 % (●) vs Baseline 18,8 % (○).

Controles tabla: filas/página · toggle vista · expand/export.

* * *

### 17i. Tax Strategy · panel de configuración

_[imagen: Nav card]_ 

Tooltip en sub-nav: _Your shared tax strategy target and income constraints. Click to configure._ Card resumen **Tax Strategy · $50K**.

_[imagen: Config panel]_ 

Sección | Campos  
---|---  
**Header** | Tax Strategy · refresh · **Optimize** (Find best) · **Compare** (Explore alternatives)  
**Toggle** | Off / **On**  
**Target** | Income Target · $50.000 (inflation-adjusted)  
**Constraints** | Capital Gains · NIIT · IRMAA · ACA (toggles)  
**Time Range** | Any time during plan · + Add Time Range  
  
* * *

### 17j. Roth Conversions · módulo

_[imagen: Module card]_ 

Card **Active** con sparkline. Tooltip: _Convert from tax-deferred to Roth… Click to configure._

_[imagen: Config panel]_ 

Campo | Valor  
---|---  
Toggle | **On**  
Tax Strategy link | $50K  
Source Accounts | All Tax-Deferred  
Time Range | Any time · + Add Time Range  
Annual Cap | No cap · + Add Annual Cap  
  
**Vista solo Roth Conversions** (drill-down desde Combined Impact):

Bloque | Contenido  
---|---  
Header | ← **Tax Strategy** · _Viewing Roth Conversions only. Go back to view combined impact._  
**Strategic Conversions** | Total **$587K** · dot-matrix timeline · hover 2047 → $50K  
**Conversion Sources** | 2 accounts · barra purple/blue · $587K total  
KPI | **$30,9K saved in taxes** (mismo dropdown §17g)  
**Conversion Plan** | 12 years · barras $50K/año  
  
_[imagen: Strategic conversions]_ 

_[imagen: Conversion sources]_ 

_[imagen: Conversion plan]_ 

Tabla 2041–2052: 401k/403b $50K → transición 2051 ($44,27K + $5,73K IRA) → 2052 solo IRA $37,11K.

* * *

### 17k. Withdrawal Shielding · módulo

_[imagen: Module active]_ 

Badge **Active** · sparkline plano.

_[imagen: Only view]_ 

_Viewing Withdrawal Shielding only. Go back to view combined impact._

Bloque | Contenido  
---|---  
Cards superiores | Withdrawal Shielding $50K · Drawdown Order (iconos cuentas) · Taxable Withdrawals OFF  
**Taxes** | no change · $2M vs $2M  
**Net Legacy** | no change · $1,4M vs $1,4M  
**Shielding Plan** | _No planned withdrawal shielding_ (empty state)  
Chart | Withdrawals · Categories · barras azules por año  
  
* * *

### 17l. Gain Harvesting · módulo

_[imagen: Only view]_ 

_Viewing Gain Harvesting only. Go back to view combined impact._

Bloque | Contenido  
---|---  
Settings card | $50K · 0 %  
**Total Gains Harvested** | $0  
Harvesting Sources | barra vacía  
Taxes / Net Legacy | no change  
**Harvesting Plan** | _No planned gains harvesting_  
Chart | Income · Federal · Rates (mismo patrón Tax Analytics)  
  
* * *

### 17m. Flexible Spending

Sin captura en este batch. Desde **Optimize ▾ → Flexible Spending** :

Modo | Comportamiento  
---|---  
**None** | Gastos fijos según plan  
**Flexible** | El motor puede reducir gasto discrecional si hace falta liquidez  
  
* * *

### 17n. Drawdown

Sin captura en este batch. Desde **Optimize ▾ → Drawdown** :

Configura **orden de retirada** entre cuentas (taxable → tax-deferred → tax-free, etc.). En vista Withdrawal Shielding aparece card **Drawdown Order** con secuencia visual de tipos de cuenta.

* * *

**Patrones UX · Optimize**

  * **Wizard lineal** con pasos ③④ invariantes — el asesor siempre pasa por constraints y módulos.
  * **Trade-off explícito** — taxes saved vs legacy lost en KPIs gemelos (no esconde el coste).
  * **Combined → module drill-down** — agregado primero, detalle por palanca después.
  * **Baseline vs Strategy** en toda la UI (●/○, solid/dashed).

* * *

## 18\. Reports

Pestaña **Reports** en la sub-nav del plan. Vista de **exploración libre** de la proyección: combina gráfico configurable arriba y tabla detallada abajo. No es un PDF exportado — es un **workbench analítico** dentro del plan.

### Para qué sirve

vs Plan dashboard (§12) | Reports  
---|---  
Plots predefinidos del plan | Cualquier plot built-in o custom  
Sidebar año fijo | Tabla multi-métrica año a año  
Edición del modelo | Solo lectura / exploración  
  
**Casos de uso:**

  * Revisar **Income vs Expenses** en tabla junto al gráfico de NW.
  * Cambiar a tabla **Rates** o **Summary** sin salir del plan.
  * Seleccionar 4 métricas simultáneas en chart + tabla.
  * **Exportar** datos para reunión o informe externo.
  * **Maximizar tabla** para análisis tabular denso.

* * *

### Arquitectura · Reports
    
    
    ┌──────────────────────────────────────────────────────────────────────────────┐
    │ CAPA 0 · Shell del plan (sub-nav · Reports activo)                           │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 1 · Toolbar Reports                                                     │
    │  [Explore] · Tables ▾ · Plots ▾ · N Metrics ▾ · ⚙ Display · ⛶ · ↓ · ⋮     │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 2 · Chart area (plot seleccionado · milestones · cursor año)            │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 2b · Resize handle (+) — ajustar altura chart vs tabla                  │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 3 · Data table (columnas = métricas activas · filas = años)             │
    └──────────────────────────────────────────────────────────────────────────────┘
    

* * *

### 18a. Dashboard · Explore

_[imagen: Reports dashboard]_ 

Vista por defecto al entrar en Reports.

#### Toolbar izquierda

Control | Función  
---|---  
**Explore** | Modo activo (botón blanco) — exploración interactiva  
**Tables ▾** | Tipo de tabla inferior  
**Plots ▾** | Tipo de gráfico superior  
**4 Metrics ▾** | Selector multi-métrica (checkboxes)  
  
#### Toolbar derecha

Icono | Función  
---|---  
**Display Options** (sliders) | Inflation · Time Range · Appearance · Y-Axis · X-Labels  
**Maximize Table** (⛶) | Tabla a pantalla completa  
**Export** (↓) | Descargar reporte  
**More** (⋮) | Reset chart height · Reset plot config  
  
#### Chart (mitad superior)

  * Area chart **Net Worth** · eje Y $0–$10M · eje X edades ~30–83
  * **Milestones** numerados en la línea temporal
  * **Cursor vertical** en año seleccionado (ej. 2036) — sincroniza con fila destacada en tabla

#### Tabla (mitad inferior)

Columna | Ejemplo Start / 2026 / 2050  
---|---  
Year | Start · 2025…2050  
Net Worth | $1,045,003 → $3,765,753  
Liquid Net Worth | $1,021,500 → $3,382,096  
Income | $278,790 (2026)  
Expenses | $125,179 (2026)  
  
Fila del año del cursor **resaltada**. Scroll vertical para toda la proyección.

* * *

### 18b. Tables ▾

_[imagen: Tables dropdown]_ 

Opción | Icono | Contenido  
---|---|---  
**Summary** | bar chart | Resumen agregado por categorías  
**Rates** | sprout | Tasas de crecimiento / retorno por año  
**Income** | line up | Desglose de ingresos  
  
Cambia las **columnas o filas** de la tabla inferior sin cambiar el plot superior.

* * *

### 18c. Plots ▾

_[imagen: Plots dropdown]_ 

**Your Plots** (custom, con color):

Plot | Color  
---|---  
Expenses (Change in Net) | naranja  
Change in Net Worth | azul  
  
**Built-in Plots:**

Plot | Tipo  
---|---  
Net Worth | line  
Stacked Net Worth | stacked bar  
Income | bar ↑  
Expenses | wallet  
Spending | wallet  
  
Scroll para más opciones. Los custom plots se crean desde el dashboard Plan (§12).

* * *

### 18d. Metrics selector

_[imagen: Metrics selector]_ 

Dropdown **4 Metrics** — checkboxes con color de serie:

Activa | Color | Inactiva (ejemplos)  
---|---|---  
Net Worth | azul | Net Legacy  
Liquid Net Worth | gris | Withdrawals  
Income | teal | Withdrawal Rate  
Expenses | naranja | (más abajo en scroll)  
  
Las métricas activas aparecen como **columnas en tabla** y **series en chart** (según plot compatible).

* * *

### 18e. Display Options

_[imagen: Display options]_ 

Sección | Función  
---|---  
**INFLATION** | Real vs nominal · ajuste inflación  
**TIME RANGE** | Acotar rango de años visible  
**APPEARANCE** | Colores · estilo visual  
**Y-AXIS** | Escala · min/max  
**X-LABELS** | Formato etiquetas temporales  
  
Cada sección expandible (chevron ▾).

* * *

### 18f. Toolbar actions

_[imagen: Toolbar]_ 

Acción | Tooltip / menú  
---|---  
Display Options | Sliders icon  
**Maximize Table** | _Maximize Table_  
Export | Download icon  
More (⋮) | Reset chart height · Reset plot config  
  
* * *

### 18g. Chart / table resize

_[imagen: Resize handle]_ 

**Handle`+`** en el divisor central — arrastrar para dar más altura al gráfico o a la tabla. Complementa **Maximize Table** para ajuste fino.

* * *

**Patrones UX · Reports**

  * **Split view** chart + tabla sincronizados por año.
  * **Composición libre** — plot, tabla y métricas independientes.
  * **Export nativo** — datos del plan sin salir a Excel manual.
  * **Reset** — recuperar layout si el usuario deforma alturas o config.

* * *

## 19\. Estate

Pestaña **Estate** en la sub-nav. Modela la **distribución del patrimonio al fallecimiento** : gross estate → costes/impuestos → net legacy a herederos. Enfocado en **fiscalidad sucesoria US** (estate tax exemption, stepped-up basis, IRAs tax-deferred).

### Para qué sirve

  * Responder: _¿Cuánto reciben realmente los herederos?_
  * Visualizar **estate drag** (impuestos + costes admin + liquidación).
  * Ajustar **assumptions** (tipo deferred, cap gains, charitable giving…).
  * Identificar **insights** automáticos (96 % a herederos, 60 % tax-free…).

* * *

### Arquitectura · Estate
    
    
    ┌──────────────────────────────────────────────────────────────────────────────┐
    │ CAPA 0 · Shell del plan (sub-nav · Estate activo)                            │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 1 · KPI bar                                                             │
    │  Gross Estate · Estate Drag · Net Legacy                                     │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 2 · Insight banners (clicables → panel Insights)                        │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 3 · Estate Flow (Sankey) · share · display options · view insights      │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 4 · Breakdown table (categorical | detailed) · Assumptions card         │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 5 · Estate Settings (panel lateral · desde Net Legacy o Assumptions)    │
    └──────────────────────────────────────────────────────────────────────────────┘
    

* * *

### 19a. Dashboard overview

_[imagen: Estate dashboard]_ 

#### KPI bar (3 cards)

KPI | Valor ejemplo | Visual  
---|---|---  
**Gross Estate** | $4,54M | Mini bar chart composición  
**Estate Drag** | $177,47K | Gauge **4 %** del total  
**Net Legacy** | $4,36M | Gauge **96 %** · clic → Estate Settings  
  
#### Insight banners (debajo KPIs)

Banner | Texto  
---|---  
Heirs | _Your heirs receive**96%** of your gross estate._  
Tax-free | _60% of your estate is in tax-free accounts…_  
Exemption | _Your taxable estate of $4.54M is**under** the federal estate tax exemption of $13.6M._  
  
Clic en banner o icono **Insights** → panel §19g.

#### Estate Flow (Sankey central)

Ver §19c–§19g.

#### Breakdown (inferior izquierda)

Tabla Gross · Costs · Net por ítem. Toggle **categorical** vs **detailed** (§19h).

#### Assumptions (inferior derecha)

Resumen de parámetros. Clic ⚙ → Estate Settings (§19j).

* * *

### 19b. Assumptions card

_[imagen: Assumptions]_ 

Assumption | Valor  
---|---  
Tax-Deferred Rate | 25 %  
Capital Gains Rate | 15 %  
Stepped-Up Basis | Yes  
Asset Liquidation | 6 %  
Charitable Giving | 0 %  
Admin Costs | 1 %  
  
**Gear icon** (esquina) → **Estate Settings**.

* * *

### 19c. Estate Flow · controles

_[imagen: Insights tooltip]_ 

Header **ESTATE FLOW** · controles esquina superior derecha:

Icono | Función  
---|---  
**View Insights** (nodos) | Abre panel Insights §19g  
**Display Options** (sliders) | Inflation · Flows · Appearance  
  
* * *

### 19d. Display Options (Estate)

_[imagen: Estate display options]_ 

Sección | Función  
---|---  
**INFLATION** | Valores reales vs nominales  
**FLOWS** | Configuración visual del Sankey  
**APPEARANCE** | Colores y estilo  
  
Menos opciones que Reports (sin Y-Axis / X-Labels).

* * *

### 19e. Estate Flow · Sankey

_[imagen: Sankey partial]_ 

Flujo izquierda → derecha:

Etapa | Nodo | Valor  
---|---|---  
Source | **Gross Estate** | $4,54M  
Intermediate | Tax-Free Investments | $2,73M  
Intermediate | Taxable Investments | $1,28M  
Intermediate | Real Assets | $515,51K  
Intermediate | Cash | $8,68K  
Destination | **To Heirs** | $4,36M  
Destination | Income Tax | $101,17K  
Destination | Admin Costs | $45,36K  
Destination | Liquidation Costs | $30,93K  
  
_[imagen: Sankey full]_ 

Vista completa con todos los destinos. Ancho de banda ∝ importe.

* * *

### 19f. Sankey tooltip

_[imagen: Sankey tooltip]_ 

Hover en banda del Sankey:

Campo | Ejemplo  
---|---  
Valor banda | **$2,63M**  
**FROM** | Tax-Free Investments $2,7M · **96,3 %**  
**TO** | To Heirs $4,4M · **60,3 %**  
  
Mismo patrón FROM/TO % que Cash Flow Sankey (§15).

* * *

### 19g. Insights panel

_[imagen: Insights panel]_ 

Panel lateral **Insights** — _Key observations about your estate based on your current plan and assumptions._

# | Insight  
---|---  
1 | Heirs receive **96 %** of gross estate  
2 | **60 %** in tax-free accounts  
3 | Taxable estate **under** federal exemption ($30M en captura)  
4 | Stepped-up basis eliminates unrealized cap gains  
5 | Taxes and costs **< 5 %** of estate  
6 | Gross estate **$4,54M**  
7 | Taxes reduce by **$101,17K**  
8 | Admin costs **$45,36K**  
9 | Liquidation costs **$30,93K**  
10 | Net legacy **$4,36M**  
  
Cada fila expandible (chevron). Acceso desde banners, KPI Net Legacy o icono View Insights en Sankey.

* * *

### 19h. Breakdown table

_[imagen: Breakdown categorical]_ 

**BREAKDOWN** — columnas **Item · Gross · Costs · Net**.

Item | Gross | Costs | Net  
---|---|---|---  
Roth IRA | $2,14M | — | $2,14M  
Taxable Investments | $1,28M | — | $1,28M  
House | $515,39K | ($30,92K) | $484,46K  
HSA | $404,7K | ($101,17K) | $303,52K  
Roth IRA (2) | $183,01K | — | $183,01K  
Final Tax Refund | $5,43K | — | $5,43K  
Savings | $3,22K | — | $3,22K  
Tesla / Spouse's Car | $100 / $21 | ($6) / ($1) | $94 / $20  
Federal Estate Tax | — | — | $0  
Admin Costs | — | ($45,36K) | -$45,36K  
**Total** | **$4,54M** | **($177,47K)** | **$4,36M**  
  
#### Toggle vista (esquina superior derecha)

Icono | Vista  
---|---  
Grid | **Categorical** — agrupado por tipo  
List | **Detailed** — línea por cuenta/activo  
  
* * *

### 19i. Estate Settings

_[imagen: Estate settings]_ 

Panel **Estate Settings** — acceso desde **Net Legacy** KPI o **Assumptions** ⚙.

_Configure how your estate value is estimated at the end of your plan. These assumptions affect the**Net Legacy** metric._

Sección | Control | Valor ejemplo  
---|---|---  
**Tax-Deferred Account Tax Rate** | Slider | 25 % — ordinary income tax al retirar herederos  
**Taxable Accounts** | Toggle Stepped-up Basis | **On** — elimina cap gains no realizadas  
**Liquidation Costs** | Slider | 6 % — costes venta inmuebles/activos  
**Charitable Giving** | Slider | 0 % — donaciones desde cuentas menos eficientes primero  
**Administrative Costs** | Slider | 1 % — probate, legal, executor  
  
Menú ⋮ en header para opciones adicionales.

* * *

**Patrones UX · Estate**

  * **Gross → Drag → Net** — funnel explícito en KPIs.
  * **Sankey + tabla** — misma información, vista flujo vs línea a línea.
  * **Insights generados** — narrativa para reunión sin calcular manualmente.
  * **Settings desde múltiples entry points** — Net Legacy, Assumptions, Insights gear.

* * *

## 20\. Settings

Última pestaña de la sub-nav del plan: **Settings ▾**. Hub de **configuración transversal** del plan — no edita cuentas ni flujos (eso es Plan data §12k), sino supuestos globales: milestones, tasas, fiscal, métricas, alineación temporal.

### Para qué sirve

  * Reconfigurar **milestones** con preview en chart.
  * Definir **Rates** (Fixed / Historical / Advanced) para inflación, stocks, bonds.
  * Ajustar **carácter fiscal** de dividendos y bonos.
  * Configurar **motor fiscal** (location, filing, withholding).
  * Personalizar **definición de métricas** (ETR, Spending, Net Legacy).
  * Override de **year alignment** por plan.

* * *

### Arquitectura · Settings
    
    
    ┌──────────────────────────────────────────────────────────────────────────────┐
    │ CAPA 0 · Shell del plan (sub-nav · Settings ▾ activo)                        │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 1 · Dropdown Settings ▾ → Milestones | Rates | … | Notes                │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 2 · Layout Settings (al entrar en cualquier categoría)                  │
    │  ┌─────────────┬──────────────────────────────────────────────────────────┐  │
    │  │ Sidebar     │ Chart preview (proyección + milestones)                │  │
    │  │ (7+1 items) │ + panel de configuración de la categoría activa          │  │
    │  └─────────────┴──────────────────────────────────────────────────────────┘  │
    ├──────────────────────────────────────────────────────────────────────────────┤
    │ CAPA 3 · Drill-downs (Rates → Inflation editor, Tax → Withholding, etc.)     │
    └──────────────────────────────────────────────────────────────────────────────┘
    

**Patrón común:** al clicar cualquier ítem del dropdown (o del sidebar), la pantalla muestra **chart de contexto arriba** \+ **formulario abajo**. El sidebar persiste para saltar entre categorías sin volver al dropdown.

* * *

### 20a. Dropdown Settings

_[imagen: Settings dropdown]_ 

Opción | Icono | Navegación  
---|---|---  
**Milestones** | 📍 | Lista editable + Add Milestone  
**Rates** | 📈 | Fixed / Historical / Advanced  
**Dividends** | 📊 | Composición fiscal + reinversión  
**Bonds** | 🎫 | Allocation · Location · Income composition  
**Tax** | 📄 | Estimation · Filing · Withholding…  
**Metrics** | 🎯 | ETR · Spending · Net Legacy  
**Other Settings** | ⚙️ | Year alignment  
**Notes** | 📝 | Notas del plan (sin captura)  
  
* * *

### 20b. Sidebar de navegación

_[imagen: Sidebar]_ 

Sidebar vertical izquierdo — **mismos 7 ítems** que el dropdown (+ Notes al pie). El activo lleva:

  * Texto blanco + icono destacado
  * **Barra vertical blanca** en el borde derecho del ítem

Visible en todas las sub-pantallas de Settings (Milestones, Rates, Tax…).

* * *

### 20c. Milestones

_[imagen: Milestones list]_ 

Chart NW $0–$4M arriba con markers de milestones. Lista editable abajo:

Milestone | Trigger | Valor | Edad resultante  
---|---|---|---  
Your Retirement | At another milestone | Spouse's Retirement +3 | —  
Spouse's Retirement | At another milestone | Financial Independence +2 | —  
Your Life Expectancy | At year | 2079 | Age 85  
Spouse's Life Expectancy | At year | 2079 | Age 83  
Financial Independence | Net Worth | > 20 × Expenses | —  
First Home | At year | 2027 | Age 33  
Kid #1 | At year | 2026 | Age 32  
Kid #2 | At year | 2029 | Age 35  
  
Cada fila: icono color · nombre · dropdown tipo trigger · input valor · edad/año calculado a la derecha.

**\+ Add Milestone** al final.

#### Add Milestone modal

_[imagen: Add Milestone]_ 

Grid 2 columnas · 14 tipos:

Columna izq. | Columna der.  
---|---  
Custom Milestone | Move  
Financial Independence (disabled) | FIRE  
LeanFIRE | FatFIRE  
CoastFIRE | Debt Free  
Start School | Graduate  
Gap Year | New Job  
Get Married | Kid  
  
Algunos con icono **i** (info). FI aparece greyed si ya existe.

* * *

### 20d. Rates · overview

_[imagen: Rates overview]_ 

Chart proyección $0–$6M arriba. Modo selector central:

Modo | Icono | Uso  
---|---|---  
**Fixed** | wand | Tasas constantes o por edad  
**Historical** | lightning | Secuencia histórica (ej. desde 1928)  
**Advanced** | sliders | Editor por categoría  
  
Lista inferior (modo **Fixed** activo):

Categoría | Valores (pills)  
---|---  
**Inflation** | 3 %  
**Stocks** | 6 % · 2,5 %  
**Bonds** | 1,5 % · 3,5 %  
  
Dos pills en Stocks = Growth Rate + Dividend Yield. En Bonds = Yield + Allocation %.

* * *

### 20e. Rates · Fixed tab

_[imagen: Fixed tab]_ 

Misma lista con pills de color por categoría. Clic en fila → drill-down (Inflation / Stocks / Bonds).

* * *

### 20f. Rates · Historical tab

_[imagen: Historical tab]_ 

Fila | Valor  
---|---  
**Historical Sequence** | **1928** (badge azul)  
Inflation | Default  
Stocks | Default  
Bonds | Default  
  
Clic en Historical Sequence → elegir año de inicio de la secuencia.

* * *

### 20g. Rates · Advanced tab

_[imagen: Advanced tab]_ 

Solo tres filas sin pills — cada una abre editor avanzado:

  * **Inflation** (marrón)
  * **Stocks** (azul)
  * **Bonds** (gris)

#### Menú Advanced

_[imagen: Advanced menu]_ 

Opción | Función  
---|---  
**More info** | Documentación del modo  
**Reset All** | Restaurar defaults  
  
* * *

### 20h. Rates · Inflation drill-down

_[imagen: Inflation detail]_ 

`< Inflation` · botones **Inflation Rate** (edit) · **Open advanced editor** · reset.

  * Chart línea naranja **2 %** constante · edades 32–85 · nodos en 59 y 85
  * **Benefit COLA Modifier** — input **0 %**

#### Inflation Rate editor (modal)

_[imagen: Inflation editor]_ 

Layout dos columnas:

Izquierda | Derecha  
---|---  
Type: Inflation Rate | Chart % (0–9 %) · línea 3 %  
Age 32 → 3 % | Dropdown Your Age  
Age 59 → 3 % | Balance - Today's Currency  
Age 85 → 3 % | Chart impacto purchasing power  
  
Botón ✓ naranja guardar.

* * *

### 20i. Rates · Stocks drill-down

_[imagen: Stocks detail]_ 

`< Stocks` · dos charts apilados:

Chart | Valor | Edades nodos  
---|---|---  
**Growth Rate** | 6,0 % flat | 32 · 58 · 85  
**Dividend Yield** | 2,0 % flat | 32 · 58 · 85  
  
Botones edit + Open advanced editor en Growth Rate.

#### Growth Rate editor

_[imagen: Growth editor]_ 

Mismo patrón que Inflation: puntos Age 32/59/85 @ 6 % · chart Balance - Actual Currency debajo · ✓ azul.

* * *

### 20j. Dividends

_[imagen: Dividends overview]_ 

#### Stock Dividend Composition

Sliders (solo taxable accounts):

Tipo | Valor  
---|---  
**Qualified Dividends** | 100 % — LTCG rates  
**Ordinary Dividends** | 0 % — marginal rate  
  
#### Dividend Reinvestment

_[imagen: Reinvestment dropdown]_ 

Opción | Comportamiento  
---|---  
**Always** | Reinvertir en la cuenta origen  
**Until Retirement** | Reinvertir hasta jubilación, luego cash flow  
**Never** | Pagar como cash flow  
**Time Range** | Reinvertir solo en rango temporal  
  
Nota azul: _Individual accounts can override this setting._

* * *

### 20k. Bonds

_[imagen: Bonds overview]_ 

Tres secciones apiladas:

#### 1\. Bond Allocation

Toggle **None** | **Portfolio Allocation** (activo).

  * Chart allocation 0–80 % por edad · curva ~10 % → 35 % @ 63 → flat
  * Botón **Edit** · reset

#### 2\. Bond Location

**Distribute Evenly** | Prioritize Accounts.

Lista cuentas con barra azul: Roth IRA · HSA · 401k/403b · IRA · Taxable (×2).

Iconos chart / list / reset.

#### 3\. Bond Income Composition

Solo taxable con bond allocation:

Tipo | %  
---|---  
Municipal Bonds | 0 %  
Treasury / Government | 0 %  
Other (Corporate…) | 100 %  
  
* * *

### 20l. Tax · overview

_[imagen: Tax overview]_ 

Lista de 5 bloques configurables:

Bloque | Valor resumen  
---|---  
**Tax Estimation** | United States, California  
**Filing Status** | Joint  
**Withholding** | Tax-Deferred: 20 %, Taxable: 10 %  
**Assumptions** | Default  
**More Options** | —  
  
* * *

### 20m. Tax Estimation

_[imagen: Tax estimation]_ 

Modo | Badge | Descripción  
---|---|---  
**Estimate for Me** ✓ | Recommended | Auto según location  
Custom Configuration | For unsupported locations | Setup manual  
  
**Location:** 🇺🇸 United States · California → (chevron abre selector).

Disclaimer legal al pie.

* * *

### 20n. Filing Status

_[imagen: Filing status]_ 

Cards mutuamente excluyentes:

Opción | Descripción  
---|---  
**Filing Jointly** ✓ | Married Filing Jointly rates  
Filing Separately | Individual rates por persona  
  
* * *

### 20o. Withholding

_[imagen: Withholding]_ 

Tipo | Rate | Nota  
---|---|---  
Tax-Deferred Withdrawals | 20 % | Pre-tax retirement  
Taxable Withdrawals | 10 % | After-tax accounts  
Conversions | 0 % | Transfers entre tipos  
  
_No altera tax liability real — afecta cash flow. Excess withholding → refund año siguiente. Roth conversion early: skip withholding._

* * *

### 20p. Tax Assumptions

_[imagen: Tax assumptions]_ 

Toggle | Descripción  
---|---  
**SALT Deduction Cap Expiration** | ON — cap aumentado expira 2030  
**Senior Bonus Deduction Expiration** | ON — expira 2029  
  
Legislación US (OBBBA) — supuestos de expiración.

* * *

### 20q. Tax · More Options

_[imagen: More options]_ 

Control | Valor  
---|---  
Income Tax Modifier | 0 % slider (shift all income tax rates)  
Capital Gains Tax Modifier | 0 % slider  
**Restore** | Reset all tax settings to location defaults  
  
* * *

### 20r. Metrics · overview

_[imagen: Metrics overview]_ 

#### Global Metrics

_Configure how certain metrics are calculated across all plans._

Métrica | Estado  
---|---  
**Effective Tax Rate** | Default configuration →  
**Spending** | Default configuration →  
  
#### Plan Metrics

_Configure metrics specific to this plan._

Métrica | Estado  
---|---  
**Net Legacy** | Default configuration → (abre Estate Settings §19j)  
  
* * *

### 20s. Effective Tax Rate

_[imagen: ETR config]_ 

Fórmula base: **Total Taxes / Total Income**.

**Income** — ¿cuentan hacia Total Income?

Item | Default  
---|---  
Return of Capital | OFF  
Non-Taxable Sale Proceeds | OFF  
Tax-Free Distributions | OFF  
  
**Tax** — ¿cuentan hacia Total Taxes?

Item | Default  
---|---  
Local Income Tax | ON  
Property Tax | OFF  
  
* * *

### 20t. Spending metric

_[imagen: Spending config]_ 

_Customize what counts as spending._

Item | Default  
---|---  
Tax Liability | OFF  
Mortgage Payments | ON  
Mortgage Principal | ON  
Consumer Debt Principal | ON  
  
_Rental property costs always excluded. House hacking: personal-use portion included._

* * *

### 20u. Other Settings

_[imagen: Other settings]_ 

#### Year alignment

Dropdown **Calendar year** :

  * Primer año acortado/prorrateado para alinear a enero
  * Años en resultados = último mes del año simulado

#### Override

Toggle **Override Year Alignment For This Plan** — OFF por defecto.

_Recomienda consistencia global en Account Settings; override solo si hace falta por plan._

* * *

### 20v. Notes

Sin captura en este batch. Ítem **Notes** en dropdown y sidebar — notas de texto libre asociadas al plan (acceso directo, sin chevron en dropdown).

* * *

**Patrones UX · Settings**

  * **Dropdown → sidebar persistente** — navegación rápida entre 8 categorías.
  * **Chart preview** — cada settings page muestra impacto visual en la proyección.
  * **Rates: 3 modos** — Fixed (simple) · Historical (backtest) · Advanced (por edad).
  * **Editors modales** — Inflation/Growth con chart + balance projection side-by-side.
  * **Global vs Plan** — Metrics separa configuración workspace vs plan concreto.

* * *

## Apéndice · Pendientes de captura

Flujos mencionados en recorrido o en UI pero **sin captura dedicada** en este documento:

Área | Pendiente  
---|---  
Workspace | Directory · Account Settings (workspace)  
Dashboard cliente | Menú ⋮ del plan (Clone, Rename, Delete…)  
Plan · plots | Lista completa Built-in Plots (solo parcial en §12f)  
Plan data | Editores Income (RSU, Pension, SS…) · Expense por tipo · más account types  
Optimize | Flexible Spending · Drawdown · Common strategy · Optimize auto  
Settings | Notes  
Tax Strategy wizard | Rutas "Common strategy" y "Optimize" (solo "New strategy")  
  
* * *

### Resumen · arquitecturas de las pestañas del plan

Pestaña | Capas propias (sobre shell § Parte 4) | Eje temporal | Patrón de interacción principal  
---|---|---|---  
**Plan** (§12) | Plot selector · gráfico · sidebar año · data tabs | Slider edad/año en sidebar | Clic métrica → drill-down · hover chart  
**Plan data** (§12k) | Tab nav · entity cards expandibles | — (edición del modelo) | \+ add · collapse sections · linked badge  
**Cash Flow** (§15) | Timeline slider · Sankey | **Un año** a la vez | Hover banda → FROM/TO %  
**Tax Analytics** (§14) | KPI bar · sub-tabs fiscal · chart + leyenda · brackets | Serie completa + año seleccionado | Sub-tab switch · scope Plan Totals/Year  
**Chance of Success** (§13) | Setup checklist **o** results dashboard | Fan chart multi-trial | Run → gauge + trial table  
**Compare** (§16) | Compare chrome · dual series en charts | Misma línea temporal | Editar → ver delta vs baseline → Keep/Revert/Fork  
**Optimize** (§17) | Module bar · KPI dual · charts · Details table | Lifetime + año | Wizard → Combined Impact → drill-down módulo  
**Reports** (§18) | Toolbar · chart · resize · data table | Serie completa + año cursor | Plot/Table/Metrics swap · export  
**Estate** (§19) | KPI funnel · Sankey · Breakdown · Assumptions | Al fallecimiento | Insights · Estate Settings · categorical/detailed  
**Settings** (§20) | Sidebar · chart preview · category panel | Supuestos del plan | Dropdown → sidebar nav · drill-down editors  
  
**Shell compartida (CAPA 0):** título plan · milestones · Rates · Notifications · sub-nav horizontal — idéntica en todas las pestañas del plan documentadas. **Compare** añade CAPA 0b cuando está activo.

**Cobertura sub-nav del plan:** Plan · Cash Flow · Tax Analytics · Chance of Success · Compare · Optimize · Reports · Estate · Settings — **completa**.
