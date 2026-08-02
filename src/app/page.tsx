"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppTopBar, PaperShell, Sheet } from "@/components/shell/AppShell";
import { CompositionBar } from "@/components/cartera/CompositionBar";
import { AltaClienteModal } from "@/components/cartera/AltaClienteModal";
import {
  Avatar,
  Button,
  Pill,
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
  seed,
} from "@/lib/seed";
import {
  createExpedienteFromAlta,
  listCustomClientes,
  readExpediente,
} from "@/lib/expediente-storage";
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
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function rowFromCliente(
  cliente: Cliente,
  personas: Array<{ nombre: string; apellidos: string }>,
  sociedades: Array<{ nif: string; nombre: string }>,
  escenarios: number,
): CarteraRow {
  const searchBlob = [
    cliente.nombre,
    cliente.segmento,
    ...personas.map((p) => `${p.nombre} ${p.apellidos}`),
    ...sociedades.map((s) => s.nif),
    ...sociedades.map((s) => s.nombre),
  ]
    .join(" ")
    .toLowerCase();
  return { cliente, escenarios, searchBlob };
}

function buildSeedRows(): CarteraRow[] {
  return seed.clientes.map((c) => {
    const personas = getPersonasDeCliente(c.id);
    const sociedades = seed.sociedades.filter((s) =>
      c.sociedadIds.includes(s.id),
    );
    return rowFromCliente(
      c,
      personas,
      sociedades,
      getEscenariosDeCliente(c.id).length || 1,
    );
  });
}

function buildRows(): CarteraRow[] {
  const seedIds = new Set(seed.clientes.map((c) => c.id));
  const seedRows = seed.clientes.map((c) => {
    const bag = readExpediente(c.id);
    const cliente = bag?.cliente ?? c;
    const personas = bag?.personas ?? getPersonasDeCliente(c.id);
    const sociedades =
      bag?.sociedades ??
      seed.sociedades.filter((s) => c.sociedadIds.includes(s.id));
    return rowFromCliente(
      cliente,
      personas,
      sociedades,
      getEscenariosDeCliente(c.id).length || 1,
    );
  });

  const customRows = listCustomClientes()
    .filter((c) => !seedIds.has(c.id))
    .map((c) => {
      const bag = readExpediente(c.id);
      return rowFromCliente(c, bag?.personas ?? [], bag?.sociedades ?? [], 1);
    });

  return [...seedRows, ...customRows];
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
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionTick, setSessionTick] = useState(0);

  useEffect(() => {
    setSessionReady(true);
  }, []);

  const baseRows = useMemo(() => {
    if (!sessionReady) return buildSeedRows();
    return buildRows();
  }, [sessionReady, sessionTick]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? baseRows.filter((r) => r.searchBlob.includes(q))
      : baseRows;
    return [...filtered].sort((a, b) => compareRows(a, b, sortKey, sortDir));
  }, [baseRows, query, sortKey, sortDir]);

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
      <AppTopBar />

      <Sheet>
        <div className="scr-head">
          <div className="grow">
            <div className="lbl">Cartera</div>
            <div className="h1">Cartera de clientes</div>
          </div>
          <div className="toolbar">
            <div className="search">
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
                type="text"
                placeholder="Buscar por nombre o NIF"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Buscar por nombre o NIF"
              />
            </div>
            <Button variant="coral" onClick={() => setAltaOpen(true)}>
              + Nuevo cliente
            </Button>
          </div>
        </div>

        <div style={{ padding: "0 22px" }}>
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
                  className="rowlink"
                  onClick={() =>
                    router.push(`/clientes/${cliente.id}/patrimonio`)
                  }
                >
                  <TD>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Avatar initials={initials(cliente.nombre)} />
                      <div>
                        <b>{cliente.nombre}</b>
                      </div>
                    </div>
                  </TD>
                  <TD>
                    <Pill
                      tone={
                        cliente.segmento === "Empresario" ? "emp" : "default"
                      }
                    >
                      {cliente.segmento}
                    </Pill>
                  </TD>
                  <TD className="right">
                    <div className="num strong">
                      {formatEUR(cliente.patrimonioNeto)}
                    </div>
                    <CompositionBar
                      composicion={cliente.composicion}
                      style={{ marginLeft: "auto" }}
                    />
                  </TD>
                  <TD className="right num">{escenarios}</TD>
                  <TD className="slt">
                    {monthsAgoLabel(cliente.ultimaRevisionMeses)}
                  </TD>
                </TR>
              ))}
              {rows.length === 0 && (
                <TR>
                  <TD colSpan={5}>
                    <div className="empty">
                      Ningún cliente coincide con la búsqueda.
                    </div>
                  </TD>
                </TR>
              )}
            </TBody>
          </Table>
        </div>

        {/* Pie a ancho de sheet · captura mockup */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            background: "var(--paper-2)",
            borderTop: "1px solid var(--line-2)",
            padding: "11px 34px",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          <div>
            {footerCount} {footerCount === 1 ? "cliente" : "clientes"}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
            }}
          >
            <span className="num">{formatEUR(footerPatrimonio)}</span>
            <span className="tiny" style={{ fontWeight: 500 }}>
              patrimonio neto seguido
            </span>
          </div>
        </div>
      </Sheet>

      <AltaClienteModal
        open={altaOpen}
        onClose={() => setAltaOpen(false)}
        onCreated={({ nombre, segmento, ccaa, personas }) => {
          const bag = createExpedienteFromAlta({
            nombre,
            segmento: segmento as Segmento,
            ccaa,
            personas,
          });
          setSessionTick((t) => t + 1);
          router.push(`/clientes/${bag.cliente.id}/patrimonio`);
        }}
      />
    </PaperShell>
  );
}
