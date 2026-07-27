"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, Card } from "@/components/ui";
import { ResumenTab } from "@/components/patrimonio/ResumenTab";
import { PersonasTab } from "@/components/patrimonio/PersonasTab";
import { ActivosTab } from "@/components/patrimonio/ActivosTab";
import { PasivosTab } from "@/components/patrimonio/PasivosTab";
import { IngresosTab } from "@/components/patrimonio/IngresosTab";
import { GastosTab } from "@/components/patrimonio/GastosTab";
import { AhorroTab } from "@/components/patrimonio/AhorroTab";
import { InformeModal } from "@/components/patrimonio/InformeModal";
import { EventoModal } from "@/components/patrimonio/EventoModal";
import { formatEUR } from "@/lib/format";
import {
  capacidadAhorro,
  formatFechaES,
  getGastos,
  getIngresos,
  getInmuebles,
  getInstrumentos,
  getOtrosActivos,
  getPasivos,
  getSociedades,
  totalesActivos,
} from "@/lib/patrimonio";
import { getPersonasDeCliente } from "@/lib/seed";
import type { Cliente } from "@/lib/types";

const TABS = [
  { id: "resumen", label: "Resumen" },
  { id: "personas", label: "Personas" },
  { id: "activos", label: "Activos" },
  { id: "pasivos", label: "Pasivos" },
  { id: "ingresos", label: "Ingresos" },
  { id: "gastos", label: "Gastos" },
  { id: "ahorro", label: "Ahorro" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function isTabId(v: string | null): v is TabId {
  return !!v && TABS.some((t) => t.id === v);
}

export function PatrimonioView({ cliente }: { cliente: Cliente }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: TabId = isTabId(tabParam) ? tabParam : "resumen";

  const [informeOpen, setInformeOpen] = useState(false);
  const [evento, setEvento] = useState<{
    contexto:
      | "instrumento"
      | "inmueble"
      | "pasivo"
      | "sociedad"
      | "otro"
      | "ingreso"
      | "gasto";
    nombre: string;
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const personas = useMemo(
    () => getPersonasDeCliente(cliente.id),
    [cliente.id],
  );
  const instrumentos = useMemo(
    () => getInstrumentos(cliente.id),
    [cliente.id],
  );
  const inmuebles = useMemo(() => getInmuebles(cliente.id), [cliente.id]);
  const otros = useMemo(() => getOtrosActivos(cliente.id), [cliente.id]);
  const pasivos = useMemo(() => getPasivos(cliente.id), [cliente.id]);
  const ingresos = useMemo(() => getIngresos(cliente.id), [cliente.id]);
  const gastos = useMemo(() => getGastos(cliente.id), [cliente.id]);
  const sociedades = useMemo(() => getSociedades(cliente.id), [cliente.id]);
  const totales = useMemo(() => totalesActivos(cliente.id), [cliente.id]);
  const ahorro = useMemo(() => capacidadAhorro(cliente.id), [cliente.id]);

  function setTab(id: string) {
    router.replace(`/clientes/${cliente.id}/patrimonio?tab=${id}`, {
      scroll: false,
    });
  }

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  const datosLabel = formatFechaES(cliente.datosAFecha);

  if (!cliente.completo) {
    return (
      <div className="space-y-4">
        <Tabs items={[...TABS]} value={tab} onChange={setTab} />
        <Card>
          <p className="label-upper mb-1">Cliente ligero</p>
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-ink">
            {cliente.nombre}
          </h2>
          <p className="mt-2 text-[13px] text-slate">
            Este expediente solo puebla la Cartera. Patrimonio neto{" "}
            <span className="font-semibold tabular-nums text-ink">
              {formatEUR(cliente.patrimonioNeto)}
            </span>
            . La foto completa está en Familia García-Llorente.
          </p>
          {tab === "resumen" && (
            <div className="mt-4">
              <ResumenTab
                clienteId={cliente.id}
                totales={{
                  financiero: Math.round(
                    cliente.patrimonioNeto * cliente.composicion.financiero,
                  ),
                  inmobiliario: Math.round(
                    cliente.patrimonioNeto * cliente.composicion.inmobiliario,
                  ),
                  empresarial: Math.round(
                    cliente.patrimonioNeto * cliente.composicion.empresarial,
                  ),
                  otros: Math.round(
                    cliente.patrimonioNeto * cliente.composicion.otros,
                  ),
                  pasivos: 0,
                  bruto: cliente.patrimonioNeto,
                  neto: cliente.patrimonioNeto,
                }}
                capacidad={0}
                datosAFecha={datosLabel}
                onTab={setTab}
                onInforme={() => setInformeOpen(true)}
                onAdd={(cat) => flash(`Alta de ${cat} — pendiente de formulario`)}
              />
            </div>
          )}
        </Card>
        <InformeModal
          open={informeOpen}
          onClose={() => setInformeOpen(false)}
          datosAFecha={datosLabel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="label-upper">P3 · Patrimonio</p>
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-ink">
            Foto del expediente
          </h2>
        </div>
        {toast && (
          <p className="rounded-[6px] bg-paper-2 px-2.5 py-1 text-[11px] text-ink-3">
            {toast}
          </p>
        )}
      </div>

      <Tabs
        items={[...TABS]}
        value={tab}
        onChange={setTab}
        className="-mx-[22px] border-x-0 px-[22px]"
      />

      {tab === "resumen" && (
        <ResumenTab
          clienteId={cliente.id}
          totales={totales}
          capacidad={ahorro.capacidad}
          datosAFecha={datosLabel}
          onTab={setTab}
          onInforme={() => setInformeOpen(true)}
          onAdd={(cat) => flash(`Alta de ${cat} — pendiente de formulario`)}
          ahorroDetalle={{
            ingresos: ahorro.ingresos,
            gastos: ahorro.gastos,
            amortizacionCapital: ahorro.amortizacionCapital,
          }}
        />
      )}

      {tab === "personas" && (
        <PersonasTab
          clienteId={cliente.id}
          personas={personas}
          onAdd={() => flash("Añadir persona — pendiente de formulario")}
        />
      )}

      {tab === "activos" && (
        <ActivosTab
          clienteId={cliente.id}
          personas={personas}
          instrumentos={instrumentos}
          inmuebles={inmuebles}
          sociedades={sociedades}
          otros={otros}
          pasivos={pasivos}
          onEvento={(contexto, nombre) => setEvento({ contexto, nombre })}
        />
      )}

      {tab === "pasivos" && (
        <PasivosTab
          personas={personas}
          pasivos={pasivos}
          inmuebles={inmuebles}
          onEvento={(nombre) => setEvento({ contexto: "pasivo", nombre })}
        />
      )}

      {tab === "ingresos" && (
        <IngresosTab
          personas={personas}
          ingresos={ingresos}
          onEvento={() =>
            setEvento({ contexto: "ingreso", nombre: "Ingresos" })
          }
        />
      )}

      {tab === "gastos" && (
        <GastosTab
          gastos={gastos}
          personas={personas}
          inmuebles={inmuebles}
          sociedades={sociedades}
          onEvento={() => setEvento({ contexto: "gasto", nombre: "Gastos" })}
        />
      )}

      {tab === "ahorro" && (
        <AhorroTab
          ingresos={ahorro.ingresos}
          gastos={ahorro.gastos}
          amortizacionCapital={ahorro.amortizacionCapital}
          capacidad={ahorro.capacidad}
        />
      )}

      <InformeModal
        open={informeOpen}
        onClose={() => setInformeOpen(false)}
        datosAFecha={datosLabel}
      />

      <EventoModal
        open={!!evento}
        onClose={() => setEvento(null)}
        contexto={evento?.contexto ?? "instrumento"}
        elementoNombre={evento?.nombre ?? ""}
      />
    </div>
  );
}
