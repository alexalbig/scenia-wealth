"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppTopBar, PaperShell, Sheet } from "@/components/shell/AppShell";
import { CompositionBar } from "@/components/cartera/CompositionBar";
import { AltaClienteModal } from "@/components/cartera/AltaClienteModal";
import {
  Badge,
  Button,
  Table,
  TBody,
  TD,
  TFoot,
  TH,
  THead,
  TR,
} from "@/components/ui";
import {
  getEscenariosDeCliente,
  getPersonasDeCliente,
  patrimonioTotalCartera,
  seed,
} from "@/lib/seed";
import { formatEUR, monthsAgoLabel } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Cliente, Segmento } from "@/lib/types";

type SortKey =
  | "nombre"
  | "segmento"
  | "patrimonio"
  | "escenarios"
  | "revision";

type SortDir = "asc" | "desc";

interface CarteraRow {
  cliente: Cliente;
  escenarios: number;
  searchBlob: string;
}

function initials(nombre: string) {
  return nombre
    .replace(/^Familia\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function buildRows(): CarteraRow[] {
  return seed.clientes.map((cliente) => {
    const personas = getPersonasDeCliente(cliente.id);
    const sociedades = seed.sociedades.filter((s) =>
      cliente.sociedadIds.includes(s.id),
    );
    const searchBlob = [
      cliente.nombre,
      cliente.segmento,
      ...personas.map((p) => `${p.nombre} ${p.apellidos}`),
      ...sociedades.map((s) => s.nif),
      ...sociedades.map((s) => s.nombre),
    ]
      .join(" ")
      .toLowerCase();

    return {
      cliente,
      escenarios: getEscenariosDeCliente(cliente.id).length,
      searchBlob,
    };
  });
}

function compareRows(a: CarteraRow, b: CarteraRow, key: SortKey, dir: SortDir) {
  const mul = dir === "asc" ? 1 : -1;
  switch (key) {
    case "nombre":
      return mul * a.cliente.nombre.localeCompare(b.cliente.nombre, "es");
    case "segmento":
      return mul * a.cliente.segmento.localeCompare(b.cliente.segmento, "es");
    case "patrimonio":
      return mul * (a.cliente.patrimonioNeto - b.cliente.patrimonioNeto);
    case "escenarios":
      return mul * (a.escenarios - b.escenarios);
    case "revision":
      return mul * (a.cliente.ultimaRevisionMeses - b.cliente.ultimaRevisionMeses);
    default:
      return 0;
  }
}

function SortHeader({
  label,
  active,
  dir,
  align = "left",
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  align?: "left" | "right";
  onClick: () => void;
}) {
  return (
    <TH className={align === "right" ? "text-right" : undefined}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-[0.05em] hover:text-ink-3",
          active ? "text-ink-3" : "text-mute",
          align === "right" && "w-full justify-end",
        )}
      >
        {label}
        <span className="tabular-nums text-[9px] opacity-70" aria-hidden>
          {active ? (dir === "asc" ? "↑" : "↓") : ""}
        </span>
      </button>
    </TH>
  );
}

