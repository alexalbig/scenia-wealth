"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  capacidadFromBag,
  elementosMenuFromBag,
  eventosDeEscenarioFromBag,
  ingresosPersonaFromBag,
  newId,
  planBaseFromBag,
  recomputeFiscalBag,
  syncClienteTotales,
  titularidadAgregadaFromBag,
  type ExpedienteBag,
} from "@/lib/expediente";
import {
  resolveExpediente,
  writeExpediente,
} from "@/lib/expediente-storage";
import type {
  Escenario,
  Evento,
  Gasto,
  HistorialInforme,
  Ingreso,
  Inmueble,
  Instrumento,
  OtroActivo,
  Pasivo,
  Persona,
  Sociedad,
  Titularidad,
} from "@/lib/types";
import type { EventoCreadoPayload } from "@/lib/eventos-types";

interface ExpedienteContextValue {
  bag: ExpedienteBag;
  setBag: (updater: (prev: ExpedienteBag) => ExpedienteBag) => void;
  totales: ReturnType<typeof totalesSafe>;
  ahorro: ReturnType<typeof capacidadFromBag>;
  planBase: Escenario | undefined;
  menuElementos: ReturnType<typeof elementosMenuFromBag>;
  ingresosPersona: (personaId: string) => number;
  patrimonioAtribuido: (personaId: string) => number;
  eventosDeEscenario: (escenarioId: string) => Evento[];
  upsertPersona: (p: Persona) => void;
  removePersona: (id: string) => void;
  upsertInstrumento: (i: Instrumento) => void;
  removeInstrumento: (id: string) => void;
  upsertInmueble: (i: Inmueble) => void;
  removeInmueble: (id: string) => void;
  upsertSociedad: (s: Sociedad) => void;
  removeSociedad: (id: string) => void;
  upsertOtro: (a: OtroActivo) => void;
  removeOtro: (id: string) => void;
  upsertPasivo: (p: Pasivo) => void;
  removePasivo: (id: string) => void;
  upsertIngreso: (i: Ingreso) => void;
  removeIngreso: (id: string) => void;
  upsertGasto: (g: Gasto) => void;
  removeGasto: (id: string) => void;
  addEvento: (
    payload: EventoCreadoPayload,
    opts?: { escenarioId?: string; targetId?: string },
  ) => void;
  updateEvento: (evento: Evento) => void;
  removeEvento: (eventoId: string) => void;
  upsertEscenario: (esc: Escenario) => void;
  cloneEscenario: (fromId: string, nombre: string) => Escenario | null;
  patchEscenario: (id: string, patch: Partial<Escenario>) => void;
  removeEscenario: (id: string) => void;
  addHistorial: (entry: Omit<HistorialInforme, "id" | "clienteId">) => void;
}

function totalesSafe(bag: ExpedienteBag) {
  return {
    financiero: bag.instrumentos.reduce((s, i) => s + i.valor, 0),
    inmobiliario: bag.inmuebles.reduce((s, i) => s + i.valor, 0),
    empresarial: 0,
    otros: bag.otrosActivos.reduce((s, a) => s + a.valor, 0),
    pasivos: bag.pasivos.reduce((s, p) => s + p.capitalPendiente, 0),
    get bruto() {
      return this.financiero + this.inmobiliario + this.empresarial + this.otros;
    },
    get neto() {
      return this.bruto - this.pasivos;
    },
  };
}

function stripTitularidad(
  titularidades: Titularidad[],
  personaId: string,
): Titularidad[] {
  return titularidades.filter(
    (t) => !(t.owner.kind === "persona" && t.owner.personaId === personaId),
  );
}

const ExpedienteContext = createContext<ExpedienteContextValue | null>(null);

