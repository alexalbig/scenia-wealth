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
