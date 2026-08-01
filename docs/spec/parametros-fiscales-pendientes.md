# Parámetros fiscales pendientes de verificación

Documento para el fiscalista. Toda cifra que consume el motor de Scenia aparece aquí.
**Estado actual de todos los parámetros: `a-verificar`.** Fecha de consulta de fuentes: **2026-08-01**.

Fuente de verdad en código: `src/lib/fiscal/parametros.ts`. Ninguna cifra fiscal debe vivir fuera de ese módulo.

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
- **Valor actual:**  
  0–12.450 @ 9,5 % · 12.450–20.200 @ 12 % · 20.200–35.200 @ 15 % · 35.200–60.000 @ 18,5 % · 60.000–300.000 @ 22,5 % · >300.000 @ 24,5 %  
  (cuotas acumuladas AEAT: 0 / 1.182,75 / 2.112,75 / 4.362,75 / 8.950,75 / 62.950,75)
- **Fuente citada:** Ley 35/2006 art. 63.1 · AEAT Manual Renta 2025
- **Vigencia en código:** desde ejercicio **2025** (getters indexados por año).
- **Qué confirmar:** Vigencia para ejercicios **2026–2033**. ¿Alguna PGE posterior modifica tramos o tipos?

## 2. Escala autonómica · Comunitat Valenciana · base general

- **Qué es:** Tramo autonómico art. 2 Ley 13/1997 (CV).
- **Valor actual (Ley 9/2022, vigencia desde 2023):**  
  0–12.000 @ 9 % · … · >200.000 @ 29,5 %  
  (cuotas acum.: 0 / 1.080 / 2.280 / 3.780 / 5.530 / 7.530 / 9.780 / 12.280 / 19.700 / 33.450 / 47.700)
- **Fuente citada:** Ley 13/1997 art. 2 · DF primera.1 Ley 9/2022 · Hacienda estatal Cap. IV tributación autonómica 2026 (sigue citando Ley 9/2022).
- **Vigencia en código:** desde ejercicio **2023**; aplicada también a 2026+ **mientras no haya DOGV definitivo de la reforma**.
- **Qué confirmar:**  
  1) ¿La escala de Ley 9/2022 sigue vigente en **2025 y 2026**?  
  2) **Reforma 2026 (rebaja de tipos):** existe como **ANTEPROYECTO** de Ley de Medidas 2026 en hisenda.gva.es (tipos 8,8 % / 11,7 % / …). **No incorporada** — no hay publicación en DOGV como ley. Cuando se publique, añadir vigencia `desdeAnio: 2026` en `parametros.ts`.

## 3. Escala del ahorro · estatal (art. 66)

- **Valor actual (efectos 1-ene-2025, Ley 7/2024):**  
  0–6.000 @ 9,5 % · 6.000–50.000 @ 10,5 % · 50.000–200.000 @ 11,5 % · 200.000–300.000 @ 13,5 % · >300.000 @ **15 %**
- **Fuente citada:** Ley 35/2006 art. 66 · Ley 7/2024 DF 7ª · AEAT novedades normativa 2024
- **Vigencia en código:** desde ejercicio **2025**.
- **Qué confirmar:** Último tramo 15 % vigente en 2026+.

## 4. Escala del ahorro · autonómica (art. 76)

- **Valor actual:** Idénticos tramos/tipos a la mitad estatal (tope 15 %).
- **Fuente citada:** Ley 35/2006 art. 76 · Ley 7/2024 DF 7ª
- **Qué confirmar:** Que CV no tenga especialidad distinta en el ahorro.

## 5. Mínimo del contribuyente + umbrales de edad

- **Valor actual:** 5.550 € general · +1.150 si edad >65 · +1.400 adicional si edad >75
- **Umbrales:** `umbralEdadMas65` = 65 · `umbralEdadMas75` = 75 (ahora en la tabla, no hardcode)
- **Fuente citada:** Ley 35/2006 art. 57.1 y 57.2 · AEAT Manual Renta 2025
- **Qué confirmar:** Cuantías 2026+. ¿CV aplica mínimo autonómico distinto? (hoy el motor usa el mismo mínimo en ambas mitades).

