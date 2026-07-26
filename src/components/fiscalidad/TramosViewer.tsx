import { Card, Table, TBody, TD, TH, THead, TR } from "@/components/ui";
import { formatEUR } from "@/lib/format";
import {
  etiquetaEscala,
  getTramos,
  tramoDeBase,
  type EscalaTramos,
} from "@/lib/fiscal";
import { cn } from "@/lib/cn";

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
 * Tinta neutra: el tramo activo usa azul informativo, nunca verde/rojo/ámbar.
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
          <p className="px-1 text-[11px] text-mute">
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
    <Card padding="sm">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 px-1">
        <p className="label-upper">{etiquetaEscala(escala)}</p>
        <p className="text-[11px] text-mute">
          Base{" "}
          <span className="font-semibold tabular-nums text-ink">
            {formatEUR(base)}
          </span>
        </p>
      </div>

      <Table>
        <THead>
          <TR>
            <TH>Desde</TH>
            <TH>Hasta</TH>
            <TH className="text-right">Tipo</TH>
          </TR>
        </THead>
        <TBody>
          {tramos.map((t, i) => {
            const isActive = activo?.tramoIndex === i;
            return (
              <TR
                key={`${escala}-${t.desde}`}
                className={cn(isActive && "!bg-blue-soft hover:!bg-blue-soft")}
              >
                <TD
                  numeric
                  className={cn(
                    "!text-left",
                    isActive && "font-bold text-blue",
                  )}
                >
                  {formatEUR(t.desde)}
                </TD>
                <TD
                  numeric
                  className={cn(
                    "!text-left",
                    isActive && "font-bold text-blue",
                  )}
                >
                  {t.hasta === Infinity ? "—" : formatEUR(t.hasta)}
                </TD>
                <TD
                  numeric
                  className={cn(isActive && "font-bold text-blue")}
                >
                  {formatTipo(t.tipo)}
                </TD>
              </TR>
            );
          })}
        </TBody>
      </Table>

      <div className="mt-2 rounded-[6px] border border-line bg-paper-2 px-3 py-2">
        {activo ? (
          <p className="text-[12px] text-ink-3">
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
          <p className="text-[12px] text-mute">Sin tramo aplicable.</p>
        )}
      </div>
    </Card>
  );
}
