import { formatEUR } from "@/lib/format";
import {
  getTramos,
  getTramosAhorroConjunto,
  tramoDeBase,
  type Tramo,
} from "@/lib/fiscal";

const tipoFmt = new Intl.NumberFormat("es-ES", {
  maximumFractionDigits: 1,
});

/**
 * Visor de tramos · P4.
 * Escalas oficiales de parametros.ts · tinta neutra · (a verificar).
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
  /** null = hueco (sin modelo de rentas del ahorro). */
  baseAhorro: number | null;
}) {
  const activoEst = tramoDeBase(baseGeneral, "estatal", anio);
  const tramosEst = getTramos("estatal", anio);
  const siguienteEst =
    activoEst && activoEst.tramoIndex + 1 < tramosEst.length
      ? tramosEst[activoEst.tramoIndex + 1]
      : null;

  const activoAut = tramoDeBase(baseGeneral, "autonomica", anio);
  const tramosAut = getTramos("autonomica", anio);
  const siguienteAut =
    activoAut && activoAut.tramoIndex + 1 < tramosAut.length
      ? tramosAut[activoAut.tramoIndex + 1]
      : null;

  const tramosAhorro = getTramosAhorroConjunto(anio);
  const activoAhorro =
    baseAhorro != null ? tramoDeBase(baseAhorro, "ahorro", anio) : null;
  const siguienteAhorro =
    activoAhorro && activoAhorro.tramoIndex + 1 < tramosAhorro.length
      ? tramosAhorro[activoAhorro.tramoIndex + 1]
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
            Base general {anio} · escalas oficiales (a verificar)
          </div>
          <span className="lock">🔒 solo lectura</span>
        </div>

        <div className="lbl" style={{ marginBottom: 6 }}>
          Estatal · art. 63.1
        </div>
        <TramosBars tramos={tramosEst} marca={baseGeneral} />

        <div className="lbl" style={{ margin: "12px 0 6px" }}>
          Autonómica · Comunitat Valenciana · art. 2 Ley 13/1997
        </div>
        <TramosBars tramos={tramosAut} marca={baseGeneral} />

        <div className="hint-info" style={{ marginTop: 10 }}>
          <b>ⓘ</b>
          <span>
            {personaNombre}
            {activoEst ? (
              <>
                {" "}
                · estatal{" "}
                <b>{tipoFmt.format(activoEst.tramo.tipo * 100)} %</b>
                {activoEst.espacio !== null && siguienteEst ? (
                  <>
                    {" "}
                    · quedan{" "}
                    <b className="num">{formatEUR(activoEst.espacio)}</b> hasta
                    el {tipoFmt.format(siguienteEst.tipo * 100)} %
                  </>
                ) : null}
              </>
            ) : null}
            {activoAut ? (
              <>
                {" "}
                · autonómica{" "}
                <b>{tipoFmt.format(activoAut.tramo.tipo * 100)} %</b>
                {activoAut.espacio !== null && siguienteAut ? (
                  <>
                    {" "}
                    · quedan{" "}
                    <b className="num">{formatEUR(activoAut.espacio)}</b> hasta
                    el {tipoFmt.format(siguienteAut.tipo * 100)} %
                  </>
                ) : null}
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
          <div className="lbl">
            Base del ahorro {anio} · arts. 66+76 (a verificar)
          </div>
          <span className="lock">🔒 solo lectura</span>
        </div>
        {baseAhorro == null ? (
          <p className="tiny" style={{ margin: "8px 0" }}>
            Sin rentas del ahorro modeladas en el expediente — hueco. Las
            plusvalías latentes de activos no son base del ahorro hasta que un
            evento las realice.
          </p>
        ) : (
          <>
            <TramosBars tramos={tramosAhorro} marca={baseAhorro} />
            <div className="hint-info" style={{ marginTop: 10 }}>
              <b>ⓘ</b>
              <span>
                Tipo conjunto (estatal + autonómica, tramos idénticos)
                {activoAhorro ? (
                  <>
                    {" "}
                    · tramo del{" "}
                    <b>
                      {tipoFmt.format(activoAhorro.tramo.tipo * 100)} %
                    </b>
                    {activoAhorro.espacio !== null && siguienteAhorro ? (
                      <>
                        {" "}
                        · quedan{" "}
                        <b className="num">
                          {formatEUR(activoAhorro.espacio)}
                        </b>{" "}
                        hasta el{" "}
                        {tipoFmt.format(siguienteAhorro.tipo * 100)} %
                      </>
                    ) : null}
                  </>
                ) : null}
                .
              </span>
            </div>
          </>
        )}
        <div className="tiny" style={{ marginTop: 8 }}>
          Escala separada de la base general — aquí tributarían las plusvalías
          realizadas (p. ej. un reembolso).
        </div>
      </div>
    </div>
  );
}

function TramosBars({
  tramos,
  marca,
}: {
  tramos: Tramo[];
  marca: number;
}) {
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
          <div key={`t-${t.desde}-${t.tipo}`} className="tramo">
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
