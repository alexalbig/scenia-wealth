import { Badge } from "@/components/ui";
import { contextoCliente } from "@/lib/patrimonio";
import type { Cliente, Persona } from "@/lib/types";
import { formatFechaES } from "@/lib/patrimonio";

export function ClientContextStrip({
  cliente,
  personas,
}: {
  cliente: Cliente;
  personas: Persona[];
}) {
  const ctx = contextoCliente(cliente, personas);
  const initials = cliente.nombre
    .replace(/^Familia\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-wrap items-center gap-3.5 border-b border-line px-[22px] py-3.5">
      <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-blue-soft text-[12.5px] font-bold text-blue">
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[14.5px] font-bold text-ink">{ctx.nombre}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          <span className="text-[12px] text-slate">{ctx.edadLabel}</span>
          <span className="text-faintest">·</span>
          <span className="text-[12px] text-slate">{ctx.ccaa}</span>
          <Badge variant="segment">{ctx.segmento}</Badge>
          <span className="font-semibold tabular-nums text-ink">
            {ctx.patrimonioLabel}
          </span>
        </div>
      </div>
      <span className="sello">
        Datos a fecha de <b>{formatFechaES(cliente.datosAFecha)}</b>
      </span>
    </div>
  );
}