export function ExpedienteProvider({
  clienteId,
  children,
  fallback,
}: {
  clienteId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [bag, setBagState] = useState<ExpedienteBag | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const resolved = resolveExpediente(clienteId);
    setBagState(resolved);
    setReady(true);
  }, [clienteId]);

  const setBag = useCallback(
    (updater: (prev: ExpedienteBag) => ExpedienteBag) => {
      setBagState((prev) => {
        if (!prev) return prev;
        const next = syncClienteTotales(updater(prev));
        writeExpediente(next);
        return next;
      });
    },
    [],
  );

  const value = useMemo<ExpedienteContextValue | null>(() => {
    if (!bag) return null;

    const upsert =
      <T extends { id: string }>(key: keyof ExpedienteBag) =>
      (item: T) => {
        setBag((prev) => {
          const list = [...(prev[key] as unknown as T[])];
          const idx = list.findIndex((x) => x.id === item.id);
          const nextList =
            idx >= 0
              ? list.map((x, i) => (i === idx ? item : x))
              : [...list, item];
          return { ...prev, [key]: nextList };
        });
      };

    const remove =
      (key: keyof ExpedienteBag) =>
      (id: string) => {
        setBag((prev) => {
          const list = prev[key] as unknown as Array<{ id: string }>;
          return { ...prev, [key]: list.filter((x) => x.id !== id) };
        });
      };

    const t = {
      financiero: bag.instrumentos.reduce((s, i) => s + i.valor, 0),
      inmobiliario: bag.inmuebles.reduce((s, i) => s + i.valor, 0),
      empresarial: 0,
      otros: bag.otrosActivos.reduce((s, a) => s + a.valor, 0),
      pasivos: bag.pasivos.reduce((s, p) => s + p.capitalPendiente, 0),
    };
    const bruto = t.financiero + t.inmobiliario + t.empresarial + t.otros;

    return {
      bag,
      setBag,
      totales: { ...t, bruto, neto: bruto - t.pasivos },
      ahorro: capacidadFromBag(bag),
      planBase: planBaseFromBag(bag),
      menuElementos: elementosMenuFromBag(bag),
      ingresosPersona: (personaId) => ingresosPersonaFromBag(bag, personaId),
      patrimonioAtribuido: (personaId) =>
        titularidadAgregadaFromBag(bag, personaId),
      eventosDeEscenario: (escenarioId) =>
        eventosDeEscenarioFromBag(bag, escenarioId),
      upsertPersona: upsert("personas"),
      removePersona: (id) => {
        setBag((prev) => ({
          ...prev,
          personas: prev.personas.filter((p) => p.id !== id),
          ingresos: prev.ingresos.filter((i) => i.personaId !== id),
          instrumentos: prev.instrumentos.map((i) => ({
            ...i,
            titularidades: stripTitularidad(i.titularidades, id),
          })),
          inmuebles: prev.inmuebles.map((i) => ({
            ...i,
            titularidades: stripTitularidad(i.titularidades, id),
          })),
          otrosActivos: prev.otrosActivos.map((a) => ({
            ...a,
            titularidades: stripTitularidad(a.titularidades, id),
          })),
          pasivos: prev.pasivos.map((p) => ({
            ...p,
            titularidades: stripTitularidad(p.titularidades, id),
          })),
          sociedades: prev.sociedades.map((s) => {
            const { [id]: _, ...rest } = s.participaciones;
            return { ...s, participaciones: rest };
          }),
        }));
      },
      upsertInstrumento: upsert("instrumentos"),
      removeInstrumento: remove("instrumentos"),
      upsertInmueble: upsert("inmuebles"),
      removeInmueble: remove("inmuebles"),
      upsertSociedad: upsert("sociedades"),
      removeSociedad: remove("sociedades"),
      upsertOtro: upsert("otrosActivos"),
      removeOtro: remove("otrosActivos"),
      upsertPasivo: upsert("pasivos"),
      removePasivo: remove("pasivos"),
      upsertIngreso: upsert("ingresos"),
      removeIngreso: remove("ingresos"),
      upsertGasto: upsert("gastos"),
      removeGasto: remove("gastos"),
      addEvento: (payload, opts) => {
        setBag((prev) => {
          const plan = planBaseFromBag(prev);
          const escenarioId =
            payload.escenarioId ||
            opts?.escenarioId ||
            plan?.id;
          if (!escenarioId) return prev;
          const cuotaAnual =
            payload.cuotaAnual ?? payload.impuestosPeriodo;
          const ev: Evento = {
            id: newId("evt"),
            escenarioId,
            tipo: payload.tipo,
            anio: payload.anio,
            hastaAnio: payload.hastaAnio,
            etiqueta: payload.etiqueta,
            targetId: payload.targetId || opts?.targetId,
            cuotaAnual,
            impuestosPeriodo: cuotaAnual,
            introducidoPorAsesor: payload.introducidoPorAsesor,
            notas: payload.notas,
          };
          const next: ExpedienteBag = {
            ...prev,
            eventos: [...prev.eventos, ev],
            escenarios: prev.escenarios.map((e) =>
              e.id === escenarioId
                ? { ...e, eventoIds: [...e.eventoIds, ev.id] }
                : e,
            ),
          };
          return recomputeFiscalBag(next);
        });
      },
      updateEvento: (evento) => {
        setBag((prev) =>
          recomputeFiscalBag({
            ...prev,
            eventos: prev.eventos.map((e) =>
              e.id === evento.id ? evento : e,
            ),
          }),
        );
      },
      removeEvento: (eventoId) => {
        setBag((prev) =>
          recomputeFiscalBag({
            ...prev,
            eventos: prev.eventos.filter((e) => e.id !== eventoId),
            escenarios: prev.escenarios.map((e) => ({
              ...e,
              eventoIds: e.eventoIds.filter((id) => id !== eventoId),
            })),
          }),
        );
      },
      upsertEscenario: upsert("escenarios"),
      cloneEscenario: (fromId, nombre) => {
        let created: Escenario | null = null;
        setBag((prev) => {
          const src = prev.escenarios.find((e) => e.id === fromId);
          if (!src) return prev;
          const newEscId = newId("esc");
          const clonedEvents = eventosDeEscenarioFromBag(prev, fromId).map(
            (ev) => ({
              ...ev,
              id: newId("evt"),
              escenarioId: newEscId,
            }),
          );
          created = {
            ...src,
            id: newEscId,
            nombre,
            esPlanBase: false,
            eventoIds: clonedEvents.map((e) => e.id),
            impuestosPeriodo: undefined,
            impuestosParcial: undefined,
          };
          return recomputeFiscalBag({
            ...prev,
            escenarios: [...prev.escenarios, created],
            eventos: [...prev.eventos, ...clonedEvents],
          });
        });
        return created;
      },
      patchEscenario: (id, patch) => {
        setBag((prev) =>
          recomputeFiscalBag({
            ...prev,
            escenarios: prev.escenarios.map((e) =>
              e.id === id ? { ...e, ...patch } : e,
            ),
          }),
        );
      },
      removeEscenario: (id) => {
        setBag((prev) => {
          const esc = prev.escenarios.find((e) => e.id === id);
          if (!esc || esc.esPlanBase) return prev;
          const drop = new Set(esc.eventoIds);
          return recomputeFiscalBag({
            ...prev,
            escenarios: prev.escenarios.filter((e) => e.id !== id),
            eventos: prev.eventos.filter((e) => !drop.has(e.id)),
          });
        });
      },
      addHistorial: (entry) => {
        setBag((prev) => ({
          ...prev,
          historial: [
            {
              id: newId("hist"),
              clienteId: prev.cliente.id,
              ...entry,
            },
            ...prev.historial,
          ],
          cliente: {
            ...prev.cliente,
            ultimaRevisionMeses: 0,
          },
        }));
      },
    };
  }, [bag, setBag]);

  if (!ready) {
    return fallback ?? null;
  }
  if (!value) {
    return (
      fallback ?? (
        <div className="sheet-pad">
          <div className="h2">Cliente no encontrado</div>
          <p className="tiny" style={{ marginTop: 8 }}>
            Este expediente no está en el seed ni en la sesión actual.
          </p>
        </div>
      )
    );
  }

  return (
    <ExpedienteContext.Provider value={value}>
      {children}
    </ExpedienteContext.Provider>
  );
}

export function useExpediente() {
  const ctx = useContext(ExpedienteContext);
  if (!ctx) {
    throw new Error("useExpediente debe usarse dentro de ExpedienteProvider");
  }
  return ctx;
}

/** Dentro o fuera del provider (PlantillaEvento en flujos mixtos). */
export function useExpedienteOptional() {
  return useContext(ExpedienteContext);
}
