"use client";

import {
  Button,
  Card,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui";
import { formatFechaES } from "@/lib/patrimonio";
import type { HistorialInforme } from "@/lib/types";

function mockDownload(titulo: string) {
  window.alert(
    `Mockup: «${titulo}» — la descarga de PDF no está disponible en este prototipo.`,
  );
}

export function HistorialView({ entries }: { entries: HistorialInforme[] }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="label-upper">P7 · Historial</p>
        <h2 className="text-[17px] font-bold tracking-[-0.02em] text-ink">
          Informes emitidos
        </h2>
        <p className="mt-1 text-[12px] text-mute">
          Timeline de documentos generados para este expediente.
        </p>
      </div>

      <Card padding="sm">
        {entries.length === 0 ? (
          <p className="px-3 py-8 text-center text-[12px] text-mute">
            Aún no hay informes emitidos para este cliente.
          </p>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Fecha</TH>
                <TH>Título</TH>
                <TH className="text-right">PDF</TH>
              </TR>
            </THead>
            <TBody>
              {entries.map((entry) => (
                <TR key={entry.id}>
                  <TD className="tabular-nums text-slate whitespace-nowrap">
                    {formatFechaES(entry.fecha)}
                  </TD>
                  <TD className="font-semibold text-ink">{entry.titulo}</TD>
                  <TD className="text-right">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => mockDownload(entry.titulo)}
                    >
                      Descargar
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
