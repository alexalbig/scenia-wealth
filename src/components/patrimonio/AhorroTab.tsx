import { Card } from "@/components/ui";
import { formatEUR } from "@/lib/format";

export function AhorroTab({
  ingresos,
  gastos,
  amortizacionCapital,
  capacidad,
}: {
  ingresos: number;
  gastos: number;
  amortizacionCapital: number;
  capacidad: number;
}) {
  const ahorroLiquido = ingresos - gastos;
  const tasaPct =
    ingresos > 0
      ? ((capacidad / ingresos) * 100).toLocaleString("es-ES", {
          maximumFractionDigits: 1,
        })
      : "0";

  return (
    <div className="grid gap-3.5 lg:grid-cols-2">
      <Card variant="dark" padding="lg">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[#7E8DB0]">
          Capacidad de ahorro anual
        </p>
        <p className="mt-1 text-[24px] font-bold tracking-[-0.02em] tabular-nums text-green-light">
          {formatEUR(capacidad)}
          <span className="ml-1 text-[13px] font-semibold text-[#7E8DB0]">
            / año
          </span>
        </p>
        <div className="mt-2.5">
          <DarkRow label="Ingresos" value={formatEUR(ingresos)} />
          <DarkRow label="Gastos" value={`−${formatEUR(gastos)}`} />
          <DarkRow label="Ahorro líquido" value={formatEUR(ahorroLiquido)} />
          <DarkRow
            label="+ Reducción de deuda (amortización de capital)"
            value={formatEUR(amortizacionCapital)}
          />
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        <Card padding="md">
          <p className="label-upper">Tasa de ahorro</p>
          <p className="mt-1 text-[22px] font-bold tabular-nums tracking-[-0.02em] text-ink">
            {tasaPct} %
          </p>
          <p className="mt-0.5 text-[11px] text-mute">
            sobre los ingresos del año
          </p>
        </Card>
        <div className="hint-info">
          <b>ⓘ</b>
          <span>
            El ahorro es un <b>resultado calculado</b> (ingresos − gastos +
            amortización). Esta pestaña es de solo lectura y no admite eventos.
          </span>
        </div>
      </div>
    </div>
  );
}

function DarkRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-t border-dark-line py-1.5 text-[11.5px] text-[#B4C0D8] first:border-t-0">
      <span>{label}</span>
      <b className="font-semibold tabular-nums text-dark-text">{value}</b>
    </div>
  );
}
