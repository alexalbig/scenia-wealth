"use client";

import Link from "next/link";
import { Avatar, initialsFromName, Pill } from "@/components/ui";
import { formatEUR } from "@/lib/format";
import { formatFechaDMY } from "@/lib/patrimonio";
import type { Cliente } from "@/lib/types";

/** Mockup `.ctx` — franja de contexto del cliente. */
export function ClientContextStrip({ cliente }: { cliente: Cliente }) {
  return (
    <div className="ctx">
      <Link href="/" className="backlink" style={{ margin: 0 }}>
        ‹ Cartera
      </Link>
      <Avatar
        initials={initialsFromName(cliente.nombre)}
        style={{ width: 34, height: 34, fontSize: 12.5 }}
      />
      <div className="grow" style={{ flex: 1 }}>
        <div className="h3">{cliente.nombre}</div>
        <div className="ctx-meta">
          <Pill tone={cliente.segmento === "Empresario" ? "emp" : "default"}>
            {cliente.segmento}
          </Pill>
          <span className="tiny">{cliente.ccaa}</span>
          <span className="tiny">·</span>
          <span className="tiny num strong" style={{ color: "var(--ink-3)" }}>
            {formatEUR(cliente.patrimonioNeto)} netos
          </span>
        </div>
      </div>
      <span className="sello">
        Datos a fecha de <b>{formatFechaDMY(cliente.datosAFecha)}</b>
      </span>
    </div>
  );
}
