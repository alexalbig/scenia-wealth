import { formatEUR } from "@/lib/format";
import {
  etiquetaEscala,
  getTramos,
  tramoDeBase,
  type EscalaTramos,
} from "@/lib/fiscal";

const tipoFmt = new Intl.NumberFormat("es-ES", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function formatTipo(tipo: number) {
  return tipoFmt.format(tipo);
}

/**
 * Visor de tramos CORE.
 * Escalas separadas: base general (estatal + autonómica) vs base del ahorro.
 * Parámetros de solo lectura — firewall.
 * Tinta neutra: el marcador de tramo activo usa ink, nunca verde/rojo/ámbar.
 */
export function TramosViewer({
  baseGeneral,
  baseAhorro,
}: {
  baseGeneral: number;
  baseAhorro: number;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="label-upper">Visor de tramos</p>
        <p className="text-[11px] text-mute">
          Parámetros del motor · no editables · (a verificar) ·{" "}
          <span className="normal-case tracking-normal">orientativo</span>
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="space-y-3">
          <p className="text-[12px] font-semibold text-ink">Base general</p>
          <EscalaCard escala="estatal" base={baseGeneral} />
          <EscalaCard escala="autonomica" base={baseGeneral} />
        </section>

        <section className="space-y-3">
          <p className="text-[12px] font-semibold text-ink">Base del ahorro</p>
          <EscalaCard escala="ahorro" base={baseAhorro} />
          <p className="px-0.5 text-[11px] text-mute">
            Escala distinta de la base general. En el plan base sin eventos de
            realización la base del ahorro es 0 €.
          </p>
        </section>
      </div>
    </div>
  );
}

function EscalaCard({ escala, base }: { escala: EscalaTramos; base: number }) {
  const tramos = getTramos(escala);
  const activo = tramoDeBase(base, escala);

  return (
    <div className="chartbox">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <p className="label-upper">{etiquetaEscala(escala)}</p>
        <span className="text-[10.5px] font-semibold text-slate">
          🔒 solo lectura
        </span>
      </div>

      <div className="pt-3">
        {tramos.map((t, i) => {
          const isActive = activo?.tramoIndex === i;
          const span = t.hasta === Infinity ? null : t.hasta - t.desde;
          const fillPct =
            t.hasta === Infinity
              ? isActive
                ? 18
                : 0
              : Math.min(
                  Math.max((base - t.desde) / (span ?? 1), 0),
                  1,
                ) * 100;

          return (
            <div key={`${escala}-${t.desde}`} className="tramo">
              <div className="tramo-bar">
                <div
                  className="tramo-fill"
                  style={{ width: `${fillPct}%` }}
                />
                {isActive && (
                  <div
                    className="tramo-marker"
                    style={{
                      left: `${t.hasta === Infinity ? 18 : fillPct}%`,
                    }}
                    data-l={formatEUR(base)}
                  />
                )}
              </div>
              <div className="tramo-info">
                <span className="tabular-nums text-mute">
                  {formatEUR(t.desde)}
                  {t.hasta === Infinity
                    ? " en adelante"
                    : ` – ${formatEUR(t.hasta)}`}
                </span>
                <b className="tabular-nums text-ink">{formatTipo(t.tipo)}</b>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 rounded-[8px] border border-[#D4DDF6] bg-blue-soft px-2.5 py-2">
        {activo ? (
          <p className="text-[11.5px] text-ink-3">
            Tramo activo · tipo marginal{" "}
            <span className="font-semibold tabular-nums text-ink">
              {formatTipo(activo.tramo.tipo)}
            </span>
            {" · "}
            {activo.espacio === null ? (
              <span>tramo máximo</span>
            ) : (
              <>
                espacio hasta el siguiente{" "}
                <span className="font-semibold tabular-nums text-ink">
                  {formatEUR(activo.espacio)}
                </span>
              </>
            )}
            {" · "}
            <span className="text-mute">orientativo</span>
          </p>
        ) : (
          <p className="text-[11.5px] text-mute">Sin tramo aplicable.</p>
        )}
      </div>
    </div>
  );
}
