"use client";

import { Sheet } from "@/components/shell/AppShell";
import { ClientContextStrip } from "@/components/shell/ClientContextStrip";
import { ClientNav } from "@/components/shell/AppShell";
import { ExpedienteProvider, useExpediente } from "@/components/expediente/ExpedienteProvider";

function ShellInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const { bag } = useExpediente();
  return (
    <Sheet>
      <ClientContextStrip cliente={bag.cliente} />
      <ClientNav clienteId={bag.cliente.id} />
      {children}
    </Sheet>
  );
}

/**
 * Gate de cliente: carga expediente (seed clone o sesión) y provee contexto.
 */
export function ClienteExpedienteShell({
  clienteId,
  children,
}: {
  clienteId: string;
  children: React.ReactNode;
}) {
  return (
    <ExpedienteProvider clienteId={clienteId}>
      <ShellInner>{children}</ShellInner>
    </ExpedienteProvider>
  );
}
