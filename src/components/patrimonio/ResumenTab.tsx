"use client";

import { Card, Button } from "@/components/ui";
import { formatEUR } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { totalesActivos } from "@/lib/patrimonio";

type Totales = ReturnType<typeof totalesActivos>;

interface ResumenTabProps {
  clienteId: string;
  totales: Totales;
  capacidad: number;
  datosAFecha: string;
  onTab: (tab: string) => void;
  onInforme: () => void;
  onAdd: (categoria: string) => void;
  /** Desglose opcional para darkcard (ingresos/gastos/amort) */
  ahorroDetalle?: {
    ingresos: number;
    gastos: number;
    amortizacionCapital: number;
  };
}

const ASSET_BLOCKS: Array<{
  key: keyof Pick<Totales, "financiero" | "inmobiliario" | "empresarial" | "otros">;
  label: string;
  tab: string;
  tone: string;
}> = [
  {
    key: "financiero",
    label: "Financiero",
    tab: "activos",
    tone: "bg-[#E7ECFB] text-[#20358A] border-[#D4DDF6]",
  },
  {
    key: "inmobiliario",
    label: "Inmobiliario",
    tab: "activos",
    tone: "bg-[#EAEDF3] text-ink-2 border-[#DCE1EA]",
  },
  {
    key: "empresarial",
    label: "Empresarial",
    tab: "activos",
    tone: "bg-coral-soft text-coral-deep border-[#F6DCD6]",
  },
  {
    key: "otros",
    label: "Otros",
    tab: "activos",
    tone: "bg-paper-2 text-ink-3 border-line-2",
  },
];

export function ResumenTab({
  totales,
  capacidad,
  datosAFecha,
  onTab,
  onInforme,
  onAdd,
  ahorroDetalle,
}: ResumenTabProps) {
  const assetSum =
    totales.financiero +
    totales.inmobiliario +
    totales.empresarial +
    totales.otros;
  const maxSide = Math.max(assetSum, totales.pasivos, 1);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label-upper">Resumen</p>
          <h2 className="text-[17px] font-bold tracking-[-0.01em] text-ink">
            Foto del patrimonio
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="sello">
            Datos a fecha de <b>{datosAFecha}</b>
          </span>
          <Button size="sm" variant="secondary" onClick={onInforme}>
            Generar informe
          </Button>
        </div>
      </div>

      <div className="grid gap-3.5 lg:grid-cols-[1fr_260px]">
        <div className="flex h-[230px] gap-2">
          <div className="flex flex-[1.4] flex-col gap-2">
            {ASSET_BLOCKS.map((b) => {
              const value = totales[b.key];
              const flex = Math.max(value / maxSide, value > 0 ? 0.14 : 0.1);
              const empty = value <= 0;
              return (
                <div
                  key={b.key}
                  className="relative flex min-h-0"
                  style={{ flexGrow: empty ? 0.45 : flex * 3.2 }}
                >
                  <button
                    type="button"
                    onClick={() => onTab(b.tab)}
                    className={cn(
                      "flex w-full flex-col justify-between rounded-[10px] border p-3 text-left transition-[filter] hover:brightness-[0.96]",
                      empty
                        ? "border-dashed border-faintest bg-white text-mute"
                        : b.tone,
                    )}
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-[0.06em]">
                      {b.label}
                    </span>
                    <span className="text-[16px] font-bold tabular-nums tracking-[-0.01em]">
                      {empty ? "—" : formatEUR(value)}
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Añadir ${b.label}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAdd(b.label);
                    }}
                    className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-[6px] bg-white/65 text-[12px] font-bold hover:bg-white"
                  >
                    +
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => onTab("pasivos")}
            className="flex min-w-[120px] flex-1 flex-col justify-between rounded-[10px] border border-dashed border-faintest bg-white p-3 text-left text-ink-3 hover:brightness-[0.98]"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em]">
              Pasivos
            </span>
            <span className="text-[16px] font-bold tabular-nums tracking-[-0.01em]">
              {formatEUR(totales.pasivos)}
            </span>
          </button>
        </div>

        <Card variant="dark" padding="lg" className="flex flex-col">
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[#7E8DB0]">
              Capacidad de ahorro
            </p>
            <span className="rounded-[5px] bg-dk-tagbg px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.05em] text-dk-tag">
              Anual
            </span>
          </div>
          <p className="text-[24px] font-bold tracking-[-0.02em] tabular-nums text-green-light">
            {formatEUR(capacidad)}
          </p>
          {ahorroDetalle && (
            <div className="mt-3">
              <div className="flex justify-between py-1 text-[11.5px] text-[#B4C0D8]">
                <span>Ingresos</span>
                <span className="tabular-nums">{formatEUR(ahorroDetalle.ingresos)}</span>
              </div>
              <div className="flex justify-between border-t border-dark-line py-1 text-[11.5px] text-[#B4C0D8]">
                <span>Gastos</span>
                <span className="tabular-nums">
                  −{formatEUR(ahorroDetalle.gastos)}
                </span>
              </div>
              <div className="flex justify-between border-t border-dark-line py-1 text-[11.5px] text-[#B4C0D8]">
                <span>Amort. capital</span>
                <span className="tabular-nums">
                  +{formatEUR(ahorroDetalle.amortizacionCapital)}
                </span>
              </div>
            </div>
          )}
          <Button
            size="sm"
            variant="secondary"
            className="mt-auto w-full border-dark-border bg-ink-2 text-dark-text hover:bg-ink"
            onClick={() => onTab("ahorro")}
          >
            Ver detalle
          </Button>
        </Card>
      </div>

      <div className="flex justify-between text-[12px] font-semibold tabular-nums text-ink">
        <span>Bruto {formatEUR(totales.bruto)}</span>
        <span>Neto {formatEUR(totales.neto)}</span>
      </div>
    </div>
  );
}
