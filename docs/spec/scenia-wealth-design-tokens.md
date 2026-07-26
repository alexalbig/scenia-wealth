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