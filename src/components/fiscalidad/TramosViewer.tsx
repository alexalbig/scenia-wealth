import { formatEUR } from "@/lib/format";
import {
  getTramos,
  tramoDeBase,
  type EscalaTramos,
} from "@/lib/fiscal";

const tipoFmt = new Intl.NumberFormat("es-ES", {
  maximumFractionDigits: 0,
});

/**
 * Visor de tramos · mockup P4.
 * Tinta neutra · 🔒 solo lectura · (a verificar).
 */
export function TramosViewer({
  anio,
  personaNombre,
  baseGeneral,
  baseAhorro,
}: {
  anio: number;
  personaNombre: string;
  baseGeneral: number;
  baseAhorro: number;
}) {
  const activo = tramoDeBase(baseGeneral, "general");
  const siguiente =
    activo && activo.tramoIndex + 1 < getTramos("general").length
      ? getTramos("general")[activo.tramoIndex + 1]
      : null;

  return (
    <div className="grid2">
      <div className="chartbox">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <div className="lbl">
            Base general {anio} · estatal + Comunitat Valenciana (a verificar)
          </div>
          <span className="lock">🔒 solo lectura</span>
        </div>
        <TramosBars escala="general" marca={baseGeneral} />
        <div className="hint-info" style={{ marginTop: 10 }}>
          <b>ⓘ</b>
          <span>
            {personaNombre} tributa en el tramo del{" "}
            <b>
              {activo ? `${tipoFmt.format(activo.tramo.tipo * 100)} %` : "—"}
            </b>
            {activo && activo.espacio !== null && siguiente ? (
              <>
                {" "}
                · quedan <b className="num">{formatEUR(activo.espacio)}</b> hasta
                el tramo del {tipoFmt.format(siguiente.tipo * 100)} %
              </>
            ) : null}
            . Un rescate del plan se apilaría aquí.
          </span>
        </div>
      </div>

      <div className="chartbox">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <div className="lbl">Base del ahorro {anio} · (a verificar)</div>
          <span className="lock">🔒 solo lectura</span>
        </div>
        <TramosBars escala="ahorro" marca={baseAhorro} />
        <div className="tiny" style={{ marginTop: 8 }}>
          Escala separada de la base general — aquí tributarían las plusvalías
          realizadas (p. ej. un reembolso del Fondo A, con +120.000 €
          latentes).
        </div>
      </div>
    </div>
  );
}

function TramosBars({
  escala,
  marca,
}: {
  escala: Extract<EscalaTramos, "general" | "ahorro">;
  marca: number;
}) {
  const tramos = getTramos(escala);

  return (
    <>
      {tramos.map((t) => {
        const dentro = marca >= t.desde && marca < t.hasta;
        const fillPct =
          t.hasta === Infinity
            ? dentro
              ? 18
              : 0
            : Math.min(Math.max((marca - t.desde) / (t.hasta - t.desde), 0), 1) *
              100;

        return (
          <div key={`${escala}-${t.desde}`} className="tramo">
            <div className="tramo-bar">
              <div className="tramo-fill" style={{ width: `${fillPct}%` }} />
              {dentro && (
                <div
                  className="marker"
                  style={{
                    left: `${t.hasta === Infinity ? 18 : fillPct}%`,
                  }}
                  data-l={formatEUR(marca)}
                />
              )}
            </div>
            <div className="tramo-info">
              <span className="mut num">
                {formatEUR(t.desde)}
                {t.hasta === Infinity
                  ? " en adelante"
                  : ` – ${formatEUR(t.hasta)}`}
              </span>
              <b className="num">{tipoFmt.format(t.tipo * 100)} %</b>
            </div>
          </div>
        );
      })}
    </>
  );
}
