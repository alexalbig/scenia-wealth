"use client";

import { useState } from "react";
import { AppTopBar, PaperShell } from "@/components/shell/AppShell";
import {
  Badge,
  Card,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui";
import { seed } from "@/lib/seed";
import { cn } from "@/lib/cn";

const fieldClass =
  "mt-1 w-full rounded-[8px] border border-line-2 bg-paper px-3 py-2 text-[13px] text-ink outline-none focus:border-blue";

interface SeatRow {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  estado: "activo" | "invitado";
}

const SEATS_SEED: SeatRow[] = [
  {
    id: "seat-1",
    nombre: "Ana Ruiz",
    email: "ana.ruiz@despacho-eaf.es",
    rol: "Administrador",
    estado: "activo",
  },
  {
    id: "seat-2",
    nombre: "Luis Ferrer",
    email: "luis.ferrer@despacho-eaf.es",
    rol: "Asesor",
    estado: "activo",
  },
];

/**
 * P8 · Ajustes — fuera del cliente.
 * Marca del despacho + asientos. Sin consulta de parámetros fiscales (V2).
 */
export default function AjustesPage() {
  const [nombreDespacho, setNombreDespacho] = useState(seed.cuenta.nombre);
  const [direccion, setDireccion] = useState(
    "C/ Colón 28, 46004 Valencia",
  );
  const [nif, setNif] = useState("B12345678");

  return (
    <PaperShell>
      <AppTopBar title="Ajustes" />

      <main className="space-y-5 px-5 py-5">
        <div>
          <p className="label-upper">P8 · Cuenta</p>
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-ink">
            Ajustes
          </h2>
          <p className="mt-1 text-[12px] text-mute">
            Marca del despacho y asientos. Los cambios viven solo en esta
            sesión (mockup).
          </p>
        </div>

        <Card>
          <p className="label-upper mb-3">Marca del despacho</p>
          <p className="mb-4 text-[12px] text-mute">
            Datos que aparecen en los informes PDF.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div
              className={cn(
                "flex h-24 w-24 shrink-0 items-center justify-center rounded-[8px]",
                "border border-dashed border-line-2 bg-paper-2",
              )}
              aria-label="Marcador de posición del logo"
            >
              <span className="text-center text-[10px] font-semibold uppercase tracking-[0.06em] text-faint">
                Logo
              </span>
            </div>

            <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="label-upper">Nombre del despacho</span>
                <input
                  className={fieldClass}
                  value={nombreDespacho}
                  onChange={(e) => setNombreDespacho(e.target.value)}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="label-upper">Dirección</span>
                <input
                  className={fieldClass}
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="label-upper">NIF</span>
                <input
                  className={fieldClass}
                  value={nif}
                  onChange={(e) => setNif(e.target.value)}
                />
              </label>
            </div>
          </div>
        </Card>

        <Card padding="sm">
          <div className="mb-3 px-3 pt-2">
            <p className="label-upper">Usuarios / asientos</p>
            <p className="mt-1 text-[12px] text-mute">
              Modelo por asiento · {SEATS_SEED.length} de 5 ocupados
            </p>
          </div>
          <Table>
            <THead>
              <TR>
                <TH>Nombre</TH>
                <TH>Correo</TH>
                <TH>Rol</TH>
                <TH>Estado</TH>
              </TR>
            </THead>
            <TBody>
              {SEATS_SEED.map((seat) => (
                <TR key={seat.id}>
                  <TD className="font-semibold">{seat.nombre}</TD>
                  <TD className="text-slate">{seat.email}</TD>
                  <TD className="text-ink-3">{seat.rol}</TD>
                  <TD>
                    <Badge variant="segment">
                      {seat.estado === "activo" ? "Activo" : "Invitado"}
                    </Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>
      </main>
    </PaperShell>
  );
}