export default function CarteraPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("patrimonio");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [altaOpen, setAltaOpen] = useState(false);
  const [extraClientes, setExtraClientes] = useState<CarteraRow[]>([]);

  const baseRows = useMemo(() => buildRows(), []);

  const rows = useMemo(() => {
    const all = [...baseRows, ...extraClientes];
    const q = query.trim().toLowerCase();
    const filtered = q ? all.filter((r) => r.searchBlob.includes(q)) : all;
    return [...filtered].sort((a, b) => compareRows(a, b, sortKey, sortDir));
  }, [baseRows, extraClientes, query, sortKey, sortDir]);

  const footerCount = rows.length;
  const footerPatrimonio = rows.reduce(
    (sum, r) => sum + r.cliente.patrimonioNeto,
    0,
  );

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "nombre" || key === "segmento" ? "asc" : "desc");
    }
  }

  return (
    <PaperShell>
      <AppTopBar
        title="Cartera"
        action={
          <Button size="sm" variant="coral" onClick={() => setAltaOpen(true)}>
            + Nuevo cliente
          </Button>
        }
      />

      <Sheet>
        <div className="flex flex-wrap items-end justify-between gap-4 px-[22px] pb-3.5 pt-5">
          <div className="min-w-[220px] flex-1">
            <p className="label-upper">Cartera</p>
            <h1 className="text-[28px] font-bold tracking-[-0.02em] text-ink">
              Cartera de clientes
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex min-w-[230px] items-center gap-1.5 rounded-[8px] border border-line-2 bg-white px-2.5 py-1.5">
              <span className="sr-only">Buscar por nombre o NIF</span>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8A95A8"
                strokeWidth="2.4"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              <input
                type="search"
                placeholder="Buscar por nombre o NIF"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border-0 bg-transparent text-[12.5px] text-ink outline-none placeholder:text-faint"
              />
            </label>
          </div>
        </div>

        <div className="px-[22px] pb-5">
          <Table>
            <THead>
              <TR>
                <SortHeader
                  label="Cliente"
                  active={sortKey === "nombre"}
                  dir={sortDir}
                  onClick={() => toggleSort("nombre")}
                />
                <SortHeader
                  label="Segmento"
                  active={sortKey === "segmento"}
                  dir={sortDir}
                  onClick={() => toggleSort("segmento")}
                />
                <SortHeader
                  label="Patrimonio neto"
                  active={sortKey === "patrimonio"}
                  dir={sortDir}
                  align="right"
                  onClick={() => toggleSort("patrimonio")}
                />
                <SortHeader
                  label="Escenarios"
                  active={sortKey === "escenarios"}
                  dir={sortDir}
                  align="right"
                  onClick={() => toggleSort("escenarios")}
                />
                <SortHeader
                  label="Última revisión"
                  active={sortKey === "revision"}
                  dir={sortDir}
                  onClick={() => toggleSort("revision")}
                />
              </TR>
            </THead>
            <TBody>
              {rows.map(({ cliente, escenarios }) => (
                <TR
                  key={cliente.id}
                  className="cursor-pointer hover:[&>td]:bg-paper-2"
                  onClick={() =>
                    router.push(`/clientes/${cliente.id}/patrimonio`)
                  }
                >
                  <TD>
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-soft text-[11px] font-bold text-blue">
                        {initials(cliente.nombre)}
                      </span>
                      <div>
                        <Link
                          href={`/clientes/${cliente.id}/patrimonio`}
                          className="font-bold text-ink hover:text-blue"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {cliente.nombre}
                        </Link>
                      </div>
                    </div>
                  </TD>
                  <TD>
                    <Badge
                      variant={
                        cliente.segmento === "Empresario" ? "coral" : "segment"
                      }
                    >
                      {cliente.segmento}
                    </Badge>
                  </TD>
                  <TD numeric>
                    <div className="inline-flex flex-col items-end">
                      <span className="font-bold">{formatEUR(cliente.patrimonioNeto)}</span>
                      <CompositionBar composicion={cliente.composicion} />
                    </div>
                  </TD>
                  <TD numeric className="!font-normal text-ink-3">
                    {escenarios}
                  </TD>
                  <TD className="text-slate">
                    {monthsAgoLabel(cliente.ultimaRevisionMeses)}
                  </TD>
                </TR>
              ))}
              {rows.length === 0 && (
                <TR>
                  <TD colSpan={5} className="py-8 text-center text-mute">
                    Ningún cliente coincide con la búsqueda.
                  </TD>
                </TR>
              )}
            </TBody>
            <TFoot>
              <TR>
                <TD
                  colSpan={2}
                  className="border-t border-line-2 border-b-0 bg-paper-2 py-3 text-[12px] font-bold"
                >
                  {footerCount} {footerCount === 1 ? "cliente" : "clientes"}
                </TD>
                <TD
                  numeric
                  className="border-t border-line-2 border-b-0 bg-paper-2 py-3 text-[12px] font-bold"
                >
                  {formatEUR(footerPatrimonio)}
                </TD>
                <TD
                  colSpan={2}
                  className="border-t border-line-2 border-b-0 bg-paper-2"
                />
              </TR>
            </TFoot>
          </Table>

          <div className="mt-2 flex flex-wrap gap-3">
            {[
              ["Financiero", "bg-blue"],
              ["Inmobiliario", "bg-ink-3"],
              ["Empresarial", "bg-coral"],
              ["Otros", "bg-faintest"],
            ].map(([label, cls]) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 text-[10.5px] text-slate"
              >
                <i className={cn("inline-block h-[9px] w-[9px] rounded-[2px]", cls)} />
                {label}
              </span>
            ))}
          </div>

          {query.trim() === "" && extraClientes.length === 0 && (
            <p className="mt-3 text-[11px] text-mute">
              Patrimonio neto · {seed.cuenta.nombre} · total seed{" "}
              {formatEUR(patrimonioTotalCartera())}
            </p>
          )}
        </div>
      </Sheet>

      <AltaClienteModal
        open={altaOpen}
        onClose={() => setAltaOpen(false)}
        onCreated={({ nombre, segmento }) => {
          const id = `cliente-nuevo-${Date.now()}`;
          const nuevo: CarteraRow = {
            cliente: {
              id,
              cuentaId: seed.cuenta.id,
              nombre,
              segmento: segmento as Segmento,
              ccaa: "Comunitat Valenciana",
              personaIds: [],
              sociedadIds: [],
              patrimonioNeto: 0,
              composicion: {
                financiero: 0,
                inmobiliario: 0,
                empresarial: 0,
                otros: 0,
              },
              ultimaRevisionMeses: 0,
              completo: false,
              datosAFecha: new Date().toISOString().slice(0, 10),
            },
            escenarios: 1,
            searchBlob: `${nombre} ${segmento}`.toLowerCase(),
          };
          setExtraClientes((prev) => [...prev, nuevo]);
        }}
      />
    </PaperShell>
  );
}