## 6. Mínimo familiar (descendientes / ascendientes / discapacidad)

- **Valor actual:** **VACÍO — no modelado.**
- **Fuente citada:** —
- **Qué confirmar:** Si el liquidador MVP debe aplicar mínimos por hijos.

## 7. Reducción 40 % planes pre-2007 (DT 12ª)

- **Valor actual:** 40 % · solo capital · fecha corte 2006-12-31
- **Dato de partícipe:** campo `Instrumento.fraccionPre2007` (0–1), introducido por el asesor en alta/edición de plan. Sin él, el motor **no aplica** la reducción.
- **Fuente citada:** LIRPF DT 12ª · AEAT Manual Renta 2025
- **Qué confirmar:** Plazos temporales (contingencia + 2 ejercicios) en el flujo del producto.

## 8. Exención reinversión renta vitalicia >65 (art. 38.3)

- **Valor actual:** Límite 240.000 € · plazo 6 meses
- **Fuente citada:** Ley 35/2006 art. 38.3 · AEAT Manual Renta 2025
- **Estado del liquidador:** solo aviso si reinversión marcada; sin cifra automática.

## 9. Horizonte de referencia (producto)

- **Valor actual:** 2026–2033
- **Uso hoy:** filtra qué eventos aportan a la fila fiscal; la fila muestra **solo el primer ejercicio** (no acumulación `× años`).
- **Fuente citada:** Spec producto CT2 (no norma)

## 10. Escalas "display" aproximadas

- **Retiradas.** `escalaGeneralDisplayCV` y `escalaAhorroDisplay` ya no existen. El visor P4 usa escalas oficiales (estatal + autonómica por separado; ahorro como tipo conjunto = suma de mitades oficiales idénticas).

---

## Huecos explícitos (no hay valor)

| Hueco | Por qué |
| --- | --- |
| Escala CV 2026 post-reforma | Anteproyecto hisenda.gva · **sin DOGV definitivo** · no incorporada |
| % aportaciones pre-2007 por plan | Dato de partícipe; campo en UI; vacío en seed GL |
| Mínimos por descendientes/ascendientes | No modelados en MVP |
| Liquidador IS | Firewall · pendiente de definir |
| Base del ahorro en P4 | Sin modelo de rentas del ahorro en el expediente (hueco marcado) |
| Reducción trabajo / cotizaciones | El motor apila el rescate sobre **ingresos brutos**, no sobre base liquidable neta |
| Acumulación multi-año / FIFO sucesivo | Fuera de alcance actual · fila = primer ejercicio |

---

## Decisiones de arquitectura fiscal (2026-08)

1. **Rollup = primer ejercicio.** No `cuotaAnual × años`. Recalcula siempre con motor fresco (si cambian datos del activo, cambia la cifra).
2. **`sin_calculo` → parcial.** La fila no muestra un 0 € limpio sin avisar.
3. **CCAA ≠ CV → `sin_calculo` en base general** (rescate). Sin default silencioso a Comunitat Valenciana.
4. **P4** liquida el ejercicio con escalas oficiales; sin KPIs de vida ni series inventadas.

---

## Cómo liquida el motor hoy

1. **Reembolso de fondo:** `ganancia = importe × (plusvalíaLatente / valor)` · titularidad · cuota marginal del ahorro (base previa = 0) · **solo primer ejercicio**.
2. **Traspaso de fondo:** cuota 0 (art. 94).
3. **Rescate de plan (renta):** importe a base general · sin 40 % · Δ IRPF(base+rescate) − IRPF(base) · CV obligatoria.
4. **Rescate capital:** 40 % solo si `fraccionPre2007` informada en el plan.
5. **Fila fiscal:** suma de cuotas del **primer año** de cada evento calculado/neutro en el horizonte. Etiqueta: «Impacto fiscal · primer año · orientativo».
