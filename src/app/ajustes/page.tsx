"use client";

import { useState } from "react";
import { AppTopBar, PaperShell, Sheet } from "@/components/shell/AppShell";
import {
  Badge,
  Button,
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
  "mt-1 w-full rounded-[8px] border border-line-2 bg-white px-2.5 py-2 text-[12.5px] text-ink outline-none focus:border-ink";

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

      <Sheet>
        <div className="flex flex-wrap items-end justify-between gap-4 px-[22px] pb-3.5 pt-5">
          <div className="min-w-[220px] flex-1">
            <p className="label-upper">Configuración</p>
            <h1 className="text-[28px] font-bold tracking-[-0.02em] text-ink">
              Ajustes
            </h1>
          </div>
        </div>

        <div className="grid gap-3.5 px-[22px] pb-5">
          <div className="rounded-[10px] border border-line-2 bg-white px-[18px] py-4">
            <p className="text-[13px] font-bold text-ink">Marca del despacho</p>
            <p className="mb-3 mt-1 text-[12px] text-ink-3">
              Identidad que aparece en los informes PDF generados.
            </p>

            <div className="grid gap-2.5 sm:grid-cols-2">
              <label className="block">
                <span className="label-upper">Nombre del despacho</span>
                <input
                  className={fieldClass}
                  value={nombreDespacho}
                  onChange={(e) => setNombreDespacho(e.target.value)}
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
              <label className="block sm:col-span-2">
                <span className="label-upper">Dirección</span>
                <input
                  className={fieldClass}
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                />
              </label>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px]",
                  "border border-dashed border-faintest bg-paper-2",
                  "text-[12px] font-bold text-mute",
                )}
                aria-label="Marcador de posición del logo"
              >
                {nombreDespacho.trim().charAt(0).toUpperCase() || "D"}
              </div>
              <Button size="sm" variant="secondary" type="button">
                Subir logo
              </Button>
            </div>
          </div>

          <div className="rounded-[10px] border border-line-2 bg-white px-[18px] py-4">
            <p className="text-[13px] font-bold text-ink">Usuarios y asientos</p>
            <p className="mb-2.5 mt-1 text-[12px] text-ink-3">
              Modelo por asiento · {SEATS_SEED.length} de 3 asientos en uso.
            </p>
            <Table>
              <THead>
                <TR>
                  <TH>Usuario</TH>
                  <TH>Rol</TH>
                  <TH>Estado</TH>
                </TR>
              </THead>
              <TBody>
                {SEATS_SEED.map((seat) => (
                  <TR key={seat.id}>
                    <TD>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-soft text-[11px] font-bold text-blue">
                          {seat.nombre
                            .split(" ")
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join("")}
                        </span>
                        <div>
                          <p className="font-semibold">{seat.nombre}</p>
                          <p className="text-[11px] text-mute">{seat.email}</p>
                        </div>
                      </div>
                    </TD>
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
            <Button size="sm" variant="secondary" className="mt-2.5" type="button">
              + Invitar usuario
            </Button>
          </div>
        </div>
      </Sheet>
    </PaperShell>
  );
}
