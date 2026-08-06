"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { formatEUR } from "@/lib/format";

type Totales = {
  financiero: number;
  inmobiliario: number;
  empresarial: number;
  empresarialSinValorar?: boolean;
  otros: number;
  pasivos: number;
  bruto: number;
  neto: number;
};

interface ResumenTabProps {
  clienteId: string;
  totales: Totales;
  capacidad: number;
  onTab: (tab: string) => void;
  onInforme: () => void;
  onAdd: (categoria: string) => void;
  ahorroDetalle?: {
    ingresos: number;
    gastos: number;
    amortizacionCapital: number;
  };
  labels?: {
    financiero?: string;
    inmobiliario?: string;
    empresarial?: string;
    otros?: string;
  };
  sociedadId?: string;
  /** Fecha de los datos (dd/mm/aaaa), también en la foto patrimonial. */
  datosAFecha?: string;
}

/**
 * Mockup `tplResumen` — foto + treemap de activos + pasivos debajo + capacidad.
 */
export function ResumenTab({
  clienteId,
  totales,
  capacidad,
  onTab,
  onInforme,
  onAdd,
  ahorroDetalle,
  labels = {},
  sociedadId,
  datosAFecha,
}: ResumenTabProps) {
  const router = useRouter();
  const a = ahorroDetalle;

  return (
    <div className="grid3">
      <div>
        <div className="scr-head" style={{ padding: "0 0 14px" }}>
          <div className="grow">
            <div className="lbl">Foto del patrimonio</div>
            <div className="h2">
              Activos {formatEUR(totales.bruto)} · Pasivos{" "}
              {formatEUR(totales.pasivos)}
            </div>
            {datosAFecha && (
              <div className="tiny" style={{ marginTop: 4 }}>
                Datos a fecha de <b>{datosAFecha}</b>
              </div>
            )}
          </div>
          <div className="toolbar">
            <Button variant="primary" onClick={onInforme}>
              Generar informe
            </Button>
          </div>
        </div>

        <div className="treemap">
          <div className="tm-col" style={{ flex: 2.05 }}>
            <div
              className="tm-block tm-fin"
              style={{ flex: 1 }}
              role="button"
              tabIndex={0}
              onClick={() => onTab("activos")}
              onKeyDown={(e) => e.key === "Enter" && onTab("activos")}
            >
              <div>
                <div className="lbl" style={{ color: "inherit", opacity: 0.75 }}>
                  Financiero
                </div>
                <div className="tm-v num">{formatEUR(totales.financiero)}</div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                }}
              >
                <span className="tiny" style={{ color: "inherit", opacity: 0.8 }}>
                  {labels.financiero ?? "Activos financieros"}
                </span>
                <button
                  type="button"
                  className="tm-add"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdd("financiero");
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="tm-col" style={{ flex: 2.05 }}>
            <div
              className="tm-block tm-inm"
              style={{ flex: 1 }}
              role="button"
              tabIndex={0}
              onClick={() => onTab("activos")}
              onKeyDown={(e) => e.key === "Enter" && onTab("activos")}
            >
              <div>
                <div className="lbl" style={{ color: "inherit", opacity: 0.75 }}>
                  Inmobiliario
                </div>
                <div className="tm-v num">{formatEUR(totales.inmobiliario)}</div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                }}
              >
                <span className="tiny" style={{ color: "inherit", opacity: 0.8 }}>
                  {labels.inmobiliario ?? "Inmuebles"}
                </span>
                <button
                  type="button"
                  className="tm-add"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdd("inmobiliario");
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="tm-col" style={{ flex: 1 }}>
            <div
              className="tm-block tm-emp"
              style={{ flex: 1.1 }}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (sociedadId) {
                  router.push(
                    `/clientes/${clienteId}/fichas/sociedad/${sociedadId}`,
                  );
                } else onTab("activos");
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                if (sociedadId) {
                  router.push(
                    `/clientes/${clienteId}/fichas/sociedad/${sociedadId}`,
                  );
                } else onTab("activos");
              }}
            >
              <div>
                <div className="lbl" style={{ color: "inherit", opacity: 0.75 }}>
                  Empresarial
                </div>
                <div
                  className={
                    totales.empresarialSinValorar || totales.empresarial <= 0
                      ? "tm-v"
                      : "tm-v num"
                  }
                  style={{ fontSize: 13 }}
                >
                  {totales.empresarialSinValorar
                    ? "no valorada"
                    : totales.empresarial > 0
                      ? formatEUR(totales.empresarial)
                      : "—"}
                </div>
              </div>
              <span className="tiny" style={{ color: "inherit", opacity: 0.8 }}>
                {labels.empresarial ?? "Sin sociedades"}
              </span>
            </div>

            <div
              className="tm-block tm-otr"
              style={{ flex: 0.9 }}
              role="button"
              tabIndex={0}
              onClick={() => onTab("activos")}
              onKeyDown={(e) => e.key === "Enter" && onTab("activos")}
            >
              <div>
                <div className="lbl" style={{ color: "inherit", opacity: 0.75 }}>
                  Otros
                </div>
                <div className="tm-v num" style={{ fontSize: 14 }}>
                  {formatEUR(totales.otros)}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                }}
              >
                <span
                  className="tiny"
                  style={{ color: "inherit", opacity: 0.85 }}
                >
                  {labels.otros ?? "Otros"}
                </span>
                <button
                  type="button"
                  className="tm-add"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdd("otros");
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pasivos fuera del treemap de activos: restan del neto. */}
        <div
          className="tm-pasivos"
          role="button"
          tabIndex={0}
          onClick={() => onTab("pasivos")}
          onKeyDown={(e) => e.key === "Enter" && onTab("pasivos")}
        >
          <div>
            <div className="lbl">Pasivos</div>
            <div className="tiny" style={{ marginTop: 2 }}>
              Restan del patrimonio neto
            </div>
          </div>
          <div className="tm-v num" style={{ fontSize: 16 }}>
            −{formatEUR(totales.pasivos)}
          </div>
        </div>

        <div className="legend">
          <span>
            <i className="c-fin" />
            Financiero
          </span>
          <span>
            <i className="c-inm" />
            Inmobiliario
          </span>
          <span>
            <i className="c-emp" />
            Empresarial
          </span>
          <span>
            <i className="c-otr" />
            Otros
          </span>
          <span style={{ marginLeft: "auto" }} className="tiny">
            Pincha un bloque para bajar al detalle · «+» da de alta en esa
            categoría
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="darkcard">
          <div className="lbl">Capacidad de ahorro anual</div>
          <div className="big num">{formatEUR(capacidad)} / año</div>
          {a && (
            <div style={{ marginTop: 10 }}>
              <div className="row">
                <span>Ingresos</span>
                <b className="num">{formatEUR(a.ingresos)}</b>
              </div>
              <div className="row">
                <span>Gastos</span>
                <b className="num">−{formatEUR(a.gastos)}</b>
              </div>
              <div className="row">
                <span>Reducción de deuda (amortización)</span>
                <b className="num">+{formatEUR(a.amortizacionCapital)}</b>
              </div>
            </div>
          )}
          <div style={{ marginTop: 10 }}>
            <span className="ftag">Calculado en la pestaña Ahorro</span>
          </div>
        </div>

        <div
          style={{
            border: "1px solid var(--line-2)",
            borderRadius: 10,
            background: "#fff",
            padding: "13px 15px",
          }}
        >
          <div className="lbl">Patrimonio neto</div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
            className="num"
          >
            {formatEUR(totales.neto)}
          </div>
          <div className="tiny" style={{ marginTop: 2 }}>
            {formatEUR(totales.bruto)} de activos − {formatEUR(totales.pasivos)}{" "}
            de pasivos
          </div>
        </div>
      </div>
    </div>
  );
}
