import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui";
import { getCliente } from "@/lib/seed";

const LABELS: Record<string, string> = {
  persona: "F1 · Persona",
  portfolio: "F2 · Portfolio",
  inmueble: "F3 · Inmueble",
  sociedad: "F4 · Sociedad",
  otro: "F5 · Otros activos",
};

export default async function FichaPlaceholderPage({
  params,
}: {
  params: Promise<{ clienteId: string; tipo: string; id: string }>;
}) {
  const { clienteId, tipo, id } = await params;
  const cliente = getCliente(clienteId);
  if (!cliente) notFound();

  const label = LABELS[tipo] ?? "Ficha";

  return (
    <Card>
      <p className="label-upper mb-1">{label}</p>
      <h2 className="text-[17px] font-bold tracking-[-0.02em] text-ink">
        Ficha · {id}
      </h2>
      <p className="mt-2 text-[13px] text-slate">
        Drill-down desde Patrimonio. El detalle de la ficha se construye en una
        fase posterior; la navegación ya queda preparada.
      </p>
      {tipo === "sociedad" && (
        <p className="mt-3 rounded-[8px] border border-dashed border-line-2 bg-paper-2 px-3 py-2 text-[12px] text-mute">
          Liquidador de Impuesto de Sociedades · pendiente de definir. No se
          inventan cifras.
        </p>
      )}
      <p className="mt-4">
        <Link
          href={`/clientes/${clienteId}/patrimonio?tab=activos`}
          className="text-[12px] font-semibold text-blue hover:underline"
        >
          ← Volver a Activos
        </Link>
      </p>
    </Card>
  );
}
