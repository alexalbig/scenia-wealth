import type { ComposicionPatrimonio } from "@/lib/types";

/** Mockup `.comp` — fracciones 0–1; si llegan euros (bags viejos), normaliza. */
export function CompositionBar({
  composicion,
  style,
}: {
  composicion: ComposicionPatrimonio;
  style?: React.CSSProperties;
}) {
  const raw =
    composicion.financiero +
    composicion.inmobiliario +
    composicion.empresarial +
    composicion.otros;
  const scale = raw > 1.5 ? raw : 1;
  const pct = (v: number) =>
    scale > 0 ? Math.round((v / scale) * 100) : 0;

  return (
    <div className="comp" style={style}>
      <i
        className="c-fin"
        style={{ width: `${pct(composicion.financiero)}%` }}
      />
      <i
        className="c-inm"
        style={{ width: `${pct(composicion.inmobiliario)}%` }}
      />
      <i
        className="c-emp"
        style={{ width: `${pct(composicion.empresarial)}%` }}
      />
      <i className="c-otr" style={{ width: `${pct(composicion.otros)}%` }} />
    </div>
  );
}
