# Parámetros fiscales pendientes de verificación

Documento para el fiscalista. Toda cifra que consume el motor de Scenia aparece aquí.
**Estado actual de todos los parámetros: `a-verificar`.** Fecha de consulta de fuentes: **2026-08-02** (arts. 19/20/52) · **2026-08-01** (escalas previas).

**Aviso:** nada de lo siguiente justifica marcar un parámetro como `verificado` sin confirmación del fiscalista. Las cifras de arts. 19, 20 y 52 se contrastaron con redacción consolidada / AEAT Manual Renta 2025 y RDL 4/2024; siguen en `a-verificar`.

Fuente de verdad en código: `src/lib/fiscal/parametros.ts`. Ninguna cifra fiscal debe vivir fuera de ese módulo.

Las **cuotas íntegras acumuladas ya no se guardan**: se derivan de `(hasta, tipo)` en `cuotaEscala` / `cuotasAcumuladasDerivadas`. Test: `npm test` (`escalas.test.ts`).

---

## Cómo leer esta lista

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
- **Valor actual (tramos/tipos):**  
  0–12.450 @ 9,5 % · 12.450–20.200 @ 12 % · 20.200–35.200 @ 15 % · 35.200–60.000 @ 18,5 % · 60.000–300.000 @ 22,5 % · >300.000 @ 24,5 %
- **Cuotas acumuladas:** derivadas en runtime (no almacenadas).
- **Fuente citada:** Ley 35/2006 art. 63.1 · AEAT Manual Renta 2025
- **Vigencia en código:** desde ejercicio **2025**.
- **Qué confirmar:** Vigencia para ejercicios **2026–2033**. ¿Alguna PGE posterior modifica tramos o tipos?

## 2. Escala autonómica · Comunitat Valenciana · base general

- **Qué es:** Tramo autonómico art. 2 Ley 13/1997 (CV).
- **Valor actual (Ley 9/2022, vigencia desde 2023):**  
  0–12.000 @ 9 % · 12–22k @ 12 % · 22–32k @ 15 % · 32–42k @ 17,5 % · 42–52k @ 20 % · **52–62k @ 22,5 %** · 62–72k @ 25 % · 72–100k @ 26,5 % · 100–150k @ 27,5 % · 150–200k @ 28,5 % · >200k @ 29,5 %
- **Atención: conviven dos escalas valencianas históricas.** La del Decreto-ley 14/2022 (temporal, solo ejercicio 2022, con corte de tramo en **65.000 €**) y la de la Ley 9/2022 (vigente desde 2023, con corte en **62.000 €**). Cargada la segunda. Una revisión externa ya mezcló ambas (derivó 10.455 € con corte a 65k frente a la cuota 9.780 de la escala 62k). **Pregunta al fiscalista:** ¿es la correcta para cada ejercicio del horizonte 2026–2033, y hay alguna modificación posterior que no hayamos localizado?
- **Fuente citada:** Ley 13/1997 art. 2 · DF primera.1 Ley 9/2022 · AEAT Manual
- **Vigencia en código:** desde ejercicio **2023**; aplicada también a 2026+ **mientras no haya DOGV definitivo de la reforma**.
- **Qué confirmar:**  
  1) ¿La escala de Ley 9/2022 sigue vigente en **2025 y 2026** (y en 2027–2033)?  
  2) **Reforma 2026 (rebaja de tipos):** **ANTEPROYECTO** · **NO incorporada** · sin DOGV. Cuando se publique, añadir vigencia `desdeAnio: 2026`.

## 3. Escala del ahorro · estatal (art. 66)

- **Valor actual (efectos 1-ene-2025, Ley 7/2024):**  
  0–6.000 @ 9,5 % · 6.000–50.000 @ 10,5 % · 50.000–200.000 @ 11,5 % · 200.000–300.000 @ 13,5 % · >300.000 @ **15 %**
- **Qué confirmar:** Último tramo 15 % vigente en 2026+.

## 4. Escala del ahorro · autonómica (art. 76)

- **Valor actual:** Idénticos tramos/tipos a la mitad estatal (tope 15 %).
- **Qué confirmar:** Que CV no tenga especialidad distinta en el ahorro.

## 5. Mínimo del contribuyente + umbrales de edad (estatal)

- **Valor actual:** 5.550 € general · +1.150 si edad >65 · +1.400 adicional si edad >75
- **Umbrales:** 65 / 75
- **Fuente citada:** Ley 35/2006 art. 57.1 y 57.2 · AEAT Manual Renta 2025
- **Qué confirmar:** Cuantías 2026+.

