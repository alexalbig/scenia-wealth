"use client";

import Link from "next/link";
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
}

const ASSET_BLOCKS: Array<{
  key: keyof Pick<Totales, "financiero" | "inmobiliario" | "empresarial" | "otros">;
  label: string;
  tab: string;
  tone: string;
}> = [
  { key: "financiero", label: "Financiero", tab: "activos", tone: "bg-blue text-white" },
  { key: "inmobiliario", label: "Inmobiliario", tab: "activos", tone: "bg-ink-3 text-white" },
  { key: "empresarial", label: "Empresarial", tab: "activos", tone: "bg-coral text-white" },
  { key: "otros", label: "Otros", tab: "activos", tone: "bg-slate text-white" },
];

export function ResumenTab({
  clienteId,
  totales,
  capacidad,
  datosAFecha,
  onTab,
  onInforme,
  onAdd,
}: ResumenTabProps) {
  const assetSum =
    totales.financiero +
    totales.inmobiliario +
    totales.empresarial +
    totales.otros;
  const maxSide = Math.max(assetSum, totales.pasivos, 1);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label-upper">Foto del patrimonio</p>
          <p className="text-[12px] text-mute">
            Datos a fecha de {datosAFecha} · no se actualizan solos
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={onInforme}>
          Generar informe
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
        <div className="grid gap-3 sm:grid-cols-2">
          <section>
            <p className="label-upper mb-2">Lo que tengo</p>
            <div className="flex min-h-[180px] flex-col gap-1.5">
              {ASSET_BLOCKS.map((b) => {
                const value = totales[b.key];
                const flex = Math.max(value / maxSide, value > 0 ? 0.12 : 0.08);
                const empty = value <= 0;
                return (
                  <div
                    key={b.key}
                    className="relative flex"
                    style={{ flexGrow: empty ? 0.35 : flex * 4 }}
                  >
                    <button
                      type="button"
                      onClick={() => onTab(b.tab)}
                      className={cn(
                        "flex w-full flex-col justify-between rounded-[8px] p-3 text-left transition-opacity hover:opacity-90",
                        empty ? "border border-dashed border-line-2 bg-paper-2 text-mute" : b.tone,
                      )}
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] opacity-90">
                        {b.label}
                      </span>
                      <span className="text-[16px] font-bold tabular-nums tracking-[-0.02em]">
                        {empty ? "—" : formatEUR(value)}
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Añadir ${b.label}`}
                      onClick={() => onAdd(b.label)}
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-[6px] bg-paper/20 text-[14px] font-bold hover:bg-paper/35"
                    >
                      +
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-right text-[12px] font-semibold tabular-nums text-ink">
              Bruto {formatEUR(totales.bruto)}
            </p>
          </section>

          <section>
            <p className="label-upper mb-2">Lo que debo</p>
            <button
              type="button"
              onClick={() => onTab("pasivos")}
              className="flex min-h-[180px] w-full flex-col justify-between rounded-[8px] border border-line-2 bg-paper-2 p-3 text-left hover:border-blue"
              style={{
                minHeight: `${Math.max(120, (totales.pasivos / maxSide) * 220)}px`,
              }}
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-mute">
                Pasivos
              </span>
              <span className="text-[19px] font-bold tabular-nums tracking-[-0.02em] text-ink">
                {formatEUR(totales.pasivos)}
              </span>
            </button>
            <p className="mt-2 text-right text-[12px] font-semibold tabular-nums text-ink">
              Neto {formatEUR(totales.neto)}
            </p>
          </section>
        </div>

        <Card variant="dark" className="flex flex-col justify-between">
          <div>
            <p className="label-upper !text-faint mb-2">Capacidad de ahorro</p>
            <p className="text-[28px] font-bold tracking-[-0.03em] tabular-nums text-dark-text">
              {formatEUR(capacidad)}
            </p>
            <p className="mt-1 text-[11px] text-faint">
              Ingresos − gastos + amortización de capital
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="mt-4 w-full border-dark-border bg-ink text-dark-text hover:bg-ink-3"
            onClick={() => onTab("ahorro")}
          >
            Ver detalle
          </Button>
        </Card>
      </div>

      <p className="text-[11px] text-mute">
        Pincha un bloque para ir a su pestaña. Expediente{" "}
        <Link href={`/clientes/${clienteId}/patrimonio`} className="text-blue">
          actual
        </Link>
        .
      </p>
    </div>
  );
}
