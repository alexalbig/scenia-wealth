import { notFound } from "next/navigation";
import { ClientNav, PaperShell } from "@/components/shell/AppShell";
import { getCliente } from "@/lib/seed";

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

  return (
    <PaperShell>
      <ClientNav clienteId={cliente.id} clienteNombre={cliente.nombre} />
      <main className="px-5 py-5">{children}</main>
    </PaperShell>
  );
}
