import { notFound } from "next/navigation";
import { ClientNav, PaperShell } from "@/components/shell/AppShell";
import { ClientContextStrip } from "@/components/shell/ClientContextStrip";
import { getCliente, getPersonasDeCliente } from "@/lib/seed";

export default async function ClienteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clienteId: string }>;
}) {
  const { clienteId } = await params;
  const cliente = getCliente(clienteId);
  if (!cliente) notFound();
  const personas = getPersonasDeCliente(clienteId);

  return (
    <PaperShell>
      <ClientNav clienteId={cliente.id} clienteNombre={cliente.nombre} />
      <ClientContextStrip cliente={cliente} personas={personas} />
      <main className="px-5 py-5">{children}</main>
    </PaperShell>
  );
}