## 5.bis Mínimo autonómico valenciano — HUECO (no inventar)

- **Qué es:** Mínimos del art. 2 bis Ley 13/1997 (incorporados por Ley 9/2022), aproximadamente un 10 % superiores al estatal.
- **Valor actual:** **NO cargado.** El gravamen autonómico usa el **mínimo estatal** como **simplificación declarada** (`minimoAutonomicoCVUsaEstatal = true`). La UI lo indica.
- **Pregunta concreta al fiscalista:** *¿qué importes exactos del mínimo autonómico valenciano rigen en 2026 y debe aplicarlos el gravamen autonómico?*
- **No cargar cifras** hasta verificarlas en el DOGV.

## 6. Mínimo familiar (descendientes / ascendientes / discapacidad)

- **Valor actual:** **VACÍO — no modelado.**
- **Qué confirmar:** Si el liquidador MVP debe aplicar mínimos por hijos.

## 7. Reducción 40 % planes pre-2007 (DT 12ª)

- **Valor actual:** 40 % · solo capital · fecha corte 2006-12-31
- **Dato de partícipe:** `Instrumento.fraccionPre2007`
- **Plazos (Ley 26/2014) en el motor:**  
  - Contingencias ≥ 2015: contingencia + 2 ejercicios  
  - Contingencias 2011–2014: hasta el 8.º ejercicio siguiente  
  - Contingencias ≤ 2010: plazo terminado 31/12/2018  
  → En **2026** solo aplica a contingencias **2024, 2025 o 2026**.
- **Dato de evento:** `Evento.anioContingencia` (formulario de rescate capital).
- **Qué confirmar:** Plazos y redacción vigente de la DT 12ª.

## 8. Exención reinversión renta vitalicia (art. 38.3) vs vivienda habitual >65 (art. 33.4.b)

- **Art. 38.3:** límite 240.000 € · plazo 6 meses · requisitos art. 42 RIRPF **pendientes de recoger en el flujo** (aseguramiento a favor del contribuyente · percepción en 1 año · comunicación a la aseguradora · exención proporcional si reinversión parcial). Aplica a **cualquier elemento patrimonial**. Hoy: `sin_calculo` con aviso.
- **Art. 33.4.b):** transmisión de **vivienda habitual** por titular **≥65** (edad = año del evento − año de nacimiento) · **exenta sin reinversión ni tope 240k**. Se evalúa **por titular** (uno puede estar exento y otro no).
- **Campo:** `Inmueble.uso` (`vivienda_habitual` | `segunda_residencia` | `alquiler` | `local`). Si falta uso o edad → `sin_calculo`, sin asumir.
- **Qué confirmar:** Redacción y umbral exacto (≥65 vs >65) de art. 33.4.b) y requisitos vigentes de art. 38.3 / 42 RIRPF.

## 9. Periodo fila fiscal

- **Valor actual:** 2026–2033
- **Uso hoy:** filtra qué eventos aportan a la fila fiscal; la fila muestra **solo el primer ejercicio**.

## 10. Escalas "display" aproximadas

- **Retiradas.** El visor P4 usa escalas oficiales.

## 11. Art. 19 · gastos del trabajo

- **Art. 19.2.f) otros gastos:** **2.000 €** anuales.  
  Fuente: Ley 35/2006 art. 19.2.f) · AEAT Manual Renta 2025.  
  Estado: `a-verificar`.
- **Art. 19.2.a) cotizaciones SS:** **no se estiman en el motor.** Campo `Ingreso.cotizacionesSS`.  
  **Seed García-Llorente (2026-08-02):** Carlos **4.050 €** · Marta **2.080 €**, calculadas con:
  - Base máxima **5.101,20 €/mes** (Orden PJC/297/2026 art. 2.1 · BOE-A-2026-7296).
  - Tipos a cargo del trabajador: contingencias comunes **4,70 %** (art. 4) + desempleo **1,55 %** (art. 33.2.a) + FP **0,10 %** (art. 33.2.c) + MEI **0,15 %** (art. 16) = **6,50 %**.
  - Carlos: tope × 12 × 6,50 % + cotización adicional de solidaridad art. 17 (sueldo 95k > tope) ≈ 4.050 €.
  - Marta: 32.000 × 6,50 % = 2.080 € (bajo el tope · sin solidaridad).
  - Son **datos del expediente** (introducidos), no parámetros de `parametros.ts`.
  - **Revisión anual obligatoria:** la Orden de cotización a la Seguridad Social **cambia cada enero** (bases máximas/mínimas y, a menudo, tipos). No es un parámetro estable como los tramos del IRPF: hay que contrastarla cada año junto con las escalas.
