"use client";

import { formatEUR, formatTipo } from "@/lib/format";
import type { RecorridoMarginalGeneral } from "@/lib/fiscal";

/**
 * Escalera combinada estatal + autonómica · elemento principal de P4.
 * Derivada, solo lectura. El ejemplo del rescate es genérico a propósito (firewall).
 */
export function RecorridoMarginal({
  recorrido,
}: {
  recorrido: RecorridoMarginalGeneral | null;
}) {
  return (
    <section className="recorrido" aria-label="Recorrido orientativo">
      <div className="lbl">Recorrido · orientativo</div>
      {recorrido == null ? (
        <p className="recorrido-lead">
          Sin recorrido — no hay escala autonómica cargada para esta base, o la
          persona no es calculable.
        </p>
      ) : (
        <>
          <p className="recorrido-lead">
            Una renta adicional en base general —por ejemplo, un rescate del
            plan— tributa así:
          </p>
          <ol className="recorrido-lista num">
            {recorrido.peldaños.map((p, i) => (
              <li key={i}>
                {p.kind === "sin_margen" ? (
                  <>
                    Sin margen · el siguiente euro ya tributa al{" "}
                    {formatTipo(p.tipoSiguiente)}
                  </>
                ) : p.kind === "cerrado" ? (
                  <>
                    {formatTipo(p.tipo)} los{" "}
                    {p.primeros ? "primeros" : "siguientes"}{" "}
                    {formatEUR(Math.round(p.tramoEuros))}
                  </>
                ) : (
                  <>
                    {formatTipo(p.tipo)} a partir de{" "}
                    {formatEUR(Math.round(p.desdeUmbral))}
                  </>
                )}
              </li>
            ))}
          </ol>
          {recorrido.continuaDesde != null ? (
            <p className="recorrido-nota">
              A partir de {formatEUR(Math.round(recorrido.continuaDesde))} el
              tipo sigue subiendo · escala completa en las columnas.
            </p>
          ) : null}
          {recorrido.sensibilidad ? (
            <p className="recorrido-nota">
              Este margen depende de las cotizaciones informadas, que introduce
              el asesor. Una diferencia de 50&nbsp;€ cambia el tramo.
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
