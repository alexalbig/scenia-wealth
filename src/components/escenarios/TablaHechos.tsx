"use client";

import { FilaFiscal } from "@/components/ui";
import {
  COMPARADOR_HORIZONTE,
  type SostenibilidadCamino,
} from "@/lib/escenarios";
import { formatEUR } from "@/lib/format";
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
 */
export function TablaHechos({
  filas,
  anioFijado,
  delta,
  parcial = false,
  motivosParcial,
  sobreDatoIntroducido = false,
}: TablaHechosProps) {
  return (
    <div className="sect">
      <span className="lbl">Los hechos, primero</span>
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
          </tr>
        </thead>
        <tbody>
          {filas.length === 0 ? (
            <tr>
              <td colSpan={5}>
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
              </tr>
            ))
          )}
        </tbody>
      </table>
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
      </div>
    </div>
  );
}

function chipsEventos(eventos: Evento[], esPlanBase: boolean) {
  const propios = eventos.filter((e) => e.tipo !== "jubilarse");
  if (propios.length === 0) {
    return (
      <span className="chip">
        {esPlanBase ? "sin eventos añadidos" : "solo jubilaciones del plan base"}
      </span>
    );
  }
  return propios.map((ev) => (
    <span
      key={ev.id}
      className={ev.introducidoPorAsesor ? "chip intro" : "chip"}
      title={
        ev.introducidoPorAsesor
          ? "Introducido por el asesor · no calculado"
          : "Calculado por el motor"
      }
    >
      {ev.etiqueta}
      {ev.notas?.match(/^\d{4}/) ? ` · ${ev.notas}` : ` · ${ev.anio}`}
    </span>
  ));
}