- **Art. 19.2.b–e)** (derechos pasivos, sindicatos, defensa jurídica…): **no modelados** · hueco.
- **Qué confirmar:** vigencia 2026+ del 2.000 € y si el MVP debe pedir más gastos a–e.

## 12. Art. 20 · reducción por obtención de rendimientos del trabajo (nuevo)

- Redacción **RDL 4/2024** (efectos 1-ene-2024), contrastada con AEAT.  
  Tope RNT &lt; **19.747,50 €** · otras rentas ≤ **6.500 €**.  
  Tramos: ≤14.852 → 7.302 € · hasta 17.673,52 → 7.302 − 1,75×Δ · hasta 19.747,5 → 2.364,34 − 1,14×Δ.  
  Umbrales art. 20 usan RNT **sin** letra f) del art. 19.2.  
  Estado: `a-verificar`.  
  **Qué confirmar:** vigencia 2026+ (¿PGE o RDL posterior?).

## 13. Art. 52 · límite aportaciones a planes (regla ⑥) (nuevo)

- Límite conjunto: **menor de** 30 % RNT (trabajo + AAEE) y **1.500 €**.  
  Incremento hasta **+8.500 €** por contribuciones empresariales / condiciones art. 52.1 — **no aplicado** al plan individual del partícipe sin empresa (MVP).  
  Fuente: Ley 35/2006 art. 52 · AEAT Manual Renta 2025 §8.2.2.6 / §6.2.  
  Estado: `a-verificar`.  
  **Qué confirmar:** vigencia 2026+ y si el MVP debe modelar el incremento empresarial.

---

## Huecos explícitos (no hay valor)

| Hueco | Por qué |
| --- | --- |
| Escala CV 2026 post-reforma | Anteproyecto · **sin DOGV** · no incorporada |
| Mínimos autonómicos CV (art. 2 bis) | Sin importes verificados en DOGV · simplificación = mínimo estatal |
| % aportaciones pre-2007 por plan | Dato de partícipe; vacío en seed GL (Carlos); Marta sí tiene demo |
| Mínimos por descendientes/ascendientes | No modelados en MVP |
| Liquidador IS | Firewall · pendiente de definir |
| Base del ahorro en P4 | Sin modelo de rentas del ahorro en el expediente |
| FIFO real por lotes (art. 37.2) | Hoy: ratio único marcado **no válido para autoliquidación** (temporal) |
| Requisitos art. 42 RIRPF en flujo 38.3 | Aviso sin liquidar |
| Cotizaciones SS estimadas por el motor | **No** · dato del asesor (`Ingreso.cotizacionesSS`) · seed GL ya informado (Carlos 4.050 € · Marta 2.080 € · Orden PJC/297/2026) |
| Gastos art. 19.2.b–e | No modelados |
| Incremento empresarial art. 52 (+8.500) | Fuera de MVP plan individual |
| Acumulación multi-año | Fuera de alcance · fila = primer ejercicio |

---

## Decisiones de arquitectura fiscal (2026-08)

1. **Rollup = primer ejercicio.** No `cuotaAnual × años`.
2. **`sin_calculo` → parcial.**
3. **CCAA ≠ CV → `sin_calculo` en base general** (rescate / aportación). Forales: sin general ni ahorro.
4. **Cuotas acumuladas derivadas**, nunca almacenadas.
5. **Reembolso = estimación ratio**, no FIFO · visible como no autoliquidable.
6. **P4** liquida con escalas oficiales; sin KPIs inventados.
7. **Base = liquidable arts. 19/20**, no brutos · cotizaciones solo informadas.
8. **Regla ⑥** aporta · límite art. 52 · exceso avisado.

---

## Cómo liquida el motor hoy

1. **Reembolso de fondo:** `ganancia = importe × (plusvalíaLatente / valor)` · **estimación · no FIFO · no autoliquidable**.
2. **Traspaso de fondo:** cuota 0 (art. 94).
3. **Rescate de plan (renta):** importe a base liquidable general · sin 40 % · Δ IRPF · CV obligatoria · mínimo autonómico = estatal (simplificación).
4. **Rescate capital:** 40 % solo si `fraccionPre2007` + plazo DT 12ª (`anioContingencia`) OK.
5. **Aportación a plan:** reduce base liquidable hasta límite art. 52 · ahorro = Δ cuota · exceso avisado.
6. **Venta inmueble:** art. 33.4.b) si vivienda habitual >65; art. 38.3 si reinversión (aviso); resto → plusvalía al ahorro.
7. **Fila fiscal:** primer año · «Impacto fiscal · primer año · orientativo».
