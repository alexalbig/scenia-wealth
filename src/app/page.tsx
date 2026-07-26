"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppTopBar, PaperShell } from "@/components/shell/AppShell";
import { CompositionBar } from "@/components/cartera/CompositionBar";
import { AltaClienteModal } from "@/components/cartera/AltaClienteModal";
import {
  Badge,
  Button,
  Card,
  Table,
  TBody,
  TD,
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
          "inline-flex items-center gap-1 text-[10.5px] font-semibold tracking-[0.06em] uppercase hover:text-ink",
          active ? "text-blue" : "text-mute",
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
    const filtered = q
      ? all.filter((r) => r.searchBlob.includes(q))
      : all;
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
          <Button size="sm" onClick={() => setAltaOpen(true)}>
            + Nuevo cliente
          </Button>
        }
      />

      <main className="space-y-4 px-5 py-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="label-upper">P1 · Entrada</p>
            <h2 className="text-[17px] font-bold tracking-[-0.02em] text-ink">
              Clientes
            </h2>
          </div>
          <label className="block w-full max-w-xs">
            <span className="sr-only">Buscar por nombre o NIF</span>
            <input
              type="search"
              placeholder="Buscar por nombre o NIF…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-[8px] border border-line-2 bg-paper px-3 py-2 text-[13px] text-ink outline-none placeholder:text-faint focus:border-blue"
            />
          </label>
        </div>

        <Card padding="sm">
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
                  label="Patrimonio"
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
                  className="cursor-pointer"
                  onClick={() =>
                    router.push(`/clientes/${cliente.id}/patrimonio`)
                  }
                >
                  <TD>
                    <Link
                      href={`/clientes/${cliente.id}/patrimonio`}
                      className="font-semibold text-ink hover:text-blue"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {cliente.nombre}
                    </Link>
                  </TD>
                  <TD>
                    <Badge variant="segment">{cliente.segmento}</Badge>
                  </TD>
                  <TD numeric>
                    <div className="flex flex-col items-end gap-1.5">
                      <span>{formatEUR(cliente.patrimonioNeto)}</span>
                      <CompositionBar composicion={cliente.composicion} />
                    </div>
                  </TD>
                  <TD numeric className="text-ink-3">
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
            <tfoot>
              <tr className="border-t border-line-2 bg-paper-2">
                <td className="px-3 py-3 text-[12px] font-semibold text-ink" colSpan={2}>
                  {footerCount}{" "}
                  {footerCount === 1 ? "cliente" : "clientes"}
                </td>
                <td className="px-3 py-3 text-right text-[12px] font-bold tabular-nums text-ink">
                  {formatEUR(footerPatrimonio)}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </Table>
        </Card>

        <p className="text-[11px] text-mute">
          Patrimonio neto · {seed.cuenta.nombre}
          {query.trim() === "" &&
            extraClientes.length === 0 &&
            ` · total seed ${formatEUR(patrimonioTotalCartera())}`}
        </p>
      </main>

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
