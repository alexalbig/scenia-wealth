import { Badge } from "@/components/ui";
import { contextoCliente } from "@/lib/patrimonio";
import type { Cliente, Persona } from "@/lib/types";

/** CT4 · Tira de contexto del cliente (todas las pantallas de cliente). */
export function ClientContextStrip({
  cliente,
  personas,
}: {
  cliente: Cliente;
  personas: Persona[];
}) {
  const ctx = contextoCliente(cliente, personas);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line bg-paper-2 px-5 py-2 text-[12px]">
      <span className="font-bold text-ink">{ctx.nombre}</span>
      <span className="text-line-2">·</span>
      <span className="text-slate">{ctx.edadLabel}</span>
      <span className="text-line-2">·</span>
      <span className="text-slate">{ctx.ccaa}</span>
      <span className="text-line-2">·</span>
      <Badge variant="segment">{ctx.segmento}</Badge>
      <span className="text-line-2">·</span>
      <span className="font-semibold tabular-nums text-ink">
        {ctx.patrimonioLabel}
      </span>
    </div>
  );
}
