import { Table, TBody, TD, TH, THead, TR } from "@/components/ui";
import { formatEUR } from "@/lib/format";
import { cn } from "@/lib/cn";
import { enEuros, type EurMode, type PuntoSerieIRPF } from "@/lib/fiscal";

/**
 * Serie de IRPF año a año · clic-en-año (CT4).
 * Tinta neutra; "orientativo" en cabecera y pie.
 */
export function SerieIRPF({
  serie,
  anio,
  onAnio,
  eurMode,
}: {
  serie: PuntoSerieIRPF[];
  anio: number;
  onAnio: (anio: number) => void;
  eurMode: EurMode;
}) {
  const max = Math.max(...serie.map((p) => p.irpf), 1);
  const punto = serie.find((p) => p.anio === anio);

  return (
    <div className="space-y-2">
      <div>
        <p className="label-upper">Serie de IRPF</p>
        <p className="text-[11px] text-mute">
          Plan base · clic en un año para fijarlo ·{" "}
          <span className="normal-case tracking-normal">orientativo</span>
        </p>
      </div>

      <div className="chartbox">
        <div className="mb-3 flex h-28 items-end gap-1">
          {serie.map((p) => {
            const active = p.anio === anio;
            const h = Math.max(6, Math.round((p.irpf / max) * 100));
            return (
              <button
                key={p.anio}
                type="button"
                title={`${p.anio}: ${formatEUR(enEuros(p.irpf, p.anio, eurMode))}`}
                onClick={() => onAnio(p.anio)}
                className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1"
              >
                <span
                  className={cn(
                    "w-full rounded-t-[3px] transition-colors",
                    active
                      ? "bg-ink"
                      : "bg-ink-3/25 group-hover:bg-ink-3/40",
                  )}
                  style={{ height: `${h}%` }}
                />
                <span
                  className={cn(
                    "text-[9.5px] tabular-nums",
                    active ? "font-bold text-ink" : "text-mute",
                  )}
                >
                  {String(p.anio).slice(2)}
                </span>
              </button>
            );
          })}
        </div>

        <Table>
          <THead>
            <TR>
              <TH>Año</TH>
              <TH className="text-right">IRPF</TH>
              <TH className="text-right">Base general</TH>
              <TH className="text-right">Base ahorro</TH>
            </TR>
          </THead>
          <TBody>
            {serie.map((p) => {
              const active = p.anio === anio;
              return (
                <TR
                  key={p.anio}
                  className={cn(
                    "cursor-pointer",
                    active && "!bg-paper-2 hover:!bg-paper-2",
                  )}
                  onClick={() => onAnio(p.anio)}
                >
                  <TD
                    className={cn(
                      "font-semibold",
                      active && "text-ink",
                    )}
                  >
                    {p.anio}
                  </TD>
                  <TD numeric className={cn(active && "font-semibold text-ink")}>
                    {formatEUR(enEuros(p.irpf, p.anio, eurMode))}
                  </TD>
                  <TD numeric>
                    {formatEUR(enEuros(p.baseGeneral, p.anio, eurMode))}
                  </TD>
                  <TD numeric>
                    {formatEUR(enEuros(p.baseAhorro, p.anio, eurMode))}
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>

        {punto && (
          <p className="mt-2 text-[11px] text-slate">
            Año fijado{" "}
            <span className="font-semibold text-ink">{punto.anio}</span>
            {" · IRPF "}
            <span className="font-semibold tabular-nums text-ink">
              {formatEUR(enEuros(punto.irpf, punto.anio, eurMode))}
            </span>
            {" · "}
            <span className="text-mute">orientativo</span>
          </p>
        )}
      </div>
    </div>
  );
}
