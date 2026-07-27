import type { ComposicionPatrimonio } from "@/lib/types";
import { cn } from "@/lib/cn";

const SEGMENTS: Array<{
  key: keyof ComposicionPatrimonio;
  label: string;
  className: string;
}> = [
  { key: "financiero", label: "Financiero", className: "bg-blue" },
  { key: "inmobiliario", label: "Inmobiliario", className: "bg-ink-3" },
  { key: "empresarial", label: "Empresarial", className: "bg-coral" },
  { key: "otros", label: "Otros", className: "bg-faintest" },
];

export function CompositionBar({
  composicion,
  className,
}: {
  composicion: ComposicionPatrimonio;
  className?: string;
}) {
  const parts = SEGMENTS.map((s) => ({
    ...s,
    value: composicion[s.key] ?? 0,
  })).filter((p) => p.value > 0.001);

  return (
    <div
      className={cn(
        "mt-1.5 flex h-[5px] w-[120px] overflow-hidden rounded-[3px] bg-line",
        className,
      )}
      title={parts
        .map((p) => `${p.label} ${Math.round(p.value * 100)}%`)
        .join(" · ")}
      aria-label={parts
        .map((p) => `${p.label} ${Math.round(p.value * 100)}%`)
        .join(", ")}
    >
      {parts.map((p) => (
        <span
          key={p.key}
          className={cn("block h-full", p.className)}
          style={{ width: `${p.value * 100}%` }}
        />
      ))}
    </div>
  );
}
