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
  return (
    <div className="space-y-4">
      <div>
        <p className="label-upper">Capacidad de ahorro</p>
        <p className="text-[11px] text-mute">
          Resultado calculado · solo lectura · no admite eventos
        </p>
      </div>

      <Card variant="dark">
        <p className="label-upper !text-faint mb-2">Capacidad anual</p>
        <p className="text-[28px] font-bold tracking-[-0.03em] tabular-nums text-dark-text">
          {formatEUR(capacidad)}
        </p>
      </Card>

      <Card padding="sm">
        <div className="divide-y divide-line text-[13px]">
          <Row label="Ingresos" value={ingresos} />
          <Row label="− Gastos" value={-gastos} />
          <Row
            label="+ Amortización de capital"
            value={amortizacionCapital}
            hint="Nivel 1 orientativo (cuota anual − intereses)"
          />
          <div className="flex items-baseline justify-between px-3 py-3">
            <span className="font-bold text-ink">Capacidad de ahorro</span>
            <span className="text-[15px] font-bold tabular-nums text-ink">
              {formatEUR(capacidad)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Row({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 px-3 py-2.5">
      <div>
        <p className="text-ink-3">{label}</p>
        {hint && <p className="text-[10.5px] text-mute">{hint}</p>}
      </div>
      <span className="font-semibold tabular-nums text-ink">
        {formatEUR(value)}
      </span>
    </div>
  );
}
