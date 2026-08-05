import { formatEUR } from "@/lib/format";
import type { ComposicionPatrimonio } from "@/lib/types";

const CATEGORIAS: Array<{
  key: keyof ComposicionPatrimonio;
  label: string;
  className: string;
}> = [
  { key: "financiero", label: "Financiero", className: "c-fin" },
  { key: "inmobiliario", label: "Inmobiliario", className: "c-inm" },
  { key: "empresarial", label: "Empresarial", className: "c-emp" },
  { key: "otros", label: "Otros", className: "c-otr" },
];

/** Mockup `.comp` — fracciones 0–1; si llegan euros (bags viejos), normaliza. */
export function CompositionBar({
  composicion,
  patrimonioNeto,
  style,
}: {
  composicion: ComposicionPatrimonio;
  /** Patrimonio neto de la fila · para el importe del tooltip. */
  patrimonioNeto: number;
  style?: React.CSSProperties;
}) {
  const raw =
    composicion.financiero +
    composicion.inmobiliario +
    composicion.empresarial +
    composicion.otros;
  const asEuros = raw > 1.5;
  const scale = asEuros ? raw : 1;

  return (
    <div className="comp" style={style}>
      {CATEGORIAS.map(({ key, label, className }) => {
        const value = composicion[key];
        const pct =
          scale > 0 ? Math.round((value / scale) * 100) : 0;
        if (pct <= 0) return null;
        const importe = asEuros
          ? value
          : patrimonioNeto * (scale > 0 ? value / scale : 0);
        const tip = `${label} · ${pct} % · ${formatEUR(importe)}`;
        return (
          <i
            key={key}
            className={className}
            style={{ width: `${pct}%` }}
            title={tip}
            aria-label={tip}
          />
        );
      })}
    </div>
  );
}
