import {
  AppTopBar,
  PaperShell,
} from "@/components/shell/AppShell";
import { ClienteExpedienteShell } from "@/components/expediente/ClienteExpedienteShell";

export default async function ClienteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clienteId: string }>;
}) {
  const { clienteId } = await params;

  return (
    <PaperShell>
      <AppTopBar />
      <ClienteExpedienteShell clienteId={clienteId}>
        {children}
      </ClienteExpedienteShell>
    </PaperShell>
  );
}
