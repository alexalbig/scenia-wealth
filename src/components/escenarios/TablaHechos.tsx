"use client";

import { FilaFiscal } from "@/components/ui";
import {
  textoMotivoComparacion,
  type ComparacionAmortizarVsInvertir,
} from "@/lib/amortizar-vs-invertir";
import {
  COMPARADOR_HORIZONTE,
  type SostenibilidadCamino,
} from "@/lib/escenarios";
import { formatEUR, formatPercent } from "@/lib/format";
import type { Evento } from "@/lib/types";

export interface FilaHechos {
  id: string;
  nombre: string;
  esPlanBase: boolean;
  eventos: Evento[];
  /** Impacto fiscal · primer año. Plan base → null (guión). */
  impactoFiscal: number | null;
  liquidosEnAnio: number;
  patrimonioFinal: number;
  sostenibilidad: SostenibilidadCamino;
  /** Regla ③ · null si el camino no tiene amortizar. */
  amortizarVsInvertir: ComparacionAmortizarVsInvertir | null;
  impuestosParcial?: boolean;
  impuestosMotivosParcial?: string[];
  impuestosSobreDatoIntroducido?: boolean;
}

interface TablaHechosProps {
  filas: FilaHechos[];
  anioFijado: number;
  /** Δ entre alternativas no-base (si hay ≥ 2). */
  delta?: number | null;
  parcial?: boolean;
  motivosParcial?: string[];
  sobreDatoIntroducido?: boolean;
}

/**
 * Tabla de hechos del comparador · marcado `.facts` de la referencia.
 * Columna de impacto fiscal = FilaFiscal variant="celda" (firewall CT2).
 * Columna amortizar/invertir: dos hechos neutros, sin ranking ni color.
 */
export function TablaHechos({
  filas,
  anioFijado,
  delta,
  parcial = false,
  motivosParcial,
  sobreDatoIntroducido = false,
}: TablaHechosProps) {
  const muestraAmortizar = filas.some((f) => f.amortizarVsInvertir != null);

  return (
    <div className="sect">
      <span className="lbl">Los hechos, primero</span>
      <div className="facts-scroll">
      <table className="facts">
        <thead>
          <tr>
            <th>Camino</th>
            <th>
              Impacto fiscal ·{" "}
              <span className="orient" style={{ color: "var(--faint)" }}>
                primer año · orientativo
              </span>
            </th>
            <th>Líquidos en {anioFijado}</th>
            <th>¿Se sostiene?</th>
            <th>Patrimonio en {COMPARADOR_HORIZONTE}</th>
            {muestraAmortizar ? (
              <th>
                Amortizar / Invertir ·{" "}
                <span className="orient" style={{ color: "var(--faint)" }}>
                  orientativo
                </span>
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {filas.length === 0 ? (
            <tr>
              <td colSpan={muestraAmortizar ? 6 : 5}>
                <span className="hueco">
                  Marque escenarios en la lista para compararlos con el plan
                  base.
                </span>
              </td>
            </tr>
          ) : (
            filas.map((f) => (
              <tr key={f.id}>
                <td>
                  <span className="cam">
                    {f.esPlanBase ? "Plan base" : f.nombre}
                    {f.esPlanBase ? (
                      <span className="ref" style={{ marginLeft: 6 }}>
                        referencia
                      </span>
                    ) : null}
                  </span>
                  <div className="evs">
                    {chipsEventos(f.eventos, f.esPlanBase)}
                  </div>
                </td>
                <td>
                  {f.esPlanBase || f.impactoFiscal == null ? (
                    <span style={{ color: "var(--slate)" }}>—</span>
                  ) : (
                    <FilaFiscal
                      variant="celda"
                      cells={[
                        {
                          name: f.nombre,
                          amount: f.impactoFiscal,
                          id: f.id,
                        },
                      ]}
                      parcial={!!f.impuestosParcial}
                    />
                  )}
                </td>
                <td className="n">{formatEUR(f.liquidosEnAnio)}</td>
                <td>
                  <div className="sostx">{f.sostenibilidad.texto}</div>
                </td>
                <td className="n">{formatEUR(f.patrimonioFinal)}</td>
                {muestraAmortizar ? (
                  <td>{celdaAmortizarVsInvertir(f.amortizarVsInvertir)}</td>
                ) : null}
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
      <FilaFiscal
        variant="nota"
        cells={filas
          .filter((f) => !f.esPlanBase)
          .map((f) => ({
            name: f.nombre,
            amount: f.impactoFiscal ?? 0,
            id: f.id,
          }))}
        delta={delta}
        parcial={parcial}
        motivosParcial={motivosParcial}
        sobreDatoIntroducido={sobreDatoIntroducido}
        parametrosAVerificar
      />
      <div className="footnote">
        Cuotas del motor fiscal · primer ejercicio · parámetros a verificar.
        Series de líquidos y patrimonio orientativas. La tabla no ordena por
        conveniencia: el orden es el de la lista. € hoy / € futuro aplica a
        líquidos y al gráfico; la cuota del primer ejercicio no se deflacta.
        {muestraAmortizar
          ? " Amortizar / Invertir: dos hechos neutros (certeza contractual vs expectativa del escenario); no se señala ganador."
          : ""}
      </div>
    </div>
  );
}

function celdaAmortizarVsInvertir(
  c: ComparacionAmortizarVsInvertir | null,
) {
  if (c == null) {
    return <span style={{ color: "var(--slate)" }}>—</span>;
  }
  if (c.kind !== "comparacion") {
    return <div className="sostx">{textoMotivoComparacion(c)}</div>;
  }
  const nDecl = c.nDeclaradoAnios.toLocaleString("es-ES", {
    maximumFractionDigits: 1,
  });
  const nEf = c.nEfectivoAnios.toLocaleString("es-ES", {
    maximumFractionDigits: 1,
  });
  const acorta = c.nEfectivoAnios < c.nDeclaradoAnios - 0.05;
  return (
    <div className="sostx">
      <div>
        Amortizar:{" "}
        <span className="num">
          {formatEUR(Math.round(c.interesContractualAhorrado))}
        </span>{" "}
        · hecho contractual ({formatPercent(c.tipoInteres)})
      </div>
      <div style={{ marginTop: 4 }}>
        Invertir:{" "}
        <span className="num">
          {formatEUR(Math.round(c.rendimientoEsperado))}
        </span>{" "}
        · expectativa del escenario ({formatPercent(c.rentabilidadEscenario)})
      </div>
      {acorta ? (
        <div style={{ marginTop: 4 }}>
          Plazo: de {nDecl} a {nEf} años
        </div>
      ) : null}
    </div>
  );
}

function chipsEventos(eventos: Evento[], esPlanBase: boolean) {
  const propios = eventos.filter((e) => e.tipo !== "jubilarse");
  if (propios.length === 0) {
    return (
      <span className="chip">
        {esPlanBase ? "sin eventos añadidos" : "sin eventos"}
      </span>
    );
  }
  return propios.slice(0, 4).map((e) => (
    <span key={e.id} className="chip">
      {e.etiqueta.length > 42 ? `${e.etiqueta.slice(0, 40)}…` : e.etiqueta}
    </span>
  ));
}
