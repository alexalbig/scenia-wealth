"use client";

import { Button } from "@/components/ui";
import { formatFechaES } from "@/lib/patrimonio";
import type { HistorialInforme } from "@/lib/types";

function mockDownload(titulo: string) {
  window.alert(
    `Mockup: «${titulo}» — la descarga de PDF no está disponible en este prototipo.`,
  );
}

export function HistorialView({ entries }: { entries: HistorialInforme[] }) {
  return (
    <div>
      <p className="label-upper mb-1">Historial</p>
      <h2 className="mb-3.5 text-[17px] font-bold tracking-[-0.02em] text-ink">
        Informes emitidos
      </h2>

      {entries.length === 0 ? (
        <p className="px-3 py-8 text-center text-[12px] text-mute">
          Aún no hay informes. Genera el primero desde Patrimonio o desde el
          comparador.
        </p>
      ) : (
        <div className="relative pl-[22px] before:absolute before:bottom-1.5 before:left-[7px] before:top-1.5 before:w-px before:bg-line-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="relative py-2.5 pb-3.5 before:absolute before:-left-[19px] before:top-[15px] before:h-[9px] before:w-[9px] before:rounded-[3px] before:border-2 before:border-ink-3 before:bg-paper"
            >
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div>
                  <p className="text-[12.5px] font-bold text-ink">
                    {entry.titulo}
                  </p>
                  <p className="mt-0.5 text-[10.5px] text-mute">
                    {formatFechaES(entry.fecha)} · con Nota del asesor
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => mockDownload(entry.titulo)}
                >
                  Descargar PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-2.5 text-[11px] text-mute">
        Cada informe queda registrado con su fecha — el argumento de renovación
        del fee.
      </p>
    </div>
  );
}
