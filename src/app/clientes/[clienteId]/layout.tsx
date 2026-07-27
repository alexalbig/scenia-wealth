import { notFound } from "next/navigation";
import { ClientNav, PaperShell, Sheet } from "@/components/shell/AppShell";
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
      <Sheet>
        <ClientNav clienteId={cliente.id} clienteNombre={cliente.nombre} />
        <ClientContextStrip cliente={cliente} personas={personas} />
        <div className="px-[22px] py-5">{children}</div>
      </Sheet>
    </PaperShell>
  );
}
