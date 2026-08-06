"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SheetPad, Tabs, Toast } from "@/components/ui";
import { ResumenTab } from "@/components/patrimonio/ResumenTab";
import { PersonasTab } from "@/components/patrimonio/PersonasTab";
import { ActivosTab } from "@/components/patrimonio/ActivosTab";
import { PasivosTab } from "@/components/patrimonio/PasivosTab";
import { IngresosTab } from "@/components/patrimonio/IngresosTab";
import { GastosTab } from "@/components/patrimonio/GastosTab";
import { AhorroTab } from "@/components/patrimonio/AhorroTab";
import { InformeModal } from "@/components/patrimonio/InformeModal";
import { EventoModal } from "@/components/patrimonio/EventoModal";
import {
  AltaElementoModal,
  type AltaTarget,
} from "@/components/patrimonio/AltaElementoModal";
import { useExpediente } from "@/components/expediente/ExpedienteProvider";
import {
  eventosQueReferencian,
  mensajeConfirmacionCascada,
} from "@/lib/expediente";
import { formatFechaDMY, personaLabel } from "@/lib/patrimonio";
import type {
  Gasto,
  Ingreso,
  Inmueble,
  Instrumento,
  OtroActivo,
  Pasivo,
  Persona,
  Sociedad,
} from "@/lib/types";

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

const RESUMEN_KIND: Record<string, AltaTarget["kind"]> = {
  financiero: "instrumento",
  inmobiliario: "inmueble",
  empresarial: "sociedad",
  otros: "otro",
};

export function PatrimonioView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab: TabId = isTabId(searchParams.get("tab"))
    ? (searchParams.get("tab") as TabId)
    : "resumen";

  const {
    bag,
    totales,
    ahorro,
    planBase,
    ingresosPersona,
    patrimonioAtribuido,
    addEvento,
    addHistorial,
    upsertPersona,
    removePersona,
    upsertInstrumento,
    removeInstrumento,
    upsertInmueble,
    removeInmueble,
    upsertSociedad,
    removeSociedad,
    upsertOtro,
    removeOtro,
    upsertPasivo,
    removePasivo,
    upsertIngreso,
    removeIngreso,
    upsertGasto,
    removeGasto,
  } = useExpediente();

  const cliente = bag.cliente;
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
    elementoId?: string;
    tipoFiscal?: string;
  } | null>(null);
  const [alta, setAlta] = useState<AltaTarget | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function setTab(id: string) {
    router.replace(`/clientes/${cliente.id}/patrimonio?tab=${id}`, {
      scroll: false,
    });
  }

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }

  function confirmarCascada(nombre: string, targetId: string): boolean {
    return window.confirm(
      mensajeConfirmacionCascada(
        nombre,
        eventosQueReferencian(bag, targetId),
      ),
    );
  }

  function confirmarBorrarPersona(p: Persona): boolean {
    const refs = eventosQueReferencian(bag, p.id);
    const nIng = bag.ingresos.filter((i) => i.personaId === p.id).length;
    const nTit =
      bag.instrumentos.reduce(
        (n, i) =>
          n +
          i.titularidades.filter(
            (t) => t.owner.kind === "persona" && t.owner.personaId === p.id,
          ).length,
        0,
      ) +
      bag.inmuebles.reduce(
        (n, i) =>
          n +
          i.titularidades.filter(
            (t) => t.owner.kind === "persona" && t.owner.personaId === p.id,
          ).length,
        0,
      ) +
      bag.otrosActivos.reduce(
        (n, a) =>
          n +
          a.titularidades.filter(
            (t) => t.owner.kind === "persona" && t.owner.personaId === p.id,
          ).length,
        0,
      ) +
      bag.pasivos.reduce(
        (n, x) =>
          n +
          x.titularidades.filter(
            (t) => t.owner.kind === "persona" && t.owner.personaId === p.id,
          ).length,
        0,
      );
    const base = mensajeConfirmacionCascada(personaLabel(p), refs);
    const extras: string[] = [];
    if (nIng > 0) {
      extras.push(
        `${nIng} ingreso${nIng === 1 ? "" : "s"} asociado${nIng === 1 ? "" : "s"}`,
      );
    }
    if (nTit > 0) {
      extras.push(
        `${nTit} titularidad${nTit === 1 ? "" : "es"} en el patrimonio`,
      );
    }
    if (extras.length === 0) return window.confirm(base);
    const extraTxt = extras.join(" y ");
    if (refs.length === 0) {
      return window.confirm(
        `¿Eliminar «${personaLabel(p)}»? También se quitarán ${extraTxt}.`,
      );
    }
    return window.confirm(`${base} También se quitarán ${extraTxt}.`);
  }

  function withClienteId<T extends { clienteId: string }>(item: T): T {
    return { ...item, clienteId: cliente.id };
  }

  const datosDMY = formatFechaDMY(cliente.datosAFecha);

  return (
    <>
      <Tabs items={[...TABS]} value={tab} onChange={setTab} />
      <SheetPad>
        {tab === "resumen" && (
          <ResumenTab
            clienteId={cliente.id}
            totales={totales}
            capacidad={ahorro.capacidad}
            onTab={setTab}
            onInforme={() => setInformeOpen(true)}
            datosAFecha={datosDMY}
            onAdd={(cat) => {
              const kind = RESUMEN_KIND[cat];
              if (kind) setAlta({ kind });
            }}
            ahorroDetalle={{
              ingresos: ahorro.ingresos,
              gastos: ahorro.gastos,
              amortizacionCapital: ahorro.amortizacionCapital,
            }}
            labels={{
              financiero:
                bag.instrumentos.map((i) => i.nombre).join(" · ") || "—",
              inmobiliario:
                bag.inmuebles.map((i) => i.nombre).join(" · ") || "—",
              empresarial: bag.sociedades[0]?.nombre,
              otros: bag.otrosActivos.map((a) => a.nombre).join(" · ") || "—",
            }}
            sociedadId={bag.sociedades[0]?.id}
          />
        )}

        {tab === "personas" && (
          <PersonasTab
            clienteId={cliente.id}
            personas={bag.personas}
            ingresosOf={ingresosPersona}
            patrimonioOf={patrimonioAtribuido}
            onAdd={() => setAlta({ kind: "persona" })}
            onEdit={(p) => setAlta({ kind: "persona", item: p })}
            onDelete={(id) => {
              const p = bag.personas.find((x) => x.id === id);
              if (!p || !confirmarBorrarPersona(p)) return;
              removePersona(id);
              flash("Persona eliminada");
            }}
          />
        )}

        {tab === "activos" && (
          <ActivosTab
            clienteId={cliente.id}
            personas={bag.personas}
            instrumentos={bag.instrumentos}
            inmuebles={bag.inmuebles}
            sociedades={bag.sociedades}
            otros={bag.otrosActivos}
            pasivos={bag.pasivos}
            onEvento={(payload) => setEvento(payload)}
            onAdd={(kind) => setAlta({ kind })}
            onEditInstrumento={(i) => setAlta({ kind: "instrumento", item: i })}
            onEditInmueble={(i) => setAlta({ kind: "inmueble", item: i })}
            onEditSociedad={(s) => setAlta({ kind: "sociedad", item: s })}
            onEditOtro={(a) => setAlta({ kind: "otro", item: a })}
            onDeleteInstrumento={(id) => {
              const nombre =
                bag.instrumentos.find((i) => i.id === id)?.nombre ??
                "instrumento";
              if (!confirmarCascada(nombre, id)) return;
              removeInstrumento(id);
              flash("Instrumento eliminado");
            }}
            onDeleteInmueble={(id) => {
              const nombre =
                bag.inmuebles.find((i) => i.id === id)?.nombre ?? "inmueble";
              if (!confirmarCascada(nombre, id)) return;
              removeInmueble(id);
              flash("Inmueble eliminado");
            }}
            onDeleteSociedad={(id) => {
              const nombre =
                bag.sociedades.find((s) => s.id === id)?.nombre ?? "sociedad";
              if (!confirmarCascada(nombre, id)) return;
              removeSociedad(id);
              flash("Sociedad eliminada");
            }}
            onDeleteOtro={(id) => {
              const nombre =
                bag.otrosActivos.find((a) => a.id === id)?.nombre ?? "activo";
              if (!confirmarCascada(nombre, id)) return;
              removeOtro(id);
              flash("Activo eliminado");
            }}
          />
        )}

        {tab === "pasivos" && (
          <PasivosTab
            personas={bag.personas}
            pasivos={bag.pasivos}
            inmuebles={bag.inmuebles}
            onEvento={(nombre, elementoId) =>
              setEvento({ contexto: "pasivo", nombre, elementoId })
            }
            onAdd={() => setAlta({ kind: "pasivo" })}
            onEdit={(p) => setAlta({ kind: "pasivo", item: p })}
            onDelete={(id) => {
              const nombre = (() => {
                const p = bag.pasivos.find((x) => x.id === id);
                if (!p) return "pasivo";
                return p.tipo === "hipoteca"
                  ? `Hipoteca ${p.prestamista}`
                  : `Crédito ${p.prestamista}`;
              })();
              if (!confirmarCascada(nombre, id)) return;
              removePasivo(id);
              flash("Pasivo eliminado");
            }}
          />
        )}

        {tab === "ingresos" && (
          <IngresosTab
            personas={bag.personas}
            ingresos={bag.ingresos}
            onEvento={() =>
              setEvento({ contexto: "ingreso", nombre: "Ingresos" })
            }
            onAdd={() => setAlta({ kind: "ingreso" })}
            onEdit={(i) => setAlta({ kind: "ingreso", item: i })}
            onDelete={(id) => {
              if (!window.confirm("¿Eliminar este ingreso?")) return;
              removeIngreso(id);
              flash("Ingreso eliminado");
            }}
          />
        )}

        {tab === "gastos" && (
          <GastosTab
            gastos={bag.gastos}
            personas={bag.personas}
            inmuebles={bag.inmuebles}
            sociedades={bag.sociedades}
            otros={bag.otrosActivos}
            pasivos={bag.pasivos}
            onEvento={() => setEvento({ contexto: "gasto", nombre: "Gastos" })}
            onAdd={() => setAlta({ kind: "gasto" })}
            onEdit={(g) => setAlta({ kind: "gasto", item: g })}
            onDelete={(id) => {
              if (!window.confirm("¿Eliminar este gasto?")) return;
              removeGasto(id);
              flash("Gasto eliminado");
            }}
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
      </SheetPad>

      <InformeModal
        open={informeOpen}
        onClose={() => setInformeOpen(false)}
        tituloInformeDefault={`Foto patrimonial · ${cliente.nombre} · ${datosDMY}`}
        datosAFecha={datosDMY}
        tipoInforme="Foto del patrimonio"
        onGenerated={(info) =>
          addHistorial({
            fecha: new Date().toISOString().slice(0, 10),
            titulo: info.titulo,
            tipo: info.tipo,
          })
        }
      />
      <EventoModal
        open={!!evento}
        onClose={() => setEvento(null)}
        contexto={evento?.contexto ?? "instrumento"}
        elementoNombre={evento?.nombre ?? ""}
        elementoId={evento?.elementoId}
        tipoFiscal={evento?.tipoFiscal}
        clienteId={cliente.id}
        escenarios={bag.escenarios.map((e) => ({
          id: e.id,
          nombre: e.nombre,
        }))}
        escenarioInicialId={planBase?.id}
        onCreated={(payload) => {
          addEvento(payload, {
            escenarioId: planBase?.id,
            targetId: evento?.elementoId,
          });
          flash("Evento añadido al plan base — se refleja en Proyección");
        }}
      />
      <AltaElementoModal
        open={!!alta}
        target={alta}
        personas={bag.personas}
        pasivos={bag.pasivos}
        inmuebles={bag.inmuebles}
        sociedades={bag.sociedades}
        onClose={() => setAlta(null)}
        onSavePersona={(p: Persona) => {
          upsertPersona(p);
          flash("Persona guardada");
        }}
        onSaveInstrumento={(i: Instrumento) => {
          upsertInstrumento(withClienteId(i));
          flash("Instrumento guardado");
        }}
        onSaveInmueble={(i: Inmueble) => {
          upsertInmueble(withClienteId(i));
          flash("Inmueble guardado");
        }}
        onSaveSociedad={(s: Sociedad) => {
          upsertSociedad(withClienteId(s));
          flash("Sociedad guardada");
        }}
        onSaveOtro={(a: OtroActivo) => {
          upsertOtro(withClienteId(a));
          flash("Activo guardado");
        }}
        onSavePasivo={(p: Pasivo) => {
          upsertPasivo(withClienteId(p));
          flash("Pasivo guardado");
        }}
        onSaveIngreso={(i: Ingreso) => {
          upsertIngreso(withClienteId(i));
          flash("Ingreso guardado");
        }}
        onSaveGasto={(g: Gasto) => {
          upsertGasto(withClienteId(g));
          flash("Gasto guardado");
        }}
      />
      <Toast message={toast} />
    </>
  );
}
